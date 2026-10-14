import { Opportunity, Profile, ProfileSkill, MatchScoreBreakdown, EligibilityStatus } from '../types';

export function calculateOpportunityMatch(
  opportunity: Opportunity,
  profile: Profile,
  profileSkills: ProfileSkill[]
): MatchScoreBreakdown {
  const eligibilityReasons: string[] = [];
  const ineligibilityReasons: string[] = [];
  const unknownFactors: string[] = [];

  // ==========================================
  // 1. HARD ELIGIBILITY RULES EVALUATION (20 pts max academic)
  // ==========================================
  let isHardIneligible = false;
  let academicScore = 0;

  const rules = opportunity.eligibility_rules;

  // Course / Degree eligibility
  if (rules.allowed_courses && rules.allowed_courses.length > 0) {
    const isAnyCourse = rules.allowed_courses.includes('Any');
    const studentCourseNorm = profile.course.toLowerCase();
    
    const matchesCourse = isAnyCourse || rules.allowed_courses.some(c => 
      studentCourseNorm.includes(c.toLowerCase()) || c.toLowerCase().includes(studentCourseNorm)
    );

    if (matchesCourse) {
      academicScore += 10;
      eligibilityReasons.push(`Course eligible: ${profile.course} matches required disciplines (${rules.allowed_courses.join(', ')})`);
    } else {
      isHardIneligible = true;
      ineligibilityReasons.push(`Course restricted: Requires ${rules.allowed_courses.join(', ')}, but profile indicates ${profile.course}`);
    }
  } else {
    academicScore += 10;
    unknownFactors.push('Academic discipline not restricted');
  }

  // Year of Study eligibility
  if (rules.allowed_years && rules.allowed_years.length > 0) {
    if (rules.allowed_years.includes(profile.year_of_study)) {
      academicScore += 10;
      eligibilityReasons.push(`Year eligible: Year ${profile.year_of_study} is accepted (${rules.allowed_years.map(y => `Yr ${y}`).join(', ')})`);
    } else {
      isHardIneligible = true;
      ineligibilityReasons.push(`Year requirement not met: Open only to year(s) ${rules.allowed_years.join(', ')}, but profile is Year ${profile.year_of_study}`);
    }
  } else {
    academicScore += 10;
  }

  // GPA Check
  if (rules.min_gpa) {
    unknownFactors.push(`Requires minimum GPA of ${rules.min_gpa} (self-verification needed)`);
  }

  // Prior experience requirement
  let experienceScore = 0;
  let experienceDetails = '';
  if (rules.requires_prior_experience) {
    isHardIneligible = true;
    ineligibilityReasons.push('Requires prior industry experience (entry-level / beginner filter active)');
    experienceDetails = 'Requires prior professional experience';
  } else {
    experienceScore = 10;
    experienceDetails = 'Beginner-friendly: No prior professional or corporate experience required';
    eligibilityReasons.push(experienceDetails);
  }

  // Final eligibility status
  let finalEligibility: EligibilityStatus = 'eligible';
  if (isHardIneligible) {
    finalEligibility = 'ineligible';
  } else if (unknownFactors.length > 1) {
    finalEligibility = 'unknown';
  }

  // ==========================================
  // 2. SKILLS MATCH EVALUATION (40 pts max)
  // ==========================================
  const studentSkillMap = new Map<string, ProfileSkill>();
  profileSkills.forEach(ps => {
    studentSkillMap.set(ps.skill_name.toLowerCase(), ps);
  });

  const skillsMatched: string[] = [];
  const skillsMissing: string[] = [];
  const preferredMatched: string[] = [];

  let skillPointsAccumulated = 0;
  const totalRequired = opportunity.required_skills.length;

  if (totalRequired > 0) {
    const pointsPerReq = 35 / totalRequired;

    opportunity.required_skills.forEach(req => {
      const match = studentSkillMap.get(req.toLowerCase());
      if (match) {
        skillsMatched.push(req);
        // Evidence multiplier
        let multiplier = 0.65; // self-reported default
        if (match.evidence_status === 'challenge_assessed') {
          multiplier = 1.0;
        } else if (match.evidence_status === 'project_supported') {
          multiplier = 0.85;
        }
        skillPointsAccumulated += pointsPerReq * multiplier;
      } else {
        skillsMissing.push(req);
      }
    });
  } else {
    skillPointsAccumulated = 35;
  }

  // Preferred skills bonus (up to 5 points)
  if (opportunity.preferred_skills && opportunity.preferred_skills.length > 0) {
    opportunity.preferred_skills.forEach(pref => {
      if (studentSkillMap.has(pref.toLowerCase())) {
        preferredMatched.push(pref);
      }
    });
    const bonus = Math.min(5, preferredMatched.length * 2.5);
    skillPointsAccumulated += bonus;
  }

  const skillsScore = Math.min(40, Math.round(skillPointsAccumulated));

  // ==========================================
  // 3. INTEREST ALIGNMENT (15 pts max)
  // ==========================================
  const matchedInterests: string[] = [];
  let interestScore = 0;

  const domain = opportunity.domain.toLowerCase();
  profile.interests.forEach(interest => {
    const intLower = interest.toLowerCase();
    if (
      domain.includes(intLower) ||
      intLower.includes(domain) ||
      opportunity.title.toLowerCase().includes(intLower) ||
      opportunity.description.toLowerCase().includes(intLower)
    ) {
      if (!matchedInterests.includes(interest)) {
        matchedInterests.push(interest);
      }
    }
  });

  if (matchedInterests.length >= 2) {
    interestScore = 15;
  } else if (matchedInterests.length === 1) {
    interestScore = 10;
  } else {
    interestScore = 4; // baseline cross-domain discovery
  }

  // ==========================================
  // 4. WORK MODE & LOCATION COMPATIBILITY (15 pts max)
  // ==========================================
  let workModeScore = 0;
  let workModeDetails = '';

  const studentPrefersMode = profile.preferred_work_modes.includes(opportunity.work_mode);
  const isRemote = opportunity.work_mode === 'remote';
  const matchesLocation = profile.preferred_locations.some(loc => 
    opportunity.location.toLowerCase().includes(loc.toLowerCase()) || loc.toLowerCase() === 'remote'
  );

  if (isRemote && profile.preferred_work_modes.includes('remote')) {
    workModeScore = 15;
    workModeDetails = 'Perfect work-mode alignment: 100% remote asynchronous role';
  } else if (studentPrefersMode && matchesLocation) {
    workModeScore = 15;
    workModeDetails = `Matches preferred ${opportunity.work_mode} mode in ${opportunity.location}`;
  } else if (studentPrefersMode) {
    workModeScore = 11;
    workModeDetails = `Compatible work-mode (${opportunity.work_mode}), but location is in ${opportunity.location}`;
  } else if (isRemote) {
    workModeScore = 10;
    workModeDetails = 'Remote work available';
  } else {
    workModeScore = 4;
    workModeDetails = `Location/mode mismatch: Requires ${opportunity.work_mode} in ${opportunity.location}`;
  }

  // ==========================================
  // 5. TOTAL SCORE CALCULATION
  // ==========================================
  let rawTotal = skillsScore + academicScore + interestScore + workModeScore + experienceScore;

  // Hard ineligible opportunities cap at max 35 score to never fool the student
  if (finalEligibility === 'ineligible') {
    rawTotal = Math.min(rawTotal, 35);
  }

  const totalScore = Math.max(0, Math.min(100, Math.round(rawTotal)));

  // Generate grounded executive summary
  let executiveSummary = '';
  if (finalEligibility === 'ineligible') {
    executiveSummary = `Currently Ineligible: ${ineligibilityReasons.join('; ')}.`;
  } else if (skillsMissing.length === 0) {
    executiveSummary = `High Compatibility Match (${totalScore}%): You demonstrate all required skills (${skillsMatched.join(', ')}) with strong academic fit for your ${profile.course} curriculum.`;
  } else if (skillsMatched.length > 0) {
    executiveSummary = `Promising Match (${totalScore}%): Matches your verified skills (${skillsMatched.join(', ')}). Developing ${skillsMissing.slice(0, 2).join(' and ')} would maximize your candidacy.`;
  } else {
    executiveSummary = `Exploratory Opportunity (${totalScore}%): Aligns with your interest in ${opportunity.domain}, but requires core foundational skills (${skillsMissing.slice(0, 3).join(', ')}).`;
  }

  // Next action unlock suggestion
  let nextActionUnlock = '';
  if (skillsMissing.length > 0) {
    nextActionUnlock = `Complete a project or skill challenge in ${skillsMissing[0]} to unlock approximately +${Math.round(35 / (opportunity.required_skills.length || 1))} match points.`;
  } else if (skillsMatched.some(s => studentSkillMap.get(s.toLowerCase())?.evidence_status === 'self_reported')) {
    nextActionUnlock = 'Take the Proof-of-Skill challenge to upgrade your self-reported skill to Challenge-Assessed and boost ranking confidence.';
  } else {
    nextActionUnlock = 'Ready to apply! Save to tracker and prepare your project links.';
  }

  return {
    total_score: totalScore,
    eligibility: finalEligibility,
    eligibility_reasons: eligibilityReasons,
    ineligibility_reasons: ineligibilityReasons,
    unknown_factors: unknownFactors,
    skills_score: skillsScore,
    skills_matched: skillsMatched,
    skills_missing: skillsMissing,
    preferred_matched: preferredMatched,
    academic_score: academicScore,
    academic_match_details: `${profile.course} (Year ${profile.year_of_study})`,
    interest_score: interestScore,
    matched_interests: matchedInterests,
    work_mode_score: workModeScore,
    work_mode_details: workModeDetails,
    experience_score: experienceScore,
    experience_details: experienceDetails,
    executive_summary: executiveSummary,
    next_action_unlock: nextActionUnlock,
    nextActionUnlock: nextActionUnlock,
  };
}
