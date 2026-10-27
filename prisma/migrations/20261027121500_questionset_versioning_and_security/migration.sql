-- ============================================================================
-- CHANGE SETS E & F: 8-Stage QuestionSet Versioning, Immutability Triggers,
-- JWT Session Revocation (token_version), and Shared Rate Limiting
-- ============================================================================

-- STAGE 1: Additive Schema Creation (Nullable Columns & New Tables)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "token_version" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS "rate_limit_buckets" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "reset_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rate_limit_buckets_pkey" PRIMARY KEY ("key")
);

CREATE TABLE IF NOT EXISTS "question_sets" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "scoring_config" JSONB NOT NULL,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "question_sets_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "question_sets_version_key" ON "question_sets"("version");

CREATE TABLE IF NOT EXISTS "question_set_items" (
    "id" TEXT NOT NULL,
    "question_set_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL,
    "dimension_category" "DimensionCategory" NOT NULL,
    "subdimensi" TEXT NOT NULL,
    "question_text" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "scoring_weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "legacy_question_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "question_set_items_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "question_set_items_question_set_id_code_key" ON "question_set_items"("question_set_id", "code");
CREATE INDEX IF NOT EXISTS "question_set_items_question_set_id_order_index_idx" ON "question_set_items"("question_set_id", "order_index");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'question_set_items_question_set_id_fkey'
  ) THEN
    ALTER TABLE "question_set_items"
      ADD CONSTRAINT "question_set_items_question_set_id_fkey"
      FOREIGN KEY ("question_set_id") REFERENCES "question_sets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

ALTER TABLE "assessment_sessions" ADD COLUMN IF NOT EXISTS "question_set_id" TEXT;
ALTER TABLE "assessment_answers" ADD COLUMN IF NOT EXISTS "question_set_item_id" TEXT;

