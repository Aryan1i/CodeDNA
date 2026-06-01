"use client";

import { useEffect, useState, useCallback } from "react";
import { API_BASE_URL } from "../../config";

interface UserSession {
  id: string;
  email: string;
  role: string;
  name?: string;
}

interface GithubStats {
  commitCount: number;
  prCount: number;
  prReviewsCount: number;
  languages?: Record<string, string | number>;
}

interface LeetcodeStats {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  activityStreak?: number;
  contestRating?: number;
}

interface VercelStats {
  deploymentCount: number;
  projectCount: number;
}

interface ProjectData {
  id: string;
  name: string;
  description?: string;
  isVerified: boolean;
  verificationConfidence: number;
}

interface DeveloperProfile {
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
  githubStats?: GithubStats;
  leetcodeStats?: LeetcodeStats;
  vercelStats?: VercelStats;
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
  projects?: ProjectData[];
}

interface CompanyTest {
  id: string;
  companyName: string;
  testTitle: string;
  description: string;
  badgeName: string;
  stipendRange: string;
}

interface VerificationQuestion {
  id: string;
  question: string;
  codeSnippet?: string;
  lineReference?: number;
}

export default function Dashboard() {
  const [user] = useState<UserSession | null>(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        try {
          return JSON.parse(savedUser) as UserSession;
        } catch {
          return null;
        }
      }
    }
    return null;
  });
  const [profile, setProfile] = useState<DeveloperProfile | null>(null);
  
  // Inputs
  const [githubUsername, setGithubUsername] = useState("");
  const [leetcodeUsername, setLeetcodeUsername] = useState("");
  const [vercelToken, setVercelToken] = useState("");
  const [gitlabUsername, setGitlabUsername] = useState("");
  const [codeforcesUsername, setCodeforcesUsername] = useState("");
  const [kaggleUsername, setKaggleUsername] = useState("");
  const [huggingfaceUsername, setHuggingfaceUsername] = useState("");
  const [netlifyToken, setNetlifyToken] = useState("");
  const [renderToken, setRenderToken] = useState("");
  const [gsocUsername, setGsocUsername] = useState("");
  const [gssocUsername, setGssocUsername] = useState("");
  
  // States
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncMessage, setSyncMessage] = useState("");
  const [error, setError] = useState("");

  // Verification modal states
  const [activeProject, setActiveProject] = useState<ProjectData | null>(null);
  const [questions, setQuestions] = useState<VerificationQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [gradingResults, setGradingResults] = useState<Record<string, boolean>>({});
  const [submittingVerification, setSubmittingVerification] = useState<Record<string, boolean>>({});
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Remaining Strategic Blueprint States
  const [jobDescription, setJobDescription] = useState("");
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState("");
  const [generatingCoverLetter, setGeneratingCoverLetter] = useState(false);
  const [activeAssetTab, setActiveAssetTab] = useState<"latex" | "cover" | "linkedin">("latex");
  const [vscodeSyncing, setVscodeSyncing] = useState(false);
  const [vscodeEdits, setVscodeEdits] = useState(120);
  const [vscodeMinutes, setVscodeMinutes] = useState(90);
  const [simulationActive, setSimulationActive] = useState(false);
  const [simulationCode, setSimulationCode] = useState("");
  const [simulationResult, setSimulationResult] = useState("");
  const [submittingSimulation, setSubmittingSimulation] = useState(false);

  // Company Vetting Challenge States
  const [companyTests, setCompanyTests] = useState<CompanyTest[]>([]);
  const [activeChallenge, setActiveChallenge] = useState<CompanyTest | null>(null);
  const [challengeCode, setChallengeCode] = useState("");
  const [challengeConsole, setChallengeConsole] = useState<string[]>([]);
  const [verifyingChallenge, setVerifyingChallenge] = useState(false);
  const [challengeSuccess, setChallengeSuccess] = useState("");
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

  const fetchCompanyTests = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/recruiter/tests`);
      if (res.ok) {
        const data = await res.json();
        setCompanyTests(data);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const startChallenge = (test: CompanyTest) => {
    setActiveChallenge(test);
    setChallengeConsole([]);
    setChallengeSuccess("");
    
    // Deployed boilerplates corresponding to company
    if (test.companyName.toLowerCase().includes("razorpay")) {
      setChallengeCode(`// Razorpay Backend API Optimization Challenge\n// Task: Optimize connection pooling with requests queue under spikes\n\nclass ConnectionPool {\n  constructor(size) {\n    this.size = size;\n    this.connections = Array(size).fill(null).map((_, i) => ({ id: i, active: false }));\n    this.queue = [];\n  }\n\n  async getConnection() {\n    // TODO: Acquire connection immediately or queue until one releases\n    return new Promise((resolve) => {\n      const conn = this.connections.find(c => !c.active);\n      if (conn) {\n        conn.active = true;\n        resolve(conn);\n      } else {\n        this.queue.push(resolve);\n      }\n    });\n  }\n\n  releaseConnection(conn) {\n    conn.active = false;\n    if (this.queue.length > 0) {\n      const nextResolve = this.queue.shift();\n      conn.active = true;\n      nextResolve(conn);\n    }\n  }\n}`);
    } else if (test.companyName.toLowerCase().includes("cred")) {
      setChallengeCode(`// Cred State and Memory Leak Diagnostic\n// Task: Eliminate memory leak from react sub-component cache\n\nimport { useRef, useEffect } from 'react';\n\nexport function useFinancialCache() {\n  const cache = useRef(new Map());\n\n  // FIX ME: Cache grows indefinitely. Implement eviction or expiration.\n  const set = (key, val) => {\n    if (cache.current.size >= 100) {\n      // Evict oldest or first item to limit size\n      const firstKey = cache.current.keys().next().value;\n      cache.current.delete(firstKey);\n    }\n    cache.current.set(key, val);\n  };\n\n  return { set, get: (k) => cache.current.get(k) };\n}`);
    } else {
      setChallengeCode(`// CodeDNA Custom Vetting Challenge: ${test.testTitle}\n// Task: Write optimized solution for ${test.description}\n\nfunction solution() {\n  // TODO: Implement solution\n  return true;\n}`);
    }
  };

  const runVettingChallenge = async () => {
    if (!activeChallenge || !user) return;
    setVerifyingChallenge(true);
    setChallengeConsole([
      "Initializing CodeDNA Secure Sandbox Environment...",
      "Analyzing AST structures..."
    ]);

    setTimeout(() => {
      setChallengeConsole(prev => [...prev, "Running unit verification suite..."]);
    }, 600);

    setTimeout(() => {
      setChallengeConsole(prev => [...prev, "Checking request latency benchmarks (Concurrency test: 10k requests/s)..."]);
    }, 1200);

    setTimeout(() => {
      setChallengeConsole(prev => [...prev, "Measuring memory allocations & heap profiles..."]);
    }, 1800);

    setTimeout(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/recruiter/tests/${activeChallenge.id}/unlock`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id })
        });
        const data = await response.json();
        if (response.ok) {
          setChallengeConsole(prev => [
            ...prev,
            "Metrics compilation: SUCCESS!",
            `Unlocking badge: ${activeChallenge.badgeName}`,
            `Overall Passport Score boosted to ${data.score}! (+5 Builder Skills score)`
          ]);
          setChallengeSuccess(`Successfully completed vetting! "${activeChallenge.badgeName}" Badge unlocked.`);
          // Update profile in state
          setProfile(prev => prev ? {
            ...prev,
            overallScore: data.score,
            builderSkillsScore: data.builderScore
          } : null);
          fetchCompanyTests();
        } else {
          setChallengeConsole(prev => [...prev, `Verification Failed: ${data.error}`]);
        }
      } catch (err) {
        setChallengeConsole(prev => [...prev, "Server connection failed during vetting verification."]);
      } finally {
        setVerifyingChallenge(false);
      }
    }, 2400);
  };

  // VS Code activity sync integration
  const syncVscodeActivity = async () => {
    if (!user || !profile) return;
    setVscodeSyncing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/vscode/activity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          trackedEdits: vscodeEdits,
          activeMinutes: vscodeMinutes
        })
      });
      const data = await response.json();
      if (response.ok) {
        setProfile(prev => prev ? {
          ...prev,
          overallScore: data.score,
          hardSkillsScore: data.hardScore,
          builderSkillsScore: data.builderScore
        } : null);
        alert("VS Code workspace activity synced successfully! Your scoring levels have been boosted.");
      }
    } catch (e) {
      console.error("VS Code activity sync failed:", e);
    } finally {
      setVscodeSyncing(false);
    }
  };

  // Timed Simulation Challenges sandbox
  const startSimulation = () => {
    setSimulationActive(true);
    setSimulationResult("");
    setSimulationCode(`export default function RandomCard() {\n  // FIX ME: This random number shifts dynamically on hydration\n  const num = Math.random();\n  return <div>Your lucky number: {num}</div>;\n}`);
  };

  const submitSimulation = async () => {
    if (!user) return;
    setSubmittingSimulation(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/simulation/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          challengeId: "challenge-101",
          solution: simulationCode
        })
      });
      const data = await response.json();
      if (response.ok) {
        setSimulationResult(data.feedback);
        if (data.isCorrect) {
          setProfile(prev => prev ? {
            ...prev,
            overallScore: data.score,
            builderSkillsScore: data.builderScore
          } : null);
        }
      }
    } catch (e) {
      console.error("Simulation challenge submit failed:", e);
    } finally {
      setSubmittingSimulation(false);
    }
  };

  // AI tailored Cover Letter generator
  const triggerCoverLetter = async () => {
    if (!user) return;
    setGeneratingCoverLetter(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/developer/assets/cover-letter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          jobDescription
        })
      });
      const data = await response.json();
      if (response.ok) {
        setGeneratedCoverLetter(data.coverLetter);
      }
    } catch (e) {
      console.error("Cover letter generation failed:", e);
    } finally {
      setGeneratingCoverLetter(false);
    }
  };

  const fetchProfile = useCallback(async (currentUser: UserSession) => {
    Promise.resolve().then(() => {
      setLoading(true);
    });
    try {
      // Find developer profile
      const response = await fetch(`${API_BASE_URL}/api/developer/profiles`);
      if (response.ok) {
        const profiles: (DeveloperProfile & { userId: string })[] = await response.json();
        const myProfile = profiles.find((p) => p.userId === currentUser.id);
        if (myProfile) {
          setProfile(myProfile);
          setGithubUsername(myProfile.githubUsername || "");
          setLeetcodeUsername(myProfile.leetcodeUsername || "");
          setVercelToken(myProfile.vercelToken || "");
          setGitlabUsername(myProfile.gitlabUsername || "");
          setCodeforcesUsername(myProfile.codeforcesUsername || "");
          setKaggleUsername(myProfile.kaggleUsername || "");
          setHuggingfaceUsername(myProfile.huggingfaceUsername || "");
          setNetlifyToken(myProfile.netlifyToken || "");
          setRenderToken(myProfile.renderToken || "");
          setGsocUsername(myProfile.gsocUsername || "");
          setGssocUsername(myProfile.gssocUsername || "");
          
          // Re-fetch detailed single profile
          const userIdentifier = myProfile.githubUsername || myProfile.leetcodeUsername || myProfile.gitlabUsername || myProfile.codeforcesUsername;
          if (userIdentifier) {
            const detailRes = await fetch(`${API_BASE_URL}/api/developer/profile/${userIdentifier}`);
            if (detailRes.ok) {
              const detailedProfile: DeveloperProfile = await detailRes.json();
              setProfile(detailedProfile);
              setGithubUsername(detailedProfile.githubUsername || "");
              setLeetcodeUsername(detailedProfile.leetcodeUsername || "");
              setVercelToken(detailedProfile.vercelToken || "");
              setGitlabUsername(detailedProfile.gitlabUsername || "");
              setCodeforcesUsername(detailedProfile.codeforcesUsername || "");
              setKaggleUsername(detailedProfile.kaggleUsername || "");
              setHuggingfaceUsername(detailedProfile.huggingfaceUsername || "");
              setNetlifyToken(detailedProfile.netlifyToken || "");
              setRenderToken(detailedProfile.renderToken || "");
              setGsocUsername(detailedProfile.gsocUsername || "");
              setGssocUsername(detailedProfile.gssocUsername || "");
            }
          }
        }
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      window.location.href = "/";
      return;
    }
    
    if (user.role === "RECRUITER") {
      window.location.href = "/recruiter";
      return;
    }

    const timer = setTimeout(() => {
      fetchProfile(user);
      fetchCompanyTests();
    }, 0);
    
    return () => clearTimeout(timer);
  }, [user, fetchProfile, fetchCompanyTests]);

  const handleSync = async () => {
    if (!user) return;
    setSyncing(true);
    setSyncMessage("Connecting to GitHub, GitLab, LeetCode, Codeforces, Kaggle, Hugging Face, Vercel, Netlify, Render, GSoC, and GSSoC feeds...");
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/developer/profile/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          githubUsername,
          leetcodeUsername,
          vercelToken,
          gitlabUsername,
          codeforcesUsername,
          kaggleUsername,
          huggingfaceUsername,
          netlifyToken,
          renderToken,
          gsocUsername,
          gssocUsername
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Sync failed");
      }

      setProfile(data.profile);
      setSyncMessage("Synchronization and score calculation complete!");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred during sync");
      }
      setSyncMessage("");
    } finally {
      setSyncing(false);
    }
  };

  // Trigger project verification questions
  const startVerification = async (project: ProjectData) => {
    setActiveProject(project);
    setLoadingQuestions(true);
    setQuestions([]);
    setAnswers({});
    setGradingResults({});
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/developer/projects/${project.id}/verify`, {
        method: "POST"
      });
      const data = await response.json();
      if (response.ok) {
        setQuestions(data.questions);
      } else {
        setError(data.error || "Could not fetch questions");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Submit answer for a single verification question
  const submitAnswer = async (questionId: string) => {
    const answer = answers[questionId];
    if (!answer) return;

    setSubmittingVerification(prev => ({ ...prev, [questionId]: true }));
    try {
      const response = await fetch(`${API_BASE_URL}/api/developer/projects/questions/${questionId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer })
      });
      const data = await response.json();
      if (response.ok) {
        setGradingResults(prev => ({ ...prev, [questionId]: data.isCorrect }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingVerification(prev => ({ ...prev, [questionId]: false }));
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-transparent text-white flex flex-col items-center justify-center font-sans">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-electric-green"></div>
        <p className="mt-4 text-xs text-muted">Retrieving developer credentials...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-white font-sans flex flex-col">
      {/* Navbar */}
      <nav className="border-b border-white/5 bg-surface/50 backdrop-blur px-8 py-4 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <span className="text-xl font-heading font-extrabold text-white">
            Code<span className="text-electric-green">DNA</span>
          </span>
          <span className="bg-electric-green/10 text-electric-green px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider font-semibold">
            Passport Console
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-xs text-muted font-mono">{user.email}</span>
          <button onClick={logout} className="text-xs text-coral-red hover:underline focus:outline-none cursor-pointer">
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Sync Setup & Overall Score */}
        <div className="space-y-6 md:col-span-1">
          {/* Overall Score Circle Card */}
          <div className="glass rounded-xl p-6 border border-white/5 text-center flex flex-col items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-electric-green/5 blur-2xl" />
            <h3 className="text-xs text-muted uppercase tracking-wider font-mono mb-4">CodeDNA Score</h3>
            
            {/* Radial score display */}
            <div className="relative w-40 h-40 flex items-center justify-center mb-4">
              <svg className="absolute w-full h-full transform -rotate-90">
                <circle cx="80" cy="80" r="70" stroke="rgba(255,255,255,0.03)" strokeWidth="10" fill="transparent" />
                <circle cx="80" cy="80" r="70" stroke="#00E5A0" strokeWidth="10" fill="transparent" 
                        strokeDasharray={440} 
                        strokeDashoffset={440 - (440 * (profile?.overallScore || 0)) / 100}
                        strokeLinecap="round" 
                        className="transition-all duration-1000 ease-out" />
              </svg>
              <div className="text-center z-10">
                <span className="text-5xl font-heading font-extrabold text-white">
                  {profile?.overallScore || 0}
                </span>
                <span className="text-xs text-muted block mt-1">/ 100</span>
              </div>
            </div>
            
            {profile?.isVerified ? (
              <span className="bg-electric-green/10 border border-electric-green/30 text-electric-green text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-electric-green animate-pulse" />
                Verified Builder
              </span>
            ) : (
              <span className="bg-white/5 border border-white/10 text-muted text-xs font-semibold px-3 py-1 rounded-full">
                Unverified Profile
              </span>
            )}

            {/* Subscores breakdown */}
            <div className="w-full mt-6 space-y-3 pt-6 border-t border-white/5">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted">Hard Skills (30%)</span>
                  <span className="font-semibold text-white">{profile?.hardSkillsScore || 0}/100</span>
                </div>
                <div className="h-1.5 w-full bg-white/3 rounded-full overflow-hidden">
                  <div className="bg-neon-purple h-full" style={{ width: `${profile?.hardSkillsScore || 0}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted">Soft Skills (40%)</span>
                  <span className="font-semibold text-white">{profile?.softSkillsScore || 0}/100</span>
                </div>
                <div className="h-1.5 w-full bg-white/3 rounded-full overflow-hidden">
                  <div className="bg-cyber-blue h-full" style={{ width: `${profile?.softSkillsScore || 0}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted">Builder Skills (30%)</span>
                  <span className="font-semibold text-white">{profile?.builderSkillsScore || 0}/100</span>
                </div>
                <div className="h-1.5 w-full bg-white/3 rounded-full overflow-hidden">
                  <div className="bg-electric-green h-full" style={{ width: `${profile?.builderSkillsScore || 0}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Sync Accounts Form */}
          <div className="glass rounded-xl p-6 border border-white/5 space-y-4">
            <h3 className="text-sm font-heading font-semibold text-white border-b border-white/5 pb-2">Sync Data Integrations</h3>
            
            {error && <div className="p-3 bg-coral-red/10 border border-coral-red/20 text-coral-red text-xs rounded">{error}</div>}
            {syncMessage && <div className="p-3 bg-electric-green/10 border border-electric-green/20 text-electric-green text-xs rounded font-mono">{syncMessage}</div>}

            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
              {/* Repo Feeds */}
              <div className="border-t border-white/5 pt-2">
                <span className="text-[9px] font-mono text-muted uppercase block mb-2">Code Repositories</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[8px] font-semibold text-muted uppercase tracking-wider mb-1">GitHub Username</label>
                    <input
                      type="text"
                      value={githubUsername}
                      onChange={(e) => setGithubUsername(e.target.value)}
                      className="w-full bg-surface border border-white/5 rounded p-1.5 text-xs text-white focus:outline-none focus:border-electric-green"
                      placeholder="e.g. username"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-semibold text-muted uppercase tracking-wider mb-1">GitLab Username</label>
                    <input
                      type="text"
                      value={gitlabUsername}
                      onChange={(e) => setGitlabUsername(e.target.value)}
                      className="w-full bg-surface border border-white/5 rounded p-1.5 text-xs text-white focus:outline-none focus:border-electric-green"
                      placeholder="e.g. username"
                    />
                  </div>
                </div>
              </div>

              {/* DSA Feeds */}
              <div className="border-t border-white/5 pt-2">
                <span className="text-[9px] font-mono text-muted uppercase block mb-2">Competitive Programming</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[8px] font-semibold text-muted uppercase tracking-wider mb-1">LeetCode Username</label>
                    <input
                      type="text"
                      value={leetcodeUsername}
                      onChange={(e) => setLeetcodeUsername(e.target.value)}
                      className="w-full bg-surface border border-white/5 rounded p-1.5 text-xs text-white focus:outline-none focus:border-electric-green"
                      placeholder="e.g. username"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-semibold text-muted uppercase tracking-wider mb-1">Codeforces Username</label>
                    <input
                      type="text"
                      value={codeforcesUsername}
                      onChange={(e) => setCodeforcesUsername(e.target.value)}
                      className="w-full bg-surface border border-white/5 rounded p-1.5 text-xs text-white focus:outline-none focus:border-electric-green"
                      placeholder="e.g. username"
                    />
                  </div>
                </div>
              </div>

              {/* AI & ML Feeds */}
              <div className="border-t border-white/5 pt-2">
                <span className="text-[9px] font-mono text-muted uppercase block mb-2">AI / Machine Learning</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[8px] font-semibold text-muted uppercase tracking-wider mb-1">Kaggle Username</label>
                    <input
                      type="text"
                      value={kaggleUsername}
                      onChange={(e) => setKaggleUsername(e.target.value)}
                      className="w-full bg-surface border border-white/5 rounded p-1.5 text-xs text-white focus:outline-none focus:border-electric-green"
                      placeholder="e.g. username"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-semibold text-muted uppercase tracking-wider mb-1">Hugging Face User</label>
                    <input
                      type="text"
                      value={huggingfaceUsername}
                      onChange={(e) => setHuggingfaceUsername(e.target.value)}
                      className="w-full bg-surface border border-white/5 rounded p-1.5 text-xs text-white focus:outline-none focus:border-electric-green"
                      placeholder="e.g. username"
                    />
                  </div>
                </div>
              </div>

              {/* Cloud Deployments */}
              <div className="border-t border-white/5 pt-2">
                <span className="text-[9px] font-mono text-muted uppercase block mb-2">Cloud Hosting Tokens</span>
                <div className="space-y-2">
                  <div>
                    <label className="block text-[8px] font-semibold text-muted uppercase tracking-wider mb-1">Vercel Token</label>
                    <input
                      type="password"
                      value={vercelToken}
                      onChange={(e) => setVercelToken(e.target.value)}
                      className="w-full bg-surface border border-white/5 rounded p-1.5 text-xs text-white focus:outline-none focus:border-electric-green"
                      placeholder="Vercel CLI auth token"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[8px] font-semibold text-muted uppercase tracking-wider mb-1">Netlify Token</label>
                      <input
                        type="password"
                        value={netlifyToken}
                        onChange={(e) => setNetlifyToken(e.target.value)}
                        className="w-full bg-surface border border-white/5 rounded p-1.5 text-xs text-white focus:outline-none focus:border-electric-green"
                        placeholder="Netlify API token"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-semibold text-muted uppercase tracking-wider mb-1">Render Token</label>
                      <input
                        type="password"
                        value={renderToken}
                        onChange={(e) => setRenderToken(e.target.value)}
                        className="w-full bg-surface border border-white/5 rounded p-1.5 text-xs text-white focus:outline-none focus:border-electric-green"
                        placeholder="Render API token"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Open Source Programs */}
              <div className="border-t border-white/5 pt-2">
                <span className="text-[9px] font-mono text-muted uppercase block mb-2">Open Source Programs</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[8px] font-semibold text-muted uppercase tracking-wider mb-1">GSoC Username</label>
                    <input
                      type="text"
                      value={gsocUsername}
                      onChange={(e) => setGsocUsername(e.target.value)}
                      className="w-full bg-surface border border-white/5 rounded p-1.5 text-xs text-white focus:outline-none focus:border-electric-green"
                      placeholder="GSoC participant ID"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-semibold text-muted uppercase tracking-wider mb-1">GSSoC Username</label>
                    <input
                      type="text"
                      value={gssocUsername}
                      onChange={(e) => setGssocUsername(e.target.value)}
                      className="w-full bg-surface border border-white/5 rounded p-1.5 text-xs text-white focus:outline-none focus:border-electric-green"
                      placeholder="GSSoC participant ID"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleSync}
              disabled={syncing}
              className={`w-full py-2.5 rounded bg-electric-green text-obsidian font-heading font-semibold text-xs transition-all hover:bg-electric-green/90 cursor-pointer ${syncing ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {syncing ? "Syncing Accounts..." : "Fetch & Sync Accounts"}
            </button>
            
            {profile && (
              <div className="pt-2 text-center">
                <a 
                  href={`/profile/${profile.githubUsername || profile.leetcodeUsername}`}
                  className="text-[10px] text-cyber-blue hover:underline font-mono"
                  target="_blank"
                >
                  View Public Vetted Passport URL
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Vetted Stats Summary & Project Verification */}
        <div className="space-y-6 md:col-span-2">
          
          {/* Telemetry-Driven Dynamic Skill Graph */}
          <div className="glass rounded-xl p-6 border border-white/5 space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <div>
                <h3 className="text-sm font-heading font-semibold text-white">Telemetry-Driven Dynamic Skill Graph</h3>
                <p className="text-[10px] text-muted mt-0.5 font-mono">Dynamic node dependency mapping extracted from your active workspace channels.</p>
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

          {/* Integrated Statistics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Repository Feeds (GitHub & GitLab) */}
            <div className="glass rounded-xl p-5 border border-white/5 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-[10px] font-mono text-muted uppercase">Repository Feeds</span>
                <span className="text-[9px] bg-electric-green/10 text-electric-green px-1.5 py-0.5 rounded font-mono">Code</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {/* GitHub */}
                <div className="space-y-1">
                  <h4 className="text-[11px] text-white font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-electric-green" />
                    GitHub
                  </h4>
                  <div className="text-xl font-heading font-extrabold text-white">
                    {profile?.githubStats?.commitCount || 0}
                    <span className="text-[10px] text-muted font-normal font-sans ml-1">commits</span>
                  </div>
                  <div className="text-[9px] text-muted font-mono">
                    PRs: {profile?.githubStats?.prCount || 0} | Revs: {profile?.githubStats?.prReviewsCount || 0}
                  </div>
                </div>
                {/* GitLab */}
                {profile?.gitlabUsername ? (
                  <div className="space-y-1 border-l border-white/5 pl-4">
                    <h4 className="text-[11px] text-white font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                      GitLab
                    </h4>
                    <div className="text-xl font-heading font-extrabold text-white">
                      {profile?.gitlabStats?.commitCount || 0}
                      <span className="text-[10px] text-muted font-normal font-sans ml-1">commits</span>
                    </div>
                    <div className="text-[9px] text-muted font-mono">
                      PRs: {profile?.gitlabStats?.prCount || 0} | Issues: {profile?.gitlabStats?.issuesCount || 0}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center border-l border-white/5 pl-4 text-[10px] text-muted font-mono italic">
                    GitLab Not Synced
                  </div>
                )}
              </div>
            </div>

            {/* DSA & Contests (LeetCode & Codeforces) */}
            <div className="glass rounded-xl p-5 border border-white/5 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-[10px] font-mono text-muted uppercase">DSA & Contests</span>
                <span className="text-[9px] bg-cyber-blue/10 text-cyber-blue px-1.5 py-0.5 rounded font-mono">Algorithms</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {/* LeetCode */}
                <div className="space-y-1">
                  <h4 className="text-[11px] text-white font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                    LeetCode
                  </h4>
                  <div className="text-xl font-heading font-extrabold text-white">
                    {profile?.leetcodeStats?.totalSolved || 0}
                    <span className="text-[10px] text-muted font-normal font-sans ml-1">solved</span>
                  </div>
                  <div className="text-[9px] text-muted font-mono">
                    Streak: {profile?.leetcodeStats?.activityStreak || 0}d | Rating: {profile?.leetcodeStats?.contestRating?.toFixed(0) || "N/A"}
                  </div>
                </div>
                {/* Codeforces */}
                {profile?.codeforcesUsername ? (
                  <div className="space-y-1 border-l border-white/5 pl-4">
                    <h4 className="text-[11px] text-white font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      Codeforces
                    </h4>
                    <div className="text-xl font-heading font-extrabold text-white">
                      {profile?.codeforcesStats?.solvedCount || 0}
                      <span className="text-[10px] text-muted font-normal font-sans ml-1">solved</span>
                    </div>
                    <div className="text-[9px] text-muted font-mono truncate">
                      Rating: {profile?.codeforcesStats?.rating || 0} | {profile?.codeforcesStats?.rank || "Newbie"}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center border-l border-white/5 pl-4 text-[10px] text-muted font-mono italic">
                    Codeforces Not Synced
                  </div>
                )}
              </div>
            </div>

            {/* Cloud Deployments (Vercel, Netlify, Render) */}
            <div className="glass rounded-xl p-5 border border-white/5 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-[10px] font-mono text-muted uppercase">Cloud Shipments</span>
                <span className="text-[9px] bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded font-mono">Deployments</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {/* Vercel */}
                <div className="space-y-1 border-r border-white/5">
                  <span className="text-[9px] font-mono text-muted block">VERCEL</span>
                  <div className="text-base font-heading font-extrabold text-white">
                    {profile?.vercelStats?.deploymentCount || 0}
                  </div>
                  <span className="text-[8px] text-muted block font-mono">Projects: {profile?.vercelStats?.projectCount || 0}</span>
                </div>
                {/* Netlify */}
                <div className="space-y-1 border-r border-white/5">
                  <span className="text-[9px] font-mono text-muted block">NETLIFY</span>
                  {profile?.netlifyToken ? (
                    <>
                      <div className="text-base font-heading font-extrabold text-white">
                        {profile?.netlifyStats?.deployCount || 0}
                      </div>
                      <span className="text-[8px] text-muted block font-mono">Sites: {profile?.netlifyStats?.siteCount || 0}</span>
                    </>
                  ) : (
                    <span className="text-[9px] text-muted italic block pt-1.5 font-mono">Not Synced</span>
                  )}
                </div>
                {/* Render */}
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-muted block">RENDER</span>
                  {profile?.renderToken ? (
                    <>
                      <div className="text-base font-heading font-extrabold text-white">
                        {profile?.renderStats?.deployCount || 0}
                      </div>
                      <span className="text-[8px] text-muted block font-mono">Svcs: {profile?.renderStats?.serviceCount || 0}</span>
                    </>
                  ) : (
                    <span className="text-[9px] text-muted italic block pt-1.5 font-mono">Not Synced</span>
                  )}
                </div>
              </div>
            </div>

            {/* AI / ML Pipelines (Kaggle & Hugging Face) */}
            <div className="glass rounded-xl p-5 border border-white/5 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-[10px] font-mono text-muted uppercase">AI & Data Science</span>
                <span className="text-[9px] bg-pink-500/10 text-pink-400 px-1.5 py-0.5 rounded font-mono">Models & Notebooks</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {/* Kaggle */}
                {profile?.kaggleUsername ? (
                  <div className="space-y-1">
                    <h4 className="text-[11px] text-white font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      Kaggle
                    </h4>
                    <div className="text-base font-heading font-extrabold text-white">
                      {profile?.kaggleStats?.tier || "Novice"}
                    </div>
                    <div className="text-[8px] text-muted font-mono">
                      Competitions: {profile?.kaggleStats?.competitionCount || 0} | Notebooks: {profile?.kaggleStats?.notebookCount || 0}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center text-[10px] text-muted font-mono italic">
                    Kaggle Not Synced
                  </div>
                )}
                {/* Hugging Face */}
                {profile?.huggingfaceUsername ? (
                  <div className="space-y-1 border-l border-white/5 pl-4">
                    <h4 className="text-[11px] text-white font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                      Hugging Face
                    </h4>
                    <div className="text-base font-heading font-extrabold text-white">
                      {profile?.huggingfaceStats?.modelCount || 0} models
                    </div>
                    <div className="text-[8px] text-muted font-mono truncate">
                      Spaces: {profile?.huggingfaceStats?.spaceCount || 0} | Likes: {profile?.huggingfaceStats?.likes || 0}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center border-l border-white/5 pl-4 text-[10px] text-muted font-mono italic">
                    HuggingFace Not Synced
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Open Source Program participations (GSoC & GSSoC) */}
          {(profile?.gsocUsername || profile?.gssocUsername) && (
            <div className="glass rounded-xl p-5 border border-white/5 space-y-3">
              <span className="text-[10px] font-mono text-muted uppercase block border-b border-white/5 pb-2">Verified Open-Source Programs</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profile?.gsocUsername && profile?.gsocStats?.isParticipant && (
                  <div className="p-3 rounded bg-surface border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-electric-green font-mono font-semibold block">Google Summer of Code</span>
                      <span className="text-xs text-white font-semibold mt-1 block">{profile?.gsocStats?.organizations?.join(", ") || "Participant"}</span>
                    </div>
                    <span className="bg-electric-green/10 text-electric-green text-[9px] px-2 py-0.5 rounded font-mono font-semibold">
                      {profile?.gsocStats?.years?.join(", ")}
                    </span>
                  </div>
                )}
                {profile?.gssocUsername && profile?.gssocStats?.isParticipant && (
                  <div className="p-3 rounded bg-surface border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-orange-400 font-mono font-semibold block">Girlscript Summer of Code</span>
                      <span className="text-xs text-white font-semibold mt-1 block">Score: {profile?.gssocStats?.score} | PRs: {profile?.gssocStats?.prCount || 0}</span>
                    </div>
                    <span className="bg-orange-400/10 text-orange-400 text-[9px] px-2 py-0.5 rounded font-mono font-semibold">
                      Rank: #{profile?.gssocStats?.rank}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Salary Telemetry & VS Code Simulation Panel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* CTC / Stipend Telemetry */}
            <div className="glass rounded-xl p-5 border border-white/5 space-y-4 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-electric-green/5 blur-2xl pointer-events-none" />
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-[10px] font-mono text-muted uppercase">Salary Telemetries</span>
                <span className="text-[9px] bg-electric-green/10 text-electric-green px-1.5 py-0.5 rounded font-mono">Telemetry</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 my-auto">
                <div>
                  <span className="text-[9px] font-mono text-muted block">EST. STIPEND</span>
                  <span className="text-[13px] font-heading font-extrabold text-white">
                    {profile && profile.overallScore >= 90 ? "₹40k - ₹100k/mo" : profile && profile.overallScore >= 80 ? "₹25k - ₹40k/mo" : profile && profile.overallScore >= 70 ? "₹15k - ₹25k/mo" : "₹8k - ₹15k/mo"}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-mono text-muted block">EST. FRESHER CTC</span>
                  <span className="text-[13px] font-heading font-extrabold text-white">
                    {profile && profile.overallScore >= 90 ? "₹12 - ₹24 LPA" : profile && profile.overallScore >= 80 ? "₹8 - ₹12 LPA" : profile && profile.overallScore >= 70 ? "₹5 - ₹8 LPA" : "₹3 - ₹5 LPA"}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                <span className="text-muted">Hiring Tier:</span>
                <span className={`font-mono font-semibold ${profile && profile.overallScore >= 90 ? "text-electric-green" : profile && profile.overallScore >= 80 ? "text-cyber-blue" : "text-neon-purple"}`}>
                  {profile && profile.overallScore >= 90 ? "Tier-1 Product Cos" : profile && profile.overallScore >= 80 ? "High-Growth Startups" : "Mid-Market Tech"}
                </span>
              </div>
            </div>

            {/* VS Code Plugin Activity Sync */}
            <div className="glass rounded-xl p-5 border border-white/5 space-y-4 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-neon-purple/5 blur-2xl pointer-events-none" />
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-[10px] font-mono text-muted uppercase">VS Code Plugin Simulator</span>
                <span className="text-[9px] bg-neon-purple/10 text-neon-purple px-1.5 py-0.5 rounded font-mono">IDE Sync</span>
              </div>

              <div className="grid grid-cols-2 gap-2 my-auto">
                <div>
                  <label className="block text-[8px] font-semibold text-muted uppercase mb-1">Tracked Edits</label>
                  <input
                    type="number"
                    value={vscodeEdits}
                    onChange={(e) => setVscodeEdits(Number(e.target.value))}
                    className="w-full bg-surface border border-white/5 rounded p-1 text-[10px] text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-semibold text-muted uppercase mb-1">Coding Minutes</label>
                  <input
                    type="number"
                    value={vscodeMinutes}
                    onChange={(e) => setVscodeMinutes(Number(e.target.value))}
                    className="w-full bg-surface border border-white/5 rounded p-1 text-[10px] text-white focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={syncVscodeActivity}
                disabled={vscodeSyncing}
                className="w-full py-1.5 rounded bg-neon-purple text-white font-heading font-semibold text-[10px] hover:bg-neon-purple/90 transition-all cursor-pointer disabled:opacity-50"
              >
                {vscodeSyncing ? "Syncing Workspace..." : "Sync VS Code Heartbeat"}
              </button>
            </div>
          </div>

          {/* Repositories & AI Project Vetting */}
          <div className="glass rounded-xl p-6 border border-white/5">
            <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
              <h3 className="text-sm font-heading font-semibold text-white">Imported Repositories & Code Vetting</h3>
              <span className="text-[10px] text-muted font-mono">Select a repository to verify authorship</span>
            </div>

            {!profile?.projects || profile.projects.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted">
                No active repositories found. Sync your GitHub account to retrieve your codebase files.
              </div>
            ) : (
              <div className="space-y-3">
                {profile.projects.map((project: ProjectData) => (
                  <div key={project.id} className="p-4 rounded-lg bg-surface border border-white/3 flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-semibold text-white flex items-center gap-2">
                        {project.name}
                        {project.isVerified ? (
                          <span className="bg-electric-green/10 text-electric-green text-[9px] px-1.5 py-0.5 rounded font-mono border border-electric-green/20">
                            VERIFIED ({(project.verificationConfidence * 100).toFixed(0)}%)
                          </span>
                        ) : (
                          <span className="bg-white/3 text-muted text-[9px] px-1.5 py-0.5 rounded font-mono">
                            UNVERIFIED
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-muted mt-1 max-w-md line-clamp-1">{project.description || "No description provided."}</p>
                    </div>

                    <div>
                      {project.isVerified ? (
                        <span className="text-xs text-electric-green font-semibold font-mono">✓ Passed</span>
                      ) : (
                        <button
                          onClick={() => startVerification(project)}
                          className="px-3 py-1.5 rounded bg-cyber-blue text-white text-[11px] font-heading font-semibold hover:bg-cyber-blue/90 cursor-pointer"
                        >
                          Verify Authorship
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Company Vetting Challenges */}
          <div className="glass rounded-xl p-6 border border-white/5">
            <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4 font-sans">
              <h3 className="text-sm font-heading font-semibold text-white">Active Company Vetting Challenges</h3>
              <span className="text-[10px] text-muted font-mono">Unlock verified enterprise badges</span>
            </div>

            {companyTests.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted font-mono italic">
                No recruiter challenges currently deployed.
              </div>
            ) : (
              <div className="space-y-3 text-left">
                {companyTests.map((test) => (
                  <div key={test.id} className="p-4 rounded-lg bg-surface border border-white/3 flex justify-between items-center flex-wrap sm:flex-nowrap gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-electric-green font-mono font-semibold uppercase">{test.companyName}</span>
                        <span className="bg-cyber-blue/10 text-cyber-blue text-[8px] px-1.5 py-0.5 rounded font-mono border border-cyber-blue/20">
                          {test.stipendRange}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-white font-sans">
                        {test.testTitle}
                      </h4>
                      <p className="text-[11px] text-muted max-w-md">{test.description}</p>
                      <div className="text-[10px] text-muted font-mono pt-1">
                        Unlocks badge: <span className="text-electric-green">{test.badgeName}</span>
                      </div>
                    </div>

                    <div>
                      <button
                        onClick={() => startChallenge(test)}
                        className="px-3.5 py-1.5 rounded bg-electric-green text-obsidian text-[11px] font-heading font-bold hover:bg-electric-green/90 transition-all cursor-pointer whitespace-nowrap"
                      >
                        Solve Challenge
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Timed Sandbox Challenge & AI Asset Generator Suite */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Real-Work Sandbox Simulator */}
            <div className="glass rounded-xl p-5 border border-white/5 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <h3 className="text-xs font-heading font-bold text-white uppercase tracking-wider">Timed Sandbox Challenge</h3>
                <span className="text-[9px] bg-cyber-blue/10 text-cyber-blue px-1.5 py-0.5 rounded font-mono">SANDBOX</span>
              </div>

              {!simulationActive ? (
                <div className="text-center py-6 space-y-3">
                  <p className="text-[10px] text-muted leading-relaxed">
                    Test your development abilities under hydration constraints. Resolving challenges boosts your Builder skills score flatly by +10.
                  </p>
                  <button
                    onClick={startSimulation}
                    className="px-4 py-2 rounded bg-cyber-blue text-white text-[10px] font-heading font-semibold hover:bg-cyber-blue/90 cursor-pointer"
                  >
                    Launch Timed Bug-Fix Simulation
                  </button>
                </div>
              ) : (
                <div className="space-y-3 text-left font-mono">
                  <div className="text-[9px] text-white leading-relaxed">
                    <strong>Challenge:</strong> Next.js Hydration Mismatch. Fix the component to render static or deferred on-mount random numbers.
                  </div>
                  <textarea
                    rows={4}
                    value={simulationCode}
                    onChange={(e) => setSimulationCode(e.target.value)}
                    className="w-full bg-black/60 border border-white/5 rounded p-2 text-[10px] text-electric-green/80 focus:outline-none"
                  />
                  <div className="flex justify-between items-center text-[10px]">
                    <button
                      onClick={() => setSimulationActive(false)}
                      className="text-muted hover:underline"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={submitSimulation}
                      disabled={submittingSimulation}
                      className="px-3 py-1.5 rounded bg-electric-green text-obsidian font-heading font-bold hover:bg-electric-green/90 cursor-pointer"
                    >
                      {submittingSimulation ? "Grading Code..." : "Submit Solution"}
                    </button>
                  </div>
                  {simulationResult && (
                    <div className="p-3 bg-white/3 border border-white/5 rounded text-[9px] text-gray-200">
                      {simulationResult}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* AI Assets & LaTeX Resume Generator Suite */}
            <div className="glass rounded-xl p-5 border border-white/5 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <h3 className="text-xs font-heading font-bold text-white uppercase tracking-wider">AI Resume & Asset Generator</h3>
                <span className="text-[9px] bg-electric-green/10 text-electric-green px-1.5 py-0.5 rounded font-mono">AI ASSETS</span>
              </div>

              {/* Toggles */}
              <div className="flex border-b border-white/5 text-[9px] font-mono uppercase tracking-wider text-muted">
                <button
                  onClick={() => setActiveAssetTab("latex")}
                  className={`flex-1 pb-2 border-b transition-all ${activeAssetTab === "latex" ? "border-electric-green text-white font-bold" : "border-transparent hover:text-white"}`}
                >
                  LaTeX Resume
                </button>
                <button
                  onClick={() => setActiveAssetTab("cover")}
                  className={`flex-1 pb-2 border-b transition-all ${activeAssetTab === "cover" ? "border-electric-green text-white font-bold" : "border-transparent hover:text-white"}`}
                >
                  Cover Letter
                </button>
                <button
                  onClick={() => setActiveAssetTab("linkedin")}
                  className={`flex-1 pb-2 border-b transition-all ${activeAssetTab === "linkedin" ? "border-electric-green text-white font-bold" : "border-transparent hover:text-white"}`}
                >
                  LinkedIn Bio
                </button>
              </div>

              {/* LaTeX Tab */}
              {activeAssetTab === "latex" && (
                <div className="space-y-3 font-mono text-[9px]">
                  <textarea
                    readOnly
                    rows={4}
                    value={`\\documentclass{article}\n\\usepackage{hyperref}\n\\begin{document}\n\\section*{${user.name} - Software Engineer}\n\\noindent Verified Developer Passport: \\href{http://codedna.in/profile/${profile?.githubUsername || "portfolio"}}{CodeDNA Profile}\n\n\\subsection*{Certified Technical Telemetries}\n\\begin{itemize}\n  \\item CodeDNA Overall Score: ${profile?.overallScore || 0}/100\n  \\item Hard Skills Score: ${profile?.hardSkillsScore || 0}/100\n  \\item Builder Skills Score: ${profile?.builderSkillsScore || 0}/100\n  \\item Synced GitHub Commits: ${profile?.githubStats?.commitCount || 0}\n  \\item Synced LeetCode Solutions: ${profile?.leetcodeStats?.totalSolved || 0}\n\\end{itemize}\n\\end{document}`}
                    className="w-full bg-black/60 border border-white/5 rounded p-2 text-gray-300 focus:outline-none select-all"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`\\documentclass{article}\n\\usepackage{hyperref}\n\\begin{document}\n\\section*{${user.name} - Software Engineer}\n\\noindent Verified Developer Passport: \\href{http://codedna.in/profile/${profile?.githubUsername || "portfolio"}}{CodeDNA Profile}\n\n\\subsection*{Certified Technical Telemetries}\n\\begin{itemize}\n  \\item CodeDNA Overall Score: ${profile?.overallScore || 0}/100\n  \\item Hard Skills Score: ${profile?.hardSkillsScore || 0}/100\n  \\item Builder Skills Score: ${profile?.builderSkillsScore || 0}/100\n  \\item Synced GitHub Commits: ${profile?.githubStats?.commitCount || 0}\n  \\item Synced LeetCode Solutions: ${profile?.leetcodeStats?.totalSolved || 0}\n\\end{itemize}\n\\end{document}`);
                      alert("LaTeX code copied to clipboard!");
                    }}
                    className="w-full py-1 bg-white/5 border border-white/10 rounded text-white text-[10px] font-heading font-semibold hover:bg-white/10 transition-all cursor-pointer"
                  >
                    Copy LaTeX Code
                  </button>
                </div>
              )}

              {/* Cover Letter Tab */}
              {activeAssetTab === "cover" && (
                <div className="space-y-3 font-sans text-xs">
                  {!generatedCoverLetter ? (
                    <div className="space-y-3">
                      <textarea
                        rows={2}
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste target Job Description (JD)..."
                        className="w-full bg-black/60 border border-white/5 rounded p-2 text-[10px] text-white focus:outline-none"
                      />
                      <button
                        onClick={triggerCoverLetter}
                        disabled={generatingCoverLetter || !jobDescription}
                        className="w-full py-1.5 bg-cyber-blue text-white rounded text-[10px] font-heading font-semibold hover:bg-cyber-blue/90 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {generatingCoverLetter ? "Drafting Cover Letter..." : "Generate Custom Cover Letter"}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 font-mono text-[9px]">
                      <textarea
                        readOnly
                        rows={4}
                        value={generatedCoverLetter}
                        className="w-full bg-black/60 border border-white/5 rounded p-2 text-gray-300 focus:outline-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => setGeneratedCoverLetter("")}
                          className="flex-1 py-1 bg-white/5 border border-white/10 rounded text-white text-[10px] font-heading font-semibold hover:bg-white/10 transition-all cursor-pointer"
                        >
                          Reset
                        </button>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(generatedCoverLetter);
                            alert("Cover letter copied to clipboard!");
                          }}
                          className="flex-1 py-1 bg-electric-green text-obsidian rounded text-[10px] font-heading font-bold hover:bg-electric-green/90 transition-all cursor-pointer"
                        >
                          Copy Letter
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* LinkedIn Tab */}
              {activeAssetTab === "linkedin" && (
                <div className="space-y-3 font-mono text-[9px]">
                  <textarea
                    readOnly
                    rows={4}
                    value={`🚀 Verified Software Builder on @CodeDNA (Overall Passport Score: ${profile?.overallScore || 0}/100).\n\nKey metrics vetting details:\n- Synced GitHub commits: ${profile?.githubStats?.commitCount || 0}\n- Synced LeetCode solutions: ${profile?.leetcodeStats?.totalSolved || 0}\n- Active streak: ${profile?.leetcodeStats?.activityStreak || 0} days\n- Cloud deployments: ${profile?.vercelStats?.deploymentCount || 0}\n\nAll achievements verified by dynamic AI code questions audits. View my Developer Passport: codedna.in/profile/${profile?.githubUsername || "portfolio"}`}
                    className="w-full bg-black/60 border border-white/5 rounded p-2 text-gray-300 focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`🚀 Verified Software Builder on @CodeDNA (Overall Passport Score: ${profile?.overallScore || 0}/100).\n\nKey metrics vetting details:\n- Synced GitHub commits: ${profile?.githubStats?.commitCount || 0}\n- Synced LeetCode solutions: ${profile?.leetcodeStats?.totalSolved || 0}\n- Active streak: ${profile?.leetcodeStats?.activityStreak || 0} days\n- Cloud deployments: ${profile?.vercelStats?.deploymentCount || 0}\n\nAll achievements verified by dynamic AI code questions audits. View my Developer Passport: codedna.in/profile/${profile?.githubUsername || "portfolio"}`);
                      alert("LinkedIn bio copied to clipboard!");
                    }}
                    className="w-full py-1 bg-electric-green text-obsidian rounded text-[10px] font-heading font-bold hover:bg-electric-green/90 transition-all cursor-pointer"
                  >
                    Copy LinkedIn Bio
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* AI Verification Question Modal */}
      {activeProject && (
        <div className="fixed inset-0 z-50 bg-obsidian/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass max-w-lg w-full rounded-xl p-8 border border-white/10 shadow-2xl relative">
            <button 
              onClick={() => setActiveProject(null)} 
              className="absolute top-6 right-6 text-muted hover:text-white text-sm cursor-pointer"
            >
              ✕
            </button>
            <h3 className="text-base font-heading font-semibold text-white mb-1">
              AI Project Author Verification
            </h3>
            <p className="text-xs text-muted mb-6">
              Assessing authorship for repository: <span className="text-electric-green font-mono">{activeProject.name}</span>
            </p>

            {loadingQuestions ? (
              <div className="py-12 text-center text-xs text-muted flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-electric-green"></div>
                Analyzing repository structure and generating dynamic questions...
              </div>
            ) : (
              <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
                {questions.map((q, idx) => (
                  <div key={q.id} className="p-4 rounded-lg bg-surface border border-white/5 space-y-3">
                    <div className="text-xs font-semibold text-white">
                      Question {idx + 1}: {q.question}
                    </div>
                    {q.codeSnippet && (
                      <pre className="p-3 bg-black/60 rounded text-[10px] font-mono text-electric-green/80 overflow-x-auto max-h-24">
                        <code>{q.codeSnippet}</code>
                      </pre>
                    )}
                    {q.lineReference && (
                      <div className="text-[10px] text-muted font-mono">
                        Reference line: L{q.lineReference}
                      </div>
                    )}
                    
                    {gradingResults[q.id] === undefined ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={answers[q.id] || ""}
                          onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                          className="flex-1 bg-black border border-white/5 rounded p-2 text-xs text-white focus:outline-none focus:border-electric-green"
                          placeholder="Your answer..."
                        />
                        <button
                          onClick={() => submitAnswer(q.id)}
                          disabled={submittingVerification[q.id] || !answers[q.id]}
                          className="px-3 rounded bg-electric-green text-obsidian text-xs font-semibold hover:bg-electric-green/90 cursor-pointer disabled:opacity-50"
                        >
                          {submittingVerification[q.id] ? "Grading..." : "Submit"}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold font-mono ${gradingResults[q.id] ? "text-electric-green" : "text-coral-red"}`}>
                          {gradingResults[q.id] ? "✓ Answer Correct" : "✗ Answer Incorrect"}
                        </span>
                        <span className="text-[10px] text-muted font-mono">(Graded by Gemini)</span>
                      </div>
                    )}
                  </div>
                ))}

                {/* Reset or complete message */}
                {Object.keys(gradingResults).length === questions.length && questions.length > 0 && (
                  <button
                    onClick={() => {
                      setActiveProject(null);
                      // Re-fetch profile to load updated verification statuses
                      const savedUser = localStorage.getItem("user");
                      if (savedUser) {
                        try {
                          fetchProfile(JSON.parse(savedUser) as UserSession);
                        } catch (e) {
                          console.error(e);
                        }
                      }
                    }}
                    className="w-full py-2.5 rounded bg-electric-green text-obsidian text-xs font-semibold hover:bg-electric-green/90 cursor-pointer"
                  >
                    Finish Vetting Walkthrough
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Company Vetting Challenge Sandbox Modal */}
      {activeChallenge && (
        <div className="fixed inset-0 z-50 bg-obsidian/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass max-w-2xl w-full rounded-xl p-8 border border-white/10 shadow-2xl relative text-left">
            <button 
              onClick={() => setActiveChallenge(null)} 
              className="absolute top-6 right-6 text-muted hover:text-white text-sm cursor-pointer focus:outline-none"
            >
              ✕
            </button>
            <div className="space-y-1">
              <span className="text-[10px] text-electric-green font-mono uppercase font-bold tracking-wider">{activeChallenge.companyName} Vetting Challenge</span>
              <h3 className="text-lg font-heading font-extrabold text-white font-sans">
                {activeChallenge.testTitle}
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                {activeChallenge.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {/* Left Column: Boilerplate Sandbox Editor */}
              <div className="md:col-span-2 space-y-3">
                <label className="block text-[9px] text-muted font-mono uppercase font-semibold">Sandbox Code Editor</label>
                <textarea
                  rows={12}
                  value={challengeCode}
                  onChange={(e) => setChallengeCode(e.target.value)}
                  className="w-full bg-black/80 border border-white/5 rounded-lg p-3 text-[11px] font-mono text-electric-green/80 focus:outline-none focus:border-electric-green"
                />
              </div>

              {/* Right Column: Console & Outcomes */}
              <div className="md:col-span-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <label className="block text-[9px] text-muted font-mono uppercase font-semibold">Vetting Console</label>
                  <div className="h-[200px] bg-black/60 border border-white/5 rounded-lg p-2.5 font-mono text-[9px] text-electric-green/80 overflow-y-auto space-y-1.5 text-left">
                    {challengeConsole.length === 0 ? (
                      <div className="text-muted italic">Click "Run Vetting Tests" to verify solution.</div>
                    ) : (
                      challengeConsole.map((line, idx) => (
                        <div key={idx}>{line}</div>
                      ))
                    )}
                  </div>
                </div>

                <div className="space-y-2 font-sans">
                  {challengeSuccess ? (
                    <div className="p-3 bg-electric-green/10 border border-electric-green/20 text-electric-green text-[10px] rounded font-mono leading-tight">
                      {challengeSuccess}
                    </div>
                  ) : (
                    <button
                      onClick={runVettingChallenge}
                      disabled={verifyingChallenge}
                      className="w-full py-2.5 bg-electric-green text-obsidian rounded font-heading font-semibold text-xs hover:bg-electric-green/90 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {verifyingChallenge ? "Compiling & Verifying..." : "Run Vetting Tests"}
                    </button>
                  )}

                  <button
                    onClick={() => setActiveChallenge(null)}
                    className="w-full py-1.5 border border-white/5 text-muted rounded text-[10px] hover:text-white transition-all cursor-pointer"
                  >
                    Close Sandbox
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
