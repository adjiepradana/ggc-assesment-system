"use client";

import React, { useState, useEffect } from "react";
import { X, Share2, Copy, Check, Printer, Sparkles, Award, ShieldCheck, Download } from "lucide-react";
import ScoreRing from "./ScoreRing";

interface ShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  schoolName: string;
  signatureTitle: string;
  signatureArchetype: string;
  topMajorName: string;
  fitScore: number;
  sessionId: string;
}

export default function ShareCardModal({
  isOpen,
  onClose,
  studentName,
  schoolName,
  signatureTitle,
  signatureArchetype,
  topMajorName,
  fitScore,
  sessionId,
}: ShareCardModalProps) {
  const [copied, setCopied] = useState(false);

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

  const shareText = `🎓 Hasil Evaluasi Study Fit Assessment™ (GGC)
Nama: ${studentName} (${schoolName})
🌟 Potential Signature: ${signatureTitle} - "${signatureArchetype}"
🎯 Rekomendasi Jurusan #1: ${topMajorName} (${fitScore}% Fit Score)
Diverifikasi resmi oleh Go Great Career Indonesia.`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handlePrintCard = () => {
    window.print();
  };

  return (
    <div
      className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
    >
      <div className="bg-white rounded-[2rem] max-w-md w-full p-6 sm:p-7 shadow-2xl border border-ggc-gold/40 flex flex-col max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-ggc" />
            <h2 id="share-modal-title" className="text-base font-black text-ggc-dark">
              Bagikan Kartu Prestasi Siswa
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors"
            aria-label="Tutup dialog bagikan"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Story Certificate Preview Card */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="rounded-3xl bg-emerald-luxury text-white p-6 relative overflow-hidden shadow-xl border-2 border-ggc-gold/60 text-center">
            {/* Background Ornaments */}
            <div className="absolute inset-0 bg-dot-grid opacity-50 pointer-events-none" aria-hidden="true" />
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-ggc-gold/25 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center">
              {/* Brand Header */}
              <div className="flex items-center gap-2 mb-3">
                <img src="/logo.png" alt="" className="w-7 h-7 object-contain bg-white rounded-lg p-0.5" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-ggc-gold">
                  GO GREAT CAREER • STUDY FIT
                </span>
              </div>

              <span className="inline-block px-3 py-0.5 rounded-full bg-ggc-gold/20 text-ggc-gold text-[10px] font-bold uppercase tracking-wider mb-2 border border-ggc-gold/40">
                Official Certified Result
              </span>

              {/* Student Name */}
              <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
                {studentName}
              </h3>
              <p className="text-xs text-ggc-subtle/80 mt-0.5">{schoolName}</p>

              {/* Ring Score */}
              <div className="my-4">
                <ScoreRing value={fitScore} size={110} stroke={10} label="Study Fit" tone="dark" />
              </div>

              {/* Signature */}
              <span className="text-[10px] font-bold uppercase tracking-wider text-ggc-gold">
                Primary Potential Signature:
              </span>
              <p className="text-base font-black gold-gradient-text leading-tight mt-0.5">
                {signatureTitle}
              </p>
              <p className="text-[11px] text-white/90 italic mt-0.5">
                &ldquo;{signatureArchetype}&rdquo;
              </p>

              {/* Top Major */}
              <div className="mt-4 pt-3 border-t border-white/15 w-full">
                <span className="text-[10px] font-bold uppercase tracking-wider text-ggc-subtle/70 block">
                  Top Recommended Major:
                </span>
                <p className="text-sm font-black text-white mt-0.5">
                  {topMajorName}
                </p>
              </div>

              <p className="mt-4 text-[9px] text-ggc-subtle/60 font-mono">
                REG: GGC-{(sessionId || "SESI").slice(0, 8).toUpperCase()}-2026
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-gray-100 flex flex-col gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            className="w-full py-3 px-4 rounded-xl text-xs font-bold text-ggc-dark bg-gradient-to-r from-[#E6D5A8] via-ggc-gold to-ggc-gold-dark hover:shadow-md transition-all flex items-center justify-center gap-2"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-800" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "Teks Berhasil Disalin ke Clipboard!" : "Salin Ringkasan Teks Hasil"}</span>
          </button>

          <button
            type="button"
            onClick={handlePrintCard}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4 text-gray-600" />
            <span>Cetak Dokumen Hasil Lengkap</span>
          </button>
        </div>
      </div>
    </div>
  );
}