-- STAGE 2: Seed QuestionSet v1 & Ensure All 84 Standard Questions Exist
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_T01', 'T01', 'TALENT'::"DimensionCategory", 'Logika Analitikal', 'Saya dengan cepat mampu menangkap pola sebab-akibat dalam data angka atau grafik rumit.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_T02', 'T02', 'TALENT'::"DimensionCategory", 'Penalaran Spasial', 'Saya mampu membayangkan bentuk tiga dimensi dari sebuah gambar sketsa dua dimensi dengan mudah.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_T03', 'T03', 'TALENT'::"DimensionCategory", 'Kecerdasan Verbal', 'Saya mudah mengekspresikan ide-ide kompleks ke dalam tulisan atau argumen lisan yang persuasif.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_T04', 'T04', 'TALENT'::"DimensionCategory", 'Pemecahan Masalah Sistem', 'Saya senang mengurai alur kerja mesin atau program komputer untuk mencari letak kesalahannya.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_T05', 'T05', 'TALENT'::"DimensionCategory", 'Sensitivitas Estetika', 'Saya memiliki kepekaan tinggi terhadap komposisi warna, tata letak, dan keharmonisan visual.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_T06', 'T06', 'TALENT'::"DimensionCategory", 'Kecerdasan Intrapersonal', 'Saya mampu mengidentifikasi pemicu emosi diri sendiri dan mengelolanya secara tenang dalam tekanan.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_T07', 'T07', 'TALENT'::"DimensionCategory", 'Intuisi Sosial', 'Saya cepat membaca bahasa tubuh orang lain dan memahami suasana hati mereka tanpa diberi tahu.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_T08', 'T08', 'TALENT'::"DimensionCategory", 'Daya Ingat Konseptual', 'Saya mudah mengingat terminologi teknis, teori abstrak, serta asosiasi antar konsep baru.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_T09', 'T09', 'TALENT'::"DimensionCategory", 'Koordinasi Kinestetik', 'Saya memiliki keterampilan tangan yang terampil dan presisi saat membedah atau merakit perkakas.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_T10', 'T10', 'TALENT'::"DimensionCategory", 'Pola Berpikir Kritis', 'Saya terbiasa memverifikasi kebenaran sebuah informasi sebelum menerimanya sebagai fakta.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_T11', 'T11', 'TALENT'::"DimensionCategory", 'Kreativitas Orisinal', 'Saya sering menemukan metode alternatif yang unik untuk menyelesaikan tugas yang monoton.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_T12', 'T12', 'TALENT'::"DimensionCategory", 'Perencanaan Strategis', 'Saya mahir membuat proyeksi skenario jangka panjang beserta langkah mitigasi risiko.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_I01', 'I01', 'INTEREST'::"DimensionCategory", 'Investigasi Sains', 'Saya sangat tertarik meneliti fenomena alam, eksperimen laboratorium, dan penelitian ilmiah terbaru.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_I02', 'I02', 'INTEREST'::"DimensionCategory", 'Teknologi & Komputasi', 'Saya antusias belajar bahasa pemrograman, kecerdasan buatan, atau pengembangan aplikasi perangkat lunak.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_I03', 'I03', 'INTEREST'::"DimensionCategory", 'Desain Kreatif & Multimedia', 'Saya betah menghabiskan waktu berjam-jam mendesain grafis, ilustrasi, atau mengedit video.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_I04', 'I04', 'INTEREST'::"DimensionCategory", 'Bisnis & Kewirausahaan', 'Saya tertarik mempelajari strategi pemasaran, valuasi bisnis rintisan, dan peluang transaksi pasar.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_I05', 'I05', 'INTEREST'::"DimensionCategory", 'Pelayanan Kesehatan', 'Saya terpanggil untuk merawat pasien, memahami diagnosis penyakit medis, dan anatomi biologi.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_I06', 'I06', 'INTEREST'::"DimensionCategory", 'Hukum & Tata Kelola', 'Saya tertarik dengan pembahasan regulasi negara, peradilan hukum, diplomasi, dan debat kebijakan.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_I07', 'I07', 'INTEREST'::"DimensionCategory", 'Psikologi & Konseling', 'Saya senang mendengarkan curhat orang lain dan mendalami motif perilaku manusia.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_I08', 'I08', 'INTEREST'::"DimensionCategory", 'Eksplorasi Lapangan', 'Saya lebih menikmati kegiatan lapangan, geologi, ekspedisi satwa liar daripada duduk di meja.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_I09', 'I09', 'INTEREST'::"DimensionCategory", 'Sastra & Bahasa Asing', 'Saya suka menganalisis karya sastra, belajar bahasa asing baru, dan kajian lintas budaya.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_I10', 'I10', 'INTEREST'::"DimensionCategory", 'Finansial & Investasi', 'Saya tertarik membaca laporan arus kas keuangan, instrumen saham, dan analisis perbankan.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_I11', 'I11', 'INTEREST'::"DimensionCategory", 'Teknik & Manufaktur', 'Saya senang mempelajari cara kerja turbin, robotika industri, dan infrastruktur konstruksi.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_I12', 'I12', 'INTEREST'::"DimensionCategory", 'Pemberdayaan Sosial', 'Saya tergerak aktif dalam aksi sosial sukarela, advokasi kemanusiaan, dan edukasi komunitas.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_P01', 'P01', 'PERSONALITY'::"DimensionCategory", 'Keteraturan / Conscientiousness', 'Saya selalu merapikan jadwal, membuat daftar tugas terperinci, dan tidak menyukai ketidakteraturan.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_P02', 'P02', 'PERSONALITY'::"DimensionCategory", 'Keterbukaan Pengalaman', 'Saya sangat menyambut ide-ide baru yang tidak konvensional dan suka keluar dari zona nyaman.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_P03', 'P03', 'PERSONALITY'::"DimensionCategory", 'Ekstroversi / Interaksi', 'Saya merasa berenergi saat berada di tengah keramaian dan mudah mencairkan suasana dengan orang baru.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_P04', 'P04', 'PERSONALITY'::"DimensionCategory", 'Keramahan / Agreeableness', 'Saya cenderung mengutamakan keharmonisan kelompok daripada memaksakan kehendak pribadi.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_P05', 'P05', 'PERSONALITY'::"DimensionCategory", 'Stabilitas Emosional', 'Saya tetap tenang dan kepala dingin meskipun menghadapi krisis mendadak atau tenggat waktu mepet.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_P06', 'P06', 'PERSONALITY'::"DimensionCategory", 'Kemandirian Kerja', 'Saya bekerja lebih optimal ketika diberikan kebebasan penuh tanpa perlu diawasi secara ketat.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_P07', 'P07', 'PERSONALITY'::"DimensionCategory", 'Ketahanan / Grit', 'Saya tidak mudah menyerah meskipun menghadapi kegagalan berulang kali dalam proyek yang sulit.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_P08', 'P08', 'PERSONALITY'::"DimensionCategory", 'Kepemimpinan Alami', 'Secara naluriah saya berani mengambil inisiatif mengarahkan tim saat situasi tidak menentu.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_P09', 'P09', 'PERSONALITY'::"DimensionCategory", 'Fokus Detail', 'Saya sangat teliti menemukan ketidaksesuaian kecil yang kerap terlewatkan oleh orang lain.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_P10', 'P10', 'PERSONALITY'::"DimensionCategory", 'Fleksibilitas Adaptif', 'Saya mudah menyesuaikan diri ketika rencana awal berubah secara tiba-tiba di tengah jalan.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_P11', 'P11', 'PERSONALITY'::"DimensionCategory", 'Orientasi Kolaborasi', 'Saya lebih menikmati mencapai target bersama tim sinergis dibanding bekerja individualistis.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_P12', 'P12', 'PERSONALITY'::"DimensionCategory", 'Rasa Ingin Tahu Tinggi', 'Saya selalu terdorong mencari tahu ''mengapa'' dan ''bagaimana'' sesuatu bekerja sampai ke akarnya.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_V01', 'V01', 'VALUES'::"DimensionCategory", 'Kontribusi Kemanusiaan', 'Bagi saya, makna karier sejati adalah seberapa besar dampak positif yang saya berikan bagi masyarakat.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_V02', 'V02', 'VALUES'::"DimensionCategory", 'Otonomi & Kebebasan', 'Saya lebih menghargai kebebasan menentukan jam kerja dibanding gaji tinggi tapi serba terikat.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_V03', 'V03', 'VALUES'::"DimensionCategory", 'Prestise & Pengakuan', 'Menduduki posisi yang dihormati dan diakui secara profesional merupakan motivasi utama saya.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_V04', 'V04', 'VALUES'::"DimensionCategory", 'Keamanan Finansial', 'Kepastian stabilitas pendapatan bulanan yang mapan lebih penting daripada spekulasi risiko tinggi.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_V05', 'V05', 'VALUES'::"DimensionCategory", 'Inovasi Berkelanjutan', 'Saya mendambakan lingkungan kerja yang mendorong eksperimen terobosan dan hal baru tiada henti.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_V06', 'V06', 'VALUES'::"DimensionCategory", 'Integritas Etika', 'Saya menolak berkompromi terhadap kejujuran dan etika moral, apapun imbalan materinya.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_V07', 'V07', 'VALUES'::"DimensionCategory", 'Keseimbangan Hidup', 'Keseimbangan antara karier cemerlang dan waktu untuk keluarga/spiritual adalah harga mati bagi saya.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_V08', 'V08', 'VALUES'::"DimensionCategory", 'Peningkatan Kapasitas', 'Saya menilai kesuksesan dari seberapa pesat kemampuan intelektual saya terus bertumbuh setiap tahun.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_V09', 'V09', 'VALUES'::"DimensionCategory", 'Pengaruh & Kekuasaan Positif', 'Memiliki otoritas untuk membuat keputusan besar yang menggerakkan banyak pihak memotivasi saya.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_V10', 'V10', 'VALUES'::"DimensionCategory", 'Kelestarian Lingkungan', 'Saya ingin berkarya di sektor yang menjamin keberlanjutan bumi dan konservasi alam.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_V11', 'V11', 'VALUES'::"DimensionCategory", 'Dinamisme & Tantangan', 'Saya cepat bosan dengan rutinitas statis dan lebih bersemangat dalam ritme kerja yang dinamis.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_V12', 'V12', 'VALUES'::"DimensionCategory", 'Solidaritas Persaudaraan', 'Memiliki rasa kekeluargaan yang erat dengan rekan sejawat adalah faktor kenyamanan utama saya.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_A01', 'A01', 'ACADEMIC'::"DimensionCategory", 'Kesiapan Kalkulus & Aljabar', 'Saya merasa nyaman bergelut dengan persamaan matematika tingkat lanjut dan pembuktian rumus.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_A02', 'A02', 'ACADEMIC'::"DimensionCategory", 'Literasi Jurnal Ilmiah', 'Saya sanggup membaca dan merangkum intisari artikel ilmiah panjang berbahasa Inggris tanpa jenuh.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_A03', 'A03', 'ACADEMIC'::"DimensionCategory", 'Manajemen Riset Mandiri', 'Saya percaya diri mampu merancang proposal penelitian atau karya tulis ilmiah secara mandiri.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_A04', 'A04', 'ACADEMIC'::"DimensionCategory", 'Studi Eksperimental Praktik', 'Saya lebih cepat paham materi perkuliahan lewat uji coba laboratorium dibanding sekadar membaca buku.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_A05', 'A05', 'ACADEMIC'::"DimensionCategory", 'Debat Teori Sosial', 'Saya antusias mengkomparasikan teori-teori sosiologi, ekonomi, atau ilmu komunikasi di ruang kuliah.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_A06', 'A06', 'ACADEMIC'::"DimensionCategory", 'Stamina Belajar Intensif', 'Saya sanggup berkonsentrasi belajar intensif selama berminggu-minggu menjelang periode ujian berat.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_A07', 'A07', 'ACADEMIC'::"DimensionCategory", 'Apresiasi Studi Interdisipliner', 'Saya senang memadukan dua disiplin ilmu yang berbeda (misal: bioinformatika atau psikologi teknologi).', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_A08', 'A08', 'ACADEMIC'::"DimensionCategory", 'Penguasaan Perangkat Lunak Kuliah', 'Saya cepat menguasai aplikasi statistik/analisis (seperti SPSS, Python, MATLAB, atau Tableau).', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_A09', 'A09', 'ACADEMIC'::"DimensionCategory", 'Penyusunan Argumentasi Akademik', 'Saya terampil menyusun paragraf esai akademik yang runut, kohesif, dan didukung sitasi tepercaya.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_A10', 'A10', 'ACADEMIC'::"DimensionCategory", 'Kesiapan Praktik Lapangan', 'Saya siap mengikuti program studi yang mewajibkan kuliah kerja nyata atau magang klinis rumah sakit.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_A11', 'A11', 'ACADEMIC'::"DimensionCategory", 'Antusiasme Kuliah Lanjutan', 'Saya memiliki cita-cita kuat melanjutkan pendidikan hingga jenjang Magister (S2) atau Spesialis.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_A12', 'A12', 'ACADEMIC'::"DimensionCategory", 'Kemampuan Presentasi Sidang', 'Saya percaya diri mempresentasikan hasil karya skripsi/proyek di hadapan dewan penguji ahli.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_C01', 'C01', 'CAREER'::"DimensionCategory", 'Teknologi Informasi & Software', 'Saya ingin berprofesi sebagai Software Engineer, Data Scientist, atau Cyber Security Specialist.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_C02', 'C02', 'CAREER'::"DimensionCategory", 'Medis & Tenaga Kesehatan', 'Saya bercita-cita menjadi Dokter, Apoteker, Dokter Gigi, atau Peneliti Biomedis terkemuka.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_C03', 'C03', 'CAREER'::"DimensionCategory", 'Rekayasa & Desain Manufaktur', 'Saya berminat menjadi Arsitek, Insinyur Sipil, Insinyur Mesin, atau Perancang Dirgantara.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_C04', 'C04', 'CAREER'::"DimensionCategory", 'Korporasi & Konsultasi Manajemen', 'Saya tertarik meniti karier sebagai Investment Banker, Konsultan Manajemen, atau Brand Strategist.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_C05', 'C05', 'CAREER'::"DimensionCategory", 'Hukum & Aparatur Publik', 'Saya bercita-cita berkarier sebagai Hakim, Jaksa, Diplomat Luar Negeri, atau Notaris.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_C06', 'C06', 'CAREER'::"DimensionCategory", 'Industri Kreatif & Hiburan', 'Saya ingin berkarya sebagai Creative Director, Animator 3D, Sutradara Film, atau UI/UX Designer.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_C07', 'C07', 'CAREER'::"DimensionCategory", 'Pendidikan & Akademisi', 'Saya tertarik menjadi Dosen Universitas, Peneliti Lembaga Riset, atau Trainer Profesional.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_C08', 'C08', 'CAREER'::"DimensionCategory", 'Kewirausahaan / Founder', 'Saya bertekad membangun perusahaan rintisan sendiri dan membuka lapangan pekerjaan bagi ribuan orang.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_C09', 'C09', 'CAREER'::"DimensionCategory", 'Lembaga Swadaya & NGO Global', 'Saya ingin bekerja di organisasi internasional seperti PBB, UNICEF, atau lembaga donor kemanusiaan.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_C10', 'C10', 'CAREER'::"DimensionCategory", 'Keuangan & Audit Publik', 'Saya berminat menjadi Akuntan Publik Bersertifikat (CPA), Aktuaris, atau Auditor Forensik.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_C11', 'C11', 'CAREER'::"DimensionCategory", 'Media & Hubungan Komunikasi', 'Saya tertarik menjadi Jurnalis Investigatif, Editor Media Massa, atau Public Relations Specialist.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_C12', 'C12', 'CAREER'::"DimensionCategory", 'Agrikultur & Energi Terbarukan', 'Saya ingin berkarier di sektor pertanian presisi, agritech, atau pengembang energi surya/terbarukan.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_R01', 'R01', 'READINESS'::"DimensionCategory", 'Kemandirian Hidup (Living)', 'Saya siap mengurus kebutuhan hidup harian mandiri jika harus merantau kuliah di luar kota.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_R02', 'R02', 'READINESS'::"DimensionCategory", 'Manajemen Keuangan Pribadi', 'Saya mampu mengelola anggaran bulanan dan mencatat pengeluaran agar tidak boros.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_R03', 'R03', 'READINESS'::"DimensionCategory", 'Daya Tahan Culture Shock', 'Saya mudah bergaul dan berbaur dengan teman dari berbagai latar belakang suku, agama, dan budaya.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_R04', 'R04', 'READINESS'::"DimensionCategory", 'Resiliensi Beban Belajar', 'Saya sudah siap mental menghadapi tugas kuliah bertumpuk yang jauh lebih menantang dibanding SMA.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_R05', 'R05', 'READINESS'::"DimensionCategory", 'Manajemen Waktu Bebas', 'Saya mampu membagi waktu secara bijak antara kuliah, organisasi kemahasiswaan, dan istirahat.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_R06', 'R06', 'READINESS'::"DimensionCategory", 'Kemandirian Keputusan', 'Pilihan jurusan yang saya incar merupakan murni kesadaran cita-cita saya, bukan paksaan pihak lain.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_R07', 'R07', 'READINESS'::"DimensionCategory", 'Kesiapan Mental Bersaing', 'Saya siap berada di lingkungan kampus berprestasi tinggi di mana banyak mahasiswa hebat berkumpul.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_R08', 'R08', 'READINESS'::"DimensionCategory", 'Keterampilan Mencari Solusi', 'Ketika menemui kendala akademis, saya proaktif bertanya ke dosen, asisten, atau mencari referensi.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_R09', 'R09', 'READINESS'::"DimensionCategory", 'Pengendalian Distraksi Digital', 'Saya sanggup membatasi waktu bermain game atau media sosial saat mendekati masa belajar penting.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_R10', 'R10', 'READINESS'::"DimensionCategory", 'Kesehatan Fisik & Pola Tidur', 'Saya terbiasa menjaga pola makan teratur dan istirahat yang cukup untuk menjaga stamina belajar.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_R11', 'R11', 'READINESS'::"DimensionCategory", 'Kesiapan Finansial Studi', 'Keluarga saya dan saya telah merencanakan skema pembiayaan kuliah atau skema beasiswa target.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "questions" ("id", "code", "dimension_category", "subdimensi", "question_text", "options", "is_active", "created_at", "updated_at")
VALUES ('q_std_R12', 'R12', 'READINESS'::"DimensionCategory", 'Keyakinan Panggilan Diri', 'Saya memiliki motivasi batin yang kuat mengapa saya harus menuntaskan perkuliahan hingga wisuda.', '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;

INSERT INTO "question_sets" ("id", "version", "title", "is_active", "scoring_config", "published_at", "created_at")
VALUES (
  'qset_v1_default',
  1,
  'GGC Study Fit Assessment Instrument v1 (84 Items)',
  true,
  '{"scale":"likert_1_5","formula":"((composite - 1)/4)*68 + 30","dimensions":["TALENT","INTEREST","PERSONALITY","VALUES","ACADEMIC","CAREER","READINESS"]}'::jsonb,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("version") DO NOTHING;

INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_T01',
  'qset_v1_default',
  'T01',
  1,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'T01'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_T02',
  'qset_v1_default',
  'T02',
  2,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'T02'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_T03',
  'qset_v1_default',
  'T03',
  3,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'T03'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_T04',
  'qset_v1_default',
  'T04',
  4,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'T04'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_T05',
  'qset_v1_default',
  'T05',
  5,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'T05'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_T06',
  'qset_v1_default',
  'T06',
  6,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'T06'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_T07',
  'qset_v1_default',
  'T07',
  7,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'T07'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_T08',
  'qset_v1_default',
  'T08',
  8,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'T08'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_T09',
  'qset_v1_default',
  'T09',
  9,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'T09'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_T10',
  'qset_v1_default',
  'T10',
  10,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'T10'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_T11',
  'qset_v1_default',
  'T11',
  11,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'T11'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_T12',
  'qset_v1_default',
  'T12',
  12,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'T12'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_I01',
  'qset_v1_default',
  'I01',
  13,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'I01'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_I02',
  'qset_v1_default',
  'I02',
  14,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'I02'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_I03',
  'qset_v1_default',
  'I03',
  15,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'I03'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_I04',
  'qset_v1_default',
  'I04',
  16,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'I04'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_I05',
  'qset_v1_default',
  'I05',
  17,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'I05'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_I06',
  'qset_v1_default',
  'I06',
  18,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'I06'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_I07',
  'qset_v1_default',
  'I07',
  19,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'I07'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_I08',
  'qset_v1_default',
  'I08',
  20,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'I08'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_I09',
  'qset_v1_default',
  'I09',
  21,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'I09'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_I10',
  'qset_v1_default',
  'I10',
  22,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'I10'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_I11',
  'qset_v1_default',
  'I11',
  23,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'I11'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_I12',
  'qset_v1_default',
  'I12',
  24,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'I12'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_P01',
  'qset_v1_default',
  'P01',
  25,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'P01'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_P02',
  'qset_v1_default',
  'P02',
  26,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'P02'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_P03',
  'qset_v1_default',
  'P03',
  27,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'P03'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_P04',
  'qset_v1_default',
  'P04',
  28,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'P04'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_P05',
  'qset_v1_default',
  'P05',
  29,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'P05'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_P06',
  'qset_v1_default',
  'P06',
  30,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'P06'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_P07',
  'qset_v1_default',
  'P07',
  31,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'P07'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_P08',
  'qset_v1_default',
  'P08',
  32,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'P08'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_P09',
  'qset_v1_default',
  'P09',
  33,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'P09'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_P10',
  'qset_v1_default',
  'P10',
  34,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'P10'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_P11',
  'qset_v1_default',
  'P11',
  35,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'P11'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_P12',
  'qset_v1_default',
  'P12',
  36,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'P12'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_V01',
  'qset_v1_default',
  'V01',
  37,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'V01'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_V02',
  'qset_v1_default',
  'V02',
  38,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'V02'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_V03',
  'qset_v1_default',
  'V03',
  39,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'V03'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_V04',
  'qset_v1_default',
  'V04',
  40,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'V04'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_V05',
  'qset_v1_default',
  'V05',
  41,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'V05'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_V06',
  'qset_v1_default',
  'V06',
  42,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'V06'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_V07',
  'qset_v1_default',
  'V07',
  43,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'V07'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_V08',
  'qset_v1_default',
  'V08',
  44,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'V08'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_V09',
  'qset_v1_default',
  'V09',
  45,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'V09'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_V10',
  'qset_v1_default',
  'V10',
  46,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'V10'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_V11',
  'qset_v1_default',
  'V11',
  47,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'V11'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_V12',
  'qset_v1_default',
  'V12',
  48,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'V12'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_A01',
  'qset_v1_default',
  'A01',
  49,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'A01'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_A02',
  'qset_v1_default',
  'A02',
  50,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'A02'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_A03',
  'qset_v1_default',
  'A03',
  51,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'A03'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_A04',
  'qset_v1_default',
  'A04',
  52,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'A04'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_A05',
  'qset_v1_default',
  'A05',
  53,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'A05'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_A06',
  'qset_v1_default',
  'A06',
  54,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'A06'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_A07',
  'qset_v1_default',
  'A07',
  55,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'A07'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_A08',
  'qset_v1_default',
  'A08',
  56,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'A08'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_A09',
  'qset_v1_default',
  'A09',
  57,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'A09'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_A10',
  'qset_v1_default',
  'A10',
  58,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'A10'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_A11',
  'qset_v1_default',
  'A11',
  59,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'A11'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_A12',
  'qset_v1_default',
  'A12',
  60,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'A12'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_C01',
  'qset_v1_default',
  'C01',
  61,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'C01'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_C02',
  'qset_v1_default',
  'C02',
  62,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'C02'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_C03',
  'qset_v1_default',
  'C03',
  63,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'C03'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_C04',
  'qset_v1_default',
  'C04',
  64,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'C04'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_C05',
  'qset_v1_default',
  'C05',
  65,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'C05'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_C06',
  'qset_v1_default',
  'C06',
  66,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'C06'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_C07',
  'qset_v1_default',
  'C07',
  67,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'C07'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_C08',
  'qset_v1_default',
  'C08',
  68,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'C08'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_C09',
  'qset_v1_default',
  'C09',
  69,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'C09'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_C10',
  'qset_v1_default',
  'C10',
  70,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'C10'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_C11',
  'qset_v1_default',
  'C11',
  71,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'C11'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_C12',
  'qset_v1_default',
  'C12',
  72,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'C12'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_R01',
  'qset_v1_default',
  'R01',
  73,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'R01'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_R02',
  'qset_v1_default',
  'R02',
  74,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'R02'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_R03',
  'qset_v1_default',
  'R03',
  75,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'R03'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_R04',
  'qset_v1_default',
  'R04',
  76,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'R04'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_R05',
  'qset_v1_default',
  'R05',
  77,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'R05'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_R06',
  'qset_v1_default',
  'R06',
  78,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'R06'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_R07',
  'qset_v1_default',
  'R07',
  79,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'R07'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_R08',
  'qset_v1_default',
  'R08',
  80,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'R08'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_R09',
  'qset_v1_default',
  'R09',
  81,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'R09'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_R10',
  'qset_v1_default',
  'R10',
  82,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'R10'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_R11',
  'qset_v1_default',
  'R11',
  83,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'R11'
ON CONFLICT ("question_set_id", "code") DO NOTHING;
INSERT INTO "question_set_items" ("id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi", "question_text", "options", "scoring_weight", "legacy_question_id", "created_at")
SELECT
  'qsi_v1_R12',
  'qset_v1_default',
  'R12',
  84,
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  1.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."code" = 'R12'
ON CONFLICT ("question_set_id", "code") DO NOTHING;

-- STAGE 3: Deterministic Insertion of Residual Unmapped Questions (scoring_weight = 0.0)
INSERT INTO "question_set_items" (
  "id", "question_set_id", "code", "order_index", "dimension_category", "subdimensi",
  "question_text", "options", "scoring_weight", "legacy_question_id", "created_at"
)
SELECT
  'qsi_legacy_' || q."id",
  (SELECT "id" FROM "question_sets" WHERE "version" = 1),
  'UNMAPPED_' || LPAD(ROW_NUMBER() OVER (ORDER BY q."created_at" ASC, q."id" ASC)::TEXT, 4, '0'),
  900 + ROW_NUMBER() OVER (ORDER BY q."created_at" ASC, q."id" ASC),
  q."dimension_category",
  q."subdimensi",
  q."question_text",
  COALESCE(q."options", '[{"value":1,"label":"Sangat Tidak Sesuai","shortLabel":"STS"},{"value":2,"label":"Tidak Sesuai","shortLabel":"TS"},{"value":3,"label":"Netral / Ragu-ragu","shortLabel":"N"},{"value":4,"label":"Sesuai","shortLabel":"S"},{"value":5,"label":"Sangat Sesuai","shortLabel":"SS"}]'::jsonb),
  0.0,
  q."id",
  CURRENT_TIMESTAMP
FROM "questions" q
WHERE q."id" NOT IN (
  SELECT "legacy_question_id" FROM "question_set_items" WHERE "legacy_question_id" IS NOT NULL
)
ORDER BY q."created_at" ASC, q."id" ASC
ON CONFLICT ("question_set_id", "code") DO NOTHING;

-- STAGE 4: Backfill assessment_sessions.question_set_id to QuestionSet v1
UPDATE "assessment_sessions"
SET "question_set_id" = (SELECT "id" FROM "question_sets" WHERE "version" = 1)
WHERE "question_set_id" IS NULL;

-- STAGE 5: Backfill assessment_answers.question_set_item_id by matching legacy_question_id or code
UPDATE "assessment_answers" aa
SET "question_set_item_id" = qsi."id"
FROM "question_set_items" qsi
WHERE aa."question_set_item_id" IS NULL
  AND qsi."question_set_id" = (SELECT "id" FROM "question_sets" WHERE "version" = 1)
  AND qsi."legacy_question_id" = aa."question_id";

UPDATE "assessment_answers" aa
SET "question_set_item_id" = qsi."id"
FROM "questions" q
JOIN "question_set_items" qsi
  ON qsi."code" = q."code"
  AND qsi."question_set_id" = (SELECT "id" FROM "question_sets" WHERE "version" = 1)
WHERE aa."question_set_item_id" IS NULL
  AND aa."question_id" = q."id";

-- STAGE 6: Pre-Constraint Assertion & Enforce NOT NULL + Foreign Keys
DO $$
DECLARE
  v_unmapped_sessions INTEGER;
  v_unmapped_answers INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_unmapped_sessions FROM "assessment_sessions" WHERE "question_set_id" IS NULL;
  IF v_unmapped_sessions > 0 THEN
    RAISE EXCEPTION 'Migration aborted: % assessment_sessions rows still have NULL question_set_id', v_unmapped_sessions;
  END IF;

  SELECT COUNT(*) - COUNT("question_set_item_id") INTO v_unmapped_answers FROM "assessment_answers";
  IF v_unmapped_answers > 0 THEN
    RAISE EXCEPTION 'Migration aborted: % assessment_answers rows still have NULL question_set_item_id', v_unmapped_answers;
  END IF;
END $$;

ALTER TABLE "assessment_sessions" ALTER COLUMN "question_set_id" SET NOT NULL;
ALTER TABLE "assessment_answers" ALTER COLUMN "question_set_item_id" SET NOT NULL;

CREATE INDEX IF NOT EXISTS "assessment_sessions_question_set_id_idx" ON "assessment_sessions"("question_set_id");
CREATE INDEX IF NOT EXISTS "assessment_answers_question_set_item_id_idx" ON "assessment_answers"("question_set_item_id");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'assessment_sessions_question_set_id_fkey'
  ) THEN
    ALTER TABLE "assessment_sessions"
      ADD CONSTRAINT "assessment_sessions_question_set_id_fkey"
      FOREIGN KEY ("question_set_id") REFERENCES "question_sets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'assessment_answers_question_set_item_id_fkey'
  ) THEN
    ALTER TABLE "assessment_answers"
      ADD CONSTRAINT "assessment_answers_question_set_item_id_fkey"
      FOREIGN KEY ("question_set_item_id") REFERENCES "question_set_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- STAGE 7: Install Partial Unique Index & PostgreSQL Immutability Triggers (Specification C)
