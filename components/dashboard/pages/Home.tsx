"use client";

import React from 'react';
import { motion } from 'motion/react';
import { 
  Plus, 
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Calendar
} from 'lucide-react';
import { User as UserType } from '../types';

export const HomeView = ({ user }: { user: UserType }) => {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section>
        <div className="flex flex-col md:flex-row justify-between items-end gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <span className="inline-block text-tertiary tracking-[0.2em] font-bold text-xs uppercase font-label">WELCOME TO OSAMU</span>
            <h1 className="text-6xl font-black tracking-tighter text-on-surface mb-2">{user.name}</h1>
            <p className="text-xl text-outline/80 max-w-2xl leading-relaxed">
              Academic Lead at <span className="text-primary">{user.institution}</span>. 
              Your assessment cycle for Term 2 is now active.
            </p>
          </motion.div>
          
          <div className="flex gap-4">
            <div className="bg-surface-container-low px-6 py-4 rounded-2xl border border-surface-container-high flex flex-col items-center">
              <span className="text-[10px] font-bold text-tertiary uppercase tracking-widest">Active Viva</span>
              <span className="text-3xl font-black text-primary">04</span>
            </div>
            <div className="bg-surface-container-low px-6 py-4 rounded-2xl border border-surface-container-high flex flex-col items-center">
              <span className="text-[10px] font-bold text-tertiary uppercase tracking-widest">Graded</span>
              <span className="text-3xl font-black text-primary">128</span>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Bento Calendar Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
        {/* Sleek Monthly Overview */}
        <div className="lg:col-span-8 bg-surface-container-low rounded-3xl p-8 border border-surface-container-high shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8">
             <Calendar className="text-primary/10 w-40 h-40 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
          </div>

          <div className="relative z-10 flex flex-col h-full">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-2xl font-black text-on-surface">Timeline Archive</h2>
                <p className="text-sm text-outline">Nov 18 — Nov 25, 2023</p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-surface-container-high rounded-full transition-colors"><ChevronLeft className="w-5 h-5 text-outline" /></button>
                <button className="p-2 hover:bg-surface-container-high rounded-full transition-colors"><ChevronRight className="w-5 h-5 text-outline" /></button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-4 mb-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <span key={day} className="text-[10px] font-bold text-tertiary/40 uppercase tracking-[0.2em] text-center">{day}</span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-4 flex-1">
              {Array.from({ length: 14 }).map((_, i) => {
                const day = i + 18;
                const isToday = i === 1;
                return (
                  <motion.div 
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      isToday 
                        ? 'bg-primary text-on-primary shadow-xl shadow-primary/20' 
                        : 'bg-surface-container-highest/20 hover:bg-surface-container-high border border-outline-variant/10 hover:border-primary/30'
                    }`}
                  >
                    <span className={`text-xl font-black tracking-tighter ${isToday ? '' : 'text-on-surface'}`}>{day}</span>
                    {i % 4 === 0 && !isToday && <div className="w-1 h-1 rounded-full bg-tertiary" />}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Immediate Events Timeline */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface-container-high rounded-3xl p-8 border border-primary/10 flex-1 h-full">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-bold text-on-surface">Daily Pulse</h3>
              <button className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-container-highest transition-colors">
                <Plus className="w-4 h-4 text-primary" />
              </button>
            </div>

            <div className="space-y-6">
              {[
                { time: '09:00 AM', event: 'Senior Thesis Review', type: 'viva', color: 'bg-primary' },
                { time: '11:30 AM', event: 'Lab Report Grading', type: 'assignment', color: 'bg-tertiary' },
                { time: '02:00 PM', event: 'Oral Exam - Literature', type: 'viva', color: 'bg-primary' },
                { time: '04:45 PM', event: 'Batch Upload Sync', type: 'system', color: 'bg-outline-variant' },
              ].map((item, index) => (
                <div key={index} className="flex gap-4 group">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${item.color} shadow-lg ring-4 ring-background group-hover:scale-125 transition-transform`} />
                    {index !== 3 && <div className="w-px h-full bg-outline-variant/20 my-1" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-xs font-bold text-outline uppercase tracking-wider mb-1">{item.time}</p>
                    <p className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">{item.event}</p>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-8 bg-surface-container-highest/50 border border-outline-variant/10 py-3 rounded-xl text-xs font-bold text-on-surface hover:bg-surface-container-highest transition-all flex items-center justify-center gap-2">
              Open Full Scheduler
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
