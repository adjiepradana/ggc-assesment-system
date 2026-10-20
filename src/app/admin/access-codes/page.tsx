"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  KeyRound,
  Plus,
  Download,
  Copy,
  Check,
  Search,
  Filter,
  Trash2,
  RefreshCw,
  ArrowLeft,
  Sparkles,
  Ticket,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  AlertCircle,
  X,
} from "lucide-react";

interface AccessCodeItem {
  id: string;
  code: string;
  status: "AVAILABLE" | "USED";
  createdAt: string;
  usedAt: string | null;
  usedByUser: {
    id: string;
    email: string;
    name: string;
    school: string;
    grade: string;
  } | null;
}

interface StatsData {
  total: number;
  available: number;
  used: number;
}

export default function AccessCodesPage() {
  const [codes, setCodes] = useState<AccessCodeItem[]>([]);
  const [stats, setStats] = useState<StatsData>({ total: 0, available: 0, used: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "AVAILABLE" | "USED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modal Generator States
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [generateCount, setGenerateCount] = useState<number>(10);
  const [codePrefix, setCodePrefix] = useState<string>("GGC-");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResultModal, setGeneratedResultModal] = useState<string[] | null>(null);
  const [batchCopied, setBatchCopied] = useState(false);

  // Delete modal state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast state
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const loadCodes = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/admin/access-codes?status=${statusFilter}&search=${encodeURIComponent(searchQuery)}`
      );
      const json = await res.json();
      if (json.success) {
        setCodes(json.codes || []);
        if (json.stats) {
          setStats(json.stats);
        }
      } else {
        showToast(json.error || "Gagal memuat daftar kode akses.", "error");
      }
    } catch (err: any) {
      console.error("Error loading access codes:", err);
      showToast("Gagal terhubung ke server.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCodes();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadCodes();
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      showToast(`Kode ${code} disalin ke clipboard!`);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      showToast("Gagal menyalin kode.", "error");
    }
  };

  const handleGenerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const res = await fetch("/api/admin/access-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          count: generateCount,
          prefix: codePrefix,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Gagal men-generate kode akses.");
      }

      setIsGenerateModalOpen(false);
      setGeneratedResultModal(json.codes || []);
      showToast(json.message || "Berhasil membuat kode baru!");
      loadCodes();
    } catch (err: any) {
      showToast(err.message || "Gagal memproses pembuatan kode.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyAllGenerated = async () => {
    if (!generatedResultModal) return;
    try {
      const text = generatedResultModal.join("\n");
      await navigator.clipboard.writeText(text);
      setBatchCopied(true);
      showToast("Semua kode disalin! Siap dipaste ke Lynk.id.");
      setTimeout(() => setBatchCopied(false), 3000);
    } catch {
      showToast("Gagal menyalin kumpulan kode.", "error");
    }
  };

  const handleDeleteCode = async (id: string) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/access-codes?id=${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal menghapus kode akses.");
      }
      showToast(json.message || "Kode akses berhasil dihapus.");
      setDeletingId(null);
      loadCodes();
    } catch (err: any) {
      showToast(err.message || "Gagal menghapus kode.", "error");
    } finally {
      setIsDeleting(false);
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-[#103D2B]">
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
            <span className="text-xs font-semibold text-ggc-dark dark:text-ggc-gold">
              Kode Akses Lynk.id
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-ggc-dark dark:text-white mt-2 tracking-tight flex items-center gap-2.5">
            <KeyRound className="w-7 h-7 text-ggc dark:text-ggc-gold" />
            <span>Manajemen Kode Akses Satu Kali Pakai</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-[#A0B9AE] mt-1">
            Generate kode unik 8-karakter untuk pembeli di platform <strong>Lynk.id</strong>. Satu kode menjamin akses pendaftaran untuk satu akun siswa.
          </p>
        </div>

        {/* Action Buttons Top */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
          {/* Lynk.id Raw Text Download */}
          <a
            href="/api/admin/access-codes/export?lynk=true&status=AVAILABLE"
            download
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-ggc dark:text-emerald-300 bg-white dark:bg-[#07261B] hover:bg-gray-50 dark:hover:bg-[#0C3E2B] border border-gray-200 dark:border-[#103D2B] shadow-xs transition-all"
            title="Download list kode tersedia dalam format TXT untuk dipaste ke Lynk.id"
          >
            <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">List TXT (Lynk.id)</span>
          </a>

          {/* Export CSV / Excel */}
          <a
            href="/api/admin/access-codes/export?format=xlsx"
            download
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-ggc dark:text-emerald-300 bg-white dark:bg-[#07261B] hover:bg-gray-50 dark:hover:bg-[#0C3E2B] border border-gray-200 dark:border-[#103D2B] shadow-xs transition-all"
            title="Download rekap data lengkap dalam format Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Rekap Excel</span>
          </a>

          {/* Generate Codes Primary Action */}
          <button
            type="button"
            onClick={() => setIsGenerateModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black text-ggc-dark bg-gradient-to-r from-[#E6D5A8] via-ggc-gold to-ggc-gold-dark hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Generate Kode Baru</span>
          </button>
        </div>
      </div>

      {/* 3 KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* KPI 1: Total Codes */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#07261B] border border-gray-200/90 dark:border-[#103D2B] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-500 dark:text-[#A0B9AE] uppercase tracking-wider block">
              Total Kode Digenerate
            </span>
            <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-1">
              {stats.total.toLocaleString("id-ID")}
            </div>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
              Seluruh riwayat batch voucher
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-ggc-subtle dark:bg-[#082E20] text-ggc dark:text-ggc-gold flex items-center justify-center shrink-0">
            <Ticket className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2: Available Codes */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#07261B] border border-emerald-200/90 dark:border-emerald-800/40 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
              Tersedia (Ready for Lynk.id)
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-800 dark:text-emerald-300 mt-1">
              {stats.available.toLocaleString("id-ID")}
            </div>
            <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
              Siap diunggah ke auto-responder Lynk.id
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3: Used Codes */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#07261B] border border-amber-200/90 dark:border-amber-800/40 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider block">
              Terpakai (Siswa Terdaftar)
            </span>
            <div className="text-2xl sm:text-3xl font-black text-amber-900 dark:text-amber-300 mt-1">
              {stats.used.toLocaleString("id-ID")}
            </div>
            <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 mt-0.5">
              {stats.total > 0 ? `${Math.round((stats.used / stats.total) * 100)}% aktivasi` : "0% aktivasi"}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#07261B] border border-gray-200 dark:border-[#103D2B] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-[#041B12] p-1 rounded-xl text-xs font-bold w-full sm:w-auto">
          {(
            [
              { key: "ALL", label: `Semua (${stats.total})` },
              { key: "AVAILABLE", label: `Tersedia (${stats.available})` },
              { key: "USED", label: `Terpakai (${stats.used})` },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setStatusFilter(item.key)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === item.key
                  ? "bg-white dark:bg-[#07261B] text-ggc-dark dark:text-ggc-gold font-bold shadow-2xs"
                  : "text-gray-500 dark:text-[#A0B9AE] hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Live Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kode, nama siswa, email..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-[#103D2B] bg-white dark:bg-[#041B12] text-gray-800 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-ggc"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </form>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-[#07261B] rounded-3xl border border-gray-200/90 dark:border-[#103D2B] shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-gray-400 dark:text-[#A0B9AE]">
            <RefreshCw className="w-7 h-7 animate-spin mx-auto mb-2.5 text-ggc dark:text-ggc-gold" />
            <span>Memuat data kode akses...</span>
          </div>
        ) : codes.length === 0 ? (
          <div className="py-20 text-center text-xs text-gray-500 dark:text-[#A0B9AE]">
            <Ticket className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Belum Ada Kode Akses</p>
            <p className="mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `Tidak ada kode yang cocok dengan kata kunci "${searchQuery}".`
                : "Klik tombol 'Generate Kode Baru' di atas untuk membuat voucher pertama."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-[#052016] text-gray-600 dark:text-[#A0B9AE] uppercase font-bold border-b border-gray-100 dark:border-[#0E3827]">
                <tr>
                  <th className="px-6 py-3.5">Kode Akses</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Digunakan Oleh</th>
                  <th className="px-6 py-3.5">Tanggal Dibuat</th>
                  <th className="px-6 py-3.5">Tanggal Terpakai</th>
                  <th className="px-6 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#0E3827]">
                {codes.map((item) => {
                  const isAvailable = item.status === "AVAILABLE";
                  const isCopied = copiedCode === item.code;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50/80 dark:hover:bg-[#093525] transition-colors"
                    >
                      {/* Code Pill & Copy Button */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-black text-ggc-dark dark:text-white px-2.5 py-1 rounded-xl bg-gray-100 dark:bg-[#041B12] border border-gray-200 dark:border-[#103D2B] tracking-wider select-all">
                            {item.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(item.code)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-ggc dark:hover:text-ggc-gold hover:bg-gray-100 dark:hover:bg-[#07261B] transition-colors"
                            title="Salin Kode"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {isAvailable ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            TERSEDIA
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 dark:bg-[#082E20] text-gray-600 dark:text-[#A0B9AE] border border-gray-200 dark:border-[#103D2B]">
                            <Check className="w-3 h-3 text-gray-400" />
                            TERPAKAI
                          </span>
                        )}
                      </td>

                      {/* Used by user details */}
                      <td className="px-6 py-4">
                        {item.usedByUser ? (
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white">
                              {item.usedByUser.name}
                            </div>
                            <div className="text-[11px] text-gray-500 dark:text-[#A0B9AE]">
                              {item.usedByUser.email}
                            </div>
                            <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                              {item.usedByUser.school} • {item.usedByUser.grade}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500 italic">-</span>
                        )}
                      </td>

                      {/* Created At */}
                      <td className="px-6 py-4 text-gray-600 dark:text-[#C7DCD2]">
                        <div>
                          {new Date(item.createdAt).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                        <div className="text-[10px] text-gray-400 dark:text-gray-500">
                          {new Date(item.createdAt).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>

                      {/* Used At */}
                      <td className="px-6 py-4 text-gray-600 dark:text-[#C7DCD2]">
                        {item.usedAt ? (
                          <div>
                            <div>
                              {new Date(item.usedAt).toLocaleDateString("id-ID", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </div>
                            <div className="text-[10px] text-gray-400 dark:text-gray-500">
                              {new Date(item.usedAt).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500 italic">-</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 text-right">
                        {isAvailable ? (
                          <button
                            type="button"
                            onClick={() => setDeletingId(item.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                            title="Hapus Kode Akses ini"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-gray-400 font-mono">Terkunci</span>
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

      {/* ================= MODAL: GENERATOR DIALOG ================= */}
      {isGenerateModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-[#062419] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-ggc-gold/40 text-gray-900 dark:text-white animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-[#0E4230]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-ggc text-ggc-gold flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-ggc-dark dark:text-white">
                    Generate Kode Akses Baru
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-[#A0B9AE]">
                    Buat kode unik 8 karakter untuk Lynk.id
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGenerateModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#082E20] text-gray-500 hover:text-gray-800 dark:hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGenerateSubmit} className="mt-4 space-y-4">
              {/* Quick Count Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-[#C7DCD2] mb-2">
                  Jumlah Kode yang Dibuat
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[10, 50, 100].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setGenerateCount(num)}
                      className={`py-2.5 rounded-xl text-xs font-black border transition-all ${
                        generateCount === num
                          ? "bg-ggc text-white border-ggc shadow-sm ring-2 ring-ggc-gold/40"
                          : "bg-gray-50 dark:bg-[#041B12] text-gray-700 dark:text-[#A0B9AE] border-gray-200 dark:border-[#103D2B] hover:border-ggc"
                      }`}
                    >
                      +{num} Kode
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Count */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-[#C7DCD2] mb-1">
                  Atau Jumlah Kustom (1 - 500):
                </label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={generateCount}
                  onChange={(e) => setGenerateCount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-[#103D2B] bg-white dark:bg-[#041B12] text-sm font-bold text-ggc-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-ggc"
                />
              </div>

              {/* Prefix Option */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-[#C7DCD2] mb-1">
                  Awalan / Prefix (Opsional):
                </label>
                <input
                  type="text"
                  value={codePrefix}
                  onChange={(e) => setCodePrefix(e.target.value.toUpperCase())}
                  placeholder="Misal: GGC-"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-[#103D2B] bg-white dark:bg-[#041B12] text-sm font-mono font-bold uppercase text-ggc-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-ggc"
                />
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                  Contoh hasil kode: <strong className="font-mono text-ggc dark:text-ggc-gold">{codePrefix || ""}A8K29F4X</strong>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-[#082E20] hover:bg-gray-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-6 py-2.5 rounded-xl text-xs font-black text-ggc-dark bg-gradient-to-r from-[#E6D5A8] via-ggc-gold to-ggc-gold-dark hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-ggc-dark" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-ggc-dark" />
                  )}
                  <span>Buat {generateCount} Kode</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: GENERATION SUCCESS & BATCH COPY ================= */}
      {generatedResultModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-[#062419] rounded-3xl max-w-lg w-full p-6 shadow-2xl border-2 border-ggc-gold/60 text-gray-900 dark:text-white animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-[#0E4230]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  ✓
                </div>
                <div>
                  <h3 className="text-base font-black text-ggc-dark dark:text-white">
                    {generatedResultModal.length} Kode Berhasil Dibuat!
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-[#A0B9AE]">
                    Siap diunggah ke Lynk.id Auto-Responder
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setGeneratedResultModal(null)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#082E20] text-gray-500 hover:text-gray-800 dark:hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable list of generated codes */}
            <div className="mt-4 p-3 bg-gray-50 dark:bg-[#041B12] rounded-2xl border border-gray-200 dark:border-[#103D2B] max-h-56 overflow-y-auto font-mono text-xs space-y-1">
              {generatedResultModal.map((code, idx) => (
                <div
                  key={code}
                  className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-white dark:hover:bg-[#07261B]"
                >
                  <span className="font-bold text-ggc-dark dark:text-ggc-gold">{code}</span>
                  <span className="text-[10px] text-gray-400">#{idx + 1}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-[#0E4230] flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleCopyAllGenerated}
                className="w-full sm:w-auto flex-1 py-2.5 px-4 rounded-xl text-xs font-black text-ggc-dark bg-gradient-to-r from-[#E6D5A8] via-ggc-gold to-ggc-gold-dark hover:shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                {batchCopied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-800" />
                    <span>Semua Kode Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-ggc-dark" />
                    <span>Salin Semua Kode (1 Per Baris)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setGeneratedResultModal(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-ggc hover:bg-ggc-light transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: DELETE CONFIRMATION ================= */}
      {deletingId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-[#062419] rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-red-200 dark:border-red-900/50 text-gray-900 dark:text-white animate-scale-in text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-gray-900 dark:text-white">
              Hapus Kode Akses Ini?
            </h3>
            <p className="text-xs text-gray-500 dark:text-[#A0B9AE] mt-1.5 leading-relaxed">
              Kode akses yang belum digunakan akan dihapus secara permanen dari basis data dan tidak dapat dipakai lagi.
            </p>

            <div className="mt-5 flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-[#082E20] hover:bg-gray-200"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleDeleteCode(deletingId)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-all disabled:opacity-50"
              >
                {isDeleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
