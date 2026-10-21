import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { all84QuestionsData, defaultLikertOptions, shuffleArrayWithSeed } from "@/lib/questions-data";
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
    // Only users who have paid (or admin/demo) are permitted to take the assessment
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
          message: "Akses asesmen terkunci. Silakan selesaikan pembayaran resmi via Midtrans untuk membuka 84 butir soal.",
        },
        { status: 402 }
      );
    }

    // 1. Find or create an active assessment session
    let assessmentSession = null;
    let dbConnected = true;

    try {
      // Find the student's latest session
      const latestSession = await prisma.assessmentSession.findFirst({
        where: {
          user_id: userId,
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
          message: "Asesmen Anda telah selesai dan terkunci resmi. Menampilkan laporan hasil evaluasi...",
        });
      }

      if (latestSession && latestSession.status === "IN_PROGRESS") {
        assessmentSession = latestSession;
      } else {
        assessmentSession = await prisma.assessmentSession.create({
          data: {
            user_id: userId,
            status: "IN_PROGRESS",
          },
          include: {
            answers: true,
          },
        });
      }
    } catch (dbErr) {
      console.warn("DB connection fallback for assessment/start:", dbErr);
      dbConnected = false;
      // In-memory fallback representation for local development without DB
      assessmentSession = {
        id: `mock-session-${userId}`,
        user_id: userId,
        status: "IN_PROGRESS" as const,
        started_at: new Date(),
        completed_at: null,
        answers: [],
      };
    }

    // 2. Fetch questions from DB if connected, or use centralized fallback
    let rawQuestions: Array<{
      id: string;
      code: string;
      question_text: string;
      options: any;
    }> = [];

    if (dbConnected) {
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
        console.warn("Could not query questions table, using built-in questions data.");
      }
    }

    if (rawQuestions.length === 0) {
      // Use standard 84 questions data
      rawQuestions = all84QuestionsData.map((q) => ({
        id: `q-${q.code}`,
        code: q.code,
        question_text: q.text,
        options: defaultLikertOptions,
      }));
    }

    // 3. Deterministic shuffle using assessment session ID as seed
    // This ensures questions are shuffled randomly, but stay fixed for this student session across reloads
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
        error: "Gagal menginisialisasi sesi asesmen.",
        details: error?.message || String(error),
        stack: error?.stack,
      },
      { status: 500 }
    );
  }
}
