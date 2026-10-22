"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  X,
  CreditCard,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  User,
  Mail,
  Phone,
  CheckCircle2,
  Lock,
  Compass,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options?: {
          onSuccess?: (result: any) => void;
          onPending?: (result: any) => void;
          onError?: (result: any) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

interface MidtransCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  price?: number;
}

export default function MidtransCheckoutModal({
  isOpen,
  onClose,
  price = 49000,
}: MidtransCheckoutModalProps) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  // Swipe-down-to-dismiss for Mobile Bottom Sheet
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY !== null) {
      const deltaY = e.changedTouches[0].clientY - touchStartY;
      if (deltaY > 65) {
        onClose();
      }
      setTouchStartY(null);
    }
  };

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Dynamically inject Midtrans Snap script when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const snapScriptUrl =
      process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
        ? "https://app.midtrans.com/snap/snap.js"
        : "https://app.sandbox.midtrans.com/snap/snap.js";

    const clientKey =
      process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "SB-Mid-client-your_client_key_here";

    const existingScript = document.getElementById("midtrans-snap-script");

    if (!existingScript) {
      const script = document.createElement("script");
      script.src = snapScriptUrl;
      script.id = "midtrans-snap-script";
      script.setAttribute("data-client-key", clientKey);
      script.async = true;
      document.body.appendChild(script);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formattedPrice = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim()) {
      setError("Nama lengkap dan alamat email wajib diisi.");
      return;
    }

    if (!password || password.length < 6) {
      setError("Kata sandi akun minimal 6 karakter.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/payment/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          phone: phone.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal memproses transaksi checkout.");
      }

      const snapToken = data.snap_token || data.token;

      // 1. If Midtrans Snap is loaded on window
      if (typeof window !== "undefined" && window.snap && snapToken) {
        window.snap.pay(snapToken, {
          onSuccess: async (result: any) => {
            console.log("Midtrans payment success:", result);
            setIsLoading(true);
            try {
              await signIn("credentials", {
                redirect: false,
                email: email.trim(),
                password,
              });
              onClose();
              router.push("/student/dashboard");
              router.refresh();
            } catch (authErr) {
              console.warn("Auto-login error:", authErr);
              onClose();
              router.push("/student/dashboard");
            }
          },
          onPending: async (result: any) => {
            console.log("Midtrans payment pending:", result);
            try {
              await signIn("credentials", {
                redirect: false,
                email: email.trim(),
                password,
              });
            } catch {}
            onClose();
            router.push("/student/dashboard");
          },
          onError: (result: any) => {
            console.error("Midtrans payment error:", result);
            setError("Pembayaran gagal atau dibatalkan oleh gateway.");
            setIsLoading(false);
          },
          onClose: () => {
            console.log("Snap popup closed without finishing payment");
            setIsLoading(false);
          },
        });
      } else if (data.redirect_url) {
        // Fallback: Redirect to Midtrans VTWeb page if popup script wasn't loaded
        window.location.href = data.redirect_url;
      } else {
        throw new Error("Token pembayaran tidak valid.");
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      setError(err.message || "Terjadi kesalahan saat menghubungkan ke Midtrans.");
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-5 md:p-6 bg-black/75 backdrop-blur-sm animate-fade-in transition-opacity"
      style={{ overscrollBehavior: "contain" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="midtrans-checkout-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-xl md:max-w-2xl bg-white dark:bg-[#07261B] rounded-t-[2.5rem] sm:rounded-[2.5rem] rounded-b-none sm:rounded-b-[2.5rem] shadow-2xl border-t-2 sm:border border-ggc-gold/40 relative overflow-hidden transition-all max-h-[90vh] sm:max-h-[92vh] flex flex-col animate-slide-up-sheet sm:animate-scale-in"
        style={{ overscrollBehavior: "contain" }}
      >
        {/* Mobile Drag Indicator Handle */}
        <div
          className="sm:hidden flex flex-col items-center justify-center pt-2 pb-1.5 cursor-grab shrink-0 select-none touch-none bg-gradient-to-r from-emerald-luxury via-ggc to-emerald-luxury"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={onClose}
        >
          <div className="w-12 h-1.5 rounded-full bg-white/40 active:bg-white/60" />
          <span className="text-[9px] font-bold text-white/70 mt-1 uppercase tracking-wider">
            Geser ke bawah untuk menutup
          </span>
        </div>

        {/* Top Decorative Header - Sticky on scroll */}
        <div
          className="bg-gradient-to-r from-emerald-luxury via-ggc to-emerald-luxury p-5 sm:p-7 md:p-8 text-white relative shrink-0"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <button
            onClick={onClose}
            className="absolute top-4 sm:top-5 right-4 sm:right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-ggc-gold/60"
            aria-label="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-ggc-gold/20 text-ggc-gold text-[10px] sm:text-xs font-bold uppercase tracking-wider border border-ggc-gold/30 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Instant Midtrans Checkout
          </span>
          <h2
            id="midtrans-checkout-title"
            className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-tight"
          >
            Beli Akses Asesmen Resmi
          </h2>
          <p className="text-xs sm:text-sm text-ggc-subtle/90 mt-1 max-w-md leading-relaxed">
            Dapatkan tiket pengerjaan 84 Butir Soal & Laporan Rekomendasi Jurusan Lengkap.
          </p>
        </div>

        {/* Scrollable Form Body - Responsive padding */}
        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto flex-1">
          {/* Price Card Summary - Flexible responsive wrap */}
          <div className="mb-4 sm:mb-6 p-3.5 sm:p-5 rounded-2xl bg-[#F4F8F5] dark:bg-[#031810] border border-ggc-subtle dark:border-[#0E4230] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 shadow-2xs">
            <div className="space-y-1">
              <div className="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-100 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-ggc-gold" />
                <span>GGC Study Fit Assessment™</span>
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>84 Butir Multi-Matriks + Rekomendasi PTN/PTS</span>
              </div>
            </div>
            <div className="text-left sm:text-right shrink-0">
              <span className="text-xs sm:text-sm text-gray-400 line-through block">Rp 150.000</span>
              <div className="text-2xl sm:text-3xl font-black text-ggc dark:text-ggc-gold">
                {formattedPrice}
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 sm:mb-5 p-3.5 sm:p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs sm:text-sm flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleCheckout} className="space-y-3.5 sm:space-y-4">
            {/* Input: Nama Lengkap - responsive padding prevents squishing on 360px */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">
                Nama Lengkap Siswa *
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Muhammad Kevin"
                  className="w-full pl-10 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3.5 rounded-xl border border-gray-300 dark:border-[#11402E] bg-gray-50/50 dark:bg-[#031810] text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:bg-white dark:focus:bg-[#02130C] focus:ring-2 focus:ring-ggc focus:border-transparent focus:outline-none transition-all shadow-xs"
                />
              </div>
            </div>

            {/* Input: Alamat Email */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">
                Alamat Email Aktif *
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email.aktif@gmail.com"
                  className="w-full pl-10 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3.5 rounded-xl border border-gray-300 dark:border-[#11402E] bg-gray-50/50 dark:bg-[#031810] text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:bg-white dark:focus:bg-[#02130C] focus:ring-2 focus:ring-ggc focus:border-transparent focus:outline-none transition-all shadow-xs"
                />
              </div>
              <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1">
                * Tautan aktivasi akun dan tiket asesmen akan otomatis dikirimkan ke email ini.
              </p>
            </div>

            {/* Input: Kata Sandi Akun */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">
                Kata Sandi Akun (Password) *
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full pl-10 sm:pl-11 pr-10 sm:pr-11 py-2.5 sm:py-3.5 rounded-xl border border-gray-300 dark:border-[#11402E] bg-gray-50/50 dark:bg-[#031810] text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:bg-white dark:focus:bg-[#02130C] focus:ring-2 focus:ring-ggc focus:border-transparent focus:outline-none transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 sm:pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
                  aria-label="Lihat kata sandi"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1">
                * Gunakan kata sandi ini untuk masuk ke akun dan dashboard asesmen Anda.
              </p>
            </div>

            {/* Input: Nomor WhatsApp / HP */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">
                Nomor WhatsApp / HP (Opsional)
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="081234567890"
                  className="w-full pl-10 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3.5 rounded-xl border border-gray-300 dark:border-[#11402E] bg-gray-50/50 dark:bg-[#031810] text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:bg-white dark:focus:bg-[#02130C] focus:ring-2 focus:ring-ggc focus:border-transparent focus:outline-none transition-all shadow-xs"
                />
              </div>
            </div>

            {/* Payment Method Badges - Wrapping gracefully with flex flex-wrap gap-1.5 sm:gap-2 */}
            <div className="pt-1.5 sm:pt-2">
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 block mb-1.5 sm:mb-2 font-semibold">
                Metode Pembayaran Resmi via Midtrans:
              </span>
              <div className="flex flex-wrap gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-semibold text-gray-700 dark:text-gray-300">
                <span className="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg bg-gray-100 dark:bg-[#031810] border border-gray-200 dark:border-[#11402E] flex items-center gap-1.5 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span>QRIS (GoPay, OVO, Dana)</span>
                </span>
                <span className="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg bg-gray-100 dark:bg-[#031810] border border-gray-200 dark:border-[#11402E] flex items-center gap-1.5 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  <span>Virtual Account (BCA, Mandiri, BNI, BRI)</span>
                </span>
                <span className="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg bg-gray-100 dark:bg-[#031810] border border-gray-200 dark:border-[#11402E] flex items-center gap-1.5 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  <span>Kartu Kredit / Debit</span>
                </span>
              </div>
            </div>

            {/* CTA Submit Button - Full-width, Champagne Gold gradient */}
            <div className="pt-2 sm:pt-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 sm:py-4 px-6 rounded-2xl text-sm sm:text-base font-black text-[#0B4632] bg-gradient-to-r from-[#DFCA95] to-[#C5A869] hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-transform duration-200 disabled:opacity-60 cursor-pointer shadow-md"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-[#0B4632] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 text-[#0B4632]" />
                    <span>Bayar {formattedPrice} Sekarang</span>
                    <ArrowRight className="w-5 h-5 text-[#0B4632]" />
                  </>
                )}
              </button>
            </div>

            {/* Security badge */}
            <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 text-center flex items-center justify-center gap-1.5 mt-3 sm:mt-4 pb-2">
              <Lock className="w-3.5 h-3.5 text-gray-400" />
              <span>Enkripsi 256-bit aman via Midtrans Payment Gateway</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
