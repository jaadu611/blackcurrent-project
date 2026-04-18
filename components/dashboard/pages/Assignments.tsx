"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  FileText, 
  Settings2, 
  History, 
  Edit3, 
  Play, 
  Download,
  Plus,
  ArrowRight,
  FileCheck,
  FileSearch,
  MessageSquareQuote,
  Trash2,
  ChevronDown
} from 'lucide-react';

type Section = 'upload' | 'rubrics' | 'history';

export const AssignmentsView = () => {
  const [activeSection, setActiveSection] = useState<Section>('upload');

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="space-y-2">
          <span className="text-tertiary uppercase tracking-[0.2em] text-xs font-bold font-label">Curriculum Management</span>
          <h1 className="text-5xl font-black tracking-tighter text-on-surface">Assignment Hub</h1>
          <p className="text-outline/80 max-w-xl text-lg">
            Upload student submissions, define your grading source of truth, and review assessment history.
          </p>
        </div>
        
        <div className="flex bg-surface-container-low p-1.5 rounded-xl border border-surface-container-high shadow-lg">
          {(['upload', 'rubrics', 'history'] as Section[]).map((s) => (
            <button
              key={s}
              onClick={() => setActiveSection(s)}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 capitalize ${
                activeSection === s 
                  ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' 
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {activeSection === 'upload' && <UploadInterface />}
          {activeSection === 'rubrics' && <RubricInterface />}
          {activeSection === 'history' && <GradingHistoryInterface />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const UploadInterface = () => {
  const types = [
    { label: 'Assignment', icon: FileCheck, color: 'text-primary' },
    { label: 'Test Paper', icon: FileSearch, color: 'text-tertiary' },
    { label: 'Report', icon: FileText, color: 'text-secondary' },
    { label: 'Presentation', icon: Play, color: 'text-primary-container' },
    { label: 'Essay', icon: MessageSquareQuote, color: 'text-on-tertiary-container' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
      <div className="md:col-span-8 space-y-8">
        <div className="bg-surface-container-low border-2 border-dashed border-outline-variant/30 rounded-2xl p-16 flex flex-col items-center justify-center text-center space-y-6 group hover:bg-surface-container-low/50 hover:border-primary/40 transition-all cursor-pointer">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
            <Upload className="text-primary w-10 h-10" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-on-surface">Batch Upload Submissions</h3>
            <p className="text-outline text-sm mt-2 max-w-sm mx-auto">
              Select multiple student files. The system will automatically categorize them based on content.
            </p>
          </div>
          <button className="bg-surface-container-highest px-8 py-3 rounded-lg text-sm font-bold text-on-surface hover:text-primary transition-all border border-outline-variant/20 inner-glow">
            Browse Documents
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
          {types.map((t) => (
            <button key={t.label} className="bg-surface-container-low p-6 rounded-xl border border-surface-container-high hover:border-primary/20 transition-all flex flex-col items-center gap-3 group">
              <t.icon className={`${t.color} w-8 h-8 group-hover:scale-110 transition-transform`} />
              <span className="text-xs font-bold tracking-tight text-on-surface">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="md:col-span-4 bg-surface-container-high rounded-2xl p-8 border border-primary/10 flex flex-col justify-between">
        <div className="space-y-6">
          <h3 className="text-xl font-bold border-b border-outline-variant/10 pb-4 flex items-center gap-2">
            <History className="w-5 h-5 text-tertiary" />
            Recent Activity
          </h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                <div>
                  <p className="text-sm font-bold text-on-surface">Exemplar Uploaded</p>
                  <p className="text-xs text-outline">Session Archive • 14 mins ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <button className="w-full bg-surface-container-highest py-4 rounded-xl text-sm font-bold hover:text-primary transition-all inner-glow flex items-center justify-center gap-2 mt-8">
          View All Uploads
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const RubricInterface = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
      <div className="md:col-span-7 space-y-8">
        <div className="bg-surface-container-low rounded-2xl p-8 border border-surface-container-high space-y-8">
          <div>
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <Settings2 className="text-tertiary w-6 h-6" />
              Source of Truth
            </h3>
            <p className="text-sm text-outline mt-2">
              Upload the base documents (Answer Keys, Reference Materials, or Sample Exemplars) that will determine how students are graded.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-6 bg-surface-container-highest/50 rounded-xl border border-outline-variant/20 flex items-center justify-between group hover:border-primary/30 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FileCheck className="text-primary w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-on-surface">Reference_Doc.pdf</p>
                  <p className="text-xs text-outline">Example Document • 2.4 MB</p>
                </div>
              </div>
              <button className="p-2 text-outline hover:text-error transition-colors"><Trash2 className="w-5 h-5" /></button>
            </div>
            
            <button className="w-full border-2 border-dashed border-outline-variant/20 py-8 rounded-xl flex flex-col items-center justify-center gap-2 text-outline hover:text-primary hover:border-primary/40 transition-all group">
              <Plus className="w-8 h-8 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-sm">Add Reference Document</span>
            </button>
          </div>
        </div>
      </div>

      <div className="md:col-span-5 bg-surface-container rounded-2xl p-8 shadow-2xl border border-surface-container-high flex flex-col h-full">
        <div className="mb-6 space-y-2">
          <div className="flex items-center gap-2">
            <Settings2 className="text-primary w-4 h-4" />
            <span className="text-xs font-bold tracking-widest uppercase text-primary">Personal Guidance</span>
          </div>
          <h3 className="text-xl font-bold text-on-surface">Grading Constraints</h3>
          <p className="text-xs text-outline leading-relaxed">
            Provide additional instructions for the evaluation engine. These prompts will be weighted heavily during the grading process.
          </p>
        </div>

        <textarea 
          className="flex-1 w-full bg-surface-container-low border border-outline-variant/20 rounded-xl p-6 text-on-background text-sm leading-relaxed focus:ring-1 focus:ring-primary/20 transition-all resize-none shadow-inner"
          placeholder="e.g., 'Ensure citations follow your institutional style strictly...'"
        />
        
        <button className="mt-8 bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold py-4 rounded-xl shadow-xl shadow-primary/10 hover:brightness-110 active:scale-95 transition-all inner-glow">
          Save Source of Truth
        </button>
      </div>
    </div>
  );
};

const GradingHistoryInterface = () => {
  return (
    <div className="bg-surface-container-low rounded-2xl border border-surface-container-high overflow-hidden shadow-2xl">
      <div className="p-8 border-b border-outline-variant/10 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold">Grading Archive</h3>
          <p className="text-sm text-outline">Review and manually adjust auto-generated grades.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <input className="bg-surface-container px-4 py-2 pl-10 rounded-lg text-xs placeholder:text-outline border-none focus:ring-1 focus:ring-primary/20 outline-none" placeholder="Search students..." />
            <FileSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline/50" />
          </div>
          <button className="p-2 bg-surface-container-highest rounded-lg text-outline">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-surface-container-highest/20 text-[10px] font-black uppercase tracking-[0.2em] text-outline">
            <tr>
              <th className="px-8 py-5">Student</th>
              <th className="px-6 py-5">Assignment</th>
              <th className="px-6 py-5">Score</th>
              <th className="px-6 py-5">Date</th>
              <th className="px-6 py-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {[
              { name: 'Student A', task: 'Seminar Essay', score: 92, date: 'Oct 14, 2023' },
              { name: 'Student B', task: 'Geometry Lab', score: 74, date: 'Oct 12, 2023' },
              { name: 'Student C', task: 'Physics Quiz', score: 88, date: 'Oct 11, 2023' },
              { name: 'Student D', task: 'Design Report', score: 95, date: 'Oct 10, 2023' },
            ].map((row, i) => (
              <tr key={i} className="group hover:bg-surface-container-high/30 transition-colors cursor-pointer">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant/20 flex items-center justify-center text-[10px] font-bold">
                      {row.name.charAt(row.name.length - 1)}
                    </div>
                    <span className="font-bold text-on-surface">{row.name}</span>
                  </div>
                </td>
                <td className="px-6 py-6 text-sm text-outline font-medium">{row.task}</td>
                <td className="px-6 py-6">
                  <div className="flex items-center gap-2">
                    <span className="text-primary font-black text-xl">{row.score}</span>
                    <span className="text-[10px] text-outline font-bold">/ 100</span>
                  </div>
                </td>
                <td className="px-6 py-6 text-sm text-outline">{row.date}</td>
                <td className="px-6 py-6 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-outline hover:text-primary transition-all bg-surface-container-highest rounded-lg"><Edit3 className="w-4 h-4" /></button>
                    <button className="p-2 text-outline hover:text-on-surface transition-all bg-surface-container-highest rounded-lg"><Download className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="bg-surface-container/30 px-8 py-4 flex justify-between items-center">
        <span className="text-xs text-outline font-bold">Page 1 of 1</span>
        <div className="flex gap-2">
          <button className="w-8 h-8 flex items-center justify-center rounded bg-surface-container-low border border-outline-variant/10 text-outline active:scale-90 transition-transform disabled:opacity-30" disabled>
            <ChevronDown className="w-4 h-4 rotate-90" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded bg-surface-container-low border border-outline-variant/10 text-outline active:scale-90 transition-transform disabled:opacity-30" disabled>
            <ChevronDown className="w-4 h-4 -rotate-90" />
          </button>
        </div>
      </div>
    </div>
  );
};
