"use client";

import React, { useEffect } from "react";
import { X, Layers, TrendingUp, Lightbulb, Compass, Award, CheckCircle2 } from "lucide-react";
import { DimensionScore } from "@/lib/scoring";

interface DimensionDetailModalProps {
  dimension: DimensionScore | null;
  onClose: () => void;
}

const DIMENSION_TIPS: Record<string, { tips: string[]; relevantMajors: string[]; careerImpact: string }> = {
  TALENT: {
    tips: [
      "Ikuti proyek berbasis pemecahan masalah atau kompetisi sains/logika untuk terus mengasah daya nalar.",
      "Latih kecepatan eksekusi tugas kuantitatif dan analisis sistematis melalui latihan berkala.",
      "Gunakan teknik visualisasi konsep untuk memperjelas alur pemecahan masalah yang rumit.",
    ],
    relevantMajors: ["Teknik Informatika", "Teknik Elektro", "Matematika & Aktuaria", "Teknik Mesin"],
    careerImpact: "Fondasi utama dalam rekayasa teknologi, kecerdasan buatan, perancangan sistem, dan riset kuantitatif.",
  },
  INTEREST: {
    tips: [
      "Eksplorasi magang atau magang bayangan (job shadowing) di industri yang berkaitan dengan minat Anda.",
      "Ikuti komunitas atau organisasi ekstrakurikuler yang sejalan untuk memperluas jejaring rekan sefrekuensi.",
      "Baca publikasi ilmiah terkini atau studi kasus industri secara rutin di bidang yang diminati.",
    ],
    relevantMajors: ["Desain Komunikasi Visual", "Manajemen Bisnis", "Ilmu Komunikasi", "Hubungan Internasional"],
    careerImpact: "Memicu motivasi intrinsik dan ketahanan belajar (grit) saat menghadapi materi kuliah yang menantang.",
  },
  PERSONALITY: {
    tips: [
      "Kenali pola fokus kerja terbaik Anda: apakah lebih produktif secara solo atau dalam kolaborasi tim.",
      "Kembangkan kecerdasan emosional dan komunikasi asertif untuk memimpin diskusi kelompok.",
      "Buat jadwal terstruktur untuk menjaga keseimbangan antara ketelitian kerja dan fleksibilitas adaptasi.",
    ],
    relevantMajors: ["Psikologi", "Kedokteran", "Ilmu Hukum", "Manajemen Sumber Daya Manusia"],
    careerImpact: "Kunci keberhasilan kepemimpinan, negosiasi tim kerja, dan adaptasi di lingkungan profesional modern.",
  },
  VALUES: {
    tips: [
      "Identifikasi nilai hidup yang paling tidak bisa Anda kompromikan (misal: integritas, inovasi, dampak sosial).",
      "Pilih organisasi kampus dan budaya perusahaan yang selaras dengan prinsip moral Anda.",
      "Latih pengambilan keputusan berbasis etika dalam proyek sehari-hari.",
    ],
    relevantMajors: ["Kesehatan Masyarakat", "Ilmu Lingkungan", "Kebijakan Publik", "Pendidikan"],
    careerImpact: "Menentukan kepuasan kerja jangka panjang dan mencegah burnout dalam perjalanan karier.",
  },
  ACADEMIC: {
    tips: [
      "Perkuat metode belajar aktif (Feynman Technique & Active Recall) pada mata pelajaran sains/sosial utama.",
      "Diskusikan topik-topik kuliah dasar dengan guru atau mentor untuk mempersiapkan transisi akademik.",
      "Bangun kebiasaan membaca jurnal atau artikel ilmiah berbahasa Inggris sedini mungkin.",
    ],
    relevantMajors: ["Farmasi", "Bioteknologi", "Statistika", "Teknik Kimia"],
    careerImpact: "Menjamin kelancaran indeks prestasi kumulatif (IPK) dan peluang beasiswa lanjutan S2/S3.",
  },
  CAREER: {
    tips: [
      "Riset prospek pasar kerja 5–10 tahun ke depan untuk mengantisipasi disrupsi otomasi dan AI.",
      "Kembangkan keterampilan lunak (soft skills) seperti pemikiran kritis, adaptabilitas, dan presentasi publik.",
      "Mulai bangun profil LinkedIn dan dokumentasikan portofolio karya sejak jenjang SMA.",
    ],
    relevantMajors: ["Akuntansi & Keuangan", "Sistem Informasi", "Teknik Industri", "Pemasaran Digital"],
    careerImpact: "Mempersiapkan daya saing tinggi saat melangkah ke bursa kerja global pascakelulusan.",
  },
  READINESS: {
    tips: [
      "Latih kemandirian pengelolaan waktu, keuangan pribadi, dan gaya hidup sehat sebelum merantau.",
      "Bangun kesiapan mental menghadapi dinamika lingkungan baru dan pergaulan lintas budaya di kampus.",
      "Lakukan simulasi ujian seleksi masuk universitas (SNBT/Ujian Mandiri) secara berkala dan terukur.",
    ],
    relevantMajors: ["Kedokteran Gigi", "Arsitektur", "Hukum Internasional", "Teknik Perminyakan"],
    careerImpact: "Kunci ketahanan menyelesaikan studi tepat waktu tanpa stres transisi berlebih.",
  },
};

