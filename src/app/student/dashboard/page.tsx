import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Sparkles,
  ArrowRight,
  Clock,
  Compass,
  CheckCircle2,
  FileQuestion,
  GraduationCap,
  Award,
  Layers,
  BookOpen,
  HelpCircle,
} from "lucide-react";

export default async function StudentDashboardPage() {
  const session = await getServerSession(authOptions);

  let userProfile = null;
  let activeSession = null;
  let totalAnswers = 0;

  if (session?.user?.id) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
          profile: true,
          sessions: {
            orderBy: { started_at: "desc" },
            take: 1,
            include: {
              answers: true,
            },
          },
        },
      });

      userProfile = user?.profile;
      activeSession = user?.sessions[0] || null;
      totalAnswers = activeSession?.answers.length || 0;
    } catch (e) {
      // Fallback if DB connection fails in dev environment without migration
      console.warn("DB fetch fallback for student dashboard");
    }
  }

  const dimensions = [
    { code: "T", name: "Talent (Bakat)", count: 12, desc: "Potensi kognitif & kemampuan alami" },
    { code: "I", name: "Interest (Minat)", count: 12, desc: "Eksplorasi kecenderungan bidang & aktivitas" },
    { code: "P", name: "Personality (Kepribadian)", count: 12, desc: "Gaya kerja & preferensi adaptasi" },
    { code: "V", name: "Values (Nilai Pribadi)", count: 12, desc: "Motivator internal & kepuasan hidup" },
    { code: "A", name: "Academic (Akademik)", count: 12, desc: "Kecocokan rumpun mata pelajaran & jurusan" },
    { code: "C", name: "Career (Karier)", count: 12, desc: "Aspirasi peran profesional masa depan" },
    { code: "R", name: "Readiness (Kesiapan)", count: 12, desc: "Kemandirian & kesiapan mental kuliah" },
  ];

  const totalQuestions = 84;
  const progressPercent = Math.round((totalAnswers / totalQuestions) * 100);

  return (
    <div className="space-y-6">
      {/* Top Action Bar: Kembali ke Halaman Utama */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-700 hover:text-ggc transition-colors bg-white px-4 py-2 rounded-xl border border-gray-200/90 shadow-2xs hover:shadow-xs self-start"
        >
          <Compass className="w-4 h-4 text-ggc-gold" />
          <span>Kembali ke Halaman Utama</span>
        </Link>

        <span className="text-xs font-semibold text-gray-500">
          Portal Siswa • Go Great Career Study Fit™
        </span>
      </div>

      {/* Welcome Hero Banner */}
      <div className="rounded-3xl bg-emerald-luxury p-6 sm:p-10 text-white shadow-xl relative overflow-hidden border border-ggc-gold/30">
        <div className="absolute top-0 right-0 w-80 h-80 bg-ggc-gold/15 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
        <div className="absolute top-6 right-6 hidden md:block opacity-20 pointer-events-none">
          <img src="/logo.png" alt="GGC Logo" className="w-24 h-24 object-contain" />
        </div>
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-ggc-gold text-xs font-semibold mb-4 border border-white/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dashboard Asesmen Siswa</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Halo, {userProfile?.full_name || session?.user?.name || "Siswa Hebat"}! 👋
          </h1>
          
          <p className="mt-3 text-sm sm:text-base text-ggc-subtle/90 leading-relaxed">
            Selamat datang di instrumen komprehensif <strong>GGC Study Fit Assessment™</strong>. Mari ukur kecocokan potensi dirimu menuju pilihan program studi terbaik.
          </p>

          {/* Quick Profile Summary Tag */}
          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-ggc-subtle">
            <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg border border-white/10">
              <GraduationCap className="w-4 h-4 text-ggc-gold" />
              <span>{userProfile?.school_name || "Sekolah Belum Diatur"}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg border border-white/10">
              <BookOpen className="w-4 h-4 text-ggc-gold" />
              <span>{userProfile?.grade || "Kelas 12"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Assessment Action Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-ggc-subtle shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ggc">
              <Clock className="w-4 h-4 text-ggc-gold" />
              <span>Sesi Asesmen Anda</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-ggc-dark">
              Status Pengerjaan 84 Instrumen
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 max-w-xl">
              Asesmen terbagi dalam 7 dimensi evaluasi dengan skala 1-5 (Sangat Tidak Sesuai s/d Sangat Sesuai). Kerjakan secara jujur untuk hasil analisis paling presisi.
            </p>

            {/* Progress Bar */}
            <div className="pt-3 max-w-md">
              <div className="flex items-center justify-between text-xs font-bold text-ggc-dark mb-1.5">
                <span>Progres: {totalAnswers} / {totalQuestions} Soal</span>
                <span className="text-ggc">{progressPercent}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-ggc-subtle overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-ggc to-ggc-gold transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <Link
              href="/student/assessment"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-white bg-ggc hover:bg-ggc-light active:bg-ggc-dark shadow-md hover:shadow-lg transition-all text-sm"
            >
              <Compass className="w-4 h-4 text-ggc-gold" />
              <span>{totalAnswers > 0 ? "Lanjutkan Asesmen" : "Mulai Asesmen Baru"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <div className="text-[11px] text-center text-gray-500">
              Estimasi pengerjaan: 15-20 menit
            </div>
          </div>
        </div>
      </div>

      {/* 7 Dimensions Breakdown Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-ggc-dark flex items-center gap-2">
            <Layers className="w-5 h-5 text-ggc" />
            7 Dimensi Yang Dinilai
          </h3>
          <span className="text-xs text-gray-500 font-medium">
            Masing-masing 12 butir soal
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {dimensions.map((dim) => (
            <div
              key={dim.code}
              className="p-5 rounded-2xl bg-white border border-ggc-subtle shadow-sm hover:border-ggc/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-8 h-8 rounded-lg bg-ggc-subtle text-ggc font-black text-xs flex items-center justify-center border border-ggc/10">
                    {dim.code}
                  </span>
                  <span className="text-[11px] font-semibold text-ggc-gold-dark bg-ggc-gold-subtle px-2 py-0.5 rounded-md border border-ggc-gold/20">
                    {dim.count} Soal
                  </span>
                </div>
                <h4 className="font-bold text-ggc-dark text-sm mb-1">{dim.name}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{dim.desc}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                <span>Skala 1 - 5</span>
                <span className="text-ggc font-semibold">Siap Diuji</span>
              </div>
            </div>
          ))}

          {/* Result Card preview */}
          <Link
            href={`/student/results/${activeSession?.id || "preview"}`}
            className="p-5 rounded-2xl bg-ggc-gold-subtle border border-ggc-gold/40 hover:border-ggc-gold flex flex-col justify-between transition-all hover:shadow-md group"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-ggc-gold text-ggc-dark font-black text-xs flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Award className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-ggc-dark text-sm mb-1 group-hover:text-ggc">
                Laporan & Rekomendasi
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Tinjau Potential Signature dan kecocokan jurusan multi-matriks Anda.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-ggc-gold/30 text-[11px] font-bold text-ggc-gold-dark flex items-center justify-between">
              <span>Study Fit Score™</span>
              <span className="text-xs">Buka →</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Guide & FAQ Box */}
      <div className="p-6 rounded-2xl bg-white border border-ggc-subtle shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-ggc/10 text-ggc flex items-center justify-center shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-ggc-dark text-sm">
              Panduan Pengisian Asesmen
            </h4>
            <p className="text-xs text-gray-600 mt-0.5">
              Tidak ada jawaban benar atau salah. Pilihlah opsi yang paling mencerminkan kondisi alami diri Anda untuk mendapatkan hasil rekomendasi terbaik.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
