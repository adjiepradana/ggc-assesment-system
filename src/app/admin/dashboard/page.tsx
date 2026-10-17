"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  FileQuestion,
  Users,
  CheckCircle2,
  Clock,
  Layers,
  Download,
  Search,
  Filter,
  FileSpreadsheet,
  Plus,
  ExternalLink,
  ChevronRight,
  Sparkles,
  RefreshCw,
  School,
  GraduationCap,
  ArrowUpRight,
  Award,
  FileCode,
  X,
  Copy,
  Check,
} from "lucide-react";

interface StudentItem {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  school: string;
  grade: string;
  session: {
    id: string;
    status: string;
    startedAt: string;
    completedAt: string | null;
    answeredCount: number;
    topSignature: string;
    topMajor: string;
    fitScore: number;
  } | null;
  createdAt: string;
}

interface AdminStats {
  totalStudents: number;
  activeSessions: number;
  completedSessions: number;
  totalQuestions: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats>({
    totalStudents: 0,
    activeSessions: 0,
    completedSessions: 0,
    totalQuestions: 84,
  });
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [schoolFilter, setSchoolFilter] = useState<string>("ALL");
  const [isExporting, setIsExporting] = useState(false);

  // Modal JSON Viewer
  const [activeJsonData, setActiveJsonData] = useState<any | null>(null);
  const [loadingJson, setLoadingJson] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  // Fetch Students & Stats
  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/admin/students?status=${statusFilter}&search=${encodeURIComponent(searchQuery)}`
      );
      const json = await res.json();
      if (json.success) {
        setStudents(json.students || []);
        if (json.stats) {
          setStats(json.stats);
        }
      }
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  // Distinct school list
  const uniqueSchools = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      if (s.school && s.school !== "-") set.add(s.school);
    });
    return Array.from(set);
  }, [students]);

  // Filtered students by school
  const displayedStudents = useMemo(() => {
    if (schoolFilter === "ALL") return students;
    return students.filter((s) => s.school === schoolFilter);
  }, [students, schoolFilter]);

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      const res = await fetch("/api/admin/export");
      if (!res.ok) throw new Error("Gagal mengekspor data Excel.");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `GGC_Study_Fit_Rekap_Peserta_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(err.message || "Gagal mengunduh file Excel.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleViewJson = async (sessionId: string) => {
    try {
      setLoadingJson(true);
      setActiveJsonData(null);
      setCopiedJson(false);
      const res = await fetch(`/api/assessment/results/${sessionId}`);
      const json = await res.json();
      setActiveJsonData(json);
    } catch (err) {
      alert("Gagal memuat rincian skor JSON.");
    } finally {
      setLoadingJson(false);
    }
  };

