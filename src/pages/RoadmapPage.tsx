import React, { useState, useEffect } from 'react';
import { 
  Milestone, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Target, 
  Sparkles, 
  ArrowRight, 
  Layers, 
  Plus,
  Compass
} from 'lucide-react';
import { 
  getStoredMilestones, 
  saveStoredMilestones, 
  toggleMilestoneStatus, 
  getStoredProfile, 
  getStoredSkills 
} from '../lib/storage';
import { LearningMilestone } from '../types';
import { Link } from 'react-router-dom';

export const RoadmapPage: React.FC = () => {
  const profile = getStoredProfile();
  const skills = getStoredSkills();
  const [milestones, setMilestones] = useState<LearningMilestone[]>(getStoredMilestones());

  useEffect(() => {
    const handleUpdate = () => {
      setMilestones(getStoredMilestones());
    };
    window.addEventListener('opportunityos:data-updated', handleUpdate);
    return () => window.removeEventListener('opportunityos:data-updated', handleUpdate);
  }, []);

  const handleToggle = (id: string) => {
    toggleMilestoneStatus(id);
    setMilestones(getStoredMilestones());
  };

  const completedCount = milestones.filter(m => m.status === 'completed').length;
  const progressPct = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-midnight-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono text-cyan-accent uppercase tracking-widest flex items-center gap-1">
              <Milestone className="w-3.5 h-3.5" /> High-Leverage Milestones
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Personalized Career Roadmap
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Targeting: <strong className="text-slate-200">{profile.interests.slice(0, 2).join(' & ')}</strong>. Every milestone directly unlocks specific verified opportunities.
          </p>
        </div>

        {/* Progress Pill */}
        <div className="bg-midnight-surface px-4 py-2 rounded-2xl border border-midnight-border flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs font-bold text-white font-mono">{progressPct}% Complete</div>
            <div className="text-[10px] text-slate-400 font-mono">{completedCount} of {milestones.length} Milestones</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-accent text-xs font-mono font-bold">
            {completedCount}/{milestones.length}
          </div>
        </div>
      </div>

      {/* Target Domain Summary Card */}
      <div className="bg-midnight-surface p-6 rounded-2xl border border-midnight-border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-cyan-accent" />
            <span className="text-xs font-semibold text-white">Current Strategic Focus</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            As a Year {profile.year_of_study} student with Python proficiency, your fastest path to a competitive internship is bridging into <strong className="text-white">PyTorch</strong> and <strong className="text-white">SQL data pipelines</strong>, unlocking 8+ high-stipend fellowships.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/proof-of-skill"
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-midnight-bg font-bold text-xs transition-colors shadow-md flex items-center gap-1.5"
          >
            <span>Complete Active Milestone</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Ordered Milestone Timeline */}
      <div className="space-y-4">
        <span className="text-xs font-mono uppercase text-slate-400 tracking-wider block">
          Ordered Action Plan
        </span>

        <div className="space-y-4">
          {milestones.map((ms, index) => {
            const isDone = ms.status === 'completed';

            return (
              <div
                key={ms.id}
                className={`p-6 rounded-2xl border transition-all flex flex-col sm:flex-row items-start justify-between gap-4 shadow-lg ${
                  isDone
                    ? 'bg-midnight-surface/50 border-emerald-500/30 opacity-80'
                    : 'bg-midnight-surface border-midnight-border hover:border-cyan-500/40'
                }`}
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => handleToggle(ms.id)}
                    title={isDone ? 'Mark Incomplete' : 'Mark Completed'}
                    className={`p-1 rounded-full transition-colors mt-0.5 ${
                      isDone ? 'text-emerald-400' : 'text-slate-500 hover:text-cyan-accent'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                  </button>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                        MILESTONE 0{index + 1}
                      </span>
                      <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {ms.estimated_effort}
                      </span>
                    </div>

                    <h3 className={`text-base font-bold text-white tracking-tight ${isDone ? 'line-through text-slate-400' : ''}`}>
                      {ms.title}
                    </h3>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {ms.description}
                    </p>

                    <div className="p-3 bg-midnight-bg rounded-xl border border-midnight-border/80 text-[11px] text-purple-300 space-y-1">
                      <div className="font-semibold text-slate-300">Why this matters:</div>
                      <div>{ms.why_it_matters}</div>
                    </div>

                    {ms.unlocks_opportunities.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-[10px] font-mono text-slate-400">Unlocks:</span>
                        {ms.unlocks_opportunities.map(oppName => (
                          <span
                            key={oppName}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-midnight-bg border border-midnight-border text-amber-accent"
                          >
                            {oppName}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-midnight-border">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono uppercase ${
                    isDone ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {isDone ? 'Completed' : 'Action Required'}
                  </span>

                  <Link
                    to="/proof-of-skill"
                    className="px-3 py-1.5 rounded-lg bg-midnight-bg hover:bg-midnight-hover border border-midnight-border text-slate-200 text-xs font-mono transition-colors whitespace-nowrap"
                  >
                    Take Test
                  </Link>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
