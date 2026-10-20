import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden. Hanya Administrator yang dapat mengekspor kode akses." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "ALL"; // ALL | AVAILABLE | USED
    const format = searchParams.get("format") || "csv"; // csv | xlsx
    const lynkOnly = searchParams.get("lynk") === "true"; // Only output list of codes for direct Lynk.id copy

    const whereClause: any = {};
    if (status === "AVAILABLE" || status === "USED") {
      whereClause.status = status;
    }

    const codes = await prisma.accessCode.findMany({
      where: whereClause,
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    const timestamp = new Date().toISOString().slice(0, 10);

    // Lynk.id plain text mode (1 code per line, ready to paste directly into Lynk.id Auto-Responder)
    if (lynkOnly) {
      const plainCodes = codes.map((c) => c.code).join("\n");
      return new NextResponse(plainCodes, {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Content-Disposition": `attachment; filename="Lynk_ID_Codes_${timestamp}.txt"`,
          "Cache-Control": "no-cache",
        },
      });
    }

    // CSV format
    if (format === "csv") {
      const csvHeader = "Kode Akses,Status,Tanggal Dibuat,Tanggal Digunakan,Nama Siswa,Email Siswa,Asal Sekolah\n";
      const csvRows = codes.map((c) => {
        const studentName = (c.user?.profile?.full_name || "").replace(/,/g, " ");
        const studentEmail = (c.user?.email || "").replace(/,/g, " ");
        const studentSchool = (c.user?.profile?.school_name || "").replace(/,/g, " ");
        const createdAt = c.created_at.toISOString().slice(0, 19).replace("T", " ");
        const usedAt = c.used_at ? c.used_at.toISOString().slice(0, 19).replace("T", " ") : "-";

        return `"${c.code}","${c.status}","${createdAt}","${usedAt}","${studentName}","${studentEmail}","${studentSchool}"`;
      });

      const csvContent = "\uFEFF" + csvHeader + csvRows.join("\n"); // Include UTF-8 BOM for Excel compatibility

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="GGC_Access_Codes_${timestamp}.csv"`,
          "Cache-Control": "no-cache",
        },
      });
    }

    // Excel (.xlsx) format
    const excelRows = codes.map((c, idx) => ({
      No: idx + 1,
      "Kode Akses": c.code,
      Status: c.status === "AVAILABLE" ? "TERSEDIA (Belum Terpakai)" : "TERPAKAI",
      "Tanggal Dibuat": c.created_at.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      "Tanggal Digunakan": c.used_at
        ? c.used_at.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "-",
      "Nama Siswa": c.user?.profile?.full_name || "-",
      "Email Siswa": c.user?.email || "-",
      "Asal Sekolah": c.user?.profile?.school_name || "-",
      "Jenjang / Kelas": c.user?.profile?.grade || "-",
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelRows);

    worksheet["!cols"] = [
      { wch: 6 },  // No
      { wch: 18 }, // Kode Akses
      { wch: 25 }, // Status
      { wch: 24 }, // Tanggal Dibuat
      { wch: 24 }, // Tanggal Digunakan
      { wch: 28 }, // Nama Siswa
      { wch: 28 }, // Email Siswa
      { wch: 26 }, // Asal Sekolah
      { wch: 18 }, // Jenjang
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, "Daftar Kode Akses");

    const excelBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="GGC_Access_Codes_${timestamp}.xlsx"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: any) {
    console.error("Error exporting access codes:", error);
    return NextResponse.json(
      { error: "Gagal mengekspor data kode akses." },
      { status: 500 }
    );
  }
}
