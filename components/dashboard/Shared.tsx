"use client";

import { motion } from 'motion/react';
import { 
  Home, 
  GraduationCap, 
  Mic2, 
  FileCheck,
  Search, 
  Bell, 
  UserCircle2,
  LogOut,
  User
} from 'lucide-react';
import { View, User as UserType } from './types';

// --- Shared Components ---

export const Sidebar = ({ 
  activeView, 
  setView, 
  user,
  onLogout 
}: { 
  activeView: View; 
  setView: (v: View) => void; 
  user: UserType;
  onLogout: () => void;
}) => {
  const navItems = [
    { id: 'home', label: 'Dashboard', icon: Home },
    { id: 'assignments', label: 'Assignments', icon: FileCheck },
    { id: 'viva-voce', label: 'Viva-Voce', icon: Mic2 },
  ];

  return (
    <aside className="hidden md:flex flex-col h-screen py-8 px-6 space-y-8 glass-nav w-64 fixed left-0 top-0 shadow-[40px_0px_40px_-10px_rgba(6,13,32,0.5)] z-50">
      <div className="flex items-center gap-3 px-2">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary-container flex items-center justify-center inner-glow">
          <GraduationCap className="text-on-primary w-6 h-6" fill="currentColor" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-extrabold tracking-tighter text-primary leading-tight">Osamu</span>
          <span className="text-[10px] uppercase tracking-[0.1em] text-tertiary">Academic Excellence</span>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id as View)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-300 group ${
              activeView === item.id 
                ? 'text-primary bg-surface-container-high shadow-[inset_0_1px_rgba(255,255,255,0.1)]' 
                : 'text-tertiary/60 hover:bg-surface-container-low hover:text-primary'
            }`}
          >
            <item.icon className="w-5 h-5" fill={activeView === item.id ? 'currentColor' : 'none'} />
            <span className={`text-sm tracking-wide ${activeView === item.id ? 'font-semibold' : 'font-medium'}`}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      {/* User and Logout Section */}
      <div className="mt-auto space-y-4">
        <div className="p-4 rounded-xl bg-surface-container-low flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center border border-primary/20 overflow-hidden">
             {user.avatar ? (
               <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
             ) : (
               <User className="w-6 h-6 text-primary" />
             )}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold truncate text-on-surface">{user.name}</p>
            <p className="text-xs text-outline truncate">{user.institution}</p>
          </div>
        </div>
        
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-error hover:bg-error/10 transition-all duration-300 group"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-bold tracking-wide">Exit System</span>
        </button>
      </div>
    </aside>
  );
};

export const TopBar = () => {
  return (
    <header className="sticky top-0 z-40 glass-nav flex justify-between items-center w-full px-8 py-4 transition-colors duration-300 border-b border-surface-container-high">
      <div className="flex items-center gap-6 flex-1">
        <div className="relative w-full max-w-md group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline/50 w-4 h-4 group-focus-within:text-primary transition-colors" />
          <input 
            className="w-full bg-surface-container-lowest border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-0 focus:bg-surface-container-high transition-all outline-none"
            placeholder="Search resources..."
            type="text"
          />
          <div className="absolute left-0 bottom-0 w-0 h-[2px] bg-primary transition-all duration-300 group-focus-within:w-full" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        <button className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors">
          <UserCircle2 className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};

export const ProgressGroveBarSet = ({ count = 12, completion = 62, color = 'var(--color-tertiary)' }: { count?: number; completion?: number; color?: string }) => {
  const activeCount = Math.floor((completion / 100) * count);
  
  return (
    <div className="flex items-end gap-1.5 h-12">
      {Array.from({ length: count }).map((_, i) => {
        const baseHeight = [40, 60, 80, 50, 70, 90, 100, 85, 65, 45, 55, 75][i % 12];
        const isActive = i < activeCount;
        
        return (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${baseHeight}%` }}
            transition={{ delay: i * 0.05, duration: 0.5 }}
            className="progress-grove-bar"
            style={{ 
              backgroundColor: isActive ? color : 'var(--color-outline-variant)',
              opacity: isActive ? 1 : 0.3,
              boxShadow: isActive && i === activeCount - 1 ? `0 0 15px ${color}` : 'none'
            }}
          />
        );
      })}
    </div>
  );
};
