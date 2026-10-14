import { Opportunity, Profile, ProfileSkill, MatchScoreBreakdown, LearningMilestone, WhatIfComparison } from '../types';
import { getStoredAiConfig } from './storage';

export interface ParsedSearchQuery {
  skills: string[];
  domain?: string;
  opportunity_type?: string;
  work_mode?: string;
  year_of_study?: number;
  course?: string;
  search_terms: string;
}

export interface ExtractedResumeData {
  course?: string;
  institution?: string;
  year_of_study?: number;
  graduation_year?: number;
  skills: { name: string; category: string; level: 'beginner' | 'intermediate' | 'advanced' }[];
  interests: string[];
  projects: { title: string; description: string; skills: string[] }[];
}

/**
 * Universal AI Caller supporting OpenAI-compatible endpoints with deterministic fallbacks.
 */
async function callAiApi(prompt: string, systemPrompt?: string): Promise<string | null> {
  const config = getStoredAiConfig();
  
  // Also check environment variables if available
  const apiKey = config.apiKey || import.meta.env.VITE_AI_API_KEY;
  const endpoint = config.endpoint || import.meta.env.VITE_AI_ENDPOINT || 'https://api.openai.com/v1';
  const model = config.model || import.meta.env.VITE_AI_MODEL || 'gpt-4o-mini';

  if (!apiKey) {
    return null; // Graceful fallback
  }

  try {
    const response = await fetch(`${endpoint.replace(/\/+$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt || 'You are OpportunityOS AI, an expert career intelligence and opportunity discovery advisor. Always respond with concise, grounded, realistic advice.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      console.warn('AI API returned error status:', response.status);
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (err) {
    console.warn('AI call failed, activating deterministic fallback:', err);
    return null;
  }
}

// ==========================================
// 1. Natural Language Search Query Parser
// ==========================================
export async function parseNaturalLanguageSearch(query: string): Promise<ParsedSearchQuery> {
  const fallback = parseNaturalLanguageSearchFallback(query);

  try {
    const aiPrompt = `Analyze the following natural-language search query from a student looking for internships or research opportunities:
"${query}"

Extract structured filters as JSON with this exact structure:
{
  "skills": ["string"],
  "domain": "string or null",
  "opportunity_type": "internship | research | open_source | startup | student_program or null",
  "work_mode": "remote | hybrid | onsite or null",
  "year_of_study": number or null,
  "course": "string or null",
  "search_terms": "cleaned core search words"
}
Output strictly valid JSON only.`;

    const raw = await callAiApi(aiPrompt, 'You are a search query parser. Output only valid JSON.');
    if (raw) {
      const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
      const parsed = JSON.parse(cleaned);
      return {
        skills: parsed.skills || fallback.skills,
        domain: parsed.domain || fallback.domain,
        opportunity_type: parsed.opportunity_type || fallback.opportunity_type,
        work_mode: parsed.work_mode || fallback.work_mode,
        year_of_study: parsed.year_of_study || fallback.year_of_study,
        course: parsed.course || fallback.course,
        search_terms: parsed.search_terms || fallback.search_terms,
      };
    }
  } catch (e) {
    // Return deterministic fallback
  }

  return fallback;
}

function parseNaturalLanguageSearchFallback(query: string): ParsedSearchQuery {
  const q = query.toLowerCase();
  const skills: string[] = [];

  const knownSkills = ['python', 'javascript', 'react', 'pytorch', 'sql', 'c++', 'go', 'docker', 'git', 'html', 'css', 'linux'];
  knownSkills.forEach(s => {
    if (q.includes(s)) skills.push(s.toUpperCase() === 'SQL' ? 'SQL' : s.charAt(0).toUpperCase() + s.slice(1));
  });

  let work_mode: string | undefined = undefined;
  if (q.includes('remote') || q.includes('work from home') || q.includes('wfh')) work_mode = 'remote';
  else if (q.includes('hybrid')) work_mode = 'hybrid';
  else if (q.includes('onsite') || q.includes('in-office') || q.includes('in office')) work_mode = 'onsite';

  let opportunity_type: string | undefined = undefined;
  if (q.includes('research') || q.includes('fellow') || q.includes('lab')) opportunity_type = 'research';
  else if (q.includes('open source') || q.includes('gsoc') || q.includes('foss')) opportunity_type = 'open_source';
  else if (q.includes('startup')) opportunity_type = 'startup';
  else if (q.includes('internship') || q.includes('intern')) opportunity_type = 'internship';

  let year_of_study: number | undefined = undefined;
  if (q.includes('first year') || q.includes('1st year') || q.includes('first-year')) year_of_study = 1;
  else if (q.includes('second year') || q.includes('2nd year')) year_of_study = 2;
  else if (q.includes('third year') || q.includes('3rd year')) year_of_study = 3;
  else if (q.includes('final year') || q.includes('4th year')) year_of_study = 4;

  let domain: string | undefined = undefined;
  if (q.includes('ml') || q.includes('machine learning') || q.includes('ai') || q.includes('artificial intelligence')) domain = 'AI/ML';
  else if (q.includes('security') || q.includes('cyber') || q.includes('malware')) domain = 'Cybersecurity';
  else if (q.includes('data') || q.includes('analytics')) domain = 'Data Science';
  else if (q.includes('web') || q.includes('software') || q.includes('fullstack') || q.includes('frontend')) domain = 'Software Engineering';

  return {
    skills,
    domain,
    opportunity_type,
    work_mode,
    year_of_study,
    search_terms: query.trim(),
  };
}

// ==========================================
// 2. Structured Resume & Profile Extraction
// ==========================================
export async function extractProfileFromResume(resumeText: string): Promise<ExtractedResumeData> {
  try {
    const aiPrompt = `Extract structured student education, skills, interests, and projects from this resume text:
"${resumeText.slice(0, 3000)}"

Return strictly JSON matching this structure:
{
  "course": "BTech Computer Science or similar",
  "institution": "University name",
  "year_of_study": 1,
  "graduation_year": 2028,
  "skills": [
    { "name": "Python", "category": "programming", "level": "intermediate" }
  ],
  "interests": ["AI/ML", "Web Development"],
  "projects": [
    { "title": "Project Name", "description": "Short summary", "skills": ["Python"] }
  ]
}`;

    const raw = await callAiApi(aiPrompt, 'You are an objective resume parser. Return valid JSON only.');
    if (raw) {
      const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
      return JSON.parse(cleaned);
    }
  } catch (e) {
    // Fall back to rule-based extractor
  }

  return extractProfileFromResumeFallback(resumeText);
}

function extractProfileFromResumeFallback(text: string): ExtractedResumeData {
  const t = text.toLowerCase();
  const detectedSkills: { name: string; category: string; level: 'beginner' | 'intermediate' | 'advanced' }[] = [];

  const catalog = [
    { name: 'Python', cat: 'programming', regex: /\bpython\b/i },
    { name: 'JavaScript', cat: 'programming', regex: /\bjavascript\b|\bjs\b/i },
    { name: 'TypeScript', cat: 'programming', regex: /\btypescript\b|\bts\b/i },
    { name: 'React', cat: 'framework', regex: /\breact\b|\breact\.js\b/i },
    { name: 'SQL', cat: 'database', regex: /\bsql\b|\bpostgresql\b|\bmysql\b/i },
    { name: 'Git', cat: 'tools', regex: /\bgit\b|\bgithub\b/i },
    { name: 'PyTorch', cat: 'ai_ml', regex: /\bpytorch\b/i },
    { name: 'Docker', cat: 'cloud_devops', regex: /\bdocker\b/i },
    { name: 'C++', cat: 'programming', regex: /\bc\+\+\b/i },
    { name: 'HTML & CSS', cat: 'framework', regex: /\bhtml\b|\bcss\b/i },
  ];

  catalog.forEach(item => {
    if (item.regex.test(text)) {
      detectedSkills.push({
        name: item.name,
        category: item.cat,
        level: 'intermediate',
      });
    }
  });

  return {
    course: t.includes('btech') ? 'BTech Computer Science' : t.includes('bca') ? 'BCA' : 'Undergraduate Computer Science',
    institution: 'University Engineering College',
    year_of_study: t.includes('2nd year') || t.includes('second year') ? 2 : 1,
    graduation_year: 2028,
    skills: detectedSkills.length > 0 ? detectedSkills : [
      { name: 'Python', category: 'programming', level: 'intermediate' },
      { name: 'Git', category: 'tools', level: 'beginner' }
    ],
    interests: ['AI/ML', 'Software Engineering'],
    projects: [
      {
        title: 'Academic Web Portfolio',
        description: 'Responsive web project showcasing student engineering assignments and projects.',
        skills: ['HTML & CSS', 'Git']
      }
    ]
  };
}

// ==========================================
// 3. Match Explanation Enhancer
// ==========================================
export async function generateAIEnhancedExplanation(
  opportunity: Opportunity,
  profile: Profile,
  breakdown: MatchScoreBreakdown
): Promise<string> {
  try {
    const prompt = `Based on the following deterministic match calculation for student ${profile.display_name} applying to "${opportunity.title}" at "${opportunity.organization}":
- Compatibility Score: ${breakdown.total_score}%
- Eligibility State: ${breakdown.eligibility}
- Matched Skills: ${breakdown.skills_matched.join(', ') || 'None'}
- Missing Skills: ${breakdown.skills_missing.join(', ') || 'None'}
- Work Mode: ${opportunity.work_mode} (${breakdown.work_mode_details})

Write a 2-sentence encouraging, realistic executive insight advising the student on their competitiveness and the single most high-leverage move they can take.`;

    const aiRes = await callAiApi(prompt);
    if (aiRes) return aiRes.trim();
  } catch (e) {}

  return breakdown.executive_summary;
}

// ==========================================
// 4. Personalized Project Suggestions for Skill Gap
// ==========================================
export async function suggestProjectForSkillGap(
  missingSkill: string,
  targetOpportunityTitle: string
): Promise<{ title: string; description: string; estimatedHours: number }> {
  try {
    const prompt = `Suggest one practical, resume-worthy mini project for an undergraduate student to learn and demonstrate "${missingSkill}" specifically relevant for opportunities like "${targetOpportunityTitle}".
Return JSON format:
{
  "title": "string",
  "description": "2-sentence practical project brief",
  "estimatedHours": 8
}`;
    const raw = await callAiApi(prompt, 'Return only valid JSON.');
    if (raw) {
      const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
      return JSON.parse(cleaned);
    }
  } catch (e) {}

  return {
    title: `Micro-${missingSkill} Telemetry Dashboard`,
    description: `Build a clean, documented open-source project demonstrating core ${missingSkill} syntax, error handling, and unit test coverage.`,
    estimatedHours: 6,
  };
}

// ==========================================
// 5. What-If Scenario Analysis Explainer
// ==========================================
export async function explainWhatIfDelta(
  comparison: WhatIfComparison,
  scenarioDesc: string
): Promise<string> {
  try {
    const prompt = `The student simulated a career what-if scenario: "${scenarioDesc}".
Result:
- Eligible opportunities increased from ${comparison.baselineEligibleCount} to ${comparison.simulatedEligibleCount}.
- Unlocked opportunities: ${comparison.newlyUnlockedOpportunities.map(o => o.opportunity.title).slice(0, 3).join(', ')}.
- Remaining skill gaps: ${comparison.remainingGaps.slice(0, 2).join(', ')}.

Provide a 2-3 sentence strategic takeaway on whether this hypothetical milestone represents high ROI for their internship search.`;

    const res = await callAiApi(prompt);
    if (res) return res.trim();
  } catch (e) {}

  const unlockedCount = comparison.newlyUnlockedOpportunities.length;
  return `This simulated milestone unlocks ${unlockedCount} high-value opportunity${unlockedCount === 1 ? '' : 's'} and raises your average match score by +${Math.round(comparison.scoreIncreases.reduce((acc, c) => acc + c.delta, 0) / (comparison.scoreIncreases.length || 1))}%. Focusing on ${comparison.remainingGaps[0] || 'completing a public repo'} remains your next strategic edge.`;
}
