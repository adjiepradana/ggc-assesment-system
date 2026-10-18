"use client";

import React, { useState, useEffect } from "react";
import { CheckSquare, Square, Calendar, Target, Award, Sparkles, CheckCircle2, RefreshCw } from "lucide-react";

interface ActionPlanProps {
  sessionId: string;
  topMajorName: string;
  signatureTitle: string;
}

interface StepItem {
  id: string;
  text: string;
  hint?: string;
}

interface StagePlan {
  stage: string;
  timeframe: string;
  title: string;
  focus: string;
  steps: StepItem[];
}

const ACTION_STAGES: StagePlan[] = [
  {
    stage: "Tahap 1",
    timeframe: "Hari 1 – 30",
    title: "Validasi Arah & Konsultasi Strategis",
    focus: "Membangun keselarasan antara aspirasi diri, orang tua, dan konselor.",
    steps: [
      {
        id: "step_1_1",
        text: "Diskusikan dokumen hasil asesmen GGC ini bersama orang tua dan guru BK / konselor sekolah.",
        hint: "Gunakan data skor 7 Dimensi dan keselarasan minat sebagai dasar diskusi rasional.",
      },
      {
        id: "step_1_2",
        text: "Buat daftar pendek (shortlist) 3 universitas target dengan akreditasi unggul untuk jurusan pilihan Anda.",
        hint: "Bandingkan kurikulum, fasilitas lab, dan reputasi karier alumni di tiap kampus.",
      },
      {
        id: "step_1_3",
        text: "Ikuti webinar, open house, atau virtual tour kampus untuk mengenal atmosfer perkuliahan secara nyata.",
      },
    ],
  },
  {
    stage: "Tahap 2",
    timeframe: "Hari 31 – 60",
    title: "Penguatan Akademik & Portofolio",
    focus: "Mendongkrak daya saing nilai rapor dan rekam jejak prestasi.",
    steps: [
      {
        id: "step_2_1",
        text: "Petakan mata pelajaran pendukung utama yang memiliki bobot penilaian tertinggi pada jurusan target Anda.",
        hint: "Fokus pertahankan atau tingkatkan nilai rapor pada mata pelajaran terkait di semester berjalan.",
      },
      {
        id: "step_2_2",
        text: "Dokumentasikan sertifikat lomba, piagam kegiatan, dan karya nyata dalam portofolio digital yang rapi.",
      },
      {
        id: "step_2_3",
        text: "Kerjakan satu proyek mandiri atau bacaan buku rujukan dasar kuliah yang memperdalam wawasan bidang ini.",
      },
    ],
  },
  {
    stage: "Tahap 3",
    timeframe: "Hari 61 – 90",
    title: "Simulasi Jalur Masuk & Uji Kompetensi",
    focus: "Menyiapkan ketahanan penalaran menghadapi ujian seleksi nasional & mandiri.",
    steps: [
      {
        id: "step_3_1",
        text: "Riset kuota daya tampung, rasio keketatan persaingan, dan tren passing grade 3 tahun terakhir.",
      },
      {
        id: "step_3_2",
        text: "Ikuti minimal 2 kali simulasi tryout berkala (SNBT / Ujian Mandiri) untuk mengukur kecepatan pengerjaan.",
        hint: "Evaluasi subtes yang masih di bawah target dan perbaiki strategi manajemen waktu.",
      },
      {
        id: "step_3_3",
        text: "Susun draf esai motivasi atau personal statement jika mendaftar jalur prestasi atau program beasiswa.",
      },
    ],
  },
  {
    stage: "Tahap 4",
    timeframe: "Hari 91 – 100",
    title: "Finalisasi & Kesiapan Mental",
    focus: "Memantapkan keputusan final dan menjaga ketenangan pikiran.",
    steps: [
      {
        id: "step_4_1",
        text: "Kunci urutan prioritas pilihan jurusan pada portal pendaftaran resmi kampus.",
      },
      {
        id: "step_4_2",
        text: "Lakukan konsultasi pemantapan final bersama mentor GGC atau guru pembimbing sebelum tombol finalisasi ditekan.",
      },
    ],
  },
];

