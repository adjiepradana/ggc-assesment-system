"use client";

import React, { useState } from "react";
import { Mail, RefreshCw } from "lucide-react";

export default function ResendVerificationButton({ email }: { email: string }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleResend = async () => {
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal mengirim ulang email verifikasi.");
      }

      setSuccess(data.message || "Email verifikasi baru berhasil dikirimkan!");
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
      <button
        type="button"
        onClick={handleResend}
        disabled={loading}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-900 bg-amber-200/90 hover:bg-amber-300 dark:bg-amber-900/60 dark:text-amber-200 transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
      >
        {loading ? (
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Mail className="w-3.5 h-3.5" />
        )}
        <span>{loading ? "Mengirim..." : "Kirim Ulang Email Verifikasi"}</span>
      </button>
      {success && (
        <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
          {success}
        </span>
      )}
      {error && (
        <span className="text-[11px] text-red-600 dark:text-red-400 font-medium">
          {error}
        </span>
      )}
    </div>
  );
}
