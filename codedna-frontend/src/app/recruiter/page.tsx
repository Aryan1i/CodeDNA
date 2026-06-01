"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../config";

interface UserSession {
  id: string;
  name: string;
  email: string;
  role: "DEVELOPER" | "RECRUITER" | "TPO";
}

interface CandidateData {
  id: string;
  name: string;
  email: string;
  isVerified?: boolean;
  githubUsername?: string;
  leetcodeUsername?: string;
  overallScore?: number;
  hardSkillsScore?: number;
  softSkillsScore?: number;
  builderSkillsScore?: number;
  profileEmbedding?: {
    embeddingText?: string;
  };
}

interface CompanyTest {
  id: string;
  companyName: string;
  testTitle: string;
  description: string;
  badgeName: string;
  stipendRange: string;
}

export default function Recruiter() {
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

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CandidateData[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Advanced Filters
  const [blindSourcingActive, setBlindSourcingActive] = useState(false);
  const [minOverallScore, setMinOverallScore] = useState(0);
  const [minHardScore, setMinHardScore] = useState(0);
  const [minBuilderScore, setMinBuilderScore] = useState(0);
  const [onlyVerified, setOnlyVerified] = useState(false);

  // Deployed Tests Panel States
  const [deployedTests, setDeployedTests] = useState<CompanyTest[]>([]);
  const [companyName, setCompanyName] = useState("");
  const [testTitle, setTestTitle] = useState("");
  const [testDescription, setTestDescription] = useState("");
  const [badgeName, setBadgeName] = useState("");
  const [stipendRange, setStipendRange] = useState("");
  const [deploying, setDeploying] = useState(false);
  const [deploySuccess, setDeploySuccess] = useState("");
  const [deployError, setDeployError] = useState("");

  const fetchDeployedTests = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/recruiter/tests`);
      if (res.ok) {
        const data = await res.json();
        setDeployedTests(data);
      }
    } catch (e) {
      console.error("Error fetching deployed tests:", e);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) {
      window.location.href = "/";
      return;
    }

    const parsedUser = JSON.parse(savedUser);
    if (parsedUser.role !== "RECRUITER") {
      window.location.href = "/dashboard";
      return;
    }

    const fetchDefaultCandidates = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/developer/profiles`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchDefaultCandidates();
    fetchDeployedTests();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/recruiter/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Search failed");
      }

      setResults(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSearching(false);
    }
  };

  const handleDeployTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !testTitle || !testDescription || !badgeName) {
      setDeployError("Please fill out all required fields.");
      return;
    }

    setDeploying(true);
    setDeploySuccess("");
    setDeployError("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/recruiter/tests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          testTitle,
          description: testDescription,
          badgeName,
          stipendRange: stipendRange || "Competitive"
        })
      });

      const data = await res.json();

      if (res.ok) {
        setDeploySuccess(`Challenge "${data.testTitle}" deployed to dashboard feed!`);
        setCompanyName("");
        setTestTitle("");
        setTestDescription("");
        setBadgeName("");
        setStipendRange("");
        fetchDeployedTests();
      } else {
        setDeployError(data.error || "Deployment failed.");
      }
    } catch (err) {
      console.error(err);
      setDeployError("Failed to connect to backend server.");
    } finally {
      setDeploying(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  // Client side filters application
  const filteredCandidates = results.filter((candidate) => {
    const overall = candidate.overallScore || 0;
    const hard = candidate.hardSkillsScore || 0;
    const builder = candidate.builderSkillsScore || 0;
    const isV = !!candidate.isVerified;

    if (overall < minOverallScore) return false;
    if (hard < minHardScore) return false;
    if (builder < minBuilderScore) return false;
    if (onlyVerified && !isV) return false;

    return true;
  });

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-transparent text-white flex flex-col items-center justify-center font-sans">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyber-blue"></div>
        <p className="mt-4 text-xs text-muted">Loading candidate database...</p>
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
          <span className="bg-cyber-blue/10 text-cyber-blue px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider font-semibold border border-cyber-blue/20">
            Recruiter Suite
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
      <main className="flex-1 max-w-6xl w-full mx-auto p-8 space-y-8">
        
        {/* Search Header */}
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-heading font-extrabold text-white">
            Vibe Hiring Search
          </h2>
          <p className="text-muted text-xs max-w-md mx-auto">
            Input a natural language description of your ideal developer candidate profile. We&apos;ll search and match using AI vector embeddings.
          </p>
        </div>

        {/* Vibe Search Bar */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              required
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-surface border border-white/5 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-cyber-blue font-sans"
              placeholder="e.g. looking for a backend API engineer with Node.js and SQL expertise"
            />
            <button
              type="submit"
              disabled={searching}
              className="px-6 py-3 rounded-lg bg-cyber-blue text-white font-heading font-semibold text-sm hover:bg-cyber-blue/90 cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
            >
              {searching ? "Vibe Matching..." : "Match Vibe"}
            </button>
          </div>
          <div className="text-[10px] text-muted text-center font-mono">
            Protip: Matches are dynamically ranked by candidate overall score in descending order
          </div>
        </form>

        {/* Outer split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Sidebar Filters & Challenge Deployer */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Filter Panel */}
            <div className="glass rounded-xl p-5 border border-white/5 space-y-5 text-left">
              <div className="border-b border-white/5 pb-2.5 flex justify-between items-center">
                <h3 className="text-xs text-white font-mono uppercase font-bold tracking-wider">Bias & Metric Filters</h3>
                {blindSourcingActive && (
                  <span className="bg-electric-green/10 text-electric-green text-[8px] font-mono font-semibold px-2 py-0.5 rounded border border-electric-green/20">
                    SHIELD ACTIVE
                  </span>
                )}
              </div>

              {/* Blind Sourcing Toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/2 border border-white/5">
                <div>
                  <span className="text-xs font-semibold text-white block">Blind Sourcing</span>
                  <span className="text-[9px] text-muted block leading-tight font-mono">Mask names/emails to prevent bias</span>
                </div>
                <button
                  onClick={() => setBlindSourcingActive(!blindSourcingActive)}
                  className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none cursor-pointer border ${blindSourcingActive ? "bg-electric-green border-electric-green/20" : "bg-surface border-white/10"}`}
                >
                  <span className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${blindSourcingActive ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>

              {/* Slider: Overall Score */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-muted">Min Overall Score</span>
                  <span className="text-electric-green font-bold">{minOverallScore}+</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={minOverallScore}
                  onChange={(e) => setMinOverallScore(Number(e.target.value))}
                  className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-electric-green"
                />
              </div>

              {/* Slider: Hard Score */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-muted">Min Hard Skills</span>
                  <span className="text-neon-purple font-bold">{minHardScore}+</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={minHardScore}
                  onChange={(e) => setMinHardScore(Number(e.target.value))}
                  className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-neon-purple"
                />
              </div>

              {/* Slider: Builder Score */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-muted">Min Builder Skills</span>
                  <span className="text-cyber-blue font-bold">{minBuilderScore}+</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={minBuilderScore}
                  onChange={(e) => setMinBuilderScore(Number(e.target.value))}
                  className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-cyber-blue"
                />
              </div>

              {/* Toggle: Only Verified */}
              <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                <input
                  id="verified-only"
                  type="checkbox"
                  checked={onlyVerified}
                  onChange={(e) => setOnlyVerified(e.target.checked)}
                  className="rounded bg-surface border-white/10 text-electric-green focus:ring-electric-green cursor-pointer h-4 w-4"
                />
                <label htmlFor="verified-only" className="text-xs text-muted font-mono cursor-pointer select-none">
                  Verified Passports Only
                </label>
              </div>
            </div>

            {/* Vetting Challenge Deploy Panel */}
            <div className="glass rounded-xl p-5 border border-white/5 space-y-4 text-left">
              <div className="border-b border-white/5 pb-2">
                <h3 className="text-xs text-white font-mono uppercase font-bold tracking-wider">Deploy Custom Challenge</h3>
                <span className="text-[9px] text-muted font-mono leading-tight block mt-1">Deploy coding vetting challenges for developers to earn custom badges</span>
              </div>

              {deploySuccess && <div className="p-2.5 bg-electric-green/10 border border-electric-green/20 text-electric-green text-[10px] rounded font-mono">{deploySuccess}</div>}
              {deployError && <div className="p-2.5 bg-coral-red/10 border border-coral-red/20 text-coral-red text-[10px] rounded font-mono">{deployError}</div>}

              <form onSubmit={handleDeployTest} className="space-y-3 font-sans">
                <div>
                  <label className="block text-[8px] font-semibold text-muted uppercase tracking-wider mb-1 font-mono">Company Name</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-surface border border-white/5 rounded p-2 text-xs text-white focus:outline-none focus:border-cyber-blue"
                    placeholder="e.g. Cred"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-semibold text-muted uppercase tracking-wider mb-1 font-mono">Test / Challenge Title</label>
                  <input
                    type="text"
                    required
                    value={testTitle}
                    onChange={(e) => setTestTitle(e.target.value)}
                    className="w-full bg-surface border border-white/5 rounded p-2 text-xs text-white focus:outline-none focus:border-cyber-blue"
                    placeholder="e.g. Memory Leak Diagnostic"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-semibold text-muted uppercase tracking-wider mb-1 font-mono">Challenge Description</label>
                  <textarea
                    rows={3}
                    required
                    value={testDescription}
                    onChange={(e) => setTestDescription(e.target.value)}
                    className="w-full bg-surface border border-white/5 rounded p-2 text-xs text-white focus:outline-none focus:border-cyber-blue"
                    placeholder="Describe the tasks candidate must verify..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[8px] font-semibold text-muted uppercase tracking-wider mb-1 font-mono">Badge Name</label>
                    <input
                      type="text"
                      required
                      value={badgeName}
                      onChange={(e) => setBadgeName(e.target.value)}
                      className="w-full bg-surface border border-white/5 rounded p-2 text-xs text-white focus:outline-none focus:border-cyber-blue"
                      placeholder="e.g. Cred Vetted Developer"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-semibold text-muted uppercase tracking-wider mb-1 font-mono">Stipend Range</label>
                    <input
                      type="text"
                      value={stipendRange}
                      onChange={(e) => setStipendRange(e.target.value)}
                      className="w-full bg-surface border border-white/5 rounded p-2 text-xs text-white focus:outline-none focus:border-cyber-blue"
                      placeholder="e.g. ₹30k - ₹50k/mo"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={deploying}
                  className="w-full py-2 bg-cyber-blue text-white rounded font-heading font-semibold text-xs hover:bg-cyber-blue/90 cursor-pointer disabled:opacity-50"
                >
                  {deploying ? "Deploying..." : "Deploy Challenge"}
                </button>
              </form>
            </div>

            {/* Currently Active Tests Deployed */}
            <div className="glass rounded-xl p-5 border border-white/5 space-y-3 text-left">
              <h3 className="text-xs text-white font-mono uppercase font-bold tracking-wider border-b border-white/5 pb-2">Active Vetting Tests ({deployedTests.length})</h3>
              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                {deployedTests.map((test) => (
                  <div key={test.id} className="p-2.5 rounded bg-surface border border-white/3 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-white font-semibold font-mono">{test.companyName}</span>
                      <span className="text-[8px] bg-cyber-blue/10 text-cyber-blue px-1.5 py-0.2 rounded font-mono font-semibold">{test.stipendRange}</span>
                    </div>
                    <h4 className="text-[10px] text-white font-bold">{test.testTitle}</h4>
                    <span className="text-[9px] text-muted font-mono block">Unlocks: <span className="text-electric-green">{test.badgeName}</span></span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Results Listings */}
          <div className="lg:col-span-2 space-y-6 text-left">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h3 className="text-sm font-heading font-semibold text-white">
                Vetted Candidates ({filteredCandidates.length})
              </h3>
              <span className="text-[10px] text-muted font-mono">Ranked by Overall Score</span>
            </div>

            {error && <div className="p-3 bg-coral-red/10 border border-coral-red/20 text-coral-red text-xs rounded">{error}</div>}

            {filteredCandidates.length === 0 ? (
              <div className="text-center py-16 text-xs text-muted font-mono italic glass rounded-xl border border-white/5">
                No developer profiles found matching those filters. Try broadening your metric sliders or search term.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCandidates.map((candidate) => {
                  const displayName = blindSourcingActive 
                    ? `Vetted Developer #${candidate.id.slice(0, 6).toUpperCase()}` 
                    : candidate.name;
                  const displayEmail = blindSourcingActive 
                    ? "hidden@codedna.in" 
                    : candidate.email;
                  const displayGithub = blindSourcingActive
                    ? "Linked"
                    : candidate.githubUsername ? `@${candidate.githubUsername}` : "";
                  const displayLeetcode = blindSourcingActive
                    ? "Linked"
                    : candidate.leetcodeUsername ? `@${candidate.leetcodeUsername}` : "";

                  return (
                    <div 
                      key={candidate.id} 
                      className="glass rounded-xl p-6 border border-white/5 hover:border-cyber-blue/20 transition-all duration-300 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-cyber-blue/2 blur-2xl pointer-events-none" />
                      
                      {/* Left Column: Avatar & Basic Specs */}
                      <div className="space-y-3 flex-1 w-full">
                        <div>
                          <h4 className="text-base font-heading font-semibold text-white flex items-center gap-2 flex-wrap">
                            {displayName}
                            {candidate.isVerified && (
                              <span className="bg-electric-green/10 text-electric-green text-[9px] px-1.5 py-0.5 rounded font-mono border border-electric-green/20">
                                VERIFIED PASSPORT
                              </span>
                            )}
                          </h4>
                          <p className="text-[10px] text-muted font-mono mt-0.5">{displayEmail}</p>
                        </div>

                        <div className="flex flex-wrap gap-4 text-xs font-mono text-muted">
                          {candidate.githubUsername && (
                            <span>GitHub: <span className={blindSourcingActive ? "text-muted italic" : "text-white"}>{displayGithub}</span></span>
                          )}
                          {candidate.leetcodeUsername && (
                            <span>LeetCode: <span className={blindSourcingActive ? "text-muted italic" : "text-white"}>{displayLeetcode}</span></span>
                          )}
                        </div>

                        <div className="text-[11px] text-muted bg-white/2 p-2.5 rounded border border-white/3 font-mono line-clamp-2 max-w-xl">
                          {candidate.profileEmbedding?.embeddingText || "Developer has not synced profile metrics yet."}
                        </div>
                      </div>

                      {/* Right Column: Score metrics & Contact */}
                      <div className="text-center flex flex-row sm:flex-col items-center gap-6 sm:gap-2 justify-between sm:justify-start w-full sm:w-auto border-t sm:border-t-0 border-white/5 pt-4 sm:pt-0">
                        <div className="text-center">
                          <span className="text-4xl font-heading font-extrabold text-electric-green">
                            {candidate.overallScore || 0}
                          </span>
                          <span className="text-[10px] text-muted block font-mono">SCORE / 100</span>
                        </div>

                        <div className="space-y-2 min-w-[120px]">
                          {!blindSourcingActive ? (
                            <>
                              <a 
                                href={`/profile/${candidate.githubUsername || candidate.leetcodeUsername}`}
                                className="px-3.5 py-1.5 rounded bg-surface border border-white/5 text-[11px] font-heading font-semibold text-white hover:bg-white/5 transition-all block text-center"
                                target="_blank"
                              >
                                Vetted Passport
                              </a>
                              <a
                                href={`mailto:${candidate.email}`}
                                className="px-3.5 py-1.5 rounded bg-cyber-blue text-white text-[11px] font-heading font-semibold hover:bg-cyber-blue/90 transition-all block text-center"
                              >
                                Hire Developer
                              </a>
                            </>
                          ) : (
                            <div className="text-[9px] text-muted text-center font-mono py-2 p-1.5 border border-white/5 rounded bg-white/2">
                              Disable Blind Mode to unlock contact options
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

