import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
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
}

// Define elegant PDF styles using GGC branding
const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#1f2937",
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#C5A869",
    paddingBottom: 12,
    marginBottom: 16,
  },
  headerBrand: {
    flexDirection: "column",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#063424",
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 8,
    color: "#126348",
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  headerBadge: {
    backgroundColor: "#FAF6ED",
    borderWidth: 1,
    borderColor: "#C5A869",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  headerBadgeText: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#A6863F",
  },

  // Student Info Box
  infoBox: {
    backgroundColor: "#F3F8F5",
    borderWidth: 1,
    borderColor: "#EBF4F0",
    borderRadius: 6,
    padding: 10,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoColumn: {
    width: "48%",
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  infoLabel: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#0B4632",
    width: 70,
  },
  infoValue: {
    fontSize: 8,
    color: "#374151",
    flex: 1,
  },

  // Section Styles
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#063424",
    backgroundColor: "#EBF4F0",
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 3,
    marginBottom: 8,
  },

  // Potential Signature Banner
  signatureCard: {
    backgroundColor: "#0B4632",
    borderRadius: 6,
    padding: 12,
    marginBottom: 14,
    color: "#FFFFFF",
  },
  signatureBadge: {
    fontSize: 7,
    color: "#C5A869",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },
  signatureTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  signatureTagline: {
    fontSize: 8,
    color: "#EBF4F0",
    marginBottom: 6,
    fontStyle: "italic",
  },
  signatureDesc: {
    fontSize: 8,
    color: "#FAF6ED",
    lineHeight: 1.3,
  },

  // 3 Archetypes Grid
  archetypesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
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
    fontSize: 8,
    fontWeight: "bold",
    color: "#0B4632",
    marginBottom: 2,
  },
  archetypeTag: {
    fontSize: 7,
    color: "#A6863F",
    marginBottom: 3,
  },
  archetypeDesc: {
    fontSize: 6.5,
    color: "#6B7280",
    lineHeight: 1.2,
  },

  // Dimensions Table
  table: {
    width: "100%",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 4,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingVertical: 4,
    paddingHorizontal: 6,
    alignItems: "center",
  },
  colDim: { width: "45%", fontSize: 7.5, fontWeight: "bold", color: "#1F2937" },
  colScore: { width: "25%", fontSize: 7.5, color: "#4B5563" },
  colBar: { width: "30%" },
  progressBarBg: {
    height: 5,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#0B4632",
    borderRadius: 2,
  },

  // Recommendation Card (Page 2)
  majorCard: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 6,
    padding: 9,
    marginBottom: 8,
    backgroundColor: "#FFFFFF",
  },
  majorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  majorName: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#063424",
  },
  fitBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    backgroundColor: "#EBF4F0",
    borderWidth: 1,
    borderColor: "#126348",
  },
  fitBadgeText: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#0B4632",
  },
  majorFaculty: {
    fontSize: 7.5,
    color: "#6B7280",
    marginBottom: 6,
  },
  insightBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 4,
    padding: 6,
    marginBottom: 4,
  },
  insightTitle: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#0B4632",
    marginBottom: 1,
  },
  insightText: {
    fontSize: 7,
    color: "#4B5563",
    lineHeight: 1.25,
  },
  watchOutTitle: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#A6863F",
    marginBottom: 1,
  },
  careerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },
  careerLabel: {
    fontSize: 6.5,
    fontWeight: "bold",
    color: "#4B5563",
    marginRight: 4,
  },
  careerText: {
    fontSize: 6.5,
    color: "#126348",
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 20,
    left: 36,
    right: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 6,
  },
  footerText: {
    fontSize: 6.5,
    color: "#9CA3AF",
  },
});

