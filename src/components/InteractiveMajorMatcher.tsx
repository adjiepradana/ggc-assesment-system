"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Brain,
  Compass,
  GraduationCap,
  TrendingUp,
  Check,
  RotateCcw,
  BookOpen,
  Briefcase,
} from "lucide-react";
import Link from "next/link";

interface EducationStream {
  id: string;
  label: string;
  icon: string;
  category: "SMA" | "SMK" | "UMUM";
}

interface InterestTag {
  id: string;
  label: string;
  icon: string;
  cluster: "Saintek" | "Soshum" | "Bisnis" | "Kreatif";
}

interface PredictionResult {
  cluster: string;
  matchScore: number;
  archetype: string;
  archetypeTagline: string;
  topMajors: Array<{ name: string; faculty: string; fitRate: string }>;
  careerTrack: string;
  keySkills: string[];
}

const STREAMS: EducationStream[] = [
  { id: "sma-mipa", label: "SMA MIPA / Sains", icon: "🔬", category: "SMA" },
  { id: "sma-ips", label: "SMA IPS / Sosial", icon: "📚", category: "SMA" },
  { id: "smk-ti", label: "SMK TIK / Rekayasa", icon: "💻", category: "SMK" },
  { id: "smk-bisnis", label: "SMK Bisnis & Manajemen", icon: "📈", category: "SMK" },
  { id: "sma-bahasa", label: "SMA Bahasa & Budaya", icon: "🌐", category: "SMA" },
];

const INTERESTS: InterestTag[] = [
  { id: "coding", label: "Coding & AI", icon: "🤖", cluster: "Saintek" },
  { id: "design", label: "Desain & Media", icon: "🎨", cluster: "Kreatif" },
  { id: "business", label: "Bisnis & Startup", icon: "🚀", cluster: "Bisnis" },
  { id: "health", label: "Biologi & Medis", icon: "🧬", cluster: "Saintek" },
  { id: "psychology", label: "Psikologi & Manusia", icon: "🧠", cluster: "Soshum" },
  { id: "finance", label: "Finansial & Investasi", icon: "📊", cluster: "Bisnis" },
  { id: "law", label: "Hukum & Kebijakan", icon: "⚖️", cluster: "Soshum" },
  { id: "writing", label: "Komunikasi & Bahasa", icon: "✍️", cluster: "Soshum" },
];

