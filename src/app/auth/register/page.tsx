"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import BrandLogo from "@/components/BrandLogo";
import {
  Lock,
  Mail,
  User,
  Phone,
  School,
  GraduationCap,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle,
  Sparkles,
  Compass,
  CheckCircle2,
  Layers,
  Award,
  ShieldCheck,
  KeyRound,
  Ticket,
} from "lucide-react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phoneNumber: "",
    schoolName: "",
    grade: "Kelas 12 SMA/SMK",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: formData.fullName.trim(),
          email: formData.email.trim(),
          password: formData.password,
          phone_number: formData.phoneNumber.trim(),
          school_name: formData.schoolName.trim(),
          grade: formData.grade,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal melakukan pendaftaran.");
      }

      setSuccess("Pendaftaran berhasil! Mengalihkan ke dashboard akun Anda...");

      // Automatically sign in the user
      const loginRes = await signIn("credentials", {
        redirect: false,
        email: formData.email.trim(),
        password: formData.password,
      });

      if (loginRes?.ok) {
        router.push("/student/dashboard");
      } else {
        router.push("/auth/login?registered=true");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-12 bg-[#F3F8F5] overflow-x-hidden selection:bg-ggc selection:text-white">
      {/* ------------------------------------------------------------------ */}
      {/* LEFT COLUMN: BRAND SHOWCASE & VALUE PROPOSITION (DESKTOP)          */}
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
            <span>Registrasi Akun Siswa Gratis</span>
          </div>
        </div>

        {/* Middle: Onboarding Guide & Benefit Highlights */}
        <div className="relative z-10 my-8 space-y-6">
          <div>
            <h1 className="font-display text-3xl xl:text-4xl font-black tracking-tight leading-tight">
              Mulai Langkah Nyata <br />
              <span className="gold-gradient-text">Menuju Kampus Impian</span>
            </h1>
            <p className="mt-3 text-xs xl:text-sm text-ggc-subtle/85 leading-relaxed">
              Daftarkan diri Anda dalam waktu 1 menit untuk mengakses asesmen 84 instrumen dan rekomendasi program studi komprehensif.
            </p>
          </div>

          {/* 3 Step Benefits */}
          <div className="space-y-3.5">
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="w-8 h-8 rounded-xl bg-ggc-gold text-ggc-dark font-black flex items-center justify-center shrink-0 shadow-sm mt-0.5 text-xs">
                01
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Evaluasi 7 Dimensi Terpadu</h4>
                <p className="text-[11px] text-ggc-subtle/80 mt-0.5 leading-snug">
                  Bakat alami, minat keilmuan, kepribadian, nilai hidup, akademik, karier, hingga kesiapan kuliah.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="w-8 h-8 rounded-xl bg-white/10 text-ggc-gold font-black flex items-center justify-center shrink-0 border border-white/20 mt-0.5 text-xs">
                02
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Zero Bias & Auto-Save</h4>
                <p className="text-[11px] text-ggc-subtle/80 mt-0.5 leading-snug">
                  Soal diacak secara objektif dan jawaban tersimpan otomatis tanpa khawatir koneksi terputus.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="w-8 h-8 rounded-xl bg-white/10 text-ggc-gold font-black flex items-center justify-center shrink-0 border border-white/20 mt-0.5 text-xs">
                03
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Rekomendasi Jurusan & Unduh PDF</h4>
                <p className="text-[11px] text-ggc-subtle/80 mt-0.5 leading-snug">
                  Dapatkan laporan resmi multi-halaman berisikan Potential Signature dan prospek karier.
                </p>
              </div>
            </div>
          </div>

          {/* Guarantee Pill */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 text-xs text-ggc-subtle">
            <CheckCircle2 className="w-5 h-5 text-ggc-gold shrink-0" />
            <span>Data pendaftaran aman, rahasia, dan hanya digunakan untuk keperluan asesmen psikometrik.</span>
          </div>
        </div>

        {/* Bottom: Trust badge */}
        <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-ggc-subtle/70">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-ggc-gold" />
            <span>Keamanan Data Terjamin</span>
          </div>
          <span>Go Great Career™ © 2026</span>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* RIGHT COLUMN: REGISTER FORM CARD                                  */}
      {/* ------------------------------------------------------------------ */}
      <div className="col-span-12 lg:col-span-7 xl:col-span-7 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-12 relative min-h-screen">
        {/* Subtle decorative background blur */}
        <div className="absolute top-10 right-10 w-72 h-72 bg-ggc-gold/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-emerald-100/60 rounded-full blur-3xl pointer-events-none" />

        {/* Mobile Header (Hidden on Desktop) */}
        <div className="lg:hidden mb-6 text-center w-full max-w-lg">
          <BrandLogo variant="dark" size="md" href="/" />
          <p className="mt-2 text-xs text-gray-500">
            Registrasi Akun Siswa Study Fit Assessment™
          </p>
        </div>

        {/* Main Card */}
        <div className="w-full max-w-xl bg-white rounded-[2.5rem] p-7 sm:p-10 shadow-xl border border-gray-200/80 relative z-10">
          {/* Form Header */}
          <div className="mb-6">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-ggc-gold-dark uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-ggc-gold-subtle border border-ggc-gold/30 mb-2">
              <GraduationCap className="w-3.5 h-3.5" /> Akun Siswa Baru
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-ggc-dark tracking-tight">
              Registrasi Asesmen
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Lengkapi biodata singkat Anda untuk memulai evaluasi minat, bakat, dan jurusan.
            </p>
          </div>

          {/* Feedback Banners */}
          {error && (
            <div
              className="mb-5 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-xs shadow-xs"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              <span className="leading-relaxed font-medium">{error}</span>
            </div>
          )}

          {success && (
            <div
              className="mb-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-800 text-xs shadow-xs"
              role="alert"
            >
              <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <span className="leading-relaxed font-medium">{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Midtrans Instant Access Info Banner */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50/70 via-ggc-tint to-emerald-50/70 border border-ggc-subtle flex items-start gap-3 text-xs text-ggc-dark">
              <Sparkles className="w-4 h-4 text-ggc-gold mt-0.5 shrink-0" />
              <div>
                <p className="font-bold text-ggc">Registrasi Langsung atau Aktivasi Otomatis</p>
                <p className="text-[11px] text-gray-600 mt-0.5">
                  Jika Anda membeli asesmen melalui pembayaran Midtrans di halaman utama, akun Anda akan aktif otomatis via tautan verifikasi email.
                </p>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-xs font-bold text-gray-800 mb-1.5"
              >
                Nama Lengkap Siswa *
              </label>
              <div className="relative rounded-2xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  enterKeyHint="next"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Contoh: Muhammad Kevin Pratama"
                  className="block w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm rounded-2xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ggc focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Email & Phone Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-bold text-gray-800 mb-1.5"
                >
                  Alamat Email Aktif *
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
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="siswa@email.com"
                    className="block w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm rounded-2xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ggc focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="phoneNumber"
                  className="block text-xs font-bold text-gray-800 mb-1.5"
                >
                  No. WhatsApp / HP
                </label>
                <div className="relative rounded-2xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Phone className="h-4 w-4" />
                  </div>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    enterKeyHint="next"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="081234567890"
                    className="block w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm rounded-2xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ggc focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* School & Grade Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="schoolName"
                  className="block text-xs font-bold text-gray-800 mb-1.5"
                >
                  Asal Sekolah
                </label>
                <div className="relative rounded-2xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <School className="h-4 w-4" />
                  </div>
                  <input
                    id="schoolName"
                    name="schoolName"
                    type="text"
                    enterKeyHint="next"
                    value={formData.schoolName}
                    onChange={handleChange}
                    placeholder="Contoh: SMAN 1 Jakarta"
                    className="block w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm rounded-2xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ggc focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="grade"
                  className="block text-xs font-bold text-gray-800 mb-1.5"
                >
                  Jenjang / Kelas
                </label>
                <div className="relative rounded-2xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <select
                    id="grade"
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm rounded-2xl border border-gray-200 bg-gray-50/50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-ggc focus:border-transparent transition-all"
                  >
                    <option value="Kelas 10 SMA/SMK">Kelas 10 SMA/SMK</option>
                    <option value="Kelas 11 SMA/SMK">Kelas 11 SMA/SMK</option>
                    <option value="Kelas 12 SMA/SMK">Kelas 12 SMA/SMK</option>
                    <option value="Gap Year / Persiapan Kuliah">Gap Year / Persiapan Kuliah</option>
                    <option value="Mahasiswa / Lainnya">Mahasiswa / Lainnya</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold text-gray-800 mb-1.5"
              >
                Kata Sandi Akun (Min. 6 Karakter) *
              </label>
              <div className="relative rounded-2xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  enterKeyHint="done"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimal 6 karakter"
                  className="block w-full pl-10 pr-11 py-2.5 sm:py-3 text-sm rounded-2xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ggc focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-700 focus:outline-none"
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Terms notice */}
            <p className="text-[11px] text-gray-500 leading-relaxed pt-1">
              Dengan mendaftar, Anda menyetujui kebijakan privasi dan pemrosesan data instrumen evaluasi Go Great Career.
            </p>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-2xl text-sm font-bold text-ggc-dark bg-gradient-to-r from-[#E6D5A8] via-ggc-gold to-ggc-gold-dark hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ggc shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-ggc-dark border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Daftar & Masuk ke Asesmen</span>
                    <ArrowRight className="w-4 h-4 text-ggc-dark" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Switch to Login Link */}
          <div className="mt-6 text-center pt-5 border-t border-gray-100">
            <p className="text-xs text-gray-600">
              Sudah memiliki akun terdaftar?{" "}
              <Link
                href="/auth/login"
                className="font-bold text-ggc hover:text-ggc-light underline decoration-ggc/30 underline-offset-4"
              >
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom Back to Home */}
        <div className="mt-6 text-center z-10">
          <Link
            href="/"
            className="text-xs font-semibold text-gray-500 hover:text-ggc transition-colors inline-flex items-center gap-1.5"
          >
            <span>← Kembali ke Halaman Utama</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
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
      <RegisterForm />
    </React.Suspense>
  );
}
