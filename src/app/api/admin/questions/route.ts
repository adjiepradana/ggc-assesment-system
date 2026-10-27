import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { all84QuestionsData, defaultLikertOptions } from "@/lib/questions-data";
import { DimensionCategory } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden. Hanya Administrator yang memiliki hak akses." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search")?.toLowerCase().trim();
    const status = searchParams.get("status");

    let questionsList: any[] = [];

    try {
      const whereClause: any = {};
      if (category && category !== "ALL") {
        whereClause.dimension_category = category as DimensionCategory;
      }
      if (status === "ACTIVE") {
        whereClause.is_active = true;
      } else if (status === "INACTIVE") {
        whereClause.is_active = false;
      }
      if (search) {
        whereClause.OR = [
          { question_text: { contains: search, mode: "insensitive" } },
          { code: { contains: search, mode: "insensitive" } },
          { subdimensi: { contains: search, mode: "insensitive" } },
        ];
      }

      questionsList = await prisma.question.findMany({
        where: whereClause,
        orderBy: { code: "asc" },
      });
    } catch (dbErr) {
      console.warn("DB fetch fallback in admin questions:", dbErr);
    }

    // Fallback if DB is empty or offline
    if (questionsList.length === 0) {
      let filtered = all84QuestionsData.map((q) => ({
        id: `q-${q.code}`,
        code: q.code,
        dimension_category: q.dimension,
        subdimensi: q.subdimensi,
        question_text: q.text,
        options: defaultLikertOptions,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      if (category && category !== "ALL") {
        filtered = filtered.filter((q) => q.dimension_category === category);
      }
      if (search) {
        filtered = filtered.filter(
          (q) =>
            q.question_text.toLowerCase().includes(search) ||
            q.code.toLowerCase().includes(search) ||
            q.subdimensi.toLowerCase().includes(search)
        );
      }
      questionsList = filtered;
    }

    return NextResponse.json({
      success: true,
      total: questionsList.length,
      questions: questionsList,
    });
  } catch (error) {
    console.error("Error fetching admin questions:", error);
    return NextResponse.json(
      { error: "Gagal mengambil daftar soal asesmen." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden. Hanya Administrator yang dapat menambah soal." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { code, dimension_category, subdimensi, question_text, options } = body;

    if (!code || !dimension_category || !subdimensi || !question_text) {
      return NextResponse.json(
        { error: "Kode soal, kategori dimensi, subdimensi, dan teks pertanyaan wajib diisi." },
        { status: 400 }
      );
    }

    const trimmedCode = code.toUpperCase().trim();

    try {
      const existing = await prisma.question.findUnique({
        where: { code: trimmedCode },
      });

      if (existing) {
        return NextResponse.json(
          { error: `Kode soal "${trimmedCode}" sudah digunakan. Gunakan kode unik lain.` },
          { status: 409 }
        );
      }

      const newQuestion = await prisma.question.create({
        data: {
          code: trimmedCode,
          dimension_category: dimension_category as DimensionCategory,
          subdimensi: subdimensi.trim(),
          question_text: question_text.trim(),
          options: options || defaultLikertOptions,
          is_active: true,
        },
      });

      return NextResponse.json(
        {
          success: true,
          message: "Soal baru berhasil ditambahkan ke bank soal.",
          question: newQuestion,
        },
        { status: 201 }
      );
    } catch (dbErr) {
      console.error("DB write failure in admin questions create:", dbErr);
      return NextResponse.json(
        {
          error: "Database sedang mengalami gangguan. Gagal menyimpan soal baru.",
        },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server saat membuat soal baru." },
      { status: 500 }
    );
  }
}
