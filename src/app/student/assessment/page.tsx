"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Compass,
  CheckCircle2,
  Clock,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Check,
  RefreshCw,
  Send,
  Grid,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  RotateCcw,
  Brain,
  GraduationCap,
  Briefcase,
  Award,
  Target,
  Zap,
  Coffee,
  X,
  Layers,
} from "lucide-react";

interface QuestionItem {
  id: string;
  number: number;
  question_text: string;
  options: Array<{
    value: number;
    label: string;
    shortLabel?: string;
  }>;
}

interface SessionData {
  id: string;
  status: string;
  started_at: string;
}

const QUESTIONS_PER_SECTION = 12;
const TOTAL_SECTIONS = 7; // 7 x 12 = 84 items

interface SectionMilestone {
  index: number;
  title: string;
  subtitle: string;
  dimensionBadge: string;
  theme: string;
  quote: string;
  rangeText: string;
  icon: React.ElementType;
}

const SECTION_MILESTONES: SectionMilestone[] = [
  {
    index: 0,
    title: "Tahap 1: Kalibrasi Bakat & Pola Pikir",
    subtitle: "Mengukur kecenderungan logika, analisis, dan daya tangkap alami Anda.",
    dimensionBadge: "Dimensi 1 · Bakat Alami",
    theme: "Fokus pada apa yang paling menggambarkan diri Anda, bukan apa yang dirasa 'paling benar'.",
    quote: "Jawablah dengan spontan dan jujur. Tidak ada jawaban salah dalam evaluasi bakat.",
    rangeText: "Soal 1 – 12",
    icon: Brain,
  },
  {
    index: 1,
    title: "Tahap 2: Eksplorasi Minat & Vokasi",
    subtitle: "Mengeksplorasi antusiasme intrinsik Anda terhadap berbagai bidang ilmu.",
    dimensionBadge: "Dimensi 2 · Minat Keilmuan",
    theme: "Menemukan topik keilmuan yang membuat Anda bersemangat mendalaminya.",
    quote: "Setiap pilihan membuka pintu baru dalam memetakan rumpun jurusan terbaik Anda.",
    rangeText: "Soal 13 – 24",
    icon: Compass,
  },
  {
    index: 2,
    title: "Tahap 3: Kepribadian & Gaya Kerja",
    subtitle: "Menilai karakter kepribadian, kenyamanan belajar, dan lingkungan ideal.",
    dimensionBadge: "Dimensi 3 · Karakter Kerja",
    theme: "Konsistensi adalah kunci. Rasakan ritmenya dan biarkan insting Anda memandu.",
    quote: "Mengetahui cara Anda merespon situasi adalah fondasi sukses perkuliahan.",
    rangeText: "Soal 25 – 36",
    icon: Sparkles,
  },
  {
    index: 3,
    title: "Tahap 4: Titik Tengah Asesmen (50%) 🎯",
    subtitle: "Titik balik penting! Menggali dorongan batin dan kepuasan berkarya.",
    dimensionBadge: "Dimensi 4 · Nilai Pribadi",
    theme: "Luar biasa! Setengah perjalanan evaluasi telah Anda lalui dengan gemilang.",
    quote: "Nilai hidup menentukan kepuasan jangka panjang Anda di dunia kampus dan karier.",
    rangeText: "Soal 37 – 48",
    icon: Target,
  },
  {
    index: 4,
    title: "Tahap 5: Kesiapan & Stamina Akademik",
    subtitle: "Menakar ketangguhan belajar terstruktur dan daya tahan materi kuliah.",
    dimensionBadge: "Dimensi 5 · Stamina Belajar",
    theme: "Semakin dalam instrumen ini, semakin presisi kalkulasi Study Fit Anda.",
    quote: "Kesiapan belajar adalah jembatan antara potensi bakat dengan prestasi nyata di kampus.",
    rangeText: "Soal 49 – 60",
    icon: GraduationCap,
  },
  {
    index: 5,
    title: "Tahap 6: Aspirasi & Arah Karier",
    subtitle: "Memproyeksikan peran profesional dan kontribusi industri impian Anda.",
    dimensionBadge: "Dimensi 6 · Aspirasi Karier",
    theme: "Tinggal 2 tahap lagi menuju garis akhir! Pertahankan fokus dan ketelitian.",
    quote: "Karier hebat dimulai dari pemahaman mendalam tentang arah yang ingin Anda tuju.",
    rangeText: "Soal 61 – 72",
    icon: Briefcase,
  },
  {
    index: 6,
    title: "Tahap 7: Final Sprint & Kesiapan Mental 🚀",
    subtitle: "Tahap penentu! 12 butir terakhir sebelum melihat laporan lengkap Anda.",
    dimensionBadge: "Dimensi 7 · Final Sprint",
    theme: "Langkah terakhir menuju pembukaan hasil evaluasi dan rekomendasi jurusan!",
    quote: "Selesaikan 12 butir ini dan saksikan Potential Signature serta Jurusan Terbaik Anda.",
    rangeText: "Soal 73 – 84",
    icon: Award,
  },
];

