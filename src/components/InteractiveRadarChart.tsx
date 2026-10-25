"use client";

import React, { useMemo } from "react";

export interface RadarDataPoint {
  axis: string;
  value: number; // 0 to 100
  shortName?: string;
}

interface InteractiveRadarChartProps {
  data: RadarDataPoint[];
  size?: number;
  className?: string;
  fillColor?: string;
  strokeColor?: string;
}

export default function InteractiveRadarChart({
  data,
  size = 320,
  className = "",
  fillColor = "rgba(11, 70, 50, 0.25)",
  strokeColor = "#0B4632",
}: InteractiveRadarChartProps) {
  const center = size / 2;
  const radius = center - 45; // Leave padding for axis labels
  const totalAxes = data.length;

  // Compute (x, y) coordinates for a given axis and radius
  const getCoordinates = (index: number, r: number) => {
    // Start from top (-90 degrees / -PI/2) and rotate clockwise
    const angle = (Math.PI * 2 * index) / totalAxes - Math.PI / 2;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, angle };
  };

  // Concentric guideline levels (25%, 50%, 75%, 100%)
  const levels = [0.25, 0.5, 0.75, 1.0];

  // Polygon points string for the data
  const dataPolygonPoints = useMemo(() => {
    return data
      .map((item, idx) => {
        const valFraction = Math.max(0.1, Math.min(1.0, item.value / 100));
        const { x, y } = getCoordinates(idx, radius * valFraction);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [data, radius, totalAxes]);

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible filter drop-shadow-sm transition-all duration-500"
      >
        <defs>
          <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#126348" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#0B4632" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#C5A869" stopOpacity="0.35" />
          </linearGradient>
          <filter id="glowGold" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. Background Concentric Polygons */}
        {levels.map((lvl) => {
          const points = data
            .map((_, idx) => {
              const { x, y } = getCoordinates(idx, radius * lvl);
              return `${x.toFixed(1)},${y.toFixed(1)}`;
            })
            .join(" ");

          return (
            <polygon
              key={lvl}
              points={points}
              className={`${
                lvl === 1.0
                  ? "fill-[#FAFBF9] dark:fill-[#041D14]/80 stroke-gray-200 dark:stroke-[#0E4230]"
                  : "fill-none stroke-gray-200 dark:stroke-[#0E4230]/70"
              }`}
              strokeWidth={lvl === 1.0 ? "1.5" : "1"}
              strokeDasharray={lvl === 0.5 || lvl === 0.75 ? "3 3" : undefined}
            />
          );
        })}

        {/* 2. Axis Spokes from Center to Outer Edge */}
        {data.map((_, idx) => {
          const { x, y } = getCoordinates(idx, radius);
          return (
            <line
              key={idx}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              className="stroke-gray-300 dark:stroke-[#103D2B]"
              strokeWidth="1"
            />
          );
        })}

        {/* 3. Data Area Polygon */}
        <polygon
          points={dataPolygonPoints}
          fill="url(#radarGradient)"
          stroke={strokeColor}
          strokeWidth="2.5"
          className="transition-all duration-700 ease-out"
        />

        {/* 4. Data Vertex Points */}
        {data.map((item, idx) => {
          const valFraction = Math.max(0.1, Math.min(1.0, item.value / 100));
          const { x, y } = getCoordinates(idx, radius * valFraction);

          return (
            <g key={idx} className="transition-all duration-700 ease-out group cursor-pointer">
              {/* Outer pulse circle */}
              <circle
                cx={x}
                cy={y}
                r="7"
                fill="#C5A869"
                opacity="0.35"
                className="animate-ping"
              />
              {/* Main vertex circle */}
              <circle
                cx={x}
                cy={y}
                r="4.5"
                fill="#C5A869"
                stroke="#FFFFFF"
                strokeWidth="2"
                filter="url(#glowGold)"
              />
              {/* Tooltip value */}
              <text
                x={x}
                y={y - 10}
                textAnchor="middle"
                fontSize="10"
                fontWeight="bold"
                className="opacity-0 group-hover:opacity-100 transition-opacity fill-gray-900 dark:fill-white font-black"
              >
                {item.value}%
              </text>
            </g>
          );
        })}

        {/* 5. Axis Labels */}
        {data.map((item, idx) => {
          const { x, y, angle } = getCoordinates(idx, radius + 22);

          // Anchor alignment adjustments based on angle position
          let textAnchor: "middle" | "start" | "end" = "middle";
          const cosAngle = Math.cos(angle);
          if (cosAngle > 0.25) textAnchor = "start";
          else if (cosAngle < -0.25) textAnchor = "end";

          return (
            <text
              key={item.axis}
              x={x}
              y={y + 4}
              textAnchor={textAnchor}
              fontSize="10"
              fontWeight="700"
              className="tracking-tight fill-gray-700 dark:fill-[#D1E2DA] transition-colors"
            >
              {item.shortName || item.axis}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
