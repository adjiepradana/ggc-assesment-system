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

    if (verification.user.is_active === false) {
      return NextResponse.json(
        { error: "Akun ini telah dinonaktifkan oleh administrator." },
        { status: 403 }
      );
    }

    // Read-only check: do not mutate user state or consume token on GET
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
 * POST: Complete email verification (and optionally set new password), consuming the single-use token
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, password } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Token verifikasi wajib diisi." },
        { status: 400 }
      );
    }

    if (password !== undefined && password !== null) {
      if (typeof password !== "string" || password.length < 8) {
        return NextResponse.json(
          { error: "Password must be at least 8 characters long." },
          { status: 400 }
        );
      }
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

    if (verification.user.is_active === false) {
      return NextResponse.json(
        { error: "Akun ini telah dinonaktifkan oleh administrator." },
        { status: 403 }
      );
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    await prisma.$transaction([
      prisma.user.update({
        where: { id: verification.user_id },
        data: {
          email_verified: true,
          ...(hashedPassword ? { password_hash: hashedPassword } : {}),
        },
      }),
      prisma.verificationToken.delete({
        where: { id: verification.id },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Akun berhasil diverifikasi.",
      email: verification.user.email,
      name: verification.user.profile?.full_name || verification.user.email.split("@")[0],
    });
  } catch (error: any) {
    console.error("Account activation error:", error);
    return NextResponse.json(
      { error: "Gagal mengaktifkan akun. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
