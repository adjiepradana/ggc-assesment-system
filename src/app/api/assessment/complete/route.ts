import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateAssessmentScores } from "@/lib/scoring";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const authSession = await getServerSession(authOptions);

    if (!authSession?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Silakan masuk terlebih dahulu." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { session_id } = body;

    if (!session_id) {
      return NextResponse.json(
        { error: "Parameter session_id wajib disertakan." },
        { status: 400 }
      );
    }

    try {
      const userSession = await prisma.assessmentSession.findUnique({
        where: { id: session_id },
        include: {
          user: {
            include: {
              profile: true,
            },
          },
          answers: {
            include: {
              question: true,
            },
          },
        },
      });

      if (!userSession) {
        return NextResponse.json(
          { error: "Sesi asesmen tidak ditemukan." },
          { status: 404 }
        );
      }

      if (userSession.user_id !== authSession.user.id) {
        return NextResponse.json(
          { error: "Forbidden. Sesi ini bukan milik Anda." },
          { status: 403 }
        );
      }

      if (userSession.status === "COMPLETED") {
        return NextResponse.json(
          {
            error: "ALREADY_COMPLETED",
            message: "Sesi ini sudah dikunci sebelumnya.",
          },
          { status: 400 }
        );
      }

      // Check if all questions are answered (e.g. 84 items)
      const totalQuestionsCount = await prisma.question.count({
        where: { is_active: true },
      });

      const answeredCount = userSession.answers.length;

      if (totalQuestionsCount > 0 && answeredCount < totalQuestionsCount) {
        return NextResponse.json(
          {
            error: `Mohon lengkapi semua soal. Masih ada ${totalQuestionsCount - answeredCount} butir yang belum dijawab.`,
            answeredCount,
            totalQuestionsCount,
          },
          { status: 400 }
        );
      }

      // Pre-compute assessment results (Phase 4.6)
      const answersRecord: Record<string, number> = {};
      for (const ans of userSession.answers) {
        const code = ans.question?.code || ans.question_id;
        answersRecord[code] = ans.selected_value;
      }

      const studentProfile = userSession.user?.profile;
      const calculatedResults = calculateAssessmentScores(
        session_id,
        answersRecord,
        {
          fullName: studentProfile?.full_name || authSession.user.name || "Siswa GGC",
          schoolName: studentProfile?.school_name || "SMA / SMK Sederajat",
          grade: studentProfile?.grade || "Kelas 12",
        }
      );

      // ATOMIC LOCK (Phase 2.3 & 4.6): Check, set status to COMPLETED, and persist pre-computed results
      // If multiple requests hit concurrently, only the first one will update a row.
      const updateResult = await prisma.assessmentSession.updateMany({
        where: { id: session_id, status: "IN_PROGRESS" },
        data: {
          status: "COMPLETED",
          completed_at: new Date(),
          result_data: calculatedResults as any,
        },
      });

      if (updateResult.count === 0) {
        return NextResponse.json(
          {
            error: "ALREADY_COMPLETED",
            message: "Sesi ini sudah dikunci sebelumnya.",
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Selamat! Asesmen Study Fit Anda berhasil diselesaikan dan disimpan.",
        session_id,
      });
    } catch (dbErr: any) {
      console.error("❌ [Assessment Complete] DB write error:", dbErr);
      return NextResponse.json(
        {
          error: "SERVICE_UNAVAILABLE",
          message: "Gagal memfinalisasi asesmen ke basis data. Silakan coba lagi.",
        },
        { status: 503 }
      );
    }
  } catch (error: any) {
    console.error("❌ [Assessment Complete] Internal error:", error);
    return NextResponse.json(
      {
        error: "INTERNAL_SERVER_ERROR",
        message: "Terjadi kesalahan internal saat memfinalisasi asesmen.",
      },
      { status: 500 }
    );
  }
}
