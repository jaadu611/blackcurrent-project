
import { motion } from 'motion/react';
import { 
  FileText, 
  Presentation, 
  Search, 
  Award, 
  ChevronLeft, 
  ChevronRight,
  Download,
  X,
  Clock,
  Layout,
  BookOpen
} from 'lucide-react';

export const HistoryView = () => {
  return (
    <div className="space-y-12 pb-12">
      <div className="mb-12">
        <span className="text-xs font-bold tracking-[0.2em] uppercase text-tertiary mb-3 block">Chronicle & Records</span>
        <h2 className="text-5xl font-extrabold tracking-tight text-on-surface mb-4">History Archive</h2>
        <p className="text-outline max-w-2xl leading-relaxed text-lg">
          Access a comprehensive record of academic assessments, performance analytics, 
          and historical student contributions within the Osamu ecosystem.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
        <div className="md:col-span-8 bg-surface-container-low rounded-xl p-8 flex flex-col justify-between relative overflow-hidden group border border-surface-container-high">
          <div className="relative z-10">
            <h3 className="text-lg font-bold text-primary mb-1">Average Class Proficiency</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-extrabold tracking-tighter text-on-surface">88.4%</span>
              <span className="text-tertiary text-sm font-semibold">+4.2% from last term</span>
            </div>
          </div>
          
          <div className="mt-8 flex items-end gap-2 h-24">
            {[40, 60, 55, 85, 100, 70, 45, 60, 30, 50].map((h, i) => (
              <motion.div 
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                className={`w-4 rounded-t-sm ${i === 4 ? 'bg-tertiary shadow-[0_0_15px_rgba(192,244,102,0.4)]' : 'bg-outline-variant/30 ring-1 ring-inset ring-surface-container-highest'}`}
                style={{ opacity: i === 4 ? 1 : 0.3 + (i * 0.05) }}
              />
            ))}
          </div>
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-primary/5 rounded-full blur-[80px] group-hover:bg-primary/10 transition-colors duration-700" />
        </div>

        <div className="md:col-span-4 bg-surface-container-high rounded-xl p-8 flex flex-col items-center justify-center text-center border border-primary/10">
          <Award className="w-12 h-12 text-tertiary mb-4" fill="currentColor" />
          <span className="text-4xl font-black text-on-surface mb-1">1,402</span>
          <span className="text-xs font-bold tracking-widest uppercase text-outline">Total Submissions</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-8">
        <button className="px-6 py-2 bg-primary/20 text-primary border border-primary/20 rounded-full text-xs font-extrabold tracking-wide">All Archive</button>
        {['Assignments', 'Test Papers', 'PPT Presentations', 'Reports'].map(filter => (
          <button key={filter} className="px-6 py-2 bg-surface-container-high text-outline hover:text-primary transition-all rounded-full text-xs font-bold tracking-wide hover:bg-surface-container-highest">
            {filter}
          </button>
        ))}
      </div>

      <div className="bg-surface-container-low rounded-xl overflow-hidden border border-surface-container-high shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-highest/30">
                <th className="px-8 py-5 text-[10px] font-bold tracking-[0.15em] uppercase text-outline">Document Name</th>
                <th className="px-6 py-5 text-[10px] font-bold tracking-[0.15em] uppercase text-outline">Format</th>
                <th className="px-6 py-5 text-[10px] font-bold tracking-[0.15em] uppercase text-outline">Student</th>
                <th className="px-6 py-5 text-[10px] font-bold tracking-[0.15em] uppercase text-outline">Score</th>
                <th className="px-6 py-5 text-[10px] font-bold tracking-[0.15em] uppercase text-outline text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {[
                { name: 'Sustainable Urban Design - Final Essay', date: 'Submitted Oct 12, 2023', format: 'PDF Report', student: 'Julianne V. Smith', score: 94, icon: FileText },
                { name: 'Classical Architecture History Presentation', date: 'Submitted Sep 28, 2023', format: 'PPT Presentation', student: 'Marcus Thorne', score: 88, icon: Presentation },
                { name: 'Biomimicry in Modern Civil Engineering', date: 'Submitted Sep 15, 2023', format: 'Test Paper', student: 'Amara Okoro', score: 76, icon: BookOpen },
                { name: 'Ethics in Advanced Learning - Research', date: 'Submitted Aug 30, 2023', format: 'Coursework', student: 'Leo Henderson', score: 91, icon: Layout }
              ].map((doc, i) => (
                <tr key={i} className="hover:bg-surface-container-highest/50 transition-colors cursor-pointer group">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-semibold text-on-surface group-hover:text-primary transition-colors">{doc.name}</span>
                      <span className="text-xs text-outline mt-1">{doc.date}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-tertiary">
                      <doc.icon className="w-4 h-4" />
                      {doc.format}
                    </div>
                  </td>
                  <td className="px-6 py-6 text-sm text-on-surface-variant font-medium">{doc.student}</td>
                  <td className="px-6 py-6">
                    <span className="text-primary font-black text-xl">{doc.score}<span className="text-[10px] opacity-40 ml-1 font-normal uppercase">/100</span></span>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <button className="px-4 py-2 bg-surface-container-highest text-primary text-xs font-bold rounded-lg inner-glow group-hover:bg-primary group-hover:text-on-primary transition-all">
                      View Analytics
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-12 flex justify-between items-center px-4">
        <span className="text-sm text-outline font-medium">Showing <span className="text-on-surface font-black">1-4</span> of 1,402 records</span>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-surface-container-low text-outline hover:text-primary transition-all border border-surface-container-high">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-on-primary font-bold shadow-lg shadow-primary/20">1</button>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-surface-container-low text-outline hover:text-primary transition-all border border-surface-container-high">2</button>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-surface-container-low text-outline hover:text-primary transition-all border border-surface-container-high">3</button>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-surface-container-low text-outline hover:text-primary transition-all border border-surface-container-high">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="fixed bottom-8 right-8 bg-surface-container-highest p-4 rounded-xl shadow-2xl border-l-4 border-primary z-50 flex items-center gap-4 border border-primary/20"
      >
        <div className="w-10 h-10 bg-primary/10 flex items-center justify-center rounded-lg text-primary">
          <Download className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-on-surface">Archive Export Complete</span>
          <span className="text-xs text-outline">Term 2 Analytics PDF is ready.</span>
        </div>
        <button className="ml-4 text-outline hover:text-primary transition-colors">
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
};
