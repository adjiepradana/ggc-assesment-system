import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * DELETE / POST: Permanently delete student user account and associated assessment data
 */
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Anda harus masuk terlebih dahulu." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { confirmation } = body;

    if (!confirmation || confirmation.trim() !== "HAPUS") {
      return NextResponse.json(
        { error: "Konfirmasi tidak valid. Anda harus mengetik kata 'HAPUS' untuk menyetujui penghapusan akun." },
        { status: 400 }
      );
    }

    // Safety guard: prevent self-deletion of the legacy seeded admin account
    if (session.user.email === "admin@ggc.id") {
      return NextResponse.json(
        { error: "Akun demo pengujian sistem ini diproteksi dan tidak dapat dihapus." },
        { status: 403 }
      );
    }

    const userId = session.user.id;

    // Execute atomic cleanup transaction
    await prisma.$transaction(async (tx) => {
      // 1. Locate and clean up assessment answers and sessions
      const userSessions = await tx.assessmentSession.findMany({
        where: { user_id: userId },
        select: { id: true },
      });

      const sessionIds = userSessions.map((s) => s.id);

      if (sessionIds.length > 0) {
        await tx.assessmentAnswer.deleteMany({
          where: { session_id: { in: sessionIds } },
        });

        await tx.assessmentSession.deleteMany({
          where: { id: { in: sessionIds } },
        });
      }

      // 2. Delete verification tokens
      await tx.verificationToken.deleteMany({
        where: { user_id: userId },
      });

      // 3. Delete student profile
      await tx.studentProfile.deleteMany({
        where: { user_id: userId },
      });

      // 4. Detach orders and legacy access codes
      await tx.order.updateMany({
        where: { user_id: userId },
        data: { user_id: null },
      });

      await tx.accessCode.updateMany({
        where: { used_by: userId },
        data: { used_by: null },
      });

      // 5. Delete user record
      await tx.user.delete({
        where: { id: userId },
      });
    });

    console.log(`🗑️ [User Deletion] User account permanently deleted: ${session.user.email} (${userId})`);

    return NextResponse.json({
      success: true,
      message: "Akun dan seluruh riwayat asesmen Anda telah berhasil dihapus secara permanen dari server.",
    });
  } catch (error: any) {
    console.error("Error deleting user account:", error);
    return NextResponse.json(
      { error: error?.message || "Gagal memproses penghapusan akun. Silakan coba lagi." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  return DELETE(req);
}
