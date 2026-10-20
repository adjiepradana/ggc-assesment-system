"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Share2,
  Copy,
  Check,
  Printer,
  Sparkles,
  Award,
  ShieldCheck,
  Download,
  QrCode,
  Smartphone,
  ExternalLink,
} from "lucide-react";
import QRCode from "qrcode";

export interface TopMajorItem {
  majorName: string;
  fitScore: number;
  fitLevel: string;
  cluster?: string;
}

interface ShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  schoolName: string;
  signatureTitle: string;
  signatureArchetype: string;
  topMajors: TopMajorItem[];
  sessionId: string;
}

export default function ShareCardModal({
  isOpen,
  onClose,
  studentName,
  schoolName,
  signatureTitle,
  signatureArchetype,
  topMajors,
  sessionId,
}: ShareCardModalProps) {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [isGeneratingPng, setIsGeneratingPng] = useState(false);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

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

  // Generate QR Code data URL
  useEffect(() => {
    async function generateQR() {
      try {
        const verifyUrl = typeof window !== "undefined"
          ? `${window.location.origin}/student/results/${sessionId}`
          : `https://gogreatcareer.com/student/results/${sessionId}`;

        const url = await QRCode.toDataURL(verifyUrl, {
          width: 320,
          margin: 1,
          color: {
            dark: "#063424",
            light: "#FFFFFF",
          },
        });
        setQrDataUrl(url);
      } catch (err) {
        console.error("Failed to generate QR Code:", err);
      }
    }

    if (sessionId) {
      generateQR();
    }
  }, [sessionId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const top3 = topMajors.slice(0, 3);
  const primaryMajor = top3[0] || { majorName: "Rekomendasi Jurusan", fitScore: 95, fitLevel: "Very Strong Fit" };

  const shareText = `🎓 *Hasil Evaluasi Study Fit Assessment™ (Go Great Career)*
👤 *Nama:* ${studentName} (${schoolName})
🌟 *Potential Signature:* ${signatureTitle}
✨ *Archetype:* "${signatureArchetype}"

🎯 *Top 3 Rekomendasi Jurusan:*
${top3.map((m, i) => `${i + 1}. ${m.majorName} (${m.fitScore}% Fit)`).join("\n")}

🔒 *Verifikasi Dokumen Resmi:* ${typeof window !== "undefined" ? window.location.href : `https://gogreatcareer.com/student/results/${sessionId}`}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  /**
   * Generates a high-definition 1080x1920 (9:16 standard Instagram Story / WhatsApp status) PNG image
   * using off-screen HTML5 Canvas.
   */
  const handleDownloadPng = async () => {
    try {
      setIsGeneratingPng(true);

      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");

      // 1. Background Gradient (Dark Forest Emerald)
      const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1920);
      bgGrad.addColorStop(0, "#031E14");
      bgGrad.addColorStop(0.35, "#063424");
      bgGrad.addColorStop(0.7, "#09432F");
      bgGrad.addColorStop(1, "#02170F");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1080, 1920);

      // Subtle radial light glow
      const radialGlow = ctx.createRadialGradient(540, 500, 50, 540, 500, 600);
      radialGlow.addColorStop(0, "rgba(197, 168, 105, 0.18)");
      radialGlow.addColorStop(1, "rgba(6, 52, 36, 0)");
      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, 1080, 1920);

      // 2. Luxury Outer Frame & Corner Brackets (Champagne Gold)
      ctx.strokeStyle = "#C5A869";
      ctx.lineWidth = 3;
      ctx.strokeRect(40, 40, 1000, 1840);

      ctx.strokeStyle = "rgba(197, 168, 105, 0.4)";
      ctx.lineWidth = 1;
      ctx.strokeRect(52, 52, 976, 1816);

      // Decorative corner brackets
      const drawCornerBracket = (x: number, y: number, dirX: number, dirY: number) => {
        ctx.strokeStyle = "#C5A869";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(x, y + dirY * 40);
        ctx.lineTo(x, y);
        ctx.lineTo(x + dirX * 40, y);
        ctx.stroke();
      };
      drawCornerBracket(40, 40, 1, 1);
      drawCornerBracket(1040, 40, -1, 1);
      drawCornerBracket(40, 1880, 1, -1);
      drawCornerBracket(1040, 1880, -1, -1);

      // 3. Header: Brand & Certified Tag
      ctx.textAlign = "center";
      ctx.fillStyle = "#C5A869";
      ctx.font = "bold 26px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText("GO GREAT CAREER INDONESIA", 540, 130);

      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      ctx.font = "600 20px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText("OFFICIAL STUDY FIT ASSESSMENT™", 540, 165);

      // Horizontal separator with diamond
      ctx.strokeStyle = "rgba(197, 168, 105, 0.4)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(180, 205);
      ctx.lineTo(900, 205);
      ctx.stroke();

      // Diamond ornament
      ctx.fillStyle = "#C5A869";
      ctx.beginPath();
      ctx.moveTo(540, 197);
      ctx.lineTo(548, 205);
      ctx.lineTo(540, 213);
      ctx.lineTo(532, 205);
      ctx.fill();

      // 4. Student Name & School
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "900 52px 'Plus Jakarta Sans', sans-serif";
      // Text wrap or ellipsis if long
      const displayName = studentName.length > 28 ? studentName.slice(0, 26) + "..." : studentName;
      ctx.fillText(displayName, 540, 290);

      ctx.fillStyle = "#C5A869";
      ctx.font = "600 26px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText(schoolName, 540, 335);

      // 5. Potential Signature Hero Card
      const sigCardY = 380;
      ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
      ctx.beginPath();
      ctx.roundRect(90, sigCardY, 900, 320, 24);
      ctx.fill();
      ctx.strokeStyle = "rgba(197, 168, 105, 0.6)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Badge in signature card
      ctx.fillStyle = "rgba(197, 168, 105, 0.25)";
      ctx.beginPath();
      ctx.roundRect(330, sigCardY + 25, 420, 42, 21);
      ctx.fill();
      ctx.fillStyle = "#E6D5A8";
      ctx.font = "bold 18px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText("PRIMARY POTENTIAL SIGNATURE", 540, sigCardY + 52);

      // Signature Title
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "900 42px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText(signatureTitle, 540, sigCardY + 130);

      // Archetype quote
      ctx.fillStyle = "#C5A869";
      ctx.font = "italic 600 26px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText(`“${signatureArchetype}”`, 540, sigCardY + 185);

      // Star decoration
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.font = "20px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText("★  ★  ★  ★  ★", 540, sigCardY + 240);

      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.font = "18px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText("Refleksi Talenta & Pola Pikir Alami", 540, sigCardY + 280);

      // 6. Top 3 Majors Section
      const majorsY = 740;
      ctx.fillStyle = "#E6D5A8";
      ctx.font = "bold 24px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText("TOP 3 REKOMENDASI PROGRAM STUDI", 540, majorsY);

      let curY = majorsY + 35;
      top3.forEach((m, idx) => {
        const isTop = idx === 0;
        const boxH = isTop ? 140 : 120;

        ctx.fillStyle = isTop ? "rgba(197, 168, 105, 0.15)" : "rgba(255, 255, 255, 0.04)";
        ctx.beginPath();
        ctx.roundRect(90, curY, 900, boxH, 20);
        ctx.fill();

        ctx.strokeStyle = isTop ? "#C5A869" : "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = isTop ? 2.5 : 1.5;
        ctx.stroke();

        // Rank Circle
        ctx.fillStyle = isTop ? "#C5A869" : "rgba(255, 255, 255, 0.2)";
        ctx.beginPath();
        ctx.arc(150, curY + boxH / 2, 28, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = isTop ? "#063424" : "#FFFFFF";
        ctx.font = "900 24px 'Plus Jakarta Sans', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`#${idx + 1}`, 150, curY + boxH / 2 + 8);

        // Major Name & Level
        ctx.textAlign = "left";
        ctx.fillStyle = "#FFFFFF";
        ctx.font = isTop ? "900 28px 'Plus Jakarta Sans', sans-serif" : "bold 26px 'Plus Jakarta Sans', sans-serif";
        const trimmedMajorName = m.majorName.length > 32 ? m.majorName.slice(0, 30) + "..." : m.majorName;
        ctx.fillText(trimmedMajorName, 200, curY + (isTop ? 55 : 50));

        ctx.fillStyle = isTop ? "#E6D5A8" : "rgba(255, 255, 255, 0.65)";
        ctx.font = "600 20px 'Plus Jakarta Sans', sans-serif";
        ctx.fillText(m.fitLevel || "Kecocokan Tinggi", 200, curY + (isTop ? 95 : 88));

        // Score Badge on Right
        ctx.textAlign = "right";
        ctx.fillStyle = isTop ? "#C5A869" : "#FFFFFF";
        ctx.font = "900 44px 'Plus Jakarta Sans', sans-serif";
        ctx.fillText(`${m.fitScore}%`, 940, curY + (isTop ? 65 : 60));

        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.font = "600 16px 'Plus Jakarta Sans', sans-serif";
        ctx.fillText("STUDY FIT", 940, curY + (isTop ? 95 : 88));

        curY += boxH + 20;
      });

      // 7. Official Verification Box with Real QR Code
      const qrBoxY = 1380;
      ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
      ctx.beginPath();
      ctx.roundRect(90, qrBoxY, 900, 340, 24);
      ctx.fill();
      ctx.strokeStyle = "rgba(197, 168, 105, 0.5)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // If QR code is generated, draw QR on canvas
      if (qrDataUrl) {
        await new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            // Draw white background for QR
            ctx.fillStyle = "#FFFFFF";
            ctx.beginPath();
            ctx.roundRect(140, qrBoxY + 35, 270, 270, 16);
            ctx.fill();

            // Draw QR image
            ctx.drawImage(img, 150, qrBoxY + 45, 250, 250);
            resolve();
          };
          img.onerror = () => resolve();
          img.src = qrDataUrl;
        });
      }

      // Verification text on right side of QR
      ctx.textAlign = "left";
      ctx.fillStyle = "#C5A869";
      ctx.font = "bold 22px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText("VERIFIKASI RESMI TERDAFTAR", 450, qrBoxY + 80);

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "900 28px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText("Valid & Authenticated", 450, qrBoxY + 120);

      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      ctx.font = "500 20px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText("Pindai QR code dengan kamera", 450, qrBoxY + 165);
      ctx.fillText("smartphone untuk memvalidasi laporan", 450, qrBoxY + 195);
      ctx.fillText("asesmen di portal resmi GGC.", 450, qrBoxY + 225);

      ctx.fillStyle = "#E6D5A8";
      ctx.font = "bold 18px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText(`ID Sesi: GGC-${sessionId.slice(0, 8).toUpperCase()}-2026`, 450, qrBoxY + 275);

      // 8. Footer Watermark
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(197, 168, 105, 0.7)";
      ctx.font = "bold 18px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText(
        `Hak Cipta © ${new Date().getFullYear()} Go Great Career • www.gogreatcareer.com`,
        540,
        1790
      );

      // Trigger Download
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      const safeName = studentName.replace(/[^a-zA-Z0-9]/g, "_");
      a.download = `GGC-Persona-Story-${safeName}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("Failed to generate image:", err);
      alert("Gagal mengunduh gambar persona. Silakan coba kembali.");
    } finally {
      setIsGeneratingPng(false);
    }
  };

  return (
    <div
      className="no-print fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
      style={{ overscrollBehavior: "contain" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white rounded-t-[2.5rem] sm:rounded-3xl max-w-xl w-full p-4 pb-safe sm:p-6 shadow-2xl border-t-2 sm:border border-ggc-gold/40 flex flex-col max-h-[90vh] sm:max-h-[95vh] overflow-hidden animate-slide-up-sheet sm:animate-scale-in"
        style={{ overscrollBehavior: "contain" }}
      >
        {/* Mobile Drag Indicator Handle */}
        <div
          className="sm:hidden flex flex-col items-center justify-center pt-1 pb-2 cursor-grab shrink-0 select-none touch-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={onClose}
        >
          <div className="w-12 h-1.5 rounded-full bg-gray-300 active:bg-gray-400" />
          <span className="text-[10px] font-semibold text-gray-400 mt-1 uppercase tracking-wider">
            Geser ke bawah untuk menutup
          </span>
        </div>

        {/* Header */}
        <div
          className="flex items-center justify-between pb-3 border-b border-gray-100 shrink-0"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-ggc" />
            <div>
              <h2 id="share-modal-title" className="text-base font-black text-ggc-dark">
                Bagikan Persona Studi Siswa
              </h2>
              <p className="text-[11px] text-gray-500">
                Kartu visual estetik format 9:16 untuk Instagram Story & WhatsApp
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors"
            aria-label="Tutup dialog bagikan"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Story Card Live Preview (Aspect 9:16) */}
        <div className="flex-1 overflow-y-auto py-3 px-1" style={{ overscrollBehavior: "contain" }}>
          <div
            ref={cardRef}
            className="relative mx-auto rounded-3xl p-5 sm:p-6 text-white text-center shadow-2xl border-2 border-ggc-gold/70 overflow-hidden bg-gradient-to-b from-[#031E14] via-[#063424] to-[#02170F] max-w-[340px] sm:max-w-[350px] aspect-[9/16] flex flex-col justify-between"
          >
            {/* Background Ornaments */}
            <div className="absolute inset-0 bg-dot-grid opacity-30 pointer-events-none" aria-hidden="true" />
            <div className="absolute -top-16 -right-16 w-40 h-40 bg-ggc-gold/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-emerald-400/15 rounded-full blur-2xl pointer-events-none" />

            {/* Corner Luxury Brackets */}
            <div className="absolute top-2.5 left-2.5 w-4 h-4 border-t-2 border-l-2 border-ggc-gold/70 rounded-tl-sm pointer-events-none" />
            <div className="absolute top-2.5 right-2.5 w-4 h-4 border-t-2 border-r-2 border-ggc-gold/70 rounded-tr-sm pointer-events-none" />
            <div className="absolute bottom-2.5 left-2.5 w-4 h-4 border-b-2 border-l-2 border-ggc-gold/70 rounded-bl-sm pointer-events-none" />
            <div className="absolute bottom-2.5 right-2.5 w-4 h-4 border-b-2 border-r-2 border-ggc-gold/70 rounded-br-sm pointer-events-none" />

            {/* Content Top */}
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <img src="/logo.png" alt="" className="w-5 h-5 object-contain bg-white rounded-md p-0.5" />
                <span className="text-[9px] font-black tracking-[0.2em] uppercase text-ggc-gold">
                  GO GREAT CAREER
                </span>
              </div>
              <p className="text-[8px] font-semibold tracking-wider uppercase text-white/60 mb-2">
                OFFICIAL STUDY FIT ASSESSMENT™
              </p>

              {/* Student Name */}
              <h3 className="text-base sm:text-lg font-black text-white leading-tight line-clamp-1">
                {studentName}
              </h3>
              <p className="text-[10px] text-ggc-gold/90 font-medium truncate">{schoolName}</p>

              {/* Potential Signature Box */}
              <div className="mt-3 p-3 rounded-2xl bg-white/[0.08] border border-ggc-gold/50 backdrop-blur-xs">
                <span className="inline-block px-2 py-0.5 rounded-full bg-ggc-gold/25 text-ggc-gold text-[8px] font-extrabold uppercase tracking-wider mb-1">
                  Potential Signature
                </span>
                <p className="text-xs sm:text-sm font-black gold-gradient-text leading-tight">
                  {signatureTitle}
                </p>
                <p className="text-[10px] text-white/90 italic mt-0.5">
                  &ldquo;{signatureArchetype}&rdquo;
                </p>
              </div>
            </div>

            {/* Content Middle: Top 3 Majors */}
            <div className="relative z-10 my-2 space-y-1.5 text-left">
              <div className="text-center mb-1">
                <span className="text-[9px] font-extrabold tracking-wider uppercase text-ggc-gold">
                  Top 3 Rekomendasi Jurusan
                </span>
              </div>

              {top3.map((m, idx) => {
                const isTop = idx === 0;
                return (
                  <div
                    key={m.majorName}
                    className={`p-2 rounded-xl border flex items-center justify-between gap-2 ${
                      isTop
                        ? "bg-ggc-gold/15 border-ggc-gold/60"
                        : "bg-white/[0.04] border-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 ${
                          isTop ? "bg-ggc-gold text-ggc-dark" : "bg-white/10 text-white"
                        }`}
                      >
                        #{idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-white truncate">{m.majorName}</p>
                        <p className="text-[9px] text-ggc-subtle/70 truncate">{m.fitLevel}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-xs font-black ${isTop ? "text-ggc-gold" : "text-white"}`}>
                        {m.fitScore}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Content Bottom: Verification & QR */}
            <div className="relative z-10 pt-2 border-t border-white/15">
              <div className="flex items-center justify-center gap-3">
                {qrDataUrl && (
                  <div className="bg-white p-1 rounded-lg shrink-0 shadow">
                    <img src={qrDataUrl} alt="QR Code Verifikasi" className="w-12 h-12 object-contain" />
                  </div>
                )}
                <div className="text-left text-[9px] text-white/80">
                  <span className="inline-flex items-center gap-1 text-[8px] font-bold text-ggc-gold uppercase">
                    <ShieldCheck className="w-2.5 h-2.5" /> Terverifikasi Resmi
                  </span>
                  <p className="leading-tight text-white/90 font-medium">Pindai QR untuk cek keaslian</p>
                  <p className="text-[8px] text-ggc-subtle/50 font-mono mt-0.5">
                    GGC-{(sessionId || "SESI").slice(0, 8).toUpperCase()}-2026
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-3 border-t border-gray-100 flex flex-col gap-2 shrink-0">
          {/* Main Action: Download PNG */}
          <button
            type="button"
            onClick={handleDownloadPng}
            disabled={isGeneratingPng}
            className="w-full py-3 px-4 rounded-xl text-xs font-black text-ggc-dark bg-gradient-to-r from-[#E6D5A8] via-ggc-gold to-ggc-gold-dark hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            {isGeneratingPng ? (
              <div className="w-4 h-4 border-2 border-ggc-dark border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-4 h-4 text-ggc-dark" />
            )}
            <span>
              {isGeneratingPng
                ? "Menyiapkan Gambar Resolusi Tinggi (1080x1920)..."
                : "Unduh Gambar PNG (Format Story 9:16)"}
            </span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="py-2.5 px-3 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all flex items-center justify-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Teks Disalin!" : "Salin Teks Ringkasan"}</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="py-2.5 px-3 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all flex items-center justify-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-gray-500" />
              <span>Cetak Laporan PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
