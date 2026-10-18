"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
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
  Volume2,
  VolumeX,
  Keyboard,
  Flame,
  LayoutList,
  Maximize2,
  Trophy,
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

/* -------------------------------------------------------------------------- */
/* Web Audio API Synthesizer (Zero External Audio Assets)                     */
/* -------------------------------------------------------------------------- */
function playAudioFeedback(type: "select" | "milestone" = "select", enabled: boolean = true) {
  if (!enabled || typeof window === "undefined") return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === "select") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(480, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(620, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.07, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === "milestone") {
      // Harmonic arpeggio (C5 - E5 - G5 - C6)
      const chord = [523.25, 659.25, 783.99, 1046.5];
      chord.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        const startTime = ctx.currentTime + i * 0.08;
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.08, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.24);
      });
    }
  } catch {
    // Autoplay or audio context permission error handled silently
  }
}

export default function StudentAssessmentPage() {
  const router = useRouter();

  // State
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // View Mode: "focus" (One question at a time) vs "list" (12 questions stacked)
  const [viewMode, setViewMode] = useState<"focus" | "list">("focus");
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  // Pagination / Section state (0-indexed: 0 to 6)
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  // Focus Rhythm Streak Counter
  const [streakCount, setStreakCount] = useState(0);

  // Sound Feedback Toggle
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Auto-save feedback state: "saved" | "saving" | "error"
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error">("saved");

  // Modals & Drawers
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isKeyboardHelpOpen, setIsKeyboardHelpOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompletedSuccess, setIsCompletedSuccess] = useState(false);

  // Celebrated section tracking to prevent repeat celebration popups
  const [celebratedSections, setCelebratedSections] = useState<number[]>([]);
  const [celebratingMilestone, setCelebratingMilestone] = useState<{
    sectionIndex: number;
    title: string;
    dimensionBadge: string;
    quote: string;
    icon: React.ElementType;
    completedCount: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const advanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load sound setting from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedSound = localStorage.getItem("ggc_assessment_sound");
      if (storedSound !== null) {
        setSoundEnabled(storedSound === "true");
      }
    }
  }, []);

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

        const qList: QuestionItem[] = data.questions || [];
        const ansMap: Record<string, number> = data.answers || {};

        setQuestions(qList);
        setAnswers(ansMap);
        setSessionData(data.session || null);

        // Find first unanswered question to jump to
        if (qList.length > 0) {
          const firstUnanswered = qList.findIndex((q) => ansMap[q.id] === undefined);
          if (firstUnanswered !== -1) {
            setActiveQuestionIndex(firstUnanswered);
            setCurrentSectionIndex(Math.floor(firstUnanswered / QUESTIONS_PER_SECTION));
          }
        }

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

  // Sync currentSectionIndex with activeQuestionIndex when in Focus Mode
  useEffect(() => {
    const targetSection = Math.floor(activeQuestionIndex / QUESTIONS_PER_SECTION);
    if (targetSection !== currentSectionIndex) {
      setCurrentSectionIndex(targetSection);
    }
  }, [activeQuestionIndex, currentSectionIndex]);

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

  // Active question in Focus Mode
  const activeQuestion = questions[activeQuestionIndex] || questions[0];

  // 4. Handle selecting an answer (Optimistic UI + Auto-Save + Audio)
  const handleSelectAnswer = useCallback(
    async (questionId: string, value: number, autoAdvance = false) => {
      if (!sessionData?.id) return;

      // Play pleasant audio chime
      playAudioFeedback("select", soundEnabled);

      // Increment streak
      setStreakCount((prev) => prev + 1);

      // Optimistic UI update
      setAnswers((prev) => {
        const next = { ...prev, [questionId]: value };

        // Check if this answer completes the section
        const secStart = currentSectionIndex * QUESTIONS_PER_SECTION;
        const secEnd = secStart + QUESTIONS_PER_SECTION;
        const secQuestions = questions.slice(secStart, secEnd);
        const willCompleteSection = secQuestions.every((q) => (q.id === questionId ? true : next[q.id] !== undefined));

        if (willCompleteSection && !celebratedSections.includes(currentSectionIndex)) {
          // Trigger milestone celebration popup
          setCelebratedSections((c) => [...c, currentSectionIndex]);
          setTimeout(() => {
            playAudioFeedback("milestone", soundEnabled);
            setCelebratingMilestone({
              sectionIndex: currentSectionIndex,
              title: currentMilestone.title,
              dimensionBadge: currentMilestone.dimensionBadge,
              quote: currentMilestone.quote,
              icon: currentMilestone.icon,
              completedCount: Object.keys(next).length,
            });
          }, 320);
        }

        return next;
      });

      setSaveStatus("saving");

      // Auto-advance in Focus Mode after a short 260ms delay
      if (autoAdvance && viewMode === "focus") {
        if (advanceTimerRef.current) {
          clearTimeout(advanceTimerRef.current);
        }
        advanceTimerRef.current = setTimeout(() => {
          if (activeQuestionIndex < totalQuestions - 1) {
            setActiveQuestionIndex((prev) => prev + 1);
          } else {
            // Reached final question
            setIsSubmitModalOpen(true);
          }
        }, 260);
      }

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
      }
    },
    [
      sessionData,
      soundEnabled,
      currentSectionIndex,
      questions,
      celebratedSections,
      currentMilestone,
      viewMode,
      activeQuestionIndex,
      totalQuestions,
    ]
  );

  // 5. Navigation Handlers
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 120, behavior: "smooth" });
    }
  };

  const handleFocusPrev = () => {
    if (activeQuestionIndex > 0) {
      setActiveQuestionIndex((prev) => prev - 1);
    }
  };

  const handleFocusNext = () => {
    if (activeQuestionIndex < totalQuestions - 1) {
      setActiveQuestionIndex((prev) => prev + 1);
    } else {
      setIsSubmitModalOpen(true);
    }
  };

  const handleNextSection = () => {
    if (currentSectionIndex < TOTAL_SECTIONS - 1) {
      const nextSec = currentSectionIndex + 1;
      setCurrentSectionIndex(nextSec);
      setActiveQuestionIndex(nextSec * QUESTIONS_PER_SECTION);
      scrollToTop();
    } else {
      setIsSubmitModalOpen(true);
    }
  };

  const handlePrevSection = () => {
    if (currentSectionIndex > 0) {
      const prevSec = currentSectionIndex - 1;
      setCurrentSectionIndex(prevSec);
      setActiveQuestionIndex(prevSec * QUESTIONS_PER_SECTION);
      scrollToTop();
    }
  };

  const handleJumpToQuestion = (questionNumber: number) => {
    const targetIdx = questionNumber - 1;
    setActiveQuestionIndex(targetIdx);
    setCurrentSectionIndex(Math.floor(targetIdx / QUESTIONS_PER_SECTION));
    setIsPaletteOpen(false);

    if (viewMode === "list") {
      setTimeout(() => {
        const el = document.getElementById(`question-card-${questionNumber}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        } else {
          scrollToTop();
        }
      }, 150);
    }
  };

  const handleJumpToFirstUnanswered = () => {
    if (unansweredQuestionNumbers.length > 0) {
      handleJumpToQuestion(unansweredQuestionNumbers[0]);
    }
  };

  const handleDismissMilestone = () => {
    setCelebratingMilestone(null);
    if (currentSectionIndex < TOTAL_SECTIONS - 1) {
      const nextSec = currentSectionIndex + 1;
      setCurrentSectionIndex(nextSec);
      setActiveQuestionIndex(nextSec * QUESTIONS_PER_SECTION);
    } else {
      setIsSubmitModalOpen(true);
    }
  };

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("ggc_assessment_sound", String(next));
      }
      return next;
    });
  };

  // 6. Global Keyboard Shortcut Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not intercept if user is typing in form controls
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }

      // Ignore modifier keys
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }

      // 1. Milestone Modal Active: Enter or Space or Esc advances
      if (celebratingMilestone) {
        if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
          e.preventDefault();
          handleDismissMilestone();
        }
        return;
      }

      // 2. Modals Active: Esc closes them
      if (isSubmitModalOpen || isPaletteOpen || isKeyboardHelpOpen) {
        if (e.key === "Escape") {
          e.preventDefault();
          setIsSubmitModalOpen(false);
          setIsPaletteOpen(false);
          setIsKeyboardHelpOpen(false);
        }
        return;
      }

      // 3. Number Keys [1, 2, 3, 4, 5] -> Select Likert answer in Focus Mode
      if (["1", "2", "3", "4", "5"].includes(e.key)) {
        if (viewMode === "focus" && activeQuestion) {
          e.preventDefault();
          handleSelectAnswer(activeQuestion.id, parseInt(e.key, 10), true);
        }
      }

      // 4. Navigation Keys: ArrowLeft / ArrowRight / A / D
      else if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        if (viewMode === "focus") {
          e.preventDefault();
          handleFocusPrev();
        }
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        if (viewMode === "focus") {
          e.preventDefault();
          handleFocusNext();
        }
      }

      // 5. Toggle View Mode: [F]
      else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        setViewMode((prev) => (prev === "focus" ? "list" : "focus"));
      }

      // 6. Open Palette: [P] or [M]
      else if (e.key === "p" || e.key === "P" || e.key === "m" || e.key === "M") {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
      }

      // 7. Toggle Sound: [S]
      else if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        toggleSound();
      }

      // 8. Help Shortcuts: [?]
      else if (e.key === "?") {
        e.preventDefault();
        setIsKeyboardHelpOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    celebratingMilestone,
    isSubmitModalOpen,
    isPaletteOpen,
    isKeyboardHelpOpen,
    viewMode,
    activeQuestion,
    handleSelectAnswer,
  ]);

  // 7. Handle Final Completion
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
    <div ref={containerRef} className="space-y-6 pb-28">
      {/* ------------------------------------------------------------------ */}
      {/* Top Breadcrumb & Control Bar                                       */}
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

        {/* View Mode Switcher & Sound Toggle */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Audio Feedback Toggle */}
          <button
            type="button"
            onClick={toggleSound}
            className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
              soundEnabled
                ? "bg-white text-ggc-dark border-gray-200 hover:border-ggc-gold shadow-2xs"
                : "bg-gray-100 text-gray-400 border-gray-200"
            }`}
            title={`Suara Efek Audio: ${soundEnabled ? "Aktif" : "Mati"} (Tekan S)`}
            aria-label="Toggle suara efek"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-ggc" />
            ) : (
              <VolumeX className="w-4 h-4 text-gray-400" />
            )}
            <span className="hidden md:inline text-[11px]">{soundEnabled ? "Audio On" : "Mute"}</span>
          </button>

          {/* Keyboard Shortcuts Guide Pill */}
          <button
            type="button"
            onClick={() => setIsKeyboardHelpOpen(true)}
            className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-ggc hover:border-ggc/40 transition-colors shadow-2xs text-xs font-bold flex items-center gap-1.5"
            title="Petunjuk Shortcut Keyboard (Tekan ?)"
          >
            <Keyboard className="w-4 h-4 text-ggc-gold" />
            <span className="hidden md:inline text-[11px]">Shortcut</span>
          </button>

          {/* Mode Segmented Control */}
          <div className="p-1 rounded-2xl bg-gray-100/90 border border-gray-200 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setViewMode("focus")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === "focus"
                  ? "bg-white text-ggc-dark shadow-sm ring-1 ring-ggc/20"
                  : "text-gray-500 hover:text-gray-900"
              }`}
              title="Mode Fokus Soal-per-Soal (Tekan F)"
            >
              <Maximize2 className="w-3.5 h-3.5 text-ggc" />
              <span>Fokus (1 Soal)</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === "list"
                  ? "bg-white text-ggc-dark shadow-sm ring-1 ring-ggc/20"
                  : "text-gray-500 hover:text-gray-900"
              }`}
              title="Mode Daftar 12 Soal (Tekan F)"
            >
              <LayoutList className="w-3.5 h-3.5 text-ggc" />
              <span>Daftar (12 Soal)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 1. STICKY TOP PROGRESS & CONTROLS BAR                              */}
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

              {/* Focus Streak Glow Pill */}
              {streakCount >= 3 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-300 animate-streak-glow">
                  <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                  <span>{streakCount} Soal Beruntun!</span>
                </span>
              )}
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
              {saveStatus === "saving" && (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-ggc-gold" />
                  <span className="text-[11px] font-medium text-gray-500">Menyimpan...</span>
                </>
              )}
              {saveStatus === "saved" && (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[11px] font-medium text-gray-600">Tersimpan Otomatis</span>
                </>
              )}
              {saveStatus === "error" && (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-[11px] font-medium text-amber-700">Tersimpan Lokal</span>
                </>
              )}
            </div>

            {/* Question Palette Trigger Button */}
            <button
              type="button"
              onClick={() => setIsPaletteOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold text-ggc-dark bg-ggc-gold-subtle hover:bg-ggc-gold/20 border border-ggc-gold/40 transition-colors shadow-2xs"
              title="Buka Lembar Nomor Soal (Tekan P)"
            >
              <Grid className="w-4 h-4 text-ggc-gold-dark" />
              <span>Palet 84 Soal</span>
            </button>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-gray-500 font-medium">
              Kemajuan Keseluruhan: <strong className="text-ggc font-bold">{answeredCount}</strong> dari {totalQuestions} Soal
            </span>
            <span className="font-black text-ggc-gold-dark tabular-nums">
              {progressPercent}%
            </span>
          </div>
          <div
            className="w-full h-3 rounded-full bg-gray-100 overflow-hidden p-0.5 border border-gray-200"
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-ggc via-ggc-light to-ggc-gold transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Section 7-step Milestone Breadcrumb */}
        <div className="mt-3.5 grid grid-cols-7 gap-1.5 sm:gap-2">
          {SECTION_MILESTONES.map((m) => {
            const isCurrent = m.index === currentSectionIndex;
            const secStart = m.index * QUESTIONS_PER_SECTION;
            const secEnd = secStart + QUESTIONS_PER_SECTION;
            const secQuestions = questions.slice(secStart, secEnd);
            const secAnswered = secQuestions.filter((q) => answers[q.id] !== undefined).length;
            const isDone = secAnswered === QUESTIONS_PER_SECTION;

            return (
              <button
                key={m.index}
                type="button"
                onClick={() => {
                  setCurrentSectionIndex(m.index);
                  if (viewMode === "focus") {
                    setActiveQuestionIndex(m.index * QUESTIONS_PER_SECTION);
                  }
                }}
                className={`p-2 rounded-xl border text-center transition-all ${
                  isCurrent
                    ? "bg-ggc text-white border-ggc-gold ring-2 ring-ggc-gold/40 shadow-xs"
                    : isDone
                    ? "bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                }`}
                title={`${m.title} (${secAnswered}/12)`}
              >
                <div className="flex items-center justify-center gap-1 text-[11px] font-bold">
                  <span>P{m.index + 1}</span>
                  {isDone && (
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
      {/* 2. MODE FOKUS: SINGLE-QUESTION HERO CARD (RECOMMENDED EXPERIENCE)  */}
      {/* ------------------------------------------------------------------ */}
      {viewMode === "focus" && activeQuestion && (
        <div className="animate-focus-slide max-w-3xl mx-auto" key={activeQuestion.id}>
          {/* Card Wrapper */}
          <div className="p-6 sm:p-10 rounded-3xl bg-white border-2 border-ggc-gold/30 shadow-xl relative overflow-hidden">
            {/* Background Accent Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-ggc-gold/10 via-emerald-50/40 to-transparent rounded-full blur-2xl pointer-events-none" />

            {/* Header: Dimension Badge & Question Counter */}
            <div className="relative z-10 flex items-center justify-between pb-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-ggc text-ggc-gold flex items-center justify-center shrink-0 shadow-2xs">
                  <MilestoneIcon className="w-4 h-4" />
                </span>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-ggc-gold-dark">
                    {currentMilestone.dimensionBadge}
                  </span>
                  <div className="text-xs font-semibold text-gray-500">
                    {currentMilestone.subtitle}
                  </div>
                </div>
              </div>

              {/* Question Number Pill */}
              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1.5 rounded-2xl bg-gray-100 text-ggc-dark font-black text-xs border border-gray-200 shadow-inner">
                  Soal <strong className="text-ggc">{activeQuestion.number}</strong> / {totalQuestions}
                </span>
              </div>
            </div>

            {/* Question Text Body */}
            <div className="py-8 sm:py-10 relative z-10 text-center sm:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2">
                Pernyataan Evaluasi Bakat & Minat
              </span>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 leading-snug tracking-tight">
                &ldquo;{activeQuestion.question_text}&rdquo;
              </h2>
              <p className="text-xs text-gray-500 mt-3 italic">
                Pilih seberapa sesuai pernyataan ini dengan kecenderungan alami Anda (1 s/d 5).
              </p>
            </div>

            {/* 5 Likert Buttons */}
            <div className="pt-2 pb-6 border-t border-gray-100 relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {activeQuestion.options.map((opt) => {
                  const isSelected = answers[activeQuestion.id] === opt.value;

                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelectAnswer(activeQuestion.id, opt.value, true)}
                      className={`group relative min-h-[76px] p-3.5 rounded-2xl border text-center transition-all duration-200 flex sm:flex-col items-center justify-between sm:justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-ggc focus-visible:ring-offset-2 ${
                        isSelected
                          ? "bg-gradient-to-r sm:bg-gradient-to-b from-ggc to-ggc-light text-white border-ggc-gold ring-2 ring-ggc-gold/50 shadow-md scale-[1.02]"
                          : "bg-gray-50/80 text-gray-700 border-gray-200 hover:border-ggc-gold/60 hover:bg-ggc-subtle/50 hover:shadow-xs active:scale-98"
                      }`}
                    >
                      {/* Keyboard Shortcut Indicator & Value */}
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black transition-colors shrink-0 ${
                          isSelected
                            ? "bg-ggc-gold text-ggc-dark shadow-xs"
                            : "bg-white text-gray-600 border border-gray-300 group-hover:border-ggc group-hover:text-ggc"
                        }`}
                      >
                        {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : opt.value}
                      </span>

                      {/* Label Text */}
                      <span
                        className={`text-xs leading-tight text-right sm:text-center ${
                          isSelected ? "text-white font-bold" : "text-gray-700 font-semibold"
                        }`}
                      >
                        {opt.label}
                      </span>

                      {/* Keyboard shortcut badge for desktop */}
                      <span
                        className={`hidden sm:inline-block text-[9px] uppercase tracking-wider font-mono opacity-50 ${
                          isSelected ? "text-white" : "text-gray-400"
                        }`}
                      >
                        Tekan [{opt.value}]
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Card Navigation */}
            <div className="pt-5 border-t border-gray-100 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={handleFocusPrev}
                disabled={activeQuestionIndex === 0}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                title="Soal Sebelumnya (Tekan A atau ←)"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Sebelumnya [A]</span>
              </button>

              <div className="text-center text-xs text-gray-500 font-medium">
                {answers[activeQuestion.id] !== undefined ? (
                  <span className="text-emerald-700 font-bold inline-flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Jawaban tersimpan
                  </span>
                ) : (
                  <span>Tekan angka <strong>[1-5]</strong> di keyboard untuk jawab cepat</span>
                )}
              </div>

              <button
                type="button"
                onClick={handleFocusNext}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white bg-ggc hover:bg-ggc-light active:bg-ggc-dark transition-all shadow-md"
                title="Soal Berikutnya (Tekan D atau →)"
              >
                <span>{activeQuestionIndex < totalQuestions - 1 ? "Berikutnya [D]" : "Selesaikan Asesmen"}</span>
                <ArrowRight className="w-4 h-4 text-ggc-gold" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 3. MODE DAFTAR: 12 SOAL BERTUMPUK (CLASSIC LIST VIEW)              */}
      {/* ------------------------------------------------------------------ */}
      {viewMode === "list" && (
        <div className="space-y-4 animate-section-in" key={currentSectionIndex}>
          {/* Section Banner */}
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

          {/* List of 12 Questions */}
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
                          onClick={() => handleSelectAnswer(q.id, opt.value, false)}
                          className={`group relative min-h-[58px] sm:min-h-[72px] p-3 rounded-2xl border text-center transition-all duration-200 flex sm:flex-col items-center justify-between sm:justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-ggc focus-visible:ring-offset-2 ${
                            isSelected
                              ? "bg-gradient-to-r sm:bg-gradient-to-b from-ggc to-ggc-light text-white border-ggc-gold ring-2 ring-ggc-gold/50 shadow-md scale-[1.01]"
                              : "bg-gray-50/70 text-gray-700 border-gray-200 hover:border-ggc/40 hover:bg-ggc-subtle/40 active:scale-98"
                          }`}
                        >
                          <span
                            className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black transition-colors shrink-0 ${
                              isSelected
                                ? "bg-ggc-gold text-ggc-dark shadow-xs"
                                : "bg-white text-gray-600 border border-gray-300 group-hover:border-ggc group-hover:text-ggc"
                            }`}
                          >
                            {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : opt.value}
                          </span>

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

          {/* Section Navigation Footer Bar */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-ggc-subtle shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
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
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 4. CELEBRATORY MILESTONE POPUP DIALOG                              */}
      {/* ------------------------------------------------------------------ */}
      {celebratingMilestone && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-md p-4 animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="milestone-celebrate-title"
          aria-describedby="milestone-celebrate-desc"
        >
          {/* Confetti Particles (CSS Animated) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
            <div className="absolute top-10 left-1/4 w-3 h-3 rounded-full bg-ggc-gold animate-confetti" style={{ animationDelay: "0s" }} />
            <div className="absolute top-8 left-1/2 w-4 h-2 bg-emerald-400 rotate-45 animate-confetti" style={{ animationDelay: "0.3s" }} />
            <div className="absolute top-12 left-3/4 w-3 h-3 rounded-full bg-amber-300 animate-confetti" style={{ animationDelay: "0.6s" }} />
            <div className="absolute top-6 left-1/3 w-2 h-4 bg-teal-300 -rotate-12 animate-confetti" style={{ animationDelay: "0.9s" }} />
            <div className="absolute top-10 left-2/3 w-3 h-3 bg-yellow-400 rotate-12 animate-confetti" style={{ animationDelay: "1.2s" }} />
          </div>

          <div className="bg-white rounded-[2.5rem] max-w-lg w-full p-6 sm:p-10 shadow-2xl border-2 border-ggc-gold/50 text-center relative overflow-hidden animate-milestone-pop">
            {/* Top Glow Orb */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-ggc-gold/25 rounded-full blur-2xl pointer-events-none" />

            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#E6D5A8] via-ggc-gold to-ggc-gold-dark text-ggc-dark flex items-center justify-center mx-auto mb-5 shadow-xl ring-4 ring-ggc-gold/20">
              <Trophy className="w-10 h-10" />
            </div>

            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-ggc-gold/15 text-ggc-gold-dark text-xs font-bold uppercase tracking-wider mb-2 border border-ggc-gold/30">
              <Sparkles className="w-3.5 h-3.5" />
              Milestone Dimensi Tuntas!
            </span>

            <h2 id="milestone-celebrate-title" className="text-2xl sm:text-3xl font-black text-ggc-dark tracking-tight">
              {celebratingMilestone.dimensionBadge} Selesai!
            </h2>

            <p id="milestone-celebrate-desc" className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
              &ldquo;{celebratingMilestone.quote}&rdquo;
            </p>

            {/* Achievement Card */}
            <div className="my-6 p-4 rounded-2xl bg-ggc-tint border border-ggc-subtle flex items-center justify-between text-xs font-bold text-ggc-dark">
              <span>Progres Asesmen:</span>
              <span className="text-emerald-700 font-extrabold text-sm">
                {celebratingMilestone.completedCount} / {totalQuestions} Soal ({Math.round((celebratingMilestone.completedCount / totalQuestions) * 100)}%)
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleDismissMilestone}
                className="w-full py-4 px-6 rounded-2xl text-xs font-bold text-ggc-dark bg-gradient-to-r from-[#E6D5A8] via-ggc-gold to-ggc-gold-dark hover:shadow-xl hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <span>Lanjut ke Dimensi Berikutnya</span>
                <ArrowRight className="w-4 h-4" />
                <span className="text-[10px] opacity-60 font-mono ml-1">[Enter]</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 5. QUESTION PALETTE MODAL (84 NUMBERS GRID)                         */}
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
                <span>Soal Aktif</span>
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
                        const isCurrentActive = q.number === activeQuestionIndex + 1;

                        return (
                          <button
                            key={q.id}
                            type="button"
                            onClick={() => handleJumpToQuestion(q.number)}
                            className={`h-9 rounded-xl text-xs font-black transition-all flex items-center justify-center border ${
                              isCurrentActive
                                ? "bg-ggc-gold text-ggc-dark border-ggc-gold ring-2 ring-ggc-gold-dark shadow-xs"
                                : isAnswered
                                ? "bg-ggc text-white border-ggc hover:bg-ggc-light"
                                : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
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
                Tutup Palet Soal [Esc]
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 6. KEYBOARD SHORTCUTS MODAL                                        */}
      {/* ------------------------------------------------------------------ */}
      {isKeyboardHelpOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="keyboard-help-title"
        >
          <div className="bg-white rounded-[2rem] max-w-md w-full p-6 sm:p-8 shadow-2xl border border-ggc-gold/30">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-ggc text-ggc-gold flex items-center justify-center shrink-0">
                  <Keyboard className="w-5 h-5" />
                </div>
                <div>
                  <h2 id="keyboard-help-title" className="text-lg font-black text-ggc-dark">
                    Shortcut Keyboard
                  </h2>
                  <p className="text-xs text-gray-500">Mengerjakan asesmen lebih cepat tanpa mouse</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsKeyboardHelpOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-100">
                <span className="font-semibold text-gray-700">Pilih Skala Jawaban (1 s/d 5)</span>
                <span className="px-2 py-1 rounded bg-white border border-gray-300 font-mono font-bold text-ggc-dark">1, 2, 3, 4, 5</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-100">
                <span className="font-semibold text-gray-700">Soal Sebelumnya</span>
                <span className="px-2 py-1 rounded bg-white border border-gray-300 font-mono font-bold text-ggc-dark">A / ←</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-100">
                <span className="font-semibold text-gray-700">Soal Berikutnya</span>
                <span className="px-2 py-1 rounded bg-white border border-gray-300 font-mono font-bold text-ggc-dark">D / →</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-100">
                <span className="font-semibold text-gray-700">Ganti Mode (Fokus / Daftar)</span>
                <span className="px-2 py-1 rounded bg-white border border-gray-300 font-mono font-bold text-ggc-dark">F</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-100">
                <span className="font-semibold text-gray-700">Buka Palet 84 Nomor Soal</span>
                <span className="px-2 py-1 rounded bg-white border border-gray-300 font-mono font-bold text-ggc-dark">P</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-100">
                <span className="font-semibold text-gray-700">Toggle Efek Suara (Audio)</span>
                <span className="px-2 py-1 rounded bg-white border border-gray-300 font-mono font-bold text-ggc-dark">S</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-100">
                <span className="font-semibold text-gray-700">Tutup Dialog / Batal</span>
                <span className="px-2 py-1 rounded bg-white border border-gray-300 font-mono font-bold text-ggc-dark">Esc</span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsKeyboardHelpOpen(false)}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-ggc hover:bg-ggc-light transition-all text-center"
              >
                Mengerti
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

      {/* ------------------------------------------------------------------ */}
      {/* 8. FLOATING QUICK SHORTCUT BAR (DESKTOP HELPER)                     */}
      {/* ------------------------------------------------------------------ */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 hidden md:flex items-center gap-3 px-4 py-2 rounded-2xl bg-ggc-dark/90 backdrop-blur-md text-white text-[11px] shadow-xl border border-white/20 select-none">
        <span className="flex items-center gap-1 font-mono text-ggc-gold">
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 font-bold">1-5</kbd> Jawab Cepat
        </span>
        <span className="text-white/30">•</span>
        <span className="flex items-center gap-1 font-mono text-ggc-subtle">
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 font-bold">← / →</kbd> Navigasi
        </span>
        <span className="text-white/30">•</span>
        <span className="flex items-center gap-1 font-mono text-ggc-subtle">
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 font-bold">F</kbd> Ganti Mode
        </span>
        <span className="text-white/30">•</span>
        <span className="flex items-center gap-1 font-mono text-ggc-subtle">
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 font-bold">P</kbd> Palet Soal
        </span>
      </div>
    </div>
  );
}
