"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import BrandLogo from "./BrandLogo";
import {
  LogOut,
  User,
  Shield,
  LayoutDashboard,
  FileQuestion,
  GraduationCap,
  Sparkles,
  Compass,
  ArrowLeft,
  Home,
} from "lucide-react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const isStudent = session?.user?.role === "STUDENT";
  const isAdmin = session?.user?.role === "ADMIN";
  const isNotHome = pathname !== "/";

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/95 border-b border-ggc-subtle shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo - Always points to Home "/" */}
          <div className="flex items-center gap-3">
            <BrandLogo href="/" />
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-4">
            {/* Dedicated "Kembali ke Halaman Utama" button when not on landing page */}
            {isNotHome && (
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-gray-700 hover:text-ggc bg-gray-50 hover:bg-ggc-subtle border border-gray-200/90 transition-colors shadow-2xs"
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
                          : "text-gray-700 hover:text-ggc hover:bg-gray-50"
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
                          : "text-gray-700 hover:text-ggc hover:bg-gray-50"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-ggc-gold" />
                      <span>Asesmen Study Fit</span>
                    </Link>
                  </>
                )}

                {isAdmin && (
                  <>
                    <Link
                      href="/admin/dashboard"
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        pathname.startsWith("/admin")
                          ? "bg-ggc text-white shadow-xs"
                          : "text-gray-700 hover:text-ggc hover:bg-gray-50"
                      }`}
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span>Admin Portal</span>
                    </Link>
                  </>
                )}
              </>
            )}

            {status !== "authenticated" && (
              <div className="hidden lg:flex items-center gap-5 text-xs font-bold text-gray-600">
                <a
                  href="/#fitur"
                  className="hover:text-ggc transition-colors"
                >
                  Keunggulan
                </a>
                <a
                  href="/#metodologi"
                  className="hover:text-ggc transition-colors"
                >
                  7 Dimensi
                </a>
                <a
                  href="/#signatures"
                  className="hover:text-ggc transition-colors"
                >
                  Potential Signature
                </a>
                <a
                  href="/#alur"
                  className="hover:text-ggc transition-colors"
                >
                  Cara Kerja
                </a>
                <a
                  href="/#faq"
                  className="hover:text-ggc transition-colors"
                >
                  FAQ
                </a>
              </div>
            )}
          </nav>

          {/* User Account / Auth Actions */}
          <div className="flex items-center gap-2.5">
            {/* Mobile "Kembali ke Halaman Utama" button when not on home */}
            {isNotHome && (
              <Link
                href="/"
                className="md:hidden inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-ggc-subtle border border-gray-200"
                title="Kembali ke Halaman Utama"
              >
                <Home className="w-3.5 h-3.5 text-ggc-gold" />
                <span className="text-[11px]">Beranda</span>
              </Link>
            )}

            {status === "loading" ? (
              <div className="w-24 h-9 bg-ggc-subtle animate-pulse rounded-xl" />
            ) : status === "authenticated" ? (
              <div className="flex items-center gap-3">
                {/* Role Badge & Name */}
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-ggc-dark truncate max-w-[140px]">
                    {session.user?.name || session.user?.email}
                  </span>
                  <div className="flex items-center justify-end gap-1 mt-0.5">
                    {isAdmin ? (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full bg-ggc-gold/20 text-ggc-gold-dark border border-ggc-gold/40">
                        <Shield className="w-2.5 h-2.5" /> Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full bg-ggc/10 text-ggc border border-ggc/20">
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

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/auth/login" })}
                  className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/80 rounded-xl transition-all"
                  title="Keluar dari akun"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="px-3.5 py-2 text-xs font-bold text-gray-700 hover:text-ggc transition-colors"
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
          </div>
        </div>
      </div>
    </header>
  );
}
