"use client";

import { useState } from "react";
import { API_BASE_URL } from "../config";

// Glyph definitions for spelled "OPEN SOURCE" in 7x4 matrix (excluding spacing columns)
const GLYPHS: { [key: string]: string[] } = {
  O: [
    ".##.",
    "#..#",
    "#..#",
    "#..#",
    "#..#",
    "#..#",
    ".##."
  ],
  P: [
    "###.",
    "#..#",
    "#..#",
    "###.",
    "#...",
    "#...",
    "#..."
  ],
  E: [
    "####",
    "#...",
    "#...",
    "###.",
    "#...",
    "#...",
    "####"
  ],
  N: [
    "#..#",
    "##.#",
    "#.#.",
    "#..#",
    "#..#",
    "#..#",
    "#..#"
  ],
  S: [
    ".###",
    "#...",
    "#...",
    ".##.",
    "...#",
    "...#",
    "###."
  ],
  U: [
    "#..#",
    "#..#",
    "#..#",
    "#..#",
    "#..#",
    "#..#",
    ".##."
  ],
  R: [
    "###.",
    "#..#",
    "#..#",
    "###.",
    "#.#.",
    "#..#",
    "#..#"
  ],
  C: [
    ".###",
    "#...",
    "#...",
    "#...",
    "#...",
    "#...",
    ".###"
  ],
  " ": [
    "....",
    "....",
    "....",
    "....",
    "....",
    "....",
    "...."
  ]
};

const COL_MAP = [
  { start: 0, end: 3, char: "O" },
  { start: 5, end: 8, char: "P" },
  { start: 10, end: 13, char: "E" },
  { start: 15, end: 18, char: "N" },
  { start: 21, end: 24, char: "S" },
  { start: 26, end: 29, char: "O" },
  { start: 31, end: 34, char: "U" },
  { start: 36, end: 39, char: "R" },
  { start: 41, end: 44, char: "C" },
  { start: 46, end: 49, char: "E" }
];

function getDotColor(row: number, col: number): string {
  const match = COL_MAP.find(m => col >= m.start && col <= m.end);
  if (!match) return "#ebedf0"; // Default light mode GitHub empty color

  const charCol = col - match.start;
  const glyph = GLYPHS[match.char];
  if (!glyph) return "#ebedf0";

  const isActive = glyph[row][charCol] === "#";
  if (!isActive) return "#ebedf0";

  // Natural GitHub-style contribution variations
  const shades = ["#9be9a8", "#40c463", "#30a14e", "#216e39"];
  return shades[(row * 3 + col * 7) % shades.length];
}

