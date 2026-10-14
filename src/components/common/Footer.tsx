import React from 'react';
import { Link } from 'react-router-dom';
import { Network, ShieldCheck, Sparkles, Terminal } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-midnight-border bg-[#080B14] py-12 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <Network className="w-5 h-5 text-cyan-accent" />
              <span className="font-bold text-base tracking-tight text-white">
                Opportunity<span className="text-cyan-accent">OS</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              "Your potential is bigger than your resume." Evidence-driven opportunity discovery and intelligence for students.
            </p>
            <div className="flex items-center gap-2 pt-2 text-[11px] font-mono text-cyan-300/80">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Grounded Deterministic Engine</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Intelligence</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/graph" className="hover:text-cyan-accent transition-colors">Opportunity Graph</Link></li>
              <li><Link to="/proof-of-skill" className="hover:text-cyan-accent transition-colors">Proof of Skill Benchmarks</Link></li>
              <li><Link to="/simulator" className="hover:text-cyan-accent transition-colors">Career What-If Simulator</Link></li>
              <li><Link to="/opportunities" className="hover:text-cyan-accent transition-colors">Natural-Language Explorer</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Student Workspace</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/dashboard" className="hover:text-cyan-accent transition-colors">Command Center</Link></li>
              <li><Link to="/roadmap" className="hover:text-cyan-accent transition-colors">Personalized Roadmap</Link></li>
              <li><Link to="/applications" className="hover:text-cyan-accent transition-colors">Application Tracker</Link></li>
              <li><Link to="/profile" className="hover:text-cyan-accent transition-colors">Profile & Evidence</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Platform Guarantee</h4>
            <div className="bg-midnight-surface p-3 rounded-lg border border-midnight-border space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-amber-accent font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Transparent Scoring</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Every match score is fully explained. Mandatory eligibility rules are strictly verified and never masked by hallucinated metrics.
              </p>
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-midnight-border/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 OpportunityOS. Built with precision for aspiring engineers and student researchers.</p>
          <div className="flex items-center gap-4 text-xs">
            <Link to="/settings" className="hover:text-cyan-accent flex items-center gap-1">
              <Terminal className="w-3.5 h-3.5" />
              <span>AI Provider Config</span>
            </Link>
            <Link to="/onboarding" className="hover:text-cyan-accent">Profile Setup</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
