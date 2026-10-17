import { PrismaClient, Role, DimensionCategory } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting GGC Assessment System database seed...");

  // 1. Seed Default Admin User
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@ggc.id" },
    update: {},
    create: {
      email: "admin@ggc.id",
      password_hash: adminPassword,
      role: Role.ADMIN,
      profile: {
        create: {
          full_name: "GGC Master Administrator",
          phone_number: "081122334455",
          school_name: "GGC Assessment Headquarter",
          grade: "Staff Administrator",
        },
      },
    },
  });
  console.log("✅ Admin user seeded: admin@ggc.id");

  // 2. Seed Sample Student User
  const studentPassword = await bcrypt.hash("student123", 10);
  const student = await prisma.user.upsert({
    where: { email: "student@ggc.id" },
    update: {},
    create: {
      email: "student@ggc.id",
      password_hash: studentPassword,
      role: Role.STUDENT,
      profile: {
        create: {
          full_name: "Muhammad Kevin Pratama",
          phone_number: "081234567890",
          school_name: "SMA Negeri 1 Jakarta",
          grade: "Kelas 12 MIPA",
        },
      },
    },
  });
  console.log("✅ Sample student user seeded: student@ggc.id");

  // Standard Likert 1-5 Options Json
  const defaultLikertOptions = [
    { value: 1, label: "Sangat Tidak Sesuai" },
    { value: 2, label: "Tidak Sesuai" },
    { value: 3, label: "Netral / Ragu-ragu" },
    { value: 4, label: "Sesuai" },
    { value: 5, label: "Sangat Sesuai" },
  ];

  // 3. Define 84 Questions across 7 Dimensions (12 questions each)
  const questionDefinitions: Array<{
    code: string;
    dimension: DimensionCategory;
    subdimensi: string;
    text: string;
  }> = [
    // --- 1. TALENT (T01 - T12) ---
    { code: "T01", dimension: DimensionCategory.TALENT, subdimensi: "Logika Analitikal", text: "Saya dengan cepat mampu menangkap pola sebab-akibat dalam data angka atau grafik rumit." },
    { code: "T02", dimension: DimensionCategory.TALENT, subdimensi: "Penalaran Spasial", text: "Saya mampu membayangkan bentuk tiga dimensi dari sebuah gambar sketsa dua dimensi dengan mudah." },
    { code: "T03", dimension: DimensionCategory.TALENT, subdimensi: "Kecerdasan Verbal", text: "Saya mudah mengekspresikan ide-ide kompleks ke dalam tulisan atau argumen lisan yang persuasif." },
    { code: "T04", dimension: DimensionCategory.TALENT, subdimensi: "Pemecahan Masalah Sistem", text: "Saya senang mengurai alur kerja mesin atau program komputer untuk mencari letak kesalahannya." },
    { code: "T05", dimension: DimensionCategory.TALENT, subdimensi: "Sensitivitas Estetika", text: "Saya memiliki kepekaan tinggi terhadap komposisi warna, tata letak, dan keharmonisan visual." },
    { code: "T06", dimension: DimensionCategory.TALENT, subdimensi: "Kecerdasan Intrapersonal", text: "Saya mampu mengidentifikasi pemicu emosi diri sendiri dan mengelolanya secara tenang dalam tekanan." },
    { code: "T07", dimension: DimensionCategory.TALENT, subdimensi: "Intuisi Sosial", text: "Saya cepat membaca bahasa tubuh orang lain dan memahami suasana hati mereka tanpa diberi tahu." },
    { code: "T08", dimension: DimensionCategory.TALENT, subdimensi: "Daya Ingat Konseptual", text: "Saya mudah mengingat terminologi teknis, teori abstrak, serta asosiasi antar konsep baru." },
    { code: "T09", dimension: DimensionCategory.TALENT, subdimensi: "Koordinasi Kinestetik", text: "Saya memiliki keterampilan tangan yang terampil dan presisi saat membedah atau merakit perkakas." },
    { code: "T10", dimension: DimensionCategory.TALENT, subdimensi: "Pola Berpikir Kritis", text: "Saya terbiasa memverifikasi kebenaran sebuah informasi sebelum menerimanya sebagai fakta." },
    { code: "T11", dimension: DimensionCategory.TALENT, subdimensi: "Kreativitas Orisinal", text: "Saya sering menemukan metode alternatif yang unik untuk menyelesaikan tugas yang monoton." },
    { code: "T12", dimension: DimensionCategory.TALENT, subdimensi: "Perencanaan Strategis", text: "Saya mahir membuat proyeksi skenario jangka panjang beserta langkah mitigasi risiko." },

    // --- 2. INTEREST (I01 - I12) ---
    { code: "I01", dimension: DimensionCategory.INTEREST, subdimensi: "Investigasi Sains", text: "Saya sangat tertarik meneliti fenomena alam, eksperimen laboratorium, dan penelitian ilmiah terbaru." },
    { code: "I02", dimension: DimensionCategory.INTEREST, subdimensi: "Teknologi & Komputasi", text: "Saya antusias belajar bahasa pemrograman, kecerdasan buatan, atau pengembangan aplikasi perangkat lunak." },
    { code: "I03", dimension: DimensionCategory.INTEREST, subdimensi: "Desain Kreatif & Multimedia", text: "Saya betah menghabiskan waktu berjam-jam mendesain grafis, ilustrasi, atau mengedit video." },
    { code: "I04", dimension: DimensionCategory.INTEREST, subdimensi: "Bisnis & Kewirausahaan", text: "Saya tertarik mempelajari strategi pemasaran, valuasi bisnis rintisan, dan peluang transaksi pasar." },
    { code: "I05", dimension: DimensionCategory.INTEREST, subdimensi: "Pelayanan Kesehatan", text: "Saya terpanggil untuk merawat pasien, memahami diagnosis penyakit medis, dan anatomi biologi." },
    { code: "I06", dimension: DimensionCategory.INTEREST, subdimensi: "Hukum & Tata Kelola", text: "Saya tertarik dengan pembahasan regulasi negara, peradilan hukum, diplomasi, dan debat kebijakan." },
    { code: "I07", dimension: DimensionCategory.INTEREST, subdimensi: "Psikologi & Konseling", text: "Saya senang mendengarkan curhat orang lain dan mendalami motif perilaku manusia." },
    { code: "I08", dimension: DimensionCategory.INTEREST, subdimensi: "Eksplorasi Lapangan", text: "Saya lebih menikmati kegiatan lapangan, geologi, ekspedisi satwa liar daripada duduk di meja." },
    { code: "I09", dimension: DimensionCategory.INTEREST, subdimensi: "Sastra & Bahasa Asing", text: "Saya suka menganalisis karya sastra, belajar bahasa asing baru, dan kajian lintas budaya." },
    { code: "I10", dimension: DimensionCategory.INTEREST, subdimensi: "Finansial & Investasi", text: "Saya tertarik membaca laporan arus kas keuangan, instrumen saham, dan analisis perbankan." },
    { code: "I11", dimension: DimensionCategory.INTEREST, subdimensi: "Teknik & Manufaktur", text: "Saya senang mempelajari cara kerja turbin, robotika industri, dan infrastruktur konstruksi." },
    { code: "I12", dimension: DimensionCategory.INTEREST, subdimensi: "Pemberdayaan Sosial", text: "Saya tergerak aktif dalam aksi sosial sukarela, advokasi kemanusiaan, dan edukasi komunitas." },

    // --- 3. PERSONALITY (P01 - P12) ---
    { code: "P01", dimension: DimensionCategory.PERSONALITY, subdimensi: "Keteraturan / Conscientiousness", text: "Saya selalu merapikan jadwal, membuat daftar tugas terperinci, dan tidak menyukai ketidakteraturan." },
    { code: "P02", dimension: DimensionCategory.PERSONALITY, subdimensi: "Keterbukaan Pengalaman", text: "Saya sangat menyambut ide-ide baru yang tidak konvensional dan suka keluar dari zona nyaman." },
    { code: "P03", dimension: DimensionCategory.PERSONALITY, subdimensi: "Ekstroversi / Interaksi", text: "Saya merasa berenergi saat berada di tengah keramaian dan mudah mencairkan suasana dengan orang baru." },
    { code: "P04", dimension: DimensionCategory.PERSONALITY, subdimensi: "Keramahan / Agreeableness", text: "Saya cenderung mengutamakan keharmonisan kelompok daripada memaksakan kehendak pribadi." },
    { code: "P05", dimension: DimensionCategory.PERSONALITY, subdimensi: "Stabilitas Emosional", text: "Saya tetap tenang dan kepala dingin meskipun menghadapi krisis mendadak atau tenggat waktu mepet." },
    { code: "P06", dimension: DimensionCategory.PERSONALITY, subdimensi: "Kemandirian Kerja", text: "Saya bekerja lebih optimal ketika diberikan kebebasan penuh tanpa perlu diawasi secara ketat." },
    { code: "P07", dimension: DimensionCategory.PERSONALITY, subdimensi: "Ketahanan / Grit", text: "Saya tidak mudah menyerah meskipun menghadapi kegagalan berulang kali dalam proyek yang sulit." },
    { code: "P08", dimension: DimensionCategory.PERSONALITY, subdimensi: "Kepemimpinan Alami", text: "Secara naluriah saya berani mengambil inisiatif mengarahkan tim saat situasi tidak menentu." },
    { code: "P09", dimension: DimensionCategory.PERSONALITY, subdimensi: "Fokus Detail", text: "Saya sangat teliti menemukan ketidaksesuaian kecil yang kerap terlewatkan oleh orang lain." },
    { code: "P10", dimension: DimensionCategory.PERSONALITY, subdimensi: "Fleksibilitas Adaptif", text: "Saya mudah menyesuaikan diri ketika rencana awal berubah secara tiba-tiba di tengah jalan." },
    { code: "P11", dimension: DimensionCategory.PERSONALITY, subdimensi: "Orientasi Kolaborasi", text: "Saya lebih menikmati mencapai target bersama tim sinergis dibanding bekerja individualistis." },
    { code: "P12", dimension: DimensionCategory.PERSONALITY, subdimensi: "Rasa Ingin Tahu Tinggi", text: "Saya selalu terdorong mencari tahu 'mengapa' dan 'bagaimana' sesuatu bekerja sampai ke akarnya." },

    // --- 4. VALUES (V01 - V12) ---
    { code: "V01", dimension: DimensionCategory.VALUES, subdimensi: "Kontribusi Kemanusiaan", text: "Bagi saya, makna karier sejati adalah seberapa besar dampak positif yang saya berikan bagi masyarakat." },
    { code: "V02", dimension: DimensionCategory.VALUES, subdimensi: "Otonomi & Kebebasan", text: "Saya lebih menghargai kebebasan menentukan jam kerja dibanding gaji tinggi tapi serba terikat." },
    { code: "V03", dimension: DimensionCategory.VALUES, subdimensi: "Prestise & Pengakuan", text: "Menduduki posisi yang dihormati dan diakui secara profesional merupakan motivasi utama saya." },
    { code: "V04", dimension: DimensionCategory.VALUES, subdimensi: "Keamanan Finansial", text: "Kepastian stabilitas pendapatan bulanan yang mapan lebih penting daripada spekulasi risiko tinggi." },
    { code: "V05", dimension: DimensionCategory.VALUES, subdimensi: "Inovasi Berkelanjutan", text: "Saya mendambakan lingkungan kerja yang mendorong eksperimen terobosan dan hal baru tiada henti." },
    { code: "V06", dimension: DimensionCategory.VALUES, subdimensi: "Integritas Etika", text: "Saya menolak berkompromi terhadap kejujuran dan etika moral, apapun imbalan materinya." },
    { code: "V07", dimension: DimensionCategory.VALUES, subdimensi: "Keseimbangan Hidup", text: "Keseimbangan antara karier cemerlang dan waktu untuk keluarga/spiritual adalah harga mati bagi saya." },
    { code: "V08", dimension: DimensionCategory.VALUES, subdimensi: "Peningkatan Kapasitas", text: "Saya menilai kesuksesan dari seberapa pesat kemampuan intelektual saya terus bertumbuh setiap tahun." },
    { code: "V09", dimension: DimensionCategory.VALUES, subdimensi: "Pengaruh & Kekuasaan Positif", text: "Memiliki otoritas untuk membuat keputusan besar yang menggerakkan banyak pihak memotivasi saya." },
    { code: "V10", dimension: DimensionCategory.VALUES, subdimensi: "Kelestarian Lingkungan", text: "Saya ingin berkarya di sektor yang menjamin keberlanjutan bumi dan konservasi alam." },
    { code: "V11", dimension: DimensionCategory.VALUES, subdimensi: "Dinamisme & Tantangan", text: "Saya cepat bosan dengan rutinitas statis dan lebih bersemangat dalam ritme kerja yang dinamis." },
    { code: "V12", dimension: DimensionCategory.VALUES, subdimensi: "Solidaritas Persaudaraan", text: "Memiliki rasa kekeluargaan yang erat dengan rekan sejawat adalah faktor kenyamanan utama saya." },

    // --- 5. ACADEMIC (A01 - A12) ---
    { code: "A01", dimension: DimensionCategory.ACADEMIC, subdimensi: "Kesiapan Kalkulus & Aljabar", text: "Saya merasa nyaman bergelut dengan persamaan matematika tingkat lanjut dan pembuktian rumus." },
    { code: "A02", dimension: DimensionCategory.ACADEMIC, subdimensi: "Literasi Jurnal Ilmiah", text: "Saya sanggup membaca dan merangkum intisari artikel ilmiah panjang berbahasa Inggris tanpa jenuh." },
    { code: "A03", dimension: DimensionCategory.ACADEMIC, subdimensi: "Manajemen Riset Mandiri", text: "Saya percaya diri mampu merancang proposal penelitian atau karya tulis ilmiah secara mandiri." },
    { code: "A04", dimension: DimensionCategory.ACADEMIC, subdimensi: "Studi Eksperimental Praktik", text: "Saya lebih cepat paham materi perkuliahan lewat uji coba laboratorium dibanding sekadar membaca buku." },
    { code: "A05", dimension: DimensionCategory.ACADEMIC, subdimensi: "Debat Teori Sosial", text: "Saya antusias mengkomparasikan teori-teori sosiologi, ekonomi, atau ilmu komunikasi di ruang kuliah." },
    { code: "A06", dimension: DimensionCategory.ACADEMIC, subdimensi: "Stamina Belajar Intensif", text: "Saya sanggup berkonsentrasi belajar intensif selama berminggu-minggu menjelang periode ujian berat." },
    { code: "A07", dimension: DimensionCategory.ACADEMIC, subdimensi: "Apresiasi Studi Interdisipliner", text: "Saya senang memadukan dua disiplin ilmu yang berbeda (misal: bioinformatika atau psikologi teknologi)." },
    { code: "A08", dimension: DimensionCategory.ACADEMIC, subdimensi: "Penguasaan Perangkat Lunak Kuliah", text: "Saya cepat menguasai aplikasi statistik/analisis (seperti SPSS, Python, MATLAB, atau Tableau)." },
    { code: "A09", dimension: DimensionCategory.ACADEMIC, subdimensi: "Penyusunan Argumentasi Akademik", text: "Saya terampil menyusun paragraf esai akademik yang runut, kohesif, dan didukung sitasi tepercaya." },
    { code: "A10", dimension: DimensionCategory.ACADEMIC, subdimensi: "Kesiapan Praktik Lapangan", text: "Saya siap mengikuti program studi yang mewajibkan kuliah kerja nyata atau magang klinis rumah sakit." },
    { code: "A11", dimension: DimensionCategory.ACADEMIC, subdimensi: "Antusiasme Kuliah Lanjutan", text: "Saya memiliki cita-cita kuat melanjutkan pendidikan hingga jenjang Magister (S2) atau Spesialis." },
    { code: "A12", dimension: DimensionCategory.ACADEMIC, subdimensi: "Kemampuan Presentasi Sidang", text: "Saya percaya diri mempresentasikan hasil karya skripsi/proyek di hadapan dewan penguji ahli." },

    // --- 6. CAREER (C01 - C12) ---
    { code: "C01", dimension: DimensionCategory.CAREER, subdimensi: "Teknologi Informasi & Software", text: "Saya ingin berprofesi sebagai Software Engineer, Data Scientist, atau Cyber Security Specialist." },
    { code: "C02", dimension: DimensionCategory.CAREER, subdimensi: "Medis & Tenaga Kesehatan", text: "Saya bercita-cita menjadi Dokter, Apoteker, Dokter Gigi, atau Peneliti Biomedis terkemuka." },
    { code: "C03", dimension: DimensionCategory.CAREER, subdimensi: "Rekayasa & Desain Manufaktur", text: "Saya berminat menjadi Arsitek, Insinyur Sipil, Insinyur Mesin, atau Perancang Dirgantara." },
    { code: "C04", dimension: DimensionCategory.CAREER, subdimensi: "Korporasi & Konsultasi Manajemen", text: "Saya tertarik meniti karier sebagai Investment Banker, Konsultan Manajemen, atau Brand Strategist." },
    { code: "C05", dimension: DimensionCategory.CAREER, subdimensi: "Hukum & Aparatur Publik", text: "Saya bercita-cita berkarier sebagai Hakim, Jaksa, Diplomat Luar Negeri, atau Notaris." },
    { code: "C06", dimension: DimensionCategory.CAREER, subdimensi: "Industri Kreatif & Hiburan", text: "Saya ingin berkarya sebagai Creative Director, Animator 3D, Sutradara Film, atau UI/UX Designer." },
    { code: "C07", dimension: DimensionCategory.CAREER, subdimensi: "Pendidikan & Akademisi", text: "Saya tertarik menjadi Dosen Universitas, Peneliti Lembaga Riset, atau Trainer Profesional." },
    { code: "C08", dimension: DimensionCategory.CAREER, subdimensi: "Kewirausahaan / Founder", text: "Saya bertekad membangun perusahaan rintisan sendiri dan membuka lapangan pekerjaan bagi ribuan orang." },
    { code: "C09", dimension: DimensionCategory.CAREER, subdimensi: "Lembaga Swadaya & NGO Global", text: "Saya ingin bekerja di organisasi internasional seperti PBB, UNICEF, atau lembaga donor kemanusiaan." },
    { code: "C10", dimension: DimensionCategory.CAREER, subdimensi: "Keuangan & Audit Publik", text: "Saya berminat menjadi Akuntan Publik Bersertifikat (CPA), Aktuaris, atau Auditor Forensik." },
    { code: "C11", dimension: DimensionCategory.CAREER, subdimensi: "Media & Hubungan Komunikasi", text: "Saya tertarik menjadi Jurnalis Investigatif, Editor Media Massa, atau Public Relations Specialist." },
    { code: "C12", dimension: DimensionCategory.CAREER, subdimensi: "Agrikultur & Energi Terbarukan", text: "Saya ingin berkarier di sektor pertanian presisi, agritech, atau pengembang energi surya/terbarukan." },

    // --- 7. READINESS (R01 - R12) ---
    { code: "R01", dimension: DimensionCategory.READINESS, subdimensi: "Kemandirian Hidup (Living)", text: "Saya siap mengurus kebutuhan hidup harian mandiri jika harus merantau kuliah di luar kota." },
    { code: "R02", dimension: DimensionCategory.READINESS, subdimensi: "Manajemen Keuangan Pribadi", text: "Saya mampu mengelola anggaran bulanan dan mencatat pengeluaran agar tidak boros." },
    { code: "R03", dimension: DimensionCategory.READINESS, subdimensi: "Daya Tahan Culture Shock", text: "Saya mudah bergaul dan berbaur dengan teman dari berbagai latar belakang suku, agama, dan budaya." },
    { code: "R04", dimension: DimensionCategory.READINESS, subdimensi: "Resiliensi Beban Belajar", text: "Saya sudah siap mental menghadapi tugas kuliah bertumpuk yang jauh lebih menantang dibanding SMA." },
    { code: "R05", dimension: DimensionCategory.READINESS, subdimensi: "Manajemen Waktu Bebas", text: "Saya mampu membagi waktu secara bijak antara kuliah, organisasi kemahasiswaan, dan istirahat." },
    { code: "R06", dimension: DimensionCategory.READINESS, subdimensi: "Kemandirian Keputusan", text: "Pilihan jurusan yang saya incar merupakan murni kesadaran cita-cita saya, bukan paksaan pihak lain." },
    { code: "R07", dimension: DimensionCategory.READINESS, subdimensi: "Kesiapan Mental Bersaing", text: "Saya siap berada di lingkungan kampus berprestasi tinggi di mana banyak mahasiswa hebat berkumpul." },
    { code: "R08", dimension: DimensionCategory.READINESS, subdimensi: "Keterampilan Mencari Solusi", text: "Ketika menemui kendala akademis, saya proaktif bertanya ke dosen, asisten, atau mencari referensi." },
    { code: "R09", dimension: DimensionCategory.READINESS, subdimensi: "Pengendalian Distraksi Digital", text: "Saya sanggup membatasi waktu bermain game atau media sosial saat mendekati masa belajar penting." },
    { code: "R10", dimension: DimensionCategory.READINESS, subdimensi: "Kesehatan Fisik & Pola Tidur", text: "Saya terbiasa menjaga pola makan teratur dan istirahat yang cukup untuk menjaga stamina belajar." },
    { code: "R11", dimension: DimensionCategory.READINESS, subdimensi: "Kesiapan Finansial Studi", text: "Keluarga saya dan saya telah merencanakan skema pembiayaan kuliah atau skema beasiswa target." },
    { code: "R12", dimension: DimensionCategory.READINESS, subdimensi: "Keyakinan Panggilan Diri", text: "Saya memiliki motivasi batin yang kuat mengapa saya harus menuntaskan perkuliahan hingga wisuda." },
  ];

  console.log(`📦 Seeding ${questionDefinitions.length} assessment question items across 7 dimensions...`);

  for (const q of questionDefinitions) {
    await prisma.question.upsert({
      where: { code: q.code },
      update: {
        dimension_category: q.dimension,
        subdimensi: q.subdimensi,
        question_text: q.text,
        options: defaultLikertOptions,
        is_active: true,
      },
      create: {
        code: q.code,
        dimension_category: q.dimension,
        subdimensi: q.subdimensi,
        question_text: q.text,
        options: defaultLikertOptions,
        is_active: true,
      },
    });
  }

  console.log("✅ Successfully seeded all 84 assessment questions!");
  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
