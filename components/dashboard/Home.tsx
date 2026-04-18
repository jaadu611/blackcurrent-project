
import { motion } from 'motion/react';
import { 
  Plus, 
  ArrowUpRight, 
  BookOpen, 
  Users, 
  Calendar,
  Mic2,
  AlertCircle
} from 'lucide-react';
import { ProgressGroveBarSet } from './Shared';

export const HomeView = () => {
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
            <span className="inline-block text-tertiary tracking-[0.2em] font-bold text-xs uppercase">FACULTY DASHBOARD</span>
            <h1 className="text-5xl font-black tracking-tighter text-on-surface mb-2">Welcome back, Dr. Eleanor Vance</h1>
            <p className="text-xl text-outline/80 max-w-2xl">
              Senior Faculty of Humanities at <span className="text-primary">Oakridge Academy</span>. 
              Your upcoming lectures and grading rubrics are synchronized for the week.
            </p>
          </motion.div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold py-4 px-8 rounded-lg inner-glow transition-all hover:brightness-110 flex items-center gap-2 shadow-xl shadow-primary/10"
          >
            <Plus className="w-5 h-5" />
            Create New Module
          </motion.button>
        </div>
      </section>

      {/* Calendar Section */}
      <section className="bg-surface-container-low rounded-xl overflow-hidden shadow-2xl border border-surface-container-high">
        <div className="bg-surface-container px-8 py-6 flex justify-between items-center border-b border-outline-variant/10">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-on-surface">Academic Calendar</h2>
            <p className="text-sm text-outline">November 2023</p>
          </div>
          <div className="flex items-center gap-2 bg-surface-container-lowest p-1 rounded-lg">
            <button className="p-2 hover:bg-surface-container-high rounded-md text-outline">←</button>
            <button className="px-4 py-1 text-sm font-semibold text-primary">Today</button>
            <button className="p-2 hover:bg-surface-container-high rounded-md text-outline">→</button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-[1px] bg-outline-variant/10">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="bg-surface-container-low p-4 text-center text-xs font-bold text-tertiary tracking-widest uppercase">
              {day}
            </div>
          ))}
          
          {/* Mock Calendar Grid */}
          {Array.from({ length: 15 }).map((_, i) => {
            const day = i + 26 > 31 ? i + 26 - 31 : i + 26;
            const isDimmed = i < 6;
            const isToday = i === 9;
            
            return (
              <div 
                key={i} 
                className={`bg-surface-container-low h-48 p-3 transition-colors relative group hover:bg-surface-container/50 ${isDimmed ? 'opacity-30' : ''} ${isToday ? 'bg-surface-container border-2 border-primary/20 shadow-inner' : ''}`}
              >
                <span className={`block text-right text-xs font-bold mb-3 ${isToday ? 'text-primary' : ''}`}>{day}</span>
                
                {i === 6 && (
                  <div className="bg-primary/10 border-l-2 border-primary p-2 rounded-r-md">
                    <p className="text-[10px] font-bold text-primary truncate uppercase tracking-tighter">ESSAY DUE</p>
                    <p className="text-[11px] text-on-surface truncate">Victorian Literature</p>
                  </div>
                )}
                {i === 7 && (
                  <div className="bg-tertiary/10 border-l-2 border-tertiary p-2 rounded-r-md">
                    <p className="text-[10px] font-bold text-tertiary truncate uppercase tracking-tighter">PPT SUBMISSION</p>
                    <p className="text-[11px] text-on-surface truncate">Modernism Slides</p>
                  </div>
                )}
                {i === 11 && (
                  <div className="bg-error/10 border-l-2 border-error p-2 rounded-r-md">
                    <p className="text-[10px] font-bold text-error truncate uppercase tracking-tighter">FINAL TEST</p>
                    <p className="text-[11px] text-on-surface truncate">Period History 101</p>
                  </div>
                )}
                
                {isToday && (
                  <div className="space-y-2">
                    <div className="bg-secondary-container p-2 rounded-lg">
                      <p className="text-[10px] font-bold text-on-secondary-container truncate uppercase tracking-tighter">CURRENT SESSION</p>
                      <p className="text-[11px] text-on-surface font-semibold truncate">Seminar: Romanticism</p>
                    </div>
                    <div className="bg-surface-container-highest p-2 rounded-lg flex items-center gap-2">
                      <Mic2 className="w-3 h-3 text-tertiary" />
                      <p className="text-[11px] text-on-surface truncate">Viva-Voce 2:30 PM</p>
                    </div>
                  </div>
                )}
                
                {i === 13 && (
                  <div className="bg-outline-variant/20 border-l-2 border-outline p-2 rounded-r-md">
                    <p className="text-[10px] font-bold text-outline truncate uppercase tracking-tighter">REPORT DUE</p>
                    <p className="text-[11px] text-on-surface truncate">Curriculum Audit</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12">
        <div className="md:col-span-2 bg-surface-container-low p-8 rounded-xl relative overflow-hidden group border border-surface-container-high">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-12">
              <div>
                <h3 className="text-xl font-bold tracking-tight mb-1">Academic Progress Grove</h3>
                <p className="text-sm text-outline">Grading cycle status for Semester 2</p>
              </div>
              <button className="text-primary flex items-center gap-1 text-sm font-semibold hover:underline">
                View Full Report <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="mb-8">
              <ProgressGroveBarSet count={24} completion={84} />
            </div>
            
            <div className="grid grid-cols-3 gap-8">
              <div className="space-y-1">
                <p className="text-tertiary font-black text-2xl tracking-tighter">84%</p>
                <p className="text-[10px] uppercase font-bold text-outline tracking-wider">Papers Graded</p>
              </div>
              <div className="space-y-1">
                <p className="text-on-surface font-black text-2xl tracking-tighter">12</p>
                <p className="text-[10px] uppercase font-bold text-outline tracking-wider">Pending PPTs</p>
              </div>
              <div className="space-y-1">
                <p className="text-primary font-black text-2xl tracking-tighter">1,240</p>
                <p className="text-[10px] uppercase font-bold text-outline tracking-wider">Avg. Words/Report</p>
              </div>
            </div>
          </div>
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-primary/5 rounded-full blur-[80px] group-hover:bg-primary/10 transition-colors duration-700" />
        </div>

        <div className="bg-surface-container-high p-8 rounded-xl relative flex flex-col justify-between border border-primary/10">
          <div>
            <div className="w-12 h-12 bg-surface-container-lowest rounded-full flex items-center justify-center mb-6 shadow-xl border border-primary/20">
              <BookOpen className="text-primary w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-on-surface">Research Focus</h3>
            <p className="text-sm text-outline/80 leading-relaxed mb-6">
              You have 3 unread peer-reviews on your latest publication: 
              "The Echoes of Romanticism in Digital Spaces."
            </p>
            <div className="flex -space-x-3 mb-8">
              {[1, 2, 3].map(i => (
                <img 
                  key={i} 
                  className="w-8 h-8 rounded-full border-2 border-surface-container-high object-cover" 
                  src={`https://picsum.photos/seed/user${i}/100/100`}
                  alt="Reviewer"
                  referrerPolicy="no-referrer"
                />
              ))}
              <div className="w-8 h-8 rounded-full border-2 border-surface-container-high bg-surface-container-lowest flex items-center justify-center text-[10px] font-bold text-outline">
                +5
              </div>
            </div>
          </div>
          <button className="w-full bg-surface-container-highest py-3 rounded-lg text-sm font-bold hover:text-primary transition-colors inner-glow">
            Review Journals
          </button>
        </div>
      </section>
    </div>
  );
};
