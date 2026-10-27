import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/mail";
import { consumeRateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // Rate Limit (F-09): max 5 registration requests per minute per IP
    const clientIp = getClientIp(req);
    const rateLimit = await consumeRateLimit(`register:ip:${clientIp}`, 5, 60_000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "TOO_MANY_REQUESTS",
          message: "Terlalu banyak permintaan pendaftaran. Silakan tunggu 1 menit.",
        },
        { status: 429 }
      );
    }
    const body = await req.json();
    const { email, password, full_name, phone_number, school_name, grade } = body;

    // 1. Basic validation
    if (!email || !password || !full_name) {
      return NextResponse.json(
        { error: "Email, kata sandi, dan nama lengkap wajib diisi." },
        { status: 400 }
      );
    }

    const trimmedEmail = email.toLowerCase().trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { error: "Format email tidak valid." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    // 2. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar. Silakan masuk menggunakan akun Anda." },
        { status: 409 }
      );
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create new student user & profile with email_verified: false
    const newUser = await prisma.user.create({
      data: {
        email: trimmedEmail,
        password_hash: hashedPassword,
        role: "STUDENT",
        is_active: true,
        email_verified: false,
        profile: {
          create: {
            full_name: full_name.trim(),
            phone_number: phone_number?.trim() || null,
            school_name: school_name?.trim() || null,
            grade: grade?.trim() || null,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    // 5. Generate secure 24-hour verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.verificationToken.create({
      data: {
        token: verificationToken,
        user_id: newUser.id,
        expires_at: expiresAt,
      },
    });

    // 6. Send verification email via Gmail SMTP Nodemailer
    try {
      const emailResult = await sendVerificationEmail(
        trimmedEmail,
        full_name.trim(),
        verificationToken
      );
      console.log(`📧 Verification email sent to ${trimmedEmail}:`, emailResult);
    } catch (emailErr) {
      console.warn("⚠️ Failed sending verification email during registration:", emailErr);
    }

    return NextResponse.json(
      {
        message: "Akun berhasil didaftarkan. Email verifikasi telah dikirimkan ke kotak masuk Anda.",
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
          profile: newUser.profile,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    const clientMessage =
      error?.message &&
      !error.message.includes("prisma") &&
      !error.message.includes("invocation") &&
      !error.message.includes("database") &&
      !error.message.includes("column")
        ? error.message
        : "Terjadi kesalahan internal saat pendaftaran. Silakan coba beberapa saat lagi.";
    return NextResponse.json(
      { error: clientMessage },
      { status: 500 }
    );
  }
}
