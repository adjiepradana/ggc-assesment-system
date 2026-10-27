import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * PUT / POST: Securely update student account password
 */
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Anda harus masuk terlebih dahulu." },
        { status: 401 }
      );
    }

    // Rate Limit (F-09): max 5 password change requests per minute per user
    const rateLimit = await consumeRateLimit(
      `password-change:user:${session.user.id}`,
      5,
      60_000
    );
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "TOO_MANY_REQUESTS",
          message:
            "Terlalu banyak permintaan perubahan kata sandi. Silakan tunggu 1 menit.",
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { current_password, new_password, confirm_password } = body;

    // 1. Basic validation
    if (!current_password || !new_password || !confirm_password) {
      return NextResponse.json(
        { error: "Semua kolom kata sandi wajib diisi." },
        { status: 400 }
      );
    }

    if (new_password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    if (new_password !== confirm_password) {
      return NextResponse.json(
        { error: "Konfirmasi kata sandi baru tidak cocok." },
        { status: 400 }
      );
    }

    if (current_password === new_password) {
      return NextResponse.json(
        { error: "Kata sandi baru harus berbeda dari kata sandi saat ini." },
        { status: 400 }
      );
    }

    // 2. Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || !user.password_hash) {
      return NextResponse.json(
        { error: "Data pengguna tidak valid." },
        { status: 404 }
      );
    }

    // 3. Verify current password
    const isCurrentValid = await bcrypt.compare(
      current_password,
      user.password_hash
    );

    if (!isCurrentValid) {
      return NextResponse.json(
        { error: "Kata sandi saat ini tidak cocok. Mohon periksa kembali." },
        { status: 400 }
      );
    }

    // 4. Hash and save new password, incrementing token_version to revoke prior JWT sessions (F-10)
    const hashedNewPassword = await bcrypt.hash(new_password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password_hash: hashedNewPassword,
        token_version: { increment: 1 },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Kata sandi Anda berhasil diperbarui. Silakan gunakan kata sandi baru saat masuk kembali.",
    });
  } catch (error: any) {
    console.error("Error updating password:", error);
    return NextResponse.json(
      { error: error?.message || "Terjadi kesalahan saat memperbarui kata sandi." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  return PUT(req);
}
