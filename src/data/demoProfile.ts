import { Profile, ProfileSkill, Project, ApplicationItem, LearningMilestone, SkillEvidence } from '../types';

export const DEMO_PROFILE: Profile = {
  id: 'demo-student-aarav',
  display_name: 'Aarav Sharma',
  email: 'aarav.sharma@example.edu',
  course: 'BTech Computer Science',
  institution: 'National Institute of Technology Karnataka (NITK)',
  year_of_study: 2,
  graduation_year: 2028,
  preferred_locations: ['Remote', 'Bengaluru', 'Pune'],
  preferred_work_modes: ['remote', 'hybrid'],
  interests: ['AI/ML', 'Software Engineering', 'Open Source', 'Data Science'],
  onboarding_completed: true,
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&q=80',
  bio: 'Second-year BTech student enthusiastic about machine learning pipelines and modern web engineering. Looking for beginner-friendly summer fellowships or open-source programs.',
  github_url: 'https://github.com/aarav-sharma-demo',
  linkedin_url: 'https://linkedin.com/in/aarav-sharma-demo',
  created_at: '2026-09-15T00:00:00Z',
  updated_at: '2026-10-14T00:00:00Z',
};

export const DEMO_PROFILE_SKILLS: ProfileSkill[] = [
  {
    id: 'ps-1',
    profile_id: 'demo-student-aarav',
    skill_id: 'skill-python',
    skill_name: 'Python',
    category: 'programming',
    self_reported_level: 'intermediate',
    evidence_status: 'self_reported',
    updated_at: '2026-10-01T00:00:00Z',
  },
  {
    id: 'ps-2',
    profile_id: 'demo-student-aarav',
    skill_id: 'skill-js',
    skill_name: 'JavaScript',
    category: 'programming',
    self_reported_level: 'beginner',
    evidence_status: 'project_supported',
    updated_at: '2026-10-05T00:00:00Z',
  },
  {
    id: 'ps-3',
    profile_id: 'demo-student-aarav',
    skill_id: 'skill-html-css',
    skill_name: 'HTML & CSS',
    category: 'framework',
    self_reported_level: 'intermediate',
    evidence_status: 'project_supported',
    updated_at: '2026-10-05T00:00:00Z',
  },
  {
    id: 'ps-4',
    profile_id: 'demo-student-aarav',
    skill_id: 'skill-git',
    skill_name: 'Git',
    category: 'tools',
    self_reported_level: 'beginner',
    evidence_status: 'project_supported',
    updated_at: '2026-10-05T00:00:00Z',
  },
  {
    id: 'ps-5',
    profile_id: 'demo-student-aarav',
    skill_id: 'skill-dsa',
    skill_name: 'Data Structures & Algorithms',
    category: 'core_cs',
    self_reported_level: 'beginner',
    evidence_status: 'self_reported',
    updated_at: '2026-10-02T00:00:00Z',
  }
];

export const DEMO_PROJECTS: Project[] = [
  {
    id: 'proj-campus-portal',
    profile_id: 'demo-student-aarav',
    title: 'NITK Student Club & Hackathon Portal',
    description: 'Built a lightweight, responsive web directory for university student technical clubs to showcase upcoming campus hackathons and collect registration forms.',
    repository_url: 'https://github.com/aarav-sharma-demo/nitk-club-portal',
    project_url: 'https://nitk-portal-demo.web.app',
    project_type: 'academic',
    skills_demonstrated: ['HTML & CSS', 'JavaScript', 'Git'],
    created_at: '2026-08-20T00:00:00Z',
    updated_at: '2026-10-05T00:00:00Z'
  }
];

