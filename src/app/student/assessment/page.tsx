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
      window.scrollTo({ top: 120, behavior: "smooth" });
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
        <div className="w-12 h-12 rounded-2xl bg-ggc text-ggc-gold flex items-center justify-center animate-bounce shadow-lg">
          <Compass className="w-7 h-7 animate-spin" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-bold text-ggc-dark">Menyiapkan Lembar Asesmen...</h3>
          <p className="text-xs text-gray-500 mt-1">
            Mengalibrasi 84 butir instrumen multi-matriks Study Fit Anda.
          </p>
        </div>
      </div>
    );
  }

  // Error State
  if (error && questions.length === 0) {
    return (
      <div className="max-w-lg mx-auto my-12 p-8 rounded-3xl bg-white border border-red-200 shadow-xl text-center">
        <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Kendala Memuat Asesmen</h3>
        <p className="text-xs text-gray-600 mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-ggc hover:bg-ggc-light transition-all"
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
      <div className="max-w-2xl mx-auto my-12 p-8 sm:p-12 rounded-3xl bg-white border border-ggc-gold/40 shadow-2xl text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-ggc-gold/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-6 shadow-md border border-emerald-200">
          <CheckCircle2 className="w-10 h-10 stroke-[2.2]" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-ggc-gold/15 text-ggc-gold-dark text-xs font-bold uppercase tracking-wider mb-3 border border-ggc-gold/30">
          <Sparkles className="w-3.5 h-3.5" />
          Asesmen Berhasil Diselesaikan
        </span>

        <h2 className="text-2xl sm:text-3xl font-black text-ggc-dark tracking-tight">
          Selamat! Seluruh 84 Pertanyaan Selesai
        </h2>

        <p className="mt-3 text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
          Semua respon evaluasi multi-matriks Anda telah berhasil dikunci dan diverifikasi oleh sistem evaluasi Go Great Career.
        </p>

        <div className="my-8 p-5 rounded-2xl bg-ggc-tint/60 border border-ggc-subtle flex items-center justify-around text-center">
          <div>
            <div className="text-2xl font-black text-ggc">84 / 84</div>
            <div className="text-[11px] text-gray-500 font-semibold uppercase mt-0.5">Soal Terjawab</div>
          </div>
          <div className="h-8 w-px bg-gray-200" />
          <div>
            <div className="text-2xl font-black text-ggc-gold-dark">100%</div>
            <div className="text-[11px] text-gray-500 font-semibold uppercase mt-0.5">Kelengkapan</div>
          </div>
          <div className="h-8 w-px bg-gray-200" />
          <div>
            <div className="text-2xl font-black text-emerald-700">COMPLETED</div>
            <div className="text-[11px] text-gray-500 font-semibold uppercase mt-0.5">Status Sesi</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/student/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-ggc hover:bg-ggc-light transition-all text-xs shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Dashboard Siswa</span>
          </Link>
        </div>
      </div>
    );
  }

  // ================= MAIN ASSESSMENT UI =================

  return (
    <div ref={containerRef} className="space-y-6 pb-20">
      {/* Sticky Progress & Status Bar */}
      <div className="sticky top-20 z-40 bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-ggc-subtle shadow-md transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Title & Section Label */}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ggc-gold-dark px-2 py-0.5 rounded-md bg-ggc-gold-subtle border border-ggc-gold/30">
                Bagian {currentSectionIndex + 1} dari {TOTAL_SECTIONS}
              </span>
              <span className="text-xs font-semibold text-gray-500">
                (Instrumen {currentSectionIndex * QUESTIONS_PER_SECTION + 1} -{" "}
                {Math.min((currentSectionIndex + 1) * QUESTIONS_PER_SECTION, totalQuestions)})
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-black text-ggc-dark mt-1">
              Lembar Evaluasi Study Fit Assessment™
            </h1>
          </div>

          {/* Quick Actions: Auto-save status & Question Palette toggle */}
          <div className="flex items-center gap-3">
            {/* Auto-save Pill */}
            <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border bg-gray-50 text-gray-600">
              {saveStatus === "saving" ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                  <span className="text-[11px] font-medium text-amber-700">Menyimpan...</span>
                </>
              ) : saveStatus === "saved" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[11px] font-medium text-emerald-700">Tersimpan otomatis</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                  <span className="text-[11px] font-medium text-red-700">Gagal simpan</span>
                </>
              )}
            </div>

            {/* Question Palette Button */}
            <button
              onClick={() => setIsPaletteOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-ggc bg-ggc-subtle hover:bg-ggc/15 border border-ggc/20 transition-all shadow-sm"
              title="Buka navigasi nomor soal"
            >
              <Grid className="w-4 h-4 text-ggc-gold" />
              <span>Daftar Soal ({answeredCount}/84)</span>
            </button>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs font-bold mb-1">
            <span className="text-gray-600">
              Total Terjawab: <strong className="text-ggc">{answeredCount}</strong> dari {totalQuestions} Butir
            </span>
            <span className="text-ggc-gold-dark font-black">{progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-ggc to-ggc-gold transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Section Steps Navigation Tabs */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar py-1">
          {Array.from({ length: TOTAL_SECTIONS }).map((_, idx) => {
            const isCurrent = idx === currentSectionIndex;
            const secStart = idx * QUESTIONS_PER_SECTION;
            const secEnd = secStart + QUESTIONS_PER_SECTION;
            const secQuestions = questions.slice(secStart, secEnd);
            const secAnswered = secQuestions.filter((q) => answers[q.id] !== undefined).length;
            const isFullyAnswered = secAnswered === QUESTIONS_PER_SECTION;

            return (
              <button
                key={idx}
                onClick={() => {
                  setCurrentSectionIndex(idx);
                  scrollToTop();
                }}
                className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-center flex flex-col items-center gap-0.5 border ${
                  isCurrent
                    ? "bg-ggc text-white border-ggc shadow-sm"
                    : isFullyAnswered
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-1">
                  <span>Bagian {idx + 1}</span>
                  {isFullyAnswered && (
                    <CheckCircle className={`w-3 h-3 ${isCurrent ? "text-ggc-gold" : "text-emerald-600"}`} />
                  )}
                </div>
                <span className={`text-[10px] ${isCurrent ? "text-ggc-subtle" : "text-gray-400"}`}>
                  {secAnswered}/{QUESTIONS_PER_SECTION}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Guide Banner */}
      <div className="p-4 rounded-2xl bg-ggc-gold-subtle border border-ggc-gold/30 flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-ggc-gold-dark shrink-0 mt-0.5" />
        <div className="text-xs text-gray-700 leading-relaxed">
          <strong className="text-ggc-dark">Petunjuk Pengisian:</strong> Bacalah setiap pernyataan dengan seksama. Pilihlah skala <strong>1 (Sangat Tidak Sesuai)</strong> hingga <strong>5 (Sangat Sesuai)</strong> yang paling mendeskripsikan diri Anda saat ini. Jawaban Anda disimpan secara otomatis.
        </div>
      </div>

      {/* Questions List for Current Section */}
      <div className="space-y-4">
        {currentSectionQuestions.map((q) => {
          const selectedValue = answers[q.id];
          const isAnswered = selectedValue !== undefined;

          return (
            <div
              key={q.id}
              id={`question-card-${q.number}`}
              className={`p-5 sm:p-6 rounded-2xl transition-all duration-200 border ${
                isAnswered
                  ? "bg-white border-ggc/40 shadow-sm ring-1 ring-ggc/10"
                  : "bg-white border-gray-200 shadow-sm hover:border-gray-300"
              }`}
            >
              {/* Question Header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-colors ${
                      isAnswered
                        ? "bg-ggc text-ggc-gold"
                        : "bg-gray-100 text-gray-600 border border-gray-200"
                    }`}
                  >
                    {q.number}
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-semibold text-gray-900 leading-relaxed">
                      {q.question_text}
                    </p>
                  </div>
                </div>

                {/* Status indicator badge */}
                <div className="shrink-0">
                  {isAnswered ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      <Check className="w-3 h-3 text-emerald-600 stroke-[3]" /> Terjawab
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-[11px] font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-200">
                      Belum diisi
                    </span>
                  )}
                </div>
              </div>

              {/* Likert Scale Buttons (1 to 5) */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                  {q.options.map((opt) => {
                    const isSelected = selectedValue === opt.value;

                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleSelectAnswer(q.id, opt.value)}
                        className={`group py-3 px-3 rounded-xl border text-center transition-all duration-150 flex sm:flex-col items-center justify-between sm:justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-ggc focus:ring-offset-1 ${
                          isSelected
                            ? "bg-ggc text-white border-ggc shadow-md scale-[1.01]"
                            : "bg-ggc-tint/30 text-gray-700 border-gray-200 hover:border-ggc/40 hover:bg-ggc-subtle/50 active:scale-95"
                        }`}
                      >
                        {/* Number circle */}
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-colors ${
                            isSelected
                              ? "bg-ggc-gold text-ggc-dark"
                              : "bg-white text-gray-600 border border-gray-300 group-hover:border-ggc"
                          }`}
                        >
                          {opt.value}
                        </span>

                        {/* Label text */}
                        <span
                          className={`text-xs font-medium leading-tight text-right sm:text-center ${
                            isSelected ? "text-white font-bold" : "text-gray-700"
                          }`}
                        >
                          {opt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Footer */}
      <div className="p-5 rounded-2xl bg-white border border-ggc-subtle shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={handlePrevSection}
          disabled={currentSectionIndex === 0}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Bagian Sebelumnya</span>
        </button>

        <div className="text-xs text-gray-500 font-medium text-center">
          Bagian <strong>{currentSectionIndex + 1}</strong> dari {TOTAL_SECTIONS} • {currentSectionAnsweredCount} dari {QUESTIONS_PER_SECTION} terjawab di bagian ini
        </div>

        {currentSectionIndex < TOTAL_SECTIONS - 1 ? (
          <button
            type="button"
            onClick={handleNextSection}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white bg-ggc hover:bg-ggc-light active:bg-ggc-dark transition-all shadow-md hover:shadow-lg"
          >
            <span>Lanjut ke Bagian {currentSectionIndex + 2}</span>
            <ArrowRight className="w-4 h-4 text-ggc-gold" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsSubmitModalOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl text-xs font-bold text-ggc-dark bg-ggc-gold hover:bg-ggc-gold-dark hover:text-white transition-all shadow-md hover:shadow-lg"
          >
            <Send className="w-4 h-4" />
            <span>Tinjau & Selesaikan Asesmen</span>
          </button>
        )}
      </div>

      {/* ================= QUESTION PALETTE MODAL / DRAWER ================= */}
      {isPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-ggc-gold/30 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-black text-ggc-dark flex items-center gap-2">
                  <Grid className="w-5 h-5 text-ggc" />
                  Daftar Nomor Soal (84 Butir)
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Klik nomor soal untuk melompat langsung ke soal tersebut.
                </p>
              </div>
              <button
                onClick={() => setIsPaletteOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 py-3 text-xs text-gray-600 border-b border-gray-100">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-ggc" />
                <span>Terjawab ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-gray-100 border border-gray-300" />
                <span>Belum ({totalQuestions - answeredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded ring-2 ring-ggc-gold bg-ggc text-white" />
                <span>Bagian Aktif</span>
              </div>
            </div>

            {/* Numbers Grid (1 to 84) */}
            <div className="flex-1 overflow-y-auto py-4 pr-1">
              <div className="space-y-4">
                {Array.from({ length: TOTAL_SECTIONS }).map((_, secIdx) => {
                  const secStart = secIdx * QUESTIONS_PER_SECTION;
                  const secEnd = secStart + QUESTIONS_PER_SECTION;
                  const secQuestions = questions.slice(secStart, secEnd);

                  return (
                    <div key={secIdx} className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                      <div className="text-xs font-bold text-ggc-dark mb-2 flex items-center justify-between">
                        <span>Bagian {secIdx + 1} (Soal {secStart + 1} - {secEnd})</span>
                        <span className="text-[10px] text-gray-400 font-semibold">
                          {secQuestions.filter((q) => answers[q.id] !== undefined).length}/{QUESTIONS_PER_SECTION} Terisi
                        </span>
                      </div>
                      <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
                        {secQuestions.map((q) => {
                          const isAnswered = answers[q.id] !== undefined;
                          const isInCurrentSection = secIdx === currentSectionIndex;

                          return (
                            <button
                              key={q.id}
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
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setIsPaletteOpen(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-ggc hover:bg-ggc-light transition-all"
              >
                Tutup Lembar Soal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= FINAL SUBMISSION CONFIRMATION MODAL ================= */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-ggc-gold/30">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-ggc-gold/20 text-ggc-gold-dark flex items-center justify-center mx-auto mb-3 border border-ggc-gold/30">
                <Send className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-ggc-dark">
                Konfirmasi Penyelesaian Asesmen
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Pastikan seluruh 84 butir instrumen telah terisi dengan cermat.
              </p>
            </div>

            {/* Status Summary Box */}
            <div className="p-4 rounded-2xl bg-ggc-tint/60 border border-ggc-subtle mb-6">
              <div className="flex items-center justify-between text-xs font-bold text-ggc-dark mb-2">
                <span>Status Kelengkapan:</span>
                <span className={answeredCount === totalQuestions ? "text-emerald-700" : "text-amber-700"}>
                  {answeredCount} / {totalQuestions} Soal
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-ggc to-ggc-gold rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {answeredCount < totalQuestions ? (
                <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    <strong>Perhatian:</strong> Masih ada{" "}
                    <strong>{totalQuestions - answeredCount} soal</strong> yang belum Anda jawab. Disarankan melengkapi seluruh soal agar skor multi-matriks akurat.
                  </div>
                </div>
              ) : (
                <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Hebat! Seluruh 84 butir soal telah lengkap terjawab.</span>
                </div>
              )}
            </div>

            {/* Error message if API error */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
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
                className="w-full sm:w-1/2 py-3 px-4 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all text-center"
              >
                Cek Kembali Soal
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="w-full sm:w-1/2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-ggc hover:bg-ggc-light active:bg-ggc-dark transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-60"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Kirim & Selesaikan</span>
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
