"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Sparkles,
  Download,
  ArrowLeft,
  CheckCircle2,
  Award,
  Layers,
  GraduationCap,
  Briefcase,
  AlertTriangle,
  Lightbulb,
  Compass,
  ChevronRight,
  TrendingUp,
  FileText,
  School,
  Share2,
  RefreshCw,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { ScoringResult } from "@/lib/scoring";

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
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-ggc text-ggc-gold flex items-center justify-center animate-bounce shadow-xl">
          <Compass className="w-7 h-7 animate-spin" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-bold text-ggc-dark">Menganalisis Skor Multi-Matriks...</h3>
          <p className="text-xs text-gray-500 mt-1">
            Mengalkulasi kecocokan 84 instrumen terhadap profil jurusan dan potensi bakat Anda.
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-lg mx-auto my-12 p-8 rounded-3xl bg-white border border-red-200 shadow-xl text-center">
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

  return (
    <div className="space-y-8 pb-16">
      {/* Top Action & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Link
            href="/student/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-ggc transition-colors bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          <span className="text-xs text-gray-400">/</span>
          <span className="text-xs font-semibold text-ggc-dark">Laporan Hasil Asesmen</span>
        </div>

        {/* Download PDF Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-ggc-dark bg-ggc-gold hover:bg-ggc-gold-dark hover:text-white transition-all shadow-md hover:shadow-lg disabled:opacity-60"
          >
            {isDownloadingPdf ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Memproses Dokumen PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Unduh Laporan PDF Resmi</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Hero: Potential Signature Banner */}
      <div className="rounded-3xl bg-emerald-luxury p-6 sm:p-10 text-white shadow-xl relative overflow-hidden border border-ggc-gold/30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-ggc-gold/15 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute top-6 right-6 hidden md:block opacity-20 pointer-events-none">
          <img src="/logo.png" alt="GGC Logo" className="w-24 h-24 object-contain" />
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-ggc-gold/20 text-ggc-gold text-xs font-bold tracking-wide uppercase border border-ggc-gold/40">
              <Sparkles className="w-3.5 h-3.5" />
              Primary Potential Signature
            </span>
            <span className="text-xs text-ggc-subtle/80">
              • ID Sesi: {results.sessionId.slice(0, 12)}...
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            {primarySignature?.title}
          </h1>

          <p className="text-base sm:text-lg font-medium text-ggc-gold mt-1">
            "{primarySignature?.archetype}"
          </p>

          <p className="mt-3 text-xs sm:text-sm text-ggc-subtle/90 leading-relaxed max-w-2xl">
            {primarySignature?.description}
          </p>

          {/* Core Strengths Badges */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {primarySignature?.highlightedTraits.map((trait) => (
              <span
                key={trait}
                className="px-3 py-1 rounded-xl bg-white/10 text-white text-xs font-semibold backdrop-blur-md border border-white/20"
              >
                ✓ {trait}
              </span>
            ))}
          </div>

          {/* Student Identity Tag Footer */}
          <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs text-ggc-subtle">
            <div className="flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-ggc-gold" />
              <span>{student.name}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <School className="w-4 h-4 text-ggc-gold" />
              <span>{student.school} ({student.grade})</span>
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
      </div>

      {/* Top 3 Potential Signatures Comparison */}
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-black text-ggc-dark flex items-center gap-2">
            <Award className="w-5 h-5 text-ggc" />
            Top 3 Signature Potensi Unggulan Anda
          </h3>
          <p className="text-xs text-gray-500">
            Dihitung dari skor performa subdimensi bakat dan preferensi penalaran alami Anda
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {results.potentialSignatures.map((sig, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-2xl border transition-all flex flex-col justify-between ${
                idx === 0
                  ? "bg-white border-ggc-gold shadow-md ring-2 ring-ggc-gold/20"
                  : "bg-white border-gray-200 shadow-sm hover:border-gray-300"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${
                      idx === 0
                        ? "bg-ggc-gold text-ggc-dark"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    0{idx + 1}
                  </span>
                  <span className="text-xs font-black text-ggc">
                    Skor: {sig.score.toFixed(1)} / 5.0
                  </span>
                </div>
                <h4 className="font-bold text-ggc-dark text-base mb-1">{sig.title}</h4>
                <div className="text-xs font-semibold text-ggc-gold-dark mb-2">
                  {sig.archetype}
                </div>
                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                  {sig.tagline}
                </p>
              </div>

              <div className="pt-3 border-t border-gray-100 flex flex-wrap gap-1.5">
                {sig.highlightedTraits.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] font-medium bg-gray-50 text-gray-600 px-2 py-0.5 rounded-md border border-gray-200"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MATRIX 2: STUDY PROFILE MATCHING SECTION */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-black text-ggc-dark flex items-center gap-2">
              <Compass className="w-5 h-5 text-ggc" />
              Rekomendasi Program Studi & Analisis Kecocokan (Matrix 2)
            </h3>
            <p className="text-xs text-gray-500">
              Hasil komparasi profil bakat, minat, dan kesiapan akademik Anda terhadap benchmark jurusan perguruan tinggi
            </p>
          </div>

          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 self-start sm:self-auto">
            Top Match: {topMajor?.majorName} ({topMajor?.fitScore}%)
          </span>
        </div>

        <div className="space-y-4">
          {results.studyRecommendations.map((rec, idx) => (
            <div
              key={rec.id}
              className={`p-6 sm:p-7 rounded-3xl bg-white border shadow-sm transition-all hover:shadow-md ${
                idx === 0
                  ? "border-ggc-gold/60 ring-2 ring-ggc-gold/20"
                  : "border-gray-200"
              }`}
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                      idx === 0
                        ? "bg-ggc text-ggc-gold"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    #{idx + 1}
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-ggc-dark">
                      {rec.majorName}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {rec.faculty} • <span className="font-semibold text-ggc">{rec.cluster}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-2xl font-black text-ggc-dark">
                      {rec.fitScore}%
                    </div>
                    <div className="text-[10px] text-gray-400 font-semibold uppercase">
                      Study Fit Score
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${rec.badgeColor}`}
                  >
                    {rec.fitLevel}
                  </span>
                </div>
              </div>

              {/* Insights Grid: Why This Fit & What to Watch Out For */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-5">
                {/* Why This Fit */}
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-emerald-900 mb-1">
                      Mengapa Jurusan Ini Cocok (Why This Fit?)
                    </h5>
                    <p className="text-xs text-emerald-950/80 leading-relaxed">
                      {rec.whyThisFit}
                    </p>
                  </div>
                </div>

                {/* What to Watch Out For */}
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-amber-900 mb-1">
                      Hal yang Perlu Diantisipasi (What to Watch Out For?)
                    </h5>
                    <p className="text-xs text-amber-950/80 leading-relaxed">
                      {rec.whatToWatchOutFor}
                    </p>
                  </div>
                </div>
              </div>

              {/* Career Pathways */}
              <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-ggc" />
                    Prospek Profesi:
                  </span>
                  {rec.careerProspects.map((career) => (
                    <span
                      key={career}
                      className="text-[11px] font-semibold text-ggc bg-ggc-subtle px-2.5 py-0.5 rounded-lg border border-ggc/15"
                    >
                      {career}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MATRIX 1 DETAIL: TALENT SUBDIMENSIONS & 7 DIMENSIONS OVERVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 6 Talent Subdimensions */}
        <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-sm">
          <div className="mb-4">
            <h4 className="text-base font-bold text-ggc-dark flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-ggc" />
              6 Pilar Subdimensi Bakat (Talent Matrix)
            </h4>
            <p className="text-xs text-gray-500">
              Evaluasi mendalam daya analitis, verbal, spasial, hingga intuisi sosial
            </p>
          </div>

          <div className="space-y-4">
            {results.talentSubdimensions.map((sub) => (
              <div key={sub.key}>
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="text-gray-800">{sub.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 font-normal">
                      Skor {sub.score.toFixed(1)} / 5.0
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        sub.level === "Tinggi"
                          ? "bg-emerald-100 text-emerald-800"
                          : sub.level === "Sedang"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {sub.level}
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-ggc to-ggc-gold rounded-full"
                    style={{ width: `${sub.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 7 Holistic Assessment Dimensions */}
        <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-sm">
          <div className="mb-4">
            <h4 className="text-base font-bold text-ggc-dark flex items-center gap-2">
              <Layers className="w-4 h-4 text-ggc" />
              Skor 7 Dimensi Evaluasi Holistik
            </h4>
            <p className="text-xs text-gray-500">
              Keseimbangan antara bakat, minat, nilai pribadi, dan kesiapan transisi kuliah
            </p>
          </div>

          <div className="space-y-4">
            {results.dimensionScores.map((dim) => (
              <div key={dim.category}>
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="text-gray-800">{dim.name.split("(")[0]}</span>
                  <span className="text-ggc font-black">
                    {dim.score.toFixed(1)} / 5.0 ({dim.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-ggc-light to-ggc-gold rounded-full"
                    style={{ width: `${dim.percentage}%` }}
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">
                  {dim.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Narrative Synthesis & Next Actions */}
      <div className="p-8 rounded-3xl bg-ggc-subtle/50 border border-ggc/20 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-ggc-gold-dark">
              Sintesis Hasil Asesmen GGC
            </span>
            <h3 className="text-xl font-black text-ggc-dark">
              Langkah Sukses Menuju Bangku Perkuliahan
            </h3>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
              {results.summaryNarrative}
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto">
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-xs font-bold text-white bg-ggc hover:bg-ggc-light shadow-md transition-all text-center"
            >
              <Download className="w-4 h-4 text-ggc-gold" />
              <span>Unduh Dokumen PDF Resmi</span>
            </button>
            <Link
              href="/student/dashboard"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-ggc bg-white border border-ggc/20 hover:bg-ggc-tint shadow-sm transition-all text-center"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Beranda Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
