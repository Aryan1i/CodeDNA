"use client";

import { useEffect, useState, use } from "react";
import { API_BASE_URL } from "../../../config";
import Link from "next/link";

interface ProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

interface ProfileData {
  user: {
    name: string;
    email: string;
    role: string;
  };
  githubUsername?: string;
  leetcodeUsername?: string;
  vercelToken?: string;
  gitlabUsername?: string;
  codeforcesUsername?: string;
  kaggleUsername?: string;
  huggingfaceUsername?: string;
  netlifyToken?: string;
  renderToken?: string;
  gsocUsername?: string;
  gssocUsername?: string;
  overallScore: number;
  hardSkillsScore: number;
  softSkillsScore: number;
  builderSkillsScore: number;
  isVerified: boolean;
  skillsGraph?: any;
  githubStats?: {
    commitCount: number;
    prCount: number;
    prReviewsCount: number;
    totalCommits?: number;
    totalPRs?: number;
    totalIssues?: number;
    languages?: Record<string, string | number>;
  };
  leetcodeStats?: {
    totalSolved: number;
    easySolved: number;
    mediumSolved: number;
    hardSolved?: number;
    solvedCount?: number;
    rating?: number;
    contestRating?: number;
    consistencyStreak?: number;
  };
  vercelStats?: {
    deploymentCount: number;
    projectCount: number;
    deployCount?: number;
  };
  gitlabStats?: {
    commitCount: number;
    prCount: number;
    prReviewsCount: number;
    issuesCount: number;
  };
  codeforcesStats?: {
    solvedCount: number;
    rating: number;
    maxRating: number;
    rank: string;
    maxRank: string;
  };
  kaggleStats?: {
    competitionCount: number;
    notebookCount: number;
    datasetCount: number;
    tier: string;
    points: number;
  };
  huggingfaceStats?: {
    modelCount: number;
    spaceCount: number;
    datasetCount: number;
    likes: number;
  };
  netlifyStats?: {
    siteCount: number;
    deployCount: number;
  };
  renderStats?: {
    serviceCount: number;
    deployCount: number;
  };
  gsocStats?: {
    isParticipant: boolean;
    organizations: string[];
    years: number[];
    status: string;
  };
  gssocStats?: {
    isParticipant: boolean;
    rank: number;
    score: number;
    prCount?: number;
  };
  projects: Array<{
    id: string;
    name: string;
    description: string;
    isVerified: boolean;
    stars: number;
    repoUrl?: string;
  }>;
}

