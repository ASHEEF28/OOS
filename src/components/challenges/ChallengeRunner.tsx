import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Play, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  ShieldCheck, 
  Award, 
  HelpCircle,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { SkillChallenge, ChallengeSubmission } from '../../types';
import { evaluateSubmission } from '../../lib/challenges';
import { recordChallengeEvidence, getStoredProfile } from '../../lib/storage';
import { Link } from 'react-router-dom';

interface ChallengeRunnerProps {
  challenge: SkillChallenge;
  onSuccess?: (submission: ChallengeSubmission) => void;
}

export const ChallengeRunner: React.FC<ChallengeRunnerProps> = ({
  challenge,
  onSuccess,
}) => {
  const profile = getStoredProfile();
  const [code, setCode] = useState(challenge.starter_code);
  const [isRunning, setIsRunning] = useState(false);
  const [submission, setSubmission] = useState<ChallengeSubmission | null>(null);
  const [showHint, setShowHint] = useState(false);

  const handleRunTests = () => {
    setIsRunning(true);

    setTimeout(() => {
      const result = evaluateSubmission(challenge, code, profile.id);
      setSubmission(result);
      setIsRunning(false);

      if (result.score === 100) {
        // Trigger celebration
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#67E8F9', '#A78BFA', '#10B981'],
        });

        // Persist evidence
        recordChallengeEvidence(
          challenge.id,
          challenge.title,
          challenge.skill_name,
          result.score
        );

        if (onSuccess) onSuccess(result);
      }
    }, 400);
  };

  const handleResetCode = () => {
    if (window.confirm('Reset editor to initial starter code?')) {
      setCode(challenge.starter_code);
      setSubmission(null);
    }
  };

  return (
    <div className="bg-midnight-surface border border-midnight-border rounded-2xl overflow-hidden shadow-2xl flex flex-col lg:flex-row min-h-[640px]">
      
      {/* Left Column: Problem Brief & Instructions */}
      <div className="w-full lg:w-5/12 p-6 border-b lg:border-b-0 lg:border-r border-midnight-border flex flex-col justify-between overflow-y-auto">
        <div className="space-y-4">
          
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {challenge.skill_name} Benchmark
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{challenge.estimated_minutes} mins</span>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {challenge.title}
            </h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {challenge.description}
            </p>
          </div>

          {/* Difficulty and Evaluation Type */}
          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1 text-slate-300">
              <span className="text-slate-400">Difficulty:</span>
              <span className="capitalize text-amber-accent font-semibold">{challenge.difficulty}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-300">
              <span className="text-slate-400">Evaluator:</span>
              <span className="text-cyan-accent capitalize">{challenge.evaluation_type.replace('_', ' ')}</span>
            </div>
          </div>

          {/* Markdown Instructions */}
          <div className="p-4 rounded-xl bg-midnight-bg border border-midnight-border space-y-2 text-xs text-slate-300 leading-relaxed font-sans">
            <div className="prose prose-invert prose-xs max-w-none whitespace-pre-line">
              {challenge.instructions}
            </div>
          </div>

          {/* Test Case Overview */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              Validation Suite ({challenge.test_cases.length} deterministic test cases)
            </span>
            <div className="space-y-1.5">
              {challenge.test_cases.map((tc, idx) => (
                <div key={tc.id} className="p-2.5 rounded-lg bg-midnight-bg/60 border border-midnight-border text-[11px] flex items-center justify-between">
                  <span className="text-slate-300">Case {idx + 1}: {tc.description}</span>
                  <span className="text-slate-400 font-mono text-[10px]">Deterministic</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Hint toggle */}
        <div className="pt-4 border-t border-midnight-border mt-4">
          <button
            onClick={() => setShowHint(!showHint)}
            className="text-xs text-cyan-accent hover:underline flex items-center gap-1.5"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            {showHint ? 'Hide Guidance Hint' : 'Need a hint on the expected structure?'}
          </button>
          {showHint && (
            <div className="mt-2 p-3 rounded-lg bg-cyan-950/40 border border-cyan-800/40 text-[11px] text-cyan-200 leading-relaxed">
              Ensure you safely validate null/empty inputs. If an invalid value is received, skip it rather than throwing an exception.
            </div>
          )}
        </div>

      </div>

      {/* Right Column: Code Editor & Execution Results */}
      <div className="w-full lg:w-7/12 flex flex-col bg-[#0A0E1A]">
        
        {/* Editor Top Toolbar */}
        <div className="px-4 py-2.5 border-b border-midnight-border bg-midnight-surface/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            <span className="text-[11px] font-mono text-slate-400 ml-2">solution.{challenge.evaluation_type === 'sql_query' ? 'sql' : 'py'}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetCode}
              title="Reset Code"
              className="p-1 rounded text-slate-400 hover:text-white transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleRunTests}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-midnight-bg font-semibold text-xs transition-all shadow-[0_0_15px_rgba(103,232,249,0.3)] disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {isRunning ? 'Running Test Suite...' : 'Run Test Cases'}
            </button>
          </div>
        </div>

        {/* Code Input Area */}
        <div className="flex-1 p-4">
          <textarea
            value={code}
            onChange={e => setCode(e.target.value)}
            spellCheck="false"
            className="w-full h-80 lg:h-96 bg-transparent font-mono text-xs text-slate-100 resize-none focus:outline-none leading-relaxed"
            placeholder="Write your solution here..."
          />
        </div>

        {/* Execution Output Panel */}
        <div className="border-t border-midnight-border bg-midnight-bg/90 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono uppercase text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-accent" />
              Execution Output & Test Results
            </span>
            {submission && (
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                submission.score === 100
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                Score: {submission.score}% ({submission.tests_passed}/{submission.total_tests} Passed)
              </span>
            )}
          </div>

          {!submission ? (
            <div className="text-xs text-slate-400 font-mono py-4 text-center">
              Click "Run Test Cases" above to execute your solution against the deterministic verification suite.
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              
              {submission.score === 100 && (
                <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold">Skill Upgraded to Challenge-Assessed!</span>
                  </div>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-1 text-[11px] text-cyan-accent hover:underline font-mono"
                  >
                    View Recalculated Recommendations <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}

              {submission.test_results.map((tr) => (
                <div
                  key={tr.test_id}
                  className={`p-2.5 rounded-lg border text-xs font-mono flex flex-col gap-1 ${
                    tr.passed
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {tr.passed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-400" />
                      )}
                      <span>{tr.description}</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold">
                      {tr.passed ? 'PASSED' : 'FAILED'}
                    </span>
                  </div>
                  
                  {tr.error_message && (
                    <div className="text-[11px] text-rose-400/90 pl-5">
                      Reason: {tr.error_message}
                    </div>
                  )}

                  {!tr.passed && tr.expected_output && (
                    <div className="text-[10px] text-slate-400 pl-5 space-y-0.5">
                      <div>Expected: <code className="text-emerald-300">{tr.expected_output}</code></div>
                      <div>Actual: <code className="text-rose-300">{tr.actual_output || 'undefined'}</code></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
