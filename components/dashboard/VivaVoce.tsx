
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
  Play
} from 'lucide-react';

export const VivaVoceView = () => {
  return (
    <div className="space-y-12 pb-12">
      <header>
        <div className="flex justify-between items-end">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-tertiary uppercase tracking-[0.15em] text-xs font-bold mb-3 block">Examination Module</span>
            <h1 className="text-5xl font-extrabold tracking-tighter text-on-background leading-none">Viva-Voce Hub</h1>
          </motion.div>
          <div className="flex space-x-4">
            <button className="bg-surface-container-high text-on-surface px-6 py-3 rounded-lg font-semibold hover:bg-surface-container-highest transition-colors">
              Drafts
            </button>
            <button className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-8 py-3 rounded-lg font-bold shadow-xl hover:opacity-90 transition-opacity inner-glow">
              Start New Session
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-8">
        {/* Portfolio Upload Zone */}
        <section className="col-span-12 lg:col-span-5 flex flex-col space-y-6">
          <div className="bg-surface-container-low rounded-xl p-8 h-full border border-surface-container-high">
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
                <p className="text-xs text-on-surface-variant mt-1">Supports PDF, DOCX, JPEG, and PNG (Max 50MB)</p>
              </div>
              <button className="mt-4 text-xs font-bold text-tertiary uppercase tracking-widest bg-tertiary/10 px-4 py-2 rounded-full hover:bg-tertiary/20 transition-colors">
                Browse Files
              </button>
            </div>

            <div className="mt-8 space-y-3">
              <div className="flex items-center p-3 bg-surface-container-high rounded-lg border border-surface-container-highest/30">
                <FileText className="text-primary-container w-5 h-5 mr-3" />
                <div className="flex-1">
                  <p className="text-xs font-bold text-on-surface">architectural_thesis_final.pdf</p>
                  <p className="text-[10px] text-on-surface-variant">12.4 MB • Complete</p>
                </div>
                <X className="text-error w-4 h-4 cursor-pointer hover:scale-110 transition-transform" />
              </div>
              <div className="flex items-center p-3 bg-surface-container-high rounded-lg border border-surface-container-highest/30">
                <ImageIcon className="text-secondary w-5 h-5 mr-3" />
                <div className="flex-1">
                  <p className="text-xs font-bold text-on-surface">site_analysis_v4.jpg</p>
                  <p className="text-[10px] text-on-surface-variant">4.2 MB • Processing...</p>
                </div>
                <div className="w-12 h-1 bg-outline-variant rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '66%' }}
                    className="h-full bg-primary"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Question Generation */}
        <section className="col-span-12 lg:col-span-7 flex flex-col space-y-8">
          <div className="bg-surface-container rounded-xl p-8 shadow-2xl border border-surface-container-high">
            <div className="flex justify-between items-start mb-10">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Sparkles className="text-tertiary w-4 h-4" fill="currentColor" />
                  <span className="text-tertiary text-xs font-bold tracking-[0.2em] uppercase">Smart Assistant</span>
                </div>
                <h2 className="text-3xl font-extrabold tracking-tighter text-on-background">Generated Viva Questions</h2>
              </div>
              <div className="flex space-x-2">
                <button className="p-2 rounded-lg bg-surface-container-highest text-primary hover:bg-primary hover:text-on-primary transition-all">
                  <RefreshCw className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-lg bg-surface-container-highest text-on-surface hover:text-on-background transition-all">
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {[
                { 
                  label: 'Conceptual Inquiry • Question 01', 
                  text: 'How does your chosen material palette reinforce the sustainability goals outlined in your environmental impact report?',
                  tagIcon: Timer, 
                  tagText: '5-min Discussion',
                  metaIcon: Bookmark,
                  metaText: 'Architectural Logic'
                },
                { 
                  label: 'Technical Inquiry • Question 02', 
                  text: 'Identify the critical structural tension points in the cantilever section. What was your secondary fail-safe mechanism?',
                  tagIcon: Timer, 
                  tagText: '8-min Discussion',
                  metaIcon: Bookmark,
                  metaText: 'Structural Safety'
                },
                { 
                  label: 'Reflective Inquiry • Question 03', 
                  text: 'If the budget was reduced by 40%, which primary design element would you sacrifice first and how would that alter the user experience?',
                  tagIcon: Timer, 
                  tagText: '10-min Discussion',
                  metaIcon: Bookmark,
                  metaText: 'Value Engineering'
                }
              ].map((q, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative"
                >
                  <div className="absolute -left-1 top-0 bottom-0 w-1 bg-primary rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity" />
                  <div className="bg-surface-container-lowest p-6 rounded-xl border border-transparent transition-all group-focus-within:bg-surface-container-highest group-focus-within:translate-x-2 border-surface-container-high hover:border-primary/10">
                    <label className="block text-[10px] font-bold text-tertiary uppercase tracking-widest mb-3">{q.label}</label>
                    <textarea 
                      className="w-full bg-transparent border-none p-0 text-lg font-medium text-on-background focus:ring-0 resize-none leading-relaxed" 
                      rows={2} 
                      defaultValue={q.text}
                    />
                    <div className="mt-4 flex items-center justify-between border-t border-outline-variant/10 pt-4 opacity-40 group-focus-within:opacity-100 transition-opacity">
                      <div className="flex space-x-4">
                        <span className="flex items-center text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                          <q.tagIcon className="w-3 h-3 mr-1" /> {q.tagText}
                        </span>
                        <span className="flex items-center text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                          <q.metaIcon className="w-3 h-3 mr-1" /> {q.metaText}
                        </span>
                      </div>
                      <button className="text-[10px] font-bold text-error uppercase tracking-widest hover:underline">Remove</button>
                    </div>
                  </div>
                </motion.div>
              ))}

              <button className="w-full border-2 border-dashed border-outline-variant/20 rounded-xl py-6 text-on-surface-variant font-bold text-sm hover:border-tertiary/40 hover:text-tertiary transition-all flex items-center justify-center space-x-2">
                <PlusCircle className="w-5 h-5" />
                <span>Add Custom Question</span>
              </button>
            </div>

            <div className="mt-12 flex justify-end items-center space-x-4">
              <p className="text-xs text-on-surface-variant italic">Questions generated based on 4 uploaded files.</p>
              <button className="bg-tertiary text-on-tertiary-container px-10 py-4 rounded-lg font-extrabold shadow-lg hover:scale-105 transition-transform">
                Finalize Session Guide
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Portfolio Analysis Preview */}
      <section className="mt-12">
        <div className="bg-surface-container-low rounded-xl p-8 border border-surface-container-high">
          <h3 className="text-xl font-bold mb-6 text-on-background">Portfolio Analysis Preview</h3>
          <div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide">
            {[
              { id: 1, name: 'Floor_Plan_01.jpg' },
              { id: 2, name: 'Context_Visual.jpg' },
              { id: 3, name: 'Material_Detail.png' },
              { id: 4, name: 'Thesis_Intro.pdf', icon: true }
            ].map(item => (
              <div key={item.id} className="flex-shrink-0 group cursor-pointer">
                <div className="relative w-48 h-32 rounded-lg overflow-hidden bg-surface-container-highest border border-surface-container-high">
                  {item.icon ? (
                    <div className="w-full h-full flex items-center justify-center bg-surface-container-lowest">
                      <FileText className="w-12 h-12 text-outline-variant" />
                    </div>
                  ) : (
                    <img 
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" 
                      src={`https://picsum.photos/seed/arch${item.id}/300/200`}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                  <span className="absolute bottom-2 left-2 text-[10px] font-bold text-on-surface">{item.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAB */}
      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-10 right-10 w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-2xl flex items-center justify-center group z-50 inner-glow"
      >
        <Play className="w-8 h-8 ml-1" fill="currentColor" />
        <span className="absolute right-20 bg-surface-container-highest text-on-background px-4 py-2 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity shadow-xl border border-primary/20 whitespace-nowrap">
          Start Viva Session
        </span>
      </motion.button>
    </div>
  );
};
