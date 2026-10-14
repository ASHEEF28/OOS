import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Sparkles, 
  Compass, 
  Network, 
  ListFilter, 
  RotateCcw, 
  Bookmark, 
  BookmarkCheck, 
  ExternalLink,
  MapPin,
  Clock,
  Building2,
  Bot,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { getAllOpportunities, getStoredProfile, getStoredSkills, getStoredApplications, toggleSaveOpportunity } from '../lib/storage';
import { calculateOpportunityMatch } from '../lib/matching';
import { parseNaturalLanguageSearch } from '../lib/ai';
import { Opportunity, WorkMode, OpportunityType } from '../types';
import { MatchBreakdownModal } from '../components/matching/MatchBreakdownModal';

export const OpportunitiesPage: React.FC = () => {
  const profile = getStoredProfile();
  const skills = getStoredSkills();
  const opportunities = getAllOpportunities();
  const applications = getStoredApplications();

  // Search & Filter State
  const [query, setQuery] = useState('');
  const [isNlSearching, setIsNlSearching] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedWorkMode, setSelectedWorkMode] = useState<string>('all');
  const [selectedSkill, setSelectedSkill] = useState<string>('all');
  const [eligibleOnly, setEligibleOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'match' | 'deadline' | 'compensation'>('match');

  const [selectedBreakdownOpp, setSelectedBreakdownOpp] = useState<Opportunity | null>(null);

  const savedOppIds = useMemo(() => {
    return new Set(applications.filter(a => a.status === 'saved').map(a => a.opportunity_id));
  }, [applications]);

  // Handle Natural Language Search via AI adapter
  const handleNlSearch = async () => {
    if (!query.trim()) return;
    setIsNlSearching(true);
    try {
      const parsed = await parseNaturalLanguageSearch(query);
      if (parsed.domain) setSelectedDomain(parsed.domain);
      if (parsed.opportunity_type) setSelectedType(parsed.opportunity_type);
      if (parsed.work_mode) setSelectedWorkMode(parsed.work_mode);
      if (parsed.skills.length > 0) setSelectedSkill(parsed.skills[0]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsNlSearching(false);
    }
  };

  // Pre-calculate matching scores
  const processedOpportunities = useMemo(() => {
    return opportunities.map(opp => ({
      opp,
      match: calculateOpportunityMatch(opp, profile, skills),
    }));
  }, [opportunities, profile, skills]);

  // Apply Filters
  const filteredOpportunities = useMemo(() => {
    return processedOpportunities.filter(({ opp, match }) => {
      // Search term
      if (query.trim() && !isNlSearching) {
        const q = query.toLowerCase();
        const matchesQuery = 
          opp.title.toLowerCase().includes(q) ||
          opp.organization.toLowerCase().includes(q) ||
          opp.domain.toLowerCase().includes(q) ||
          opp.required_skills.some(s => s.toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }

      // Domain filter
      if (selectedDomain !== 'all' && opp.domain.toLowerCase() !== selectedDomain.toLowerCase()) {
        return false;
      }

      // Type filter
      if (selectedType !== 'all' && opp.opportunity_type !== selectedType) {
        return false;
      }

      // Work Mode filter
      if (selectedWorkMode !== 'all' && opp.work_mode !== selectedWorkMode) {
        return false;
      }

      // Skill filter
      if (selectedSkill !== 'all' && !opp.required_skills.some(s => s.toLowerCase() === selectedSkill.toLowerCase())) {
        return false;
      }

      // Eligible only toggle
      if (eligibleOnly && match.eligibility !== 'eligible') {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'match') {
        return b.match.total_score - a.match.total_score;
      }
      if (sortBy === 'compensation') {
        return (b.opp.compensation_min || 0) - (a.opp.compensation_min || 0);
      }
      if (sortBy === 'deadline') {
        return (a.opp.deadline || '9999').localeCompare(b.opp.deadline || '9999');
      }
      return 0;
    });
  }, [
    processedOpportunities, 
    query, 
    isNlSearching, 
    selectedDomain, 
    selectedType, 
    selectedWorkMode, 
    selectedSkill, 
    eligibleOnly, 
    sortBy
  ]);

  const resetAllFilters = () => {
    setQuery('');
    setSelectedDomain('all');
    setSelectedType('all');
    setSelectedWorkMode('all');
    setSelectedSkill('all');
    setEligibleOnly(false);
    setSortBy('match');
  };

  const selectedBreakdown = useMemo(() => {
    if (!selectedBreakdownOpp) return null;
    return calculateOpportunityMatch(selectedBreakdownOpp, profile, skills);
  }, [selectedBreakdownOpp, profile, skills]);

  const allSkillsList = ['Python', 'JavaScript', 'React', 'PyTorch', 'SQL', 'Git', 'Docker', 'Go', 'Linux'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-midnight-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono text-cyan-accent uppercase tracking-widest flex items-center gap-1">
              <Compass className="w-3.5 h-3.5" /> Opportunity Explorer
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Discover Fellowships, Internships & Labs
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Curated research fellowships, open-source cohorts, and high-signal startup roles with transparent criteria.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/graph"
            className="px-3.5 py-2 rounded-xl bg-midnight-surface hover:bg-midnight-hover border border-midnight-border text-xs text-slate-200 font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Network className="w-3.5 h-3.5 text-cyan-accent" />
            <span>Graph View</span>
          </Link>
        </div>
      </div>

      {/* Natural Language AI Search Bar */}
      <div className="bg-midnight-surface p-4 rounded-2xl border border-midnight-border shadow-lg space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 font-mono text-cyan-300">
            <Bot className="w-4 h-4 text-cyan-accent" />
            Natural-Language Search Engine
          </span>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            e.g. "Beginner-friendly remote Python AI internships accepting second-year students"
          </span>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by keywords or natural query: 'remote machine learning for first year students'..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleNlSearch()}
              className="w-full bg-midnight-bg border border-midnight-border text-xs px-3 py-2.5 pl-10 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-sans"
            />
          </div>
          <button
            onClick={handleNlSearch}
            disabled={isNlSearching || !query.trim()}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-midnight-bg font-bold text-xs transition-all shadow-[0_0_15px_rgba(103,232,249,0.25)] flex items-center gap-1.5 disabled:opacity-50 whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isNlSearching ? 'Parsing Filters...' : 'AI Filter'}
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-midnight-surface/80 p-4 rounded-2xl border border-midnight-border flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Left: Filter dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Domain */}
          <select
            value={selectedDomain}
            onChange={e => setSelectedDomain(e.target.value)}
            className="bg-midnight-bg border border-midnight-border text-xs px-3 py-1.5 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-400"
          >
            <option value="all">All Domains</option>
            <option value="AI/ML">AI / Machine Learning</option>
            <option value="Software Engineering">Software Engineering</option>
            <option value="Data Science">Data Science</option>
            <option value="Cybersecurity">Cybersecurity</option>
            <option value="Cloud & DevOps">Cloud & DevOps</option>
            <option value="Core CS & Systems">Core CS & Systems</option>
          </select>

          {/* Type */}
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="bg-midnight-bg border border-midnight-border text-xs px-3 py-1.5 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-400 capitalize"
          >
            <option value="all">All Opportunity Types</option>
            <option value="internship">Internship</option>
            <option value="research">Research Lab</option>
            <option value="open_source">Open Source</option>
            <option value="startup">Startup</option>
            <option value="student_program">Student Program</option>
          </select>

          {/* Work Mode */}
          <select
            value={selectedWorkMode}
            onChange={e => setSelectedWorkMode(e.target.value)}
            className="bg-midnight-bg border border-midnight-border text-xs px-3 py-1.5 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-400 capitalize"
          >
            <option value="all">Any Work Mode</option>
            <option value="remote">Remote Only</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">Onsite</option>
          </select>

          {/* Skill Filter */}
          <select
            value={selectedSkill}
            onChange={e => setSelectedSkill(e.target.value)}
            className="bg-midnight-bg border border-midnight-border text-xs px-3 py-1.5 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-400"
          >
            <option value="all">All Skills</option>
            {allSkillsList.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Eligible only toggle */}
          <button
            onClick={() => setEligibleOnly(!eligibleOnly)}
            className={`px-3 py-1.5 rounded-xl border font-mono transition-all flex items-center gap-1.5 ${
              eligibleOnly
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                : 'bg-midnight-bg text-slate-400 border-midnight-border hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Eligible Only</span>
          </button>
        </div>

        {/* Right: Sort controls & Reset */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="font-mono text-[11px]">Sort:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-midnight-bg border border-midnight-border text-xs px-2.5 py-1.5 rounded-xl text-slate-200 focus:outline-none"
            >
              <option value="match">Compatibility Score</option>
              <option value="deadline">Application Deadline</option>
              <option value="compensation">Stipend Amount</option>
            </select>
          </div>

          <button
            onClick={resetAllFilters}
            title="Reset Filters"
            className="p-1.5 rounded-xl bg-midnight-bg hover:bg-midnight-surface border border-midnight-border text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Result Count Status */}
      <div className="flex items-center justify-between text-xs text-slate-400 font-mono px-1">
        <span>Showing {filteredOpportunities.length} opportunities</span>
        <span>Deterministic Matching Engine Active</span>
      </div>

      {/* Empty State */}
      {filteredOpportunities.length === 0 ? (
        <div className="bg-midnight-surface rounded-2xl border border-midnight-border p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-base">No opportunities found matching these filters</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try resetting your domain or skill filters, or disable "Eligible Only" to explore prerequisite steps.
          </p>
          <button
            onClick={resetAllFilters}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-midnight-bg font-semibold text-xs rounded-xl transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOpportunities.map(({ opp, match }) => {
            const isSaved = savedOppIds.has(opp.id);
            const isEligible = match.eligibility === 'eligible';
            const isIneligible = match.eligibility === 'ineligible';

            return (
              <div
                key={opp.id}
                className="bg-midnight-surface rounded-2xl border border-midnight-border p-5 flex flex-col justify-between hover:border-cyan-500/30 transition-all shadow-lg group relative"
              >
                <div>
                  
                  {/* Top Bar: Org, Type, Save Button */}
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
                        onClick={() => toggleSaveOpportunity(opp.id)}
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
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400 font-mono mb-2.5">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      {opp.location} ({opp.work_mode})
                    </span>
                    {opp.compensation_text && (
                      <span className="text-slate-300">{opp.compensation_text}</span>
                    )}
                  </div>

                  {/* Eligibility Pill */}
                  <div className="mb-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                      isEligible
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : isIneligible
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}>
                      {isEligible ? <CheckCircle2 className="w-3 h-3" /> : isIneligible ? <XCircle className="w-3 h-3" /> : <HelpCircle className="w-3 h-3" />}
                      <span>{isEligible ? 'Eligible for You' : isIneligible ? 'Prerequisite Missing' : 'Verification Needed'}</span>
                    </span>
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

                {/* Card Bottom: Action links */}
                <div className="pt-3 border-t border-midnight-border flex items-center justify-between">
                  <button
                    onClick={() => setSelectedBreakdownOpp(opp)}
                    className="text-xs text-cyan-accent hover:underline flex items-center gap-1 font-mono"
                  >
                    Match Breakdown <Sparkles className="w-3 h-3" />
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
      )}

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
