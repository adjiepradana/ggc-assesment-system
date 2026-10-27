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

      let resolvedLegacyQuestionId =
        questionSetItem?.legacy_question_id || question_id;

      if (!questionSetItem) {
        // Look up Question by id or code, then find matching QuestionSetItem by code
        const legacyQuestion = await prisma.question.findFirst({
          where: {
            OR: [{ id: question_id }, { code: question_id }],
          },
        });

        if (legacyQuestion) {
          resolvedLegacyQuestionId = legacyQuestion.id;
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
            error:
              "Butir soal tidak ditemukan dalam paket instrumen sesi asesmen ini.",
          },
          { status: 400 }
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

      // 3. Upsert answer with question_set_item_id
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
      return NextResponse.json(
        {
          error: "SERVICE_UNAVAILABLE",
          message:
            "Gagal menyimpan jawaban ke basis data. Silakan periksa koneksi Anda dan coba lagi.",
        },
        { status: 503 }
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
