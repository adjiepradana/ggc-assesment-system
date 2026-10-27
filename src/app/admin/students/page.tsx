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
  RotateCcw,
  UserX,
  UserCheck,
  AlertTriangle,
  X,
  ShieldAlert,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

interface StudentItem {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  school: string;
  grade: string;
  isActive?: boolean;
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

  // Modal Action States
  const [resetModalStudent, setResetModalStudent] = useState<StudentItem | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const [toggleActiveModalStudent, setToggleActiveModalStudent] = useState<StudentItem | null>(null);
  const [isTogglingActive, setIsTogglingActive] = useState(false);

  // Toast State
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const loadStudents = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/admin/students?status=${statusFilter}&search=${encodeURIComponent(searchQuery)}`
      );
      const json = await res.json();
      if (json.success) {
        setStudents(json.students || []);
      } else {
        showToast(json.error || "Gagal memuat data siswa.", "error");
      }
    } catch (err) {
      console.error("Error loading students:", err);
      showToast("Gagal terhubung ke server.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [statusFilter]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (resetModalStudent && !isResetting) setResetModalStudent(null);
        if (toggleActiveModalStudent && !isTogglingActive) setToggleActiveModalStudent(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [resetModalStudent, toggleActiveModalStudent, isResetting, isTogglingActive]);

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
      showToast("Berkas Excel rekap peserta berhasil diunduh.");
    } catch (err: any) {
      showToast(err.message || "Gagal mengunduh Excel.", "error");
    } finally {
      setIsExporting(false);
    }
  };

  // --------------------------------------------------------------------------
  // Action Handler: Reset Sesi (Clear answers and set IN_PROGRESS)
  // --------------------------------------------------------------------------
  const handleConfirmResetSession = async () => {
    if (!resetModalStudent) return;
    setIsResetting(true);

    try {
      const res = await fetch("/api/admin/students", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RESET_SESSION",
          studentId: resetModalStudent.id,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal mereset sesi siswa.");
      }

      showToast(json.message || "Sesi siswa berhasil di-reset ke status Berjalan.");
      setResetModalStudent(null);
      loadStudents();
    } catch (err: any) {
      showToast(err.message || "Gagal mereset sesi.", "error");
    } finally {
      setIsResetting(false);
    }
  };

  // --------------------------------------------------------------------------
  // Action Handler: Cabut Akses / Soft Delete & Restore
  // --------------------------------------------------------------------------
  const handleConfirmToggleActive = async () => {
    if (!toggleActiveModalStudent) return;
    setIsTogglingActive(true);

    try {
      const res = await fetch("/api/admin/students", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "TOGGLE_ACTIVE",
          studentId: toggleActiveModalStudent.id,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal memperbarui status hak akses siswa.");
      }

      showToast(json.message || "Status akses akun siswa berhasil diperbarui.");
      setToggleActiveModalStudent(null);
      loadStudents();
    } catch (err: any) {
      showToast(err.message || "Gagal memperbarui status akses.", "error");
    } finally {
      setIsTogglingActive(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 animate-slide-up-sheet">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold border ${
              toastMessage.type === "success"
                ? "bg-emerald-900 text-white border-emerald-700 ring-2 ring-emerald-500/20"
                : "bg-red-900 text-white border-red-700 ring-2 ring-red-500/20"
            }`}
          >
            {toastMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-ggc-gold" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-300" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-[#103D2B]">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-[#A0B9AE] hover:text-ggc dark:hover:text-ggc-gold transition-colors bg-white dark:bg-[#07261B] px-3 py-1.5 rounded-xl border border-gray-200 dark:border-[#103D2B] shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Admin Dashboard</span>
            </Link>
            <span className="text-xs text-gray-400">/</span>
            <span className="text-xs font-semibold text-ggc-dark dark:text-ggc-gold">Data Partisipan</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-ggc-dark dark:text-white mt-2 tracking-tight">
            Manajemen & Rekapitulasi Data Siswa
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-[#A0B9AE] mt-1">
            Kelola profil peserta, atur status hak akses akun (Cabut/Pulihkan), reset sesi ujian jika ada kendala teknis, dan unduh dokumen PDF resmi.
          </p>
        </div>

        <button
          onClick={handleExportExcel}
          disabled={isExporting}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-ggc dark:text-emerald-300 bg-white dark:bg-[#07261B] border border-ggc/30 dark:border-[#103D2B] shadow-sm hover:bg-ggc-subtle dark:hover:bg-[#0C3E2B] transition-all disabled:opacity-60 self-start sm:self-auto cursor-pointer"
        >
          {isExporting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-ggc dark:text-ggc-gold" />
              <span>Memproses Excel...</span>
            </>
          ) : (
            <>
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Unduh Rekap Excel (.xlsx)</span>
            </>
          )}
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#07261B] border border-gray-200 dark:border-[#103D2B] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-[#041B12] p-1 rounded-xl text-xs font-bold w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === "ALL"
                ? "bg-white dark:bg-[#07261B] text-ggc-dark dark:text-ggc-gold font-bold shadow-2xs"
                : "text-gray-500 dark:text-[#A0B9AE] hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Semua Siswa
          </button>
          <button
            onClick={() => setStatusFilter("COMPLETED")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === "COMPLETED"
                ? "bg-white dark:bg-[#07261B] text-emerald-700 dark:text-emerald-400 font-bold shadow-2xs"
                : "text-gray-500 dark:text-[#A0B9AE] hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Selesai (Completed)
          </button>
          <button
            onClick={() => setStatusFilter("IN_PROGRESS")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === "IN_PROGRESS"
                ? "bg-white dark:bg-[#07261B] text-amber-700 dark:text-amber-400 font-bold shadow-2xs"
                : "text-gray-500 dark:text-[#A0B9AE] hover:text-gray-900 dark:hover:text-white"
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
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-[#103D2B] bg-white dark:bg-[#041B12] text-gray-800 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-ggc"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </form>
      </div>

      {/* Students Data Table */}
      <div className="bg-white dark:bg-[#07261B] rounded-3xl border border-gray-200/90 dark:border-[#103D2B] shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-gray-400 dark:text-[#A0B9AE]">
            <RefreshCw className="w-7 h-7 animate-spin mx-auto mb-2.5 text-ggc dark:text-ggc-gold" />
            <span>Memuat data peserta...</span>
          </div>
        ) : students.length === 0 ? (
          <div className="py-20 text-center text-xs text-gray-500 dark:text-[#A0B9AE]">
            <GraduationCap className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Tidak Ada Siswa Ditemukan</p>
            <p className="mt-1 max-w-sm mx-auto">
              Tidak ada data siswa yang cocok dengan kriteria pencarian &ldquo;{searchQuery}&rdquo;.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-[#052016] text-gray-600 dark:text-[#A0B9AE] uppercase font-bold border-b border-gray-100 dark:border-[#0E3827]">
                <tr>
                  <th className="px-5 py-3.5">Partisipan & Akun</th>
                  <th className="px-5 py-3.5">Asal Sekolah</th>
                  <th className="px-5 py-3.5">Status Asesmen</th>
                  <th className="px-5 py-3.5">Potential Signature</th>
                  <th className="px-5 py-3.5">Rekomendasi Utama</th>
                  <th className="px-5 py-3.5 text-right min-w-[200px]">Aksi Manajemen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#0E3827]">
                {students.map((stu) => {
                  const sess = stu.session;
                  const isCompleted = sess?.status === "COMPLETED";
                  const isInProgress = sess?.status === "IN_PROGRESS";
                  const isAccountActive = stu.isActive !== false;

                  return (
                    <tr key={stu.id} className="hover:bg-gray-50/80 dark:hover:bg-[#093525] transition-colors">
                      {/* Name & Account Status */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-ggc-dark dark:text-white text-sm">
                            {stu.name}
                          </span>
                          {!isAccountActive && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-red-100 text-red-800 border border-red-300 dark:bg-red-950/80 dark:text-red-300 dark:border-red-800/40">
                              Dicabut
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                          <Mail className="w-3 h-3" />
                          <span>{stu.email}</span>
                        </div>
                        {stu.phoneNumber !== "-" && (
                          <div className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                            <Phone className="w-3 h-3" />
                            <span>{stu.phoneNumber}</span>
                          </div>
                        )}
                      </td>

                      {/* School & Grade */}
                      <td className="px-5 py-4">
                        <div className="font-semibold text-gray-800 dark:text-[#E8F1EC]">{stu.school}</div>
                        <div className="text-[11px] text-gray-400 dark:text-gray-500">{stu.grade}</div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        {isCompleted ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/40">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Selesai (84/84)
                            </span>
                            {sess?.completedAt && (
                              <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                                {new Date(sess.completedAt).toLocaleDateString("id-ID")}
                              </div>
                            )}
                          </div>
                        ) : isInProgress ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/40">
                              <Clock className="w-3 h-3 text-amber-600" /> Berjalan ({sess?.answeredCount}/84)
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 dark:bg-[#082E20] text-gray-600 dark:text-[#A0B9AE] border border-gray-200 dark:border-[#103D2B]">
                            Belum Mulai
                          </span>
                        )}
                      </td>

                      {/* Potential Signature */}
                      <td className="px-5 py-4">
                        {sess?.topSignature && sess.topSignature !== "-" && sess.topSignature !== "Belum Melakukan Asesmen" ? (
                          <span className="font-bold text-ggc dark:text-ggc-gold">
                            {sess.topSignature}
                          </span>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500 italic">Belum dihitung</span>
                        )}
                      </td>

                      {/* Major Match */}
                      <td className="px-5 py-4">
                        {sess?.topMajor && sess.topMajor !== "-" ? (
                          <div>
                            <div className="font-semibold text-gray-800 dark:text-[#E8F1EC]">{sess.topMajor}</div>
                            {sess.fitScore > 0 && (
                              <span className="text-[10px] font-bold text-ggc-gold-dark dark:text-ggc-gold">
                                Fit: {sess.fitScore}%
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500 italic">-</span>
                        )}
                      </td>

                      {/* Action Buttons Column */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* 1. Action: Reset Sesi (Only for students with sessions) */}
                          <button
                            type="button"
                            onClick={() => setResetModalStudent(stu)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800/40 transition-colors"
                            title="Reset Sesi Asesmen (Hapus jawaban & kembalikan ke 0/84)"
                          >
                            <RotateCcw className="w-3 h-3 text-amber-600" />
                            <span>Reset</span>
                          </button>

                          {/* 2. Action: Cabut Akses (Soft Delete / Ban) / Pulihkan Akses */}
                          {isAccountActive ? (
                            <button
                              type="button"
                              onClick={() => setToggleActiveModalStudent(stu)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/60 hover:bg-red-100 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-800/40 transition-colors"
                              title="Cabut Akses Siswa (Blokir Login)"
                            >
                              <UserX className="w-3 h-3 text-red-600" />
                              <span>Cabut</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setToggleActiveModalStudent(stu)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/40 transition-colors"
                              title="Pulihkan Akses Akun Siswa (Buka Blokir)"
                            >
                              <UserCheck className="w-3 h-3 text-emerald-600" />
                              <span>Pulihkan</span>
                            </button>
                          )}

                          {/* 3. Action: Tinjau Web & Unduh PDF (If session exists) */}
                          {sess && (
                            <>
                              <Link
                                href={`/student/results/${sess.id}`}
                                target="_blank"
                                className="p-1.5 text-gray-500 hover:text-ggc dark:hover:text-ggc-gold hover:bg-gray-100 dark:hover:bg-[#041B12] rounded-lg transition-colors"
                                title="Tinjau Laporan Web"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>

                              <a
                                href={`/api/assessment/results/${sess.id}/pdf`}
                                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-ggc-dark dark:text-ggc-gold bg-ggc-gold/20 dark:bg-ggc-gold/25 hover:bg-ggc-gold/40 dark:hover:bg-ggc-gold/35 border border-ggc-gold/40 dark:border-ggc-gold/40 rounded-lg transition-colors"
                                title="Unduh PDF Resmi"
                              >
                                <Download className="w-3 h-3 text-ggc-gold-dark dark:text-ggc-gold" />
                                <span className="hidden xl:inline">PDF</span>
                              </a>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= MODAL: RESET SESI CONFIRMATION ================= */}
      {resetModalStudent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn"
          role="dialog"
          aria-modal="true"
          style={{ overscrollBehavior: "contain" }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !isResetting) setResetModalStudent(null);
          }}
        >
          <div className="bg-white dark:bg-[#062419] rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-amber-400 dark:border-amber-600 text-gray-900 dark:text-white animate-scale-in text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
              <RotateCcw className="w-6 h-6" />
            </div>

            <h3 className="text-base font-black text-gray-900 dark:text-white">
              Reset Sesi Asesmen Siswa?
            </h3>

            <div className="mt-2 p-3 bg-amber-50 dark:bg-[#082618] rounded-xl border border-amber-200 dark:border-amber-900/60 text-left text-xs space-y-1">
              <div>
                <strong>Siswa:</strong> {resetModalStudent.name} ({resetModalStudent.email})
              </div>
              <div>
                <strong>Sekolah:</strong> {resetModalStudent.school}
              </div>
              <div>
                <strong>Status Saat Ini:</strong> {resetModalStudent.session?.status || "Belum Mulai"} ({resetModalStudent.session?.answeredCount || 0}/84 soal)
              </div>
            </div>

            <p className="text-xs text-gray-500 dark:text-[#A0B9AE] mt-3 leading-relaxed">
              ⚠️ <strong>Perhatian:</strong> Seluruh butir jawaban yang pernah diisi oleh siswa ini akan <strong>dibersihkan</strong>, dan status sesi dikembalikan ke <strong>Sedang Berjalan (IN_PROGRESS)</strong>. Gunakan fitur ini jika siswa mengalami kendala teknis dan perlu mengulang tes.
            </p>

            <div className="mt-5 flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setResetModalStudent(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-[#082E20] hover:bg-gray-200"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmResetSession}
                disabled={isResetting}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isResetting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RotateCcw className="w-4 h-4" />
                )}
                <span>{isResetting ? "Mereset..." : "Ya, Reset Sesi"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: TOGGLE ACTIVE (CABUT / PULIHKAN AKSES) ================= */}
      {toggleActiveModalStudent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn"
          role="dialog"
          aria-modal="true"
          style={{ overscrollBehavior: "contain" }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !isTogglingActive) setToggleActiveModalStudent(null);
          }}
        >
          <div className="bg-white dark:bg-[#062419] rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-red-400 dark:border-red-800 text-gray-900 dark:text-white animate-scale-in text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-400 flex items-center justify-center mx-auto mb-3">
              {toggleActiveModalStudent.isActive !== false ? (
                <UserX className="w-6 h-6" />
              ) : (
                <UserCheck className="w-6 h-6 text-emerald-600" />
              )}
            </div>

            <h3 className="text-base font-black text-gray-900 dark:text-white">
              {toggleActiveModalStudent.isActive !== false
                ? "Cabut Hak Akses Siswa?"
                : "Pulihkan Hak Akses Siswa?"}
            </h3>

            <div className="mt-2 p-3 bg-gray-50 dark:bg-[#041B12] rounded-xl border border-gray-200 dark:border-[#103D2B] text-left text-xs space-y-1">
              <div>
                <strong>Siswa:</strong> {toggleActiveModalStudent.name}
              </div>
              <div>
                <strong>Email:</strong> {toggleActiveModalStudent.email}
              </div>
              <div>
                <strong>Status Sekarang:</strong>{" "}
                {toggleActiveModalStudent.isActive !== false ? "Aktif" : "Dicabut / Nonaktif"}
              </div>
            </div>

            <p className="text-xs text-gray-500 dark:text-[#A0B9AE] mt-3 leading-relaxed">
              {toggleActiveModalStudent.isActive !== false ? (
                <span>
                  Ketika dicabut (Soft Delete), siswa akan <strong>diblokir dari login</strong> ke platform dengan pesan kesalahan: <em>&ldquo;Akses akun telah dicabut atau tidak valid.&rdquo;</em>
                </span>
              ) : (
                <span>
                  Siswa akan kembali diizinkan masuk (login) dan mengakses dashboard serta hasil asesmennya.
                </span>
              )}
            </p>

            <div className="mt-5 flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setToggleActiveModalStudent(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-[#082E20] hover:bg-gray-200"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmToggleActive}
                disabled={isTogglingActive}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 ${
                  toggleActiveModalStudent.isActive !== false
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {isTogglingActive ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : toggleActiveModalStudent.isActive !== false ? (
                  <UserX className="w-4 h-4" />
                ) : (
                  <UserCheck className="w-4 h-4" />
                )}
                <span>
                  {isTogglingActive
                    ? "Memproses..."
                    : toggleActiveModalStudent.isActive !== false
                    ? "Ya, Cabut Akses"
                    : "Ya, Pulihkan Akses"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
