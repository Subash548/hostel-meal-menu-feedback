import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ClipboardList, BarChart2, User, MessageSquare } from 'lucide-react';

const MobileNavbar = ({ userRole }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-2xl border-t border-slate-800 px-6 py-3 pb-[calc(12px+env(safe-area-inset-bottom))] z-50 flex justify-around items-center md:hidden tap-highlight-none shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      <NavLink 
        to={!userRole ? "/" : (userRole === 'admin' ? '/admin-dashboard' : '/student-dashboard')} 
        className={({ isActive }) => `flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-neo-accent scale-110' : 'text-slate-500 hover:text-slate-300'}`}
      >
        <Home size={22} className="drop-shadow-[0_0_8px_rgba(6,182,212,0.3)]" />
        <span className="text-[10px] font-bold uppercase tracking-wider">Home</span>
      </NavLink>

      {userRole === 'admin' && (
        <NavLink 
          to="/admin-dashboard/stats" 
          className={({ isActive }) => `flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-neo-accent scale-110' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <BarChart2 size={22} className="drop-shadow-[0_0_8px_rgba(6,182,212,0.3)]" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Stats</span>
        </NavLink>
      )}

      {userRole === 'student' && (
        <NavLink 
          to="/student-dashboard" 
          className={({ isActive }) => `flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-neo-accent scale-110' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <ClipboardList size={22} className="drop-shadow-[0_0_8px_rgba(6,182,212,0.3)]" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Plan</span>
        </NavLink>
      )}

      <NavLink 
        to="/contact" 
        className={({ isActive }) => `flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-neo-accent scale-110' : 'text-slate-500 hover:text-slate-300'}`}
      >
        <MessageSquare size={22} className="drop-shadow-[0_0_8px_rgba(6,182,212,0.3)]" />
        <span className="text-[10px] font-bold uppercase tracking-wider">Support</span>
      </NavLink>

      <NavLink 
        to="/login" 
        className={({ isActive }) => `flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-neo-accent scale-110' : 'text-slate-500 hover:text-slate-300'}`}
      >
        <User size={22} className="drop-shadow-[0_0_8px_rgba(6,182,212,0.3)]" />
        <span className="text-[10px] font-bold uppercase tracking-wider">{!userRole ? 'Login' : 'Account'}</span>
      </NavLink>
    </nav>
  );
};

export default MobileNavbar;
