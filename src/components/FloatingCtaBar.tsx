"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, CreditCard, ArrowRight, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Image from "next/image";

export default function FloatingCtaBar({
  onOpenCheckout,
}: {
  onOpenCheckout: () => void;
}) {
  const { data: session } = useSession();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show when scrolled down past 450px
      if (window.scrollY > 450) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isStudent = session?.user?.role === "STUDENT";
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 25 }}
          className="fixed bottom-4 sm:bottom-6 inset-x-0 z-40 max-w-4xl mx-auto px-4 pointer-events-none hidden sm:block"
        >
          <div className="pointer-events-auto p-3 sm:p-4 rounded-3xl bg-white/95 dark:bg-[#07261B]/95 border border-ggc/20 dark:border-ggc-gold/40 shadow-2xl backdrop-blur-2xl flex items-center justify-between gap-3 text-gray-900 dark:text-white transition-all">
            {/* Left Info with Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 p-1.5 border border-emerald-200 dark:border-emerald-800/60 shrink-0 hidden xs:flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="GGC Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-black text-ggc-dark dark:text-white truncate">
                    GGC Study Fit Assessment™
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                    <Sparkles className="w-3 h-3 text-ggc-gold" />
                    <span>84 Butir</span>
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-[#A0B9AE] hidden sm:block">
                  Petakan bakat kognitif & temukan jurusan kuliah paling pas.
                </p>
              </div>
            </div>

            {/* Right Action */}
            <div className="flex items-center gap-2 shrink-0">
              {isStudent ? (
                <Link
                  href="/student/assessment"
                  className="px-4 py-2.5 rounded-2xl text-xs font-bold text-white bg-ggc hover:bg-ggc-light transition-all shadow-md flex items-center gap-2"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-ggc-gold" />
                  <span>Lanjutkan Asesmen</span>
                  <ArrowRight className="w-3.5 h-3.5 text-ggc-gold" />
                </Link>
              ) : isAdmin ? (
                <Link
                  href="/admin/dashboard"
                  className="px-4 py-2.5 rounded-2xl text-xs font-bold text-white bg-ggc hover:bg-ggc-light transition-all shadow-md flex items-center gap-2"
                >
                  <span>Portal Admin</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <>
                  <a
                    href="#simulasi-jurusan"
                    className="hidden md:inline-flex px-3.5 py-2.5 rounded-2xl text-xs font-bold text-gray-700 dark:text-[#C7DCD2] hover:bg-gray-100 dark:hover:bg-[#0B3525] border border-gray-200 dark:border-[#103D2B] transition-all"
                  >
                    <span>Coba Simulasi</span>
                  </a>

                  <button
                    type="button"
                    onClick={onOpenCheckout}
                    className="px-5 py-2.5 rounded-2xl text-xs font-black text-ggc-dark bg-gradient-to-r from-[#E6D5A8] via-ggc-gold to-ggc-gold-dark hover:scale-105 active:scale-95 shadow-md shadow-ggc-gold/20 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4 text-ggc-dark" />
                    <span>Beli Akses (Rp 49.000)</span>
                    <ArrowRight className="w-3.5 h-3.5 text-ggc-dark" />
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
