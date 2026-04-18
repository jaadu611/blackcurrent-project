
import { motion } from 'motion/react';
import { 
  Plus, 
  BarChart3, 
  Zap, 
  Library, 
  Filter, 
  Edit3, 
  Trash2, 
  ArrowRight,
  PlayCircle,
  Copy,
  Sparkles
} from 'lucide-react';
import { ProgressGroveBarSet } from '../components/Shared';

export const RubricsView = () => {
  return (
    <div className="space-y-12">
      <section className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold tracking-[0.1em] text-tertiary uppercase">Assessment Engine</span>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-on-surface leading-tight">Rubrics Management</h2>
            <p className="text-on-surface-variant max-w-xl text-lg leading-relaxed">Design, deploy, and automate grading with precision-engineered academic rubrics.</p>
          </div>
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold rounded-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/10 inner-glow">
            <Plus className="w-5 h-5" />
            Create New Rubric
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-low p-6 rounded-xl space-y-4 group hover:bg-surface-container-high transition-colors border border-surface-container-high">
          <div className="flex items-center justify-between">
            <BarChart3 className="text-tertiary w-6 h-6" />
            <span className="text-[10px] font-bold text-outline uppercase tracking-widest">Efficiency</span>
          </div>
          <div>
            <p className="text-3xl font-bold text-on-surface">14.2 hrs</p>
            <p className="text-sm text-on-surface-variant">Time saved this week</p>
          </div>
        </div>
        <div className="bg-surface-container-low p-6 rounded-xl space-y-4 group hover:bg-surface-container-high transition-colors border border-surface-container-high">
          <div className="flex items-center justify-between">
            <Zap className="text-primary w-6 h-6" fill="currentColor" />
            <span className="text-[10px] font-bold text-outline uppercase tracking-widest">Automation</span>
          </div>
          <div>
            <p className="text-3xl font-bold text-on-surface">88%</p>
            <p className="text-sm text-on-surface-variant">Auto-graded assignments</p>
          </div>
        </div>
        <div className="bg-surface-container-low p-6 rounded-xl space-y-4 group hover:bg-surface-container-high transition-colors border border-surface-container-high">
          <div className="flex items-center justify-between">
            <Library className="text-secondary w-6 h-6" />
            <span className="text-[10px] font-bold text-outline uppercase tracking-widest">Library</span>
          </div>
          <div>
            <p className="text-3xl font-bold text-on-surface">24 Active</p>
            <p className="text-sm text-on-surface-variant">Templates in current term</p>
          </div>
        </div>
      </section>

      <section className="space-y-8 pb-12">
        <div className="flex items-center justify-between border-b border-outline-variant/10 pb-4">
          <div className="flex gap-4">
            <button className="px-4 py-1.5 rounded-full bg-primary/20 text-primary text-xs font-bold transition-colors">All Types</button>
            {['Essays', 'Science Labs', 'Coding'].map(type => (
              <button key={type} className="px-4 py-1.5 rounded-full text-outline hover:bg-surface-container-low hover:text-on-surface text-xs font-bold transition-colors">
                {type}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors">
            <Filter className="w-4 h-4" />
            Sort by Latest
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="bg-surface-container-low group rounded-xl p-8 flex flex-col justify-between hover:bg-surface-container-high transition-all duration-500 border-l-4 border-primary/20 hover:border-primary"
          >
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-on-surface tracking-tight">Advanced Literature Analysis</h3>
                  <p className="text-sm text-on-surface-variant">Focuses on narrative structure, thematic depth, and secondary source integration.</p>
                </div>
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">Essay</span>
              </div>
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-tertiary uppercase tracking-widest">Criteria Complexity</p>
                <ProgressGroveBarSet count={12} completion={70} color="var(--color-tertiary)" />
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-outline-variant/10 flex items-center justify-between">
              <div className="flex -space-x-2">
                {['12A', '12B', 'AP'].map(tag => (
                  <div key={tag} className="w-8 h-8 rounded-full bg-surface-container-highest border-2 border-surface-container-low flex items-center justify-center text-[10px] font-bold text-outline">
                    {tag}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-outline hover:text-primary transition-colors hover:bg-primary/5 rounded-lg"><Edit3 className="w-5 h-5" /></button>
                <button className="p-2 text-outline hover:text-error transition-colors hover:bg-error/5 rounded-lg"><Trash2 className="w-5 h-5" /></button>
                <button className="p-2 text-primary bg-primary/10 rounded-lg hover:bg-primary hover:text-on-primary transition-all">
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="bg-surface-container-low group rounded-xl p-8 flex flex-col justify-between hover:bg-surface-container-high transition-all duration-500 border-l-4 border-tertiary/20 hover:border-tertiary"
          >
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-on-surface tracking-tight">Quantum Physics Lab Report</h3>
                  <p className="text-sm text-on-surface-variant">Validated for experimental methodology, data visualization, and error analysis.</p>
                </div>
                <span className="bg-tertiary/10 text-tertiary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">Lab</span>
              </div>
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-tertiary uppercase tracking-widest">Auto-Grader Maturity</p>
                <ProgressGroveBarSet count={10} completion={90} color="var(--color-tertiary)" />
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-outline-variant/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-tertiary" />
                <span className="text-xs text-on-surface-variant font-medium">95% Confidence score</span>
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-outline hover:text-primary transition-colors hover:bg-primary/5 rounded-lg"><Copy className="w-5 h-5" /></button>
                <button className="p-2 text-tertiary bg-tertiary/10 rounded-lg hover:bg-tertiary hover:text-on-tertiary transition-all">
                  <PlayCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
          </motion.div>

          <div className="relative overflow-hidden bg-surface-container-low group rounded-xl p-8 xl:col-span-2 h-64 flex items-center justify-between hover:bg-surface-container-high transition-all duration-500 border border-surface-container-high">
            <div className="z-10 space-y-4 max-w-lg">
              <h3 className="text-3xl font-bold text-on-surface leading-none">Universal Citation Rubric</h3>
              <p className="text-on-surface-variant">Ensure MLA, APA, and Chicago style compliance across all history and social science assignments with our standard global validator.</p>
              <div className="flex gap-3">
                <span className="px-4 py-1.5 bg-surface-container-highest rounded-full text-xs font-bold text-on-surface">1,240 Uses</span>
                <span className="px-4 py-1.5 bg-surface-container-highest rounded-full text-xs font-bold text-on-surface">Global Standard</span>
              </div>
            </div>
            <div className="absolute right-0 top-0 w-1/3 h-full opacity-10 group-hover:opacity-20 transition-opacity">
              <img 
                className="w-full h-full object-cover grayscale" 
                src="https://picsum.photos/seed/paper/800/400" 
                alt="Background"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-surface-container-low" />
            </div>
            <button className="z-10 px-8 py-3 bg-surface-bright text-primary font-bold rounded-lg border border-primary/20 hover:bg-primary hover:text-on-primary transition-all shadow-xl">
              View Details
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
