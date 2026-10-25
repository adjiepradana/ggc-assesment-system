"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, CheckCircle2, Award, Zap } from "lucide-react";

export default function InteractiveMiniAssessment() {
  const [selectedValue, setSelectedValue] = useState<number>(5);
  const [isAnimating, setIsAnimating] = useState(false);

  const likertOptions = [
    { val: 1, label: "Sangat Tidak Sesuai", short: "STS" },
    { val: 2, label: "Tidak Sesuai", short: "TS" },
    { val: 3, label: "Netral", short: "N" },
    { val: 4, label: "Sesuai", short: "S" },
    { val: 5, label: "Sangat Sesuai", short: "SS" },
  ];

  // Dynamic reactions based on selected value
  const reactionMap: Record<
    number,
    {
      score: number;
      fitLevel: string;
      color: string;
      major: string;
      signature: string;
      desc: string;
    }
  > = {
    1: {
      score: 64,
      fitLevel: "Explore Further",
      color: "text-amber-700 bg-amber-50 border-amber-200",
      major: "Seni Kriya & Eksplorasi Alam",
      signature: "The Pragmatic Realist",
      desc: "Menunjukkan preferensi lebih dominan pada aktivitas fisik dan pengalaman praktis langsung.",
    },
    2: {
      score: 74,
      fitLevel: "Potential Fit",
      color: "text-blue-700 bg-blue-50 border-blue-200",
      major: "Psikologi & Komunikasi Terapan",
      signature: "The Human-Centric Facilitator",
      desc: "Potensi kuat pada kecerdasan interpersonal dan kepekaan dinamika sosial.",
    },
    3: {
      score: 82,
      fitLevel: "Strong Fit",
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
      major: "Manajemen Bisnis & Agribisnis",
      signature: "The Adaptive Coordinator",
      desc: "Keseimbangan adaptif yang fleksibel antara analitikal dan eksekusi operasional.",
    },
    4: {
      score: 91,
      fitLevel: "Very Strong Fit",
      color: "text-emerald-800 bg-emerald-100/80 border-emerald-300",
      major: "Sains Data & Sistem Informasi",
      signature: "The Logical Investigator",
      desc: "Ketajaman berpikir komputasional dan daya bedah sebab-akibat yang solid.",
    },
    5: {
      score: 97,
      fitLevel: "Very Strong Fit",
      color: "text-emerald-900 bg-emerald-100 border-emerald-400",
      major: "Teknik Informatika & AI Engineering",
      signature: "The Analytical Strategist",
      desc: "Kapasitas kognitif analitis tertinggi! Sangat selaras dengan rumpun rekayasa logika dan komputasi.",
    },
  };

  const handleSelect = (val: number) => {
    setSelectedValue(val);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 400);
  };

  const currentReaction = reactionMap[selectedValue];

  return (
    <div className="rounded-3xl bg-white dark:bg-[#07261B] p-5 sm:p-7 shadow-2xl border border-ggc-gold/40 backdrop-blur-xl relative overflow-hidden transition-all duration-300">
      {/* Top Header Badge */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-[#0E4230]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-ggc text-ggc-gold flex items-center justify-center font-bold shadow-sm">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-ggc-gold-dark dark:text-ggc-gold">
              Coba Langsung (Mini Simulator)
            </div>
            <div className="text-xs sm:text-sm font-black text-ggc-dark dark:text-white">
              Simulasi Respon 1 Butir Soal
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold border border-emerald-200 dark:border-emerald-800/60 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Calculator</span>
        </div>
      </div>

      {/* Simulated Question Card */}
      <div className="mt-4 p-4 rounded-2xl bg-ggc-tint/60 dark:bg-[#041B12] border border-ggc-subtle dark:border-[#0E4230] transition-colors">
        <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 font-semibold mb-1.5">
          <span>Item T01 • Bakat Logika Analitikal</span>
          <span className="text-ggc dark:text-ggc-gold font-bold">1 dari 84 Soal</span>
        </div>
        <p className="text-xs sm:text-sm font-bold text-gray-800 dark:text-[#E8F1EC] leading-relaxed">
          &ldquo;Saya dengan cepat mampu menangkap pola sebab-akibat dalam data angka atau grafik rumit.&rdquo;
        </p>

        {/* 5 Likert Buttons */}
        <div className="mt-4 grid grid-cols-5 gap-1.5 sm:gap-2">
          {likertOptions.map((opt) => {
            const isSelected = selectedValue === opt.val;
            return (
              <button
                key={opt.val}
                type="button"
                onClick={() => handleSelect(opt.val)}
                className={`py-2 px-1 rounded-xl text-center transition-all duration-200 flex flex-col items-center justify-center border cursor-pointer ${
                  isSelected
                    ? "bg-ggc text-white border-ggc-gold shadow-md shadow-ggc/20 scale-105 ring-2 ring-ggc-gold/40"
                    : "bg-white dark:bg-[#07261B] text-gray-700 dark:text-[#C7DCD2] hover:bg-ggc-subtle/50 dark:hover:bg-[#0A3324] border-gray-200 dark:border-[#103D2B] hover:border-ggc/30 dark:hover:border-ggc-gold/40"
                }`}
              >
                <span className="text-xs sm:text-sm font-black">{opt.val}</span>
                <span
                  className={`text-[9px] font-semibold mt-0.5 ${
                    isSelected ? "text-ggc-gold" : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {opt.short}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Real-time Dynamic Reaction Output */}
      <div
        className={`mt-4 p-4 rounded-2xl bg-gradient-to-br from-ggc-dark to-ggc text-white transition-all duration-300 relative overflow-hidden ${
          isAnimating ? "scale-[0.99] opacity-90" : "scale-100 opacity-100"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-ggc-gold flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Hasil Pencocokan Multi-Matrix
          </span>
          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-white/20 text-white backdrop-blur-md">
            Skor: {currentReaction.score}%
          </span>
        </div>

        <div className="mt-2.5">
          <div className="text-[11px] text-ggc-subtle font-medium">Potential Signature Terdekat:</div>
          <div className="text-sm sm:text-base font-black text-white">
            {currentReaction.signature}
          </div>
        </div>

        <div className="mt-3 p-2.5 rounded-xl bg-black/25 border border-white/10 flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] text-ggc-gold font-bold">Rekomendasi Rumpun:</div>
            <div className="text-xs font-bold text-white truncate max-w-[200px] sm:max-w-none">
              {currentReaction.major}
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 whitespace-nowrap">
            {currentReaction.fitLevel}
          </span>
        </div>

        <p className="mt-2.5 text-[11px] text-ggc-subtle/90 leading-relaxed italic">
          &ldquo;{currentReaction.desc}&rdquo;
        </p>
      </div>

      {/* CTA Button to Full 84 Questions */}
      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-[#0E4230] flex items-center justify-between">
        <span className="text-[11px] text-gray-500 dark:text-[#A0B9AE] flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>84 Soal Lengkap Siap Dikerjakan</span>
        </span>
        <Link
          href="/auth/register"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-ggc hover:bg-ggc-light transition-all shadow-sm"
        >
          <span>Mulai Tes Lengkap</span>
          <ArrowRight className="w-3.5 h-3.5 text-ggc-gold" />
        </Link>
      </div>
    </div>
  );
}
