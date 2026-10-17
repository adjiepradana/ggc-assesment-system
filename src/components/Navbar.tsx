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
} from "lucide-react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const isStudent = session?.user?.role === "STUDENT";
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-ggc-subtle shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <BrandLogo href={isStudent ? "/student/dashboard" : isAdmin ? "/admin/dashboard" : "/"} />

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            {status === "authenticated" && (
              <>
                {isStudent && (
                  <>
                    <Link
                      href="/student/dashboard"
                      className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${
                        pathname === "/student/dashboard"
                          ? "text-ggc font-semibold"
                          : "text-gray-600 hover:text-ggc"
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <Link
                      href="/student/assessment"
                      className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${
                        pathname.startsWith("/student/assessment")
                          ? "text-ggc font-semibold"
                          : "text-gray-600 hover:text-ggc"
                      }`}
                    >
                      <Sparkles className="w-4 h-4 text-ggc-gold" />
                      Mulai Asesmen
                    </Link>
                  </>
                )}

                {isAdmin && (
                  <>
                    <Link
                      href="/admin/dashboard"
                      className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${
                        pathname === "/admin/dashboard"
                          ? "text-ggc font-semibold"
                          : "text-gray-600 hover:text-ggc"
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Admin Dashboard
                    </Link>
                    <Link
                      href="/admin/questions"
                      className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${
                        pathname.startsWith("/admin/questions")
                          ? "text-ggc font-semibold"
                          : "text-gray-600 hover:text-ggc"
                      }`}
                    >
                      <FileQuestion className="w-4 h-4" />
                      Bank Soal (84 Item)
                    </Link>
                    <Link
                      href="/admin/students"
                      className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${
                        pathname.startsWith("/admin/students")
                          ? "text-ggc font-semibold"
                          : "text-gray-600 hover:text-ggc"
                      }`}
                    >
                      <GraduationCap className="w-4 h-4" />
                      Data Siswa
                    </Link>
                  </>
                )}
              </>
            )}

            {status !== "authenticated" && (
              <div className="hidden lg:flex items-center gap-6">
                <a
                  href="#fitur"
                  className="text-sm font-medium text-gray-600 hover:text-ggc transition-colors"
                >
                  Keunggulan
                </a>
                <a
                  href="#metodologi"
                  className="text-sm font-medium text-gray-600 hover:text-ggc transition-colors"
                >
                  7 Dimensi
                </a>
                <a
                  href="#signatures"
                  className="text-sm font-medium text-gray-600 hover:text-ggc transition-colors"
                >
                  Potential Signature
                </a>
                <a
                  href="#alur"
                  className="text-sm font-medium text-gray-600 hover:text-ggc transition-colors"
                >
                  Cara Kerja
                </a>
                <a
                  href="#faq"
                  className="text-sm font-medium text-gray-600 hover:text-ggc transition-colors"
                >
                  FAQ
                </a>
              </div>
            )}
          </nav>

          {/* User Account / Auth Actions */}
          <div className="flex items-center gap-4">
            {status === "loading" ? (
              <div className="w-24 h-8 bg-ggc-subtle animate-pulse rounded-lg" />
            ) : status === "authenticated" ? (
              <div className="flex items-center gap-3">
                {/* Role Badge */}
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-ggc-dark">
                    {session.user?.name || session.user?.email}
                  </span>
                  <div className="flex items-center justify-end gap-1 mt-0.5">
                    {isAdmin ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-ggc-gold/20 text-ggc-gold-dark border border-ggc-gold/40">
                        <Shield className="w-2.5 h-2.5" /> Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-ggc/10 text-ggc border border-ggc/20">
                        <GraduationCap className="w-2.5 h-2.5" /> Student
                      </span>
                    )}
                  </div>
                </div>

                {/* Avatar Icon */}
                <div className="w-9 h-9 rounded-xl bg-ggc-tint border border-ggc/20 flex items-center justify-center text-ggc font-bold shadow-sm">
                  {session.user?.name ? (
                    session.user.name.charAt(0).toUpperCase()
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>

                {/* Logout Button */}
                <button
                  onClick={() => signOut({ callbackUrl: "/auth/login" })}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-all"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-sm font-semibold text-ggc hover:text-ggc-dark transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-ggc hover:bg-ggc-light active:bg-ggc-dark rounded-xl shadow-sm transition-all hover:shadow"
                >
                  Daftar Akun
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
