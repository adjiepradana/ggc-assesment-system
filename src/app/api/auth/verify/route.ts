import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET: Verify token validity
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Token verifikasi wajib disertakan." },
        { status: 400 }
      );
    }

    const verification = await prisma.verificationToken.findUnique({
      where: { token },
      include: {
        user: {
          include: { profile: true },
        },
      },
    });

    if (!verification) {
      return NextResponse.json(
        { error: "Tautan verifikasi tidak valid atau sudah pernah digunakan." },
        { status: 404 }
      );
    }

    if (new Date() > verification.expires_at) {
      return NextResponse.json(
        { error: "Tautan verifikasi telah kadaluarsa (melewati batas waktu 24 jam)." },
        { status: 410 }
      );
    }

    // Automatically mark user email as verified
    await prisma.user.update({
      where: { id: verification.user_id },
      data: {
        email_verified: true,
        is_active: true,
      },
    });

    return NextResponse.json({
      success: true,
      email: verification.user.email,
      name: verification.user.profile?.full_name || verification.user.email.split("@")[0],
    });
  } catch (error: any) {
    console.error("Verification verification error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memverifikasi akun." },
      { status: 500 }
    );
  }
}

/**
 * POST: Activate account with new password
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token verifikasi dan kata sandi baru wajib diisi." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Kata sandi minimal 6 karakter." },
        { status: 400 }
      );
    }

    const verification = await prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verification) {
      return NextResponse.json(
        { error: "Tautan verifikasi tidak valid atau telah digunakan." },
        { status: 404 }
      );
    }

    if (new Date() > verification.expires_at) {
      return NextResponse.json(
        { error: "Tautan verifikasi telah kadaluarsa." },
        { status: 410 }
      );
    }

    // Hash new password and activate user
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: verification.user_id },
        data: {
          password_hash: hashedPassword,
          email_verified: true,
          is_active: true,
        },
      }),
      prisma.verificationToken.delete({
        where: { id: verification.id },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Akun berhasil diaktifkan dengan kata sandi baru.",
      email: verification.user.email,
    });
  } catch (error: any) {
    console.error("Account activation error:", error);
    return NextResponse.json(
      { error: "Gagal mengaktifkan akun. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
