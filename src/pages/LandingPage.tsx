import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  Network, 
  ShieldCheck, 
  Award, 
  Cpu, 
  CheckCircle2, 
  Layers, 
  Code2, 
  Zap,
  TrendingUp,
  Search,
  ExternalLink
} from 'lucide-react';
import { OpportunityGraph } from '../components/graph/OpportunityGraph';
import { getStoredProfile, getStoredSkills, getStoredProjects, getAllOpportunities } from '../lib/storage';

export const LandingPage: React.FC = () => {
  const profile = getStoredProfile();
  const skills = getStoredSkills();
  const projects = getStoredProjects();
  const opportunities = getAllOpportunities();

  const [activeTab, setActiveTab] = useState<'graph' | 'evidence' | 'simulator'>('graph');

  return (
    <div className="space-y-24 pb-16">
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center flex flex-col items-center">
        
        {/* Subtle pill tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-8 backdrop-blur-md shadow-[0_0_15px_rgba(103,232,249,0.15)] animate-pulse-subtle">
          <Sparkles className="w-3.5 h-3.5 text-cyan-accent" />
          <span>Next-Generation Career Intelligence for Students</span>
        </div>

        {/* Primary Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl leading-[1.1] mb-6">
          "Your potential is{' '}
          <span className="bg-gradient-to-r from-cyan-300 via-purple-300 to-amber-200 bg-clip-text text-transparent">
            bigger than your resume.
          </span>"
        </h1>

        {/* Supporting description */}
        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10">
          OpportunityOS is an evidence-driven discovery engine. We map what you know, benchmark practical skills, and simulate which high-value internships, research fellowships, and open-source roles you can unlock next.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-midnight-bg font-bold text-sm transition-all shadow-[0_0_25px_rgba(103,232,249,0.35)] flex items-center justify-center gap-2 group"
          >
            <span>Discover My Opportunities</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <Link
            to="/graph"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-midnight-surface hover:bg-midnight-hover border border-midnight-border text-slate-200 font-semibold text-sm transition-all flex items-center justify-center gap-2"
          >
            <Network className="w-4 h-4 text-cyan-accent" />
            <span>Explore Intelligence Graph</span>
          </Link>
        </div>

        {/* Micro Guarantee Proof */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Deterministic Compatibility Scoring</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-purple-accent" />
            <span>Test-Verified Skill Evidence</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-accent" />
            <span>Strict Eligibility Enforcement</span>
          </div>
        </div>

      </section>

      {/* Signature Interactive Intelligence Graph Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-midnight-surface/60 rounded-3xl border border-midnight-border p-3 sm:p-6 backdrop-blur-xl shadow-2xl">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-midnight-border gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-accent flex items-center gap-1">
                  <Network className="w-3.5 h-3.5" /> Live Knowledge Graph Preview
                </span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                The Opportunity Universe of a 2nd-Year BTech Student
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Click any node to inspect demonstrated skills, prerequisites, and connected opportunities.
              </p>
            </div>

            <Link
              to="/graph"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-midnight-bg hover:bg-midnight-surface border border-midnight-border text-xs text-cyan-accent font-semibold transition-colors"
            >
              Full Screen Mode <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <OpportunityGraph
            profile={profile}
            skills={skills}
            projects={projects}
            opportunities={opportunities}
            interactive={true}
            height="500px"
          />

        </div>
      </section>

      {/* The 3-Step Evidence-Driven Engine */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-[11px] font-mono text-cyan-accent uppercase tracking-widest block mb-2">
            HOW OPPORTUNITYOS WORKS
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Stop guessing keyword matches. Prove what you can build.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Step 1 */}
          <div className="bg-midnight-surface p-8 rounded-2xl border border-midnight-border space-y-4 hover:border-cyan-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <Code2 className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-mono text-cyan-300 font-bold">STEP 01</span>
            <h3 className="text-lg font-bold text-white">Discover Your Capabilities</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Move beyond self-reported bullet points. Complete practical, deterministic skill challenges and link public project repositories to establish verified skill evidence.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-midnight-surface p-8 rounded-2xl border border-midnight-border space-y-4 hover:border-purple-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <Network className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-mono text-purple-300 font-bold">STEP 02</span>
            <h3 className="text-lg font-bold text-white">Explore Your Opportunity Universe</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Our graph maps your real curriculum and verified capabilities against 30+ real research labs, open-source initiatives, and engineering internships with 100% transparent scoring.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-midnight-surface p-8 rounded-2xl border border-midnight-border space-y-4 hover:border-amber-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Cpu className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-mono text-amber-300 font-bold">STEP 03</span>
            <h3 className="text-lg font-bold text-white">Simulate & Unlock Your Next Move</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Use the Career What-If Simulator to see exactly how completing one mini-project or mastering a missing library like PyTorch raises your match score and unlocks top fellowships.
            </p>
          </div>

        </div>
      </section>

      {/* Feature Deep Dive: Proof of Skill & What-If Simulator */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-mono">
              <Award className="w-3.5 h-3.5" />
              <span>PROOF OF SKILL BENCHMARKS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Evidence speaks louder than claims on a PDF.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Companies and research mentors receive hundreds of identical resumes claiming "Python & Machine Learning". OpportunityOS separates self-reported claims from verified capability through deterministic coding test suites.
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Automated deterministic test execution</h4>
                  <p className="text-xs text-slate-400">Run code directly against test cases to earn the Challenge-Assessed status.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 mt-0.5">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Real-time recommendation recalculation</h4>
                  <p className="text-xs text-slate-400">Completing a benchmark updates your knowledge graph connections immediately.</p>
                </div>
              </div>
            </div>

            <Link
              to="/proof-of-skill"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors shadow-lg"
            >
              <span>Try a Skill Challenge</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Interactive Preview Card */}
          <div className="bg-midnight-surface p-6 rounded-2xl border border-midnight-border space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-midnight-border">
              <span className="text-xs font-mono text-cyan-accent">Challenge Spotlight</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                100% Deterministic
              </span>
            </div>
            
            <h3 className="font-bold text-base text-white">Clean & Aggregate Sensor Telemetry</h3>
            <p className="text-xs text-slate-400">
              Filter corrupted sensor measurements, handle nulls, and return structured aggregated summaries.
            </p>
            
            <div className="bg-midnight-bg p-3 rounded-lg font-mono text-xs text-cyan-200 border border-midnight-border">
              <code>def aggregate_sensor_data(readings):</code><br/>
              <code className="text-slate-500 pl-4"># Filters nulls & computes device averages</code><br/>
              <code className="text-emerald-400 pl-4">return &#123; sensor_id: stats &#125;</code>
            </div>

            <div className="flex items-center justify-between pt-2 text-xs">
              <span className="text-slate-400">Pass Rate: 82%</span>
              <Link to="/proof-of-skill" className="text-cyan-accent font-semibold hover:underline flex items-center gap-1">
                Launch Runner <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Call to action banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-midnight-surface via-[#131f38] to-midnight-surface border border-cyan-500/30 p-8 sm:p-14 text-center overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-5">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ready to explore your opportunity universe?
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Launch demo mode immediately or customize your student profile to discover internships built for where you are today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/dashboard"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-midnight-bg font-bold text-sm transition-all shadow-lg"
              >
                Launch Demo Command Center
              </Link>
              <Link
                to="/onboarding"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-midnight-bg hover:bg-midnight-surface border border-midnight-border text-slate-200 font-semibold text-sm transition-all"
              >
                Create Custom Student Profile
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
