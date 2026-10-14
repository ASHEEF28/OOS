import React from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Sparkles, 
  GraduationCap, 
  Compass, 
  MapPin, 
  Briefcase, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Opportunity, MatchScoreBreakdown } from '../../types';
import { Link } from 'react-router-dom';

interface MatchBreakdownModalProps {
  opportunity: Opportunity;
  breakdown: MatchScoreBreakdown;
  isOpen: boolean;
  onClose: () => void;
}

export const MatchBreakdownModal: React.FC<MatchBreakdownModalProps> = ({
  opportunity,
  breakdown,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const isEligible = breakdown.eligibility === 'eligible';
  const isIneligible = breakdown.eligibility === 'ineligible';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-midnight-surface border border-midnight-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-midnight-border flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-accent flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Explainable Matching Intelligence
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {opportunity.title}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">{opportunity.organization} • {opportunity.location}</p>
          </div>
          
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1">
          
          {/* Eligibility Banner */}
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${
            isEligible
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
              : isIneligible
              ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
              : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
          }`}>
            {isEligible ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            ) : isIneligible ? (
              <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="text-xs space-y-1">
              <div className="font-semibold text-sm">
                {isEligible
                  ? 'Officially Eligible for Application'
                  : isIneligible
                  ? 'Mandatory Prerequisite Blocker Detected'
                  : 'Eligibility Requires Manual Verification'}
              </div>
              <p className="leading-relaxed opacity-90">
                {isEligible
                  ? breakdown.eligibility_reasons.join('. ')
                  : isIneligible
                  ? breakdown.ineligibility_reasons.join('. ')
                  : breakdown.unknown_factors.join('. ')}
              </p>
            </div>
          </div>

          {/* Compatibility Breakdown (Score Grid) */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            
            {/* Skills */}
            <div className="bg-midnight-bg p-3.5 rounded-xl border border-midnight-border text-center">
              <span className="text-[10px] font-mono text-slate-400 block mb-1">SKILLS</span>
              <div className="text-xl font-bold font-mono text-cyan-accent">
                {breakdown.skills_score}<span className="text-xs text-slate-400">/40</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                {breakdown.skills_matched.length} of {opportunity.required_skills.length} req
              </span>
            </div>

            {/* Academic */}
            <div className="bg-midnight-bg p-3.5 rounded-xl border border-midnight-border text-center">
              <span className="text-[10px] font-mono text-slate-400 block mb-1">ACADEMIC</span>
              <div className="text-xl font-bold font-mono text-purple-accent">
                {breakdown.academic_score}<span className="text-xs text-slate-400">/20</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Course & Year</span>
            </div>

            {/* Interest */}
            <div className="bg-midnight-bg p-3.5 rounded-xl border border-midnight-border text-center">
              <span className="text-[10px] font-mono text-slate-400 block mb-1">INTEREST</span>
              <div className="text-xl font-bold font-mono text-amber-accent">
                {breakdown.interest_score}<span className="text-xs text-slate-400">/15</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Domain focus</span>
            </div>

            {/* Work Mode */}
            <div className="bg-midnight-bg p-3.5 rounded-xl border border-midnight-border text-center">
              <span className="text-[10px] font-mono text-slate-400 block mb-1">WORK MODE</span>
              <div className="text-xl font-bold font-mono text-emerald-400">
                {breakdown.work_mode_score}<span className="text-xs text-slate-400">/15</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block capitalize">{opportunity.work_mode}</span>
            </div>

            {/* Experience */}
            <div className="bg-midnight-bg p-3.5 rounded-xl border border-midnight-border text-center col-span-2 sm:col-span-1">
              <span className="text-[10px] font-mono text-slate-400 block mb-1">EXPERIENCE</span>
              <div className="text-xl font-bold font-mono text-slate-200">
                {breakdown.experience_score}<span className="text-xs text-slate-400">/10</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Entry friendly</span>
            </div>

          </div>

          {/* Grounded Executive Summary */}
          <div className="bg-midnight-bg/60 p-4 rounded-xl border border-midnight-border/80 space-y-2">
            <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-accent" />
              Intelligence Narrative
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {breakdown.executive_summary}
            </p>
          </div>

          {/* Detailed Match Factors */}
          <div className="space-y-4 text-xs">
            
            {/* Matched Skills vs Missing Skills */}
            <div className="space-y-2">
              <span className="text-slate-400 font-medium block">Required Skills Analysis:</span>
              <div className="flex flex-wrap gap-2">
                {breakdown.skills_matched.map(skill => (
                  <span key={skill} className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-[11px] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    {skill} (Demonstrated)
                  </span>
                ))}
                {breakdown.skills_missing.map(skill => (
                  <span key={skill} className="px-2.5 py-1 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-300 font-mono text-[11px] flex items-center gap-1">
                    <XCircle className="w-3 h-3 text-rose-400" />
                    {skill} (Missing)
                  </span>
                ))}
              </div>
            </div>

            {/* Academic Fit */}
            <div className="p-3 bg-midnight-bg rounded-lg border border-midnight-border flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-300">
                <GraduationCap className="w-4 h-4 text-purple-accent" />
                <span>Academic Fit: {breakdown.academic_match_details}</span>
              </div>
              <span className="font-mono text-purple-300">{breakdown.academic_score}/20 pts</span>
            </div>

            {/* Work Mode & Location */}
            <div className="p-3 bg-midnight-bg rounded-lg border border-midnight-border flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>{breakdown.work_mode_details}</span>
              </div>
              <span className="font-mono text-emerald-400">{breakdown.work_mode_score}/15 pts</span>
            </div>

          </div>

          {/* Actionable Next Move */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-midnight-surface to-purple-950/40 border border-cyan-500/30">
            <span className="text-[11px] font-mono text-cyan-accent uppercase tracking-wider block mb-1">
              Recommended Next Move
            </span>
            <p className="text-xs text-slate-200 mb-3 leading-relaxed">
              {breakdown.nextActionUnlock}
            </p>
            <div className="flex items-center gap-3">
              <Link
                to="/proof-of-skill"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-midnight-bg font-semibold text-xs transition-colors"
              >
                Go to Proof of Skill <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/simulator"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-midnight-surface hover:bg-midnight-hover border border-midnight-border text-slate-200 text-xs transition-colors"
              >
                Simulate Impact in What-If
              </Link>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-midnight-border flex items-center justify-between bg-midnight-bg/40">
          <div className="text-xs text-slate-400">
            Total Compatibility: <span className="font-mono font-bold text-white text-base">{breakdown.total_score}%</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-midnight-surface hover:bg-midnight-hover border border-midnight-border text-slate-200 text-xs font-medium transition-colors"
          >
            Close Breakdown
          </button>
        </div>

      </div>
    </div>
  );
};