export default function Home() {
  // Auth modal states
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<"DEVELOPER" | "RECRUITER">("DEVELOPER");
  
  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  // Score simulator states
  const [simHard, setSimHard] = useState(75);
  const [simSoft, setSimSoft] = useState(80);
  const [simBuilder, setSimBuilder] = useState(70);
  const simOverall = Math.round(simHard * 0.3 + simSoft * 0.4 + simBuilder * 0.3);

  const openAuth = (selectedRole: "DEVELOPER" | "RECRUITER", loginState: boolean = true) => {
    setRole(selectedRole);
    setIsLogin(loginState);
    setError("");
    setSuccess("");
    setOtpSent(false);
    setOtpCode("");
    setShowAuthModal(true);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    let endpoint = "";
    let payload = {};

    if (isLogin) {
      endpoint = "/api/auth/login";
      payload = { email, password };
    } else {
      if (otpSent) {
        endpoint = "/api/auth/register/verify-otp";
        payload = { email, otp: otpCode };
      } else {
        endpoint = "/api/auth/register/request-otp";
        payload = { email, password, name, role };
      }
    }

    try {
      const response = await fetch(API_BASE_URL + endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      if (isLogin) {
        localStorage.setItem("user", JSON.stringify(data.user));
        setSuccess("Access Granted! Redirecting...");
        setTimeout(() => {
          if (data.user.role === "RECRUITER") {
            window.location.href = "/recruiter";
          } else {
            window.location.href = "/dashboard";
          }
        }, 1000);
      } else {
        if (!otpSent) {
          setOtpSent(true);
          setSuccess("Verification OTP sent! Check backend terminal logs for the 6-digit code.");
        } else {
          setSuccess("Account verified and created successfully! Switching to login...");
          setTimeout(() => {
            setIsLogin(true);
            setOtpSent(false);
            setOtpCode("");
            setSuccess("");
          }, 2000);
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  // Spelled OPEN SOURCE logic is managed globally by getDotColor

  return (
    <div className="min-h-screen bg-transparent text-text font-sans relative overflow-x-hidden selection:bg-electric-green/30">

      {/* Background glow meshes */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-electric-green/2 pointer-events-none blur-[140px]" />
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full bg-cyber-blue/2 pointer-events-none blur-[120px]" />
      <div className="absolute bottom-10 left-0 w-[500px] h-[500px] rounded-full bg-neon-purple/2 pointer-events-none blur-[120px]" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Header/Nav */}
      <header className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center relative z-20">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-heading font-extrabold text-white tracking-tight">
            Code<span className="text-electric-green">DNA</span>
          </span>
          <span className="bg-white/5 text-muted px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider font-semibold border border-white/5">
            Passport v2.0
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-[10px] font-mono text-muted uppercase tracking-wider">
          <a href="#features" className="hover:text-white transition-colors">Dev Features</a>
          <a href="#recruiter-features" className="hover:text-white transition-colors">Recruiter SaaS</a>
          <a href="#compare" className="hover:text-white transition-colors">Compare</a>
          <a href="#moats" className="hover:text-white transition-colors">Our Moats</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#formula" className="hover:text-white transition-colors">Simulator</a>
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={() => openAuth("DEVELOPER", true)}
            className="text-xs font-mono text-muted hover:text-white transition-colors px-3 py-1.5 focus:outline-none cursor-pointer"
          >
            Sign In
          </button>
          <button
            onClick={() => openAuth("DEVELOPER", false)}
            className="text-xs font-mono font-semibold border border-electric-green/20 hover:border-electric-green/80 text-electric-green px-4 py-2 rounded-lg transition-all focus:outline-none cursor-pointer hover:shadow-[0_0_15px_rgba(0,229,160,0.1)]"
          >
            For Developers
          </button>
          <button
            onClick={() => openAuth("RECRUITER", false)}
            className="text-xs font-heading font-semibold bg-cyber-blue text-white px-4 py-2 rounded-lg hover:bg-cyber-blue/90 transition-all focus:outline-none cursor-pointer hover:shadow-[0_0_15px_rgba(0,102,255,0.2)]"
          >
            Hire Talents
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-24 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Marketing Hook */}
        <div className="space-y-6 text-center lg:text-left">
          <span className="bg-electric-green/10 text-electric-green border border-electric-green/20 text-xs px-3.5 py-1.5 rounded-full font-mono tracking-wide inline-block">
            Continuous-Verification Developer Identity & Talent Ecosystem
          </span>
          <h2 className="text-3xl sm:text-5xl font-heading font-extrabold text-white tracking-tight leading-[1.05]">
            Get hired for <br />
            <span className="text-electric-green">what you build</span>, <br />
            not where you study.
          </h2>
          <p className="text-muted text-sm sm:text-base max-w-lg mx-auto lg:mx-0 leading-relaxed">
            Eliminate resume brand bias. CodeDNA pulls direct signals from your GitHub commits, LeetCode rating streaks, and Vercel deploys, calculating a validated, tamper-proof Developer Passport powered by Gemini Q&A auditing.
          </p>
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
            <button
              onClick={() => openAuth("DEVELOPER", false)}
              className="px-6 py-3 rounded-lg bg-electric-green text-obsidian font-heading font-bold text-sm hover:bg-electric-green/90 transition-all cursor-pointer shadow-[0_0_30px_rgba(0,229,160,0.1)]"
            >
              Build Vetted Passport
            </button>
            <button
              onClick={() => openAuth("RECRUITER", false)}
              className="px-6 py-3 rounded-lg bg-cyber-blue text-white font-heading font-bold text-sm hover:bg-cyber-blue/90 transition-all cursor-pointer shadow-[0_0_30px_rgba(0,102,255,0.15)]"
            >
              Recruit Verified Talent
            </button>
          </div>
        </div>

        {/* Dynamic Vetted Passport Mockup Graphic */}
        <div className="relative">
          <div className="glass rounded-2xl p-6 border border-white/5 relative shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-electric-green/3 blur-2xl pointer-events-none" />

            {/* Passport header */}
            <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-6">
              <div>
                <span className="text-[9px] text-electric-green font-mono tracking-wider font-bold bg-electric-green/10 px-1.5 py-0.5 rounded border border-electric-green/20">PROOF OF CONSTRUCTION</span>
                <h3 className="text-sm font-heading font-bold text-white mt-1.5">Aryan Gupta</h3>
                <span className="text-[10px] text-muted font-mono">Tier-2/3 College Graduate</span>
              </div>
              
              <div className="text-right">
                <span className="text-3xl font-heading font-extrabold text-electric-green block">94.2</span>
                <span className="text-[9px] text-muted font-mono block">OVERALL PROFILE SCORE</span>
              </div>
            </div>

            {/* Layout grids */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-3 bg-white/2 rounded-lg border border-white/3">
                <span className="text-[9px] font-mono text-muted uppercase">GitHub Stats</span>
                <div className="text-sm font-heading font-extrabold mt-1">420 Commits</div>
                <div className="text-[9px] text-muted font-mono mt-0.5">18 Active PRs</div>
              </div>
              <div className="p-3 bg-white/2 rounded-lg border border-white/3">
                <span className="text-[9px] font-mono text-muted uppercase">LeetCode</span>
                <div className="text-sm font-heading font-extrabold mt-1">162 Solved</div>
                <div className="text-[9px] text-muted font-mono mt-0.5">Streak: 12 days</div>
              </div>
              <div className="p-3 bg-white/2 rounded-lg border border-white/3">
                <span className="text-[9px] font-mono text-muted uppercase">Vercel</span>
                <div className="text-sm font-heading font-extrabold mt-1">28 Deploys</div>
                <div className="text-[9px] text-muted font-mono mt-0.5">5 Active Projects</div>
              </div>
            </div>

            {/* Score breakdowns */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-muted">Hard Skills (DSA, Language Depth)</span>
                  <span className="font-semibold text-white">92/100</span>
                </div>
                <div className="h-1.5 w-full bg-white/3 rounded-full overflow-hidden">
                  <div className="bg-neon-purple h-full" style={{ width: "92%" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-muted">Builder Skills (CI/CD, Production Code)</span>
                  <span className="font-semibold text-white">96/100</span>
                </div>
                <div className="h-1.5 w-full bg-white/3 rounded-full overflow-hidden">
                  <div className="bg-electric-green h-full" style={{ width: "96%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* SECTION 1: PROBLEM & SOLUTION PHILOSOPHY */}
      <section id="problem" className="max-w-6xl mx-auto px-6 py-24 border-t border-white/5 relative z-10">
        <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
          <span className="bg-coral-red/10 text-coral-red border border-coral-red/20 text-[10px] uppercase font-mono font-semibold px-2.5 py-1 rounded">The Vetting Problem</span>
          <h3 className="text-3xl font-heading font-extrabold text-white">The Broken Tech Talent Funnel</h3>
          <p className="text-muted text-xs leading-relaxed">
            Legacy ATS systems and job boards have failed Indian engineering graduates and hiring teams alike.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 text-left">
          <div className="glass rounded-xl p-6 border-t-2 border-coral-red relative overflow-hidden flex flex-col justify-between h-48 hover:shadow-[0_0_15px_rgba(255,68,68,0.05)] transition-all">
            <div>
              <span className="text-3xl font-heading font-extrabold text-coral-red block font-mono">1.5M</span>
              <h4 className="text-xs font-semibold text-white mt-2">Graduates Excluded Yearly</h4>
              <p className="text-[10px] text-muted leading-relaxed mt-1">
                Most graduates come from Tier-2/3 colleges and are filtered out by legacy ATS systems based solely on college brand.
              </p>
            </div>
          </div>

          <div className="glass rounded-xl p-6 border-t-2 border-coral-red relative overflow-hidden flex flex-col justify-between h-48 hover:shadow-[0_0_15px_rgba(255,68,68,0.05)] transition-all">
            <div>
              <span className="text-3xl font-heading font-extrabold text-coral-red block font-mono">73%</span>
              <h4 className="text-xs font-semibold text-white mt-2">Plagiarized Project Code</h4>
              <p className="text-[10px] text-muted leading-relaxed mt-1">
                Project code is copied from YouTube tutorials, templates, or peers. Recruiters have zero ways to prove genuine authorship.
              </p>
            </div>
          </div>

          <div className="glass rounded-xl p-6 border-t-2 border-yellow-500 relative overflow-hidden flex flex-col justify-between h-48 hover:shadow-[0_0_15px_rgba(255,184,0,0.05)] transition-all">
            <div>
              <span className="text-3xl font-heading font-extrabold text-yellow-500 block font-mono">$0</span>
              <h4 className="text-xs font-semibold text-white mt-2">Global Platform Focus</h4>
              <p className="text-[10px] text-muted leading-relaxed mt-1">
                Competitors price in USD, use English-only support, lack local integrations, and ignore the Indian college placement systems.
              </p>
            </div>
          </div>

          <div className="glass rounded-xl p-6 border-t-2 border-electric-green relative overflow-hidden flex flex-col justify-between h-48 hover:shadow-[0_0_15px_rgba(0,229,160,0.05)] transition-all">
            <div>
              <span className="text-3xl font-heading font-extrabold text-electric-green block font-mono">₹14B+</span>
              <h4 className="text-xs font-semibold text-white mt-2">Tech Recruitment TAM</h4>
              <p className="text-[10px] text-muted leading-relaxed mt-1">
                Indian tech hiring market is growing 18% YoY, yet legacy job boards have failed to provide verified talent.
              </p>
            </div>
          </div>
        </div>

        {/* Philosophy Callout */}
        <div className="glass rounded-2xl p-8 border-l-4 border-electric-green bg-electric-green/2 text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-electric-green/3 blur-2xl pointer-events-none" />
          <div className="space-y-3">
            <h4 className="text-base font-heading font-bold text-white flex items-center gap-2">
              <span className="text-electric-green">🧬</span> The CodeDNA Philosophy
            </h4>
            <p className="text-xs text-gray-200 leading-relaxed font-mono">
              &quot;Get hired for what you build, not where you study.&quot;
            </p>
            <p className="text-xs text-muted leading-relaxed max-w-4xl">
              We measure <strong>Proof of Construction</strong> — the real-world ability to construct and deploy production-ready software — rather than memory recall through sandbox algorithms. Unlike competitor black-box rules, CodeDNA scoring indexes are completely open-source, verifiable, and testable using a local developer CLI.
            </p>
          </div>
        </div>
      </section>

      {/* Real Vetting Chat Dialogue Section (High-fidelity replica matching user screenshot) */}
      <section id="dialogue" className="max-w-6xl mx-auto px-6 py-24 border-t border-white/5 relative z-10">
        <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
          <span className="bg-electric-green/10 text-electric-green border border-electric-green/20 text-[10px] uppercase font-mono font-semibold px-2.5 py-1 rounded">Vetting Dialogue Simulator</span>
          <h3 className="text-3xl font-heading font-extrabold text-white">Verified Open Source Contributors</h3>
          <p className="text-muted text-xs">Verify your technical contribution footprint instantly. We parse your commits to render an interactive map proving construction.</p>
        </div>

        {/* The chat box mimicking user screenshot */}
        <div className="bg-[#f6f8fa] border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-2xl max-w-4xl mx-auto text-black">
          {/* Recruiter speech bubble */}
          <div className="flex justify-end items-center gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-tr-none px-5 py-3 shadow-sm text-gray-800 text-[13px] sm:text-[14px] font-medium leading-snug">
              Are you an open-source contributor?
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-cyber-blue to-[#4d9dff] flex items-center justify-center text-white text-base sm:text-lg shadow-md border border-white/10 shrink-0 select-none">
              👩‍💼
            </div>
          </div>

          {/* Developer speech bubble containing the grid spelling "OPEN SOURCE" */}
          <div className="flex justify-start items-start gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-electric-green to-[#1b5e20] flex items-center justify-center text-white text-xs sm:text-sm shadow-md border border-white/10 shrink-0 mt-1 select-none font-mono font-bold">
              {"</>"}
            </div>
            <div className="bg-[#eaeaea] rounded-2xl rounded-tl-none p-5 sm:p-6 flex-1 shadow-sm space-y-4">
              <div className="text-gray-900 text-[13px] sm:text-[14px] font-medium">
                Yes, I made 1450 contribution on GitHub last year
              </div>
              
              {/* Spelled OPEN SOURCE Grid (GitHub Style column-by-column layout) */}
              <div className="overflow-x-auto pb-1 select-none">
                <div className="flex gap-[3px] bg-[#eaeaea] py-2 rounded-lg w-max mx-auto">
                  {Array.from({ length: 53 }).map((_, colIndex) => (
                    <div key={colIndex} className="flex flex-col gap-[3px]">
                      {Array.from({ length: 7 }).map((_, rowIndex) => {
                        const color = getDotColor(rowIndex, colIndex);
                        return (
                          <div
                            key={rowIndex}
                            style={{ backgroundColor: color }}
                            className="w-[8px] h-[8px] sm:w-[9px] sm:h-[9px] rounded-full transition-all duration-200 hover:scale-125"
                            title={`Day contribution status at col ${colIndex}, row ${rowIndex}`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Long Alternating Features Sections */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24 border-t border-white/5 space-y-32 relative z-10">
        
        {/* Section Title */}
        <div className="text-center max-w-lg mx-auto space-y-3">
          <span className="bg-cyber-blue/10 text-cyber-blue border border-cyber-blue/20 text-[10px] uppercase font-mono font-semibold px-2.5 py-1 rounded">Vetting Dimensions</span>
          <h3 className="text-4xl font-heading font-extrabold text-white">Deep-Dive Platform Features</h3>
          <p className="text-muted text-xs">A comprehensive breakdown of all continuous verification parameters and recruiter controls.</p>
        </div>

        {/* Feature 1: One-Click Profile Aggregator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs text-electric-green font-mono uppercase tracking-wider font-semibold bg-electric-green/10 px-2.5 py-1 rounded">01 · Developer Aggregator</span>
            <h4 className="text-2xl font-heading font-bold text-white leading-tight">One-Click Multi-Platform Aggregation</h4>
            <p className="text-muted text-xs leading-relaxed">
              Connect your developer profiles by username alone. CodeDNA continuously pulls contributions metadata from GitHub, GitLab, LeetCode, Codeforces, Kaggle, Hugging Face, Vercel, Netlify, Render, GSoC, and GSSoC. Serves as your global verified tech footprint updated automatically on every single merge.
            </p>
            <ul className="text-xs text-muted space-y-2 font-mono">
              <li className="flex items-center gap-2"><span className="text-electric-green">✓</span> Commits, PR reviews, branches & issues (GitHub, GitLab)</li>
              <li className="flex items-center gap-2"><span className="text-electric-green">✓</span> DSA solved count, contest ratings & streaks (LeetCode, Codeforces)</li>
              <li className="flex items-center gap-2"><span className="text-electric-green">✓</span> AI notebooks, datasets & model deployments (Kaggle, Hugging Face)</li>
              <li className="flex items-center gap-2"><span className="text-electric-green">✓</span> Cloud hosting pipelines & production logs (Vercel, Netlify, Render)</li>
              <li className="flex items-center gap-2"><span className="text-electric-green">✓</span> Open-source participations & mentor approvals (GSoC, GSSoC)</li>
            </ul>
          </div>
          <div className="lg:col-span-7">
            {/* Coded Widget: Developer Aggregator Panel */}
            <div className="glass rounded-2xl p-6 border border-white/5 relative overflow-hidden h-[420px] flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-electric-green/5 blur-2xl pointer-events-none" />
              
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-electric-green animate-pulse" />
                  <span className="text-[11px] font-mono text-muted uppercase tracking-wider">Multi-Platform Aggregator</span>
                </div>
                <span className="text-[9px] text-electric-green font-mono bg-electric-green/10 border border-electric-green/20 px-2 py-0.5 rounded">SYNC: 11 PLATFORMS OK</span>
              </div>

              <div className="space-y-3 my-auto font-sans max-h-[260px] overflow-y-auto pr-1">
                {/* GitHub */}
                <div className="p-2.5 bg-white/2 rounded-lg border border-white/5 flex justify-between items-center hover:bg-white/3 transition-all">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🐱</span>
                    <div>
                      <h4 className="text-xs font-semibold text-white">GitHub Codebase</h4>
                      <span className="text-[9px] text-muted font-mono">github.com/aryan_gupta</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-electric-green block">420 Commits</span>
                    <span className="text-[8px] text-muted font-mono">18 PRs · 5 repos</span>
                  </div>
                </div>

                {/* GitLab */}
                <div className="p-2.5 bg-white/2 rounded-lg border border-white/5 flex justify-between items-center hover:bg-white/3 transition-all">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🦊</span>
                    <div>
                      <h4 className="text-xs font-semibold text-white">GitLab Repositories</h4>
                      <span className="text-[9px] text-muted font-mono">gitlab.com/aryan_dev</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-orange-400 block">180 Commits</span>
                    <span className="text-[8px] text-muted font-mono">4 CI Pipelines</span>
                  </div>
                </div>

                {/* LeetCode */}
                <div className="p-2.5 bg-white/2 rounded-lg border border-white/5 flex justify-between items-center hover:bg-white/3 transition-all">
                  <div className="flex items-center gap-2">
                    <span className="text-base">💡</span>
                    <div>
                      <h4 className="text-xs font-semibold text-white">LeetCode DSA</h4>
                      <span className="text-[9px] text-muted font-mono">leetcode.com/streak_aryan</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-yellow-500 block">162 Solved</span>
                    <span className="text-[8px] text-muted font-mono">Rating: 1824</span>
                  </div>
                </div>

                {/* Codeforces */}
                <div className="p-2.5 bg-white/2 rounded-lg border border-white/5 flex justify-between items-center hover:bg-white/3 transition-all">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🏆</span>
                    <div>
                      <h4 className="text-xs font-semibold text-white">Codeforces Competitive</h4>
                      <span className="text-[9px] text-muted font-mono">codeforces.com/aryan_gupta</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-red-500 block">1420 Rating</span>
                    <span className="text-[8px] text-muted font-mono">Specialist · 240 Solved</span>
                  </div>
                </div>

                {/* Kaggle */}
                <div className="p-2.5 bg-white/2 rounded-lg border border-white/5 flex justify-between items-center hover:bg-white/3 transition-all">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🧠</span>
                    <div>
                      <h4 className="text-xs font-semibold text-white">Kaggle Data Science</h4>
                      <span className="text-[9px] text-muted font-mono">kaggle.com/aryan_ml</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-blue-400 block">Kaggle Expert</span>
                    <span className="text-[8px] text-muted font-mono">5 Notebooks · 3 Datasets</span>
                  </div>
                </div>

                {/* Hugging Face */}
                <div className="p-2.5 bg-white/2 rounded-lg border border-white/5 flex justify-between items-center hover:bg-white/3 transition-all">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🤗</span>
                    <div>
                      <h4 className="text-xs font-semibold text-white">Hugging Face Models</h4>
                      <span className="text-[9px] text-muted font-mono">huggingface.co/aryan_nlp</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-yellow-400 block">3 Models Shipped</span>
                    <span className="text-[8px] text-muted font-mono">1 Space · 48 Likes</span>
                  </div>
                </div>

                {/* Vercel & Cloud Deployments */}
                <div className="p-2.5 bg-white/2 rounded-lg border border-white/5 flex justify-between items-center hover:bg-white/3 transition-all">
                  <div className="flex items-center gap-2">
                    <span className="text-base">▲</span>
                    <div>
                      <h4 className="text-xs font-semibold text-white">Cloud Hosting Shipments</h4>
                      <span className="text-[9px] text-muted font-mono">Vercel, Netlify, Render</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-cyber-blue block">48 Live Deploys</span>
                    <span className="text-[8px] text-muted font-mono">12 Active projects</span>
                  </div>
                </div>

                {/* Google Summer of Code */}
                <div className="p-2.5 bg-white/2 rounded-lg border border-white/5 flex justify-between items-center hover:bg-white/3 transition-all">
                  <div className="flex items-center gap-2">
                    <span className="text-base">☀️</span>
                    <div>
                      <h4 className="text-xs font-semibold text-white">Google Summer of Code</h4>
                      <span className="text-[9px] text-muted font-mono">GSoC 2025 · PSF Org</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-electric-green block">Completed</span>
                    <span className="text-[8px] text-muted font-mono">Merged Codebase verified</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 pt-3 border-t border-white/5">
                <div className="flex justify-between text-[10px] text-muted font-mono">
                  <span>Aggregating profiles...</span>
                  <span>94.2 Score calculated</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-electric-green to-cyber-blue h-full animate-[progress_3s_infinite_linear]" style={{ width: "100%", backgroundSize: "200% 100%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2: AI Project Verifier */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 order-last lg:order-first">
            {/* Coded Widget: AI Project Verifier Terminal */}
            <div className="glass rounded-2xl p-6 border border-white/5 relative overflow-hidden h-[420px] flex flex-col justify-between text-left font-sans">
              <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-neon-purple/5 blur-2xl pointer-events-none" />
              
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                  <span className="text-[10px] font-mono text-muted ml-2">~/projects/auth-handler.ts</span>
                </div>
                <span className="bg-neon-purple/10 border border-neon-purple/20 text-neon-purple text-[9px] font-mono px-2 py-0.5 rounded animate-pulse">TIMER: 74s</span>
              </div>

              <div className="space-y-3 my-auto">
                <div className="p-3 bg-black/50 rounded-lg border border-white/3 font-mono text-[10px] text-electric-green/80 overflow-hidden leading-relaxed">
                  <span className="text-muted">45 | </span> <span className="text-white">const</span> registerUser = <span className="text-white">async</span> (req, res) =&gt; &#123; <br />
                  <span className="text-muted">46 | </span> &nbsp;&nbsp;const hash = bcrypt.hashSync(req.body.pwd, 10); <br />
                  <span className="text-muted">47 | </span> &nbsp;&nbsp;<span className="text-neon-purple">await db.users.insert(&#123; hash &#125;);</span> <br />
                  <span className="text-muted">48 | </span> &#125;;
                </div>

                <div className="bg-neon-purple/10 border border-neon-purple/20 rounded-xl p-3 text-xs text-text space-y-1 relative">
                  <div className="text-[9px] font-mono text-neon-purple uppercase font-bold">Gemini Audit Prompt</div>
                  <p className="text-[11px] leading-relaxed text-gray-200">
                    &quot;On line 46, you call bcrypt.hashSync. Why is executing crypto sync tasks problematic in Node&apos;s event loop, and how would you resolve it?&quot;
                  </p>
                </div>

                <div className="bg-white/2 border border-white/5 rounded-xl p-3 text-xs text-text space-y-1 relative">
                  <div className="text-[9px] font-mono text-electric-green uppercase font-bold">Developer Answer (Draft)</div>
                  <p className="text-[11px] leading-relaxed text-gray-300 font-mono italic">
                    &quot;Mitigation: Use bcrypt.hash (async version) with callbacks/promises to avoid blocking the main thread during heavy cryptographic operations...&quot;
                  </p>
                </div>
              </div>

              <div className="bg-electric-green/10 border border-electric-green/20 rounded-lg p-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🤖</span>
                  <div>
                    <h4 className="text-[11px] font-bold text-white leading-none">GEMINI AUTOMATED GRADER</h4>
                    <span className="text-[9px] text-muted font-mono">Rubric matching score: 98% accuracy</span>
                  </div>
                </div>
                <span className="bg-electric-green text-obsidian text-[10px] font-mono font-bold px-2 py-0.5 rounded">VERIFIED BADGE UNLOCKED</span>
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs text-neon-purple font-mono uppercase tracking-wider font-semibold bg-neon-purple/10 px-2.5 py-1 rounded">02 · Anti-Cheat Shield</span>
            <h4 className="text-2xl font-heading font-bold text-white leading-tight">AI Project Verifier (Dynamic Auditing)</h4>
            <p className="text-muted text-xs leading-relaxed">
              Eliminate repository plagiarism and copy-paste code submissions. Gemini parses your codebase structure dynamically and prompts the developer with 3 context-aware questions referencing specific line coordinates. Answers are graded automatically against an expected rubric.
            </p>
            <ul className="text-xs text-muted space-y-2 font-mono">
              <li className="flex items-center gap-2"><span className="text-neon-purple">✓</span> 90-second response timers to block chatGPT prompts</li>
              <li className="flex items-center gap-2"><span className="text-neon-purple">✓</span> Browser focus blur & copy-paste event logging</li>
              <li className="flex items-center gap-2"><span className="text-neon-purple">✓</span> Unlocks verified emerald seals on successful vetting</li>
            </ul>
          </div>
        </div>

        {/* Feature 3: VS Code Plugin */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs text-neon-purple font-mono uppercase tracking-wider font-semibold bg-neon-purple/10 px-2.5 py-1 rounded">03 · IDE Workflow</span>
            <h4 className="text-2xl font-heading font-bold text-white leading-tight">VS Code Plugin & Workspace Activity Tracker</h4>
            <p className="text-muted text-xs leading-relaxed">
              Track your work in your native workspace environment. The CodeDNA extension records file edits, active coding periods, and PR reviews. Most importantly, it calculates scores for private repositories without uploading code, preserving enterprise IP.
            </p>
            <ul className="text-xs text-muted space-y-2 font-mono">
              <li className="flex items-center gap-2"><span className="text-neon-purple">✓</span> Real-time score feedback directly in the status bar</li>
              <li className="flex items-center gap-2"><span className="text-neon-purple">✓</span> Local private repository indexing preserving IP</li>
              <li className="flex items-center gap-2"><span className="text-neon-purple">✓</span> Continuous optimization and security alerts as you type</li>
            </ul>
          </div>
          <div className="lg:col-span-7">
            {/* Coded Widget: VS Code Plugin Layout */}
            <div className="glass rounded-2xl p-6 border border-white/5 relative overflow-hidden h-[420px] flex flex-col justify-between font-mono text-[10px]">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-neon-purple/5 blur-2xl pointer-events-none" />
              
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-muted text-[9px] uppercase tracking-wider">VS Code Workspace — codeDNA.ts</span>
                <span className="text-neon-purple text-[9px] font-bold">EXTENSION ACTIVE</span>
              </div>

              {/* IDE Simulator */}
              <div className="grid grid-cols-12 gap-3 my-auto h-[300px]">
                {/* VS Code sidebar mock */}
                <div className="col-span-3 border-r border-white/5 pr-2 space-y-2 text-muted text-[9px] select-none">
                  <div className="font-bold text-white uppercase text-[8px] tracking-wider mb-2">EXPLORER</div>
                  <div className="text-white font-semibold">📁 src/</div>
                  <div className="pl-2">📄 auth.ts</div>
                  <div className="pl-2">📄 db.ts</div>
                  <div className="pl-2 text-neon-purple font-bold">🧬 codeDNA.ts</div>
                  <div className="mt-4 font-bold text-white uppercase text-[8px] tracking-wider mb-2">CodeDNA DNA</div>
                  <div className="text-white font-bold bg-neon-purple/10 p-1.5 rounded border border-neon-purple/20">
                    <span className="block text-[8px]">ACTIVE SCORE</span>
                    <span className="text-[12px] text-neon-purple font-extrabold block mt-0.5">87.4</span>
                    <span className="block text-[7px] text-muted mt-0.5">+1.2 today</span>
                  </div>
                  <div className="mt-2 text-[8px]">
                    <span className="block text-[7px]">STREAK:</span>
                    <span className="text-white font-semibold block">12 Days 🔥</span>
                  </div>
                </div>

                {/* Editor & Hints */}
                <div className="col-span-9 pl-2 space-y-4 flex flex-col justify-between h-full">
                  <div className="bg-black/40 rounded p-3 border border-white/3 text-[9px] text-gray-400 font-mono space-y-1 h-36 overflow-hidden select-none">
                    <div><span className="text-muted">1 |</span> <span className="text-neon-purple">import</span> &#123; hash &#125; <span className="text-neon-purple">from</span> <span className="text-electric-green">&quot;crypto&quot;</span>;</div>
                    <div><span className="text-muted">2 |</span> <span className="text-muted">{"// Audit tracking enabled"}</span></div>
                    <div><span className="text-muted">3 |</span> <span className="text-neon-purple">export const</span> encryptSession = (id: string) =&gt; &#123;</div>
                    <div className="bg-neon-purple/10"><span className="text-muted">4 |</span> &nbsp;&nbsp;<span className="text-neon-purple">const</span> secret = &quot;prod_key_db_v2&quot;;</div>
                    <div><span className="text-muted">5 |</span> &nbsp;&nbsp;<span className="text-neon-purple">return</span> hash(&quot;sha256&quot;, id + secret);</div>
                    <div><span className="text-muted">6 |</span> &#125;;</div>
                  </div>

                  <div className="space-y-2">
                    <div className="bg-coral-red/10 border border-coral-red/20 rounded p-2 text-[9px] text-white flex items-start gap-1.5">
                      <span className="text-coral-red mt-0.5">⚠️</span>
                      <div>
                        <strong className="text-coral-red">Security Warning (line 4):</strong>
                        <p className="text-gray-300 text-[8px]">Hardcoded secret detected. Move to env vars to preserve passport integrity score.</p>
                      </div>
                    </div>

                    <div className="bg-electric-green/10 border border-electric-green/20 rounded p-2 text-[9px] text-white flex items-start gap-1.5">
                      <span className="text-electric-green mt-0.5">💡</span>
                      <div>
                        <strong className="text-electric-green">Optimization Suggestion:</strong>
                        <p className="text-gray-300 text-[8px]">Use asynchronous crypto pbkdf2 implementation for better concurrent processing.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 text-[9px] text-muted text-center">
                Tracked sessions commit directly to score telemetries without exporting source trees.
              </div>
            </div>
          </div>
        </div>

        {/* Feature 4: Real-Work Simulation Engine */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 order-last lg:order-first">
            {/* Coded Widget: Simulation Terminal */}
            <div className="glass rounded-2xl p-6 border border-white/5 relative overflow-hidden h-[420px] flex flex-col justify-between text-left font-mono text-[10px]">
              <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-cyber-blue/5 blur-2xl pointer-events-none" />
              
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                  <span className="text-muted ml-2 text-[9px]">simulation-terminal — zsh</span>
                </div>
                <span className="bg-cyber-blue/10 border border-cyber-blue/20 text-cyber-blue text-[9px] px-2 py-0.5 rounded animate-pulse">CHALLENGE TIME: 14:24</span>
              </div>

              <div className="space-y-3 my-auto bg-black/60 p-4 rounded-xl border border-white/5 h-[300px] overflow-hidden flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="text-muted">[00:02:14] Cloned remote challenge sandbox: <span className="text-white">code-dna/lobby-chat-api</span></div>
                  <div className="text-muted">[00:02:16] Teammate pushed commit to main: <span className="text-coral-red">&quot;Update sockets strategy&quot;</span></div>
                  <div className="text-muted">[00:02:18] Running merge with local branch...</div>
                  <div className="text-coral-red font-bold">CONFLICT (content): Merge conflict in src/lobby.gateway.ts</div>
                  <div className="text-muted">Automatic merge failed; fix conflicts and then commit the result.</div>
                </div>

                <div className="space-y-1.5 border-t border-white/5 pt-3">
                  <div className="text-gray-300">Resolve Conflict in src/lobby.gateway.ts:</div>
                  <div className="bg-white/2 p-2 rounded border border-white/5 text-[9px] text-gray-400 space-y-0.5 font-mono select-none">
                    <div>&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD</div>
                    <div className="text-white font-semibold">this.server.to(room).emit(&apos;message&apos;, data);</div>
                    <div className="text-cyber-blue font-semibold">=======</div>
                    <div className="text-white font-semibold">this.server.in(room).emit(&apos;chat-payload&apos;, &#123; data &#125;);</div>
                    <div>&gt;&gt;&gt;&gt;&gt;&gt;&gt; origin/main</div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[9px]">
                  <span className="text-electric-green animate-pulse">⚡ ACTION NEEDED: Fix conflicts and run compilation checks.</span>
                  <span className="bg-cyber-blue text-white px-2 py-0.5 rounded font-heading font-semibold text-[8px]">SUBMIT RESOLUTION</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 text-[9px] text-muted text-center">
                Evaluates merge resolution, team branch management, and sandbox compilation speed.
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs text-cyber-blue font-mono uppercase tracking-wider font-semibold bg-cyber-blue/10 px-2.5 py-1 rounded">04 · Work Simulation</span>
            <h4 className="text-2xl font-heading font-bold text-white leading-tight">Real-Work Simulation Sandbox Engine</h4>
            <p className="text-muted text-xs leading-relaxed">
              Resumes don&apos;t show how you collaborate. CodeDNA drops you into mock-team sandbox repositories where you resolve merge conflicts, handle production bug fixes under tight timers, and collaborate on GSoC issues.
            </p>
            <ul className="text-xs text-muted space-y-2 font-mono">
              <li className="flex items-center gap-2"><span className="text-cyber-blue">✓</span> Realistic team branch structures and conflict injection</li>
              <li className="flex items-center gap-2"><span className="text-cyber-blue">✓</span> Timed bug-fix puzzles grading compilation and styling</li>
              <li className="flex items-center gap-2"><span className="text-cyber-blue">✓</span> Collaborative sprint metrics mapped to Builder score indexes</li>
            </ul>
          </div>
        </div>

        {/* Feature 5: Dynamic Skill Graph */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs text-electric-green font-mono uppercase tracking-wider font-semibold bg-electric-green/10 px-2.5 py-1 rounded">05 · Dependency Analyzer</span>
            <h4 className="text-2xl font-heading font-bold text-white leading-tight">Telemetry-Driven Dynamic Skill Graph</h4>
            <p className="text-muted text-xs leading-relaxed">
              No more self-declared keyword lists. CodeDNA extracts language syntax, import declarations, and framework structures from your verified repositories, generating an interactive tech map detailing depth, packages, and frameworks.
            </p>
            <ul className="text-xs text-muted space-y-2 font-mono">
              <li className="flex items-center gap-2"><span className="text-electric-green">✓</span> package.json dependency tree parsing & depth analysis</li>
              <li className="flex items-center gap-2"><span className="text-electric-green">✓</span> Framework architecture profiling (e.g. Next.js App Router)</li>
              <li className="flex items-center gap-2"><span className="text-electric-green">✓</span> Auto-updating dependency nodes mapping true technical depth</li>
            </ul>
          </div>
          <div className="lg:col-span-7">
            {/* Coded Widget: Dynamic Skill Graph SVG */}
            <div className="glass rounded-2xl p-6 border border-white/5 relative overflow-hidden h-[420px] flex flex-col justify-between text-left">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-electric-green/5 blur-2xl pointer-events-none" />
              
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-[11px] font-mono text-muted uppercase">Dependency Mapping Telemetries</span>
                <span className="bg-electric-green/10 text-electric-green text-[9px] font-mono px-2 py-0.5 rounded">DEPENDENCY GRAPH</span>
              </div>

              {/* Interactive Node Graph Illustration */}
              <div className="relative h-[300px] flex items-center justify-center select-none">
                <svg className="absolute inset-0 w-full h-full">
                  {/* Connection lines */}
                  <line x1="50%" y1="50%" x2="25%" y2="25%" stroke="rgba(0, 229, 160, 0.2)" strokeWidth="1.5" />
                  <line x1="50%" y1="50%" x2="75%" y2="25%" stroke="rgba(0, 229, 160, 0.2)" strokeWidth="1.5" />
                  <line x1="50%" y1="50%" x2="25%" y2="75%" stroke="rgba(0, 229, 160, 0.2)" strokeWidth="1.5" />
                  <line x1="50%" y1="50%" x2="75%" y2="75%" stroke="rgba(0, 229, 160, 0.2)" strokeWidth="1.5" />
                  
                  <line x1="25%" y1="25%" x2="10%" y2="20%" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />
                  <line x1="75%" y1="25%" x2="90%" y2="20%" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />
                </svg>

                {/* Central Node */}
                <div className="absolute w-24 h-24 rounded-full bg-electric-green/10 border border-electric-green/40 flex flex-col items-center justify-center text-center shadow-[0_0_20px_rgba(0,229,160,0.15)] hover:border-electric-green transition-all cursor-pointer">
                  <span className="text-[10px] font-mono font-bold text-white">TypeScript</span>
                  <span className="text-[8px] text-electric-green font-mono uppercase font-semibold">Core Language</span>
                  <span className="text-[7px] text-muted font-mono mt-0.5">Depth: 94%</span>
                </div>

                {/* Sub-node: Next.js */}
                <div className="absolute top-[12%] left-[15%] p-3 bg-white/2 rounded-lg border border-white/5 flex flex-col items-center justify-center shadow-lg hover:border-cyber-blue transition-all cursor-pointer">
                  <span className="text-[9px] font-bold text-white">Next.js 15</span>
                  <span className="text-[7px] text-cyber-blue font-mono font-semibold">App Router</span>
                </div>

                {/* Sub-node: React */}
                <div className="absolute top-[12%] right-[15%] p-3 bg-white/2 rounded-lg border border-white/5 flex flex-col items-center justify-center shadow-lg hover:border-cyber-blue transition-all cursor-pointer">
                  <span className="text-[9px] font-bold text-white">React 19</span>
                  <span className="text-[7px] text-cyber-blue font-mono font-semibold">Concurrent API</span>
                </div>

                {/* Sub-node: Node.js */}
                <div className="absolute bottom-[12%] left-[15%] p-3 bg-white/2 rounded-lg border border-white/5 flex flex-col items-center justify-center shadow-lg hover:border-neon-purple transition-all cursor-pointer">
                  <span className="text-[9px] font-bold text-white">Node.js API</span>
                  <span className="text-[7px] text-neon-purple font-mono font-semibold">Event Loop</span>
                </div>

                {/* Sub-node: Prisma */}
                <div className="absolute bottom-[12%] right-[15%] p-3 bg-white/2 rounded-lg border border-white/5 flex flex-col items-center justify-center shadow-lg hover:border-neon-purple transition-all cursor-pointer">
                  <span className="text-[9px] font-bold text-white">Prisma ORM</span>
                  <span className="text-[7px] text-neon-purple font-mono font-semibold">PostgreSQL</span>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 text-[10px] text-muted font-mono text-center">
                Interactive skill models update automatically upon indexing code repositories.
              </div>
            </div>
          </div>
        </div>

        {/* Feature 6: AI Resume & Asset Generator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs text-neon-purple font-mono uppercase tracking-wider font-semibold bg-neon-purple/10 px-2.5 py-1 rounded">06 · Asset Builder</span>
            <h4 className="text-2xl font-heading font-bold text-white leading-tight">AI Resume & Web Portfolio Generator</h4>
            <p className="text-muted text-xs leading-relaxed">
              Say goodbye to manual resume formatting. CodeDNA compiles your verified statistics, achievements, commits, and rating points into an ATS-optimized, single-page LaTeX document and modern portfolio page hosted on our subdomains.
            </p>
            <ul className="text-xs text-muted space-y-2 font-mono">
              <li className="flex items-center gap-2"><span className="text-neon-purple">✓</span> PDF/LaTeX resume outputs optimized for screening crawlers</li>
              <li className="flex items-center gap-2"><span className="text-neon-purple">✓</span> Real-time updates corresponding to your current CodeDNA scores</li>
              <li className="flex items-center gap-2"><span className="text-neon-purple">✓</span> Custom hosted web portfolio URLs showing verified seals</li>
            </ul>
          </div>
          <div className="lg:col-span-7">
            {/* Coded Widget: AI Resume Maker */}
            <div className="glass rounded-2xl p-6 border border-white/5 relative overflow-hidden h-[420px] flex flex-col justify-between text-left font-sans">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-neon-purple/5 blur-2xl pointer-events-none" />
              
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-[11px] font-mono text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-neon-purple" />
                  ATS Vetting Asset preview
                </span>
                <span className="text-[9px] text-neon-purple font-mono">FORMAT: LaTeX / PDF</span>
              </div>

              <div className="grid grid-cols-12 gap-4 my-auto items-center">
                <div className="col-span-7 bg-white text-black p-4 rounded border border-gray-300 font-mono text-[6px] space-y-2 select-none h-56 shadow-md">
                  <div className="text-center font-bold text-[8px] uppercase">Aryan Gupta</div>
                  <div className="text-center text-[5px] text-gray-500">github.com/aryangupta · Pune · India</div>
                  <hr className="my-1 border-gray-300" />
                  <div>
                    <div className="font-bold text-[6px] uppercase text-gray-800">VERIFIED CodeDNA Telemetries</div>
                    <div className="flex justify-between mt-1 text-[5px]">
                      <span>Overall score: 94.2 (Top 5%)</span>
                      <span>GitHub commits: 420 (Verified)</span>
                    </div>
                  </div>
                  <div>
                    <div className="font-bold text-[6px] uppercase text-gray-800">TECHNICAL PROJECTS</div>
                    <div className="mt-1">
                      <span className="font-bold">CodeDNA Platform Vetting Engine (TypeScript)</span>
                      <p className="text-[5px] text-gray-600">Built a robust scoring calculator with Express, pgvector, and Gemini Q&A verifications.</p>
                    </div>
                  </div>
                  <div>
                    <div className="font-bold text-[6px] uppercase text-gray-800">EDUCATION</div>
                    <div className="mt-1">
                      <span>Savitribai Phule Pune University · Class of 2026</span>
                    </div>
                  </div>
                </div>

                <div className="col-span-5 text-center space-y-3">
                  <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                    <svg className="absolute w-full h-full transform -rotate-90">
                      <circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,0.03)" strokeWidth="6" fill="transparent" />
                      <circle cx="48" cy="48" r="40" stroke="#A855F7" strokeWidth="6" fill="transparent" 
                              strokeDasharray={251} 
                              strokeDashoffset={251 - (251 * 92) / 100}
                              strokeLinecap="round" />
                    </svg>
                    <div className="z-10">
                      <span className="text-xl font-heading font-extrabold text-white block">92%</span>
                      <span className="text-[8px] text-muted font-mono uppercase block">ATS Score</span>
                    </div>
                  </div>
                  <div className="text-[10px] font-mono leading-tight space-y-1">
                    <span className="text-electric-green block">✓ Keywords: React, Node</span>
                    <span className="text-coral-red block">! Missing: GraphQL, Jest</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 text-[10px] text-muted font-mono text-center">
                Updates dynamically with your profile stats. No manual text entry required.
              </div>
            </div>
          </div>
        </div>

        {/* Feature 7: Salary Prediction Engine */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 order-last lg:order-first">
            {/* Coded Widget: Salary Prediction Engine */}
            <div className="glass rounded-2xl p-6 border border-white/5 relative overflow-hidden h-[420px] flex flex-col justify-between text-left font-sans">
              <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-electric-green/5 blur-2xl pointer-events-none" />
              
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-[11px] font-mono text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-electric-green" />
                  Compensation Telemetries (India-focused)
                </span>
                <span className="text-[9px] text-electric-green font-mono">CURRENCY: INR (₹)</span>
              </div>

              <div className="space-y-4 my-auto">
                <div className="p-3 bg-[#00E5A0]/5 rounded-lg border border-[#00E5A0]/20 flex justify-between items-center">
                  <div>
                    <span className="bg-electric-green/10 text-electric-green text-[9px] px-1.5 py-0.5 rounded font-mono border border-electric-green/20">ELITE BUILDER (SCORE 90+)</span>
                    <h4 className="text-xs font-semibold text-white mt-1.5">Tier-1 Tech MNC / YC Startup</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-white block">₹12 - ₹24 LPA</span>
                    <span className="text-[9px] text-muted font-mono">Internship: ₹40k+/mo</span>
                  </div>
                </div>

                <div className="p-3 bg-cyber-blue/5 rounded-lg border border-cyber-blue/20 flex justify-between items-center">
                  <div>
                    <span className="bg-cyber-blue/10 text-cyber-blue text-[9px] px-1.5 py-0.5 rounded font-mono border border-cyber-blue/20">PRODUCT ENGINEER (SCORE 80-90)</span>
                    <h4 className="text-xs font-semibold text-white mt-1.5">High-Growth Indian Startup</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-white block">₹8 - ₹12 LPA</span>
                    <span className="text-[9px] text-muted font-mono">Internship: ₹25k/mo</span>
                  </div>
                </div>

                <div className="p-3 bg-white/2 rounded-lg border border-white/5 flex justify-between items-center">
                  <div>
                    <span className="bg-white/5 text-muted text-[9px] px-1.5 py-0.5 rounded font-mono border border-white/10">STANDARD BUILDER (SCORE 70-80)</span>
                    <h4 className="text-xs font-semibold text-white mt-1.5">Mid-Market Software House</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-white block">₹5 - ₹8 LPA</span>
                    <span className="text-[9px] text-muted font-mono">Internship: ₹15k/mo</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 text-[10px] text-muted font-mono leading-relaxed text-center">
                Gamified feedback loops motivate candidates to raise scores and unlock higher pay brackets.
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs text-electric-green font-mono uppercase tracking-wider font-semibold bg-electric-green/10 px-2.5 py-1 rounded">07 · Salary Telemetry</span>
            <h4 className="text-2xl font-heading font-bold text-white leading-tight">Salary Prediction Engine (INR/USD)</h4>
            <p className="text-muted text-xs leading-relaxed">
              CodeDNA automatically evaluates developer credentials and benchmarks telemetry ratings against regional hiring markets to predict real-world stipends and package ranges with over 94% accuracy.
            </p>
            <ul className="text-xs text-muted space-y-2 font-mono">
              <li className="flex items-center gap-2"><span className="text-electric-green">✓</span> Real-time benchmark data for Tier-2 and Tier-3 graduates in INR</li>
              <li className="flex items-center gap-2"><span className="text-electric-green">✓</span> Experience-adjusted predictions showing local and global scales</li>
              <li className="flex items-center gap-2"><span className="text-electric-green">✓</span> Skill progression impact insights showing potential package jumps</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Recruiter Platform Features Section */}
      <section id="recruiter-features" className="max-w-6xl mx-auto px-6 py-24 border-t border-white/5 space-y-32 relative z-10">
        
        {/* Section Title */}
        <div className="text-center max-w-lg mx-auto space-y-3">
          <span className="bg-cyber-blue/10 text-cyber-blue border border-cyber-blue/20 text-[10px] uppercase font-mono font-semibold px-2.5 py-1 rounded">B2B Recruitment Console</span>
          <h3 className="text-4xl font-heading font-extrabold text-white">Recruiter Vetting & Talent Features</h3>
          <p className="text-muted text-xs">A comprehensive workflow for corporate hiring partners to source, vet, and close engineering talent.</p>
        </div>

        {/* Recruiter Feature 1: Anonymized Talent Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs text-cyber-blue font-mono uppercase tracking-wider font-semibold bg-cyber-blue/10 px-2.5 py-1 rounded">01 · Talent Sourcing</span>
            <h4 className="text-2xl font-heading font-bold text-white leading-tight">Blind Hidden Talent Sourcing Feed</h4>
            <p className="text-muted text-xs leading-relaxed">
              Filter candidates 100% based on code telemetry and verified builder metrics. By hiding names, genders, and college brands, CodeDNA filters bias and lets you surface hidden gems from Tier-2/3 institutes based on proof of construction.
            </p>
            <ul className="text-xs text-muted space-y-2 font-mono">
              <li className="flex items-center gap-2"><span className="text-cyber-blue">✓</span> Filter by overall score, DSA ratings, or PR count</li>
              <li className="flex items-center gap-2"><span className="text-cyber-blue">✓</span> Complete anonymization of resumes during screening</li>
              <li className="flex items-center gap-2"><span className="text-cyber-blue">✓</span> Direct routing to verified passport pages</li>
            </ul>
          </div>
          <div className="lg:col-span-7">
            {/* Coded Widget: Hidden Talent Sourcing Card */}
            <div className="glass rounded-2xl p-6 border border-white/5 relative overflow-hidden h-[380px] flex flex-col justify-between text-left">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-cyber-blue/5 blur-2xl pointer-events-none" />
              
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-[11px] font-mono text-muted uppercase">Anonymized Candidate Stream</span>
                <span className="bg-electric-green/10 text-electric-green text-[9px] font-mono px-2 py-0.5 rounded border border-electric-green/20">BLIND FEED ACTIVE</span>
              </div>

              <div className="space-y-4 my-auto font-sans">
                <div className="p-4 bg-[#eaeaea]/5 rounded-lg border border-white/5 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-700 animate-pulse" />
                      <span className="text-xs font-mono font-bold text-white">Candidate #204B7</span>
                    </div>
                    <span className="text-xs text-electric-green font-mono font-bold">92.4 Score (Top 3%)</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-muted">
                    <span>Commits: 310</span>
                    <span>LeetCode: 142</span>
                    <span>Deploys: 12</span>
                  </div>
                  <p className="text-[11px] text-gray-300 font-mono italic bg-black/30 p-2.5 rounded border border-white/3">
                    &quot;Built a real-time multiplayer WebRTC canvas lobby with NestJS and Redis socket adapters.&quot;
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 text-[10px] text-muted font-mono text-center">
                Prevents recruiter resume-brand screening filters, surfacing actual skills.
              </div>
            </div>
          </div>
        </div>

        {/* Recruiter Feature 2: Recruiter Trust Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 order-last lg:order-first">
            {/* Coded Widget: Recruiter Trust Dashboard Card */}
            <div className="glass rounded-2xl p-6 border border-white/5 relative overflow-hidden h-[380px] flex flex-col justify-between text-left">
              <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-neon-purple/5 blur-2xl pointer-events-none" />
              
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-[11px] font-mono text-muted uppercase">Candidate Trust telemetry</span>
                <span className="bg-cyber-blue/10 text-cyber-blue text-[9px] font-mono px-2 py-0.5 rounded">AUTHENTICATION AUDIT</span>
              </div>

              <div className="space-y-4 my-auto font-sans">
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted">Authorship Verification Confidence</span>
                    <span className="font-semibold text-white">98% (High Trust)</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/3 rounded-full overflow-hidden">
                    <div className="bg-electric-green h-full" style={{ width: "98%" }} />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted">Repository Plagiarism Check</span>
                    <span className="font-semibold text-white">0% Duplicated Code</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/3 rounded-full overflow-hidden">
                    <div className="bg-electric-green h-full" style={{ width: "0%" }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted">Commit Frequency Pattern</span>
                    <span className="font-semibold text-white">Consistent (No purchase anomaly)</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/3 rounded-full overflow-hidden">
                    <div className="bg-cyber-blue h-full" style={{ width: "85%" }} />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 text-[10px] text-muted font-mono text-center">
                AI logs keyboard dynamics, authorship trends, and code similarity checks.
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs text-neon-purple font-mono uppercase tracking-wider font-semibold bg-neon-purple/10 px-2.5 py-1 rounded">02 · Vetting Logs</span>
            <h4 className="text-2xl font-heading font-bold text-white leading-tight">Comprehensive Candidate Trust Panel</h4>
            <p className="text-muted text-xs leading-relaxed">
              Every vetted passport surfaces project quality scores, DSA ratings, repository plagiarism markers, and dynamic verification trust values. Screen candidates with complete confidence in under 30 seconds.
            </p>
            <ul className="text-xs text-muted space-y-2 font-mono">
              <li className="flex items-center gap-2"><span className="text-neon-purple">✓</span> Detailed AI questions response grading report</li>
              <li className="flex items-center gap-2"><span className="text-neon-purple">✓</span> Automated commit footprint patterns and reviews profiling</li>
              <li className="flex items-center gap-2"><span className="text-neon-purple">✓</span> 0% plagiarism guarantees for verified badges</li>
            </ul>
          </div>
        </div>

        {/* Recruiter Feature 3: Company Skill Tests */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs text-cyber-blue font-mono uppercase tracking-wider font-semibold bg-cyber-blue/10 px-2.5 py-1 rounded">03 · Customized Tests</span>
            <h4 className="text-2xl font-heading font-bold text-white leading-tight">White-Labeled Skill Test Pipelines</h4>
            <p className="text-muted text-xs leading-relaxed">
              Replace standard generic code tests with real-world simulation assessments customized to your actual engineering stack (e.g. React Test, Node API test). Candidates completing your test automatically route to your hiring pipeline.
            </p>
            <ul className="text-xs text-muted space-y-2 font-mono">
              <li className="flex items-center gap-2"><span className="text-cyber-blue">✓</span> Custom repositories with pre-configured bugs to resolve</li>
              <li className="flex items-center gap-2"><span className="text-cyber-blue">✓</span> Automatic grading of PR solutions and styling</li>
              <li className="flex items-center gap-2"><span className="text-cyber-blue">✓</span> Company-branded badges shown on verified user passports</li>
            </ul>
          </div>
          <div className="lg:col-span-7">
            {/* Coded Widget: Company Skill Tests Card */}
            <div className="glass rounded-2xl p-6 border border-white/5 relative overflow-hidden h-[380px] flex flex-col justify-between text-left font-sans">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-cyber-blue/5 blur-2xl pointer-events-none" />
              
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-[11px] font-mono text-muted uppercase">White-Labeled evaluation panel</span>
                <span className="bg-electric-green/10 text-electric-green text-[9px] font-mono px-2 py-0.5 rounded">CUSTOM PIPELINE</span>
              </div>

              <div className="space-y-4 my-auto">
                <h4 className="text-xs font-semibold text-white font-sans">Active Evaluations:</h4>
                <div className="p-3 bg-white/2 rounded-lg border border-white/5 flex justify-between items-center">
                  <div>
                    <h5 className="text-xs font-bold text-white">React Native Mobile Test</h5>
                    <span className="text-[9px] text-muted font-mono">3 bug-fixes · Timer 45 mins</span>
                  </div>
                  <span className="text-xs font-mono text-cyber-blue">18 Candidates active</span>
                </div>
                <div className="p-3 bg-white/2 rounded-lg border border-white/5 flex justify-between items-center">
                  <div>
                    <h5 className="text-xs font-bold text-white">Node API Dockerization Test</h5>
                    <span className="text-[9px] text-muted font-mono">CI/CD deployment · Timer 60 mins</span>
                  </div>
                  <span className="text-xs font-mono text-cyber-blue">9 Candidates active</span>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 text-[10px] text-muted font-mono text-center">
                Allows startups to evaluate builders on real-world stacks.
              </div>
            </div>
          </div>
        </div>

        {/* Recruiter Feature 4: Enterprise ATS & B2B Integrations */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 order-last lg:order-first">
            {/* Coded Widget: B2B Integration Map */}
            <div className="glass rounded-2xl p-6 border border-white/5 relative overflow-hidden h-[380px] flex flex-col justify-between text-left font-sans">
              <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-electric-green/5 blur-2xl pointer-events-none" />
              
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-[11px] font-mono text-muted uppercase">B2B Integration Gateway</span>
                <span className="bg-electric-green/10 text-electric-green text-[9px] font-mono px-2 py-0.5 rounded">CONNECTED</span>
              </div>

              <div className="space-y-4 my-auto text-center font-sans">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-white/3 rounded-lg border border-white/5 flex flex-col items-center justify-center">
                    <span className="text-lg">📦</span>
                    <span className="text-[10px] font-bold text-white font-mono mt-2">Keka ATS</span>
                  </div>
                  <div className="p-3 bg-white/3 rounded-lg border border-white/5 flex flex-col items-center justify-center">
                    <span className="text-lg">💼</span>
                    <span className="text-[10px] font-bold text-white font-mono mt-2">Darwinbox</span>
                  </div>
                  <div className="p-3 bg-white/3 rounded-lg border border-white/5 flex flex-col items-center justify-center">
                    <span className="text-lg">👔</span>
                    <span className="text-[10px] font-bold text-white font-mono mt-2">GreytHR</span>
                  </div>
                </div>
                <p className="text-[11px] text-muted font-mono mt-4">
                  Candidates metadata and verification audits flow directly into your existing enterprise HR tools.
                </p>
              </div>

              <div className="pt-3 border-t border-white/5 text-[10px] text-muted font-mono text-center">
                DPDP Act compliant and India-first residency guarantees.
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs text-electric-green font-mono uppercase tracking-wider font-semibold bg-electric-green/10 px-2.5 py-1 rounded">04 · HR Tech Sync</span>
            <h4 className="text-2xl font-heading font-bold text-white leading-tight">Native Indian Enterprise ATS Integrations</h4>
            <p className="text-muted text-xs leading-relaxed">
              Integrate candidates directly with your existing corporate ATS systems. CodeDNA supports GreytHR, Keka, and Darwinbox out of the box, with Greenhouse and Lever plugins for MNCs.
            </p>
            <ul className="text-xs text-muted space-y-2 font-mono">
              <li className="flex items-center gap-2"><span className="text-electric-green">✓</span> No manual exporting or CSV imports needed</li>
              <li className="flex items-center gap-2"><span className="text-electric-green">✓</span> India-based ap-south-1 data storage complying with DPDP regulations</li>
              <li className="flex items-center gap-2"><span className="text-electric-green">✓</span> Automated matching alerts inside recruiter Slack channels</li>
            </ul>
          </div>
        </div>

        {/* Recruiter Feature 5: Bi-directional Vetted Marketplace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs text-cyber-blue font-mono uppercase tracking-wider font-semibold bg-cyber-blue/10 px-2.5 py-1 rounded">05 · Hiring Flow</span>
            <h4 className="text-2xl font-heading font-bold text-white leading-tight">Bi-Directional Skill-Match Marketplace</h4>
            <p className="text-muted text-xs leading-relaxed">
              Cut out resume spam entirely. Recruiters publish positions directly mapped to a skill DNA vector signature. Candidates matching the profile above thresholds receive instant notifications to apply with one click, submitting their verified credentials instead of a text file.
            </p>
            <ul className="text-xs text-muted space-y-2 font-mono">
              <li className="flex items-center gap-2"><span className="text-cyber-blue">✓</span> Direct matchmaking avoiding recruiter review delays</li>
              <li className="flex items-center gap-2"><span className="text-cyber-blue">✓</span> Auto-filtering based on verified project and DSA benchmarks</li>
              <li className="flex items-center gap-2"><span className="text-cyber-blue">✓</span> 80% higher interview booking rates vs standard cold-reach</li>
            </ul>
          </div>
          <div className="lg:col-span-7">
            {/* Coded Widget: Marketplace Pipeline Mock */}
            <div className="glass rounded-2xl p-6 border border-white/5 relative overflow-hidden h-[380px] flex flex-col justify-between text-left font-sans">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-cyber-blue/5 blur-2xl pointer-events-none" />
              
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-[11px] font-mono text-muted uppercase">Matched Job Pipeline</span>
                <span className="bg-electric-green/10 text-electric-green text-[9px] font-mono px-2 py-0.5 rounded border border-electric-green/20">4 ACTIVE MATCHES</span>
              </div>

              <div className="space-y-3 my-auto">
                <div className="p-3 bg-white/2 rounded-lg border border-white/5 flex justify-between items-center">
                  <div>
                    <span className="text-[8px] text-cyber-blue font-mono font-bold uppercase block">RAZORPAY INDIA</span>
                    <h5 className="text-xs font-bold text-white mt-0.5">Senior Product Engineer (React/Postgres)</h5>
                    <span className="text-[9px] text-muted font-mono">₹16 - ₹22 LPA · Hybrid (Bengaluru)</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-electric-green block">94% Match</span>
                    <span className="text-[8px] text-muted font-mono block">Apply with Passport</span>
                  </div>
                </div>

                <div className="p-3 bg-white/2 rounded-lg border border-white/5 flex justify-between items-center">
                  <div>
                    <span className="text-[8px] text-cyber-blue font-mono font-bold uppercase block">CRED</span>
                    <h5 className="text-xs font-bold text-white mt-0.5">Backend Core Builder (Node/Redis)</h5>
                    <span className="text-[9px] text-muted font-mono">₹18 - ₹24 LPA · Remote (India)</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-electric-green block">91% Match</span>
                    <span className="text-[8px] text-muted font-mono block">Apply with Passport</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 text-[10px] text-muted font-mono text-center">
                Matches are automatically calculated using cosine similarity matching embeddings.
              </div>
            </div>
          </div>
        </div>

        {/* Recruiter Feature 6: Multi-layer Plagiarism & Fraud Detection */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 order-last lg:order-first">
            {/* Coded Widget: Fraud Prevention Monitor */}
            <div className="glass rounded-2xl p-6 border border-white/5 relative overflow-hidden h-[380px] flex flex-col justify-between text-left font-sans">
              <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-neon-purple/5 blur-2xl pointer-events-none" />
              
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-[11px] font-mono text-muted uppercase">Fraud Prevention Shield</span>
                <span className="bg-electric-green/10 text-electric-green text-[9px] font-mono px-2 py-0.5 rounded border border-electric-green/20">MONITOR ACTIVE</span>
              </div>

              <div className="space-y-3.5 my-auto font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted">🛡️ Commit Fingerprint Dynamic Match:</span>
                  <span className="text-electric-green font-bold">99.4% (Pass)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted">📊 Contribution Graph Patterns Profile:</span>
                  <span className="text-electric-green font-bold">Consistent (No purchase flags)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted">🔍 Tutorial Repository Similarity Audit:</span>
                  <span className="text-electric-green font-bold">0% matches (Unique)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted">🤖 AI Copilot Assistive Code Ratio:</span>
                  <span className="text-cyber-blue font-bold">12.5% (Approved)</span>
                </div>
                
                <div className="p-2.5 bg-electric-green/5 border border-electric-green/25 rounded-lg text-[10px] text-center text-electric-green mt-2">
                  ✓ VERIFICATION CONFIDENCE SEAL SECURE (PLATINUM RATED)
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 text-[10px] text-muted font-mono text-center">
                Protects from bot-generated profiles, tutorial cloning, and purchased credentials.
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs text-neon-purple font-mono uppercase tracking-wider font-semibold bg-neon-purple/10 px-2.5 py-1 rounded">06 · Fraud Security</span>
            <h4 className="text-2xl font-heading font-bold text-white leading-tight">Multi-Layer Plagiarism & Account Fraud Guard</h4>
            <p className="text-muted text-xs leading-relaxed">
              Trust is the backbone of CodeDNA. We continuously audit user submissions against keyboard typing dynamics during code tasks, tutorial repository signatures, and AI-generated text thresholds to isolate bad actors.
            </p>
            <ul className="text-xs text-muted space-y-2 font-mono">
              <li className="flex items-center gap-2"><span className="text-neon-purple">✓</span> Identifies and rejects bot contribution graph templates</li>
              <li className="flex items-center gap-2"><span className="text-neon-purple">✓</span> Flags code matching popular YouTube/GitHub tutorials</li>
              <li className="flex items-center gap-2"><span className="text-neon-purple">✓</span> AST-level comparison blocking minor naming edits</li>
            </ul>
          </div>
        </div>

        {/* Recruiter Feature 7: Placement Cell B2B Administrative Console */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs text-cyber-blue font-mono uppercase tracking-wider font-semibold bg-cyber-blue/10 px-2.5 py-1 rounded">07 · College Admin Portal</span>
            <h4 className="text-2xl font-heading font-bold text-white leading-tight">Placement Cell B2B Administrative Console</h4>
            <p className="text-muted text-xs leading-relaxed">
              Equip college Training & Placement Officers (TPOs) with robust analytics tools. Bulk-onboard batches of engineering students, track verification metrics, and manage partner corporate recruiter funnels natively.
            </p>
            <ul className="text-xs text-muted space-y-2 font-mono">
              <li className="flex items-center gap-2"><span className="text-cyber-blue">✓</span> Class-wide statistics dashboard showing avg vetting scores</li>
              <li className="flex items-center gap-2"><span className="text-cyber-blue">✓</span> Direct talent pipelines for corporate recruiting partners</li>
              <li className="flex items-center gap-2"><span className="text-cyber-blue">✓</span> Verified performance matrices reducing hiring turnaround times</li>
            </ul>
          </div>
          <div className="lg:col-span-7">
            {/* Coded Widget: B2B Placement Portal */}
            <div className="glass rounded-2xl p-6 border border-white/5 relative overflow-hidden h-[420px] flex flex-col justify-between text-left font-sans">
              <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-cyber-blue/5 blur-2xl pointer-events-none" />
              
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-[11px] font-mono text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyber-blue" />
                  College placement Analytics Dashboard
                </span>
                <span className="text-[9px] text-cyber-blue font-mono">TPO CONSOLE · ACTIVE</span>
              </div>

              <div className="space-y-4 my-auto">
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 bg-white/2 rounded-lg border border-white/5 text-center">
                    <span className="text-[9px] font-mono text-muted uppercase block">Graduates</span>
                    <span className="text-base font-heading font-extrabold text-white block">420 Students</span>
                  </div>
                  <div className="p-2 bg-white/2 rounded-lg border border-white/5 text-center">
                    <span className="text-[9px] font-mono text-muted uppercase block">Placement</span>
                    <span className="text-base font-heading font-extrabold text-electric-green block">94.2%</span>
                  </div>
                  <div className="p-2 bg-white/2 rounded-lg border border-white/5 text-center">
                    <span className="text-[9px] font-mono text-muted uppercase block">Avg Package</span>
                    <span className="text-base font-heading font-extrabold text-cyber-blue block">₹8.4 LPA</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[10px] text-muted font-mono uppercase">Top Placement Pipelines</h4>
                  <div className="p-2 bg-black/30 rounded border border-white/3 flex justify-between items-center text-xs text-white">
                    <span>Google India</span>
                    <span className="font-mono text-electric-green font-semibold">14 Placed</span>
                  </div>
                  <div className="p-2 bg-black/30 rounded border border-white/3 flex justify-between items-center text-xs text-white">
                    <span>Razorpay</span>
                    <span className="font-mono text-electric-green font-semibold">28 Placed</span>
                  </div>
                  <div className="p-2 bg-black/30 rounded border border-white/3 flex justify-between items-center text-xs text-white">
                    <span>Cred</span>
                    <span className="font-mono text-electric-green font-semibold">9 Placed</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 text-[10px] text-muted font-mono text-center">
                Provides colleges and TPOs structural analytics and unified B2B placement streams.
              </div>
            </div>
          </div>
        </div>

        {/* Recruiter Feature 8: Vibe Hiring Semantic Matching Engine */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 order-last lg:order-first">
            {/* Coded Widget: Vibe Hiring Search Panel */}
            <div className="glass rounded-2xl p-6 border border-white/5 relative overflow-hidden h-[420px] flex flex-col justify-between text-left font-sans">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-cyber-blue/5 blur-2xl pointer-events-none" />
              
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-[11px] font-mono text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyber-blue" />
                  Semantic Recruitment Matcher
                </span>
                <span className="text-[9px] text-cyber-blue font-mono">pgvector stores: 18,240 tokens</span>
              </div>

              <div className="space-y-4 my-auto">
                <div className="bg-surface border border-white/5 rounded-lg p-3 text-xs text-white flex items-center gap-2">
                  <span className="text-muted font-mono">🔍</span>
                  <span className="font-mono text-gray-200">&quot;Looking for a React developer with Next.js experience who has built production CI/CD pipelines&quot;</span>
                </div>

                <div className="space-y-3 font-sans">
                  <div className="p-3 bg-[#eaeaea]/5 rounded-lg border border-white/5 flex justify-between items-center hover:border-cyber-blue/40 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-electric-green/20 border border-electric-green/30 flex items-center justify-center text-xs font-bold text-electric-green font-mono">AG</div>
                      <div>
                        <h4 className="text-xs font-semibold text-white">Aryan Gupta</h4>
                        <span className="text-[9px] text-muted font-mono">Pune Tech Institute · Tier-2</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-electric-green block">94.2 Score</span>
                      <span className="text-[9px] text-cyber-blue font-mono font-semibold">98.6% Similarity Match</span>
                    </div>
                  </div>

                  <div className="p-3 bg-[#eaeaea]/5 rounded-lg border border-white/5 flex justify-between items-center hover:border-cyber-blue/40 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-cyber-blue/20 border border-cyber-blue/30 flex items-center justify-center text-xs font-bold text-cyber-blue font-mono">AS</div>
                      <div>
                        <h4 className="text-xs font-semibold text-white">Amrita Singh</h4>
                        <span className="text-[9px] text-muted font-mono">Nagpur Tech College · Tier-3</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-electric-green block">88.5 Score</span>
                      <span className="text-[9px] text-cyber-blue font-mono font-semibold">92.4% Similarity Match</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 text-center text-[10px] text-muted font-mono">
                Recruiters match semantic queries directly with embedded developer passports.
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs text-cyber-blue font-mono uppercase tracking-wider font-semibold bg-cyber-blue/10 px-2.5 py-1 rounded">08 · Semantic Search</span>
            <h4 className="text-2xl font-heading font-bold text-white leading-tight">Vibe Hiring Semantic Matching Engine</h4>
            <p className="text-muted text-xs leading-relaxed">
              Describe your ideal candidate profile in plain conversational language. CodeDNA embeds the query using Gemini and scans PostgreSQL vector stores, matching candidates by skill alignment and **ranking them in descending order by overall CodeDNA score**.
            </p>
            <ul className="text-xs text-muted space-y-2 font-mono">
              <li className="flex items-center gap-2"><span className="text-cyber-blue">✓</span> Cosine similarity matching above threshold parameters</li>
              <li className="flex items-center gap-2"><span className="text-cyber-blue">✓</span> Ranks qualified developers by overall score first</li>
              <li className="flex items-center gap-2"><span className="text-cyber-blue">✓</span> Highlights match confidence metrics in recruiter console</li>
            </ul>
          </div>
        </div>

      </section>

      {/* Comparative Vetting Section (Stripped Company Names) */}
      <section id="compare" className="max-w-6xl mx-auto px-6 py-20 border-t border-white/5 relative z-10">
        <div className="text-center max-w-lg mx-auto space-y-4 mb-16">
          <h3 className="text-3xl font-heading font-extrabold text-white">Competitive Vetting Landscape</h3>
          <p className="text-muted text-xs">How CodeDNA compares to legacy screening approaches and traditional job boards.</p>
        </div>

        <div className="glass rounded-xl border border-white/5 overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-white/2 border-b border-white/5 text-muted uppercase font-mono text-[10px] tracking-wider">
                <th className="p-4">Feature</th>
                <th className="p-4 text-electric-green font-bold">CodeDNA</th>
                <th className="p-4 font-normal">Legacy Vetting Platforms</th>
                <th className="p-4 font-normal">Traditional Job Boards</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr>
                <td className="p-4 font-semibold text-white">AI Code Authorship Verification</td>
                <td className="p-4 text-electric-green">✓ Core feature</td>
                <td className="p-4 text-muted">✗ (Scraping only)</td>
                <td className="p-4 text-muted">✗</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-white">Multi-Platform Signals (LeetCode, Vercel)</td>
                <td className="p-4 text-electric-green">✓ Full integration</td>
                <td className="p-4 text-muted">✗ (Single source only)</td>
                <td className="p-4 text-muted">~ (Self-declared only)</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-white">Placement Cell B2B Portal</td>
                <td className="p-4 text-electric-green">✓ Yes</td>
                <td className="p-4 text-muted">✗</td>
                <td className="p-4 text-muted">✗</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-white">Enterprise ATS Integrations (Keka, Darwinbox)</td>
                <td className="p-4 text-electric-green">✓ Yes</td>
                <td className="p-4 text-muted">✗</td>
                <td className="p-4 text-muted">~ (Basic)</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-white">Local Currency Telemetries (INR)</td>
                <td className="p-4 text-electric-green">✓ Yes</td>
                <td className="p-4 text-muted">✗ (USD only)</td>
                <td className="p-4 text-muted">~ (Basic)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Moats Strategy Section */}
      <section id="moats" className="max-w-6xl mx-auto px-6 py-20 border-t border-white/5 relative z-10">
        <div className="text-center max-w-lg mx-auto space-y-4 mb-16">
          <span className="bg-electric-green/10 text-electric-green border border-electric-green/20 text-[10px] uppercase font-mono font-semibold px-2.5 py-1 rounded">Defensive Strategy</span>
          <h3 className="text-3xl font-heading font-extrabold text-white">Compounding Platform Moats</h3>
          <p className="text-muted text-xs">Why CodeDNA remains structurally uncopyable compared to generic code scrapers.</p>
        </div>

        <div className="space-y-4 font-sans text-xs">
          {/* Layer 1 */}
          <div className="glass rounded-xl p-5 border border-white/5 border-l-4 border-coral-red flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex gap-4 items-center">
              <span className="text-[10px] font-mono text-muted uppercase">Layer 1</span>
              <div>
                <h4 className="text-sm font-semibold text-white">Multi-Platform Scraping & Indexing</h4>
                <p className="text-[10px] text-muted mt-0.5">Baseline aggregation of public GitHub/LeetCode stats. (Low Barrier to Entry)</p>
              </div>
            </div>
            <span className="bg-coral-red/10 text-coral-red text-[9px] font-mono font-bold px-2 py-0.5 rounded border border-coral-red/20 uppercase">Baseline Moat</span>
          </div>

          {/* Layer 2 */}
          <div className="glass rounded-xl p-5 border border-white/5 border-l-4 border-yellow-500 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex gap-4 items-center">
              <span className="text-[10px] font-mono text-muted uppercase">Layer 2</span>
              <div>
                <h4 className="text-sm font-semibold text-white">AI Project Verifier & Grader (Anti-Cheat)</h4>
                <p className="text-[10px] text-muted mt-0.5">Context-aware, specific codebase questioning which blocks tutorial cloning and copypasting.</p>
              </div>
            </div>
            <span className="bg-yellow-500/10 text-yellow-500 text-[9px] font-mono font-bold px-2 py-0.5 rounded border border-yellow-500/20 uppercase">Medium Moat</span>
          </div>

          {/* Layer 3 */}
          <div className="glass rounded-xl p-5 border border-white/5 border-l-4 border-cyber-blue flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex gap-4 items-center">
              <span className="text-[10px] font-mono text-muted uppercase">Layer 3</span>
              <div>
                <h4 className="text-sm font-semibold text-white">VS Code Plugin Workflow Lock-in</h4>
                <p className="text-[10px] text-muted mt-0.5">Continuous local indexer and score updates in the daily workspace. Leaving means losing months of history.</p>
              </div>
            </div>
            <span className="bg-cyber-blue/10 text-cyber-blue text-[9px] font-mono font-bold px-2 py-0.5 rounded border border-cyber-blue/20 uppercase">Strong Moat</span>
          </div>

          {/* Layer 4 */}
          <div className="glass rounded-xl p-5 border border-white/5 border-l-4 border-electric-green flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex gap-4 items-center">
              <span className="text-[10px] font-mono text-muted uppercase">Layer 4</span>
              <div>
                <h4 className="text-sm font-semibold text-white">Hiring Outcome Optimization Loop</h4>
                <p className="text-[10px] text-muted mt-0.5">Vector matching weights adjust automatically using placed candidates&apos; 90-day retention and performance evaluations.</p>
              </div>
            </div>
            <span className="bg-electric-green/10 text-electric-green text-[9px] font-mono font-bold px-2 py-0.5 rounded border border-electric-green/20 uppercase">Very Strong Moat</span>
          </div>

          {/* Layer 5 */}
          <div className="glass rounded-xl p-5 border border-white/5 border-l-4 border-neon-purple flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex gap-4 items-center">
              <span className="text-[10px] font-mono text-muted uppercase">Layer 5</span>
              <div>
                <h4 className="text-sm font-semibold text-white">Institutional Placement Cell Partnerships</h4>
                <p className="text-[10px] text-muted mt-0.5">Exclusive, signed contracts with 500+ Indian Tier-2 and Tier-3 universities bulk onboarding students.</p>
              </div>
            </div>
            <span className="bg-neon-purple/10 text-neon-purple text-[9px] font-mono font-bold px-2 py-0.5 rounded border border-neon-purple/20 uppercase">Structural Moat</span>
          </div>
        </div>
      </section>



      {/* Monetization Section */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-20 border-t border-white/5 relative z-10">
        <div className="text-center max-w-lg mx-auto space-y-4 mb-16">
          <span className="bg-neon-purple/10 text-neon-purple border border-neon-purple/20 text-[10px] uppercase font-mono font-semibold px-2.5 py-1 rounded">Pricing structure</span>
          <h3 className="text-3xl font-heading font-extrabold text-white">Transparent Pricing Model</h3>
          <p className="text-muted text-xs">Scaling pricing frameworks tailored to student job seekers, startups, and enterprise companies.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch mb-16 text-left font-sans">
          
          {/* Card 1: Students */}
          <div className="glass rounded-xl p-6 border border-white/5 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-[9px] font-mono text-muted uppercase block">Developer Core</span>
              <h4 className="text-xl font-heading font-extrabold text-white">₹0 <span className="text-xs text-muted font-normal font-sans">/ forever</span></h4>
              <p className="text-[10px] text-muted leading-relaxed">Free access to create verified passports and sync profile data.</p>
              <ul className="space-y-2 text-[10px] text-gray-300 font-mono">
                <li>• Multi-Platform Aggregation</li>
                <li>• 3 AI Project Verifications/mo</li>
                <li>• Public Vetted Passport URL</li>
                <li>• Salary Prediction Benchmark</li>
              </ul>
            </div>
            <button onClick={() => openAuth("DEVELOPER", false)} className="w-full py-2 bg-white/5 hover:bg-white/10 text-white rounded text-[10px] font-mono mt-6 border border-white/10 transition-all cursor-pointer">
              Register Free Profile
            </button>
          </div>

          {/* Card 2: Student Premium */}
          <div className="glass rounded-xl p-6 border border-white/5 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-[9px] font-mono text-neon-purple uppercase block">Developer Pro</span>
              <h4 className="text-xl font-heading font-extrabold text-white">₹199 <span className="text-xs text-muted font-normal font-sans">/ month</span></h4>
              <p className="text-[10px] text-muted leading-relaxed">For serious graduates hunting top-tier placement opportunities.</p>
              <ul className="space-y-2 text-[10px] text-gray-300 font-mono">
                <li>• Unlimited Repository Audits</li>
                <li>• Auto-Generated LaTeX Resumes</li>
                <li>• Simulated Mock Interviews</li>
                <li>• Priority Sourcing Feed Visibility</li>
              </ul>
            </div>
            <button onClick={() => openAuth("DEVELOPER", false)} className="w-full py-2 bg-neon-purple/20 hover:bg-neon-purple/30 text-neon-purple rounded text-[10px] font-mono mt-6 border border-neon-purple/35 transition-all cursor-pointer">
              Go Pro Seeking
            </button>
          </div>

          {/* Card 3: Recruiter/Startup */}
          <div className="glass rounded-xl p-6 border border-cyber-blue/30 flex flex-col justify-between bg-cyber-blue/2">
            <div className="space-y-4">
              <span className="text-[9px] font-mono text-cyber-blue uppercase block">Startup SaaS</span>
              <h4 className="text-xl font-heading font-extrabold text-white">₹5,000 <span className="text-xs text-muted font-normal font-sans">/ month</span></h4>
              <p className="text-[10px] text-muted leading-relaxed">For engineering teams looking to recruit and screen verified developers.</p>
              <ul className="space-y-2 text-[10px] text-gray-300 font-mono">
                <li>• 100 Candidate unlocks/mo</li>
                <li>• Blind Search Filters</li>
                <li>• White-Labeled Test Builder</li>
                <li>• Direct Candidate Messaging</li>
              </ul>
            </div>
            <button onClick={() => openAuth("RECRUITER", false)} className="w-full py-2 bg-cyber-blue hover:bg-cyber-blue/90 text-white rounded text-[10px] font-heading font-semibold mt-6 transition-all cursor-pointer">
              Start Sourcing
            </button>
          </div>

          {/* Card 4: Enterprise */}
          <div className="glass rounded-xl p-6 border border-white/5 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-[9px] font-mono text-electric-green uppercase block">Enterprise Sync</span>
              <h4 className="text-xl font-heading font-extrabold text-white">₹20,000+ <span className="text-xs text-muted font-normal font-sans">/ month</span></h4>
              <p className="text-[10px] text-muted leading-relaxed">For large HR departments syncing with high-volume pipelines.</p>
              <ul className="space-y-2 text-[10px] text-gray-300 font-mono">
                <li>• Unlimited Candidate unlocks</li>
                <li>• GreytHR, Keka ATS Sync</li>
                <li>• Custom grading rubrics</li>
                <li>• Multi-Seat SSO admin accounts</li>
              </ul>
            </div>
            <button onClick={() => openAuth("RECRUITER", false)} className="w-full py-2 bg-white/5 hover:bg-white/10 text-white rounded text-[10px] font-mono mt-6 border border-white/10 transition-all cursor-pointer">
              Contact Enterprise
            </button>
          </div>

        </div>


      </section>



      {/* The Scoring Index details & Simulator */}
      <section id="formula" className="max-w-6xl mx-auto px-6 py-24 border-t border-white/5 relative z-10">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <span className="bg-neon-purple/10 text-neon-purple border border-neon-purple/20 text-[10px] uppercase font-mono font-semibold px-2.5 py-1 rounded">Interactive Vetting & Simulator</span>
          <h3 className="text-4xl font-heading font-extrabold text-white">Dynamic Score & Compensation Simulator</h3>
          <p className="text-muted text-xs leading-relaxed max-w-lg mx-auto">
            CodeDNA uses a fully transparent, open-source calculation index. Drag the weights below to see how changes in hard, soft, and builder signals impact predicted salary telemetries in India (INR) and target company tiers.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          {/* Sliders Console */}
          <div className="lg:col-span-7 glass rounded-2xl p-8 border border-white/5 space-y-8 flex flex-col justify-between">
            <div>
              <h4 className="text-lg font-heading font-bold text-white mb-6 flex items-center gap-2">
                <span>🎛️</span> Adjust Vetting Credentials
              </h4>
              
              <div className="space-y-6 text-left">
                {/* Slider 1: Hard Skills */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-neon-purple font-semibold">Hard Skills Rating (30% Weight)</span>
                    <span className="text-white bg-neon-purple/10 px-2 py-0.5 rounded border border-neon-purple/20">{simHard}/100</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={simHard}
                    onChange={(e) => setSimHard(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-neon-purple focus:outline-none"
                  />
                  <div className="flex flex-wrap gap-2 text-[10px] text-muted font-mono">
                    <span>• Commits counts & depth</span>
                    <span>• LeetCode problems & streak</span>
                    <span>• DSA contest ratings</span>
                  </div>
                </div>

                {/* Slider 2: Soft Skills */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-cyber-blue font-semibold">Soft Skills Rating (40% Weight)</span>
                    <span className="text-white bg-cyber-blue/10 px-2 py-0.5 rounded border border-cyber-blue/20">{simSoft}/100</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={simSoft}
                    onChange={(e) => setSimSoft(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-cyber-blue focus:outline-none"
                  />
                  <div className="flex flex-wrap gap-2 text-[10px] text-muted font-mono">
                    <span>• GitHub PR reviews & feedback</span>
                    <span>• Merge request approvals</span>
                    <span>• Discussion contributions</span>
                  </div>
                </div>

                {/* Slider 3: Builder Skills */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-electric-green font-semibold">Builder Skills Rating (30% Weight)</span>
                    <span className="text-white bg-electric-green/10 px-2 py-0.5 rounded border border-electric-green/20">{simBuilder}/100</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={simBuilder}
                    onChange={(e) => setSimBuilder(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-electric-green focus:outline-none"
                  />
                  <div className="flex flex-wrap gap-2 text-[10px] text-muted font-mono">
                    <span>• Vercel production checkmarks</span>
                    <span>• Repo stars, forks & clones</span>
                    <span>• Live deployment uptime</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 text-[11px] text-muted font-mono bg-white/1 p-4 rounded-lg mt-6 text-left">
              <strong>Calculation Index Formula:</strong><br />
              <code className="text-white text-[10px]">Overall Score = (Hard × 0.3) + (Soft × 0.4) + (Builder × 0.3)</code>
            </div>
          </div>

          {/* Dynamic Result Panel */}
          <div className="lg:col-span-5 glass rounded-2xl p-8 border border-white/5 flex flex-col justify-between relative overflow-hidden text-center">
            {/* Background gradient blob depending on score */}
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-electric-green/5 blur-3xl pointer-events-none" />

            <div className="text-center space-y-4">
              <h4 className="text-xs font-mono text-muted uppercase tracking-wider">Simulated Developer Profile</h4>
              
              {/* Circular gauge */}
              <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                <svg className="absolute w-full h-full transform -rotate-90">
                  <circle cx="72" cy="72" r="62" stroke="rgba(255,255,255,0.03)" strokeWidth="8" fill="transparent" />
                  <circle
                    cx="72"
                    cy="72"
                    r="62"
                    stroke={
                      simOverall >= 90
                        ? "#00E5A0"
                        : simOverall >= 80
                        ? "#0066FF"
                        : simOverall >= 70
                        ? "#A855F7"
                        : "#FF4444"
                    }
                    strokeWidth="8"
                    fill="transparent" 
                    strokeDasharray={389} 
                    strokeDashoffset={389 - (389 * simOverall) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-300 ease-out"
                  />
                </svg>
                <div className="z-10 text-center">
                  <span className="text-4xl font-heading font-extrabold text-white block leading-none">
                    {simOverall}
                  </span>
                  <span className="text-[8px] text-muted font-mono uppercase block mt-1">Overall DNA</span>
                </div>
              </div>

              <div>
                <span className={`inline-block text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase border ${
                  simOverall >= 90
                    ? "bg-electric-green/10 border-electric-green/20 text-electric-green"
                    : simOverall >= 80
                    ? "bg-cyber-blue/10 border-cyber-blue/20 text-cyber-blue"
                    : simOverall >= 70
                    ? "bg-neon-purple/10 border-neon-purple/20 text-neon-purple"
                    : "bg-coral-red/10 border-coral-red/20 text-coral-red"
                }`}>
                  {simOverall >= 90 ? "Elite Builder (Top 1%)" : simOverall >= 80 ? "Product Engineer (Top 5%)" : simOverall >= 70 ? "Standard Developer (Top 15%)" : "Needs Upskilling"}
                </span>
              </div>
            </div>

            <div className="space-y-4 my-6 font-sans text-xs text-left">
              <div className="flex justify-between items-center p-3 bg-white/2 rounded-lg border border-white/5">
                <span className="text-muted">Target Company Tier:</span>
                <span className="font-bold text-white text-right">
                  {simOverall >= 90 ? "Tier-1 Tech MNC / YC Startup" : simOverall >= 80 ? "High-Growth Indian Startup" : simOverall >= 70 ? "Mid-Market Software House" : "Service-Based MNC"}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-white/2 rounded-lg border border-white/5">
                <span className="text-muted">Predicted INR Compensation:</span>
                <span className="font-bold text-electric-green text-right">
                  {simOverall >= 90 ? "₹12 - ₹24 LPA" : simOverall >= 80 ? "₹8 - ₹12 LPA" : simOverall >= 70 ? "₹5 - ₹8 LPA" : "₹3 - ₹5 LPA"}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-white/2 rounded-lg border border-white/5">
                <span className="text-muted">Expected Internship Stipend:</span>
                <span className="font-semibold text-white">
                  {simOverall >= 90 ? "₹40k+/month" : simOverall >= 80 ? "₹25k/month" : simOverall >= 70 ? "₹15k/month" : "₹5k-10k/month"}
                </span>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => openAuth("DEVELOPER", false)}
                className="w-full py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-heading font-semibold text-xs border border-white/10 hover:border-white/20 transition-all cursor-pointer"
              >
                Claim This Passport Profile
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="how-it-works" className="max-w-6xl mx-auto px-6 py-12 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center text-xs text-muted font-mono relative z-10 bg-obsidian/40 backdrop-blur-sm">
        <div>© 2026 CodeDNA Ecosystem. All rights reserved.</div>
        <div className="flex gap-6 mt-4 sm:mt-0">
          <span>Aryan Gupta & Amrita Singh</span>
          <span>India Tier-2 & Tier-3 Focus</span>
        </div>
      </footer>

      {/* Glass Auth Modal Overlay */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-obsidian/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass max-w-md w-full rounded-xl p-8 border border-white/10 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                setShowAuthModal(false);
                setOtpSent(false);
                setOtpCode("");
              }}
              className="absolute top-6 right-6 text-muted hover:text-white text-sm cursor-pointer"
            >
              ✕
            </button>
            
            <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl transition-all duration-300 bg-gradient-to-r from-electric-green to-cyber-blue" />

            <div className="flex justify-between border-b border-white/5 pb-4 mb-6">
              <h2 className="text-lg font-heading font-semibold text-white">
                {isLogin ? "Welcome back" : otpSent ? "Verify email address" : "Register DNA profile"}
              </h2>
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setOtpSent(false);
                  setOtpCode("");
                  setError("");
                  setSuccess("");
                }}
                className="text-xs text-electric-green hover:underline focus:outline-none cursor-pointer"
              >
                {isLogin ? "Join as new user" : "Sign in to profile"}
              </button>
            </div>

            {error && <div className="mb-4 p-3 bg-coral-red/10 border border-coral-red/20 text-coral-red text-xs rounded">{error}</div>}
            {success && <div className="mb-4 p-3 bg-electric-green/10 border border-electric-green/20 text-electric-green text-xs rounded leading-relaxed">{success}</div>}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {isLogin ? (
                <>
                  <div>
                    <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-surface border border-white/5 rounded p-2.5 text-xs text-white focus:outline-none focus:border-electric-green"
                      placeholder="e.g. you@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">Password</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-surface border border-white/5 rounded p-2.5 text-xs text-white focus:outline-none focus:border-electric-green"
                      placeholder="••••••••"
                    />
                  </div>
                </>
              ) : otpSent ? (
                <>
                  <div className="text-center py-2">
                    <span className="text-2xl">🔑</span>
                    <p className="text-xs text-muted mt-2 leading-relaxed">
                      We have generated a 6-digit OTP code for <strong className="text-white">{email}</strong>.
                    </p>
                    <p className="text-[10px] text-electric-green/80 font-mono mt-2 bg-electric-green/5 border border-electric-green/10 p-2.5 rounded text-left">
                      Since this is a local sandbox, please check your running backend terminal logs for the code.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">6-Digit Verification Code</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      pattern="\d{6}"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="w-full bg-surface border border-white/5 rounded p-2.5 text-center text-lg font-mono font-bold tracking-[0.5em] text-electric-green focus:outline-none focus:border-electric-green"
                      placeholder="000000"
                    />
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-mono pt-1">
                    <button
                      type="button"
                      onClick={async () => {
                        setError("");
                        setSuccess("");
                        setLoading(true);
                        try {
                          const res = await fetch(`${API_BASE_URL}/api/auth/register/request-otp`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ email, password, name, role })
                          });
                          const d = await res.json();
                          if (!res.ok) throw new Error(d.error || "Resend failed");
                          setSuccess("New verification OTP logged to backend console!");
                        } catch (err: any) {
                          setError(err.message);
                        } finally {
                          setLoading(false);
                        }
                      }}
                      className="text-cyber-blue hover:underline focus:outline-none cursor-pointer"
                    >
                      Resend OTP code
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setOtpCode("");
                        setError("");
                        setSuccess("");
                      }}
                      className="text-muted hover:text-white cursor-pointer"
                    >
                      Back to edit details
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-2">My primary goal:</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setRole("DEVELOPER")}
                        className={`py-2 rounded text-xs font-semibold border transition-all ${
                          role === "DEVELOPER"
                            ? "bg-electric-green/10 border-electric-green text-electric-green"
                            : "border-white/5 text-muted hover:bg-white/3"
                        }`}
                      >
                        Find Tech Jobs
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole("RECRUITER")}
                        className={`py-2 rounded text-xs font-semibold border transition-all ${
                          role === "RECRUITER"
                            ? "bg-cyber-blue/10 border-cyber-blue text-cyber-blue"
                            : "border-white/5 text-muted hover:bg-white/3"
                        }`}
                      >
                        Recruit Engineers
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-surface border border-white/5 rounded p-2.5 text-xs text-white focus:outline-none focus:border-electric-green"
                      placeholder="e.g. Aryan Gupta"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-surface border border-white/5 rounded p-2.5 text-xs text-white focus:outline-none focus:border-electric-green"
                      placeholder="e.g. you@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">Password</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-surface border border-white/5 rounded p-2.5 text-xs text-white focus:outline-none focus:border-electric-green"
                      placeholder="••••••••"
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded bg-electric-green text-obsidian font-heading font-semibold text-xs hover:bg-electric-green/90 transition-all cursor-pointer disabled:opacity-50 mt-2"
              >
                {loading 
                  ? "Vetting..." 
                  : isLogin 
                    ? "Access Account" 
                    : otpSent 
                      ? "Verify & Create Account" 
                      : `Request Verification OTP`}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
