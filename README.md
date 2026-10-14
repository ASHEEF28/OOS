# OpportunityOS

> **"Your potential is bigger than your resume."**  
> AI-powered opportunity intelligence and career readiness platform for students.

---

## 🌟 Executive Summary & Innovation

Students frequently struggle to find internships because they lack prior corporate experience, industry networks, or strong resumes. Traditional job boards force users into basic keyword searches.

**OpportunityOS changes the paradigm** through an **evidence-driven discovery engine**:
1. **Interactive Opportunity Intelligence Graph**: A data-driven relational network linking student capabilities, verified skills, projects, and 30+ opportunities.
2. **Deterministic & Explainable Matching Engine**: Transparent multi-factor scoring (Skills: 40pts, Academic fit: 20pts, Interest: 15pts, Work-mode: 15pts, Experience: 10pts) with **hard eligibility rule verification**.
3. **Proof of Skill Benchmarks**: Practical sandbox coding challenges (Python, SQL, JavaScript, ML) with deterministic test suites that elevate self-reported claims into **Challenge-Assessed evidence**.
4. **Career What-If Simulator**: Scenario sandbox enabling students to test: *"What if I learn PyTorch or build a computer vision app?"* and see in real time which fellowships and internships unlock.
5. **Universal AI Provider Adapter**: Works with any OpenAI-compatible endpoint (OpenAI, Groq, DeepSeek, Ollama) while maintaining **100% offline deterministic fallbacks** for all core flows.
6. **Application Workspace Pipeline**: Kanban and table trackers for bookmarks, deadlines, notes, and external links.

---

## 🚀 Key Pages & Complete User Journey

- `/` — **Landing Page**: Compelling Midnight Intelligence theme, live interactive graph preview, 3-step explanation, Proof-of-Skill highlight, and one-click demo launch.
- `/dashboard` — **Command Center**: Discovered opportunities, verified evidence count, active applications, "Your Next Best Move" actionable AI card, graph preview, and ranked recommendations.
- `/opportunities` — **Opportunity Explorer**: Multi-facet filtering (Domain, Type, Work Mode, Skills, Eligible Only), sort by score/deadline/stipend, and natural-language AI search.
- `/opportunities/:id` — **Opportunity Details**: Comprehensive program overview, 5-category explainable score breakdown modal, hard eligibility checks, and missing prerequisite challenges.
- `/graph` — **Full-Screen Opportunity Graph**: Visual relational canvas connecting Student -> Skills -> Projects -> Target Opportunities with node selection inspector.
- `/proof-of-skill` — **Skill Benchmarks**: Curated interactive coding challenges with live deterministic tests, rubric validation, confetti celebrations, and evidence ledger persistence.
- `/simulator` — **Career What-If Simulator**: Interactive scenario builder allowing students to simulate hypothetical skills or projects and observe real-time score increases and unlocked listings.
- `/roadmap` — **Personalized Learning Roadmap**: Ordered milestones with effort estimates, target skill objectives, and specific unlocked opportunities.
- `/applications` — **Application Pipeline**: Kanban board and table views with drag/status updates (Saved, Planning, Applied, Interview, Offer, Rejected), deadlines, and notes.
- `/profile` — **Profile & Evidence**: Academic degree, study year, bio editor, project repository links, and verified skills ledger.
- `/settings` — **AI Configuration & Demo Control**: Universal OpenAI-compatible API configuration, live connection tester, and one-click demo reset button.
- `/onboarding` — **Guided 5-Step Setup**: Education, Skills, Domain Interests, Work Mode preferences, and AI resume parsing.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Framer Motion |
| **Graph Visualization** | `@xyflow/react` (React Flow) |
| **State & Persistence** | TanStack Query, LocalStorage Reactive Store with cross-tab event synchronization |
| **Database & Auth** | Supabase PostgreSQL schema, Row-Level Security (RLS) policies, `@supabase/supabase-js` |
| **AI Integration** | Provider-independent OpenAI-compatible service (OpenAI, Groq, DeepSeek, Ollama) + local deterministic fallbacks |
| **Testing** | Vitest unit test runner (matching engine & sandbox test evaluators) |

---

## ⚙️ Quick Start & Local Setup

### 1. Prerequisites
- Node.js (v18 or higher recommended; v24 tested)
- npm (v9+ recommended)

### 2. Clone and Install
```bash
git clone https://github.com/your-org/opportunityos.git
cd opportunityos
npm install
```

### 3. Environment Configuration
Copy the example environment file:
```bash
cp .env.example .env
```
*(Optional)* Populate keys in `.env` if you wish to connect Supabase or an AI provider:
```env
# Optional Supabase Integration (App runs fully in Demo Mode without Supabase)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Optional AI Provider (Deterministic fallbacks provided for all workflows)
VITE_AI_ENDPOINT=https://api.openai.com/v1
VITE_AI_API_KEY=your-api-key-here
VITE_AI_MODEL=gpt-4o-mini
```

### 4. Development Server
Run Vite in development mode:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Testing

Execute the automated Vitest test suite:
```bash
npm run test
```
Runs tests covering:
- Full skill match calculations & score bounding (0-100)
- Mandatory hard eligibility rule enforcement (degree & study year restrictions)
- Prior experience blockers
- Partial matches and missing skill detection
- Deterministic Python telemetry sandbox test cases
- SQL analytical query syntax & clause validation
- Machine learning classification metric calculators

---

## 🏗️ Production Build

Build the optimized client bundle:
```bash
npm run build
```

Preview the production build locally:
```bash
npm run preview
```

---

## 🗄️ Database Schema & Migrations

The full PostgreSQL migration file is located at `supabase/migrations/20261014_init.sql`.

It establishes:
- `profiles`: Authenticated student attributes, graduation year, work mode preferences.
- `skills`: Normalized skill catalog.
- `profile_skills`: User skills with evidence status (`self_reported`, `project_supported`, `challenge_assessed`).
- `projects`: Public projects demonstrating concrete skills.
- `opportunities`: 30+ curated and demo listings across AI/ML, Software, Data Science, Security, Open Source (GSoC/LFX), and Research Labs.
- `skill_challenges`: Interactive deterministic challenges.
- `challenge_submissions`: Student submission records and scores.
- `skill_evidence`: Verified assessment records.
- `applications`: Opportunity tracker pipeline.
- `learning_milestones`: Ordered actionable roadmaps.
- **Row Level Security (RLS)**: Enforces strict data ownership so students cannot view or edit private data belonging to other users.

---

## 🎯 Hackathon Demo Mode

Judges can launch the platform instantly with zero configuration:
1. Navigate to the login page or click **"Discover My Opportunities"** from the landing page.
2. Select **"Enter Interactive Demo Mode"**.
3. Preloads the student profile: **Aarav Sharma** (2nd-Year BTech, NITK) with demonstrated projects and basic Python skills.
4. Head to **Proof of Skill**, execute the Python telemetry benchmark, and watch the match score for **Microsoft Research Fellow** surge from 68% to 88%+.
5. Open the **What-If Simulator**, add `PyTorch`, and observe 3 newly unlocked high-stipend fellowships.
6. Use the **"Reset Demo"** button in the top navigation bar at any time to return to baseline demo data.

---

## 🛡️ Security & Integrity Guarantees

- **No Hallucinated Eligibility**: Mandatory restrictions (course discipline, study year, location) are evaluated deterministically in TypeScript and PostgreSQL before scoring.
- **API Key Safety**: AI credentials remain in client-side memory or local configuration; keys are never bundled or logged.
- **Sandboxed Execution**: Challenge evaluators run safely on validated inputs and structured syntax without exposing privileged execution vectors.
