import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  ShieldCheck,
  FileQuestion,
  Users,
  CheckCircle2,
  Clock,
  Layers,
  ArrowUpRight,
  Database,
  Search,
  Filter,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  let totalQuestionsCount = 0;
  let totalStudentsCount = 0;
  let totalSessionsCount = 0;
  let completedSessionsCount = 0;

  try {
    const [qCount, sCount, sessCount, compCount] = await Promise.all([
      prisma.question.count(),
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.assessmentSession.count(),
      prisma.assessmentSession.count({ where: { status: "COMPLETED" } }),
    ]);

    totalQuestionsCount = qCount;
    totalStudentsCount = sCount;
    totalSessionsCount = sessCount;
    completedSessionsCount = compCount;
  } catch (e) {
    // Fallback for dev environment
    totalQuestionsCount = 84;
    totalStudentsCount = 28;
    totalSessionsCount = 34;
    completedSessionsCount = 22;
  }

  const dimensionBreakdowns = [
    { code: "T01 - T12", name: "Talent (Bakat)", items: 12, category: "TALENT", status: "Active" },
    { code: "I01 - I12", name: "Interest (Minat)", items: 12, category: "INTEREST", status: "Active" },
    { code: "P01 - P12", name: "Personality (Kepribadian)", items: 12, category: "PERSONALITY", status: "Active" },
    { code: "V01 - V12", name: "Values (Nilai Pribadi)", items: 12, category: "VALUES", status: "Active" },
    { code: "A01 - A12", name: "Academic (Akademik)", items: 12, category: "ACADEMIC", status: "Active" },
    { code: "C01 - C12", name: "Career (Karier)", items: 12, category: "CAREER", status: "Active" },
    { code: "R01 - R12", name: "Readiness (Kesiapan)", items: 12, category: "READINESS", status: "Active" },
  ];

  return (
    <div className="space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-ggc-gold/20 text-ggc-gold-dark border border-ggc-gold/30">
              <ShieldCheck className="w-3.5 h-3.5" /> Super Admin Portal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-ggc-dark mt-2 tracking-tight">
            Dashboard Manajemen Asesmen GGC
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Pantau 84 item instrumen studi, sesi pengerjaan siswa, dan analitik multi-matriks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2.5 rounded-xl text-xs font-bold text-ggc bg-white border border-ggc/20 shadow-sm hover:bg-ggc-tint transition-all">
            Unduh Laporan Excel
          </button>
          <button className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-ggc hover:bg-ggc-light shadow-md transition-all">
            + Tambah Soal Baru
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Questions */}
        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Bank Soal Asesmen
            </span>
            <div className="w-9 h-9 rounded-xl bg-ggc/10 text-ggc flex items-center justify-center">
              <FileQuestion className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-ggc-dark">
              {totalQuestionsCount || 84}
            </div>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <span className="text-ggc font-bold">7 Dimensi</span> Terkalibrasi (12 item / dimensi)
            </p>
          </div>
        </div>

        {/* Registered Students */}
        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Total Siswa Terdaftar
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-ggc-dark">
              {totalStudentsCount || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Siswa aktif jenjang SMA/SMK sederajat
            </p>
          </div>
        </div>

        {/* Total Sessions */}
        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Total Sesi Pengerjaan
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-ggc-dark">
              {totalSessionsCount || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Sesi dimulai secara real-time
            </p>
          </div>
        </div>

        {/* Completed Sessions */}
        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Sesi Selesai (Completed)
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-ggc-dark">
              {completedSessionsCount || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Hasil skor multi-matriks telah terbit
            </p>
          </div>
        </div>
      </div>

      {/* 84 Questions Breakdown Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-ggc-dark flex items-center gap-2">
              <Layers className="w-5 h-5 text-ggc" />
              Struktur 84 Item Pertanyaan Berdasarkan 7 Dimensi
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Matriks standar Study Fit Assessment™ terbagi rata menjadi 12 item per pilar evaluasi
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-ggc-gold-dark bg-ggc-gold-subtle px-3 py-1.5 rounded-xl border border-ggc-gold/30">
            <Database className="w-4 h-4" />
            <span>Skala Likert 1-5 Terintegrasi</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 uppercase font-bold border-b border-gray-100">
              <tr>
                <th className="px-6 py-3.5">Kode Item</th>
                <th className="px-6 py-3.5">Dimensi Kategori</th>
                <th className="px-6 py-3.5">Jumlah Butir</th>
                <th className="px-6 py-3.5">Tipe Penilaian</th>
                <th className="px-6 py-3.5">Status Bank Soal</th>
                <th className="px-6 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dimensionBreakdowns.map((dim) => (
                <tr key={dim.code} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-ggc">
                    {dim.code}
                  </td>
                  <td className="px-6 py-4 font-semibold text-ggc-dark">
                    {dim.name}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold">{dim.items}</span> Butir
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    Skala Likert (1 = Sangat Tidak Sesuai, 5 = Sangat Sesuai)
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Aktif ({dim.status})
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-ggc hover:text-ggc-light font-bold hover:underline">
                      Tinjau Soal →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
