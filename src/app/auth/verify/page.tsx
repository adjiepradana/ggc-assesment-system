"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";
import {
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Compass,
  Mail,
  ShieldCheck,
  GraduationCap,
} from "lucide-react";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token");
  const paymentStatus = searchParams.get("payment");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verifiedData, setVerifiedData] = useState<{ email: string; name: string } | null>(null);

  useEffect(() => {
    // Case 1: Midtrans payment redirect (?payment=success)
    if (paymentStatus === "success" && !token) {
      setLoading(false);
      return;
    }

    // Case 2: Opening verification token from email (?token=...)
    if (!token) {
      setError("Token verifikasi tidak ditemukan. Pastikan Anda membuka tautan resmi dari email Anda.");
      setLoading(false);
      return;
    }

    async function checkToken() {
      try {
        setLoading(true);
        const res = await fetch(`/api/auth/verify?token=${encodeURIComponent(token!)}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Tautan verifikasi tidak valid atau telah kadaluarsa.");
        }

        setVerifiedData({
          email: data.email,
          name: data.name,
        });
      } catch (err: any) {
        setError(err.message || "Gagal memverifikasi token.");
      } finally {
        setLoading(false);
      }
    }

    checkToken();
  }, [token, paymentStatus]);

  // State A: Loading
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-ggc-tint dark:bg-[#031810] text-gray-900 dark:text-white transition-colors">
        <div className="w-16 h-16 rounded-3xl bg-ggc text-ggc-gold flex items-center justify-center animate-spin shadow-xl">
          <Compass className="w-8 h-8" />
        </div>
        <p className="mt-4 text-xs font-bold uppercase tracking-widest text-ggc dark:text-ggc-gold">
          Memverifikasi Keabsahan Tiket Asesmen...
        </p>
      </div>
    );
  }

  // State B: Midtrans Payment Finished Notice (Waiting for Email Verification)
  if (paymentStatus === "success" && !token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-ggc-tint dark:bg-[#031810] text-gray-900 dark:text-white transition-colors">
        <div className="max-w-lg w-full bg-white dark:bg-[#062419] rounded-[2.5rem] p-8 sm:p-12 shadow-2xl border border-ggc-gold/40 text-center relative overflow-hidden transition-colors">
          <div className="w-20 h-20 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mx-auto mb-6 shadow-inner border border-emerald-300 dark:border-emerald-800/40">
            <CheckCircle2 className="w-10 h-10 stroke-[2.2]" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-ggc-gold/15 dark:bg-ggc-gold/25 text-ggc-gold-dark dark:text-ggc-gold text-xs font-bold uppercase tracking-wider mb-3 border border-ggc-gold/30">
            <Sparkles className="w-3.5 h-3.5" /> Pembayaran Terkonfirmasi
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-ggc-dark dark:text-white tracking-tight">
            Transaksi Midtrans Berhasil!
          </h1>

          <p className="mt-3 text-xs sm:text-sm text-gray-600 dark:text-[#A0B9AE] leading-relaxed">
            Sistem kami telah mengonfirmasi pembayaran Anda. <strong>Tautan verifikasi resmi</strong> telah otomatis dikirimkan ke kotak masuk email Anda.
          </p>

          <div className="my-6 p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-left flex items-start gap-3">
            <Mail className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
              <span className="font-bold">Langkah Selanjutnya:</span>
              <p className="mt-0.5 text-amber-800 dark:text-amber-300">
                Buka email dari <strong>Go Great Career</strong> dan klik tombol <em>&ldquo;Verifikasi Email & Mulai Asesmen&rdquo;</em> untuk membuka kunci asesmen. (Periksa juga folder Spam/Promotions jika belum muncul).
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/student/dashboard"
              className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-xs text-white bg-ggc hover:bg-ggc-light transition-all shadow-md cursor-pointer"
            >
              <span>Ke Dashboard Siswa</span>
              <ArrowRight className="w-4 h-4 text-ggc-gold" />
            </Link>
            <Link
              href="/"
              className="flex-1 inline-flex items-center justify-center py-3.5 px-6 rounded-xl font-bold text-xs text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-[#082E20] hover:bg-gray-200 dark:hover:bg-[#0C3E2B] transition-all cursor-pointer border border-transparent dark:border-[#103D2B]"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // State C: Token Error
  if (error && !verifiedData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-ggc-tint dark:bg-[#031810] text-gray-900 dark:text-white transition-colors">
        <div className="max-w-md w-full bg-white dark:bg-[#062419] rounded-[2.5rem] p-8 shadow-2xl border border-red-200 dark:border-red-900/50 text-center transition-colors">
          <div className="w-16 h-16 rounded-3xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white">Verifikasi Gagal</h2>
          <p className="text-xs text-gray-600 dark:text-[#A0B9AE] mt-2 leading-relaxed">{error}</p>
          <div className="mt-6 flex flex-col gap-2">
            <Link
              href="/student/dashboard"
              className="py-3 px-6 rounded-xl font-bold text-xs text-white bg-ggc hover:bg-ggc-light transition-all cursor-pointer"
            >
              Ke Dashboard Siswa
            </Link>
            <Link
              href="/auth/login"
              className="py-3 px-6 rounded-xl font-bold text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#082E20] transition-all cursor-pointer"
            >
              Halaman Masuk
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // State D: Verification Succeeded! Display Unlocked Success View
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-ggc-tint dark:bg-[#031810] text-gray-900 dark:text-white transition-colors">
      <div className="max-w-lg w-full bg-white dark:bg-[#062419] rounded-[2.5rem] p-8 sm:p-12 shadow-2xl border-2 border-ggc-gold/50 text-center relative overflow-hidden transition-colors">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100/40 dark:bg-emerald-900/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-100 via-emerald-200 to-emerald-100 dark:from-emerald-950 dark:via-[#093d2b] dark:to-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mx-auto mb-6 shadow-inner border border-emerald-300 dark:border-emerald-800/40 animate-scale-in">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 stroke-[2.3]" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-ggc-gold/15 dark:bg-ggc-gold/25 text-ggc-gold-dark dark:text-ggc-gold text-xs font-bold uppercase tracking-wider mb-3 border border-ggc-gold/30">
          <Sparkles className="w-3.5 h-3.5" /> Akun Terverifikasi Penuh
        </span>

        <h1 className="text-2xl sm:text-3xl font-black text-ggc-dark dark:text-white tracking-tight">
          Email Terverifikasi! Asesmen Anda Kini Telah Terbuka
        </h1>

        <p className="mt-3 text-xs sm:text-sm text-gray-600 dark:text-[#A0B9AE] leading-relaxed max-w-md mx-auto">
          Halo <strong>{verifiedData?.name}</strong>, alamat email Anda (<strong>{verifiedData?.email}</strong>) telah berhasil diverifikasi secara resmi. Tiket pengerjaan 84 butir soal multi-matriks kini telah aktif dan siap dikerjakan.
        </p>

        {/* Feature summary pills */}
        <div className="my-6 p-4 rounded-2xl bg-emerald-50/70 dark:bg-[#031810] border border-emerald-200/80 dark:border-[#11402E] text-left flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>84 Butir Soal Multi-Matriks Bebas Tekanan (15-20 Menit)</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Kalkulasi Keselarasan Jurusan & Kampus PTN/PTS</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Laporan PDF Resmi Siap Cetak untuk Diskusi Orang Tua</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href="/student/assessment"
            className="flex-1 inline-flex items-center justify-center gap-2.5 py-4 px-6 rounded-xl font-black text-sm text-ggc-dark bg-gradient-to-r from-[#E6D5A8] via-ggc-gold to-ggc-gold-dark hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-lg"
          >
            <span>Mulai Asesmen Sekarang</span>
            <ArrowRight className="w-4 h-4 text-ggc-dark" />
          </Link>
          <Link
            href="/student/dashboard"
            className="inline-flex items-center justify-center py-4 px-6 rounded-xl font-bold text-xs text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-[#082E20] hover:bg-gray-200 dark:hover:bg-[#0C3E2B] transition-all cursor-pointer border border-transparent dark:border-[#103D2B]"
          >
            Ke Dashboard Siswa
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-ggc-tint dark:bg-[#031810]">
          <div className="w-12 h-12 rounded-2xl bg-ggc text-ggc-gold flex items-center justify-center animate-spin">
            <Compass className="w-6 h-6" />
          </div>
        </div>
      }
    >
      <VerifyContent />
    </React.Suspense>
  );
}