export default function DimensionDetailModal({
  dimension,
  onClose,
}: DimensionDetailModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (dimension) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [dimension, onClose]);

  if (!dimension) return null;

  const info = DIMENSION_TIPS[dimension.category] || DIMENSION_TIPS.TALENT;

  return (
    <div
      className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dimension-modal-title"
    >
      <div className="bg-white rounded-[2rem] max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-ggc-gold/40 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-ggc text-ggc-gold flex items-center justify-center shrink-0 shadow-sm">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-ggc-gold-dark block">
                Eksplorasi Dimensi
              </span>
              <h2 id="dimension-modal-title" className="text-lg sm:text-xl font-black text-ggc-dark">
                {dimension.name}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors"
            aria-label="Tutup detail dimensi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-5 pr-1 space-y-5">
          {/* Score highlight */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-ggc-tint via-white to-ggc-gold-subtle border border-ggc/20 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                Performa Skor Dimensi
              </span>
              <div className="text-2xl font-black text-ggc mt-0.5">
                {dimension.score.toFixed(1)} <span className="text-sm font-bold text-gray-400">/ 5.0</span>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-ggc text-ggc-gold shadow-xs">
                {dimension.percentage}% Kecocokan
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-ggc-gold-dark" />
              Deskripsi Evaluasi:
            </h4>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed bg-gray-50 p-3.5 rounded-xl border border-gray-100">
              {dimension.description}
            </p>
          </div>

          {/* Tips for action */}
          <div>
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              3 Panduan Pengembangan Praktis:
            </h4>
            <ul className="space-y-2">
              {info.tips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-gray-700 bg-white p-2.5 rounded-xl border border-gray-100 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Impact on Career */}
          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/60 text-xs">
            <span className="font-bold text-emerald-900 block mb-1 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-700" /> Pengaruh di Dunia Profesional:
            </span>
            <p className="text-emerald-950/80 leading-relaxed text-[11px] sm:text-xs">
              {info.careerImpact}
            </p>
          </div>

          {/* Relevant Majors */}
          <div>
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-ggc" />
              Jurusan yang Paling Mengandalkan Dimensi Ini:
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {info.relevantMajors.map((major) => (
                <span
                  key={major}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-ggc-subtle text-ggc border border-ggc/20"
                >
                  {major}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-gray-100 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-ggc hover:bg-ggc-light transition-all"
          >
            Tutup [Esc]
          </button>
        </div>
      </div>
    </div>
  );
}