export const DEMO_EVIDENCE: SkillEvidence[] = [
  {
    id: 'ev-1',
    profile_id: 'demo-student-aarav',
    skill_id: 'skill-git',
    skill_name: 'Git',
    evidence_type: 'project_supported',
    source_id: 'proj-campus-portal',
    evidence_metadata: {
      title: 'Repository Commit History in Student Club Portal',
      verified_date: '2026-10-05',
      notes: 'Active commit logs and pull requests on GitHub repository'
    },
    created_at: '2026-10-05T12:00:00Z'
  },
  {
    id: 'ev-2',
    profile_id: 'demo-student-aarav',
    skill_id: 'skill-html-css',
    skill_name: 'HTML & CSS',
    evidence_type: 'project_supported',
    source_id: 'proj-campus-portal',
    evidence_metadata: {
      title: 'Responsive Web UI Layout in Project',
      verified_date: '2026-10-05',
      notes: 'Semantic HTML markup and flexbox/grid layout styling'
    },
    created_at: '2026-10-05T12:00:00Z'
  }
];

export const DEMO_APPLICATIONS: ApplicationItem[] = [
  {
    id: 'app-1',
    profile_id: 'demo-student-aarav',
    opportunity_id: 'opp-hf-fellow',
    status: 'planning',
    notes: 'Need to prepare pull request contribution link before November 10th.',
    deadline: '2026-12-15',
    applied_at: null,
    updated_at: '2026-10-12T14:00:00Z'
  },
  {
    id: 'app-2',
    profile_id: 'demo-student-aarav',
    opportunity_id: 'opp-gsoc-foss',
    status: 'saved',
    notes: 'Reviewing PSF project ideas page. Connecting on Zulip channel.',
    deadline: '2026-11-20',
    applied_at: null,
    updated_at: '2026-10-13T10:00:00Z'
  }
];

export const DEMO_MILESTONES: LearningMilestone[] = [
  {
    id: 'ms-1',
    profile_id: 'demo-student-aarav',
    title: 'Validate Python Telemetry Challenge',
    description: 'Pass the practical automated telemetry aggregation test in Proof of Skill to upgrade Python to Challenge-Assessed status.',
    target_skill: 'Python',
    status: 'pending',
    estimated_effort: '20 mins',
    why_it_matters: 'Boosts match confidence for Hugging Face Fellow and MS Research from 68% to 88%+',
    unlocks_opportunities: ['Open Source ML Pipeline Fellow', 'Undergraduate Research Fellow - AI & NLP'],
    sort_order: 1,
    created_at: '2026-10-10T00:00:00Z',
    updated_at: '2026-10-10T00:00:00Z'
  },
  {
    id: 'ms-2',
    profile_id: 'demo-student-aarav',
    title: 'Demonstrate Relational SQL Queries',
    description: 'Complete the enrollment retention SQL challenge to qualify for Swiggy Data Labs and National Informatics Centre analytics roles.',
    target_skill: 'SQL',
    status: 'pending',
    estimated_effort: '4 hours',
    why_it_matters: 'Opens 5 data science and civic engineering internships requiring database querying.',
    unlocks_opportunities: ['Junior Analytics & Experimentation Intern', 'Civic Data Science & Public Dashboard Intern'],
    sort_order: 2,
    created_at: '2026-10-10T00:00:00Z',
    updated_at: '2026-10-10T00:00:00Z'
  },
  {
    id: 'ms-3',
    profile_id: 'demo-student-aarav',
    title: 'Ship a Mini PyTorch Classification Project',
    description: 'Train a basic image classification model on CIFAR-10 and publish a working demo on Hugging Face Spaces.',
    target_skill: 'PyTorch',
    status: 'pending',
    estimated_effort: '2 days',
    why_it_matters: 'Turns PyTorch requirement from missing to project-demonstrated for MSR and ISRO opportunities.',
    unlocks_opportunities: ['Undergraduate Research Fellow - AI & NLP', 'Student Satellite Imagery & Vision Intern'],
    sort_order: 3,
    created_at: '2026-10-10T00:00:00Z',
    updated_at: '2026-10-10T00:00:00Z'
  }
];
