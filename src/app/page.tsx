"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import BrandLogo from "@/components/BrandLogo";
import InteractiveRadarChart, { RadarDataPoint } from "@/components/InteractiveRadarChart";
import InteractiveMiniAssessment from "@/components/InteractiveMiniAssessment";
import SpotlightCard from "@/components/SpotlightCard";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Compass,
  Award,
  Layers,
  GraduationCap,
  CheckCircle2,
  Brain,
  Target,
  UserCheck,
  Heart,
  BookOpen,
  Briefcase,
  Flame,
  FileText,
  ChevronDown,
  ChevronUp,
  Download,
  Shuffle,
  BarChart3,
  Check,
  Clock,
  Users,
  Zap,
  TrendingUp,
} from "lucide-react";

export default function HomePage() {
  // Hero interactive preview switcher: "simulation" | "try"
  const [heroTab, setHeroTab] = useState<"simulation" | "try">("simulation");

  // Potential Signature showcase active index
  const [activeSignatureIndex, setActiveSignatureIndex] = useState(0);

  // Active Dimension category preview (0-6)
  const [activeDimCode, setActiveDimCode] = useState<string>("T");

  // FAQ Accordion active index
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Parallax scroll state
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const signatureProfiles: Array<{
    id: string;
    title: string;
    archetype: string;
    badge: string;
    tagline: string;
    traits: string[];
    matchedMajors: Array<{ name: string; fit: string }>;
    quote: string;
    radarData: RadarDataPoint[];
  }> = [
    {
      id: "analytical-strategist",
      title: "The Analytical Strategist",
      archetype: "The Systems Architect & Data Thinker",
      badge: "Kombinasi Logika & Rekayasa",
      tagline: "Ahli membedah sistem rumit dan memformulasikan strategi berbasis data presisi.",
      traits: ["Logika Analitikal", "Pemecahan Masalah Sistem", "Pola Berpikir Kritis"],
      matchedMajors: [
        { name: "Teknik Informatika & Artificial Intelligence", fit: "96% • Sangat Cocok" },
        { name: "Sains Data (Data Science)", fit: "94% • Sangat Cocok" },
        { name: "Teknik Industri & Sistem Rekayasa", fit: "89% • Cocok" },
      ],
      quote:
        "Profil ini menunjukkan daya kognitif analitis tinggi dengan fokus detail tajam. Sangat optimal pada bidang yang menuntut konstruksi logika terstruktur dan rekayasa komputasi mutakhir.",
      radarData: [
        { axis: "Logika Analitikal", shortName: "Logika", value: 96 },
        { axis: "Penalaran Spasial", shortName: "Spasial", value: 78 },
        { axis: "Kecerdasan Verbal", shortName: "Verbal", value: 72 },
        { axis: "Pemecahan Sistem", shortName: "Sistem", value: 94 },
        { axis: "Sensitivitas Estetika", shortName: "Estetika", value: 58 },
        { axis: "Intuisi Sosial", shortName: "Sosial", value: 65 },
      ],
    },
    {
      id: "visionary-creator",
      title: "The Visionary Creator",
      archetype: "The Conceptual Innovator & Aesthetic Designer",
      badge: "Kombinasi Seni & Desain Orisinal",
      tagline: "Memiliki kepekaan estetika tinggi dan dorongan tiada henti melahirkan terobosan visual.",
      traits: ["Kreativitas Orisinal", "Sensitivitas Estetika", "Keterbukaan Pengalaman"],
      matchedMajors: [
        { name: "Desain Komunikasi Visual (DKV)", fit: "97% • Sangat Cocok" },
        { name: "Arsitektur & Perancangan Ruang", fit: "92% • Sangat Cocok" },
        { name: "Desain Produk & Multimedia Interaktif", fit: "88% • Cocok" },
      ],
      quote:
        "Mahasiswa dengan profil ini unggul dalam mengawinkan gagasan visual yang kuat dengan fungsi praktis, menjadikannya talenta ideal di industri kreatif dan desain masa depan.",
      radarData: [
        { axis: "Logika Analitikal", shortName: "Logika", value: 70 },
        { axis: "Penalaran Spasial", shortName: "Spasial", value: 92 },
        { axis: "Kecerdasan Verbal", shortName: "Verbal", value: 82 },
        { axis: "Pemecahan Sistem", shortName: "Sistem", value: 66 },
        { axis: "Sensitivitas Estetika", shortName: "Estetika", value: 98 },
        { axis: "Intuisi Sosial", shortName: "Sosial", value: 76 },
      ],
    },
    {
      id: "human-centric-leader",
      title: "The Human-Centric Leader",
      archetype: "The Empathic Facilitator & Diplomat",
      badge: "Kombinasi Sosial & Komunikasi",
      tagline: "Menavigasi dinamika kelompok dengan empati mendalam, diplomasi persuasif, dan integritas tinggi.",
      traits: ["Intuisi Sosial", "Keramahan (Agreeableness)", "Kecerdasan Verbal"],
      matchedMajors: [
        { name: "Psikologi & Konseling Pendidikan", fit: "95% • Sangat Cocok" },
        { name: "Hubungan Internasional & Diplomasi", fit: "91% • Sangat Cocok" },
        { name: "Manajemen Sumber Daya Manusia (HR)", fit: "87% • Cocok" },
      ],
      quote:
        "Memiliki radar sosial luar biasa dalam memahami motif emosional orang lain. Mampu memimpin dialog konstruktif dan membangun konsensus di situasi paling rumit.",
      radarData: [
        { axis: "Logika Analitikal", shortName: "Logika", value: 72 },
        { axis: "Penalaran Spasial", shortName: "Spasial", value: 60 },
        { axis: "Kecerdasan Verbal", shortName: "Verbal", value: 96 },
        { axis: "Pemecahan Sistem", shortName: "Sistem", value: 68 },
        { axis: "Sensitivitas Estetika", shortName: "Estetika", value: 76 },
        { axis: "Intuisi Sosial", shortName: "Sosial", value: 97 },
      ],
    },
    {
      id: "enterprising-innovator",
      title: "The Enterprising Innovator",
      archetype: "The Growth Driver & Venture Builder",
      badge: "Kombinasi Bisnis & Eksekusi",
      tagline: "Melihat peluang bisnis sebelum orang lain menyadarinya dan pantang mundur menghadapi rintangan.",
      traits: ["Bisnis & Kewirausahaan", "Kepemimpinan Alami", "Ketahanan (Grit)"],
      matchedMajors: [
        { name: "Manajemen Bisnis & Kewirausahaan", fit: "96% • Sangat Cocok" },
        { name: "Finansial, Investasi & Perbankan", fit: "93% • Sangat Cocok" },
        { name: "Pemasaran Digital & E-Commerce", fit: "89% • Cocok" },
      ],
      quote:
        "Didorong oleh jiwa kepemimpinan alami dan resiliensi tinggi. Sangat tangguh dalam merintis usaha rintisan, mengelola tim, dan mengeksekusi strategi komersial berisiko terukur.",
      radarData: [
        { axis: "Logika Analitikal", shortName: "Logika", value: 86 },
        { axis: "Penalaran Spasial", shortName: "Spasial", value: 70 },
        { axis: "Kecerdasan Verbal", shortName: "Verbal", value: 89 },
        { axis: "Pemecahan Sistem", shortName: "Sistem", value: 83 },
        { axis: "Sensitivitas Estetika", shortName: "Estetika", value: 72 },
        { axis: "Intuisi Sosial", shortName: "Sosial", value: 90 },
      ],
    },
  ];

  const dimensions = [
    {
      code: "T",
      name: "Talent (Bakat Kognitif)",
      count: "12 Butir",
      icon: Brain,
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
      desc: "Mengukur potensi kecerdasan alami seperti logika analitikal, spasial 3D, verbal persuasif, hingga memori konseptual.",
      samples: ["Logika Analitikal", "Penalaran Spasial", "Kecerdasan Verbal", "Pemecahan Sistem"],
      sampleQuestion:
        "Saya dengan cepat mampu menangkap pola sebab-akibat dalam data angka atau grafik rumit.",
    },
    {
      code: "I",
      name: "Interest (Minat Karier)",
      count: "12 Butir",
      icon: Target,
      color: "text-amber-700 bg-amber-50 border-amber-200",
      desc: "Menjelajahi ketertarikan autentik pada ranah sains, teknologi, multimedia, bisnis, medis, hukum, dan psikologi.",
      samples: ["Teknologi Komputasi", "Sains Laboratorium", "Bisnis & Startup", "Psikologi & Konseling"],
      sampleQuestion:
        "Saya antusias belajar bahasa pemrograman, kecerdasan buatan, atau pengembangan aplikasi perangkat lunak.",
    },
    {
      code: "P",
      name: "Personality (Gaya Kerja)",
      count: "12 Butir",
      icon: UserCheck,
      color: "text-blue-700 bg-blue-50 border-blue-200",
      desc: "Memotret gaya kerja, keteraturan jadwal, ekstroversi, stabilitas emosional, kemandirian kerja, dan grit.",
      samples: ["Conscientiousness", "Keterbukaan Ide", "Ketahanan (Grit)", "Stabilitas Emosional"],
      sampleQuestion:
        "Saya tidak mudah menyerah meskipun menghadapi kegagalan berulang kali dalam proyek yang sulit.",
    },
    {
      code: "V",
      name: "Values (Nilai Pribadi)",
      count: "12 Butir",
      icon: Heart,
      color: "text-rose-700 bg-rose-50 border-rose-200",
      desc: "Prinsip etika mendasar yang menggerakkan motivasi Anda, mulai dari integritas, altruisme, otonomi, hingga pengaruh sosial.",
      samples: ["Integritas Moral", "Altruisme & Dampak", "Otonomi Kerja", "Prestasi Unggul"],
      sampleQuestion:
        "Saya menolak berkompromi terhadap kejujuran dan etika moral, apapun imbalan materinya.",
    },
    {
      code: "A",
      name: "Academic (Kesiapan Akademik)",
      count: "12 Butir",
      icon: BookOpen,
      color: "text-indigo-700 bg-indigo-50 border-indigo-200",
      desc: "Kesesuaian kurikulum dan rumpun mata pelajaran: Saintek, Soshum, Bisnis Manajemen, atau Seni & Desain.",
      samples: ["Matematika Lanjut", "Kajian Sosio-Politik", "Analisis Finansial", "Estetika Desain"],
      sampleQuestion:
        "Saya menikmati membaca jurnal ilmiah atau telaah riset untuk memperdalam materi kuliah lanjutan.",
    },
    {
      code: "C",
      name: "Career (Arah Profesional)",
      count: "12 Butir",
      icon: Briefcase,
      color: "text-amber-800 bg-amber-50/80 border-amber-200",
      desc: "Aspirasi peran profesional masa depan: Spesialis Riset, Pemimpin Eksekutif, Konsultan Ahli, atau Wirausahawan.",
      samples: ["Peran Peneliti / Ahli", "Kepemimpinan Korporat", "Kreator Konten / Produk", "Praktisi Medis"],
      sampleQuestion:
        "Saya memproyeksikan diri saya memimpin proyek transformasi digital atau korporasi skala nasional.",
    },
    {
      code: "R",
      name: "Readiness (Kesiapan Mental)",
      count: "12 Butir",
      icon: Flame,
      color: "text-red-700 bg-red-50 border-red-200",
      desc: "Tingkat kemandirian, resiliensi terhadap beban studi perguruan tinggi, dan kesiapan hidup mandiri saat kuliah.",
      samples: ["Manajemen Beban Tugas", "Kemandirian Belajar", "Daya Adaptasi Sosial", "Regulasi Stres"],
      sampleQuestion:
        "Saya siap mengelola waktu dan keuangan pribadi secara mandiri tanpa harus selalu diarahkan orang tua.",
    },
  ];

  const activeDimension = dimensions.find((d) => d.code === activeDimCode) || dimensions[0];

  const faqs = [
    {
      q: "Berapa lama waktu yang dibutuhkan untuk menyelesaikan asesmen?",
      a: "Asesmen terdiri dari 84 butir soal pilihan Skala Likert (1 sampai 5) yang dirancang intuitif. Rata-rata siswa menyelesaikannya dalam kurun waktu 15 hingga 20 menit. Seluruh jawaban tersimpan otomatis secara realtime.",
    },
    {
      q: "Apakah ada jawaban 'benar' atau 'salah' dalam tes ini?",
      a: "Sama sekali tidak ada jawaban benar atau salah. Seluruh instrumen dirancang untuk memetakan keaslian bakat kognitif, preferensi kerja, nilai hidup, dan minat karier Anda agar pencocokan program studi akurat dan objektif.",
    },
    {
      q: "Bagaimana cara kerja algoritma Multi-Matrix Scoring?",
      a: "Sistem menghitung matriks Person Profile (skor talenta, minat, dan kepribadian siswa) lalu mencocokkannya dengan bobot matriks Study Profile dari puluhan program studi perguruan tinggi. Hasilnya adalah persentase kecocokan ilmiah dan identifikasi 3 Potential Signature terkuat Anda.",
    },
    {
      q: "Apakah hasil asesmen bisa diunduh dalam format PDF resmi?",
      a: "Ya! Setelah menyelesaikan seluruh butir instrumen, Anda dapat langsung melihat dashboard analitik interaktif sekaligus mengunduh dokumen Laporan PDF Resmi 2 Halaman lengkap dengan kop resmi Go Great Career™ untuk didiskusikan bersama orang tua dan guru BK.",
    },
    {
      q: "Apakah sekolah atau institusi bisa menggunakan sistem ini secara kolektif?",
      a: "Tentu saja. GGC Study Fit Assessment™ dilengkapi dengan portal Administrator yang memungkinkan konselor sekolah melihat rekapitulasi data siswa, memantau kemajuan pengerjaan, dan mengekspor rekap hasil ke format Excel (.xlsx).",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFBF9] text-gray-900 overflow-x-hidden selection:bg-ggc selection:text-white">
      <Navbar />

      {/* ================= HERO SECTION WITH INTERACTIVE RADAR & MINI SIMULATOR ================= */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 bg-gradient-to-b from-white via-ggc-tint/60 to-[#FAFBF9] parallax-hero-wrapper">
        {/* Layer 0: Background Ambient Glow & Geometric Dot Pattern */}
        <div
          className="absolute inset-0 bg-[radial-gradient(#0B4632_1.2px,transparent_1.2px)] [background-size:28px_28px] opacity-[0.035] pointer-events-none"
          aria-hidden="true"
        />

        {/* Layer 1: Parallax Soft Orbs with fallback */}
        <div
          className="absolute -top-32 -left-32 w-[520px] h-[520px] bg-ggc/10 rounded-full blur-3xl pointer-events-none parallax-layer-back"
          style={{ transform: `translateY(${scrollY * 0.12}px)` }}
          aria-hidden="true"
        />
        <div
          className="absolute top-1/4 -right-28 w-[480px] h-[480px] bg-ggc-gold/15 rounded-full blur-3xl pointer-events-none parallax-layer-back"
          style={{ transform: `translateY(${scrollY * -0.15}px)` }}
          aria-hidden="true"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Headline, Description & CTAs */}
            <div className="lg:col-span-7 text-center lg:text-left">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-ggc/20 text-ggc text-xs sm:text-sm font-semibold shadow-sm mb-6 animate-float-slow">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-gray-700">Official Psychometric Engine</span>
                <span className="text-ggc-gold-dark font-bold">• 84-Item Multi-Matrix</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-ggc-dark tracking-tight leading-[1.14]">
                Discover Your Potential.{" "}
                <span className="gold-gradient-text block mt-1.5">
                  Find Your Direction.
                </span>
              </h1>

              {/* Tagline / Subtitle */}
              <p className="mt-6 text-base sm:text-lg lg:text-xl text-gray-700 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                <strong>Go Great Career (GGC) Study Fit Assessment™</strong> adalah platform evaluasi holistik 84 butir terstandarisasi untuk memetakan bakat kognitif, minat karier, karakteristik kepribadian, hingga kesiapan kuliah secara ilmiah dan bebas bias.
              </p>

              {/* Primary & Secondary Action CTAs */}
              <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  href="/auth/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-white bg-ggc hover:bg-ggc-light active:bg-ggc-dark shadow-lg shadow-ggc/25 hover:shadow-xl hover:shadow-ggc/30 transition-all duration-200 group text-sm sm:text-base ring-offset-2 hover:ring-2 hover:ring-ggc"
                >
                  <span>Mulai Asesmen Sekarang</span>
                  <ArrowRight className="w-5 h-5 text-ggc-gold transition-transform duration-200 group-hover:translate-x-1" />
                </Link>

                <a
                  href="#fitur"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl font-bold text-ggc-dark bg-white hover:bg-ggc-subtle/70 border border-ggc/25 shadow-sm transition-all duration-200 text-sm sm:text-base hover:border-ggc"
                >
                  <span>Pelajari Fitur & Metodologi</span>
                </a>
              </div>

              {/* Interactive Quick Trust Highlights */}
              <div className="mt-10 pt-8 border-t border-gray-200/80 flex flex-wrap items-center justify-center lg:justify-start gap-y-3 gap-x-6 text-xs sm:text-sm text-gray-600 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>84 Butir Terstandarisasi</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Multi-Matrix Matching</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Laporan PDF Resmi Instan</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Interactive Widget (Tab Switcher between Radar & Mini Simulator) */}
            <div className="lg:col-span-5 relative">
              {/* Decorative Glow */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-ggc-gold/30 via-ggc/20 to-transparent rounded-3xl blur-xl opacity-70 animate-pulse pointer-events-none" />

              {/* Top View Mode Selector Pills */}
              <div className="flex items-center justify-center gap-2 mb-3 relative z-20">
                <button
                  type="button"
                  onClick={() => setHeroTab("simulation")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    heroTab === "simulation"
                      ? "bg-ggc text-white shadow-md ring-2 ring-ggc-gold/40"
                      : "bg-white/80 text-gray-600 hover:text-ggc border border-gray-200"
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5 text-ggc-gold" />
                  <span>Radar Profil Hasil</span>
                </button>
                <button
                  type="button"
                  onClick={() => setHeroTab("try")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    heroTab === "try"
                      ? "bg-ggc text-white shadow-md ring-2 ring-ggc-gold/40"
                      : "bg-white/80 text-gray-600 hover:text-ggc border border-gray-200"
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Coba 1 Soal Mini</span>
                </button>
              </div>

              {/* Active Tab View */}
              {heroTab === "try" ? (
                <InteractiveMiniAssessment />
              ) : (
                <div className="relative rounded-3xl bg-white p-5 sm:p-7 shadow-2xl border border-ggc-gold/40 backdrop-blur-xl">
                  {/* Card Header with Official Logo */}
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <img
                        src="/logo.png"
                        alt="GGC Official Logo"
                        className="w-10 h-10 object-contain drop-shadow-sm"
                      />
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-ggc-gold-dark">
                          Simulasi Radar Bakat 6 Sumbu
                        </div>
                        <div className="text-sm font-black text-ggc-dark">
                          Amanda Putri • Kelas 12
                        </div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      96% Very Strong Fit
                    </span>
                  </div>

                  {/* High Fidelity Interactive Radar Chart */}
                  <div className="my-3 flex flex-col items-center justify-center">
                    <InteractiveRadarChart
                      data={signatureProfiles[0].radarData}
                      size={270}
                      fillColor="rgba(11, 70, 50, 0.25)"
                      strokeColor="#0B4632"
                    />
                  </div>

                  {/* Primary Recommendation Result */}
                  <div className="mt-2 p-3.5 rounded-2xl bg-gradient-to-br from-ggc-dark to-ggc text-white flex items-center justify-between gap-3 shadow-md">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-ggc-gold font-bold">
                        Top Major Match
                      </div>
                      <div className="text-xs sm:text-sm font-black">
                        Teknik Informatika & AI
                      </div>
                      <div className="text-[11px] text-ggc-subtle">
                        Fakultas Ilmu Komputer
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-ggc-gold">Kecocokan 96%</div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/20 text-white">
                        Sangat Cocok
                      </span>
                    </div>
                  </div>

                  {/* Card Action */}
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] text-gray-500 flex items-center gap-1">
                      <Download className="w-3.5 h-3.5 text-ggc-gold" />
                      Laporan PDF 2 Halaman Resmi
                    </span>
                    <Link
                      href="/auth/register"
                      className="text-xs font-bold text-ggc hover:text-ggc-dark flex items-center gap-1 transition-colors"
                    >
                      <span>Mulai Asesmen</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ================= METRICS COUNTER BAR ================= */}
      <section className="py-8 bg-ggc-dark text-white border-y border-ggc-light/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-3xl sm:text-4xl font-black text-ggc-gold">84</div>
              <div className="text-xs sm:text-sm font-bold text-ggc-subtle mt-1">
                Butir Instrumen Terstandar
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-3xl sm:text-4xl font-black text-white">7</div>
              <div className="text-xs sm:text-sm font-bold text-ggc-subtle mt-1">
                Dimensi Evaluasi Holistik
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-3xl sm:text-4xl font-black text-ggc-gold">100%</div>
              <div className="text-xs sm:text-sm font-bold text-ggc-subtle mt-1">
                Bebas Bias Kategori (Randomized)
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-3xl sm:text-4xl font-black text-white">15-20</div>
              <div className="text-xs sm:text-sm font-bold text-ggc-subtle mt-1">
                Menit Durasi Pengerjaan
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= BENTO GRID: KEY FEATURES & ADVANTAGES ================= */}
      <section id="fitur" className="py-20 bg-white border-b border-ggc-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-ggc-gold/15 text-ggc-gold-dark text-xs font-bold uppercase tracking-wider border border-ggc-gold/30">
              <Sparkles className="w-3.5 h-3.5" />
              Keunggulan Sistem Asesmen GGC
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-ggc-dark mt-3 tracking-tight">
              Mengapa GGC Study Fit Assessment™ Berbeda?
            </h2>
            <p className="text-base sm:text-lg text-gray-600 mt-4 leading-relaxed">
              Bukan sekadar kuis kepribadian biasa. Sistem kami dibangun di atas riset psikometri mendalam yang menghubungkan potensi kognitif personal dengan kurikulum program studi perguruan tinggi.
            </p>
          </div>

          {/* Bento Grid with Spotlight Glow Effect */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Feature 1 */}
            <SpotlightCard className="p-7 rounded-3xl bg-[#FAFBF9] border border-gray-200/90 hover:border-ggc/40 hover:shadow-xl transition-all flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-ggc text-ggc-gold flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-ggc-dark">
                  Multi-Matrix Scoring Engine
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-2.5 leading-relaxed">
                  Memadukan <strong>Person Profile</strong> (bakat alami & kepribadian) dengan <strong>Study Profile</strong> berbobot multidimensi untuk menghitung tingkat kecocokan ilmiah.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200 text-xs font-semibold text-ggc flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Bebas tebak-tebakan jurusan</span>
              </div>
            </SpotlightCard>

            {/* Feature 2 */}
            <SpotlightCard className="p-7 rounded-3xl bg-[#FAFBF9] border border-gray-200/90 hover:border-ggc/40 hover:shadow-xl transition-all flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-ggc-gold text-ggc-dark flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform">
                  <Shuffle className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-ggc-dark">
                  84 Butir Soal Teracak (Zero-Bias)
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-2.5 leading-relaxed">
                  Seluruh butir soal disajikan secara teracak deterministik tanpa label kategori, mencegah bias manipulasi jawaban (*social desirability bias*) agar hasil 100% autentik.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200 text-xs font-semibold text-ggc flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Konsistensi seed terjamin</span>
              </div>
            </SpotlightCard>

            {/* Feature 3 */}
            <SpotlightCard className="p-7 rounded-3xl bg-[#FAFBF9] border border-gray-200/90 hover:border-ggc/40 hover:shadow-xl transition-all flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-ggc-light text-white flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform">
                  <Compass className="w-7 h-7 text-ggc-gold" />
                </div>
                <h3 className="text-lg font-bold text-ggc-dark">
                  Wawasan Naratif Ganda
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-2.5 leading-relaxed">
                  Bukan hanya menyajikan skor, sistem merangkum analisis mendalam <em>"Mengapa Cocok?"</em> serta mitigasi dini <em>"Hal yang Perlu Diantisipasi"</em> di tiap jurusan.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200 text-xs font-semibold text-ggc flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Panduan antisipasi kuliah</span>
              </div>
            </SpotlightCard>

            {/* Feature 4 */}
            <SpotlightCard className="p-7 rounded-3xl bg-[#FAFBF9] border border-gray-200/90 hover:border-ggc/40 hover:shadow-xl transition-all flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-ggc-dark text-ggc-gold flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform">
                  <FileText className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-ggc-dark">
                  Laporan PDF Resmi Eksekutif
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-2.5 leading-relaxed">
                  Unduh seketika sertifikat dan laporan PDF 2 halaman resmi bertanda tangan GGC untuk bahan konsultasi strategis bersama orang tua dan guru Bimbingan Konseling (BK).
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200 text-xs font-semibold text-ggc flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Format siap cetak (A4)</span>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </section>

      {/* ================= INTERACTIVE DEMO: POTENTIAL SIGNATURES SHOWCASE WITH RADAR ================= */}
      <section id="signatures" className="py-20 bg-gradient-to-b from-white via-ggc-tint/40 to-[#FAFBF9] border-b border-ggc-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-ggc-gold/20 text-ggc-gold-dark text-xs font-bold tracking-wide uppercase border border-ggc-gold/30">
              <Sparkles className="w-3.5 h-3.5" />
              Interactive Prototype Demo
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-ggc-dark mt-3">
              Jelajahi Sampel "Potential Signature" & Bentuk Radar
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-3 leading-relaxed">
              Pilih salah satu arketipe di bawah ini untuk melihat bagaimana bentuk poligon Radar Bakat dan rekomendasi program studi berubah secara dinamis.
            </p>
          </div>

          {/* Archetype Tab Selectors */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10">
            {signatureProfiles.map((sig, idx) => {
              const isActive = activeSignatureIndex === idx;
              return (
                <button
                  key={sig.id}
                  onClick={() => setActiveSignatureIndex(idx)}
                  className={`px-4 sm:px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                    isActive
                      ? "bg-ggc text-white shadow-lg shadow-ggc/20 ring-2 ring-ggc-gold/40 scale-105"
                      : "bg-white text-gray-600 hover:text-ggc hover:bg-ggc-subtle/60 border border-gray-200 shadow-sm"
                  }`}
                >
                  <Sparkles
                    className={`w-4 h-4 ${
                      isActive ? "text-ggc-gold" : "text-gray-400"
                    }`}
                  />
                  <span>{sig.title}</span>
                </button>
              );
            })}
          </div>

          {/* Active Signature Detail Card with Embedded Radar Chart */}
          {(() => {
            const activeProfile = signatureProfiles[activeSignatureIndex];
            return (
              <div className="rounded-3xl bg-gradient-to-br from-ggc-dark via-[#093D2C] to-ggc text-white p-6 sm:p-10 shadow-2xl border border-ggc-gold/40 relative overflow-hidden transition-all duration-300">
                {/* Background Watermark Logo */}
                <div className="absolute top-6 right-6 hidden md:block opacity-15 pointer-events-none">
                  <img
                    src="/logo.png"
                    alt="GGC Watermark"
                    className="w-36 h-36 object-contain"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                  {/* Left Column: Title & Traits */}
                  <div className="lg:col-span-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-ggc-gold text-xs font-bold uppercase tracking-wider border border-white/20 mb-3">
                      <span>{activeProfile.badge}</span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      {activeProfile.title}
                    </h3>
                    <div className="text-sm sm:text-base font-semibold text-ggc-gold mt-1">
                      "{activeProfile.archetype}"
                    </div>

                    <p className="mt-4 text-xs sm:text-sm text-ggc-subtle/90 leading-relaxed">
                      {activeProfile.tagline}
                    </p>

                    {/* Trait Badges */}
                    <div className="mt-6 flex flex-wrap items-center gap-2">
                      {activeProfile.traits.map((trait) => (
                        <span
                          key={trait}
                          className="px-3 py-1.5 rounded-xl bg-white/15 text-white text-xs font-semibold backdrop-blur-md border border-white/20"
                        >
                          ✓ {trait}
                        </span>
                      ))}
                    </div>

                    {/* Matched Major Quick Badges */}
                    <div className="mt-6 space-y-2">
                      <div className="text-xs font-bold uppercase tracking-wider text-ggc-gold">
                        Program Studi Paling Selaras:
                      </div>
                      <div className="space-y-1.5">
                        {activeProfile.matchedMajors.map((major, i) => (
                          <div
                            key={major.name}
                            className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-between text-xs"
                          >
                            <span className="font-bold text-white">
                              #{i + 1}. {major.name}
                            </span>
                            <span className="text-[11px] font-bold text-ggc-gold">
                              {major.fit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Counselor Quote Box */}
                    <div className="mt-6 p-4 rounded-2xl bg-black/25 border border-white/10 text-xs sm:text-sm text-ggc-subtle italic leading-relaxed">
                      "{activeProfile.quote}"
                    </div>
                  </div>

                  {/* Right Column: Live SVG Radar Chart */}
                  <div className="lg:col-span-6 bg-white text-gray-900 p-6 sm:p-8 rounded-3xl shadow-xl border border-ggc-gold/30 flex flex-col items-center justify-center">
                    <div className="w-full flex items-center justify-between pb-3 border-b border-gray-100 mb-2">
                      <span className="text-xs font-bold uppercase tracking-wide text-ggc-dark">
                        Bentuk Poligon Radar Talenta
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-ggc-gold/20 text-ggc-gold-dark border border-ggc-gold/30">
                        6 Sumbu Kognitif
                      </span>
                    </div>

                    <InteractiveRadarChart
                      data={activeProfile.radarData}
                      size={290}
                      fillColor="rgba(11, 70, 50, 0.25)"
                      strokeColor="#0B4632"
                    />

                    <div className="mt-3 text-center text-xs text-gray-500">
                      Arahkan kursor pada titik sudut untuk melihat skor kecocokan sumbu kognitif.
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* ================= THE 7 EVALUATION DIMENSIONS SECTION ================= */}
      <section id="metodologi" className="py-20 bg-white border-b border-ggc-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-ggc-gold-dark">
              Holistic Psychometric Framework
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-ggc-dark mt-2">
              7 Dimensi Penilaian Multi-Matriks
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-3 leading-relaxed">
              Setiap dimensi memuat 12 instrumen terukur (total 84 butir) yang saling menyilang untuk membentuk profil kecocokan studi yang utuh dan komprehensif.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dimensions.map((dim) => {
              const IconComp = dim.icon;
              const isSelected = activeDimCode === dim.code;
              return (
                <SpotlightCard
                  key={dim.code}
                  onClick={() => setActiveDimCode(dim.code)}
                  className={`p-6 rounded-3xl cursor-pointer border transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? "bg-ggc-tint/80 border-ggc shadow-md ring-2 ring-ggc/30"
                      : "bg-[#FAFBF9] border-gray-200/90 hover:border-ggc/40 shadow-sm"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-2xl border ${dim.color}`}>
                        <IconComp className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-black px-2.5 py-1 rounded-full bg-ggc-subtle text-ggc border border-ggc/20">
                        {dim.count}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-ggc-dark">
                      {dim.name}
                    </h3>
                    <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                      {dim.desc}
                    </p>
                  </div>

                  {/* Subdimension Pills */}
                  <div className="mt-5 pt-4 border-t border-gray-200/60 flex flex-wrap gap-1.5">
                    {dim.samples.map((sample) => (
                      <span
                        key={sample}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white text-gray-700 border border-gray-200"
                      >
                        {sample}
                      </span>
                    ))}
                  </div>
                </SpotlightCard>
              );
            })}

            {/* Total 84 Items Summary Banner Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-ggc-dark via-ggc to-ggc-light text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-ggc-gold mb-4">
                  <Award className="w-6 h-6" />
                </div>
                <div className="text-xs uppercase tracking-widest text-ggc-gold font-bold">
                  Total Instrumen
                </div>
                <h3 className="text-3xl font-black mt-1">
                  84 Butir Terpadu
                </h3>
                <p className="text-xs text-ggc-subtle/80 mt-2 leading-relaxed">
                  7 Dimensi × 12 Butir Terukur. Menghasilkan akurasi evaluasi tinggi tanpa membebani konsentrasi siswa.
                </p>
              </div>

              <div className="mt-6 relative z-10">
                <Link
                  href="/auth/register"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-ggc-dark bg-ggc-gold hover:bg-ggc-gold-dark hover:text-white transition-all shadow-md"
                >
                  <span>Mulai Pengisian Instrumen</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Interactive Selected Dimension Live Spotlight Box */}
          <div className="mt-8 p-5 sm:p-6 rounded-3xl bg-ggc-subtle/50 border border-ggc/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-ggc text-ggc-gold font-bold shrink-0">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-ggc uppercase tracking-wider">
                  Contoh Butir Instrumen • {activeDimension.name}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-gray-800 mt-0.5">
                  "{activeDimension.sampleQuestion}"
                </div>
              </div>
            </div>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-1 text-xs font-bold text-ggc hover:text-ggc-dark transition-colors shrink-0"
            >
              <span>Uji Dimensi Ini</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ================= 3-STEP JOURNEY / HOW IT WORKS ================= */}
      <section id="alur" className="py-20 bg-[#FAFBF9] border-b border-ggc-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-ggc-gold-dark">
              Simple & Seamless Flow
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-ggc-dark mt-2">
              3 Langkah Menuju Kepastian Jurusan
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-3 leading-relaxed">
              Hanya butuh waktu sekitar 15–20 menit untuk memetakan arah masa depan Anda secara komprehensif.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <SpotlightCard className="p-8 rounded-3xl bg-white border border-gray-200/90 shadow-sm hover:shadow-lg transition-all relative">
              <div className="w-12 h-12 rounded-2xl bg-ggc text-ggc-gold font-black text-lg flex items-center justify-center mb-6 shadow-md">
                1
              </div>
              <h3 className="text-lg font-bold text-ggc-dark">
                Registrasi & Isi 84 Soal
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-3 leading-relaxed">
                Buat akun siswa dan jawab 84 butir instrumen skala Likert (1-5) dengan antarmuka responsif dan penyimpanan otomatis per butir soal.
              </p>
              <div className="mt-5 text-xs font-semibold text-ggc flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-ggc-gold" />
                <span>Estimasi waktu 15–20 menit</span>
              </div>
            </SpotlightCard>

            {/* Step 2 */}
            <SpotlightCard className="p-8 rounded-3xl bg-white border border-gray-200/90 shadow-sm hover:shadow-lg transition-all relative">
              <div className="w-12 h-12 rounded-2xl bg-ggc-gold text-ggc-dark font-black text-lg flex items-center justify-center mb-6 shadow-md">
                2
              </div>
              <h3 className="text-lg font-bold text-ggc-dark">
                Kalkulasi Multi-Matrix
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-3 leading-relaxed">
                Algoritma secara instan mengolah Person Profile Anda dan membandingkannya dengan bobot ratusan program studi untuk menentukan fit score tertinggi.
              </p>
              <div className="mt-5 text-xs font-semibold text-ggc flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-ggc-gold" />
                <span>Kalkulasi realtime instan</span>
              </div>
            </SpotlightCard>

            {/* Step 3 */}
            <SpotlightCard className="p-8 rounded-3xl bg-white border border-gray-200/90 shadow-sm hover:shadow-lg transition-all relative">
              <div className="w-12 h-12 rounded-2xl bg-ggc-light text-white font-black text-lg flex items-center justify-center mb-6 shadow-md">
                3
              </div>
              <h3 className="text-lg font-bold text-ggc-dark">
                Dashboard & Laporan PDF
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-3 leading-relaxed">
                Tinjau Potential Signature Anda, pelajari wawasan naratif, dan unduh dokumen PDF resmi 2 halaman untuk konseling bersama keluarga & guru BK.
              </p>
              <div className="mt-5 text-xs font-semibold text-ggc flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-ggc-gold" />
                <span>Dokumen PDF resmi instan</span>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </section>

      {/* ================= PARENTS & COUNSELORS EMPOWERMENT ================= */}
      <section className="py-16 bg-emerald-luxury text-white border-y border-ggc-gold/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-ggc-gold/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 text-center lg:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-ggc-gold text-xs font-bold uppercase tracking-wider border border-white/20 mb-3">
                <Users className="w-3.5 h-3.5" />
                Solusi Kolaboratif
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                Jembatan Dialog Nyaman antara Siswa, Orang Tua & Konselor
              </h2>
              <p className="text-xs sm:text-sm lg:text-base text-ggc-subtle/90 mt-3 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Memilih jurusan kuliah seringkali memicu perdebatan di ruang keluarga akibat minimnya data objektif. GGC hadir menyajikan tolok ukur saintifik yang netral sehingga keputusan masa depan anak dibangun atas dasar potensi nyata, bukan sekadar asumsi atau tren sesaat.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-xs sm:text-sm text-ggc-dark bg-ggc-gold hover:bg-ggc-gold-dark hover:text-white transition-all shadow-md text-center"
              >
                <span>Daftar Sebagai Siswa</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-xs sm:text-sm text-white bg-white/15 hover:bg-white/25 border border-white/30 backdrop-blur-md transition-all text-center"
              >
                <span>Masuk Portal Administrator</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FREQUENTLY ASKED QUESTIONS (FAQ) ================= */}
      <section id="faq" className="py-20 bg-white border-b border-ggc-subtle">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-ggc-gold-dark">
              Paling Sering Ditanyakan
            </span>
            <h2 className="text-3xl font-black text-ggc-dark mt-2">
              Pertanyaan & Jawaban Seputar Asesmen
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              Pelajari lebih lanjut tentang validitas metodologi dan alur pengerjaan instrumen.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={faq.q}
                  className="rounded-2xl border border-gray-200/90 overflow-hidden bg-[#FAFBF9] transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full text-left px-6 py-4.5 flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-ggc-dark hover:text-ggc transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-ggc-gold shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 bg-white">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= FINAL CALL-TO-ACTION BANNER ================= */}
      <section className="py-20 bg-gradient-to-b from-[#FAFBF9] to-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-ggc-dark via-ggc to-ggc-light p-8 sm:p-14 text-white text-center shadow-2xl border border-ggc-gold/40 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-ggc-gold/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="inline-block p-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 mb-4 shadow-md">
                <img
                  src="/logo.png"
                  alt="Go Great Career Logo"
                  className="w-12 h-12 object-contain mx-auto"
                />
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                Siap Menemukan Arah Studi & Karier Terbaikmu?
              </h2>

              <p className="mt-4 text-xs sm:text-base text-ggc-subtle/90 leading-relaxed">
                Bergabunglah dengan ribuan siswa yang telah menemukan kejelasan langkah masa depan bersama <strong>GGC Study Fit Assessment™</strong>.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/auth/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-ggc-dark bg-ggc-gold hover:bg-ggc-gold-dark hover:text-white shadow-xl transition-all duration-200"
                >
                  <span>Mulai Asesmen Sekarang</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/auth/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-white bg-white/15 hover:bg-white/25 border border-white/30 backdrop-blur-md transition-all duration-200"
                >
                  <span>Sudah Punya Akun? Masuk</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= REFINED FOOTER ================= */}
      <footer className="mt-auto py-12 bg-ggc-dark text-white border-t border-ggc-light/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-8 border-b border-white/10">
            {/* Logo and Tagline */}
            <div className="text-center md:text-left">
              <BrandLogo variant="light" size="md" href="/" />
              <p className="text-xs text-ggc-subtle/70 mt-2 max-w-sm">
                Instrumen asesmen multi-matriks komprehensif untuk pemetaan potensi studi dan karier masa depan Indonesia.
              </p>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap justify-center gap-6 text-xs text-ggc-subtle/80 font-medium">
              <a href="#fitur" className="hover:text-white transition-colors">
                Keunggulan
              </a>
              <a href="#metodologi" className="hover:text-white transition-colors">
                7 Dimensi
              </a>
              <a href="#signatures" className="hover:text-white transition-colors">
                Potential Signature
              </a>
              <a href="#alur" className="hover:text-white transition-colors">
                Cara Kerja
              </a>
              <a href="#faq" className="hover:text-white transition-colors">
                FAQ
              </a>
              <Link href="/auth/login" className="hover:text-white transition-colors">
                Portal Admin
              </Link>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ggc-subtle/60">
            <p>© {new Date().getFullYear()} Go Great Career (GGC). All rights reserved.</p>
            <p className="flex items-center gap-1.5">
              <span>Study Fit Assessment™</span>
              <span>•</span>
              <span>Protected Intellectual Property</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