  const handleCopyJson = () => {
    if (!activeJsonData) return;
    navigator.clipboard.writeText(JSON.stringify(activeJsonData, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const dimensionBreakdowns = [
    { code: "T01 - T12", name: "Talent (Bakat)", items: 12, category: "TALENT" },
    { code: "I01 - I12", name: "Interest (Minat)", items: 12, category: "INTEREST" },
    { code: "P01 - P12", name: "Personality (Kepribadian)", items: 12, category: "PERSONALITY" },
    { code: "V01 - V12", name: "Values (Nilai Pribadi)", items: 12, category: "VALUES" },
    { code: "A01 - A12", name: "Academic (Akademik)", items: 12, category: "ACADEMIC" },
    { code: "C01 - C12", name: "Career (Karier)", items: 12, category: "CAREER" },
    { code: "R01 - R12", name: "Readiness (Kesiapan)", items: 12, category: "READINESS" },
  ];

  return (
    <div className="space-y-8 pb-16">
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
            Pantau rekapitulasi data peserta, hasil multi-matriks siswa, dan manajemen 84 butir soal.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportExcel}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-ggc bg-white border border-ggc/30 shadow-sm hover:bg-ggc-subtle transition-all disabled:opacity-60"
          >
            {isExporting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-ggc" />
                <span>Memproses Excel...</span>
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Ekspor Excel (.xlsx)</span>
              </>
            )}
          </button>

          <Link
            href="/admin/questions"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-ggc hover:bg-ggc-light shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4 text-ggc-gold" />
            <span>Kelola Bank Soal</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Registered Students */}
        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow transition-shadow">
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
              {stats.totalStudents}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Partisipan aktif jenjang SMA/SMK sederajat
            </p>
          </div>
        </div>

        {/* Total Active Sessions */}
        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Sesi Sedang Berjalan
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-amber-700">
              {stats.activeSessions}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Siswa sedang mengisi lembar asesmen
            </p>
          </div>
        </div>

        {/* Completed Assessments */}
        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Asesmen Selesai (Completed)
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-emerald-700">
              {stats.completedSessions}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Laporan kecocokan studi telah terbit
            </p>
          </div>
        </div>

        {/* Total Questions in Bank */}
        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow transition-shadow">
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
              {stats.totalQuestions}
            </div>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <span className="text-ggc font-bold">7 Dimensi</span> (12 butir per dimensi)
            </p>
          </div>
        </div>
      </div>

      {/* STUDENT MANAGEMENT & RESULTS RECAP TABLE */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Table Controls & Filter Bar */}
        <div className="p-6 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-ggc-dark flex items-center gap-2">
              <Users className="w-5 h-5 text-ggc" />
              Rekapitulasi Partisipan Asesmen & Hasil Multi-Matriks
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Daftar seluruh siswa, status pengerjaan 84 butir, unduh laporan PDF resmi, dan rincian skor JSON
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* School Filter Dropdown */}
            <div className="relative">
              <select
                value={schoolFilter}
                onChange={(e) => setSchoolFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs bg-gray-50 font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-ggc"
              >
                <option value="ALL">Semua Sekolah ({uniqueSchools.length})</option>
                {uniqueSchools.map((sch) => (
                  <option key={sch} value={sch}>
                    {sch}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-medium">
              <button
                onClick={() => setStatusFilter("ALL")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  statusFilter === "ALL"
                    ? "bg-white text-ggc-dark font-bold shadow-xs"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setStatusFilter("COMPLETED")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  statusFilter === "COMPLETED"
                    ? "bg-white text-emerald-700 font-bold shadow-xs"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Selesai
              </button>
              <button
                onClick={() => setStatusFilter("IN_PROGRESS")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  statusFilter === "IN_PROGRESS"
                    ? "bg-white text-amber-700 font-bold shadow-xs"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Berjalan
              </button>
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari siswa, email..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-ggc w-40 sm:w-52"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
            </form>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-12 text-center text-xs text-gray-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-ggc" />
              <span>Memuat data siswa...</span>
            </div>
          ) : displayedStudents.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-500">
              Tidak ada data siswa yang cocok dengan filter atau sekolah terpilih.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 uppercase font-bold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3.5">Nama & Kontak Siswa</th>
                  <th className="px-6 py-3.5">Sekolah / Jenjang</th>
                  <th className="px-6 py-3.5">Status Asesmen</th>
                  <th className="px-6 py-3.5">Top Potential Signature</th>
                  <th className="px-6 py-3.5">Rekomendasi Jurusan</th>
                  <th className="px-6 py-3.5 text-right">Aksi Laporan & Skor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayedStudents.map((stu) => {
                  const sess = stu.session;
                  const isCompleted = sess?.status === "COMPLETED";
                  const isInProgress = sess?.status === "IN_PROGRESS";

                  return (
                    <tr key={stu.id} className="hover:bg-gray-50/80 transition-colors">
                      {/* Name & Contact */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-ggc-dark">{stu.name}</div>
                        <div className="text-[11px] text-gray-400 mt-0.5">{stu.email}</div>
                        {stu.phoneNumber !== "-" && (
                          <div className="text-[10px] text-gray-400">{stu.phoneNumber}</div>
                        )}
                      </td>

                      {/* School & Grade */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-800">{stu.school}</div>
                        <div className="text-[11px] text-gray-400">{stu.grade}</div>
                      </td>

                      {/* Session Status */}
                      <td className="px-6 py-4">
                        {isCompleted ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Selesai (84/84)
                            </span>
                            {sess?.completedAt && (
                              <div className="text-[10px] text-gray-400 mt-1">
                                {new Date(sess.completedAt).toLocaleDateString("id-ID")}
                              </div>
                            )}
                          </div>
                        ) : isInProgress ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600" /> Sedang Mengisi ({sess?.answeredCount}/84)
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600">
                            Belum Memulai
                          </span>
                        )}
                      </td>

                      {/* Potential Signature */}
                      <td className="px-6 py-4">
                        {sess?.topSignature && sess.topSignature !== "-" ? (
                          <span className="font-bold text-ggc">
                            {sess.topSignature}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">Belum tersedia</span>
                        )}
                      </td>

                      {/* Top Major & Fit Score */}
                      <td className="px-6 py-4">
                        {sess?.topMajor && sess.topMajor !== "-" ? (
                          <div>
                            <div className="font-semibold text-gray-800">{sess.topMajor}</div>
                            {sess.fitScore > 0 && (
                              <span className="text-[10px] font-bold text-ggc-gold-dark">
                                Fit Score: {sess.fitScore}%
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">-</span>
                        )}
                      </td>

                      {/* Action Buttons: Web Report, PDF, and Detailed JSON Scores */}
                      <td className="px-6 py-4 text-right">
                        {sess ? (
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View Web Report */}
                            <Link
                              href={`/student/results/${sess.id}`}
                              target="_blank"
                              className="p-1.5 text-gray-500 hover:text-ggc hover:bg-ggc-subtle rounded-lg transition-colors"
                              title="Buka Laporan Hasil Web"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>

                            {/* View Detailed JSON Scores Modal */}
                            <button
                              onClick={() => handleViewJson(sess.id)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition-colors"
                              title="Tinjau Skor Detail JSON"
                            >
                              <FileCode className="w-3 h-3 text-gray-600" />
                              <span>JSON</span>
                            </button>

                            {/* Download PDF Button */}
                            <a
                              href={`/api/assessment/results/${sess.id}/pdf`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-ggc-dark bg-ggc-gold/20 hover:bg-ggc-gold/40 border border-ggc-gold/40 rounded-lg transition-colors"
                              title="Unduh PDF Resmi"
                            >
                              <Download className="w-3 h-3 text-ggc-gold-dark" />
                              <span>PDF</span>
                            </a>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-[11px]">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* QUESTION BANK SUMMARY TABLE */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-ggc-dark flex items-center gap-2">
              <Layers className="w-5 h-5 text-ggc" />
              Struktur Bank Soal Berdasarkan 7 Dimensi Penilaian
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              84 Butir instrumen skala Likert 1-5 dikelompokkan secara seimbang (12 butir / pilar)
            </p>
          </div>

          <Link
            href="/admin/questions"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-ggc hover:text-ggc-light transition-colors"
          >
            <span>Buka Question Bank CMS Lengkap</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 uppercase font-bold border-b border-gray-100">
              <tr>
                <th className="px-6 py-3.5">Kode Item</th>
                <th className="px-6 py-3.5">Dimensi Kategori</th>
                <th className="px-6 py-3.5">Jumlah Butir</th>
                <th className="px-6 py-3.5">Metode Penilaian</th>
                <th className="px-6 py-3.5">Status Bank</th>
                <th className="px-6 py-3.5 text-right">Kelola Soal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dimensionBreakdowns.map((dim) => (
                <tr key={dim.code} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-3.5 font-mono font-bold text-ggc">
                    {dim.code}
                  </td>
                  <td className="px-6 py-3.5 font-bold text-ggc-dark">
                    {dim.name}
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="font-bold">{dim.items}</span> Butir Instrumen
                  </td>
                  <td className="px-6 py-3.5 text-gray-500">
                    Skala Likert (1 = Sangat Tidak Sesuai, 5 = Sangat Sesuai)
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Aktif (Ready)
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <Link
                      href={`/admin/questions?category=${dim.category}`}
                      className="text-ggc hover:text-ggc-light font-bold hover:underline"
                    >
                      Buka Butir Soal →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL DETAILED JSON SCORES VIEWER ================= */}
      {(activeJsonData || loadingJson) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-ggc-gold/30 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-3">
              <div>
                <h3 className="text-base font-black text-ggc-dark flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-ggc" />
                  Rincian Skor & Analitik Multi-Matriks (JSON)
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Siswa: {activeJsonData?.student?.name || "Memuat..."} • Sesi: {activeJsonData?.session?.id || "-"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {activeJsonData && (
                  <button
                    onClick={handleCopyJson}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                  >
                    {copiedJson ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-gray-500" />
                        <span>Salin JSON</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={() => setActiveJsonData(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-sm"
                >
                  ✕
                </button>
              </div>
            </div>

            {loadingJson ? (
              <div className="py-16 text-center text-xs text-gray-500">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-ggc" />
                <span>Memuat skor JSON...</span>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto bg-slate-900 text-emerald-400 p-4 rounded-2xl font-mono text-xs leading-relaxed border border-slate-800">
                <pre>{JSON.stringify(activeJsonData, null, 2)}</pre>
              </div>
            )}

            <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
              <span>Endpoint: /api/assessment/results/[sessionId]</span>
              <button
                onClick={() => setActiveJsonData(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-ggc hover:bg-ggc-light"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