export default function ActionPlanRoadmap({
  sessionId,
  topMajorName,
  signatureTitle,
}: ActionPlanProps) {
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  const storageKey = `ggc_action_plan_${sessionId}`;

  // Load from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          setCheckedSteps(JSON.parse(saved));
        }
      } catch (e) {
        console.error("Failed to load action plan:", e);
      } finally {
        setIsLoaded(true);
      }
    }
  }, [storageKey]);

  // Save to localStorage
  const toggleStep = (stepId: string) => {
    setCheckedSteps((prev) => {
      const next = { ...prev, [stepId]: !prev[stepId] };
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch (e) {
          console.error("Failed to save action plan:", e);
        }
      }
      return next;
    });
  };

  const handleReset = () => {
    if (confirm("Reset seluruh checklist rencana aksi Anda?")) {
      setCheckedSteps({});
      if (typeof window !== "undefined") {
        localStorage.removeItem(storageKey);
      }
    }
  };

  const totalSteps = ACTION_STAGES.reduce((acc, curr) => acc + curr.steps.length, 0);
  const completedSteps = Object.values(checkedSteps).filter(Boolean).length;
  const progressPercent = Math.round((completedSteps / totalSteps) * 100);

  return (
    <div className="space-y-6">
      {/* Action Plan Header Card */}
      <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-r from-ggc-tint via-white to-ggc-gold-subtle border border-ggc-gold/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ggc-gold-dark">
              Roadmap Sukses Mandiri
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-[11px] font-semibold text-gray-500">
              Target: {topMajorName}
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-ggc-dark">
            Rencana Aksi 100 Hari Menuju Kampus Impian
          </h3>
          <p className="text-xs text-gray-600 mt-1 max-w-2xl leading-relaxed">
            Panduan bertahap untuk memaksimalkan potensi <strong>{signatureTitle}</strong> Anda menjadi tiket masuk perguruan tinggi unggulan.
          </p>
        </div>

        {/* Live Progress Card */}
        <div className="shrink-0 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-gray-200/90 shadow-xs min-w-[220px]">
          <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-1.5">
            <span>Progres Rencana:</span>
            <span className="text-ggc font-black">{progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-gray-100 overflow-hidden border border-gray-200">
            <div
              className="h-full bg-gradient-to-r from-ggc via-ggc-light to-ggc-gold transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-gray-500 mt-2">
            <span>{completedSteps} dari {totalSteps} langkah tuntas</span>
            {completedSteps > 0 && (
              <button
                type="button"
                onClick={handleReset}
                className="no-print text-gray-400 hover:text-red-600 text-[10px] font-bold transition-colors"
                title="Reset checklist"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4 Stages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {ACTION_STAGES.map((stagePlan) => {
          const stageCompleted = stagePlan.steps.every((s) => checkedSteps[s.id]);

          return (
            <div
              key={stagePlan.stage}
              className={`rounded-2xl sm:rounded-3xl p-5 sm:p-6 border transition-all duration-200 ${
                stageCompleted
                  ? "bg-emerald-50/60 border-emerald-300 shadow-sm"
                  : "bg-white border-gray-200 shadow-xs hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-ggc px-2 py-0.5 rounded-lg bg-ggc-subtle">
                    {stagePlan.stage}
                  </span>
                  <span className="text-xs font-bold text-gray-400">({stagePlan.timeframe})</span>
                </div>
                {stageCompleted && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Tuntas
                  </span>
                )}
              </div>

              <h4 className="text-sm sm:text-base font-black text-ggc-dark mb-1">
                {stagePlan.title}
              </h4>
              <p className="text-[11px] text-gray-500 mb-4 leading-relaxed italic">
                {stagePlan.focus}
              </p>

              {/* Checklist items */}
              <ul className="space-y-2.5">
                {stagePlan.steps.map((step) => {
                  const isChecked = !!checkedSteps[step.id];

                  return (
                    <li
                      key={step.id}
                      onClick={() => toggleStep(step.id)}
                      className={`group p-3 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-3 ${
                        isChecked
                          ? "bg-white border-emerald-300 text-gray-800 shadow-2xs"
                          : "bg-gray-50/70 border-gray-200 hover:bg-white hover:border-ggc-gold/60 text-gray-700"
                      }`}
                      role="checkbox"
                      aria-checked={isChecked}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          toggleStep(step.id);
                        }
                      }}
                    >
                      <div className="shrink-0 mt-0.5">
                        {isChecked ? (
                          <div className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                            <CheckSquare className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-md border-2 border-gray-300 group-hover:border-ggc transition-colors bg-white" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <span
                          className={`text-xs leading-relaxed block ${
                            isChecked ? "line-through text-gray-400" : "font-semibold text-gray-800"
                          }`}
                        >
                          {step.text}
                        </span>
                        {step.hint && !isChecked && (
                          <span className="text-[10px] text-gray-500 mt-1 block">
                            💡 {step.hint}
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
