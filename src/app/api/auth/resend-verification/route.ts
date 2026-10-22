import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/mail";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email wajib diisi." },
        { status: 400 }
      );
    }

    const trimmedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: trimmedEmail },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Akun dengan email tersebut tidak ditemukan." },
        { status: 404 }
      );
    }

    if (user.email_verified) {
      return NextResponse.json({
        message: "Email akun Anda sudah terverifikasi sebelumnya. Anda dapat langsung masuk.",
        already_verified: true,
      });
    }

    // Invalidate old tokens
    await prisma.verificationToken.deleteMany({
      where: { user_id: user.id },
    });

    // Create new token (24 hours expiry)
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.verificationToken.create({
      data: {
        token: verificationToken,
        user_id: user.id,
        expires_at: expiresAt,
      },
    });

    // Dispatch verification email
    const studentName = user.profile?.full_name || user.email.split("@")[0];
    const emailResult = await sendVerificationEmail(
      trimmedEmail,
      studentName,
      verificationToken
    );

    if (!emailResult.success) {
      throw new Error(emailResult.error || "Gagal mengirim email verifikasi.");
    }

    return NextResponse.json({
      success: true,
      message: `Tautan verifikasi baru telah berhasil dikirimkan ke ${trimmedEmail}. Silakan periksa inbox atau folder spam email Anda.`,
    });
  } catch (error: any) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: error?.message || "Gagal mengirim ulang email verifikasi." },
      { status: 500 }
    );
  }
}
