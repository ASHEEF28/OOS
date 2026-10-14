import React, { useState } from 'react';
import { 
  Award, 
  Code2, 
  ShieldCheck, 
  CheckCircle2, 
  Terminal, 
  Clock, 
  Sparkles, 
  Database, 
  Cpu, 
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { SEED_CHALLENGES } from '../data/seedChallenges';
import { ChallengeRunner } from '../components/challenges/ChallengeRunner';
import { getStoredEvidence, getStoredSkills } from '../lib/storage';
import { SkillChallenge } from '../types';
import { Link } from 'react-router-dom';

export const ProofOfSkillPage: React.FC = () => {
  const [activeChallenge, setActiveChallenge] = useState<SkillChallenge>(SEED_CHALLENGES[0]);
  const evidenceList = getStoredEvidence();
  const skills = getStoredSkills();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-midnight-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono text-cyan-accent uppercase tracking-widest flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> Proof of Skill Assessment Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Practical Skill Benchmarks
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Complete practical, deterministic coding tests to upgrade self-reported claims into test-verified evidence.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="px-3.5 py-2 rounded-xl bg-midnight-surface hover:bg-midnight-hover border border-midnight-border text-xs text-cyan-accent font-mono flex items-center gap-1.5 transition-colors"
          >
            <span>View Recalculated Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Challenge Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SEED_CHALLENGES.map(ch => {
          const isSelected = activeChallenge.id === ch.id;
          const isAssessed = evidenceList.some(e => e.source_id === ch.id);

          return (
            <button
              key={ch.id}
              onClick={() => setActiveChallenge(ch)}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-midnight-surface border-cyan-400 shadow-[0_0_20px_rgba(103,232,249,0.2)] scale-[1.02]'
                  : 'bg-midnight-surface/80 border-midnight-border hover:border-slate-600'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-midnight-bg border border-midnight-border text-cyan-accent">
                    {ch.skill_name}
                  </span>
                  {isAssessed && (
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Assessed
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-sm text-white line-clamp-1 mb-1">
                  {ch.title}
                </h3>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {ch.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-midnight-border/60 text-[10px] font-mono text-slate-400">
                <span className="capitalize text-amber-accent">{ch.difficulty}</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {ch.estimated_minutes}m
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Interactive Challenge Runner */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-cyan-accent" />
            Active Test Sandbox: <strong className="text-white">{activeChallenge.title}</strong>
          </span>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
            Deterministic Sandbox Execution
          </span>
        </div>

        <ChallengeRunner
          key={activeChallenge.id}
          challenge={activeChallenge}
        />
      </div>

      {/* Verified Skill Evidence Log */}
      <div className="bg-midnight-surface p-6 rounded-2xl border border-midnight-border space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-midnight-border">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-sm text-white">Your Skill Evidence Ledger</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {evidenceList.length} Verified Evidence Records
          </span>
        </div>

        {evidenceList.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            No challenges completed yet. Run and pass your first test above to record skill evidence!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {evidenceList.map(ev => (
              <div key={ev.id} className="p-3 rounded-xl bg-midnight-bg border border-midnight-border flex items-start justify-between text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white font-mono">{ev.skill_name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {ev.evidence_type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{ev.evidence_metadata.title}</p>
                  <span className="text-[10px] text-slate-500 font-mono block">
                    Verified on {ev.evidence_metadata.verified_date}
                  </span>
                </div>
                {ev.assessment_score && (
                  <div className="text-right">
                    <span className="text-sm font-bold font-mono text-emerald-400">{ev.assessment_score}%</span>
                    <span className="text-[10px] text-slate-500 block font-mono">score</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
