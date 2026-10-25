"use client";

import React, { useId } from "react";
import CountUp from "./CountUp";

interface ScoreRingProps {
  /** 0 - 100 */
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
  /** "dark" for use on emerald backgrounds, "light" for white cards */
  tone?: "dark" | "light";
}

export default function ScoreRing({
  value,
  size = 160,
  stroke = 12,
  label,
  tone = "light",
}: ScoreRingProps) {
  const gradientId = useId().replace(/:/g, "");
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circumference * (1 - clamped / 100);

  const trackClass = tone === "dark" ? "stroke-white/15" : "stroke-[#EBF4F0] dark:stroke-[#0E4230]";
  const numberColor = tone === "dark" ? "text-white" : "text-ggc-dark dark:text-white";
  const labelColor = tone === "dark" ? "text-ggc-gold" : "text-gray-500 dark:text-gray-400";
  const big = size >= 120;

  return (
    <div
      className="relative inline-flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${label ?? "Skor"}: ${clamped}%`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E6D5A8" />
            <stop offset="55%" stopColor="#C5A869" />
            <stop offset="100%" stopColor={tone === "dark" ? "#A6863F" : "#126348"} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" className={trackClass} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="score-ring-arc"
          style={{ ["--ring-circ" as string]: `${circumference}` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center" aria-hidden="true">
        <CountUp
          value={clamped}
          suffix="%"
          className={`font-black leading-none ${numberColor} ${big ? "text-4xl" : "text-base"}`}
        />
        {label && big && (
          <span className={`mt-1.5 text-[10px] font-bold uppercase tracking-[0.18em] ${labelColor}`}>
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
