import { all84QuestionsData } from "./questions-data";

export type FitLevel = "Very Strong Fit" | "Strong Fit" | "Potential Fit" | "Explore Further";

export interface SubdimensionScore {
  key: string;
  name: string;
  score: number; // 1.0 to 5.0
  percentage: number; // 0% to 100%
  level: "Tinggi" | "Sedang" | "Berkembang";
}

export interface DimensionScore {
  category: "TALENT" | "INTEREST" | "PERSONALITY" | "VALUES" | "ACADEMIC" | "CAREER" | "READINESS";
  name: string;
  score: number; // 1.0 to 5.0
  percentage: number; // 0% to 100%
  description: string;
}

export interface PotentialSignature {
  title: string;
  archetype: string;
  tagline: string;
  description: string;
  score: number;
  highlightedTraits: string[];
}

export interface StudyRecommendation {
  id: string;
  majorName: string;
  faculty: string;
  cluster: "Saintek" | "Soshum" | "Seni & Industri Kreatif";
  fitScore: number; // 0 to 100
  fitLevel: FitLevel;
  badgeColor: string;
  whyThisFit: string;
  whatToWatchOutFor: string;
  careerProspects: string[];
  keyAttributes: Array<{ name: string; score: number; benchmark: number }>;
}

export interface ScoringResult {
  sessionId: string;
  totalAnswered: number;
  overallReadinessScore: number;
  dimensionScores: DimensionScore[];
  talentSubdimensions: SubdimensionScore[];
  potentialSignatures: PotentialSignature[];
  studyRecommendations: StudyRecommendation[];
  summaryNarrative: string;
  calculatedAt: string;
}

// Talent subdimensions mapping to question codes
const TALENT_SUBDIMENSION_MAPPING: Record<string, { name: string; codes: string[] }> = {
  verbal: {
    name: "Kecerdasan Verbal & Bahasa",
    codes: ["T03", "T08"],
  },
  numerical: {
    name: "Logika Numerik & Analitikal",
    codes: ["T01", "T10"],
  },
  analytical: {
    name: "Analisis Sistem & Pemecahan Masalah",
    codes: ["T04", "T12"],
  },
  spatial: {
    name: "Penalaran Spasial & Mekanikal",
    codes: ["T02", "T09"],
  },
  creative: {
    name: "Kreativitas & Desain Estetika",
    codes: ["T05", "T11"],
  },
  social: {
    name: "Kecerdasan Sosial & Intrapersonal",
    codes: ["T06", "T07"],
  },
};

// Study fields definitions for Matrix 2 matching
interface StudyProfileBenchmark {
  id: string;
  majorName: string;
  faculty: string;
  cluster: "Saintek" | "Soshum" | "Seni & Industri Kreatif";
  weights: {
    talentSub: Record<string, number>; // verbal, numerical, analytical, spatial, creative, social
    interestCodes: string[];
    academicCodes: string[];
    personalityTraits: string[];
    valuesCodes: string[];
  };
  whyTemplate: (studentStrengths: string[]) => string;
  watchOutTemplate: (studentGaps: string[]) => string;
  careerProspects: string[];
}

