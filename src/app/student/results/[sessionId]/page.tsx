"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Sparkles,
  Download,
  ArrowLeft,
  ArrowRight,
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
  Printer,
  FileText,
  Share2,
  Scale,
  Search,
  CheckCircle2,
  X,
} from "lucide-react";
import { ScoringResult, DimensionScore, StudyRecommendation } from "@/lib/scoring";
import CountUp from "@/components/results/CountUp";
import ScoreRing from "@/components/results/ScoreRing";
import RadarChart from "@/components/results/RadarChart";
import AudioNarrator from "@/components/results/AudioNarrator";
import MajorCompareModal from "@/components/results/MajorCompareModal";
import MajorDetailModal from "@/components/results/MajorDetailModal";
import DimensionDetailModal from "@/components/results/DimensionDetailModal";
import ActionPlanRoadmap from "@/components/results/ActionPlanRoadmap";
import ShareCardModal from "@/components/results/ShareCardModal";
import CareerOrientationSection from "@/components/results/CareerOrientationSection";
import CareerProfileModal from "@/components/results/CareerProfileModal";
import {
  generateCareerOrientation,
  CareerProfileInput,
  CareerOrientationSynthesis,
} from "@/lib/career-orientation";

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
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-ggc-gold-dark dark:text-ggc-gold">
            {eyebrow}
          </span>
          <h2 id={id} className="fluid-section-title font-black text-ggc-dark dark:text-white tracking-tight leading-tight">
            {title}
          </h2>
          {description && <p className="text-xs sm:text-sm text-gray-500 dark:text-[#A0B9AE] mt-1 max-w-2xl">{description}</p>}
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
  Tinggi: "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60",
  Sedang: "bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800/60",
  Berkembang: "bg-gray-100 dark:bg-[#07261B] text-gray-600 dark:text-gray-300 border-gray-200 dark:border-[#103D2B]",
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

  // Interactive Features State
  const [selectedDimension, setSelectedDimension] = useState<DimensionScore | null>(null);
  const [selectedMajorForDetail, setSelectedMajorForDetail] = useState<StudyRecommendation | null>(null);
  const [selectedMajorsForCompare, setSelectedMajorsForCompare] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [clusterFilter, setClusterFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeNav, setActiveNav] = useState<string>("overview");

  // Career Orientation & Experience State
  const [careerProfile, setCareerProfile] = useState<CareerProfileInput | null>(null);
  const [careerOrientation, setCareerOrientation] = useState<CareerOrientationSynthesis | null>(null);
  const [isCareerModalOpen, setIsCareerModalOpen] = useState(false);

  const handleCareerProfileSaved = (updatedInput: CareerProfileInput) => {
    setCareerProfile(updatedInput);
    if (data?.results) {
      const newOrientation = generateCareerOrientation(data.results, updatedInput);
      setCareerOrientation(newOrientation);
    }
  };

  const handleToggleCompare = (majorId: string) => {
    setSelectedMajorsForCompare((prev) => {
      if (prev.includes(majorId)) {
        return prev.filter((id) => id !== majorId);
      }
      if (prev.length >= 3) {
        alert("Maksimal 3 jurusan dapat dibandingkan secara bersamaan.");
        return prev;
      }
      return [...prev, majorId];
    });
  };

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

        // Load career profile from API or localStorage
        let loadedProfile: CareerProfileInput | null = null;
        try {
          const cRes = await fetch(`/api/assessment/career-profile?sessionId=${sessionId}`);
          if (cRes.ok) {
            const cData = await cRes.json();
            if (cData.profile) {
              loadedProfile = cData.profile;
            }
          }
        } catch (cErr) {
          console.warn("Could not fetch remote career profile:", cErr);
        }

        if (!loadedProfile && typeof window !== "undefined") {
          const cached = localStorage.getItem("ggc_career_profile_data");
          if (cached) {
            try {
              loadedProfile = JSON.parse(cached);
            } catch {}
          }
        }

        setCareerProfile(loadedProfile);
        setCareerOrientation(generateCareerOrientation(json.results, loadedProfile));
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

  const handlePrintPage = () => {
    window.print();
  };

  // Automatically trigger print dialog if ?print=true is present in URL
  useEffect(() => {
    if (typeof window !== "undefined" && data) {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("print") === "true") {
        const timer = setTimeout(() => {
          window.print();
        }, 600);
        return () => clearTimeout(timer);
      }
    }
  }, [data]);

  if (loading) {
    return <ResultsSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="max-w-lg mx-auto my-12 p-8 rounded-3xl bg-white dark:bg-[#07261B] border border-red-200 dark:border-red-900/40 shadow-xl text-center transition-colors">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-50 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Gagal Membuka Laporan</h3>
        <p className="text-xs text-gray-600 dark:text-[#A0B9AE] mb-6">{error || "Data asesmen tidak ditemukan."}</p>
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

  const filteredRecommendations = results.studyRecommendations.filter((rec) => {
    const matchesCluster = clusterFilter === "ALL" || rec.cluster === clusterFilter;
    const matchesSearch =
      searchQuery.trim() === "" ||
      rec.majorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.faculty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.careerProspects.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCluster && matchesSearch;
  });

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
    <div className="space-y-12 pb-28 sm:pb-16">
      {/* ------------------------------------------------------------------ */}
      {/* Top Action & Navigation Bar (Hidden when printing/saving PDF)      */}
      {/* ------------------------------------------------------------------ */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-[#C7DCD2] hover:text-ggc dark:hover:text-ggc-gold transition-colors bg-white dark:bg-[#07261B] px-3 py-2 rounded-xl border border-gray-200 dark:border-[#0E4230] shadow-2xs hover:shadow-xs"
            title="Kembali ke Halaman Utama"
          >
            <Compass className="w-3.5 h-3.5 text-ggc-gold" />
            <span className="hidden sm:inline">Halaman Utama</span>
          </Link>
          <span className="text-xs text-gray-400 dark:text-gray-600">/</span>
          <Link
            href="/student/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-[#C7DCD2] hover:text-ggc dark:hover:text-ggc-gold transition-colors bg-white dark:bg-[#07261B] px-3 py-2 rounded-xl border border-gray-200 dark:border-[#0E4230] shadow-2xs hover:shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard Siswa</span>
          </Link>
          <span className="text-xs text-gray-400 dark:text-gray-600">/</span>
          <span className="text-xs font-bold text-ggc-dark dark:text-white" aria-current="page">
            Laporan Hasil Asesmen
          </span>
        </nav>

        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Share Card Modal Trigger */}
          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs font-bold text-ggc-dark dark:text-amber-300 bg-ggc-gold-subtle dark:bg-amber-950/60 hover:bg-ggc-gold/20 dark:hover:bg-amber-900/60 border border-ggc-gold/40 shadow-2xs hover:shadow transition-all cursor-pointer"
            title="Bagikan Kartu Prestasi Siswa"
          >
            <Share2 className="w-3.5 h-3.5 text-ggc-gold-dark dark:text-ggc-gold" />
            <span className="hidden sm:inline">Bagikan Kartu</span>
          </button>

          {/* Primary Action: Direct Print / Save as PDF of this exact page */}
          <button
            type="button"
            onClick={handlePrintPage}
            className="group relative inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs font-bold text-ggc-dark bg-gradient-to-r from-[#E6D5A8] via-ggc-gold to-ggc-gold-dark shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all overflow-hidden cursor-pointer"
            title="Cetak langsung halaman ini atau simpan sebagai file PDF berkualitas tinggi"
          >
            <Printer className="w-4 h-4 text-ggc-dark group-hover:scale-110 transition-transform" />
            <span>Cetak / Simpan PDF</span>
          </button>

          {/* Secondary Action: Server-generated standalone PDF */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs font-bold text-gray-700 dark:text-white bg-white dark:bg-[#07261B] hover:bg-gray-50 dark:hover:bg-[#0A3324] border border-gray-200 dark:border-[#0E4230] shadow-2xs hover:shadow transition-all disabled:opacity-60 cursor-pointer"
            title="Unduh berkas PDF terpisah yang di-generate server"
          >
            {isDownloadingPdf ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-ggc dark:text-ggc-gold" />
            ) : (
              <Download className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
            )}
            <span className="hidden sm:inline">{isDownloadingPdf ? "Memproses..." : "File .pdf"}</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* STICKY IN-PAGE SUB-NAVIGATION (SMOOTH ANCHORS)                     */}
      {/* ------------------------------------------------------------------ */}
      <div className="no-print sticky top-20 z-30 bg-white/95 dark:bg-[#07261B]/95 backdrop-blur-md rounded-2xl border border-gray-200/90 dark:border-[#0E4230] shadow-sm p-1.5 sm:p-2 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none snap-x transition-colors">
        <div className="flex items-center gap-1 shrink-0">
          {[
            { id: "overview", label: "Ringkasan" },
            { id: "dimensi", label: "7 Dimensi" },
            { id: "signatures", label: "Signature" },
            { id: "jurusan", label: "Rekomendasi Jurusan" },
            { id: "orientasi-karir", label: "🧭 Orientasi Karir" },
            { id: "bakat", label: "Subdimensi Bakat" },
            { id: "rencana-aksi", label: "Rencana Aksi" },
            { id: "sintesis", label: "Sintesis Sukses" },
          ].map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={() => setActiveNav(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap snap-start ${
                activeNav === item.id
                  ? "bg-ggc text-white shadow-2xs"
                  : "text-gray-600 dark:text-[#C7DCD2] hover:text-ggc dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#0A3324]"
              }`}
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-auto pl-2 border-l border-gray-200 dark:border-[#0E4230]">
          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="p-1.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-ggc dark:text-ggc-gold hover:bg-ggc-subtle dark:hover:bg-[#0A3324] flex items-center gap-1.5 transition-colors border border-ggc/20 dark:border-ggc-gold/30 cursor-pointer"
            title="Bagikan Persona Studi (Instagram Story & WA)"
          >
            <Share2 className="w-3.5 h-3.5 text-ggc-gold" />
            <span className="hidden md:inline text-[11px]">Bagikan Persona Studi</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* OFFICIAL PRINT HEADER (VISIBLE ONLY ON PRINT / SAVE AS PDF)        */}
      {/* ------------------------------------------------------------------ */}
      <div className="print-only mb-6 pb-4 border-b-2 border-ggc-gold">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="GGC Logo" className="w-12 h-12 object-contain" />
            <div>
              <h1 className="text-lg font-black text-ggc-dark tracking-tight leading-none">
                GO GREAT CAREER (GGC)
              </h1>
              <p className="text-[10px] font-bold text-ggc tracking-wider uppercase mt-1">
                STUDY FIT ASSESSMENT™ • LAPORAN RESMI HASIL ASESMEN SISWA
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-300 text-[9px] font-bold uppercase">
              84-ITEM MULTI-MATRIX EVALUATION
            </span>
            <p className="text-[9px] text-gray-500 mt-1 font-mono">
              NO. REG: GGC-SFA-{(results.sessionId || "SESI").slice(0, 8).toUpperCase()}-2026
            </p>
          </div>
        </div>

        {/* Student metadata box for printed document */}
        <div className="mt-3 p-3 rounded-lg bg-gray-50 border border-gray-200 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
          <div>
            <span className="font-bold text-ggc">Nama Siswa:</span> {student.name}
          </div>
          <div>
            <span className="font-bold text-ggc">Asal Sekolah:</span> {student.school}
          </div>
          <div>
            <span className="font-bold text-ggc">Jenjang / Kelas:</span> {student.grade}
          </div>
          <div>
            <span className="font-bold text-ggc">Tanggal Evaluasi:</span>{" "}
            {new Date(results.calculatedAt).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* HERO: Certificate-style Potential Signature                         */}
      {/* ------------------------------------------------------------------ */}
      <section
        id="overview"
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
              className="hero-rise hero-rise-delay-1 mt-1 font-display fluid-hero-title font-black tracking-tight leading-[1.05] gold-gradient-text"
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

            <div className="hero-rise hero-rise-delay-3 mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setIsShareModalOpen(true)}
                className="no-print inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#E6D5A8] via-ggc-gold to-ggc-gold-dark text-ggc-dark text-xs font-black shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-[0.99] transition-all"
              >
                <Share2 className="w-4 h-4 text-ggc-dark" />
                <span>Bagikan Persona Studi (Instagram Story & WA)</span>
              </button>
            </div>

            <div className="hero-rise hero-rise-delay-3 mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-ggc-subtle/90">
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
            <div
              onClick={() => topMajor && setSelectedMajorForDetail(topMajor)}
              className="relative overflow-hidden rounded-3xl bg-white/[0.07] backdrop-blur-xl border border-ggc-gold/40 p-6 sm:p-8 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)] cursor-pointer hover:border-ggc-gold hover:shadow-[0_25px_70px_-15px_rgba(197,168,105,0.3)] transition-all group"
              title="Klik untuk membuka bedah kampus, prospek gaji, dan mata kuliah #1 jurusan ini"
            >
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
                <p className="mt-1 text-xl font-black text-white leading-tight group-hover:text-ggc-gold transition-colors">
                  {topMajor?.majorName}
                </p>
                <p className="text-xs text-ggc-subtle/70 mt-0.5">{topMajor?.faculty}</p>

                <div className="mt-3 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-ggc-gold text-ggc-dark text-[11px] font-black uppercase tracking-wider shadow">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {topMajor?.fitLevel}
                  </span>
                  <span className="no-print inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold border border-white/20 transition-colors">
                    Bedah Detail ↗
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Voice Narration Player */}
      <AudioNarrator
        studentName={firstName}
        signatureTitle={primarySignature?.title || ""}
        topMajorName={topMajor?.majorName || ""}
        fitScore={topMajor?.fitScore || 0}
        narrativeText={results.summaryNarrative}
      />

      {/* ------------------------------------------------------------------ */}
      {/* Quick Stats                                                        */}
      {/* ------------------------------------------------------------------ */}
      <section aria-label="Ringkasan skor" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="reveal-on-scroll group relative overflow-hidden rounded-2xl bg-white dark:bg-[#07261B] border border-gray-200/80 dark:border-[#0E4230] p-4 sm:p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-ggc-gold/50 transition-all duration-300"
            >
              <div
                className="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-ggc-gold/10 group-hover:bg-ggc-gold/20 transition-colors"
                aria-hidden="true"
              />
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-ggc-subtle dark:bg-[#041B12] text-ggc dark:text-ggc-gold flex items-center justify-center mb-3 group-hover:bg-ggc group-hover:text-ggc-gold transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{stat.label}</div>
                <div className="text-2xl sm:text-3xl font-black text-ggc-dark dark:text-white mt-0.5">
                  <CountUp value={stat.value} decimals={stat.decimals} />
                  <span className="text-sm sm:text-base font-bold text-gray-400 dark:text-gray-500">{stat.suffix}</span>
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 truncate" title={stat.hint}>
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
      <section id="dimensi" aria-labelledby="holistic-title">
        <SectionHeader
          id="holistic-title"
          eyebrow="Peta Profil Holistik"
          title="Skor 7 Dimensi Evaluasi"
          description="Keseimbangan antara bakat, minat, kepribadian, nilai pribadi, akademik, karier, dan kesiapan transisi kuliah."
          icon={Layers}
        />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-6">
          {/* Radar */}
          <div className="reveal-on-scroll relative overflow-hidden rounded-3xl bg-white dark:bg-[#07261B] border border-gray-200 dark:border-[#0E4230] shadow-sm p-6 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-br from-ggc-tint via-white to-ggc-gold-subtle dark:from-[#052016] dark:via-[#07261B] dark:to-[#052016] pointer-events-none" aria-hidden="true" />
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
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-[#0E4230] text-center">
                <span className="text-[11px] text-gray-500 dark:text-gray-400 italic">
                  💡 Klik salah satu dimensi di samping untuk membuka panduan pengembangan praktis.
                </span>
              </div>
            </div>
          </div>

          {/* Dimension list with interactive drill-down */}
          <div className="reveal-on-scroll rounded-3xl bg-white dark:bg-[#07261B] border border-gray-200 dark:border-[#0E4230] shadow-sm p-6 space-y-2 transition-colors">
            {results.dimensionScores.map((dim) => {
              const isTop = dim.category === strongestDimension?.category;
              return (
                <div
                  key={dim.category}
                  onClick={() => setSelectedDimension(dim)}
                  className="group p-2.5 -mx-2 rounded-2xl hover:bg-ggc-subtle/50 dark:hover:bg-[#0A3324] border border-transparent hover:border-ggc/20 dark:hover:border-ggc-gold/30 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-ggc/30"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedDimension(dim);
                    }
                  }}
                  title="Klik untuk membuka analisis mendalam & panduan pengembangan dimensi ini"
                >
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <span className="text-gray-800 dark:text-white flex items-center gap-1.5 group-hover:text-ggc dark:group-hover:text-ggc-gold transition-colors">
                      {isTop && <Crown className="w-3.5 h-3.5 text-ggc-gold-dark dark:text-ggc-gold" aria-label="Tertinggi" />}
                      {dim.name}
                    </span>
                    <span className="text-ggc dark:text-ggc-gold font-black tabular-nums flex items-center gap-1">
                      {dim.score.toFixed(1)}
                      <span className="text-gray-400 dark:text-gray-500 font-semibold"> / 5 · {dim.percentage}%</span>
                      <ArrowRight className="w-3.5 h-3.5 text-ggc-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-ggc-subtle dark:bg-[#041B12] overflow-hidden">
                    <div
                      className={`bar-grow h-full rounded-full ${
                        isTop
                          ? "bg-gradient-to-r from-ggc via-ggc-light to-ggc-gold"
                          : "bg-gradient-to-r from-ggc-light to-ggc-gold/80"
                      }`}
                      style={{ width: `${dim.percentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[11px] text-gray-500 dark:text-[#A0B9AE]">
                    <p className="line-clamp-1">{dim.description}</p>
                    <span className="hidden sm:inline text-ggc dark:text-ggc-gold font-bold text-[10px] shrink-0 ml-2 group-hover:underline">
                      Detail Tips →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Top 3 Signatures: Podium                                           */}
      {/* ------------------------------------------------------------------ */}
      <section id="signatures" aria-labelledby="signatures-title">
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
                    : `${idx === 1 ? "md:order-1" : "md:order-3"} bg-white dark:bg-[#07261B] border border-gray-200 dark:border-[#0E4230] shadow-sm hover:shadow-lg hover:border-ggc-gold/50`
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
                        isFirst ? "bg-ggc-gold text-ggc-dark" : "bg-ggc-subtle dark:bg-emerald-950/80 text-ggc dark:text-emerald-300 border border-transparent dark:border-emerald-800/40"
                      }`}
                    >
                      {isFirst ? <Crown className="w-3.5 h-3.5" /> : null}#{idx + 1}
                    </span>
                    <span className={`text-xs font-black tabular-nums ${isFirst ? "text-ggc-gold" : "text-ggc dark:text-ggc-gold"}`}>
                      {sig.score.toFixed(1)} / 5.0
                    </span>
                  </div>

                  <h3 className={`font-display font-black text-xl leading-tight ${isFirst ? "text-white" : "text-ggc-dark dark:text-white"}`}>
                    {sig.title}
                  </h3>
                  <div className={`text-xs font-semibold mt-1 ${isFirst ? "text-ggc-gold" : "text-ggc-gold-dark dark:text-ggc-gold"}`}>
                    {sig.archetype}
                  </div>
                  <p className={`text-xs leading-relaxed mt-3 ${isFirst ? "text-ggc-subtle/85" : "text-gray-600 dark:text-[#A0B9AE]"}`}>
                    {sig.tagline}
                  </p>

                  {/* Score bar */}
                  <div className={`mt-4 h-1.5 rounded-full overflow-hidden ${isFirst ? "bg-white/15" : "bg-gray-100 dark:bg-[#041B12]"}`}>
                    <div
                      className="bar-grow h-full rounded-full bg-gradient-to-r from-ggc-gold to-[#E6D5A8]"
                      style={{ width: `${toPercent(sig.score)}%` }}
                    />
                  </div>

                  <ul className="mt-auto pt-4 flex flex-wrap gap-1.5">
                    {sig.highlightedTraits.map((t) => (
                      <li
                        key={t}
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                          isFirst
                            ? "bg-white/10 text-white border-white/20"
                            : "bg-gray-50 dark:bg-[#041B12] text-gray-600 dark:text-[#C7DCD2] border-gray-200 dark:border-[#103D2B]"
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
      <section id="jurusan" aria-labelledby="majors-title">
        <SectionHeader
          id="majors-title"
          eyebrow="Matrix 2 · Study Profile Matching"
          title="Rekomendasi Program Studi"
          description="Komparasi profil bakat, minat, dan kesiapan akademik Anda terhadap benchmark jurusan perguruan tinggi."
          icon={Compass}
          aside={
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
                <Target className="w-3.5 h-3.5" />
                Top Match: {topMajor?.majorName} ({topMajor?.fitScore}%)
              </span>
              {selectedMajorsForCompare.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsCompareModalOpen(true)}
                  className="no-print inline-flex items-center gap-1.5 text-xs font-bold text-ggc-dark bg-gradient-to-r from-[#E6D5A8] via-ggc-gold to-ggc-gold-dark px-3 py-1.5 rounded-xl shadow-xs hover:shadow cursor-pointer"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Bandingkan ({selectedMajorsForCompare.length})</span>
                </button>
              )}
            </div>
          }
        />

        {/* Interactive Search & Cluster Filter Toolbar */}
        <div className="no-print my-4 p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#07261B] border border-gray-200 dark:border-[#0E4230] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors">
          {/* Cluster filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: "ALL", label: "Semua Klaster" },
              { id: "Saintek", label: "Sains & Teknologi" },
              { id: "Soshum", label: "Sosial Humaniora" },
              { id: "Seni & Industri Kreatif", label: "Seni & Kreatif" },
            ].map((cl) => (
              <button
                key={cl.id}
                type="button"
                onClick={() => setClusterFilter(cl.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  clusterFilter === cl.id
                    ? "bg-ggc text-white shadow-2xs"
                    : "bg-gray-100 dark:bg-[#041B12] text-gray-600 dark:text-[#C7DCD2] hover:bg-gray-200 dark:hover:bg-[#093525] border border-transparent dark:border-[#103D2B]"
                }`}
              >
                {cl.label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari jurusan atau profesi..."
              className="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-white dark:bg-[#041B12] text-gray-900 dark:text-white border border-gray-200 dark:border-[#103D2B] focus:outline-none focus:ring-2 focus:ring-ggc/30 focus:border-ggc placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-5">
          {filteredRecommendations.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-[#07261B] rounded-3xl border border-gray-200 dark:border-[#0E4230] transition-colors">
              <Search className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-xs text-gray-600 dark:text-[#A0B9AE] font-semibold">
                Tidak ada program studi yang cocok dengan kata kunci & filter Anda.
              </p>
              <button
                type="button"
                onClick={() => {
                  setClusterFilter("ALL");
                  setSearchQuery("");
                }}
                className="mt-3 px-4 py-2 rounded-xl text-xs font-bold text-ggc dark:text-ggc-gold bg-ggc-subtle dark:bg-[#041B12] hover:bg-ggc/15 dark:hover:bg-[#0A3324] transition-colors cursor-pointer"
              >
                Reset Filter & Pencarian
              </button>
            </div>
          ) : (
            filteredRecommendations.map((rec, idx) => {
              const isFirst = idx === 0 && clusterFilter === "ALL" && searchQuery === "";
              const isSelectedForCompare = selectedMajorsForCompare.includes(rec.id);

              return (
                <article
                  key={rec.id}
                  className={`reveal-on-scroll relative overflow-hidden rounded-3xl bg-white dark:bg-[#07261B] border shadow-sm transition-all duration-300 hover:shadow-xl ${
                    isFirst ? "border-ggc-gold/70 ring-2 ring-ggc-gold/25" : "border-gray-200 dark:border-[#0E4230] hover:border-ggc/30 dark:hover:border-ggc-gold/40"
                  }`}
                >
                  {isFirst && (
                    <div className="absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl bg-gradient-to-r from-ggc-gold to-ggc-gold-dark text-ggc-dark text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Best Match
                    </div>
                  )}
                  <div
                    className={`absolute left-0 inset-y-0 w-1.5 ${
                      isFirst ? "bg-gradient-to-b from-ggc-gold to-ggc" : "bg-ggc-subtle dark:bg-[#0E4230]"
                    }`}
                    aria-hidden="true"
                  />

                  <div className="p-6 sm:p-7 pl-7 sm:pl-9">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-5 border-b border-gray-100 dark:border-[#0E4230]">
                      <ScoreRing value={rec.fitScore} size={84} stroke={8} label="Fit" />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-black text-gray-400 dark:text-gray-500">#{idx + 1}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${rec.badgeColor}`}>
                              {rec.fitLevel}
                            </span>
                            <span className="text-[11px] font-semibold text-ggc dark:text-ggc-gold bg-ggc-subtle dark:bg-[#041B12] px-2 py-0.5 rounded-full border border-transparent dark:border-[#0E4230]">
                              {rec.cluster}
                            </span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedMajorForDetail(rec);
                              }}
                              className="no-print inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-ggc hover:bg-ggc-dark transition-all shadow-xs hover:shadow-md active:scale-95 cursor-pointer"
                              title="Buka panel rekomendasi kampus PTN/PTS, bedah gaji, dan mata kuliah kunci"
                            >
                              <School className="w-3.5 h-3.5 text-ggc-gold" />
                              <span>Bedah Kampus & Gaji ↗</span>
                            </button>

                            {/* Compare Toggle Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleCompare(rec.id);
                              }}
                              className={`no-print inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                isSelectedForCompare
                                  ? "bg-ggc text-white border-ggc shadow-2xs"
                                  : "bg-gray-50 dark:bg-[#041B12] text-gray-700 dark:text-[#C7DCD2] border-gray-200 dark:border-[#103D2B] hover:border-ggc hover:text-ggc dark:hover:text-ggc-gold"
                              }`}
                              title="Pilih jurusan ini untuk komparasi multi-matriks"
                            >
                              <Scale className="w-3.5 h-3.5 text-ggc-gold" />
                              <span>{isSelectedForCompare ? "✓ Terpilih" : "+ Bandingkan"}</span>
                            </button>
                          </div>
                        </div>
                        <h3
                          onClick={() => setSelectedMajorForDetail(rec)}
                          className="text-lg sm:text-xl font-black text-ggc-dark dark:text-white mt-1.5 cursor-pointer hover:text-ggc dark:hover:text-ggc-gold transition-colors inline-flex items-center gap-2 group/title"
                          title="Klik untuk membuka bedah kampus & prospek karier"
                        >
                          <span>{rec.majorName}</span>
                          <span className="no-print opacity-0 group-hover/title:opacity-100 text-xs text-ggc-gold font-bold transition-opacity">
                            (Bedah Detail ↗)
                          </span>
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-[#A0B9AE]">{rec.faculty}</p>
                      </div>
                    </div>

                    {/* Key attributes vs benchmark */}
                    {rec.keyAttributes?.length > 0 && (
                      <div className="mt-5">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
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
                                  <span className="text-gray-700 dark:text-[#C7DCD2] truncate pr-2">{attr.name}</span>
                                  <span className={`tabular-nums ${meets ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"}`}>
                                    {attr.score.toFixed(1)}
                                    <span className="text-gray-400 dark:text-gray-500"> / {attr.benchmark.toFixed(1)}</span>
                                  </span>
                                </div>
                                <div className="relative h-2 rounded-full bg-gray-100 dark:bg-[#041B12]">
                                  <div className="absolute inset-0 overflow-hidden rounded-full">
                                    <div
                                      className={`bar-grow h-full rounded-full ${
                                        meets ? "bg-gradient-to-r from-ggc to-emerald-500" : "bg-gradient-to-r from-amber-400 to-ggc-gold"
                                      }`}
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                  <div
                                    className="absolute -top-1 -bottom-1 w-0.5 bg-ggc-dark dark:bg-ggc-gold rounded"
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
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-white dark:from-[#052016] dark:to-[#072B1E] border border-emerald-200/80 dark:border-emerald-800/40 flex items-start gap-3 transition-colors">
                        <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                          <Lightbulb className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 mb-1">Mengapa Jurusan Ini Cocok?</h5>
                          <p className="text-xs text-emerald-950/80 dark:text-[#C7DCD2] leading-relaxed">{rec.whyThisFit}</p>
                        </div>
                      </div>
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-white dark:from-[#201705] dark:to-[#2B2007] border border-amber-200/80 dark:border-amber-800/40 flex items-start gap-3 transition-colors">
                        <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-amber-900 dark:text-amber-300 mb-1">Hal yang Perlu Diantisipasi</h5>
                          <p className="text-xs text-amber-950/80 dark:text-[#C7DCD2] leading-relaxed">{rec.whatToWatchOutFor}</p>
                        </div>
                      </div>
                    </div>

                    {/* Career prospects & Footer Action */}
                    <div className="pt-4 border-t border-gray-100 dark:border-[#0E4230] flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1 mr-1">
                          <Briefcase className="w-3.5 h-3.5 text-ggc dark:text-ggc-gold" />
                          Prospek Profesi:
                        </span>
                        {rec.careerProspects.map((career) => (
                          <span
                            key={career}
                            className="text-[11px] font-semibold text-ggc dark:text-ggc-gold bg-ggc-subtle dark:bg-[#041B12] px-2.5 py-1 rounded-lg border border-ggc/15 dark:border-[#0E4230] hover:bg-ggc hover:text-white dark:hover:bg-ggc transition-colors"
                          >
                            {career}
                          </span>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedMajorForDetail(rec)}
                        className="no-print inline-flex items-center gap-1 text-xs font-bold text-ggc dark:text-ggc-gold hover:text-ggc-dark dark:hover:text-white hover:underline py-1 ml-auto cursor-pointer"
                      >
                        <span>Lihat Kampus Terbaik & Gaji</span>
                        <ArrowRight className="w-3.5 h-3.5 text-ggc-gold" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>

        {/* Floating Compare Dock Bar when >= 1 major is selected */}
        {selectedMajorsForCompare.length > 0 && (
          <div className="no-print fixed bottom-5 left-1/2 -translate-x-1/2 z-40 bg-ggc-dark/95 backdrop-blur-md text-white px-4 sm:px-6 py-3 rounded-2xl shadow-2xl border border-ggc-gold/40 flex items-center gap-3 sm:gap-4 animate-slide-up max-w-lg w-[92%] sm:w-auto justify-between">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-ggc-gold shrink-0" />
              <span className="text-xs font-bold truncate">
                {selectedMajorsForCompare.length} Jurusan Siap Dibandingkan
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsCompareModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-ggc-dark bg-gradient-to-r from-[#E6D5A8] via-ggc-gold to-ggc-gold-dark hover:shadow-md transition-all flex items-center gap-1"
              >
                <span>Buka Komparasi</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setSelectedMajorsForCompare([])}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white transition-colors"
                title="Batal pilih"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* SECTION ORIENTASI KARIR & PROYEKSI MASA DEPAN                      */}
      {/* ------------------------------------------------------------------ */}
      <section id="orientasi-karir" aria-labelledby="career-orientation-title">
        <SectionHeader
          id="career-orientation-title"
          eyebrow="Career Orientation & Pathways"
          title="Orientasi Karir & Proyeksi Masa Depan"
          description="Sintesis cerdas antara hasil psikometrik 84 butir soal Anda dengan pengalaman nyata (organisasi formal OSIS/BEM, komunitas non-formal Karang Taruna, hobi, dan jurusan Anda)."
          icon={Compass}
        />
        {careerOrientation && (
          <CareerOrientationSection
            orientation={careerOrientation}
            onOpenEditModal={() => setIsCareerModalOpen(true)}
          />
        )}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Talent Subdimensions                                               */}
      {/* ------------------------------------------------------------------ */}
      <section id="bakat" aria-labelledby="talent-title">
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
                idx === 0 ? "bg-ggc-gold-subtle dark:bg-amber-950/40 border-ggc-gold/50" : "bg-white dark:bg-[#07261B] border-gray-200 dark:border-[#0E4230]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${
                      idx === 0 ? "bg-ggc text-ggc-gold" : "bg-ggc-subtle dark:bg-[#041B12] text-ggc dark:text-emerald-400"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <h3 className="text-sm font-bold text-gray-800 dark:text-white leading-snug">{sub.name}</h3>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border shrink-0 ${LEVEL_STYLES[sub.level]}`}>
                  {sub.level}
                </span>
              </div>
              <div className="mt-4 flex items-end justify-between">
                <span className="text-2xl font-black text-ggc-dark dark:text-white tabular-nums">
                  {sub.score.toFixed(1)}
                  <span className="text-xs font-bold text-gray-400 dark:text-gray-500"> / 5.0</span>
                </span>
                <span className="text-xs font-bold text-ggc-gold-dark dark:text-ggc-gold">{sub.percentage}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-gray-100 dark:bg-[#041B12] overflow-hidden">
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
      {/* Interactive 100-Day Action Plan Roadmap                            */}
      {/* ------------------------------------------------------------------ */}
      <section id="rencana-aksi" aria-labelledby="action-plan-title">
        <SectionHeader
          id="action-plan-title"
          eyebrow="Interactive Roadmap"
          title="Rencana Aksi 100 Hari Menuju Kampus Impian"
          description="Checklist persiapan bertahap menuju universitas target. Centang langkah yang telah Anda selesaikan untuk memantau kemajuan Anda."
          icon={Target}
        />
        <ActionPlanRoadmap
          sessionId={results.sessionId}
          topMajorName={topMajor?.majorName || "Jurusan Impian"}
          signatureTitle={primarySignature?.title || "Potential Signature"}
        />
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Narrative Synthesis & CTA                                          */}
      {/* ------------------------------------------------------------------ */}
      <section
        id="sintesis"
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

          <div className="no-print shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto">
            <button
              type="button"
              onClick={handlePrintPage}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-ggc-dark bg-gradient-to-r from-[#E6D5A8] via-ggc-gold to-ggc-gold-dark shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-ggc-dark" />
              <span>Cetak / Simpan PDF Laporan</span>
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

      {/* ------------------------------------------------------------------ */}
      {/* OFFICIAL PRINT FOOTER (VISIBLE ONLY ON PRINT / SAVE AS PDF)        */}
      {/* ------------------------------------------------------------------ */}
      <div className="print-only mt-12 pt-6 border-t-2 border-gray-300 text-xs text-gray-600">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-ggc-dark text-sm">Go Great Career (GGC) Indonesia</p>
            <p className="text-[10px] text-gray-500 mt-0.5">
              Dokumen ini dicetak secara sah langsung dari Portal Resmi Siswa GGC Study Fit Assessment™.
            </p>
            <p className="text-[9px] text-gray-400 mt-1">
              Verifikasi Integritas Data: VALID & SECURE • Hak Cipta © {new Date().getFullYear()} Go Great Career
            </p>
          </div>
          <div className="text-right">
            <div className="inline-block px-3 py-1 rounded border border-ggc-gold bg-amber-50 text-[10px] font-bold text-amber-900 uppercase">
              STATUS: RESMI TERVERIFIKASI
            </div>
            <p className="text-[9px] text-gray-400 mt-1">
              ID Sesi: {results.sessionId}
            </p>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* MOBILE STICKY THUMB-BAR (ERGONOMI JANGKAUAN JEMPOL)                */}
      {/* ------------------------------------------------------------------ */}
      <aside
        aria-label="Aksi Cepat Hasil Asesmen"
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 p-3 pb-safe bg-white/95 dark:bg-[#07261B]/95 backdrop-blur-md border-t border-gray-200/90 dark:border-[#0E4230] shadow-2xl transition-transform no-print"
      >
        <div className="flex items-center gap-2 max-w-md mx-auto">
          {selectedMajorsForCompare.length > 0 ? (
            <button
              type="button"
              onClick={() => setIsCompareModalOpen(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl font-black text-white bg-ggc hover:bg-ggc-light active:scale-98 shadow-md text-xs transition-all"
            >
              <Scale className="w-4 h-4 text-ggc-gold" />
              <span>Bandingkan ({selectedMajorsForCompare.length}) Jurusan</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl font-black text-ggc-dark bg-gradient-to-r from-[#E6D5A8] via-ggc-gold to-ggc-gold-dark hover:shadow-md active:scale-98 shadow-xs text-xs transition-all"
            >
              <Share2 className="w-4 h-4 text-ggc-dark" />
              <span>Bagikan Persona (Story)</span>
            </button>
          )}

          <button
            type="button"
            onClick={handlePrintPage}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl font-bold text-gray-800 dark:text-gray-100 bg-gray-100 dark:bg-[#0E3827] hover:bg-gray-200 dark:hover:bg-[#124832] border border-gray-200 dark:border-[#17523A] active:scale-98 text-xs transition-all"
          >
            <Printer className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            <span>Cetak / PDF</span>
          </button>
        </div>
      </aside>

      {/* ------------------------------------------------------------------ */}
      {/* INTERACTIVE MODALS                                                 */}
      {/* ------------------------------------------------------------------ */}
      <MajorDetailModal
        major={selectedMajorForDetail}
        onClose={() => setSelectedMajorForDetail(null)}
      />

      <DimensionDetailModal
        dimension={selectedDimension}
        onClose={() => setSelectedDimension(null)}
      />

      <MajorCompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        majors={results.studyRecommendations.filter((m) => selectedMajorsForCompare.includes(m.id))}
        onRemoveMajor={(id) => setSelectedMajorsForCompare((prev) => prev.filter((mId) => mId !== id))}
      />

      <ShareCardModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        studentName={student.name}
        schoolName={student.school}
        signatureTitle={primarySignature?.title || ""}
        signatureArchetype={primarySignature?.archetype || ""}
        topMajors={results.studyRecommendations.map((m) => ({
          majorName: m.majorName,
          fitScore: m.fitScore,
          fitLevel: m.fitLevel,
          cluster: m.cluster,
        }))}
        sessionId={results.sessionId}
      />

      <CareerProfileModal
        isOpen={isCareerModalOpen}
        onClose={() => setIsCareerModalOpen(false)}
        initialData={careerProfile}
        onSaveSuccess={handleCareerProfileSaved}
      />
    </div>
  );
}
