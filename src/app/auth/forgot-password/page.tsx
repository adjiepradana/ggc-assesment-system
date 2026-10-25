"use client";

import React, { useState } from "react";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  KeyRound,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Mohon masukkan alamat email akun Anda.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError("Format alamat email tidak valid.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal mengirimkan tautan pemulihan.");
      }

      setIsSuccess(true);
    } catch (err: any) {
      console.error("Forgot password error:", err);
      setError(err?.message || "Terjadi kesalahan koneksi. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F8F5] dark:bg-[#031810] text-gray-900 dark:text-white p-4 sm:p-6 lg:p-8 relative overflow-hidden selection:bg-ggc selection:text-white">
      {/* Background Decorative Ambient Glows */}
      <div
        className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-[#C5A869]/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-[#0B4632]/15 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="w-full max-w-md relative z-10">
        {/* Card Container */}
        <div className="bg-white/95 dark:bg-[#06291C]/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-200/80 dark:border-[#0B4632]/80 transition-all">
          {/* Brand Logo & Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <BrandLogo size="md" href="/" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0B4632]/10 dark:bg-emerald-950/60 border border-[#0B4632]/20 dark:border-emerald-700/50 text-[11px] font-bold text-[#0B4632] dark:text-[#C5A869] uppercase tracking-wider mb-2">
              <KeyRound className="w-3.5 h-3.5 text-[#C5A869]" />
              <span>Pemulihan Akun</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Lupa Kata Sandi?
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1.5 leading-relaxed">
              Masukkan alamat email Anda yang terdaftar. Kami akan mengirimkan tautan aman untuk mengatur ulang kata sandi.
            </p>
          </div>

          {/* Success State View */}
          {isSuccess ? (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto mb-3 shadow-xs">
                  <CheckCircle2 className="w-6 h-6 text-[#0B4632] dark:text-[#C5A869]" />
                </div>
                <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                  Tautan Pemulihan Dikirim!
                </h3>
                <p className="text-xs text-emerald-800/90 dark:text-emerald-300/90 mt-2 leading-relaxed">
                  Jika alamat <span className="font-mono font-bold text-gray-900 dark:text-white">{email}</span> terdaftar di sistem kami, instruksi pemulihan telah dikirim.
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-3 pt-3 border-t border-emerald-200/60 dark:border-emerald-800/60">
                  💡 Periksa kotak masuk dan folder spam email Anda dalam 1-2 menit ke depan. Tautan berlaku selama 1 jam.
                </p>
              </div>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => setIsSuccess(false)}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-[#0B4632] dark:text-[#C5A869] bg-[#0B4632]/5 dark:bg-white/5 hover:bg-[#0B4632]/10 transition-colors"
                >
                  Kirim Ulang ke Email Lain
                </button>

                <Link
                  href="/auth/login"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-bold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Kembali ke Halaman Masuk</span>
                </Link>
              </div>
            </div>
          ) : (
            /* Request Form */
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

              {/* Email Input */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-bold text-gray-800 dark:text-gray-200 mb-1.5"
                >
                  Alamat Email Terdaftar
                </label>
                <div className="relative rounded-2xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    spellCheck="false"
                    inputMode="email"
                    enterKeyHint="send"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="block w-full pl-10 pr-4 py-3 text-sm rounded-2xl border border-gray-200 dark:border-[#11402E] bg-gray-50/70 dark:bg-[#031810] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B4632] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Submit Button (Forest Emerald to Champagne Gold Gradient) */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-[#0B4632] via-[#156247] to-[#C5A869] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0B4632] shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Kirim Tautan Pemulihan</span>
                    <ArrowRight className="w-4 h-4 text-[#F5E8C7]" />
                  </>
                )}
              </button>

              {/* Back to Login Link */}
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
          )}

          {/* Security Footer Notice */}
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-[#0B4632]/50 flex items-center justify-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C5A869]" />
            <span>Dilindungi Protokol Enkripsi Aman GGC™</span>
          </div>
        </div>
      </div>
    </div>
  );
}
