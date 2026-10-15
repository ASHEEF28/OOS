-- ====================================================================
-- OPPORTUNITYOS DATABASE SCHEMA
-- Initial Migration: 20261014_init.sql
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    course TEXT NOT NULL,
    institution TEXT NOT NULL,
    year_of_study INTEGER NOT NULL CHECK (year_of_study BETWEEN 1 AND 6),
    graduation_year INTEGER NOT NULL,
    preferred_locations TEXT[] DEFAULT '{}',
    preferred_work_modes TEXT[] DEFAULT '{}',
    interests TEXT[] DEFAULT '{}',
    onboarding_completed BOOLEAN DEFAULT FALSE,
    avatar_url TEXT,
    bio TEXT,
    github_url TEXT,
    linkedin_url TEXT,
    portfolio_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SKILLS MASTER TABLE
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    normalized_name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PROFILE_SKILLS TABLE
CREATE TABLE IF NOT EXISTS public.profile_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE RESTRICT,
    self_reported_level TEXT NOT NULL CHECK (self_reported_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    evidence_status TEXT NOT NULL CHECK (evidence_status IN ('self_reported', 'project_supported', 'challenge_assessed')),
    score INTEGER CHECK (score BETWEEN 0 AND 100),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(profile_id, skill_id)
);

-- 4. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    repository_url TEXT,
    project_url TEXT,
    project_type TEXT NOT NULL CHECK (project_type IN ('personal', 'academic', 'hackathon', 'open_source')),
    skills_demonstrated TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. OPPORTUNITIES TABLE
CREATE TABLE IF NOT EXISTS public.opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    organization TEXT NOT NULL,
    organization_logo TEXT,
    description TEXT NOT NULL,
    opportunity_type TEXT NOT NULL CHECK (opportunity_type IN ('internship', 'research', 'open_source', 'startup', 'student_program')),
    domain TEXT NOT NULL,
    location TEXT NOT NULL,
    work_mode TEXT NOT NULL CHECK (work_mode IN ('remote', 'hybrid', 'onsite')),
    compensation_min NUMERIC,
    compensation_max NUMERIC,
    compensation_currency TEXT DEFAULT 'INR',
    compensation_text TEXT,
    duration TEXT,
    deadline DATE,
    eligibility_rules JSONB NOT NULL DEFAULT '{}',
    required_skills TEXT[] NOT NULL DEFAULT '{}',
    preferred_skills TEXT[] DEFAULT '{}',
    source_url TEXT NOT NULL,
    application_url TEXT NOT NULL,
    source_name TEXT NOT NULL,
    last_verified_at DATE,
    is_demo_data BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SKILL CHALLENGES TABLE
CREATE TABLE IF NOT EXISTS public.skill_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    skill_id UUID REFERENCES public.skills(id) ON DELETE SET NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    estimated_minutes INTEGER NOT NULL,
    instructions TEXT NOT NULL,
    starter_code TEXT NOT NULL,
    evaluation_type TEXT NOT NULL CHECK (evaluation_type IN ('code_tests', 'sql_query', 'interactive_rubric')),
    evaluation_config JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CHALLENGE SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.challenge_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES public.skill_challenges(id) ON DELETE CASCADE,
    submission TEXT NOT NULL,
    score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
    result_summary TEXT NOT NULL,
    evaluation_status TEXT NOT NULL CHECK (evaluation_status IN ('passed', 'failed', 'needs_revision')),
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. SKILL EVIDENCE TABLE
CREATE TABLE IF NOT EXISTS public.skill_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE RESTRICT,
    evidence_type TEXT NOT NULL CHECK (evidence_type IN ('self_reported', 'project_supported', 'challenge_assessed')),
    source_id TEXT NOT NULL,
    assessment_score INTEGER CHECK (assessment_score BETWEEN 0 AND 100),
    evidence_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. OPPORTUNITY SAVES TABLE
CREATE TABLE IF NOT EXISTS public.opportunity_saves (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(profile_id, opportunity_id)
);

-- 10. APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('saved', 'planning', 'applied', 'interview', 'offer', 'rejected', 'withdrawn')),
    notes TEXT DEFAULT '',
    applied_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(profile_id, opportunity_id)
);

-- 11. LEARNING MILESTONES TABLE
CREATE TABLE IF NOT EXISTS public.learning_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    target_skill_id UUID REFERENCES public.skills(id) ON DELETE SET NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed')),
    estimated_effort TEXT,
    why_it_matters TEXT,
    unlocks_opportunities TEXT[] DEFAULT '{}',
    sort_order INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_milestones ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 2. Skills Master Policies (Public Read)
DROP POLICY IF EXISTS "Public read skills" ON public.skills;
CREATE POLICY "Public read skills" ON public.skills
    FOR SELECT TO PUBLIC USING (true);

-- 3. Profile Skills Policies
DROP POLICY IF EXISTS "Users manage own skills" ON public.profile_skills;
CREATE POLICY "Users manage own skills" ON public.profile_skills
    FOR ALL USING (auth.uid() = profile_id);

-- 4. Projects Policies
DROP POLICY IF EXISTS "Users manage own projects" ON public.projects;
CREATE POLICY "Users manage own projects" ON public.projects
    FOR ALL USING (auth.uid() = profile_id);

-- 5. Opportunities Policies (Public Read for Active Opportunities)
DROP POLICY IF EXISTS "Public read active opportunities" ON public.opportunities;
CREATE POLICY "Public read active opportunities" ON public.opportunities
    FOR SELECT TO PUBLIC USING (is_active = true);

-- 6. Challenges Policies (Public Read for Active Challenges)
DROP POLICY IF EXISTS "Public read challenges" ON public.skill_challenges;
CREATE POLICY "Public read challenges" ON public.skill_challenges
    FOR SELECT TO PUBLIC USING (is_active = true);

-- 7. Challenge Submissions Policies
DROP POLICY IF EXISTS "Users view and create own submissions" ON public.challenge_submissions;
CREATE POLICY "Users view and create own submissions" ON public.challenge_submissions
    FOR ALL USING (auth.uid() = profile_id);

-- 8. Skill Evidence Policies
DROP POLICY IF EXISTS "Users view own evidence" ON public.skill_evidence;
CREATE POLICY "Users view own evidence" ON public.skill_evidence
    FOR ALL USING (auth.uid() = profile_id);

-- 9. Opportunity Saves Policies
DROP POLICY IF EXISTS "Users manage own saves" ON public.opportunity_saves;
CREATE POLICY "Users manage own saves" ON public.opportunity_saves
    FOR ALL USING (auth.uid() = profile_id);

-- 10. Applications Tracker Policies
DROP POLICY IF EXISTS "Users manage own applications" ON public.applications;
CREATE POLICY "Users manage own applications" ON public.applications
    FOR ALL USING (auth.uid() = profile_id);

-- 11. Learning Milestones Policies
DROP POLICY IF EXISTS "Users manage own milestones" ON public.learning_milestones;
CREATE POLICY "Users manage own milestones" ON public.learning_milestones
    FOR ALL USING (auth.uid() = profile_id);

-- ====================================================================
-- INDEXES FOR HIGH QUERY EFFICIENCY
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_opportunities_type ON public.opportunities (opportunity_type);
CREATE INDEX IF NOT EXISTS idx_opportunities_work_mode ON public.opportunities (work_mode);
CREATE INDEX IF NOT EXISTS idx_opportunities_domain ON public.opportunities (domain);
CREATE INDEX IF NOT EXISTS idx_profile_skills_profile ON public.profile_skills (profile_id);
CREATE INDEX IF NOT EXISTS idx_applications_profile ON public.applications (profile_id);
