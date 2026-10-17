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
          fill={ring === 100 ? "#F3F8F5" : "none"}
          stroke="#0B4632"
          strokeOpacity={ring === 100 ? 0.18 : 0.1}
          strokeDasharray={ring === 100 ? undefined : "3 4"}
        />
      ))}

      {/* Spokes */}
      {data.map((_, i) => {
        const p = point(i, total, RADIUS);
        return <line key={i} x1={0} y1={0} x2={p.x} y2={p.y} stroke="#0B4632" strokeOpacity={0.12} />;
      })}

      {/* Data polygon + vertices */}
      <g className="radar-bloom">
        <polygon points={polygon} fill="url(#radarFill)" stroke="#0B4632" strokeWidth={2} strokeLinejoin="round" />
        {data.map((d, i) => {
          const p = point(i, total, (Math.max(0, Math.min(100, d.value)) / 100) * RADIUS);
          return (
            <circle key={i} cx={p.x} cy={p.y} r={4} fill="#C5A869" stroke="#063424" strokeWidth={1.5} />
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
              className="fill-ggc-dark"
              style={{ fontSize: 11, fontWeight: 800 }}
            >
              {d.label}
            </text>
            <text
              x={p.x}
              y={p.y + 11}
              textAnchor={anchor}
              style={{ fontSize: 10, fontWeight: 700, fill: "#A6863F" }}
            >
              {d.value}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}
