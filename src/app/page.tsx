"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import BrandLogo from "@/components/BrandLogo";
import InteractiveRadarChart, { RadarDataPoint } from "@/components/InteractiveRadarChart";
import InteractiveMiniAssessment from "@/components/InteractiveMiniAssessment";
import SpotlightCard from "@/components/SpotlightCard";
import MidtransCheckoutModal from "@/components/MidtransCheckoutModal";
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
  Search,
  HelpCircle,
  Lightbulb,
  MessageCircle,
  X,
  RotateCcw,
  FileQuestion,
  LayoutDashboard,
  CreditCard,
} from "lucide-react";

export default function HomePage() {
  const { data: session } = useSession();
  const isStudent = session?.user?.role === "STUDENT";
  const isAdmin = session?.user?.role === "ADMIN";

  // Hero interactive preview switcher: "simulation" | "try"
  const [heroTab, setHeroTab] = useState<"simulation" | "try">("simulation");

  // Potential Signature showcase active index
  const [activeSignatureIndex, setActiveSignatureIndex] = useState(0);

  // Active Dimension category preview (0-6)
  const [activeDimCode, setActiveDimCode] = useState<string>("T");

  // FAQ Accordion active index
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Midtrans Payment Modal state
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // FAQ Category Filter State
  const [faqCategory, setFaqCategory] = useState<string>("ALL");

  // FAQ Live Search State
  const [faqSearch, setFaqSearch] = useState<string>("");

  // Parallax scroll state with requestAnimationFrame optimization
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
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

  const faqCategoryList = [
    { key: "ALL", label: "Semua Topik" },
    { key: "ASSESSMENT", label: "Instrumen & Durasi" },
    { key: "METHODOLOGY", label: "Metodologi Multi-Matrix" },
    { key: "REPORT", label: "Laporan & Konseling" },
  ];

  const faqs = [
    {
      id: "faq-1",
      category: "ASSESSMENT",
      categoryLabel: "Instrumen & Durasi",
      tag: "15-20 Menit",
      q: "Berapa lama waktu yang dibutuhkan untuk menyelesaikan seluruh 84 butir soal?",
      a: "Asesmen terdiri dari 84 butir instrumen skala Likert (1 sampai 5) yang dirancang intuitif dan ringkas. Rata-rata siswa menyelesaikannya dalam kurun waktu 15 hingga 20 menit. Anda tidak perlu terburu-buru karena sistem mengamankan setiap pilihan secara realtime.",
      takeaway: "Setiap jawaban tersimpan otomatis per butir soal, bebas stres tanpa batas waktu ketat.",
    },
    {
      id: "faq-2",
      category: "ASSESSMENT",
      categoryLabel: "Instrumen & Durasi",
      tag: "Zero-Bias",
      q: "Apakah ada jawaban 'benar' atau 'salah' yang dapat menggugurkan peserta?",
      a: "Sama sekali tidak ada jawaban benar atau salah. Seluruh instrumen dirancang murni untuk memetakan keaslian bakat kognitif, preferensi kerja, nilai hidup, dan minat karier Anda secara objektif. Pilihlah jawaban yang paling mencerminkan diri Anda apa adanya.",
      takeaway: "Asesmen ini bukan ujian kelulusan, melainkan kompas pencocokan potensi diri.",
    },
    {
      id: "faq-3",
      category: "ASSESSMENT",
      categoryLabel: "Instrumen & Durasi",
      tag: "Auto-Save",
      q: "Bisakah pengerjaan asesmen dijeda dan dilanjutkan kembali di perangkat lain?",
      a: "Ya, tentu saja! Karena setiap klik jawaban langsung tersimpan di cloud database akun Anda, Anda dapat keluar kapan saja dan melanjutkan kembali melalui laptop, tablet, atau smartphone tanpa kehilangan progres pengerjaan.",
      takeaway: "Fleksibel lintas perangkat; lanjutkan kapan saja dari nomor soal terakhir.",
    },
    {
      id: "faq-4",
      category: "METHODOLOGY",
      categoryLabel: "Metodologi & Multi-Matrix",
      tag: "Scoring Engine",
      q: "Bagaimana cara kerja algoritma Multi-Matrix Scoring dalam menentukan kecocokan jurusan?",
      a: "Algoritma menghitung Person Profile (distribusi skor 7 dimensi siswa) lalu membandingkannya dengan Study Profile ratusan program studi berbobot ilmiah. Hasil akhirnya menghasilkan persentase keselarasan (Fit Score 1-100%) dan kategori kecocokan: Very Strong Fit, Strong Fit, Potential Fit, hingga Explore Further.",
      takeaway: "Menggabungkan profil personal dengan bobot kurikulum perguruan tinggi secara presisi.",
    },
    {
      id: "faq-5",
      category: "METHODOLOGY",
      categoryLabel: "Metodologi & Multi-Matrix",
      tag: "Archetype",
      q: "Apa itu 'Potential Signature' dan mengapa penting untuk masa depan saya?",
      a: "Potential Signature adalah sintesis arketipe talenta dominan Anda (misalnya The Analytical Strategist, The Visionary Creator, dll.). Ini bukan sekadar label, melainkan cetak biru kognitif yang memandu Anda memilih karier dan lingkungan kerja yang paling memungkinkan Anda berkembang maksimal.",
      takeaway: "Cetak biru kognitif untuk memandu keputusan karier jangka panjang.",
    },
    {
      id: "faq-6",
      category: "REPORT",
      categoryLabel: "Laporan & Konseling",
      tag: "PDF Resmi A4",
      q: "Apakah laporan hasil asesmen bisa langsung diunduh dan dicetak untuk orang tua?",
      a: "Seketika setelah menekan tombol Selesai, Anda langsung mendapatkan akses ke Dashboard Hasil interaktif serta tombol unduh Laporan PDF Resmi 2 Halaman (format A4 standar eksekutif) lengkap dengan kop Go Great Career™ yang siap dibagikan ke orang tua dan konselor.",
      takeaway: "Dokumen resmi berformat eksekutif siap cetak untuk diskusi keluarga & guru BK.",
    },
    {
      id: "faq-7",
      category: "REPORT",
      categoryLabel: "Laporan & Konseling",
      tag: "Portal Sekolah",
      q: "Bagaimana pihak sekolah, yayasan, atau guru BK dapat menggunakan platform ini?",
      a: "Kami menyediakan Portal Administrator khusus bagi institusi pendidikan. Konselor dapat memantau status kemajuan seluruh siswa, meninjau analitik distribusi kecocokan jurusan, dan mengekspor seluruh rekap data siswa ke format Excel (.xlsx) dengan sekali klik.",
      takeaway: "Terintegrasi penuh untuk manajemen bimbingan karier sekolah terpusat.",
    },
  ];

  const filteredFaqs = React.useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory = faqCategory === "ALL" || faq.category === faqCategory;
      const matchesSearch =
        !faqSearch.trim() ||
        faq.q.toLowerCase().includes(faqSearch.toLowerCase()) ||
        faq.a.toLowerCase().includes(faqSearch.toLowerCase()) ||
        faq.tag.toLowerCase().includes(faqSearch.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [faqCategory, faqSearch]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFBF9] dark:bg-[#031810] text-gray-900 dark:text-[#E8F1EC] overflow-x-hidden selection:bg-ggc selection:text-white pb-20 sm:pb-0 transition-colors duration-200">
      <Navbar />

      {/* ================= HERO SECTION WITH INTERACTIVE RADAR & MINI SIMULATOR ================= */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 bg-gradient-to-b from-white via-ggc-tint/60 to-[#FAFBF9] dark:from-[#031810] dark:via-[#052317] dark:to-[#031810] parallax-hero-wrapper">
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
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/95 dark:bg-[#07261B]/95 backdrop-blur-md border border-ggc/20 dark:border-ggc-gold/30 text-ggc dark:text-ggc-gold text-xs sm:text-sm font-semibold shadow-sm mb-6 animate-float-slow">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-gray-700 dark:text-[#C7DCD2]">Sahabat Pemetaan Masa Depan Siswa</span>
                <span className="text-ggc-gold-dark dark:text-ggc-gold font-bold">• 84 Butir Santai & Teruji</span>
              </div>

              {/* Main Headline */}
              <h1 className="fluid-hero-title font-black text-ggc-dark dark:text-white tracking-tight leading-[1.14]">
                Pahami Potensimu.{" "}
                <span className="gold-gradient-text block mt-1.5">
                  Pilih Jurusan Bebas Galau!
                </span>
              </h1>

              {/* Tagline / Subtitle */}
              <p className="mt-6 text-base sm:text-lg lg:text-xl text-gray-700 dark:text-[#B2CCC1] leading-relaxed max-w-2xl mx-auto lg:mx-0">
                <strong>Go Great Career (GGC) Study Fit Assessment™</strong> hadir mendampingi langkahmu. Petakan bakat kognitif, minat, kepribadian, hingga kesiapan kuliah lewat 84 pertanyaan reflektif santai tanpa tekanan. Temukan program studi kampus impian yang paling pas dengan dirimu!
              </p>

              {/* Primary & Secondary Action CTAs */}
              <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                {isStudent ? (
                  <>
                    <Link
                      href="/student/dashboard"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-white bg-ggc hover:bg-ggc-light active:bg-ggc-dark shadow-lg shadow-ggc/25 hover:shadow-xl hover:shadow-ggc/30 transition-all duration-200 group text-sm sm:text-base ring-offset-2 hover:ring-2 hover:ring-ggc"
                    >
                      <LayoutDashboard className="w-5 h-5 text-ggc-gold" />
                      <span>Buka Dashboard Siswa</span>
                      <ArrowRight className="w-5 h-5 text-ggc-gold transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                    <Link
                      href="/student/assessment"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl font-bold text-ggc-dark dark:text-white bg-white dark:bg-[#07261B] hover:bg-ggc-subtle/70 dark:hover:bg-[#0B3525] border border-ggc/25 dark:border-ggc-gold/40 shadow-sm transition-all duration-200 text-sm sm:text-base hover:border-ggc dark:hover:border-ggc-gold"
                    >
                      <Sparkles className="w-4 h-4 text-ggc-gold-dark dark:text-ggc-gold" />
                      <span>Lanjutkan Asesmen 84 Butir</span>
                    </Link>
                  </>
                ) : isAdmin ? (
                  <>
                    <Link
                      href="/admin/dashboard"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-white bg-ggc hover:bg-ggc-light active:bg-ggc-dark shadow-lg shadow-ggc/25 hover:shadow-xl hover:shadow-ggc/30 transition-all duration-200 group text-sm sm:text-base ring-offset-2 hover:ring-2 hover:ring-ggc"
                    >
                      <ShieldCheck className="w-5 h-5 text-ggc-gold" />
                      <span>Buka Portal Admin</span>
                      <ArrowRight className="w-5 h-5 text-ggc-gold transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                    <Link
                      href="/admin/questions"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl font-bold text-ggc-dark dark:text-white bg-white dark:bg-[#07261B] hover:bg-ggc-subtle/70 dark:hover:bg-[#0B3525] border border-ggc/25 dark:border-ggc-gold/40 shadow-sm transition-all duration-200 text-sm sm:text-base hover:border-ggc dark:hover:border-ggc-gold"
                    >
                      <span>Manajemen Bank Soal</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsCheckoutModalOpen(true)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-ggc-dark bg-gradient-to-r from-[#E6D5A8] via-ggc-gold to-ggc-gold-dark hover:shadow-xl hover:scale-[1.02] active:scale-[0.99] transition-all duration-200 group text-sm sm:text-base ring-offset-2 hover:ring-2 hover:ring-ggc shadow-md cursor-pointer"
                    >
                      <CreditCard className="w-5 h-5 text-ggc-dark" />
                      <span>Beli Akses Asesmen (Rp 49.000)</span>
                      <ArrowRight className="w-5 h-5 text-ggc-dark transition-transform duration-200 group-hover:translate-x-1" />
                    </button>
                    <Link
                      href="/auth/register"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl font-bold text-ggc-dark dark:text-white bg-white dark:bg-[#07261B] hover:bg-ggc-subtle/70 dark:hover:bg-[#0B3525] border border-ggc/25 dark:border-ggc-gold/40 shadow-sm transition-all duration-200 text-sm sm:text-base hover:border-ggc dark:hover:border-ggc-gold"
                    >
                      <span>Daftar Langsung</span>
                    </Link>
                  </>
                )}
              </div>

              {/* Interactive Quick Trust Highlights (Clean In-Flow Grid, Zero Overlapping) */}
              <div className="mt-10 pt-7 border-t border-gray-200/80 dark:border-[#0E4230]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-700 dark:text-[#C7DCD2]">
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/90 dark:bg-[#07261B]/90 border border-gray-200/80 dark:border-[#103D2B] shadow-2xs hover:border-ggc/30 dark:hover:border-ggc-gold/40 transition-colors">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-200/60 dark:border-emerald-800/40">
                      ✓
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">84 Butir Santai & Teruji</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">15–20 menit selesai tanpa stres</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/90 dark:bg-[#07261B]/90 border border-gray-200/80 dark:border-[#103D2B] shadow-2xs hover:border-ggc/30 dark:hover:border-ggc-gold/40 transition-colors">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-200/60 dark:border-emerald-800/40">
                      ✓
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">Multi-Matrix Matching</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">98.4% siswa lebih percaya diri</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/90 dark:bg-[#07261B]/90 border border-gray-200/80 dark:border-[#103D2B] shadow-2xs hover:border-ggc/30 dark:hover:border-ggc-gold/40 transition-colors">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-200/60 dark:border-emerald-800/40">
                      ✓
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">Laporan PDF Resmi Instan</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">Siap cetak & diskusi keluarga</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/90 dark:bg-[#07261B]/90 border border-amber-200/70 dark:border-amber-800/40 shadow-2xs hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm shrink-0 border border-amber-200 dark:border-amber-800/60">
                      ⭐
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">Rating 4.9/5 Kepuasan</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">10.000+ siswa terbantu di Indonesia</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Interactive Widget (Tab Switcher between Radar & Mini Simulator) */}
            <div className="lg:col-span-5 relative">
              {/* Decorative Glow */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-ggc-gold/30 via-ggc/20 to-transparent rounded-3xl blur-xl opacity-70 animate-pulse pointer-events-none" />

              {/* Top View Mode Selector Pills & Status Indicator */}
              <div className="flex items-center justify-between gap-2 mb-3 relative z-20">
                <div className="inline-flex items-center gap-1.5 p-1 rounded-2xl bg-white/90 border border-gray-200/90 shadow-xs">
                  <button
                    type="button"
                    onClick={() => setHeroTab("simulation")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      heroTab === "simulation"
                        ? "bg-ggc text-white shadow-xs"
                        : "text-gray-600 hover:text-ggc hover:bg-gray-100"
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
                        ? "bg-ggc text-white shadow-xs"
                        : "text-gray-600 hover:text-ggc hover:bg-gray-100"
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>Coba 1 Soal Mini</span>
                  </button>
                </div>

                <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Auto-Save Aktif</span>
                </div>
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
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-ggc-gold" />
                      <span>96% Very Strong Fit</span>
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
                  <div className="mt-4 pt-3.5 border-t border-gray-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-gray-500 flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>15–20 Menit Selesai</span>
                    </span>
                    <Link
                      href="/auth/register"
                      className="text-xs font-bold text-ggc hover:text-ggc-dark flex items-center gap-1 transition-colors"
                    >
                      <span>Mulai Asesmen</span>
                      <ArrowRight className="w-3.5 h-3.5 text-ggc-gold" />
                    </Link>
                  </div>
                </div>
              )}

              {/* In-flow bottom reassurance badge (No Overlapping) */}
              <div className="mt-3.5 text-center">
                <p className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/85 border border-gray-200/80 text-[11px] font-semibold text-gray-600 shadow-2xs">
                  <FileText className="w-3.5 h-3.5 text-ggc" />
                  <span>Dokumen hasil resmi siap didiskusikan bareng orang tua & guru BK</span>
                </p>
              </div>
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

      {/* ================= FRIENDLY BEFORE VS AFTER TRANSFORMATION ================= */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-[#FAFBF9] via-white to-ggc-subtle/30 dark:from-[#031810] dark:via-[#052016] dark:to-[#031810] border-b border-ggc-subtle dark:border-[#0E4230] relative overflow-hidden transition-colors">
        {/* Parallax Ambient Orbs */}
        <div
          className="absolute top-1/3 -left-32 w-96 h-96 bg-emerald-200/25 dark:bg-emerald-900/20 rounded-full blur-3xl pointer-events-none parallax-layer-slow"
          style={{ transform: `translateY(${scrollY * 0.08}px)` }}
          aria-hidden="true"
        />
        <div
          className="absolute bottom-10 -right-32 w-96 h-96 bg-ggc-gold/20 dark:bg-ggc-gold/10 rounded-full blur-3xl pointer-events-none parallax-layer-medium"
          style={{ transform: `translateY(${scrollY * -0.1}px)` }}
          aria-hidden="true"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-200 dark:border-emerald-800/40">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Transformasi Siswa Indonesia
            </span>
            <h2 className="fluid-section-title font-black text-ggc-dark dark:text-white mt-3 tracking-tight">
              Say Goodbye to Galau Jurusan! 👋
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-[#A0B9AE] mt-3 leading-relaxed">
              Lihat bagaimana ribuan siswa SMA & SMK beralih dari rasa cemas menjadi mantap 100% melangkah ke bangku kuliah impian.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {/* Before Card */}
            <div className="p-7 sm:p-9 rounded-3xl bg-white dark:bg-[#07261B] border border-red-100 dark:border-red-950/60 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center text-2xl font-bold mb-5">
                  😰
                </div>
                <div className="inline-block px-3 py-1 rounded-md bg-red-100/80 dark:bg-red-950/80 text-red-800 dark:text-red-300 text-xs font-bold uppercase tracking-wide mb-3 border border-red-200/50 dark:border-red-900/40">
                  Sebelum Asesmen GGC
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4">
                  Bingung, Ragu, & Ikut-ikutan Tren
                </h3>
                <ul className="space-y-3 text-sm text-gray-600 dark:text-[#C7DCD2]">
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 font-black text-sm">✕</span>
                    <span>Pilih jurusan sekadar ikut-ikutan teman atau terbawa opini viral sesaat.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 font-black text-sm">✕</span>
                    <span>Khawatir salah jurusan dan merasa terjebak saat beban kuliah semakin berat.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 font-black text-sm">✕</span>
                    <span>Sulit meyakinkan orang tua karena tidak memiliki data potensi yang objektif.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 font-black text-sm">✕</span>
                    <span>Buta terhadap prospek karier dan dinamika industri masa depan.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-gray-100 dark:border-[#103D2B] text-xs text-red-700 dark:text-red-400 font-semibold flex items-center gap-1.5">
                <span>Rentan demotivasi dan pindah jurusan di tengah jalan</span>
              </div>
            </div>

            {/* After Card (Gold & Emerald Luxury Glow) */}
            <div className="p-7 sm:p-9 rounded-3xl bg-gradient-to-br from-white via-emerald-50/40 to-ggc-gold-subtle/40 dark:from-[#062419] dark:via-[#093525] dark:to-[#07261B] border-2 border-emerald-300 dark:border-emerald-700/60 shadow-lg hover:shadow-xl transition-all relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-2xl font-bold mb-5 shadow-xs">
                  🤩
                </div>
                <div className="inline-block px-3 py-1 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wide mb-3 border border-emerald-200 dark:border-emerald-800/40">
                  Setelah Study Fit Assessment™
                </div>
                <h3 className="text-xl font-black text-ggc-dark dark:text-white mb-4">
                  Penuh Keyakinan, Terarah, & Percaya Diri
                </h3>
                <ul className="space-y-3 text-sm text-gray-700 dark:text-[#E8F1EC]">
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-600 dark:text-emerald-400 font-black text-sm">✓</span>
                    <span>Tahu pasti potensi kognitif dan arketipe <strong className="text-ggc-dark dark:text-ggc-gold">Potential Signature</strong> unikmu.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-600 dark:text-emerald-400 font-black text-sm">✓</span>
                    <span>Menerima rekomendasi <strong className="text-ggc-dark dark:text-ggc-gold">Top 5 Jurusan</strong> berbobot kurikulum perguruan tinggi.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-600 dark:text-emerald-400 font-black text-sm">✓</span>
                    <span>Laporan PDF Resmi siap didiskusikan bersama orang tua dan Guru BK sekolah.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-600 dark:text-emerald-400 font-black text-sm">✓</span>
                    <span>Paham prospek karier relevan dan siap menghadapi seleksi masuk kampus impian!</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-emerald-200 dark:border-emerald-800/50 text-xs text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Siap melangkah mantap menuju kampus dan karier masa depan</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= BENTO GRID: KEY FEATURES & ADVANTAGES ================= */}
      <section id="fitur" className="py-20 bg-white dark:bg-[#031810] border-b border-ggc-subtle dark:border-[#0E4230] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-ggc-gold/15 dark:bg-ggc-gold/25 text-ggc-gold-dark dark:text-ggc-gold text-xs font-bold uppercase tracking-wider border border-ggc-gold/30">
              <Sparkles className="w-3.5 h-3.5" />
              Keunggulan Sistem Asesmen GGC
            </span>
            <h2 className="fluid-section-title font-black text-ggc-dark dark:text-white mt-3 tracking-tight">
              Mengapa GGC Study Fit Assessment™ Berbeda?
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-[#A0B9AE] mt-4 leading-relaxed">
              Bukan sekadar kuis kepribadian biasa. Sistem kami dibangun di atas riset psikometri mendalam yang menghubungkan potensi kognitif personal dengan kurikulum program studi perguruan tinggi.
            </p>
          </div>

          {/* Bento Grid with Spotlight Glow Effect */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Feature 1 */}
            <SpotlightCard className="p-7 rounded-3xl bg-[#FAFBF9] dark:bg-[#07261B] border border-gray-200/90 dark:border-[#103D2B] hover:border-ggc/40 dark:hover:border-ggc-gold/40 hover:shadow-xl transition-all flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-ggc text-ggc-gold flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-ggc-dark dark:text-white">
                  Multi-Matrix Scoring Engine
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-[#A0B9AE] mt-2.5 leading-relaxed">
                  Memadukan <strong className="dark:text-white">Person Profile</strong> (bakat alami & kepribadian) dengan <strong className="dark:text-white">Study Profile</strong> berbobot multidimensi untuk menghitung tingkat kecocokan ilmiah.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-[#103D2B] text-xs font-semibold text-ggc dark:text-ggc-gold flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Bebas tebak-tebakan jurusan</span>
              </div>
            </SpotlightCard>

            {/* Feature 2 */}
            <SpotlightCard className="p-7 rounded-3xl bg-[#FAFBF9] dark:bg-[#07261B] border border-gray-200/90 dark:border-[#103D2B] hover:border-ggc/40 dark:hover:border-ggc-gold/40 hover:shadow-xl transition-all flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-ggc-gold text-ggc-dark flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform">
                  <Shuffle className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-ggc-dark dark:text-white">
                  84 Butir Soal Teracak (Zero-Bias)
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-[#A0B9AE] mt-2.5 leading-relaxed">
                  Seluruh butir soal disajikan secara teracak deterministik tanpa label kategori, mencegah bias manipulasi jawaban (<em>social desirability bias</em>) agar hasil 100% autentik.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-[#103D2B] text-xs font-semibold text-ggc dark:text-ggc-gold flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Konsistensi seed terjamin</span>
              </div>
            </SpotlightCard>

            {/* Feature 3 */}
            <SpotlightCard className="p-7 rounded-3xl bg-[#FAFBF9] dark:bg-[#07261B] border border-gray-200/90 dark:border-[#103D2B] hover:border-ggc/40 dark:hover:border-ggc-gold/40 hover:shadow-xl transition-all flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-ggc-light text-white flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform">
                  <Compass className="w-7 h-7 text-ggc-gold" />
                </div>
                <h3 className="text-lg font-bold text-ggc-dark dark:text-white">
                  Wawasan Naratif Ganda
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-[#A0B9AE] mt-2.5 leading-relaxed">
                  Bukan hanya menyajikan skor, sistem merangkum analisis mendalam <em>&ldquo;Mengapa Cocok?&rdquo;</em> serta mitigasi dini <em>&ldquo;Hal yang Perlu Diantisipasi&rdquo;</em> di tiap jurusan.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-[#103D2B] text-xs font-semibold text-ggc dark:text-ggc-gold flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Panduan antisipasi kuliah</span>
              </div>
            </SpotlightCard>

            {/* Feature 4 */}
            <SpotlightCard className="p-7 rounded-3xl bg-[#FAFBF9] dark:bg-[#07261B] border border-gray-200/90 dark:border-[#103D2B] hover:border-ggc/40 dark:hover:border-ggc-gold/40 hover:shadow-xl transition-all flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-ggc-dark text-ggc-gold flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform">
                  <FileText className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-ggc-dark dark:text-white">
                  Laporan PDF Resmi Eksekutif
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-[#A0B9AE] mt-2.5 leading-relaxed">
                  Unduh seketika sertifikat dan laporan PDF 2 halaman resmi bertanda tangan GGC untuk bahan konsultasi strategis bersama orang tua dan guru Bimbingan Konseling (BK).
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-[#103D2B] text-xs font-semibold text-ggc dark:text-ggc-gold flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Format siap cetak (A4)</span>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </section>

      {/* ================= INTERACTIVE DEMO: POTENTIAL SIGNATURES SHOWCASE WITH RADAR ================= */}
      <section id="signatures" className="py-20 bg-gradient-to-b from-white via-ggc-tint/40 to-[#FAFBF9] dark:from-[#031810] dark:via-[#052016] dark:to-[#031810] border-b border-ggc-subtle dark:border-[#0E4230] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-ggc-gold/20 dark:bg-ggc-gold/25 text-ggc-gold-dark dark:text-ggc-gold text-xs font-bold tracking-wide uppercase border border-ggc-gold/30">
              <Sparkles className="w-3.5 h-3.5" />
              Interactive Prototype Demo
            </span>
            <h2 className="fluid-section-title font-black text-ggc-dark dark:text-white mt-3">
              Jelajahi Sampel &ldquo;Potential Signature&rdquo; &amp; Bentuk Radar
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-[#A0B9AE] mt-3 leading-relaxed">
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
                      : "bg-white dark:bg-[#07261B] text-gray-600 dark:text-[#A0B9AE] hover:text-ggc dark:hover:text-ggc-gold hover:bg-ggc-subtle/60 dark:hover:bg-[#093525] border border-gray-200 dark:border-[#103D2B] shadow-sm"
                  }`}
                >
                  <Sparkles
                    className={`w-4 h-4 ${
                      isActive ? "text-ggc-gold" : "text-gray-400 dark:text-gray-500"
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
              <div className="rounded-3xl bg-gradient-to-br from-ggc-dark via-[#093D2C] to-ggc dark:from-[#041D14] dark:via-[#072B1E] dark:to-[#031810] text-white p-6 sm:p-10 shadow-2xl border border-ggc-gold/40 relative overflow-hidden transition-all duration-300">
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
                  <div className="lg:col-span-6 bg-white dark:bg-[#07261B] text-gray-900 dark:text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-ggc-gold/30 dark:border-ggc-gold/40 flex flex-col items-center justify-center transition-colors">
                    <div className="w-full flex items-center justify-between pb-3 border-b border-gray-100 dark:border-[#103D2B] mb-2">
                      <span className="text-xs font-bold uppercase tracking-wide text-ggc-dark dark:text-ggc-gold">
                        Bentuk Poligon Radar Talenta
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-ggc-gold/20 dark:bg-ggc-gold/25 text-ggc-gold-dark dark:text-ggc-gold border border-ggc-gold/30">
                        6 Sumbu Kognitif
                      </span>
                    </div>

                    <InteractiveRadarChart
                      data={activeProfile.radarData}
                      size={290}
                      fillColor="rgba(11, 70, 50, 0.25)"
                      strokeColor="#0B4632"
                    />

                    <div className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">
                      Arahkan kursor pada titik sudut untuk melihat skor kecocokan sumbu kognitif.
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* ================= THE 7 EVALUATION DIMENSIONS SECTION (MODERN BENTO GRID) ================= */}
      <section id="metodologi" className="py-20 md:py-28 bg-[#FAFBF9] dark:bg-[#031810] border-b border-gray-200/80 dark:border-[#0E4230] relative overflow-hidden transition-colors">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-ggc/5 dark:bg-ggc/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-0 w-96 h-96 bg-ggc-gold/10 dark:bg-ggc-gold/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-14 md:mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#07261B] border border-ggc-gold/40 text-ggc-dark dark:text-white text-xs font-bold uppercase tracking-wider shadow-2xs mb-3">
              <Sparkles className="w-3.5 h-3.5 text-ggc-gold" />
              <span>Holistic Psychometric Framework</span>
            </div>
            <h2 className="fluid-section-title font-black text-ggc-dark dark:text-white tracking-tight leading-tight">
              7 Dimensi Penilaian Multi-Matriks
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-[#A0B9AE] mt-3.5 leading-relaxed">
              Arsitektur psikometri komprehensif 84 butir instrumen terukur yang menyilangkan bakat alami, preferensi minat, karakter kerja, nilai hidup, dan kesiapan akademik menuju kampus impian.
            </p>
          </div>

          {/* BENTO GRID CONTAINER */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 sm:gap-6">
            {/* TILE 1: TALENT (Bakat Kognitif) - Span 7 */}
            <SpotlightCard
              onClick={() => setActiveDimCode("T")}
              className={`lg:col-span-7 p-6 sm:p-8 rounded-3xl cursor-pointer border transition-all duration-300 flex flex-col justify-between group ${
                activeDimCode === "T"
                  ? "bg-white dark:bg-[#072B1E] border-ggc dark:border-ggc-gold shadow-xl ring-2 ring-ggc/20 dark:ring-ggc-gold/30"
                  : "bg-white/95 dark:bg-[#062419] border-gray-200/90 dark:border-[#103D2B] hover:border-ggc/40 dark:hover:border-ggc-gold/50 hover:shadow-lg"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 group-hover:scale-105 transition-transform">
                      <Brain className="w-6 h-6 text-ggc dark:text-emerald-400" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-ggc-gold-dark dark:text-ggc-gold block">
                        Dimensi 01 • Fondasi Utama
                      </span>
                      <h3 className="text-lg sm:text-xl font-black text-ggc-dark dark:text-white">
                        Talent (Bakat Kognitif)
                      </h3>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 shrink-0">
                    12 Butir
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-gray-600 dark:text-[#A0B9AE] leading-relaxed">
                  Mengukur potensi kecerdasan alami: logika analitikal, penalaran spasial 3D, kecerdasan verbal, hingga pemodelan sistem terstruktur.
                </p>

                {/* Subdimension Visual Bars */}
                <div className="mt-6 p-4 rounded-2xl bg-gray-50/80 dark:bg-[#041B12] border border-gray-100 dark:border-[#0E3827] space-y-2.5">
                  <div className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center justify-between">
                    <span>6 Sumbu Subdimensi Bakat</span>
                    <span className="text-ggc dark:text-ggc-gold font-bold">Bobot Teruji</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                    {[
                      { name: "Logika Analitikal", val: "96%" },
                      { name: "Penalaran Spasial", val: "88%" },
                      { name: "Kecerdasan Verbal", val: "84%" },
                      { name: "Analisis Sistem", val: "92%" },
                      { name: "Kreativitas Estetika", val: "78%" },
                      { name: "Kecerdasan Sosial", val: "86%" },
                    ].map((sub) => (
                      <div key={sub.name} className="p-2 rounded-xl bg-white dark:bg-[#07261B] border border-gray-200/80 dark:border-[#103D2B] text-center">
                        <div className="text-[10px] font-semibold text-gray-600 dark:text-[#A0B9AE] truncate">{sub.name}</div>
                        <div className="text-xs font-black text-ggc dark:text-ggc-gold mt-0.5">{sub.val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sample Question Strip */}
              <div className="mt-5 pt-4 border-t border-gray-100 dark:border-[#0E3827] flex items-start gap-2.5 text-xs text-gray-700 dark:text-[#C7DCD2] bg-emerald-50/50 dark:bg-[#041B12] p-3 rounded-2xl border border-emerald-100 dark:border-[#0E3827]">
                <span className="text-base shrink-0">💡</span>
                <p className="italic">
                  &ldquo;Saya dengan cepat mampu menangkap pola sebab-akibat dalam data angka atau grafik rumit.&rdquo;
                </p>
              </div>
            </SpotlightCard>

            {/* TILE 2: INTEREST (Minat Karier) - Span 5 */}
            <SpotlightCard
              onClick={() => setActiveDimCode("I")}
              className={`lg:col-span-5 p-6 sm:p-8 rounded-3xl cursor-pointer border transition-all duration-300 flex flex-col justify-between group ${
                activeDimCode === "I"
                  ? "bg-white dark:bg-[#072B1E] border-ggc dark:border-ggc-gold shadow-xl ring-2 ring-ggc/20 dark:ring-ggc-gold/30"
                  : "bg-white/95 dark:bg-[#062419] border-gray-200/90 dark:border-[#103D2B] hover:border-ggc/40 dark:hover:border-ggc-gold/50 hover:shadow-lg"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40 group-hover:scale-105 transition-transform">
                      <Target className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
                        Dimensi 02 • Orientasi Karier
                      </span>
                      <h3 className="text-lg sm:text-xl font-black text-ggc-dark dark:text-white">
                        Interest (Minat Karier)
                      </h3>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40 shrink-0">
                    12 Butir
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-gray-600 dark:text-[#A0B9AE] leading-relaxed">
                  Menjelajahi ketertarikan autentik siswa terhadap ragam ranah industri modern: Sains, Komputasi AI, Desain, Bisnis, Medis, hingga Regulasi.
                </p>

                {/* 4 Klaster Industri */}
                <div className="mt-6 space-y-2">
                  <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                    Klaster Minat Unggulan:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#07261B] border border-gray-200/80 dark:border-[#103D2B] flex items-center gap-2">
                      <span className="text-sm">💻</span>
                      <span className="text-xs font-bold text-gray-800 dark:text-[#D1E2DA] truncate">Teknologi & AI</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#07261B] border border-gray-200/80 dark:border-[#103D2B] flex items-center gap-2">
                      <span className="text-sm">🔬</span>
                      <span className="text-xs font-bold text-gray-800 dark:text-[#D1E2DA] truncate">Sains & Medis</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#07261B] border border-gray-200/80 dark:border-[#103D2B] flex items-center gap-2">
                      <span className="text-sm">📈</span>
                      <span className="text-xs font-bold text-gray-800 dark:text-[#D1E2DA] truncate">Bisnis & Startup</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#07261B] border border-gray-200/80 dark:border-[#103D2B] flex items-center gap-2">
                      <span className="text-sm">🎨</span>
                      <span className="text-xs font-bold text-gray-800 dark:text-[#D1E2DA] truncate">Seni & Kreatif</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sample Question */}
              <div className="mt-5 pt-4 border-t border-gray-100 dark:border-[#0E3827] flex items-start gap-2.5 text-xs text-gray-700 dark:text-[#C7DCD2] bg-amber-50/50 dark:bg-[#041B12] p-3 rounded-2xl border border-amber-100 dark:border-amber-900/40">
                <span className="text-base shrink-0">🎯</span>
                <p className="italic">
                  &ldquo;Saya antusias belajar bahasa pemrograman, kecerdasan buatan, atau pengembangan aplikasi perangkat lunak.&rdquo;
                </p>
              </div>
            </SpotlightCard>

            {/* TILE 3: PERSONALITY (Gaya Kerja & Grit) - Span 4 */}
            <SpotlightCard
              onClick={() => setActiveDimCode("P")}
              className={`lg:col-span-4 p-6 rounded-3xl cursor-pointer border transition-all duration-300 flex flex-col justify-between group ${
                activeDimCode === "P"
                  ? "bg-white dark:bg-[#072B1E] border-ggc dark:border-ggc-gold shadow-xl ring-2 ring-ggc/20 dark:ring-ggc-gold/30"
                  : "bg-white/95 dark:bg-[#062419] border-gray-200/90 dark:border-[#103D2B] hover:border-ggc/40 dark:hover:border-ggc-gold/50 hover:shadow-lg"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40 group-hover:scale-105 transition-transform">
                    <UserCheck className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                  </div>
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
                    12 Butir
                  </span>
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-400 block">
                  Dimensi 03
                </span>
                <h3 className="text-base font-black text-ggc-dark dark:text-white mt-0.5">
                  Personality (Gaya Kerja & Grit)
                </h3>
                <p className="text-xs text-gray-600 dark:text-[#A0B9AE] mt-2 leading-relaxed">
                  Memotret keteraturan jadwal (Conscientiousness), stabilitas emosional, kemandirian, dan daya tahan grit pantang menyerah.
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {["Conscientiousness", "Ketahanan (Grit)", "Keterbukaan Ide", "Stabilitas Emosional"].map((t) => (
                    <span key={t} className="text-[10px] font-bold px-2 py-1 rounded-lg bg-gray-50 dark:bg-[#07261B] text-gray-700 dark:text-[#C7DCD2] border border-gray-200 dark:border-[#103D2B]">
                      ✓ {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-[#0E3827] text-[11px] text-gray-600 dark:text-[#C7DCD2] italic bg-blue-50/50 dark:bg-[#041B12] p-2.5 rounded-xl border border-blue-100 dark:border-blue-900/40">
                &ldquo;Saya tidak mudah menyerah meskipun menghadapi kegagalan berulang kali dalam proyek sulit.&rdquo;
              </div>
            </SpotlightCard>

            {/* TILE 4: VALUES (Nilai Pribadi & Integritas) - Span 4 */}
            <SpotlightCard
              onClick={() => setActiveDimCode("V")}
              className={`lg:col-span-4 p-6 rounded-3xl cursor-pointer border transition-all duration-300 flex flex-col justify-between group ${
                activeDimCode === "V"
                  ? "bg-white dark:bg-[#072B1E] border-ggc dark:border-ggc-gold shadow-xl ring-2 ring-ggc/20 dark:ring-ggc-gold/30"
                  : "bg-white/95 dark:bg-[#062419] border-gray-200/90 dark:border-[#103D2B] hover:border-ggc/40 dark:hover:border-ggc-gold/50 hover:shadow-lg"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40 group-hover:scale-105 transition-transform">
                    <Heart className="w-5 h-5 text-rose-700 dark:text-rose-400" />
                  </div>
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40">
                    12 Butir
                  </span>
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700 dark:text-rose-400 block">
                  Dimensi 04
                </span>
                <h3 className="text-base font-black text-ggc-dark dark:text-white mt-0.5">
                  Values (Nilai Pribadi)
                </h3>
                <p className="text-xs text-gray-600 dark:text-[#A0B9AE] mt-2 leading-relaxed">
                  Prinsip etika mendasar yang menggerakkan motivasi: integritas moral, altruisme sosial, otonomi bebas, dan prestasi unggul.
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {["Integritas Moral", "Altruisme & Dampak", "Otonomi Kerja", "Prestasi Unggul"].map((t) => (
                    <span key={t} className="text-[10px] font-bold px-2 py-1 rounded-lg bg-gray-50 dark:bg-[#07261B] text-gray-700 dark:text-[#C7DCD2] border border-gray-200 dark:border-[#103D2B]">
                      ⚖️ {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-[#0E3827] text-[11px] text-gray-600 dark:text-[#C7DCD2] italic bg-rose-50/50 dark:bg-[#041B12] p-2.5 rounded-xl border border-rose-100 dark:border-rose-900/40">
                &ldquo;Saya menolak berkompromi terhadap kejujuran dan etika moral, apapun imbalan materinya.&rdquo;
              </div>
            </SpotlightCard>

            {/* TILE 5: READINESS (Kesiapan Mental Transisi Kuliah) - Span 4 */}
            <SpotlightCard
              onClick={() => setActiveDimCode("R")}
              className={`lg:col-span-4 p-6 rounded-3xl cursor-pointer border transition-all duration-300 flex flex-col justify-between group ${
                activeDimCode === "R"
                  ? "bg-white dark:bg-[#072B1E] border-ggc dark:border-ggc-gold shadow-xl ring-2 ring-ggc/20 dark:ring-ggc-gold/30"
                  : "bg-white/95 dark:bg-[#062419] border-gray-200/90 dark:border-[#103D2B] hover:border-ggc/40 dark:hover:border-ggc-gold/50 hover:shadow-lg"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="p-2.5 rounded-2xl bg-red-50 dark:bg-red-950/80 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800/40 group-hover:scale-105 transition-transform">
                    <Flame className="w-5 h-5 text-red-700 dark:text-red-400" />
                  </div>
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-red-50 dark:bg-red-950/80 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800/40">
                    12 Butir
                  </span>
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-700 dark:text-red-400 block">
                  Dimensi 05
                </span>
                <h3 className="text-base font-black text-ggc-dark dark:text-white mt-0.5">
                  Readiness (Kesiapan Kuliah)
                </h3>
                <p className="text-xs text-gray-600 dark:text-[#A0B9AE] mt-2 leading-relaxed">
                  Tingkat kemandirian belajar, resiliensi terhadap beban tugas universitas, dan kesiapan hidup mandiri saat kuliah.
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {["Manajemen Stres", "Kemandirian Belajar", "Daya Adaptasi", "Regulasi Finansial"].map((t) => (
                    <span key={t} className="text-[10px] font-bold px-2 py-1 rounded-lg bg-gray-50 dark:bg-[#07261B] text-gray-700 dark:text-[#C7DCD2] border border-gray-200 dark:border-[#103D2B]">
                      🔥 {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-[#0E3827] text-[11px] text-gray-600 dark:text-[#C7DCD2] italic bg-red-50/50 dark:bg-[#041B12] p-2.5 rounded-xl border border-red-100 dark:border-red-900/40">
                &ldquo;Saya siap mengelola waktu dan keuangan pribadi secara mandiri tanpa harus selalu diarahkan orang tua.&rdquo;
              </div>
            </SpotlightCard>

            {/* TILE 6: ACADEMIC & CAREER SYNERGY - Span 7 */}
            <SpotlightCard
              onClick={() => setActiveDimCode("A")}
              className={`lg:col-span-7 p-6 sm:p-8 rounded-3xl cursor-pointer border transition-all duration-300 flex flex-col justify-between group ${
                activeDimCode === "A" || activeDimCode === "C"
                  ? "bg-white dark:bg-[#072B1E] border-ggc dark:border-ggc-gold shadow-xl ring-2 ring-ggc/20 dark:ring-ggc-gold/30"
                  : "bg-white/95 dark:bg-[#062419] border-gray-200/90 dark:border-[#103D2B] hover:border-ggc/40 dark:hover:border-ggc-gold/50 hover:shadow-lg"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40 group-hover:scale-105 transition-transform">
                      <BookOpen className="w-6 h-6 text-indigo-700 dark:text-indigo-400" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 block">
                        Dimensi 06 & 07 • Sinergi Jalur Prestasi
                      </span>
                      <h3 className="text-lg sm:text-xl font-black text-ggc-dark dark:text-white">
                        Academic & Career Pathway (24 Butir)
                      </h3>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-50 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40 shrink-0">
                    12 + 12 Butir
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-gray-600 dark:text-[#A0B9AE] leading-relaxed">
                  Menghubungkan rumpun mata pelajaran sekolah (Saintek, Soshum, Bisnis, Seni) langsung ke proyeksi peran karier masa depan (Peneliti Ahli, Eksekutif Korporat, Advokat, Founder).
                </p>

                {/* Flow Diagram Mini in Card */}
                <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-gray-50 via-indigo-50/30 to-gray-50 dark:from-[#041B12] dark:via-[#07261B] dark:to-[#041B12] border border-gray-200/80 dark:border-[#103D2B] grid grid-cols-1 sm:grid-cols-3 gap-3 text-center items-center">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#07261B] border border-gray-200 dark:border-[#103D2B]">
                    <span className="text-[10px] font-extrabold text-indigo-700 dark:text-indigo-400 uppercase block">Input Akademik</span>
                    <p className="text-xs font-bold text-gray-800 dark:text-[#D1E2DA] mt-0.5">Kalkulus, Sosial, Desain</p>
                  </div>
                  <div className="text-xs font-black text-ggc-gold flex items-center justify-center gap-1">
                    <span>Multi-Matrix</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#07261B] border border-gray-200 dark:border-[#103D2B]">
                    <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 uppercase block">Target Karier</span>
                    <p className="text-xs font-bold text-gray-800 dark:text-[#D1E2DA] mt-0.5">Software Lead, Founder, Dokter</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100 dark:border-[#0E3827] flex items-start gap-2.5 text-xs text-gray-700 dark:text-[#C7DCD2] bg-indigo-50/50 dark:bg-[#041B12] p-3 rounded-2xl border border-indigo-100 dark:border-indigo-900/40">
                <span className="text-base shrink-0">📚</span>
                <p className="italic">
                  &ldquo;Saya memproyeksikan diri saya memimpin proyek transformasi digital atau korporasi skala nasional.&rdquo;
                </p>
              </div>
            </SpotlightCard>

            {/* TILE 7: GRAND MULTI-MATRIX ENGINE (84 BUTIR) - Span 5 */}
            <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-[#063424] bg-emerald-luxury text-white shadow-2xl flex flex-col justify-between relative overflow-hidden border-2 border-ggc-gold/50">
              {/* Luxury Ornaments */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-ggc-gold/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-400/15 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-ggc-gold/60 rounded-tl-sm pointer-events-none" />
              <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-ggc-gold/60 rounded-tr-sm pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <img src="/logo.png" alt="" className="w-7 h-7 object-contain bg-white rounded-lg p-0.5" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-ggc-gold">
                    Multi-Matrix Engine
                  </span>
                </div>

                <div className="text-2xl sm:text-3xl font-black text-white mt-1 leading-tight">
                  84 Butir Terpadu
                </div>
                <p className="text-xs text-ggc-gold font-bold mt-0.5">
                  7 Dimensi × 12 Butir Terstandar Nasional
                </p>

                <p className="text-xs text-ggc-subtle/85 mt-3 leading-relaxed">
                  Menghasilkan akurasi evaluasi tinggi tanpa membebani daya konsentrasi siswa. Dilengkapi penyimpanan otomatis realtime dan verifikasi resmi.
                </p>

                <div className="mt-5 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-white/90">
                    <CheckCircle2 className="w-4 h-4 text-ggc-gold shrink-0" />
                    <span>Zero-Bias & Anti-Stress Flow (15–20 Menit)</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/90">
                    <CheckCircle2 className="w-4 h-4 text-ggc-gold shrink-0" />
                    <span>Rekomendasi Kampus PTN & PTS Terbaik</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/90">
                    <CheckCircle2 className="w-4 h-4 text-ggc-gold shrink-0" />
                    <span>Laporan PDF Resmi Siap Diskusi Bareng Orang Tua</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-white/15 relative z-10 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCheckoutModalOpen(true)}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl text-xs font-black text-ggc-dark bg-gradient-to-r from-[#E6D5A8] via-ggc-gold to-ggc-gold-dark hover:shadow-xl hover:scale-[1.02] active:scale-[0.99] transition-all cursor-pointer shadow-lg"
                >
                  <CreditCard className="w-4 h-4 text-ggc-dark" />
                  <span>Beli Akses Asesmen 84 Butir (Rp 49.000)</span>
                  <ArrowRight className="w-4 h-4 text-ggc-dark" />
                </button>
                <Link
                  href="/auth/register"
                  className="text-[11px] text-white/80 hover:text-white text-center font-semibold underline underline-offset-4"
                >
                  Atau Daftar Akun Langsung →
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================= 3-STEP JOURNEY / HOW IT WORKS ================= */}
      <section id="alur" className="py-20 bg-[#FAFBF9] dark:bg-[#031810] border-b border-ggc-subtle dark:border-[#0E4230] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-ggc-gold-dark dark:text-ggc-gold">
              Simple & Seamless Flow
            </span>
            <h2 className="fluid-section-title font-black text-ggc-dark dark:text-white mt-2">
              3 Langkah Menuju Kepastian Jurusan
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-[#A0B9AE] mt-3 leading-relaxed">
              Hanya butuh waktu sekitar 15–20 menit untuk memetakan arah masa depan Anda secara komprehensif.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <SpotlightCard className="p-8 rounded-3xl bg-white dark:bg-[#07261B] border border-gray-200/90 dark:border-[#11402E] shadow-sm hover:shadow-lg transition-all relative">
              <div className="w-12 h-12 rounded-2xl bg-ggc text-ggc-gold font-black text-lg flex items-center justify-center mb-6 shadow-md">
                1
              </div>
              <h3 className="text-lg font-bold text-ggc-dark dark:text-white">
                Registrasi & Isi 84 Soal
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-[#A0B9AE] mt-3 leading-relaxed">
                Buat akun siswa dan jawab 84 butir instrumen skala Likert (1-5) dengan antarmuka responsif dan penyimpanan otomatis per butir soal.
              </p>
              <div className="mt-5 text-xs font-semibold text-ggc dark:text-ggc-gold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-ggc-gold" />
                <span>Estimasi waktu 15–20 menit</span>
              </div>
            </SpotlightCard>

            {/* Step 2 */}
            <SpotlightCard className="p-8 rounded-3xl bg-white dark:bg-[#07261B] border border-gray-200/90 dark:border-[#11402E] shadow-sm hover:shadow-lg transition-all relative">
              <div className="w-12 h-12 rounded-2xl bg-ggc-gold text-ggc-dark font-black text-lg flex items-center justify-center mb-6 shadow-md">
                2
              </div>
              <h3 className="text-lg font-bold text-ggc-dark dark:text-white">
                Kalkulasi Multi-Matrix
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-[#A0B9AE] mt-3 leading-relaxed">
                Algoritma secara instan mengolah Person Profile Anda dan membandingkannya dengan bobot ratusan program studi untuk menentukan fit score tertinggi.
              </p>
              <div className="mt-5 text-xs font-semibold text-ggc dark:text-ggc-gold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-ggc-gold" />
                <span>Kalkulasi realtime instan</span>
              </div>
            </SpotlightCard>

            {/* Step 3 */}
            <SpotlightCard className="p-8 rounded-3xl bg-white dark:bg-[#07261B] border border-gray-200/90 dark:border-[#11402E] shadow-sm hover:shadow-lg transition-all relative">
              <div className="w-12 h-12 rounded-2xl bg-ggc-light text-white font-black text-lg flex items-center justify-center mb-6 shadow-md">
                3
              </div>
              <h3 className="text-lg font-bold text-ggc-dark dark:text-white">
                Dashboard & Laporan PDF
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-[#A0B9AE] mt-3 leading-relaxed">
                Tinjau Potential Signature Anda, pelajari wawasan naratif, dan unduh dokumen PDF resmi 2 halaman untuk konseling bersama keluarga & guru BK.
              </p>
              <div className="mt-5 text-xs font-semibold text-ggc dark:text-ggc-gold flex items-center gap-1.5">
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
              <h2 className="fluid-section-title font-black text-white tracking-tight">
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
      <section id="faq" className="py-24 bg-white dark:bg-[#031810] border-b border-ggc-subtle dark:border-[#0E4230] relative overflow-hidden transition-colors">
        {/* Ambient background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-ggc-gold/10 dark:bg-ggc-gold/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-ggc/5 dark:bg-ggc/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-ggc-gold/15 dark:bg-ggc-gold/20 text-ggc-gold-dark dark:text-ggc-gold text-xs font-bold uppercase tracking-wider border border-ggc-gold/30 mb-3 shadow-2xs">
              <HelpCircle className="w-4 h-4 text-ggc-gold-dark dark:text-ggc-gold" />
              <span>Pusat Bantuan & Metodologi Asesmen</span>
            </div>
            <h2 className="fluid-section-title font-black text-ggc-dark dark:text-white tracking-tight">
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-[#A0B9AE] mt-4 leading-relaxed">
              Dapatkan pemahaman menyeluruh seputar validitas instrumen 84 butir, kerahasiaan data, algoritma multi-matriks, serta cara memanfaatkan laporan hasil asesmen secara maksimal.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Search, Category Pills & Counselor Assistance Card (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Live Search Box */}
              <div className="p-5 rounded-3xl bg-[#FAFBF9] dark:bg-[#07261B] border border-gray-200/90 dark:border-[#11402E] shadow-sm">
                <label
                  htmlFor="faq-search-input"
                  className="block text-xs font-bold uppercase tracking-wider text-ggc-dark dark:text-white mb-2.5"
                >
                  Cari Topik Pertanyaan
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="faq-search-input"
                    type="text"
                    value={faqSearch}
                    onChange={(e) => setFaqSearch(e.target.value)}
                    placeholder="Ketik kata kunci: misal 'durasi', 'pdf', 'jurusan'..."
                    className="w-full pl-9.5 pr-8 py-2.5 rounded-xl text-xs bg-white dark:bg-[#041B12] text-gray-800 dark:text-white border border-gray-200 dark:border-[#103D2B] focus:border-ggc focus:ring-2 focus:ring-ggc/20 focus:outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  />
                  {faqSearch && (
                    <button
                      type="button"
                      onClick={() => setFaqSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-0.5"
                      title="Hapus pencarian"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Category Filter Tabs */}
              <div className="p-5 rounded-3xl bg-[#FAFBF9] dark:bg-[#07261B] border border-gray-200/90 dark:border-[#11402E] shadow-sm">
                <div className="text-xs font-bold uppercase tracking-wider text-ggc-dark dark:text-white mb-3">
                  Kategori Pembahasan
                </div>
                <div className="flex flex-col gap-1.5">
                  {faqCategoryList.map((cat) => {
                    const isSelected = faqCategory === cat.key;
                    const count =
                      cat.key === "ALL"
                        ? faqs.length
                        : faqs.filter((f) => f.category === cat.key).length;
                    return (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() => setFaqCategory(cat.key)}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                          isSelected
                            ? "bg-ggc text-white shadow-md shadow-ggc/15 ring-2 ring-ggc-gold/30"
                            : "bg-white dark:bg-[#041B12] text-gray-600 dark:text-[#A0B9AE] hover:text-ggc dark:hover:text-ggc-gold hover:bg-ggc-subtle/50 dark:hover:bg-[#093525] border border-gray-200/80 dark:border-[#103D2B]"
                        }`}
                      >
                        <span>{cat.label}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : "bg-gray-100 dark:bg-[#082E20] text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Counselor Help Box */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-ggc-dark to-ggc text-white shadow-xl border border-ggc-gold/40 relative overflow-hidden">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-bold text-ggc-gold uppercase tracking-wider">
                    Tim Bimbingan Konseling GGC
                  </span>
                </div>
                <h3 className="text-base font-bold text-white leading-snug">
                  Punya Pertanyaan Khusus Terkait Program Sekolah?
                </h3>
                <p className="text-xs text-ggc-subtle/90 mt-2 leading-relaxed">
                  Tim psikolog dan konselor karier kami siap memberikan konsultasi gratis seputar implementasi asesmen untuk angkatan siswa.
                </p>
                <div className="mt-5">
                  <a
                    href="https://wa.me/6281234567890?text=Halo%20Admin%20Go%20Great%20Career,%20saya%20ingin%20tanya%20seputar%20Study%20Fit%20Assessment"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-ggc-dark bg-ggc-gold hover:bg-ggc-gold-dark hover:text-white transition-all shadow-md"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Hubungi Konselor via WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: FAQ Accordion Cards with Spotlight Glow (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              {filteredFaqs.length === 0 ? (
                <div className="p-10 rounded-3xl bg-[#FAFBF9] border border-gray-200 text-center">
                  <HelpCircle className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <h4 className="text-base font-bold text-gray-800">
                    Tidak Ditemukan Pertanyaan yang Cocok
                  </h4>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                    Kata kunci "{faqSearch}" tidak sesuai dengan pertanyaan yang tersedia. Silakan gunakan kata kunci lain atau reset pencarian.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setFaqSearch("");
                      setFaqCategory("ALL");
                    }}
                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-ggc bg-ggc-subtle hover:bg-ggc/20 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Pencarian</span>
                  </button>
                </div>
              ) : (
                filteredFaqs.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <SpotlightCard
                      key={faq.id}
                      className={`rounded-3xl border transition-all duration-300 overflow-hidden ${
                        isOpen
                          ? "bg-white dark:bg-[#082E20] border-ggc/60 dark:border-ggc-gold/40 shadow-xl ring-2 ring-ggc-gold/20"
                          : "bg-[#FAFBF9] dark:bg-[#07261B] border-gray-200/90 dark:border-[#11402E] hover:border-ggc/40 dark:hover:border-ggc-gold/40 hover:bg-white dark:hover:bg-[#082E20] shadow-xs"
                      }`}
                    >
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={`faq-answer-${faq.id}`}
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full text-left p-6 sm:p-7 flex items-start justify-between gap-4 cursor-pointer focus:outline-none"
                      >
                        <div className="flex-1">
                          {/* Category and Index Pill */}
                          <div className="flex flex-wrap items-center gap-2 mb-2.5">
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-ggc-subtle dark:bg-emerald-950/80 text-ggc dark:text-emerald-300 border border-ggc/20 dark:border-emerald-800/40">
                              {faq.categoryLabel}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
                              {faq.tag}
                            </span>
                          </div>

                          {/* Question Text */}
                          <h3
                            className={`text-base sm:text-lg font-bold leading-snug transition-colors ${
                              isOpen ? "text-ggc-dark dark:text-white" : "text-gray-800 dark:text-[#D1E2DA]"
                            }`}
                          >
                            {faq.q}
                          </h3>
                        </div>

                        {/* Expand / Collapse Indicator Button */}
                        <div
                          className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                            isOpen
                              ? "bg-ggc text-white rotate-180 shadow-md"
                              : "bg-white dark:bg-[#041B12] text-gray-400 border border-gray-200 dark:border-[#103D2B] group-hover:border-ggc/40 group-hover:text-ggc dark:group-hover:text-ggc-gold"
                          }`}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </button>

                      {/* Answer Body with Key Takeaway */}
                      {isOpen && (
                        <div
                          id={`faq-answer-${faq.id}`}
                          className="px-6 sm:px-7 pb-6 pt-2 border-t border-gray-100 dark:border-[#0E4230] text-xs sm:text-sm text-gray-600 dark:text-[#C7DCD2] leading-relaxed space-y-3"
                        >
                          <p>{faq.a}</p>

                          {/* Key Takeaway Callout */}
                          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-ggc-subtle/80 via-emerald-50/50 to-amber-50/50 dark:from-[#052016] dark:via-[#072B1E] dark:to-[#052016] border border-ggc/20 dark:border-ggc-gold/30 flex items-start gap-2.5">
                            <Lightbulb className="w-4 h-4 text-ggc-gold-dark dark:text-ggc-gold shrink-0 mt-0.5" />
                            <div className="text-xs text-ggc-dark dark:text-[#E8F1EC] font-medium leading-relaxed">
                              <strong className="text-ggc dark:text-ggc-gold font-bold">Key Takeaway: </strong>
                              {faq.takeaway}
                            </div>
                          </div>
                        </div>
                      )}
                    </SpotlightCard>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ================= FINAL CALL-TO-ACTION BANNER ================= */}
      <section className="py-20 bg-gradient-to-b from-[#FAFBF9] to-white dark:from-[#031810] dark:to-[#07261B] relative overflow-hidden transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-ggc-dark via-ggc to-ggc-light dark:from-[#052016] dark:via-[#072B1E] dark:to-[#031810] p-8 sm:p-14 text-white text-center shadow-2xl border border-ggc-gold/40 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-ggc-gold/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="inline-block p-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 mb-4 shadow-md">
                <img
                  src="/logo.png"
                  alt="Go Great Career Logo"
                  className="w-12 h-12 object-contain mx-auto"
                />
              </div>

              <h2 className="fluid-section-title font-black text-white tracking-tight leading-tight">
                Siap Menemukan Arah Studi & Karier Terbaikmu?
              </h2>

              <p className="mt-4 text-xs sm:text-base text-ggc-subtle/90 leading-relaxed">
                Bergabunglah dengan ribuan siswa yang telah menemukan kejelasan langkah masa depan bersama <strong>GGC Study Fit Assessment™</strong>.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                {isStudent ? (
                  <>
                    <Link
                      href="/student/dashboard"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-ggc-dark bg-ggc-gold hover:bg-ggc-gold-dark hover:text-white shadow-xl transition-all duration-200"
                    >
                      <span>Buka Dashboard Siswa</span>
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link
                      href="/student/assessment"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-white bg-white/15 hover:bg-white/25 border border-white/30 backdrop-blur-md transition-all duration-200"
                    >
                      <span>Lanjutkan Asesmen 84 Butir</span>
                    </Link>
                  </>
                ) : isAdmin ? (
                  <>
                    <Link
                      href="/admin/dashboard"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-ggc-dark bg-ggc-gold hover:bg-ggc-gold-dark hover:text-white shadow-xl transition-all duration-200"
                    >
                      <span>Buka Admin Portal</span>
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link
                      href="/admin/questions"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-white bg-white/15 hover:bg-white/25 border border-white/30 backdrop-blur-md transition-all duration-200"
                    >
                      <span>Bank Soal (84 Butir)</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsCheckoutModalOpen(true)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-ggc-dark bg-ggc-gold hover:bg-ggc-gold-dark hover:text-white shadow-xl transition-all duration-200 cursor-pointer"
                    >
                      <CreditCard className="w-5 h-5" />
                      <span>Beli Akses Asesmen (Rp 49.000)</span>
                    </button>
                    <Link
                      href="/auth/register"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-white bg-white/15 hover:bg-white/25 border border-white/30 backdrop-blur-md transition-all duration-200"
                    >
                      <span>Daftar Akun Siswa</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= REFINED FOOTER ================= */}
      <footer className="mt-auto py-12 bg-ggc-dark dark:bg-[#02140D] text-white border-t border-ggc-light/30 dark:border-[#0E4230] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-8 border-b border-white/10 dark:border-white/5">
            {/* Logo and Tagline */}
            <div className="text-center md:text-left">
              <BrandLogo variant="light" size="md" href="/" />
              <p className="text-xs text-ggc-subtle/70 mt-2 max-w-sm">
                Instrumen asesmen multi-matriks komprehensif untuk pemetaan potensi studi dan karier masa depan Indonesia.
              </p>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap justify-center gap-6 text-xs text-ggc-subtle/80 font-medium">
              <a href="#fitur" className="hover:text-white dark:hover:text-ggc-gold transition-colors">
                Keunggulan
              </a>
              <a href="#metodologi" className="hover:text-white dark:hover:text-ggc-gold transition-colors">
                7 Dimensi
              </a>
              <a href="#signatures" className="hover:text-white dark:hover:text-ggc-gold transition-colors">
                Potential Signature
              </a>
              <a href="#alur" className="hover:text-white dark:hover:text-ggc-gold transition-colors">
                Cara Kerja
              </a>
              <a href="#faq" className="hover:text-white dark:hover:text-ggc-gold transition-colors">
                FAQ
              </a>
              <Link href="/auth/login" className="hover:text-white dark:hover:text-ggc-gold transition-colors">
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

      {/* Mobile Sticky Thumb-Bar (Always within reach of one-hand thumb zone) */}
      <aside
        aria-label="Aksi Cepat Mobile"
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 p-3 pb-safe bg-white/95 dark:bg-[#041D14]/95 backdrop-blur-md border-t border-gray-200/90 dark:border-[#0E4230] shadow-2xl transition-transform no-print"
      >
        <div className="flex items-center gap-2 max-w-md mx-auto">
          {isStudent ? (
            <Link
              href="/student/assessment"
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-black text-white bg-ggc hover:bg-ggc-light active:scale-[0.98] shadow-md shadow-ggc/30 text-xs sm:text-sm transition-all"
            >
              <Sparkles className="w-4 h-4 text-ggc-gold" />
              <span>Lanjut Asesmen 84 Butir</span>
              <ArrowRight className="w-4 h-4 text-ggc-gold" />
            </Link>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsCheckoutModalOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-black text-ggc-dark bg-gradient-to-r from-[#E6D5A8] via-ggc-gold to-ggc-gold-dark active:scale-[0.98] shadow-md text-xs sm:text-sm transition-all cursor-pointer"
              >
                <CreditCard className="w-4 h-4 text-ggc-dark" />
                <span>Beli Akses (Rp 49rb)</span>
              </button>
              <Link
                href="/auth/login"
                className="px-4 py-3 rounded-xl font-bold text-ggc-dark dark:text-ggc-gold bg-gray-100 dark:bg-[#082E20] hover:bg-gray-200 dark:hover:bg-[#0C3E2B] text-xs text-center shrink-0 border border-gray-200 dark:border-[#103D2B] active:scale-95 transition-all"
              >
                Masuk
              </Link>
            </>
          )}
        </div>
      </aside>

      {/* Midtrans Snap Payment Modal */}
      <MidtransCheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        price={49000}
      />
    </div>
  );
}
