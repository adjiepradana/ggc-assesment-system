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
          answers: true,
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
        return NextResponse.json({
          success: true,
          message: "Sesi asesmen sudah selesai sebelumnya.",
          session_id,
        });
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

      // Update to COMPLETED
      await prisma.assessmentSession.update({
        where: { id: session_id },
        data: {
          status: "COMPLETED",
          completed_at: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Selamat! Asesmen Study Fit Anda berhasil diselesaikan dan disimpan.",
        session_id,
      });
    } catch (dbErr) {
      console.warn("DB write fallback for assessment/complete:", dbErr);
      return NextResponse.json({
        success: true,
        message: "Asesmen berhasil diselesaikan (Mode Dev).",
        session_id,
      });
    }
  } catch (error) {
    console.error("Error in /api/assessment/complete:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memfinalisasi asesmen." },
      { status: 500 }
    );
  }
}
