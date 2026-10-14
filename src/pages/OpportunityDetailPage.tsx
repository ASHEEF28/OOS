import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Sparkles, 
  Bookmark, 
  BookmarkCheck, 
  ExternalLink, 
  Building2, 
  MapPin, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Award, 
  ArrowRight,
  Briefcase
} from 'lucide-react';
import { 
  getOpportunityById, 
  getStoredProfile, 
  getStoredSkills, 
  getStoredApplications, 
  toggleSaveOpportunity,
  updateApplicationStatus
} from '../lib/storage';
import { calculateOpportunityMatch } from '../lib/matching';
import { formatDate } from '../lib/utils';
import { ApplicationStatus } from '../types';

export const OpportunityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const profile = getStoredProfile();
  const skills = getStoredSkills();
  const applications = getStoredApplications();

  const opportunity = getOpportunityById(id || '');

  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus>(() => {
    const existing = applications.find(a => a.opportunity_id === id);
    return existing ? existing.status : 'saved';
  });
  const [trackerNote, setTrackerNote] = useState('');
  const [showStatusSavedMsg, setShowStatusSavedMsg] = useState(false);

  const match = useMemo(() => {
    if (!opportunity) return null;
    return calculateOpportunityMatch(opportunity, profile, skills);
  }, [opportunity, profile, skills]);

  const isSaved = useMemo(() => {
    return applications.some(a => a.opportunity_id === id && a.status === 'saved');
  }, [applications, id]);

  if (!opportunity || !match) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Opportunity Not Found</h2>
        <p className="text-xs text-slate-400">The requested opportunity listing could not be located in the catalog.</p>
        <Link to="/opportunities" className="inline-block px-4 py-2 bg-cyan-500 text-midnight-bg rounded-xl font-semibold text-xs">
          Back to Explorer
        </Link>
      </div>
    );
  }

  const isEligible = match.eligibility === 'eligible';
  const isIneligible = match.eligibility === 'ineligible';

  const handleUpdateTracker = (newStatus: ApplicationStatus) => {
    setApplicationStatus(newStatus);
    updateApplicationStatus(opportunity.id, newStatus, trackerNote);
    setShowStatusSavedMsg(true);
    setTimeout(() => setShowStatusSavedMsg(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back button */}
      <div>
        <Link
          to="/opportunities"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Opportunities
        </Link>
      </div>

      {/* Main Top Header Card */}
      <div className="bg-midnight-surface p-6 sm:p-8 rounded-3xl border border-midnight-border shadow-2xl space-y-6">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-midnight-border">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {opportunity.opportunity_type.replace('_', ' ')}
              </span>
              <span className="text-xs text-slate-400 font-mono">• {opportunity.domain}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {opportunity.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 font-mono">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-cyan-accent" />
                {opportunity.organization}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-400" />
                {opportunity.location} ({opportunity.work_mode})
              </span>
              {opportunity.deadline && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-accent" />
                  Deadline: {formatDate(opportunity.deadline)}
                </span>
              )}
            </div>
          </div>

          {/* Score Badge */}
          <div className="flex flex-col items-end gap-2">
            <div className="bg-midnight-bg px-4 py-3 rounded-2xl border border-midnight-border text-center min-w-[130px]">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-0.5">
                Compatibility
              </span>
              <div className="text-3xl font-black font-mono text-cyan-accent">
                {match.total_score}%
              </div>
              <span className={`text-[10px] font-mono font-semibold block ${isEligible ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isEligible ? 'Eligible' : 'Prereq Missing'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleSaveOpportunity(opportunity.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-semibold transition-all ${
                isSaved
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                  : 'bg-midnight-bg text-slate-300 hover:text-white border-midnight-border'
              }`}
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              <span>{isSaved ? 'Saved to Tracker' : 'Save Opportunity'}</span>
            </button>

            {/* Quick Status Picker */}
            <div className="flex items-center gap-1.5 bg-midnight-bg border border-midnight-border px-3 py-1.5 rounded-xl text-xs">
              <span className="text-[11px] font-mono text-slate-400">Status:</span>
              <select
                value={applicationStatus}
                onChange={e => handleUpdateTracker(e.target.value as ApplicationStatus)}
                className="bg-transparent text-slate-200 text-xs focus:outline-none capitalize font-medium"
              >
                <option value="saved" className="bg-midnight-surface">Saved</option>
                <option value="planning" className="bg-midnight-surface">Planning to Apply</option>
                <option value="applied" className="bg-midnight-surface">Applied</option>
                <option value="interview" className="bg-midnight-surface">Interview</option>
                <option value="offer" className="bg-midnight-surface">Offer</option>
                <option value="rejected" className="bg-midnight-surface">Rejected</option>
              </select>
            </div>
            {showStatusSavedMsg && (
              <span className="text-xs text-emerald-400 font-mono animate-fade-in">Updated in tracker!</span>
            )}
          </div>

          <a
            href={opportunity.application_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-midnight-bg font-bold text-xs transition-all shadow-[0_0_15px_rgba(103,232,249,0.3)]"
          >
            <span>Open Source Application Link</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

        </div>

      </div>

      {/* Main Grid: Details + Match Engine Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Description & Program Information */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-midnight-surface p-6 rounded-2xl border border-midnight-border space-y-4">
            <h3 className="font-bold text-base text-white">Program Overview</h3>
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
              {opportunity.description}
            </p>

            {opportunity.compensation_text && (
              <div className="p-3 rounded-xl bg-midnight-bg border border-midnight-border flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono">Financial Compensation / Stipend:</span>
                <span className="font-semibold text-emerald-400 font-mono">{opportunity.compensation_text}</span>
              </div>
            )}
          </div>

          {/* Skill Requirements */}
          <div className="bg-midnight-surface p-6 rounded-2xl border border-midnight-border space-y-4">
            <h3 className="font-bold text-base text-white">Required & Preferred Skills</h3>
            
            <div className="space-y-3">
              <div>
                <span className="text-xs text-slate-400 font-medium block mb-2">Mandatory Required Skills:</span>
                <div className="flex flex-wrap gap-2">
                  {opportunity.required_skills.map(sk => {
                    const isDemonstrated = match.skills_matched.includes(sk);
                    return (
                      <span
                        key={sk}
                        className={`px-3 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 ${
                          isDemonstrated
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {isDemonstrated ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-rose-400" />}
                        {sk} ({isDemonstrated ? 'Demonstrated' : 'Missing'})
                      </span>
                    );
                  })}
                </div>
              </div>

              {opportunity.preferred_skills.length > 0 && (
                <div className="pt-2">
                  <span className="text-xs text-slate-400 font-medium block mb-2">Preferred / Bonus Skills:</span>
                  <div className="flex flex-wrap gap-2">
                    {opportunity.preferred_skills.map(sk => (
                      <span key={sk} className="px-2.5 py-1 rounded-lg bg-midnight-bg border border-midnight-border text-slate-300 text-xs font-mono">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Related Actionable Projects to Demonstrate Missing Skills */}
          {match.skills_missing.length > 0 && (
            <div className="bg-gradient-to-r from-purple-950/30 to-midnight-surface p-6 rounded-2xl border border-purple-500/30 space-y-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-accent" />
                <h4 className="font-bold text-sm text-white">Unlock Missing Skills for this Opportunity</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                You currently lack verified evidence for <strong className="text-white">{match.skills_missing.join(', ')}</strong>. Demonstrating these via a quick coding challenge or academic project unlocks full compatibility.
              </p>
              <div className="pt-2 flex items-center gap-3">
                <Link
                  to="/proof-of-skill"
                  className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
                >
                  <span>Go to Proof of Skill</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/simulator"
                  className="text-xs text-purple-300 hover:underline"
                >
                  Simulate score delta in What-If
                </Link>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Explainable Scoring Breakdown */}
        <div className="space-y-6">
          
          <div className="bg-midnight-surface p-6 rounded-2xl border border-midnight-border space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-midnight-border">
              <Sparkles className="w-4 h-4 text-cyan-accent" />
              <h3 className="font-bold text-sm text-white">Transparent Match Breakdown</h3>
            </div>

            {/* Eligibility Banner */}
            <div className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
              isEligible
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                : isIneligible
                ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
            }`}>
              {isEligible ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : isIneligible ? (
                <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <span className="font-bold">{isEligible ? 'Eligible' : isIneligible ? 'Ineligible' : 'Unknown'}</span>
                <p className="text-[11px] opacity-90">
                  {isEligible ? match.eligibility_reasons[0] : match.ineligibility_reasons[0] || match.unknown_factors[0]}
                </p>
              </div>
            </div>

            {/* Category breakdown bars */}
            <div className="space-y-3 text-xs">
              
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Relevant Skills</span>
                  <span className="font-mono text-cyan-accent font-bold">{match.skills_score}/40</span>
                </div>
                <div className="w-full bg-midnight-bg h-1.5 rounded-full overflow-hidden">
                  <div className="bg-cyan-accent h-full" style={{ width: `${(match.skills_score / 40) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Academic Eligibility</span>
                  <span className="font-mono text-purple-accent font-bold">{match.academic_score}/20</span>
                </div>
                <div className="w-full bg-midnight-bg h-1.5 rounded-full overflow-hidden">
                  <div className="bg-purple-accent h-full" style={{ width: `${(match.academic_score / 20) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Interest Alignment</span>
                  <span className="font-mono text-amber-accent font-bold">{match.interest_score}/15</span>
                </div>
                <div className="w-full bg-midnight-bg h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-accent h-full" style={{ width: `${(match.interest_score / 15) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Work Mode & Location</span>
                  <span className="font-mono text-emerald-400 font-bold">{match.work_mode_score}/15</span>
                </div>
                <div className="w-full bg-midnight-bg h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full" style={{ width: `${(match.work_mode_score / 15) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Experience Level Fit</span>
                  <span className="font-mono text-slate-300 font-bold">{match.experience_score}/10</span>
                </div>
                <div className="w-full bg-midnight-bg h-1.5 rounded-full overflow-hidden">
                  <div className="bg-slate-400 h-full" style={{ width: `${(match.experience_score / 10) * 100}%` }} />
                </div>
              </div>

            </div>

            {/* Strategic Advice */}
            <div className="p-3.5 bg-midnight-bg rounded-xl border border-midnight-border space-y-1 text-xs">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Executive Summary:</span>
              <p className="text-slate-300 leading-relaxed">
                {match.executive_summary}
              </p>
            </div>

          </div>

          {/* Verification Details */}
          <div className="bg-midnight-surface p-5 rounded-2xl border border-midnight-border text-xs text-slate-400 font-mono space-y-2">
            <div className="flex items-center gap-1.5 text-cyan-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified Public Opportunity</span>
            </div>
            <div>Source: {opportunity.source_name}</div>
            <div>Last verified: {opportunity.last_verified_at || 'Recently audited'}</div>
            <div>Type: {opportunity.is_demo_data ? 'Educational Demonstration Entry' : 'Curated Public Program'}</div>
          </div>

        </div>

      </div>

    </div>
  );
};
