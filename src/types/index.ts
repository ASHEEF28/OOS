export type WorkMode = 'remote' | 'hybrid' | 'onsite';
export type OpportunityType = 'internship' | 'research' | 'open_source' | 'startup' | 'student_program';
export type SkillCategory = 'programming' | 'framework' | 'database' | 'ai_ml' | 'cloud_devops' | 'tools' | 'core_cs';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type EvidenceStatus = 'self_reported' | 'project_supported' | 'challenge_assessed';
export type EligibilityStatus = 'eligible' | 'ineligible' | 'unknown';
export type ApplicationStatus = 'saved' | 'planning' | 'applied' | 'interview' | 'offer' | 'rejected' | 'withdrawn';

export interface Profile {
  id: string;
  display_name: string;
  email?: string;
  course: string;
  institution: string;
  year_of_study: number; // 1, 2, 3, 4, etc.
  graduation_year: number;
  preferred_locations: string[];
  preferred_work_modes: WorkMode[];
  interests: string[];
  onboarding_completed: boolean;
  avatar_url?: string;
  bio?: string;
  github_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  normalized_name: string;
  description: string;
  icon?: string;
}

export interface ProfileSkill {
  id: string;
  profile_id: string;
  skill_id: string;
  skill_name: string;
  category: SkillCategory;
  self_reported_level: SkillLevel;
  evidence_status: EvidenceStatus;
  score?: number; // 0 - 100 for assessed skills
  updated_at: string;
}

export interface Project {
  id: string;
  profile_id: string;
  title: string;
  description: string;
  repository_url?: string;
  project_url?: string;
  project_type: 'personal' | 'academic' | 'hackathon' | 'open_source';
  skills_demonstrated: string[]; // skill names or IDs
  created_at: string;
  updated_at: string;
}

export interface EligibilityRules {
  allowed_courses?: string[]; // e.g. ["BTech", "BCA", "MCA", "BS", "Any"]
  allowed_years?: number[]; // e.g. [1, 2, 3]
  min_graduation_year?: number;
  max_graduation_year?: number;
  mandatory_locations?: string[];
  requires_prior_experience?: boolean;
  min_gpa?: number;
  special_requirements?: string[];
}

export interface Opportunity {
  id: string;
  title: string;
  organization: string;
  organization_logo?: string;
  description: string;
  opportunity_type: OpportunityType;
  domain: string;
  location: string;
  work_mode: WorkMode;
  compensation_min?: number | null;
  compensation_max?: number | null;
  compensation_currency?: string;
  compensation_text?: string;
  duration?: string; // e.g. "3 months", "6 months"
  deadline?: string | null;
  eligibility_rules: EligibilityRules;
  required_skills: string[];
  preferred_skills: string[];
  source_url: string;
  application_url: string;
  source_name: string;
  last_verified_at?: string;
  is_demo_data: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MatchScoreBreakdown {
  total_score: number; // 0 - 100
  eligibility: EligibilityStatus;
  eligibility_reasons: string[];
  ineligibility_reasons: string[];
  unknown_factors: string[];
  
  // Category scores
  skills_score: number; // max 40
  skills_matched: string[];
  skills_missing: string[];
  preferred_matched: string[];
  
  academic_score: number; // max 20
  academic_match_details: string;
  
  interest_score: number; // max 15
  matched_interests: string[];
  
  work_mode_score: number; // max 15
  work_mode_details: string;
  
  experience_score: number; // max 10
  experience_details: string;

  // AI-enhanced or grounded narrative
  executive_summary: string;
  next_action_unlock: string;
  nextActionUnlock?: string;
}

export interface SkillChallenge {
  id: string;
  title: string;
  description: string;
  skill_id: string;
  skill_name: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimated_minutes: number;
  instructions: string;
  starter_code: string;
  starter_files?: Record<string, string>;
  solution_hint?: string;
  evaluation_type: 'code_tests' | 'sql_query' | 'interactive_rubric';
  test_cases: {
    id: string;
    description: string;
    input: any;
    expected: any;
    hidden?: boolean;
  }[];
  rubric_items?: {
    id: string;
    criterion: string;
    points: number;
  }[];
  is_active: boolean;
}

export interface ChallengeSubmission {
  id: string;
  profile_id: string;
  challenge_id: string;
  submission: string;
  score: number;
  tests_passed: number;
  total_tests: number;
  test_results: {
    test_id: string;
    passed: boolean;
    description: string;
    actual_output?: string;
    expected_output?: string;
    error_message?: string;
  }[];
  result_summary: string;
  evaluation_status: 'passed' | 'failed' | 'needs_revision';
  completed_at: string;
}

export interface SkillEvidence {
  id: string;
  profile_id: string;
  skill_id: string;
  skill_name: string;
  evidence_type: EvidenceStatus;
  source_id: string; // challenge_id or project_id
  assessment_score?: number;
  evidence_metadata: {
    title: string;
    verified_date: string;
    notes?: string;
  };
  created_at: string;
}

export interface OpportunitySave {
  id: string;
  profile_id: string;
  opportunity_id: string;
  created_at: string;
}

export interface ApplicationItem {
  id: string;
  profile_id: string;
  opportunity_id: string;
  opportunity?: Opportunity;
  status: ApplicationStatus;
  notes: string;
  deadline?: string | null;
  applied_at?: string | null;
  updated_at: string;
}

export interface LearningMilestone {
  id: string;
  profile_id: string;
  title: string;
  description: string;
  target_skill: string;
  status: 'pending' | 'in_progress' | 'completed';
  estimated_effort: string; // e.g. "4 hours", "2 days"
  why_it_matters: string;
  unlocks_opportunities: string[]; // Opportunity titles or IDs
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface GraphNodeData {
  id: string;
  label: string;
  sublabel?: string;
  category: 'student' | 'skill' | 'project' | 'opportunity' | 'milestone';
  score?: number;
  status?: string;
  details?: Record<string, any>;
  isHighlighted?: boolean;
  isUnlocked?: boolean;
}

export interface WhatIfScenario {
  skillsToAdd: { name: string; level: SkillLevel; category: SkillCategory }[];
  skillsToUpgrade: { name: string; newLevel: SkillLevel }[];
  projectsToAdd: { title: string; skills: string[]; type: Project['project_type'] }[];
  newInterests: string[];
  newWorkModes: WorkMode[];
}

export interface WhatIfComparison {
  baselineEligibleCount: number;
  simulatedEligibleCount: number;
  newlyUnlockedOpportunities: {
    opportunity: Opportunity;
    previousScore: number;
    newScore: number;
    reasons: string[];
  }[];
  scoreIncreases: {
    opportunity: Opportunity;
    previousScore: number;
    newScore: number;
    delta: number;
  }[];
  remainingGaps: string[];
  highImpactRecommendations: string[];
}
