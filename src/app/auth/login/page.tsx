"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import BrandLogo from "@/components/BrandLogo";
import {
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  Compass,
  CheckCircle2,
  Layers,
  Award,
  Receipt,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const { data: session, status } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // If already authenticated, redirect directly to appropriate dashboard
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      if (callbackUrl && callbackUrl !== "/" && !callbackUrl.includes("/auth/")) {
        router.replace(callbackUrl);
      } else if (session.user.role === "ADMIN") {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/student/dashboard");
      }
    }
  }, [status, session, callbackUrl, router]);

  // Phase 2.5: Detect forced logout / revoked session query parameter
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "SessionRevoked") {
      setError(
        "Sesi login Anda telah berakhir atau hak akses akun telah dinonaktifkan oleh administrator. Silakan hubungi admin atau login kembali."
      );
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: email.trim(),
        password,
      });

      if (res?.error) {
        setError(res.error || "Email atau kata sandi tidak valid.");
        setIsLoading(false);
        return;
      }

      // Fetch the updated session directly to route by role immediately
      const sessionRes = await fetch("/api/auth/session");
      const sessionData = await sessionRes.json();
      const userRole = sessionData?.user?.role;

      if (callbackUrl && callbackUrl !== "/" && !callbackUrl.includes("/auth/")) {
        router.push(callbackUrl);
      } else if (userRole === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/student/dashboard");
      }
      router.refresh();
    } catch (err) {
      console.error("Sign-in error:", err);
      setError("Terjadi kesalahan jaringan. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {error && (
        <div
          className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-xs shadow-xs"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
          <span className="leading-relaxed font-medium">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Email Field */}
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-bold text-gray-800 dark:text-gray-200 mb-1.5"
          >
            Alamat Email Akun
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
              enterKeyHint="next"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="block w-full pl-10 pr-4 py-3 text-base sm:text-sm rounded-2xl border border-gray-200 dark:border-[#11402E] bg-gray-50/50 dark:bg-[#031810] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ggc focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="password"
              className="block text-xs font-bold text-gray-800 dark:text-gray-200"
            >
              Kata Sandi
            </label>
          </div>
          <div className="relative rounded-2xl shadow-xs">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Lock className="h-4 w-4" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              enterKeyHint="done"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="block w-full pl-10 pr-11 py-3 text-base sm:text-sm rounded-2xl border border-gray-200 dark:border-[#11402E] bg-gray-50/50 dark:bg-[#031810] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ggc focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
              aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <div className="flex justify-end mt-2">
            <Link
              href="/auth/forgot-password"
              className="text-xs font-semibold text-ggc dark:text-ggc-gold hover:text-ggc-light dark:hover:text-ggc-gold-light transition-colors"
            >
              Lupa Kata Sandi?
            </Link>
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-2xl text-sm font-bold text-ggc-dark bg-gradient-to-r from-[#E6D5A8] via-ggc-gold to-ggc-gold-dark hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ggc shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-ggc-dark border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Masuk ke Dashboard</span>
                <ArrowRight className="w-4 h-4 text-ggc-dark" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Track Order Direct Link (Phase 2.4 - User closed tab before auto-login) */}
      <div className="mt-5 p-3 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/50 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <Receipt className="w-4 h-4 text-ggc-gold shrink-0" />
          <span className="text-gray-700 dark:text-[#C7DCD2] font-medium truncate">
            Sudah bayar tapi tab tertutup?
          </span>
        </div>
        <Link
          href="/order/track"
          className="font-bold text-ggc dark:text-ggc-gold hover:underline whitespace-nowrap ml-2 shrink-0"
        >
          Cek Status Pesanan &rarr;
        </Link>
      </div>

      {/* Register Link */}
      <div className="mt-4 text-center pt-1">
        <p className="text-xs text-gray-600 dark:text-[#A0B9AE]">
          Belum memiliki akun terdaftar?{" "}
          <Link
            href="/auth/register"
            className="font-bold text-ggc dark:text-ggc-gold hover:text-ggc-light underline decoration-ggc/30 underline-offset-4"
          >
            Daftar akun siswa sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-12 bg-[#F3F8F5] dark:bg-[#031810] text-gray-900 dark:text-white overflow-x-hidden selection:bg-ggc selection:text-white transition-colors">
      {/* ------------------------------------------------------------------ */}
      {/* LEFT COLUMN: BRAND SHOWCASE & SOCIAL PROOF (DESKTOP ONLY)          */}
      {/* ------------------------------------------------------------------ */}
      <div className="hidden lg:flex lg:col-span-5 xl:col-span-5 bg-emerald-luxury p-8 xl:p-14 text-white relative flex-col justify-between border-r border-ggc-gold/30 shadow-2xl overflow-hidden">
        {/* Background decorative atmosphere */}
        <div className="absolute inset-0 bg-dot-grid opacity-50 pointer-events-none" aria-hidden="true" />
        <div
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-ggc-gold/15 blur-3xl animate-float-slow pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-emerald-400/10 blur-3xl animate-float-reverse pointer-events-none"
          aria-hidden="true"
        />

        {/* Top: Brand Logo */}
        <div className="relative z-10">
          <BrandLogo variant="light" size="lg" href="/" />
          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] font-bold text-ggc-gold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-ggc-gold" />
            <span>Platform Evaluasi Minat, Bakat & Studi</span>
          </div>
        </div>

        {/* Middle: Value Proposition & Hero Highlights */}
        <div className="relative z-10 my-8 space-y-6">
          <div>
            <h1 className="font-display text-3xl xl:text-4xl font-black tracking-tight leading-tight">
              Discover Your Potential. <br />
              <span className="gold-gradient-text">Find Your Direction.</span>
            </h1>
            <p className="mt-3 text-xs xl:text-sm text-ggc-subtle/85 leading-relaxed">
              Platform diagnostik psikometrik 84-butir multi-matriks untuk memetakan kecocokan jurusan perguruan tinggi dan arah karier masa depan Anda.
            </p>
          </div>

          {/* 3 Core Highlights */}
          <div className="space-y-3.5">
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="w-8 h-8 rounded-xl bg-ggc-gold text-ggc-dark font-black flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Multi-Matrix Study Matching</h4>
                <p className="text-[11px] text-ggc-subtle/80 mt-0.5 leading-snug">
                  Mencocokkan profil personal bakat Anda terhadap benchmark 10+ program studi perguruan tinggi.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="w-8 h-8 rounded-xl bg-white/10 text-ggc-gold font-black flex items-center justify-center shrink-0 border border-white/20 mt-0.5">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">84 Butir Instrumen Objektif</h4>
                <p className="text-[11px] text-ggc-subtle/80 mt-0.5 leading-snug">
                  Evaluasi zero-bias yang mencakup 7 dimensi esensial mulai dari bakat hingga kesiapan kuliah.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="w-8 h-8 rounded-xl bg-white/10 text-ggc-gold font-black flex items-center justify-center shrink-0 border border-white/20 mt-0.5">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Laporan PDF Resmi Lengkap</h4>
                <p className="text-[11px] text-ggc-subtle/80 mt-0.5 leading-snug">
                  Rincian Potential Signature, skor kecocokan studi, serta analisis Strengths & Gaps.
                </p>
              </div>
            </div>
          </div>

          {/* Social Proof Quote Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-ggc-dark/80 to-ggc/80 border border-ggc-gold/30 text-xs shadow-lg">
            <p className="text-ggc-subtle/90 italic leading-relaxed">
              &ldquo;Hasil evaluasi GGC sangat membuka wawasan saya mengenai jurusan yang paling selaras dengan gaya belajar saya.&rdquo;
            </p>
            <div className="mt-2.5 flex items-center justify-between text-[11px]">
              <span className="font-bold text-white">Sheila Amanda</span>
              <span className="text-ggc-gold font-semibold">Siswi SMA Kelas 12</span>
            </div>
          </div>
        </div>

        {/* Bottom: Security & Trust Footer */}
        <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-ggc-subtle/70">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-ggc-gold" />
            <span>Enkripsi Sesi Aman</span>
          </div>
          <span>v1.0 • Standar GGC™</span>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* RIGHT COLUMN: LOGIN FORM CARD                                     */}
      {/* ------------------------------------------------------------------ */}
      <div className="col-span-12 lg:col-span-7 xl:col-span-7 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-12 relative min-h-screen">
        {/* Subtle decorative background blur for right side */}
        <div className="absolute top-10 right-10 w-72 h-72 bg-ggc-gold/10 dark:bg-ggc-gold/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-emerald-100/60 dark:bg-emerald-950/20 rounded-full blur-3xl pointer-events-none" />

        {/* Mobile Header (Hidden on Desktop) */}
        <div className="lg:hidden mb-6 text-center w-full max-w-md">
          <BrandLogo variant="dark" size="md" href="/" />
          <p className="mt-2 text-xs text-gray-500 dark:text-[#A0B9AE]">
            Platform Evaluasi Study Fit Assessment™
          </p>
        </div>

        {/* Main Card */}
        <div className="w-full max-w-md bg-white dark:bg-[#062419] rounded-[2.5rem] p-7 sm:p-10 shadow-xl border border-gray-200/80 dark:border-[#103D2B] relative z-10 transition-colors">
          {/* Form Header */}
          <div className="mb-6">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-ggc-gold-dark dark:text-ggc-gold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-ggc-gold-subtle dark:bg-ggc-gold/20 border border-ggc-gold/30 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" /> Portal Akun Pengguna
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-ggc-dark dark:text-white tracking-tight">
              Selamat Datang
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-[#A0B9AE] mt-1">
              Masuk untuk melanjutkan asesmen dan mengakses laporan hasil evaluasi Anda.
            </p>
          </div>

          {/* Login Form with Suspense */}
          <Suspense
            fallback={
              <div className="py-12 text-center">
                <div className="w-8 h-8 border-3 border-ggc border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Memuat form login...</p>
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </div>

        {/* Bottom Back to Home */}
        <div className="mt-6 text-center z-10">
          <Link
            href="/"
            className="text-xs font-semibold text-gray-500 dark:text-[#A0B9AE] hover:text-ggc dark:hover:text-ggc-gold transition-colors inline-flex items-center gap-1.5"
          >
            <span>← Kembali ke Halaman Utama</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
