import React from 'react';
import { Network, Sparkles, ShieldCheck } from 'lucide-react';
import { OpportunityGraph } from '../components/graph/OpportunityGraph';
import { getStoredProfile, getStoredSkills, getStoredProjects, getAllOpportunities } from '../lib/storage';

export const GraphPage: React.FC = () => {
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
              <Network className="w-3.5 h-3.5" /> Signature Visual Intelligence
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Opportunity Intelligence Graph
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real relational network connecting your verified student profile, demonstrated skills, projects, and target opportunities.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Data-Driven Graph Topology</span>
        </div>
      </div>

      {/* Main Graph Canvas */}
      <div className="shadow-2xl">
        <OpportunityGraph
          profile={profile}
          skills={skills}
          projects={projects}
          opportunities={opportunities}
          interactive={true}
          height="750px"
        />
      </div>

      {/* Graph Legend & Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-400">
        <div className="bg-midnight-surface p-4 rounded-xl border border-midnight-border space-y-1">
          <span className="font-semibold text-white block">Student → Skill Edges</span>
          <p className="text-[11px] leading-relaxed">
            Solid green lines represent test-verified skills with Proof-of-Skill evidence. Dashed lines indicate self-reported or project-supported skills.
          </p>
        </div>
        <div className="bg-midnight-surface p-4 rounded-xl border border-midnight-border space-y-1">
          <span className="font-semibold text-white block">Skill → Project Edges</span>
          <p className="text-[11px] leading-relaxed">
            Demonstrates real repository code where the student has actively applied languages or frameworks in public software.
          </p>
        </div>
        <div className="bg-midnight-surface p-4 rounded-xl border border-midnight-border space-y-1">
          <span className="font-semibold text-white block">Skill → Opportunity Arrows</span>
          <p className="text-[11px] leading-relaxed">
            Cyan directional vectors show exact skill requirement matches powering the deterministic match compatibility scores.
          </p>
        </div>
      </div>

    </div>
  );
};
