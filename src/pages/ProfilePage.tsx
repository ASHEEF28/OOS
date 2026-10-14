import React, { useState } from 'react';
import { 
  User, 
  GraduationCap, 
  Code2, 
  FolderGit2, 
  ShieldCheck, 
  Check, 
  Plus, 
  Trash2, 
  RotateCcw,
  ExternalLink,
  Award,
  Link as LinkIcon
} from 'lucide-react';
import { 
  getStoredProfile, 
  saveStoredProfile, 
  getStoredSkills, 
  saveStoredSkills, 
  getStoredProjects, 
  saveStoredProjects,
  getStoredEvidence,
  resetDemoData 
} from '../lib/storage';
import { Profile, ProfileSkill, Project, SkillLevel } from '../types';

export const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<Profile>(getStoredProfile());
  const [skills, setSkills] = useState<ProfileSkill[]>(getStoredSkills());
  const [projects, setProjects] = useState<Project[]>(getStoredProjects());
  const evidence = getStoredEvidence();

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Skills input
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState<SkillLevel>('intermediate');

  // Project input
  const [newProjTitle, setNewProjTitle] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjRepo, setNewProjRepo] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredProfile(profile);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    const newPs: ProfileSkill = {
      id: `ps-${Date.now()}`,
      profile_id: profile.id,
      skill_id: `skill-${newSkillName.toLowerCase().replace(/\s+/g, '-')}`,
      skill_name: newSkillName.trim(),
      category: 'programming',
      self_reported_level: newSkillLevel,
      evidence_status: 'self_reported',
      updated_at: new Date().toISOString(),
    };
    const updated = [...skills, newPs];
    setSkills(updated);
    saveStoredSkills(updated);
    setNewSkillName('');
  };

  const handleDeleteSkill = (skillId: string) => {
    const updated = skills.filter(s => s.id !== skillId);
    setSkills(updated);
    saveStoredSkills(updated);
  };

  const handleAddProject = () => {
    if (!newProjTitle.trim()) return;
    const newP: Project = {
      id: `proj-${Date.now()}`,
      profile_id: profile.id,
      title: newProjTitle.trim(),
      description: newProjDesc.trim() || 'Student personal software project.',
      repository_url: newProjRepo.trim() || undefined,
      project_type: 'personal',
      skills_demonstrated: ['Python'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const updated = [...projects, newP];
    setProjects(updated);
    saveStoredProjects(updated);
    setNewProjTitle('');
    setNewProjDesc('');
    setNewProjRepo('');
  };

  const handleDeleteProject = (projId: string) => {
    const updated = projects.filter(p => p.id !== projId);
    setProjects(updated);
    saveStoredProjects(updated);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-midnight-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono text-cyan-accent uppercase tracking-widest flex items-center gap-1">
              <User className="w-3.5 h-3.5" /> Student Identity & Capabilities
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Profile & Evidence Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your academic credentials, demonstrated projects, and verified skill records.
          </p>
        </div>

        {savedSuccess && (
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono flex items-center gap-1.5 animate-in fade-in">
            <Check className="w-4 h-4" /> Changes persisted successfully!
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Academic & Preferences Form */}
        <div className="lg:col-span-2 space-y-6">
          
          <form onSubmit={handleSaveProfile} className="bg-midnight-surface p-6 rounded-2xl border border-midnight-border space-y-4 shadow-xl">
            <h3 className="font-bold text-sm text-white flex items-center gap-2 pb-3 border-b border-midnight-border">
              <GraduationCap className="w-4 h-4 text-cyan-accent" />
              Academic & Bio Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={profile.display_name}
                  onChange={e => setProfile({ ...profile, display_name: e.target.value })}
                  className="w-full bg-midnight-bg border border-midnight-border text-xs px-3 py-2 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Degree / Course</label>
                <input
                  type="text"
                  value={profile.course}
                  onChange={e => setProfile({ ...profile, course: e.target.value })}
                  className="w-full bg-midnight-bg border border-midnight-border text-xs px-3 py-2 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Institution</label>
                <input
                  type="text"
                  value={profile.institution}
                  onChange={e => setProfile({ ...profile, institution: e.target.value })}
                  className="w-full bg-midnight-bg border border-midnight-border text-xs px-3 py-2 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Year of Study</label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={profile.year_of_study}
                    onChange={e => setProfile({ ...profile, year_of_study: Number(e.target.value) })}
                    className="w-full bg-midnight-bg border border-midnight-border text-xs px-3 py-2 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Graduation Year</label>
                  <input
                    type="number"
                    value={profile.graduation_year}
                    onChange={e => setProfile({ ...profile, graduation_year: Number(e.target.value) })}
                    className="w-full bg-midnight-bg border border-midnight-border text-xs px-3 py-2 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Bio Summary</label>
              <textarea
                value={profile.bio || ''}
                onChange={e => setProfile({ ...profile, bio: e.target.value })}
                className="w-full h-20 bg-midnight-bg border border-midnight-border text-xs p-2.5 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-400 leading-relaxed"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-midnight-bg font-bold text-xs transition-colors shadow-md flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" /> Save Academic Changes
              </button>
            </div>
          </form>

          {/* Demonstrated Projects Section */}
          <div className="bg-midnight-surface p-6 rounded-2xl border border-midnight-border space-y-4 shadow-xl">
            <h3 className="font-bold text-sm text-white flex items-center gap-2 pb-3 border-b border-midnight-border">
              <FolderGit2 className="w-4 h-4 text-purple-accent" />
              Demonstrated Projects
            </h3>

            {/* Add Project Form */}
            <div className="p-4 bg-midnight-bg rounded-xl border border-midnight-border space-y-2.5">
              <span className="text-xs font-semibold text-slate-200 block">Add New Project to Graph</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Project Title"
                  value={newProjTitle}
                  onChange={e => setNewProjTitle(e.target.value)}
                  className="bg-midnight-surface border border-midnight-border text-xs px-3 py-2 rounded-xl text-slate-100 focus:outline-none focus:border-purple-400"
                />
                <input
                  type="text"
                  placeholder="GitHub URL (optional)"
                  value={newProjRepo}
                  onChange={e => setNewProjRepo(e.target.value)}
                  className="bg-midnight-surface border border-midnight-border text-xs px-3 py-2 rounded-xl text-slate-100 focus:outline-none focus:border-purple-400"
                />
              </div>
              <input
                type="text"
                placeholder="Description of architecture and what was built"
                value={newProjDesc}
                onChange={e => setNewProjDesc(e.target.value)}
                className="w-full bg-midnight-surface border border-midnight-border text-xs px-3 py-2 rounded-xl text-slate-100 focus:outline-none focus:border-purple-400"
              />
              <button
                type="button"
                onClick={handleAddProject}
                className="px-4 py-1.5 bg-purple-500 hover:bg-purple-400 text-white font-semibold text-xs rounded-xl transition-colors"
              >
                + Add Project
              </button>
            </div>

            {/* Projects List */}
            <div className="space-y-3 pt-2">
              {projects.map(proj => (
                <div key={proj.id} className="p-4 bg-midnight-bg rounded-xl border border-midnight-border flex items-start justify-between text-xs">
                  <div className="space-y-1 max-w-lg">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{proj.title}</span>
                      <span className="text-[10px] font-mono capitalize px-2 py-0.5 rounded bg-midnight-surface text-slate-400">
                        {proj.project_type}
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{proj.description}</p>
                    {proj.repository_url && (
                      <a
                        href={proj.repository_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-cyan-accent hover:underline flex items-center gap-1 font-mono pt-1"
                      >
                        <LinkIcon className="w-3 h-3" /> {proj.repository_url}
                      </a>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteProject(proj.id)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Skills & Evidence Ledger */}
        <div className="space-y-6">
          
          {/* Skills Management */}
          <div className="bg-midnight-surface p-6 rounded-2xl border border-midnight-border space-y-4 shadow-xl">
            <h3 className="font-bold text-sm text-white flex items-center gap-2 pb-3 border-b border-midnight-border">
              <Code2 className="w-4 h-4 text-cyan-accent" />
              Technical Skills
            </h3>

            {/* Quick Add */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add skill..."
                value={newSkillName}
                onChange={e => setNewSkillName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddSkill()}
                className="flex-1 bg-midnight-bg border border-midnight-border text-xs px-3 py-1.5 rounded-xl text-slate-100"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-midnight-bg font-bold text-xs rounded-xl"
              >
                Add
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {skills.map(sk => (
                <div key={sk.id} className="p-2.5 rounded-xl bg-midnight-bg border border-midnight-border flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white block">{sk.skill_name}</span>
                    <span className="text-[10px] font-mono text-cyan-300 capitalize">
                      {sk.evidence_status.replace('_', ' ')}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteSkill(sk.id)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Evidence Ledger */}
          <div className="bg-midnight-surface p-6 rounded-2xl border border-midnight-border space-y-3 shadow-xl">
            <h3 className="font-bold text-sm text-white flex items-center gap-2 pb-3 border-b border-midnight-border">
              <Award className="w-4 h-4 text-emerald-400" />
              Verified Evidence Records
            </h3>

            <div className="space-y-2">
              {evidence.map(ev => (
                <div key={ev.id} className="p-2.5 rounded-xl bg-midnight-bg border border-midnight-border text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white font-mono">{ev.skill_name}</span>
                    {ev.assessment_score && (
                      <span className="text-[10px] font-mono text-emerald-400">{ev.assessment_score}% score</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">{ev.evidence_metadata.title}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
