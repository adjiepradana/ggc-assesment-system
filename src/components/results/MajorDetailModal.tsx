"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  School,
  Briefcase,
  BookOpen,
  DollarSign,
  TrendingUp,
  MapPin,
  Award,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { StudyRecommendation } from "@/lib/scoring";
import { getMajorExtendedDetail, CampusRecommendation } from "@/data/majorDetails";
import ScoreRing from "./ScoreRing";

interface MajorDetailModalProps {
  major: StudyRecommendation | null;
  onClose: () => void;
}

export default function MajorDetailModal({ major, onClose }: MajorDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"campuses" | "careers" | "courses">("campuses");
  const [campusTypeFilter, setCampusTypeFilter] = useState<"ALL" | "PTN" | "PTS">("ALL");
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
    if (major) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [major, onClose]);

  if (!major) return null;

  const extendedDetail = getMajorExtendedDetail(major.id, major.majorName, major.cluster);

  const filteredCampuses = extendedDetail.campuses.filter((c) => {
    if (campusTypeFilter === "ALL") return true;
    return c.type === campusTypeFilter;
  });

  return (
    <div
      className="no-print fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-5 transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="major-detail-title"
      style={{ overscrollBehavior: "contain" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white rounded-t-[2.5rem] sm:rounded-3xl max-w-4xl w-full p-4 pb-safe sm:p-7 shadow-2xl border-t-2 sm:border border-ggc-gold/30 flex flex-col max-h-[88vh] sm:max-h-[92vh] overflow-hidden animate-slide-up-sheet sm:animate-scale-in"
        style={{ overscrollBehavior: "contain" }}
      >
        {/* Mobile Drag Indicator Handle */}
        <div
          className="sm:hidden flex flex-col items-center justify-center pt-1 pb-2 cursor-grab shrink-0 select-none touch-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={onClose}
        >
          <div className="w-12 h-1.5 rounded-full bg-gray-300 active:bg-gray-400" />
          <span className="text-[10px] font-semibold text-gray-400 mt-1 uppercase tracking-wider">
            Geser ke bawah untuk menutup
          </span>
        </div>

        {/* Modal Header */}
        <div
          className="flex items-start justify-between pb-3 sm:pb-4 border-b border-gray-100 gap-3 sm:gap-4 shrink-0"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex items-center gap-4">
            <div className="shrink-0">
              <ScoreRing value={major.fitScore} size={76} stroke={7} label="Fit" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${major.badgeColor}`}>
                  {major.fitLevel}
                </span>
                <span className="text-[11px] font-semibold text-ggc bg-ggc-subtle px-2.5 py-0.5 rounded-full">
                  Klaster {major.cluster}
                </span>
              </div>
              <h2 id="major-detail-title" className="text-lg sm:text-2xl font-black text-ggc-dark leading-tight">
                {major.majorName}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">{major.faculty}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors shrink-0"
            aria-label="Tutup dialog detail jurusan"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 pt-3 pb-2 border-b border-gray-100 shrink-0 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("campuses")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "campuses"
                ? "bg-ggc text-white shadow-2xs"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <School className="w-4 h-4 text-ggc-gold" />
            <span>Rekomendasi Kampus ({extendedDetail.campuses.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("careers")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "careers"
                ? "bg-ggc text-white shadow-2xs"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Briefcase className="w-4 h-4 text-ggc-gold" />
            <span>Prospek Karier & Gaji</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("courses")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "courses"
                ? "bg-ggc text-white shadow-2xs"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <BookOpen className="w-4 h-4 text-ggc-gold" />
            <span>Mata Kuliah Semester Awal</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1" style={{ overscrollBehavior: "contain" }}>
          {/* TAB 1: CAMPUSES */}
          {activeTab === "campuses" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-black text-gray-900 flex items-center gap-1.5">
                    <School className="w-4 h-4 text-ggc" />
                    Perguruan Tinggi Unggulan di Indonesia
                  </h3>
                  <p className="text-xs text-gray-500">
                    Daftar PTN dan PTS dengan akreditasi tertinggi dan rekam jejak terbaik untuk program studi ini.
                  </p>
                </div>

                {/* Filter PTN / PTS */}
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                  {(["ALL", "PTN", "PTS"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setCampusTypeFilter(t)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        campusTypeFilter === t
                          ? "bg-white text-ggc shadow-2xs"
                          : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      {t === "ALL" ? "Semua Kampus" : t === "PTN" ? "PTN Saja" : "PTS Saja"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredCampuses.map((campus, idx) => (
                  <div
                    key={campus.name}
                    className="p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:border-ggc/40 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold tracking-wider uppercase ${
                              campus.type === "PTN"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : "bg-purple-100 text-purple-800 border border-purple-300"
                            }`}
                          >
                            {campus.type}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                            Akreditasi {campus.accreditation}
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-gray-900 group-hover:text-ggc transition-colors">
                          {campus.name}
                        </h4>
                        <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-1">
                          <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                          <span>{campus.city}</span>
                        </div>
                      </div>
                      <div className="w-7 h-7 rounded-lg bg-ggc-subtle flex items-center justify-center text-ggc text-xs font-black shrink-0">
                        #{idx + 1}
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center gap-1.5 text-xs text-ggc-dark font-medium">
                      <Sparkles className="w-3.5 h-3.5 text-ggc-gold shrink-0" />
                      <span className="line-clamp-1">{campus.highlight}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2.5">
                <Lightbulb className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <p>
                  <strong>Tips Pemilihan Kampus:</strong> Pertimbangkan jalur masuk (SNBP, SNBT, Mandiri PTN, atau Beasiswa PTS) serta ketersediaan fasilitas laboratorium dan relasi magang industri yang dimiliki kampus tersebut.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: CAREERS & SALARIES */}
          {activeTab === "careers" && (
            <div className="space-y-4">
              {/* Overall Salary & Demand Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-luxury via-ggc to-[#073B2A] text-white border border-ggc-gold/40 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-ggc-gold">
                      Estimasi Rata-Rata Industri Indonesia
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                      {extendedDetail.careerBreakdown.salaryRangeOverall}
                    </h3>
                    <p className="text-xs text-ggc-subtle/80 mt-1">
                      Berdasarkan survei pasar kerja fresh graduate lulusan perguruan tinggi terakreditasi Unggul di Indonesia.
                    </p>
                  </div>
                  <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between gap-1">
                    <span className="text-[11px] text-ggc-subtle/70">Permintaan Pasar:</span>
                    <span className="px-3 py-1 rounded-full bg-ggc-gold text-ggc-dark text-xs font-black uppercase tracking-wider shadow">
                      {extendedDetail.careerBreakdown.marketDemand}
                    </span>
                  </div>
                </div>
              </div>

              {/* Roles Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Bedah Peran Karier & Rentang Gaji Jenjang Pengalaman
                </h4>

                <div className="grid grid-cols-1 gap-3">
                  {extendedDetail.careerBreakdown.roles.map((item) => (
                    <div
                      key={item.role}
                      className="p-4 rounded-2xl bg-white border border-gray-200 hover:border-ggc/30 shadow-xs hover:shadow-md transition-all"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-2.5 border-b border-gray-100">
                        <div>
                          <h5 className="text-sm font-black text-ggc-dark flex items-center gap-1.5">
                            <Briefcase className="w-4 h-4 text-ggc" />
                            {item.role}
                          </h5>
                          <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                        <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                            Entry-Level / Fresh Graduate
                          </span>
                          <span className="text-sm font-black text-emerald-800 mt-0.5 block">
                            {item.entryLevelSalary}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200">
                          <span className="text-[10px] font-bold text-amber-700/80 uppercase tracking-wider block">
                            Mid-Level / Senior (3-5+ Tahun)
                          </span>
                          <span className="text-sm font-black text-ggc-dark mt-0.5 block">
                            {item.midLevelSalary}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: KEY COURSES */}
          {activeTab === "courses" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-black text-gray-900 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-ggc" />
                  Mata Kuliah Kunci Semester Awal (Tahun Pertama)
                </h3>
                <p className="text-xs text-gray-500">
                  Fondasi akademik krusial yang akan Anda tempuh di semester 1 dan 2 untuk membentuk kompetensi inti.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {extendedDetail.keyCourses.map((course) => (
                  <div
                    key={course.name}
                    className="p-4 rounded-2xl bg-white border border-gray-200 hover:border-ggc/30 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-ggc-subtle text-ggc">
                          {course.semester}
                        </span>
                        <span className="text-[11px] font-bold text-gray-400">
                          Bobot: {course.credits} SKS
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-ggc-dark">{course.name}</h4>
                      <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">{course.description}</p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
                        Keahlian Praktis yang Didapat:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {course.skillsGained.map((skill) => (
                          <span
                            key={skill}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700"
                          >
                            ✓ {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Practical Tips */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                <h5 className="text-xs font-bold text-amber-950 flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Strategi Sukses Menempuh Jurusan Ini:
                </h5>
                <ul className="space-y-1.5 text-xs text-amber-900">
                  {extendedDetail.practicalTips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Quick Fit Summary Footer inside Modal */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="flex items-start gap-2 text-emerald-950">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong>Mengapa Sangat Cocok:</strong>
                <p className="text-gray-600 mt-0.5">{major.whyThisFit}</p>
              </div>
            </div>
            <div className="flex items-start gap-2 text-amber-950">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Hal yang Perlu Diantisipasi:</strong>
                <p className="text-gray-600 mt-0.5">{major.whatToWatchOutFor}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-gray-400 hidden sm:inline">
            Tekan <kbd className="px-1.5 py-0.5 rounded bg-gray-100 border text-[10px] font-mono">ESC</kbd> untuk menutup
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-ggc hover:bg-ggc-dark transition-all ml-auto"
          >
            Tutup Panel Eksplorasi
          </button>
        </div>
      </div>
    </div>
  );
}
