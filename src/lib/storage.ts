import { Profile, ProfileSkill, Project, Opportunity, ApplicationItem, LearningMilestone, SkillEvidence } from '../types';
import { DEMO_PROFILE, DEMO_PROFILE_SKILLS, DEMO_PROJECTS, DEMO_EVIDENCE, DEMO_APPLICATIONS, DEMO_MILESTONES } from '../data/demoProfile';
import { SEED_OPPORTUNITIES } from '../data/seedOpportunities';

const STORAGE_KEYS = {
  PROFILE: 'opportunity_os_profile_v1',
  SKILLS: 'opportunity_os_skills_v1',
  PROJECTS: 'opportunity_os_projects_v1',
  EVIDENCE: 'opportunity_os_evidence_v1',
  APPLICATIONS: 'opportunity_os_applications_v1',
  MILESTONES: 'opportunity_os_milestones_v1',
  CUSTOM_OPPORTUNITIES: 'opportunity_os_custom_opps_v1',
  AI_CONFIG: 'opportunity_os_ai_config_v1',
  AUTH_STATE: 'opportunity_os_auth_state_v1',
};

export interface AiConfig {
  provider: 'openai' | 'groq' | 'deepseek' | 'ollama' | 'custom';
  apiKey: string;
  model: string;
  endpoint: string;
  enabled: boolean;
}

export const DEFAULT_AI_CONFIG: AiConfig = {
  provider: 'openai',
  apiKey: '',
  model: 'gpt-4o-mini',
  endpoint: 'https://api.openai.com/v1',
  enabled: false,
};

// ==========================================
// Profile Management
// ==========================================
export function getStoredProfile(): Profile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read profile from storage', e);
  }
  return DEMO_PROFILE;
}

export function saveStoredProfile(profile: Profile): void {
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  window.dispatchEvent(new Event('opportunityos:data-updated'));
}

// ==========================================
// Skills Management
// ==========================================
export function getStoredSkills(): ProfileSkill[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SKILLS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read skills from storage', e);
  }
  return DEMO_PROFILE_SKILLS;
}

export function saveStoredSkills(skills: ProfileSkill[]): void {
  localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(skills));
  window.dispatchEvent(new Event('opportunityos:data-updated'));
}

export function addOrUpdateSkill(skill: Partial<ProfileSkill> & { skill_name: string }): void {
  const current = getStoredSkills();
  const index = current.findIndex(s => s.skill_name.toLowerCase() === skill.skill_name.toLowerCase());
  
  if (index >= 0) {
    current[index] = { ...current[index], ...skill, updated_at: new Date().toISOString() };
  } else {
    current.push({
      id: `ps-${Date.now()}`,
      profile_id: getStoredProfile().id,
      skill_id: `skill-${skill.skill_name.toLowerCase().replace(/\s+/g, '-')}`,
      skill_name: skill.skill_name,
      category: skill.category || 'programming',
      self_reported_level: skill.self_reported_level || 'beginner',
      evidence_status: skill.evidence_status || 'self_reported',
      updated_at: new Date().toISOString(),
    });
  }
  saveStoredSkills(current);
}

// ==========================================
// Projects Management
// ==========================================
export function getStoredProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read projects from storage', e);
  }
  return DEMO_PROJECTS;
}

export function saveStoredProjects(projects: Project[]): void {
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  window.dispatchEvent(new Event('opportunityos:data-updated'));
}

export function addStoredProject(project: Omit<Project, 'id' | 'profile_id' | 'created_at' | 'updated_at'>): Project {
  const current = getStoredProjects();
  const profile = getStoredProfile();
  const newProject: Project = {
    ...project,
    id: `proj-${Date.now()}`,
    profile_id: profile.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  current.push(newProject);
  saveStoredProjects(current);

  // Mark demonstrated skills as project_supported if currently self_reported
  const skills = getStoredSkills();
  let skillsChanged = false;
  project.skills_demonstrated.forEach(sName => {
    const sk = skills.find(s => s.skill_name.toLowerCase() === sName.toLowerCase());
    if (sk && sk.evidence_status === 'self_reported') {
      sk.evidence_status = 'project_supported';
      skillsChanged = true;
    }
  });
  if (skillsChanged) {
    saveStoredSkills(skills);
  }

  return newProject;
}

// ==========================================
// Skill Evidence Management
// ==========================================
export function getStoredEvidence(): SkillEvidence[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EVIDENCE);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read evidence from storage', e);
  }
  return DEMO_EVIDENCE;
}

