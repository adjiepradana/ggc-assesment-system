"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";
import {
  Search,
  Mail,
  Receipt,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  CreditCard,
  Lock,
  RefreshCw,
  HelpCircle,
} from "lucide-react";

interface TrackedOrder {
  order_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  amount: number;
  status: "PENDING" | "SUCCESS" | "FAILED" | "EXPIRED";
  payment_type: string | null;
  snap_token: string | null;
  snap_redirect_url: string | null;
  created_at: string;
  updated_at: string;
}

interface TrackedUser {
  email: string;
  email_verified: boolean;
  name: string;
}

interface TrackResult {
  order: TrackedOrder;
  user: TrackedUser | null;
  message: string;
  redirectUrl: string;
}

function TrackOrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [orderId, setOrderId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TrackResult | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState(false);

  // Pre-fill from URL query params if provided
  useEffect(() => {
    const qEmail = searchParams.get("email");
    const qOrderId = searchParams.get("order_id") || searchParams.get("order");
    if (qEmail) setEmail(qEmail);
    if (qOrderId) setOrderId(qOrderId);

    // If both present, auto-trigger check
    if (qEmail && qOrderId) {
      handleSearch(qEmail, qOrderId);
    }
  }, [searchParams]);

  const handleSearch = async (targetEmail: string, targetOrderId: string) => {
    setError(null);
    setResult(null);

    const cleanEmail = targetEmail.trim();
    const cleanOrderId = targetOrderId.trim();

    if (!cleanEmail || !cleanOrderId) {
      setError("Mohon isi alamat email dan Order ID Anda.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch("/api/order/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          order_id: cleanOrderId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Pesanan tidak ditemukan.");
      }

      setResult(data);
    } catch (err: any) {
      console.error("Order tracking error:", err);
      setError(
        err.message || "Terjadi kesalahan saat memeriksa status pesanan."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(email, orderId);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedOrderId(true);
    setTimeout(() => setCopiedOrderId(false), 2000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="w-full max-w-xl relative z-10">
      <div className="bg-white/95 dark:bg-[#06291C]/90 backdrop-blur-md rounded-3xl p-6 sm:p-9 shadow-2xl border border-gray-200/80 dark:border-[#0B4632]/80 transition-all">
        {/* Header & Logo */}
        <div className="text-center mb-7">
          <div className="flex justify-center mb-4">
            <BrandLogo size="md" href="/" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0B4632]/10 dark:bg-emerald-950/60 border border-[#0B4632]/20 dark:border-emerald-700/50 text-[11px] font-bold text-[#0B4632] dark:text-[#C5A869] uppercase tracking-wider mb-2">
            <Receipt className="w-3.5 h-3.5 text-[#C5A869]" />
            <span>Pusat Pelacakan Pesanan</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Lacak Pesanan Anda
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
            Masukkan Email dan Order ID (GGC-...) Anda untuk mengecek status pembayaran dan melanjutkan ke dasbor asesmen.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {error && (
            <div
              className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 flex items-start gap-2.5 text-red-800 dark:text-red-300 text-xs shadow-xs animate-in fade-in"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              <span className="leading-relaxed font-medium">{error}</span>
            </div>
          )}

          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-bold text-gray-800 dark:text-gray-200 mb-1.5"
            >
              Alamat Email Pemesan
            </label>
            <div className="relative rounded-2xl shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="block w-full pl-10 pr-4 py-3 text-sm rounded-2xl border border-gray-200 dark:border-[#11402E] bg-gray-50/70 dark:bg-[#031810] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B4632] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Order ID Input */}
          <div>
            <label
              htmlFor="orderId"
              className="block text-xs font-bold text-gray-800 dark:text-gray-200 mb-1.5"
            >
              Order ID Transaksi
            </label>
            <div className="relative rounded-2xl shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Receipt className="h-4 w-4" />
              </div>
              <input
                id="orderId"
                type="text"
                required
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Contoh: GGC-17297..."
                className="block w-full pl-10 pr-4 py-3 text-sm font-mono rounded-2xl border border-gray-200 dark:border-[#11402E] bg-gray-50/70 dark:bg-[#031810] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B4632] focus:border-transparent transition-all"
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1 pl-1">
              💡 Temukan Order ID pada pop-up Midtrans atau riwayat pembayaran Anda.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-[#0B4632] via-[#156247] to-[#C5A869] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0B4632] shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer pt-3"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-[#F5E8C7]" />
                <span>Memeriksa Status...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4 text-[#F5E8C7]" />
                <span>Cek Status Pesanan</span>
              </>
            )}
          </button>
        </form>

        {/* ================= RESULT AREA ================= */}
        {result && (
          <div className="mt-7 pt-6 border-t border-gray-200 dark:border-[#0B4632]/80 space-y-4 animate-in fade-in duration-300">
            {/* Status Header Badge Card */}
            <div
              className={`p-4 rounded-2xl border flex items-start gap-3 ${
                result.order.status === "SUCCESS"
                  ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700/80 text-emerald-900 dark:text-emerald-200"
                  : result.order.status === "PENDING"
                  ? "bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-700/80 text-amber-900 dark:text-amber-200"
                  : "bg-red-50 dark:bg-red-950/50 border-red-300 dark:border-red-700/80 text-red-900 dark:text-red-200"
              }`}
            >
              {result.order.status === "SUCCESS" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
              ) : result.order.status === "PENDING" ? (
                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0 animate-pulse" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-black text-sm uppercase tracking-wide">
                    {result.order.status === "SUCCESS"
                      ? "Pembayaran Terverifikasi"
                      : result.order.status === "PENDING"
                      ? "Menunggu Pembayaran"
                      : "Pesanan Tidak Berhasil"}
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-white/80 dark:bg-black/30 border border-current">
                    {result.order.status}
                  </span>
                </div>
                <p className="text-xs mt-1 leading-relaxed opacity-90">
                  {result.message}
                </p>
              </div>
            </div>

            {/* Order Details Grid */}
            <div className="p-4 rounded-2xl bg-gray-50/80 dark:bg-[#031810]/70 border border-gray-200/80 dark:border-[#0E4230] space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">Order ID:</span>
                <div className="flex items-center gap-1.5 font-mono font-bold text-gray-900 dark:text-white">
                  <span>{result.order.order_id}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(result.order.order_id)}
                    className="p-1 rounded text-gray-400 hover:text-ggc hover:bg-gray-200 dark:hover:bg-[#07261B] transition-colors"
                    title="Salin Order ID"
                  >
                    {copiedOrderId ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">Nama Pemesan:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {result.order.customer_name}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">Nominal:</span>
                <span className="font-bold text-[#0B4632] dark:text-[#C5A869]">
                  {formatCurrency(result.order.amount)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">Waktu Pemesanan:</span>
                <span className="text-gray-700 dark:text-gray-300">
                  {formatDate(result.order.created_at)}
                </span>
              </div>

              {result.order.payment_type && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Metode Bayar:</span>
                  <span className="font-mono uppercase text-gray-700 dark:text-gray-300">
                    {result.order.payment_type}
                  </span>
                </div>
              )}

              {/* Email Verification Status */}
              <div className="pt-2 border-t border-gray-200/60 dark:border-gray-800 flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">Status Akses:</span>
                {result.user?.email_verified ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Terverifikasi (Siap Asesmen)</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Perlu Verifikasi Email</span>
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons based on Status */}
            <div className="pt-2 space-y-2">
              {result.order.status === "SUCCESS" && (
                <Link
                  href={result.redirectUrl}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-bold text-ggc-dark bg-gradient-to-r from-[#E6D5A8] via-[#C5A869] to-[#9A7D3E] hover:shadow-lg transition-all"
                >
                  <span>Lanjut Masuk ke Akun Anda</span>
                  <ArrowRight className="w-4 h-4 text-ggc-dark" />
                </Link>
              )}

              {result.order.status === "PENDING" && result.order.snap_redirect_url && (
                <a
                  href={result.order.snap_redirect_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-bold text-white bg-[#0B4632] hover:bg-[#063424] transition-all shadow-md"
                >
                  <span>Selesaikan Pembayaran Sekarang</span>
                  <ExternalLink className="w-4 h-4 text-[#C5A869]" />
                </a>
              )}

              {result.order.status === "PENDING" && !result.order.snap_redirect_url && (
                <p className="text-[11px] text-gray-500 dark:text-gray-400 text-center">
                  Silakan selesaikan pembayaran sesuai instruksi QRIS/Virtual Account Anda.
                </p>
              )}

              {(result.order.status === "FAILED" ||
                result.order.status === "EXPIRED") && (
                <Link
                  href="/"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-bold text-white bg-[#0B4632] hover:bg-[#063424] transition-all"
                >
                  <span>Pesan Tiket Asesmen Baru</span>
                  <ArrowRight className="w-4 h-4 text-[#C5A869]" />
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Footer Navigation Links */}
        <div className="mt-8 pt-5 border-t border-gray-100 dark:border-[#0B4632]/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1.5 text-gray-600 dark:text-gray-300 hover:text-[#0B4632] dark:hover:text-[#C5A869] transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Halaman Masuk</span>
          </Link>

          <a
            href="https://wa.me/6281122334455?text=Halo%20Admin%20GGC,%20saya%20butuh%20bantuan%20terkait%20pesanan%20asesmen"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[#0B4632] dark:text-[#C5A869] hover:underline font-semibold"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Butuh Bantuan CS?</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F8F5] dark:bg-[#031810] text-gray-900 dark:text-white p-4 sm:p-6 lg:p-8 relative overflow-hidden selection:bg-ggc selection:text-white">
      {/* Background Decorative Ambient Glows */}
      <div
        className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-[#C5A869]/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-[#0B4632]/15 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <Suspense
        fallback={
          <div className="py-20 flex justify-center items-center">
            <div className="w-8 h-8 border-3 border-[#0B4632] border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <TrackOrderContent />
      </Suspense>
    </div>
  );
}
