"use client";

import React, { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Read active theme from DOM class or localStorage
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "theme") {
        const newTheme = e.newValue === "dark" ? "dark" : "light";
        setTheme(newTheme);
        document.documentElement.classList.toggle("dark", newTheme === "dark");
        const meta = document.querySelector('meta[name="color-scheme"]');
        if (meta) meta.setAttribute("content", newTheme);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);

    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      const meta = document.querySelector('meta[name="color-scheme"]');
      if (meta) meta.setAttribute("content", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      const meta = document.querySelector('meta[name="color-scheme"]');
      if (meta) meta.setAttribute("content", "light");
    }
  };

  // Prevent hydration mismatch during SSR
  if (!mounted) {
    return (
      <div
        className="no-print fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 opacity-0 pointer-events-none"
        aria-hidden="true"
      >
        <div className="w-11 h-11 rounded-full bg-white shadow-xl" />
      </div>
    );
  }

  const isDark = theme === "dark";

  return (
    <aside
      aria-label="Pengaturan Mode Tampilan"
      className="no-print fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40"
    >
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? "Beralih ke Mode Terang (Light Mode)" : "Beralih ke Mode Gelap (Dark Mode)"}
        title={isDark ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap"}
        className={`group relative flex items-center gap-2.5 px-3.5 py-2.5 rounded-full shadow-2xl backdrop-blur-md transition-all duration-300 border focus:outline-none focus-visible:ring-2 focus-visible:ring-ggc-gold active:scale-95 ${
          isDark
            ? "bg-[#07261B]/95 hover:bg-[#0A3324] border-ggc-gold/50 text-[#E6D5A8] shadow-black/40 ring-1 ring-ggc-gold/30"
            : "bg-white/95 hover:bg-gray-50 border-gray-200 text-ggc-dark shadow-ggc/15 hover:border-ggc/40"
        }`}
      >
        {/* Glow ambient pulse for luxury feel */}
        <span
          className={`absolute inset-0 rounded-full blur-md opacity-25 group-hover:opacity-40 transition-opacity pointer-events-none ${
            isDark ? "bg-ggc-gold" : "bg-emerald-500"
          }`}
          aria-hidden="true"
        />

        {/* Morphing Icon Container */}
        <span
          className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 shadow-xs ${
            isDark
              ? "bg-ggc-gold/20 text-ggc-gold rotate-0"
              : "bg-emerald-50 text-emerald-800 -rotate-12"
          }`}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-ggc-gold transition-transform group-hover:rotate-90 duration-300" />
          ) : (
            <Moon className="w-4 h-4 text-ggc-dark transition-transform group-hover:-rotate-45 duration-300" />
          )}
        </span>

        {/* Text Pill Label */}
        <span className="relative z-10 text-xs font-black tracking-wide pr-1 select-none hidden sm:inline">
          {isDark ? "Mode Terang" : "Mode Gelap"}
        </span>

        {/* Small theme indicator dot on mobile */}
        <span
          className={`sm:hidden relative z-10 w-2 h-2 rounded-full ${
            isDark ? "bg-ggc-gold animate-pulse" : "bg-emerald-500"
          }`}
          aria-hidden="true"
        />
      </button>
    </aside>
  );
}
