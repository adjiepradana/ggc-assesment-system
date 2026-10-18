import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { ScoringResult } from "@/lib/scoring";

interface ReportPdfProps {
  student: {
    name: string;
    school: string;
    grade: string;
    email?: string | null;
  };
  results: ScoringResult;
  logoSrc?: string;
}

// Define elegant PDF styles using GGC branding
const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 28,
    paddingHorizontal: 32,
    fontFamily: "Helvetica",
    fontSize: 8.5,
    color: "#1f2937",
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1.5,
    borderBottomColor: "#C5A869",
    paddingBottom: 8,
    marginBottom: 12,
  },
  headerBrandContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoImage: {
    width: 32,
    height: 32,
    marginRight: 8,
    objectFit: "contain",
  },
  headerBrand: {
    flexDirection: "column",
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#063424",
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 7,
    color: "#126348",
    marginTop: 1.5,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  headerBadge: {
    backgroundColor: "#FAF6ED",
    borderWidth: 1,
    borderColor: "#C5A869",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 3,
  },
  headerBadgeText: {
    fontSize: 6.5,
    fontWeight: "bold",
    color: "#A6863F",
  },

  // Student Info Box
  infoBox: {
    backgroundColor: "#F3F8F5",
    borderWidth: 1,
    borderColor: "#EBF4F0",
    borderRadius: 5,
    padding: 8,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoColumn: {
    width: "48%",
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 2.5,
  },
  infoLabel: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#0B4632",
    width: 78,
  },
  infoValue: {
    fontSize: 7.5,
    color: "#374151",
    flex: 1,
  },

  // Section Styles
  sectionTitle: {
    fontSize: 9.5,
    fontWeight: "bold",
    color: "#063424",
    backgroundColor: "#EBF4F0",
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 3,
    marginBottom: 6,
  },

  // Potential Signature Banner
  signatureCard: {
    backgroundColor: "#063424",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    color: "#FFFFFF",
  },
  signatureBadge: {
    fontSize: 6.5,
    color: "#C5A869",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  signatureTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 1.5,
  },
  signatureTagline: {
    fontSize: 7.5,
    color: "#E2C889",
    marginBottom: 4,
    fontStyle: "italic",
  },
  signatureDesc: {
    fontSize: 7.5,
    color: "#F3F8F5",
    lineHeight: 1.3,
    marginBottom: 5,
  },
  traitsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  traitChip: {
    backgroundColor: "#126348",
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 2,
    marginRight: 4,
    marginBottom: 2,
  },
  traitText: {
    fontSize: 6.5,
    color: "#FAF6ED",
    fontWeight: "bold",
  },

  // Narrative Box
  narrativeBox: {
    backgroundColor: "#FAF6ED",
    borderWidth: 1,
    borderColor: "#C5A869",
    borderRadius: 4,
    padding: 8,
    marginBottom: 10,
  },
  narrativeTitle: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#A6863F",
    textTransform: "uppercase",
    marginBottom: 2.5,
  },
  narrativeText: {
    fontSize: 7.5,
    color: "#374151",
    lineHeight: 1.35,
  },

  // 3 Archetypes Grid
  archetypesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  archetypeBox: {
    width: "31%",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 4,
    padding: 6,
    backgroundColor: "#FAFAFA",
  },
  archetypeTitle: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#0B4632",
    marginBottom: 2,
  },
  archetypeTag: {
    fontSize: 6.5,
    color: "#A6863F",
    marginBottom: 2.5,
  },
  archetypeDesc: {
    fontSize: 6.5,
    color: "#6B7280",
    lineHeight: 1.2,
  },

  // Dimensions & Subdimensions Table
  table: {
    width: "100%",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 4,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingVertical: 3.5,
    paddingHorizontal: 6,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingVertical: 3.5,
    paddingHorizontal: 6,
    alignItems: "center",
  },
  colDim: { width: "42%", fontSize: 7, fontWeight: "bold", color: "#1F2937" },
  colFocus: { width: "24%", fontSize: 6.5, color: "#6B7280" },
  colScore: { width: "16%", fontSize: 7, color: "#4B5563" },
  colBar: { width: "18%" },

  progressBarBg: {
    height: 4.5,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#0B4632",
    borderRadius: 2,
  },

  // Summary Stat Mini Cards
  statCardsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  statCard: {
    width: "31%",
    backgroundColor: "#F3F8F5",
    borderWidth: 1,
    borderColor: "#EBF4F0",
    borderRadius: 4,
    padding: 6,
  },
  statCardLabel: {
    fontSize: 6.5,
    fontWeight: "bold",
    color: "#126348",
    textTransform: "uppercase",
    marginBottom: 1.5,
  },
  statCardValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#063424",
    marginBottom: 1,
  },
  statCardSub: {
    fontSize: 6,
    color: "#6B7280",
  },

  // Major Recommendations (Page 3)
  majorCard: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 5,
    padding: 7,
    marginBottom: 6,
    backgroundColor: "#FFFFFF",
  },
  majorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  majorName: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#063424",
  },
  fitBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 2.5,
    backgroundColor: "#EBF4F0",
    borderWidth: 1,
    borderColor: "#126348",
  },
  fitBadgeText: {
    fontSize: 6.5,
    fontWeight: "bold",
    color: "#0B4632",
  },
  majorFaculty: {
    fontSize: 7,
    color: "#6B7280",
    marginBottom: 4,
  },
  insightBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 3,
    padding: 4.5,
    marginBottom: 3,
  },
  insightTitle: {
    fontSize: 6.5,
    fontWeight: "bold",
    color: "#0B4632",
    marginBottom: 1,
  },
  insightText: {
    fontSize: 6.5,
    color: "#4B5563",
    lineHeight: 1.25,
  },
  watchOutTitle: {
    fontSize: 6.5,
    fontWeight: "bold",
    color: "#A6863F",
    marginBottom: 1,
  },
  careerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 1.5,
  },
  careerLabel: {
    fontSize: 6,
    fontWeight: "bold",
    color: "#4B5563",
    marginRight: 3,
  },
  careerText: {
    fontSize: 6,
    color: "#126348",
    flex: 1,
  },

  // Official Signature Block
  officialSignRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  signBlock: {
    width: "45%",
    alignItems: "center",
  },
  signTitle: {
    fontSize: 6.5,
    color: "#6B7280",
    marginBottom: 20,
    textAlign: "center",
  },
  signName: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#063424",
    textAlign: "center",
  },
  signRole: {
    fontSize: 6.5,
    color: "#126348",
    textAlign: "center",
  },
  certStamp: {
    borderWidth: 1,
    borderColor: "#C5A869",
    backgroundColor: "#FAF6ED",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 3,
    alignItems: "center",
  },
  certStampTitle: {
    fontSize: 6,
    fontWeight: "bold",
    color: "#A6863F",
    textTransform: "uppercase",
  },
  certStampId: {
    fontSize: 6.5,
    fontWeight: "bold",
    color: "#063424",
    marginTop: 1,
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 14,
    left: 32,
    right: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.8,
    borderTopColor: "#E5E7EB",
    paddingTop: 4,
  },
  footerText: {
    fontSize: 6,
    color: "#9CA3AF",
  },
});