CREATE UNIQUE INDEX IF NOT EXISTS "idx_single_active_questionset"
ON "question_sets" ("is_active")
WHERE "is_active" = true;

-- Trigger 1: question_sets Mutation Guard
CREATE OR REPLACE FUNCTION prevent_published_questionset_mutation()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.is_active = true THEN
      RAISE EXCEPTION 'Cannot delete QuestionSet [%]: It is currently active.', OLD.id;
    END IF;
    IF EXISTS (SELECT 1 FROM assessment_sessions WHERE question_set_id = OLD.id) THEN
      RAISE EXCEPTION 'Cannot delete QuestionSet [%]: It is referenced by assessment sessions.', OLD.id;
    END IF;
    RETURN OLD;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF OLD.is_active = true OR EXISTS (SELECT 1 FROM assessment_sessions WHERE question_set_id = OLD.id) THEN
      IF OLD.scoring_config IS DISTINCT FROM NEW.scoring_config OR OLD.version IS DISTINCT FROM NEW.version THEN
        RAISE EXCEPTION 'Cannot alter scoring_config or version on QuestionSet [%]: It is active or locked by existing sessions.', OLD.id;
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_protect_questionset_immutable ON question_sets;
CREATE TRIGGER trg_protect_questionset_immutable
BEFORE UPDATE OR DELETE ON question_sets
FOR EACH ROW EXECUTE FUNCTION prevent_published_questionset_mutation();