export default function ReportPdfDocument({ student, results }: ReportPdfProps) {
  const topMajor = results.studyRecommendations[0];

  return (
    <Document title={`GGC_Study_Fit_Report_${student.name.replace(/\s+/g, "_")}`}>
      {/* ================= PAGE 1: PERSON PROFILE & POTENTIAL SIGNATURE ================= */}
      <Page size="A4" style={styles.page}>
        {/* Brand Header */}
        <View style={styles.header}>
          <View style={styles.headerBrand}>
            <Text style={styles.headerTitle}>GO GREAT CAREER (GGC)</Text>
            <Text style={styles.headerSubtitle}>STUDY FIT ASSESSMENT™ • OFFICIAL REPORT</Text>
          </View>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>84-ITEM MULTI-MATRIX</Text>
          </View>
        </View>

        {/* Student Profile Box */}
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
          </View>
          <View style={styles.infoColumn}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Jenjang/Kelas:</Text>
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
          </View>
        </View>

        {/* Primary Potential Signature Banner */}
        <View style={styles.signatureCard}>
          <Text style={styles.signatureBadge}>Top Potential Signature #1</Text>
          <Text style={styles.signatureTitle}>{results.potentialSignatures[0]?.title}</Text>
          <Text style={styles.signatureTagline}>{results.potentialSignatures[0]?.tagline}</Text>
          <Text style={styles.signatureDesc}>{results.potentialSignatures[0]?.description}</Text>
        </View>

        {/* Top 3 Signatures Comparison */}
        <Text style={styles.sectionTitle}>PEMETAAN 3 SIGNATURE POTENSI UTAMA</Text>
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

        {/* 6 Talent Subdimensions Overview */}
        <Text style={styles.sectionTitle}>ANALISIS 6 PILAR SUBDIMENSI BAKAT (TALENT)</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDim}>Subdimensi Bakat</Text>
            <Text style={styles.colScore}>Rata-rata Skor (1-5)</Text>
            <Text style={styles.colBar}>Kekuatan Relatif</Text>
          </View>
          {results.talentSubdimensions.map((sub, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={styles.colDim}>{sub.name}</Text>
              <Text style={styles.colScore}>
                {sub.score.toFixed(1)} / 5.0 ({sub.level})
              </Text>
              <View style={styles.colBar}>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${sub.percentage}%` },
                    ]}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* 7 Dimensions Holistic Summary */}
        <Text style={styles.sectionTitle}>SKOR 7 DIMENSI ASESMEN HOLISTIK</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDim}>Dimensi Evaluasi</Text>
            <Text style={styles.colScore}>Skor Rata-rata</Text>
            <Text style={styles.colBar}>Tingkat Kesiapan</Text>
          </View>
          {results.dimensionScores.map((dim, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={styles.colDim}>{dim.name.split("(")[0]}</Text>
              <Text style={styles.colScore}>{dim.score.toFixed(1)} / 5.0</Text>
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

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} Go Great Career (GGC) • Halaman 1 dari 2
          </Text>
          <Text style={styles.footerText}>ID Sesi: {results.sessionId.slice(0, 18)}...</Text>
        </View>
      </Page>

      {/* ================= PAGE 2: STUDY FIT RECOMMENDATIONS & NARRATIVE ================= */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerBrand}>
            <Text style={styles.headerTitle}>REKOMENDASI PROGRAM STUDI & JURUSAN</Text>
            <Text style={styles.headerSubtitle}>HASIL PENCOCOKAN MATRIX 2 (STUDY PROFILE MATCHING)</Text>
          </View>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>
              TOP MATCH: {topMajor?.majorName.split("&")[0]}
            </Text>
          </View>
        </View>

        {/* Top Recommendations Cards */}
        {results.studyRecommendations.slice(0, 4).map((rec, idx) => (
          <View key={rec.id} style={styles.majorCard}>
            <View style={styles.majorHeader}>
              <Text style={styles.majorName}>
                #{idx + 1}. {rec.majorName}
              </Text>
              <View style={styles.fitBadge}>
                <Text style={styles.fitBadgeText}>
                  {rec.fitScore}% • {rec.fitLevel}
                </Text>
              </View>
            </View>
            <Text style={styles.majorFaculty}>
              {rec.faculty} ({rec.cluster})
            </Text>

            {/* Why this fit */}
            <View style={styles.insightBox}>
              <Text style={styles.insightTitle}>✓ Mengapa Jurusan Ini Sangat Cocok (Why This Fit):</Text>
              <Text style={styles.insightText}>{rec.whyThisFit}</Text>
            </View>

            {/* What to watch out for */}
            <View style={styles.insightBox}>
              <Text style={styles.watchOutTitle}>⚠ Hal yang Perlu Diantisipasi (What to Watch Out For):</Text>
              <Text style={styles.insightText}>{rec.whatToWatchOutFor}</Text>
            </View>

            {/* Career Prospects */}
            <View style={styles.careerRow}>
              <Text style={styles.careerLabel}>Prospek Karier Relevan:</Text>
              <Text style={styles.careerText}>{rec.careerProspects.join(" • ")}</Text>
            </View>
          </View>
        ))}

        {/* Actionable Next Steps */}
        <View style={[styles.infoBox, { marginTop: 10 }]}>
          <View style={{ width: "100%" }}>
            <Text style={[styles.infoLabel, { width: "100%", marginBottom: 3 }]}>
              Langkah Tindak Lanjut Rekomendasi GGC:
            </Text>
            <Text style={[styles.infoValue, { fontSize: 7.5, lineHeight: 1.3 }]}>
              1. Diskusikan hasil evaluasi ini bersama orang tua dan Guru Bimbingan Konseling (BK) di sekolah Anda.{"\n"}
              2. Kunjungi open house perguruan tinggi atau tinjau silabus mata kuliah program studi teratas di atas.{"\n"}
              3. Perkuat aspek antisipasi yang disorot agar transisi perkuliahan Anda berjalan sukses dan gemilang.
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} Go Great Career (GGC) • Halaman 2 dari 2 • Dokumen Resmi
          </Text>
          <Text style={styles.footerText}>Verifikasi Digital: VALID & CERTIFIED</Text>
        </View>
      </Page>
    </Document>
  );
}
