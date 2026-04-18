"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  Tag,
  X,
  PlusCircle,
  FileText
} from 'lucide-react';

interface Event {
  id: string;
  title: string;
  type: 'assignment' | 'test' | 'ppt' | 'report' | 'essay';
  dueDate: string;
}

export const DashboardHome = ({ user }: { user: { fullName: string; institute: string } }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/calendar');
        if (res.ok) {
          const data = await res.json();
          setEvents(data.map((e: any) => ({
            id: e._id,
            title: e.title,
            type: e.type.toLowerCase(),
            dueDate: e.dueDate
          })));
        }
      } catch (err) {
        console.error("Failed to fetch events:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const addEvent = async (event: Omit<Event, 'id'>) => {
    try {
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
           title: event.title,
           type: event.type.charAt(0).toUpperCase() + event.type.slice(1), // Match enum
           dueDate: event.dueDate
        })
      });
      if (res.ok) {
        const newEvent = await res.json();
        setEvents([...events, {
          id: newEvent._id,
          title: newEvent.title,
          type: newEvent.type.toLowerCase() as any,
          dueDate: newEvent.dueDate
        }]);
      }
    } catch (err) {
      console.error("Failed to save event:", err);
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const res = await fetch('/api/calendar', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setEvents(events.filter(e => e.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete event:", err);
    }
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40">Academic Leadership Panel</span>
            <div className="flex items-center gap-4">
               <h1 className="text-6xl font-black tracking-tighter leading-none">
                 Good Morning, <br />
                 <span className="text-black/30">{user.fullName}</span>
               </h1>
            </div>
            <p className="mt-6 text-lg font-medium text-black/60 max-w-2xl leading-relaxed">
              Faculty Lead at <span className="text-black font-black underline decoration-2 underline-offset-4 decoration-black/10">{user.institute}</span>. 
              Your curriculum automation pipeline is active and monitoring <span className="text-black font-black">Term 2</span> assessments.
            </p>
        </div>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        
        {/* Calendar Section */}
        <section className="xl:col-span-8 bg-white rounded-[40px] p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.03)] border border-black/5">
           <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center shadow-2xl shadow-black/20">
                    <CalendarIcon className="text-white" size={24} />
                 </div>
                 <div>
                    <h2 className="text-2xl font-black tracking-tight">Academic Timeline</h2>
                    <p className="text-xs font-bold text-black/40 uppercase tracking-widest mt-1">Editable Schedule</p>
                 </div>
              </div>
              <div className="flex items-center gap-4">
                 <button 
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10"
                 >
                    <Plus size={16} />
                    New Event
                 </button>
              </div>
           </div>

           {/* Custom Calendar Grid (Simplified for UX) */}
           <div className="grid grid-cols-7 gap-6 border-t border-black/5 pt-10">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="text-center text-[10px] font-black uppercase tracking-widest text-black/20 pb-4">{day}</div>
              ))}
              {Array.from({ length: 14 }).map((_, i) => {
                 const day = i + 18;
                 const dayEvents = events.filter(e => new Date(e.dueDate).getDate() === day);
                 return (
                   <div key={i} className="aspect-square bg-[#F8F9FA] rounded-3xl p-4 border border-black/[0.02] flex flex-col gap-2 group hover:border-black/10 transition-colors relative">
                      <span className="text-sm font-black text-black/20 group-hover:text-black transition-colors">{day}</span>
                      <div className="flex flex-col gap-1.5 overflow-hidden">
                        {dayEvents.map(e => (
                           <div key={e.id} className="w-full h-1.5 rounded-full bg-black/10 overflow-hidden relative group/event">
                              <div className="absolute inset-0 bg-black translate-x-[-100%] group-hover/event:translate-x-0 transition-transform duration-500" />
                              <div className="absolute -top-10 left-0 bg-black text-white text-[8px] font-black px-2 py-1 rounded-md opacity-0 group-hover/event:opacity-100 transition-opacity whitespace-nowrap z-50">
                                {e.title}
                              </div>
                           </div>
                        ))}
                      </div>
                   </div>
                 );
              })}
           </div>
        </section>

        {/* Upcoming List Section */}
        <section className="xl:col-span-4 space-y-8">
           <div className="bg-black text-white rounded-[40px] p-10 shadow-2xl flex flex-col h-full ring-8 ring-white">
              <div className="flex justify-between items-center mb-10">
                 <h3 className="text-xl font-black italic tracking-tighter">Deliverables</h3>
                 <Clock className="text-white/20" size={24} />
              </div>
              
              <div className="flex-1 space-y-6">
                 {events.map((event) => (
                   <motion.div 
                    layout
                    key={event.id} 
                    className="flex flex-col gap-4 p-6 bg-white/5 rounded-3xl border border-white/5 group hover:bg-white/10 transition-colors relative"
                   >
                     <button 
                        onClick={() => deleteEvent(event.id)}
                        className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                     >
                        <X size={14} className="text-white/40" />
                     </button>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center">
                           <FileText size={16} className="text-white" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{event.type}</span>
                      </div>
                      <h4 className="text-lg font-bold tracking-tight">{event.title}</h4>
                      <div className="flex items-center gap-2 mt-2">
                         <div className="w-1 h-1 bg-white/40 rounded-full" />
                         <span className="text-xs font-bold text-white/60">Due {new Date(event.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                   </motion.div>
                 ))}
              </div>

              <button className="mt-10 w-full py-5 rounded-3xl bg-white text-black text-xs font-black uppercase tracking-widest hover:brightness-90 transition-all flex items-center justify-center gap-2">
                 Generate Master Report
                 <PlusCircle size={16} />
              </button>
           </div>
        </section>
      </div>

      {/* Basic Event Modal (Simplified for prototype) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsModalOpen(false)}
               className="absolute inset-0 bg-black/60 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="relative w-full max-w-md bg-white rounded-[40px] p-10 shadow-2xl border border-black/5"
             >
                <div className="flex justify-between items-center mb-8">
                   <h3 className="text-2xl font-black tracking-tight">Schedule Deliverable</h3>
                   <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
                </div>
                
                <form className="space-y-6" onSubmit={(e) => {
                  e.preventDefault();
                  const target = e.target as any;
                  addEvent({
                    title: target.title.value,
                    type: target.type.value,
                    dueDate: target.date.value
                  });
                  setIsModalOpen(false);
                }}>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-black/40">Title</label>
                      <input name="title" required placeholder="Ex: Macroeconomics Midterm" className="w-full bg-black/5 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-black/5 transition-all outline-none" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-black/40">Category</label>
                      <select name="type" className="w-full bg-black/5 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-black/5 transition-all outline-none appearance-none">
                         <option value="test">Test</option>
                         <option value="assignment">Assignment</option>
                         <option value="ppt">Presentation</option>
                         <option value="report">Report</option>
                         <option value="essay">Essay</option>
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-black/40">Due Date</label>
                      <input name="date" type="date" required className="w-full bg-black/5 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-black/5 transition-all outline-none" />
                   </div>
                   <button type="submit" className="w-full bg-black text-white py-5 rounded-[24px] text-xs font-black uppercase tracking-widest mt-4 shadow-xl shadow-black/20">
                      Archive & Save
                   </button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
