import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, newPassword } = body;

    // 1. Validation
    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Token pemulihan kata sandi tidak valid atau hilang." },
        { status: 400 }
      );
    }

    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    // 2. Validate token in database
    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token: token.trim() },
    });

    if (!resetRecord) {
      return NextResponse.json(
        {
          error:
            "Tautan pemulihan kata sandi tidak valid atau sudah pernah digunakan sebelumnya.",
        },
        { status: 400 }
      );
    }

    // 3. Check expiration
    if (new Date() > resetRecord.expires_at) {
      // Invalidate expired token
      await prisma.passwordResetToken.delete({
        where: { id: resetRecord.id },
      }).catch(() => {});

      return NextResponse.json(
        {
          error:
            "Tautan pemulihan kata sandi telah kedaluwarsa. Silakan ajukan permohonan baru.",
        },
        { status: 410 }
      );
    }

    // 4. Find user by email
    const user = await prisma.user.findUnique({
      where: { email: resetRecord.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Akun pengguna tidak ditemukan di sistem." },
        { status: 404 }
      );
    }

    // 5. Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 6. Update user password and delete used token atomically
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          password_hash: hashedPassword,
          is_active: true,
        },
      }),
      prisma.passwordResetToken.deleteMany({
        where: { email: resetRecord.email },
      }),
    ]);

    console.log(`🔐 [Reset Password] Successfully updated password for user: ${user.email}`);

    return NextResponse.json({
      success: true,
      message: "Kata sandi berhasil diperbarui. Silakan masuk menggunakan kata sandi baru Anda.",
    });
  } catch (error: any) {
    console.error("Error in /api/auth/reset-password:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal saat memperbarui kata sandi." },
      { status: 500 }
    );
  }
}
