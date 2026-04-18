import React, { useState, useRef, useEffect } from 'react';
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
  ChevronDown,
  Loader2,
  AlertCircle,
  Sparkles,
  Save,
  User
} from 'lucide-react';

type Section = 'upload' | 'rubrics' | 'history';

interface GradingHistoryItem {
  _id: string;
  studentName: string;
  assignmentTitle: string;
  score: number;
  date: string;
  rawOutput: string;
}

interface RubricData {
  constraints: string;
  referenceDocuments: Array<{ name: string; size: number; uploadDate: string }>;
}

export const AssignmentsView = () => {
  const [activeSection, setActiveSection] = useState<Section>('upload');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [historyUpdated, setHistoryUpdated] = useState(0);

  const refreshHistory = () => setHistoryUpdated(prev => prev + 1);

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="space-y-2">
          <span className="text-tertiary uppercase tracking-[0.2em] text-xs font-bold font-label">Curriculum Management</span>
          <h1 className="text-5xl font-black tracking-tighter text-on-surface">Assignment Hub</h1>
          <p className="text-outline/80 max-w-xl text-lg">
            Upload student submissions and generate complex pedagogical branching with NotebookLM.
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
          {activeSection === 'upload' && <UploadInterface onResult={setAiResult} onComplete={refreshHistory} />}
          {activeSection === 'rubrics' && <RubricInterface />}
          {activeSection === 'history' && <GradingHistoryInterface key={historyUpdated} />}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {aiResult && (
          <motion.section 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
               <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                 <Sparkles className="w-5 h-5" />
                 NotebookLM Generation Output
               </h3>
               <button 
                 onClick={() => setAiResult(null)}
                 className="text-xs font-bold text-outline hover:text-on-surface transition-colors"
               >
                 Clear Output
               </button>
            </div>
            <div className="bg-surface-container-highest/30 border border-primary/20 rounded-2xl p-8 font-mono text-xs overflow-auto max-h-[500px] scrollbar-thin scrollbar-thumb-primary/20 leading-relaxed shadow-inner">
               <pre className="text-on-surface-variant">
                 {aiResult}
               </pre>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
};

const UploadInterface = ({ onResult, onComplete }: { onResult: (res: string) => void; onComplete: () => void }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [studentName, setStudentName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (!studentName.trim()) {
      setError("Please enter a student name before uploading.");
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    for (const file of Array.from(files)) {
      formData.append('files', file);
    }
    formData.append('studentName', studentName);

    try {
      const res = await fetch('/api/generate-mcq', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate content');
      
      onResult(data.text);
      onComplete(); // Refresh history
      setStudentName("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

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
        <div className="bg-surface-container-low p-8 rounded-2xl border border-surface-container-high shadow-inner">
          <div className="flex items-center gap-4 mb-2">
            <User className="w-5 h-5 text-primary" />
            <label className="text-xs font-bold text-outline uppercase tracking-widest">Student Information</label>
          </div>
          <input 
            type="text" 
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="Enter Student Full Name..."
            className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-6 py-4 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold"
          />
        </div>

        <input 
          type="file" 
          multiple 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept=".pdf,.docx,.txt"
        />
        <div 
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`bg-surface-container-low border-2 border-dashed rounded-2xl p-16 flex flex-col items-center justify-center text-center space-y-6 group transition-all cursor-pointer ${
            isUploading ? 'border-primary/20 cursor-wait' : 'border-outline-variant/30 hover:bg-surface-container-low/50 hover:border-primary/40'
          }`}
        >
          <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-inner ${
            isUploading ? 'bg-primary/5' : 'bg-primary/10 group-hover:scale-110'
          }`}>
            {isUploading ? <Loader2 className="text-primary w-10 h-10 animate-spin" /> : <Upload className="text-primary w-10 h-10" />}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-on-surface">
              {isUploading ? 'Connecting to NotebookLM...' : 'Batch Upload Submissions'}
            </h3>
            <p className="text-outline text-sm mt-2 max-w-sm mx-auto">
              {isUploading ? 'Automating Google NotebookLM interface over CDP. This may take 30-60 seconds...' : 'Select student files (PDF, DOCX) to generate real-time pedagogical branching logic.'}
            </p>
          </div>
          {!isUploading && (
            <button className="bg-surface-container-highest px-8 py-3 rounded-lg text-sm font-bold text-on-surface hover:text-primary transition-all border border-outline-variant/20 inner-glow">
              Browse Support Documents
            </button>
          )}
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="bg-error/10 border border-error/20 p-4 rounded-xl flex items-center gap-3 text-error text-sm font-bold"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </motion.div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
          {types.map((t) => (
            <button 
              key={t.label} 
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="bg-surface-container-low p-6 rounded-xl border border-surface-container-high hover:border-primary/20 transition-all flex flex-col items-center gap-3 group disabled:opacity-50"
            >
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
            Session Overview
          </h3>
          <div className="space-y-4">
             <div className="flex flex-col items-center justify-center py-6 text-center">
                <p className="text-xs font-bold text-outline uppercase tracking-wider mb-1">Active Pipeline</p>
                <p className="text-[10px] text-outline/50">NotebookLM is ready to process.</p>
              </div>
          </div>
        </div>
        <button className="w-full bg-surface-container-highest py-4 rounded-xl text-sm font-bold hover:text-primary transition-all inner-glow flex items-center justify-center gap-2 mt-8">
          Help & Documentation
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const RubricInterface = () => {
  const [data, setData] = useState<RubricData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch('/api/assignments/rubrics')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setIsLoading(false);
      });
  }, []);

  const handleSave = async () => {
    if (!data) return;
    setIsSaving(true);
    try {
      await fetch('/api/assignments/rubrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-primary w-10 h-10" /></div>;

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
              Upload the base documents that will determine how students are graded.
            </p>
          </div>

          <div className="space-y-4">
            {data?.referenceDocuments?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-outline-variant/10 rounded-2xl text-center">
                 <p className="text-sm font-bold text-outline">No reference documents</p>
                 <p className="text-xs text-outline/50 mt-1">Upload a syllabus or key to start.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {data?.referenceDocuments.map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-surface-container rounded-xl border border-outline-variant/10">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-primary" />
                      <span className="text-sm font-bold">{doc.name}</span>
                    </div>
                    <span className="text-[10px] font-bold text-outline">{(doc.size / 1024).toFixed(1)} KB</span>
                  </div>
                ))}
              </div>
            )}
            
            <button className="w-full border-2 border-dashed border-outline-variant/20 py-8 rounded-xl flex flex-col items-center justify-center gap-2 text-outline hover:text-primary hover:border-primary/40 transition-all group opacity-50 cursor-not-allowed">
              <Plus className="w-8 h-8 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-sm">Add Reference Document (Static)</span>
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
            Provide additional instructions for the evaluation engine.
          </p>
        </div>

        <textarea 
          value={data?.constraints || ""}
          onChange={(e) => setData({ ...data!, constraints: e.target.value })}
          className="flex-1 w-full bg-surface-container-low border border-outline-variant/20 rounded-xl p-6 text-on-background text-sm leading-relaxed focus:ring-1 focus:ring-primary/20 transition-all resize-none shadow-inner"
          placeholder="e.g., 'Ensure citations follow Harvard style strictly...'"
        />
        
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="mt-8 bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold py-4 rounded-xl shadow-xl shadow-primary/10 hover:brightness-110 active:scale-95 transition-all inner-glow flex items-center justify-center gap-2"
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {isSaving ? "Saving..." : "Save Constraints"}
        </button>
      </div>
    </div>
  );
};

const GradingHistoryInterface = () => {
  const [history, setHistory] = useState<GradingHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/assignments/history')
      .then(res => res.json())
      .then(data => {
        setHistory(data);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-primary w-10 h-10" /></div>;

  return (
    <div className="bg-surface-container-low rounded-2xl border border-surface-container-high overflow-hidden shadow-2xl">
      <div className="p-8 border-b border-outline-variant/10 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold">Grading Archive</h3>
          <p className="text-sm text-outline">Review and manually adjust auto-generated grades.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <input className="bg-surface-container px-4 py-2 pl-10 rounded-lg text-xs placeholder:text-outline border-none focus:ring-1 focus:ring-primary/20 outline-none" placeholder="Search..." />
            <FileSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline/50" />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        {history.length === 0 ? (
          <div className="p-20 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center">
              <FileSearch className="text-outline w-8 h-8" />
            </div>
            <div>
              <p className="text-lg font-bold text-on-surface">Archive Empty</p>
              <p className="text-sm text-outline">Assessments will appear here once graded.</p>
            </div>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-surface-container-highest/20 text-[10px] font-black uppercase tracking-[0.2em] text-outline">
              <tr>
                <th className="px-8 py-5">Student</th>
                <th className="px-6 py-5">Assignment</th>
                <th className="px-6 py-5">Date</th>
                <th className="px-6 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {history.map((row) => (
                <tr key={row._id} className="group hover:bg-surface-container-high/30 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                        {row.studentName.charAt(0)}
                      </div>
                      <span className="font-bold text-on-surface">{row.studentName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-sm text-outline font-medium">{row.assignmentTitle}</td>
                  <td className="px-6 py-6 text-sm text-outline">{new Date(row.date).toLocaleDateString()}</td>
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
        )}
      </div>
      
      <div className="bg-surface-container/30 px-8 py-4 flex justify-between items-center">
        <span className="text-xs text-outline font-bold">Total Records: {history.length}</span>
        <div className="flex gap-2">
          <button className="w-8 h-8 flex items-center justify-center rounded bg-surface-container-low border border-outline-variant/10 text-outline opacity-30 cursor-not-allowed" disabled>
            <ChevronDown className="w-4 h-4 rotate-90" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded bg-surface-container-low border border-outline-variant/10 text-outline opacity-30 cursor-not-allowed" disabled>
            <ChevronDown className="w-4 h-4 -rotate-90" />
          </button>
        </div>
      </div>
    </div>
  );
};

