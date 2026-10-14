import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Network, Sparkles, ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSupabaseLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      setErrorMsg('Supabase is not configured yet. Please use the 1-Click Demo Mode below to experience OpportunityOS.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLaunchDemo = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border border-cyan-500/40 mx-auto flex items-center justify-center text-cyan-accent shadow-[0_0_20px_rgba(103,232,249,0.2)]">
            <Network className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Sign in to Opportunity<span className="text-cyan-accent">OS</span>
          </h2>
          <p className="text-xs text-slate-400">
            Access your evidence graph, recommendations, and simulation workspace.
          </p>
        </div>

        {/* Interactive Demo Mode Shortcut (Prominent for Judges) */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-midnight-surface to-purple-950/40 border border-cyan-500/40 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-300 font-semibold">
              <Sparkles className="w-4 h-4 text-cyan-accent" />
              <span>Hackathon Judge Demo Access</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Instant
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Experience the complete user journey as <strong className="text-white">Aarav Sharma</strong> (2nd-Year BTech, NITK) with preloaded skills, interactive graph, and proof-of-skill challenges.
          </p>
          <button
            onClick={handleLaunchDemo}
            className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-midnight-bg font-bold text-xs transition-all shadow-[0_0_15px_rgba(103,232,249,0.3)] flex items-center justify-center gap-2"
          >
            <span>Enter Interactive Demo Mode</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <div className="flex-1 h-px bg-midnight-border" />
          <span>Or sign in with credentials</span>
          <div className="flex-1 h-px bg-midnight-border" />
        </div>

        {/* Supabase Form */}
        <form onSubmit={handleSupabaseLogin} className="bg-midnight-surface p-6 rounded-2xl border border-midnight-border space-y-4">
          
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 leading-relaxed">
              {errorMsg}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                placeholder="student@university.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-midnight-bg border border-midnight-border text-xs px-3 py-2 pl-9 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-midnight-bg border border-midnight-border text-xs px-3 py-2 pl-9 pr-9 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-white absolute right-3 top-2.5"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-midnight-bg hover:bg-midnight-hover border border-midnight-border text-slate-200 font-semibold text-xs transition-colors disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In with Supabase'}
          </button>

          {!isSupabaseConfigured && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono justify-center pt-2">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-accent" />
              <span>Supabase status: Not configured (Demo mode ready)</span>
            </div>
          )}

        </form>

        <p className="text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/signup" className="text-cyan-accent hover:underline font-medium">
            Sign up
          </Link>
        </p>

      </div>
    </div>
  );
};
