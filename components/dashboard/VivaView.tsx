"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Mic2,
  PlusCircle,
  FileCheck,
  BrainCircuit,
  TrendingUp,
  Upload,
  ChevronRight,
  Loader2,
  CheckCircle2,
  User,
  History,
  MessageSquare,
  Play,
  Volume2,
  Database,
  ArrowRight,
  XCircle,
  Search,
  History as HistoryIcon
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

// --- Types ---
interface Question {
  type: string;
  question: string;
  options?: { text: string; isCorrect: boolean }[];
  answer?: any;
  followUp?: any;
}

interface Submission {
  _id: string;
  rollNumber: string;
  score: number;
  totalQuestions: number;
  aiScore?: number;
  aiFeedback?: string;
  answers: any[];
  createdAt: string;
  studentId?: { name: string; rollName: string };
}

export const VivaView = ({ user }: { user: any }) => {
  const [activeTab, setActiveTab] = useState<"creator" | "autograder" | "questions" | "insights">("creator");
  const [vivaState, setVivaState] = useState<"idle" | "uploading" | "generating" | "active">("idle");
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  const fetchSubmissions = useCallback(async () => {
    try {
      const res = await fetch("/api/submissions");
      const data = await res.json();
      if (Array.isArray(data)) setSubmissions(data);
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubmissions();
    let timeoutId: NodeJS.Timeout;
    const poll = async () => {
      await fetchSubmissions();
      timeoutId = setTimeout(poll, 15000);
    };
    timeoutId = setTimeout(poll, 15000);
    return () => clearTimeout(timeoutId);
  }, [fetchSubmissions]);

  const handleStartQuiz = async () => {
    if (!file) return;
    setVivaState("uploading");
    setProgress(20);

    const formData = new FormData();
    formData.append("pdf", file); // Backend expects "pdf"
    formData.append("title", `Viva Hub - ${new Date().toLocaleDateString()}`);
    formData.append("rollNumber", "admin");

    try {
      setVivaState("generating");
      setProgress(50);
      const res = await fetch("/api/generate-mcq", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success && data.questions) {
        setQuestions(data.questions);
        setProgress(100);
        setTimeout(() => {
          setVivaState("idle");
          setActiveTab("questions");
        }, 1500);
      } else {
        throw new Error(data.error || "Generation failed");
      }
    } catch (err) {
      console.error("Quiz creation failed:", err);
      setVivaState("idle");
    }
  };

  const filteredSubmissions = submissions.filter(
    (s) =>
      s.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40">Hardware Bridge & AI Examination</span>
          <h1 className="text-5xl font-black tracking-tighter">Viva Hub</h1>
        </div>
        <div className="flex items-center gap-3 bg-black/[0.03] px-4 py-2 rounded-2xl border border-black/5">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-black/40">Live Network Active</span>
        </div>
      </header>

      {/* Tabs Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex p-1.5 bg-black/5 rounded-[24px] w-max border border-black/5 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <TabButton
            active={activeTab === 'creator'}
            onClick={() => setActiveTab('creator')}
            label="Generator"
            icon={<PlusCircle size={18} />}
          />
          <TabButton
            active={activeTab === 'autograder'}
            onClick={() => setActiveTab('autograder')}
            label="Autograder"
            icon={<FileCheck size={18} />}
          />
          <TabButton
            active={activeTab === 'questions'}
            onClick={() => setActiveTab('questions')}
            label="Syllabus"
            icon={<BrainCircuit size={18} />}
          />
          <TabButton
            active={activeTab === 'insights'}
            onClick={() => setActiveTab('insights')}
            label="Insights"
            icon={<TrendingUp size={18} />}
          />
        </div>

        {activeTab === 'autograder' && (
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/20" />
            <input
              placeholder="Search Roll No..."
              className="w-full pl-12 pr-4 h-14 bg-white border border-black/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-black/5 text-sm font-bold tracking-tight transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {activeTab === 'creator' && (
          <motion.div
            key="creator"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-[40px] p-12 lg:p-16 border border-black/5 shadow-2xl shadow-black/5 overflow-hidden relative group"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <BrainCircuit size={300} />
            </div>

            <div className="max-w-3xl space-y-12 relative z-10">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/5 rounded-full border border-black/5">
                  <Volume2 size={12} className="text-black/40" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-black/60">Voice-to-JSON Engine v4.2</span>
                </div>
                <h2 className="text-6xl font-black tracking-tighter leading-[0.95]">
                  Capture student knowledge <span className="text-black/30">automagically.</span>
                </h2>
                <p className="text-lg font-bold text-black/40 leading-relaxed">
                  Upload your syllabus or lecture material to generate high-fidelity quizes. Our system automatically maps student voice responses from the ESP32 hardware to these targets.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <label className="flex-1 flex items-center justify-between h-20 px-8 bg-[#F8F9FA] rounded-[32px] border-2 border-dashed border-black/10 cursor-pointer hover:border-black transition-all group/upload">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                      <Upload size={20} className="text-black/40 group-hover/upload:text-black transition-colors" />
                    </div>
                    <span className="text-sm font-black text-black/60 truncate max-w-[200px]">
                      {file ? file.name : "Select Knowledge Source (PDF/Doc)"}
                    </span>
                  </div>
                  <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  {file && <CheckCircle2 size={24} className="text-black" />}
                </label>

                <button
                  onClick={handleStartQuiz}
                  disabled={!file || vivaState !== "idle"}
                  className="h-20 px-12 rounded-[32px] bg-black text-white font-black text-lg shadow-2xl shadow-black/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-20"
                >
                  {vivaState !== "idle" ? <Loader2 size={24} className="animate-spin" /> : "Deploy to Hub"}
                </button>
              </div>

              {vivaState !== "idle" && (
                <div className="space-y-4 pt-4">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40">
                      {vivaState === 'uploading' ? 'Syncing with secure server...' : 'AI Drafting Logic Matrix...'}
                    </span>
                    <span className="text-3xl font-black tracking-tighter tabular-nums">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 bg-black/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className="h-full bg-black"
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'autograder' && (
          <motion.div
            key="autograder"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[40px] border border-black/5 shadow-2xl shadow-black/5 overflow-hidden"
          >
            <div className="p-10 border-b border-black/5 bg-[#F8F9FA]/50 group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center">
                  <GraduationCap className="text-white" size={24} />
                </div>
                <h3 className="text-2xl font-black tracking-tighter">Digital Submission Pool</h3>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#F8F9FA] text-[10px] font-black uppercase tracking-widest text-black/40">
                  <tr>
                    <th className="px-10 py-6">Examinee</th>
                    <th className="px-6 py-6">Metadata</th>
                    <th className="px-6 py-6">Voice Data</th>
                    <th className="px-6 py-6 text-center">Final Score</th>
                    <th className="px-10 py-6 text-right">Review</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {loading ? (
                    <tr><td colSpan={5} className="py-20 text-center text-xs font-black text-black/20 uppercase tracking-[0.3em]">Querying Database...</td></tr>
                  ) : filteredSubmissions.length === 0 ? (
                    <tr><td colSpan={5} className="py-20 text-center text-xs font-black text-black/20 uppercase tracking-[0.3em]">No Submissions Recorded</td></tr>
                  ) : (
                    filteredSubmissions.map((sub) => (
                      <tr key={sub._id} className="group hover:bg-black/[0.01] transition-colors cursor-pointer" onClick={() => setSelectedSubmission(sub)}>
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-black/5 rounded-xl flex items-center justify-center font-black group-hover:bg-black group-hover:text-white transition-all">
                              {sub.studentId?.name?.charAt(0) || sub.rollNumber.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-black text-lg tracking-tight">{sub.studentId?.name || "Participant"}</span>
                              <span className="text-[10px] font-bold text-black/30 tracking-widest uppercase">ROLL: {sub.rollNumber}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-8">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-black/60">{sub.totalQuestions} Interrogations</span>
                            <span className="text-[10px] text-black/30 font-bold tracking-widest uppercase">{new Date(sub.createdAt).toLocaleTimeString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-8">
                          <div className="flex items-center gap-2">
                            <span className="bg-black text-white text-[10px] font-black px-3 py-1.5 rounded-full">
                              {sub.answers.filter(a => a.type === 'voice').length} Audio Files
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-8 text-center">
                          <span className="text-2xl font-black tracking-tighter">
                            {sub.aiScore || sub.score}
                            <span className="text-sm text-black/20 ml-1">/100</span>
                          </span>
                        </td>
                        <td className="px-10 py-8 text-right">
                          <button className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center ml-auto group-hover:bg-black group-hover:text-white transition-all">
                            <ChevronRight size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'questions' && (
          <motion.div
            key="questions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {questions.length === 0 ? (
              <div className="md:col-span-3 py-32 bg-white rounded-[40px] border border-dashed border-black/10 flex flex-col items-center justify-center text-center gap-4">
                <BrainCircuit size={48} className="text-black/10" />
                <p className="text-xs font-black uppercase tracking-[0.2em] text-black/20 tracking-tighter">No Syllabus Loaded in Hub</p>
              </div>
            ) : (
              questions.map((q, qIdx) => (
                <div key={qIdx} className="bg-white p-8 rounded-[32px] border border-black/5 shadow-xl shadow-black/[0.02] flex flex-col gap-6 group hover:-translate-y-1 transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center font-black text-sm">
                      {qIdx + 1}
                    </div>
                    <Badge variant="outline" className="text-[9px] font-black tracking-tighter border-black/10 text-black/40 uppercase">{q.type}</Badge>
                  </div>
                  <h5 className="font-black text-lg tracking-tight leading-tight">{q.question}</h5>
                  <div className="space-y-2">
                    {q.options?.map((opt, oIdx) => (
                      <div key={oIdx} className={`text-xs p-3 rounded-xl border flex items-center justify-between font-bold ${opt.isCorrect ? 'bg-black text-white border-black shadow-lg shadow-black/10' : 'bg-[#F8F9FA] border-black/5 text-black/40'}`}>
                        <span>{opt.text}</span>
                        {opt.isCorrect && <CheckCircle2 size={12} />}
                      </div>
                    ))}
                    {!q.options && q.answer && (
                      <div className="text-[10px] font-black uppercase tracking-widest text-black/40 pt-2 flex items-center gap-2">
                        <ArrowRight size={12} /> Correct Answer: <span className="text-black tracking-tight">{q.answer}</span>
                      </div>
                    )}
                  </div>
                  {q.followUp && (
                    <div className="mt-auto pt-6 border-t border-black/5 text-xs">
                      <span className="text-[9px] font-black uppercase tracking-widest text-black/20 block mb-2">Adaptive Context</span>
                      <p className="font-bold text-black/60 italic">"{q.followUp.question}"</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </motion.div>
        )}

        {activeTab === 'insights' && (
          <motion.div
            key="insights"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {submissions.filter(s => s.aiFeedback).length === 0 ? (
              <div className="py-32 bg-white rounded-[40px] border border-dashed border-black/10 flex flex-col items-center justify-center text-center gap-4">
                <HistoryIcon size={48} className="text-black/10" />
                <p className="text-xs font-black uppercase tracking-[0.2em] text-black/20 tracking-tighter">Awaiting AI Evaluation Completion</p>
              </div>
            ) : (
              submissions.filter(s => s.aiFeedback).map((sub, sIdx) => (
                <div key={sIdx} className="bg-white rounded-[40px] p-12 border border-black/5 shadow-2xl shadow-black/5 relative overflow-hidden group">
                  <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between mb-12 pb-12 border-b border-black/5 gap-10">
                    <div className="flex items-center gap-8">
                      <div className="w-24 h-24 bg-black rounded-[32px] text-white flex items-center justify-center shadow-2xl shadow-black/40">
                        <TrendingUp size={48} />
                      </div>
                      <div>
                        <h4 className="text-4xl font-black tracking-tighter">{sub.studentId?.name || `Examinee ${sub.rollNumber}`}</h4>
                        <span className="text-[10px] font-black uppercase tracking-widest text-black/20 mt-1 block">Performance Linguistic Audit</span>
                      </div>
                    </div>
                    <div className="bg-[#F8F9FA] p-8 rounded-[32px] border border-black/5 text-center min-w-[200px]">
                      <span className="text-xs font-black text-black/20 uppercase tracking-widest block mb-2">Final Index</span>
                      <h3 className="text-7xl font-black tracking-tighter leading-none tabular-nums text-black">{sub.aiScore}%</h3>
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-16">
                    <div className="space-y-6">
                      <label className="text-[10px] font-black uppercase tracking-widest text-black/20 flex items-center gap-3">
                        <MessageSquare size={16} /> AI Executive Summary
                      </label>
                      <div className="p-10 bg-[#F8F9FA] rounded-[32px] relative italic border border-black/5 shadow-inner">
                        <span className="text-6xl text-black/10 absolute top-4 left-6 italic font-serif">"</span>
                        <p className="text-xl font-bold tracking-tight text-black relative z-10">{sub.aiFeedback}</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <label className="text-[10px] font-black uppercase tracking-widest text-black/20 flex items-center gap-3">
                        <CheckCircle2 size={16} /> Accuracy Matrix
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        {sub.answers.map((ans, idx) => (
                          <div key={idx} className={`p-5 rounded-2xl flex items-center justify-between border ${ans.isCorrect ? 'bg-black text-white' : 'bg-[#F8F9FA] border-black/5'}`}>
                            <div className="flex items-center gap-3">
                              <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${ans.isCorrect ? 'bg-white text-black' : 'bg-black/10 text-black/40'}`}>{idx + 1}</span>
                              <span className="text-[9px] font-black uppercase tracking-widest opacity-60">{ans.type}</span>
                            </div>
                            {ans.isCorrect && <CheckCircle2 size={14} />}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Overlay */}
      <AnimatePresence>
        {selectedSubmission && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-12 overflow-hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedSubmission(null)} className="absolute inset-0 bg-white/95 backdrop-blur-3xl" />
            <motion.div initial={{ opacity: 0, scale: 0.98, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 20 }} className="relative w-full max-w-6xl h-full bg-white rounded-[40px] border border-black/5 shadow-[0_64px_128px_-32px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden">
              {/* Header */}
              <div className="p-12 border-b border-black/5 flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <div className="w-20 h-20 bg-black rounded-[28px] flex items-center justify-center text-white shadow-xl shadow-black/20">
                    <User size={40} />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-4xl font-black tracking-tighter">{selectedSubmission.studentId?.name || "Viva Participant"}</h2>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-black uppercase tracking-widest text-black/30">ROLL: {selectedSubmission.rollNumber}</span>
                      <div className="w-1 h-1 bg-black/10 rounded-full" />
                      <span className="text-[10px] font-black text-black/20 uppercase tracking-widest tracking-widest">{new Date(selectedSubmission.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedSubmission(null)} className="w-16 h-16 rounded-full bg-[#F8F9FA] hover:bg-black hover:text-white transition-all flex items-center justify-center">
                  <XCircle size={32} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-12 space-y-12 scollbar-hide">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <ModalStat label="Final Grade" value={`${selectedSubmission.aiScore || selectedSubmission.score}%`} icon={<TrendingUp size={24} />} />
                  <ModalStat label="Questions" value={selectedSubmission.totalQuestions} icon={<Database size={24} />} />
                  <ModalStat label="Voice Samples" value={selectedSubmission.answers.filter(a => a.type === 'voice').length} icon={<Mic2 size={24} />} />
                </div>

                <div className="space-y-8">
                  <label className="text-[10px] font-black uppercase tracking-widest text-black/20 flex items-center gap-3">
                    <MessageSquare size={16} /> Detailed Interrogation Results
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedSubmission.answers.map((ans, idx) => (
                      <div key={idx} className={`p-10 rounded-[32px] border ${ans.isCorrect ? 'bg-black text-white' : 'bg-[#F8F9FA] border-black/5 text-black'} flex flex-col gap-6`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${ans.isCorrect ? 'bg-white/20' : 'bg-black text-white'}`}>{idx + 1}</div>
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{ans.type}</span>
                          </div>
                          {ans.isCorrect ? <CheckCircle2 size={20} /> : <XCircle size={20} className="text-black/20" />}
                        </div>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-30">Raw Response</span>
                            <p className="text-xl font-bold tracking-tight">{ans.userAnswer || "[No Audio Captured]"}</p>
                          </div>
                          {ans.transcript && (
                            <div className={`p-6 rounded-2xl italic font-bold text-sm ${ans.isCorrect ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/5'}`}>
                              "{ans.transcript}"
                            </div>
                          )}
                          {ans.audioUrl && (
                            <div className="pt-2">
                              <audio src={ans.audioUrl} controls className={`w-full h-8 ${ans.isCorrect ? 'invert' : ''}`} />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TabButton = ({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon: any }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-8 py-4 rounded-[20px] text-sm font-black tracking-tight transition-all ${active ? 'bg-black text-white shadow-2xl shadow-black/10' : 'text-black/40 hover:text-black hover:bg-white'
      }`}
  >
    {icon}
    {label}
    {active && (
      <motion.div layoutId="t-indicator" className="w-1 h-1 bg-white rounded-full ml-1" />
    )}
  </button>
);

const ModalStat = ({ label, value, icon }: { label: string, value: any, icon: any }) => (
  <div className="bg-[#F8F9FA] p-8 rounded-[32px] border border-black/5 flex items-center gap-6 group hover:bg-black transition-all">
    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-black/60 group-hover:text-black">
      {icon}
    </div>
    <div className="flex flex-col">
      <span className="text-[10px] font-black uppercase tracking-widest text-black/30 group-hover:text-white/40">{label}</span>
      <span className="text-3xl font-black tracking-tighter group-hover:text-white">{value}</span>
    </div>
  </div>
);

// Need to import GraduationCap from lucide-react (was missing in previous turn's analyzed list)
import { GraduationCap } from 'lucide-react';
