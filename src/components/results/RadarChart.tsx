"use client";

import React from "react";

interface RadarDatum {
  label: string;
  /** 0 - 100 */
  value: number;
}

interface RadarChartProps {
  data: RadarDatum[];
  className?: string;
}

const RADIUS = 100;
const LABEL_RADIUS = 128;
const RINGS = [25, 50, 75, 100];

function point(index: number, total: number, r: number) {
  // Start at 12 o'clock and go clockwise
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  return { x: Math.cos(angle) * r, y: Math.sin(angle) * r };
}

/**
 * Dependency-free SVG radar chart for the 7 holistic dimensions.
 * The data polygon "blooms" from the centre (CSS `.radar-bloom`, disabled for reduced motion).
 */
export default function RadarChart({ data, className = "" }: RadarChartProps) {
  const total = data.length;
  if (total < 3) return null;

  const polygon = data
    .map((d, i) => {
      const p = point(i, total, (Math.max(0, Math.min(100, d.value)) / 100) * RADIUS);
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    })
    .join(" ");

  const summary = data.map((d) => `${d.label} ${d.value}%`).join(", ");

  return (
    <svg
      viewBox="-170 -150 340 300"
      className={`w-full h-auto overflow-visible ${className}`}
      role="img"
      aria-label={`Radar 7 dimensi: ${summary}`}
    >
      <defs>
        <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#C5A869" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#126348" stopOpacity="0.35" />
        </radialGradient>
      </defs>

      {/* Concentric grid */}
      {RINGS.map((ring) => (
        <polygon
          key={ring}
          points={data
            .map((_, i) => {
              const p = point(i, total, (ring / 100) * RADIUS);
              return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
            })
            .join(" ")}
          className={
            ring === 100
              ? "fill-[#F3F8F5] dark:fill-[#041D14]/80 stroke-[#0B4632] dark:stroke-[#1A5C43] opacity-90"
              : "fill-none stroke-[#0B4632]/20 dark:stroke-[#1A5C43]/40"
          }
          strokeWidth={1}
          strokeDasharray={ring === 100 ? undefined : "3 4"}
        />
      ))}

      {/* Spokes */}
      {data.map((_, i) => {
        const p = point(i, total, RADIUS);
        return (
          <line
            key={i}
            x1={0}
            y1={0}
            x2={p.x}
            y2={p.y}
            className="stroke-[#0B4632]/20 dark:stroke-[#1A5C43]/40"
          />
        );
      })}

      {/* Data polygon + vertices */}
      <g className="radar-bloom">
        <polygon
          points={polygon}
          fill="url(#radarFill)"
          className="stroke-[#0B4632] dark:stroke-emerald-400"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        {data.map((d, i) => {
          const p = point(i, total, (Math.max(0, Math.min(100, d.value)) / 100) * RADIUS);
          return (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={4}
              fill="#C5A869"
              className="stroke-[#063424] dark:stroke-[#E8F1EC]"
              strokeWidth={1.5}
            />
          );
        })}
      </g>

      {/* Labels */}
      {data.map((d, i) => {
        const p = point(i, total, LABEL_RADIUS);
        const anchor = Math.abs(p.x) < 8 ? "middle" : p.x > 0 ? "start" : "end";
        return (
          <g key={d.label} aria-hidden="true">
            <text
              x={p.x}
              y={p.y - 2}
              textAnchor={anchor}
              className="fill-ggc-dark dark:fill-[#E8F1EC]"
              style={{ fontSize: 11, fontWeight: 800 }}
            >
              {d.label}
            </text>
            <text
              x={p.x}
              y={p.y + 11}
              textAnchor={anchor}
              className="fill-[#A6863F] dark:fill-[#ECC880]"
              style={{ fontSize: 10, fontWeight: 700 }}
            >
              {d.value}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}
