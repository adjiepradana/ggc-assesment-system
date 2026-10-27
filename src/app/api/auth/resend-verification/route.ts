import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/mail";

export const dynamic = "force-dynamic";

// In-memory cooldown map (Phase 3.1: 60-second cooldown per email)
const resendCooldownMap = new Map<string, number>();

if (typeof setInterval !== "undefined") {
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    resendCooldownMap.forEach((timestamp, key) => {
      if (now - timestamp > 60_000) {
        resendCooldownMap.delete(key);
      }
    });
  }, 5 * 60 * 1000);
  cleanupTimer.unref?.();
}

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

    // 1. In-Memory Cooldown Check (Fast reject spam before hitting DB)
    const lastMemoryRequest = resendCooldownMap.get(trimmedEmail);
    if (lastMemoryRequest && Date.now() - lastMemoryRequest < 60_000) {
      return NextResponse.json(
        {
          error: "TOO_MANY_REQUESTS",
          message: "Mohon tunggu 60 detik sebelum meminta tautan baru.",
        },
        { status: 429 }
      );
    }

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

    // 2. Database Cooldown Check (Cross-instance & distributed resilience)
    const latestToken = await prisma.verificationToken.findFirst({
      where: { user_id: user.id },
      orderBy: { created_at: "desc" },
    });

    if (latestToken) {
      const elapsedMs = Date.now() - new Date(latestToken.created_at).getTime();
      if (elapsedMs < 60_000) {
        // Synchronize in-memory map
        resendCooldownMap.set(trimmedEmail, new Date(latestToken.created_at).getTime());
        return NextResponse.json(
          {
            error: "TOO_MANY_REQUESTS",
            message: "Mohon tunggu 60 detik sebelum meminta tautan baru.",
          },
          { status: 429 }
        );
      }
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

    // Update cooldown map timestamp
    resendCooldownMap.set(trimmedEmail, Date.now());

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
    const clientMessage =
      error?.message &&
      !error.message.includes("prisma") &&
      !error.message.includes("invocation") &&
      !error.message.includes("database") &&
      !error.message.includes("column")
        ? error.message
        : "Terjadi kesalahan internal saat mengirim ulang email verifikasi. Silakan coba beberapa saat lagi.";
    return NextResponse.json(
      { error: clientMessage },
      { status: 500 }
    );
  }
}
