import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { all84QuestionsData } from "@/lib/questions-data";
import * as XLSX from "xlsx";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden. Hanya Administrator yang dapat mengekspor data." },
        { status: 403 }
      );
    }

    // 1. Gather Student Data
    let studentsRows: any[] = [];

    try {
      const users = await prisma.user.findMany({
        where: { role: "STUDENT" },
        include: {
          profile: true,
          sessions: {
            orderBy: { started_at: "desc" },
            select: {
              id: true,
              status: true,
              started_at: true,
              completed_at: true,
              result_data: true,
              _count: {
                select: { answers: true },
              },
            },
          },
        },
        orderBy: { created_at: "desc" },
      });

      if (users.length > 0) {
        studentsRows = users.map((u, idx) => {
          const sess = u.sessions[0];
          let topSignature = "-";
          let topMajor = "-";
          let fitScore = 0;

          if (sess?.result_data) {
            const scores = sess.result_data as any;
            topSignature = scores.potentialSignatures?.[0]?.title || "-";
            topMajor = scores.studyRecommendations?.[0]?.majorName || "-";
            fitScore = scores.studyRecommendations?.[0]?.fitScore || 0;
          }

          const answeredCount = sess?._count?.answers || 0;

          return {
            No: idx + 1,
            "Nama Lengkap": u.profile?.full_name || u.email.split("@")[0],
            Email: u.email,
            "No. WhatsApp": u.profile?.phone_number || "-",
            "Asal Sekolah": u.profile?.school_name || "-",
            "Jenjang / Kelas": u.profile?.grade || "-",
            "Status Sesi": sess?.status || "BELUM_MULAI",
            "Soal Terjawab": sess ? `${answeredCount} / 84` : "0 / 84",
            "Waktu Mulai": sess ? new Date(sess.started_at).toLocaleString("id-ID") : "-",
            "Waktu Selesai": sess?.completed_at ? new Date(sess.completed_at).toLocaleString("id-ID") : "-",
            "Top Potential Signature": topSignature,
            "Rekomendasi Jurusan Utama": topMajor,
            "Study Fit Score (%)": fitScore ? `${fitScore}%` : "-",
          };
        });
      }
    } catch (dbErr: any) {
      console.error("❌ [Admin Export] DB fetch error:", dbErr);
      return NextResponse.json(
        { error: "Gagal mengambil data siswa untuk ekspor." },
        { status: 500 }
      );
    }

    // 2. Gather Question Bank Data
    let questionRows = all84QuestionsData.map((q, idx) => ({
      No: idx + 1,
      "Kode Soal": q.code,
      "Kategori Dimensi": q.dimension,
      "Subdimensi Penilaian": q.subdimensi,
      "Teks Pernyataan Instrumen": q.text,
      "Skala Penilaian": "Likert 1-5 (Sangat Tidak Sesuai s/d Sangat Sesuai)",
      "Status Aktif": "Aktif",
    }));

    // 3. Create Excel Workbook using XLSX
    const workbook = XLSX.utils.book_new();

    const studentsWorksheet = XLSX.utils.json_to_sheet(studentsRows);
    const questionsWorksheet = XLSX.utils.json_to_sheet(questionRows);

    // Auto-fit column widths approximately
    studentsWorksheet["!cols"] = [
      { wch: 5 },  // No
      { wch: 26 }, // Nama
      { wch: 25 }, // Email
      { wch: 16 }, // WA
      { wch: 28 }, // Sekolah
      { wch: 18 }, // Kelas
      { wch: 15 }, // Status
      { wch: 14 }, // Soal Terjawab
      { wch: 20 }, // Waktu Mulai
      { wch: 20 }, // Waktu Selesai
      { wch: 30 }, // Signature
      { wch: 36 }, // Jurusan
      { wch: 18 }, // Fit Score
    ];

    questionsWorksheet["!cols"] = [
      { wch: 5 },  // No
      { wch: 12 }, // Kode
      { wch: 16 }, // Dimensi
      { wch: 32 }, // Subdimensi
      { wch: 70 }, // Teks
      { wch: 25 }, // Skala
      { wch: 14 }, // Status
    ];

    XLSX.utils.book_append_sheet(workbook, studentsWorksheet, "Rekap Peserta & Asesmen");
    XLSX.utils.book_append_sheet(workbook, questionsWorksheet, "Bank Soal 84 Butir");

    // Write to binary buffer
    const excelBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    const timestamp = new Date().toISOString().slice(0, 10);

    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="GGC_Study_Fit_Rekap_Peserta_${timestamp}.xlsx"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Error generating Excel export:", error);
    return NextResponse.json(
      { error: "Gagal membuat berkas Excel rekapitulasi data." },
      { status: 500 }
    );
  }
}
