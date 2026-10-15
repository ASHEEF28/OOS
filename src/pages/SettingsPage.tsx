import React, { useState } from 'react';
import { 
  Terminal, 
  Key, 
  RotateCcw, 
  ShieldCheck, 
  Check, 
  Sparkles, 
  AlertTriangle,
  Server,
  Lock,
  Database
} from 'lucide-react';
import { getStoredAiConfig, saveStoredAiConfig, resetDemoData, AiConfig } from '../lib/storage';
import { 
  getSupabaseUrl, 
  getSupabaseAnonKey, 
  saveSupabaseCredentials, 
  testSupabaseConnection 
} from '../lib/supabase';

export const SettingsPage: React.FC = () => {
  const [aiConfig, setAiConfig] = useState<AiConfig>(getStoredAiConfig());
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testing, setTesting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Supabase state
  const [supabaseUrl, setSupabaseUrl] = useState(getSupabaseUrl());
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(getSupabaseAnonKey());
  const [supabaseStatus, setSupabaseStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);

  const handleSaveSupabase = () => {
    saveSupabaseCredentials(supabaseUrl, supabaseAnonKey);
    setSupabaseStatus({ success: true, message: 'Supabase credentials saved successfully!' });
    setTimeout(() => setSupabaseStatus(null), 3000);
  };

  const handleTestSupabase = async () => {
    setIsTestingSupabase(true);
    setSupabaseStatus(null);
    saveSupabaseCredentials(supabaseUrl, supabaseAnonKey);
    const res = await testSupabaseConnection();
    setSupabaseStatus(res);
    setIsTestingSupabase(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredAiConfig(aiConfig);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleTestConnection = async () => {
    if (!aiConfig.apiKey) {
      setTestResult({ success: false, message: 'Please provide an API key to test the connection.' });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const endpoint = aiConfig.endpoint.replace(/\/+$/, '');
      const res = await fetch(`${endpoint}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aiConfig.apiKey}`,
        },
        body: JSON.stringify({
          model: aiConfig.model,
          messages: [{ role: 'user', content: 'Say hello in 3 words' }],
          max_tokens: 10,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content || 'Connected successfully';
        setTestResult({ success: true, message: `Model responded: "${reply.trim()}"` });
      } else {
        setTestResult({ success: false, message: `Provider error status: ${res.status} ${res.statusText}` });
      }
    } catch (e: any) {
      setTestResult({ success: false, message: `Network / endpoint error: ${e.message}` });
    } finally {
      setTesting(false);
    }
  };

  const handleResetDemoData = () => {
    if (window.confirm('Reset all demo student profiles, challenges, and opportunities to baseline demo data?')) {
      resetDemoData();
      alert('Demo data reset to initial baseline successfully.');
      window.location.reload();
    }
  };

  const providers = [
    { id: 'openai', name: 'OpenAI (GPT-4o-mini)', endpoint: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
    { id: 'groq', name: 'Groq (Llama 3.3 70B)', endpoint: 'https://api.groq.com/openai/v1', model: 'llama-3.3-70b-versatile' },
    { id: 'deepseek', name: 'DeepSeek (Chat)', endpoint: 'https://api.deepseek.com/v1', model: 'deepseek-chat' },
    { id: 'ollama', name: 'Local Ollama', endpoint: 'http://localhost:11434/v1', model: 'llama3' },
    { id: 'custom', name: 'Custom OpenAI-Compatible', endpoint: '', model: '' },
  ];

  const handleProviderSelect = (pId: any) => {
    const found = providers.find(p => p.id === pId);
    if (found) {
      setAiConfig({
        ...aiConfig,
        provider: pId,
        endpoint: found.endpoint || aiConfig.endpoint,
        model: found.model || aiConfig.model,
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-midnight-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono text-cyan-accent uppercase tracking-widest flex items-center gap-1">
              <Terminal className="w-3.5 h-3.5" /> System & AI Integration
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Settings & Provider Config
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure universal OpenAI-compatible AI providers, test endpoints, and manage demo environments.
          </p>
        </div>

        {savedSuccess && (
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono flex items-center gap-1.5 animate-in fade-in">
            <Check className="w-4 h-4" /> AI configuration saved!
          </div>
        )}
      </div>

      <div className="space-y-6">
        
        {/* AI Provider Settings Form */}
        <form onSubmit={handleSave} className="bg-midnight-surface p-6 rounded-2xl border border-midnight-border space-y-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-midnight-border">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-accent" />
              Provider-Independent AI Configuration
            </h3>
            <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Deterministic Fallback Active
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            OpportunityOS runs complete workflows offline using deterministic matching and rule algorithms. Connecting a key enables dynamic resume parsing, natural-language query expansion, and AI match summaries.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Provider Preset */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Provider Preset</label>
              <select
                value={aiConfig.provider}
                onChange={e => handleProviderSelect(e.target.value)}
                className="w-full bg-midnight-bg border border-midnight-border text-xs px-3 py-2 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-400"
              >
                {providers.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Model Name */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Model Name</label>
              <input
                type="text"
                value={aiConfig.model}
                onChange={e => setAiConfig({ ...aiConfig, model: e.target.value })}
                placeholder="e.g. gpt-4o-mini, llama-3.3-70b-versatile, deepseek-chat"
                className="w-full bg-midnight-bg border border-midnight-border text-xs px-3 py-2 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Endpoint */}
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300 block mb-1">API Base Endpoint</label>
              <input
                type="text"
                value={aiConfig.endpoint}
                onChange={e => setAiConfig({ ...aiConfig, endpoint: e.target.value })}
                placeholder="https://api.openai.com/v1"
                className="w-full bg-midnight-bg border border-midnight-border text-xs px-3 py-2 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            {/* API Key */}
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300 block mb-1">API Key</label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={aiConfig.apiKey}
                  onChange={e => setAiConfig({ ...aiConfig, apiKey: e.target.value })}
                  placeholder="sk-••••••••••••••••••••••••••••••••"
                  className="w-full bg-midnight-bg border border-midnight-border text-xs px-3 py-2 pl-9 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>
              <span className="text-[10px] text-slate-500 font-mono block mt-1">
                Keys remain private to your local browser session and are never logged or stored on remote servers.
              </span>
            </div>

          </div>

          {/* Test connection results */}
          {testResult && (
            <div className={`p-3 rounded-xl border text-xs font-mono ${
              testResult.success
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
            }`}>
              {testResult.message}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-midnight-border">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing}
              className="px-4 py-2 rounded-xl bg-midnight-bg hover:bg-midnight-hover border border-midnight-border text-xs text-slate-200 font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <Server className="w-3.5 h-3.5 text-cyan-accent" />
              <span>{testing ? 'Testing Endpoint...' : 'Test Connection'}</span>
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-midnight-bg font-bold text-xs transition-colors shadow-md flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" /> Save Configuration
            </button>
          </div>
        </form>

        {/* Supabase Database & Auth Configuration */}
        <div className="bg-midnight-surface p-6 rounded-2xl border border-midnight-border space-y-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-midnight-border">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-sm text-white">Supabase Cloud Database & Auth</h3>
            </div>
            <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
              gwemjmpsbqqybkrgxceg
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Project Endpoint URL</label>
              <input
                type="text"
                value={supabaseUrl}
                onChange={e => setSupabaseUrl(e.target.value)}
                placeholder="https://gwemjmpsbqqybkrgxceg.supabase.co"
                className="w-full bg-midnight-bg border border-midnight-border text-xs px-3 py-2 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Supabase Anon Key (Public API Key)</label>
              <input
                type="password"
                value={supabaseAnonKey}
                onChange={e => setSupabaseAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full bg-midnight-bg border border-midnight-border text-xs px-3 py-2 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {supabaseStatus && (
            <div className={`p-3 rounded-xl border text-xs font-mono ${
              supabaseStatus.success
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
            }`}>
              {supabaseStatus.message}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleSaveSupabase}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-midnight-bg font-bold text-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" /> Save Supabase Keys
            </button>

            <button
              type="button"
              onClick={handleTestSupabase}
              disabled={isTestingSupabase}
              className="px-4 py-2 rounded-xl bg-midnight-bg hover:bg-midnight-hover border border-midnight-border text-xs text-slate-200 font-semibold transition-colors flex items-center gap-1.5"
            >
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isTestingSupabase ? 'Verifying...' : 'Test Supabase Connection'}</span>
            </button>
          </div>

          <div className="p-3 bg-midnight-bg rounded-xl border border-midnight-border/80 text-[11px] text-slate-400 space-y-1">
            <span className="font-semibold text-slate-300 block">Database Migration Tip:</span>
            <p>
              Your project database schema with Row Level Security is stored in <code className="text-cyan-accent">supabase/migrations/20261014_init.sql</code>. Copy and run it in the Supabase Dashboard SQL Editor to initialize all tables and policies.
            </p>
          </div>
        </div>

        {/* Demo Mode Reset Section */}
        <div className="bg-midnight-surface p-6 rounded-2xl border border-midnight-border space-y-4 shadow-xl">
          <div className="flex items-center gap-2 pb-3 border-b border-midnight-border">
            <RotateCcw className="w-4 h-4 text-amber-accent" />
            <h3 className="font-bold text-sm text-white">Reset Demo Environment</h3>
          </div>
          
          <p className="text-xs text-slate-300 leading-relaxed">
            Resetting clears any test submissions or added simulated projects, restoring the original student baseline (Aarav Sharma, 2nd-Year BTech) and initial opportunity states.
          </p>

          <button
            onClick={handleResetDemoData}
            className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-semibold text-xs transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Demo State to Baseline
          </button>
        </div>

        {/* Security & Reliability Architecture Statement */}
        <div className="bg-midnight-surface p-6 rounded-2xl border border-midnight-border space-y-3 shadow-xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>Platform Security & Architectural Integrity</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            OpportunityOS enforces zero-trust data boundaries. Hard eligibility conditions (degree requirements, study year restrictions, mandatory locations) are evaluated deterministically in TypeScript and PostgreSQL before any recommendation is scored. AI models cannot hallucinate eligibility or forge test results.
          </p>
        </div>

      </div>

    </div>
  );
};
