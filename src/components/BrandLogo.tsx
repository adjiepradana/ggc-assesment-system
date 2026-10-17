import React from "react";
import Link from "next/link";
import { Compass } from "lucide-react";

interface BrandLogoProps {
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  href?: string;
}

export default function BrandLogo({
  variant = "dark",
  size = "md",
  href = "/",
}: BrandLogoProps) {
  const isLight = variant === "light";

  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  const content = (
    <div className="inline-flex items-center gap-3 select-none group">
      {/* Emblem Icon */}
      <div
        className={`relative flex items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105 shadow-md ${
          iconSizes[size]
        } ${
          isLight
            ? "bg-white/10 text-ggc-gold border border-white/20"
            : "bg-ggc text-ggc-gold border border-ggc-gold/30"
        }`}
      >
        <Compass className="w-5/6 h-5/6 stroke-[2.2]" />
        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ggc-gold opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-ggc-gold"></span>
        </span>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className={`font-black tracking-tight ${sizeClasses[size]} ${
              isLight ? "text-white" : "text-ggc-dark"
            }`}
          >
            Go Great Career
          </span>
          <span className="text-[10px] font-semibold text-ggc-gold uppercase tracking-wider px-1.5 py-0.5 rounded bg-ggc-gold/15 border border-ggc-gold/30">
            GGC
          </span>
        </div>
        <span
          className={`text-[11px] font-medium tracking-wide mt-1 ${
            isLight ? "text-ggc-subtle/80" : "text-ggc-light"
          }`}
        >
          Study Fit Assessment™
        </span>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}
