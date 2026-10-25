# Go Great Career (GGC) - Study Fit Assessment™ 🎯
> **Milestone 1:** Fullstack Architecture, Prisma ORM Database Schema, NextAuth RBAC, and Brand UI.

Platform evaluasi komprehensif kecocokan studi dan eksplorasi karier berbasis 7 dimensi dan 84 indikator terstandarisasi.

---

## 🚀 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Components & Route Handlers)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) dengan palet kustom GGC (Forest Emerald & Champagne Gold)
- **Database & ORM**: [PostgreSQL](https://www.postgresql.org/) & [Prisma ORM](https://www.prisma.io/)
- **Authentication**: [NextAuth.js (Auth.js)](https://next-auth.js.org/) dengan JWT Session & Role-Based Access Control (RBAC)
- **Security**: Password hashing dengan `bcryptjs`
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🎨 Palet Warna Brand GGC (Forest Emerald & Champagne Gold)

Terkonfigurasi langsung pada `tailwind.config.ts`:
- **Forest Emerald**:
  - `ggc-dark`: `#063424`
  - `ggc`: `#0B4632` (Primary Brand)
  - `ggc-light`: `#126348`
  - `ggc-subtle`: `#EBF4F0`
  - `ggc-tint`: `#F3F8F5`
- **Champagne Gold**:
  - `ggc-gold`: `#C5A869`
  - `ggc-gold-dark`: `#A6863F`
  - `ggc-gold-subtle`: `#FAF6ED`

---

## 📊 Struktur Database Multi-Matriks (84 Butir Instrumen)

Schema Prisma (`prisma/schema.prisma`) dirancang untuk 7 pilar dimensi dengan masing-masing 12 butir pertanyaan (total 84 butir instrumen skala Likert 1–5):

1. **`User`**: Akun pengguna, role (`STUDENT` / `ADMIN`), hash password.
2. **`StudentProfile`**: Detail profil siswa (nama lengkap, nomor telepon/WhatsApp, asal sekolah, jenjang/kelas).
3. **`Question`**: Bank soal 84 butir dengan kode `T01–T12`, `I01–I12`, `P01–P12`, `V01–V12`, `A01–A12`, `C01–C12`, `R01–R12`.
4. **`AssessmentSession`**: Sesi pengerjaan asesmen siswa (`IN_PROGRESS` / `COMPLETED`).
5. **`AssessmentAnswer`**: Jawaban per butir soal bernilai skala Likert 1–5.

### 7 Dimensi Asesmen:
- **T - Talent (Bakat)**: 12 indikator kemampuan alami & logika analitikal.
- **I - Interest (Minat)**: 12 indikator ketertarikan bidang studi dan profesi.
- **P - Personality (Kepribadian)**: 12 dimensi karakteristik kerja & adaptasi.
- **V - Values (Nilai Pribadi)**: 12 prinsip motivator internal & kepuasan hidup.
- **A - Academic (Akademik)**: 12 matriks kecocokan rumpun mata pelajaran & ketahanan kuliah.
- **C - Career (Arah Karier)**: 12 proyeksi peran profesi masa depan.
- **R - Readiness (Kesiapan)**: 12 evaluasi resiliensi & kesiapan mental transisi kampus.

---

## 🔐 Role-Based Access Control (RBAC) & Middleware

Route protection diimplementasikan di `src/middleware.ts`:
- `/student/*` ➔ Dibatasi ketat hanya untuk pengguna ber-role **`STUDENT`**.
- `/admin/*` ➔ Dibatasi ketat hanya untuk pengguna ber-role **`ADMIN`**.
- Sesi NextAuth memperluas tipe bawaan untuk menyematkan `user.id`, `user.email`, dan `user.role`.

---

## ⚡ Panduan Menjalankan Proyek

### 1. Salin Environment Variables
Pastikan file `.env` sudah tersedia:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ggc_assessment?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="ggc_study_fit_assessment_super_secret_jwt_key_2026"
```

### 2. Generate Prisma Client & Migrasi Database
Jika Anda telah mengaktifkan PostgreSQL:
```bash
# Generate client
npm run prisma:generate

# Push schema ke database PostgreSQL
npm run prisma:push

# Jalankan seeder (akun default admin, siswa sampel, dan 84 butir soal)
npm run prisma:seed
```

### 3. Jalankan Server Development
```bash
npm run dev
```
Buka browser di [http://localhost:3000](http://localhost:3000).

---

## 🔑 Akun Admin Awal

Tidak ada akun demo bawaan. Setiap siswa wajib mendaftar, memverifikasi email, dan membayar sebelum mengerjakan asesmen.

1. Isi `SEED_ADMIN_EMAIL` dan `SEED_ADMIN_PASSWORD` (minimal 12 karakter) di `.env`.
2. Jalankan `npm run prisma:seed` untuk membuat akun admin dan 84 soal.
3. Jika database lama masih berisi akun demo `admin@ggc.id` / `student@ggc.id`, jalankan `npm run disable-demo-accounts`.
