"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  FileQuestion,
  Search,
  Plus,
  ArrowLeft,
  Check,
  X,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  AlertCircle,
  Filter,
  Layers,
  Sparkles,
} from "lucide-react";

interface QuestionItem {
  id: string;
  code: string;
  dimension_category: string;
  subdimensi: string;
  question_text: string;
  is_active: boolean;
  options: any;
}

const DIMENSIONS = [
  { key: "ALL", name: "Semua Kategori (84)" },
  { key: "TALENT", name: "Talent (Bakat)" },
  { key: "INTEREST", name: "Interest (Minat)" },
  { key: "PERSONALITY", name: "Personality (Kepribadian)" },
  { key: "VALUES", name: "Values (Nilai Pribadi)" },
  { key: "ACADEMIC", name: "Academic (Akademik)" },
  { key: "CAREER", name: "Career (Arah Karier)" },
  { key: "READINESS", name: "Readiness (Kesiapan)" },
];

function QuestionCmsContent() {
  const searchParams = useSearchParams();
  const initialCat = searchParams.get("category") || "ALL";

  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCat);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null);

  // Form states
  const [newQuestionForm, setNewQuestionForm] = useState({
    code: "",
    dimension_category: "TALENT",
    subdimensi: "",
    question_text: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/admin/questions?category=${selectedCategory}&search=${encodeURIComponent(searchQuery)}`
      );
      const json = await res.json();
      if (json.success) {
        setQuestions(json.questions || []);
      }
    } catch (err) {
      console.error("Error fetching questions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [selectedCategory]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isAddModalOpen && !isSubmitting) setIsAddModalOpen(false);
        if (editingQuestion && !isSubmitting) setEditingQuestion(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAddModalOpen, editingQuestion, isSubmitting]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchQuestions();
  };

  // Toggle active/inactive
  const handleToggleActive = async (q: QuestionItem) => {
    const updatedStatus = !q.is_active;

    // Optimistic UI
    setQuestions((prev) =>
      prev.map((item) => (item.id === q.id ? { ...item, is_active: updatedStatus } : item))
    );

    try {
      const res = await fetch(`/api/admin/questions/${q.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: updatedStatus }),
      });
      if (!res.ok) throw new Error("Gagal mengubah status soal.");
    } catch (err: any) {
      alert(err.message || "Gagal mengubah status soal.");
      fetchQuestions(); // rollback
    }
  };

  // Add Question
  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedbackMsg(null);

    try {
      const res = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newQuestionForm),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal membuat soal baru.");

      setIsAddModalOpen(false);
      setNewQuestionForm({
        code: "",
        dimension_category: "TALENT",
        subdimensi: "",
        question_text: "",
      });
      fetchQuestions();
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit Question
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/admin/questions/${editingQuestion.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_text: editingQuestion.question_text,
          subdimensi: editingQuestion.subdimensi,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal memperbarui soal.");

      setEditingQuestion(null);
      fetchQuestions();
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan perubahan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-ggc transition-colors bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Admin Dashboard</span>
            </Link>
            <span className="text-xs text-gray-400">/</span>
            <span className="text-xs font-semibold text-ggc-dark">Question Bank CMS</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-ggc-dark mt-2 tracking-tight">
            Question Bank Manager (84 Butir Instrumen)
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Kelola butir pernyataan, kategori dimensi, subdimensi penilaian, dan status keaktifan soal asesmen.
          </p>
        </div>

        <button
          onClick={() => {
            setFeedbackMsg(null);
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-ggc hover:bg-ggc-light shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-ggc-gold" />
          <span>+ Tambah Butir Soal Baru</span>
        </button>
      </div>

      {/* Dimension Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {DIMENSIONS.map((dim) => (
          <button
            key={dim.key}
            onClick={() => setSelectedCategory(dim.key)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              selectedCategory === dim.key
                ? "bg-ggc text-white border-ggc shadow-sm"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {dim.name}
          </button>
        ))}
      </div>

      {/* Search & Statistics Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-gray-200 shadow-sm">
        <div className="text-xs text-gray-500">
          Menampilkan <strong>{questions.length}</strong> butir instrumen aktif
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kode atau teks pertanyaan..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-ggc"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </form>
      </div>

      {/* Questions List Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-gray-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-ggc" />
            <span>Memuat bank soal...</span>
          </div>
        ) : questions.length === 0 ? (
          <div className="py-16 text-center text-xs text-gray-500">
            Tidak ada butir soal yang sesuai filter pencarian.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 uppercase font-bold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3.5">Kode</th>
                  <th className="px-6 py-3.5">Dimensi</th>
                  <th className="px-6 py-3.5">Subdimensi</th>
                  <th className="px-6 py-3.5">Pernyataan Instrumen Soal</th>
                  <th className="px-6 py-3.5 text-center">Status Aktif</th>
                  <th className="px-6 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {questions.map((q) => (
                  <tr key={q.id} className="hover:bg-gray-50/80 transition-colors">
                    {/* Code */}
                    <td className="px-6 py-4 font-mono font-black text-ggc text-sm">
                      {q.code}
                    </td>

                    {/* Dimension Badge */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-ggc-subtle text-ggc border border-ggc/20">
                        {q.dimension_category}
                      </span>
                    </td>

                    {/* Subdimension */}
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      {q.subdimensi}
                    </td>

                    {/* Text */}
                    <td className="px-6 py-4 text-gray-700 max-w-md leading-relaxed">
                      {q.question_text}
                    </td>

                    {/* Toggle Active */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleActive(q)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all border ${
                          q.is_active
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : "bg-gray-100 text-gray-500 border-gray-300"
                        }`}
                        title="Klik untuk ubah status aktif"
                      >
                        {q.is_active ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                            <span>Aktif</span>
                          </>
                        ) : (
                          <>
                            <X className="w-3 h-3 text-gray-400 stroke-[3]" />
                            <span>Nonaktif</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingQuestion(q)}
                          className="p-1.5 text-gray-500 hover:text-ggc hover:bg-ggc-subtle rounded-lg transition-colors"
                          title="Edit Teks Soal"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= MODAL TAMBAH SOAL BARU ================= */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn"
          role="dialog"
          aria-modal="true"
          style={{ overscrollBehavior: "contain" }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSubmitting) setIsAddModalOpen(false);
          }}
        >
          <div
            className="bg-white dark:bg-[#062419] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-ggc-gold/30 text-gray-900 dark:text-white animate-scale-in"
            style={{ overscrollBehavior: "contain" }}
          >
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-[#0E4230] mb-4">
              <h3 className="text-lg font-black text-ggc-dark dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-ggc dark:text-ggc-gold" />
                Tambah Butir Soal Baru
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#082E20] hover:bg-gray-200 dark:hover:bg-[#0C3E2B] text-gray-600 dark:text-gray-300 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {feedbackMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
                <span>{feedbackMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleAddQuestion} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-ggc-dark dark:text-white mb-1">
                    Kode Unik Soal *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: T13"
                    value={newQuestionForm.code}
                    onChange={(e) =>
                      setNewQuestionForm({ ...newQuestionForm, code: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#103D2B] bg-white dark:bg-[#031810] text-gray-900 dark:text-white uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ggc-dark dark:text-white mb-1">
                    Dimensi Kategori *
                  </label>
                  <select
                    value={newQuestionForm.dimension_category}
                    onChange={(e) =>
                      setNewQuestionForm({
                        ...newQuestionForm,
                        dimension_category: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#103D2B] bg-white dark:bg-[#031810] text-gray-900 dark:text-white"
                  >
                    <option value="TALENT">Talent (Bakat)</option>
                    <option value="INTEREST">Interest (Minat)</option>
                    <option value="PERSONALITY">Personality (Kepribadian)</option>
                    <option value="VALUES">Values (Nilai Pribadi)</option>
                    <option value="ACADEMIC">Academic (Akademik)</option>
                    <option value="CAREER">Career (Karier)</option>
                    <option value="READINESS">Readiness (Kesiapan)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ggc-dark dark:text-white mb-1">
                  Subdimensi Penilaian *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Logika Algoritmik Lanjutan"
                  value={newQuestionForm.subdimensi}
                  onChange={(e) =>
                    setNewQuestionForm({ ...newQuestionForm, subdimensi: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#103D2B] bg-white dark:bg-[#031810] text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ggc-dark dark:text-white mb-1">
                  Teks Pernyataan Soal *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Tuliskan pernyataan evaluasi psikometrik di sini..."
                  value={newQuestionForm.question_text}
                  onChange={(e) =>
                    setNewQuestionForm({
                      ...newQuestionForm,
                      question_text: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#103D2B] bg-white dark:bg-[#031810] text-gray-900 dark:text-white leading-relaxed"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-[#082E20] hover:bg-gray-200 dark:hover:bg-[#0C3E2B] transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 py-2.5 rounded-xl text-xs font-bold text-white bg-ggc hover:bg-ggc-light shadow-md disabled:opacity-60 cursor-pointer transition-all"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Soal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL EDIT SOAL ================= */}
      {editingQuestion && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn"
          role="dialog"
          aria-modal="true"
          style={{ overscrollBehavior: "contain" }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSubmitting) setEditingQuestion(null);
          }}
        >
          <div
            className="bg-white dark:bg-[#062419] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-ggc-gold/30 text-gray-900 dark:text-white animate-scale-in"
            style={{ overscrollBehavior: "contain" }}
          >
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-[#0E4230] mb-4">
              <h3 className="text-lg font-black text-ggc-dark dark:text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-ggc dark:text-ggc-gold" />
                Edit Butir Soal ({editingQuestion.code})
              </h3>
              <button
                onClick={() => setEditingQuestion(null)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#082E20] hover:bg-gray-200 dark:hover:bg-[#0C3E2B] text-gray-600 dark:text-gray-300 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ggc-dark dark:text-white mb-1">
                  Subdimensi Penilaian
                </label>
                <input
                  type="text"
                  required
                  value={editingQuestion.subdimensi}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, subdimensi: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#103D2B] bg-white dark:bg-[#031810] text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ggc-dark dark:text-white mb-1">
                  Teks Pernyataan Instrumen
                </label>
                <textarea
                  required
                  rows={4}
                  value={editingQuestion.question_text}
                  onChange={(e) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      question_text: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#103D2B] bg-white dark:bg-[#031810] text-gray-900 dark:text-white leading-relaxed"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="w-1/2 py-2.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-[#082E20] hover:bg-gray-200 dark:hover:bg-[#0C3E2B] transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 py-2.5 rounded-xl text-xs font-bold text-white bg-ggc hover:bg-ggc-light shadow-md disabled:opacity-60 cursor-pointer transition-all"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function QuestionCmsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center text-xs text-gray-500">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-ggc" />
          <span>Memuat antarmuka bank soal...</span>
        </div>
      }
    >
      <QuestionCmsContent />
    </Suspense>
  );
}

