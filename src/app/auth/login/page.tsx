"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import BrandLogo from "@/components/BrandLogo";
import {
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  GraduationCap,
  Sparkles,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

      // Check session to determine correct landing page if no explicit callback
      if (callbackUrl && callbackUrl !== "/") {
        router.push(callbackUrl);
      } else {
        router.refresh();
        router.push("/");
      }
    } catch (err) {
      console.error("Sign-in error:", err);
      setError("Terjadi kesalahan jaringan. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  const handleDemoFill = (role: "STUDENT" | "ADMIN") => {
    if (role === "STUDENT") {
      setEmail("student@ggc.id");
      setPassword("student123");
    } else {
      setEmail("admin@ggc.id");
      setPassword("admin123");
    }
    setError(null);
  };

  return (
    <div className="bg-white/95 backdrop-blur-lg py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-ggc-gold/30">
      {error && (
        <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-xs">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Field */}
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-bold text-ggc-dark mb-1.5"
          >
            Alamat Email
          </label>
          <div className="relative rounded-xl shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Mail className="h-4 w-4" />
            </div>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="block w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-ggc-tint/30 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ggc focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="password"
              className="block text-xs font-bold text-ggc-dark"
            >
              Kata Sandi
            </label>
          </div>
          <div className="relative rounded-xl shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Lock className="h-4 w-4" />
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="block w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-gray-200 bg-ggc-tint/30 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ggc focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-ggc hover:bg-ggc-light active:bg-ggc-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ggc shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Masuk ke Dashboard</span>
                <ArrowRight className="w-4 h-4 text-ggc-gold" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Demo Credentials Quick-Fill helper */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-ggc-gold" />
          <span>Autofill Akun Percobaan (Seed Demo)</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleDemoFill("STUDENT")}
            className="inline-flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-semibold bg-ggc/10 text-ggc hover:bg-ggc/20 border border-ggc/20 transition-colors"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Akun Siswa</span>
          </button>
          <button
            type="button"
            onClick={() => handleDemoFill("ADMIN")}
            className="inline-flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-semibold bg-ggc-gold/20 text-ggc-gold-dark hover:bg-ggc-gold/30 border border-ggc-gold/30 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Akun Admin</span>
          </button>
        </div>
      </div>

      {/* Register Link */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-600">
          Belum memiliki akun?{" "}
          <Link
            href="/auth/register"
            className="font-bold text-ggc hover:text-ggc-light underline"
          >
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-br from-ggc-dark via-ggc to-ggc-light relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-ggc-gold/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-block p-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 mb-3 shadow-lg">
            <BrandLogo variant="light" size="lg" href="/" />
          </div>
          <h2 className="mt-3 text-2xl sm:text-3xl font-black text-white tracking-tight">
            Selamat Datang Kembali
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-ggc-subtle/80">
            Masuk ke portal Study Fit Assessment™ Anda
          </p>
        </div>

        {/* Login Card with Suspense */}
        <div className="mt-8">
          <Suspense
            fallback={
              <div className="bg-white/95 backdrop-blur-lg p-10 rounded-3xl border border-ggc-gold/30 text-center">
                <div className="w-8 h-8 border-4 border-ggc border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-gray-500 font-medium">Memuat form login...</p>
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs text-ggc-subtle hover:text-white transition-colors"
          >
            ← Kembali ke Beranda GGC
          </Link>
        </div>
      </div>
    </div>
  );
}
