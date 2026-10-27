import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { all84QuestionsData } from "@/lib/questions-data";
import ExcelJS from "exceljs";
import { sanitizeExcelRow } from "@/lib/excel-sanitize";

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
    let studentsRows: Record<string, unknown>[] = [];

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

          return sanitizeExcelRow({
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
          });
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
    const questionRows = all84QuestionsData.map((q, idx) =>
      sanitizeExcelRow({
        No: idx + 1,
        "Kode Soal": q.code,
        "Kategori Dimensi": q.dimension,
        "Subdimensi Penilaian": q.subdimensi,
        "Teks Pernyataan Instrumen": q.text,
        "Skala Penilaian": "Likert 1-5 (Sangat Tidak Sesuai s/d Sangat Sesuai)",
        "Status Aktif": "Aktif",
      })
    );

    // 3. Create Excel Workbook using ExcelJS
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Go Great Career (GGC)";
    workbook.created = new Date();

    const studentsWorksheet = workbook.addWorksheet("Rekap Peserta & Asesmen");
    studentsWorksheet.columns = [
      { header: "No", key: "No", width: 5 },
      { header: "Nama Lengkap", key: "Nama Lengkap", width: 26 },
      { header: "Email", key: "Email", width: 25 },
      { header: "No. WhatsApp", key: "No. WhatsApp", width: 16 },
      { header: "Asal Sekolah", key: "Asal Sekolah", width: 28 },
      { header: "Jenjang / Kelas", key: "Jenjang / Kelas", width: 18 },
      { header: "Status Sesi", key: "Status Sesi", width: 15 },
      { header: "Soal Terjawab", key: "Soal Terjawab", width: 14 },
      { header: "Waktu Mulai", key: "Waktu Mulai", width: 20 },
      { header: "Waktu Selesai", key: "Waktu Selesai", width: 20 },
      { header: "Top Potential Signature", key: "Top Potential Signature", width: 30 },
      { header: "Rekomendasi Jurusan Utama", key: "Rekomendasi Jurusan Utama", width: 36 },
      { header: "Study Fit Score (%)", key: "Study Fit Score (%)", width: 18 },
    ];
    if (studentsRows.length > 0) {
      studentsWorksheet.addRows(studentsRows);
    }

    const questionsWorksheet = workbook.addWorksheet("Bank Soal 84 Butir");
    questionsWorksheet.columns = [
      { header: "No", key: "No", width: 5 },
      { header: "Kode Soal", key: "Kode Soal", width: 12 },
      { header: "Kategori Dimensi", key: "Kategori Dimensi", width: 16 },
      { header: "Subdimensi Penilaian", key: "Subdimensi Penilaian", width: 32 },
      { header: "Teks Pernyataan Instrumen", key: "Teks Pernyataan Instrumen", width: 70 },
      { header: "Skala Penilaian", key: "Skala Penilaian", width: 25 },
      { header: "Status Aktif", key: "Status Aktif", width: 14 },
    ];
    questionsWorksheet.addRows(questionRows);

    // Write to binary buffer
    const arrayBuffer = await workbook.xlsx.writeBuffer();
    const excelBuffer = Buffer.from(arrayBuffer);

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
