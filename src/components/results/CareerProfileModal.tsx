"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Compass,
  Sparkles,
  GraduationCap,
  Users,
  HeartHandshake,
  Briefcase,
  Target,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
} from "lucide-react";
import { CareerProfileInput } from "@/lib/career-orientation";

interface CareerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: CareerProfileInput | null;
  onSaveSuccess: (updatedInput: CareerProfileInput) => void;
}

const COMMON_MAJORS: Record<string, string[]> = {
  SMA: ["MIPA / IPA", "IPS / Soshum", "Bahasa & Budaya", "Kurikulum Merdeka (Kombinasi)"],
  SMK: [
    "Rekayasa Perangkat Lunak (RPL)",
    "Teknik Komputer Jaringan (TKJ)",
    "Desain Komunikasi Visual (DKV)",
    "Akuntansi & Keuangan",
    "Manajemen Bisnis / Pemasaran",
    "Teknik Otomotif / Mesin",
    "Teknik Elektro / Elektronika",
  ],
  KULIAH: [
    "Teknik Informatika / Ilmu Komputer",
    "Sistem Informasi",
    "Manajemen & Bisnis Digital",
    "Ilmu Komunikasi / Hubungan Masyarakat",
    "Psikologi",
    "Ilmu Hukum",
    "Kedokteran / Farmasi / Keperawatan",
    "Teknik Industri / Sipil",
  ],
  GAP_YEAR: ["Persiapan SNBT Saintek", "Persiapan SNBT Soshum", "Eksplorasi Karir & Portofolio"],
};

