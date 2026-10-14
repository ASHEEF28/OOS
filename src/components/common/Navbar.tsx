import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Sparkles, 
  Compass, 
  Network, 
  Award, 
  Cpu, 
  Milestone, 
  Briefcase, 
  RotateCcw,
  UserCheck
} from 'lucide-react';
import { getStoredProfile, resetDemoData } from '../../lib/storage';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const profile = getStoredProfile();

  const navLinks = [
    { to: '/dashboard', label: 'Command Center', icon: Sparkles },
    { to: '/opportunities', label: 'Explorer', icon: Compass },
    { to: '/graph', label: 'Intelligence Graph', icon: Network },
    { to: '/proof-of-skill', label: 'Proof of Skill', icon: Award },
    { to: '/simulator', label: 'What-If Simulator', icon: Cpu },
    { to: '/roadmap', label: 'Roadmap', icon: Milestone },
    { to: '/applications', label: 'Tracker', icon: Briefcase },
  ];

  const handleResetDemo = () => {
    if (window.confirm('Reset demo state to initial baseline? This refreshes skills and opportunities.')) {
      resetDemoData();
      window.location.reload();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-midnight-border bg-[#080B14]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400 transition-all">
            <Network className="w-5 h-5 text-cyan-accent group-hover:rotate-12 transition-transform" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
              Opportunity<span className="text-cyan-accent font-extrabold">OS</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">
              Intelligence Engine
            </span>
          </div>
        </Link>

        {/* Center Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-midnight-surface text-cyan-accent border border-cyan-500/30 shadow-[0_0_12px_rgba(103,232,249,0.15)]'
                    : 'text-slate-300 hover:text-white hover:bg-midnight-surface/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-accent' : 'text-slate-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Action: Demo Mode Pill & Profile */}
        <div className="flex items-center gap-3">
          {/* Demo Mode Badge */}
          <div className="flex items-center gap-2 bg-midnight-surface/90 border border-purple-500/30 rounded-full px-3 py-1 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-purple-300 font-mono text-[11px] hidden sm:inline">DEMO MODE ACTIVE</span>
            <button
              onClick={handleResetDemo}
              title="Reset Demo Data"
              className="text-slate-400 hover:text-cyan-accent ml-1 transition-colors flex items-center gap-1 text-[11px]"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden md:inline">Reset</span>
            </button>
          </div>

          {/* User Profile Pill */}
          <Link
            to="/profile"
            className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-midnight-surface hover:border-cyan-500/40 border border-midnight-border transition-all"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white overflow-hidden">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full object-cover" />
              ) : (
                <UserCheck className="w-3.5 h-3.5" />
              )}
            </div>
            <span className="text-xs font-medium text-slate-200 hidden sm:inline">
              {profile.display_name.split(' ')[0]}
            </span>
          </Link>
        </div>

      </div>
    </header>
  );
};
