"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Search,
  Filter,
  Download,
  ExternalLink,
  ArrowLeft,
  CheckCircle2,
  Clock,
  RefreshCw,
  FileSpreadsheet,
  School,
  Mail,
  Phone,
  Calendar,
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

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isExporting, setIsExporting] = useState(false);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/admin/students?status=${statusFilter}&search=${encodeURIComponent(searchQuery)}`
      );
      const json = await res.json();
      if (json.success) {
        setStudents(json.students || []);
      }
    } catch (err) {
      console.error("Error loading students:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadStudents();
  };

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      const res = await fetch("/api/admin/export");
      if (!res.ok) throw new Error("Gagal mengunduh berkas Excel.");

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
      alert(err.message || "Gagal mengunduh Excel.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-ggc transition-colors bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Admin Dashboard</span>
            </Link>
            <span className="text-xs text-gray-400">/</span>
            <span className="text-xs font-semibold text-ggc-dark">Data Peserta</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-ggc-dark mt-2 tracking-tight">
            Manajemen & Rekapitulasi Data Siswa
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Kelola profil peserta, pantau progres evaluasi 84 butir, dan akses dokumen laporan PDF resmi.
          </p>
        </div>

        <button
          onClick={handleExportExcel}
          disabled={isExporting}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-ggc bg-white border border-ggc/30 shadow-sm hover:bg-ggc-subtle transition-all disabled:opacity-60 self-start sm:self-auto"
        >
          {isExporting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-ggc" />
              <span>Memproses Excel...</span>
            </>
          ) : (
            <>
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Unduh Rekap Excel (.xlsx)</span>
            </>
          )}
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl text-xs font-medium w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === "ALL"
                ? "bg-white text-ggc-dark font-bold shadow-xs"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Semua Siswa
          </button>
          <button
            onClick={() => setStatusFilter("COMPLETED")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === "COMPLETED"
                ? "bg-white text-emerald-700 font-bold shadow-xs"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Selesai (Completed)
          </button>
          <button
            onClick={() => setStatusFilter("IN_PROGRESS")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === "IN_PROGRESS"
                ? "bg-white text-amber-700 font-bold shadow-xs"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Sedang Berjalan
          </button>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama siswa, sekolah, email..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-ggc"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </form>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-gray-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-ggc" />
            <span>Memuat data peserta...</span>
          </div>
        ) : students.length === 0 ? (
          <div className="py-16 text-center text-xs text-gray-500">
            Tidak ada siswa yang sesuai kriteria pencarian.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 uppercase font-bold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3.5">Partisipan</th>
                  <th className="px-6 py-3.5">Asal Sekolah</th>
                  <th className="px-6 py-3.5">Status Asesmen</th>
                  <th className="px-6 py-3.5">Top Potential Signature</th>
                  <th className="px-6 py-3.5">Rekomendasi Utama</th>
                  <th className="px-6 py-3.5 text-right">Laporan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((stu) => {
                  const sess = stu.session;
                  const isCompleted = sess?.status === "COMPLETED";
                  const isInProgress = sess?.status === "IN_PROGRESS";

                  return (
                    <tr key={stu.id} className="hover:bg-gray-50/80 transition-colors">
                      {/* Name & Contacts */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-ggc-dark text-sm">{stu.name}</div>
                        <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
                          <Mail className="w-3 h-3" />
                          <span>{stu.email}</span>
                        </div>
                        {stu.phoneNumber !== "-" && (
                          <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
                            <Phone className="w-3 h-3" />
                            <span>{stu.phoneNumber}</span>
                          </div>
                        )}
                      </td>

                      {/* School & Grade */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-800">{stu.school}</div>
                        <div className="text-[11px] text-gray-400">{stu.grade}</div>
                      </td>

                      {/* Status */}
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
                              <Clock className="w-3 h-3 text-amber-600" /> Berjalan ({sess?.answeredCount}/84)
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600">
                            Belum Mulai
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
                          <span className="text-gray-400 italic">Belum dihitung</span>
                        )}
                      </td>

                      {/* Major Match */}
                      <td className="px-6 py-4">
                        {sess?.topMajor && sess.topMajor !== "-" ? (
                          <div>
                            <div className="font-semibold text-gray-800">{sess.topMajor}</div>
                            {sess.fitScore > 0 && (
                              <span className="text-[10px] font-bold text-ggc-gold-dark">
                                Fit: {sess.fitScore}%
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">-</span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="px-6 py-4 text-right">
                        {sess ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/student/results/${sess.id}`}
                              target="_blank"
                              className="p-1.5 text-gray-500 hover:text-ggc hover:bg-ggc-subtle rounded-lg transition-colors"
                              title="Tinjau Laporan Web"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>

                            <a
                              href={`/api/assessment/results/${sess.id}/pdf`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-ggc-dark bg-ggc-gold/20 hover:bg-ggc-gold/40 border border-ggc-gold/40 rounded-lg transition-colors"
                              title="Unduh PDF Resmi"
                            >
                              <Download className="w-3 h-3 text-ggc-gold-dark" />
                              <span>Unduh PDF</span>
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
          </div>
        )}
      </div>
    </div>
  );
}
