import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, full_name, phone_number, school_name, grade } = body;

    // Validation
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

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Kata sandi minimal harus 6 karakter." },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar. Silakan login." },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and profile
    const newUser = await prisma.user.create({
      data: {
        email: trimmedEmail,
        password_hash: hashedPassword,
        role: "STUDENT",
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

    return NextResponse.json(
      {
        message: "Akun berhasil didaftarkan.",
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
          profile: newUser.profile,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal saat pendaftaran." },
      { status: 500 }
    );
  }
}
