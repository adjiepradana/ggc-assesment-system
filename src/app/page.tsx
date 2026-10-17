import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Compass,
  Award,
  Layers,
  GraduationCap,
  CheckCircle2,
} from "lucide-react";

export default function HomePage() {
  const dimensions = [
    { name: "Talent (Bakat)", desc: "12 indikator potensi alami & kecerdasan kognitif" },
    { name: "Interest (Minat)", desc: "12 eksplorasi kecenderungan bidang & aktivitas" },
    { name: "Personality (Kepribadian)", desc: "12 dimensi karakteristik kerja & perilaku" },
    { name: "Values (Nilai Pribadi)", desc: "12 prinsip panduan motivasi & etika hidup" },
    { name: "Academic (Kecocokan Akademik)", desc: "12 matriks kesiapan bidang studi/jurusan" },
    { name: "Career (Arah Karier)", desc: "12 proyeksi peran profesional masa depan" },
    { name: "Readiness (Kesiapan)", desc: "12 evaluasi resiliensi & kesiapan mental kuliah" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-ggc-tint">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-24 bg-gradient-to-b from-white via-ggc-tint to-ggc-subtle/50">
        <div className="absolute inset-0 bg-[radial-gradient(#0B4632_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.04]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-ggc-subtle border border-ggc/20 text-ggc text-xs font-semibold mb-6 shadow-sm">
              <Sparkles className="w-4 h-4 text-ggc-gold" />
              <span>Sistem Asesmen Multi-Matriks Standar Internasional</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-ggc-dark tracking-tight leading-tight">
              Temukan Jurusan & Karier Impian Bersama{" "}
              <span className="emerald-gradient-text block mt-1">
                Go Great Career™
              </span>
            </h1>

            {/* Subheading */}
            <p className="mt-6 text-lg sm:text-xl text-gray-700 leading-relaxed">
              Study Fit Assessment™ adalah platform komprehensif 84 instrumen terukur untuk memetakan bakat, minat, kepribadian, hingga kesiapan kuliah secara presisi.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white bg-ggc hover:bg-ggc-light active:bg-ggc-dark shadow-md hover:shadow-lg transition-all"
              >
                Mulai Asesmen Sekarang
                <ArrowRight className="w-5 h-5 text-ggc-gold" />
              </Link>
              <Link
                href="/auth/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-ggc bg-white hover:bg-ggc-subtle border border-ggc/20 shadow-sm transition-all"
              >
                Masuk ke Akun
              </Link>
            </div>

            {/* Quick Trust Points */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-600">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-ggc" />
                <span>84 Item Terstandarisasi</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-ggc" />
                <span>7 Dimensi Holistik</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-ggc" />
                <span>Hasil Komprehensif Realtime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7 Dimensions Section */}
      <section className="py-16 bg-white border-y border-ggc-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-ggc-gold">
              Multi-Matrix Assessment
            </span>
            <h2 className="text-3xl font-black text-ggc-dark mt-2">
              7 Dimensi Penilaian Utama
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              Setiap pilar memiliki 12 indikator spesifik yang dianalisis secara simultan untuk menghasilkan rekomendasi studi yang akurat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {dimensions.map((dim, idx) => (
              <div
                key={dim.name}
                className="p-5 rounded-2xl bg-ggc-tint/60 border border-ggc-subtle hover:border-ggc/30 transition-all hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-ggc text-ggc-gold flex items-center justify-center font-bold text-sm mb-4 shadow-sm">
                    0{idx + 1}
                  </div>
                  <h3 className="font-bold text-ggc-dark text-base mb-1">
                    {dim.name}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {dim.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-ggc-subtle/80 flex items-center justify-between text-[11px] font-semibold text-ggc">
                  <span>12 Indikator</span>
                  <span className="text-ggc-gold-dark">Likert 1-5 Scale</span>
                </div>
              </div>
            ))}

            {/* 8th card: Total Summary */}
            <div className="p-5 rounded-2xl bg-emerald-luxury text-white border border-ggc-gold/30 flex flex-col justify-between shadow-lg">
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/10 text-ggc-gold flex items-center justify-center font-bold text-sm mb-4">
                  <Award className="w-5 h-5 text-ggc-gold" />
                </div>
                <h3 className="font-bold text-white text-base mb-1">
                  Total 84 Butir Instrumen
                </h3>
                <p className="text-xs text-ggc-subtle/80 leading-relaxed">
                  Kalkulasi otomatis multi-matriks memetakan kecocokan rumpun Saintek & Soshum secara akurat.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-semibold text-ggc-gold">
                <span>Algoritma Presisi</span>
                <span>Study Fit Score™</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Access / Demo Login Helper */}
      <section className="py-16 bg-ggc-subtle/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 rounded-3xl bg-white border border-ggc/20 shadow-md">
            <div className="text-center mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-ggc-gold-dark">
                Akses Peran Sistem (RBAC)
              </span>
              <h2 className="text-2xl font-black text-ggc-dark mt-1">
                Portal Masuk Sesuai Peran
              </h2>
              <p className="text-xs text-gray-600 mt-1">
                Sistem mengimplementasikan Role-Based Access Control ketat untuk Siswa dan Administrator.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Student Card */}
              <div className="p-6 rounded-2xl border border-ggc-subtle bg-ggc-tint/30 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-ggc text-white flex items-center justify-center mb-4">
                    <GraduationCap className="w-6 h-6 text-ggc-gold" />
                  </div>
                  <h3 className="text-lg font-bold text-ggc-dark">Portal Siswa</h3>
                  <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                    Daftar akun, kerjakan 84 soal asesmen bertahap, dan peroleh laporan kecocokan jurusan beserta rekomendasi karier.
                  </p>
                </div>
                <div className="mt-6">
                  <Link
                    href="/auth/login"
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-ggc hover:bg-ggc-light transition-all"
                  >
                    Masuk Portal Siswa
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Admin Card */}
              <div className="p-6 rounded-2xl border border-ggc-gold/30 bg-ggc-gold-subtle/50 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-ggc-gold text-ggc-dark flex items-center justify-center mb-4 font-bold">
                    <ShieldCheck className="w-6 h-6 text-ggc-dark" />
                  </div>
                  <h3 className="text-lg font-bold text-ggc-dark">Portal Administrator</h3>
                  <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                    Kelola bank soal 84 butir, tinjau progres pengerjaan siswa, dan analisa distribusi kecocokan studi secara terpusat.
                  </p>
                </div>
                <div className="mt-6">
                  <Link
                    href="/auth/login"
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-ggc-dark bg-ggc-gold hover:bg-ggc-gold-dark hover:text-white transition-all"
                  >
                    Masuk Portal Admin
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-ggc-dark text-white border-t border-ggc-light/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ggc-subtle/70">
          <p>© {new Date().getFullYear()} Go Great Career (GGC). All rights reserved.</p>
          <p className="flex items-center gap-1">
            Study Fit Assessment™ • Milestone 1 Fullstack
          </p>
        </div>
      </footer>
    </div>
  );
}
