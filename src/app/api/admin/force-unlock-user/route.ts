import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden. Hanya Administrator yang dapat membuka akses akun secara manual." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { userId, email, orderId } = body;

    if (!userId && !email && !orderId) {
      return NextResponse.json(
        { error: "Parameter userId, email, atau orderId wajib disertakan." },
        { status: 400 }
      );
    }

    let targetUser = null;

    // 1. Find by userId
    if (userId) {
      targetUser = await prisma.user.findUnique({
        where: { id: userId },
      });
    }

    // 2. Find by orderId
    if (!targetUser && orderId) {
      const order = await prisma.order.findUnique({
        where: { order_id: orderId },
      });

      if (order?.user_id) {
        targetUser = await prisma.user.findUnique({
          where: { id: order.user_id },
        });
      } else if (order?.customer_email) {
        targetUser = await prisma.user.findUnique({
          where: { email: order.customer_email.toLowerCase().trim() },
        });
      }
    }

    // 3. Find by email
    if (!targetUser && email) {
      targetUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });
    }

    if (!targetUser) {
      return NextResponse.json(
        {
          error:
            "Akun siswa tidak ditemukan. Pastikan data akun siswa telah terdaftar pada database sistem.",
        },
        { status: 404 }
      );
    }

    // Perform manual unlock
    const updatedUser = await prisma.user.update({
      where: { id: targetUser.id },
      data: {
        email_verified: true,
      },
      select: {
        id: true,
        email: true,
        email_verified: true,
      },
    });

    // If order was provided and not linked to this user, link it
    if (orderId) {
      await prisma.order.updateMany({
        where: {
          order_id: orderId,
          user_id: null,
        },
        data: {
          user_id: targetUser.id,
        },
      });
    }

    // Audit log
    await logAdminAction(session.user.id, "FORCE_UNLOCK_USER", updatedUser.id, {
      unlockedEmail: updatedUser.email,
      linkedOrderId: orderId || null,
    });

    return NextResponse.json({
      success: true,
      message: `Akses asesmen untuk siswa (${updatedUser.email}) berhasil dibuka secara manual oleh Administrator.`,
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("Error in admin force-unlock-user:", error);
    return NextResponse.json(
      {
        error:
          "Gagal membuka akses akun: " + (error?.message || "Internal server error"),
      },
      { status: 500 }
    );
  }
}
