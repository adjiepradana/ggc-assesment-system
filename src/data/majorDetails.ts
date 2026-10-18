export interface CampusRecommendation {
  name: string;
  type: "PTN" | "PTS";
  city: string;
  accreditation: "Unggul" | "A";
  highlight: string;
}

export interface CareerSalaryRole {
  role: string;
  entryLevelSalary: string;
  midLevelSalary: string;
  description: string;
}

export interface KeyCourse {
  name: string;
  semester: string;
  credits: number;
  description: string;
  skillsGained: string[];
}

export interface MajorExtendedDetail {
  id: string;
  majorName: string;
  overview: string;
  campuses: CampusRecommendation[];
  careerBreakdown: {
    salaryRangeOverall: string;
    marketDemand: "Sangat Tinggi" | "Tinggi" | "Tumbuh Pesat";
    roles: CareerSalaryRole[];
  };
  keyCourses: KeyCourse[];
  practicalTips: string[];
}

export const MAJOR_EXTENDED_DETAILS: Record<string, MajorExtendedDetail> = {
  "cs-se": {
    id: "cs-se",
    majorName: "Teknik Informatika & Ilmu Komputer",
    overview:
      "Mempelajari komputasi tingkat lanjut, arsitektur perangkat lunak modern, kecerdasan buatan, dan struktur data berskala global.",
    campuses: [
      { name: "Institut Teknologi Bandung (ITB)", type: "PTN", city: "Bandung", accreditation: "Unggul", highlight: "Peringkat #1 Teknik Informatika Nasional" },
      { name: "Universitas Indonesia (UI)", type: "PTN", city: "Depok", accreditation: "Unggul", highlight: "Pusat Riset AI & Data Science Terbesar" },
      { name: "Universitas Gadjah Mada (UGM)", type: "PTN", city: "Yogyakarta", accreditation: "Unggul", highlight: "Ekosistem Software Engineering & Open Source" },
      { name: "Institut Teknologi Sepuluh Nopember (ITS)", type: "PTN", city: "Surabaya", accreditation: "Unggul", highlight: "Unggul di Bidang Otomasi & Cloud Computing" },
      { name: "Universitas Bina Nusantara (BINUS)", type: "PTS", city: "Jakarta", accreditation: "Unggul", highlight: "Koneksi Industri Global & Inkubator Startup" },
      { name: "Telkom University", type: "PTS", city: "Bandung", accreditation: "Unggul", highlight: "Pusat Riset ICT & Jaringan Telekomunikasi" },
    ],
    careerBreakdown: {
      salaryRangeOverall: "Rp 8.000.000 – Rp 16.000.000 / bulan (Fresh Graduate)",
      marketDemand: "Sangat Tinggi",
      roles: [
        {
          role: "Software Engineer (Fullstack/Backend)",
          entryLevelSalary: "Rp 9.000.000 – Rp 16.000.000",
          midLevelSalary: "Rp 20.000.000 – Rp 38.000.000",
          description: "Merancang arsitektur server, API performa tinggi, dan logika bisnis aplikasi berbasis cloud.",
        },
        {
          role: "AI & Machine Learning Engineer",
          entryLevelSalary: "Rp 10.000.000 – Rp 18.000.000",
          midLevelSalary: "Rp 24.000.000 – Rp 45.000.000",
          description: "Membangun model deep learning, computer vision, dan pipeline data cerdas untuk optimasi sistem.",
        },
        {
          role: "Cloud & DevOps Specialist",
          entryLevelSalary: "Rp 8.500.000 – Rp 15.000.000",
          midLevelSalary: "Rp 19.000.000 – Rp 36.000.000",
          description: "Mengelola infrastruktur kontainer Kubernetes, CI/CD pipeline, dan reliabilitas server.",
        },
        {
          role: "Mobile Application Developer (iOS/Android)",
          entryLevelSalary: "Rp 8.000.000 – Rp 14.000.000",
          midLevelSalary: "Rp 18.000.000 – Rp 32.000.000",
          description: "Mengembangkan antarmuka aplikasi mobile responsif dengan Flutter, React Native, atau Swift.",
        },
      ],
    },
    keyCourses: [
      {
        name: "Algoritma & Pemrograman Dasar",
        semester: "Semester 1",
        credits: 4,
        description: "Fondasi logika pemrograman, struktur percabangan, perulangan, dan pemecahan masalah modular.",
        skillsGained: ["Logika Algoritmik", "Problem Solving", "C++ / Python Fundamentals"],
      },
      {
        name: "Matematika Diskrit & Logika Komputasi",
        semester: "Semester 1",
        credits: 3,
        description: "Teori graf, logika proposisi, induksi matematika, dan teori himpunan untuk efisiensi komputasi.",
        skillsGained: ["Graph Theory", "Penalaran Formal", "Boolean Algebra"],
      },
      {
        name: "Struktur Data & Analisis Algoritma",
        semester: "Semester 2",
        credits: 4,
        description: "Penerapan linked lists, binary trees, hash tables, sorting algorithms, dan notasi Big-O.",
        skillsGained: ["Memory Optimization", "Big-O Analysis", "Advanced Data Structures"],
      },
      {
        name: "Arsitektur & Organisasi Komputer",
        semester: "Semester 2",
        credits: 3,
        description: "Cara kerja hardware mikroskopis: register CPU, cache memory, assembly language, dan bus data.",
        skillsGained: ["Low-Level Computing", "CPU Caching", "Assembly Basics"],
      },
    ],
    practicalTips: [
      "Mulai bangun portofolio GitHub dari semester 1 dengan mengerjakan proyek coding kecil secara konsisten.",
      "Asah kemampuan competitive programming di platform seperti LeetCode atau HackerRank.",
      "Ikuti komunitas open-source untuk memahami standar kode industri sejak dini.",
    ],
  },

  "eng-robotics": {
    id: "eng-robotics",
    majorName: "Teknik Rekayasa Elektro & Robotika",
    overview:
      "Mengintegrasikan elektronika daya, sistem kontrol otomatis, mikrokontroler, dan kecerdasan mekanika untuk revolusi industri otomasi.",
    campuses: [
      { name: "Institut Teknologi Sepuluh Nopember (ITS)", type: "PTN", city: "Surabaya", accreditation: "Unggul", highlight: "Juara Umum Kontes Robot Indonesia (KRI) Beruntun" },
      { name: "Institut Teknologi Bandung (ITB)", type: "PTN", city: "Bandung", accreditation: "Unggul", highlight: "Pusat Riset Mekatronika & Otomasi Industri" },
      { name: "Universitas Gadjah Mada (UGM)", type: "PTN", city: "Yogyakarta", accreditation: "Unggul", highlight: "Pusat Rekayasa Sensor & Instrumentasi Medis" },
      { name: "Universitas Indonesia (UI)", type: "PTN", city: "Depok", accreditation: "Unggul", highlight: "Laboratorium Robotika Lanjut & Kendali Otonom" },
      { name: "Politeknik Elektronika Negeri Surabaya (PENS)", type: "PTN", city: "Surabaya", accreditation: "Unggul", highlight: "Rujukan Vokasi Robotika Terapan Terkemuka" },
      { name: "Telkom University", type: "PTS", city: "Bandung", accreditation: "Unggul", highlight: "Spesialisasi IoT & Smart Sensor Network" },
    ],
    careerBreakdown: {
      salaryRangeOverall: "Rp 7.500.000 – Rp 15.000.000 / bulan (Fresh Graduate)",
      marketDemand: "Tinggi",
      roles: [
        {
          role: "Robotics & Automation Engineer",
          entryLevelSalary: "Rp 8.500.000 – Rp 16.000.000",
          midLevelSalary: "Rp 19.000.000 – Rp 35.000.000",
          description: "Merancang robot industri, lengan pneumatik otomatis, dan integrasi Programmable Logic Controller (PLC).",
        },
        {
          role: "Embedded Systems & Firmware Engineer",
          entryLevelSalary: "Rp 8.000.000 – Rp 15.000.000",
          midLevelSalary: "Rp 18.000.000 – Rp 32.000.000",
          description: "Menulis kode microcode bare-metal pada mikrokontroler STM32, ESP32, atau arsitektur ARM.",
        },
        {
          role: "IoT Infrastructure & Smart Device Engineer",
          entryLevelSalary: "Rp 7.500.000 – Rp 14.000.000",
          midLevelSalary: "Rp 16.000.000 – Rp 28.000.000",
          description: "Menghubungkan sensor cerdas berbasis cloud dengan protokol MQTT, LoRaWAN, dan Zigbee.",
        },
        {
          role: "Instrumentation & Control Lead",
          entryLevelSalary: "Rp 9.000.000 – Rp 16.500.000",
          midLevelSalary: "Rp 20.000.000 – Rp 36.000.000",
          description: "Memantau kalibrasi sistem kontrol di industri energi, manufaktur otomotif, atau petrokimia.",
        },
      ],
    },
    keyCourses: [
      {
        name: "Rangkaian Listrik & Teori Sirkuit",
        semester: "Semester 1",
        credits: 4,
        description: "Hukum Kirchoff, teorema Thevenin, analisis tegangan sinusoidal, dan impedansi rangkaian RLC.",
        skillsGained: ["Analisis Rangkaian", "Osilograf & Multimeter", "Simulasi SPICE"],
      },
      {
        name: "Kalkulus Rekayasa & Persamaan Diferensial",
        semester: "Semester 1",
        credits: 3,
        description: "Pemodelan matematis untuk gerak motor, perubahan arus transien, dan transformasi Laplace.",
        skillsGained: ["Pemodelan Dinamik", "Transformasi Laplace", "Matematika Teknik"],
      },
      {
        name: "Elektronika Digital & Sistem Logika",
        semester: "Semester 2",
        credits: 4,
        description: "Desain gerbang logika, flip-flop, register pencacah, dan pengantar pemrograman FPGA/VHDL.",
        skillsGained: ["Desain Digital", "FPGA Dasar", "Microchip Wiring"],
      },
      {
        name: "Fisika Dasar & Praktikum Mekanika Gelombang",
        semester: "Semester 2",
        credits: 4,
        description: "Eksperimen medan elektromagnetik, flux magnet, dan dinamika rotasi motor servo.",
        skillsGained: ["Laboratorium Fisika", "Kalibrasi Sensor", "Analisis Data Eksperimen"],
      },
    ],
    practicalTips: [
      "Bergabunglah dengan tim Kontes Robot sejak semester awal untuk mengasah jam terbang praktis.",
      "Kuasai minimal satu platform mikrokontroler populer seperti Arduino dan ESP32.",
      "Pelajari software desain skematik PCB seperti KiCad atau Altium Designer.",
    ],
  },

  "business-mgmt": {
    id: "business-mgmt",
    majorName: "Bisnis, Manajemen & Kewirausahaan",
    overview:
      "Mempelajari seni kepemimpinan strategis, analisis keuangan korporasi, inovasi model bisnis, dan ekspansi pasar global.",
    campuses: [
      { name: "Universitas Gadjah Mada (UGM - FEB)", type: "PTN", city: "Yogyakarta", accreditation: "Unggul", highlight: "Fakultas Ekonomi Pertama Terakreditasi AACSB Internasional" },
      { name: "Universitas Indonesia (UI - FEB)", type: "PTN", city: "Depok", accreditation: "Unggul", highlight: "Jaringan Alumni C-Level Eksekutif Terluas di Indonesia" },
      { name: "Institut Teknologi Bandung (SBM ITB)", type: "PTN", city: "Bandung", accreditation: "Unggul", highlight: "Pusat Unggulan Manajemen Bisnis & Ekosistem Startup" },
      { name: "Universitas Airlangga (UNAIR - FEB)", type: "PTN", city: "Surabaya", accreditation: "Unggul", highlight: "Pusat Riset Keuangan & Manajemen Strategik" },
      { name: "Universitas Prasetiya Mulya", type: "PTS", city: "Tangerang", accreditation: "Unggul", highlight: "Pelopor Pendidikan Bisnis Berbasis Praktisi & Inkubasi" },
      { name: "Universitas Bina Nusantara (BINUS Business School)", type: "PTS", city: "Jakarta", accreditation: "Unggul", highlight: "Fokus Kewirausahaan Digital & Inovasi Pasar" },
    ],
    careerBreakdown: {
      salaryRangeOverall: "Rp 7.000.000 – Rp 15.000.000 / bulan (Fresh Graduate)",
      marketDemand: "Sangat Tinggi",
      roles: [
        {
          role: "Management Consultant",
          entryLevelSalary: "Rp 10.000.000 – Rp 18.000.000",
          midLevelSalary: "Rp 22.000.000 – Rp 45.000.000",
          description: "Menganalisis inefisiensi operasional korporasi dan memberikan rekomendasi strategis pemulihan laba.",
        },
        {
          role: "Business Development & Growth Specialist",
          entryLevelSalary: "Rp 7.500.000 – Rp 14.000.000",
          midLevelSalary: "Rp 16.000.000 – Rp 30.000.000",
          description: "Membuka kemitraan B2B baru, ekspansi pasar geografis, dan perancangan strategi monetisasi produk.",
        },
        {
          role: "Financial & Investment Analyst",
          entryLevelSalary: "Rp 9.000.000 – Rp 17.000.000",
          midLevelSalary: "Rp 20.000.000 – Rp 40.000.000",
          description: "Menyusun evaluasi valuasi perusahaan, proyeksi arus kas, dan analisis kelayakan merger/akuisisi.",
        },
        {
          role: "Product Marketing Manager",
          entryLevelSalary: "Rp 7.500.000 – Rp 13.500.000",
          midLevelSalary: "Rp 16.000.000 – Rp 28.000.000",
          description: "Merumuskan strategi positioning produk, riset segmentasi konsumen, dan peluncuran kampanye pemasaran.",
        },
      ],
    },
    keyCourses: [
      {
        name: "Pengantar Bisnis & Manajemen Strategis",
        semester: "Semester 1",
        credits: 3,
        description: "Membedah struktur korporasi, fungsi manajerial (POAC), etika bisnis, dan analisis lingkungan kompetitif.",
        skillsGained: ["Strategic Thinking", "Analisis SWOT/PESTEL", "Manajemen Tim"],
      },
      {
        name: "Mikroekonomi & Dinamika Pasar",
        semester: "Semester 1",
        credits: 3,
        description: "Prinsip penawaran-permintaan, elastisitas harga, struktur pasar oligopoli, dan perilaku konsumsi.",
        skillsGained: ["Market Forecasting", "Analisis Harga", "Riset Konsumen"],
      },
      {
        name: "Akuntansi Keuangan & Analisis Laporan",
        semester: "Semester 2",
        credits: 3,
        description: "Membaca dan menyusun neraca keuangan, laporan laba rugi, dan analisis rasio likuiditas korporasi.",
        skillsGained: ["Financial Reading", "Cash Flow Analysis", "Rasio Keuangan"],
      },
      {
        name: "Komunikasi Bisnis & Negosiasi",
        semester: "Semester 2",
        credits: 3,
        description: "Teknik pitching ide bisnis ke investor, retorika presentasi eksekutif, dan resolusi konflik kontrak.",
        skillsGained: ["Executive Pitching", "Teknik Negosiasi", "Public Speaking"],
      },
    ],
    practicalTips: [
      "Rutin ikuti kompetisi studi kasus bisnis (Business Case Competition) tingkat nasional untuk melatih problem solving.",
      "Pelajari pemodelan data di Microsoft Excel tingkat lanjut (Financial Modeling).",
      "Bangun jejaring aktif dengan mengikuti organisasi kemahasiswaan dan magang di tahun kedua.",
    ],
  },

  "dkv-design": {
    id: "dkv-design",
    majorName: "Desain Komunikasi Visual (DKV) & UI/UX",
    overview:
      "Menggabungkan estetika visual, psikologi persepsi, teknologi desain interaktif, dan komunikasi naratif untuk menghasilkan karya berdampak.",
    campuses: [
      { name: "Institut Teknologi Bandung (FSRD ITB)", type: "PTN", city: "Bandung", accreditation: "Unggul", highlight: "Fakultas Seni Rupa & Desain Paling Bergengsi di Indonesia" },
      { name: "Institut Seni Indonesia (ISI Yogyakarta)", type: "PTN", city: "Yogyakarta", accreditation: "Unggul", highlight: "Kawah Candradimuka Eksplorasi Seni & Ilustrasi Nusantara" },
      { name: "Universitas Bina Nusantara (BINUS School of Design)", type: "PTS", city: "Jakarta", accreditation: "Unggul", highlight: "Fasilitas Lab UI/UX & Desain Digital Standar Industri" },
      { name: "Universitas Multimedia Nusantara (UMN)", type: "PTS", city: "Tangerang", accreditation: "Unggul", highlight: "Pusat Animasi, Game Design & Motion Graphics Modern" },
      { name: "Universitas Sebelas Maret (UNS)", type: "PTN", city: "Surakarta", accreditation: "Unggul", highlight: "Program DKV Kuat Berbasis Budaya & Riset Kreatif" },
      { name: "Universitas Pelita Harapan (UPH)", type: "PTS", city: "Tangerang", accreditation: "Unggul", highlight: "Kurikulum Desain Grafis Bertaraf Internasional" },
    ],
    careerBreakdown: {
      salaryRangeOverall: "Rp 6.500.000 – Rp 14.000.000 / bulan (Fresh Graduate)",
      marketDemand: "Sangat Tinggi",
      roles: [
        {
          role: "UI/UX & Digital Product Designer",
          entryLevelSalary: "Rp 8.000.000 – Rp 15.000.000",
          midLevelSalary: "Rp 18.000.000 – Rp 32.000.000",
          description: "Merancang wireframe interaktif, user testing, dan design system aplikasi mobile/web di Figma.",
        },
        {
          role: "Brand Identity Specialist & Art Director",
          entryLevelSalary: "Rp 7.000.000 – Rp 13.500.000",
          midLevelSalary: "Rp 16.000.000 – Rp 30.000.000",
          description: "Membangun panduan visual brand (brand guidelines), logo ikonik, dan identitas komunikasi visual.",
        },
        {
          role: "Motion Graphics & 3D Visualizer",
          entryLevelSalary: "Rp 7.000.000 – Rp 13.000.000",
          midLevelSalary: "Rp 15.000.000 – Rp 28.000.000",
          description: "Memproduksi animasi bergerak untuk video periklanan, opening title, dan efek visual media sosial.",
        },
        {
          role: "Creative Content Strategist",
          entryLevelSalary: "Rp 6.500.000 – Rp 12.000.000",
          midLevelSalary: "Rp 14.000.000 – Rp 25.000.000",
          description: "Mengembangkan narasi kampanye visual multimedia yang memikat emosi dan konversi audiens.",
        },
      ],
    },
    keyCourses: [
      {
        name: "Nirmana 2D & Teori Warna",
        semester: "Semester 1",
        credits: 4,
        description: "Eksplorasi komposisi rupa, keseimbangan optik, harmoni warna, dan ritme ruang dua dimensi.",
        skillsGained: ["Komposisi Estetika", "Color Harmony", "Sensitivitas Ruang"],
      },
      {
        name: "Gambar Bentuk & Sketsa Konsep",
        semester: "Semester 1",
        credits: 3,
        description: "Melatih koordinasi tangan-mata, hukum perspektif 1-3 titik lenyap, dan arsir volume objek.",
        skillsGained: ["Drawing Anatomy", "Perspektif Spasial", "Sketsa Cepat"],
      },
      {
        name: "Tipografi Dasar & Hierarki Visual",
        semester: "Semester 2",
        credits: 3,
        description: "Anatomi huruf (serif, sans-serif, display), kerning, leading, dan keterbacaan teks informasi.",
        skillsGained: ["Font Anatomy", "Visual Hierarchy", "Layout Readability"],
      },
      {
        name: "Pengantar UI/UX & Desain Interaksi",
        semester: "Semester 2",
        credits: 3,
        description: "Prinsip Design Thinking, user flow, usability heuristic, dan pembuatan prototipe interaktif.",
        skillsGained: ["Figma Prototyping", "User Flow Mapping", "Usability Testing"],
      },
    ],
    practicalTips: [
      "Mulai bangun portofolio di Behance atau Dribbble sejak tugas-tugas studio semester 1.",
      "Kuasai software standar industri seperti Figma, Adobe Illustrator, dan After Effects.",
      "Latih kemampuan menerima kritik (*critique session*) dengan pola pikir iteratif.",
    ],
  },

  "psychology": {
    id: "psychology",
    majorName: "Psikologi & Ilmu Perilaku Manusia",
    overview:
      "Mendalami proses kognitif, dinamika emosi, interaksi sosial, serta metodologi asesmen kepribadian manusia secara saintifik.",
    campuses: [
      { name: "Universitas Indonesia (UI)", type: "PTN", city: "Depok", accreditation: "Unggul", highlight: "Fakultas Psikologi Pertama di Indonesia dengan Riset Internasional" },
      { name: "Universitas Gadjah Mada (UGM)", type: "PTN", city: "Yogyakarta", accreditation: "Unggul", highlight: "Pusat Unggulan Psikologi Sosial, Budaya & Klinis" },
      { name: "Universitas Airlangga (UNAIR)", type: "PTN", city: "Surabaya", accreditation: "Unggul", highlight: "Sangat Kuat dalam Psikologi Industri & Perkembangan Anak" },
      { name: "Universitas Padjadjaran (UNPAD)", type: "PTN", city: "Jatinangor", accreditation: "Unggul", highlight: "Pelopor Psikometri & Validasi Alat Tes Kepribadian" },
      { name: "Universitas Sanata Dharma (USD)", type: "PTS", city: "Yogyakarta", accreditation: "Unggul", highlight: "Fokus Pendekatan Konseling Humanistik & Komunitas" },
      { name: "Universitas Tarumanagara (UNTAR)", type: "PTS", city: "Jakarta", accreditation: "Unggul", highlight: "Program Psikologi Bisnis & Terapan Perilaku Konsumen" },
    ],
    careerBreakdown: {
      salaryRangeOverall: "Rp 6.500.000 – Rp 13.000.000 / bulan (Fresh Graduate)",
      marketDemand: "Tinggi",
      roles: [
        {
          role: "Human Resources (People Operations & Talent Acquisition)",
          entryLevelSalary: "Rp 6.500.000 – Rp 12.000.000",
          midLevelSalary: "Rp 15.000.000 – Rp 26.000.000",
          description: "Mengelola asesmen rekrutmen, retensi bakat, pemetaan kompetensi, dan kultur organisasi.",
        },
        {
          role: "Organizational Development (OD) Specialist",
          entryLevelSalary: "Rp 7.500.000 – Rp 13.500.000",
          midLevelSalary: "Rp 17.000.000 – Rp 30.000.000",
          description: "Merancang program pelatihan kepemimpinan dan intervensi perubahan struktural korporasi.",
        },
        {
          role: "UX Researcher & Behavioral Analyst",
          entryLevelSalary: "Rp 8.000.000 – Rp 14.500.000",
          midLevelSalary: "Rp 18.000.000 – Rp 32.000.000",
          description: "Menganalisis motif psikologis pengguna saat berinteraksi dengan aplikasi digital.",
        },
        {
          role: "Associate Counselor / Mental Health Facilitator",
          entryLevelSalary: "Rp 6.000.000 – Rp 11.500.000",
          midLevelSalary: "Rp 14.000.000 – Rp 25.000.000",
          description: "Memberikan pendampingan konseling suportif di sekolah, klinik, atau komunitas sosial.",
        },
      ],
    },
    keyCourses: [
      {
        name: "Pengantar Psikologi Umum & Sejarah",
        semester: "Semester 1",
        credits: 3,
        description: "Menelaah evolusi mazhab psikologi, neurobiologi dasar otak, sensasi, dan memori jangka panjang.",
        skillsGained: ["Konsep Biopsikologi", "Memori & Kognisi", "Critical Reading"],
      },
      {
        name: "Psikologi Perkembangan Manusia",
        semester: "Semester 1",
        credits: 3,
        description: "Tahapan tumbuh kembang motorik, kognitif, emosi, dan sosial dari masa bayi hingga lansia.",
        skillsGained: ["Observasi Perilaku", "Teori Perkembangan", "Analisis Milestone"],
      },
      {
        name: "Statistika untuk Ilmu Perilaku",
        semester: "Semester 2",
        credits: 4,
        description: "Distribusi normal, uji signifikansi hipotesis (t-test, ANOVA), korelasi, dan pengolahan SPSS.",
        skillsGained: ["SPSS Data Analysis", "Uji Hipotesis", "Riset Kuantitatif"],
      },
      {
        name: "Teori-Teori Kepribadian",
        semester: "Semester 2",
        credits: 3,
        description: "Membedah teori Psikoanalisis Freud, Humanistik Rogers, serta paradigma modern Big Five Traits.",
        skillsGained: ["Profil Kepribadian", "Psikodiagnostik Awal", "Wawancara Eksploratif"],
      },
    ],
    practicalTips: [
      "Kuasai metodologi statistik dan software pengolahan data SPSS/R sejak awal kuliah.",
      "Asah keterampilan active listening dan empati dalam diskusi kelompok.",
      "Jika berminat menjadi psikolog klinis berlisensi, rencanakan kelanjutan ke program Magister Profesi Psikologi.",
    ],
  },

  "medicine-health": {
    id: "medicine-health",
    majorName: "Pendidikan Dokter & Ilmu Kedokteran",
    overview:
      "Mempelajari mekanisme fisiologi tubuh manusia, patologi penyakit, farmakoterapi, serta etika kedokteran untuk menyelamatkan nyawa.",
    campuses: [
      { name: "Universitas Indonesia (FK UI)", type: "PTN", city: "Jakarta (Salemba)", accreditation: "Unggul", highlight: "Fakultas Kedokteran Tertua & Terhubung dengan RS Cipto Mangunkusumo" },
      { name: "Universitas Gadjah Mada (FKKMK UGM)", type: "PTN", city: "Yogyakarta", accreditation: "Unggul", highlight: "Pelopor Pendidikan Bioetika & Berjejaring dengan RS Sardjito" },
      { name: "Universitas Airlangga (FK UNAIR)", type: "PTN", city: "Surabaya", accreditation: "Unggul", highlight: "Pusat Riset Penyakit Tropis & RSUD Dr. Soetomo" },
      { name: "Universitas Padjadjaran (FK UNPAD)", type: "PTN", city: "Jatinangor/Bandung", accreditation: "Unggul", highlight: "Pionir Kurikulum Problem-Based Learning (PBL) & RS Hasan Sadikin" },
      { name: "Universitas Diponegoro (FK UNDIP)", type: "PTN", city: "Semarang", accreditation: "Unggul", highlight: "Fasilitas RS Pendidikan Nasional Terintegrasi Penuh" },
      { name: "Universitas Katolik Indonesia Atma Jaya", type: "PTS", city: "Jakarta", accreditation: "Unggul", highlight: "Fasilitas Rumah Sakit Pendidikan Mandiri Berkualitas Tinggi" },
    ],
    careerBreakdown: {
      salaryRangeOverall: "Rp 7.500.000 – Rp 16.000.000 / bulan (Dokter Internship / Umum)",
      marketDemand: "Sangat Tinggi",
      roles: [
        {
          role: "Dokter Umum & Praktisi Faskes Primer",
          entryLevelSalary: "Rp 8.000.000 – Rp 16.000.000",
          midLevelSalary: "Rp 20.000.000 – Rp 40.000.000+",
          description: "Melakukan diagnosis klinis, penanganan emergensi awal, dan peresepan terapi komprehensif.",
        },
        {
          role: "Medical Advisor & HealthTech Lead",
          entryLevelSalary: "Rp 9.000.000 – Rp 17.000.000",
          midLevelSalary: "Rp 22.000.000 – Rp 42.000.000",
          description: "Menjadi kurator medis klinis untuk platform telemedicine dan validasi algoritma diagnosis digital.",
        },
        {
          role: "Hospital Management & Quality Assurance",
          entryLevelSalary: "Rp 8.500.000 – Rp 15.000.000",
          midLevelSalary: "Rp 18.000.000 – Rp 35.000.000",
          description: "Mengatur standar keselamatan pasien, akreditasi rumah sakit, dan protokol pelayanan medis.",
        },
        {
          role: "Biomedical & Clinical Trial Researcher",
          entryLevelSalary: "Rp 8.000.000 – Rp 15.500.000",
          midLevelSalary: "Rp 19.000.000 – Rp 36.000.000",
          description: "Meneliti efikasi obat baru, uji klinis vaksin, dan publikasi di jurnal medis internasional.",
        },
      ],
    },
    keyCourses: [
      {
        name: "Biologi Sel & Genetika Molekuler",
        semester: "Semester 1",
        credits: 4,
        description: "Struktur organel sel, replikasi DNA, ekspresi genetik, dan mutasi penyebab penyakit bawaan.",
        skillsGained: ["Biologi Molekuler", "Pipetting & Sentrifugasi", "Analisis Genomik"],
      },
      {
        name: "Anatomi Manusia Sistem Tubuh",
        semester: "Semester 1",
        credits: 4,
        description: "Struktur tulang, otot, saraf cranial, dan pembuluh darah melalui praktikum kadaver terpandu.",
        skillsGained: ["Identifikasi Kadaver", "Nomenklatur Anatomi", "Relasi Organ"],
      },
      {
        name: "Fisiologi & Homeostasis Organ",
        semester: "Semester 2",
        credits: 4,
        description: "Mekanisme sirkulasi kardiovaskular, dinamika respirasi paru, ekskresi ginjal, dan endokrin.",
        skillsGained: ["EKG Reading", "Tanda Vital", "Mekanisme Homeostasis"],
      },
      {
        name: "Keterampilan Klinis Dasar (Skills Lab 1)",
        semester: "Semester 2",
        credits: 3,
        description: "Simulasi anamnesis pasien, pemeriksaan fisik dasar, sterilisasi alat, dan etika kedokteran.",
        skillsGained: ["Anamnesis Pasien", "Pemeriksaan Fisik", "Etika Medis"],
      },
    ],
    practicalTips: [
      "Bangun manajemen waktu dan stamina fisik yang prima sejak awal masa perkuliahan preklinik.",
      "Manfaatkan metode belajar Spaced Repetition (seperti Anki) untuk menghafal terminologi anatomi.",
      "Jaga empati dan mental ketahanan diri saat menghadapi rotasi klinik yang intensif.",
    ],
  },

  "law-policy": {
    id: "law-policy",
    majorName: "Ilmu Hukum & Hubungan Internasional",
    overview:
      "Mempelajari asas keadilan, perancangan kontrak bisnis, litigasi peradilan, tata kelola negara, dan diplomasi antarbangsa.",
    campuses: [
      { name: "Universitas Indonesia (FH UI)", type: "PTN", city: "Depok", accreditation: "Unggul", highlight: "Fakultas Hukum Tertua dengan Jaringan Firma Hukum Multinasional Terkuat" },
      { name: "Universitas Gadjah Mada (FH UGM)", type: "PTN", city: "Yogyakarta", accreditation: "Unggul", highlight: "Pusat Hukum Tata Negara, Hukum Adat & Etika Pemerintahan" },
      { name: "Universitas Diponegoro (FH UNDIP)", type: "PTN", city: "Semarang", accreditation: "Unggul", highlight: "Pelopor Aliran Hukum Progresif yang Mengedepankan Keadilan Substantif" },
      { name: "Universitas Padjadjaran (FH UNPAD)", type: "PTN", city: "Bandung", accreditation: "Unggul", highlight: "Sangat Terkemuka di Bidang Hukum Internasional & Hukum Dirgantara" },
      { name: "Universitas Airlangga (FH UNAIR)", type: "PTN", city: "Surabaya", accreditation: "Unggul", highlight: "Pusat Kajian Hukum Bisnis & Ketenagakerjaan Indonesia" },
      { name: "Universitas Pelita Harapan (UPH Law)", type: "PTS", city: "Tangerang/Jakarta", accreditation: "Unggul", highlight: "Prestasi Teratas dalam Kejuaraan Peradilan Semu (Moot Court) Dunia" },
    ],
    careerBreakdown: {
      salaryRangeOverall: "Rp 7.000.000 – Rp 15.000.000 / bulan (Fresh Graduate)",
      marketDemand: "Tinggi",
      roles: [
        {
          role: "Corporate Legal Counsel",
          entryLevelSalary: "Rp 8.500.000 – Rp 16.000.000",
          midLevelSalary: "Rp 20.000.000 – Rp 42.000.000",
          description: "Menyusun perjanjian kontrak komersial, due diligence investasi, dan mitigasi risiko hukum korporasi.",
        },
        {
          role: "Litigation & Dispute Resolution Associate",
          entryLevelSalary: "Rp 7.500.000 – Rp 15.000.000",
          midLevelSalary: "Rp 18.000.000 – Rp 38.000.000",
          description: "Mempersiapkan berkas gugatan, pledoi persidangan, dan mediasi sengketa perdata/pidana.",
        },
        {
          role: "Diplomat & International Relations Officer",
          entryLevelSalary: "Gaji & Tunjangan Luar Negeri Kompetitif (Kemenlu)",
          midLevelSalary: "Tunjangan Perwakilan Luar Negeri Berstandar Diplomatik",
          description: "Menjalankan diplomasi bilateral, negosiasi traktat perdagangan, dan perlindungan WNI di luar negeri.",
        },
        {
          role: "Compliance & Regulatory Affairs Specialist",
          entryLevelSalary: "Rp 7.500.000 – Rp 14.000.000",
          midLevelSalary: "Rp 17.000.000 – Rp 30.000.000",
          description: "Memastikan operasional perusahaan teknologi dan perbankan mematuhi regulasi OJK dan kementerian.",
        },
      ],
    },
    keyCourses: [
      {
        name: "Pengantar Ilmu Hukum (PIH) & Asas Keadilan",
        semester: "Semester 1",
        credits: 4,
        description: "Menelaah sumber hukum material/formal, hierarki norma hukum, dan filsafat keadilan Aristoteles hingga modern.",
        skillsGained: ["Legal Reasoning", "Asas Hukum", "Analisis Norma"],
      },
      {
        name: "Pengantar Tata Hukum Indonesia (PTHI)",
        semester: "Semester 1",
        credits: 3,
        description: "Peta hukum positif Indonesia: sistem hukum pidana, perdata barat/adat, dan hukum tata usaha negara.",
        skillsGained: ["Sistem Peradilan", "Hukum Positif", "Hierarki Regulasi"],
      },
      {
        name: "Hukum Perdata & Teori Perikatan Kontrak",
        semester: "Semester 2",
        credits: 4,
        description: "Syarat sahnya perjanjian Pasal 1320 KUHPerdata, hak kebendaan, wanprestasi, dan ganti kerugian.",
        skillsGained: ["Legal Drafting", "Review Kontrak", "Analisis Klausul"],
      },
      {
        name: "Hukum Pidana & Teori Pemidanaan",
        semester: "Semester 2",
        credits: 3,
        description: "Asas legalitas, unsur perbuatan melawan hukum (mens rea & actus reus), serta alasan pemaaf/pembenar.",
        skillsGained: ["Analisis Pasal Delik", "Studi Kasus Pidana", "Argumentasi Logika"],
      },
    ],
    practicalTips: [
      "Ikuti kegiatan Moot Court (Peradilan Semu) untuk mengasah keberanian berbicara dan menyusun berkas perkara.",
      "Asah kemampuan membaca cepat literatur perundang-undangan dan jurisprudensi pengadilan.",
      "Perdalam kemampuan bahasa Inggris hukum (Legal English) untuk membuka peluang di firma hukum internasional.",
    ],
  },
};

