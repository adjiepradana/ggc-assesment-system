"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

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
          full_name: formData.fullName,
          email: formData.email,
          password: formData.password,
          phone_number: formData.phoneNumber,
          school_name: formData.schoolName,
          grade: formData.grade,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal melakukan pendaftaran.");
      }

      setSuccess("Pendaftaran berhasil! Sedang menyiapkan sesi...");

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
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-br from-ggc-dark via-ggc to-ggc-light relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-ggc-gold/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10 px-4">
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-block p-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 mb-3 shadow-lg">
            <BrandLogo variant="light" size="lg" href="/" />
          </div>
          <h2 className="mt-2 text-2xl sm:text-3xl font-black text-white tracking-tight">
            Registrasi Akun Siswa Baru
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-ggc-subtle/80">
            Mulai petualangan eksplorasi jurusan dan karier masa depan Anda
          </p>
        </div>

        {/* Form Card */}
        <div className="mt-8 bg-white/95 backdrop-blur-lg py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-ggc-gold/30">
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-xs">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-800 text-xs">
              <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-xs font-bold text-ggc-dark mb-1"
              >
                Nama Lengkap Siswa *
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Contoh: Muhammad Kevin Pratama"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-ggc-tint/30 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ggc focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Email & Phone Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-bold text-ggc-dark mb-1"
                >
                  Email Aktif *
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="siswa@gmail.com"
                    className="block w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-ggc-tint/30 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ggc focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="phoneNumber"
                  className="block text-xs font-bold text-ggc-dark mb-1"
                >
                  No. WhatsApp / HP
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Phone className="h-4 w-4" />
                  </div>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="08123456789"
                    className="block w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-ggc-tint/30 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ggc focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* School & Grade Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="schoolName"
                  className="block text-xs font-bold text-ggc-dark mb-1"
                >
                  Asal Sekolah
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <School className="h-4 w-4" />
                  </div>
                  <input
                    id="schoolName"
                    name="schoolName"
                    type="text"
                    value={formData.schoolName}
                    onChange={handleChange}
                    placeholder="SMA Negeri 1 Jakarta"
                    className="block w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-ggc-tint/30 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ggc focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="grade"
                  className="block text-xs font-bold text-ggc-dark mb-1"
                >
                  Jenjang / Kelas
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <select
                    id="grade"
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-ggc-tint/30 text-gray-900 focus:outline-none focus:ring-2 focus:ring-ggc focus:border-transparent transition-all"
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
                className="block text-xs font-bold text-ggc-dark mb-1"
              >
                Kata Sandi (Min. 6 Karakter) *
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
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

            {/* Terms notice */}
            <p className="text-[11px] text-gray-500 leading-relaxed pt-1">
              Dengan mendaftar, Anda menyetujui kebijakan privasi dan pemrosesan data instrumen asesmen Go Great Career.
            </p>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-ggc hover:bg-ggc-light active:bg-ggc-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ggc shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Daftar Akun Siswa</span>
                    <ArrowRight className="w-4 h-4 text-ggc-gold" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center pt-5 border-t border-gray-100">
            <p className="text-xs text-gray-600">
              Sudah memiliki akun terdaftar?{" "}
              <Link
                href="/auth/login"
                className="font-bold text-ggc hover:text-ggc-light underline"
              >
                Masuk di sini
              </Link>
            </p>
          </div>
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
