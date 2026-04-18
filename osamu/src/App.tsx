import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar, TopBar } from './components/Shared';
import { HomeView } from './pages/Home';
import { AssignmentsView } from './pages/Assignments';
import { VivaVoceView } from './pages/VivaVoce';
import { View, User } from './types';

const currentUser: User = {
  name: "Dr. Eleanor Vance",
  role: "Senior Faculty",
  avatar: "https://picsum.photos/seed/eleanor/100/100",
  institution: "Oakridge Academy"
};

export default function App() {
  const [activeView, setView] = useState<View>('home');

  const renderView = () => {
    switch (activeView) {
      case 'home': return <HomeView />;
      case 'assignments': return <AssignmentsView />;
      case 'viva-voce': return <VivaVoceView />;
      default: return <HomeView />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-on-background font-sans overflow-x-hidden">
      <Sidebar activeView={activeView} setView={setView} user={currentUser} />
      
      <main className="flex-1 md:ml-64 flex flex-col">
        <TopBar />
        
        <div className="p-8 md:p-12 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(10px)' }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
