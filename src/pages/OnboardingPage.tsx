import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  Code2, 
  Sparkles, 
  Sliders, 
  FileText, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Plus, 
  Trash2,
  FolderGit2,
  Bot
} from 'lucide-react';
import { getStoredProfile, saveStoredProfile, saveStoredSkills, saveStoredProjects } from '../lib/storage';
import { ProfileSkill, Project, WorkMode, SkillLevel } from '../types';
import { extractProfileFromResume } from '../lib/ai';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const initialProfile = getStoredProfile();

  const [step, setStep] = useState(1);

  // Form State across steps
  const [course, setCourse] = useState(initialProfile.course || 'BTech Computer Science');
  const [institution, setInstitution] = useState(initialProfile.institution || 'NIT Karnataka');
  const [yearOfStudy, setYearOfStudy] = useState(initialProfile.year_of_study || 2);
  const [graduationYear, setGraduationYear] = useState(initialProfile.graduation_year || 2028);

  // Step 2: Skills
  const [skillsList, setSkillsList] = useState<{ name: string; level: SkillLevel; category: any }[]>([
    { name: 'Python', level: 'intermediate', category: 'programming' },
    { name: 'JavaScript', level: 'beginner', category: 'programming' },
    { name: 'Git', level: 'beginner', category: 'tools' },
  ]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState<SkillLevel>('intermediate');

  // Step 3: Interests
  const allInterests = [
    'AI/ML',
    'Software Engineering',
    'Web Development',
    'Mobile Development',
    'Data Science',
    'Cybersecurity',
    'Cloud & DevOps',
    'Core CS & Systems',
    'Open Source',
    'Research'
  ];
  const [selectedInterests, setSelectedInterests] = useState<string[]>(initialProfile.interests || ['AI/ML', 'Software Engineering']);

  // Step 4: Preferences
  const [workModes, setWorkModes] = useState<WorkMode[]>(initialProfile.preferred_work_modes || ['remote', 'hybrid']);
  const [locations, setLocations] = useState<string[]>(initialProfile.preferred_locations || ['Remote', 'Bengaluru']);
  const [newLocation, setNewLocation] = useState('');

  // Step 5: Evidence & Resume Paste
  const [projectsList, setProjectsList] = useState<Omit<Project, 'id' | 'profile_id' | 'created_at' | 'updated_at'>[]>([
    {
      title: 'Responsive Portfolio Directory',
      description: 'Web portal developed with HTML, CSS, and basic JS showcasing technical club events.',
      project_type: 'academic',
      skills_demonstrated: ['JavaScript', 'HTML & CSS', 'Git']
    }
  ]);
  const [newProjTitle, setNewProjTitle] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [isExtractingResume, setIsExtractingResume] = useState(false);

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    setSkillsList(prev => [...prev, { name: newSkillName.trim(), level: newSkillLevel, category: 'programming' }]);
    setNewSkillName('');
  };

  const handleToggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleAddProject = () => {
    if (!newProjTitle.trim()) return;
    setProjectsList(prev => [
      ...prev,
      {
        title: newProjTitle.trim(),
        description: newProjDesc.trim() || 'Student personal / academic project.',
        project_type: 'personal',
        skills_demonstrated: ['Python']
      }
    ]);
    setNewProjTitle('');
    setNewProjDesc('');
  };

  const handleExtractFromResume = async () => {
    if (!resumeText.trim()) return;
    setIsExtractingResume(true);
    try {
      const extracted = await extractProfileFromResume(resumeText);
      if (extracted.course) setCourse(extracted.course);
      if (extracted.institution) setInstitution(extracted.institution);
      if (extracted.year_of_study) setYearOfStudy(extracted.year_of_study);
      if (extracted.skills.length > 0) {
        setSkillsList(extracted.skills.map(s => ({ name: s.name, level: s.level, category: s.category as any })));
      }
      if (extracted.interests.length > 0) {
        setSelectedInterests(extracted.interests);
      }
      if (extracted.projects.length > 0) {
        setProjectsList(extracted.projects.map(p => ({
          title: p.title,
          description: p.description,
          project_type: 'personal',
          skills_demonstrated: p.skills
        })));
      }
      alert('Resume attributes extracted! Please review the steps before confirming.');
    } catch (e) {
      console.error(e);
    } finally {
      setIsExtractingResume(false);
    }
  };

  const handleFinishOnboarding = () => {
    // 1. Save Profile
    saveStoredProfile({
      ...initialProfile,
      course,
      institution,
      year_of_study: yearOfStudy,
      graduation_year: graduationYear,
      interests: selectedInterests,
      preferred_work_modes: workModes,
      preferred_locations: locations,
      onboarding_completed: true,
      updated_at: new Date().toISOString()
    });

    // 2. Save Profile Skills
    const profileSkills: ProfileSkill[] = skillsList.map((s, idx) => ({
      id: `ps-${idx + 1}`,
      profile_id: initialProfile.id,
      skill_id: `skill-${s.name.toLowerCase().replace(/\s+/g, '-')}`,
      skill_name: s.name,
      category: s.category,
      self_reported_level: s.level,
      evidence_status: 'self_reported',
      updated_at: new Date().toISOString(),
    }));
    saveStoredSkills(profileSkills);

    // 3. Save Projects
    const fullProjects: Project[] = projectsList.map((p, idx) => ({
      ...p,
      id: `proj-${idx + 1}`,
      profile_id: initialProfile.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
    saveStoredProjects(fullProjects);

    navigate('/dashboard');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      
      {/* Top Stepper Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
          <span>STEP {step} OF 5</span>
          <span className="text-cyan-accent font-semibold">
            {step === 1 && 'Education'}
            {step === 2 && 'Demonstrated Skills'}
            {step === 3 && 'Career Interests'}
            {step === 4 && 'Opportunity Preferences'}
            {step === 5 && 'Evidence & Projects'}
          </span>
        </div>
        <div className="w-full bg-midnight-surface h-2 rounded-full overflow-hidden border border-midnight-border">
          <div 
            className="bg-gradient-to-r from-cyan-400 to-purple-500 h-full transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Form Container */}
      <div className="bg-midnight-surface p-8 rounded-2xl border border-midnight-border shadow-2xl space-y-6">
        
        {/* Step 1: Education */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 pb-3 border-b border-midnight-border">
              <GraduationCap className="w-5 h-5 text-cyan-accent" />
              <h2 className="text-lg font-bold text-white">Academic Discipline & Year</h2>
            </div>
            <p className="text-xs text-slate-400">
              OpportunityOS strictly respects academic eligibility filters set by research grants and internship sponsors.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Degree / Course</label>
                <input
                  type="text"
                  value={course}
                  onChange={e => setCourse(e.target.value)}
                  placeholder="e.g. BTech Computer Science, BCA, MCA, BS Data Science"
                  className="w-full bg-midnight-bg border border-midnight-border text-xs px-3 py-2.5 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">College or University</label>
                <input
                  type="text"
                  value={institution}
                  onChange={e => setInstitution(e.target.value)}
                  placeholder="e.g. National Institute of Technology Karnataka"
                  className="w-full bg-midnight-bg border border-midnight-border text-xs px-3 py-2.5 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Current Year of Study</label>
                  <select
                    value={yearOfStudy}
                    onChange={e => setYearOfStudy(Number(e.target.value))}
                    className="w-full bg-midnight-bg border border-midnight-border text-xs px-3 py-2.5 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-400"
                  >
                    <option value={1}>1st Year (Freshman)</option>
                    <option value={2}>2nd Year (Sophomore)</option>
                    <option value={3}>3rd Year (Junior)</option>
                    <option value={4}>4th Year (Senior)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Graduation Year</label>
                  <input
                    type="number"
                    value={graduationYear}
                    onChange={e => setGraduationYear(Number(e.target.value))}
                    className="w-full bg-midnight-bg border border-midnight-border text-xs px-3 py-2.5 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Skills */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 pb-3 border-b border-midnight-border">
              <Code2 className="w-5 h-5 text-purple-accent" />
              <h2 className="text-lg font-bold text-white">Your Technical Capabilities</h2>
            </div>
            <p className="text-xs text-slate-400">
              List the languages and frameworks you've written code with. You can test and verify them in Proof of Skill later.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={newSkillName}
                onChange={e => setNewSkillName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddSkill()}
                placeholder="e.g. Python, React, SQL, C++, PyTorch..."
                className="flex-1 bg-midnight-bg border border-midnight-border text-xs px-3 py-2 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-400"
              />
              <select
                value={newSkillLevel}
                onChange={e => setNewSkillLevel(e.target.value as SkillLevel)}
                className="bg-midnight-bg border border-midnight-border text-xs px-3 py-2 rounded-xl text-slate-100"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <button
                onClick={handleAddSkill}
                className="px-3 py-2 bg-purple-500 hover:bg-purple-400 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {skillsList.map((sk, idx) => (
                <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-midnight-bg border border-midnight-border text-xs font-mono">
                  <span className="text-slate-200">{sk.name}</span>
                  <span className="text-[10px] text-slate-500 capitalize">({sk.level})</span>
                  <button
                    onClick={() => setSkillsList(skillsList.filter((_, i) => i !== idx))}
                    className="text-slate-400 hover:text-rose-400 ml-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Interests */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 pb-3 border-b border-midnight-border">
              <Sparkles className="w-5 h-5 text-amber-accent" />
              <h2 className="text-lg font-bold text-white">Target Domains & Fields</h2>
            </div>
            <p className="text-xs text-slate-400">
              Select domains you are curious to explore or build projects in.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {allInterests.map(interest => {
                const isSelected = selectedInterests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => handleToggleInterest(interest)}
                    className={`p-3 rounded-xl border text-xs font-medium text-left transition-all ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-200 shadow-sm'
                        : 'bg-midnight-bg border-midnight-border text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span>{interest}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-accent" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Preferences */}
        {step === 4 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 pb-3 border-b border-midnight-border">
              <Sliders className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">Work Mode & Location Constraints</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">Preferred Work Modes</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['remote', 'hybrid', 'onsite'] as WorkMode[]).map(mode => {
                    const isSelected = workModes.includes(mode);
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            if (workModes.length > 1) setWorkModes(workModes.filter(m => m !== mode));
                          } else {
                            setWorkModes([...workModes, mode]);
                          }
                        }}
                        className={`py-2 rounded-xl border text-xs font-semibold capitalize transition-all ${
                          isSelected
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-midnight-bg text-slate-400 border-midnight-border'
                        }`}
                      >
                        {mode}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Target Cities / Locations</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newLocation}
                    onChange={e => setNewLocation(e.target.value)}
                    placeholder="e.g. Remote, Bengaluru, Pune, Hyderabad, Delhi..."
                    className="flex-1 bg-midnight-bg border border-midnight-border text-xs px-3 py-2 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    onClick={() => {
                      if (newLocation.trim()) {
                        setLocations([...locations, newLocation.trim()]);
                        setNewLocation('');
                      }
                    }}
                    className="px-3 py-2 bg-midnight-surface hover:bg-midnight-hover border border-midnight-border text-xs rounded-xl"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {locations.map((loc, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-midnight-bg border border-midnight-border text-[11px] font-mono text-slate-300 flex items-center gap-1">
                      {loc}
                      <button onClick={() => setLocations(locations.filter((_, idx) => idx !== i))}>×</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Evidence & Resume Parsing */}
        {step === 5 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 pb-3 border-b border-midnight-border">
              <FolderGit2 className="w-5 h-5 text-cyan-accent" />
              <h2 className="text-lg font-bold text-white">Project Evidence & AI Resume Parsing</h2>
            </div>
            
            {/* AI Resume text parser */}
            <div className="p-4 rounded-xl bg-midnight-bg border border-midnight-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-cyan-accent" />
                  Fast Auto-Fill: Paste Plaintext Resume / LinkedIn Bio
                </span>
                <span className="text-[10px] font-mono text-cyan-300">Optional</span>
              </div>
              <textarea
                value={resumeText}
                onChange={e => setResumeText(e.target.value)}
                placeholder="Paste your resume or GitHub summary text here to automatically extract skills and academic details..."
                className="w-full h-24 bg-midnight-surface border border-midnight-border rounded-lg text-xs p-2.5 text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
              />
              <button
                type="button"
                onClick={handleExtractFromResume}
                disabled={isExtractingResume || !resumeText.trim()}
                className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-semibold transition-colors disabled:opacity-40"
              >
                {isExtractingResume ? 'Extracting Structure...' : 'Extract Profile via AI Parser'}
              </button>
            </div>

            {/* Projects list */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-semibold text-slate-300 block">Demonstrated Student Projects</span>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Project Title (e.g. IoT Weather Monitor, Mini React Store)"
                  value={newProjTitle}
                  onChange={e => setNewProjTitle(e.target.value)}
                  className="w-full bg-midnight-bg border border-midnight-border text-xs px-3 py-2 rounded-xl text-slate-100"
                />
                <input
                  type="text"
                  placeholder="Brief description of architecture and features"
                  value={newProjDesc}
                  onChange={e => setNewProjDesc(e.target.value)}
                  className="w-full bg-midnight-bg border border-midnight-border text-xs px-3 py-2 rounded-xl text-slate-100"
                />
                <button
                  type="button"
                  onClick={handleAddProject}
                  className="px-3 py-1.5 rounded-lg bg-midnight-surface hover:bg-midnight-hover border border-midnight-border text-xs text-slate-200"
                >
                  + Add Project to Evidence Graph
                </button>
              </div>

              <div className="space-y-2 pt-2">
                {projectsList.map((p, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-midnight-bg border border-midnight-border flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-white">{p.title}</div>
                      <div className="text-[11px] text-slate-400">{p.description}</div>
                    </div>
                    <button onClick={() => setProjectsList(projectsList.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-rose-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-midnight-border">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-midnight-bg hover:bg-midnight-hover border border-midnight-border text-xs text-slate-300 font-medium transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Previous
            </button>
          ) : <div />}

          {step < 5 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-midnight-bg font-bold text-xs transition-all shadow-md"
            >
              Next Step <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinishOnboarding}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-500 hover:from-cyan-300 hover:to-purple-400 text-midnight-bg font-bold text-xs transition-all shadow-[0_0_20px_rgba(103,232,249,0.3)]"
            >
              <Check className="w-4 h-4" /> Save Profile & Launch Dashboard
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
