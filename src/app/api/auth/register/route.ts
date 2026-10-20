import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, full_name, phone_number, school_name, grade, access_code } = body;

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

    // Access Code Validation
    const normalizedCode = access_code ? String(access_code).trim().toUpperCase() : "";
    if (!normalizedCode) {
      return NextResponse.json(
        { error: "Kode Akses (Access Code) wajib diisi. Silakan masukkan kode pembelian dari Lynk.id." },
        { status: 400 }
      );
    }

    // Verify Access Code availability
    const existingCode = await prisma.accessCode.findUnique({
      where: { code: normalizedCode },
    });

    if (!existingCode) {
      return NextResponse.json(
        { error: "Kode akses tidak ditemukan. Pastikan Anda memasukkan kode 8 karakter resmi dari Lynk.id." },
        { status: 400 }
      );
    }

    if (existingCode.status !== "AVAILABLE") {
      return NextResponse.json(
        { error: "Kode akses ini sudah digunakan sebelumnya. Setiap kode hanya berlaku untuk satu akun partisipan." },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar. Silakan masuk dengan akun yang sudah ada." },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Atomic transaction: Create User, Profile, and mark AccessCode as USED
    const result = await prisma.$transaction(async (tx) => {
      // Re-check code status inside transaction to prevent race conditions
      const codeInTx = await tx.accessCode.findUnique({
        where: { code: normalizedCode },
      });

      if (!codeInTx || codeInTx.status !== "AVAILABLE") {
        throw new Error("Kode akses tidak valid atau baru saja digunakan oleh pengguna lain.");
      }

      // Create new student user
      const user = await tx.user.create({
        data: {
          email: trimmedEmail,
          password_hash: hashedPassword,
          role: "STUDENT",
          is_active: true,
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

      // Update access code status to USED
      await tx.accessCode.update({
        where: { id: codeInTx.id },
        data: {
          status: "USED",
          used_by: user.id,
          used_at: new Date(),
        },
      });

      return user;
    });

    return NextResponse.json(
      {
        message: "Akun berhasil didaftarkan dengan kode akses resmi.",
        user: {
          id: result.id,
          email: result.email,
          role: result.role,
          profile: result.profile,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan internal saat pendaftaran." },
      { status: 500 }
    );
  }
}
