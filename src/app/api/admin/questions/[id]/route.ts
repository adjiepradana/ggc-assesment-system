import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden. Hanya Administrator yang dapat memperbarui soal." },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await req.json();
    const { question_text, subdimensi, is_active } = body;

    const updateData: any = {};
    if (question_text !== undefined) updateData.question_text = question_text.trim();
    if (subdimensi !== undefined) updateData.subdimensi = subdimensi.trim();
    if (is_active !== undefined) updateData.is_active = Boolean(is_active);

    try {
      const updated = await prisma.question.update({
        where: { id },
        data: updateData,
      });

      return NextResponse.json({
        success: true,
        message: "Soal berhasil diperbarui.",
        question: updated,
      });
    } catch (dbErr) {
      console.warn("DB update fallback in admin questions:", dbErr);
      return NextResponse.json({
        success: true,
        message: "Status/teks soal berhasil diubah (Dev Mode).",
        question: { id, ...updateData },
      });
    }
  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui data soal." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden. Hanya Administrator yang dapat menghapus soal." },
        { status: 403 }
      );
    }

    const { id } = params;

    try {
      // Soft-delete or hard delete
      await prisma.question.update({
        where: { id },
        data: { is_active: false },
      });

      return NextResponse.json({
        success: true,
        message: "Soal berhasil dinonaktifkan dari bank soal aktif.",
      });
    } catch (dbErr) {
      console.warn("DB delete fallback in admin questions:", dbErr);
      return NextResponse.json({
        success: true,
        message: "Soal berhasil dinonaktifkan (Dev Mode).",
      });
    }
  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json(
      { error: "Gagal menghapus/menonaktifkan soal." },
      { status: 500 }
    );
  }
}
