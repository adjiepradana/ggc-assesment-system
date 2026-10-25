"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles } from "lucide-react";

interface AudioNarratorProps {
  studentName: string;
  signatureTitle: string;
  topMajorName: string;
  fitScore: number;
  narrativeText: string;
  className?: string;
}

export default function AudioNarrator({
  studentName,
  signatureTitle,
  topMajorName,
  fitScore,
  narrativeText,
  className = "",
}: AudioNarratorProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setIsSupported(true);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speechText = `Halo ${studentName}. Selamat atas penyelesaian asesmen Study Fit Anda di Go Great Career. Profil potensi dominan Anda adalah ${signatureTitle}, dengan rekomendasi program studi terbaik yaitu ${topMajorName}, memiliki tingkat kecocokan ${fitScore} persen. ${narrativeText}`;

  const handleTogglePlay = () => {
    if (!isSupported) return;

    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
    } else {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setIsPlaying(true);
      } else {
        window.speechSynthesis.cancel(); // Reset previous

        const utterance = new SpeechSynthesisUtterance(speechText);
        utterance.lang = "id-ID";
        utterance.rate = playbackRate;

        // Try to pick an Indonesian voice if available
        const voices = window.speechSynthesis.getVoices();
        const idVoice = voices.find((v) => v.lang.startsWith("id") || v.lang.includes("ID"));
        if (idVoice) {
          utterance.voice = idVoice;
        }

        utterance.onend = () => {
          setIsPlaying(false);
        };

        utterance.onerror = () => {
          setIsPlaying(false);
        };

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
      }
    }
  };

  const handleRestart = () => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setTimeout(() => {
      handleTogglePlay();
    }, 150);
  };

  const toggleRate = () => {
    const nextRate = playbackRate === 1 ? 1.25 : playbackRate === 1.25 ? 1.5 : 1;
    setPlaybackRate(nextRate);
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setTimeout(() => {
        handleTogglePlay();
      }, 100);
    }
  };

  if (!isSupported) return null;

  return (
    <div
      className={`no-print flex items-center justify-between flex-wrap gap-3 p-3.5 sm:p-4 rounded-2xl bg-white/95 dark:bg-[#07261B]/95 backdrop-blur-md border border-ggc-gold/30 dark:border-[#0E4230] shadow-md transition-colors ${className}`}
      role="region"
      aria-label="Pemutar narasi suara ringkasan asesmen"
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleTogglePlay}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm cursor-pointer ${
            isPlaying
              ? "bg-ggc-gold text-ggc-dark scale-105 ring-2 ring-ggc-gold/50"
              : "bg-ggc text-white hover:bg-ggc-light active:scale-95"
          }`}
          title={isPlaying ? "Jeda Narasi Suara" : "Dengarkan Ringkasan Hasil (Audio)"}
          aria-label={isPlaying ? "Jeda narasi suara" : "Putar narasi suara ringkasan"}
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
        </button>

        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-ggc-dark dark:text-white">Narasi Ringkasan Asesmen</span>
            {isPlaying && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60 animate-pulse">
                <Volume2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Memutar
              </span>
            )}
          </div>
          <p className="text-[11px] text-gray-500 dark:text-[#A0B9AE] line-clamp-1">
            Dengarkan intisari rekomendasi & sintesis potensi Anda dibacakan secara otomatis
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Animated equalizer waves when playing */}
        {isPlaying && (
          <div className="hidden sm:flex items-center gap-0.5 h-4 px-2" aria-hidden="true">
            <div className="w-1 bg-ggc-gold rounded-full animate-bounce h-3" style={{ animationDelay: "0ms" }} />
            <div className="w-1 bg-ggc-gold rounded-full animate-bounce h-4" style={{ animationDelay: "150ms" }} />
            <div className="w-1 bg-ggc-gold rounded-full animate-bounce h-2" style={{ animationDelay: "300ms" }} />
            <div className="w-1 bg-ggc-gold rounded-full animate-bounce h-4" style={{ animationDelay: "75ms" }} />
          </div>
        )}

        <button
          type="button"
          onClick={toggleRate}
          className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 transition-colors"
          title="Kecepatan baca audio"
        >
          {playbackRate}x
        </button>

        <button
          type="button"
          onClick={handleRestart}
          disabled={!isPlaying}
          className="p-2 rounded-xl text-gray-500 hover:text-ggc hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          title="Putar Ulang dari Awal"
          aria-label="Putar ulang narasi"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
