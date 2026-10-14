import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Search, 
  Compass, 
  Network, 
  Award, 
  Briefcase, 
  CheckCircle2, 
  ArrowRight, 
  Bookmark, 
  BookmarkCheck, 
  ExternalLink,
  Flame,
  Zap,
  Clock,
  MapPin,
  TrendingUp,
  Building2
} from 'lucide-react';
import { OpportunityGraph } from '../components/graph/OpportunityGraph';
import { MatchBreakdownModal } from '../components/matching/MatchBreakdownModal';
import { 
  getStoredProfile, 
  getStoredSkills, 
  getStoredProjects, 
  getAllOpportunities, 
  getStoredApplications, 
  toggleSaveOpportunity,
  updateApplicationStatus,
  getStoredEvidence
} from '../lib/storage';
import { calculateOpportunityMatch } from '../lib/matching';
import { Opportunity, MatchScoreBreakdown } from '../types';

export const DashboardPage: React.FC = () => {
  const profile = getStoredProfile();
  const skills = getStoredSkills();
  const projects = getStoredProjects();
  const evidence = getStoredEvidence();
  const opportunities = getAllOpportunities();
  const applications = getStoredApplications();

  const [searchFilter, setSearchFilter] = useState('');
  const [selectedBreakdownOpp, setSelectedBreakdownOpp] = useState<Opportunity | null>(null);

  // Ranked opportunities based on deterministic matching engine
  const rankedOpportunities = useMemo(() => {
    return opportunities.map(opp => ({
      opp,
      match: calculateOpportunityMatch(opp, profile, skills),
    })).sort((a, b) => b.match.total_score - a.match.total_score);
  }, [opportunities, profile, skills]);

  const filteredRanked = useMemo(() => {
    if (!searchFilter.trim()) return rankedOpportunities;
    const q = searchFilter.toLowerCase();
    return rankedOpportunities.filter(({ opp }) => 
      opp.title.toLowerCase().includes(q) || 
      opp.organization.toLowerCase().includes(q) ||
      opp.domain.toLowerCase().includes(q) ||
      opp.required_skills.some(s => s.toLowerCase().includes(q))
    );
  }, [rankedOpportunities, searchFilter]);

  const savedOppIds = useMemo(() => {
    return new Set(applications.filter(a => a.status === 'saved').map(a => a.opportunity_id));
  }, [applications]);

  const eligibleCount = useMemo(() => {
    return rankedOpportunities.filter(r => r.match.eligibility === 'eligible').length;
  }, [rankedOpportunities]);

  const handleToggleSave = (oppId: string) => {
    toggleSaveOpportunity(oppId);
  };

  const selectedBreakdown = useMemo<MatchScoreBreakdown | null>(() => {
    if (!selectedBreakdownOpp) return null;
    return calculateOpportunityMatch(selectedBreakdownOpp, profile, skills);
  }, [selectedBreakdownOpp, profile, skills]);

  // Next best move logic
  const topCandidate = rankedOpportunities.find(r => r.match.skills_missing.length > 0 && r.match.eligibility === 'eligible');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Dashboard Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-midnight-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono text-cyan-accent uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> AI Opportunity Command Center
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {profile.display_name.split(' ')[0]}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {profile.course} • {profile.institution} (Year {profile.year_of_study})
          </p>
        </div>

        {/* Global Search & Quick Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search matches by skill or role..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              className="w-full bg-midnight-surface border border-midnight-border text-xs px-3 py-2 pl-9 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
          <Link
            to="/opportunities"
            className="px-3.5 py-2 rounded-xl bg-midnight-surface hover:bg-midnight-hover border border-midnight-border text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Compass className="w-3.5 h-3.5 text-cyan-accent" />
            <span>Explorer</span>
          </Link>
        </div>
      </div>

      {/* Overview Stat Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-midnight-surface p-5 rounded-2xl border border-midnight-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Eligible Matches</span>
            <Sparkles className="w-4 h-4 text-cyan-accent" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-white">
            {eligibleCount}
          </div>
          <span className="text-[11px] text-cyan-300/80 font-mono mt-1">
            of {opportunities.length} active opportunities
          </span>
        </div>

        <div className="bg-midnight-surface p-5 rounded-2xl border border-midnight-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Skill Evidence</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-emerald-400">
            {evidence.length}
          </div>
          <span className="text-[11px] text-slate-400 font-mono mt-1">
            {skills.filter(s => s.evidence_status === 'challenge_assessed').length} Challenge-Assessed
          </span>
        </div>

        <div className="bg-midnight-surface p-5 rounded-2xl border border-midnight-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Saved Applications</span>
            <Bookmark className="w-4 h-4 text-purple-accent" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-purple-accent">
            {applications.length}
          </div>
          <span className="text-[11px] text-slate-400 font-mono mt-1">
            {applications.filter(a => a.status === 'planning' || a.status === 'applied').length} in active progress
          </span>
        </div>

        <div className="bg-midnight-surface p-5 rounded-2xl border border-midnight-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Average Match</span>
            <TrendingUp className="w-4 h-4 text-amber-accent" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-amber-accent">
            74%
          </div>
          <span className="text-[11px] text-slate-400 font-mono mt-1">
            Top match: {rankedOpportunities[0]?.match.total_score}%
          </span>
        </div>

      </div>

      {/* Your Next Best Move: Actionable AI Highlight */}
      <div className="bg-gradient-to-r from-cyan-950/40 via-midnight-surface to-[#161d30] border border-cyan-500/40 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
              <Zap className="w-3 h-3 fill-current" /> High Impact Opportunity Unlock
            </span>
            <span className="text-xs font-mono text-emerald-400">+18% Match Potential</span>
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">
            Elevate Python from Self-Reported to Challenge-Assessed
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Completing the 15-minute Python Telemetry benchmark verifies your data wrangling capability and instantly elevates your match score for <strong className="text-white">Microsoft Research Fellow</strong> and <strong className="text-white">Hugging Face ML Fellow</strong> to 88%+.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/proof-of-skill"
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-midnight-bg font-bold text-xs transition-all shadow-[0_0_15px_rgba(103,232,249,0.3)] flex items-center gap-1.5 whitespace-nowrap"
          >
            <span>Take Skill Challenge</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/simulator"
            className="px-4 py-2.5 rounded-xl bg-midnight-bg hover:bg-midnight-hover border border-midnight-border text-slate-300 text-xs font-semibold transition-colors whitespace-nowrap"
          >
            Simulate First
          </Link>
        </div>
      </div>

      {/* Intelligence Graph Preview */}
      <div className="bg-midnight-surface rounded-2xl border border-midnight-border p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-cyan-accent" />
            <h3 className="font-bold text-sm text-white">Live Opportunity Intelligence Graph</h3>
          </div>
          <Link
            to="/graph"
            className="text-xs text-cyan-accent hover:underline flex items-center gap-1 font-mono"
          >
            Open Full Interactive Graph <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <OpportunityGraph
          profile={profile}
          skills={skills}
          projects={projects}
          opportunities={opportunities}
          height="420px"
          onSelectOpportunity={opp => setSelectedBreakdownOpp(opp)}
        />
      </div>

      {/* Ranked Recommended Opportunities */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Top Ranked Opportunities for Your Profile
            </h3>
            <p className="text-xs text-slate-400">
              Ranked with transparent criteria (Skills 40pts, Academic 20pts, Interest 15pts, Work mode 15pts, Experience 10pts).
            </p>
          </div>
          <Link
            to="/opportunities"
            className="text-xs text-cyan-accent hover:underline flex items-center gap-1"
          >
            View all {opportunities.length} opportunities <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRanked.slice(0, 6).map(({ opp, match }) => {
            const isSaved = savedOppIds.has(opp.id);
            return (
              <div
                key={opp.id}
                className="bg-midnight-surface rounded-2xl border border-midnight-border p-5 flex flex-col justify-between hover:border-cyan-500/30 transition-all shadow-lg group relative"
              >
                <div>
                  
                  {/* Card Top: Org, Type, Save Button */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-midnight-bg border border-midnight-border flex items-center justify-center text-slate-300">
                        <Building2 className="w-4 h-4 text-cyan-accent" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-slate-200 block truncate max-w-[150px]">
                          {opp.organization}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono capitalize">
                          {opp.opportunity_type.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Score Badge */}
                      <div className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold ${
                        match.total_score >= 80 ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                        match.total_score >= 60 ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                        'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        {match.total_score}%
                      </div>

                      <button
                        onClick={() => handleToggleSave(opp.id)}
                        title={isSaved ? 'Remove from Saved' : 'Save Opportunity'}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          isSaved
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                            : 'bg-midnight-bg text-slate-400 hover:text-white border-midnight-border'
                        }`}
                      >
                        {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <Link
                    to={`/opportunities/${opp.id}`}
                    className="font-bold text-sm text-white hover:text-cyan-accent transition-colors block mb-2 leading-snug"
                  >
                    {opp.title}
                  </Link>

                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400 font-mono mb-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      {opp.location} ({opp.work_mode})
                    </span>
                    {opp.compensation_text && (
                      <span className="text-slate-300">{opp.compensation_text}</span>
                    )}
                  </div>

                  {/* Grounded narrative snippet */}
                  <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed mb-4">
                    {match.executive_summary}
                  </p>

                  {/* Required Skills Badges */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {opp.required_skills.slice(0, 3).map(skill => {
                      const isMatched = match.skills_matched.includes(skill);
                      return (
                        <span
                          key={skill}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                            isMatched
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : 'bg-midnight-bg text-slate-400 border border-midnight-border'
                          }`}
                        >
                          {skill}
                        </span>
                      );
                    })}
                  </div>

                </div>

                {/* Card Footer: Action Links */}
                <div className="pt-3 border-t border-midnight-border flex items-center justify-between">
                  <button
                    onClick={() => setSelectedBreakdownOpp(opp)}
                    className="text-xs text-cyan-accent hover:underline flex items-center gap-1 font-mono"
                  >
                    Why this matches <Sparkles className="w-3 h-3" />
                  </button>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/opportunities/${opp.id}`}
                      className="px-2.5 py-1 rounded-lg bg-midnight-bg hover:bg-midnight-hover border border-midnight-border text-slate-200 text-xs transition-colors"
                    >
                      Details
                    </Link>
                    <a
                      href={opp.application_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded-lg bg-midnight-bg hover:bg-midnight-hover border border-midnight-border text-slate-400 hover:text-white transition-colors"
                      title="Open source application link"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Deep Match Breakdown Modal */}
      {selectedBreakdownOpp && selectedBreakdown && (
        <MatchBreakdownModal
          opportunity={selectedBreakdownOpp}
          breakdown={selectedBreakdown}
          isOpen={Boolean(selectedBreakdownOpp)}
          onClose={() => setSelectedBreakdownOpp(null)}
        />
      )}

    </div>
  );
};
