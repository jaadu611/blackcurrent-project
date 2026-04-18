"use client";

import { useState } from "react";
import {
  Upload,
  FileText,
  CheckCircle2,
  Eye,
  Trash2,
  Download,
  Plus,
  Sparkles,
} from "lucide-react";

type UploadedFile = {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  status: "processing" | "completed";
};

type Quiz = {
  id: string;
  title: string;
  materialName: string;
  questionsCount: number;
  createdAt: string;
  status: "draft" | "published";
  difficulty: "easy" | "medium" | "hard";
};

const mockFiles: UploadedFile[] = [
  {
    id: "1",
    name: "Introduction to Physics.pdf",
    size: "2.4 MB",
    uploadedAt: "2026-04-15",
    status: "completed",
  },
  {
    id: "2",
    name: "Chemistry Basics.pdf",
    size: "1.8 MB",
    uploadedAt: "2026-04-14",
    status: "completed",
  },
];

const mockQuizzes: Quiz[] = [
  {
    id: "1",
    title: "Physics Chapter 1 Quiz",
    materialName: "Introduction to Physics.pdf",
    questionsCount: 15,
    createdAt: "2026-04-15",
    status: "published",
    difficulty: "medium",
  },
  {
    id: "2",
    title: "Chemistry Fundamentals Quiz",
    materialName: "Chemistry Basics.pdf",
    questionsCount: 20,
    createdAt: "2026-04-14",
    status: "draft",
    difficulty: "easy",
  },
  {
    id: "3",
    title: "Advanced Physics Quiz",
    materialName: "Introduction to Physics.pdf",
    questionsCount: 10,
    createdAt: "2026-04-13",
    status: "published",
    difficulty: "hard",
  },
];

const difficultyStyles: Record<Quiz["difficulty"], React.CSSProperties> = {
  easy: {
    background: "#dcfce7",
    color: "#15803d",
    border: "1px solid #bbf7d0",
  },
  medium: {
    background: "#fef9c3",
    color: "#a16207",
    border: "1px solid #fde68a",
  },
  hard: {
    background: "#fee2e2",
    color: "#b91c1c",
    border: "1px solid #fecaca",
  },
};

const statusStyles: Record<Quiz["status"], React.CSSProperties> = {
  published: {
    background: "#dbeafe",
    color: "#1d4ed8",
    border: "1px solid #bfdbfe",
  },
  draft: {
    background: "#f1f5f9",
    color: "#475569",
    border: "1px solid #e2e8f0",
  },
};

