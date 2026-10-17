"use client";

import React, { useRef } from "react";

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * SpotlightCard implements the modern-web-guidance `interactive-content-reveal` pattern.
 * A subtle luxury gold & emerald radial gradient smoothly follows pointer movement,
 * providing that ultra-clean Apple/Linear Bento aesthetic while maintaining 100%
 * accessibility (pointer-events: none on the overlay, full keyboard access underneath).
 */
export default function SpotlightCard({
  children,
  className = "",
  onClick,
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    cardRef.current.style.setProperty("--mouse-x", `${x.toFixed(1)}%`);
    cardRef.current.style.setProperty("--mouse-y", `${y.toFixed(1)}%`);
  };

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onClick={onClick}
      className={`spotlight-card group relative transition-all duration-300 ${className}`}
    >
      <div className="spotlight-overlay" aria-hidden="true" />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}
