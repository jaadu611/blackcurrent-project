"use client";

import React from 'react';
import { motion } from 'motion/react';
import { 
  Home, 
  GraduationCap, 
  Mic2, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  User,
  Settings
} from 'lucide-react';
import { View } from '../../app/(dashboard)/page';

interface SidebarProps {
  activeView: View;
  setView: (view: View) => void;
  user: { fullName: string; institute: string };
  onLogout: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const Sidebar = ({ 
  activeView, 
  setView, 
  user, 
  onLogout, 
  isOpen, 
  setIsOpen 
}: SidebarProps) => {
  const menuItems = [
    { id: 'home', label: 'Dashboard', icon: Home },
    { id: 'autograder', label: 'Autograder', icon: GraduationCap },
    { id: 'viva', label: 'Viva Hub', icon: Mic2 },
  ];

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isOpen ? 288 : 80 }}
      className="fixed left-0 top-0 h-screen bg-white border-r border-black/5 z-50 flex flex-col transition-all duration-500 ease-in-out shadow-[4px_0_24px_rgba(0,0,0,0.02)]"
    >
      {/* Brand Header */}
      <div className="p-6 flex items-center justify-between overflow-hidden whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
          </div>
          {isOpen && (
            <span className="font-black text-xl tracking-tighter uppercase italic">
              Blackcurrent
            </span>
          )}
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 hover:bg-black/5 rounded-md transition-colors"
        >
          {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 mt-8 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id as View)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group ${
              activeView === item.id 
                ? 'bg-black text-white shadow-xl shadow-black/10' 
                : 'text-black/40 hover:bg-black/5 hover:text-black'
            }`}
          >
            <item.icon size={20} className={activeView === item.id ? 'scale-110' : 'group-hover:scale-110 transition-transform'} />
            {isOpen && <span className="text-sm font-bold tracking-tight">{item.label}</span>}
            {activeView === item.id && isOpen && (
              <motion.div 
                layoutId="active-indicator"
                className="ml-auto w-1 h-1 bg-white rounded-full"
              />
            )}
          </button>
        ))}
      </nav>

      {/* User & Settings */}
      <div className="p-3 mt-auto space-y-2 border-t border-black/5 pt-6">
        <div className={`flex items-center gap-4 px-4 py-3 rounded-xl overflow-hidden ${isOpen ? '' : 'justify-center'}`}>
           <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center shrink-0">
             <User size={20} className="text-black/60" />
           </div>
           {isOpen && (
             <div className="flex flex-col min-w-0">
               <span className="text-xs font-black truncate">{user.fullName}</span>
               <span className="text-[10px] text-black/40 font-bold truncate uppercase">{user.institute}</span>
             </div>
           )}
        </div>

        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-all font-bold"
        >
          <LogOut size={20} />
          {isOpen && <span className="text-sm">Sign Out</span>}
        </button>
      </div>
    </motion.aside>
  );
};
