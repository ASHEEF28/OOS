import React from 'react';
import { Cpu, Sparkles, ShieldCheck } from 'lucide-react';
import { ScenarioControls } from '../components/simulator/ScenarioControls';
import { getStoredProfile, getStoredSkills, getStoredProjects, getAllOpportunities } from '../lib/storage';

export const SimulatorPage: React.FC = () => {
  const profile = getStoredProfile();
  const skills = getStoredSkills();
  const projects = getStoredProjects();
  const opportunities = getAllOpportunities();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-midnight-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono text-cyan-accent uppercase tracking-widest flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5" /> Career Scenario Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Career What-If Simulator
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            "What would happen if you developed a new skill or completed a project?" Simulate your future opportunity unlocks before spending months studying.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Deterministic Simulator Sandbox</span>
        </div>
      </div>

      {/* Simulator Workspace */}
      <ScenarioControls
        profile={profile}
        skills={skills}
        projects={projects}
        opportunities={opportunities}
      />

    </div>
  );
};