/**
 * Fallback generator for custom or dynamically generated majors
 */
export function getMajorExtendedDetail(
  majorId: string,
  majorName: string,
  cluster: "Saintek" | "Soshum" | "Seni & Industri Kreatif"
): MajorExtendedDetail {
  if (MAJOR_EXTENDED_DETAILS[majorId]) {
    return MAJOR_EXTENDED_DETAILS[majorId];
  }

  // Fallback matching by cluster
  if (cluster === "Saintek") {
    return {
      id: majorId,
      majorName,
      overview: `Program studi berbasis sains dan rekayasa terapan yang mengasah penalaran analitis, metode kuantitatif, dan pemecahan masalah teknis.`,
      campuses: [
        { name: "Institut Teknologi Bandung (ITB)", type: "PTN", city: "Bandung", accreditation: "Unggul", highlight: "Rujukan Sains & Teknologi Terdepan" },
        { name: "Universitas Indonesia (UI)", type: "PTN", city: "Depok", accreditation: "Unggul", highlight: "Pusat Riset Terpadu & Laboratorium Lengkap" },
        { name: "Universitas Gadjah Mada (UGM)", type: "PTN", city: "Yogyakarta", accreditation: "Unggul", highlight: "Jaringan Riset Akademik Nasional" },
        { name: "Institut Teknologi Sepuluh Nopember (ITS)", type: "PTN", city: "Surabaya", accreditation: "Unggul", highlight: "Keunggulan Rekayasa & Terapan" },
        { name: "Universitas Bina Nusantara (BINUS)", type: "PTS", city: "Jakarta", accreditation: "Unggul", highlight: "Kemitraan Industri Teknologi" },
      ],
      careerBreakdown: {
        salaryRangeOverall: "Rp 7.500.000 – Rp 15.000.000 / bulan (Entry-Level)",
        marketDemand: "Tinggi",
        roles: [
          { role: "Technical Specialist / Engineer", entryLevelSalary: "Rp 8.000.000 – Rp 15.000.000", midLevelSalary: "Rp 18.000.000 – Rp 35.000.000", description: "Menganalisis sistem teknis dan implementasi solusi rekayasa terstruktur." },
          { role: "R&D / Data & Systems Analyst", entryLevelSalary: "Rp 7.500.000 – Rp 14.000.000", midLevelSalary: "Rp 17.000.000 – Rp 30.000.000", description: "Melakukan pengujian empiris dan optimasi performa operasional." },
        ],
      },
      keyCourses: [
        { name: "Kalkulus & Metode Numerik Terapan", semester: "Semester 1", credits: 3, description: "Fondasi perhitungan kalkulus diferensial dan integral untuk pemodelan.", skillsGained: ["Matematika Rekayasa", "Analisis Angka"] },
        { name: "Logika Algoritma & Komputasi Dasar", semester: "Semester 1", credits: 3, description: "Pemecahan masalah terstruktur menggunakan komputasi terprogram.", skillsGained: ["Problem Solving", "Logika"] },
        { name: "Metodologi Riset & Eksperimen Sains", semester: "Semester 2", credits: 3, description: "Penyusunan hipotesis, metodologi pengambilan data, dan verifikasi statistik.", skillsGained: ["Riset Ilmiah", "Validasi Data"] },
      ],
      practicalTips: ["Perkuat fondasi matematika dan logika analitik.", "Aktif dalam proyek riset laboratorium sejak semester awal."],
    };
  }

  if (cluster === "Seni & Industri Kreatif") {
    return {
      id: majorId,
      majorName,
      overview: `Program studi yang mengintegrasikan kepekaan estetika, narasi visual, teknologi media baru, dan inovasi industri kreatif.`,
      campuses: [
        { name: "Institut Teknologi Bandung (FSRD ITB)", type: "PTN", city: "Bandung", accreditation: "Unggul", highlight: "Fakultas Seni Rupa & Desain Bergengsi" },
        { name: "Institut Seni Indonesia (ISI Yogyakarta)", type: "PTN", city: "Yogyakarta", accreditation: "Unggul", highlight: "Pusat Budaya & Eksplorasi Seni" },
        { name: "Universitas Bina Nusantara (BINUS)", type: "PTS", city: "Jakarta", accreditation: "Unggul", highlight: "Desain Digital & Studio Modern" },
        { name: "Universitas Multimedia Nusantara (UMN)", type: "PTS", city: "Tangerang", accreditation: "Unggul", highlight: "Multimedia & Industri Kreatif Digital" },
      ],
      careerBreakdown: {
        salaryRangeOverall: "Rp 6.500.000 – Rp 14.000.000 / bulan (Entry-Level)",
        marketDemand: "Sangat Tinggi",
        roles: [
          { role: "Creative Designer / Visual Specialist", entryLevelSalary: "Rp 7.000.000 – Rp 13.500.000", midLevelSalary: "Rp 16.000.000 – Rp 30.000.000", description: "Menghasilkan konsep visual berdampak tinggi bagi audiens luas." },
          { role: "Digital Content Producer", entryLevelSalary: "Rp 6.500.000 – Rp 12.000.000", midLevelSalary: "Rp 15.000.000 – Rp 26.000.000", description: "Mengembangkan media naratif dan komunikasi visual interaktif." },
        ],
      },
      keyCourses: [
        { name: "Dasar-Dasar Nirmana & Ruang Estetika", semester: "Semester 1", credits: 4, description: "Komposisi bentuk, warna, dan proporsi visual.", skillsGained: ["Komposisi", "Warna", "Rasa Estetika"] },
        { name: "Sketsa & Visualisasi Ide Kreatif", semester: "Semester 1", credits: 3, description: "Menuangkan ide abstrak menjadi visual representatif.", skillsGained: ["Sketsa", "Storyboarding"] },
        { name: "Desain Digital & Media Interaktif", semester: "Semester 2", credits: 3, description: "Aplikasi software digital dan komunikasi grafis.", skillsGained: ["Software Desain", "Produksi Visual"] },
      ],
      practicalTips: ["Bangun portofolio karya sejak semester pertama.", "Latih kepekaan visual terhadap tren desain global."],
    };
  }

  // Default Soshum
  return {
    id: majorId,
    majorName,
    overview: `Program studi sosial humaniora yang mengasah pemahaman dinamika manusia, komunikasi persuasif, regulasi, dan manajemen strategis.`,
    campuses: [
      { name: "Universitas Indonesia (UI)", type: "PTN", city: "Depok", accreditation: "Unggul", highlight: "Fasilitas & Jaringan Nasional Terkemuka" },
      { name: "Universitas Gadjah Mada (UGM)", type: "PTN", city: "Yogyakarta", accreditation: "Unggul", highlight: "Pusat Kajian Sosial & Humaniora Unggulan" },
      { name: "Universitas Airlangga (UNAIR)", type: "PTN", city: "Surabaya", accreditation: "Unggul", highlight: "Riset Sosial & Korporasi Berpengaruh" },
      { name: "Universitas Padjadjaran (UNPAD)", type: "PTN", city: "Bandung", accreditation: "Unggul", highlight: "Pilihan Favorit Sosial & Komunikasi" },
      { name: "Universitas Bina Nusantara (BINUS)", type: "PTS", city: "Jakarta", accreditation: "Unggul", highlight: "Jejaring Bisnis & Industri Luas" },
    ],
    careerBreakdown: {
      salaryRangeOverall: "Rp 7.000.000 – Rp 14.500.000 / bulan (Entry-Level)",
      marketDemand: "Tinggi",
      roles: [
        { role: "Corporate & Communications Analyst", entryLevelSalary: "Rp 7.000.000 – Rp 13.500.000", midLevelSalary: "Rp 16.000.000 – Rp 30.000.000", description: "Mengelola strategi komunikasi publik dan relasi stakeholder organisasi." },
        { role: "Strategy & Policy Associate", entryLevelSalary: "Rp 7.500.000 – Rp 14.000.000", midLevelSalary: "Rp 18.000.000 – Rp 34.000.000", description: "Menganalisis regulasi dan menyusun rekomendasi kebijakan institusi." },
      ],
    },
    keyCourses: [
      { name: "Pengantar Ilmu Sosial & Humaniora", semester: "Semester 1", credits: 3, description: "Fondasi dinamika struktur masyarakat dan interaksi sosial.", skillsGained: ["Critical Thinking", "Perspektif Sosial"] },
      { name: "Komunikasi Publik & Argumentasi Logis", semester: "Semester 1", credits: 3, description: "Penyusunan narasi persuasif dan teknik presentasi efektif.", skillsGained: ["Public Speaking", "Retorika"] },
      { name: "Metodologi Riset Kualitatif & Analisis Data", semester: "Semester 2", credits: 3, description: "Wawancara mendalam, observasi partisipatif, dan analisis konten.", skillsGained: ["Riset Kualitatif", "Wawancara"] },
    ],
    practicalTips: ["Perbanyak literasi buku referensi dan artikel ilmiah.", "Aktif dalam forum diskusi, simulasi debat, atau organisasi kampus."],
  };
}
