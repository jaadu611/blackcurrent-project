"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../components/AuthProvider';
import { Sidebar, TopBar } from '../../components/dashboard/Shared';
import { HomeView } from '../../components/dashboard/pages/Home';
import { AssignmentsView } from '../../components/dashboard/pages/Assignments';
import { VivaVoceView } from '../../components/dashboard/pages/VivaVoce';
import { View, User as DashboardUser } from '../../components/dashboard/types';

export default function MyDashboard() {
  const { user, logout, loading } = useAuth();
  const [activeView, setView] = useState<View>('home');

  if (loading || !user) {
    return null; // AuthProvider handles redirect
  }

  // Map Auth user to Dashboard user type
  const dashboardUser: DashboardUser = {
    name: user.fullName || "Faculty Member",
    role: "Academic Lead",
    avatar: "", // Can be filled if avatar URL is available in user object
    institution: user.institute || "Global Academy"
  };

  const renderView = () => {
    switch (activeView) {
      case 'home': return <HomeView user={dashboardUser} />;
      case 'assignments': return <AssignmentsView />;
      case 'viva-voce': return <VivaVoceView />;
      default: return <HomeView user={dashboardUser} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-on-background font-sans overflow-x-hidden">
      {/* Sidebar - fixed on desktop */}
      <Sidebar 
        activeView={activeView} 
        setView={setView} 
        user={dashboardUser} 
        onLogout={logout} 
      />
      
      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <TopBar />
        
        <div className="p-8 md:p-12 max-w-7xl mx-auto w-full flex-1">
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

        {/* Footer Attribution */}
        <footer className="p-8 text-center text-[10px] uppercase tracking-[0.2em] text-outline/30">
          © {new Date().getFullYear()} Osamu Academic Grove • Personalized for {user.fullName}
        </footer>
      </main>
    </div>
  );
}
