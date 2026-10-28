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
  ChevronDown,
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
  Lock,
  CreditCard,
  Wifi,
  WifiOff,
} from "lucide-react";
import MidtransCheckoutModal from "@/components/MidtransCheckoutModal";

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

  // Offline-First & Resilient Sync States (Phase 1.2)
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Modals & Drawers
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isKeyboardHelpOpen, setIsKeyboardHelpOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompletedSuccess, setIsCompletedSuccess] = useState(false);
  const [isDimensionsOpen, setIsDimensionsOpen] = useState(false);
  const [isPaymentRequired, setIsPaymentRequired] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

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

  const [modalTouchStartY, setModalTouchStartY] = useState<number | null>(null);

  const handleModalTouchStart = (e: React.TouchEvent) => {
    setModalTouchStartY(e.touches[0].clientY);
  };

  const handleModalTouchEnd = (onClose: () => void) => (e: React.TouchEvent) => {
    if (modalTouchStartY !== null) {
      const deltaY = e.changedTouches[0].clientY - modalTouchStartY;
      if (deltaY > 60) {
        onClose();
      }
      setModalTouchStartY(null);
    }
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const advanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // AbortController map per question item to cancel superseded pending requests (Phase 2.1)
  const abortControllersRef = useRef<Record<string, AbortController>>({});

  // Clean up any pending AbortControllers on unmount
  useEffect(() => {
    const controllers = abortControllersRef.current;
    return () => {
      Object.values(controllers).forEach((ctrl) => {
        try {
          ctrl.abort();
        } catch (e) {}
      });
    };
  }, []);

  // Load sound setting from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedSound = localStorage.getItem("ggc_assessment_sound");
      if (storedSound !== null) {
        setSoundEnabled(storedSound === "true");
      }
    }
  }, []);

  // Flush pending sync queue to backend database
  const flushPendingQueue = useCallback(
    async (overrideSessionId?: string) => {
      const sId = overrideSessionId || sessionData?.id;
      if (!sId || typeof window === "undefined") return;

      const pendingKey = `ggc_pending_sync_${sId}`;
      let pending: Record<string, number> = {};
      try {
        pending = JSON.parse(localStorage.getItem(pendingKey) || "{}");
      } catch (e) {
        pending = {};
      }

      const questionIds = Object.keys(pending);
      if (questionIds.length === 0) {
        setPendingCount(0);
        setSaveStatus("saved");
        setSyncError(null);
        return;
      }

      // If navigator is offline, do not attempt network fetch
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        setIsOnline(false);
        setSaveStatus("error");
        return;
      }

      setIsSyncing(true);
      setSaveStatus("saving");

      const remaining: Record<string, number> = { ...pending };
      let hasError = false;

      for (const qId of questionIds) {
        const val = pending[qId];
        try {
          const res = await fetch("/api/assessment/answer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              session_id: sId,
              question_id: qId,
              selected_value: val,
              client_timestamp: Date.now(),
            }),
          });

          if (res.ok) {
            delete remaining[qId];
          } else {
            hasError = true;
            break;
          }
        } catch (fetchErr) {
          console.warn("Could not sync question answer to server:", qId, fetchErr);
          hasError = true;
          break;
        }
      }

      try {
        localStorage.setItem(pendingKey, JSON.stringify(remaining));
      } catch (e) {}

      const remainingCount = Object.keys(remaining).length;
      setPendingCount(remainingCount);
      setIsSyncing(false);

      if (remainingCount === 0) {
        setSaveStatus("saved");
        setSyncError(null);
      } else {
        setSaveStatus("error");
        if (hasError) {
          setSyncError(`Koneksi terganggu. ${remainingCount} jawaban tersimpan aman di perangkat.`);
        }
      }
    },
    [sessionData?.id]
  );

  // Monitor browser online / offline network state
  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      if (sessionData?.id) {
        flushPendingQueue(sessionData.id);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSaveStatus("error");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [sessionData?.id, flushPendingQueue]);

  // 1. Fetch initial questions and session
  useEffect(() => {
    async function loadAssessment() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/assessment/start");
        const data = await res.json();

        if (!res.ok) {
          if (res.status === 402 || data.payment_required || data.error === "PAYMENT_REQUIRED") {
            setIsPaymentRequired(true);
            return;
          }
          if (
            res.status === 403 ||
            data.email_verification_required ||
            data.error === "EMAIL_VERIFICATION_REQUIRED"
          ) {
            router.replace("/student/dashboard?verify=required");
            return;
          }
          throw new Error(data.message || data.error || "Gagal memuat instrumen asesmen.");
        }

        const qList: QuestionItem[] = data.questions || [];
        const serverAnsMap: Record<string, number> = data.answers || {};
        const sId = data.session?.id;

        // Offline storage sync: merge server answers with any local answers
        let localAnsMap: Record<string, number> = {};
        let pendingMap: Record<string, number> = {};

        if (sId && typeof window !== "undefined") {
          try {
            localAnsMap = JSON.parse(localStorage.getItem(`ggc_answers_${sId}`) || "{}");
            pendingMap = JSON.parse(localStorage.getItem(`ggc_pending_sync_${sId}`) || "{}");
          } catch (e) {
            console.warn("Could not read local assessment answers:", e);
          }
        }

        // Merge: server answers base, overridden by any unsynced local pending answers
        const mergedAnswers: Record<string, number> = {
          ...serverAnsMap,
          ...localAnsMap,
        };

        // Cache merged answers to localStorage
        if (sId && typeof window !== "undefined") {
          try {
            localStorage.setItem(`ggc_answers_${sId}`, JSON.stringify(mergedAnswers));
          } catch (e) {}
        }

        const pCount = Object.keys(pendingMap).length;
        setPendingCount(pCount);

        setQuestions(qList);
        setAnswers(mergedAnswers);
        setSessionData(data.session || null);

        // Find first unanswered question to jump to
        if (qList.length > 0) {
          const firstUnanswered = qList.findIndex((q) => mergedAnswers[q.id] === undefined);
          if (firstUnanswered !== -1) {
            setActiveQuestionIndex(firstUnanswered);
            setCurrentSectionIndex(Math.floor(firstUnanswered / QUESTIONS_PER_SECTION));
          }
        }

        // AUTO-LOCK: If already completed, aggressively redirect to results page
        if (data.is_completed || data.session?.status === "COMPLETED") {
          setIsCompletedSuccess(true);
          const targetUrl = data.redirect_url || (data.session?.id ? `/student/results/${data.session.id}` : "/student/results");
          router.replace(targetUrl);
          return;
        }

        // If there are pending items from previous offline session, flush them
        if (sId && pCount > 0 && typeof navigator !== "undefined" && navigator.onLine) {
          setTimeout(() => {
            flushPendingQueue(sId);
          }, 400);
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

  // 4. Handle selecting an answer (Optimistic UI + Offline-First LocalStorage + Auto-Save + Audio)
  const handleSelectAnswer = useCallback(
    async (questionId: string, value: number, autoAdvance = false) => {
      if (!sessionData?.id) return;
      const sId = sessionData.id;

      // Play pleasant audio chime
      playAudioFeedback("select", soundEnabled);

      // Increment streak
      setStreakCount((prev) => prev + 1);

      // 1. Instantly update React state & localStorage (Optimistic UI)
      setAnswers((prev) => {
        const next = { ...prev, [questionId]: value };

        // Save immediately to localStorage for zero-loss offline resiliency
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(`ggc_answers_${sId}`, JSON.stringify(next));
          } catch (e) {
            console.warn("Could not save to localStorage", e);
          }
        }

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

      // 2. Mark this question as pending in the sync queue
      if (typeof window !== "undefined") {
        const pendingKey = `ggc_pending_sync_${sId}`;
        let pending: Record<string, number> = {};
        try {
          pending = JSON.parse(localStorage.getItem(pendingKey) || "{}");
        } catch (e) {}
        pending[questionId] = value;
        try {
          localStorage.setItem(pendingKey, JSON.stringify(pending));
        } catch (e) {}
        setPendingCount(Object.keys(pending).length);
      }

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

      // 3. Network attempt with AbortController & Monotonic Timestamp (Phase 2.1)
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        setIsOnline(false);
        setSaveStatus("error");
        return;
      }

      // Abort previous pending network request for this specific question item
      if (abortControllersRef.current[questionId]) {
        try {
          abortControllersRef.current[questionId].abort();
        } catch (e) {}
      }

      const controller = new AbortController();
      abortControllersRef.current[questionId] = controller;

      setSaveStatus("saving");

      const clientTimestamp = Date.now();

      try {
        const res = await fetch("/api/assessment/answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            session_id: sId,
            question_id: questionId,
            selected_value: value,
            client_timestamp: clientTimestamp,
          }),
        });

        if (!res.ok) {
          throw new Error("Gagal menyimpan jawaban ke database.");
        }

        // Successfully acknowledged by server: remove from pending queue
        if (typeof window !== "undefined") {
          const pendingKey = `ggc_pending_sync_${sId}`;
          let pending: Record<string, number> = {};
          try {
            pending = JSON.parse(localStorage.getItem(pendingKey) || "{}");
            delete pending[questionId];
            localStorage.setItem(pendingKey, JSON.stringify(pending));
            const remainingCount = Object.keys(pending).length;
            setPendingCount(remainingCount);
            if (remainingCount === 0) {
              setSaveStatus("saved");
              setSyncError(null);
            }
          } catch (e) {}
        }
      } catch (err: any) {
        if (err?.name === "AbortError") {
          // Request was superseded by a newer selection on the same question; safe to ignore
          return;
        }
        console.warn("Auto-save to backend failed. Answer preserved in offline storage.", err);
        setSaveStatus("error");
      } finally {
        if (abortControllersRef.current[questionId] === controller) {
          delete abortControllersRef.current[questionId];
        }
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

  // Alias selectOption to handleSelectAnswer for developer consistency
  const selectOption = handleSelectAnswer;

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

  // 7. Handle Final Completion (Fix 1.3: Pre-Submission Integrity Guard)
  const handleFinalSubmit = async () => {
    if (!sessionData?.id || isSubmitting) return;
    const sId = sessionData.id;

    // 1. Guard against unsynced pending local answers
    let currentPending: Record<string, number> = {};
    if (typeof window !== "undefined") {
      try {
        currentPending = JSON.parse(
          localStorage.getItem(`ggc_pending_sync_${sId}`) || "{}"
        );
      } catch (e) {}
    }

    const pendingKeysCount = Object.keys(currentPending).length;

    if (pendingKeysCount > 0) {
      setError(
        `Menunggu sinkronisasi jawaban ke server (${pendingKeysCount} jawaban tersimpan di perangkat lokal belum tersimpan di cloud). Pastikan koneksi internet Anda aktif lalu klik tombol 'Sinkronkan Sekarang'.`
      );
      flushPendingQueue(sId);
      return;
    }

    // 2. Guard against incomplete assessment
    if (answeredCount < totalQuestions) {
      setError(
        `Mohon lengkapi seluruh ${totalQuestions} butir soal sebelum menyelesaikan asesmen. Masih ada ${totalQuestions - answeredCount} butir yang belum terisi.`
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/assessment/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "ALREADY_COMPLETED") {
          // Assessment was already locked & completed; proceed directly to success view
          if (typeof window !== "undefined") {
            try {
              localStorage.removeItem(`ggc_answers_${sId}`);
              localStorage.removeItem(`ggc_pending_sync_${sId}`);
            } catch (e) {}
          }
          setIsSubmitModalOpen(false);
          setIsCompletedSuccess(true);
          return;
        }
        throw new Error(data.message || data.error || "Gagal menyelesaikan asesmen.");
      }

      // Clean up localStorage for this session on successful submission
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem(`ggc_answers_${sId}`);
          localStorage.removeItem(`ggc_pending_sync_${sId}`);
        } catch (e) {}
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
          <h3 className="text-xl font-black text-ggc-dark dark:text-white tracking-tight">
            Menyiapkan Lembar Evaluasi Asesmen...
          </h3>
          <p className="text-xs text-gray-500 dark:text-[#A0B9AE] mt-1 max-w-sm mx-auto">
            Mengalibrasi 84 instrumen multi-matriks Study Fit™ terstandarisasi untuk Anda.
          </p>
        </div>
      </div>
    );
  }

  // Paywall Required Screen (Only Paid Students Permitted)
  if (isPaymentRequired) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 sm:p-12 rounded-[2.5rem] bg-white dark:bg-[#07261B] border border-ggc-gold/40 shadow-2xl text-center relative overflow-hidden transition-colors">
        <div className="absolute top-0 right-0 w-80 h-80 bg-ggc-gold/15 rounded-full blur-3xl pointer-events-none" />
        <div className="w-20 h-20 rounded-3xl bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 flex items-center justify-center mx-auto mb-6 shadow-md border border-amber-300 dark:border-amber-800/60">
          <Lock className="w-10 h-10 text-amber-800 dark:text-amber-300" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-ggc-gold/15 dark:bg-ggc-gold/25 text-ggc-gold-dark dark:text-ggc-gold text-xs font-bold uppercase tracking-wider mb-3 border border-ggc-gold/30">
          <Sparkles className="w-3.5 h-3.5" /> Akses Asesmen Terkunci
        </span>

        <h2 className="text-2xl sm:text-3xl font-black text-ggc-dark dark:text-white tracking-tight">
          Selesaikan Pembayaran untuk Memulai
        </h2>

        <p className="mt-3 text-xs sm:text-sm text-gray-600 dark:text-[#A0B9AE] max-w-md mx-auto leading-relaxed">
          Instrumen Study Fit Assessment™ 84 butir hanya dapat diakses setelah pembayaran resmi terverifikasi oleh sistem Midtrans. Dapatkan rekomendasi rumpun jurusan dan pemetaan potensi diri Anda.
        </p>

        <div className="my-6 p-5 rounded-2xl bg-ggc-tint/60 dark:bg-[#031810] border border-ggc-subtle dark:border-[#11402E] text-left space-y-2 text-xs">
          <div className="flex items-center gap-2 text-gray-700 dark:text-[#C7DCD2]">
            <CheckCircle2 className="w-4 h-4 text-ggc-gold shrink-0" />
            <span>84 Pertanyaan Multi-Matriks (Bakat, Minat, Kepribadian, Nilai)</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700 dark:text-[#C7DCD2]">
            <CheckCircle2 className="w-4 h-4 text-ggc-gold shrink-0" />
            <span>Rekomendasi Top 5 Jurusan PTN & PTS Terbaik di Indonesia</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700 dark:text-[#C7DCD2]">
            <CheckCircle2 className="w-4 h-4 text-ggc-gold shrink-0" />
            <span>Laporan Hasil Eksekutif & Sertifikat Digital Terverifikasi</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setIsCheckoutModalOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-ggc-dark bg-gradient-to-r from-[#E6D5A8] via-ggc-gold to-ggc-gold-dark hover:shadow-lg transition-all text-xs shadow-md cursor-pointer"
          >
            <CreditCard className="w-4 h-4 text-ggc-dark" />
            <span>Bayar via Midtrans (Rp 49.000)</span>
            <ArrowRight className="w-4 h-4 text-ggc-dark" />
          </button>
          <Link
            href="/student/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-gray-700 dark:text-white bg-white dark:bg-[#082E20] border border-gray-300 dark:border-[#11402E] hover:bg-gray-50 dark:hover:bg-[#0A3324] transition-all text-xs shadow-sm"
          >
            <span>Kembali ke Dashboard</span>
          </Link>
        </div>

        <MidtransCheckoutModal
          isOpen={isCheckoutModalOpen}
          onClose={() => setIsCheckoutModalOpen(false)}
          price={49000}
        />
      </div>
    );
  }

  // Error State
  if (error && questions.length === 0) {
    return (
      <div className="max-w-lg mx-auto my-12 p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#07261B] border border-red-200 dark:border-red-900/40 shadow-xl text-center transition-colors">
        <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-4 shadow-sm">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Kendala Memuat Asesmen</h3>
        <p className="text-xs text-gray-600 dark:text-[#A0B9AE] mb-6 leading-relaxed">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs text-white bg-ggc hover:bg-ggc-light transition-all shadow-md cursor-pointer"
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
      <div className="max-w-2xl mx-auto my-12 p-8 sm:p-12 rounded-[2.5rem] bg-white dark:bg-[#07261B] border border-ggc-gold/40 shadow-2xl text-center relative overflow-hidden transition-colors">
        <div className="absolute top-0 right-0 w-80 h-80 bg-ggc-gold/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-emerald-100 dark:bg-emerald-950/40 rounded-full blur-3xl pointer-events-none" />

        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/60 dark:to-emerald-800/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mx-auto mb-6 shadow-md border border-emerald-300 dark:border-emerald-700/60">
          <CheckCircle2 className="w-12 h-12 stroke-[2.2]" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-ggc-gold/15 dark:bg-ggc-gold/25 text-ggc-gold-dark dark:text-ggc-gold text-xs font-bold uppercase tracking-wider mb-3 border border-ggc-gold/30">
          <Sparkles className="w-3.5 h-3.5" />
          Asesmen Berhasil Diselesaikan
        </span>

        <h2 className="text-2xl sm:text-4xl font-black text-ggc-dark dark:text-white tracking-tight">
          Selamat! Seluruh 84 Pertanyaan Selesai
        </h2>

        <p className="mt-3 text-xs sm:text-sm text-gray-600 dark:text-[#A0B9AE] max-w-lg mx-auto leading-relaxed">
          Semua respon evaluasi multi-matriks Anda telah berhasil dikunci dan diverifikasi oleh sistem analitik Go Great Career. Laporan hasil komprehensif Anda sudah siap dibuka!
        </p>

        <div className="my-8 p-6 rounded-2xl bg-ggc-tint/70 dark:bg-[#041B12] border border-ggc-subtle dark:border-[#0E4230] flex items-center justify-around text-center shadow-inner">
          <div>
            <div className="text-2xl sm:text-3xl font-black text-ggc dark:text-emerald-400">84 / 84</div>
            <div className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold uppercase mt-0.5">Soal Terjawab</div>
          </div>
          <div className="h-10 w-px bg-gray-200 dark:bg-[#0E4230]" />
          <div>
            <div className="text-2xl sm:text-3xl font-black text-ggc-gold-dark dark:text-ggc-gold">100%</div>
            <div className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold uppercase mt-0.5">Kelengkapan</div>
          </div>
          <div className="h-10 w-px bg-gray-200 dark:bg-[#0E4230]" />
          <div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-400">COMPLETED</div>
            <div className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold uppercase mt-0.5">Status Sesi</div>
          </div>
        </div>

        {/* Career Orientation Callout Banner */}
        <div className="my-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#07261B] via-ggc-dark to-[#0B4632] text-white border border-ggc-gold/30 text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg relative overflow-hidden">
          <div className="space-y-1.5 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-ggc-gold/20 text-ggc-gold text-[10px] font-bold uppercase tracking-wider border border-ggc-gold/30">
              <Sparkles className="w-3 h-3" /> Baru: Orientasi Karir
            </span>
            <h4 className="text-sm sm:text-base font-black text-white">
              Buka Analisis Orientasi Karir & Kepemimpinan
            </h4>
            <p className="text-xs text-ggc-subtle/90 max-w-md leading-relaxed">
              Padukan hasil 84 butir soal Anda dengan pengalaman nyata (organisasi OSIS/BEM, komunitas Karang Taruna, dan jurusan Anda) untuk membuka arketipe karir dan 3 jalur profesi masa depan!
            </p>
          </div>
          <Link
            href={`/student/results/${sessionData?.id || "active-session"}#orientasi-karir`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs text-[#0B4632] bg-gradient-to-r from-[#DFCA95] to-[#C5A869] hover:shadow-lg hover:scale-[1.02] transition-all shrink-0 cursor-pointer shadow-md relative z-10"
          >
            <Compass className="w-4 h-4 text-[#0B4632]" />
            <span>Lengkapi Orientasi Karir</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#0B4632]" />
          </Link>
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
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-gray-700 dark:text-white bg-white dark:bg-[#07261B] border border-gray-300 dark:border-[#0E4230] hover:bg-gray-50 dark:hover:bg-[#0A3324] transition-all text-xs shadow-sm"
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
      {/* Top Breadcrumb & Control Bar (Responsive)                          */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 pt-1 pb-0.5">
        <div className="flex items-center gap-1.5 text-xs min-w-0">
          <Link
            href="/student/dashboard"
            className="inline-flex items-center gap-1 font-bold text-gray-600 dark:text-[#C7DCD2] hover:text-ggc dark:hover:text-ggc-gold transition-colors bg-white dark:bg-[#07261B] px-2 sm:px-3 py-1.5 rounded-xl border border-gray-200 dark:border-[#0E4230] shadow-2xs hover:shadow-xs shrink-0"
            title="Kembali ke Dashboard Siswa"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-ggc dark:text-ggc-gold shrink-0" />
            <span className="text-[11px] font-bold hidden sm:inline">Dashboard Siswa</span>
            <span className="text-[11px] font-bold sm:hidden">Dashboard</span>
          </Link>
          <span className="text-gray-300 dark:text-gray-600 shrink-0">/</span>
          <span className="font-bold text-ggc-dark dark:text-white text-[11px] sm:text-xs truncate">
            Lembar Asesmen
          </span>
        </div>

        {/* View Mode Switcher, Audio, & Keyboard Help */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto">
          {/* Audio Feedback Toggle */}
          <button
            type="button"
            onClick={toggleSound}
            className={`p-1.5 sm:px-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 shrink-0 ${
              soundEnabled
                ? "bg-white dark:bg-[#07261B] text-ggc-dark dark:text-white border-gray-200 dark:border-[#0E4230] hover:border-ggc-gold shadow-2xs"
                : "bg-gray-100 dark:bg-[#041B12] text-gray-400 dark:text-gray-500 border-gray-200 dark:border-[#0E4230]"
            }`}
            title={`Suara Efek Audio: ${soundEnabled ? "Aktif" : "Mati"} (Tekan S)`}
            aria-label="Toggle suara efek"
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-ggc dark:text-ggc-gold" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-gray-400" />
            )}
            <span className="hidden md:inline text-[11px]">{soundEnabled ? "Audio On" : "Mute"}</span>
          </button>

          {/* Keyboard Shortcuts Guide Pill - Desktop only */}
          <button
            type="button"
            onClick={() => setIsKeyboardHelpOpen(true)}
            className="hidden sm:inline-flex p-1.5 sm:px-2.5 rounded-xl bg-white dark:bg-[#07261B] border border-gray-200 dark:border-[#0E4230] text-gray-600 dark:text-[#C7DCD2] hover:text-ggc dark:hover:text-ggc-gold transition-colors shadow-2xs text-xs font-bold items-center gap-1 shrink-0"
            title="Petunjuk Shortcut Keyboard (Tekan ?)"
          >
            <Keyboard className="w-3.5 h-3.5 text-ggc-gold" />
            <span className="hidden md:inline text-[11px]">Shortcut</span>
          </button>

          {/* Mode Segmented Control */}
          <div className="p-0.5 sm:p-1 rounded-xl bg-gray-100/90 dark:bg-[#041B12] border border-gray-200 dark:border-[#0E4230] flex items-center shrink-0">
            <button
              type="button"
              onClick={() => setViewMode("focus")}
              className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                viewMode === "focus"
                  ? "bg-white dark:bg-[#07261B] text-ggc-dark dark:text-white shadow-2xs ring-1 ring-ggc/20 dark:ring-ggc-gold/30"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
              title="Mode Fokus Soal-per-Soal (Tekan F)"
            >
              <Maximize2 className="w-3 h-3 text-ggc dark:text-ggc-gold" />
              <span className="text-[11px]">Fokus</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                viewMode === "list"
                  ? "bg-white dark:bg-[#07261B] text-ggc-dark dark:text-white shadow-2xs ring-1 ring-ggc/20 dark:ring-ggc-gold/30"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
              title="Mode Daftar 12 Soal (Tekan F)"
            >
              <LayoutList className="w-3 h-3 text-ggc dark:text-ggc-gold" />
              <span className="text-[11px]">Daftar</span>
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 1. ULTRA-SLIM RESPONSIVE STICKY HUD (DOES NOT BLOCK THE QUESTION)  */}
      {/* ------------------------------------------------------------------ */}
      <div className="sticky top-20 z-30 bg-white/95 dark:bg-[#07261B]/95 backdrop-blur-md rounded-2xl border border-gray-200/90 dark:border-[#0E4230] shadow-sm transition-all overflow-hidden">
        {/* Main Compact Row */}
        <div className="px-2.5 sm:px-4 py-1.5 sm:py-2.5 flex items-center justify-between gap-1.5 sm:gap-2">
          {/* Left: Dimension Pill & Question Counter */}
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span className="inline-flex items-center gap-1 sm:gap-1.5 text-xs font-bold text-ggc-dark dark:text-amber-300 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-xl bg-ggc-gold-subtle dark:bg-amber-950/60 border border-ggc-gold/30 dark:border-amber-800/40 shrink-0">
              <MilestoneIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-ggc-gold-dark dark:text-ggc-gold" />
              <span className="hidden sm:inline font-bold">{currentMilestone.dimensionBadge}</span>
              <span className="sm:hidden font-bold">P{currentSectionIndex + 1}</span>
            </span>

            <span className="text-[11px] sm:text-xs font-bold text-gray-700 dark:text-[#C7DCD2] whitespace-nowrap">
              Soal <strong className="text-ggc dark:text-ggc-gold">{viewMode === "focus" ? activeQuestion?.number : `${currentSectionIndex * 12 + 1}–${currentSectionIndex * 12 + 12}`}</strong>{" "}
              <span className="text-gray-400 dark:text-gray-500">/ {totalQuestions}</span>
            </span>

            {streakCount >= 3 && (
              <span className="inline-flex items-center gap-0.5 sm:gap-1 text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-1.5 sm:px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-800/40 shrink-0 animate-streak-glow">
                <Flame className="w-3 h-3 text-amber-600 dark:text-amber-400 fill-amber-500" />
                <span className="hidden sm:inline">{streakCount} beruntun</span>
                <span className="sm:hidden">{streakCount}</span>
              </span>
            )}
          </div>

          {/* Center: Slim Progress Bar (Hidden on Mobile) */}
          <div className="hidden md:flex items-center gap-2.5 flex-1 max-w-xs mx-auto">
            <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-[#041B12] overflow-hidden border border-gray-200 dark:border-[#0E4230]">
              <div
                className="h-full bg-gradient-to-r from-ggc via-ggc-light to-ggc-gold rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-black text-ggc-gold-dark dark:text-ggc-gold tabular-nums shrink-0">
              {progressPercent}%
            </span>
          </div>

          {/* Right: Controls & Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Real-time Connection & Sync Status Indicator (Phase 1.2) */}
            <div
              className={`flex items-center gap-1.5 text-xs px-2 sm:px-2.5 py-1 rounded-xl border transition-all ${
                !isOnline || pendingCount > 0 || saveStatus === "error"
                  ? "bg-amber-50 dark:bg-amber-950/70 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 shadow-2xs"
                  : isSyncing || saveStatus === "saving"
                  ? "bg-blue-50 dark:bg-blue-950/70 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                  : "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
              }`}
              aria-live="polite"
              title={
                !isOnline
                  ? "Mode Offline: Jawaban Anda aman tersimpan di perangkat lokal"
                  : pendingCount > 0
                  ? `${pendingCount} jawaban tersimpan di perangkat lokal, menunggu sinkronisasi`
                  : "Semua jawaban tersinkronisasi aman ke cloud"
              }
            >
              {isSyncing || saveStatus === "saving" ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="hidden sm:inline font-bold text-[11px]">Menyinkronkan...</span>
                  <span className="sm:hidden font-bold text-[10px]">Sync</span>
                </>
              ) : !isOnline || pendingCount > 0 || saveStatus === "error" ? (
                <button
                  type="button"
                  onClick={() => flushPendingQueue()}
                  disabled={isSyncing}
                  className="flex items-center gap-1 hover:underline cursor-pointer"
                  title="Klik untuk sinkronkan sekarang"
                >
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="hidden sm:inline font-bold text-[11px]">
                    {pendingCount > 0 ? `${pendingCount} ` : ""}Tersimpan Lokal (Offline)
                  </span>
                  <span className="sm:hidden font-bold text-[10px]">
                    {pendingCount > 0 ? `${pendingCount} ` : ""}Lokal
                  </span>
                  {isOnline && pendingCount > 0 && (
                    <RefreshCw className="w-3 h-3 ml-0.5 opacity-80" />
                  )}
                </button>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="hidden sm:inline font-bold text-[11px]">Tersinkronisasi</span>
                  <span className="sm:hidden font-bold text-[10px]">Aman</span>
                </>
              )}
            </div>

            {/* 7 Dimensi Dropdown Toggle */}
            <button
              type="button"
              onClick={() => setIsDimensionsOpen((prev) => !prev)}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all shrink-0 cursor-pointer ${
                isDimensionsOpen
                  ? "bg-ggc text-white border-ggc shadow-2xs"
                  : "bg-white dark:bg-[#07261B] text-gray-700 dark:text-[#C7DCD2] border-gray-200 dark:border-[#0E4230] hover:border-ggc-gold"
              }`}
              title="Buka / Tutup 7 Tahap Asesmen"
              aria-label="Buka / Tutup 7 Tahap Asesmen"
            >
              <Layers className="w-3.5 h-3.5 text-ggc-gold" />
              <span className="hidden sm:inline">7 Tahap</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isDimensionsOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Palet 84 Soal Trigger */}
            <button
              type="button"
              onClick={() => setIsPaletteOpen(true)}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-ggc-dark dark:text-amber-300 bg-ggc-gold-subtle dark:bg-amber-950/60 hover:bg-ggc-gold/20 dark:hover:bg-amber-900/60 border border-ggc-gold/40 transition-colors shadow-2xs shrink-0 cursor-pointer"
              title="Buka Lembar Nomor Soal (Tekan P)"
              aria-label="Buka Palet 84 Soal"
            >
              <Grid className="w-3.5 h-3.5 text-ggc-gold-dark dark:text-ggc-gold" />
              <span className="hidden sm:inline">Palet</span>
              <span className="tabular-nums font-black text-ggc dark:text-ggc-gold text-[11px] sm:text-xs">({answeredCount}/84)</span>
            </button>
          </div>
        </div>

        {/* Ultra-slim progress bar running across bottom edge */}
        <div className="w-full h-[2.5px] bg-gray-100 dark:bg-[#041B12] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-ggc via-ggc-light to-ggc-gold transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Collapsible 7-Dimensi Drawer: Only appears when toggled */}
        {isDimensionsOpen && (
          <div className="p-3 sm:p-4 bg-gray-50/90 dark:bg-[#041B12] border-t border-gray-100 dark:border-[#0E4230] animate-fadeIn transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2.5">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-ggc-gold-dark dark:text-ggc-gold">
                  Tahap Aktif: {currentMilestone.dimensionBadge}
                </span>
                <h4 className="text-xs sm:text-sm font-black text-ggc-dark dark:text-white">
                  {currentMilestone.title} ({currentMilestone.rangeText})
                </h4>
              </div>
              <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                {currentSectionAnsweredCount} dari {QUESTIONS_PER_SECTION} Terisi di Tahap Ini
              </span>
            </div>

            {/* Responsive 7-step buttons (horizontal scroll on mobile) */}
            <div className="flex sm:grid sm:grid-cols-7 gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
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
                    className={`min-w-[70px] sm:min-w-0 flex-1 snap-start p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      isCurrent
                        ? "bg-ggc text-white border-ggc-gold ring-2 ring-ggc-gold/40 shadow-xs"
                        : isDone
                        ? "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60"
                        : "bg-white dark:bg-[#07261B] text-gray-600 dark:text-gray-300 border-gray-200 dark:border-[#103D2B] hover:bg-gray-100 dark:hover:bg-[#0A3324]"
                    }`}
                    title={`${m.title} (${secAnswered}/12)`}
                  >
                    <div className="flex items-center justify-center gap-1 text-[11px] font-bold">
                      <span>P{m.index + 1}</span>
                      {isDone && (
                        <CheckCircle
                          className={`w-3.5 h-3.5 ${
                            isCurrent ? "text-ggc-gold" : "text-emerald-600 dark:text-emerald-400"
                          }`}
                        />
                      )}
                    </div>
                    <span
                      className={`text-[10px] tabular-nums block mt-0.5 ${
                        isCurrent ? "text-ggc-subtle" : "text-gray-400 dark:text-gray-500"
                      }`}
                    >
                      {secAnswered}/{QUESTIONS_PER_SECTION}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Offline Alert Banner (Phase 1.2) */}
      {!isOnline && (
        <div className="max-w-3xl mx-auto mb-4 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between gap-3 shadow-xs animate-slide-up">
          <div className="flex items-center gap-2.5">
            <WifiOff className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="leading-relaxed">
              <strong>Mode Offline:</strong> Koneksi internet Anda sedang terputus. Seluruh jawaban Anda tetap <strong>tersimpan aman di perangkat lokal</strong> dan akan otomatis dikirim ke server begitu internet terhubung kembali.
            </span>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 2. MODE FOKUS: SINGLE-QUESTION HERO CARD (RECOMMENDED EXPERIENCE)  */}
      {/* ------------------------------------------------------------------ */}
      {viewMode === "focus" && activeQuestion && (
        <div className="animate-focus-slide max-w-3xl mx-auto" key={activeQuestion.id}>
          {/* Card Wrapper */}
          <div className="p-4 sm:p-7 md:p-10 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#07261B] border border-ggc-gold/30 dark:border-[#0E4230] shadow-xl relative overflow-hidden transition-colors">
            {/* Background Accent Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-ggc-gold/10 via-emerald-50/40 to-transparent dark:from-ggc-gold/5 dark:via-emerald-950/20 rounded-full blur-2xl pointer-events-none" />

            {/* Header: Dimension Badge & Question Counter */}
            <div className="relative z-10 flex items-center justify-between pb-3 sm:pb-5 border-b border-gray-100 dark:border-[#0E4230]">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-ggc text-ggc-gold flex items-center justify-center shrink-0 shadow-2xs">
                  <MilestoneIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </span>
                <div>
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-ggc-gold-dark dark:text-ggc-gold block">
                    {currentMilestone.dimensionBadge}
                  </span>
                  <div className="text-[11px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 line-clamp-1">
                    {currentMilestone.subtitle}
                  </div>
                </div>
              </div>

              {/* Question Number Pill */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl bg-gray-100 dark:bg-[#041B12] text-ggc-dark dark:text-white font-black text-[11px] sm:text-xs border border-gray-200 dark:border-[#0E4230] shadow-inner">
                  Soal <strong className="text-ggc dark:text-ggc-gold">{activeQuestion.number}</strong> / {totalQuestions}
                </span>
              </div>
            </div>

            {/* Question Text Body */}
            <div className="py-4 sm:py-7 relative z-10 text-left">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 block mb-1.5 sm:mb-2">
                Pernyataan Evaluasi Bakat & Minat
              </span>
              <h2 className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white leading-snug sm:leading-relaxed tracking-tight">
                &ldquo;{activeQuestion.question_text}&rdquo;
              </h2>
              <p className="text-[11px] sm:text-xs text-gray-500 dark:text-[#A0B9AE] mt-2 sm:mt-2.5 italic">
                Pilih seberapa sesuai pernyataan ini dengan kecenderungan alami Anda (1 s/d 5).
              </p>
            </div>

            {/* 5 Likert Buttons */}
            <div className="pt-2 pb-4 sm:pb-6 border-t border-gray-100 dark:border-[#0E4230] relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 sm:gap-3">
                {activeQuestion.options.map((opt) => {
                  const isSelected = answers[activeQuestion.id] === opt.value;

                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelectAnswer(activeQuestion.id, opt.value, true)}
                      className={`group relative min-h-[50px] sm:min-h-[76px] px-3.5 py-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border text-center transition-all duration-200 flex sm:flex-col items-center justify-between sm:justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-ggc focus-visible:ring-offset-2 cursor-pointer ${
                        isSelected
                          ? "bg-gradient-to-r sm:bg-gradient-to-b from-ggc to-ggc-light text-white border-ggc-gold ring-2 ring-ggc-gold/50 shadow-md scale-[1.01]"
                          : "bg-gray-50/80 dark:bg-[#041B12] text-gray-700 dark:text-[#C7DCD2] border-gray-200 dark:border-[#103D2B] hover:border-ggc-gold/60 hover:bg-ggc-subtle/50 dark:hover:bg-[#0A3324] active:scale-98"
                      }`}
                    >
                      {/* Keyboard Shortcut Indicator & Value */}
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black transition-colors shrink-0 ${
                          isSelected
                            ? "bg-ggc-gold text-ggc-dark shadow-xs"
                            : "bg-white dark:bg-[#07261B] text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-[#103D2B] group-hover:border-ggc group-hover:text-ggc dark:group-hover:text-ggc-gold"
                        }`}
                      >
                        {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : opt.value}
                      </span>

                      {/* Label Text */}
                      <span
                        className={`text-xs sm:text-[11px] lg:text-xs leading-tight text-right sm:text-center ${
                          isSelected ? "text-white font-bold" : "text-gray-700 dark:text-[#C7DCD2] font-semibold"
                        }`}
                      >
                        {opt.label}
                      </span>

                      {/* Keyboard shortcut badge for desktop */}
                      <span
                        className={`hidden sm:inline-block text-[9px] uppercase tracking-wider font-mono opacity-50 ${
                          isSelected ? "text-white" : "text-gray-400 dark:text-gray-500"
                        }`}
                      >
                        [{opt.value}]
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Card Navigation */}
            <div className="pt-4 sm:pt-5 border-t border-gray-100 dark:border-[#0E4230] relative z-10 flex items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={handleFocusPrev}
                disabled={activeQuestionIndex === 0}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs font-bold text-gray-700 dark:text-white bg-white dark:bg-[#07261B] border border-gray-300 dark:border-[#103D2B] hover:bg-gray-50 dark:hover:bg-[#0A3324] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                title="Soal Sebelumnya (Tekan A atau ←)"
              >
                <ArrowLeft className="w-4 h-4 shrink-0" />
                <span>Sebelumnya</span>
              </button>

              <div className="hidden sm:block text-center text-xs text-gray-500 font-medium">
                {answers[activeQuestion.id] !== undefined ? (
                  <span className="text-emerald-700 font-bold inline-flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Jawaban tersimpan
                  </span>
                ) : (
                  <span>Tekan angka <strong>[1-5]</strong> di keyboard</span>
                )}
              </div>

              <button
                type="button"
                onClick={handleFocusNext}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs font-bold text-white bg-ggc hover:bg-ggc-light active:bg-ggc-dark transition-all shadow-md"
                title="Soal Berikutnya (Tekan D atau →)"
              >
                <span>{activeQuestionIndex < totalQuestions - 1 ? "Berikutnya" : "Selesai"}</span>
                <ArrowRight className="w-4 h-4 text-ggc-gold shrink-0" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 3. MODE DAFTAR: 12 SOAL BERTUMPUK (STREAMLINED LIST VIEW)          */}
      {/* ------------------------------------------------------------------ */}
      {viewMode === "list" && (
        <div className="space-y-3 sm:space-y-4 animate-section-in" key={currentSectionIndex}>
          {/* Section Banner */}
          <div className="p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-ggc-tint via-white to-ggc-gold-subtle dark:from-[#062419] dark:via-[#093525] dark:to-[#062419] border border-ggc/20 dark:border-[#0E4230] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-ggc text-ggc-gold flex items-center justify-center shrink-0 shadow-sm">
                <MilestoneIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-ggc dark:text-ggc-gold">
                    Fokus Evaluasi
                  </span>
                  <span className="text-gray-300 dark:text-gray-600">•</span>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                    {currentMilestone.rangeText}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-gray-800 dark:text-white mt-0.5 leading-snug">
                  {currentMilestone.subtitle}
                </p>
                <p className="text-[11px] sm:text-xs text-gray-500 dark:text-[#A0B9AE] italic mt-0.5 sm:mt-1 leading-relaxed hidden sm:block">
                  &ldquo;{currentMilestone.quote}&rdquo;
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs bg-white/90 dark:bg-[#07261B]/90 backdrop-blur-xs px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-[#0E4230] text-gray-600 dark:text-[#A0B9AE] self-start sm:self-auto shrink-0">
              <HelpCircle className="w-3.5 h-3.5 text-ggc-gold-dark dark:text-ggc-gold shrink-0" />
              <span>Skala: 1 (STS) s/d 5 (SS)</span>
            </div>
          </div>

          {/* List of 12 Questions */}
          {currentSectionQuestions.map((q) => {
            const selectedValue = answers[q.id];
            const isAnswered = selectedValue !== undefined;

            const shortLabels: Record<number, string> = {
              1: "Sgt Tdk",
              2: "Tidak",
              3: "Netral",
              4: "Sesuai",
              5: "Sangat",
            };

            return (
              <article
                key={q.id}
                id={`question-card-${q.number}`}
                className={`p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl transition-all duration-200 border relative ${
                  isAnswered
                    ? "bg-white dark:bg-[#07261B] border-ggc/40 dark:border-ggc-gold/40 shadow-sm border-l-4 border-l-ggc dark:border-l-ggc-gold"
                    : "bg-white dark:bg-[#07261B] border-gray-200 dark:border-[#103D2B] shadow-sm hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                {/* Question Header: Number + Text */}
                <div className="flex items-start gap-2.5 sm:gap-3.5 mb-2.5 sm:mb-4">
                  <div className="relative shrink-0">
                    <div
                      className={`w-7 h-7 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-xs sm:text-sm transition-all ${
                        isAnswered
                          ? "bg-ggc text-ggc-gold shadow-xs ring-1 ring-ggc-gold/40"
                          : "bg-gray-100 dark:bg-[#041B12] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-[#103D2B]"
                      }`}
                    >
                      {q.number}
                    </div>
                    {isAnswered && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-xs">
                        <Check className="w-2 h-2 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h2
                      id={`question-text-${q.id}`}
                      className="text-sm sm:text-base md:text-lg font-bold text-gray-900 dark:text-white leading-snug sm:leading-relaxed"
                    >
                      {q.question_text}
                    </h2>
                  </div>
                </div>

                {/* Likert Scale Cards (1 to 5) - 5-column layout */}
                <fieldset className="pt-2 sm:pt-3 border-t border-gray-100 dark:border-[#0E4230]">
                  <legend className="sr-only">
                    Pilihan jawaban untuk butir nomor {q.number}: {q.question_text}
                  </legend>
                  <div
                    className="grid grid-cols-5 gap-1.5 sm:gap-2.5"
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
                          className={`group relative min-h-[48px] sm:min-h-[72px] p-1.5 sm:p-3 rounded-xl sm:rounded-2xl border text-center transition-all duration-200 flex flex-col items-center justify-center gap-0.5 sm:gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ggc focus-visible:ring-offset-2 cursor-pointer ${
                            isSelected
                              ? "bg-gradient-to-b from-ggc to-ggc-light text-white border-ggc-gold ring-2 ring-ggc-gold/50 shadow-md scale-[1.02]"
                              : "bg-gray-50/80 dark:bg-[#041B12] text-gray-700 dark:text-[#C7DCD2] border-gray-200 dark:border-[#103D2B] hover:border-ggc/40 dark:hover:border-ggc-gold/40 hover:bg-ggc-subtle/40 dark:hover:bg-[#0A3324] active:scale-98"
                          }`}
                        >
                          <span
                            className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl flex items-center justify-center text-xs font-black transition-colors ${
                              isSelected
                                ? "bg-ggc-gold text-ggc-dark shadow-xs"
                                : "bg-white dark:bg-[#07261B] text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-[#103D2B] group-hover:border-ggc group-hover:text-ggc dark:group-hover:text-ggc-gold"
                            }`}
                          >
                            {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : opt.value}
                          </span>

                          <span
                            className={`sm:hidden text-[9px] leading-tight font-bold ${
                              isSelected ? "text-white" : "text-gray-600 dark:text-gray-300"
                            }`}
                          >
                            {shortLabels[opt.value]}
                          </span>

                          <span
                            className={`hidden sm:inline-block text-xs leading-tight text-center ${
                              isSelected ? "text-white font-bold" : "text-gray-700 dark:text-[#C7DCD2] font-medium"
                            }`}
                          >
                            {opt.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Feedback strip under options */}
                  <div className="mt-1.5 sm:mt-2 flex items-center justify-between text-[11px] px-0.5">
                    {isAnswered ? (
                      <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/40">
                        <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
                        <span>Pilihan: <strong>{selectedValue} - {q.options.find(o => o.value === selectedValue)?.label}</strong></span>
                      </span>
                    ) : (
                      <div className="flex items-center justify-between w-full text-[10px] text-gray-400 dark:text-gray-500 italic">
                        <span>← 1 (Sangat Tidak Sesuai)</span>
                        <span>5 (Sangat Sesuai) →</span>
                      </div>
                    )}
                  </div>
                </fieldset>
              </article>
            );
          })}

          {/* Section Navigation Footer Bar */}
          <div className="p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#07261B] border border-ggc-subtle dark:border-[#0E4230] shadow-md flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 mt-6 transition-colors">
            <div className="flex items-center justify-between w-full sm:w-auto gap-2.5 order-2 sm:order-1">
              <button
                type="button"
                onClick={handlePrevSection}
                disabled={currentSectionIndex === 0}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-6 py-2.5 sm:py-3.5 rounded-xl text-xs font-bold text-gray-700 dark:text-white bg-white dark:bg-[#041B12] border border-gray-300 dark:border-[#103D2B] hover:bg-gray-50 dark:hover:bg-[#0A3324] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 shrink-0" />
                <span>Sebelumnya</span>
              </button>

              {currentSectionIndex < TOTAL_SECTIONS - 1 ? (
                <button
                  type="button"
                  onClick={handleNextSection}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-7 py-2.5 sm:py-3.5 rounded-xl text-xs font-bold text-white bg-ggc hover:bg-ggc-light active:bg-ggc-dark transition-all shadow-md hover:shadow-lg sm:hidden cursor-pointer"
                >
                  <span>Lanjut (P{currentSectionIndex + 2})</span>
                  <ArrowRight className="w-4 h-4 text-ggc-gold shrink-0" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(true)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-7 py-2.5 sm:py-3.5 rounded-xl text-xs font-bold text-ggc-dark bg-gradient-to-r from-[#E6D5A8] via-ggc-gold to-ggc-gold-dark hover:shadow-lg transition-all shadow-md sm:hidden cursor-pointer"
                >
                  <Send className="w-4 h-4 shrink-0" />
                  <span>Selesai</span>
                </button>
              )}
            </div>

            <div className="text-xs text-gray-600 dark:text-[#A0B9AE] font-medium text-center order-1 sm:order-2">
              Tahap <strong>{currentSectionIndex + 1}</strong> dari {TOTAL_SECTIONS} •{" "}
              <strong className="text-ggc dark:text-ggc-gold">{currentSectionAnsweredCount}</strong> dari {QUESTIONS_PER_SECTION} terisi
            </div>

            <div className="hidden sm:block order-3">
              {currentSectionIndex < TOTAL_SECTIONS - 1 ? (
                <button
                  type="button"
                  onClick={handleNextSection}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-xs font-bold text-white bg-ggc hover:bg-ggc-light active:bg-ggc-dark transition-all shadow-md hover:shadow-lg cursor-pointer"
                >
                  <span>Lanjut ke Bagian {currentSectionIndex + 2}</span>
                  <ArrowRight className="w-4 h-4 text-ggc-gold" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-xs font-bold text-ggc-dark bg-gradient-to-r from-[#E6D5A8] via-ggc-gold to-ggc-gold-dark hover:shadow-lg transition-all shadow-md cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Tinjau & Selesaikan Asesmen</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 4. CELEBRATORY MILESTONE POPUP DIALOG                              */}
      {/* ------------------------------------------------------------------ */}
      {celebratingMilestone && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="milestone-celebrate-title"
          aria-describedby="milestone-celebrate-desc"
          style={{ overscrollBehavior: "contain" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleDismissMilestone();
          }}
        >
          {/* Confetti Particles (CSS Animated) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
            <div className="absolute top-10 left-1/4 w-3 h-3 rounded-full bg-ggc-gold animate-confetti" style={{ animationDelay: "0s" }} />
            <div className="absolute top-8 left-1/2 w-4 h-2 bg-emerald-400 rotate-45 animate-confetti" style={{ animationDelay: "0.3s" }} />
            <div className="absolute top-12 left-3/4 w-3 h-3 rounded-full bg-amber-300 animate-confetti" style={{ animationDelay: "0.6s" }} />
            <div className="absolute top-6 left-1/3 w-2 h-4 bg-teal-300 -rotate-12 animate-confetti" style={{ animationDelay: "0.9s" }} />
            <div className="absolute top-10 left-2/3 w-3 h-3 bg-yellow-400 rotate-12 animate-confetti" style={{ animationDelay: "1.2s" }} />
          </div>

          <div
            className="bg-white dark:bg-[#062419] rounded-[2.5rem] max-w-lg w-full p-6 sm:p-10 shadow-2xl border-2 border-ggc-gold/50 text-center relative overflow-hidden animate-milestone-pop text-gray-900 dark:text-white"
            style={{ overscrollBehavior: "contain" }}
          >
            {/* Top Glow Orb */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-ggc-gold/25 rounded-full blur-2xl pointer-events-none" />

            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#E6D5A8] via-ggc-gold to-ggc-gold-dark text-ggc-dark flex items-center justify-center mx-auto mb-5 shadow-xl ring-4 ring-ggc-gold/20">
              <Trophy className="w-10 h-10" />
            </div>

            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-ggc-gold/15 dark:bg-ggc-gold/25 text-ggc-gold-dark dark:text-ggc-gold text-xs font-bold uppercase tracking-wider mb-2 border border-ggc-gold/30">
              <Sparkles className="w-3.5 h-3.5" />
              Milestone Dimensi Tuntas!
            </span>

            <h2 id="milestone-celebrate-title" className="text-2xl sm:text-3xl font-black text-ggc-dark dark:text-white tracking-tight">
              {celebratingMilestone.dimensionBadge} Selesai!
            </h2>

            <p id="milestone-celebrate-desc" className="text-xs sm:text-sm text-gray-600 dark:text-[#A0B9AE] mt-2 leading-relaxed">
              &ldquo;{celebratingMilestone.quote}&rdquo;
            </p>

            {/* Achievement Card */}
            <div className="my-6 p-4 rounded-2xl bg-ggc-tint dark:bg-[#031810] border border-ggc-subtle dark:border-[#0E4230] flex items-center justify-between text-xs font-bold text-ggc-dark dark:text-white">
              <span>Progres Asesmen:</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-extrabold text-sm">
                {celebratingMilestone.completedCount} / {totalQuestions} Soal ({Math.round((celebratingMilestone.completedCount / totalQuestions) * 100)}%)
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleDismissMilestone}
                className="w-full py-4 px-6 rounded-2xl text-xs font-bold text-ggc-dark bg-gradient-to-r from-[#E6D5A8] via-ggc-gold to-ggc-gold-dark hover:shadow-xl hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
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
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4 transition-opacity"
          role="dialog"
          aria-modal="true"
          aria-labelledby="palette-modal-title"
          style={{ overscrollBehavior: "contain" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsPaletteOpen(false);
          }}
        >
          <div
            className="bg-white dark:bg-[#062419] rounded-t-[2.5rem] sm:rounded-[2rem] max-w-2xl w-full p-4 pb-safe sm:p-8 shadow-2xl border-t-2 sm:border border-ggc-gold/30 max-h-[85vh] sm:max-h-[90vh] flex flex-col animate-slide-up-sheet sm:animate-scale-in text-gray-900 dark:text-white"
            style={{ overscrollBehavior: "contain" }}
          >
            {/* Mobile Drag Indicator Handle */}
            <div
              className="sm:hidden flex flex-col items-center justify-center pt-1 pb-2 cursor-grab shrink-0 select-none touch-none"
              onTouchStart={handleModalTouchStart}
              onTouchEnd={handleModalTouchEnd(() => setIsPaletteOpen(false))}
              onClick={() => setIsPaletteOpen(false)}
            >
              <div className="w-12 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 active:bg-gray-400" />
              <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-wider">
                Geser ke bawah untuk menutup
              </span>
            </div>

            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-[#0E4230]">
              <div>
                <h2
                  id="palette-modal-title"
                  className="text-lg sm:text-xl font-black text-ggc-dark dark:text-white flex items-center gap-2"
                >
                  <Grid className="w-5 h-5 text-ggc dark:text-ggc-gold" />
                  Daftar Nomor Soal (84 Butir)
                </h2>
                <p className="text-xs text-gray-500 dark:text-[#A0B9AE] mt-0.5">
                  Klik nomor soal untuk melompat langsung ke soal yang diinginkan.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPaletteOpen(false)}
                className="w-9 h-9 rounded-full bg-gray-100 dark:bg-[#082E20] hover:bg-gray-200 dark:hover:bg-[#0C3E2B] text-gray-600 dark:text-gray-300 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
                aria-label="Tutup daftar soal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Action: Jump to Unanswered */}
            {unansweredQuestionNumbers.length > 0 && (
              <div className="pt-3 pb-2 flex items-center justify-between gap-3 border-b border-gray-100 dark:border-[#0E4230]">
                <span className="text-xs text-gray-600 dark:text-[#A0B9AE]">
                  Tersisa <strong>{unansweredQuestionNumbers.length} butir</strong> belum terisi:
                </span>
                <button
                  type="button"
                  onClick={handleJumpToFirstUnanswered}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/40 transition-colors shadow-2xs cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Lompat ke Soal Belum Terisi (#{unansweredQuestionNumbers[0]})</span>
                </button>
              </div>
            )}

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 py-3 text-xs text-gray-600 dark:text-[#A0B9AE] border-b border-gray-100 dark:border-[#0E4230]">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-md bg-ggc" />
                <span>Terjawab ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-md bg-gray-100 dark:bg-[#07261B] border border-gray-300 dark:border-[#103D2B]" />
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
                  <div key={secIdx} className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#031810] border border-gray-100 dark:border-[#0E4230]">
                    <div className="text-xs font-bold text-ggc-dark dark:text-white mb-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span>Bagian {secIdx + 1}: {milestone.dimensionBadge}</span>
                      </div>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold tabular-nums">
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
                            className={`h-9 rounded-xl text-xs font-black transition-all flex items-center justify-center border cursor-pointer ${
                              isCurrentActive
                                ? "bg-ggc-gold text-ggc-dark border-ggc-gold ring-2 ring-ggc-gold-dark shadow-xs"
                                : isAnswered
                                ? "bg-ggc text-white border-ggc hover:bg-ggc-light"
                                : "bg-white dark:bg-[#07261B] text-gray-600 dark:text-gray-300 border-gray-200 dark:border-[#103D2B] hover:border-gray-400"
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

            <div className="pt-4 border-t border-gray-100 dark:border-[#0E4230] flex justify-end">
              <button
                type="button"
                onClick={() => setIsPaletteOpen(false)}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-ggc hover:bg-ggc-light transition-all cursor-pointer"
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="keyboard-help-title"
          style={{ overscrollBehavior: "contain" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsKeyboardHelpOpen(false);
          }}
        >
          <div
            className="bg-white dark:bg-[#062419] rounded-[2rem] max-w-md w-full p-6 sm:p-8 shadow-2xl border border-ggc-gold/30 text-gray-900 dark:text-white"
            style={{ overscrollBehavior: "contain" }}
          >
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-[#0E4230]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-ggc text-ggc-gold flex items-center justify-center shrink-0">
                  <Keyboard className="w-5 h-5" />
                </div>
                <div>
                  <h2 id="keyboard-help-title" className="text-lg font-black text-ggc-dark dark:text-white">
                    Shortcut Keyboard
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-[#A0B9AE]">Mengerjakan asesmen lebih cepat tanpa mouse</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsKeyboardHelpOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#082E20] hover:bg-gray-200 dark:hover:bg-[#0C3E2B] text-gray-600 dark:text-gray-300 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-[#031810] border border-gray-100 dark:border-[#0E4230]">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Pilih Skala Jawaban (1 s/d 5)</span>
                <span className="px-2 py-1 rounded bg-white dark:bg-[#07261B] border border-gray-300 dark:border-[#103D2B] font-mono font-bold text-ggc-dark dark:text-ggc-gold">1, 2, 3, 4, 5</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-[#031810] border border-gray-100 dark:border-[#0E4230]">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Soal Sebelumnya</span>
                <span className="px-2 py-1 rounded bg-white dark:bg-[#07261B] border border-gray-300 dark:border-[#103D2B] font-mono font-bold text-ggc-dark dark:text-ggc-gold">A / ←</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-[#031810] border border-gray-100 dark:border-[#0E4230]">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Soal Berikutnya</span>
                <span className="px-2 py-1 rounded bg-white dark:bg-[#07261B] border border-gray-300 dark:border-[#103D2B] font-mono font-bold text-ggc-dark dark:text-ggc-gold">D / →</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-[#031810] border border-gray-100 dark:border-[#0E4230]">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Ganti Mode (Fokus / Daftar)</span>
                <span className="px-2 py-1 rounded bg-white dark:bg-[#07261B] border border-gray-300 dark:border-[#103D2B] font-mono font-bold text-ggc-dark dark:text-ggc-gold">F</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-[#031810] border border-gray-100 dark:border-[#0E4230]">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Buka Palet 84 Nomor Soal</span>
                <span className="px-2 py-1 rounded bg-white dark:bg-[#07261B] border border-gray-300 dark:border-[#103D2B] font-mono font-bold text-ggc-dark dark:text-ggc-gold">P</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-[#031810] border border-gray-100 dark:border-[#0E4230]">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Toggle Efek Suara (Audio)</span>
                <span className="px-2 py-1 rounded bg-white dark:bg-[#07261B] border border-gray-300 dark:border-[#103D2B] font-mono font-bold text-ggc-dark dark:text-ggc-gold">S</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-[#031810] border border-gray-100 dark:border-[#0E4230]">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Tutup Dialog / Batal</span>
                <span className="px-2 py-1 rounded bg-white dark:bg-[#07261B] border border-gray-300 dark:border-[#103D2B] font-mono font-bold text-ggc-dark dark:text-ggc-gold">Esc</span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-[#0E4230] flex justify-end">
              <button
                type="button"
                onClick={() => setIsKeyboardHelpOpen(false)}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-ggc hover:bg-ggc-light transition-all text-center cursor-pointer"
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
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4 transition-opacity"
          role="dialog"
          aria-modal="true"
          aria-labelledby="submit-modal-title"
          style={{ overscrollBehavior: "contain" }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSubmitting) setIsSubmitModalOpen(false);
          }}
        >
          <div
            className="bg-white dark:bg-[#062419] rounded-t-[2.5rem] sm:rounded-[2rem] max-w-lg w-full p-5 pb-safe sm:p-8 shadow-2xl border-t-2 sm:border border-ggc-gold/30 animate-slide-up-sheet sm:animate-scale-in text-gray-900 dark:text-white"
            style={{ overscrollBehavior: "contain" }}
          >
            {/* Mobile Drag Indicator Handle */}
            <div
              className="sm:hidden flex flex-col items-center justify-center pt-1 pb-2 cursor-grab shrink-0 select-none touch-none"
              onTouchStart={handleModalTouchStart}
              onTouchEnd={handleModalTouchEnd(() => {
                if (!isSubmitting) setIsSubmitModalOpen(false);
              })}
              onClick={() => {
                if (!isSubmitting) setIsSubmitModalOpen(false);
              }}
            >
              <div className="w-12 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 active:bg-gray-400" />
              <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-wider">
                Geser ke bawah untuk menutup
              </span>
            </div>

            <div className="text-center mb-5 sm:mb-6">
              <div className="w-16 h-16 rounded-3xl bg-ggc-gold/20 text-ggc-gold-dark dark:text-ggc-gold flex items-center justify-center mx-auto mb-3 border border-ggc-gold/30 shadow-xs">
                <Send className="w-8 h-8" />
              </div>
              <h2 id="submit-modal-title" className="text-xl sm:text-2xl font-black text-ggc-dark dark:text-white">
                Konfirmasi Penyelesaian Asesmen
              </h2>
              <p className="text-xs text-gray-500 dark:text-[#A0B9AE] mt-1">
                Pastikan seluruh 84 butir instrumen telah terisi dengan cermat.
              </p>
            </div>

            {/* Status Summary Box */}
            <div className="p-5 rounded-2xl bg-ggc-tint/70 dark:bg-[#031810] border border-ggc-subtle dark:border-[#0E4230] mb-6">
              <div className="flex items-center justify-between text-xs font-bold text-ggc-dark dark:text-white mb-2">
                <span>Status Kelengkapan:</span>
                <span className={answeredCount === totalQuestions ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"}>
                  {answeredCount} / {totalQuestions} Soal ({progressPercent}%)
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-ggc to-ggc-gold rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {answeredCount < totalQuestions ? (
                <div className="mt-4 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div>
                    <strong>Perhatian:</strong> Masih ada{" "}
                    <strong>{totalQuestions - answeredCount} butir soal</strong> yang belum Anda isi. Disarankan untuk melengkapi seluruh soal agar skor multi-matriks dan rekomendasi jurusan Anda 100% akurat.
                  </div>
                </div>
              ) : (
                <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Luar biasa! Seluruh 84 butir soal telah lengkap terjawab dan siap dikalkulasi.</span>
                </div>
              )}
            </div>

            {/* Offline Pending Sync Warning Banner (Fix 1.3) */}
            {pendingCount > 0 && (
              <div className="mb-5 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex flex-col gap-2.5">
                <div className="flex items-center gap-2 font-bold">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>
                    Sinkronisasi Tertunda: {pendingCount} Jawaban Tersimpan di Perangkat
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-800/90 dark:text-amber-300/90">
                  Seluruh jawaban Anda aman tersimpan di memori browser ini. Namun sebelum dapat mengunci dan menerbitkan laporan hasil evaluasi, semua butir soal wajib tersimpan lengkap di database cloud.
                </p>
                <button
                  type="button"
                  onClick={() => flushPendingQueue()}
                  disabled={isSyncing}
                  className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors self-start shadow-xs cursor-pointer disabled:opacity-60"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                  <span>{isSyncing ? "Sedang Menyinkronkan..." : "Sinkronkan Sekarang"}</span>
                </button>
              </div>
            )}

            {/* Error message if API error */}
            {error && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                disabled={isSubmitting}
                className="w-full sm:w-1/2 py-3.5 px-4 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-[#082E20] hover:bg-gray-200 dark:hover:bg-[#0C3E2B] transition-all text-center cursor-pointer border border-transparent dark:border-[#103D2B]"
              >
                Cek Kembali Soal
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting || isSyncing || pendingCount > 0 || answeredCount < totalQuestions}
                className="w-full sm:w-1/2 py-3.5 px-4 rounded-xl text-xs font-bold text-white bg-ggc hover:bg-ggc-light active:bg-ggc-dark transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                title={
                  pendingCount > 0
                    ? "Selesaikan sinkronisasi terlebih dahulu"
                    : answeredCount < totalQuestions
                    ? "Lengkapi seluruh soal terlebih dahulu"
                    : "Kunci dan selesaikan asesmen"
                }
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