-- Trigger 2: question_set_items Mutation Guard (Dual-Parent Check)
CREATE OR REPLACE FUNCTION prevent_published_questionsetitem_mutation()
RETURNS TRIGGER AS $$
DECLARE
  v_old_locked BOOLEAN := false;
  v_new_locked BOOLEAN := false;
BEGIN
  IF (TG_OP = 'DELETE' OR TG_OP = 'UPDATE') THEN
    SELECT (is_active = true OR EXISTS(SELECT 1 FROM assessment_sessions WHERE question_set_id = OLD.question_set_id))
    INTO v_old_locked FROM question_sets WHERE id = OLD.question_set_id;

    IF v_old_locked = true THEN
      RAISE EXCEPTION 'Cannot % item in QuestionSet [%]: Set is active or referenced by sessions.', TG_OP, OLD.question_set_id;
    END IF;
  END IF;

  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    SELECT (is_active = true OR EXISTS(SELECT 1 FROM assessment_sessions WHERE question_set_id = NEW.question_set_id))
    INTO v_new_locked FROM question_sets WHERE id = NEW.question_set_id;

    IF v_new_locked = true THEN
      RAISE EXCEPTION 'Cannot % item into QuestionSet [%]: Target set is active or referenced by sessions.', TG_OP, NEW.question_set_id;
    END IF;
  END IF;

  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_protect_questionsetitem_immutable ON question_set_items;