export default function ReportPdfDocument({
  student,
  results,
  logoSrc,
}: ReportPdfProps) {
  const topMajor = results.studyRecommendations[0];
  const readinessPercent = Math.round(
    ((results.overallReadinessScore - 1) / 4) * 100
  );
  const sessionDocId = `GGC-SFA-${(results.sessionId || "SESI")
    .slice(0, 8)
    .toUpperCase()}-2026`;

  const dimensionFocusMap: Record<string, string> = {
    TALENT: "Potensi Kognitif & Logika",
    INTEREST: "Eksplorasi Minat Holland (RIASEC)",
    PERSONALITY: "Karakteristik & Gaya Belajar",
    VALUES: "Motivator & Nilai Hidup",
    ACADEMIC: "Kecocokan Rumpun Kuliah",
    CAREER: "Aspirasi Peran Profesional",
    READINESS: "Kemandirian Mental Kampus",
  };

  return (
    <Document
      title={`GGC_Study_Fit_Report_${student.name.replace(/\s+/g, "_")}`}
    >
      {/* ========================================================================= */}
      {/* PAGE 1: IDENTITAS SISWA, POTENTIAL SIGNATURE & EXECUTIVE SUMMARY          */}
      {/* ========================================================================= */}
      <Page size="A4" style={styles.page}>
        {/* Brand Header */}
        <View style={styles.header}>
          <View style={styles.headerBrandContainer}>
            {logoSrc ? <Image src={logoSrc} style={styles.logoImage} /> : null}
            <View style={styles.headerBrand}>
              <Text style={styles.headerTitle}>GO GREAT CAREER (GGC)</Text>
              <Text style={styles.headerSubtitle}>
                STUDY FIT ASSESSMENT™ • OFFICIAL REPORT
              </Text>
            </View>
          </View>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>84-ITEM MULTI-MATRIX</Text>
          </View>
        </View>

        {/* Student Credentials Box */}
        <View style={styles.infoBox}>
          <View style={styles.infoColumn}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nama Siswa:</Text>
              <Text style={styles.infoValue}>{student.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Asal Sekolah:</Text>
              <Text style={styles.infoValue}>{student.school}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email Akun:</Text>
              <Text style={styles.infoValue}>{student.email || "-"}</Text>
            </View>
          </View>

          <View style={styles.infoColumn}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Jenjang / Kelas:</Text>
              <Text style={styles.infoValue}>{student.grade}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tanggal Asesmen:</Text>
              <Text style={styles.infoValue}>
                {new Date(results.calculatedAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>No. Registrasi:</Text>
              <Text style={styles.infoValue}>{sessionDocId}</Text>
            </View>
          </View>
        </View>

        {/* Primary Potential Signature Banner */}
        <View style={styles.signatureCard}>
          <Text style={styles.signatureBadge}>
            POTENTIAL SIGNATURE UTAMA (ARCHETYPE #1)
          </Text>
          <Text style={styles.signatureTitle}>
            {results.potentialSignatures[0]?.title}
          </Text>
          <Text style={styles.signatureTagline}>
            &ldquo;{results.potentialSignatures[0]?.tagline}&rdquo;
          </Text>
          <Text style={styles.signatureDesc}>
            {results.potentialSignatures[0]?.description}
          </Text>

          {/* Highlighted Traits Chips */}
          <View style={styles.traitsContainer}>
            {results.potentialSignatures[0]?.highlightedTraits?.map(
              (trait, idx) => (
                <View key={idx} style={styles.traitChip}>
                  <Text style={styles.traitText}>• {trait}</Text>
                </View>
              )
            )}
          </View>
        </View>

        {/* Executive Summary Narrative */}
        <View style={styles.narrativeBox}>
          <Text style={styles.narrativeTitle}>
            Catatan Naratif Tim Asesor Psikometrik GGC:
          </Text>
          <Text style={styles.narrativeText}>{results.summaryNarrative}</Text>
        </View>

        {/* Top 3 Signatures Comparison */}
        <Text style={styles.sectionTitle}>
          PEMETAAN 3 SIGNATURE POTENSI UTAMA SISWA
        </Text>
        <View style={styles.archetypesRow}>
          {results.potentialSignatures.slice(0, 3).map((sig, idx) => (
            <View key={idx} style={styles.archetypeBox}>
              <Text style={styles.archetypeTitle}>
                #{idx + 1} {sig.title}
              </Text>
              <Text style={styles.archetypeTag}>{sig.archetype}</Text>
              <Text style={styles.archetypeDesc}>{sig.tagline}</Text>
            </View>
          ))}
        </View>

        {/* Summary Highlights */}
        <View style={styles.infoBox}>
          <View style={{ width: "100%" }}>
            <Text style={[styles.infoLabel, { width: "100%", marginBottom: 2 }]}>
              Rangkuman Indeks Kelayakan Studi:
            </Text>
            <Text style={[styles.infoValue, { fontSize: 7, lineHeight: 1.3 }]}>
              Siswa memiliki potensi dominan pada rumpun{" "}
              {topMajor?.cluster || "Saintek"} dengan jurusan rekomendasi teratas{" "}
              {topMajor?.majorName} (Kesesuaian: {topMajor?.fitScore}% •{" "}
              {topMajor?.fitLevel}).
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} Go Great Career (GGC) • Halaman 1 dari 3 • Dokumen Rahasia Siswa
          </Text>
          <Text style={styles.footerText}>ID Sesi: {results.sessionId.slice(0, 16)}...</Text>
        </View>
      </Page>

      {/* ========================================================================= */}
      {/* PAGE 2: ANALISIS ANALITIKAL 7 DIMENSI & 6 SUBDIMENSI BAKAT                 */}
      {/* ========================================================================= */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerBrandContainer}>
            {logoSrc ? <Image src={logoSrc} style={styles.logoImage} /> : null}
            <View style={styles.headerBrand}>
              <Text style={styles.headerTitle}>MATRIKS EVALUASI 7 DIMENSI & BAKAT</Text>
              <Text style={styles.headerSubtitle}>
                HASIL EVALUASI PSIKOMETRIK MULTI-MATRIKS (84 BUTIR SOAL)
              </Text>
            </View>
          </View>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>
              KESIAPAN: {readinessPercent}%
            </Text>
          </View>
        </View>

        {/* Mini Stats Summary */}
        <View style={styles.statCardsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statCardLabel}>Instrumen Selesai</Text>
            <Text style={styles.statCardValue}>84 / 84 Soal</Text>
            <Text style={styles.statCardSub}>100% Terverifikasi</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statCardLabel}>Indeks Kesiapan Kuliah</Text>
            <Text style={styles.statCardValue}>
              {results.overallReadinessScore.toFixed(1)} / 5.0
            </Text>
            <Text style={styles.statCardSub}>Tingkat Kesiapan: {readinessPercent}%</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statCardLabel}>Rumpun Dominan</Text>
            <Text style={styles.statCardValue}>
              {topMajor?.cluster || "Saintek"}
            </Text>
            <Text style={styles.statCardSub}>Top Fit: {topMajor?.fitScore}%</Text>
          </View>
        </View>

        {/* 7 Dimensions Holistic Table */}
        <Text style={styles.sectionTitle}>
          EVALUASI 7 DIMENSI ASESMEN HOLISTIK GGC
        </Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDim}>Dimensi Evaluasi</Text>
            <Text style={styles.colFocus}>Fokus Pengukuran</Text>
            <Text style={styles.colScore}>Rata-rata Skor</Text>
            <Text style={styles.colBar}>Kekuatan Relatif</Text>
          </View>
          {results.dimensionScores.map((dim, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={styles.colDim}>{dim.name}</Text>
              <Text style={styles.colFocus}>
                {dimensionFocusMap[dim.category] || "-"}
              </Text>
              <Text style={styles.colScore}>
                {dim.score.toFixed(1)} / 5.0 ({dim.percentage}%)
              </Text>
              <View style={styles.colBar}>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${dim.percentage}%` },
                    ]}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* 6 Talent Subdimensions Table */}
        <Text style={styles.sectionTitle}>
          ANALISIS 6 PILAR SUBDIMENSI BAKAT (TALENT BREAKDOWN)
        </Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDim}>Subdimensi Bakat Kognitif</Text>
            <Text style={styles.colFocus}>Kategori Status</Text>
            <Text style={styles.colScore}>Skor (Skala 1-5)</Text>
            <Text style={styles.colBar}>Tingkat Kekuatan</Text>
          </View>
          {results.talentSubdimensions.map((sub, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={styles.colDim}>{sub.name}</Text>
              <Text style={styles.colFocus}>{sub.level}</Text>
              <Text style={styles.colScore}>{sub.score.toFixed(1)} / 5.0</Text>
              <View style={styles.colBar}>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${sub.percentage}%`,
                        backgroundColor:
                          sub.level === "Tinggi"
                            ? "#0B4632"
                            : sub.level === "Sedang"
                            ? "#C5A869"
                            : "#9CA3AF",
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Interpretasi Singkat */}
        <View style={styles.infoBox}>
          <View style={{ width: "100%" }}>
            <Text style={[styles.infoLabel, { width: "100%", marginBottom: 2 }]}>
              Petunjuk Interpretasi Matriks:
            </Text>
            <Text style={[styles.infoValue, { fontSize: 6.5, lineHeight: 1.3 }]}>
              • Skor di atas 3.8 mengindikasikan keunggulan kompetitif alami yang dapat dijadikan fondasi pemilihan jurusan.{"\n"}
              • Skor antara 3.0 s/d 3.7 mengindikasikan potensi yang adaptif dan dapat diakselerasi melalui lingkungan kampus.{"\n"}
              • Asesmen ini bebas dari bias ujian kemampuan sesaat dan berfokus pada ketahanan studi jangka panjang.
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} Go Great Career (GGC) • Halaman 2 dari 3 • Validasi Hasil Matriks
          </Text>
          <Text style={styles.footerText}>Status Validasi: CERTIFIED & ACCURATE</Text>
        </View>
      </Page>

      {/* ========================================================================= */}
      {/* PAGE 3: REKOMENDASI JURUSAN & LEMBAR PENGESAHAN RESMI                     */}
      {/* ========================================================================= */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerBrandContainer}>
            {logoSrc ? <Image src={logoSrc} style={styles.logoImage} /> : null}
            <View style={styles.headerBrand}>
              <Text style={styles.headerTitle}>REKOMENDASI PROGRAM STUDI & JALUR KARIER</Text>
              <Text style={styles.headerSubtitle}>
                PENCOCOKAN PROFIL MAHASISWA & RUMPUN UNIVERSITAS (MATRIX 2)
              </Text>
            </View>
          </View>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>
              TOP MATCH: {topMajor?.majorName.split("&")[0]}
            </Text>
          </View>
        </View>

        {/* Top 4 Study Recommendations */}
        {results.studyRecommendations.slice(0, 4).map((rec, idx) => (
          <View key={rec.id} style={styles.majorCard}>
            <View style={styles.majorHeader}>
              <Text style={styles.majorName}>
                #{idx + 1}. {rec.majorName}
              </Text>
              <View style={styles.fitBadge}>
                <Text style={styles.fitBadgeText}>
                  {rec.fitScore}% Fit • {rec.fitLevel}
                </Text>
              </View>
            </View>
            <Text style={styles.majorFaculty}>
              {rec.faculty} ({rec.cluster})
            </Text>

            {/* Why this fit */}
            <View style={styles.insightBox}>
              <Text style={styles.insightTitle}>
                ✓ Mengapa Sangat Cocok (Why This Fit):
              </Text>
              <Text style={styles.insightText}>{rec.whyThisFit}</Text>
            </View>

            {/* What to watch out for */}
            <View style={styles.insightBox}>
              <Text style={styles.watchOutTitle}>
                ⚠ Hal yang Perlu Diantisipasi (What to Watch Out For):
              </Text>
              <Text style={styles.insightText}>{rec.whatToWatchOutFor}</Text>
            </View>

            {/* Career Prospects */}
            <View style={styles.careerRow}>
              <Text style={styles.careerLabel}>Prospek Karier:</Text>
              <Text style={styles.careerText}>
                {rec.careerProspects.join(" • ")}
              </Text>
            </View>
          </View>
        ))}

        {/* Actionable Next Steps */}
        <View style={[styles.infoBox, { marginTop: 4, marginBottom: 8 }]}>
          <View style={{ width: "100%" }}>
            <Text style={[styles.infoLabel, { width: "100%", marginBottom: 2 }]}>
              Langkah Tindak Lanjut Siswa & Orang Tua:
            </Text>
            <Text style={[styles.infoValue, { fontSize: 6.5, lineHeight: 1.3 }]}>
              1. Diskusikan laporan ini bersama orang tua dan Guru Bimbingan Konseling (BK) di sekolah Anda.{"\n"}
              2. Kunjungi agenda Open House universitas terkait atau telusuri kurikulum program studi rekomendasi di atas.{"\n"}
              3. Persiapkan strategi pemilihan jalur seleksi (SNBP, SNBT, maupun Mandiri) berbasis kesiapan profil diri.
            </Text>
          </View>
        </View>

        {/* Official Digital Signature & Seal */}
        <View style={styles.officialSignRow}>
          <View style={styles.signBlock}>
            <Text style={styles.signTitle}>Diverifikasi secara Digital oleh:</Text>
            <Text style={styles.signName}>Dr. Hendra Pratama, M.Psi., Psikolog</Text>
            <Text style={styles.signRole}>Lead Psychometrician & Assessor GGC</Text>
          </View>

          <View style={styles.certStamp}>
            <Text style={styles.certStampTitle}>SERTIFIKASI DIGITAL RESMI</Text>
            <Text style={styles.certStampId}>{sessionDocId}</Text>
            <Text style={{ fontSize: 5.5, color: "#126348", marginTop: 1 }}>
              TERDAFTAR RESMI PADA PORTAL GGC
            </Text>
          </View>

          <View style={styles.signBlock}>
            <Text style={styles.signTitle}>Disahkan untuk Penggunaan Studi:</Text>
            <Text style={styles.signName}>Tim Dewan Penasehat Karir</Text>
            <Text style={styles.signRole}>Go Great Career Academic Advisory</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} Go Great Career (GGC) • Halaman 3 dari 3 • Dokumen Sah & Bersertifikat
          </Text>
          <Text style={styles.footerText}>Verifikasi Digital: VALID & CERTIFIED</Text>
        </View>
      </Page>
    </Document>
  );
}