export default function StudentAssessmentPage() {
  const router = useRouter();

  // State
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination / Section state (0-indexed: 0 to 6)
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  // Auto-save feedback state: "saved" | "saving" | "error"
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error">("saved");

  // Modals & Drawers
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompletedSuccess, setIsCompletedSuccess] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Fetch initial questions and session
  useEffect(() => {
    async function loadAssessment() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/assessment/start");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Gagal memuat instrumen asesmen.");
        }

        setQuestions(data.questions || []);
        setAnswers(data.answers || {});
        setSessionData(data.session || null);

        // If already completed, redirect or show message
        if (data.session?.status === "COMPLETED") {
          setIsCompletedSuccess(true);
        }
      } catch (err: any) {
        console.error("Error loading assessment:", err);
        setError(err.message || "Terjadi kesalahan saat memuat data asesmen.");
      } finally {
        setLoading(false);
      }
    }

    loadAssessment();
  }, []);

  // 2. Calculated metrics
  const totalQuestions = questions.length || 84;
  const answeredCount = useMemo(() => {
    return Object.keys(answers).length;
  }, [answers]);

  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  // 3. Current section slice of 12 questions
  const currentSectionQuestions = useMemo(() => {
    const startIdx = currentSectionIndex * QUESTIONS_PER_SECTION;
    const endIdx = startIdx + QUESTIONS_PER_SECTION;
    return questions.slice(startIdx, endIdx);
  }, [questions, currentSectionIndex]);

  // Section answered count for current step
  const currentSectionAnsweredCount = useMemo(() => {
    return currentSectionQuestions.filter((q) => answers[q.id] !== undefined).length;
  }, [currentSectionQuestions, answers]);

  const isCurrentSectionComplete = currentSectionAnsweredCount === QUESTIONS_PER_SECTION;

  // Milestone details for current section
  const currentMilestone = SECTION_MILESTONES[currentSectionIndex] || SECTION_MILESTONES[0];
  const MilestoneIcon = currentMilestone.icon;

  // Unanswered questions list for fast jumping
  const unansweredQuestionNumbers = useMemo(() => {
    return questions
      .filter((q) => answers[q.id] === undefined)
      .map((q) => q.number);
  }, [questions, answers]);

  // 4. Handle selecting an answer (Auto-save)
  const handleSelectAnswer = async (questionId: string, value: number) => {
    if (!sessionData?.id) return;

    // Optimistic UI update
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
    setSaveStatus("saving");

    try {
      const res = await fetch("/api/assessment/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionData.id,
          question_id: questionId,
          selected_value: value,
        }),
      });

      if (!res.ok) {
        throw new Error("Gagal menyimpan jawaban.");
      }

      setSaveStatus("saved");
    } catch (err) {
      console.error("Auto-save error:", err);
      setSaveStatus("error");
      // Keep optimistic answer locally so student isn't disrupted
    }
  };

  // 5. Scroll to top of question list when switching section
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 140, behavior: "smooth" });
    }
  };

  const handleNextSection = () => {
    if (currentSectionIndex < TOTAL_SECTIONS - 1) {
      setCurrentSectionIndex((prev) => prev + 1);
      scrollToTop();
    } else {
      setIsSubmitModalOpen(true);
    }
  };

  const handlePrevSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex((prev) => prev - 1);
      scrollToTop();
    }
  };

  const handleJumpToQuestion = (questionNumber: number) => {
    // 1-based question number: determine section (0 to 6)
    const targetSection = Math.floor((questionNumber - 1) / QUESTIONS_PER_SECTION);
    setCurrentSectionIndex(targetSection);
    setIsPaletteOpen(false);

    // Scroll to specific question after render
    setTimeout(() => {
      const el = document.getElementById(`question-card-${questionNumber}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        scrollToTop();
      }
    }, 150);
  };

  const handleJumpToFirstUnanswered = () => {
    if (unansweredQuestionNumbers.length > 0) {
      handleJumpToQuestion(unansweredQuestionNumbers[0]);
    }
  };

  // 6. Handle Final Completion
  const handleFinalSubmit = async () => {
    if (!sessionData?.id) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/assessment/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionData.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal menyelesaikan asesmen.");
      }

      setIsSubmitModalOpen(false);
      setIsCompletedSuccess(true);
    } catch (err: any) {
      console.error("Submission error:", err);
      setError(err.message || "Gagal memproses penyelesaian asesmen.");
      setIsSubmitting(false);
    }
  };

  // ================= RENDER STATES =================

  // Loading State
  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-14 h-14 rounded-3xl bg-ggc text-ggc-gold flex items-center justify-center animate-bounce shadow-xl ring-2 ring-ggc-gold/30">
          <Compass className="w-8 h-8 animate-spin motion-reduce:animate-none" />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-black text-ggc-dark tracking-tight">
            Menyiapkan Lembar Evaluasi Asesmen...
          </h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Mengalibrasi 84 instrumen multi-matriks Study Fit™ terstandarisasi untuk Anda.
          </p>
        </div>
      </div>
    );
  }

  // Error State
  if (error && questions.length === 0) {
    return (
      <div className="max-w-lg mx-auto my-12 p-8 sm:p-10 rounded-3xl bg-white border border-red-200 shadow-xl text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Kendala Memuat Asesmen</h3>
        <p className="text-xs text-gray-600 mb-6 leading-relaxed">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs text-white bg-ggc hover:bg-ggc-light transition-all shadow-md"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Muat Ulang Halaman</span>
        </button>
      </div>
    );
  }

  // Completed Success Screen
  if (isCompletedSuccess) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 sm:p-12 rounded-[2.5rem] bg-white border border-ggc-gold/40 shadow-2xl text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-ggc-gold/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-emerald-100 rounded-full blur-3xl pointer-events-none" />

        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-800 flex items-center justify-center mx-auto mb-6 shadow-md border border-emerald-300">
          <CheckCircle2 className="w-12 h-12 stroke-[2.2]" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-ggc-gold/15 text-ggc-gold-dark text-xs font-bold uppercase tracking-wider mb-3 border border-ggc-gold/30">
          <Sparkles className="w-3.5 h-3.5" />
          Asesmen Berhasil Diselesaikan
        </span>

        <h2 className="text-2xl sm:text-4xl font-black text-ggc-dark tracking-tight">
          Selamat! Seluruh 84 Pertanyaan Selesai
        </h2>

        <p className="mt-3 text-xs sm:text-sm text-gray-600 max-w-lg mx-auto leading-relaxed">
          Semua respon evaluasi multi-matriks Anda telah berhasil dikunci dan diverifikasi oleh sistem analitik Go Great Career. Laporan hasil komprehensif Anda sudah siap dibuka!
        </p>

        <div className="my-8 p-6 rounded-2xl bg-ggc-tint/70 border border-ggc-subtle flex items-center justify-around text-center shadow-inner">
          <div>
            <div className="text-2xl sm:text-3xl font-black text-ggc">84 / 84</div>
            <div className="text-[11px] text-gray-500 font-semibold uppercase mt-0.5">Soal Terjawab</div>
          </div>
          <div className="h-10 w-px bg-gray-200" />
          <div>
            <div className="text-2xl sm:text-3xl font-black text-ggc-gold-dark">100%</div>
            <div className="text-[11px] text-gray-500 font-semibold uppercase mt-0.5">Kelengkapan</div>
          </div>
          <div className="h-10 w-px bg-gray-200" />
          <div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700">COMPLETED</div>
            <div className="text-[11px] text-gray-500 font-semibold uppercase mt-0.5">Status Sesi</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={`/student/results/${sessionData?.id || "active-session"}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-ggc-dark bg-gradient-to-r from-[#E6D5A8] via-ggc-gold to-ggc-gold-dark hover:shadow-lg hover:-translate-y-0.5 transition-all text-xs shadow-md"
          >
            <span>Buka Laporan Hasil & Rekomendasi Jurusan</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/student/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-all text-xs shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  // ================= MAIN ASSESSMENT UI =================

  return (
    <div ref={containerRef} className="space-y-6 pb-24">
      {/* ------------------------------------------------------------------ */}
      {/* Top Navigation Breadcrumb                                          */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-ggc transition-colors bg-white px-3.5 py-2 rounded-xl border border-gray-200 shadow-2xs hover:shadow-xs"
            title="Kembali ke Halaman Utama"
          >
            <Compass className="w-3.5 h-3.5 text-ggc-gold" />
            <span className="hidden sm:inline">Halaman Utama</span>
          </Link>
          <span className="text-xs text-gray-400">/</span>
          <Link
            href="/student/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-ggc transition-colors bg-white px-3.5 py-2 rounded-xl border border-gray-200 shadow-2xs hover:shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard Siswa</span>
          </Link>
          <span className="text-xs text-gray-400">/</span>
          <span className="text-xs font-bold text-ggc-dark">Lembar Asesmen</span>
        </div>

        <span className="text-xs font-semibold text-gray-500 hidden sm:inline">
          Instrumen 84 Butir • Zero Bias Multi-Matrix
        </span>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 1. STICKY TOP NAVIGATION & REAL-TIME PROGRESS BAR                  */}
      {/* ------------------------------------------------------------------ */}
      <div className="sticky top-20 z-40 bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-ggc-subtle shadow-lg transition-all">
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Milestone Badge & Section Title */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-ggc-gold-dark px-3 py-0.5 rounded-full bg-ggc-gold-subtle border border-ggc-gold/30">
                <MilestoneIcon className="w-3.5 h-3.5 text-ggc-gold-dark" />
                {currentMilestone.dimensionBadge}
              </span>
              <span className="text-xs font-semibold text-gray-500">
                ({currentMilestone.rangeText} · {currentSectionAnsweredCount}/{QUESTIONS_PER_SECTION} Terisi)
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-ggc-dark mt-1 tracking-tight">
              {currentMilestone.title}
            </h1>
          </div>

          {/* Controls: Auto-save status & Question Palette toggle */}
          <div className="flex items-center gap-2.5">
            {/* Auto-save status pill */}
            <div
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border bg-gray-50/80 text-gray-700"
              aria-live="polite"
            >
              {saveStatus === "saving" ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                  <span className="text-[11px] font-semibold text-amber-700">Menyimpan...</span>
                </>
              ) : saveStatus === "saved" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                  <span className="text-[11px] font-semibold text-emerald-700">Tersimpan otomatis</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                  <span className="text-[11px] font-semibold text-red-700">Gagal simpan</span>
                </>
              )}
            </div>

            {/* Question Palette Button */}
            <button
              type="button"
              onClick={() => setIsPaletteOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-ggc bg-ggc-subtle hover:bg-ggc/15 border border-ggc/20 transition-all shadow-xs group"
              title="Buka daftar 84 nomor soal"
            >
              <Grid className="w-4 h-4 text-ggc-gold group-hover:scale-110 transition-transform" />
              <span>Daftar Soal ({answeredCount}/84)</span>
            </button>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-3.5">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="text-gray-600 flex items-center gap-1.5">
              <span>Kemajuan Evaluasi:</span>
              <strong className="text-ggc">{answeredCount}</strong> dari {totalQuestions} Butir Selesai
            </span>
            <span className="text-ggc-gold-dark font-black tabular-nums">{progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-gray-100 overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-ggc via-ggc-light to-ggc-gold transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* 7 Section Step Tabs */}
        <div className="mt-3.5 pt-3 border-t border-gray-100 flex items-center justify-between gap-1.5 overflow-x-auto no-scrollbar py-1">
          {SECTION_MILESTONES.map((milestone) => {
            const idx = milestone.index;
            const isCurrent = idx === currentSectionIndex;
            const secStart = idx * QUESTIONS_PER_SECTION;
            const secEnd = secStart + QUESTIONS_PER_SECTION;
            const secQuestions = questions.slice(secStart, secEnd);
            const secAnswered = secQuestions.filter((q) => answers[q.id] !== undefined).length;
            const isFullyAnswered = secAnswered === QUESTIONS_PER_SECTION;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setCurrentSectionIndex(idx);
                  scrollToTop();
                }}
                className={`flex-1 min-w-[76px] py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all text-center flex flex-col items-center gap-0.5 border ${
                  isCurrent
                    ? "bg-ggc text-white border-ggc shadow-sm ring-1 ring-ggc-gold/40"
                    : isFullyAnswered
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-1">
                  <span>Bagian {idx + 1}</span>
                  {isFullyAnswered && (
                    <CheckCircle className={`w-3.5 h-3.5 ${isCurrent ? "text-ggc-gold" : "text-emerald-600"}`} />
                  )}
                </div>
                <span className={`text-[10px] tabular-nums ${isCurrent ? "text-ggc-subtle" : "text-gray-400"}`}>
                  {secAnswered}/{QUESTIONS_PER_SECTION}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 2. SECTION INSPIRATIONAL BANNER                                    */}
      {/* ------------------------------------------------------------------ */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-ggc-tint via-white to-ggc-gold-subtle border border-ggc/20 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-ggc text-ggc-gold flex items-center justify-center shrink-0 shadow-sm">
            <MilestoneIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ggc">
                Fokus Evaluasi Saat Ini
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-[11px] font-semibold text-gray-500">
                {currentMilestone.rangeText}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-gray-800 mt-0.5">
              {currentMilestone.subtitle}
            </p>
            <p className="text-xs text-gray-500 italic mt-1 leading-relaxed">
              &ldquo;{currentMilestone.quote}&rdquo;
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2 text-xs bg-white/80 backdrop-blur-xs px-3.5 py-2 rounded-2xl border border-gray-200 text-gray-600 self-start sm:self-auto">
          <HelpCircle className="w-4 h-4 text-ggc-gold-dark shrink-0" />
          <span>Skala: 1 (Sangat Tidak Sesuai) s/d 5 (Sangat Sesuai)</span>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 3. QUESTIONS LIST FOR CURRENT SECTION                              */}
      {/* ------------------------------------------------------------------ */}
      <div className="space-y-4 animate-section-in" key={currentSectionIndex}>
        {currentSectionQuestions.map((q) => {
          const selectedValue = answers[q.id];
          const isAnswered = selectedValue !== undefined;

          return (
            <article
              key={q.id}
              id={`question-card-${q.number}`}
              className={`p-6 sm:p-7 rounded-3xl transition-all duration-200 border relative ${
                isAnswered
                  ? "bg-white border-ggc/40 shadow-sm border-l-4 border-l-ggc"
                  : "bg-white border-gray-200 shadow-sm hover:border-gray-300"
              }`}
            >
              {/* Question Header */}
              <div className="flex items-start justify-between gap-4 mb-5">
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 transition-all ${
                      isAnswered
                        ? "bg-ggc text-ggc-gold shadow-xs ring-1 ring-ggc-gold/40"
                        : "bg-gray-100 text-gray-600 border border-gray-200"
                    }`}
                  >
                    {q.number}
                  </div>
                  <div>
                    <h2
                      id={`question-text-${q.id}`}
                      className="text-base sm:text-lg font-bold text-gray-900 leading-relaxed"
                    >
                      {q.question_text}
                    </h2>
                  </div>
                </div>

                {/* Status indicator badge */}
                <div className="shrink-0">
                  {isAnswered ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /> Terjawab
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-[11px] font-semibold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-200">
                      Belum diisi
                    </span>
                  )}
                </div>
              </div>

              {/* Likert Scale Cards (1 to 5) */}
              <fieldset className="mt-4 pt-4 border-t border-gray-100">
                <legend className="sr-only">
                  Pilihan jawaban untuk butir nomor {q.number}: {q.question_text}
                </legend>
                <div
                  className="grid grid-cols-1 sm:grid-cols-5 gap-2.5"
                  role="radiogroup"
                  aria-labelledby={`question-text-${q.id}`}
                >
                  {q.options.map((opt) => {
                    const isSelected = selectedValue === opt.value;

                    return (
                      <button
                        key={opt.value}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => handleSelectAnswer(q.id, opt.value)}
                        className={`group relative min-h-[58px] sm:min-h-[72px] p-3 rounded-2xl border text-center transition-all duration-200 flex sm:flex-col items-center justify-between sm:justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-ggc focus-visible:ring-offset-2 ${
                          isSelected
                            ? "bg-gradient-to-r sm:bg-gradient-to-b from-ggc to-ggc-light text-white border-ggc-gold ring-2 ring-ggc-gold/50 shadow-md scale-[1.01]"
                            : "bg-gray-50/70 text-gray-700 border-gray-200 hover:border-ggc/40 hover:bg-ggc-subtle/40 active:scale-98"
                        }`}
                      >
                        {/* Option Value Badge */}
                        <span
                          className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black transition-colors shrink-0 ${
                            isSelected
                              ? "bg-ggc-gold text-ggc-dark shadow-xs"
                              : "bg-white text-gray-600 border border-gray-300 group-hover:border-ggc group-hover:text-ggc"
                          }`}
                        >
                          {isSelected ? (
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          ) : (
                            opt.value
                          )}
                        </span>

                        {/* Option Label Text */}
                        <span
                          className={`text-xs leading-tight text-right sm:text-center ${
                            isSelected ? "text-white font-bold" : "text-gray-700 font-medium"
                          }`}
                        >
                          {opt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            </article>
          );
        })}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 4. SECTION COMPLETE CELEBRATION CARD                               */}
      {/* ------------------------------------------------------------------ */}
      {isCurrentSectionComplete && (
        <div className="animate-milestone-pop p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-emerald-luxury to-[#063424] text-white border border-ggc-gold/40 shadow-xl relative overflow-hidden my-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-ggc-gold/15 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-ggc-gold text-ggc-dark font-black flex items-center justify-center shrink-0 shadow-md">
                <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-ggc-gold/20 text-ggc-gold text-[10px] font-bold uppercase tracking-wider border border-ggc-gold/30">
                  <Sparkles className="w-3 h-3" />
                  Milestone Bagian {currentSectionIndex + 1} Tuntas!
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white mt-1">
                  12 dari 12 Soal di Bagian Ini Selesai Terjawab
                </h3>
                <p className="text-xs sm:text-sm text-ggc-subtle/85 mt-1 max-w-xl leading-relaxed">
                  Kerja hebat! Anda telah menyelesaikan total <strong>{answeredCount} dari {totalQuestions} butir</strong>. Tarik napas sejenak, rileks, lalu lanjutkan saat siap.
                </p>
              </div>
            </div>

            <div className="shrink-0">
              {currentSectionIndex < TOTAL_SECTIONS - 1 ? (
                <button
                  type="button"
                  onClick={handleNextSection}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-xs font-bold text-ggc-dark bg-gradient-to-r from-[#E6D5A8] via-ggc-gold to-ggc-gold-dark hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-md"
                >
                  <span>Lanjut ke Bagian {currentSectionIndex + 2}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-xs font-bold text-ggc-dark bg-gradient-to-r from-[#E6D5A8] via-ggc-gold to-ggc-gold-dark hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-md"
                >
                  <Send className="w-4 h-4" />
                  <span>Kunci & Tinjau Hasil Asesmen</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 5. NAVIGATION FOOTER BAR                                           */}
      {/* ------------------------------------------------------------------ */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-ggc-subtle shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={handlePrevSection}
          disabled={currentSectionIndex === 0}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-xs font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Bagian Sebelumnya</span>
        </button>

        <div className="text-xs text-gray-600 font-medium text-center">
          Bagian <strong>{currentSectionIndex + 1}</strong> dari {TOTAL_SECTIONS} •{" "}
          <strong className="text-ggc">{currentSectionAnsweredCount}</strong> dari {QUESTIONS_PER_SECTION} terjawab di bagian ini
        </div>

        {currentSectionIndex < TOTAL_SECTIONS - 1 ? (
          <button
            type="button"
            onClick={handleNextSection}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-xs font-bold text-white bg-ggc hover:bg-ggc-light active:bg-ggc-dark transition-all shadow-md hover:shadow-lg"
          >
            <span>Lanjut ke Bagian {currentSectionIndex + 2}</span>
            <ArrowRight className="w-4 h-4 text-ggc-gold" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsSubmitModalOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-xs font-bold text-ggc-dark bg-gradient-to-r from-[#E6D5A8] via-ggc-gold to-ggc-gold-dark hover:shadow-lg transition-all shadow-md"
          >
            <Send className="w-4 h-4" />
            <span>Tinjau & Selesaikan Asesmen</span>
          </button>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 6. QUESTION PALETTE MODAL / DRAWER                                 */}
      {/* ------------------------------------------------------------------ */}
      {isPaletteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="palette-modal-title"
        >
          <div className="bg-white rounded-[2rem] max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-ggc-gold/30 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h2
                  id="palette-modal-title"
                  className="text-lg sm:text-xl font-black text-ggc-dark flex items-center gap-2"
                >
                  <Grid className="w-5 h-5 text-ggc" />
                  Daftar Nomor Soal (84 Butir)
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Klik nomor soal untuk melompat langsung ke soal yang diinginkan.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPaletteOpen(false)}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-sm transition-colors"
                aria-label="Tutup daftar soal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Action: Jump to Unanswered */}
            {unansweredQuestionNumbers.length > 0 && (
              <div className="pt-3 pb-2 flex items-center justify-between gap-3 border-b border-gray-100">
                <span className="text-xs text-gray-600">
                  Tersisa <strong>{unansweredQuestionNumbers.length} butir</strong> belum terisi:
                </span>
                <button
                  type="button"
                  onClick={handleJumpToFirstUnanswered}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-2xs"
                >
                  <Zap className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Lompat ke Soal Belum Terisi (#{unansweredQuestionNumbers[0]})</span>
                </button>
              </div>
            )}

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 py-3 text-xs text-gray-600 border-b border-gray-100">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-md bg-ggc" />
                <span>Terjawab ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-md bg-gray-100 border border-gray-300" />
                <span>Belum ({totalQuestions - answeredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-md ring-2 ring-ggc-gold bg-ggc text-white" />
                <span>Bagian Aktif</span>
              </div>
            </div>

            {/* Numbers Grid (1 to 84 grouped by 7 sections) */}
            <div className="flex-1 overflow-y-auto py-4 pr-1 space-y-4">
              {SECTION_MILESTONES.map((milestone) => {
                const secIdx = milestone.index;
                const secStart = secIdx * QUESTIONS_PER_SECTION;
                const secEnd = secStart + QUESTIONS_PER_SECTION;
                const secQuestions = questions.slice(secStart, secEnd);
                const secAnswered = secQuestions.filter((q) => answers[q.id] !== undefined).length;

                return (
                  <div key={secIdx} className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="text-xs font-bold text-ggc-dark mb-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span>Bagian {secIdx + 1}: {milestone.dimensionBadge}</span>
                      </div>
                      <span className="text-[10px] text-gray-500 font-semibold tabular-nums">
                        {secAnswered}/{QUESTIONS_PER_SECTION} Terisi
                      </span>
                    </div>
                    <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
                      {secQuestions.map((q) => {
                        const isAnswered = answers[q.id] !== undefined;
                        const isInCurrentSection = secIdx === currentSectionIndex;

                        return (
                          <button
                            key={q.id}
                            type="button"
                            onClick={() => handleJumpToQuestion(q.number)}
                            className={`h-9 rounded-xl text-xs font-black transition-all flex items-center justify-center border ${
                              isAnswered
                                ? isInCurrentSection
                                  ? "bg-ggc text-white border-ggc-gold ring-2 ring-ggc-gold/60"
                                  : "bg-ggc text-white border-ggc hover:bg-ggc-light"
                                : isInCurrentSection
                                ? "bg-white text-gray-700 border-ggc font-bold ring-2 ring-ggc/30"
                                : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                            }`}
                          >
                            {q.number}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsPaletteOpen(false)}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-ggc hover:bg-ggc-light transition-all"
              >
                Tutup Lembar Soal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 7. FINAL SUBMISSION CONFIRMATION MODAL                             */}
      {/* ------------------------------------------------------------------ */}
      {isSubmitModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="submit-modal-title"
        >
          <div className="bg-white rounded-[2rem] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-ggc-gold/30">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-3xl bg-ggc-gold/20 text-ggc-gold-dark flex items-center justify-center mx-auto mb-3 border border-ggc-gold/30 shadow-xs">
                <Send className="w-8 h-8" />
              </div>
              <h2 id="submit-modal-title" className="text-xl sm:text-2xl font-black text-ggc-dark">
                Konfirmasi Penyelesaian Asesmen
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Pastikan seluruh 84 butir instrumen telah terisi dengan cermat.
              </p>
            </div>

            {/* Status Summary Box */}
            <div className="p-5 rounded-2xl bg-ggc-tint/70 border border-ggc-subtle mb-6">
              <div className="flex items-center justify-between text-xs font-bold text-ggc-dark mb-2">
                <span>Status Kelengkapan:</span>
                <span className={answeredCount === totalQuestions ? "text-emerald-700" : "text-amber-700"}>
                  {answeredCount} / {totalQuestions} Soal ({progressPercent}%)
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-ggc to-ggc-gold rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {answeredCount < totalQuestions ? (
                <div className="mt-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    <strong>Perhatian:</strong> Masih ada{" "}
                    <strong>{totalQuestions - answeredCount} butir soal</strong> yang belum Anda isi. Disarankan untuk melengkapi seluruh soal agar skor multi-matriks dan rekomendasi jurusan Anda 100% akurat.
                  </div>
                </div>
              ) : (
                <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Luar biasa! Seluruh 84 butir soal telah lengkap terjawab dan siap dikalkulasi.</span>
                </div>
              )}
            </div>

            {/* Error message if API error */}
            {error && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                disabled={isSubmitting}
                className="w-full sm:w-1/2 py-3.5 px-4 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all text-center"
              >
                Cek Kembali Soal
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="w-full sm:w-1/2 py-3.5 px-4 rounded-xl text-xs font-bold text-white bg-ggc hover:bg-ggc-light active:bg-ggc-dark transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-60"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Kunci & Selesaikan</span>
                    <Check className="w-4 h-4 text-ggc-gold" />
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