CREATE TRIGGER trg_protect_questionsetitem_immutable
BEFORE INSERT OR UPDATE OR DELETE ON question_set_items
FOR EACH ROW EXECUTE FUNCTION prevent_published_questionsetitem_mutation();

-- Trigger 3: Session QuestionSet Switch Guard
CREATE OR REPLACE FUNCTION prevent_session_questionset_switch()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.question_set_id IS DISTINCT FROM NEW.question_set_id THEN
    IF EXISTS (SELECT 1 FROM assessment_answers WHERE session_id = OLD.id) THEN
      RAISE EXCEPTION 'Cannot change question_set_id on AssessmentSession [%]: Answers have already been recorded.', OLD.id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_session_questionset_switch ON assessment_sessions;
CREATE TRIGGER trg_prevent_session_questionset_switch
BEFORE UPDATE ON assessment_sessions
FOR EACH ROW EXECUTE FUNCTION prevent_session_questionset_switch();

-- Trigger 4: Answer QuestionSet Consistency Guard (T-QST-03)
CREATE OR REPLACE FUNCTION enforce_answer_questionset_match()
RETURNS TRIGGER AS $$
DECLARE
  v_session_qset_id TEXT;
  v_item_qset_id TEXT;
BEGIN
  SELECT question_set_id INTO v_session_qset_id FROM assessment_sessions WHERE id = NEW.session_id;
  SELECT question_set_id INTO v_item_qset_id FROM question_set_items WHERE id = NEW.question_set_item_id;

  IF v_session_qset_id IS DISTINCT FROM v_item_qset_id THEN
    RAISE EXCEPTION 'Foreign key integrity violation: QuestionSetItem [%] (set [%]) does not belong to AssessmentSession [%] (set [%]).',
      NEW.question_set_item_id, v_item_qset_id, NEW.session_id, v_session_qset_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_answer_questionset_match ON assessment_answers;
CREATE TRIGGER trg_enforce_answer_questionset_match
BEFORE INSERT OR UPDATE ON assessment_answers
FOR EACH ROW EXECUTE FUNCTION enforce_answer_questionset_match();
