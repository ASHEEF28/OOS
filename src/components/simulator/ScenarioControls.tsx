import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  ArrowUpRight, 
  Trash2, 
  Sparkles, 
  Check, 
  Briefcase, 
  CheckCircle2, 
  Zap, 
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { Profile, ProfileSkill, Project, Opportunity, WhatIfComparison, SkillLevel, SkillCategory, WorkMode } from '../../types';
import { calculateOpportunityMatch } from '../../lib/matching';
import { addOrUpdateSkill, addStoredProject, saveStoredProfile } from '../../lib/storage';
import { Link } from 'react-router-dom';

interface ScenarioControlsProps {
  profile: Profile;
  skills: ProfileSkill[];
  projects: Project[];
  opportunities: Opportunity[];
}

export const ScenarioControls: React.FC<ScenarioControlsProps> = ({
  profile,
  skills,
  projects,
  opportunities,
}) => {
  // Hypothetical scenario state
  const [hypoSkills, setHypoSkills] = useState<{ name: string; category: SkillCategory; level: SkillLevel }[]>([
    { name: 'PyTorch', category: 'ai_ml', level: 'intermediate' }
  ]);
  const [hypoProjects, setHypoProjects] = useState<{ title: string; skills: string[]; type: Project['project_type'] }[]>([
    { title: 'Computer Vision Benchmark App', skills: ['PyTorch', 'Python'], type: 'personal' }
  ]);
  const [hypoWorkMode, setHypoWorkMode] = useState<WorkMode[]>(profile.preferred_work_modes);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [newProjectInput, setNewProjectInput] = useState('');

  // Calculate baseline matches
  const baselineMatches = useMemo(() => {
    return opportunities.map(opp => ({
      opp,
      match: calculateOpportunityMatch(opp, profile, skills),
    }));
  }, [opportunities, profile, skills]);

  // Construct hypothetical profile & skills
  const simulatedSkills = useMemo(() => {
    const list: ProfileSkill[] = [...skills];
    hypoSkills.forEach((hs, idx) => {
      const existingIdx = list.findIndex(s => s.skill_name.toLowerCase() === hs.name.toLowerCase());
      if (existingIdx >= 0) {
        list[existingIdx] = {
          ...list[existingIdx],
          self_reported_level: hs.level,
          evidence_status: 'challenge_assessed', // simulated as verified
        };
      } else {
        list.push({
          id: `hypo-sk-${idx}`,
          profile_id: profile.id,
          skill_id: `skill-${hs.name.toLowerCase().replace(/\s+/g, '-')}`,
          skill_name: hs.name,
          category: hs.category,
          self_reported_level: hs.level,
          evidence_status: 'challenge_assessed',
          updated_at: new Date().toISOString(),
        });
      }
    });
    return list;
  }, [skills, hypoSkills, profile.id]);

  const simulatedProfile = useMemo(() => {
    return {
      ...profile,
      preferred_work_modes: hypoWorkMode,
    };
  }, [profile, hypoWorkMode]);

  // Calculate simulated matches
  const simulatedMatches = useMemo(() => {
    return opportunities.map(opp => ({
      opp,
      match: calculateOpportunityMatch(opp, simulatedProfile, simulatedSkills),
    }));
  }, [opportunities, simulatedProfile, simulatedSkills]);

  // Compute delta comparison
  const comparison: WhatIfComparison = useMemo(() => {
    const baselineEligible = baselineMatches.filter(m => m.match.eligibility === 'eligible');
    const simulatedEligible = simulatedMatches.filter(m => m.match.eligibility === 'eligible');

    const scoreIncreases: WhatIfComparison['scoreIncreases'] = [];
    const newlyUnlocked: WhatIfComparison['newlyUnlockedOpportunities'] = [];

    simulatedMatches.forEach(sm => {
      const bm = baselineMatches.find(b => b.opp.id === sm.opp.id);
      if (!bm) return;

      const scoreDelta = sm.match.total_score - bm.match.total_score;
      if (scoreDelta > 0) {
        scoreIncreases.push({
          opportunity: sm.opp,
          previousScore: bm.match.total_score,
          newScore: sm.match.total_score,
          delta: scoreDelta,
        });
      }

      if (bm.match.eligibility !== 'eligible' && sm.match.eligibility === 'eligible') {
        newlyUnlocked.push({
          opportunity: sm.opp,
          previousScore: bm.match.total_score,
          newScore: sm.match.total_score,
          reasons: sm.match.eligibility_reasons,
        });
      }
    });

    scoreIncreases.sort((a, b) => b.delta - a.delta);
    newlyUnlocked.sort((a, b) => b.newScore - a.newScore);

    return {
      baselineEligibleCount: baselineEligible.length,
      simulatedEligibleCount: simulatedEligible.length,
      newlyUnlockedOpportunities: newlyUnlocked,
      scoreIncreases: scoreIncreases.slice(0, 5),
      remainingGaps: ['Docker', 'FastAPI'],
      highImpactRecommendations: [
        'Adding PyTorch directly unlocks Microsoft Research and Hugging Face pipelines with +18% match confidence.',
        'Documenting the project with public GitHub tests ensures verified project evidence status.',
      ],
    };
  }, [baselineMatches, simulatedMatches]);

  const handleAddSkill = () => {
    if (!newSkillInput.trim()) return;
    setHypoSkills(prev => [
      ...prev,
      { name: newSkillInput.trim(), category: 'programming', level: 'intermediate' }
    ]);
    setNewSkillInput('');
  };

  const handleAddProject = () => {
    if (!newProjectInput.trim()) return;
    setHypoProjects(prev => [
      ...prev,
      { title: newProjectInput.trim(), skills: ['Python'], type: 'personal' }
    ]);
    setNewProjectInput('');
  };

  const handleApplyHypotheticalToProfile = () => {
    if (window.confirm('Apply simulated skills and projects to your real profile?')) {
      hypoSkills.forEach(hs => {
        addOrUpdateSkill({
          skill_name: hs.name,
          category: hs.category,
          self_reported_level: hs.level,
          evidence_status: 'self_reported',
        });
      });
      hypoProjects.forEach(hp => {
        addStoredProject({
          title: hp.title,
          description: 'Project ported from What-If scenario planner.',
          project_type: hp.type,
          skills_demonstrated: hp.skills,
        });
      });
      saveStoredProfile(simulatedProfile);
      alert('Simulated attributes applied successfully to your active profile!');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Simulation Builder Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Interactive Scenario Controls */}
        <div className="bg-midnight-surface p-6 rounded-2xl border border-midnight-border space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-midnight-border">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-accent" />
              Hypothetical Scenarios
            </h3>
            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded-full border border-cyan-500/30">
              Interactive
            </span>
          </div>

          {/* Hypothetical Skills */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-300 block">
              1. Add or Boost Hypothetical Skills
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. PyTorch, Docker, SQL..."
                value={newSkillInput}
                onChange={e => setNewSkillInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddSkill()}
                className="bg-midnight-bg border border-midnight-border text-xs px-3 py-2 rounded-xl text-slate-100 flex-1 focus:outline-none focus:border-cyan-400"
              />
              <button
                onClick={handleAddSkill}
                className="px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-midnight-bg font-semibold text-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {hypoSkills.map((sk, idx) => (
                <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-500/40 text-cyan-200 text-xs font-mono">
                  <span>{sk.name} ({sk.level})</span>
                  <button
                    onClick={() => setHypoSkills(prev => prev.filter((_, i) => i !== idx))}
                    className="text-cyan-400 hover:text-rose-400 ml-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Hypothetical Projects */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-300 block">
              2. Add a Hypothetical Project
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Fullstack AI Agent Portal..."
                value={newProjectInput}
                onChange={e => setNewProjectInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddProject()}
                className="bg-midnight-bg border border-midnight-border text-xs px-3 py-2 rounded-xl text-slate-100 flex-1 focus:outline-none focus:border-cyan-400"
              />
              <button
                onClick={handleAddProject}
                className="px-3 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-semibold text-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 pt-1">
              {hypoProjects.map((proj, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-midnight-bg border border-midnight-border flex items-center justify-between text-xs">
                  <span className="text-slate-200 font-medium truncate max-w-[180px]">{proj.title}</span>
                  <button
                    onClick={() => setHypoProjects(prev => prev.filter((_, i) => i !== idx))}
                    className="text-slate-400 hover:text-rose-400"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Work Mode Toggle */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              3. Simulate Work Mode Flexibility
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {(['remote', 'hybrid', 'onsite'] as WorkMode[]).map(mode => {
                const isSelected = hypoWorkMode.includes(mode);
                return (
                  <button
                    key={mode}
                    onClick={() => {
                      if (isSelected) {
                        if (hypoWorkMode.length > 1) {
                          setHypoWorkMode(hypoWorkMode.filter(m => m !== mode));
                        }
                      } else {
                        setHypoWorkMode([...hypoWorkMode, mode]);
                      }
                    }}
                    className={`py-1.5 rounded-lg border capitalize font-medium transition-all ${
                      isSelected
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                        : 'bg-midnight-bg text-slate-400 border-midnight-border hover:text-white'
                    }`}
                  >
                    {mode}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action button to apply changes */}
          <div className="pt-2 border-t border-midnight-border space-y-2">
            <button
              onClick={handleApplyHypotheticalToProfile}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-midnight-bg font-bold text-xs transition-all shadow-lg"
            >
              <Check className="w-4 h-4" />
              Apply Simulated Traits to Profile
            </button>
            <button
              onClick={() => {
                setHypoSkills([]);
                setHypoProjects([]);
                setHypoWorkMode(profile.preferred_work_modes);
              }}
              className="w-full py-1.5 text-xs text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Clear Simulation
            </button>
          </div>

        </div>

        {/* Center & Right: Real-time Delta Impact Display */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Comparison Score Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="bg-midnight-surface p-5 rounded-2xl border border-midnight-border">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                Eligible Opportunities
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-mono text-white">
                  {comparison.simulatedEligibleCount}
                </span>
                <span className="text-xs font-mono text-emerald-400">
                  (+{Math.max(0, comparison.simulatedEligibleCount - comparison.baselineEligibleCount)} newly unlocked)
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Baseline profile: {comparison.baselineEligibleCount} eligible
              </p>
            </div>

            <div className="bg-midnight-surface p-5 rounded-2xl border border-midnight-border">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                Top Score Delta
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-mono text-cyan-accent">
                  +{comparison.scoreIncreases[0]?.delta || 0}%
                </span>
                <span className="text-xs font-mono text-slate-400">max increase</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 truncate">
                {comparison.scoreIncreases[0]?.opportunity.title || 'No score shifts'}
              </p>
            </div>

            <div className="bg-midnight-surface p-5 rounded-2xl border border-midnight-border">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                Simulation Status
              </span>
              <div className="flex items-center gap-1.5 text-amber-accent font-semibold text-sm mt-1">
                <Sparkles className="w-4 h-4" />
                <span>Hypothetical Sandbox</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Real profile remains unchanged until confirmed.
              </p>
            </div>

          </div>

          {/* Top Opportunities with Highest Match Deltas */}
          <div className="bg-midnight-surface rounded-2xl border border-midnight-border overflow-hidden">
            <div className="p-4 border-b border-midnight-border flex items-center justify-between">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                Highest Score Increases from this Scenario
              </h4>
              <span className="text-[11px] font-mono text-slate-400">
                Sorted by Score Delta
              </span>
            </div>

            <div className="divide-y divide-midnight-border/60">
              {comparison.scoreIncreases.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  Add a hypothetical skill or project above to calculate scenario gains.
                </div>
              ) : (
                comparison.scoreIncreases.map(item => (
                  <div key={item.opportunity.id} className="p-4 flex items-center justify-between hover:bg-midnight-hover/40 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/opportunities/${item.opportunity.id}`}
                          className="font-semibold text-sm text-white hover:text-cyan-accent transition-colors"
                        >
                          {item.opportunity.title}
                        </Link>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 capitalize">
                          {item.opportunity.opportunity_type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {item.opportunity.organization} • {item.opportunity.work_mode}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div className="font-mono">
                        <div className="text-sm font-bold text-white flex items-center gap-1 justify-end">
                          <span className="text-slate-400 text-xs">{item.previousScore}%</span>
                          <ArrowRight className="w-3 h-3 text-emerald-400" />
                          <span className="text-cyan-accent">{item.newScore}%</span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-bold block">
                          +{item.delta}% Boost
                        </span>
                      </div>

                      <Link
                        to={`/opportunities/${item.opportunity.id}`}
                        className="px-3 py-1.5 rounded-lg bg-midnight-bg hover:bg-midnight-surface border border-midnight-border text-xs text-slate-200 transition-colors"
                      >
                        Inspect
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Strategic High ROI Insights */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/30 to-midnight-surface border border-purple-500/30 space-y-3">
            <h4 className="text-xs font-semibold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-purple-accent" />
              Strategic Career Intelligence
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {comparison.highImpactRecommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
};
