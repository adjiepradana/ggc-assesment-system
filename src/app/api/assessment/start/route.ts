import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  all84QuestionsData,
  defaultLikertOptions,
  shuffleArrayWithSeed,
} from "@/lib/questions-data";
import { checkUserPaidAccess } from "@/lib/access-check";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Anda harus masuk terlebih dahulu." },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // PAYWALL ACCESS GATEKEEPER:
    // Only users who have paid (or admin) are permitted to take the assessment
    const hasPaidAccess = await checkUserPaidAccess(
      userId,
      session.user.email,
      session.user.role
    );

    if (!hasPaidAccess) {
      return NextResponse.json(
        {
          error: "PAYMENT_REQUIRED",
          payment_required: true,
          message:
            "Akses asesmen terkunci. Silakan selesaikan pembayaran resmi via Midtrans untuk membuka 84 butir soal.",
        },
        { status: 402 }
      );
    }

    // VERIFICATION GATEKEEPER:
    // Only users with verified emails (or admins) are permitted to start/access the assessment.
    const isBypassAccount = session.user.role === "ADMIN";

    const studentUserRecord = await prisma.user.findUnique({
      where: { id: userId },
      select: { email_verified: true },
    });

    if (!studentUserRecord?.email_verified && !isBypassAccount) {
      return NextResponse.json(
        {
          error: "EMAIL_VERIFICATION_REQUIRED",
          email_verification_required: true,
          message:
            "Email Anda belum diverifikasi. Silakan periksa kotak masuk atau spam email Anda dan klik tautan verifikasi.",
        },
        { status: 403 }
      );
    }

    // 1. Find or create an active assessment session bound to the active QuestionSet
    let assessmentSession: any = null;
    let dbConnected = true;

    try {
      // Find the student's latest non-abandoned session
      const latestSession = await prisma.assessmentSession.findFirst({
        where: {
          user_id: userId,
          status: {
            in: ["IN_PROGRESS", "COMPLETED"],
          },
        },
        include: {
          answers: true,
        },
        orderBy: { started_at: "desc" },
      });

      // AUTO-LOCK: If latest session is COMPLETED, do NOT create a new session.
      // Student must be redirected to their results page until an Admin resets the session.
      if (latestSession && latestSession.status === "COMPLETED") {
        return NextResponse.json({
          session: latestSession,
          is_completed: true,
          redirect_url: `/student/results/${latestSession.id}`,
          message:
            "Asesmen Anda telah selesai dan terkunci resmi. Menampilkan laporan hasil evaluasi...",
        });
      }

      if (latestSession && latestSession.status === "IN_PROGRESS") {
        assessmentSession = latestSession;
      } else {
        // Resolve the currently active QuestionSet
        const activeQuestionSet = await prisma.questionSet.findFirst({
          where: { is_active: true },
          orderBy: { version: "desc" },
        });

        const questionSetId = activeQuestionSet?.id || "qset_v1_default";

        try {
          assessmentSession = await prisma.assessmentSession.create({
            data: {
              user_id: userId,
              question_set_id: questionSetId,
              status: "IN_PROGRESS",
            },
            include: {
              answers: true,
            },
          });
        } catch (createErr: any) {
          // Handle concurrent creation race hitting idx_unique_user_in_progress_session (P2002)
          if (createErr?.code === "P2002") {
            const existingInProgress =
              await prisma.assessmentSession.findFirst({
                where: {
                  user_id: userId,
                  status: "IN_PROGRESS",
                },
                include: {
                  answers: true,
                },
                orderBy: { started_at: "desc" },
              });
            if (existingInProgress) {
              assessmentSession = existingInProgress;
            } else {
              throw createErr;
            }
          } else {
            throw createErr;
          }
        }
      }
    } catch (dbErr) {
      console.error("DB error in assessment/start:", dbErr);

      // SAFETY: Never hand out an in-memory mock session in production.
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          {
            error: "SERVICE_UNAVAILABLE",
            message:
              "Server sedang mengalami gangguan koneksi database. Jawaban Anda aman — silakan muat ulang halaman dalam beberapa saat.",
          },
          { status: 503 }
        );
      }

      dbConnected = false;
      assessmentSession = {
        id: `mock-session-${userId}`,
        user_id: userId,
        question_set_id: "qset_v1_default",
        status: "IN_PROGRESS" as const,
        started_at: new Date(),
        completed_at: null,
        answers: [],
      };
    }

    // 2. Fetch versioned QuestionSetItems for this session's question_set_id (with scoring_weight > 0)
    let rawQuestions: Array<{
      id: string;
      code: string;
      question_text: string;
      options: any;
    }> = [];

    if (dbConnected && assessmentSession?.question_set_id) {
      try {
        const setItems = await prisma.questionSetItem.findMany({
          where: {
            question_set_id: assessmentSession.question_set_id,
            scoring_weight: { gt: 0 },
          },
          orderBy: { order_index: "asc" },
        });

        if (setItems.length > 0) {
          rawQuestions = setItems.map((item) => ({
            id: item.legacy_question_id || item.id,
            code: item.code,
            question_text: item.question_text,
            options: item.options,
          }));
        }
      } catch (e) {
        console.warn(
          "Could not query question_set_items table, falling back to questions table."
        );
      }
    }

    if (rawQuestions.length === 0 && dbConnected) {
      try {
        const dbQuestions = await prisma.question.findMany({
          where: { is_active: true },
          select: {
            id: true,
            code: true,
            question_text: true,
            options: true,
          },
        });

        if (dbQuestions.length > 0) {
          rawQuestions = dbQuestions;
        }
      } catch (e) {
        console.warn(
          "Could not query questions table, using built-in questions data."
        );
      }
    }

    if (rawQuestions.length === 0) {
      rawQuestions = all84QuestionsData.map((q) => ({
        id: `q-${q.code}`,
        code: q.code,
        question_text: q.text,
        options: defaultLikertOptions,
      }));
    }

    // 3. Deterministic shuffle using assessment session ID as seed
    const shuffled = shuffleArrayWithSeed(rawQuestions, assessmentSession.id);

    // 4. Uniform representation: strip category names (Verbal, Interest, etc.) to keep evaluation unbiased
    const clientQuestions = shuffled.map((q, idx) => ({
      id: q.id,
      number: idx + 1,
      question_text: q.question_text,
      options: q.options || defaultLikertOptions,
    }));

    // 5. Existing answers mapped by question_id
    const answersMap: Record<string, number> = {};
    if (assessmentSession.answers) {
      for (const ans of assessmentSession.answers) {
        answersMap[ans.question_id] = ans.selected_value;
      }
    }

    return NextResponse.json({
      success: true,
      session: {
        id: assessmentSession.id,
        question_set_id: assessmentSession.question_set_id,
        status: assessmentSession.status,
        started_at: assessmentSession.started_at,
      },
      questions: clientQuestions,
      answers: answersMap,
      total_questions: clientQuestions.length,
      answered_count: Object.keys(answersMap).length,
    });
  } catch (error: any) {
    console.error("Error in /api/assessment/start:", error);
    return NextResponse.json(
      {
        error: "Terjadi kesalahan internal. Silakan coba lagi.",
      },
      { status: 500 }
    );
  }
}