export default function QuizMaterials() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(mockFiles);
  const [quizzes, setQuizzes] = useState<Quiz[]>(mockQuizzes);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<"upload" | "quizzes">("upload");
  const [isGenerating, setIsGenerating] = useState(false);
  const [realFiles, setRealFiles] = useState<File[]>([]);
  const [previewQuiz, setPreviewQuiz] = useState<Quiz | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(Array.from(e.dataTransfer.files));
  };

  const handleFileUpload = (files: File[]) => {
    setRealFiles((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const newFile: UploadedFile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadedAt: new Date().toISOString().split("T")[0],
        status: "processing",
      };
      setUploadedFiles((prev) => [...prev, newFile]);
      setTimeout(() => {
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === newFile.id ? { ...f, status: "completed" } : f,
          ),
        );
      }, 2000);
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFileUpload(Array.from(e.target.files));
  };

  const generateRealQuiz = async () => {
    if (realFiles.length === 0) return alert("Please upload files first.");
    const pdfFile = realFiles.find((f) =>
      f.name.toLowerCase().endsWith(".pdf"),
    );
    if (!pdfFile) return alert("Please upload at least one PDF file.");
    try {
      setIsGenerating(true);
      const formData = new FormData();
      formData.append("pdf", pdfFile);
      formData.append(
        "title",
        `AI Quiz Pool - ${new Date().toLocaleTimeString()}`,
      );
      const res = await fetch("/api/generate-mcq", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setQuizzes((prev) => [
        {
          id: data.quizId ?? Date.now().toString(),
          title: `AI Generated Quiz (${new Date().toLocaleTimeString()})`,
          materialName: pdfFile.name,
          questionsCount: data.questions?.length ?? 10,
          createdAt: new Date().toISOString().split("T")[0],
          status: "published",
          difficulty: "medium",
        },
        ...prev,
      ]);
      alert("AI Generation complete! Check the Generated Quizzes tab.");
    } catch (err: any) {
      alert(`Failed to generate MCQs: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateQuiz = (fileId: string) => {
    const file = uploadedFiles.find((f) => f.id === fileId);
    if (!file) return;
    setQuizzes((prev) => [
      {
        id: Date.now().toString(),
        title: `Quiz for ${file.name.replace(".pdf", "")}`,
        materialName: file.name,
        questionsCount: Math.floor(Math.random() * 15) + 10,
        createdAt: new Date().toISOString().split("T")[0],
        status: "draft",
        difficulty: "medium",
      },
      ...prev,
    ]);
  };

  const deleteFile = (id: string) =>
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));

  /* ─── Shared style tokens ─── */
  const s = {
    page: {
      minHeight: "100vh",
      background: "#f1f5f9",
      padding: 32,
    } as React.CSSProperties,
    card: {
      background: "#ffffff",
      border: "1px solid #e2e8f0",
      borderRadius: 14,
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      padding: 24,
    } as React.CSSProperties,
    h2: {
      fontSize: 26,
      fontWeight: 700,
      color: "#0f172a",
      margin: 0,
    } as React.CSSProperties,
    subtitle: {
      fontSize: 14,
      color: "#64748b",
      marginTop: 4,
    } as React.CSSProperties,
    cardTitle: {
      fontSize: 16,
      fontWeight: 700,
      color: "#0f172a",
      margin: 0,
    } as React.CSSProperties,
    cardDesc: {
      fontSize: 13,
      color: "#64748b",
      marginTop: 2,
    } as React.CSSProperties,
    badge: {
      display: "inline-flex",
      alignItems: "center",
      padding: "3px 10px",
      borderRadius: 99,
      fontSize: 12,
      fontWeight: 600,
    } as React.CSSProperties,
    btnPrimary: {
      background: "#dc2626",
      color: "#ffffff",
      border: "none",
      padding: "10px 18px",
      borderRadius: 8,
      fontWeight: 600,
      fontSize: 14,
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      gap: 7,
    } as React.CSSProperties,
    btnPrimaryDisabled: {
      background: "#fca5a5",
      color: "#ffffff",
      border: "none",
      padding: "10px 18px",
      borderRadius: 8,
      fontWeight: 600,
      fontSize: 14,
      cursor: "not-allowed",
      display: "inline-flex",
      alignItems: "center",
      gap: 7,
    } as React.CSSProperties,
    btnOutline: {
      background: "#ffffff",
      color: "#374151",
      border: "1px solid #d1d5db",
      padding: "8px 14px",
      borderRadius: 8,
      fontWeight: 500,
      fontSize: 13,
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
    } as React.CSSProperties,
    btnRed: {
      background: "#fef2f2",
      color: "#dc2626",
      border: "1px solid #fecaca",
      padding: "8px 14px",
      borderRadius: 8,
      fontWeight: 500,
      fontSize: 13,
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
    } as React.CSSProperties,
    btnGhost: {
      background: "transparent",
      color: "#94a3b8",
      border: "none",
      padding: 8,
      borderRadius: 8,
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
    } as React.CSSProperties,
  };

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={s.h2}>Quiz Materials</h2>
        <p style={s.subtitle}>
          Upload study materials and let AI generate quizzes automatically
        </p>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 4,
          padding: 4,
          background: "#e2e8f0",
          borderRadius: 10,
          width: "fit-content",
          marginBottom: 24,
        }}
      >
        {(["upload", "quizzes"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "8px 18px",
              fontWeight: 600,
              fontSize: 14,
              border: "none",
              cursor: "pointer",
              borderRadius: 8,
              background: activeTab === tab ? "#0f172a" : "transparent",
              color: activeTab === tab ? "#f8fafc" : "#64748b",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.15s",
            }}
          >
            {tab === "upload" ? (
              "Upload Materials"
            ) : (
              <>
                Generated Quizzes
                <span
                  style={{
                    background: "#dc2626",
                    color: "#fff",
                    borderRadius: 99,
                    padding: "1px 8px",
                    fontSize: 12,
                  }}
                >
                  {quizzes.length}
                </span>
              </>
            )}
          </button>
        ))}
      </div>

      {/* ── UPLOAD TAB ── */}
      {activeTab === "upload" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={s.card}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 20,
              }}
            >
              <div>
                <p style={s.cardTitle}>Upload Study Materials</p>
                <p style={s.cardDesc}>
                  Upload a PDF file to create an AI-generated quiz
                </p>
              </div>
              {realFiles.length > 0 && (
                <button
                  style={isGenerating ? s.btnPrimaryDisabled : s.btnPrimary}
                  onClick={generateRealQuiz}
                  disabled={isGenerating}
                >
                  <Sparkles size={15} />
                  {isGenerating
                    ? "Generating..."
                    : "Run AI Automator (50 MCQs)"}
                </button>
              )}
            </div>

            {/* Drop zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{
                border: `2px dashed ${isDragging ? "#dc2626" : "#cbd5e1"}`,
                borderRadius: 12,
                padding: "48px 24px",
                textAlign: "center",
                background: isDragging ? "#fef2f2" : "#f8fafc",
                transition: "all 0.2s",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  background: "#f1f5f9",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 14px",
                }}
              >
                <Upload size={22} color="#64748b" />
              </div>
              <p style={{ fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                Drag and drop files here
              </p>
              <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 16 }}>
                or click to browse from your computer
              </p>
              <input
                type="file"
                id="file-upload"
                accept=".pdf,.doc,.docx,.txt"
                multiple
                onChange={handleFileInputChange}
                style={{ display: "none" }}
              />
              <label htmlFor="file-upload">
                <span style={{ ...s.btnOutline, cursor: "pointer" }}>
                  Choose Files
                </span>
              </label>
              <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 14 }}>
                Supported: PDF, DOC, DOCX, TXT · Max 10 MB per file
              </p>
            </div>
          </div>

          {/* File list */}
          {uploadedFiles.length > 0 && (
            <div style={s.card}>
              <p style={{ ...s.cardTitle, marginBottom: 4 }}>
                Uploaded Materials
              </p>
              <p style={{ ...s.cardDesc, marginBottom: 16 }}>
                {uploadedFiles.length} file(s) uploaded
              </p>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 16px",
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: 10,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        flex: 1,
                      }}
                    >
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          background: "#dbeafe",
                          borderRadius: 10,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <FileText size={18} color="#2563eb" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            fontSize: 14,
                            fontWeight: 500,
                            color: "#1e293b",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {file.name}
                        </p>
                        <p style={{ fontSize: 12, color: "#94a3b8" }}>
                          {file.size} · Uploaded {file.uploadedAt}
                        </p>
                      </div>
                      {file.status === "processing" ? (
                        <div style={{ textAlign: "right", marginRight: 4 }}>
                          <div
                            style={{
                              background: "#e2e8f0",
                              borderRadius: 99,
                              height: 6,
                              width: 100,
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                background: "#dc2626",
                                height: "100%",
                                width: "60%",
                                borderRadius: 99,
                              }}
                            />
                          </div>
                          <p
                            style={{
                              fontSize: 11,
                              color: "#94a3b8",
                              marginTop: 4,
                            }}
                          >
                            Processing...
                          </p>
                        </div>
                      ) : (
                        <CheckCircle2
                          size={20}
                          color="#16a34a"
                          style={{ flexShrink: 0 }}
                        />
                      )}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginLeft: 16,
                      }}
                    >
                      <button
                        style={
                          file.status === "processing"
                            ? {
                                ...s.btnRed,
                                opacity: 0.5,
                                cursor: "not-allowed",
                              }
                            : s.btnRed
                        }
                        onClick={() => generateQuiz(file.id)}
                        disabled={file.status === "processing"}
                      >
                        <Sparkles size={14} />
                        Generate Quiz
                      </button>
                      <button
                        style={s.btnGhost}
                        onClick={() => deleteFile(file.id)}
                      >
                        <Trash2 size={16} color="#94a3b8" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── QUIZZES TAB ── */}
      {activeTab === "quizzes" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {quizzes.length === 0 ? (
            <div style={{ ...s.card, padding: 64, textAlign: "center" }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  background: "#f1f5f9",
                  borderRadius: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <Sparkles size={24} color="#94a3b8" />
              </div>
              <p style={{ fontWeight: 600, color: "#1e293b", marginBottom: 6 }}>
                No quizzes generated yet
              </p>
              <p style={{ fontSize: 14, color: "#64748b", marginBottom: 20 }}>
                Upload study materials and generate your first AI-powered quiz
              </p>
              <button
                style={s.btnPrimary}
                onClick={() => setActiveTab("upload")}
              >
                <Plus size={15} />
                Upload Materials
              </button>
            </div>
          ) : (
            quizzes.map((quiz) => (
              <div
                key={quiz.id}
                style={{ ...s.card, transition: "box-shadow 0.15s" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 16,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 8,
                        marginBottom: 8,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: "#0f172a",
                        }}
                      >
                        {quiz.title}
                      </span>
                      <span
                        style={{ ...s.badge, ...statusStyles[quiz.status] }}
                      >
                        {quiz.status}
                      </span>
                      <span
                        style={{
                          ...s.badge,
                          ...difficultyStyles[quiz.difficulty],
                        }}
                      >
                        {quiz.difficulty}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: 13,
                        color: "#64748b",
                        marginBottom: 8,
                      }}
                    >
                      Based on: {quiz.materialName}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        gap: 20,
                        fontSize: 13,
                        color: "#94a3b8",
                      }}
                    >
                      <span>{quiz.questionsCount} questions</span>
                      <span>Created {quiz.createdAt}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <button
                      style={s.btnOutline}
                      onClick={() => setPreviewQuiz(quiz)}
                    >
                      <Eye size={14} /> Preview
                    </button>
                    <button style={s.btnOutline}>
                      <Download size={14} /> Export
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── PREVIEW MODAL ── */}
      {previewQuiz && (
        <div
          onClick={() => setPreviewQuiz(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#ffffff",
              borderRadius: 16,
              padding: 28,
              maxWidth: 640,
              width: "100%",
              maxHeight: "80vh",
              overflowY: "auto",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 20,
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#0f172a",
                    margin: 0,
                  }}
                >
                  {previewQuiz.title}
                </h3>
                <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
                  {previewQuiz.questionsCount} questions ·{" "}
                  {previewQuiz.difficulty} difficulty
                </p>
              </div>
              <button style={s.btnGhost} onClick={() => setPreviewQuiz(null)}>
                <span style={{ fontSize: 18, color: "#94a3b8" }}>✕</span>
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[1, 2, 3].map((num) => (
                <div
                  key={num}
                  style={{
                    padding: 16,
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: 10,
                  }}
                >
                  <p
                    style={{
                      fontWeight: 600,
                      color: "#1e293b",
                      marginBottom: 12,
                      fontSize: 14,
                    }}
                  >
                    {num}. What is the main concept discussed in chapter {num}?
                  </p>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {["Option A", "Option B", "Option C", "Option D"].map(
                      (opt) => (
                        <label
                          key={opt}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "8px 12px",
                            borderRadius: 8,
                            background: "#ffffff",
                            border: "1px solid #e2e8f0",
                            fontSize: 14,
                            color: "#374151",
                            cursor: "pointer",
                          }}
                        >
                          <input
                            type="radio"
                            name={`q${num}`}
                            style={{ accentColor: "#dc2626" }}
                          />
                          {opt}
                        </label>
                      ),
                    )}
                  </div>
                </div>
              ))}
              <p
                style={{ fontSize: 13, color: "#94a3b8", textAlign: "center" }}
              >
                … and {previewQuiz.questionsCount - 3} more questions
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
