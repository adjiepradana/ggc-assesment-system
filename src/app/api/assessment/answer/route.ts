import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    const { session_id, question_id, selected_value, client_timestamp } = body;

    // Validation
    if (!session_id || !question_id || selected_value === undefined) {
      return NextResponse.json(
        {
          error:
            "Parameter session_id, question_id, dan selected_value wajib diisi.",
        },
        { status: 400 }
      );
    }

    const val = Number(selected_value);
    if (!Number.isInteger(val) || val < 1 || val > 5) {
      return NextResponse.json(
        {
          error:
            "Nilai jawaban harus berupa bilangan bulat antara 1 sampai 5.",
        },
        { status: 400 }
      );
    }

    // Try DB upsert
    try {
      // 1. Verify session belongs to authenticated student
      const userSession = await prisma.assessmentSession.findUnique({
        where: { id: session_id },
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

      if (userSession.status !== "IN_PROGRESS") {
        return NextResponse.json(
          { error: "Sesi asesmen telah selesai dan tidak dapat diubah lagi." },
          { status: 400 }
        );
      }

      // Guard: Ensure session has a valid question_set_id bound to it
      if (!userSession.question_set_id) {
        return NextResponse.json(
          {
            error: "SESSION_OUTDATED",
            message:
              "Sesi asesmen Anda terdaftar pada format instrumen lama. Silakan hubungi admin untuk mereset sesi.",
          },
          { status: 409 }
        );
      }

      // 2. Resolve the corresponding QuestionSetItem in the session's bound QuestionSet
      let questionSetItem = await prisma.questionSetItem.findFirst({
        where: {
          question_set_id: userSession.question_set_id,
          OR: [
            { legacy_question_id: question_id },
            { id: question_id },
            { code: question_id },
          ],
        },
      });

      if (!questionSetItem) {
        // Fallback: look up Question by id or code, then find matching QuestionSetItem by code in this session's question_set
        const legacyQuestion = await prisma.question.findFirst({
          where: {
            OR: [{ id: question_id }, { code: question_id }],
          },
          select: { id: true, code: true },
        });

        if (legacyQuestion) {
          questionSetItem = await prisma.questionSetItem.findUnique({
            where: {
              question_set_id_code: {
                question_set_id: userSession.question_set_id,
                code: legacyQuestion.code,
              },
            },
          });
        }
      }

      if (!questionSetItem) {
        return NextResponse.json(
          {
            error: "QUESTION_NOT_FOUND",
            message:
              "Butir soal tidak ditemukan dalam paket instrumen sesi asesmen ini.",
          },
          { status: 400 }
        );
      }

      // 3. Resolve and guarantee a valid Question foreign key (questions.id)
      let resolvedLegacyQuestionId: string | null =
        questionSetItem.legacy_question_id || null;

      // If legacy_question_id is missing or null, find the corresponding Question by code
      if (!resolvedLegacyQuestionId) {
        const matchingLegacy = await prisma.question.findUnique({
          where: { code: questionSetItem.code },
          select: { id: true },
        });
        if (matchingLegacy) {
          resolvedLegacyQuestionId = matchingLegacy.id;
        }
      }

      // If still missing, check if the client-supplied question_id is itself a valid Question.id
      if (!resolvedLegacyQuestionId) {
        const candidateQuestion = await prisma.question.findUnique({
          where: { id: question_id },
          select: { id: true },
        });
        if (candidateQuestion) {
          resolvedLegacyQuestionId = candidateQuestion.id;
        }
      }

      // If after all resolution steps, no Question row exists in DB, abort safely
      if (!resolvedLegacyQuestionId) {
        console.error(
          `[Assessment Answer] Integrity error: QuestionSetItem [${questionSetItem.id}] code [${questionSetItem.code}] has no corresponding Question record in database.`
        );
        return NextResponse.json(
          {
            error: "UNMAPPED_QUESTION",
            message:
              "Butir soal tidak memiliki pemetaan referensi yang valid dalam basis data.",
          },
          { status: 422 }
        );
      }

      // Monotonic Timestamp Guard (Phase 2.1): prevent late-arriving stale packets from overwriting newer answers
      if (client_timestamp && typeof client_timestamp === "number") {
        const existingAnswer = await prisma.assessmentAnswer.findUnique({
          where: {
            session_id_question_id: {
              session_id,
              question_id: resolvedLegacyQuestionId,
            },
          },
        });

        if (
          existingAnswer &&
          existingAnswer.answered_at &&
          existingAnswer.answered_at.getTime() > client_timestamp
        ) {
          return NextResponse.json({
            success: true,
            stale: true,
            message:
              "Request diabaikan karena timestamp lebih lama dari data saat ini.",
            answer: {
              id: existingAnswer.id,
              session_id: existingAnswer.session_id,
              question_id: existingAnswer.question_id,
              question_set_item_id: existingAnswer.question_set_item_id,
              selected_value: existingAnswer.selected_value,
              answered_at: existingAnswer.answered_at,
            },
          });
        }
      }

      const answerDate =
        client_timestamp && typeof client_timestamp === "number"
          ? new Date(client_timestamp)
          : new Date();

      // 4. Upsert answer with verified question_id and question_set_item_id
      const answer = await prisma.assessmentAnswer.upsert({
        where: {
          session_id_question_id: {
            session_id,
            question_id: resolvedLegacyQuestionId,
          },
        },
        update: {
          question_set_item_id: questionSetItem.id,
          selected_value: val,
          answered_at: answerDate,
        },
        create: {
          session_id,
          question_id: resolvedLegacyQuestionId,
          question_set_item_id: questionSetItem.id,
          selected_value: val,
          answered_at: answerDate,
        },
      });

      return NextResponse.json({
        success: true,
        answer: {
          id: answer.id,
          session_id: answer.session_id,
          question_id: answer.question_id,
          question_set_item_id: answer.question_set_item_id,
          selected_value: answer.selected_value,
          answered_at: answer.answered_at,
        },
      });
    } catch (dbErr: any) {
      console.error("❌ [Assessment Answer] DB write error:", dbErr);

      // Foreign Key Constraint Violation (P2003) -> 422 Unprocessable Entity
      if (dbErr?.code === "P2003") {
        return NextResponse.json(
          {
            error: "FOREIGN_KEY_VIOLATION",
            message:
              "Integritas data soal tidak valid. Silakan muat ulang halaman atau hubungi admin.",
            detail: dbErr?.meta?.field_name,
          },
          { status: 422 }
        );
      }

      // Trigger Exception (trg_enforce_answer_questionset_match) -> 409 Conflict
      if (
        typeof dbErr?.message === "string" &&
        dbErr.message.includes("Foreign key integrity violation: QuestionSetItem")
      ) {
        return NextResponse.json(
          {
            error: "QUESTION_SET_MISMATCH",
            message:
              "Butir soal tidak cocok dengan versi paket instrumen pada sesi asesmen Anda.",
          },
          { status: 409 }
        );
      }

      // Unique Constraint Violation (P2002, concurrent write race) -> 409 Conflict
      if (dbErr?.code === "P2002") {
        return NextResponse.json(
          {
            error: "CONCURRENT_SUBMISSION",
            message:
              "Terjadi konflik penyimpanan jawaban bersamaan. Silakan coba lagi.",
          },
          { status: 409 }
        );
      }

      // Database Reachability, Pooler Exhaustion, or Network Timeout -> 503 Service Unavailable
      const isConnectionIssue =
        dbErr?.code === "P1001" ||
        dbErr?.code === "P1008" ||
        dbErr?.code === "P1017" ||
        (typeof dbErr?.message === "string" &&
          (dbErr.message.includes("Can't reach database server") ||
            dbErr.message.includes("Timed out") ||
            dbErr.message.includes("connection pool")));

      if (isConnectionIssue) {
        return NextResponse.json(
          {
            error: "SERVICE_UNAVAILABLE",
            message:
              "Server sedang mengalami gangguan koneksi database. Jawaban Anda aman di perangkat — silakan coba simpan kembali.",
          },
          { status: 503 }
        );
      }

      // General internal database error -> 500 Internal Server Error
      return NextResponse.json(
        {
          error: "DATABASE_ERROR",
          message:
            "Gagal menyimpan jawaban ke basis data. Silakan coba lagi beberapa saat lagi.",
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("❌ [Assessment Answer] Internal error:", error);
    return NextResponse.json(
      {
        error: "INTERNAL_SERVER_ERROR",
        message: "Terjadi kesalahan internal saat menyimpan jawaban.",
      },
      { status: 500 }
    );
  }
}
