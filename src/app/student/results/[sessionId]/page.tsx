"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Sparkles,
  Download,
  ArrowLeft,
  Award,
  Layers,
  GraduationCap,
  Briefcase,
  AlertTriangle,
  Lightbulb,
  Compass,
  TrendingUp,
  School,
  RefreshCw,
  Clock,
  ShieldCheck,
  Target,
  Gauge,
  ListChecks,
  Crown,
  Star,
} from "lucide-react";
import { ScoringResult } from "@/lib/scoring";
import CountUp from "@/components/results/CountUp";
import ScoreRing from "@/components/results/ScoreRing";
import RadarChart from "@/components/results/RadarChart";

/* -------------------------------------------------------------------------- */
/* Small presentational helpers                                               */
/* -------------------------------------------------------------------------- */

function SectionHeader({
  id,
  eyebrow,
  title,
  description,
  icon: Icon,
  aside,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  icon: React.ElementType;
  aside?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-2xl bg-ggc text-ggc-gold flex items-center justify-center shadow-md shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-ggc-gold-dark">
            {eyebrow}
          </span>
          <h2 id={id} className="text-xl sm:text-2xl font-black text-ggc-dark tracking-tight leading-tight">
            {title}
          </h2>
          {description && <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl">{description}</p>}
        </div>
      </div>
      {aside}
    </div>
  );
}

function toPercent(score: number) {
  return Math.max(0, Math.min(100, Math.round(((score - 1) / 4) * 100)));
}

const LEVEL_STYLES: Record<string, string> = {
  Tinggi: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Sedang: "bg-sky-100 text-sky-800 border-sky-200",
  Berkembang: "bg-gray-100 text-gray-600 border-gray-200",
};

/* -------------------------------------------------------------------------- */
/* Loading skeleton                                                           */
/* -------------------------------------------------------------------------- */

function ResultsSkeleton() {
  return (
    <div className="space-y-8 pb-16" aria-busy="true" aria-live="polite">
      <span className="sr-only">Menganalisis skor multi-matriks Anda...</span>
      <div className="h-10 w-64 rounded-xl skeleton-shimmer" />
      <div className="rounded-[2rem] bg-ggc-dark p-8 sm:p-10 grid lg:grid-cols-[1.4fr_1fr] gap-8">
        <div className="space-y-4">
          <div className="h-6 w-48 rounded-full bg-white/10" />
          <div className="h-12 w-4/5 rounded-xl bg-white/10" />
          <div className="h-5 w-3/5 rounded-lg bg-white/10" />
          <div className="h-20 w-full rounded-xl bg-white/5" />
        </div>
        <div className="h-64 rounded-3xl bg-white/5" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-2xl skeleton-shimmer" />
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="h-80 rounded-3xl skeleton-shimmer" />
        <div className="h-80 rounded-3xl skeleton-shimmer" />
      </div>
      <div className="text-center text-xs text-gray-500 flex items-center justify-center gap-2">
        <Compass className="w-4 h-4 text-ggc animate-spin motion-reduce:animate-none" />
        Mengalkulasi kecocokan 84 instrumen terhadap profil jurusan dan potensi bakat Anda...
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function StudentResultsPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [data, setData] = useState<{
    student: { name: string; school: string; grade: string; email?: string };
    results: ScoringResult;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  useEffect(() => {
    async function loadResults() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/assessment/results/${sessionId}`);
        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.error || "Gagal memuat hasil asesmen.");
        }

        setData(json);
      } catch (err: any) {
        console.error("Error loading assessment results:", err);
        setError(err.message || "Terjadi kesalahan saat memuat hasil evaluasi.");
      } finally {
        setLoading(false);
      }
    }

    if (sessionId) {
      loadResults();
    }
  }, [sessionId]);

  const handleDownloadPdf = async () => {
    try {
      setIsDownloadingPdf(true);
      const downloadUrl = `/api/assessment/results/${sessionId}/pdf`;

      // Trigger native download
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error("Gagal mengunduh dokumen PDF.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `GGC_Study_Fit_Report_${(data?.student.name || "Student").replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan saat mengunduh PDF.");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  if (loading) {
    return <ResultsSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="max-w-lg mx-auto my-12 p-8 rounded-3xl bg-white border border-red-200 shadow-xl text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Gagal Membuka Laporan</h3>
        <p className="text-xs text-gray-600 mb-6">{error || "Data asesmen tidak ditemukan."}</p>
        <Link
          href="/student/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-ggc hover:bg-ggc-light transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Dashboard</span>
        </Link>
      </div>
    );
  }

  const { student, results } = data;
  const primarySignature = results.potentialSignatures[0];
  const topMajor = results.studyRecommendations[0];
  const readinessPercent = toPercent(results.overallReadinessScore);
  const firstName = student.name?.split(" ")[0] || "Siswa";
  const radarData = results.dimensionScores.map((d) => ({
    label: d.name.split("(")[0].trim(),
    value: d.percentage,
  }));
  const strongestDimension = [...results.dimensionScores].sort((a, b) => b.percentage - a.percentage)[0];
  const sortedTalents = [...results.talentSubdimensions].sort((a, b) => b.score - a.score);

  const quickStats = [
    {
      icon: ListChecks,
      label: "Butir Dijawab",
      value: results.totalAnswered,
      decimals: 0,
      suffix: " / 84",
      hint: "Instrumen multi-matriks",
    },
    {
      icon: Gauge,
      label: "Kesiapan Studi",
      value: readinessPercent,
      decimals: 0,
      suffix: "%",
      hint: "Readiness Index",
    },
    {
      icon: Star,
      label: "Skor Signature",
      value: primarySignature?.score ?? 0,
      decimals: 1,
      suffix: " / 5",
      hint: primarySignature?.title ?? "-",
    },
    {
      icon: Target,
      label: "Top Match",
      value: topMajor?.fitScore ?? 0,
      decimals: 0,
      suffix: "%",
      hint: topMajor?.majorName ?? "-",
    },
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* ------------------------------------------------------------------ */}
      {/* Top Action & Navigation Bar                                        */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2">
          <Link
            href="/student/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-ggc transition-colors bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          <span className="text-xs text-gray-400">/</span>
          <span className="text-xs font-semibold text-ggc-dark" aria-current="page">
            Laporan Hasil Asesmen
          </span>
        </nav>

        <button
          onClick={handleDownloadPdf}
          disabled={isDownloadingPdf}
          className="group relative inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold text-ggc-dark bg-gradient-to-r from-[#E6D5A8] via-ggc-gold to-ggc-gold-dark shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:hover:translate-y-0 overflow-hidden"
        >
          {isDownloadingPdf ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Memproses Dokumen PDF...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
              <span>Unduh Laporan PDF Resmi</span>
            </>
          )}
        </button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* HERO: Certificate-style Potential Signature                         */}
      {/* ------------------------------------------------------------------ */}
      <section
        aria-labelledby="signature-title"
        className="relative overflow-hidden rounded-[2rem] bg-emerald-luxury text-white shadow-2xl ring-1 ring-ggc-gold/40"
      >
        {/* Decorative layers */}
        <div className="absolute inset-0 bg-dot-grid opacity-60 pointer-events-none" aria-hidden="true" />
        <div
          className="absolute -top-32 -right-24 w-[28rem] h-[28rem] rounded-full bg-ggc-gold/20 blur-3xl animate-float-slow pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-40 -left-20 w-96 h-96 rounded-full bg-emerald-400/10 blur-3xl animate-float-reverse pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-ggc-gold to-transparent"
          aria-hidden="true"
        />

        <div className="relative z-10 grid lg:grid-cols-[1.35fr_1fr] gap-8 lg:gap-10 p-6 sm:p-10 lg:p-12">
          {/* Left: Signature narrative */}
          <div className="flex flex-col justify-center">
            <div className="hero-rise flex flex-wrap items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-ggc-gold/20 text-ggc-gold text-[11px] font-bold tracking-[0.14em] uppercase border border-ggc-gold/40">
                <Sparkles className="w-3.5 h-3.5" />
                Primary Potential Signature
              </span>
              <span className="text-[11px] text-ggc-subtle/70 font-mono">
                #{results.sessionId.slice(0, 8).toUpperCase()}
              </span>
            </div>

            <p className="hero-rise hero-rise-delay-1 text-sm sm:text-base text-ggc-subtle/90 font-medium">
              Selamat, {firstName}! 🎉 Profil potensi dominan Anda adalah
            </p>

            <h1
              id="signature-title"
              className="hero-rise hero-rise-delay-1 mt-1 font-display text-3xl sm:text-5xl lg:text-[3.4rem] font-black tracking-tight leading-[1.05] gold-gradient-text"
            >
              {primarySignature?.title}
            </h1>

            <p className="hero-rise hero-rise-delay-2 text-base sm:text-lg font-semibold text-white mt-3">
              &ldquo;{primarySignature?.archetype}&rdquo;
            </p>

            <p className="hero-rise hero-rise-delay-2 mt-3 text-sm text-ggc-subtle/85 leading-relaxed max-w-2xl">
              {primarySignature?.description}
            </p>

            <ul className="hero-rise hero-rise-delay-3 mt-6 flex flex-wrap items-center gap-2" aria-label="Kekuatan inti">
              {primarySignature?.highlightedTraits.map((trait) => (
                <li
                  key={trait}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 text-white text-xs font-semibold backdrop-blur-md border border-white/20 hover:bg-white/15 hover:border-ggc-gold/50 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-ggc-gold" aria-hidden="true" />
                  {trait}
                </li>
              ))}
            </ul>

            <div className="hero-rise hero-rise-delay-3 mt-8 pt-5 border-t border-white/10 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-ggc-subtle/90">
              <div className="flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-ggc-gold" />
                <span className="font-semibold text-white">{student.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <School className="w-4 h-4 text-ggc-gold" />
                <span>
                  {student.school} ({student.grade})
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-ggc-gold" />
                <span>
                  {new Date(results.calculatedAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Certificate card with Study Fit ring */}
          <div className="hero-rise hero-rise-delay-2 relative">
            <div className="relative overflow-hidden rounded-3xl bg-white/[0.07] backdrop-blur-xl border border-ggc-gold/40 p-6 sm:p-8 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]">
              {/* Gold sweep (3 passes, then stops) */}
              <div
                className="shimmer-sweep absolute inset-y-0 -left-1/2 w-1/3 bg-gradient-to-r from-transparent via-ggc-gold/25 to-transparent skew-x-[-20deg] pointer-events-none"
                aria-hidden="true"
              />
              {/* Corner ornaments */}
              <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-ggc-gold/60 rounded-tl-lg" aria-hidden="true" />
              <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-ggc-gold/60 rounded-tr-lg" aria-hidden="true" />
              <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-ggc-gold/60 rounded-bl-lg" aria-hidden="true" />
              <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-ggc-gold/60 rounded-br-lg" aria-hidden="true" />

              <div className="relative flex flex-col items-center text-center">
                <div className="flex items-center gap-2 mb-5">
                  <img src="/logo.png" alt="" className="w-8 h-8 object-contain bg-white rounded-lg p-0.5" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-ggc-gold">
                    Certified Study Fit
                  </span>
                </div>

                <ScoreRing value={topMajor?.fitScore ?? 0} size={176} stroke={14} label="Study Fit" tone="dark" />

                <p className="mt-5 text-[11px] uppercase tracking-[0.16em] text-ggc-subtle/70 font-bold">
                  Rekomendasi Jurusan #1
                </p>
                <p className="mt-1 text-xl font-black text-white leading-tight">{topMajor?.majorName}</p>
                <p className="text-xs text-ggc-subtle/70 mt-0.5">{topMajor?.faculty}</p>

                <span className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-ggc-gold text-ggc-dark text-[11px] font-black uppercase tracking-wider shadow">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {topMajor?.fitLevel}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Quick Stats                                                        */}
      {/* ------------------------------------------------------------------ */}
      <section aria-label="Ringkasan skor" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="reveal-on-scroll group relative overflow-hidden rounded-2xl bg-white border border-gray-200/80 p-4 sm:p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-ggc-gold/50 transition-all duration-300"
            >
              <div
                className="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-ggc-gold/10 group-hover:bg-ggc-gold/20 transition-colors"
                aria-hidden="true"
              />
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-ggc-subtle text-ggc flex items-center justify-center mb-3 group-hover:bg-ggc group-hover:text-ggc-gold transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500">{stat.label}</div>
                <div className="text-2xl sm:text-3xl font-black text-ggc-dark mt-0.5">
                  <CountUp value={stat.value} decimals={stat.decimals} />
                  <span className="text-sm sm:text-base font-bold text-gray-400">{stat.suffix}</span>
                </div>
                <div className="text-[11px] text-gray-500 mt-1 truncate" title={stat.hint}>
                  {stat.hint}
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Holistic Map: Radar + 7 Dimensions                                 */}
      {/* ------------------------------------------------------------------ */}
      <section aria-labelledby="holistic-title">
        <SectionHeader
          id="holistic-title"
          eyebrow="Peta Profil Holistik"
          title="Skor 7 Dimensi Evaluasi"
          description="Keseimbangan antara bakat, minat, kepribadian, nilai pribadi, akademik, karier, dan kesiapan transisi kuliah."
          icon={Layers}
        />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-6">
          {/* Radar */}
          <div className="reveal-on-scroll relative overflow-hidden rounded-3xl bg-white border border-gray-200 shadow-sm p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-ggc-tint via-white to-ggc-gold-subtle pointer-events-none" aria-hidden="true" />
            <div className="relative">
              <RadarChart data={radarData} className="max-w-[420px] mx-auto" />
              {strongestDimension && (
                <div className="mt-4 flex items-center justify-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-ggc text-white font-semibold shadow-sm">
                    <TrendingUp className="w-3.5 h-3.5 text-ggc-gold" />
                    Dimensi terkuat: {strongestDimension.name.split("(")[0].trim()} ({strongestDimension.percentage}%)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Dimension list */}
          <div className="reveal-on-scroll rounded-3xl bg-white border border-gray-200 shadow-sm p-6 space-y-4">
            {results.dimensionScores.map((dim) => {
              const isTop = dim.category === strongestDimension?.category;
              return (
                <div key={dim.category}>
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <span className="text-gray-800 flex items-center gap-1.5">
                      {isTop && <Crown className="w-3.5 h-3.5 text-ggc-gold-dark" aria-label="Tertinggi" />}
                      {dim.name}
                    </span>
                    <span className="text-ggc font-black tabular-nums">
                      {dim.score.toFixed(1)}
                      <span className="text-gray-400 font-semibold"> / 5 · {dim.percentage}%</span>
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-ggc-subtle overflow-hidden">
                    <div
                      className={`bar-grow h-full rounded-full ${
                        isTop
                          ? "bg-gradient-to-r from-ggc via-ggc-light to-ggc-gold"
                          : "bg-gradient-to-r from-ggc-light to-ggc-gold/80"
                      }`}
                      style={{ width: `${dim.percentage}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1 line-clamp-1">{dim.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Top 3 Signatures: Podium                                           */}
      {/* ------------------------------------------------------------------ */}
      <section aria-labelledby="signatures-title">
        <SectionHeader
          id="signatures-title"
          eyebrow="Matrix 1 · Person Profile"
          title="Top 3 Signature Potensi Unggulan"
          description="Dihitung dari skor performa subdimensi bakat dan preferensi penalaran alami Anda."
          icon={Award}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:items-end">
          {results.potentialSignatures.map((sig, idx) => {
            const isFirst = idx === 0;
            return (
              <article
                key={sig.title + idx}
                className={`reveal-on-scroll group relative overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 ${
                  isFirst
                    ? "md:order-2 md:min-h-[340px] bg-emerald-luxury text-white shadow-xl ring-2 ring-ggc-gold/60"
                    : `${idx === 1 ? "md:order-1" : "md:order-3"} bg-white border border-gray-200 shadow-sm hover:shadow-lg hover:border-ggc-gold/50`
                }`}
              >
                {isFirst && (
                  <>
                    <div className="absolute inset-0 bg-dot-grid opacity-40 pointer-events-none" aria-hidden="true" />
                    <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-ggc-gold/25 blur-2xl pointer-events-none" aria-hidden="true" />
                  </>
                )}
                <div className="relative flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black ${
                        isFirst ? "bg-ggc-gold text-ggc-dark" : "bg-ggc-subtle text-ggc"
                      }`}
                    >
                      {isFirst ? <Crown className="w-3.5 h-3.5" /> : null}#{idx + 1}
                    </span>
                    <span className={`text-xs font-black tabular-nums ${isFirst ? "text-ggc-gold" : "text-ggc"}`}>
                      {sig.score.toFixed(1)} / 5.0
                    </span>
                  </div>

                  <h3 className={`font-display font-black text-xl leading-tight ${isFirst ? "text-white" : "text-ggc-dark"}`}>
                    {sig.title}
                  </h3>
                  <div className={`text-xs font-semibold mt-1 ${isFirst ? "text-ggc-gold" : "text-ggc-gold-dark"}`}>
                    {sig.archetype}
                  </div>
                  <p className={`text-xs leading-relaxed mt-3 ${isFirst ? "text-ggc-subtle/85" : "text-gray-600"}`}>
                    {sig.tagline}
                  </p>

                  {/* Score bar */}
                  <div className={`mt-4 h-1.5 rounded-full overflow-hidden ${isFirst ? "bg-white/15" : "bg-gray-100"}`}>
                    <div
                      className="bar-grow h-full rounded-full bg-gradient-to-r from-ggc-gold to-[#E6D5A8]"
                      style={{ width: `${toPercent(sig.score)}%` }}
                    />
                  </div>

                  <ul className={`mt-auto pt-4 flex flex-wrap gap-1.5 ${isFirst ? "" : ""}`}>
                    {sig.highlightedTraits.map((t) => (
                      <li
                        key={t}
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                          isFirst
                            ? "bg-white/10 text-white border-white/20"
                            : "bg-gray-50 text-gray-600 border-gray-200"
                        }`}
                      >
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Matrix 2: Study Recommendations                                    */}
      {/* ------------------------------------------------------------------ */}
      <section aria-labelledby="majors-title">
        <SectionHeader
          id="majors-title"
          eyebrow="Matrix 2 · Study Profile Matching"
          title="Rekomendasi Program Studi"
          description="Komparasi profil bakat, minat, dan kesiapan akademik Anda terhadap benchmark jurusan perguruan tinggi."
          icon={Compass}
          aside={
            <span className="self-start sm:self-auto inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              <Target className="w-3.5 h-3.5" />
              Top Match: {topMajor?.majorName} ({topMajor?.fitScore}%)
            </span>
          }
        />

        <div className="space-y-5">
          {results.studyRecommendations.map((rec, idx) => {
            const isFirst = idx === 0;
            return (
              <article
                key={rec.id}
                className={`reveal-on-scroll relative overflow-hidden rounded-3xl bg-white border shadow-sm transition-all duration-300 hover:shadow-xl ${
                  isFirst ? "border-ggc-gold/70 ring-2 ring-ggc-gold/25" : "border-gray-200 hover:border-ggc/30"
                }`}
              >
                {isFirst && (
                  <div className="absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl bg-gradient-to-r from-ggc-gold to-ggc-gold-dark text-ggc-dark text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Best Match
                  </div>
                )}
                <div
                  className={`absolute left-0 inset-y-0 w-1.5 ${
                    isFirst ? "bg-gradient-to-b from-ggc-gold to-ggc" : "bg-ggc-subtle"
                  }`}
                  aria-hidden="true"
                />

                <div className="p-6 sm:p-7 pl-7 sm:pl-9">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-5 border-b border-gray-100">
                    <ScoreRing value={rec.fitScore} size={84} stroke={8} label="Fit" />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-black text-gray-400">#{idx + 1}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${rec.badgeColor}`}>
                          {rec.fitLevel}
                        </span>
                        <span className="text-[11px] font-semibold text-ggc bg-ggc-subtle px-2 py-0.5 rounded-full">
                          {rec.cluster}
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-black text-ggc-dark mt-1.5">{rec.majorName}</h3>
                      <p className="text-xs text-gray-500">{rec.faculty}</p>
                    </div>
                  </div>

                  {/* Key attributes vs benchmark */}
                  {rec.keyAttributes?.length > 0 && (
                    <div className="mt-5">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-3">
                        Atribut Kunci vs Benchmark Jurusan
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                        {rec.keyAttributes.map((attr) => {
                          const pct = (attr.score / 5) * 100;
                          const benchPct = (attr.benchmark / 5) * 100;
                          const meets = attr.score >= attr.benchmark;
                          return (
                            <div key={attr.name}>
                              <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
                                <span className="text-gray-700 truncate pr-2">{attr.name}</span>
                                <span className={`tabular-nums ${meets ? "text-emerald-700" : "text-amber-700"}`}>
                                  {attr.score.toFixed(1)}
                                  <span className="text-gray-400"> / {attr.benchmark.toFixed(1)}</span>
                                </span>
                              </div>
                              <div className="relative h-2 rounded-full bg-gray-100">
                                <div className="absolute inset-0 overflow-hidden rounded-full">
                                  <div
                                    className={`bar-grow h-full rounded-full ${
                                      meets ? "bg-gradient-to-r from-ggc to-emerald-500" : "bg-gradient-to-r from-amber-400 to-ggc-gold"
                                    }`}
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <div
                                  className="absolute -top-1 -bottom-1 w-0.5 bg-ggc-dark rounded"
                                  style={{ left: `${benchPct}%` }}
                                  title={`Benchmark ${attr.benchmark.toFixed(1)}`}
                                  aria-hidden="true"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Insights */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-5">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-200/80 flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <Lightbulb className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-emerald-900 mb-1">Mengapa Jurusan Ini Cocok?</h5>
                        <p className="text-xs text-emerald-950/80 leading-relaxed">{rec.whyThisFit}</p>
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-white border border-amber-200/80 flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-amber-900 mb-1">Hal yang Perlu Diantisipasi</h5>
                        <p className="text-xs text-amber-950/80 leading-relaxed">{rec.whatToWatchOutFor}</p>
                      </div>
                    </div>
                  </div>

                  {/* Career prospects */}
                  <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-gray-500 flex items-center gap-1 mr-1">
                      <Briefcase className="w-3.5 h-3.5 text-ggc" />
                      Prospek Profesi:
                    </span>
                    {rec.careerProspects.map((career) => (
                      <span
                        key={career}
                        className="text-[11px] font-semibold text-ggc bg-ggc-subtle px-2.5 py-1 rounded-lg border border-ggc/15 hover:bg-ggc hover:text-white transition-colors"
                      >
                        {career}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Talent Subdimensions                                               */}
      {/* ------------------------------------------------------------------ */}
      <section aria-labelledby="talent-title">
        <SectionHeader
          id="talent-title"
          eyebrow="Talent Matrix"
          title="6 Pilar Subdimensi Bakat"
          description="Evaluasi daya analitis, verbal, numerik, spasial, kreativitas, hingga intuisi sosial — diurutkan dari yang terkuat."
          icon={TrendingUp}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedTalents.map((sub, idx) => (
            <div
              key={sub.key}
              className={`reveal-on-scroll group rounded-2xl p-5 border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                idx === 0 ? "bg-ggc-gold-subtle border-ggc-gold/50" : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${
                      idx === 0 ? "bg-ggc text-ggc-gold" : "bg-ggc-subtle text-ggc"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <h3 className="text-sm font-bold text-gray-800 leading-snug">{sub.name}</h3>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border shrink-0 ${LEVEL_STYLES[sub.level]}`}>
                  {sub.level}
                </span>
              </div>
              <div className="mt-4 flex items-end justify-between">
                <span className="text-2xl font-black text-ggc-dark tabular-nums">
                  {sub.score.toFixed(1)}
                  <span className="text-xs font-bold text-gray-400"> / 5.0</span>
                </span>
                <span className="text-xs font-bold text-ggc-gold-dark">{sub.percentage}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="bar-grow h-full rounded-full bg-gradient-to-r from-ggc to-ggc-gold"
                  style={{ width: `${sub.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Narrative Synthesis & CTA                                          */}
      {/* ------------------------------------------------------------------ */}
      <section
        aria-labelledby="synthesis-title"
        className="reveal-on-scroll relative overflow-hidden rounded-[2rem] bg-ggc-dark text-white p-8 sm:p-10 shadow-2xl ring-1 ring-ggc-gold/30"
      >
        <div className="absolute inset-0 bg-dot-grid opacity-40 pointer-events-none" aria-hidden="true" />
        <div className="absolute -bottom-24 -right-16 w-80 h-80 rounded-full bg-ggc-gold/20 blur-3xl pointer-events-none" aria-hidden="true" />

        <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-ggc-gold">
              <Sparkles className="w-3.5 h-3.5" /> Sintesis Hasil Asesmen GGC
            </span>
            <h2 id="synthesis-title" className="font-display text-2xl sm:text-3xl font-black leading-tight">
              Langkah Sukses Menuju <span className="gold-gradient-text">Bangku Perkuliahan</span>
            </h2>
            <p className="text-sm text-ggc-subtle/85 leading-relaxed">{results.summaryNarrative}</p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto">
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-ggc-dark bg-gradient-to-r from-[#E6D5A8] via-ggc-gold to-ggc-gold-dark shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-60"
            >
              {isDownloadingPdf ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span>{isDownloadingPdf ? "Memproses..." : "Unduh Dokumen PDF Resmi"}</span>
            </button>
            <Link
              href="/student/dashboard"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-white/10 border border-white/20 hover:bg-white/20 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Dashboard</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
