"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FileQuestion,
  GraduationCap,
  FileSpreadsheet,
  LogOut,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  RefreshCw,
  Menu,
  X,
  Compass,
} from "lucide-react";

interface AdminSidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export default function AdminSidebar({
  isMobileOpen,
  setIsMobileOpen,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isExporting, setIsExporting] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname, setIsMobileOpen]);

  // Handle escape key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileOpen(false);
      }
    };
    if (isMobileOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileOpen, setIsMobileOpen]);

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      const res = await fetch("/api/admin/export");
      if (!res.ok) throw new Error("Gagal mengekspor data Excel.");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `GGC_Study_Fit_Rekap_Peserta_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(err.message || "Gagal mengunduh file Excel.");
    } finally {
      setIsExporting(false);
    }
  };

  const navItems = [
    {
      name: "Dashboard Overview",
      subtitle: "KPIs & Analitik Utama",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/admin/dashboard",
    },
    {
      name: "Bank Soal & CMS",
      subtitle: "84 Butir Multi-Matrix",
      href: "/admin/questions",
      icon: FileQuestion,
      active: pathname.startsWith("/admin/questions"),
    },
    {
      name: "Data Partisipan & Siswa",
      subtitle: "Rekap Hasil & Sesi",
      href: "/admin/students",
      icon: GraduationCap,
      active: pathname.startsWith("/admin/students"),
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between bg-[#063424] text-white">
      {/* Top Brand Header */}
      <div>
        <div className="p-5 pb-6 border-b border-[#0B4632]/80 flex items-center justify-between">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-3 group focus:outline-none"
          >
            <div className="relative flex items-center justify-center rounded-2xl bg-white p-1.5 shadow-md border border-white/20 ring-2 ring-ggc-gold/30 shrink-0 group-hover:scale-105 transition-transform">
              <img
                src="/logo.png"
                alt="Go Great Career Logo"
                className="h-9 w-9 object-contain"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-black text-base tracking-tight text-white">
                  Go Great Career
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider rounded px-1.5 py-0.5 bg-ggc-gold text-ggc-dark font-mono">
                  GGC
                </span>
              </div>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-ggc-gold mt-1">
                Admin Console™
              </span>
            </div>
          </Link>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-ggc-subtle hover:text-white transition-colors"
            title="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Super Admin Badge Banner */}
        <div className="px-5 py-3 bg-[#0B4632]/50 border-b border-[#0B4632]/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-ggc-subtle/90 font-medium text-[11px]">System Status:</span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-ggc-gold/20 text-ggc-gold border border-ggc-gold/30">
            Online • v1.0
          </span>
        </div>

        {/* Navigation Links */}
        <div className="p-4 space-y-1.5">
          <div className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-ggc-gold/70">
            Menu Manajemen
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.active;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all duration-200 group ${
                  isActive
                    ? "bg-[#0B4632] text-white shadow-md border border-ggc-gold/40 ring-1 ring-ggc-gold/20"
                    : "text-ggc-subtle/80 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                      isActive
                        ? "bg-ggc-gold text-ggc-dark font-black shadow-sm"
                        : "bg-white/5 text-ggc-subtle group-hover:text-ggc-gold group-hover:bg-white/10"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="leading-tight">{item.name}</div>
                    <div className="text-[10px] font-normal text-ggc-subtle/60 group-hover:text-ggc-subtle/80">
                      {item.subtitle}
                    </div>
                  </div>
                </div>

                <ChevronRight
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isActive
                      ? "text-ggc-gold translate-x-0.5"
                      : "text-white/20 group-hover:text-white/60 group-hover:translate-x-0.5"
                  }`}
                />
              </Link>
            );
          })}

          {/* Direct Excel Export Action Button in Sidebar */}
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={isExporting}
            className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold text-ggc-subtle/80 hover:text-white hover:bg-white/5 transition-all duration-200 border border-transparent group disabled:opacity-50 mt-1"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-900 transition-colors">
                {isExporting ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-ggc-gold" />
                ) : (
                  <FileSpreadsheet className="w-4 h-4" />
                )}
              </div>
              <div className="text-left">
                <div className="leading-tight">Ekspor Data Excel</div>
                <div className="text-[10px] font-normal text-ggc-subtle/60">
                  {isExporting ? "Memproses..." : "Format .xlsx Instan"}
                </div>
              </div>
            </div>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
              XLSX
            </span>
          </button>
        </div>

        {/* Quick Link to Student View / Home */}
        <div className="px-4 py-2">
          <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-ggc-gold/70">
            Tinjauan Publik
          </div>
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-ggc-subtle/70 hover:text-white hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Compass className="w-4 h-4 text-ggc-gold" />
              <span>Kembali ke Halaman Utama</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-white/40" />
          </Link>
        </div>
      </div>

      {/* Bottom User Info & Logout Button */}
      <div className="p-4 border-t border-[#0B4632]/80 bg-[#042419]">
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-ggc-gold text-ggc-dark font-black flex items-center justify-center shrink-0 shadow-sm text-sm">
              {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate">
                {session?.user?.name || "Administrator GGC"}
              </div>
              <div className="text-[10px] text-ggc-subtle/70 truncate">
                {session?.user?.email || "admin@ggc.id"}
              </div>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-ggc-gold/20 text-ggc-gold border border-ggc-gold/40 shrink-0">
            <ShieldCheck className="w-2.5 h-2.5" /> Admin
          </span>
        </div>

        {/* Logout Action */}
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold text-red-300 hover:text-red-200 bg-red-950/40 hover:bg-red-950/70 border border-red-800/40 transition-all duration-200"
          title="Keluar dari sesi administrator"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar / Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Permanent Desktop Fixed Left Sidebar (260px) */}
      <aside
        className="hidden lg:block fixed top-0 bottom-0 left-0 w-[260px] z-40 border-r border-[#0B4632]/80 shadow-xl"
        aria-label="Admin Navigation Sidebar"
      >
        {sidebarContent}
      </aside>

      {/* 2. Mobile / Tablet Drawer Overlay & Slide-in Sidebar */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Dimmed backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer container */}
          <div
            className="fixed top-0 bottom-0 left-0 w-[270px] max-w-[85vw] shadow-2xl transition-transform duration-300 transform translate-x-0"
            role="dialog"
            aria-modal="true"
            aria-label="Admin Navigation Drawer"
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
