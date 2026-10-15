import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// AI Provider Configuration
const getAIConfig = async (profileId: string) => {
  const { data } = await supabase
    .from('user_settings')
    .select('ai_config')
    .eq('profile_id', profileId)
    .single()
  
  return data?.ai_config || {
    provider: 'openai',
    model: 'gpt-4o-mini',
    endpoint: 'https://api.openai.com/v1',
    apiKey: Deno.env.get('OPENAI_API_KEY') || '',
    enabled: true
  }
}

const callAIApi = async (prompt: string, systemPrompt: string, profileId: string) => {
  const config = await getAIConfig(profileId)
  
  if (!config.enabled || !config.apiKey) {
    return null
  }

  let endpoint = config.endpoint
  if (!endpoint.endsWith('/')) {
    endpoint += '/'
  }
  
  const url = `${endpoint}chat/completions`
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 1000
    })
  })

  if (!response.ok) {
    throw new Error(`AI API error: ${response.status}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || null
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    })
  }

  try {
    const { profileId, operation, data } = await req.json()

    if (!profileId) {
      return new Response(
        JSON.stringify({ error: 'Profile ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Verify profile exists
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', profileId)
      .single()

    if (profileError || !profileData) {
      return new Response(
        JSON.stringify({ error: 'Invalid profile ID' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    let result = null

    switch (operation) {
      case 'extractProfileFromResume':
        const extractPrompt = `Extract structured student education, skills, interests, and projects from this resume text:
        "${data.resumeText.slice(0, 3000)}"
        
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
        }`
        
        const extractResult = await callAIApi(
          extractPrompt,
          'You are an objective resume parser. Return valid JSON only.',
          profileId
        )
        
        if (extractResult) {
          try {
            const cleaned = extractResult.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()
            result = JSON.parse(cleaned)
          } catch (parseError) {
            // Fallback to rule-based extraction
            result = extractProfileFromResumeFallback(data.resumeText)
          }
        } else {
          result = extractProfileFromResumeFallback(data.resumeText)
        }
        break

      case 'parseNaturalLanguageSearch':
        const parsePrompt = `Analyze the following natural-language search query from a student looking for internships or research opportunities:
        "${data.query}"
        
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
        Output strictly valid JSON only.`
        
        const parseResult = await callAIApi(
          parsePrompt,
          'You are a search query parser. Output only valid JSON.',
          profileId
        )
        
        if (parseResult) {
          try {
            const cleaned = parseResult.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()
            const parsed = JSON.parse(cleaned)
            result = {
              skills: parsed.skills || [],
              domain: parsed.domain || null,
              opportunity_type: parsed.opportunity_type || null,
              work_mode: parsed.work_mode || null,
              year_of_stoke: parsed.year_of_stoke || null,
              course: parsed.course || null,
              search_terms: parsed.search_terms || data.query.trim()
            }
          } catch (parseError) {
            result = parseNaturalLanguageSearchFallback(data.query)
          }
        } else {
          result = parseNaturalLanguageSearchFallback(data.query)
        }
        break

      case 'generateAIEnhancedExplanation':
        const explanationPrompt = `Based on the following deterministic match calculation for student applying to "${data.opportunity.title}" at "${data.opportunity.organization}":
        - Compatibility Score: ${data.breakdown.total_score}%
        - Eligibility State: ${data.breakdown.eligibility}
        - Matched Skills: ${data.breakdown.skills_matched.join(', ') || 'None'}
        - Missing Skills: ${data.breakdown.skills_missing.join(', ') || 'None'}
        - Work Mode: ${data.opportunity.work_mode} (${data.breakdown.work_mode_details})
        
        Write a 2-sentence encouraging, realistic executive insight advising the student on their competitiveness and the single most high-leverage move they can take.`
        
        result = await callAIApi(
          explanationPrompt,
          'You are OpportunityOS AI, an expert career intelligence advisor.',
          profileId
        ) || data.breakdown.executive_summary
        break

      case 'suggestProjectForSkillGap':
        const projectPrompt = `Suggest one practical, resume-worthy mini project for an undergraduate student to learn and demonstrate "${data.missingSkill}" specifically relevant for opportunities like "${data.targetOpportunityTitle}".
        Return JSON format:
        {
          "title": "string",
          "description": "2-sentence practical project brief",
          "estimatedHours": 8
        }`
        
        const projectResult = await callAIApi(
          projectPrompt,
          'Return only valid JSON.',
          profileId
        )
        
        if (projectResult) {
          try {
            const cleaned = projectResult.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()
            result = JSON.parse(cleaned)
          } catch (parseError) {
            result = {
              title: `Micro-${data.missingSkill} Telemetry Dashboard`,
              description: `Build a clean, documented open-source project demonstrating core ${data.missingSkill} syntax, error handling, and unit test coverage.`,
              estimatedHours: 6
            }
          }
        } else {
          result = {
            title: `Micro-${data.missingSkill} Telemetry Dashboard`,
            description: `Build a clean, documented open-source project demonstrating core ${data.missingSkill} syntax, error handling, and unit test coverage.`,
            estimatedHours: 6
          }
        }
        break

      case 'explainWhatIfDelta':
        const whatIfPrompt = `The student simulated a career what-if scenario: "${data.scenarioDesc}".
        Result:
        - Eligible opportunities increased from ${data.comparison.baselineEligibleCount} to ${data.comparison.simulatedEligibleCount}.
        - Unlocked opportunities: ${data.comparison.newlyUnlockedOpportunities.map(o => o.opportunity.title).slice(0, 3).join(', ')}.
        - Remaining skill gaps: ${data.comparison.remainingGaps.slice(0, 2).join(', ')}.
        
        Provide a 2-3 sentence strategic takeaway on whether this hypothetical milestone represents high ROI for their internship search.`
        
        result = await callAIApi(
          whatIfPrompt,
          'You are OpportunityOS AI, providing strategic career advice.',
          profileId
        )
        
        if (!result) {
          const unlockedCount = data.comparison.newlyUnlockedOpportunities.length
          result = `This simulated milestone unlocks ${unlockedCount} high-value opportunity${unlockedCount === 1 ? '' : 's'} and raises your average match score by +${Math.round(data.comparison.scoreIncreases.reduce((acc, c) => acc + c.delta, 0) / (data.comparison.scoreIncreases.length || 1))}%. Focusing on ${data.comparison.remainingGaps[0] || 'completing a public repo'} remains your next strategic edge.`
        }
        break

      default:
        return new Response(
          JSON.stringify({ error: 'Unknown operation' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
    }

    return new Response(
      JSON.stringify({ result }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )
  } catch (error) {
    console.error('Edge Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

// Fallback functions
function extractProfileFromResumeFallback(text: string) {
  const t = text.toLowerCase()
  const detectedSkills: { name: string; category: string; level: 'beginner' | 'intermediate' | 'advanced' }[] = []

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
  ]

  catalog.forEach(item => {
    if (item.regex.test(text)) {
      detectedSkills.push({
        name: item.name,
        category: item.cat,
        level: 'intermediate',
      })
    }
  })

  return {
    course: t.includes('btech') ? 'BTech Computer Science' : t.includes('bca') ? 'BCA' : 'Undergraduate Computer Science',
    institution: 'University Engineering College',
    year_of_stoke: t.includes('2nd year') || t.includes('second year') ? 2 : 1,
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
  }
}

function parseNaturalLanguageSearchFallback(query: string) {
  const q = query.toLowerCase()
  const skills: string[] = []

  const knownSkills = ['python', 'javascript', 'react', 'pytorch', 'sql', 'c++', 'go', 'docker', 'git', 'html', 'css', 'linux']
  knownSkills.forEach(s => {
    if (q.includes(s)) skills.push(s.toUpperCase() === 'SQL' ? 'SQL' : s.charAt(0).toUpperCase() + s.slice(1))
  })

  let work_mode: string | undefined = undefined
  if (q.includes('remote') || q.includes('work from home') || q.includes('wfh')) work_mode = 'remote'
  else if (q.includes('hybrid')) work_mode = 'hybrid'
  else if (q.includes('onsite') || q.includes('in-office') || q.includes('in office')) work_mode = 'onsite'

  let opportunity_type: string | undefined = undefined
  if (q.includes('research') || q.includes('fellow') || q.includes('lab')) opportunity_type = 'research'
  else if (q.includes('open source') || q.includes('gsoc') || q.includes('foss')) opportunity_type = 'open_source'
  else if (q.includes('startup')) opportunity_type = 'startup'
  else if (q.includes('internship') || q.includes('intern')) opportunity_type = 'internship'

  let year_of_stoke: number | undefined = undefined
  if (q.includes('first year') || q.includes('1st year') || q.includes('first-year')) year_of_stoke = 1
  else if (q.includes('second year') || q.includes('2nd year')) year_of_stoke = 2
  else if (q.includes('third year') || q.includes('3rd year')) year_of_stoke = 3
  else if (q.includes('final year') || q.includes('4th year')) year_of_stoke = 4

  let domain: string | undefined = undefined
  if (q.includes('ml') || q.includes('machine learning') || q.includes('ai') || q.includes('artificial intelligence')) domain = 'AI/ML'
  else if (q.includes('security') || q.includes('cyber') || q.includes('malware')) domain = 'Cybersecurity'
  else if (q.includes('data') || q.includes('analytics')) domain = 'Data Science'
  else if (q.includes('web') || q.includes('software') || q.includes('fullstack') || q.includes('frontend')) domain = 'Software Engineering'

  return {
    skills,
    domain,
    opportunity_type,
    work_mode,
    year_of_stoke,
    search_terms: query.trim()
  }
}