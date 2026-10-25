import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { logAdminAction } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden. Hanya Administrator yang memiliki hak akses." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase().trim();
    const status = searchParams.get("status");

    let studentsList: any[] = [];
    let totalQuestionsCount = 84;
    let totalRegisteredStudents = 0;
    let totalActiveSessions = 0;
    let totalCompletedSessions = 0;

    try {
      const users = await prisma.user.findMany({
        where: { role: "STUDENT" },
        include: {
          profile: true,
          sessions: {
            orderBy: { started_at: "desc" },
            select: {
              id: true,
              status: true,
              started_at: true,
              completed_at: true,
              result_data: true,
              _count: {
                select: { answers: true },
              },
            },
          },
        },
        orderBy: { created_at: "desc" },
      });

      totalQuestionsCount = await prisma.question.count();
      totalRegisteredStudents = users.length;

      studentsList = users.map((u) => {
        const latestSession = u.sessions[0] || null;
        const isCompleted = latestSession?.status === "COMPLETED";
        const isInProgress = latestSession?.status === "IN_PROGRESS";

        if (isInProgress) totalActiveSessions++;
        if (isCompleted) totalCompletedSessions++;

        let topSignature = "Belum Melakukan Asesmen";
        let topMajor = "-";
        let fitScore = 0;

        if (latestSession?.result_data) {
          const scores = latestSession.result_data as any;
          topSignature = scores.potentialSignatures?.[0]?.title || "-";
          topMajor = scores.studyRecommendations?.[0]?.majorName || "-";
          fitScore = scores.studyRecommendations?.[0]?.fitScore || 0;
        }

        return {
          id: u.id,
          name: u.profile?.full_name || u.email.split("@")[0],
          email: u.email,
          phoneNumber: u.profile?.phone_number || "-",
          school: u.profile?.school_name || "-",
          grade: u.profile?.grade || "-",
          isActive: u.is_active,
          session: latestSession
            ? {
                id: latestSession.id,
                status: latestSession.status,
                startedAt: latestSession.started_at,
                completedAt: latestSession.completed_at,
                answeredCount: latestSession._count?.answers || 0,
                topSignature,
                topMajor,
                fitScore,
              }
            : null,
          createdAt: u.created_at,
        };
      });
    } catch (dbErr: any) {
      console.error("❌ [Admin Students] DB fetch error:", dbErr);
      return NextResponse.json(
        { error: "Gagal memuat rekapitulasi data siswa dari database." },
        { status: 500 }
      );
    }

    // Apply filtering
    let filteredStudents = [...studentsList];
    if (search) {
      filteredStudents = filteredStudents.filter(
        (s) =>
          s.name.toLowerCase().includes(search) ||
          s.email.toLowerCase().includes(search) ||
          s.school.toLowerCase().includes(search) ||
          (s.session?.topSignature && s.session.topSignature.toLowerCase().includes(search))
      );
    }
    if (status && status !== "ALL") {
      filteredStudents = filteredStudents.filter((s) => s.session?.status === status);
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalStudents: totalRegisteredStudents,
        activeSessions: totalActiveSessions,
        completedSessions: totalCompletedSessions,
        totalQuestions: totalQuestionsCount,
      },
      students: filteredStudents,
    });
  } catch (error) {
    console.error("Error in /api/admin/students:", error);
    return NextResponse.json(
      { error: "Gagal memuat rekapitulasi data siswa." },
      { status: 500 }
    );
  }
}

// --------------------------------------------------------------------------
// PATCH: Participant CRUD actions (Reset Sesi & Cabut Akses / Soft Delete)
// --------------------------------------------------------------------------
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden. Hanya Administrator yang memiliki hak akses." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { action, studentId } = body;

    if (!studentId || !action) {
      return NextResponse.json(
        { error: "Parameter studentId dan action wajib diisi." },
        { status: 400 }
      );
    }

    const studentUser = await prisma.user.findUnique({
      where: { id: studentId },
      include: {
        profile: true,
        sessions: {
          orderBy: { started_at: "desc" },
        },
      },
    });

    if (!studentUser) {
      return NextResponse.json(
        { error: "Data siswa tidak ditemukan." },
        { status: 404 }
      );
    }

    // 1. Action: RESET_SESSION
    // Resets student's assessment session back to IN_PROGRESS and clears all answers
    if (action === "RESET_SESSION") {
      const latestSession = studentUser.sessions[0];

      if (latestSession) {
        await prisma.$transaction([
          prisma.assessmentAnswer.deleteMany({
            where: { session_id: latestSession.id },
          }),
          prisma.assessmentSession.update({
            where: { id: latestSession.id },
            data: {
              status: "IN_PROGRESS",
              completed_at: null,
              result_data: Prisma.DbNull,
            },
          }),
        ]);
      } else {
        await prisma.assessmentSession.create({
          data: {
            user_id: studentUser.id,
            status: "IN_PROGRESS",
          },
        });
      }

      const studentName = studentUser.profile?.full_name || studentUser.email;

      await logAdminAction(session.user.id, "RESET_SESSION", studentId, {
        studentEmail: studentUser.email,
        studentName,
      });

      return NextResponse.json({
        success: true,
        message: `Sesi asesmen untuk ${studentName} berhasil di-reset. Siswa dapat mengerjakan ulang 84 butir soal dari awal.`,
      });
    }

    // 2. Action: TOGGLE_ACTIVE (Soft delete / Ban / Restore)
    // Toggles User.is_active. When false, NextAuth authorize callback blocks login attempts (constant-time check),
    // and periodic JWT revalidation forces active sessions to revoke and logout within 5 minutes (Phase 2.5).
    if (action === "TOGGLE_ACTIVE" || action === "REVOKE_ACCESS" || action === "RESTORE_ACCESS") {
      const targetActive =
        action === "REVOKE_ACCESS"
          ? false
          : action === "RESTORE_ACCESS"
          ? true
          : !studentUser.is_active;

      const updated = await prisma.user.update({
        where: { id: studentId },
        data: { is_active: targetActive },
      });

      const studentName = studentUser.profile?.full_name || studentUser.email;
      const statusLabel = targetActive ? "diaktifkan kembali" : "dicabut (nonaktif)";

      await logAdminAction(session.user.id, action, studentId, {
        studentEmail: studentUser.email,
        studentName,
        isActive: targetActive,
      });

      return NextResponse.json({
        success: true,
        isActive: updated.is_active,
        message: `Hak akses akun untuk ${studentName} berhasil ${statusLabel}.`,
      });
    }

    return NextResponse.json(
      { error: "Aksi tidak dikenali." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Error updating student status:", error);
    return NextResponse.json(
      { error: error.message || "Gagal memperbarui status siswa." },
      { status: 500 }
    );
  }
}
