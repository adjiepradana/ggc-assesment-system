"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import BrandLogo from "@/components/BrandLogo";
import {
  CheckCircle2,
  AlertCircle,
  Lock,
  ArrowRight,
  Sparkles,
  Compass,
  Mail,
  ShieldCheck,
  Eye,
  EyeOff,
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

  // Form states for password setup
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    // Case 1: Just finished Midtrans payment redirect (?payment=success)
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
          throw new Error(data.error || "Tautan verifikasi tidak valid.");
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

  const handleActivateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (password.length < 6) {
      setError("Kata sandi minimal harus 6 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal mengaktifkan akun.");
      }

      setSubmitSuccess(true);

      // Auto sign-in
      if (verifiedData?.email) {
        const loginRes = await signIn("credentials", {
          redirect: false,
          email: verifiedData.email,
          password,
        });

        if (loginRes?.ok) {
          router.push("/student/assessment");
          return;
        }
      }

      // Fallback
      router.push("/auth/login?verified=true");
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat mengaktifkan akun.");
      setIsSubmitting(false);
    }
  };

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

  // State B: Midtrans Payment Finished Notice (Waiting for Email Magic Link)
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
            Sistem kami telah mengonfirmasi pembayaran Anda. <strong>Tautan verifikasi dan magic link akses asesmen</strong> telah dikirimkan secara otomatis ke kotak masuk email Anda.
          </p>

          <div className="my-6 p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-left flex items-start gap-3">
            <Mail className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
              <span className="font-bold">Langkah Selanjutnya:</span>
              <p className="mt-0.5 text-amber-800 dark:text-amber-300">
                Buka email dari <strong>Go Great Career</strong> dan klik tombol <em>&ldquo;Verifikasi Email & Mulai Asesmen&rdquo;</em> untuk langsung mengerjakan tes. (Periksa juga folder Spam/Promotions jika belum muncul).
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/auth/login"
              className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-xs text-white bg-ggc hover:bg-ggc-light transition-all shadow-md cursor-pointer"
            >
              <span>Halaman Masuk</span>
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
              href="/auth/login"
              className="py-3 px-6 rounded-xl font-bold text-xs text-white bg-ggc hover:bg-ggc-light transition-all cursor-pointer"
            >
              Coba Masuk ke Akun
            </Link>
            <Link
              href="/"
              className="py-3 px-6 rounded-xl font-bold text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#082E20] transition-all cursor-pointer"
            >
              Halaman Utama
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // State D: Verified -> Set Password & Start Assessment
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-ggc-tint dark:bg-[#031810] text-gray-900 dark:text-white transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-[#062419] rounded-[2.5rem] p-8 sm:p-10 shadow-2xl border border-ggc-gold/40 relative overflow-hidden transition-colors">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-950/80 dark:to-emerald-900/40 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mx-auto mb-4 border border-emerald-300 dark:border-emerald-800/40 shadow-sm">
            <ShieldCheck className="w-8 h-8 text-ggc dark:text-emerald-400" />
          </div>
          <span className="text-[11px] font-bold text-ggc-gold-dark dark:text-ggc-gold uppercase tracking-wider px-3 py-1 rounded-full bg-ggc-gold/15 dark:bg-ggc-gold/25 border border-ggc-gold/30 inline-block mb-2">
            Email Terverifikasi Resmi
          </span>
          <h1 className="text-2xl font-black text-ggc-dark dark:text-white">
            Selamat Datang, {verifiedData?.name}!
          </h1>
          <p className="text-xs text-gray-500 dark:text-[#A0B9AE] mt-1">
            Akun Anda ({verifiedData?.email}) telah aktif. Buat kata sandi pribadi Anda untuk mulai mengerjakan asesmen.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleActivateAccount} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">
              Kata Sandi Baru *
            </label>
            <div className="relative rounded-xl shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full pl-9 pr-10 py-2.5 sm:py-3 rounded-xl border border-gray-300 dark:border-[#11402E] bg-white dark:bg-[#031810] text-base sm:text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-ggc focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">
              Konfirmasi Kata Sandi *
            </label>
            <div className="relative rounded-xl shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi kata sandi di atas"
                className="w-full pl-9 pr-4 py-2.5 sm:py-3 rounded-xl border border-gray-300 dark:border-[#11402E] bg-white dark:bg-[#031810] text-base sm:text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-ggc focus:outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-xs text-ggc-dark bg-gradient-to-r from-[#E6D5A8] via-ggc-gold to-ggc-gold-dark hover:shadow-lg active:scale-98 transition-all disabled:opacity-60 cursor-pointer shadow-md"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-ggc-dark border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Simpan Kata Sandi & Mulai Asesmen</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
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
