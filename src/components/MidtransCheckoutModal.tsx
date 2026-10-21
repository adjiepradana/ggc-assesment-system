"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    setIsLoading(true);

    try {
      const res = await fetch("/api/payment/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          amount: price,
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
          onSuccess: (result: any) => {
            console.log("Midtrans payment success:", result);
            onClose();
            router.push("/auth/verify?payment=success");
          },
          onPending: (result: any) => {
            console.log("Midtrans payment pending:", result);
            onClose();
            router.push("/auth/verify?payment=success");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg bg-white dark:bg-[#07261B] rounded-[2.5rem] shadow-2xl border border-ggc-gold/40 relative overflow-hidden transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Decorative Header */}
        <div className="bg-gradient-to-r from-emerald-luxury via-ggc to-emerald-luxury p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
            aria-label="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>

          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-ggc-gold/20 text-ggc-gold text-[10px] font-bold uppercase tracking-wider border border-ggc-gold/30 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Instant Midtrans Checkout
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Beli Akses Asesmen Resmi
          </h2>
          <p className="text-xs text-ggc-subtle/90 mt-1">
            Dapatkan tiket pengerjaan 84 Butir Soal & Laporan Rekomendasi Jurusan Lengkap.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8">
          {/* Product Summary Pill */}
          <div className="mb-6 p-4 rounded-2xl bg-ggc-tint/60 dark:bg-[#031810]/60 border border-ggc-subtle dark:border-[#0E4230] flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-gray-700 dark:text-gray-200">
                GGC Study Fit Assessment™
              </div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-ggc-gold" />
                <span>84 Butir Multi-Matriks + Rekomendasi PTN/PTS</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-400 line-through">Rp 150.000</span>
              <div className="text-base sm:text-lg font-black text-ggc dark:text-ggc-gold">
                {formattedPrice}
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleCheckout} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Nama Lengkap Siswa *
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Muhammad Kevin"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-[#11402E] dark:bg-[#031810] text-xs focus:ring-2 focus:ring-ggc focus:outline-none dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Alamat Email Aktif *
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email.aktif@gmail.com"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-[#11402E] dark:bg-[#031810] text-xs focus:ring-2 focus:ring-ggc focus:outline-none dark:text-white"
                />
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                * Tautan aktivasi akun dan tiket asesmen akan otomatis dikirimkan ke email ini.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Nomor WhatsApp / HP (Opsional)
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="081234567890"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-[#11402E] dark:bg-[#031810] text-xs focus:ring-2 focus:ring-ggc focus:outline-none dark:text-white"
                />
              </div>
            </div>

            {/* Payment Method Badges */}
            <div className="pt-2">
              <span className="text-[11px] text-gray-500 block mb-1.5 font-medium">
                Metode Pembayaran Resmi via Midtrans:
              </span>
              <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-gray-600 dark:text-gray-400">
                <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-[#031810] border border-gray-200 dark:border-[#11402E]">
                  QRIS (GoPay, OVO, Dana)
                </span>
                <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-[#031810] border border-gray-200 dark:border-[#11402E]">
                  Virtual Account (BCA, Mandiri, BNI, BRI)
                </span>
                <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-[#031810] border border-gray-200 dark:border-[#11402E]">
                  Kartu Kredit / Debit
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-xs sm:text-sm font-black text-ggc-dark bg-gradient-to-r from-[#E6D5A8] via-ggc-gold to-ggc-gold-dark hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 cursor-pointer shadow-md"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-ggc-dark border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 text-ggc-dark" />
                    <span>Bayar {formattedPrice} Sekarang</span>
                    <ArrowRight className="w-4 h-4 text-ggc-dark" />
                  </>
                )}
              </button>
            </div>

            {/* Security badge */}
            <p className="text-[11px] text-gray-400 text-center flex items-center justify-center gap-1 mt-3">
              <Lock className="w-3.5 h-3.5" />
              <span>Enkripsi 256-bit aman via Midtrans Payment Gateway</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