export default function CareerProfileModal({
  isOpen,
  onClose,
  initialData,
  onSaveSuccess,
}: CareerProfileModalProps) {
  const [educationLevel, setEducationLevel] = useState<string>("SMA");
  const [currentMajor, setCurrentMajor] = useState<string>("");
  const [formalOrg, setFormalOrg] = useState<string>("");
  const [formalOrgRole, setFormalOrgRole] = useState<string>("Ketua / Wakil");
  const [nonFormalExp, setNonFormalExp] = useState<string>("");
  const [hobbyInterest, setHobbyInterest] = useState<string>("");
  const [workExp, setWorkExp] = useState<string>("");
  const [careerAspiration, setCareerAspiration] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync initial data when modal opens
  useEffect(() => {
    if (initialData) {
      setEducationLevel(initialData.educationLevel || "SMA");
      setCurrentMajor(initialData.currentMajor || "");
      setFormalOrg(initialData.formalOrg || "");
      setFormalOrgRole(initialData.formalOrgRole || "Ketua / Wakil");
      setNonFormalExp(initialData.nonFormalExp || "");
      setHobbyInterest(initialData.hobbyInterest || "");
      setWorkExp(initialData.workExp || "");
      setCareerAspiration(initialData.careerAspiration || "");
    }
  }, [initialData, isOpen]);

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentMajor.trim()) {
      setError("Silakan isi atau pilih jurusan / peminatan Anda saat ini.");
      return;
    }

    setIsSaving(true);
    const payload: CareerProfileInput = {
      educationLevel,
      currentMajor: currentMajor.trim(),
      formalOrg: formalOrg.trim(),
      formalOrgRole,
      nonFormalExp: nonFormalExp.trim(),
      hobbyInterest: hobbyInterest.trim(),
      workExp: workExp.trim(),
      careerAspiration: careerAspiration.trim(),
    };

    try {
      // 1. Save to local storage as immediate responsive cache
      if (typeof window !== "undefined") {
        localStorage.setItem("ggc_career_profile_data", JSON.stringify(payload));
      }

      // 2. Persist to API
      const res = await fetch("/api/assessment/career-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.warn("API save warning, persisting in memory/local storage.");
      }

      onSaveSuccess(payload);
      onClose();
    } catch (err: any) {
      console.warn("Client fallback save:", err);
      // Even if network fails, apply locally
      onSaveSuccess(payload);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const currentLevelSuggestions = COMMON_MAJORS[educationLevel] || COMMON_MAJORS.SMA;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-5 md:p-6 bg-black/75 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="career-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl bg-white dark:bg-[#07261B] rounded-t-[2.5rem] sm:rounded-[2.5rem] rounded-b-none sm:rounded-b-[2.5rem] shadow-2xl border-t-2 sm:border border-ggc-gold/40 relative overflow-hidden flex flex-col max-h-[92vh] animate-slide-up-sheet sm:animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-luxury via-ggc to-emerald-luxury p-5 sm:p-7 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 sm:top-5 right-4 sm:right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-ggc-gold/20 text-ggc-gold text-[10px] sm:text-xs font-bold uppercase tracking-wider border border-ggc-gold/30 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Kalibrasi Orientasi Karir
          </span>
          <h2 id="career-modal-title" className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Lengkapi Profil Pengalaman & Kepemimpinan
          </h2>
          <p className="text-xs sm:text-sm text-ggc-subtle/90 mt-1 max-w-lg leading-relaxed">
            Data ini akan disintesis dengan hasil asesmen 84 butir soal Anda untuk menghasilkan pemetaan arketipe karir dan 3 jalur profesi masa depan yang akurat.
          </p>
        </div>

        {/* Scrollable Form */}
        <div className="p-4 sm:p-7 overflow-y-auto flex-1 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs sm:text-sm flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Jenjang & Jurusan */}
            <div className="space-y-3">
              <label className="block text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-ggc-gold" />
                <span>1. Jenjang Pendidikan & Jurusan Saat Ini *</span>
              </label>

              {/* Jenjang Selector Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { key: "SMA", label: "SMA" },
                  { key: "SMK", label: "SMK" },
                  { key: "KULIAH", label: "Perguruan Tinggi" },
                  { key: "GAP_YEAR", label: "Gap Year" },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setEducationLevel(item.key)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border text-center cursor-pointer ${
                      educationLevel === item.key
                        ? "bg-ggc text-white border-ggc-gold shadow-xs"
                        : "bg-gray-50 dark:bg-[#031810] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-[#11402E] hover:border-ggc-gold/60"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Suggestions chips */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 block">
                  Pilih rekomendasi cepat atau ketik langsung di bawah:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {currentLevelSuggestions.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setCurrentMajor(sug)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        currentMajor === sug
                          ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-400 font-bold"
                          : "bg-gray-50 dark:bg-[#031810] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-[#103D2B] hover:bg-gray-100"
                      }`}
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Jurusan */}
              <input
                type="text"
                required
                value={currentMajor}
                onChange={(e) => setCurrentMajor(e.target.value)}
                placeholder="Contoh: MIPA / Rekayasa Perangkat Lunak / Teknik Informatika"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-[#11402E] bg-gray-50/50 dark:bg-[#031810] text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:bg-white dark:focus:bg-[#02130C] focus:ring-2 focus:ring-ggc focus:outline-none transition-all shadow-xs"
              />
            </div>

            {/* Step 2: Pengalaman Organisasi Formal */}
            <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-[#0E3525]">
              <label className="block text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-ggc-gold" />
                  <span>2. Pengalaman Organisasi Formal</span>
                </span>
                <span className="text-[11px] font-normal text-gray-500 dark:text-gray-400">
                  OSIS / MPK / BEM / Ekskul
                </span>
              </label>

              <div className="grid sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={formalOrg}
                    onChange={(e) => setFormalOrg(e.target.value)}
                    placeholder="Contoh: Ketua OSIS / Sie Humas BEM / Koordinator Ekskul"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-[#11402E] bg-gray-50/50 dark:bg-[#031810] text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:bg-white dark:focus:bg-[#02130C] focus:ring-2 focus:ring-ggc focus:outline-none transition-all shadow-xs"
                  />
                </div>
                <div>
                  <select
                    value={formalOrgRole}
                    onChange={(e) => setFormalOrgRole(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-[#11402E] bg-gray-50/50 dark:bg-[#031810] text-xs font-semibold text-gray-800 dark:text-gray-200 focus:bg-white dark:focus:bg-[#02130C] focus:ring-2 focus:ring-ggc focus:outline-none cursor-pointer"
                  >
                    <option value="Ketua / Wakil">Ketua / Wakil</option>
                    <option value="Koordinator / BPH">Koordinator / BPH</option>
                    <option value="Anggota Aktif">Anggota Aktif</option>
                    <option value="Belum Ada">Belum Ada</option>
                  </select>
                </div>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                * Pengalaman kepemimpinan formal membuktikan kapasitas orkestrasi tim, negosiasi, dan akuntabilitas kerja.
              </p>
            </div>

            {/* Step 3: Pengalaman Non-Formal & Hobi */}
            <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-[#0E3525]">
              <label className="block text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-ggc-gold" />
                  <span>3. Pengalaman Non-Formal & Komunitas</span>
                </span>
                <span className="text-[11px] font-normal text-gray-500 dark:text-gray-400">
                  Karang Taruna / Relawan
                </span>
              </label>

              <input
                type="text"
                value={nonFormalExp}
                onChange={(e) => setNonFormalExp(e.target.value)}
                placeholder="Contoh: Ketua Karang Taruna RW 03 / Relawan Mengajar / Komunitas Pecinta Alam"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-[#11402E] bg-gray-50/50 dark:bg-[#031810] text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:bg-white dark:focus:bg-[#02130C] focus:ring-2 focus:ring-ggc focus:outline-none transition-all shadow-xs"
              />

              <div className="pt-1">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Hobi Mendalam & Minat Khusus:
                </label>
                <input
                  type="text"
                  value={hobbyInterest}
                  onChange={(e) => setHobbyInterest(e.target.value)}
                  placeholder="Contoh: Editing Video & Konten Kreator / Coding Web / Fotografi / Menulis"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-[#11402E] bg-gray-50/50 dark:bg-[#031810] text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:bg-white dark:focus:bg-[#02130C] focus:ring-2 focus:ring-ggc focus:outline-none transition-all shadow-xs"
                />
              </div>
            </div>

            {/* Step 4: Pengalaman Kerja & Aspirasi Karir (Opsional) */}
            <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-[#0E3525]">
              <label className="block text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-ggc-gold" />
                  <span>4. Pengalaman Kerja / Proyek & Target Karir (Opsional)</span>
                </span>
              </label>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Magang / Proyek / Kerja Freelance:
                  </label>
                  <input
                    type="text"
                    value={workExp}
                    onChange={(e) => setWorkExp(e.target.value)}
                    placeholder="Contoh: Magang Admin Web / Freelance Desain"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-[#11402E] bg-gray-50/50 dark:bg-[#031810] text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:bg-white dark:focus:bg-[#02130C] focus:ring-2 focus:ring-ggc focus:outline-none transition-all shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Target Karir / Profesi Impian Utama:
                  </label>
                  <input
                    type="text"
                    value={careerAspiration}
                    onChange={(e) => setCareerAspiration(e.target.value)}
                    placeholder="Contoh: Product Manager / Data Scientist"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-[#11402E] bg-gray-50/50 dark:bg-[#031810] text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:bg-white dark:focus:bg-[#02130C] focus:ring-2 focus:ring-ggc focus:outline-none transition-all shadow-xs"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-sm font-black text-[#0B4632] bg-gradient-to-r from-[#DFCA95] to-[#C5A869] hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-transform duration-200 disabled:opacity-60 cursor-pointer shadow-md"
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-[#0B4632] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#0B4632]" />
                    <span>Simpan & Buka Analisis Orientasi Karir</span>
                    <ArrowRight className="w-4 h-4 text-[#0B4632]" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
