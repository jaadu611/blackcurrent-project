"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  ArrowRight,
  ShieldCheck,
  History,
  Trash2,
  Lock,
  Unlock,
  GraduationCap
} from 'lucide-react';

interface RubricConfig {
  topic: string;
  date: string;
  type: string;
  prompt: string;
  isReady: boolean;
  files: File[];
}

export const AutograderView = ({ user }: { user: any }) => {
  const [config, setConfig] = useState<RubricConfig>({
    topic: '',
    date: new Date().toISOString().split('T')[0],
    type: 'assignment',
    prompt: '',
    isReady: false,
    files: []
  });

  const [studentFiles, setStudentFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<{success: boolean; text?: string; error?: string} | null>(null);
  const [activeTab, setActiveTab] = useState<'config' | 'upload' | 'history'>('config');
  const [history, setHistory] = useState<any[]>([]);

  const rubricFileRef = useRef<HTMLInputElement>(null);
  const studentFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Fetch History
    fetch('/api/assignments/history')
      .then(res => res.json())
      .then(data => setHistory(Array.isArray(data) ? data : []))
      .catch(err => console.error("History fetch error:", err));
    
    // Fetch Existing Rubric Settings
    fetch('/api/assignments/rubrics')
      .then(res => res.json())
      .then(data => {
        if (data && data.constraints) {
          setConfig(prev => ({
            ...prev,
            prompt: data.constraints,
            // Note: We don't fetch actual files back from the server in this MVP
          }));
        }
      })
      .catch(err => console.error("Rubric fetch error:", err));
  }, []);

  const handleRubricSave = async () => {
    if (config.topic && config.date && config.prompt && config.files.length > 0) {
      if (config.files.length > 9) {
        alert("Maximum 9 source files allowed for the Assessment Guide.");
        return;
      }

      try {
        // Save to existing rubrics API
        await fetch('/api/assignments/rubrics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
             constraints: config.prompt,
             referenceDocuments: config.files.map(f => ({
                name: f.name,
                size: f.size,
                uploadDate: new Date()
             }))
          })
        });

        setConfig({ ...config, isReady: true });
        setActiveTab('upload');
      } catch (err) {
        console.error("Rubric save failed:", err);
        alert("Failed to persist Assessment Guide to database.");
      }
    }
  };

  const handleStudentUpload = async () => {
    if (!config.isReady || studentFiles.length === 0) return;
    setIsProcessing(true);
    setResults(null);

    const formData = new FormData();
    config.files.forEach(f => formData.append('rubricFiles', f));
    studentFiles.forEach(f => formData.append('studentFiles', f));
    formData.append('prompt', config.prompt);
    formData.append('topic', config.topic);
    formData.append('date', config.date);

    try {
      const res = await fetch('/api/autograder', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setResults({ success: true, text: data.result });
        setActiveTab('history');
      } else {
        setResults({ success: false, error: data.error || 'Evaluation pipeline failed.' });
      }
    } catch (err: any) {
      setResults({ success: false, error: 'Network error: Failed to reach the evaluation server.' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40">Assessment Pipeline</span>
          <h1 className="text-5xl font-black tracking-tighter">Autograder Hub</h1>
        </div>
        
        <div className="flex bg-white p-1.5 rounded-3xl border border-black/5 shadow-xl shadow-black/5">
          {[
            { id: 'config', label: '1. Assessment Guide', icon: ShieldCheck },
            { id: 'upload', label: '2. Submission Batch', icon: GraduationCap },
            { id: 'history', label: 'Records', icon: History }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              disabled={tab.id === 'upload' && !config.isReady}
              className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id 
                  ? 'bg-black text-white shadow-xl shadow-black/20' 
                  : 'text-black/40 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <AnimatePresence mode="wait">
        {activeTab === 'config' && (
          <motion.div 
            key="config"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            <div className="lg:col-span-7 space-y-8">
               <div className="bg-white rounded-[40px] p-10 border border-black/5 shadow-2xl shadow-black/5 space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-4">Topic / Exam Name</label>
                        <input 
                          value={config.topic}
                          onChange={e => setConfig({...config, topic: e.target.value, isReady: false})}
                          placeholder="Ex: Midterm Calculus" 
                          className="w-full bg-black/5 border-none rounded-2xl px-6 py-4 text-sm font-black focus:ring-2 focus:ring-black/5 transition-all outline-none" 
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-4">Assignment Date</label>
                        <input 
                          type="date"
                          value={config.date}
                          onChange={e => setConfig({...config, date: e.target.value, isReady: false})}
                          className="w-full bg-black/5 border-none rounded-2xl px-6 py-4 text-sm font-black focus:ring-2 focus:ring-black/5 transition-all outline-none" 
                        />
                     </div>
                  </div>

                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-widest text-black/20 ml-4 flex justify-between">
                       <span>Source Documents (Max 9)</span>
                       <span className={config.files.length > 9 ? "text-red-500" : ""}>{config.files.length}/9 Selected</span>
                     </label>
                     <div 
                      onClick={() => rubricFileRef.current?.click()}
                      className={`border-2 border-dashed rounded-[32px] p-12 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer group ${
                        config.files.length > 9 ? 'border-red-500/20 bg-red-50/10' : 'border-black/10 bg-[#F8F9FA] hover:bg-black/5 hover:border-black/20'
                      }`}
                     >
                        <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                           <Upload className="text-black/40" size={32} />
                        </div>
                        <p className="text-sm font-black tracking-tight">{config.files.length > 0 ? `${config.files.length} Files Selected` : 'Click to bind source truth'}</p>
                        <input 
                          type="file" 
                          ref={rubricFileRef} 
                          multiple 
                          className="hidden" 
                          onChange={e => setConfig({...config, files: Array.from(e.target.files || []), isReady: false})}
                        />
                     </div>
                  </div>
               </div>
            </div>

            <div className="lg:col-span-5 flex flex-col">
               <div className="bg-black text-white rounded-[40px] p-10 flex flex-col flex-1 relative overflow-hidden">
                  <Sparkles className="absolute top-10 right-10 text-white/10" size={120} />
                  <div className="relative z-10 space-y-8 flex flex-col h-full uppercase tracking-tighter">
                     <div>
                        <h3 className="text-2xl font-black tracking-tight italic">Assessment Guide</h3>
                        <p className="text-white/40 text-xs font-bold mt-2 leading-relaxed">Instruct the processor on specific nuances, marking schemes, or key concepts to evaluate.</p>
                     </div>
                     <textarea 
                        value={config.prompt}
                        onChange={e => setConfig({...config, prompt: e.target.value, isReady: false})}
                        className="flex-1 w-full bg-white/10 border-none rounded-3xl p-6 text-sm font-medium focus:ring-2 focus:ring-white/10 transition-all outline-none resize-none placeholder:text-white/20"
                        placeholder="Ex: Focus on the application of the Keynesian model. Deduct 2 points for missing bibliography..."
                     />
                     <button 
                        onClick={handleRubricSave}
                        className="w-full bg-white text-black py-5 rounded-[24px] text-xs font-black uppercase tracking-widest hover:brightness-90 transition-all flex items-center justify-center gap-3"
                     >
                        Confirm Source Truth
                        <ArrowRight size={16} />
                     </button>
                  </div>
               </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'upload' && (
          <motion.div 
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="bg-white rounded-[40px] p-12 border border-black/5 shadow-2xl shadow-black/5 flex flex-col items-center justify-center text-center gap-8 relative overflow-hidden">
               {!config.isReady && (
                 <div className="absolute inset-0 bg-white/60 backdrop-blur-md z-10 flex flex-col items-center justify-center gap-4">
                    <Lock size={48} className="text-black/20" />
                    <p className="text-sm font-black tracking-widest uppercase opacity-40">Setup Assessment Guide to Unlock Upload</p>
                 </div>
               )}
               
               <div className="flex flex-col items-center gap-4">
                  <div className="w-24 h-24 bg-black rounded-[32px] flex items-center justify-center shadow-2xl shadow-black/20 group relative overflow-hidden">
                     <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                     {isProcessing ? <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" /> : <Upload className="text-white relative z-10" size={32} />}
                  </div>
                  <div>
                    <h2 className="text-3xl font-black tracking-tighter">Student Submission Batch</h2>
                    <p className="text-black/40 text-sm font-bold mt-1 tracking-tight">Upload student assignments for the integrated evaluator.</p>
                  </div>
               </div>

               <div className="flex items-center gap-4 flex-wrap justify-center">
                  <div className="bg-black/5 px-6 py-3 rounded-full flex items-center gap-2">
                     <CheckCircle2 size={14} className="text-black/40" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-black/60">Topic: {config.topic}</span>
                  </div>
                  <div className="bg-black/5 px-6 py-3 rounded-full flex items-center gap-2">
                     <Unlock size={14} className="text-black/40" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-black/60">Guide Connected</span>
                  </div>
               </div>

               <input 
                type="file" 
                ref={studentFileRef} 
                multiple 
                className="hidden" 
                onChange={e => setStudentFiles(Array.from(e.target.files || []))}
               />
               
               <button 
                onClick={() => studentFileRef.current?.click()}
                disabled={isProcessing}
                className="bg-black text-white px-10 py-5 rounded-[24px] text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-black/20 disabled:opacity-50 disabled:scale-100"
               >
                 Select Student Files ({studentFiles.length})
               </button>

               {results?.error && (
                  <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-widest bg-red-50 p-4 rounded-2xl">
                    <AlertCircle size={14} />
                    {results.error}
                  </motion.div>
               )}

               {studentFiles.length > 0 && !isProcessing && (
                 <motion.button 
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   onClick={handleStudentUpload}
                   className="flex items-center gap-3 text-black font-black uppercase tracking-[0.2em] text-[10px] group"
                 >
                   Start Evaluation Pipeline
                   <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                 </motion.button>
               )}
            </div>
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div 
            key="history"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[40px] border border-black/5 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.03)] overflow-hidden"
          >
            <div className="p-10 border-b border-black/5 flex justify-between items-center bg-[#F8F9FA]/50">
               <div>
                  <h3 className="text-2xl font-black tracking-tight">Grading Archive</h3>
                  <p className="text-xs font-bold text-black/40 uppercase tracking-widest mt-1">Cross-Reference & Export</p>
               </div>
               <div className="flex gap-4">
                  <button onClick={() => setResults(null)} className="text-[10px] font-black uppercase tracking-widest text-black/40 hover:text-black transition-colors">Clear Latest Result</button>
               </div>
            </div>

            <div className="p-10">
               {results?.text && (
                 <div className="mb-10 space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-4 italic">Latest Result</label>
                    <div className="bg-black text-white rounded-[32px] p-10 font-mono text-sm leading-relaxed selectable-text whitespace-pre-wrap overflow-auto max-h-[400px]">
                        {results.text}
                    </div>
                 </div>
               )}

               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-[#F8F9FA] text-[10px] font-black uppercase tracking-widest text-black/40">
                       <tr>
                         <th className="px-6 py-4">Student/Batch</th>
                         <th className="px-6 py-4">Topic</th>
                         <th className="px-6 py-4">Score</th>
                         <th className="px-6 py-4">Date</th>
                         <th className="px-6 py-4 text-right">Action</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                       {history.map((record) => (
                         <tr key={record._id} className="group hover:bg-black/[0.01] transition-colors">
                           <td className="px-6 py-6 font-bold text-sm tracking-tight">{record.studentName}</td>
                           <td className="px-6 py-6 text-sm text-black/60">{record.assignmentTitle}</td>
                           <td className="px-6 py-6">
                              <span className="bg-black/5 px-3 py-1 rounded-full text-[10px] font-black">{record.score}%</span>
                           </td>
                           <td className="px-6 py-6 text-xs text-black/40">{new Date(record.date).toLocaleDateString()}</td>
                           <td className="px-6 py-6 text-right">
                              <button 
                                onClick={() => setResults({ success: true, text: record.rawOutput })}
                                className="text-[10px] font-black uppercase tracking-widest border border-black/10 px-4 py-2 rounded-xl hover:bg-black hover:text-white transition-all"
                              >
                                View Detailed
                              </button>
                           </td>
                         </tr>
                       ))}
                       {history.length === 0 && !results?.text && (
                         <tr>
                           <td colSpan={5} className="py-20">
                             <div className="flex flex-col items-center justify-center text-center gap-4">
                                <AlertCircle className="text-black/10" size={40} />
                                <div>
                                  <h4 className="text-xl font-bold tracking-tight">Archive Empty</h4>
                                  <p className="text-black/40 text-sm font-medium mt-1">Submit assignments to populate research data.</p>
                                </div>
                             </div>
                           </td>
                         </tr>
                       )}
                    </tbody>
                 </table>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
