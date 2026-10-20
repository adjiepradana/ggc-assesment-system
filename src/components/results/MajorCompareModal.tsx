"use client";

import React, { useState, useEffect } from "react";
import { X, Scale, Target, Sparkles, Check, AlertTriangle, Briefcase, GraduationCap, ArrowRight } from "lucide-react";
import { StudyRecommendation } from "@/lib/scoring";
import ScoreRing from "./ScoreRing";

interface MajorCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  majors: StudyRecommendation[];
  onRemoveMajor?: (majorId: string) => void;
}

export default function MajorCompareModal({
  isOpen,
  onClose,
  majors,
  onRemoveMajor,
}: MajorCompareModalProps) {
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY !== null) {
      const deltaY = e.changedTouches[0].clientY - touchStartY;
      if (deltaY > 65) {
        onClose();
      }
      setTouchStartY(null);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="no-print fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-6 transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="compare-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-[#062419] text-gray-900 dark:text-[#E8F1EC] rounded-t-[2.5rem] sm:rounded-[2rem] max-w-5xl w-full p-4 pb-safe sm:p-8 shadow-2xl border-t-2 sm:border border-ggc-gold/40 max-h-[88vh] sm:max-h-[92vh] flex flex-col overflow-hidden animate-slide-up-sheet sm:animate-scale-in transition-colors">
        {/* Mobile Drag Indicator Handle */}
        <div
          className="sm:hidden flex flex-col items-center justify-center pt-1 pb-2 cursor-grab shrink-0 select-none touch-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={onClose}
        >
          <div className="w-12 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 active:bg-gray-400" />
          <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-wider">
            Geser ke bawah untuk menutup
          </span>
        </div>

        {/* Header */}
        <div
          className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-[#0E4230] shrink-0"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-ggc text-ggc-gold flex items-center justify-center shrink-0 shadow-sm">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 id="compare-modal-title" className="text-lg sm:text-xl font-black text-ggc-dark dark:text-white flex items-center gap-2">
                Bandingkan Program Studi Pilihan
              </h2>
              <p className="text-xs text-gray-500 dark:text-[#A0B9AE]">
                Komparasi multi-matriks kecocokan profil Anda terhadap {majors.length} opsi jurusan
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-[#082E20] hover:bg-gray-200 dark:hover:bg-[#0C3E2B] text-gray-600 dark:text-gray-300 flex items-center justify-center transition-colors"
            aria-label="Tutup komparasi jurusan"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Comparison Content Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto py-5 pr-1 space-y-6">
          {majors.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-[#A0B9AE] text-sm">
              <Scale className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              Pilih minimal 1 atau 2 jurusan untuk membandingkan kecocokan.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {majors.map((major, idx) => (
                <div
                  key={major.id}
                  className="rounded-2xl border border-gray-200/90 dark:border-[#103D2B] bg-gray-50/50 dark:bg-[#07261B] p-5 flex flex-col justify-between relative hover:border-ggc-gold/60 transition-all shadow-xs"
                >
                  {/* Top Header Card */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-ggc-subtle dark:bg-[#082E20] text-ggc dark:text-emerald-300 border border-transparent dark:border-[#103D2B]">
                        Opsi #{idx + 1} • {major.cluster}
                      </span>
                      {onRemoveMajor && (
                        <button
                          type="button"
                          onClick={() => onRemoveMajor(major.id)}
                          className="text-[10px] text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          title="Hapus dari perbandingan"
                        >
                          Hapus
                        </button>
                      )}
                    </div>

                    <h3 className="text-base font-black text-ggc-dark dark:text-white leading-tight">{major.majorName}</h3>
                    <p className="text-[11px] text-gray-500 dark:text-[#A0B9AE] mt-0.5">{major.faculty}</p>

                    {/* Ring Score */}
                    <div className="my-4 flex items-center justify-center p-3 bg-white dark:bg-[#041B12] rounded-xl border border-gray-100 dark:border-[#103D2B]">
                      <ScoreRing value={major.fitScore} size={92} stroke={9} label="Fit Score" />
                    </div>

                    {/* Fit Badge */}
                    <div className="text-center mb-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${major.badgeColor}`}>
                        {major.fitLevel}
                      </span>
                    </div>

                    {/* Key Attributes Bar Comparison */}
                    <div className="space-y-2 mb-4 pt-3 border-t border-gray-200 dark:border-[#0E3827]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-[#A0B9AE] block">
                        Atribut Kunci vs Benchmark:
                      </span>
                      {major.keyAttributes.map((attr) => {
                        const meets = attr.score >= attr.benchmark;
                        return (
                          <div key={attr.name} className="text-[11px]">
                            <div className="flex justify-between items-center text-gray-700 dark:text-[#D1E2DA]">
                              <span className="truncate pr-2">{attr.name}</span>
                              <span className={`font-bold tabular-nums ${meets ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"}`}>
                                {attr.score.toFixed(1)} / {attr.benchmark.toFixed(1)}
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-200 dark:bg-[#041B12] rounded-full overflow-hidden mt-1">
                              <div
                                className={`h-full rounded-full ${
                                  meets ? "bg-emerald-600 dark:bg-emerald-500" : "bg-amber-500"
                                }`}
                                style={{ width: `${(attr.score / 5) * 100}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Why this fit brief */}
                    <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-[#041B12] border border-emerald-200/60 dark:border-emerald-900/60 text-xs mb-3">
                      <span className="font-bold text-emerald-900 dark:text-emerald-300 block mb-0.5">Alasan Cocok:</span>
                      <p className="text-[11px] text-emerald-950/80 dark:text-emerald-200/90 leading-relaxed line-clamp-3">
                        {major.whyThisFit}
                      </p>
                    </div>

                    {/* What to watch out brief */}
                    <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-[#082618] border border-amber-200/60 dark:border-amber-900/60 text-xs mb-3">
                      <span className="font-bold text-amber-900 dark:text-amber-300 block mb-0.5">Tantangan:</span>
                      <p className="text-[11px] text-amber-950/80 dark:text-amber-200/90 leading-relaxed line-clamp-3">
                        {major.whatToWatchOutFor}
                      </p>
                    </div>
                  </div>

                  {/* Career Prospects */}
                  <div className="pt-3 border-t border-gray-200 dark:border-[#0E3827] mt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-[#A0B9AE] flex items-center gap-1 mb-2">
                      <Briefcase className="w-3 h-3 text-ggc dark:text-ggc-gold" /> Prospek Karier:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {major.careerProspects.slice(0, 3).map((career) => (
                        <span
                          key={career}
                          className="text-[10px] font-semibold bg-white dark:bg-[#041B12] text-ggc dark:text-emerald-300 px-2 py-0.5 rounded-md border border-gray-200 dark:border-[#103D2B]"
                        >
                          {career}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-100 dark:border-[#0E4230] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <p className="text-xs text-gray-500 dark:text-[#A0B9AE] text-center sm:text-left">
            💡 <strong>Saran Konselor GGC:</strong> Pertimbangkan jurusan dengan skor keselarasan di atas 85% untuk peluang lulus tepat waktu dan kepuasan karier tertinggi.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-ggc hover:bg-ggc-light transition-all"
          >
            Selesai Membandingkan
          </button>
        </div>
      </div>
    </div>
  );
}
