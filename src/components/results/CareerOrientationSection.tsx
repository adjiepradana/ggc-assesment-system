"use client";

import React, { useState } from "react";
import {
  Compass,
  Sparkles,
  Briefcase,
  Users,
  HeartHandshake,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Award,
  Zap,
  Target,
  Edit3,
  Layers,
  ChevronRight,
  Flame,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";
import {
  CareerOrientationSynthesis,
  StrategicTrajectory,
} from "@/lib/career-orientation";

interface CareerOrientationSectionProps {
  orientation: CareerOrientationSynthesis;
  onOpenEditModal: () => void;
}

export default function CareerOrientationSection({
  orientation,
  onOpenEditModal,
}: CareerOrientationSectionProps) {
  const [activeTrajectoryTab, setActiveTrajectoryTab] = useState<number>(0);

  // If user hasn't filled career experience yet
  if (!orientation.hasProfile) {
    return (
      <div className="rounded-[2.5rem] bg-gradient-to-br from-[#07261B] via-ggc-dark to-[#041A12] border-2 border-ggc-gold/40 p-6 sm:p-10 md:p-12 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-ggc-gold/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-2xl relative z-10 space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-ggc-gold/20 text-ggc-gold text-xs font-bold uppercase tracking-wider border border-ggc-gold/30">
            <Sparkles className="w-3.5 h-3.5" /> Modul Eksklusif Orientasi Karir
          </span>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
            Padukan Asesmen dengan Rekam Jejak Nyata Anda
          </h2>

          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            Apakah Anda pernah menjadi Ketua OSIS, pengurus BEM, aktif di Karang Taruna, memiliki proyek hobi, atau magang? Lengkapi pengalaman dan jurusan Anda untuk membuka sintesis arketipe kepemimpinan, matriks sinergi, dan 3 jalur karir masa depan!
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={onOpenEditModal}
              className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl font-black text-[#0B4632] bg-gradient-to-r from-[#DFCA95] to-[#C5A869] hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all text-xs sm:text-sm cursor-pointer shadow-lg"
            >
              <Sparkles className="w-4 h-4 text-[#0B4632]" />
              <span>Lengkapi Pengalaman & Buka Analisis Karir</span>
              <ArrowRight className="w-4 h-4 text-[#0B4632]" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const {
    profileData,
    readinessScore,
    readinessLevel,
    leadershipArchetype,
    strategicTrajectories,
    synergyMatrix,
    actionRoadmap,
  } = orientation;

  const activeTrajectory = strategicTrajectories[activeTrajectoryTab] || strategicTrajectories[0];

  return (
    <div className="space-y-8">
      {/* 1. Context Chips Header & Edit Trigger */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-[#062419] border border-ggc-gold/30 shadow-md relative overflow-hidden transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-ggc-gold-dark uppercase tracking-wider">
                Profil Karir Terkalibrasi
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="w-3 h-3" /> Aktif
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Chip: Jurusan */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gray-100 dark:bg-[#031810] border border-gray-200 dark:border-[#11402E] text-xs font-bold text-gray-800 dark:text-gray-200">
                <GraduationCap className="w-3.5 h-3.5 text-ggc-gold" />
                <span>{profileData.educationLevel}: {profileData.currentMajor}</span>
              </span>

              {/* Chip: Formal Org */}
              {profileData.formalOrg && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/40 text-xs font-bold text-emerald-900 dark:text-emerald-300">
                  <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{profileData.formalOrg} ({profileData.formalOrgRole})</span>
                </span>
              )}

              {/* Chip: Non-Formal / Community */}
              {profileData.nonFormalExp && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/40 text-xs font-bold text-amber-900 dark:text-amber-300">
                  <HeartHandshake className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>{profileData.nonFormalExp}</span>
                </span>
              )}

              {/* Chip: Work / Hobby */}
              {(profileData.workExp || profileData.hobbyInterest) && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/40 text-xs font-bold text-sky-900 dark:text-sky-300">
                  <Briefcase className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  <span>{profileData.workExp || profileData.hobbyInterest}</span>
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenEditModal}
            className="self-start md:self-center inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-ggc-dark dark:text-white bg-gray-100 dark:bg-[#082E20] hover:bg-gray-200 dark:hover:bg-[#0E4230] border border-gray-300 dark:border-[#11402E] transition-all cursor-pointer shadow-2xs shrink-0"
          >
            <Edit3 className="w-3.5 h-3.5 text-ggc-gold" />
            <span>Perbarui Pengalaman</span>
          </button>
        </div>
      </div>

      {/* 2. Hero Card: Leadership & Collaboration Archetype */}
      <div className="rounded-[2.5rem] bg-gradient-to-br from-[#07261B] via-ggc-dark to-[#041A12] border-2 border-ggc-gold/40 p-6 sm:p-8 md:p-10 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-ggc-gold/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-ggc-gold/20 text-ggc-gold text-[11px] font-bold uppercase tracking-wider border border-ggc-gold/30">
              <Sparkles className="w-3.5 h-3.5" /> Arketipe Kepemimpinan & Gaya Kerja
            </span>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold border border-white/15">
              <span>Indeks Kesiapan:</span>
              <strong className="text-ggc-gold font-black">{readinessScore}/100</strong>
              <span className="text-emerald-300">({readinessLevel})</span>
            </div>
          </div>

          <div>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
              {leadershipArchetype.name}
            </h3>
            <p className="text-xs sm:text-sm text-ggc-gold font-bold mt-1">
              {leadershipArchetype.subtitle}
            </p>
            <p className="mt-3 text-xs sm:text-sm text-gray-200 max-w-3xl leading-relaxed">
              {leadershipArchetype.description}
            </p>
          </div>

          {/* 3 Pillars of Archetype */}
          <div className="grid md:grid-cols-3 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> Gaya Kolaborasi Tim
              </div>
              <p className="text-xs text-gray-200 font-semibold leading-relaxed">
                {leadershipArchetype.collaborationStyle}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <div className="text-[11px] font-bold text-ggc-gold uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> Superpower (Unfair Advantage)
              </div>
              <p className="text-xs text-gray-200 font-semibold leading-relaxed">
                {leadershipArchetype.superpower}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Hal yang Perlu Diwaspadai
              </div>
              <p className="text-xs text-gray-200 font-semibold leading-relaxed">
                {leadershipArchetype.blindspotToWatch}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 3 Strategic Career Trajectories (Interactive Tabbed / Cards) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-ggc-gold-dark">
              Proyeksi Masa Depan
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              3 Jalur Karir Strategis Pilihan
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Dipetakan berdasarkan perpaduan jurusan Anda, rekam jejak kepemimpinan, dan potensi psikometrik tertinggi.
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {strategicTrajectories.map((traj, idx) => (
            <button
              key={traj.type}
              type="button"
              onClick={() => setActiveTrajectoryTab(idx)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                activeTrajectoryTab === idx
                  ? "bg-white dark:bg-[#07261B] border-ggc-gold shadow-md"
                  : "bg-gray-50 dark:bg-[#031810] border-gray-200 dark:border-[#103D2B] hover:border-gray-300 opacity-80"
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider block text-ggc-gold-dark">
                Jalur {idx + 1}
              </span>
              <h4 className="text-xs sm:text-sm font-black text-gray-900 dark:text-white mt-0.5 leading-snug line-clamp-1">
                {traj.title}
              </h4>
              <span className="inline-block mt-2 text-[10px] font-semibold text-gray-500 dark:text-gray-400">
                {traj.prospectRating.split(" ")[0]} {traj.prospectRating.split(" ")[1]}
              </span>
              {activeTrajectoryTab === idx && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-ggc via-emerald-500 to-ggc-gold" />
              )}
            </button>
          ))}
        </div>

        {/* Active Trajectory Detail Box */}
        {activeTrajectory && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#062419] border border-gray-200/90 dark:border-[#103D2B] shadow-md space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-[#0E3525]">
              <div>
                <span className="text-xs font-bold text-ggc-gold-dark uppercase tracking-wider">
                  {activeTrajectory.categoryLabel}
                </span>
                <h4 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight mt-0.5">
                  {activeTrajectory.title}
                </h4>
              </div>

              <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800/40 shrink-0">
                {activeTrajectory.prospectRating}
              </div>
            </div>

            {/* Why Fit Narrative */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-ggc-gold" />
                <span>Analisis Keselarasan Profil:</span>
              </h5>
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
                {activeTrajectory.whyFitNarrative}
              </p>
            </div>

            {/* Target Role Examples */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Contoh Peran / Profesi Nyata di Industri:</span>
              </h5>
              <div className="flex flex-wrap gap-2">
                {activeTrajectory.roleExamples.map((role) => (
                  <span
                    key={role}
                    className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-[#031810] border border-gray-200 dark:border-[#11402E] text-xs font-bold text-gray-800 dark:text-gray-200 shadow-2xs"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>

            {/* Skills & Certifications Grid */}
            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#031810] border border-gray-200 dark:border-[#11402E] space-y-2">
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>Keahlian Kunci yang Perlu Diasah:</span>
                </span>
                <ul className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
                  {activeTrajectory.skillsToMaster.map((skill, sIdx) => (
                    <li key={sIdx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#031810] border border-gray-200 dark:border-[#11402E] space-y-2">
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-ggc-gold" />
                  <span>Rekomendasi Sertifikasi & Lisensi:</span>
                </span>
                <ul className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
                  {activeTrajectory.suggestedCertifications.map((cert, cIdx) => (
                    <li key={cIdx} className="flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-ggc-gold shrink-0 mt-0.5" />
                      <span>{cert}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Real-World Synergy Matrix */}
      <div className="space-y-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-ggc-gold-dark">
            Nilai Tambah Nyata
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Matriks Sinergi Pengalaman Nyata vs Kompetensi Karir
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Bagaimana organisasi formal, kegiatan kemasyarakatan, dan jurusan Anda memperkuat profil Anda di dunia kerja:
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {synergyMatrix.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-3xl bg-white dark:bg-[#062419] border border-gray-200/90 dark:border-[#103D2B] shadow-sm flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ggc-gold-dark">
                    {item.sourceTitle}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-[#031810] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-[#11402E]">
                    {item.badge}
                  </span>
                </div>

                <h4 className="text-xs sm:text-sm font-black text-gray-900 dark:text-white line-clamp-2">
                  {item.userInputValue}
                </h4>

                <div className="mt-3 space-y-1">
                  <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block">
                    Kompetensi Terbangun:
                  </span>
                  <ul className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
                    {item.unlockedCompetencies.map((comp, cIdx) => (
                      <li key={cIdx} className="flex items-start gap-1.5 text-[11px]">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>{comp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 dark:border-[#0E3525]">
                <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed italic">
                  "{item.careerAdvantage}"
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Action Roadmap & Next Steps */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#F4F8F5] to-white dark:from-[#031810] dark:to-[#062419] border border-emerald-200/80 dark:border-[#103D2B] shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-ggc-gold-dark uppercase tracking-wider">
              Peta Rencana Aksi Karir
            </span>
            <h4 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight mt-0.5">
              Langkah Konkrit Menuju Karir Impian
            </h4>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
            <TrendingUp className="w-3.5 h-3.5" /> Rencana Berjenjang
          </span>
        </div>

        {/* 3 Step Timeline */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#07261B] border border-gray-200 dark:border-[#11402E] shadow-2xs space-y-2">
            <span className="px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
              Bulan 1 – 3
            </span>
            <h5 className="text-xs font-bold text-gray-900 dark:text-white">
              Dokumentasi & Portofolio Dasar
            </h5>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              {actionRoadmap.immediateStep}
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#07261B] border border-gray-200 dark:border-[#11402E] shadow-2xs space-y-2">
            <span className="px-2.5 py-1 rounded-md bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 text-[10px] font-bold uppercase tracking-wider">
              Bulan 6 – 12
            </span>
            <h5 className="text-xs font-bold text-gray-900 dark:text-white">
              Sertifikasi & Proyek Praktis
            </h5>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              {actionRoadmap.mediumTermStep}
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#07261B] border border-gray-200 dark:border-[#11402E] shadow-2xs space-y-2">
            <span className="px-2.5 py-1 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold uppercase tracking-wider">
              Tahun 2 – 3
            </span>
            <h5 className="text-xs font-bold text-gray-900 dark:text-white">
              Magang Industri & Akselerasi
            </h5>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              {actionRoadmap.longTermGoal}
            </p>
          </div>
        </div>

        {/* Portfolio & Networking Advice */}
        <div className="pt-2 border-t border-gray-200/60 dark:border-[#0E3525] grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-ggc-gold" />
              <span>Ide Proyek Portofolio Terkurasi:</span>
            </span>
            <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
              {actionRoadmap.recommendedPortfolioProjects.map((proj, pIdx) => (
                <li key={pIdx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-ggc-gold shrink-0 mt-1.5" />
                  <span>{proj}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Strategi Jejaring & Mentoring:</span>
            </span>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              {actionRoadmap.networkingAdvice}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
