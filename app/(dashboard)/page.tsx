"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../components/AuthProvider';
import { Sidebar } from '../../components/dashboard/DashboardSidebar';
import { DashboardHome } from '../../components/dashboard/DashboardHome';
import { AutograderView } from '../../components/dashboard/AutograderView';
import { VivaView } from '../../components/dashboard/VivaView';

export type View = 'home' | 'autograder' | 'viva';

export default function MyDashboard() {
  const { user, logout, loading } = useAuth();
  const [activeView, setView] = useState<View>('home');
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold uppercase tracking-widest text-black/40">Authenticating Professor...</p>
      </div>
    );
  }

  const renderView = () => {
    switch (activeView) {
      case 'home':
        return <DashboardHome user={user} />;
      case 'autograder':
        return <AutograderView user={user} />;
      case 'viva':
        return <VivaView user={user} />;
      default:
        return <DashboardHome user={user} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-black selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeView={activeView} 
        setView={setView} 
        user={user} 
        onLogout={logout}
        isOpen={isSidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      
      {/* Main Content Area */}
      <main className={`flex-1 transition-all duration-500 ease-in-out ${isSidebarOpen ? 'md:ml-72' : 'md:ml-20'}`}>
        <div className="p-6 md:p-10 max-w-[1600px] mx-auto min-h-screen flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="flex-1"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
          
          <footer className="mt-20 pt-8 border-t border-black/5 flex justify-between items-center text-[10px] uppercase tracking-[0.2em] text-black/30 font-bold">
            <span>© {new Date().getFullYear()} Blackcurrent • AI Assessment Suite</span>
            <span className="flex gap-4">
              <a href="#" className="hover:text-black transition-colors">Documentation</a>
              <a href="#" className="hover:text-black transition-colors">Support</a>
            </span>
          </footer>
        </div>
      </main>
    </div>
  );
}
