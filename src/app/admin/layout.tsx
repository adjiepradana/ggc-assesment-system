"use client";

import React, { useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Menu,
  ShieldCheck,
  Calendar,
  Sparkles,
  ChevronRight,
  Database,
  ExternalLink,
  Compass,
} from "lucide-react";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  // Determine current page title from pathname
  const getPageTitle = () => {
    if (pathname === "/admin/dashboard") return "Dashboard Overview & Analitik";
    if (pathname.startsWith("/admin/questions")) return "Manajemen Bank Soal (84 Butir)";
    if (pathname.startsWith("/admin/students")) return "Data Partisipan & Sesi Siswa";
    return "Admin Console";
  };

  return (
    <div className="min-h-screen bg-[#F4F7F5] flex flex-col selection:bg-ggc selection:text-white">
      {/* 1. Left Sidebar Navigation (260px Desktop & Mobile Slide-in Drawer) */}
      <AdminSidebar
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* 2. Top Mobile Header (< 1024px) */}
      <header className="lg:hidden sticky top-0 z-30 h-16 bg-[#063424] text-white px-4 flex items-center justify-between border-b border-[#0B4632] shadow-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-ggc-gold"
            aria-label="Buka Menu Navigasi"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="GGC Logo"
              className="h-7 w-7 object-contain bg-white rounded-lg p-0.5"
            />
            <span className="font-black text-sm text-white tracking-tight">
              GGC Admin
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center gap-1 transition-colors"
            title="Kembali ke Halaman Utama Publik"
          >
            <span>Halaman Utama</span>
          </Link>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-ggc-gold/20 text-ggc-gold border border-ggc-gold/30">
            Super Admin
          </span>
          <div className="w-8 h-8 rounded-xl bg-ggc-gold text-ggc-dark font-black flex items-center justify-center text-xs">
            {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "A"}
          </div>
        </div>
      </header>

      {/* 3. Main Content Wrapper (Shifted right by 260px on Desktop) */}
      <div className="lg:pl-[260px] flex-1 flex flex-col min-w-0">
        {/* Desktop Top Header Bar */}
        <div className="hidden lg:flex h-16 bg-white border-b border-gray-200/90 px-8 items-center justify-between sticky top-0 z-20 shadow-2xs">
          {/* Breadcrumb & Section indicator */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-gray-500">Portal Administrator</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-bold text-ggc-dark">{getPageTitle()}</span>
          </div>

          {/* Right Header Status & Admin Identity */}
          <div className="flex items-center gap-4">
            {/* Database indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>PostgreSQL Connected</span>
            </div>

            {/* Quick Live Preview link */}
            <Link
              href="/"
              className="text-xs font-bold text-gray-700 hover:text-ggc transition-colors flex items-center gap-1.5 border border-gray-200 px-3 py-1.5 rounded-xl bg-gray-50/80 hover:bg-gray-100 shadow-2xs"
            >
              <Compass className="w-3.5 h-3.5 text-ggc-gold" />
              <span>Kembali ke Halaman Utama</span>
            </Link>

            {/* Admin Avatar */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-gray-200">
              <div className="w-8 h-8 rounded-xl bg-ggc text-ggc-gold font-bold flex items-center justify-center text-xs shadow-sm">
                {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "A"}
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-gray-800 leading-tight">
                  {session?.user?.name || "Admin GGC"}
                </div>
                <div className="text-[10px] text-gray-500">Super Administrator</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <main className="flex-1 w-full max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>

        {/* Admin Footer */}
        <footer className="py-5 px-8 bg-white border-t border-gray-200 text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Go Great Career (GGC) • Enterprise Multi-Matrix Assessment Console</p>
          <div className="flex items-center gap-3 text-gray-400">
            <span>84-Item Psychometric Instrument</span>
            <span>•</span>
            <span>Role-Based Access Control (RBAC)</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
