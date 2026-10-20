import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export const dynamic = "force-dynamic";

// Unambiguous character set (excludes 0, O, 1, I, L) for zero-typo user entry
const CODE_CHARSET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

function generateSingleCode(length: number = 8, prefix: string = ""): string {
  let result = "";
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += CODE_CHARSET[randomBytes[i] % CODE_CHARSET.length];
  }
  return prefix ? `${prefix}${result}` : result;
}

// --------------------------------------------------------------------------
// GET: List access codes with filters and stats
// --------------------------------------------------------------------------
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
    const status = searchParams.get("status") || "ALL"; // ALL | AVAILABLE | USED
    const search = searchParams.get("search")?.toUpperCase().trim() || "";

    const whereClause: any = {};

    if (status === "AVAILABLE" || status === "USED") {
      whereClause.status = status;
    }

    if (search) {
      whereClause.OR = [
        { code: { contains: search, mode: "insensitive" } },
        {
          user: {
            OR: [
              { email: { contains: search, mode: "insensitive" } },
              {
                profile: {
                  full_name: { contains: search, mode: "insensitive" },
                },
              },
            ],
          },
        },
      ];
    }

    // Parallel fetch for counts and filtered list
    const [totalCodes, availableCodes, usedCodes, codes] = await Promise.all([
      prisma.accessCode.count(),
      prisma.accessCode.count({ where: { status: "AVAILABLE" } }),
      prisma.accessCode.count({ where: { status: "USED" } }),
      prisma.accessCode.findMany({
        where: whereClause,
        include: {
          user: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
        take: 500, // limit to 500 records per view for high performance
      }),
    ]);

    const formattedCodes = codes.map((c) => ({
      id: c.id,
      code: c.code,
      status: c.status,
      createdAt: c.created_at.toISOString(),
      usedAt: c.used_at ? c.used_at.toISOString() : null,
      usedByUser: c.user
        ? {
            id: c.user.id,
            email: c.user.email,
            name: c.user.profile?.full_name || c.user.email.split("@")[0],
            school: c.user.profile?.school_name || "-",
            grade: c.user.profile?.grade || "-",
          }
        : null,
    }));

    return NextResponse.json({
      success: true,
      stats: {
        total: totalCodes,
        available: availableCodes,
        used: usedCodes,
      },
      codes: formattedCodes,
    });
  } catch (error: any) {
    console.error("Error fetching access codes:", error);
    return NextResponse.json(
      { error: "Gagal memuat daftar kode akses." },
      { status: 500 }
    );
  }
}

// --------------------------------------------------------------------------
// POST: Generate batch of new access codes
// --------------------------------------------------------------------------
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden. Hanya Administrator yang dapat membuat kode akses." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const count = Math.min(Math.max(Number(body.count) || 10, 1), 500); // Between 1 and 500
    const prefix = body.prefix ? String(body.prefix).trim().toUpperCase() : "";

    // Generate unique random 8-character codes
    const candidateCodesSet = new Set<string>();
    while (candidateCodesSet.size < count) {
      candidateCodesSet.add(generateSingleCode(8, prefix));
    }

    const candidateCodesList = Array.from(candidateCodesSet);

    // Filter out any collision with existing codes in DB
    const existing = await prisma.accessCode.findMany({
      where: { code: { in: candidateCodesList } },
      select: { code: true },
    });
    const existingSet = new Set(existing.map((e) => e.code));

    const finalCodesToInsert = candidateCodesList.filter((c) => !existingSet.has(c));

    // If collisions reduced count, top up with new codes
    while (finalCodesToInsert.length < count) {
      const extraCode = generateSingleCode(8, prefix);
      if (!candidateCodesSet.has(extraCode)) {
        candidateCodesSet.add(extraCode);
        const exists = await prisma.accessCode.findUnique({ where: { code: extraCode } });
        if (!exists) {
          finalCodesToInsert.push(extraCode);
        }
      }
    }

    // Insert batch into DB
    await prisma.accessCode.createMany({
      data: finalCodesToInsert.map((code) => ({
        code,
        status: "AVAILABLE",
      })),
      skipDuplicates: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: `Berhasil men-generate ${finalCodesToInsert.length} kode akses baru.`,
        count: finalCodesToInsert.length,
        codes: finalCodesToInsert,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error generating access codes:", error);
    return NextResponse.json(
      { error: "Gagal men-generate kode akses baru." },
      { status: 500 }
    );
  }
}

// --------------------------------------------------------------------------
// DELETE: Delete an unused access code or revoke
// --------------------------------------------------------------------------
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden. Hanya Administrator yang dapat menghapus kode akses." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const codeId = searchParams.get("id");

    if (!codeId) {
      return NextResponse.json(
        { error: "Parameter id kode akses wajib diisi." },
        { status: 400 }
      );
    }

    const existing = await prisma.accessCode.findUnique({
      where: { id: codeId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Kode akses tidak ditemukan." },
        { status: 404 }
      );
    }

    if (existing.status === "USED") {
      return NextResponse.json(
        { error: "Kode akses yang telah digunakan oleh partisipan tidak dapat dihapus." },
        { status: 400 }
      );
    }

    await prisma.accessCode.delete({
      where: { id: codeId },
    });

    return NextResponse.json({
      success: true,
      message: `Kode akses ${existing.code} berhasil dihapus.`,
    });
  } catch (error: any) {
    console.error("Error deleting access code:", error);
    return NextResponse.json(
      { error: "Gagal menghapus kode akses." },
      { status: 500 }
    );
  }
}