export default function InteractiveMajorMatcher({
  onOpenCheckout,
}: {
  onOpenCheckout?: () => void;
}) {
  const [selectedStream, setSelectedStream] = useState<string>("sma-mipa");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    "coding",
    "business",
  ]);

  const toggleInterest = (id: string) => {
    if (selectedInterests.includes(id)) {
      if (selectedInterests.length > 1) {
        setSelectedInterests(selectedInterests.filter((item) => item !== id));
      }
    } else {
      if (selectedInterests.length < 3) {
        setSelectedInterests([...selectedInterests, id]);
      } else {
        // Replace the oldest selection
        setSelectedInterests([...selectedInterests.slice(1), id]);
      }
    }
  };

  // Compute dynamic prediction based on stream and chosen interests
  const getPrediction = (): PredictionResult => {
    const hasCoding = selectedInterests.includes("coding");
    const hasDesign = selectedInterests.includes("design");
    const hasBusiness = selectedInterests.includes("business");
    const hasHealth = selectedInterests.includes("health");
    const hasPsychology = selectedInterests.includes("psychology");
    const hasFinance = selectedInterests.includes("finance");
    const hasLaw = selectedInterests.includes("law");

    if (hasCoding && (hasBusiness || hasFinance)) {
      return {
        cluster: "Saintek & Bisnis Digital",
        matchScore: 97,
        archetype: "The Digital Venture Architect",
        archetypeTagline: "Ahli integrasi sistem komputasi modern dengan model bisnis bernilai tinggi.",
        topMajors: [
          { name: "Sistem Informasi & Bisnis Digital", faculty: "Fakultas Ilmu Komputer", fitRate: "97% • Sangat Cocok" },
          { name: "Teknik Informatika & Artificial Intelligence", faculty: "Fakultas Teknik", fitRate: "95% • Sangat Cocok" },
          { name: "Sains Data (Data Science & Analytics)", faculty: "Fakultas MIPA / Komputer", fitRate: "92% • Cocok" },
        ],
        careerTrack: "Product Manager, AI Solutions Consultant, Tech Entrepreneur",
        keySkills: ["Algoritma & Data", "Product Strategy", "System Architecture"],
      };
    }

    if (hasDesign || (hasCoding && hasDesign)) {
      return {
        cluster: "Kreatif & Teknologi Interaktif",
        matchScore: 96,
        archetype: "The Creative Technologist",
        archetypeTagline: "Mengawinkan estetika visual tingkat tinggi dengan pengalaman interaktif mutakhir.",
        topMajors: [
          { name: "Desain Komunikasi Visual (DKV)", faculty: "Fakultas Seni Rupa & Desain", fitRate: "96% • Sangat Cocok" },
          { name: "Desain Produk & UI/UX Interaktif", faculty: "Fakultas Industri Kreatif", fitRate: "94% • Sangat Cocok" },
          { name: "Teknologi Game & Animasi Digital", faculty: "Fakultas Ilmu Komputer", fitRate: "90% • Cocok" },
        ],
        careerTrack: "UI/UX Designer, Creative Director, Interaction Designer",
        keySkills: ["Visual Hierarchy", "Design Thinking", "User Empathy"],
      };
    }

    if (hasHealth) {
      return {
        cluster: "Kesehatan & Biomedika",
        matchScore: 95,
        archetype: "The Empirical Healer & Bio-Scientist",
        archetypeTagline: "Dedikasi ilmiah tinggi untuk memajukan kesehatan dan kualitas hidup manusia.",
        topMajors: [
          { name: "Kedokteran & Profesi Dokter", faculty: "Fakultas Kedokteran", fitRate: "95% • Sangat Cocok" },
          { name: "Farmasi & Bioteknologi Kesehatan", faculty: "Fakultas Farmasi", fitRate: "93% • Sangat Cocok" },
          { name: "Kesehatan Masyarakat & Epidemiologi", faculty: "Fakultas Kesehatan Masyarakat", fitRate: "89% • Cocok" },
        ],
        careerTrack: "Praktisi Medis, Peneliti Biofarmasi, Konsultan Kesehatan",
        keySkills: ["Penalaran Klinis", "Ketelitian Laboratorium", "Etika Pelayanan"],
      };
    }

    if (hasBusiness || hasFinance) {
      return {
        cluster: "Manajemen & Finansial Korporat",
        matchScore: 96,
        archetype: "The Strategic Growth Driver",
        archetypeTagline: "Insting tajam dalam membaca pergerakan pasar, efisiensi modal, dan ekspansi organisasi.",
        topMajors: [
          { name: "Manajemen Bisnis & Kewirausahaan", faculty: "Fakultas Ekonomi & Bisnis", fitRate: "96% • Sangat Cocok" },
          { name: "Akuntansi & Analisis Keuangan", faculty: "Fakultas Ekonomi & Bisnis", fitRate: "93% • Sangat Cocok" },
          { name: "Pemasaran Digital & E-Commerce", faculty: "Fakultas Ekonomi & Bisnis", fitRate: "91% • Cocok" },
        ],
        careerTrack: "Investment Analyst, Corporate Strategist, Founder / General Manager",
        keySkills: ["Financial Modeling", "Market Analysis", "Strategic Negotiation"],
      };
    }

    if (hasPsychology || hasLaw) {
      return {
        cluster: "Sosio-Humaniora & Kebijakan Publik",
        matchScore: 94,
        archetype: "The Empathic Facilitator & Advocate",
        archetypeTagline: "Kepekaan emosional tajam dalam menengahi konflik, regulasi hukum, dan advokasi sosial.",
        topMajors: [
          { name: "Psikologi & Perilaku Organisasi", faculty: "Fakultas Psikologi", fitRate: "94% • Sangat Cocok" },
          { name: "Ilmu Hukum & Advokasi Publik", faculty: "Fakultas Hukum", fitRate: "92% • Sangat Cocok" },
          { name: "Ilmu Komunikasi & Hubungan Masyarakat", faculty: "Fakultas Ilmu Sosial & Politik", fitRate: "89% • Cocok" },
        ],
        careerTrack: "Counselor, Corporate Lawyer, HR People Operations Lead",
        keySkills: ["Empati Interpersonal", "Argumentasi Kritis", "Resolusi Konflik"],
      };
    }

    // Default Balanced Profile
    return {
      cluster: "Multidisiplin & Manajemen Terapan",
      matchScore: 93,
      archetype: "The Agile Analytical Problem-Solver",
      archetypeTagline: "Kombinasi fleksibilitas kognitif, logika analitis, dan daya adaptasi lintas bidang.",
      topMajors: [
        { name: "Teknik Industri & Rekayasa Sistem", faculty: "Fakultas Teknik", fitRate: "93% • Sangat Cocok" },
        { name: "Ilmu Komunikasi & Media Digital", faculty: "Fakultas Ilmu Sosial & Politik", fitRate: "91% • Sangat Cocok" },
        { name: "Administrasi Publik & Tata Kelola", faculty: "Fakultas Ilmu Administrasi", fitRate: "88% • Cocok" },
      ],
      careerTrack: "Operations Specialist, Business Analyst, Management Consultant",
      keySkills: ["Pola Analitis", "Sistemik Terstruktur", "Komunikasi Lintas Tim"],
    };
  };

  const prediction = getPrediction();

  return (
    <div className="w-full rounded-3xl bg-white/95 dark:bg-[#07261B]/95 border-2 border-ggc-gold/30 dark:border-ggc-gold/40 shadow-2xl backdrop-blur-xl p-6 sm:p-8 md:p-10 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-[#0E4230]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-ggc-gold" />
            <span>Simulasi Cepat Interaktif</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-ggc-dark dark:text-white">
            Eksplorasi Prediksi Jurusan & Arketipe Karier
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-[#A0B9AE] mt-1">
            Pilih latar belakang sekolah dan 2–3 minat utamamu untuk melihat simulasi kalkulasi kecocokan secara *real-time*.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedStream("sma-mipa");
            setSelectedInterests(["coding", "business"]);
          }}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-ggc dark:hover:text-ggc-gold transition-colors self-start sm:self-center"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Pilihan</span>
        </button>
      </div>

      {/* Interactive Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-8 items-start">
        {/* Left Column: Stream & Interest Selection */}
        <div className="lg:col-span-6 space-y-6">
          {/* Step 1: Latar Belakang */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-[#C7DCD2] mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-ggc text-white text-[11px] font-black flex items-center justify-center">
                1
              </span>
              <span>Pilih Latar Belakang Pendidikan:</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {STREAMS.map((stream) => {
                const isSelected = selectedStream === stream.id;
                return (
                  <button
                    key={stream.id}
                    type="button"
                    onClick={() => setSelectedStream(stream.id)}
                    className={`p-3 rounded-2xl text-left border text-xs font-bold transition-all flex items-center gap-2.5 ${
                      isSelected
                        ? "bg-ggc text-white border-ggc shadow-md scale-[1.02]"
                        : "bg-gray-50/80 dark:bg-[#0B3525]/60 text-gray-700 dark:text-[#C7DCD2] border-gray-200 dark:border-[#103D2B] hover:border-ggc/40 dark:hover:border-ggc-gold/40"
                    }`}
                  >
                    <span className="text-lg">{stream.icon}</span>
                    <span className="truncate">{stream.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Minat Dominan */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-[#C7DCD2] flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-ggc text-white text-[11px] font-black flex items-center justify-center">
                  2
                </span>
                <span>Pilih 2–3 Minat Favoritmu:</span>
              </label>
              <span className="text-[11px] font-bold text-ggc dark:text-ggc-gold">
                {selectedInterests.length}/3 Terpilih
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {INTERESTS.map((interest) => {
                const isSelected = selectedInterests.includes(interest.id);
                return (
                  <button
                    key={interest.id}
                    type="button"
                    onClick={() => toggleInterest(interest.id)}
                    className={`p-2.5 rounded-2xl text-center border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 relative ${
                      isSelected
                        ? "bg-gradient-to-br from-emerald-500 to-ggc text-white border-transparent shadow-sm scale-[1.02]"
                        : "bg-gray-50/80 dark:bg-[#0B3525]/60 text-gray-700 dark:text-[#C7DCD2] border-gray-200 dark:border-[#103D2B] hover:border-emerald-300"
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-white text-ggc flex items-center justify-center text-[9px] font-black">
                        ✓
                      </span>
                    )}
                    <span className="text-xl">{interest.icon}</span>
                    <span className="leading-tight text-[11px]">{interest.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Live Dynamic Results Display */}
        <div className="lg:col-span-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedStream}-${selectedInterests.join("-")}`}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#062419] via-ggc-dark to-[#031810] text-white border border-ggc-gold/40 shadow-xl relative overflow-hidden"
            >
              {/* Subtle background glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-ggc-gold/15 rounded-full blur-3xl pointer-events-none" />

              {/* Archetype Badge & Score */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10 relative z-10">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-ggc-gold font-bold">
                    Prediksi Potential Signature
                  </span>
                  <h4 className="text-lg sm:text-xl font-black text-white mt-0.5">
                    {prediction.archetype}
                  </h4>
                  <p className="text-xs text-ggc-subtle mt-1 leading-relaxed">
                    {prediction.archetypeTagline}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-2xl sm:text-3xl font-black text-ggc-gold">
                    {prediction.matchScore}%
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    Sangat Cocok
                  </span>
                </div>
              </div>

              {/* Recommended Top Majors */}
              <div className="my-5 space-y-2.5 relative z-10">
                <div className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-ggc-gold" />
                  <span>Rekomendasi Program Studi Unggulan:</span>
                </div>

                {prediction.topMajors.map((major, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-ggc-gold/40 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-ggc-gold/20 text-ggc-gold text-xs font-black flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-white">
                          {major.name}
                        </div>
                        <div className="text-[11px] text-gray-400">
                          {major.faculty}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-400 shrink-0">
                      {major.fitRate}
                    </span>
                  </div>
                ))}
              </div>

              {/* Career Trajectory Highlight */}
              <div className="pt-4 border-t border-white/10 relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wide">
                    Arah Peran Profesional:
                  </span>
                  <div className="font-bold text-ggc-gold">
                    {prediction.careerTrack}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {prediction.keySkills.map((skill, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/10 text-white"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Call to action footer banner inside the card */}
      <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-ggc-subtle/40 to-amber-50 dark:from-[#062419] dark:via-[#082E20] dark:to-[#0A3525] border border-ggc/20 dark:border-ggc-gold/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-xl bg-ggc text-white flex items-center justify-center shrink-0 font-bold text-lg shadow-sm">
            🎯
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
              Ingin hasil presisi 100% berdasarkan 84 butir instrumen ilmiah?
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Dapatkan pemetaan 7 dimensi lengkap, analisis RIASEC, dan laporan PDF resmi siap cetak.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
          {onOpenCheckout ? (
            <button
              type="button"
              onClick={onOpenCheckout}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-ggc-dark bg-gradient-to-r from-[#E6D5A8] via-ggc-gold to-ggc-gold-dark hover:scale-105 active:scale-95 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Beli Akses (Rp 49.000)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <Link
              href="/auth/register"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-ggc hover:bg-ggc-light transition-all flex items-center justify-center gap-2"
            >
              <span>Mulai Asesmen Lengkap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