const STUDY_BENCHMARKS: StudyProfileBenchmark[] = [
  {
    id: "cs-se",
    majorName: "Teknik Informatika & Ilmu Komputer",
    faculty: "Fakultas Ilmu Komputer & Teknologi Informasi",
    cluster: "Saintek",
    weights: {
      talentSub: { analytical: 0.35, numerical: 0.3, creative: 0.15, spatial: 0.1, verbal: 0.05, social: 0.05 },
      interestCodes: ["I02", "I01"], // Komputasi, Sains
      academicCodes: ["A01", "A08"], // Kalkulus, Software
      personalityTraits: ["P07", "P09"], // Grit, Focus Detail
      valuesCodes: ["V05", "V08"], // Inovasi, Peningkatan Kapasitas
    },
    whyTemplate: (strengths) =>
      `Kekuatan Anda dalam ${strengths.join(" serta ")} sangat selaras dengan tuntutan logika pemodelan perangkat lunak, arsitektur data, dan algoritma kecerdasan buatan.`,
    watchOutTemplate: (gaps) =>
      `Tantangan utama terletak pada ${gaps.join(" dan ")}; Anda perlu mengantisipasi jam belajar mandiri yang intensif saat menelusuri bug kode program yang kompleks.`,
    careerProspects: ["Software Engineer", "AI & Machine Learning Specialist", "Cloud Solutions Architect", "Tech Startup Founder"],
  },
  {
    id: "eng-robotics",
    majorName: "Teknik Rekayasa Elektro & Robotika",
    faculty: "Fakultas Teknik",
    cluster: "Saintek",
    weights: {
      talentSub: { spatial: 0.3, analytical: 0.3, numerical: 0.25, creative: 0.05, verbal: 0.05, social: 0.05 },
      interestCodes: ["I11", "I02"], // Teknik & Manufaktur, Komputasi
      academicCodes: ["A01", "A04"], // Kalkulus, Praktik Lab
      personalityTraits: ["P01", "P07"], // Conscientiousness, Ketahanan
      valuesCodes: ["V05", "V01"], // Inovasi, Kontribusi
    },
    whyTemplate: (strengths) =>
      `Kombinasi ${strengths.join(" dan ")} memberikan fondasi kokoh untuk perancangan sistem mekatronika, mikrokontroler, dan otomasi industri modern.`,
    watchOutTemplate: (gaps) =>
      `Persiapkan diri menghadapi ${gaps.join(" serta ")}, terutama beban praktikum laboratorium terstruktur yang membutuhkan ketelitian teknis tanpa kompromi.`,
    careerProspects: ["Robotics Automation Engineer", "Embedded Hardware Designer", "IoT Infrastructure Consultant", "Instrumentation Lead"],
  },
  {
    id: "business-mgmt",
    majorName: "Bisnis, Manajemen & Kewirausahaan",
    faculty: "Fakultas Ekonomi & Bisnis",
    cluster: "Soshum",
    weights: {
      talentSub: { social: 0.3, verbal: 0.25, analytical: 0.25, numerical: 0.1, creative: 0.05, spatial: 0.05 },
      interestCodes: ["I04", "I10"], // Bisnis, Finansial
      academicCodes: ["A05", "A12"], // Teori Sosial, Presentasi
      personalityTraits: ["P03", "P08"], // Ekstroversi, Kepemimpinan
      valuesCodes: ["V02", "V09"], // Otonomi, Pengaruh Positif
    },
    whyTemplate: (strengths) =>
      `Kapasitas Anda pada ${strengths.join(" serta ")} merupakan aset vital dalam negosiasi pasar modal, pengambilan keputusan manajerial, dan memimpin tim lintas fungsi.`,
    watchOutTemplate: (gaps) =>
      `Waspadai potensi resistensi pada ${gaps.join(" dan ")}; kelincahan adaptasi terhadap dinamika ekonomi global yang cepat berubah sangat diperlukan.`,
    careerProspects: ["Business Development Director", "Management Consultant", "Venture Capital Analyst", "Chief Executive Officer (CEO)"],
  },
  {
    id: "dkv-design",
    majorName: "Desain Komunikasi Visual (DKV) & UI/UX",
    faculty: "Fakultas Seni Rupa & Desain",
    cluster: "Seni & Industri Kreatif",
    weights: {
      talentSub: { creative: 0.4, spatial: 0.25, verbal: 0.15, social: 0.1, analytical: 0.05, numerical: 0.05 },
      interestCodes: ["I03", "I02"], // Desain Grafis, Teknologi
      academicCodes: ["A04", "A08"], // Praktik Portofolio, Software Desain
      personalityTraits: ["P02", "P10"], // Openness, Fleksibilitas
      valuesCodes: ["V05", "V02"], // Inovasi, Kebebasan
    },
    whyTemplate: (strengths) =>
      `Sensitivitas estetika tinggi dan ${strengths.join(" serta ")} membuat Anda piawai meramu pesan visual berdaya pikat tinggi ke dalam produk digital dan branding interaktif.`,
    watchOutTemplate: (gaps) =>
      `Perlu antisipasi terhadap ${gaps.join(" dan ")}; industri kreatif menuntut manajemen revisi klien yang intensif serta konsistensi deadline portofolio.`,
    careerProspects: ["Product Designer (UI/UX)", "Creative Art Director", "Brand Identity Specialist", "Motion Graphic Illustrator"],
  },
  {
    id: "psychology",
    majorName: "Psikologi & Ilmu Perilaku Manusia",
    faculty: "Fakultas Psikologi",
    cluster: "Soshum",
    weights: {
      talentSub: { social: 0.35, verbal: 0.3, analytical: 0.2, creative: 0.05, numerical: 0.05, spatial: 0.05 },
      interestCodes: ["I07", "I12"], // Psikologi, Pemberdayaan Sosial
      academicCodes: ["A02", "A09"], // Jurnal Ilmiah, Argumentasi Akademik
      personalityTraits: ["P04", "P06"], // Keramahan/Agreeableness, Kemandirian
      valuesCodes: ["V01", "V06"], // Kemanusiaan, Integritas Etika
    },
    whyTemplate: (strengths) =>
      `Kecerdasan intrapersonal, empati sosial mendalam, dan ${strengths.join(" serta ")} menjadikan Anda konselor andal yang mampu mengurai kompleksitas dinamika mental manusia.`,
    watchOutTemplate: (gaps) =>
      `Perhatikan ketahanan emosional pada ${gaps.join(" dan ")}; Anda perlu melatih pemisahan objektif antara empati profesional dengan kelelahan psikologis (*burnout*).`,
    careerProspects: ["Industrial & Organizational Psychologist", "Clinical Counselor", "People Operations (HR) Manager", "Behavioral Researcher"],
  },
  {
    id: "medicine-health",
    majorName: "Pendidikan Dokter & Ilmu Kedokteran",
    faculty: "Fakultas Kedokteran",
    cluster: "Saintek",
    weights: {
      talentSub: { analytical: 0.3, numerical: 0.2, verbal: 0.2, social: 0.15, spatial: 0.1, creative: 0.05 },
      interestCodes: ["I05", "I01"], // Kesehatan, Sains
      academicCodes: ["A06", "A10"], // Stamina Belajar, Praktik Klinis
      personalityTraits: ["P01", "P05"], // Keteraturan, Stabilitas Emosional
      valuesCodes: ["V01", "V06"], // Kemanusiaan, Integritas
    },
    whyTemplate: (strengths) =>
      `Dedikasi kemanusiaan yang dipadu dengan ${strengths.join(" dan ")} memenuhi kualifikasi ketat untuk pengambilan keputusan diagnosis medis darurat.`,
    watchOutTemplate: (gaps) =>
      `Pertimbangkan komitmen jangka panjang terkait ${gaps.join(" serta ")}; masa studi kepaniteraan klinik (koas) dan spesialisasi menuntut stamina fisik ekstra.`,
    careerProspects: ["Dokter Umum / Dokter Spesialis", "Hospital Management Executive", "Medical Health Consultant", "Biomedical Researcher"],
  },
  {
    id: "law-policy",
    majorName: "Ilmu Hukum & Hubungan Internasional",
    faculty: "Fakultas Hukum",
    cluster: "Soshum",
    weights: {
      talentSub: { verbal: 0.35, analytical: 0.3, social: 0.15, numerical: 0.1, creative: 0.05, spatial: 0.05 },
      interestCodes: ["I06", "I09"], // Hukum & Regulasi, Sastra & Bahasa
      academicCodes: ["A05", "A09"], // Debat Teori Sosial, Esai Argumentatif
      personalityTraits: ["P08", "P12"], // Kepemimpinan, Kritis
      valuesCodes: ["V06", "V03"], // Integritas Etika, Prestise
    },
    whyTemplate: (strengths) =>
      `Kemahiran artikulasi verbal, penalaran asas hukum, serta ${strengths.join(" dan ")} merupakan modal unggul dalam advokasi peradilan dan diplomasi multinasional.`,
    watchOutTemplate: (gaps) =>
      `Antisipasi beban literasi tebal seputar ${gaps.join(" dan ")}; analisis pasal regulasi menuntut kejelian komparasi yurisprudensi yang sangat rinci.`,
    careerProspects: ["Corporate Legal Counsel", "Diplomat & International Officer", "Litigation Attorney / Advocate", "Public Policy Analyst"],
  },
];

