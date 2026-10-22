import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateAssessmentScores, ScoringResult } from "@/lib/scoring";
import {
  Sparkles,
  ArrowRight,
  Clock,
  Compass,
  CheckCircle2,
  GraduationCap,
  Award,
  Layers,
  BookOpen,
  HelpCircle,
  Brain,
  Target,
  UserCheck,
  ShieldCheck,
  Briefcase,
  Flame,
  Zap,
  TrendingUp,
  Download,
  School,
  BadgeCheck,
  FileText,
  Lightbulb,
  ChevronRight,
  RotateCcw,
  BarChart3,
  Check,
  AlertCircle,
  Printer,
  Lock,
  CreditCard,
  Mail,
} from "lucide-react";
import { checkUserPaidAccess } from "@/lib/access-check";
import ResendVerificationButton from "@/components/ResendVerificationButton";

export default async function StudentDashboardPage() {
  const session = await getServerSession(authOptions);

  let userProfile: any = null;
  let activeSession: any = null;
  let totalAnswers = 0;
  const answersRecord: Record<string, number> = {};
  const countsByDimension: Record<string, number> = {
    T: 0,
    I: 0,
    P: 0,
    V: 0,
    A: 0,
    C: 0,
    R: 0,
  };
  let hasPaidAccess = false;
  let isEmailVerified = true;

  if (session?.user?.id) {
    try {
      hasPaidAccess = await checkUserPaidAccess(
        session.user.id,
        session.user.email,
        session.user.role
      );

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
          profile: true,
          sessions: {
            orderBy: { started_at: "desc" },
            take: 1,
            include: {
              answers: {
                include: {
                  question: true,
                },
              },
            },
          },
        },
      });

      userProfile = user?.profile;
      activeSession = user?.sessions[0] || null;
      isEmailVerified = user?.email_verified ?? true;

      if (activeSession?.answers) {
        totalAnswers = activeSession.answers.length;
        for (const ans of activeSession.answers) {
          const code = ans.question?.code || "";
          if (code) {
            answersRecord[code] = ans.selected_value;
            const prefix = code.charAt(0).toUpperCase();
            if (countsByDimension[prefix] !== undefined) {
              countsByDimension[prefix]++;
            }
          }
        }
      }
    } catch (e) {
      console.warn("DB fetch fallback for student dashboard", e);
    }
  }

  const totalQuestions = 84;
  const isCompleted =
    activeSession?.status === "COMPLETED" || totalAnswers >= totalQuestions;
  const progressPercent = Math.min(
    100,
    Math.round((totalAnswers / totalQuestions) * 100)
  );

  // Compute scoring preview if user has completed or answered sufficiently
  let scoringResult: ScoringResult | null = null;
  if (activeSession && (isCompleted || totalAnswers >= totalQuestions)) {
    try {
      scoringResult = calculateAssessmentScores(activeSession.id, answersRecord);
    } catch (err) {
      console.warn("Scoring preview calculation error", err);
    }
  }

  const studentName =
    userProfile?.full_name || session?.user?.name || "Siswa Hebat";
  const initials =
    studentName
      .split(" ")
      .map((part: string) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "SH";

  const dimensionsList = [
    {
      code: "T",
      name: "Talent (Bakat)",
      categoryName: "Potensi Kognitif",
      total: 12,
      count: countsByDimension.T || 0,
      icon: Brain,
      gradient: "from-emerald-500 to-teal-600",
      bgSoft: "bg-emerald-50/70",
      borderSoft: "border-emerald-200/70",
      textColor: "text-emerald-700",
      badgeBg: "bg-emerald-100 text-emerald-800",
      desc: "Logika analitikal, penalaran spasial 3D, daya ingat konseptual, dan kreativitas orisinal.",
      tag: "Logika & Spasial",
    },
    {
      code: "I",
      name: "Interest (Minat)",
      categoryName: "Eksplorasi Holland",
      total: 12,
      count: countsByDimension.I || 0,
      icon: Compass,
      gradient: "from-amber-500 to-orange-600",
      bgSoft: "bg-amber-50/70",
      borderSoft: "border-amber-200/70",
      textColor: "text-amber-700",
      badgeBg: "bg-amber-100 text-amber-800",
      desc: "Kecenderungan aktivitas sains, teknologi informasi, seni kreatif, bisnis, & sosial.",
      tag: "RIASEC Model",
    },
    {
      code: "P",
      name: "Personality (Kepribadian)",
      categoryName: "Gaya Belajar & Kerja",
      total: 12,
      count: countsByDimension.P || 0,
      icon: UserCheck,
      gradient: "from-indigo-500 to-violet-600",
      bgSoft: "bg-indigo-50/70",
      borderSoft: "border-indigo-200/70",
      textColor: "text-indigo-700",
      badgeBg: "bg-indigo-100 text-indigo-800",
      desc: "Keteraturan, stabilitas emosi saat tekanan, grit (daya tahan), dan kepemimpinan alami.",
      tag: "Big Five Traits",
    },
    {
      code: "V",
      name: "Values (Nilai Pribadi)",
      categoryName: "Motivator Internal",
      total: 12,
      count: countsByDimension.V || 0,
      icon: ShieldCheck,
      gradient: "from-teal-600 to-emerald-700",
      bgSoft: "bg-teal-50/70",
      borderSoft: "border-teal-200/70",
      textColor: "text-teal-700",
      badgeBg: "bg-teal-100 text-teal-800",
      desc: "Kemandirian finansial, integritas moral, karya bermakna, dan kontribusi sosial.",
      tag: "Motivasi Intrapersonal",
    },
    {
      code: "A",
      name: "Academic (Akademik)",
      categoryName: "Kecocokan Rumpun",
      total: 12,
      count: countsByDimension.A || 0,
      icon: GraduationCap,
      gradient: "from-blue-500 to-sky-600",
      bgSoft: "bg-blue-50/70",
      borderSoft: "border-blue-200/70",
      textColor: "text-blue-700",
      badgeBg: "bg-blue-100 text-blue-800",
      desc: "Ketertarikan rumpun mata pelajaran Saintek, Soshum, Medis, Teknik, atau Humaniora.",
      tag: "Mata Kuliah & Jurusan",
    },
    {
      code: "C",
      name: "Career (Aspirasi Karier)",
      categoryName: "Arah Masa Depan",
      total: 12,
      count: countsByDimension.C || 0,
      icon: Briefcase,
      gradient: "from-rose-500 to-pink-600",
      bgSoft: "bg-rose-50/70",
      borderSoft: "border-rose-200/70",
      textColor: "text-rose-700",
      badgeBg: "bg-rose-100 text-rose-800",
      desc: "Proyeksi profesi: Inovator Teknologi, Konsultan Strategis, Peneliti, atau Wirausahawan.",
      tag: "Peran Profesional",
    },
    {
      code: "R",
      name: "Readiness (Kesiapan)",
      categoryName: "Kemandirian Kuliah",
      total: 12,
      count: countsByDimension.R || 0,
      icon: Flame,
      gradient: "from-orange-500 to-red-600",
      bgSoft: "bg-orange-50/70",
      borderSoft: "border-orange-200/70",
      textColor: "text-orange-700",
      badgeBg: "bg-orange-100 text-orange-800",
      desc: "Kedisiplinan belajar mandiri, kesiapan adaptasi merantau, dan mentalitas kampus.",
      tag: "Resiliensi Mental",
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* ================= 1. TOP ACTION & STATUS BAR ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 text-xs font-bold text-gray-700 dark:text-[#C7DCD2] hover:text-ggc dark:hover:text-ggc-gold transition-all duration-200 bg-white dark:bg-[#07261B] hover:bg-ggc-subtle/50 dark:hover:bg-[#093525] px-4 py-2.5 rounded-xl border border-gray-200/90 dark:border-[#103D2B] shadow-xs hover:shadow-sm group self-start"
        >
          <Compass className="w-4 h-4 text-ggc-gold transition-transform duration-200 group-hover:-rotate-45" />
          <span>Kembali ke Halaman Utama</span>
        </Link>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-[#07261B] border border-gray-200/80 dark:border-[#103D2B] text-[11px] font-semibold text-gray-600 dark:text-gray-300 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sistem Online • Tahun Ajaran 2026/2027</span>
          </div>
          <div className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-ggc-gold/15 text-ggc-gold-dark dark:text-ggc-gold text-[11px] font-bold border border-ggc-gold/30">
            <BadgeCheck className="w-3.5 h-3.5" />
            <span>Akun Siswa Terverifikasi</span>
          </div>
        </div>
      </div>

      {/* ================= 2. EYE-CATCHING HERO BANNER ================= */}
      <div className="rounded-3xl bg-emerald-luxury p-6 sm:p-10 text-white shadow-xl relative overflow-hidden border border-ggc-gold/30">
        {/* Ambient Glow Orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-ggc-gold/15 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-ggc-light/20 rounded-full blur-2xl pointer-events-none" />

        {/* Watermark Logo */}
        <div className="absolute top-6 right-6 hidden lg:block opacity-15 pointer-events-none">
          <img src="/logo.png" alt="GGC Brand" className="w-32 h-32 object-contain" />
        </div>

        <div className="relative z-10 max-w-3xl">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-ggc-gold text-xs font-semibold mb-5 border border-white/20">
            <Sparkles className="w-4 h-4 text-ggc-gold" />
            <span>Portal Siswa • Go Great Career Study Fit™</span>
          </div>

          {/* Greeting with Avatar Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 mb-4">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-ggc-gold to-ggc-gold-dark text-ggc-dark font-black text-2xl flex items-center justify-center shadow-lg shadow-black/20 shrink-0 border-2 border-white/30">
              {initials}
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                Halo, {studentName}! 👋
              </h1>
              <p className="text-xs sm:text-sm text-ggc-gold/90 font-medium mt-0.5">
                Siap memetakan potensi terbaik dan menemukan jurusan kuliah impianmu?
              </p>
            </div>
          </div>

          <p className="text-sm sm:text-base text-ggc-subtle/90 leading-relaxed max-w-2xl mt-3">
            Instrumen <strong>GGC Study Fit Assessment™</strong> mengombinasikan 84 butir reflektif lintas 7 dimensi untuk menganalisis kecocokan profilmu dengan ratusan program studi universitas secara objektif.
          </p>

          {/* Quick Profile Summary Chips */}
          <div className="mt-6 flex flex-wrap items-center gap-2.5 text-xs text-ggc-subtle font-medium">
            <div className="flex items-center gap-2 bg-black/25 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-white/10">
              <School className="w-4 h-4 text-ggc-gold" />
              <span>{userProfile?.school_name || "SMA / SMK Belum Diatur"}</span>
            </div>
            <div className="flex items-center gap-2 bg-black/25 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-white/10">
              <GraduationCap className="w-4 h-4 text-ggc-gold" />
              <span>{userProfile?.grade || "Kelas 12 (Persiapan Kuliah)"}</span>
            </div>
            <div className="flex items-center gap-2 bg-black/25 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-white/10">
              <Target className="w-4 h-4 text-ggc-gold" />
              <span>Target: PTN / PTS Favorit</span>
            </div>
          </div>
        </div>
      </div>

      {/* Email Verification Alert Banner (if not yet verified) */}
      {!isEmailVerified && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-950 dark:text-amber-200">
                Email Anda Belum Terverifikasi
              </h4>
              <p className="text-xs text-amber-800/90 dark:text-amber-300/80 mt-0.5">
                Silakan periksa kotak masuk atau folder spam email Anda ({session?.user?.email}). Klik tautan di dalam email untuk mengaktifkan akun secara penuh.
              </p>
            </div>
          </div>
          <ResendVerificationButton email={session?.user?.email || ""} />
        </div>
      )}

      {/* ================= 3. 4-GRID QUICK KPI STATS ================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* KPI 1: Progres Asesmen */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#062419] border border-gray-200/80 dark:border-[#103D2B] shadow-xs hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 dark:text-[#A0B9AE] uppercase tracking-wider">
              Progres Jawaban
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              {totalAnswers}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-gray-400 dark:text-gray-500">
              / 84 Soal
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-ggc rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
              {progressPercent}%
            </span>
          </div>
        </div>

        {/* KPI 2: Estimasi Waktu */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#062419] border border-gray-200/80 dark:border-[#103D2B] shadow-xs hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 dark:text-[#A0B9AE] uppercase tracking-wider">
              Estimasi Sesi
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              15 - 20
            </span>
            <span className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400">
              Menit
            </span>
          </div>
          <p className="mt-2 text-[11px] font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Fleksibel & simpan otomatis</span>
          </p>
        </div>

        {/* KPI 3: Dimensi Matriks */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#062419] border border-gray-200/80 dark:border-[#103D2B] shadow-xs hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 dark:text-[#A0B9AE] uppercase tracking-wider">
              Cakupan Evaluasi
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              7
            </span>
            <span className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400">
              Dimensi Holistik
            </span>
          </div>
          <p className="mt-2 text-[11px] font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Bakat, Minat, Nilai, Kesiapan</span>
          </p>
        </div>

        {/* KPI 4: Hasil / Rekomendasi */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#062419] border border-gray-200/80 dark:border-[#103D2B] shadow-xs hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 dark:text-[#A0B9AE] uppercase tracking-wider">
              Status Laporan
            </span>
            <div className="w-10 h-10 rounded-xl bg-ggc-gold/20 dark:bg-ggc-gold/30 text-ggc-gold-dark dark:text-ggc-gold flex items-center justify-center group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="truncate">
            <span className="text-base sm:text-lg font-black text-gray-900 dark:text-white truncate block">
              {isCompleted
                ? scoringResult?.potentialSignatures[0]?.title || "Siap Diunduh"
                : `${84 - totalAnswers} Soal Lagi`}
            </span>
          </div>
          <p className="mt-2 text-[11px] font-semibold text-ggc-gold-dark dark:text-ggc-gold flex items-center gap-1.5 truncate">
            {isCompleted ? (
              <>
                <BadgeCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate">Laporan & PDF Tersedia</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
                <span className="truncate">Kerjakan 84 soal untuk membuka</span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* ================= 4. PRIMARY INTERACTIVE ACTION HUB ================= */}
      {isCompleted ? (
        /* VARIANT A: SUDAH SELESAI */
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white via-ggc-gold-subtle/50 to-emerald-50/40 dark:from-[#062419] dark:via-[#083021] dark:to-[#041D14] border-2 border-ggc-gold/40 shadow-lg relative overflow-hidden transition-colors">
          <div className="absolute top-0 right-0 w-80 h-80 bg-ggc-gold/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800/40">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Asesmen Selesai (84 / 84 Soal Terjawab)</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                Laporan Hasil & Analisis Anda Siap Ditinjau! 🎉
              </h2>

              <p className="text-xs sm:text-sm text-gray-600 dark:text-[#A0B9AE] leading-relaxed">
                Algoritma multi-matriks telah berhasil memetakan profil psikometrik, Potential Signature, serta rekomendasi program studi universitas yang paling selaras dengan potensi alami Anda.
              </p>

              {scoringResult && (
                <div className="pt-2 flex flex-wrap gap-2.5 text-xs font-semibold">
                  <div className="px-3 py-1.5 rounded-lg bg-ggc-dark dark:bg-ggc text-white flex items-center gap-2 shadow-xs">
                    <Award className="w-3.5 h-3.5 text-ggc-gold" />
                    <span>
                      {scoringResult.potentialSignatures[0]?.title || "Potential Signature"}
                    </span>
                  </div>
                  {scoringResult.studyRecommendations[0] && (
                    <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#07261B] border border-ggc/20 dark:border-[#103D2B] text-ggc-dark dark:text-white flex items-center gap-2 shadow-2xs">
                      <GraduationCap className="w-3.5 h-3.5 text-ggc dark:text-ggc-gold" />
                      <span>
                        Top Fit: {scoringResult.studyRecommendations[0].majorName} (
                        {scoringResult.studyRecommendations[0].fitScore}%)
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <Link
                href={`/student/results/${activeSession?.id || "preview"}`}
                className="inline-flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-white bg-ggc hover:bg-ggc-light active:bg-ggc-dark shadow-md hover:shadow-lg transition-all text-sm group cursor-pointer"
              >
                <BarChart3 className="w-4 h-4 text-ggc-gold" />
                <span>Buka Laporan Hasil Lengkap</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>

              {activeSession?.id && (
                <Link
                  href={`/student/results/${activeSession.id}?print=true`}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-gray-800 dark:text-gray-200 bg-white dark:bg-[#07261B] hover:bg-gray-50 dark:hover:bg-[#0A3324] border border-gray-300 dark:border-[#103D2B] shadow-2xs transition-all text-xs cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-ggc-gold-dark dark:text-ggc-gold" />
                  <span>Cetak / Simpan PDF Laporan</span>
                </Link>
              )}

              <Link
                href="/student/assessment"
                className="inline-flex items-center justify-center gap-2 text-xs font-semibold text-gray-500 dark:text-[#A0B9AE] hover:text-ggc dark:hover:text-ggc-gold transition-colors py-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Tinjau Kembali Lembar Asesmen</span>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* VARIANT B: BELUM MEMBAYAR (PAYWALL) */
        !hasPaidAccess ? (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#062419] border-2 border-amber-300/80 dark:border-amber-700/60 shadow-md relative overflow-hidden transition-colors">
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-100/40 dark:bg-amber-900/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-3 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 text-xs font-bold border border-amber-300 dark:border-amber-800/60">
                  <Lock className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                  <span>Akses Asesmen Terkunci</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                  Selesaikan Pembayaran untuk Memulai Asesmen
                </h2>

                <p className="text-xs sm:text-sm text-gray-600 dark:text-[#A0B9AE] leading-relaxed">
                  Akun Anda belum memiliki tiket pengerjaan aktif. Dapatkan akses penuh ke 84 butir soal multi-matriks, kalkulasi keselarasan jurusan, dan laporan PDF resmi dengan menyelesaikan transaksi Midtrans.
                </p>

                <div className="pt-1 flex flex-wrap gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
                  <span className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-[#082E20] border border-gray-200 dark:border-[#103D2B]">
                    Investasi Rp 49.000
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                    Aktivasi Otomatis
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
                <Link
                  href="/student/assessment"
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl font-bold text-ggc-dark bg-gradient-to-r from-[#E6D5A8] via-ggc-gold to-ggc-gold-dark hover:shadow-lg transition-all text-sm group shadow-md cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 text-ggc-dark" />
                  <span>Beli Akses Sekarang (Rp 49.000)</span>
                  <ArrowRight className="w-4 h-4 text-ggc-dark transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* VARIANT C: SUDAH MEMBAYAR - SEDANG / BELUM MENGERJAKAN */
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#062419] border border-gray-200/90 dark:border-[#103D2B] shadow-md relative overflow-hidden transition-colors">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ggc dark:text-ggc-gold">
                <Clock className="w-4 h-4 text-ggc-gold" />
                <span>
                  {totalAnswers > 0
                    ? `Sesi Sedang Berjalan (${totalAnswers} / 84 Soal)`
                    : "Sesi Asesmen Siap Dimulai"}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-ggc-dark dark:text-white tracking-tight">
                {totalAnswers > 0
                  ? "Lanjutkan Pengisian Asesmen 84 Butir"
                  : "Mulai Asesmen Study Fit™ Anda Sekarang"}
              </h2>

              <p className="text-xs sm:text-sm text-gray-600 dark:text-[#A0B9AE] leading-relaxed">
                Asesmen terdiri dari 84 pernyataan reflektif dengan skala 1-5 (Sangat Tidak Sesuai s/d Sangat Sesuai). Tidak ada jawaban salah, jawablah secara jujur untuk hasil analisis paling presisi.
              </p>

              {/* Progress Visual Bar */}
              <div className="pt-2 max-w-lg">
                <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-200 mb-2">
                  <span className="flex items-center gap-1.5">
                    <span>Progres:</span>
                    <strong className="text-ggc-dark dark:text-ggc-gold">
                      {totalAnswers} dari 84 Soal Terjawab
                    </strong>
                  </span>
                  <span className="text-ggc dark:text-emerald-400 font-black">{progressPercent}%</span>
                </div>
                <div className="w-full h-3.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden p-0.5 border border-gray-200/80 dark:border-[#103D2B]">
                  <div
                    className="h-full bg-gradient-to-r from-ggc via-emerald-600 to-ggc-gold transition-all duration-500 rounded-full shadow-inner"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500">
                  <span>Mulai (Soal 1)</span>
                  <span>Pertengahan (Soal 42)</span>
                  <span>Selesai (Soal 84)</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <Link
                href="/student/assessment"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-white bg-ggc hover:bg-ggc-light active:bg-ggc-dark shadow-md hover:shadow-lg transition-all text-sm group cursor-pointer"
              >
                <Compass className="w-4 h-4 text-ggc-gold transition-transform duration-200 group-hover:rotate-45" />
                <span>
                  {totalAnswers > 0
                    ? `Lanjutkan (Soal ${totalAnswers + 1})`
                    : "Mulai Asesmen 84 Butir"}
                </span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>

              <div className="flex items-center justify-center gap-3 text-[11px] text-gray-500 dark:text-[#A0B9AE]">
                <span className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Auto-Save
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Bebas Tekanan
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> 15-20 Menit
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* ================= 5. 7 DIMENSI HOLISTIK GRID ================= */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white flex items-center gap-2.5">
              <Layers className="w-5 h-5 text-ggc dark:text-ggc-gold" />
              <span>7 Dimensi Matriks Yang Dinilai</span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-[#A0B9AE] mt-0.5">
              Setiap dimensi berisi 12 butir instrumen psikometrik terstandarisasi.
            </p>
          </div>
          <span className="text-xs font-semibold text-ggc-gold-dark dark:text-ggc-gold bg-ggc-gold-subtle dark:bg-[#082E20] px-3 py-1 rounded-full border border-ggc-gold/30 self-start sm:self-auto">
            Total 84 Butir Soal
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {dimensionsList.map((dim) => {
            const Icon = dim.icon;
            const dimProgress = Math.round((dim.count / dim.total) * 100);
            const isDimDone = dim.count >= dim.total;

            return (
              <div
                key={dim.code}
                className={`p-5 rounded-2xl bg-white dark:bg-[#062419] border ${
                  isDimDone ? "border-emerald-300 dark:border-emerald-700/60" : "border-gray-200/80 dark:border-[#103D2B]"
                } shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group`}
              >
                <div>
                  {/* Top Header Badge & Icon */}
                  <div className="flex items-center justify-between mb-3.5">
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-br ${dim.gradient} text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-[#082E20] px-2.5 py-1 rounded-md">
                      {dim.tag}
                    </span>
                  </div>

                  {/* Title & Dimension Code */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-5 h-5 rounded-md bg-ggc/10 dark:bg-emerald-950/60 text-ggc dark:text-emerald-300 font-black text-[10px] flex items-center justify-center">
                      {dim.code}
                    </span>
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                      {dim.name}
                    </h4>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-[#A0B9AE] leading-relaxed mb-4">
                    {dim.desc}
                  </p>
                </div>

                {/* Progress bar per dimension */}
                <div className="pt-3 border-t border-gray-100 dark:border-[#0E4230]">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-gray-500 dark:text-[#A0B9AE] mb-1.5">
                    <span>
                      {dim.count} / {dim.total} Soal
                    </span>
                    <span
                      className={
                        isDimDone
                          ? "text-emerald-700 dark:text-emerald-400 font-bold"
                          : dim.count > 0
                          ? "text-amber-600 dark:text-amber-400 font-bold"
                          : "text-gray-400 dark:text-gray-500"
                      }
                    >
                      {isDimDone
                        ? "✓ Selesai"
                        : dim.count > 0
                        ? `${dimProgress}%`
                        : "Belum Diisi"}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isDimDone
                          ? "bg-emerald-500"
                          : dim.count > 0
                          ? "bg-amber-500"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                      style={{ width: `${dimProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {/* Card 8: Quick Results Preview Link */}
          <Link
            href={`/student/results/${activeSession?.id || "preview"}`}
            className="p-5 rounded-2xl bg-gradient-to-br from-ggc-gold-subtle via-white to-amber-50/40 dark:from-[#083021] dark:via-[#062419] dark:to-[#041D14] border border-ggc-gold/50 dark:border-ggc-gold/30 hover:border-ggc-gold flex flex-col justify-between transition-all duration-200 hover:shadow-md group cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-ggc-gold to-ggc-gold-dark text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <Award className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-ggc-gold-dark dark:text-ggc-gold bg-ggc-gold/20 dark:bg-ggc-gold/30 px-2.5 py-1 rounded-md">
                  Output Akhir
                </span>
              </div>

              <h4 className="font-bold text-ggc-dark dark:text-white text-sm mb-1.5 group-hover:text-ggc dark:group-hover:text-ggc-gold">
                Laporan & Rekomendasi
              </h4>
              <p className="text-xs text-gray-600 dark:text-[#A0B9AE] leading-relaxed mb-4">
                Visualisasi Radar Chart 7 Dimensi, Potential Signature, dan Top Rekomendasi Jurusan.
              </p>
            </div>

            <div className="pt-3 border-t border-ggc-gold/30 flex items-center justify-between text-xs font-bold text-ggc-gold-dark dark:text-ggc-gold">
              <span>Buka Analisis</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </div>
      </div>

      {/* ================= 6. 3-STEP JOURNEY ROADMAP ================= */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#062419] border border-gray-200/80 dark:border-[#103D2B] shadow-xs transition-colors">
        <div className="max-w-2xl mb-6">
          <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-ggc dark:text-ggc-gold" />
            <span>Alur Pemetaan Potensi Siswa</span>
          </h3>
          <p className="text-xs text-gray-500 dark:text-[#A0B9AE] mt-1">
            Tiga langkah terstruktur menuju keputusan pemilihan program studi yang tepat dan mantap.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative">
          {/* Step 1 */}
          <div className="p-5 rounded-2xl bg-ggc-subtle/40 dark:bg-[#07261B] border border-ggc/15 dark:border-[#103D2B] relative">
            <div className="w-8 h-8 rounded-lg bg-ggc text-white font-black text-xs flex items-center justify-center mb-3">
              1
            </div>
            <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1">
              Refleksi 84 Instrumen
            </h4>
            <p className="text-xs text-gray-600 dark:text-[#A0B9AE] leading-relaxed">
              Jawab 84 pernyataan dengan skala 1-5 sesuai dorongan alami diri tanpa ragu atau tergesa-gesa.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 relative">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white font-black text-xs flex items-center justify-center mb-3">
              2
            </div>
            <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1">
              Kalkulasi Multi-Matriks
            </h4>
            <p className="text-xs text-gray-600 dark:text-[#A0B9AE] leading-relaxed">
              Sistem memadukan bakat kognitif, RIASEC, Big Five, dan aspirasi karier menjadi profil holistik.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/40 relative">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center mb-3">
              3
            </div>
            <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1">
              Laporan & Arah Studi
            </h4>
            <p className="text-xs text-gray-600 dark:text-[#A0B9AE] leading-relaxed">
              Dapatkan rekomendasi jurusan dengan fit score, keunggulan unik, serta dokumen PDF siap cetak.
            </p>
          </div>
        </div>
      </div>

      {/* ================= 7. TIPS & DUKUNGAN SISWA ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#062419] border border-gray-200/80 dark:border-[#103D2B] shadow-xs flex items-start gap-3.5 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white text-sm">
              Tidak Ada Jawaban Salah
            </h4>
            <p className="text-xs text-gray-500 dark:text-[#A0B9AE] mt-1 leading-relaxed">
              Instrumen ini mengukur kecocokan (<em>fit</em>), bukan ujian kepintaran. Kejujuran Anda adalah kunci akurasi.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#062419] border border-gray-200/80 dark:border-[#103D2B] shadow-xs flex items-start gap-3.5 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white text-sm">
              Progres Tersimpan Otomatis
            </h4>
            <p className="text-xs text-gray-500 dark:text-[#A0B9AE] mt-1 leading-relaxed">
              Jika koneksi terputus atau perlu istirahat, Anda bisa keluar dan melanjutkan kapan saja tanpa hilang.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#062419] border border-gray-200/80 dark:border-[#103D2B] shadow-xs flex items-start gap-3.5 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white text-sm">
              Pusat Dukungan Siswa
            </h4>
            <p className="text-xs text-gray-500 dark:text-[#A0B9AE] mt-1 leading-relaxed">
              Mengalami kendala teknis atau butuh konsultasi hasil? Hubungi konselor bimbingan studi kami.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
