import React, { useState, useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  Position,
  NodeProps,
  Edge,
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
  User, 
  Code, 
  FolderGit2, 
  Briefcase, 
  Sparkles, 
  ExternalLink, 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { Profile, ProfileSkill, Project, Opportunity } from '../../types';
import { calculateOpportunityMatch } from '../../lib/matching';
import { Link } from 'react-router-dom';

// ==========================================
// Custom React Flow Node Components
// ==========================================

const StudentCustomNode: React.FC<NodeProps> = ({ data }) => {
  return (
    <div className="px-4 py-3 rounded-xl bg-gradient-to-br from-midnight-surface to-[#1a253d] border-2 border-cyan-400 shadow-[0_0_20px_rgba(103,232,249,0.3)] text-white min-w-[200px] text-center">
      <Handle type="source" position={Position.Bottom} className="!bg-cyan-400 !w-3 !h-3" />
      <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-400 mx-auto mb-2 flex items-center justify-center text-cyan-300">
        <User className="w-5 h-5" />
      </div>
      <div className="font-bold text-sm tracking-wide text-white">{data.label as string}</div>
      <div className="text-[11px] text-cyan-200/80 font-mono mt-0.5">{data.sublabel as string}</div>
      <div className="mt-2 inline-block px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
        Active Profile
      </div>
    </div>
  );
};

const SkillCustomNode: React.FC<NodeProps> = ({ data }) => {
  const isAssessed = data.evidence === 'challenge_assessed';
  const isProjectSupported = data.evidence === 'project_supported';

  return (
    <div className={`px-3 py-2 rounded-lg border transition-all text-xs min-w-[140px] ${
      data.isHighlighted
        ? 'bg-midnight-hover border-cyan-400 shadow-[0_0_15px_rgba(103,232,249,0.35)] scale-105'
        : isAssessed
        ? 'bg-midnight-surface/90 border-emerald-500/60 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
        : isProjectSupported
        ? 'bg-midnight-surface/90 border-purple-500/50 shadow-[0_0_10px_rgba(167,139,250,0.15)]'
        : 'bg-midnight-surface/80 border-slate-700'
    }`}>
      <Handle type="target" position={Position.Top} className="!bg-slate-400 !w-2 !h-2" />
      <Handle type="source" position={Position.Bottom} className="!bg-purple-400 !w-2 !h-2" />
      
      <div className="flex items-center gap-1.5 mb-1">
        <Code className="w-3.5 h-3.5 text-cyan-accent" />
        <span className="font-semibold text-slate-100">{data.label as string}</span>
      </div>
      <div className="flex items-center justify-between text-[10px] font-mono">
        <span className="text-slate-400 capitalize">{data.level as string}</span>
        {isAssessed ? (
          <span className="text-emerald-400 flex items-center gap-0.5">
            <CheckCircle2 className="w-2.5 h-2.5" /> Assessed
          </span>
        ) : isProjectSupported ? (
          <span className="text-purple-300">Project</span>
        ) : (
          <span className="text-amber-400/80">Self-reported</span>
        )}
      </div>
    </div>
  );
};

const ProjectCustomNode: React.FC<NodeProps> = ({ data }) => {
  return (
    <div className={`px-3 py-2 rounded-lg border transition-all text-xs min-w-[160px] ${
      data.isHighlighted
        ? 'bg-midnight-hover border-purple-400 shadow-[0_0_15px_rgba(167,139,250,0.35)] scale-105'
        : 'bg-midnight-surface/90 border-purple-500/40'
    }`}>
      <Handle type="target" position={Position.Top} className="!bg-purple-400 !w-2 !h-2" />
      <Handle type="source" position={Position.Bottom} className="!bg-cyan-400 !w-2 !h-2" />
      
      <div className="flex items-center gap-1.5 mb-1">
        <FolderGit2 className="w-3.5 h-3.5 text-purple-accent" />
        <span className="font-semibold text-slate-100 truncate max-w-[130px]">{data.label as string}</span>
      </div>
      <div className="text-[10px] text-slate-400 truncate font-mono">
        {(data.skills as string[])?.slice(0, 2).join(', ')}
      </div>
    </div>
  );
};

const OpportunityCustomNode: React.FC<NodeProps> = ({ data }) => {
  const score = data.score as number;
  const isEligible = data.isEligible as boolean;

  return (
    <div className={`px-3 py-2.5 rounded-lg border transition-all text-xs min-w-[170px] ${
      data.isHighlighted
        ? 'bg-midnight-hover border-amber-400 shadow-[0_0_15px_rgba(244,201,107,0.3)] scale-105'
        : 'bg-midnight-surface/90 border-midnight-border hover:border-slate-600'
    }`}>
      <Handle type="target" position={Position.Top} className="!bg-amber-400 !w-2 !h-2" />
      
      <div className="flex items-start justify-between gap-1 mb-1">
        <div className="flex items-center gap-1 text-slate-100 font-semibold truncate max-w-[110px]">
          <Briefcase className="w-3 h-3 text-amber-accent flex-shrink-0" />
          <span className="truncate">{data.label as string}</span>
        </div>
        <div className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
          score >= 70 ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-300'
        }`}>
          {score}%
        </div>
      </div>
      <div className="text-[10px] text-slate-400 truncate mb-1">
        {data.org as string}
      </div>
      <div className="flex items-center justify-between text-[9px] font-mono">
        <span className="text-slate-500 capitalize">{data.type as string}</span>
        <span className={isEligible ? 'text-emerald-400' : 'text-rose-400'}>
          {isEligible ? 'Eligible' : 'Prereq Missing'}
        </span>
      </div>
    </div>
  );
};

const nodeTypes = {
  studentNode: StudentCustomNode,
  skillNode: SkillCustomNode,
  projectNode: ProjectCustomNode,
  opportunityNode: OpportunityCustomNode,
};

// ==========================================
// Main Graph Component
// ==========================================

interface OpportunityGraphProps {
  profile: Profile;
  skills: ProfileSkill[];
  projects: Project[];
  opportunities: Opportunity[];
  interactive?: boolean;
  filterCategory?: 'all' | 'skills' | 'projects' | 'opportunities';
  height?: string;
  onSelectOpportunity?: (opp: Opportunity) => void;
}

export const OpportunityGraph: React.FC<OpportunityGraphProps> = ({
  profile,
  skills,
  projects,
  opportunities,
  interactive = true,
  filterCategory = 'all',
  height = '600px',
  onSelectOpportunity,
}) => {
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [activeCategory, setActiveCategory] = useState(filterCategory);
  const [searchQuery, setSearchQuery] = useState('');

  // Pre-calculate matching for all opportunities
  const oppMatches = useMemo(() => {
    const map = new Map<string, ReturnType<typeof calculateOpportunityMatch>>();
    opportunities.forEach(opp => {
      map.set(opp.id, calculateOpportunityMatch(opp, profile, skills));
    });
    return map;
  }, [opportunities, profile, skills]);

  // Construct Nodes & Edges
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // 1. Center Student Node
    const studentNodeId = 'node-student';
    nodes.push({
      id: studentNodeId,
      type: 'studentNode',
      position: { x: 450, y: 30 },
      data: {
        label: profile.display_name,
        sublabel: `${profile.course} (Year ${profile.year_of_study})`,
        profile,
      },
    });

    // 2. Skill Nodes (Level 1 horizontal row)
    const activeSkills = skills.slice(0, 8); // Display top 8 relevant skills for clarity
    const skillSpacing = 170;
    const startX = 450 - ((activeSkills.length - 1) * skillSpacing) / 2;

    activeSkills.forEach((skill, index) => {
      const skillNodeId = `skill-${skill.skill_id}`;
      const xPos = startX + index * skillSpacing;
      const yPos = 180 + (index % 2 === 0 ? 0 : 25);

      nodes.push({
        id: skillNodeId,
        type: 'skillNode',
        position: { x: xPos, y: yPos },
        data: {
          label: skill.skill_name,
          level: skill.self_reported_level,
          evidence: skill.evidence_status,
          category: skill.category,
          skillObj: skill,
        },
      });

      // Edge from Student -> Skill
      edges.push({
        id: `e-student-${skillNodeId}`,
        source: studentNodeId,
        target: skillNodeId,
        animated: skill.evidence_status === 'challenge_assessed',
        style: {
          stroke: skill.evidence_status === 'challenge_assessed' ? '#10B981' : '#64748B',
          strokeWidth: 1.5,
        },
      });
    });

    // 3. Project Nodes (Level 2)
    projects.forEach((proj, idx) => {
      const projNodeId = `proj-${proj.id}`;
      const px = 200 + idx * 300;
      const py = 320;

      nodes.push({
        id: projNodeId,
        type: 'projectNode',
        position: { x: px, y: py },
        data: {
          label: proj.title,
          skills: proj.skills_demonstrated,
          projectObj: proj,
        },
      });

      // Connect Skills -> Projects demonstrated
      proj.skills_demonstrated.forEach(sName => {
        const matchingSkill = skills.find(s => s.skill_name.toLowerCase() === sName.toLowerCase());
        if (matchingSkill) {
          edges.push({
            id: `e-skill-${matchingSkill.skill_id}-${projNodeId}`,
            source: `skill-${matchingSkill.skill_id}`,
            target: projNodeId,
            style: { stroke: '#A78BFA', strokeWidth: 1.2, strokeDasharray: '4 4' },
          });
        }
      });
    });

    // 4. Opportunities Nodes (Level 3)
    // Filter top 10 ranked opportunities for visual balance
    const rankedOpps = [...opportunities]
      .map(o => ({ opp: o, match: oppMatches.get(o.id)! }))
      .sort((a, b) => b.match.total_score - a.match.total_score)
      .slice(0, 8);

    const oppSpacing = 200;
    const oppStartX = 450 - ((rankedOpps.length - 1) * oppSpacing) / 2;

    rankedOpps.forEach((item, idx) => {
      const oppNodeId = `opp-${item.opp.id}`;
      const ox = oppStartX + idx * oppSpacing;
      const oy = 480 + (idx % 2 === 0 ? 0 : 35);

      nodes.push({
        id: oppNodeId,
        type: 'opportunityNode',
        position: { x: ox, y: oy },
        data: {
          label: item.opp.title,
          org: item.opp.organization,
          type: item.opp.opportunity_type,
          score: item.match.total_score,
          isEligible: item.match.eligibility === 'eligible',
          oppObj: item.opp,
          matchObj: item.match,
        },
      });

      // Connect Matched Skills -> Opportunity
      item.match.skills_matched.forEach(matchedSkillName => {
        const sk = skills.find(s => s.skill_name.toLowerCase() === matchedSkillName.toLowerCase());
        if (sk) {
          edges.push({
            id: `e-skill-${sk.skill_id}-${oppNodeId}`,
            source: `skill-${sk.skill_id}`,
            target: oppNodeId,
            markerEnd: { type: MarkerType.ArrowClosed, color: '#67E8F9' },
            style: { stroke: '#67E8F9', strokeWidth: 1.5 },
          });
        }
      });
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [profile, skills, projects, opportunities, oppMatches]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  // Filter and Search Nodes
  const filteredNodes = useMemo(() => {
    return nodes.map(node => {
      let isVisible = true;
      if (activeCategory === 'skills' && node.type !== 'skillNode' && node.type !== 'studentNode') isVisible = false;
      if (activeCategory === 'projects' && node.type !== 'projectNode' && node.type !== 'studentNode') isVisible = false;
      if (activeCategory === 'opportunities' && node.type !== 'opportunityNode' && node.type !== 'studentNode') isVisible = false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const lbl = (node.data.label as string || '').toLowerCase();
        if (!lbl.includes(q)) isVisible = false;
      }

      return {
        ...node,
        hidden: !isVisible,
      };
    });
  }, [nodes, activeCategory, searchQuery]);

  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNode(node);
    if (node.type === 'opportunityNode' && node.data.oppObj && onSelectOpportunity) {
      onSelectOpportunity(node.data.oppObj as Opportunity);
    }
  }, [onSelectOpportunity]);

  return (
    <div className="relative w-full rounded-2xl border border-midnight-border bg-midnight-bg overflow-hidden flex flex-col" style={{ height }}>
      
      {/* Top Floating Graph Toolbar */}
      {interactive && (
        <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
          <div className="flex items-center gap-1.5 bg-midnight-surface/90 backdrop-blur-md p-1.5 rounded-xl border border-midnight-border pointer-events-auto shadow-lg">
            <span className="text-[11px] font-mono text-slate-400 px-2 flex items-center gap-1">
              <Layers className="w-3 h-3 text-cyan-accent" /> Filter:
            </span>
            {(['all', 'skills', 'projects', 'opportunities'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                  activeCategory === cat
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            <input
              type="text"
              placeholder="Search graph nodes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-midnight-surface/90 border border-midnight-border text-xs px-3 py-1.5 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 backdrop-blur-md w-48"
            />
            <button
              onClick={() => { setActiveCategory('all'); setSearchQuery(''); setSelectedNode(null); }}
              className="bg-midnight-surface/90 border border-midnight-border hover:border-slate-600 text-xs text-slate-300 px-2.5 py-1.5 rounded-xl transition-all"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Main Flow Canvas */}
      <div className="flex-1 w-full h-full">
        <ReactFlow
          nodes={filteredNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          fitView
          attributionPosition="bottom-left"
          minZoom={0.3}
          maxZoom={1.5}
        >
          <Background color="#1E293B" gap={24} size={1} />
          {interactive && <Controls />}
          {interactive && (
            <MiniMap 
              nodeStrokeColor="#67E8F9" 
              nodeColor="#121A2B" 
              maskColor="rgba(8, 11, 20, 0.7)" 
              className="!bg-midnight-surface !border !border-midnight-border !rounded-lg" 
            />
          )}
        </ReactFlow>
      </div>

      {/* Graph Legend */}
      <div className="absolute bottom-3 left-4 z-10 flex items-center gap-4 bg-midnight-surface/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-midnight-border text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
          <span>Student</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span>Assessed Skill</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
          <span>Project</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span>Opportunity</span>
        </div>
      </div>

      {/* Right Drawer Inspector when Node is Selected */}
      {selectedNode && (
        <div className="absolute top-0 right-0 w-80 h-full bg-midnight-surface/95 backdrop-blur-xl border-l border-midnight-border z-30 p-5 overflow-y-auto flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-midnight-border mb-4">
              <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-accent flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                {selectedNode.type?.replace('Node', '')} Details
              </span>
              <button 
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="font-bold text-base text-white mb-1">
              {selectedNode.data.label}
            </h3>

            {/* If Student Node */}
            {selectedNode.type === 'studentNode' && (
              <div className="space-y-3 text-xs text-slate-300 mt-3">
                <p className="text-slate-400">{profile.bio}</p>
                <div className="bg-midnight-bg p-3 rounded-lg border border-midnight-border space-y-1 font-mono text-[11px]">
                  <div><span className="text-slate-400">Course:</span> {profile.course}</div>
                  <div><span className="text-slate-400">Year:</span> {profile.year_of_study}</div>
                  <div><span className="text-slate-400">Interests:</span> {profile.interests.join(', ')}</div>
                </div>
              </div>
            )}

            {/* If Skill Node */}
            {selectedNode.type === 'skillNode' && (
              <div className="space-y-3 text-xs text-slate-300 mt-3">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Category:</span>
                  <span className="capitalize font-mono">{selectedNode.data.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Evidence Status:</span>
                  <span className="font-mono text-cyan-300 capitalize">{selectedNode.data.evidence?.replace('_', ' ')}</span>
                </div>
                {selectedNode.data.evidence !== 'challenge_assessed' ? (
                  <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-800/40 text-cyan-200 text-xs">
                    <p className="font-semibold mb-1 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Skill not verified yet
                    </p>
                    <p className="text-[11px] text-cyan-300/80">Take a deterministic Proof-of-Skill challenge to elevate this skill to Assessed status.</p>
                    <Link
                      to="/proof-of-skill"
                      className="mt-2.5 inline-flex items-center gap-1 px-3 py-1 rounded bg-cyan-500 hover:bg-cyan-400 text-midnight-bg font-semibold text-xs transition-colors"
                    >
                      Take Challenge <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Verified via Proof-of-Skill test benchmark.</span>
                  </div>
                )}
              </div>
            )}

            {/* If Opportunity Node */}
            {selectedNode.type === 'opportunityNode' && (
              <div className="space-y-3 text-xs text-slate-300 mt-3">
                <div className="text-slate-400">{selectedNode.data.org}</div>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold font-mono text-cyan-accent">
                    {selectedNode.data.score}%
                  </div>
                  <span className="text-slate-400">Match score</span>
                </div>
                <div className="p-2.5 bg-midnight-bg rounded-lg border border-midnight-border text-[11px] leading-relaxed">
                  {selectedNode.data.matchObj?.executive_summary}
                </div>
                <Link
                  to={`/opportunities/${selectedNode.data.oppObj?.id}`}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-midnight-bg font-semibold text-xs transition-all shadow-md mt-2"
                >
                  View Deep Match Breakdown <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {/* If Project Node */}
            {selectedNode.type === 'projectNode' && (
              <div className="space-y-3 text-xs text-slate-300 mt-3">
                <p className="text-slate-400 leading-relaxed">
                  {selectedNode.data.projectObj?.description}
                </p>
                <div className="text-[11px] font-mono text-purple-300">
                  Demonstrates: {selectedNode.data.skills?.join(', ')}
                </div>
              </div>
            )}

          </div>

          <div className="pt-4 border-t border-midnight-border text-[11px] text-slate-400 font-mono text-center">
            OpportunityOS Graph Engine v2.0
          </div>
        </div>
      )}

    </div>
  );
};