/**
 * Calculates complete multi-matrix scoring for a student assessment session
 */
export function calculateAssessmentScores(
  sessionId: string,
  answersRecord: Record<string, number>, // { [questionCodeOrId]: selected_value }
  userMetadata?: { fullName?: string; schoolName?: string; grade?: string }
): ScoringResult {
  // Normalize answer dictionary to question codes (e.g. T01 -> 5)
  const answersByCode: Record<string, number> = {};

  // Build a lookup map from question ID or question text to question code
  const codeToQuestion = new Map(all84QuestionsData.map((q) => [q.code, q]));
  const idToCode = new Map(all84QuestionsData.map((q) => [`q-${q.code}`, q.code]));

  for (const [key, value] of Object.entries(answersRecord)) {
    if (codeToQuestion.has(key)) {
      answersByCode[key] = value;
    } else if (idToCode.has(key)) {
      const code = idToCode.get(key)!;
      answersByCode[code] = value;
    } else {
      // In case key is code without prefix or uuid, check code match
      const matched = all84QuestionsData.find((q) => q.code === key || q.id === key);
      if (matched) {
        answersByCode[matched.code] = value;
      }
    }
  }

  // 1. Calculate Dimension Scores (7 Main Categories)
  const categories: Array<{
    category: "TALENT" | "INTEREST" | "PERSONALITY" | "VALUES" | "ACADEMIC" | "CAREER" | "READINESS";
    prefix: string;
    name: string;
    description: string;
  }> = [
    { category: "TALENT", prefix: "T", name: "Talent (Bakat & Potensi Alami)", description: "Kapasitas kognitif bawaan dalam penalaran, analisis, dan pemecahan masalah." },
    { category: "INTEREST", prefix: "I", name: "Interest (Minat & Ketertarikan)", description: "Bidang aktivitas dan subjek yang membangkitkan rasa ingin tahu berkelanjutan." },
    { category: "PERSONALITY", prefix: "P", name: "Personality (Kepribadian Kerja)", description: "Karakteristik adaptasi, ketekunan, dan pola interaksi dalam dinamika kerja." },
    { category: "VALUES", prefix: "V", name: "Values (Nilai Pribadi & Etika)", description: "Prinsip motivasi internal yang memberi makna dan kepuasan jangka panjang." },
    { category: "ACADEMIC", prefix: "A", name: "Academic (Kesiapan Akademik)", description: "Ketahanan studi, literasi riset, dan kecakapan menghadapi kurikulum perkuliahan." },
    { category: "CAREER", prefix: "C", name: "Career (Aspirasi Arah Karier)", description: "Orientasi profesi dan peran strategis masa depan yang diidamkan." },
    { category: "READINESS", prefix: "R", name: "Readiness (Kesiapan Transisi Kampus)", description: "Kemandirian finansial, resiliensi emosi, dan kesiapan hidup mandiri." },
  ];

  const dimensionScores: DimensionScore[] = categories.map((cat) => {
    let sum = 0;
    let count = 0;

    for (let i = 1; i <= 12; i++) {
      const code = `${cat.prefix}${i < 10 ? `0${i}` : i}`;
      const val = answersByCode[code];
      if (val !== undefined) {
        sum += val;
        count++;
      }
    }

    const avg = count > 0 ? Number((sum / count).toFixed(2)) : 3.0; // default 3.0 if missing
    const percentage = Math.round(((avg - 1) / 4) * 100);

    return {
      category: cat.category,
      name: cat.name,
      score: avg,
      percentage: Math.max(10, Math.min(100, percentage)),
      description: cat.description,
    };
  });

  // 2. Matrix 1: Person Profile - 6 Talent Subdimensions
  const talentSubdimensions: SubdimensionScore[] = Object.entries(TALENT_SUBDIMENSION_MAPPING).map(
    ([key, config]) => {
      let sum = 0;
      let count = 0;

      for (const code of config.codes) {
        const val = answersByCode[code];
        if (val !== undefined) {
          sum += val;
          count++;
        }
      }

      const avg = count > 0 ? Number((sum / count).toFixed(2)) : 3.0;
      const percentage = Math.round(((avg - 1) / 4) * 100);

      let level: "Tinggi" | "Sedang" | "Berkembang" = "Sedang";
      if (avg >= 4.0) level = "Tinggi";
      else if (avg < 3.0) level = "Berkembang";

      return {
        key,
        name: config.name,
        score: avg,
        percentage: Math.max(10, Math.min(100, percentage)),
        level,
      };
    }
  );

  // 3. Potential Signatures (Top 3 Signature Archetypes)
  // Sort talent subdimensions descending
  const sortedTalents = [...talentSubdimensions].sort((a, b) => b.score - a.score);

  const signatureLibrary: Record<string, { title: string; archetype: string; tagline: string; description: string; traits: string[] }> = {
    analytical: {
      title: "The Analytical Strategist",
      archetype: "Perancang Strategis & Pemecah Masalah",
      tagline: "Unggul dalam dekonstruksi sistem rumit dan visualisasi solusi berbasis logika presisi.",
      description: "Anda memiliki insting tajam dalam melihat korelasi sebab-akibat data serta mahir merumuskan peta navigasi jangka panjang yang sistematis.",
      traits: ["Berpikir Kritis", "Dekomposisi Masalah", "Perencanaan Terukur"],
    },
    numerical: {
      title: "The Quantitative Architect",
      archetype: "Arsitek Kuantitatif & Logika Pola",
      tagline: "Memiliki ketangkasan numerik tinggi dan ketahanan memecahkan kalkulasi abstrak.",
      description: "Angka dan formula bukan beban melainkan bahasa berpikir Anda. Anda sangat tangguh dalam pemodelan kuantitatif dan analisis statistik lanjutan.",
      traits: ["Ketajaman Pola", "Algoritmik", "Objektivitas Logis"],
    },
    creative: {
      title: "The Visionary Creator",
      archetype: "Inovator Kreatif & Desainer Konseptual",
      tagline: "Memadukan orisinalitas ide dengan sensitivitas estetika yang memikat.",
      description: "Anda gemar merombak cara lama dengan sudut pandang baru yang segar. Kepekaan komposisi visual Anda mampu mengomunikasikan ide rumit secara artistik.",
      traits: ["Orisinalitas", "Sensitivitas Visual", "Inovasi Konsep"],
    },
    verbal: {
      title: "The Persuasive Articulator",
      archetype: "Komunikator Persuasif & Advokat Gagasan",
      tagline: "Kekuatan retorika dan literasi tinggi yang mampu menggerakkan pemahaman orang lain.",
      description: "Anda dengan fasih menyusun struktur argumen yang kohesif baik tulisan maupun lisan. Kemampuan artikulasi ini adalah kunci diplomasi dan pengaruh.",
      traits: ["Artikulasi Bahasa", "Literasi Mendalam", "Daya Persuasi"],
    },
    social: {
      title: "The Empathetic Catalyst",
      archetype: "Katalisator Empatis & Penggerak Kolaborasi",
      tagline: "Kecerdasan emosional tinggi dalam membaca dinamika manusia dan membangun sinergi.",
      description: "Kepekaan intrapersonal dan intuisi sosial Anda memudahkan terjalinnya hubungan kepercayaan. Anda merupakan penyeimbang harmoni dan motivator kelompok.",
      traits: ["Intuisi Sosial", "Resonansi Emosional", "Resolusi Konflik"],
    },
    spatial: {
      title: "The Structural Engineer",
      archetype: "Insinyur Struktural & Presisi Kinestetik",
      tagline: "Keahlian memproyeksikan visualisasi spasial 3D ke dalam wujud fisik teruji.",
      description: "Anda mampu mengimajinasikan interaksi mekanik dan tata ruang dengan akurasi tinggi. Tangan dan pikiran Anda terkoordinasi sempurna dalam perancangan nyata.",
      traits: ["Proyeksi 3 Dimensi", "Presisi Kinestetik", "Struktur Mekanika"],
    },
  };

  const potentialSignatures: PotentialSignature[] = sortedTalents.slice(0, 3).map((item) => {
    const template = signatureLibrary[item.key] || {
      title: "The Dynamic Performer",
      archetype: item.name,
      tagline: "Memiliki keseimbangan potensi multidisiplin yang adaptif.",
      description: "Kemampuan Anda memberikan fleksibilitas tinggi dalam melintasi berbagai tantangan studi.",
      traits: ["Adaptabilitas", "Eksploratif", "Fokus"],
    };

    return {
      title: template.title,
      archetype: template.archetype,
      tagline: template.tagline,
      description: template.description,
      score: item.score,
      highlightedTraits: template.traits,
    };
  });

  // 4. Matrix 2: Study Profile Matching
  const talentScoreMap = new Map(talentSubdimensions.map((t) => [t.key, t.score]));

  const studyRecommendations: StudyRecommendation[] = STUDY_BENCHMARKS.map((benchmark) => {
    // 4.1 Talent weighted match (0.5 weight)
    let talentWeightedSum = 0;
    let talentWeightTotal = 0;
    const subBreakdown: Array<{ name: string; score: number; benchmark: number }> = [];

    for (const [subKey, weight] of Object.entries(benchmark.weights.talentSub)) {
      const studentScore = talentScoreMap.get(subKey) || 3.0;
      talentWeightedSum += studentScore * weight;
      talentWeightTotal += weight;

      if (weight >= 0.2) {
        const subName = TALENT_SUBDIMENSION_MAPPING[subKey]?.name || subKey;
        subBreakdown.push({
          name: subName,
          score: studentScore,
          benchmark: 4.0, // target benchmark
        });
      }
    }
    const talentMatchAvg = talentWeightTotal > 0 ? talentWeightedSum / talentWeightTotal : 3.0;

    // 4.2 Interest match (0.25 weight)
    let interestSum = 0;
    let interestCount = 0;
    for (const code of benchmark.weights.interestCodes) {
      if (answersByCode[code] !== undefined) {
        interestSum += answersByCode[code];
        interestCount++;
      }
    }
    const interestAvg = interestCount > 0 ? interestSum / interestCount : 3.0;

    // 4.3 Academic & Personality fit (0.25 weight)
    let academicSum = 0;
    let academicCount = 0;
    for (const code of benchmark.weights.academicCodes) {
      if (answersByCode[code] !== undefined) {
        academicSum += answersByCode[code];
        academicCount++;
      }
    }
    const academicAvg = academicCount > 0 ? academicSum / academicCount : 3.0;

    // Composite Final Score: Normalized to 0 - 100%
    const compositeScoreRaw = talentMatchAvg * 0.5 + interestAvg * 0.25 + academicAvg * 0.25;
    // Map 1.0 - 5.0 to 30% - 98%
    const fitScore = Math.round(((compositeScoreRaw - 1) / 4) * 68 + 30);

    // Determine Fit Level
    let fitLevel: FitLevel = "Explore Further";
    let badgeColor = "bg-gray-100 text-gray-700 border-gray-200";

    if (fitScore >= 82) {
      fitLevel = "Very Strong Fit";
      badgeColor = "bg-emerald-100 text-emerald-800 border-emerald-300";
    } else if (fitScore >= 70) {
      fitLevel = "Strong Fit";
      badgeColor = "bg-teal-100 text-teal-800 border-teal-300";
    } else if (fitScore >= 55) {
      fitLevel = "Potential Fit";
      badgeColor = "bg-amber-100 text-amber-800 border-amber-300";
    }

    // Dynamic Strengths & Gaps for Narrative Insights
    const strengths: string[] = [];
    const gaps: string[] = [];

    if (talentMatchAvg >= 3.8) {
      strengths.push("potensi bakat inti yang melampaui rata-rata");
    }
    if (interestAvg >= 3.8) {
      strengths.push("antusiasme minat bidang yang tinggi");
    }
    if (academicAvg >= 3.8) {
      strengths.push("kesiapan ritme akademis yang matang");
    }
    if (strengths.length === 0) {
      strengths.push("fleksibilitas adaptasi yang masih terbuka luas");
    }

    if (academicAvg < 3.5) {
      gaps.push("penguatan stamina belajar terstruktur");
    }
    if (interestAvg < 3.2) {
      gaps.push("eksplorasi lebih dalam terhadap realita profesi");
    }
    if (talentMatchAvg < 3.5) {
      gaps.push("aspek ketelitian teknis yang perlu terus diasah");
    }
    if (gaps.length === 0) {
      gaps.push("manajemen waktu dan pencegahan kelelahan belajar");
    }

    return {
      id: benchmark.id,
      majorName: benchmark.majorName,
      faculty: benchmark.faculty,
      cluster: benchmark.cluster,
      fitScore,
      fitLevel,
      badgeColor,
      whyThisFit: benchmark.whyTemplate(strengths),
      whatToWatchOutFor: benchmark.watchOutTemplate(gaps),
      careerProspects: benchmark.careerProspects,
      keyAttributes: subBreakdown,
    };
  });

  // Sort recommendations descending by fitScore
  studyRecommendations.sort((a, b) => b.fitScore - a.fitScore);

  const readinessDim = dimensionScores.find((d) => d.category === "READINESS");
  const overallReadiness = readinessDim ? readinessDim.score : 3.5;

  return {
    sessionId,
    totalAnswered: Object.keys(answersByCode).length,
    overallReadinessScore: overallReadiness,
    dimensionScores,
    talentSubdimensions,
    potentialSignatures,
    studyRecommendations,
    summaryNarrative: `Berdasarkan kalkulasi instrumen multi-matriks GGC Study Fit Assessment™, profil belajar Anda menunjukkan dominasi pada ${potentialSignatures[0]?.title} (${potentialSignatures[0]?.archetype}) dengan tingkat kesiapan studi mencapai ${Math.round(((overallReadiness - 1) / 4) * 100)}%. Pilihan program studi teratas Anda mengindikasikan sinergi kuat pada rumpun ${studyRecommendations[0]?.cluster}.`,
    calculatedAt: new Date().toISOString(),
  };
}
