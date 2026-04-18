"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  FileText, 
  RefreshCw, 
  Sparkles,
  X,
  Play,
  ArrowRight,
  Edit3,
  Settings2,
  History
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
             <div className="flex flex-col items-center justify-center py-6 text-center border border-outline-variant/10 rounded-xl bg-surface-container-high/20">
                <p className="text-xs font-bold text-outline">No portfolios active</p>
                <p className="text-[10px] text-outline/50">Upload a student document to begin.</p>
              </div>
          </div>
        </div>
      </section>

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
              <button className="p-2 rounded-lg bg-surface-container-highest text-primary hover:bg-primary hover:text-on-primary transition-all opacity-50 cursor-not-allowed">
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center py-16 text-center">
               <p className="text-sm font-bold text-outline uppercase tracking-widest">Awaiting Analysis</p>
               <p className="text-xs text-outline/50 mt-1 max-w-[200px] mx-auto">Automated insights will populate here once a portfolio is processed.</p>
            </div>
            <button className="w-full bg-primary text-on-primary font-bold py-4 rounded-xl shadow-lg opacity-30 cursor-not-allowed">
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
    <div className="space-y-8 text-center py-32">
       <div className="w-20 h-20 bg-surface-container-low rounded-full flex items-center justify-center mx-auto mb-6 border border-outline-variant/10">
          <History className="w-10 h-10 text-outline/30" />
       </div>
       <h3 className="text-3xl font-black text-on-surface tracking-tighter">History Empty</h3>
       <p className="text-outline max-w-sm mx-auto">Once examinations are completed and scores are committed, they will be archived here for review.</p>
    </div>
  );
};

