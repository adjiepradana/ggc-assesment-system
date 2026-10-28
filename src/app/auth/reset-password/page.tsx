"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  KeyRound,
} from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // If token is missing from URL query string
  if (!token) {
    return (
      <div className="text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-gray-900 dark:text-white">
          Tautan Pemulihan Tidak Lengkap
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed max-w-sm mx-auto">
          Tautan pemulihan kata sandi tidak memiliki token valid. Silakan ajukan ulang permohonan pemulihan kata sandi.
        </p>
        <div className="pt-2">
          <Link
            href="/auth/forgot-password"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0B4632] hover:bg-[#063424] transition-colors"
          >
            <span>Ajukan Tautan Baru</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#C5A869]" />
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password || password.length < 8) {
      setError("Kata sandi baru minimal 8 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi kata sandi tidak cocok. Mohon periksa kembali.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          newPassword: password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal memperbarui kata sandi.");
      }

      setIsSuccess(true);
    } catch (err: any) {
      console.error("Reset password error:", err);
      setError(err?.message || "Terjadi kesalahan internal. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center space-y-5 animate-in fade-in duration-300">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-6 h-6 text-[#0B4632] dark:text-[#C5A869]" />
        </div>
        <div>
          <h3 className="text-base font-black text-gray-900 dark:text-white">
            Kata Sandi Berhasil Diperbarui!
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1.5 leading-relaxed">
            Akun Anda telah diamankan dengan kata sandi baru. Silakan masuk kembali ke platform GGC.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/auth/login"
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-2xl text-xs font-bold text-ggc-dark bg-gradient-to-r from-[#E6D5A8] via-[#C5A869] to-[#9A7D3E] hover:shadow-lg transition-all"
          >
            <span>Masuk ke Akun Sekarang</span>
            <ArrowRight className="w-4 h-4 text-ggc-dark" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && (
        <div
          className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 flex items-start gap-2.5 text-red-800 dark:text-red-300 text-xs shadow-xs"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
          <span className="leading-relaxed font-medium">{error}</span>
        </div>
      )}

      {/* New Password Input */}
      <div>
        <label
          htmlFor="new-password"
          className="block text-xs font-bold text-gray-800 dark:text-gray-200 mb-1.5"
        >
          Kata Sandi Baru
        </label>
        <div className="relative rounded-2xl shadow-xs">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <Lock className="h-4 w-4" />
          </div>
          <input
            id="new-password"
            name="newPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimal 8 karakter"
            className="block w-full pl-10 pr-11 py-3 text-sm rounded-2xl border border-gray-200 dark:border-[#11402E] bg-gray-50/70 dark:bg-[#031810] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B4632] focus:border-transparent transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
            aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Confirm Password Input */}
      <div>
        <label
          htmlFor="confirm-password"
          className="block text-xs font-bold text-gray-800 dark:text-gray-200 mb-1.5"
        >
          Konfirmasi Kata Sandi Baru
        </label>
        <div className="relative rounded-2xl shadow-xs">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <Lock className="h-4 w-4" />
          </div>
          <input
            id="confirm-password"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Ulangi kata sandi baru"
            className="block w-full pl-10 pr-11 py-3 text-sm rounded-2xl border border-gray-200 dark:border-[#11402E] bg-gray-50/70 dark:bg-[#031810] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B4632] focus:border-transparent transition-all"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
            aria-label={showConfirmPassword ? "Sembunyikan konfirmasi" : "Tampilkan konfirmasi"}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Submit Button (Champagne Gold) */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-2xl text-sm font-bold text-ggc-dark bg-gradient-to-r from-[#E6D5A8] via-[#C5A869] to-[#9A7D3E] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C5A869] shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer mt-2"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-ggc-dark border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <span>Simpan & Masuk</span>
            <ArrowRight className="w-4 h-4 text-ggc-dark" />
          </>
        )}
      </button>

      {/* Back to Login */}
      <div className="text-center pt-2">
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-[#0B4632] dark:hover:text-[#C5A869] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Halaman Masuk</span>
        </Link>
      </div>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F8F5] dark:bg-[#031810] text-gray-900 dark:text-white p-4 sm:p-6 lg:p-8 relative overflow-hidden selection:bg-ggc selection:text-white">
      {/* Background Decorative Ambient Glows */}
      <div
        className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-[#C5A869]/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-[#0B4632]/15 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/95 dark:bg-[#06291C]/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-200/80 dark:border-[#0B4632]/80 transition-all">
          {/* Brand Logo & Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <BrandLogo size="md" href="/" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C5A869]/15 dark:bg-[#C5A869]/20 border border-[#C5A869]/30 text-[11px] font-bold text-ggc-gold-dark dark:text-[#C5A869] uppercase tracking-wider mb-2">
              <KeyRound className="w-3.5 h-3.5 text-[#C5A869]" />
              <span>Pembaruan Kata Sandi</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Atur Kata Sandi Baru
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1.5 leading-relaxed">
              Buat kata sandi baru yang kuat untuk mengakses akun dan laporan hasil asesmen Anda.
            </p>
          </div>

          <Suspense
            fallback={
              <div className="py-12 flex justify-center">
                <div className="w-6 h-6 border-2 border-[#0B4632] border-t-transparent rounded-full animate-spin" />
              </div>
            }
          >
            <ResetPasswordForm />
          </Suspense>

          {/* Security Footer Notice */}
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-[#0B4632]/50 flex items-center justify-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C5A869]" />
            <span>Enkripsi Kredensial Standar Industri</span>
          </div>
        </div>
      </div>
    </div>
  );
}
