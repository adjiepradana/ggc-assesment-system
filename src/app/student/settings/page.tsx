"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  User,
  Mail,
  Phone,
  School,
  GraduationCap,
  Lock,
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  AlertTriangle,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Save,
  RefreshCw,
  Compass,
  ChevronRight,
  Shield,
  X,
} from "lucide-react";

export default function StudentSettingsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone_number: "",
    school_name: "",
    grade: "Kelas 12 SMA/SMK",
  });
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Delete Account State & Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState("");
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // 1. Fetch current profile on mount
  useEffect(() => {
    async function loadUserProfile() {
      try {
        setProfileLoading(true);
        const res = await fetch("/api/user/profile");
        const data = await res.json();

        if (res.ok && data.user) {
          setProfileData({
            name: data.user.name || session?.user?.name || "",
            email: data.user.email || session?.user?.email || "",
            phone_number: data.user.phone_number || "",
            school_name: data.user.school_name || "",
            grade: data.user.grade || "Kelas 12 SMA/SMK",
          });
          setIsEmailVerified(Boolean(data.user.email_verified));
        } else if (session?.user) {
          setProfileData((prev) => ({
            ...prev,
            name: session.user.name || "",
            email: session.user.email || "",
          }));
        }
      } catch (err) {
        console.warn("Could not load user profile:", err);
      } finally {
        setProfileLoading(false);
      }
    }

    if (status === "authenticated") {
      loadUserProfile();
    } else if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/student/settings");
    }
  }, [status, session, router]);

  // Handle Profile Update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(null);
    setProfileError(null);

    if (!profileData.name.trim()) {
      setProfileError("Nama lengkap wajib diisi.");
      return;
    }

    setProfileSubmitting(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileData.name.trim(),
          phone_number: profileData.phone_number.trim(),
          school_name: profileData.school_name.trim(),
          grade: profileData.grade,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal memperbarui profil.");
      }

      setProfileSuccess(data.message || "Profil Anda berhasil disimpan.");
      // Auto-hide success message after 4s
      setTimeout(() => setProfileSuccess(null), 4000);
    } catch (err: any) {
      setProfileError(err.message || "Terjadi kesalahan saat menyimpan data.");
    } finally {
      setProfileSubmitting(false);
    }
  };

  // Handle Password Update
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(null);
    setPasswordError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Semua kolom kata sandi wajib diisi.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Kata sandi baru minimal 8 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Konfirmasi kata sandi baru tidak cocok.");
      return;
    }

    setPasswordSubmitting(true);

    try {
      const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal memperbarui kata sandi.");
      }

      setPasswordSuccess(data.message || "Kata sandi Anda berhasil diperbarui.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(null), 5000);
    } catch (err: any) {
      setPasswordError(err.message || "Terjadi kesalahan saat memperbarui kata sandi.");
    } finally {
      setPasswordSubmitting(false);
    }
  };

  // Handle Account Deletion
  const handleDeleteAccount = async () => {
    if (deleteConfirmationInput.trim() !== "HAPUS") {
      setDeleteError("Ketik kata 'HAPUS' dengan huruf kapital untuk mengonfirmasi.");
      return;
    }

    setDeleteSubmitting(true);
    setDeleteError(null);

    try {
      const res = await fetch("/api/user/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirmation: deleteConfirmationInput.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal menghapus akun.");
      }

      // Successfully deleted -> Sign out and redirect to login page
      await signOut({ callbackUrl: "/auth/login?deleted=true" });
    } catch (err: any) {
      setDeleteError(err.message || "Terjadi kesalahan saat memproses penghapusan akun.");
      setDeleteSubmitting(false);
    }
  };

  if (status === "loading" || profileLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-gray-900 dark:text-white">
        <div className="w-14 h-14 rounded-2xl bg-ggc text-ggc-gold flex items-center justify-center animate-spin shadow-lg">
          <Compass className="w-7 h-7" />
        </div>
        <p className="mt-4 text-xs font-bold uppercase tracking-wider text-ggc dark:text-ggc-gold">
          Memuat Pengaturan Akun...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12 animate-fade-in">
      {/* ================= BREADCRUMB & HEADER ================= */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-[#A0B9AE]">
          <Link
            href="/student/dashboard"
            className="hover:text-ggc dark:hover:text-ggc-gold transition-colors"
          >
            Dashboard Siswa
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-900 dark:text-white font-bold">
            Pengaturan Akun & Keamanan
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
              <span>Pengaturan Akun & Keamanan</span>
              <Sparkles className="w-6 h-6 text-ggc-gold" />
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-[#A0B9AE] mt-1 leading-relaxed">
              Kelola informasi profil, perbarui kata sandi, dan pantau status akun Go Great Career Anda.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                isEmailVerified
                  ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800/40"
                  : "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800/40"
              }`}
            >
              {isEmailVerified ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Email Terverifikasi</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Belum Terverifikasi</span>
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* ================= SECTION 1: INFORMASI PROFIL ================= */}
      <section className="bg-white dark:bg-[#062419] rounded-3xl p-6 sm:p-8 border border-ggc-subtle dark:border-[#0E4230] shadow-md transition-colors relative overflow-hidden">
        <div className="flex items-center justify-between pb-6 border-b border-gray-100 dark:border-[#0E4230]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center border border-emerald-200 dark:border-emerald-800/40 shadow-2xs">
              <User className="w-5 h-5 text-ggc dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">
                Informasi Profil Siswa
              </h2>
              <p className="text-xs text-gray-500 dark:text-[#A0B9AE]">
                Perbarui identitas personal dan latar belakang jenjang sekolah Anda.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider hidden sm:inline">
            Profil Utama
          </span>
        </div>

        {profileSuccess && (
          <div className="mt-5 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm flex items-center gap-3 animate-fade-in shadow-2xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{profileSuccess}</span>
          </div>
        )}

        {profileError && (
          <div className="mt-5 p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs sm:text-sm flex items-center gap-3 animate-fade-in shadow-2xs">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
            <span>{profileError}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="mt-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Input: Nama Lengkap */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                Nama Lengkap Siswa *
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, name: e.target.value })
                  }
                  placeholder="Contoh: Muhammad Kevin"
                  className="w-full pl-10 sm:pl-11 pr-4 py-3 rounded-xl border border-gray-300 dark:border-[#11402E] bg-gray-50/50 dark:bg-[#031810] text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:bg-white dark:focus:bg-[#02130C] focus:ring-2 focus:ring-ggc focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Input: Email (Read Only) */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                Alamat Email (Akun Utama)
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  disabled
                  value={profileData.email}
                  className="w-full pl-10 sm:pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-[#11402E] bg-gray-100/80 dark:bg-[#02140D] text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed select-none"
                />
              </div>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                * Email terikat secara paten dengan lisensi asesmen Midtrans Anda.
              </p>
            </div>

            {/* Input: Nomor WhatsApp */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                Nomor WhatsApp / HP
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  value={profileData.phone_number}
                  onChange={(e) =>
                    setProfileData({ ...profileData, phone_number: e.target.value })
                  }
                  placeholder="081234567890"
                  className="w-full pl-10 sm:pl-11 pr-4 py-3 rounded-xl border border-gray-300 dark:border-[#11402E] bg-gray-50/50 dark:bg-[#031810] text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:bg-white dark:focus:bg-[#02130C] focus:ring-2 focus:ring-ggc focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Input: Asal Sekolah */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                Nama Sekolah Asal
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <School className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={profileData.school_name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, school_name: e.target.value })
                  }
                  placeholder="Contoh: SMAN 8 Jakarta"
                  className="w-full pl-10 sm:pl-11 pr-4 py-3 rounded-xl border border-gray-300 dark:border-[#11402E] bg-gray-50/50 dark:bg-[#031810] text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:bg-white dark:focus:bg-[#02130C] focus:ring-2 focus:ring-ggc focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Select: Jenjang / Kelas */}
            <div className="sm:col-span-2">
              <label className="block text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                Tingkat / Jenjang Pendidikan
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <select
                  value={profileData.grade}
                  onChange={(e) =>
                    setProfileData({ ...profileData, grade: e.target.value })
                  }
                  className="w-full pl-10 sm:pl-11 pr-4 py-3 rounded-xl border border-gray-300 dark:border-[#11402E] bg-gray-50/50 dark:bg-[#031810] text-sm text-gray-900 dark:text-white focus:bg-white dark:focus:bg-[#02130C] focus:ring-2 focus:ring-ggc focus:outline-none transition-all"
                >
                  <option value="Kelas 10 SMA/SMK">Kelas 10 SMA/SMK (Eksplorasi Rumpun)</option>
                  <option value="Kelas 11 SMA/SMK">Kelas 11 SMA/SMK (Pemantapan Minat)</option>
                  <option value="Kelas 12 SMA/SMK">Kelas 12 SMA/SMK (Persiapan SNBP / SNBT)</option>
                  <option value="Gap Year / Persiapan Ulang">Gap Year / Persiapan Ulang Seleksi</option>
                  <option value="Mahasiswa Baru (Semester 1-2)">Mahasiswa Baru (Semester 1-2)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Button: Forest Emerald */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={profileSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-luxury via-ggc to-emerald-luxury hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 cursor-pointer shadow-md"
            >
              {profileSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Menyimpan Perubahan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-ggc-gold" />
                  <span>Simpan Perubahan Profil</span>
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* ================= SECTION 2: KEAMANAN (UBAH KATA SANDI) ================= */}
      <section className="bg-white dark:bg-[#062419] rounded-3xl p-6 sm:p-8 border border-ggc-subtle dark:border-[#0E4230] shadow-md transition-colors relative overflow-hidden">
        <div className="flex items-center justify-between pb-6 border-b border-gray-100 dark:border-[#0E4230]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center justify-center border border-amber-200 dark:border-amber-800/40 shadow-2xs">
              <KeyRound className="w-5 h-5 text-ggc-gold-dark dark:text-ggc-gold" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">
                Keamanan & Ubah Kata Sandi
              </h2>
              <p className="text-xs text-gray-500 dark:text-[#A0B9AE]">
                Pastikan akun Anda terlindungi dengan menggunakan kata sandi unik dan kuat.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider hidden sm:inline">
            Proteksi Akun
          </span>
        </div>

        {passwordSuccess && (
          <div className="mt-5 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm flex items-center gap-3 animate-fade-in shadow-2xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{passwordSuccess}</span>
          </div>
        )}

        {passwordError && (
          <div className="mt-5 p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs sm:text-sm flex items-center gap-3 animate-fade-in shadow-2xs">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="mt-6 space-y-4">
          {/* Input: Password Saat Ini */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 mb-1.5">
              Kata Sandi Saat Ini *
            </label>
            <div className="relative rounded-xl shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showCurrentPassword ? "text" : "password"}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Masukkan kata sandi lama Anda"
                className="w-full pl-10 sm:pl-11 pr-11 py-3 rounded-xl border border-gray-300 dark:border-[#11402E] bg-gray-50/50 dark:bg-[#031810] text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:bg-white dark:focus:bg-[#02130C] focus:ring-2 focus:ring-ggc focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                aria-label="Toggle visibility"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Input: Password Baru */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                Kata Sandi Baru *
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showNewPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  className="w-full pl-10 sm:pl-11 pr-11 py-3 rounded-xl border border-gray-300 dark:border-[#11402E] bg-gray-50/50 dark:bg-[#031810] text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:bg-white dark:focus:bg-[#02130C] focus:ring-2 focus:ring-ggc focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                  aria-label="Toggle visibility"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Input: Konfirmasi Password Baru */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                Konfirmasi Kata Sandi Baru *
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi baru"
                  className="w-full pl-10 sm:pl-11 pr-11 py-3 rounded-xl border border-gray-300 dark:border-[#11402E] bg-gray-50/50 dark:bg-[#031810] text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:bg-white dark:focus:bg-[#02130C] focus:ring-2 focus:ring-ggc focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                  aria-label="Toggle visibility"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Action Button: Champagne Gold Accent */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={passwordSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-black text-sm text-ggc-dark bg-gradient-to-r from-[#DFCA95] via-ggc-gold to-[#C5A869] hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 cursor-pointer shadow-md"
            >
              {passwordSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-ggc-dark" />
                  <span>Memperbarui Kata Sandi...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-ggc-dark" />
                  <span>Perbarui Kata Sandi Sekarang</span>
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* ================= SECTION 3: ZONA BAHAYA (HAPUS AKUN) ================= */}
      <section className="bg-red-50/60 dark:bg-red-950/20 rounded-3xl p-6 sm:p-8 border-2 border-red-200/90 dark:border-red-900/40 shadow-sm transition-colors relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/60 text-red-800 dark:text-red-300 text-xs font-bold border border-red-300 dark:border-red-800/60">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
              <span>Zona Bahaya (Danger Zone)</span>
            </div>

            <h2 className="text-lg sm:text-xl font-black text-red-950 dark:text-red-200">
              Hapus Akun & Data Asesmen Secara Permanen
            </h2>

            <p className="text-xs sm:text-sm text-red-800/80 dark:text-red-300/80 leading-relaxed">
              Tindakan ini bersifat final dan tidak dapat dibatalkan. Semua data profil siswa, riwayat pengisian 84 butir soal, hasil kalkulasi skor keselarasan jurusan, dan tiket asesmen akan dihapus secara permanen dari server.
            </p>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={() => {
                setDeleteConfirmationInput("");
                setDeleteError(null);
                setIsDeleteModalOpen(true);
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-red-600 hover:bg-red-700 active:scale-[0.99] shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Hapus Akun Secara Permanen</span>
            </button>
          </div>
        </div>
      </section>

      {/* ================= CONFIRMATION MODAL: HAPUS AKUN ================= */}
      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-w-md w-full bg-white dark:bg-[#07261B] rounded-[2rem] p-6 sm:p-8 shadow-2xl border-2 border-red-500/60 relative overflow-hidden transition-all animate-scale-in">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-white bg-gray-100 dark:bg-[#031810] transition-colors cursor-pointer"
              aria-label="Tutup modal"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mb-4 border border-red-200 dark:border-red-900/50 shadow-inner">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
              Konfirmasi Penghapusan Akun
            </h3>

            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
              Apakah Anda benar-benar yakin ingin menghapus akun Anda (<strong>{profileData.email}</strong>)? Tindakan ini akan <strong>menghapus seluruh lembar jawaban 84 soal dan laporan hasil studi Anda</strong> tanpa kemungkinan pemulihan.
            </p>

            <div className="mt-4 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-800 dark:text-red-300">
              Ketik kata <strong className="font-mono text-red-900 dark:text-red-200 font-black">HAPUS</strong> di bawah ini untuk menyetujui:
            </div>

            <div className="mt-3">
              <input
                type="text"
                autoFocus
                value={deleteConfirmationInput}
                onChange={(e) => setDeleteConfirmationInput(e.target.value)}
                placeholder="Ketik HAPUS di sini..."
                className="w-full px-4 py-3 rounded-xl border-2 border-red-300 dark:border-red-800 bg-white dark:bg-[#031810] text-sm font-bold text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-center tracking-wider"
              />
            </div>

            {deleteError && (
              <div className="mt-3 text-xs text-red-600 dark:text-red-400 font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-[#031810] hover:bg-gray-200 dark:hover:bg-[#052418] transition-all cursor-pointer border border-transparent dark:border-[#103D2B]"
              >
                Batalkan
              </button>
              <button
                type="button"
                disabled={deleteConfirmationInput.trim() !== "HAPUS" || deleteSubmitting}
                onClick={handleDeleteAccount}
                className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md inline-flex items-center justify-center gap-2"
              >
                {deleteSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Menghapus Akun...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Saya Mengerti, Hapus Akun</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