export default function ProfilePage({ params }: ProfilePageProps) {
  // Unwrap params using React.use() which is the modern Next.js 15 way to unwrap async params.
  const resolvedParams = use(params);
  const username = resolvedParams.username;
  
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hoveredNodeTooltip, setHoveredNodeTooltip] = useState<string | null>(null);

  const getSkillsNodes = () => {
    const nodes: any[] = [];
    const connections: any[] = [];

    // Center Node (Core Profile)
    nodes.push({
      id: "center",
      label: profile?.githubUsername || profile?.leetcodeUsername || profile?.gitlabUsername || "Developer",
      sublabel: `Score: ${profile?.overallScore || 0}`,
      cx: 200,
      cy: 150,
      r: 32,
      color: "#00E5A0",
      tooltip: `CodeDNA Developer Passport\nOverall Score: ${profile?.overallScore || 0}/100\nStatus: Vetted & Synced`
    });

    let graphLangs: Record<string, number> = {};
    let graphFrameworks: Record<string, string> = {};
    let graphLibraries: Record<string, string> = {};

    if (profile?.skillsGraph) {
      const sg = profile.skillsGraph as any;
      if (sg.languages && typeof sg.languages === "object") {
        graphLangs = sg.languages;
        graphFrameworks = sg.frameworks || {};
        graphLibraries = sg.libraries || {};
      } else {
        graphLangs = sg;
      }
    }

    // Languages sorting and top 3
    let sortedLangs = Object.entries(graphLangs)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    // If no languages synced, show fallbacks
    if (sortedLangs.length === 0) {
      const fallbacks = [
        { label: "GitHub Code", sublabel: "Not Synced", color: "rgba(255,255,255,0.2)", tooltip: "Connect your GitHub account to dynamically parse codebase dependencies." },
        { label: "DSA Practice", sublabel: "Not Synced", color: "rgba(255,255,255,0.2)", tooltip: "Sync LeetCode/Codeforces to map algorithm node details." },
        { label: "Cloud Shipments", sublabel: "Not Synced", color: "rgba(255,255,255,0.2)", tooltip: "Link Vercel/Netlify tokens to show active production endpoints." }
      ];

      fallbacks.forEach((feat, idx) => {
        const distance = 95;
        const angle = (2 * Math.PI / 3) * idx - Math.PI / 2;
        const x = 200 + distance * Math.cos(angle);
        const y = 150 + distance * Math.sin(angle);
        const nodeId = `fallback-${idx}`;
        nodes.push({
          id: nodeId,
          label: feat.label,
          sublabel: feat.sublabel,
          cx: x,
          cy: y,
          r: 24,
          color: feat.color,
          tooltip: feat.tooltip
        });
        connections.push({
          x1: 200,
          y1: 150,
          x2: x,
          y2: y,
          color: "rgba(255,255,255,0.1)"
        });
      });

      return { nodes, connections };
    }

    // Map each framework/library to its matching language parent
    const langFrameworksMap: Record<string, Array<{ name: string; version: string; type: "framework" | "library" }>> = {};
    sortedLangs.forEach(([lang]) => {
      langFrameworksMap[lang] = [];
    });

    const getLanguageForFramework = (name: string): string => {
      const tsLangs = ["next", "react", "express", "nest", "koa", "fastify", "nuxt", "gatsby", "vue", "svelte", "angular", "prisma", "mongoose", "sequelize", "typeorm", "tailwindcss", "lodash", "axios", "graphql", "jest", "playwright", "cypress", "three", "socket", "typescript", "javascript"];
      const pyLangs = ["django", "flask", "fastapi", "sqlalchemy", "peewee", "pandas", "numpy", "scikit-learn", "tensorflow", "pytorch", "transformers", "python"];
      const goLangs = ["gin", "echo", "fiber", "gorm", "go"];
      const rustLangs = ["actix", "rocket", "axum", "tokio", "serde", "rust"];
      
      const lower = name.toLowerCase();
      if (tsLangs.some(l => lower.includes(l))) return "TypeScript";
      if (pyLangs.some(l => lower.includes(l))) return "Python";
      if (goLangs.some(l => lower.includes(l))) return "Go";
      if (rustLangs.some(l => lower.includes(l))) return "Rust";
      
      return sortedLangs[0]?.[0] || "TypeScript";
    };

    Object.entries(graphFrameworks).forEach(([name, version]) => {
      const parent = getLanguageForFramework(name);
      if (langFrameworksMap[parent]) {
        langFrameworksMap[parent].push({ name, version, type: "framework" });
      }
    });

    Object.entries(graphLibraries).forEach(([name, version]) => {
      const parent = getLanguageForFramework(name);
      if (langFrameworksMap[parent]) {
        langFrameworksMap[parent].push({ name, version, type: "library" });
      }
    });

    const langColors = ["#0066FF", "#FFB800", "#FF4444"];

    sortedLangs.forEach(([lang, bytes], idx) => {
      const angle = (2 * Math.PI / sortedLangs.length) * idx - Math.PI / 2;
      const distL1 = 65;
      const xL1 = 200 + distL1 * Math.cos(angle);
      const yL1 = 150 + distL1 * Math.sin(angle);
      const langNodeId = `lang-${lang}`;
      const color = langColors[idx % langColors.length];

      // Add Language node
      nodes.push({
        id: langNodeId,
        label: lang,
        sublabel: `${(bytes / 1024).toFixed(0)} KB`,
        cx: xL1,
        cy: yL1,
        r: 20,
        color: color,
        tooltip: `Language: ${lang}\nParsed code: ${(bytes / 1024).toFixed(1)} KB`
      });

      connections.push({
        x1: 200,
        y1: 150,
        x2: xL1,
        y2: yL1,
        color: color
      });

      // Add child frameworks/libraries (limit 4)
      const children = langFrameworksMap[lang].slice(0, 4);
      const childCount = children.length;
      children.forEach((child, cIdx) => {
        const spreadAngle = 0.5;
        const childAngle = childCount > 1 
          ? angle - spreadAngle/2 + (spreadAngle / (childCount - 1)) * cIdx 
          : angle;
        const distL2 = 60;
        const xL2 = xL1 + distL2 * Math.cos(childAngle);
        const yL2 = yL1 + distL2 * Math.sin(childAngle);
        const childNodeId = `child-${child.name}`;
        const childColor = child.type === "framework" ? "#aa44ff" : "#00F0FF";

        nodes.push({
          id: childNodeId,
          label: child.name,
          sublabel: child.version || "active",
          cx: xL2,
          cy: yL2,
          r: 12,
          color: childColor,
          tooltip: `${child.type === "framework" ? "Framework" : "Library"}: ${child.name}\nVersion: ${child.version || "active"}\nLayer: Telemetry Verified`
        });

        connections.push({
          x1: xL1,
          y1: yL1,
          x2: xL2,
          y2: yL2,
          color: "rgba(255,255,255,0.15)"
        });
      });
    });

    return { nodes, connections };
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/developer/profile/${username}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Profile not found");
        }

        setProfile(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent text-white flex flex-col items-center justify-center font-sans">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-electric-green"></div>
        <p className="mt-4 text-xs text-muted">Retrieving developer passport...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-transparent text-white flex flex-col items-center justify-center font-sans p-6">
        <div className="glass rounded-xl p-8 max-w-sm border border-coral-red/20 text-center space-y-4">
          <span className="text-4xl text-coral-red block">⚠️</span>
          <h2 className="text-lg font-heading font-semibold text-white">Profile Fetch Failed</h2>
          <p className="text-xs text-muted">{error || "The requested profile could not be loaded."}</p>
          <Link href="/" className="inline-block px-4 py-2 bg-white/5 border border-white/10 text-xs font-semibold rounded hover:bg-white/10 transition-all">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-white font-sans flex flex-col p-8 relative overflow-hidden">
      {/* Background radial effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-electric-green/3 pointer-events-none blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-neon-purple/3 pointer-events-none blur-[100px]" />

      <main className="max-w-4xl w-full mx-auto space-y-8 z-10">
        {/* Back Link */}
        <div>
          <Link href="/" className="text-xs text-muted hover:text-white font-mono flex items-center gap-1 w-max">
            ← back to portal
          </Link>
        </div>

        {/* Passport Card (Header) */}
        <div className="glass rounded-2xl p-8 border border-white/5 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-electric-green via-cyber-blue to-neon-purple" />
          
          {/* Identity Info */}
          <div className="space-y-4 text-center md:text-left">
            <div>
              <span className="bg-electric-green/10 border border-electric-green/20 text-electric-green text-[10px] uppercase font-mono font-semibold px-2 py-0.5 rounded tracking-wider">
                VETTED PASSPORT ACTIVE
              </span>
              <h1 className="text-3xl font-heading font-extrabold text-white mt-3">
                {profile.user.name}
              </h1>
              <p className="text-xs text-muted font-mono mt-1">{profile.user.email}</p>
            </div>

            <div className="flex flex-wrap gap-4 text-xs font-mono justify-center md:justify-start">
              {profile.githubUsername && (
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                  github: <span className="text-white">@{profile.githubUsername}</span>
                </span>
              )}
              {profile.gitlabUsername && (
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500/50" />
                  gitlab: <span className="text-white">@{profile.gitlabUsername}</span>
                </span>
              )}
              {profile.leetcodeUsername && (
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                  leetcode: <span className="text-white">@{profile.leetcodeUsername}</span>
                </span>
              )}
              {profile.codeforcesUsername && (
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
                  codeforces: <span className="text-white">@{profile.codeforcesUsername}</span>
                </span>
              )}
            </div>
            
            {profile.isVerified && (
              <span className="inline-flex bg-electric-green/10 border border-electric-green/20 text-electric-green text-xs px-3 py-1 rounded-full items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-electric-green animate-pulse" />
                Proof of Construction Verified
              </span>
            )}
          </div>

          {/* Large Overall Score Bubble */}
          <div className="text-center bg-surface p-6 rounded-2xl border border-white/5 relative min-w-[160px] flex flex-col items-center">
            <h3 className="text-[10px] text-muted uppercase tracking-wider font-mono mb-2">Overall CodeDNA</h3>
            <span className="text-6xl font-heading font-extrabold text-gradient-green">
              {profile.overallScore || 0}
            </span>
            <span className="text-[10px] text-muted font-mono mt-1">PERCENTILE SCORE</span>
          </div>
        </div>

        {/* Telemetry-Driven Dynamic Skill Graph */}
        <div className="glass rounded-xl p-6 border border-white/5 space-y-4 mb-8">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <div>
              <h3 className="text-sm font-heading font-semibold text-white">Telemetry-Driven Dynamic Skill Graph</h3>
              <p className="text-[10px] text-muted mt-0.5 font-mono">Dynamic node dependency mapping extracted from this developer&apos;s active workspace channels.</p>
            </div>
            <span className="bg-electric-green/10 text-electric-green text-[9px] font-mono px-2 py-0.5 rounded border border-electric-green/20">SKILL GRAPH</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* SVG Canvas (8 cols) */}
            <div className="md:col-span-8 bg-black/40 rounded-xl border border-white/3 relative overflow-hidden flex items-center justify-center p-2">
              <svg className="w-full h-[280px]" viewBox="0 0 400 300">
                {/* Connection Lines */}
                {getSkillsNodes().connections.map((conn, idx) => (
                  <line
                    key={idx}
                    x1={conn.x1}
                    y1={conn.y1}
                    x2={conn.x2}
                    y2={conn.y2}
                    stroke={conn.color}
                    strokeWidth="1.5"
                    strokeOpacity="0.4"
                    className="animate-pulse"
                  />
                ))}
                
                {/* Nodes */}
                {getSkillsNodes().nodes.map((node) => (
                  <g 
                    key={node.id}
                    className="cursor-pointer group"
                    onMouseEnter={() => setHoveredNodeTooltip(node.tooltip)}
                    onMouseLeave={() => setHoveredNodeTooltip(null)}
                  >
                    <circle
                      cx={node.cx}
                      cy={node.cy}
                      r={node.r}
                      fill={`${node.color}15`}
                      stroke={node.color}
                      strokeWidth="1.5"
                      className="transition-all duration-300 group-hover:scale-110 group-hover:stroke-white"
                      style={{ transformOrigin: `${node.cx}px ${node.cy}px` }}
                    />
                    <text
                      x={node.cx}
                      y={node.cy - 2}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="9"
                      fontWeight="bold"
                      className="pointer-events-none select-none font-sans"
                    >
                      {node.label}
                    </text>
                    <text
                      x={node.cx}
                      y={node.cy + 10}
                      textAnchor="middle"
                      fill={`${node.color}`}
                      fontSize="7"
                      fontWeight="semibold"
                      className="pointer-events-none select-none font-mono"
                    >
                      {node.sublabel}
                    </text>
                  </g>
                ))}
              </svg>
            </div>

            {/* Node Inspect Details / Tooltip Panel (4 cols) */}
            <div className="md:col-span-4 h-full flex flex-col justify-center space-y-4">
              <div className="p-4 rounded-lg bg-surface border border-white/5 h-[160px] flex flex-col justify-between text-left">
                <div>
                  <span className="text-[8px] font-mono text-muted uppercase block mb-1">Node Inspector</span>
                  {hoveredNodeTooltip ? (
                    <p className="text-[10px] font-mono text-electric-green whitespace-pre-line leading-relaxed">
                      {hoveredNodeTooltip}
                    </p>
                  ) : (
                    <p className="text-[10px] text-muted italic leading-relaxed">
                      Hover over any skill node in the graph network to inspect vetted repository counts, parsed coding volumes, and language depths.
                    </p>
                  )}
                </div>
                <div className="text-[8px] text-muted font-mono pt-2 border-t border-white/5 leading-none">
                  Status: Dynamic tracking active
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scoring breakdowns and technology graph */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Subscores Grid */}
          <div className="glass rounded-xl p-6 border border-white/5 space-y-4 md:col-span-1">
            <h3 className="text-xs text-muted uppercase tracking-wider font-mono border-b border-white/5 pb-2">Skills Profiles</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted">Hard Skills (30%)</span>
                  <span className="font-semibold text-white">{profile.hardSkillsScore || 0}/100</span>
                </div>
                <div className="h-1.5 w-full bg-white/3 rounded-full overflow-hidden">
                  <div className="bg-neon-purple h-full" style={{ width: `${profile.hardSkillsScore || 0}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted">Soft Skills (40%)</span>
                  <span className="font-semibold text-white">{profile.softSkillsScore || 0}/100</span>
                </div>
                <div className="h-1.5 w-full bg-white/3 rounded-full overflow-hidden">
                  <div className="bg-cyber-blue h-full" style={{ width: `${profile.softSkillsScore || 0}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted">Builder Skills (30%)</span>
                  <span className="font-semibold text-white">{profile.builderSkillsScore || 0}/100</span>
                </div>
                <div className="h-1.5 w-full bg-white/3 rounded-full overflow-hidden">
                  <div className="bg-electric-green h-full" style={{ width: `${profile.builderSkillsScore || 0}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Scraped Statistics Breakdown */}
          <div className="glass rounded-xl p-6 border border-white/5 space-y-6 md:col-span-2">
            <h3 className="text-xs text-muted uppercase tracking-wider font-mono border-b border-white/5 pb-2">Verified Vetting Records</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Code Repositories */}
              <div className="p-4 rounded-lg bg-surface border border-white/5 space-y-3">
                <span className="text-[10px] text-muted font-mono uppercase block border-b border-white/5 pb-1">Codebases</span>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-[10px] text-electric-green font-mono uppercase">GitHub</h4>
                    <div className="text-2xl font-heading font-extrabold text-white">{profile.githubStats?.commitCount || 0}</div>
                    <span className="text-[9px] text-muted font-mono block">commits | {profile.githubStats?.prCount || 0} PRs</span>
                  </div>
                  {profile.gitlabUsername && (
                    <div>
                      <h4 className="text-[10px] text-orange-400 font-mono uppercase">GitLab</h4>
                      <div className="text-2xl font-heading font-extrabold text-white">{profile.gitlabStats?.commitCount || 0}</div>
                      <span className="text-[9px] text-muted font-mono block">commits | {profile.gitlabStats?.prCount || 0} PRs</span>
                    </div>
                  )}
                </div>
              </div>

              {/* DSA & Contests */}
              <div className="p-4 rounded-lg bg-surface border border-white/5 space-y-3">
                <span className="text-[10px] text-muted font-mono uppercase block border-b border-white/5 pb-1">DSA & Contests</span>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-[10px] text-yellow-500 font-mono uppercase">LeetCode</h4>
                    <div className="text-2xl font-heading font-extrabold text-white">{profile.leetcodeStats?.totalSolved || 0}</div>
                    <span className="text-[9px] text-muted font-mono block">solved | Rating: {profile.leetcodeStats?.contestRating?.toFixed(0) || "N/A"}</span>
                  </div>
                  {profile.codeforcesUsername && (
                    <div>
                      <h4 className="text-[10px] text-red-400 font-mono uppercase">Codeforces</h4>
                      <div className="text-2xl font-heading font-extrabold text-white">{profile.codeforcesStats?.solvedCount || 0}</div>
                      <span className="text-[9px] text-muted font-mono block">solved | Rating: {profile.codeforcesStats?.rating || 0}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Cloud Deployments */}
              <div className="p-4 rounded-lg bg-surface border border-white/5 space-y-3">
                <span className="text-[10px] text-muted font-mono uppercase block border-b border-white/5 pb-1">Cloud Shipments</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <h4 className="text-[9px] text-white font-mono uppercase">Vercel</h4>
                    <div className="text-xl font-heading font-extrabold text-white">{profile.vercelStats?.deploymentCount || 0}</div>
                    <span className="text-[8px] text-muted font-mono block">deploys</span>
                  </div>
                  {profile.netlifyToken && (
                    <div>
                      <h4 className="text-[9px] text-cyan-400 font-mono uppercase">Netlify</h4>
                      <div className="text-xl font-heading font-extrabold text-white">{profile.netlifyStats?.deployCount || 0}</div>
                      <span className="text-[8px] text-muted font-mono block">deploys</span>
                    </div>
                  )}
                  {profile.renderToken && (
                    <div>
                      <h4 className="text-[9px] text-purple-400 font-mono uppercase">Render</h4>
                      <div className="text-xl font-heading font-extrabold text-white">{profile.renderStats?.deployCount || 0}</div>
                      <span className="text-[8px] text-muted font-mono block">deploys</span>
                    </div>
                  )}
                </div>
              </div>

              {/* AI & Data Science */}
              {(profile.kaggleUsername || profile.huggingfaceUsername) && (
                <div className="p-4 rounded-lg bg-surface border border-white/5 space-y-3">
                  <span className="text-[10px] text-muted font-mono uppercase block border-b border-white/5 pb-1">AI & Data Science</span>
                  <div className="grid grid-cols-2 gap-4">
                    {profile.kaggleUsername && (
                      <div>
                        <h4 className="text-[10px] text-blue-400 font-mono uppercase">Kaggle</h4>
                        <div className="text-base font-heading font-extrabold text-white">{profile.kaggleStats?.tier || "Novice"}</div>
                        <span className="text-[8px] text-muted font-mono block">Points: {profile.kaggleStats?.points || 0}</span>
                      </div>
                    )}
                    {profile.huggingfaceUsername && (
                      <div>
                        <h4 className="text-[10px] text-yellow-400 font-mono uppercase">Hugging Face</h4>
                        <div className="text-base font-heading font-extrabold text-white">{profile.huggingfaceStats?.modelCount || 0} models</div>
                        <span className="text-[8px] text-muted font-mono block">Spaces: {profile.huggingfaceStats?.spaceCount || 0}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Open Source Programs */}
            {(profile.gsocUsername || profile.gssocUsername) && (
              <div className="p-4 rounded-lg bg-surface border border-white/5 space-y-2">
                <span className="text-[10px] text-muted font-mono uppercase block border-b border-white/5 pb-1">Verified Open-Source Programs</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {profile.gsocUsername && profile.gsocStats?.isParticipant && (
                    <div className="flex justify-between items-center bg-black/30 p-2 rounded border border-white/5">
                      <div>
                        <span className="text-[9px] text-electric-green font-mono uppercase block">Google Summer of Code</span>
                        <span className="text-xs text-white font-semibold">{profile.gsocStats?.organizations?.join(", ")}</span>
                      </div>
                      <span className="bg-electric-green/10 text-electric-green text-[9px] px-2 py-0.5 rounded font-mono font-semibold">
                        {profile.gsocStats?.years?.join(", ")}
                      </span>
                    </div>
                  )}
                  {profile.gssocUsername && profile.gssocStats?.isParticipant && (
                    <div className="flex justify-between items-center bg-black/30 p-2 rounded border border-white/5">
                      <div>
                        <span className="text-[9px] text-orange-400 font-mono uppercase block">Girlscript Summer of Code</span>
                        <span className="text-xs text-white font-semibold">Score: {profile.gssocStats?.score} | PRs: {profile.gssocStats?.prCount || 0}</span>
                      </div>
                      <span className="bg-orange-400/10 text-orange-400 text-[9px] px-2 py-0.5 rounded font-mono font-semibold">
                        Rank: #{profile.gssocStats?.rank}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Repositories listing */}
        <div className="glass rounded-xl p-8 border border-white/5">
          <h3 className="text-sm font-heading font-semibold text-white border-b border-white/5 pb-4 mb-4">
            Vetted Projects Portfolio
          </h3>

          {!profile.projects || profile.projects.length === 0 ? (
            <div className="text-center py-6 text-xs text-muted">
              No repositories synced for this developer yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profile.projects.map((project) => (
                <div key={project.id} className="p-4 rounded-lg bg-surface border border-white/3 flex flex-col justify-between h-36">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-semibold text-white font-mono truncate max-w-[200px]">{project.name}</h4>
                      {project.isVerified ? (
                        <span className="bg-electric-green/10 text-electric-green text-[9px] px-1.5 py-0.5 rounded font-mono border border-electric-green/10">
                          VERIFIED BUILD
                        </span>
                      ) : (
                        <span className="bg-white/3 text-muted text-[9px] px-1.5 py-0.5 rounded font-mono">
                          UNVERIFIED
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted mt-2 line-clamp-2 leading-relaxed">
                      {project.description || "No description provided."}
                    </p>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-muted font-mono border-t border-white/3 pt-2 mt-2">
                    <span className="flex items-center gap-1">⭐ {project.stars}</span>
                    {project.repoUrl && (
                      <a href={project.repoUrl} className="text-cyber-blue hover:underline" target="_blank">
                        View Repository
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
