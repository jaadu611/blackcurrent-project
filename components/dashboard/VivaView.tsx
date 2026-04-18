"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic2, 
  History, 
  ChevronRight, 
  Play, 
  MessageSquare, 
  User,
  Calendar,
  Volume2,
  FileSearch,
  ArrowLeft
} from 'lucide-react';

interface VivaSession {
  id: string;
  topic: string;
  className: string;
  dueDate: string;
  studentCount: number;
}

interface StudentPerformance {
  id: string;
  name: string;
  questions: { q: string; a: string }[];
  audioUrl: string;
}

export const VivaView = ({ user }: { user: any }) => {
  const [selectedSession, setSelectedSession] = useState<VivaSession | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentPerformance | null>(null);

  const sessions: VivaSession[] = [
    { id: '1', topic: 'Economics Viva - Term 2', className: 'Batch A - Final Year', dueDate: '2026-04-10', studentCount: 24 },
    { id: '2', topic: 'Macro Analysis Oral Exam', className: 'Honors Research Group', dueDate: '2026-04-15', studentCount: 12 },
  ];

  const studentData: StudentPerformance[] = [
    { 
      id: 's1', 
      name: 'Aditya Sharma', 
      questions: [
        { q: "How does inflation impact consumer purchasing power?", a: "Inflation erodes purchasing power by increasing the general price level of goods and services, meaning each unit of currency buys fewer items." },
        { q: "Define the Phillips Curve.", a: "It's a historical inverse relationship between rates of unemployment and corresponding rates of inflation within an economy." }
      ],
      audioUrl: '#' 
    },
    { 
      id: 's2', 
      name: 'Priya Patel', 
      questions: [
        { q: "What is GDP deflator?", a: "A measure of the level of prices of all new, domestically produced, final goods and services in an economy." }
      ],
      audioUrl: '#' 
    }
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40">Hardware Bridge & Examination</span>
          <h1 className="text-5xl font-black tracking-tighter">Viva Hub</h1>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {!selectedSession ? (
          <motion.div 
            key="sessions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-[40px] border border-black/5 shadow-2xl shadow-black/5 overflow-hidden font-sans"
          >
            <div className="p-10 border-b border-black/5 bg-[#F8F9FA]/50 group">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center">
                     <Mic2 className="text-white" size={24} />
                  </div>
                  <h3 className="text-2xl font-black tracking-tight tracking-tighter">Examination Archive</h3>
               </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#F8F9FA] text-[10px] font-black uppercase tracking-widest text-black/40">
                  <tr>
                    <th className="px-10 py-6">Session Topic</th>
                    <th className="px-6 py-6">Class Assignment</th>
                    <th className="px-6 py-6 text-center">Students</th>
                    <th className="px-6 py-6">Conducted On</th>
                    <th className="px-10 py-6 text-right">View Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {sessions.map((session) => (
                    <tr key={session.id} className="group hover:bg-black/[0.01] transition-colors cursor-pointer" onClick={() => setSelectedSession(session)}>
                      <td className="px-10 py-8">
                        <div className="flex flex-col">
                           <span className="font-black text-lg tracking-tight">{session.topic}</span>
                           <span className="text-[10px] uppercase font-bold text-black/30 tracking-widest">ESP32 External Sink</span>
                        </div>
                      </td>
                      <td className="px-6 py-8">
                        <span className="text-sm font-bold text-black/60">{session.className}</span>
                      </td>
                      <td className="px-6 py-8 text-center whitespace-nowrap">
                        <span className="bg-black/5 text-black text-[10px] font-black px-4 py-2 rounded-full inline-block">
                          {session.studentCount} Present
                        </span>
                      </td>
                      <td className="px-6 py-8">
                        <span className="text-sm font-bold text-black/40">{new Date(session.dueDate).toLocaleDateString()}</span>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <button className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center ml-auto group-hover:bg-black group-hover:text-white transition-all">
                           <ChevronRight size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-10"
          >
            {/* Session Sidebar List */}
            <div className="lg:col-span-4 space-y-6">
               <button 
                onClick={() => {setSelectedSession(null); setSelectedStudent(null);}}
                className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-black/40 hover:text-black transition-colors mb-4"
               >
                  <ArrowLeft size={16} />
                  Back to Hub
               </button>

               <div className="bg-white rounded-[40px] p-8 border border-black/5 shadow-2xl shadow-black/5 space-y-8">
                  <div>
                    <h3 className="text-xl font-black tracking-tight">{selectedSession.topic}</h3>
                    <p className="text-xs font-bold text-black/40 uppercase mt-1">{selectedSession.className}</p>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-black/20">Examinees</label>
                    <div className="space-y-2">
                       {studentData.map(student => (
                         <button 
                           key={student.id}
                           onClick={() => setSelectedStudent(student)}
                           className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                             selectedStudent?.id === student.id 
                               ? 'bg-black text-white shadow-xl shadow-black/20' 
                               : 'bg-[#F8F9FA] hover:bg-black/5 text-black'
                           }`}
                         >
                            <div className="flex items-center gap-3">
                               <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] ${selectedStudent?.id === student.id ? 'bg-white/20' : 'bg-black/5 text-black/40'}`}>
                                  {student.name.charAt(0)}
                               </div>
                               <span className="text-sm font-bold">{student.name}</span>
                            </div>
                            <ChevronRight size={14} className={selectedStudent?.id === student.id ? 'opacity-100' : 'opacity-20'} />
                         </button>
                       ))}
                    </div>
                  </div>
               </div>
            </div>

            {/* Performance Detail Panel */}
            <div className="lg:col-span-8">
               <div className="bg-white rounded-[40px] p-12 border border-black/5 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.03)] min-h-[600px] flex flex-col relative overflow-hidden">
                  {!selectedStudent ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 opacity-40">
                       <FileSearch size={64} className="text-black/10" />
                       <div>
                          <p className="text-lg font-bold tracking-tight">Select Student to Review</p>
                          <p className="text-xs font-bold uppercase tracking-widest mt-1">Cross-Examination Records</p>
                       </div>
                    </div>
                  ) : (
                    <motion.div 
                      key={selectedStudent.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-12"
                    >
                       <div className="flex justify-between items-start">
                          <div className="flex items-center gap-6">
                             <div className="w-20 h-20 bg-[#F8F9FA] rounded-[32px] flex items-center justify-center border border-black/5">
                                <User size={40} className="text-black/10" />
                             </div>
                             <div>
                                <h4 className="text-3xl font-black tracking-tighter">{selectedStudent.name}</h4>
                                <div className="flex items-center gap-3 mt-2">
                                   <div className="flex items-center gap-1.5 bg-black/5 px-4 py-1.5 rounded-full">
                                      <Volume2 size={12} className="text-black/40" />
                                      <span className="text-[10px] font-black uppercase tracking-widest text-black/60">Voice Transparency Active</span>
                                   </div>
                                </div>
                             </div>
                          </div>
                          
                          <button className="bg-black text-white px-8 py-4 rounded-3xl text-xs font-black uppercase tracking-widest shadow-xl shadow-black/10 flex items-center gap-3 hover:scale-105 transition-all">
                             <Play size={16} fill="white" />
                             Play Recording
                          </button>
                       </div>

                       <div className="space-y-8">
                          <label className="text-[10px] font-black uppercase tracking-widest text-black/20 flex items-center gap-2">
                             <MessageSquare size={14} />
                             Transcription Log
                          </label>
                          <div className="space-y-6">
                             {selectedStudent.questions.map((item, idx) => (
                               <div key={idx} className="space-y-4">
                                  <div className="flex gap-4">
                                     <div className="w-6 h-6 shrink-0 bg-black text-white rounded-full flex items-center justify-center text-[10px] font-black">Q</div>
                                     <p className="text-sm font-bold tracking-tight text-black/60 leading-relaxed italic">{item.q}</p>
                                  </div>
                                  <div className="flex gap-4 ml-6 pl-6 border-l-2 border-black/5">
                                     <div className="w-6 h-6 shrink-0 bg-black/5 text-black/40 rounded-full flex items-center justify-center text-[10px] font-black">A</div>
                                     <p className="text-sm font-medium tracking-tight text-black leading-relaxed">{item.a}</p>
                                  </div>
                               </div>
                             ))}
                          </div>
                       </div>
                    </motion.div>
                  )}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
