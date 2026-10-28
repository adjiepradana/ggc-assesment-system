import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateAssessmentScores } from "@/lib/scoring";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const authSession = await getServerSession(authOptions);

    if (!authSession?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Silakan masuk terlebih dahulu." },
        { status: 401 }
      );
    }

    const { sessionId } = params;

    let userSession: any = null;
    let studentProfile: any = null;
    let answersRecord: Record<string, number> = {};

    const isValidUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        sessionId
      );

    try {
      // 1. If valid UUID, find by ID
      if (isValidUuid) {
        userSession = await prisma.assessmentSession.findUnique({
          where: { id: sessionId },
          include: {
            user: {
              include: {
                profile: true,
              },
            },
            answers: {
              include: {
                question: true,
                question_set_item: true,
              },
            },
          },
        });
      }

      // 2. If not found or if sessionId was "preview" / "active-session", find student's latest session
      if (!userSession && authSession.user.id) {
        userSession = await prisma.assessmentSession.findFirst({
          where: {
            user_id: authSession.user.id,
          },
          orderBy: { started_at: "desc" },
          include: {
            user: {
              include: {
                profile: true,
              },
            },
            answers: {
              include: {
                question: true,
                question_set_item: true,
              },
            },
          },
        });
      }

      if (userSession) {
        // RBAC check: Student can only view their own session, Admin can view any
        if (
          authSession.user.role !== "ADMIN" &&
          userSession.user_id !== authSession.user.id
        ) {
          return NextResponse.json(
            { error: "Forbidden. Anda tidak memiliki akses ke laporan ini." },
            { status: 403 }
          );
        }

        studentProfile = userSession.user?.profile;

        // Build answers record { [code]: selected_value }
        if (userSession.answers && userSession.answers.length > 0) {
          for (const ans of userSession.answers) {
            const weight = ans.question_set_item?.scoring_weight ?? 1;
            if (weight <= 0) continue;
            const code =
              ans.question_set_item?.code || ans.question?.code || ans.question_id;
            answersRecord[code] = ans.selected_value;
          }
        }
      }

      // 3. Fallback query profile directly if not attached to session
      if (!studentProfile && authSession.user.id) {
        studentProfile = await prisma.studentProfile.findUnique({
          where: { user_id: authSession.user.id },
        });
      }
    } catch (dbErr) {
      console.error("DB error in results route:", dbErr);
      return NextResponse.json(
        {
          error: "SERVICE_UNAVAILABLE",
          message: "Gagal mengambil data asesmen dari basis data.",
        },
        { status: 503 }
      );
    }

    // Require authentic session from database
    if (!userSession) {
      return NextResponse.json(
        {
          error: "NOT_FOUND",
          message: "Sesi asesmen tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    // SECURITY & INTEGRITY (F-11): Strictly require session to be COMPLETED before exposing or computing results
    if (userSession.status !== "COMPLETED") {
      return NextResponse.json(
        {
          error: "SESSION_NOT_COMPLETED",
          message: "Asesmen belum diselesaikan.",
        },
        { status: 409 }
      );
    }

    // Require authentic answers from database
    if (Object.keys(answersRecord).length === 0) {
      return NextResponse.json(
        {
          error: "INCOMPLETE_DATA",
          message: "Data jawaban untuk sesi ini belum tersedia atau belum selesai dikerjakan.",
        },
        { status: 400 }
      );
    }

    if (!studentProfile) {
      studentProfile = {
        full_name: authSession.user.name || "Siswa Hebat GGC",
        school_name: "SMA / SMK Sederajat",
        grade: "Kelas 12",
        phone_number: "-",
      };
    }

    const studentInfo = {
      name: studentProfile?.full_name || authSession.user.name || "Siswa GGC",
      school: studentProfile?.school_name || "SMA / SMK Sederajat",
      grade: studentProfile?.grade || "Kelas 12",
      email: authSession.user.email,
    };

    // Phase 4.6: Retrieve pre-computed JSON results directly from the database for instant response
    let results = userSession.result_data;

    if (!results) {
      // Fallback: calculate on-the-fly for legacy completed sessions and backfill result_data
      results = calculateAssessmentScores(
        userSession.id || sessionId,
        answersRecord,
        {
          fullName: studentInfo.name,
          schoolName: studentInfo.school,
          grade: studentInfo.grade,
        }
      );

      prisma.assessmentSession
        .update({
          where: { id: userSession.id },
          data: { result_data: results as any },
        })
        .catch((err) => console.warn("Could not backfill session result_data:", err));
    }

    return NextResponse.json({
      success: true,
      session: {
        id: userSession.id,
        status: userSession.status,
        started_at: userSession.started_at,
        completed_at: userSession.completed_at,
      },
      student: studentInfo,
      results,
    });
  } catch (error) {
    console.error("Error in assessment results API:", error);
    return NextResponse.json(
      { error: "Gagal memproses hasil asesmen." },
      { status: 500 }
    );
  }
}