export function recordChallengeEvidence(
  challengeId: string,
  challengeTitle: string,
  skillName: string,
  score: number
): void {
  const profile = getStoredProfile();
  const evidenceList = getStoredEvidence();

  const newEv: SkillEvidence = {
    id: `ev-${Date.now()}`,
    profile_id: profile.id,
    skill_id: `skill-${skillName.toLowerCase().replace(/\s+/g, '-')}`,
    skill_name: skillName,
    evidence_type: 'challenge_assessed',
    source_id: challengeId,
    assessment_score: score,
    evidence_metadata: {
      title: `Passed Skill Challenge: ${challengeTitle}`,
      verified_date: new Date().toISOString().split('T')[0],
      notes: `Deterministic automated test verification passed with ${score}% accuracy`,
    },
    created_at: new Date().toISOString(),
  };

  evidenceList.unshift(newEv);
  localStorage.setItem(STORAGE_KEYS.EVIDENCE, JSON.stringify(evidenceList));

  // Upgrade the skill in profile skills
  const skills = getStoredSkills();
  const existingSkill = skills.find(s => s.skill_name.toLowerCase() === skillName.toLowerCase());
  if (existingSkill) {
    existingSkill.evidence_status = 'challenge_assessed';
    existingSkill.score = score;
    existingSkill.updated_at = new Date().toISOString();
  } else {
    skills.push({
      id: `ps-${Date.now()}`,
      profile_id: profile.id,
      skill_id: newEv.skill_id,
      skill_name: skillName,
      category: 'programming',
      self_reported_level: 'intermediate',
      evidence_status: 'challenge_assessed',
      score,
      updated_at: new Date().toISOString(),
    });
  }
  saveStoredSkills(skills);
}

// ==========================================
// Opportunities & Saves Management
// ==========================================
export function getAllOpportunities(): Opportunity[] {
  return SEED_OPPORTUNITIES;
}

export function getOpportunityById(id: string): Opportunity | undefined {
  return SEED_OPPORTUNITIES.find(o => o.id === id);
}

// ==========================================
// Applications & Tracker Management
// ==========================================
export function getStoredApplications(): ApplicationItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read applications from storage', e);
  }
  return DEMO_APPLICATIONS;
}

export function saveStoredApplications(apps: ApplicationItem[]): void {
  localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));
  window.dispatchEvent(new Event('opportunityos:data-updated'));
}

export function toggleSaveOpportunity(oppId: string): boolean {
  const apps = getStoredApplications();
  const existingIdx = apps.findIndex(a => a.opportunity_id === oppId);

  if (existingIdx >= 0) {
    if (apps[existingIdx].status === 'saved') {
      // Remove save
      apps.splice(existingIdx, 1);
      saveStoredApplications(apps);
      return false;
    } else {
      return true;
    }
  } else {
    // Add saved
    const profile = getStoredProfile();
    apps.push({
      id: `app-${Date.now()}`,
      profile_id: profile.id,
      opportunity_id: oppId,
      status: 'saved',
      notes: '',
      updated_at: new Date().toISOString(),
    });
    saveStoredApplications(apps);
    return true;
  }
}

export function updateApplicationStatus(appId: string, newStatus: ApplicationItem['status'], notes?: string): void {
  const apps = getStoredApplications();
  const item = apps.find(a => a.id === appId || a.opportunity_id === appId);
  if (item) {
    item.status = newStatus;
    if (notes !== undefined) item.notes = notes;
    item.updated_at = new Date().toISOString();
    if (newStatus === 'applied' && !item.applied_at) {
      item.applied_at = new Date().toISOString();
    }
    saveStoredApplications(apps);
  } else {
    // If not tracked yet, create it
    const profile = getStoredProfile();
    apps.push({
      id: `app-${Date.now()}`,
      profile_id: profile.id,
      opportunity_id: appId,
      status: newStatus,
      notes: notes || '',
      updated_at: new Date().toISOString(),
      applied_at: newStatus === 'applied' ? new Date().toISOString() : null,
    });
    saveStoredApplications(apps);
  }
}

// ==========================================
// Learning Milestones Management
// ==========================================
export function getStoredMilestones(): LearningMilestone[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MILESTONES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read milestones from storage', e);
  }
  return DEMO_MILESTONES;
}

export function saveStoredMilestones(milestones: LearningMilestone[]): void {
  localStorage.setItem(STORAGE_KEYS.MILESTONES, JSON.stringify(milestones));
  window.dispatchEvent(new Event('opportunityos:data-updated'));
}

export function toggleMilestoneStatus(id: string): void {
  const milestones = getStoredMilestones();
  const item = milestones.find(m => m.id === id);
  if (item) {
    item.status = item.status === 'completed' ? 'in_progress' : 'completed';
    item.updated_at = new Date().toISOString();
    saveStoredMilestones(milestones);
  }
}

// ==========================================
// AI Configuration Management
// ==========================================
export function getStoredAiConfig(): AiConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AI_CONFIG);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read AI config from storage', e);
  }
  return DEFAULT_AI_CONFIG;
}

export function saveStoredAiConfig(cfg: AiConfig): void {
  localStorage.setItem(STORAGE_KEYS.AI_CONFIG, JSON.stringify(cfg));
}

// ==========================================
// Demo Data Reset
// ==========================================
export function resetDemoData(): void {
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(DEMO_PROFILE));
  localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(DEMO_PROFILE_SKILLS));
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(DEMO_PROJECTS));
  localStorage.setItem(STORAGE_KEYS.EVIDENCE, JSON.stringify(DEMO_EVIDENCE));
  localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(DEMO_APPLICATIONS));
  localStorage.setItem(STORAGE_KEYS.MILESTONES, JSON.stringify(DEMO_MILESTONES));
  window.dispatchEvent(new Event('opportunityos:data-updated'));
}
