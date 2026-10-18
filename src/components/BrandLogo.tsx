import React from "react";
import Link from "next/link";
import Image from "next/image";

interface BrandLogoProps {
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg" | "xl";
  href?: string;
  showSubtitle?: boolean;
  className?: string;
}

export default function BrandLogo({
  variant = "dark",
  size = "md",
  href = "/",
  showSubtitle = true,
  className = "",
}: BrandLogoProps) {
  const isLight = variant === "light";

  const sizeConfigs = {
    sm: {
      imgSize: 32,
      imgClass: "h-8 w-8",
      titleClass: "text-base",
      subtitleClass: "text-[10px]",
      badgeClass: "text-[9px] px-1 py-0.2",
    },
    md: {
      imgSize: 42,
      imgClass: "h-10 w-10 sm:h-11 sm:w-11",
      titleClass: "text-lg sm:text-xl",
      subtitleClass: "text-[11px]",
      badgeClass: "text-[10px] px-1.5 py-0.5",
    },
    lg: {
      imgSize: 52,
      imgClass: "h-12 w-12 sm:h-14 sm:w-14",
      titleClass: "text-xl sm:text-2xl",
      subtitleClass: "text-xs",
      badgeClass: "text-xs px-2 py-0.5",
    },
    xl: {
      imgSize: 68,
      imgClass: "h-16 w-16 sm:h-20 sm:w-20",
      titleClass: "text-2xl sm:text-3xl",
      subtitleClass: "text-xs sm:text-sm",
      badgeClass: "text-xs px-2.5 py-1",
    },
  };

  const currentSize = sizeConfigs[size];

  const content = (
    <div className={`inline-flex items-center gap-3 select-none group ${className}`}>
      {/* Official Brand Logo Image */}
      <div
        className={`relative flex items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-105 shrink-0 ${
          isLight
            ? "bg-white p-1.5 shadow-lg border border-white/40 ring-2 ring-ggc-gold/30"
            : "p-0.5 drop-shadow-sm"
        }`}
      >
        <img
          src="/logo.png"
          alt="Go Great Career Logo"
          width={currentSize.imgSize}
          height={currentSize.imgSize}
          className={`${currentSize.imgClass} object-contain`}
        />
      </div>

      {/* Brand Text Typography */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className={`font-black tracking-tight ${currentSize.titleClass} ${
              isLight ? "text-white" : "text-ggc-dark"
            }`}
          >
            Go Great Career
          </span>
          <span
            className={`font-bold uppercase tracking-wider rounded-md border ${currentSize.badgeClass} ${
              isLight
                ? "bg-ggc-gold text-ggc-dark border-ggc-gold"
                : "text-ggc-gold-dark bg-ggc-gold/15 border-ggc-gold/30"
            }`}
          >
            GGC
          </span>
        </div>
        {showSubtitle && (
          <span
            className={`font-semibold tracking-wider uppercase mt-1 hidden sm:block ${currentSize.subtitleClass} ${
              isLight ? "text-ggc-gold" : "text-ggc"
            }`}
          >
            Study Fit Assessment™
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block focus:outline-none focus:ring-2 focus:ring-ggc focus:ring-offset-2 rounded-2xl transition-all">
        {content}
      </Link>
    );
  }

  return content;
}
