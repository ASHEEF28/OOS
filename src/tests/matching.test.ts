import { describe, it, expect } from 'vitest';
import { calculateOpportunityMatch } from '../lib/matching';
import { Opportunity, Profile, ProfileSkill } from '../types';

const baseProfile: Profile = {
  id: 'test-student',
  display_name: 'Test Student',
  course: 'BTech Computer Science',
  institution: 'Test University',
  year_of_study: 2,
  graduation_year: 2028,
  preferred_locations: ['Remote', 'Bengaluru'],
  preferred_work_modes: ['remote', 'hybrid'],
  interests: ['AI/ML', 'Software Engineering'],
  onboarding_completed: true,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

const baseOpportunity: Opportunity = {
  id: 'opp-test-1',
  title: 'AI Engineering Fellow',
  organization: 'Test Labs',
  description: 'Building machine learning pipelines',
  opportunity_type: 'research',
  domain: 'AI/ML',
  location: 'Remote',
  work_mode: 'remote',
  duration: '3 months',
  eligibility_rules: {
    allowed_courses: ['BTech', 'BE'],
    allowed_years: [1, 2, 3],
    requires_prior_experience: false,
  },
  required_skills: ['Python', 'Git'],
  preferred_skills: ['PyTorch'],
  source_url: 'https://example.com',
  application_url: 'https://example.com/apply',
  source_name: 'Test Registry',
  is_demo_data: true,
  is_active: true,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

describe('Deterministic Matching Engine Tests', () => {

  it('calculates full skill match correctly with high compatibility score', () => {
    const studentSkills: ProfileSkill[] = [
      {
        id: 'ps-1',
        profile_id: 'test-student',
        skill_id: 'skill-python',
        skill_name: 'Python',
        category: 'programming',
        self_reported_level: 'intermediate',
        evidence_status: 'challenge_assessed',
        updated_at: '2026-01-01T00:00:00Z',
      },
      {
        id: 'ps-2',
        profile_id: 'test-student',
        skill_id: 'skill-git',
        skill_name: 'Git',
        category: 'tools',
        self_reported_level: 'intermediate',
        evidence_status: 'project_supported',
        updated_at: '2026-01-01T00:00:00Z',
      },
      {
        id: 'ps-3',
        profile_id: 'test-student',
        skill_id: 'skill-pytorch',
        skill_name: 'PyTorch',
        category: 'ai_ml',
        self_reported_level: 'beginner',
        evidence_status: 'self_reported',
        updated_at: '2026-01-01T00:00:00Z',
      }
    ];

    const result = calculateOpportunityMatch(baseOpportunity, baseProfile, studentSkills);

    expect(result.eligibility).toBe('eligible');
    expect(result.skills_missing.length).toBe(0);
    expect(result.skills_matched).toContain('Python');
    expect(result.skills_matched).toContain('Git');
    expect(result.preferred_matched).toContain('PyTorch');
    expect(result.total_score).toBeGreaterThanOrEqual(80);
    expect(result.total_score).toBeLessThanOrEqual(100);
  });

  it('calculates partial skill match and accurately reports missing skills', () => {
    const partialSkills: ProfileSkill[] = [
      {
        id: 'ps-1',
        profile_id: 'test-student',
        skill_id: 'skill-python',
        skill_name: 'Python',
        category: 'programming',
        self_reported_level: 'beginner',
        evidence_status: 'self_reported',
        updated_at: '2026-01-01T00:00:00Z',
      }
    ];

    const result = calculateOpportunityMatch(baseOpportunity, baseProfile, partialSkills);

    expect(result.eligibility).toBe('eligible');
    expect(result.skills_matched).toEqual(['Python']);
    expect(result.skills_missing).toEqual(['Git']);
    expect(result.total_score).toBeLessThan(80);
    expect(result.total_score).toBeGreaterThan(30);
  });

  it('enforces mandatory hard eligibility rules on course and year restrictions', () => {
    const wrongYearProfile: Profile = {
      ...baseProfile,
      year_of_study: 4, // Opportunity only allows 1, 2, 3
    };

    const result = calculateOpportunityMatch(baseOpportunity, wrongYearProfile, []);

    expect(result.eligibility).toBe('ineligible');
    expect(result.ineligibility_reasons.length).toBeGreaterThan(0);
    // When ineligible, total score is strictly capped
    expect(result.total_score).toBeLessThanOrEqual(35);
  });

  it('enforces mandatory prior experience blocker', () => {
    const expOpportunity: Opportunity = {
      ...baseOpportunity,
      eligibility_rules: {
        requires_prior_experience: true,
      }
    };

    const result = calculateOpportunityMatch(expOpportunity, baseProfile, []);

    expect(result.eligibility).toBe('ineligible');
    expect(result.ineligibility_reasons).toContain('Requires prior industry experience (entry-level / beginner filter active)');
  });

  it('handles work mode mismatch gracefully with reduced work mode score', () => {
    const onsiteOpp: Opportunity = {
      ...baseOpportunity,
      work_mode: 'onsite',
      location: 'Tokyo, Japan',
    };

    const remoteOnlyProfile: Profile = {
      ...baseProfile,
      preferred_work_modes: ['remote'],
      preferred_locations: ['Remote'],
    };

    const result = calculateOpportunityMatch(onsiteOpp, remoteOnlyProfile, []);
    expect(result.work_mode_score).toBeLessThan(10);
  });

  it('produces stable and strictly bounded scores between 0 and 100', () => {
    const result1 = calculateOpportunityMatch(baseOpportunity, baseProfile, []);
    expect(result1.total_score).toBeGreaterThanOrEqual(0);
    expect(result1.total_score).toBeLessThanOrEqual(100);

    const result2 = calculateOpportunityMatch(baseOpportunity, baseProfile, []);
    expect(result1.total_score).toBe(result2.total_score);
  });

});
