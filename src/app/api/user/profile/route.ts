import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET: Retrieve current user's profile information
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Anda harus masuk terlebih dahulu." },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Pengguna tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.profile?.full_name || session.user.name || "",
        phone_number: user.profile?.phone_number || "",
        school_name: user.profile?.school_name || "",
        grade: user.profile?.grade || "",
        email_verified: user.email_verified,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data profil." },
      { status: 500 }
    );
  }
}

/**
 * PUT / POST: Update profile details (Name, WhatsApp Number, School, Grade)
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

    const body = await req.json();
    const { name, phone_number, school_name, grade } = body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Nama lengkap wajib diisi (minimal 2 karakter)." },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    const trimmedPhone = phone_number ? String(phone_number).trim() : null;
    const trimmedSchool = school_name ? String(school_name).trim() : null;
    const trimmedGrade = grade ? String(grade).trim() : null;

    // Upsert StudentProfile
    const updatedProfile = await prisma.studentProfile.upsert({
      where: { user_id: session.user.id },
      update: {
        full_name: trimmedName,
        phone_number: trimmedPhone,
        school_name: trimmedSchool,
        grade: trimmedGrade,
      },
      create: {
        user_id: session.user.id,
        full_name: trimmedName,
        phone_number: trimmedPhone,
        school_name: trimmedSchool,
        grade: trimmedGrade,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Informasi profil berhasil diperbarui.",
      profile: {
        name: updatedProfile.full_name,
        phone_number: updatedProfile.phone_number || "",
        school_name: updatedProfile.school_name || "",
        grade: updatedProfile.grade || "",
      },
    });
  } catch (error: any) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: error?.message || "Terjadi kesalahan internal saat memperbarui profil." },
      { status: 500 }
    );
  }
}

// Support POST as well for convenience
export async function POST(req: Request) {
  return PUT(req);
}
