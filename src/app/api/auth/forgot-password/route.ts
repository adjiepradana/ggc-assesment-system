import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/mail";
import { getRequestOrigin } from "@/lib/request-origin";

export const dynamic = "force-dynamic";

// In-memory cooldown map (Phase 3.1: 60-second cooldown per email)
const forgotPasswordCooldownMap = new Map<string, number>();

if (typeof setInterval !== "undefined") {
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    forgotPasswordCooldownMap.forEach((timestamp, key) => {
      if (now - timestamp > 60_000) {
        forgotPasswordCooldownMap.delete(key);
      }
    });
  }, 5 * 60 * 1000);
  cleanupTimer.unref?.();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Mohon masukkan alamat email yang valid." },
        { status: 400 }
      );
    }

    const trimmedEmail = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { error: "Format alamat email tidak valid." },
        { status: 400 }
      );
    }

    // 1. In-Memory Cooldown Check (Phase 3.1: Fast-reject repeated requests before DB)
    const lastMemoryRequest = forgotPasswordCooldownMap.get(trimmedEmail);
    if (lastMemoryRequest && Date.now() - lastMemoryRequest < 60_000) {
      return NextResponse.json(
        {
          error: "TOO_MANY_REQUESTS",
          message: "Mohon tunggu 60 detik sebelum meminta tautan baru.",
        },
        { status: 429 }
      );
    }

    // 2. Database Cooldown Check (Cross-instance & distributed resilience)
    const latestResetToken = await prisma.passwordResetToken.findFirst({
      where: { email: trimmedEmail },
      orderBy: { created_at: "desc" },
    });

    if (latestResetToken) {
      const elapsedMs = Date.now() - new Date(latestResetToken.created_at).getTime();
      if (elapsedMs < 60_000) {
        forgotPasswordCooldownMap.set(trimmedEmail, new Date(latestResetToken.created_at).getTime());
        return NextResponse.json(
          {
            error: "TOO_MANY_REQUESTS",
            message: "Mohon tunggu 60 detik sebelum meminta tautan baru.",
          },
          { status: 429 }
        );
      }
    }

    // 3. Check if user exists in the database
    const user = await prisma.user.findUnique({
      where: { email: trimmedEmail },
      include: { profile: true },
    });

    // SECURITY (Anti-enumeration): If user doesn't exist, record cooldown and return generic success
    if (!user) {
      console.log(`ℹ️ [Forgot Password] Requested reset for unregistered email: ${trimmedEmail}`);
      forgotPasswordCooldownMap.set(trimmedEmail, Date.now());
      return NextResponse.json({
        success: true,
        message:
          "Jika alamat email Anda terdaftar di sistem kami, tautan pemulihan kata sandi telah dikirimkan ke kotak masuk Anda.",
      });
    }

    // 4. Invalidate any previous unused password reset tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email: trimmedEmail },
    });

    // 5. Generate secure random 64-character token with 1-hour expiration
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        email: trimmedEmail,
        token,
        expires_at: expiresAt,
      },
    });

    // Update in-memory cooldown timestamp
    forgotPasswordCooldownMap.set(trimmedEmail, Date.now());

    // 6. Send email with reset link
    const recipientName =
      user.profile?.full_name || trimmedEmail.split("@")[0];
    const origin = getRequestOrigin(req);

    const emailResult = await sendPasswordResetEmail(
      trimmedEmail,
      recipientName,
      token,
      origin
    );

    if (!emailResult.success) {
      console.error(
        `❌ [Forgot Password] Failed to dispatch email to ${trimmedEmail}:`,
        emailResult.error
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Jika alamat email Anda terdaftar di sistem kami, tautan pemulihan kata sandi telah dikirimkan ke kotak masuk Anda.",
    });
  } catch (error: any) {
    console.error("Error in /api/auth/forgot-password:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server saat memproses permintaan." },
      { status: 500 }
    );
  }
}
