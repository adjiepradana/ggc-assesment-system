"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import BrandLogo from "./BrandLogo";
import {
  Menu,
  X,
  LogOut,
  User,
  Shield,
  LayoutDashboard,
  FileQuestion,
  GraduationCap,
  Sparkles,
  Compass,
  Home,
  Users,
  ChevronRight,
  Award,
  Layers,
  HelpCircle,
  ExternalLink,
  Settings,
  Receipt,
} from "lucide-react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isStudent = session?.user?.role === "STUDENT";
  const isAdmin = session?.user?.role === "ADMIN";
  const isNotHome = pathname !== "/";

  // Auto-close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/95 dark:bg-[#031810]/95 border-b border-ggc-subtle dark:border-[#0E4230] shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo - Always points to Home "/" */}
          <div className="flex items-center gap-3">
            <BrandLogo href="/" />
          </div>

          {/* ================= DESKTOP NAVIGATION ================= */}
          <nav className="hidden md:flex items-center gap-3.5">
            {/* Dedicated "Halaman Utama" button when not on landing page */}
            {isNotHome && (
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-gray-700 dark:text-[#C7DCD2] hover:text-ggc dark:hover:text-ggc-gold bg-gray-50 dark:bg-[#07261B] hover:bg-ggc-subtle dark:hover:bg-[#0A3324] border border-gray-200/90 dark:border-[#103D2B] transition-colors shadow-2xs"
                title="Buka halaman utama publik GGC"
              >
                <Compass className="w-3.5 h-3.5 text-ggc-gold" />
                <span>Halaman Utama</span>
              </Link>
            )}

            {status === "authenticated" && (
              <>
                {isStudent && (
                  <>
                    <Link
                      href="/student/dashboard"
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        pathname === "/student/dashboard"
                          ? "bg-ggc text-white shadow-xs"
                          : "text-gray-700 dark:text-[#C7DCD2] hover:text-ggc dark:hover:text-ggc-gold hover:bg-gray-50 dark:hover:bg-[#07261B]"
                      }`}
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span>Dashboard Siswa</span>
                    </Link>
                    <Link
                      href="/student/assessment"
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        pathname.startsWith("/student/assessment")
                          ? "bg-ggc text-white shadow-xs"
                          : "text-gray-700 dark:text-[#C7DCD2] hover:text-ggc dark:hover:text-ggc-gold hover:bg-gray-50 dark:hover:bg-[#07261B]"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-ggc-gold" />
                      <span>Asesmen Study Fit</span>
                    </Link>
                    <Link
                      href="/student/settings"
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        pathname === "/student/settings"
                          ? "bg-ggc text-white shadow-xs"
                          : "text-gray-700 dark:text-[#C7DCD2] hover:text-ggc dark:hover:text-ggc-gold hover:bg-gray-50 dark:hover:bg-[#07261B]"
                      }`}
                    >
                      <Settings className="w-3.5 h-3.5 text-ggc-gold" />
                      <span>Pengaturan</span>
                    </Link>
                  </>
                )}

                {isAdmin && (
                  <>
                    <Link
                      href="/admin/dashboard"
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        pathname === "/admin/dashboard"
                          ? "bg-ggc text-white shadow-xs"
                          : "text-gray-700 dark:text-[#C7DCD2] hover:text-ggc dark:hover:text-ggc-gold hover:bg-gray-50 dark:hover:bg-[#07261B]"
                      }`}
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span>Dashboard Admin</span>
                    </Link>
                    <Link
                      href="/admin/questions"
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        pathname.startsWith("/admin/questions")
                          ? "bg-ggc text-white shadow-xs"
                          : "text-gray-700 dark:text-[#C7DCD2] hover:text-ggc dark:hover:text-ggc-gold hover:bg-gray-50 dark:hover:bg-[#07261B]"
                      }`}
                    >
                      <FileQuestion className="w-3.5 h-3.5" />
                      <span>Bank Soal (84)</span>
                    </Link>
                    <Link
                      href="/admin/students"
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        pathname.startsWith("/admin/students")
                          ? "bg-ggc text-white shadow-xs"
                          : "text-gray-700 dark:text-[#C7DCD2] hover:text-ggc dark:hover:text-ggc-gold hover:bg-gray-50 dark:hover:bg-[#07261B]"
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Data Siswa</span>
                    </Link>
                  </>
                )}
              </>
            )}

            {status !== "authenticated" && (
              <div className="hidden lg:flex items-center gap-5 text-xs font-bold text-gray-600 dark:text-[#A0B9AE]">
                <a
                  href="/#fitur"
                  className="hover:text-ggc dark:hover:text-ggc-gold transition-colors"
                >
                  Keunggulan
                </a>
                <a
                  href="/#metodologi"
                  className="hover:text-ggc dark:hover:text-ggc-gold transition-colors"
                >
                  7 Dimensi
                </a>
                <a
                  href="/#signatures"
                  className="hover:text-ggc dark:hover:text-ggc-gold transition-colors"
                >
                  Potential Signature
                </a>
                <a
                  href="/#alur"
                  className="hover:text-ggc dark:hover:text-ggc-gold transition-colors"
                >
                  Cara Kerja
                </a>
                <a
                  href="/#faq"
                  className="hover:text-ggc dark:hover:text-ggc-gold transition-colors"
                >
                  FAQ
                </a>
              </div>
            )}
          </nav>

          {/* ================= USER ACTIONS & HAMBURGER BUTTON ================= */}
          <div className="flex items-center gap-2.5">
            {/* Quick Home Pill for Mobile when not on Home */}
            {isNotHome && (
              <Link
                href="/"
                className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl text-gray-700 dark:text-[#C7DCD2] bg-gray-50 dark:bg-[#07261B] hover:bg-ggc-subtle dark:hover:bg-[#0A3324] border border-gray-200/90 dark:border-[#103D2B] shadow-2xs"
                title="Kembali ke Halaman Utama"
                aria-label="Kembali ke Halaman Utama"
              >
                <Home className="w-4 h-4 text-ggc-gold" />
              </Link>
            )}

            {status === "loading" ? (
              <div className="w-20 h-9 bg-ggc-subtle dark:bg-[#07261B] animate-pulse rounded-xl" />
            ) : status === "authenticated" ? (
              <div className="hidden sm:flex items-center gap-3">
                {/* Role Badge & Name */}
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold text-ggc-dark dark:text-white truncate max-w-[130px]">
                    {session.user?.name || session.user?.email}
                  </span>
                  <div className="flex items-center justify-end gap-1 mt-0.5">
                    {isAdmin ? (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full bg-ggc-gold/20 text-ggc-gold-dark dark:text-ggc-gold border border-ggc-gold/40">
                        <Shield className="w-2.5 h-2.5" /> Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full bg-ggc/10 dark:bg-emerald-950/60 text-ggc dark:text-emerald-300 border border-ggc/20 dark:border-emerald-800/40">
                        <GraduationCap className="w-2.5 h-2.5" /> Siswa
                      </span>
                    )}
                  </div>
                </div>

                {/* Avatar Icon */}
                <Link
                  href={isStudent ? "/student/dashboard" : "/admin/dashboard"}
                  title={isStudent ? "Ke Dashboard Siswa" : "Ke Admin Portal"}
                  className="w-9 h-9 rounded-xl bg-ggc text-ggc-gold font-bold flex items-center justify-center shadow-xs hover:ring-2 hover:ring-ggc-gold/50 transition-all text-xs"
                >
                  {session.user?.name ? (
                    session.user.name.charAt(0).toUpperCase()
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </Link>

                {/* Desktop Logout Button */}
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/auth/login" })}
                  className="hidden md:inline-flex items-center gap-1 px-3 py-2 text-xs font-bold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200/80 dark:border-red-900/50 rounded-xl transition-all"
                  title="Keluar dari akun"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar</span>
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/order/track"
                  className="px-3 py-2 text-xs font-semibold text-gray-600 dark:text-[#A0B9AE] hover:text-ggc dark:hover:text-ggc-gold transition-colors flex items-center gap-1.5"
                >
                  <Receipt className="w-3.5 h-3.5 text-ggc-gold" />
                  <span>Cek Pesanan</span>
                </Link>
                <Link
                  href="/auth/login"
                  className="px-3.5 py-2 text-xs font-bold text-gray-700 dark:text-[#C7DCD2] hover:text-ggc dark:hover:text-ggc-gold transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 text-xs font-bold text-ggc-dark bg-gradient-to-r from-[#E6D5A8] via-ggc-gold to-ggc-gold-dark rounded-xl shadow-xs hover:shadow transition-all"
                >
                  Daftar Asesmen
                </Link>
              </div>
            )}

            {/* HAMBURGER TOGGLE BUTTON (Mobile/Tablet < md) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gray-50 dark:bg-[#07261B] hover:bg-ggc-subtle dark:hover:bg-[#0A3324] text-gray-800 dark:text-white border border-gray-200/90 dark:border-[#103D2B] shadow-2xs transition-all focus:outline-none focus:ring-2 focus:ring-ggc/30"
              aria-label={mobileMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-gray-900 dark:text-white" />
              ) : (
                <Menu className="w-5 h-5 text-gray-900 dark:text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ================= MOBILE DRAWER OVERLAY & MENU ================= */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-20 z-40 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in">
          {/* Backdrop click area */}
          <div
            className="absolute inset-0"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Sheet */}
          <div className="relative bg-white dark:bg-[#052016] border-b border-gray-200/90 dark:border-[#0E4230] shadow-2xl max-h-[calc(100vh-5rem)] overflow-y-auto">
            <div className="px-5 py-6 space-y-6 max-w-lg mx-auto">
              {/* Authenticated User Profile Summary Card */}
              {status === "authenticated" && session?.user && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-ggc-subtle via-white to-ggc-gold-subtle dark:from-[#062419] dark:via-[#093525] dark:to-[#062419] border border-ggc/20 dark:border-[#103D2B] shadow-2xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-ggc text-ggc-gold font-bold flex items-center justify-center text-sm shadow-xs border border-white/20">
                      {session.user.name
                        ? session.user.name.charAt(0).toUpperCase()
                        : "U"}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-ggc-dark dark:text-white truncate max-w-[190px]">
                        {session.user.name || "Pengguna GGC"}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-[#A0B9AE] truncate max-w-[190px]">
                        {session.user.email}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      isAdmin
                        ? "bg-ggc-gold/20 text-ggc-gold-dark dark:text-ggc-gold border border-ggc-gold/40"
                        : "bg-ggc/10 dark:bg-emerald-950/60 text-ggc dark:text-emerald-300 border border-ggc/20 dark:border-emerald-800/40"
                    }`}
                  >
                    {isAdmin ? "Admin" : "Siswa"}
                  </span>
                </div>
              )}

              {/* Main Nav Links Group */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-2">
                  Navigasi Utama
                </span>

                {/* Home Link */}
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                    pathname === "/"
                      ? "bg-ggc text-white shadow-xs"
                      : "text-gray-700 dark:text-[#C7DCD2] hover:bg-gray-100 dark:hover:bg-[#0A3324]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Home className="w-4 h-4 text-ggc-gold" />
                    <span>Halaman Utama (Landing Page)</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </Link>

                {/* Student specific links */}
                {isStudent && (
                  <>
                    <Link
                      href="/student/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                        pathname === "/student/dashboard"
                          ? "bg-ggc text-white shadow-xs"
                          : "text-gray-700 dark:text-[#C7DCD2] hover:bg-gray-100 dark:hover:bg-[#0A3324]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <LayoutDashboard className="w-4 h-4 text-ggc-gold" />
                        <span>Dashboard Siswa</span>
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    </Link>

                    <Link
                      href="/student/assessment"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                        pathname.startsWith("/student/assessment")
                          ? "bg-ggc text-white shadow-xs"
                          : "text-gray-700 dark:text-[#C7DCD2] hover:bg-gray-100 dark:hover:bg-[#0A3324]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-4 h-4 text-ggc-gold" />
                        <span>Asesmen Study Fit (84 Butir)</span>
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    </Link>

                    <Link
                      href="/student/settings"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                        pathname === "/student/settings"
                          ? "bg-ggc text-white shadow-xs"
                          : "text-gray-700 dark:text-[#C7DCD2] hover:bg-gray-100 dark:hover:bg-[#0A3324]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Settings className="w-4 h-4 text-ggc-gold" />
                        <span>Pengaturan Akun & Keamanan</span>
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    </Link>
                  </>
                )}

                {/* Admin specific links */}
                {isAdmin && (
                  <>
                    <Link
                      href="/admin/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                        pathname === "/admin/dashboard"
                          ? "bg-ggc text-white shadow-xs"
                          : "text-gray-700 dark:text-[#C7DCD2] hover:bg-gray-100 dark:hover:bg-[#0A3324]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <LayoutDashboard className="w-4 h-4 text-ggc-gold" />
                        <span>Overview Admin Portal</span>
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    </Link>

                    <Link
                      href="/admin/questions"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                        pathname.startsWith("/admin/questions")
                          ? "bg-ggc text-white shadow-xs"
                          : "text-gray-700 dark:text-[#C7DCD2] hover:bg-gray-100 dark:hover:bg-[#0A3324]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <FileQuestion className="w-4 h-4 text-ggc-gold" />
                        <span>Manajemen Bank Soal (84)</span>
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    </Link>

                    <Link
                      href="/admin/students"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                        pathname.startsWith("/admin/students")
                          ? "bg-ggc text-white shadow-xs"
                          : "text-gray-700 dark:text-[#C7DCD2] hover:bg-gray-100 dark:hover:bg-[#0A3324]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Users className="w-4 h-4 text-ggc-gold" />
                        <span>Data Siswa & Partisipan</span>
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    </Link>
                  </>
                )}
              </div>

              {/* Informational Section Links (Anchor Links for Landing Page) */}
              <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-[#0E4230]">
                <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-2">
                  Eksplorasi Platform
                </span>

                <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                  <a
                    href="/#fitur"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#07261B] text-gray-700 dark:text-[#C7DCD2] hover:bg-ggc-subtle dark:hover:bg-[#0A3324] hover:text-ggc dark:hover:text-ggc-gold border border-transparent dark:border-[#103D2B] transition-colors flex items-center gap-2"
                  >
                    <Award className="w-3.5 h-3.5 text-ggc-gold" />
                    <span>Keunggulan</span>
                  </a>
                  <a
                    href="/#metodologi"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#07261B] text-gray-700 dark:text-[#C7DCD2] hover:bg-ggc-subtle dark:hover:bg-[#0A3324] hover:text-ggc dark:hover:text-ggc-gold border border-transparent dark:border-[#103D2B] transition-colors flex items-center gap-2"
                  >
                    <Layers className="w-3.5 h-3.5 text-ggc-gold" />
                    <span>7 Dimensi</span>
                  </a>
                  <a
                    href="/#signatures"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#07261B] text-gray-700 dark:text-[#C7DCD2] hover:bg-ggc-subtle dark:hover:bg-[#0A3324] hover:text-ggc dark:hover:text-ggc-gold border border-transparent dark:border-[#103D2B] transition-colors flex items-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-ggc-gold" />
                    <span>Potential Signature</span>
                  </a>
                  <a
                    href="/#faq"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#07261B] text-gray-700 dark:text-[#C7DCD2] hover:bg-ggc-subtle dark:hover:bg-[#0A3324] hover:text-ggc dark:hover:text-ggc-gold border border-transparent dark:border-[#103D2B] transition-colors flex items-center gap-2"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-ggc-gold" />
                    <span>FAQ & Bantuan</span>
                  </a>
                </div>
              </div>

              {/* Bottom Actions: Login / Register OR Logout */}
              <div className="pt-3 border-t border-gray-100 dark:border-[#0E4230] space-y-3">
                {status === "authenticated" ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut({ callbackUrl: "/auth/login" });
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-900/50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Keluar dari Akun</span>
                  </button>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    <Link
                      href="/auth/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold text-ggc-dark bg-gradient-to-r from-[#E6D5A8] via-ggc-gold to-ggc-gold-dark shadow-xs hover:shadow transition-all"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Daftar Asesmen Sekarang</span>
                    </Link>
                    <Link
                      href="/auth/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-gray-700 dark:text-[#C7DCD2] bg-gray-50 dark:bg-[#07261B] hover:bg-gray-100 dark:hover:bg-[#0A3324] border border-gray-200 dark:border-[#103D2B] transition-colors"
                    >
                      <span>Sudah Punya Akun? Masuk</span>
                    </Link>
                    <Link
                      href="/order/track"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-gray-600 dark:text-[#A0B9AE] bg-transparent hover:bg-gray-100 dark:hover:bg-[#07261B] transition-colors"
                    >
                      <Receipt className="w-3.5 h-3.5 text-ggc-gold" />
                      <span>Sudah Bayar? Cek Status Pesanan</span>
                    </Link>
                  </div>
                )}

                <div className="text-center text-[11px] text-gray-400 pt-1">
                  Go Great Career (GGC) • Study Fit Assessment™
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
