import { ScoringResult } from "./scoring";

export interface CareerProfileInput {
  educationLevel: "SMA" | "SMK" | "KULIAH" | "GAP_YEAR" | string;
  currentMajor: string; // e.g. "MIPA", "IPS", "Rekayasa Perangkat Lunak", "Teknik Informatika", dll.
  formalOrg: string; // e.g. "Ketua OSIS", "Sekretaris MPK", "BEM Fakultas", "Anggota Divisi Acara"
  formalOrgRole?: string; // "Ketua / Wakil", "Koordinator / BPH", "Anggota Aktif", "Belum Ada"
  nonFormalExp: string; // e.g. "Ketua Karang Taruna", "Komunitas Relawan", "Pecinta Alam"
  hobbyInterest: string; // e.g. "Editing Video & Kreator Konten", "Coding Web", "Fotografi", "Musik"
  workExp?: string; // e.g. "Magang di Startup", "Freelance Graphic Designer", "Admin Toko Online"
  careerAspiration?: string; // e.g. "Product Manager", "Software Engineer", "Diplomat", "Wirausaha"
}

export interface LeadershipArchetype {
  name: string;
  subtitle: string;
  badge: string;
  description: string;
  collaborationStyle: string;
  superpower: string;
  blindspotToWatch: string;
}

export interface StrategicTrajectory {
  type: "LINEAR" | "HYBRID" | "ENTREPRENEURIAL";
  categoryLabel: string;
  title: string;
  roleExamples: string[];
  whyFitNarrative: string;
  prospectRating: string;
  growthPotential: string;
  skillsToMaster: string[];
  suggestedCertifications: string[];
}

export interface SynergyItem {
  category: "FORMAL_ORG" | "NON_FORMAL" | "ACADEMIC" | "WORK_HOBBY";
  sourceTitle: string;
  userInputValue: string;
  badge: string;
  unlockedCompetencies: string[];
  careerAdvantage: string;
}

export interface CareerOrientationSynthesis {
  hasProfile: boolean;
  profileData: CareerProfileInput;
  readinessScore: number;
  readinessLevel: "Siap Akselerasi Industri" | "Tinggi & Berkembang Pesat" | "Fondasi Potensial";
  leadershipArchetype: LeadershipArchetype;
  strategicTrajectories: StrategicTrajectory[];
  synergyMatrix: SynergyItem[];
  actionRoadmap: {
    immediateStep: string; // 1-3 bulan
    mediumTermStep: string; // 6-12 bulan
    longTermGoal: string; // 2-3 tahun
    recommendedPortfolioProjects: string[];
    networkingAdvice: string;
  };
}

/**
 * Intelligent Career Orientation Engine:
 * Synthesizes 84 psychometric results (RIASEC, dimension scores, recommended majors)
 * with the student's real-world experiences (formal leadership, non-formal community, current education, and work/hobbies).
 */
