
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Settings, 
  RefreshCw, 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  CheckCircle2, 
  Sparkles,
  Timer,
  Bookmark,
  X,
  PlusCircle,
  Play,
  ArrowRight,
  Edit3,
  Settings2
} from 'lucide-react';


type VivaTab = 'session' | 'history';

export const VivaVoceView = () => {
  const [activeTab, setActiveTab] = useState<VivaTab>('session');

  return (
    <div className="space-y-12 pb-12">
      <header>
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-tertiary uppercase tracking-[0.15em] text-xs font-bold mb-3 block">Examination Module</span>
            <h1 className="text-5xl font-extrabold tracking-tighter text-on-background leading-none">Viva-Voce Hub</h1>
          </motion.div>
          
          <div className="flex bg-surface-container-low p-1.5 rounded-xl border border-surface-container-high shadow-lg">
            {(['session', 'history'] as VivaTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 capitalize ${
                  activeTab === tab 
                    ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' 
                    : 'text-outline hover:text-on-surface'
                }`}
              >
                {tab === 'session' ? 'Active Hub' : 'Grading History'}
              </button>
            ))}
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.div
           key={activeTab}
           initial={{ opacity: 0, x: -10 }}
           animate={{ opacity: 1, x: 0 }}
           exit={{ opacity: 0, x: 10 }}
           transition={{ duration: 0.3 }}
        >
          {activeTab === 'session' ? <VivaSessionInterface /> : <VivaHistoryInterface />}
        </motion.div>
      </AnimatePresence>

      {/* FAB */}
      {activeTab === 'session' && (
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-10 right-10 w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-2xl flex items-center justify-center group z-50 inner-glow"
        >
          <Play className="w-8 h-8 ml-1" fill="currentColor" />
          <span className="absolute right-20 bg-surface-container-highest text-on-background px-4 py-2 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity shadow-xl border border-primary/20 whitespace-nowrap">
            Start New Viva
          </span>
        </motion.button>
      )}
    </div>
  );
};

const VivaSessionInterface = () => {
  return (
    <div className="grid grid-cols-12 gap-8">
      {/* Portfolio Upload Zone */}
      <section className="col-span-12 lg:col-span-5 flex flex-col space-y-6">
        <div className="bg-surface-container-low rounded-2xl p-8 h-full border border-surface-container-high">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-primary mb-2">Portfolio Submission</h2>
            <p className="text-on-surface-variant text-sm">Upload student work for contextual analysis and question generation.</p>
          </div>
          
          <div className="border-2 border-dashed border-outline-variant/30 rounded-xl p-12 flex flex-col items-center justify-center space-y-4 bg-surface-container-lowest/50 group hover:bg-surface-container-lowest hover:border-primary/40 transition-all duration-300 cursor-pointer">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="text-primary w-8 h-8" />
            </div>
            <div className="text-center">
              <p className="font-bold text-on-background">Drag & drop files here</p>
              <p className="text-xs text-on-surface-variant mt-1">Supports PDF, DOCX, JPEG, and PNG</p>
            </div>
            <button className="mt-4 text-xs font-bold text-tertiary uppercase tracking-widest bg-tertiary/10 px-4 py-2 rounded-full hover:bg-tertiary/20 transition-colors">
              Browse Files
            </button>
          </div>

          <div className="mt-8 space-y-3">
            <div className="flex items-center p-3 bg-surface-container-high rounded-xl border border-surface-container-highest/30 group">
              <FileText className="text-primary-container w-5 h-5 mr-3" />
              <div className="flex-1">
                <p className="text-xs font-bold text-on-surface">structural_thesis.pdf</p>
                <p className="text-[10px] text-on-surface-variant">12.4 MB • Complete</p>
              </div>
              <X className="text-error/40 group-hover:text-error w-4 h-4 cursor-pointer hover:scale-110 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* Question Generation */}
      <section className="col-span-12 lg:col-span-7 flex flex-col space-y-8">
        <div className="bg-surface-container rounded-2xl p-8 shadow-2xl border border-surface-container-high">
          <div className="flex justify-between items-start mb-10">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="text-tertiary w-4 h-4" fill="currentColor" />
                <span className="text-tertiary text-xs font-bold tracking-[0.2em] uppercase">Smart Assistant</span>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tighter text-on-background">Generated Questions</h2>
            </div>
            <div className="flex space-x-2">
              <button className="p-2 rounded-lg bg-surface-container-highest text-primary hover:bg-primary hover:text-on-primary transition-all">
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {[
              { 
                label: 'Conceptual Inquiry • Q 01', 
                text: 'How does your material palette reinforce sustainability?',
                tagText: '5-min Discussion',
                metaText: 'Architecture'
              },
              { 
                label: 'Technical Inquiry • Q 02', 
                text: 'Identify structural tension points in the cantilever.',
                tagText: '8-min Discussion',
                metaText: 'Engineering'
              }
            ].map((q, i) => (
              <div key={i} className="bg-surface-container-lowest p-6 rounded-xl border border-surface-container-high hover:border-primary/20 transition-all">
                <label className="block text-[10px] font-bold text-tertiary uppercase tracking-widest mb-2">{q.label}</label>
                <p className="text-lg font-medium text-on-background leading-relaxed">{q.text}</p>
                <div className="mt-4 flex items-center space-x-4">
                  <span className="px-2 py-1 bg-surface-container-highest rounded text-[10px] font-bold text-outline uppercase tracking-wider">{q.tagText}</span>
                  <span className="px-2 py-1 bg-surface-container-highest rounded text-[10px] font-bold text-outline uppercase tracking-wider">{q.metaText}</span>
                </div>
              </div>
            ))}
            <button className="w-full bg-primary text-on-primary font-bold py-4 rounded-xl shadow-lg hover:brightness-110 transition-all">
              Initialize Final Session Guide
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

const VivaHistoryInterface = () => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {[
          { name: 'Marcus Thorne', date: 'Oct 14, 2023', score: 92, duration: '24m' },
          { name: 'Julianne V. Smith', date: 'Oct 12, 2023', score: 85, duration: '18m' },
        ].map((record, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -4 }}
            className="bg-surface-container-low rounded-2xl border border-surface-container-high overflow-hidden shadow-xl"
          >
            <div className="p-8 border-b border-outline-variant/5">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <img src={`https://picsum.photos/seed/viva${i}/100/100`} className="w-14 h-14 rounded-full border-2 border-primary/20" alt="" referrerPolicy="no-referrer" />
                  <div>
                    <h3 className="text-2xl font-bold font-headline">{record.name}</h3>
                    <p className="text-sm text-outline">{record.date} • {record.duration} Recorded</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-black text-primary tracking-tighter">{record.score}</p>
                  <p className="text-[10px] uppercase font-bold text-tertiary tracking-widest">Final Scored Grade</p>
                </div>
              </div>

              {/* Voice Playback Simulation */}
              <div className="bg-surface-container-lowest p-6 rounded-2xl flex items-center gap-6 border border-outline-variant/10 shadow-inner">
                <button className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-lg hover:scale-105 transition-all active:scale-95">
                  <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
                </button>
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-bold text-outline">08:42 / 24:00</span>
                    <Settings2 className="w-3 h-3 text-outline/50" />
                  </div>
                  <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden relative">
                    <div className="absolute inset-0 flex items-center gap-1.5 px-1">
                      {Array.from({ length: 40 }).map((_, j) => (
                        <div key={j} className="flex-1 bg-primary/20 h-full rounded-full" />
                      ))}
                    </div>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '40%' }}
                      className="h-full bg-primary relative z-10" 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 grid grid-cols-3 gap-6 bg-surface-container-highest/10">
              <div>
                <span className="text-[10px] uppercase font-bold text-outline tracking-widest block mb-2">Technical Depth</span>
                <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-tertiary w-3/4" />
                </div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-outline tracking-widest block mb-2">Reflective Log</span>
                <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[90%]" />
                </div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-outline tracking-widest block mb-2">Articulation</span>
                <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-secondary w-1/2" />
                </div>
              </div>
            </div>

            <div className="px-8 py-4 bg-surface-container transition-colors hover:bg-surface-bright flex justify-between items-center border-t border-outline-variant/10">
              <button className="text-xs font-bold text-primary flex items-center gap-2 hover:underline">
                View Full Transcription <ArrowRight className="w-3 h-3" />
              </button>
              <button className="p-2 text-outline hover:text-primary transition-colors hover:bg-primary/10 rounded-lg">
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
