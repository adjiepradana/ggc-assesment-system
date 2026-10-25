"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Search,
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Unlock,
  Lock,
  Copy,
  Check,
  Eye,
  X,
  Filter,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
  UserCheck,
  FileText,
} from "lucide-react";

interface OrderUser {
  id: string;
  email: string;
  email_verified: boolean;
  role: string;
  profile?: {
    full_name?: string | null;
    phone_number?: string | null;
    school_name?: string | null;
    grade?: string | null;
  } | null;
}

interface OrderItem {
  id: string;
  order_id: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  amount: number;
  status: "PENDING" | "SUCCESS" | "FAILED" | "EXPIRED";
  snap_token: string | null;
  snap_redirect_url: string | null;
  payment_type: string | null;
  payment_details: any | null;
  created_at: string;
  updated_at: string;
  user: OrderUser | null;
}

interface TransactionStats {
  totalOrders: number;
  successfulOrders: number;
  pendingOrders: number;
  failedOrders: number;
  totalRevenue: number;
}

export default function AdminTransactionsPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [stats, setStats] = useState<TransactionStats>({
    totalOrders: 0,
    successfulOrders: 0,
    pendingOrders: 0,
    failedOrders: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  // Modal Detail State
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);

  // Force Unlock Modal / Action State
  const [unlockTarget, setUnlockTarget] = useState<OrderItem | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToast({ text, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Ensure Admin Role
  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/auth/login");
    } else if (authStatus === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/student/dashboard");
    }
  }, [authStatus, session, router]);

  // Load Transactions from API
  const loadTransactions = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (statusFilter !== "ALL") queryParams.append("status", statusFilter);
      if (searchQuery.trim()) queryParams.append("search", searchQuery.trim());

      const res = await fetch(`/api/admin/transactions?${queryParams.toString()}`);
      const json = await res.json();

      if (json.success) {
        setOrders(json.orders || []);
        if (json.stats) {
          setStats(json.stats);
        }
      } else {
        showToast(json.error || "Gagal memuat daftar transaksi.", "error");
      }
    } catch (err: any) {
      console.error("Error loading transactions:", err);
      showToast("Koneksi gagal saat memuat data transaksi.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authStatus === "authenticated" && session?.user?.role === "ADMIN") {
      loadTransactions();
    }
  }, [statusFilter, authStatus]);

  // Handle Manual Force Unlock
  const handleForceUnlock = async () => {
    if (!unlockTarget) return;

    try {
      setIsUnlocking(true);
      const res = await fetch("/api/admin/force-unlock-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: unlockTarget.user_id,
          orderId: unlockTarget.order_id,
          email: unlockTarget.customer_email,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal membuka akses akun siswa.");
      }

      showToast(json.message || "Akses akun siswa berhasil dibuka!", "success");
      setUnlockTarget(null);

      // Refresh list to reflect updated email_verified status
      loadTransactions();
    } catch (err: any) {
      showToast(err.message || "Terjadi kesalahan saat memproses unlock.", "error");
    } finally {
      setIsUnlocking(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedOrderId(text);
    setTimeout(() => setCopiedOrderId(null), 2500);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
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

  const renderStatusBadge = (status: OrderItem["status"]) => {
    switch (status) {
      case "SUCCESS":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700/60">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>SUCCESS</span>
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700/60">
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-pulse" />
            <span>PENDING</span>
          </span>
        );
      case "FAILED":
      case "EXPIRED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-300 dark:bg-red-950/60 dark:text-red-300 dark:border-red-700/60">
            <XCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
            <span>{status}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-300">
            {status}
          </span>
        );
    }
  };

  const renderPaymentBadge = (method?: string | null) => {
    const cleanMethod = (method || "Gateway Midtrans").toUpperCase();
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#0B4632]/10 text-[#0B4632] border border-[#0B4632]/20 font-mono">
        <CreditCard className="w-3 h-3 text-[#C5A869]" />
        {cleanMethod}
      </span>
    );
  };

  // Filtered orders purely for instant responsive UI matching
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const q = searchQuery.toLowerCase().trim();
    return orders.filter(
      (ord) =>
        ord.order_id.toLowerCase().includes(q) ||
        ord.customer_name.toLowerCase().includes(q) ||
        ord.customer_email.toLowerCase().includes(q) ||
        (ord.customer_phone && ord.customer_phone.includes(q)) ||
        (ord.user?.email && ord.user.email.toLowerCase().includes(q))
    );
  }, [orders, searchQuery]);

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-sm font-semibold transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${
            toast.type === "success"
              ? "bg-[#063424] text-white border-[#C5A869]/50 shadow-emerald-950/30"
              : "bg-red-900 text-white border-red-600 shadow-red-950/30"
          }`}
        >
          {toast.type === "success" ? (
            <Sparkles className="w-4 h-4 text-[#C5A869]" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-300" />
          )}
          <span>{toast.text}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-white/60 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Banner & Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#063424] via-[#0B4632] to-[#042419] p-6 sm:p-8 text-white shadow-xl border border-[#C5A869]/30">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#C5A869]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs border border-white/15 text-[#C5A869] text-xs font-bold uppercase tracking-wider mb-3">
              <CreditCard className="w-3.5 h-3.5 text-[#C5A869]" />
              <span>Payment Gateway Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Manajemen Transaksi Midtrans
            </h1>
            <p className="text-sm text-emerald-100/80 mt-1 max-w-2xl leading-relaxed">
              Monitoring seluruh pesanan tiket asesmen, rekonsiliasi gateway otomatis,
              serta fitur force-unlock untuk memfasilitasi kendala email peserta.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center">
            <button
              type="button"
              onClick={loadTransactions}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs border border-white/20 transition-all duration-200 shadow-sm disabled:opacity-60"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-[#C5A869] ${
                  loading ? "animate-spin" : ""
                }`}
              />
              <span>Refresh Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Omzet */}
        <div className="bg-white dark:bg-[#07261B] rounded-3xl p-5 border border-gray-200/80 dark:border-[#0E4230] shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-[#A0B9AE] uppercase tracking-wider">
              Total Omzet Sukses
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#0B4632]/10 dark:bg-emerald-950/60 text-[#0B4632] dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-[#0B4632] dark:text-emerald-400" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-[#0B4632] dark:text-emerald-400 tracking-tight">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Settlement Real-time Midtrans</span>
            </div>
          </div>
        </div>

        {/* Transaksi Sukses */}
        <div className="bg-white dark:bg-[#07261B] rounded-3xl p-5 border border-gray-200/80 dark:border-[#0E4230] shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-[#A0B9AE] uppercase tracking-wider">
              Transaksi Sukses
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              {stats.successfulOrders}
            </div>
            <div className="text-[11px] text-gray-500 dark:text-[#A0B9AE] mt-1">
              Siswa aktif mendapatkan akses asesmen
            </div>
          </div>
        </div>

        {/* Transaksi Menunggu */}
        <div className="bg-white dark:bg-[#07261B] rounded-3xl p-5 border border-gray-200/80 dark:border-[#0E4230] shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-[#A0B9AE] uppercase tracking-wider">
              Menunggu Pembayaran
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              {stats.pendingOrders}
            </div>
            <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
              Menunggu konfirmasi QRIS / VA
            </div>
          </div>
        </div>

        {/* Total Keseluruhan Pesanan */}
        <div className="bg-white dark:bg-[#07261B] rounded-3xl p-5 border border-gray-200/80 dark:border-[#0E4230] shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-[#A0B9AE] uppercase tracking-wider">
              Total Seluruh Order
            </span>
            <div className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              {stats.totalOrders}
            </div>
            <div className="text-[11px] text-gray-500 dark:text-[#A0B9AE] mt-1">
              Rekap pesanan dibuat sistem
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Status Filters */}
      <div className="bg-white dark:bg-[#07261B] rounded-3xl p-4 sm:p-5 border border-gray-200/80 dark:border-[#0E4230] shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 transition-colors">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari Order ID, Nama, atau Email siswa..."
            className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-gray-50 dark:bg-[#041B12] border border-gray-200 dark:border-[#0E4230] text-xs font-semibold text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-[#031810] focus:outline-none focus:ring-2 focus:ring-[#0B4632] dark:focus:ring-ggc-gold focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-gray-50 dark:bg-[#041B12] p-1.5 rounded-2xl border border-gray-200 dark:border-[#0E4230]">
          {[
            { label: "Semua", value: "ALL" },
            { label: "Sukses", value: "SUCCESS" },
            { label: "Menunggu", value: "PENDING" },
            { label: "Gagal / Expired", value: "FAILED" },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setStatusFilter(item.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === item.value
                  ? "bg-[#0B4632] dark:bg-emerald-700 text-white shadow-xs"
                  : "text-gray-600 dark:text-[#A0B9AE] hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-[#0A3525]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Orders Table */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAFBF9] dark:bg-[#031810]/70 border-b border-gray-200/80 dark:border-[#0E4230] text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-[#A0B9AE]">
                <th className="py-4 px-5">Order ID & Waktu</th>
                <th className="py-4 px-5">Nama & Email Siswa</th>
                <th className="py-4 px-4">Nominal</th>
                <th className="py-4 px-4">Metode Bayar</th>
                <th className="py-4 px-4">Status Transaksi</th>
                <th className="py-4 px-4">Verifikasi Akun</th>
                <th className="py-4 px-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#0E4230] font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-gray-400 dark:text-[#A0B9AE]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-[#0B4632] dark:text-emerald-400" />
                      <span className="font-semibold text-xs">
                        Memuat data transaksi dari database...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-gray-400 dark:text-[#A0B9AE]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <CreditCard className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                      <span className="font-semibold text-sm text-gray-600 dark:text-gray-300">
                        Tidak ada transaksi ditemukan
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500 max-w-sm">
                        Coba sesuaikan kata kunci pencarian atau filter status untuk
                        menemukan pesanan.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const isSuccess = ord.status === "SUCCESS";
                  const isEmailVerified = ord.user?.email_verified === true;
                  const canForceUnlock = isSuccess && !isEmailVerified;

                  return (
                    <tr
                      key={ord.id}
                      className="hover:bg-gray-50/80 dark:hover:bg-[#0B4632]/20 transition-colors group"
                    >
                      {/* Order ID & Created At */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-1.5 font-mono font-bold text-gray-900 dark:text-white">
                          <span>{ord.order_id}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(ord.order_id)}
                            className="p-1 rounded text-gray-400 hover:text-[#0B4632] dark:hover:text-ggc-gold hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                            title="Salin Order ID"
                          >
                            {copiedOrderId === ord.order_id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                          {formatDate(ord.created_at)}
                        </div>
                      </td>

                      {/* Customer Name & Email */}
                      <td className="py-4 px-5">
                        <div className="font-bold text-gray-900 dark:text-white leading-tight">
                          {ord.customer_name ||
                            ord.user?.profile?.full_name ||
                            "Peserta GGC"}
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-[#A0B9AE] font-mono mt-0.5">
                          {ord.customer_email}
                        </div>
                        {ord.customer_phone && (
                          <div className="text-[10px] text-gray-400 dark:text-gray-500">
                            WA: {ord.customer_phone}
                          </div>
                        )}
                      </td>

                      {/* Gross Amount */}
                      <td className="py-4 px-4 font-bold text-[#0B4632] dark:text-emerald-400">
                        {formatCurrency(ord.amount)}
                      </td>

                      {/* Payment Method */}
                      <td className="py-4 px-4">
                        {renderPaymentBadge(ord.payment_type)}
                      </td>

                      {/* Order Status */}
                      <td className="py-4 px-4">{renderStatusBadge(ord.status)}</td>

                      {/* User Verification Gate Status */}
                      <td className="py-4 px-4">
                        {isEmailVerified ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span>Terverifikasi</span>
                          </span>
                        ) : ord.user ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800/60 px-2 py-0.5 rounded-full">
                            <Lock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                            <span>Terkunci (Belum Verif)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-2 py-0.5 rounded-full">
                            <span>Belum Ada Akun</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Force Unlock Button (For SUCCESS orders with locked user status) */}
                          {canForceUnlock && (
                            <button
                              type="button"
                              onClick={() => setUnlockTarget(ord)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#0B4632] hover:bg-[#063424] text-[#C5A869] text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
                              title="Buka akses asesmen secara manual tanpa verifikasi email"
                            >
                              <Unlock className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Force Unlock</span>
                            </button>
                          )}

                          {/* Detail Modal Button */}
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(ord)}
                            className="p-1.5 rounded-xl border border-gray-200 dark:border-[#0E4230] bg-gray-50 dark:bg-[#041B12] hover:bg-gray-100 dark:hover:bg-[#0A3525] text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
                            title="Lihat Detail Transaksi & Payload Midtrans"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Force Unlock Confirmation Modal */}
      {unlockTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-[#07261B] rounded-3xl p-6 shadow-2xl border border-gray-200 dark:border-[#0E4230] transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-[#0E4230]">
              <div className="flex items-center gap-2 text-[#0B4632] dark:text-emerald-400 font-black text-base">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-[#0B4632] dark:text-emerald-400">
                  <Unlock className="w-5 h-5 text-[#C5A869]" />
                </div>
                <span>Konfirmasi Manual Unlock</span>
              </div>
              <button
                onClick={() => setUnlockTarget(null)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#041B12] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs text-gray-600 dark:text-[#A0B9AE]">
              <p>
                Anda akan membuka akses pengerjaan asesmen secara manual untuk siswa
                berikut:
              </p>
              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-[#041B12] border border-gray-200 dark:border-[#0E4230] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-[#A0B9AE]">Nama Siswa:</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {unlockTarget.customer_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-[#A0B9AE]">Email:</span>
                  <span className="font-mono font-bold text-gray-900 dark:text-white">
                    {unlockTarget.customer_email}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-[#A0B9AE]">Order ID:</span>
                  <span className="font-mono text-gray-700 dark:text-gray-300">
                    {unlockTarget.order_id}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/50 p-2.5 rounded-xl leading-relaxed">
                <span className="font-bold">Catatan CS:</span> Tindakan ini akan
                menandai akun <code className="font-bold">email_verified = true</code>{" "}
                sehingga siswa dapat langsung memulai asesmen di dashboard tanpa
                harus menunggu atau mengklik tautan email verifikasi.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUnlockTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#041B12] transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleForceUnlock}
                disabled={isUnlocking}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B4632] hover:bg-[#063424] text-[#C5A869] text-xs font-bold shadow-md transition-all disabled:opacity-50 cursor-pointer"
              >
                {isUnlocking ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Membuka Akses...</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Ya, Buka Akses Sekarang</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Detail & Raw Payload Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#07261B] rounded-3xl p-6 shadow-2xl border border-gray-200 dark:border-[#0E4230] max-h-[90vh] flex flex-col transition-colors">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-[#0E4230] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-[#0B4632]/10 dark:bg-emerald-950/80 text-[#0B4632] dark:text-emerald-400">
                  <CreditCard className="w-5 h-5 text-[#C5A869]" />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 dark:text-white text-base leading-tight">
                    Rincian Order: {selectedOrder.order_id}
                  </h3>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                    ID Database: {selectedOrder.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#041B12] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto py-4 space-y-4 text-xs pr-1">
              {/* Order Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-2xl bg-gray-50 dark:bg-[#041B12] border border-gray-100 dark:border-[#0E4230]">
                  <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500">
                    Status Order
                  </span>
                  <div className="mt-1">{renderStatusBadge(selectedOrder.status)}</div>
                </div>

                <div className="p-3 rounded-2xl bg-gray-50 dark:bg-[#041B12] border border-gray-100 dark:border-[#0E4230]">
                  <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500">
                    Nominal Transaksi
                  </span>
                  <div className="mt-1 font-black text-[#0B4632] dark:text-emerald-400 text-sm">
                    {formatCurrency(selectedOrder.amount)}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-gray-50 dark:bg-[#041B12] border border-gray-100 dark:border-[#0E4230]">
                  <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500">
                    Tipe Pembayaran
                  </span>
                  <div className="mt-1 font-semibold text-gray-800 dark:text-gray-200">
                    {selectedOrder.payment_type || "Midtrans Gateway"}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-gray-50 dark:bg-[#041B12] border border-gray-100 dark:border-[#0E4230]">
                  <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500">
                    Nama Customer
                  </span>
                  <div className="mt-1 font-semibold text-gray-800 dark:text-gray-200 truncate">
                    {selectedOrder.customer_name}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-gray-50 dark:bg-[#041B12] border border-gray-100 dark:border-[#0E4230]">
                  <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500">
                    Email Customer
                  </span>
                  <div className="mt-1 font-mono text-gray-800 dark:text-gray-200 truncate">
                    {selectedOrder.customer_email}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-gray-50 dark:bg-[#041B12] border border-gray-100 dark:border-[#0E4230]">
                  <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500">
                    Waktu Dibuat
                  </span>
                  <div className="mt-1 text-gray-700 dark:text-gray-300">
                    {formatDate(selectedOrder.created_at)}
                  </div>
                </div>
              </div>

              {/* Snap Tokens */}
              {selectedOrder.snap_token && (
                <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300">
                    Midtrans Snap Token:
                  </span>
                  <div className="font-mono text-[11px] text-emerald-900 dark:text-emerald-200 bg-white dark:bg-[#041B12] p-2 rounded-xl border border-emerald-200 dark:border-emerald-800 break-all select-all">
                    {selectedOrder.snap_token}
                  </div>
                </div>
              )}

              {/* Raw JSON Payload from Webhook */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500">
                    Midtrans Notification Payload (Raw JSON):
                  </span>
                  {selectedOrder.payment_details && (
                    <button
                      onClick={() =>
                        copyToClipboard(
                          JSON.stringify(selectedOrder.payment_details, null, 2)
                        )
                      }
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0B4632] dark:text-ggc-gold hover:underline cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Salin JSON</span>
                    </button>
                  )}
                </div>
                <div className="bg-[#042419] dark:bg-[#02140D] text-emerald-200 font-mono text-[11px] p-3.5 rounded-2xl overflow-x-auto max-h-52 border border-emerald-900/60 dark:border-[#0E4230] leading-relaxed">
                  {selectedOrder.payment_details ? (
                    <pre>
                      {JSON.stringify(selectedOrder.payment_details, null, 2)}
                    </pre>
                  ) : (
                    <span className="text-emerald-500/60 italic">
                      Belum ada payload notifikasi webhook yang tersimpan untuk order
                      ini.
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-[#0E4230] flex items-center justify-between shrink-0">
              <span className="text-[11px] text-gray-400 dark:text-gray-500">
                Pembaruan Terakhir: {formatDate(selectedOrder.updated_at)}
              </span>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-[#041B12] hover:bg-gray-200 dark:hover:bg-[#0A3525] text-gray-800 dark:text-gray-200 border border-transparent dark:border-[#0E4230] font-bold text-xs transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