export function generateCareerOrientation(
  results: ScoringResult,
  input?: CareerProfileInput | null
): CareerOrientationSynthesis {
  // Default fallback if no profile provided yet
  if (!input || !input.currentMajor || (!input.formalOrg && !input.nonFormalExp && !input.currentMajor)) {
    return {
      hasProfile: false,
      profileData: {
        educationLevel: "SMA",
        currentMajor: "Belum Ditentukan",
        formalOrg: "",
        formalOrgRole: "Belum Ada",
        nonFormalExp: "",
        hobbyInterest: "",
        workExp: "",
        careerAspiration: "",
      },
      readinessScore: Math.round(results.overallReadinessScore * 18 + 10),
      readinessLevel: "Fondasi Potensial",
      leadershipArchetype: {
        name: "The Emerging Explorer",
        subtitle: "Potensi Kepemimpinan Multitalenta Sedang Berkembang",
        badge: "Potensial",
        description: "Profil Anda memiliki energi dan fleksibilitas adaptasi yang kuat untuk memetakan arah karir masa depan.",
        collaborationStyle: "Kolaborator Adaptif & Pembelajar Cepat",
        superpower: "Keingintahuan tinggi terhadap bidang-bidang baru",
        blindspotToWatch: "Fokus eksplorasi yang perlu dipersempit menjadi spesialisasi terarah",
      },
      strategicTrajectories: [],
      synergyMatrix: [],
      actionRoadmap: {
        immediateStep: "Lengkapi data pengalaman formal & non-formal Anda.",
        mediumTermStep: "Eksplorasi proyek portofolio pertama.",
        longTermGoal: "Bangun rekam jejak kepemimpinan spesifik.",
        recommendedPortfolioProjects: [],
        networkingAdvice: "Terhubung dengan mentor dan alumni.",
      },
    };
  }

  const {
    educationLevel = "SMA",
    currentMajor = "Umum",
    formalOrg = "",
    formalOrgRole = "Anggota Aktif",
    nonFormalExp = "",
    hobbyInterest = "",
    workExp = "",
    careerAspiration = "",
  } = input;

  const topMajor = results.studyRecommendations[0]?.majorName || "Teknologi & Manajemen";
  const topCluster = results.studyRecommendations[0]?.cluster || "Saintek";
  const primarySignature = results.potentialSignatures[0]?.archetype || "Strategis";

  // 1. DETERMINE LEADERSHIP ARCHETYPE BASED ON REAL-WORLD ORG & PSYCHOMETRICS
  const formalTextLower = `${formalOrg} ${formalOrgRole}`.toLowerCase();
  const nonFormalLower = `${nonFormalExp} ${hobbyInterest}`.toLowerCase();

  const isHighLeader =
    formalTextLower.includes("ketua") ||
    formalTextLower.includes("wakil") ||
    formalTextLower.includes("presiden") ||
    formalTextLower.includes("osis") ||
    formalTextLower.includes("bem") ||
    formalTextLower.includes("mpk") ||
    formalTextLower.includes("bph") ||
    formalTextLower.includes("koordinator");

  const hasCommunityGrassroot =
    nonFormalLower.includes("karang taruna") ||
    nonFormalLower.includes("relawan") ||
    nonFormalLower.includes("komunitas") ||
    nonFormalLower.includes("sosial") ||
    nonFormalLower.includes("pemberdayaan");

  const hasCreativeWorkHobby =
    nonFormalLower.includes("desain") ||
    nonFormalLower.includes("video") ||
    nonFormalLower.includes("coding") ||
    nonFormalLower.includes("konten") ||
    nonFormalLower.includes("musik") ||
    nonFormalLower.includes("foto") ||
    nonFormalLower.includes("game");

  let leadershipArchetype: LeadershipArchetype;

  if (isHighLeader && hasCommunityGrassroot) {
    leadershipArchetype = {
      name: "The Strategic Community Catalyst",
      subtitle: "Kombinasi Penggerak Akar Rumput & Orkestrator Kebijakan Formal",
      badge: "High Social Capital & Executive Lead",
      description: `Rekam jejak Anda di organisasi formal (${formalOrg || "OSIS/BEM"}) dipadukan dengan keterlibatan non-formal (${nonFormalExp || "Karang Taruna/Komunitas"}) menunjukkan kapasitas kepemimpinan langka: mampu merumuskan visi formal sekaligus menggerakkan massa secara persuasif tanpa ketergantungan pada otoritas jabatan semata.`,
      collaborationStyle: "Kepemimpinan Partisipatif & Transformasional (Lead by Empathy & Influence)",
      superpower: "Membangun konsensus di antara pihak-pihak dengan latar belakang dan kepentingan yang majemuk.",
      blindspotToWatch: "Kelelahan mengurus ekspektasi sosial; delegasikan tugas operasional secara tegas untuk menjaga fokus strategis.",
    };
  } else if (isHighLeader) {
    leadershipArchetype = {
      name: "The Executive System Orchestrator",
      subtitle: "Pengambil Keputusan Terstruktur dengan Integritas Eksekusi Tinggi",
      badge: "Executive Leadership Profile",
      description: `Pengalaman kepengurusan formal Anda di ${formalOrg || "institusi pendidikan"} membentuk kedisiplinan organisasi, pemahaman alur birokrasi, dan koordinasi antar-divisi. Dipadukan dengan skor asesmen (${primarySignature}), Anda memiliki profil manajerial yang matang untuk memimpin tim profesional.`,
      collaborationStyle: "Kepemimpinan Strategis & Berorientasi Solusi (Directive yet Inclusive)",
      superpower: "Mengurai kerumitan operasional menjadi target kerja terukur dan mengawal akuntabilitas tim.",
      blindspotToWatch: "Kecenderungan perfeksionis dalam alur formal; tetaplah fleksibel saat menghadapi situasi krisis tak terduga.",
    };
  } else if (hasCommunityGrassroot) {
    leadershipArchetype = {
      name: "The Grassroot People Mobilizer",
      subtitle: "Kekuatan Kolaborasi Organik & Kecerdasan Emosional Lapangan",
      badge: "High Grassroot Empathy",
      description: `Keterlibatan Anda dalam ${nonFormalExp || "kegiatan kemasyarakatan/Karang Taruna"} memperkuat kepekaan sosial, kemampuan negosiasi informal, serta daya resiliensi menghadapi dinamika masyarakat nyata yang tidak dipelajari di bangku kelas semata.`,
      collaborationStyle: "Kepemimpinan Humanis & Berbasis Relasi (Empathetic Facilitator)",
      superpower: "Mendengarkan aspirasi dari bawah dan mengubahnya menjadi gerakan bersama yang solid.",
      blindspotToWatch: "Pendokumentasian proses kerja yang perlu lebih terstruktur dan berbasis data kuantitatif.",
    };
  } else if (hasCreativeWorkHobby) {
    leadershipArchetype = {
      name: "The Creative Innovator & Craft Master",
      subtitle: "Spesialis Solutif Berdaya Cipta Tinggi dengan Kepekaan Estetika",
      badge: "Hands-on Innovator Profile",
      description: `Dedikasi Anda pada hobi dan proyek praktis (${hobbyInterest || "keahlian kreatif/teknis"}) memberi Anda keunggulan berupa portofolio nyata dan kebiasaan memecahkan masalah (*problem-solving by doing*). Anda memimpin melalui teladan karya dan standar kualitas tinggi.`,
      collaborationStyle: "Kepemimpinan Berbasis Keahlian (Lead by Expertise & Craft)",
      superpower: "Mewujudkan ide abstrak menjadi artefak atau purwarupa visual/fungsional yang konkrit.",
      blindspotToWatch: "Cenderung ingin menyelesaikan semuanya sendirian; mulailah melatih kepercayaan untuk mendelegasikan tugas.",
    };
  } else {
    leadershipArchetype = {
      name: "The Agile Analytical Problem-Solver",
      subtitle: "Penalaran Kritis Berbasis Data dengan Potensi Karir Terbuka Luas",
      badge: "Strategic Core Profile",
      description: `Berdasarkan pola asesmen multi-matriks Anda, fokus utama Anda terletak pada kejelasan logika, efisiensi kerja, dan penalaran berbasis fakta. Penyesuaian ke ranah profesional akan terakselerasi pesat melalui keterlibatan proyek nyata dan bimbingan mentor industri.`,
      collaborationStyle: "Kolaborasi Objektif, Berbasis Bukti & Terukur",
      superpower: "Menemukan pola anomali dan celah perbaikan dalam sistem yang sering terlewatkan orang lain.",
      blindspotToWatch: "Perlu memperluas jam terbang komunikasi publik dan keberanian menyuarakan ide di hadapan audiens besar.",
    };
  }

  // 2. CALCULATE CAREER READINESS SCORE
  let bonusScore = 0;
  if (formalOrg) bonusScore += 6;
  if (isHighLeader) bonusScore += 4;
  if (nonFormalExp) bonusScore += 5;
  if (workExp) bonusScore += 6;
  if (hobbyInterest) bonusScore += 3;
  if (careerAspiration) bonusScore += 2;

  const baseScore = Math.round(results.overallReadinessScore * 13 + 30);
  const readinessScore = Math.min(98, Math.max(70, baseScore + bonusScore));

  let readinessLevel: "Siap Akselerasi Industri" | "Tinggi & Berkembang Pesat" | "Fondasi Potensial" =
    "Tinggi & Berkembang Pesat";
  if (readinessScore >= 88) {
    readinessLevel = "Siap Akselerasi Industri";
  } else if (readinessScore < 78) {
    readinessLevel = "Fondasi Potensial";
  }

  // 3. GENERATE 3 STRATEGIC CAREER TRAJECTORIES
  // Path A: Linear Trajectory (Aligns with Current Major & Academic Background)
  const linearTrajectory: StrategicTrajectory = {
    type: "LINEAR",
    categoryLabel: "Jalur 1: Spesialisasi Disiplin Linear",
    title: `Jalur Keilmuan Linear (${currentMajor} ➔ ${topMajor})`,
    roleExamples: [
      `${topMajor.split(" ")[0]} Specialist`,
      `Corporate ${currentMajor} Officer`,
      `Research & Analytics Executive`,
      `Certified Professional Practitioner`,
    ],
    whyFitNarrative: `Memanfaatkan bekal kurikulum Anda di ${educationLevel} (${currentMajor}) yang sejalan dengan potensi hasil rekomendasi studi ${topMajor}. Jalur ini memberikan akselerasi tanpa harus mengubah haluan dasar, dengan fokus membangun kredibilitas akademis dan sertifikasi profesi resmi.`,
    prospectRating: "Sangat Stabil & Permintaan Pasar Tinggi (High Growth)",
    growthPotential: "Pertumbuhan karir vertikal yang terprediksi dengan jenjang keahlian terstandarisasi industri.",
    skillsToMaster: [
      `Metodologi dan standar teknis bidang ${currentMajor}`,
      "Analisis data domain spesifik & tools industri",
      "Studi regulasi dan kepatuhan profesi terakreditasi",
    ],
    suggestedCertifications: [
      `Sertifikasi Profesi Kompetensi ${currentMajor} / BNSP`,
      "Kemampuan Bahasa Asing Profesional (TOEFL / IELTS > 6.5)",
      "Tools Analitikal Dasar (Excel Lanjut, SQL, atau Domain Tools)",
    ],
  };

  // Path B: Hybrid & Leadership Trajectory (Aligns with Formal Leadership OSIS/BEM + Academic)
  const formalOrgBadge = formalOrg ? `Pengalaman ${formalOrg}` : "Potensi Kepemimpinan";
  const hybridTrajectory: StrategicTrajectory = {
    type: "HYBRID",
    categoryLabel: "Jalur 2: Lintas-Disiplin & Manajemen Kepemimpinan",
    title: `Jalur Manajemen Eksekutif & Orkestrasi (${currentMajor} + ${formalOrgBadge})`,
    roleExamples: [
      "Product & Program Manager",
      "Corporate Strategy & Operations Associate",
      "Consultant / Business Analyst",
      "Head of Department / Operations Lead",
    ],
    whyFitNarrative: `Banyak lulusan yang kuat secara teknis namun lemah dalam komunikasi dan kepemimpinan. Di sinilah letak 'Unfair Advantage' Anda: rekam jejak ${formalOrg || "keorganisasian"} Anda membuktikan bahwa Anda bisa mengelola tim, mengurai konflik, dan bernegosiasi. Jalur ini menempatkan Anda di jembatan antara tim teknis dan jajaran pimpinan.`,
    prospectRating: "Eksponensial & Peluang Fast-Track Management Trainee",
    growthPotential: "Akselerasi cepat menuju posisi manajerial (C-level track / Division Head) dalam 3-7 tahun karir.",
    skillsToMaster: [
      "Agile Project Management (Scrum/Kanban) & Resource Allocation",
      "Stakeholder Communication, Pitching & Boardroom Presentation",
      "Financial Literacy & Manajemen Anggaran Proyek",
    ],
    suggestedCertifications: [
      "Certified Associate in Project Management (CAPM) / Google Project Management",
      "Scrum Master / Agile Fundamentals",
      "Leadership & Effective Negotiation Executive Credential",
    ],
  };

  // Path C: Entrepreneurial & Social Impact Trajectory (Aligns with Community/Hobby/Work)
  const communityBadge = nonFormalExp ? `Modal Sosial ${nonFormalExp}` : "Kreativitas & Hobi";
  const entrepreneurialTrajectory: StrategicTrajectory = {
    type: "ENTREPRENEURIAL",
    categoryLabel: "Jalur 3: Inovasi, Wirausaha & Dampak Sosial",
    title: `Jalur Startup, Creative Venture & Social Impact (${communityBadge})`,
    roleExamples: [
      "Founder / Co-Founder Startup / Social Enterprise",
      "Creative Agency / Studio Director",
      "Community Growth & Partnerships Director",
      "Independent Consultant / High-Value Freelancer",
    ],
    whyFitNarrative: `Keterlibatan Anda di ranah ${nonFormalExp || "komunitas lokal/Karang Taruna"} dan hobi (${hobbyInterest || "eksplorasi mandiri"}) membuktikan inisiatif organik Anda. Anda tidak menunggu perintah untuk bergerak; Anda melihat peluang dan mampu memobilisasi orang di sekitar Anda. Jalur ini menawarkan kebebasan berkarya, dampak sosial nyata, dan kemandirian ekonomi.`,
    prospectRating: "Dampak Tinggi (High Impact & High Autonomy)",
    growthPotential: "Penciptaan nilai mandiri dengan kepemilikan aset/usaha dan pengaruh komunitas yang berkelanjutan.",
    skillsToMaster: [
      "Business Model Canvas, Validasi Pasar & Riset Pengguna",
      "Digital Marketing, Brand Storytelling & Social Media Growth",
      "Grassroot Community Engagement & Fundraising / Sponsorship",
    ],
    suggestedCertifications: [
      "Google Digital Garage / Meta Certified Digital Marketing Associate",
      "UI/UX Design / Growth Hacking Certificate",
      "Social Impact Assessment & Sustainable Business Practices",
    ],
  };

  const strategicTrajectories = [linearTrajectory, hybridTrajectory, entrepreneurialTrajectory];

  // 4. BUILD SYNERGY MATRIX: Real-World Experiences vs Assessment Strengths
  const synergyMatrix: SynergyItem[] = [];

  // A. Formal Org Synergy
  if (formalOrg) {
    synergyMatrix.push({
      category: "FORMAL_ORG",
      sourceTitle: "Kepengurusan Formal",
      userInputValue: `${formalOrg} (${formalOrgRole})`,
      badge: "Institutional Governance",
      unlockedCompetencies: [
        "Delegasi & Pembagian Peran Tim",
        "Public Speaking & Diplomasi Formal",
        "Manajemen Krisis & Akuntabilitas Anggaran",
      ],
      careerAdvantage:
        "Membuat Anda unggul telak dalam seleksi Management Trainee (MT) dan wawancara kerja karena terbiasa menghadapi birokrasi dan dinamika kelompok nyata.",
    });
  }

  // B. Non-Formal / Community Synergy
  if (nonFormalExp) {
    synergyMatrix.push({
      category: "NON_FORMAL",
      sourceTitle: "Komunitas & Akar Rumput",
      userInputValue: nonFormalExp,
      badge: "High Social Empathy",
      unlockedCompetencies: [
        "Negosiasi Persuasif Tanpa Otoritas Jabatan",
        "Kepekaan Sosial & Empati Lapangan",
        "Penyelenggaraan Acara Komunitas Gotong Royong",
      ],
      careerAdvantage:
        "Membentuk daya tahan mental (*grit*) dan kemampuan adaptasi budaya kerja yang tinggi, membuat Anda disukai rekan kerja lintas generasi.",
    });
  }

  // C. Academic Foundation
  synergyMatrix.push({
    category: "ACADEMIC",
    sourceTitle: `Jenjang & Jurusan (${educationLevel})`,
    userInputValue: currentMajor,
    badge: "Disciplinary Foundation",
    unlockedCompetencies: [
      `Penguasaan Fundamental Rumpun ${currentMajor}`,
      "Logika Penalaran Terstruktur Sesuai Kurikulum",
      "Literasi Informasi Akademis & Penulisan Laporan",
    ],
    careerAdvantage:
      `Menjadi landasan kualifikasi ijazah formal untuk mendaftar ke perguruan tinggi unggulan dan memenuhi syarat administratif profesi impian Anda.`,
  });

  // D. Work / Projects / Hobbies
  if (workExp || hobbyInterest) {
    synergyMatrix.push({
      category: "WORK_HOBBY",
      sourceTitle: "Pengalaman Kerja / Proyek / Hobi",
      userInputValue: [workExp, hobbyInterest].filter(Boolean).join(" • "),
      badge: "Practical Execution",
      unlockedCompetencies: [
        "Orientasi Hasil Nyata (Output-Driven Mindset)",
        "Pengelolaan Tenggat Waktu & Standar Kualitas",
        "Keterampilan Digital / Teknis Spesifik",
      ],
      careerAdvantage:
        "Memberi Anda portofolio visual dan studi kasus konkrit untuk ditunjukkan saat wawancara beasiswa maupun magang profesional.",
    });
  }

  // 5. ACTION ROADMAP
  const actionRoadmap = {
    immediateStep: `Dokumentasikan seluruh pencapaian kepengurusan di ${formalOrg || "sekolah"} dan portofolio proyek ke dalam satu ringkasan LinkedIn / CV satu halaman berstandar ATS.`,
    mediumTermStep: `Ambil minimal 1 sertifikasi profesional berlisensi internasional (seperti Google / Coursera / BNSP) yang menghubungkan jurusan ${currentMajor} dengan target karir ${careerAspiration || topMajor}.`,
    longTermGoal: `Raih posisi magang formal pertama atau inisiasi proyek kepemimpinan mandiri sebelum memasuki semester akhir studi.`,
    recommendedPortfolioProjects: [
      `Studi Kasus Solusi: Selesaikan 1 tantangan nyata di lingkungan ${nonFormalExp || "komunitas Anda"} dan buat laporannya.`,
      `Portofolio Digital: Publikasikan ulasan atau mini-riset seputar tren industri ${topMajor} di LinkedIn / Medium.`,
      `Kompetisi Mahasiswa/Siswa: Bentuk tim multidisiplin untuk mengikuti lomba Business Plan / Hackathon / LKTI tingkat nasional.`,
    ],
    networkingAdvice: `Bangun relasi dengan minimal 3 kakak tingkat atau profesional yang saat ini sudah bekerja di bidang impian Anda (${careerAspiration || topMajor}), dan mintalah sesi mentoring singkat (*informational interview*).`,
  };

  return {
    hasProfile: true,
    profileData: input,
    readinessScore,
    readinessLevel,
    leadershipArchetype,
    strategicTrajectories,
    synergyMatrix,
    actionRoadmap,
  };
}
