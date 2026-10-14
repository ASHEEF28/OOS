import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Network, ArrowRight, Lock, Mail, User, ShieldCheck } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { saveStoredProfile, getStoredProfile } from '../lib/storage';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      // In demo / offline mode, initialize user profile and redirect to onboarding!
      const current = getStoredProfile();
      saveStoredProfile({
        ...current,
        id: `user-${Date.now()}`,
        display_name: name,
        email,
        onboarding_completed: false,
      });
      navigate('/onboarding');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: name }
        }
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        navigate('/onboarding');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border border-cyan-500/40 mx-auto flex items-center justify-center text-cyan-accent shadow-[0_0_20px_rgba(103,232,249,0.2)]">
            <Network className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Create your Opportunity<span className="text-cyan-accent">OS</span> Profile
          </h2>
          <p className="text-xs text-slate-400">
            Build your evidence graph and discover internships matching what you can build.
          </p>
        </div>

        <form onSubmit={handleSignup} className="bg-midnight-surface p-6 rounded-2xl border border-midnight-border space-y-4">
          
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300">
              {errorMsg}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="e.g. Priya Patel"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-midnight-bg border border-midnight-border text-xs px-3 py-2 pl-9 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

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
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-midnight-bg border border-midnight-border text-xs px-3 py-2 pl-9 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-midnight-bg font-bold text-xs transition-all shadow-[0_0_15px_rgba(103,232,249,0.3)] flex items-center justify-center gap-2"
          >
            <span>Continue to Guided Onboarding</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {!isSupabaseConfigured && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono justify-center pt-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Offline / Local Storage Persistence active</span>
            </div>
          )}

        </form>

        <p className="text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-cyan-accent hover:underline font-medium">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
};
