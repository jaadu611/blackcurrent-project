
import { motion } from 'motion/react';
import { 
  Search, 
  Settings2, 
  ArrowRight, 
  MoreVertical, 
  ExternalLink,
  Plus,
  Palette,
  Atom,
  History,
  Building2
} from 'lucide-react';
import { ProgressGroveBarSet } from './Shared';

export const ClassesView = () => {
  return (
    <div className="space-y-12">
      <section className="space-y-4">
        <span className="text-tertiary font-label text-xs tracking-[0.15em] uppercase">Academic Overview</span>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight font-headline text-on-surface">Your Osamu</h2>
          <div className="flex gap-4">
            <div className="px-6 py-3 bg-surface-container-low rounded-xl flex flex-col border border-surface-container-high hover:border-primary/20 transition-colors">
              <span className="text-[10px] uppercase tracking-widest text-tertiary/60">Total Students</span>
              <span className="text-2xl font-bold text-primary">142</span>
            </div>
            <div className="px-6 py-3 bg-surface-container-low rounded-xl flex flex-col border border-surface-container-high hover:border-primary/20 transition-colors">
              <span className="text-[10px] uppercase tracking-widest text-tertiary/60">Active Subjects</span>
              <span className="text-2xl font-bold text-primary">06</span>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline/50 w-5 h-5" />
          <input 
            className="w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary/30 rounded-xl py-4 pl-12 pr-6 text-on-surface transition-all placeholder:text-outline/50" 
            placeholder="Search for a class, student or subject..." 
            type="text" 
          />
        </div>
        <button className="bg-surface-container-high hover:bg-surface-container-highest text-primary px-6 py-4 rounded-xl flex items-center gap-2 transition-all font-medium inner-glow">
          <Settings2 className="w-5 h-5" />
          <span>Filters</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-12">
        {/* Main Highlight Class */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="md:col-span-8 bg-surface-container-low rounded-xl p-8 transition-all group relative overflow-hidden border border-surface-container-high"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] -mr-32 -mt-32" />
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-md uppercase tracking-wider">Advanced</span>
                <span className="text-outline text-sm">Room 402 • 09:00 AM</span>
              </div>
              <h3 className="text-3xl font-bold text-on-surface leading-tight">Biological Architectures II</h3>
              <p className="text-on-surface-variant max-w-md">Advanced study of natural structural systems and their application in modern computational design.</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-primary tracking-tighter">32</div>
              <div className="text-[10px] uppercase tracking-widest text-tertiary font-bold">Students Enrolled</div>
            </div>
          </div>
          
          <div className="mt-12 flex items-end gap-1 h-12">
            <div className="flex-1 max-w-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] uppercase tracking-widest text-tertiary">Syllabus Completion</span>
                <span className="text-sm font-semibold">62% Optimized</span>
              </div>
              <ProgressGroveBarSet count={18} completion={62} />
            </div>
          </div>
          
          <div className="mt-8 flex gap-4">
            <button className="bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold px-6 py-3 rounded-lg flex items-center gap-2 hover:brightness-110 transition-all inner-glow shadow-lg shadow-primary/20">
              <span>Manage Class</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Visual Theory Card */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="md:col-span-4 bg-surface-container-low rounded-xl p-8 flex flex-col justify-between border border-surface-container-high group"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 bg-tertiary/10 rounded-full flex items-center justify-center group-hover:bg-tertiary/20 transition-colors">
              <Palette className="text-tertiary w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Visual Theory</h3>
              <p className="text-sm text-on-surface-variant mt-1">Foundation Year Section A</p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-outline-variant/10">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-outline">Students</span>
              <span className="text-xl font-bold text-primary">28</span>
            </div>
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <img 
                  key={i} 
                  className="w-8 h-8 rounded-full border-2 border-surface object-cover" 
                  src={`https://picsum.photos/seed/student${i}/80/80`}
                  alt="Student"
                  referrerPolicy="no-referrer"
                />
              ))}
              <div className="w-8 h-8 rounded-full border-2 border-surface bg-surface-container-highest flex items-center justify-center text-[10px] text-outline font-bold">
                +25
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4 }}
          className="md:col-span-4 bg-surface-container-low rounded-xl p-8 flex flex-col justify-between border border-surface-container-high group"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <History className="text-primary w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Liturgical History</h3>
              <p className="text-sm text-on-surface-variant mt-1">Senior Seminar</p>
            </div>
          </div>
          <div className="mt-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] uppercase tracking-widest text-outline">Attendance Rate</span>
              <span className="text-sm font-bold text-tertiary">98%</span>
            </div>
            <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '98%' }}
                transition={{ duration: 1 }}
                className="h-full bg-tertiary"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-between items-center">
            <div className="text-xl font-bold text-primary">18 <span className="text-xs font-normal text-outline">Students</span></div>
            <MoreVertical className="w-5 h-5 text-outline cursor-pointer hover:text-on-surface transition-colors" />
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4 }}
          className="md:col-span-4 bg-surface-container-low rounded-xl p-8 flex flex-col justify-between border border-surface-container-high group"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
              <Atom className="text-secondary w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Geometric Physics</h3>
              <p className="text-sm text-on-surface-variant mt-1">Room 201 • Laboratory</p>
            </div>
          </div>
          <div className="mt-8">
            <div className="text-xs text-outline mb-2">Next Session: Tomorrow 11:00 AM</div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-primary">24</span>
              <span className="text-xs text-outline">Enrolled</span>
            </div>
          </div>
          <button className="mt-6 text-tertiary text-sm font-semibold flex items-center gap-1 hover:underline">
            Review Rubrics <ExternalLink className="w-4 h-4" />
          </button>
        </motion.div>

        <div className="md:col-span-4 bg-primary/5 border border-primary/20 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-4 group hover:bg-primary/10 transition-colors">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Plus className="text-primary w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold">New Osamu Class</h3>
          <p className="text-sm text-on-surface-variant px-4">Create a new academic section or subject rubric for the current semester.</p>
          <button className="mt-2 text-primary font-bold px-4 py-2 hover:bg-primary/10 rounded-lg transition-all">
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};
