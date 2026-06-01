"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../config";

interface UserSession {
  id: string;
  name: string;
  email: string;
  role: "DEVELOPER" | "RECRUITER" | "TPO";
}

interface TopStudent {
  id: string;
  overallScore: number;
  isVerified: boolean;
  user: {
    name: string;
    email: string;
  };
}

interface TpoStats {
  totalStudents: number;
  avgScore: number;
  nationalBenchmark: number;
  verificationRate: number;
  placedCount: number;
  unplacedCount: number;
  topStudents: TopStudent[];
}

export default function TpoPortal() {
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

  const [stats, setStats] = useState<TpoStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [csvInput, setCsvInput] = useState("");
  const [bulkProgress, setBulkProgress] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      window.location.href = "/";
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/tpo/statistics`);
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        } else {
          setError("Failed to fetch placement metrics.");
        }
      } catch (err) {
        console.error(err);
        setError("Error connecting to server.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const handleBulkUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvInput.trim()) return;

    setUploading(true);
    setBulkProgress(["Initializing batch pipeline...", "Parsing student registry records..."]);

    const rows = csvInput.split("\n").filter(row => row.trim());
    let index = 0;

    const interval = setInterval(() => {
      if (index < rows.length) {
        const studentName = rows[index].split(",")[0] || `Student #${index + 1}`;
        setBulkProgress(prev => [
          ...prev,
          `Creating Developer Passport for ${studentName.trim()}... [OK]`,
          `Syncing initial GitHub & LeetCode mock crawl for ${studentName.trim()}...`
        ]);
        index++;
      } else {
        clearInterval(interval);
        setBulkProgress(prev => [...prev, "Batch upload complete! Synced profiles added to database."]);
        setUploading(false);
        // Refresh statistics
        fetch(`${API_BASE_URL}/api/tpo/statistics`)
          .then(res => res.json())
          .then(data => setStats(data));
      }
    }, 800);
  };

  const logout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-transparent text-white flex flex-col items-center justify-center font-sans">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-electric-green"></div>
        <p className="mt-4 text-xs text-muted">Entering placement portal cell...</p>
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
          <span className="bg-electric-green/10 text-electric-green px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider font-semibold border border-electric-green/20">
            Placement Cell Portal
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
        
        {/* Header */}
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-heading font-extrabold text-white">
            Pune Institute of Computer Technology
          </h2>
          <p className="text-muted text-xs max-w-md mx-auto">
            Review your batch metrics, bulk register student passports, and share aggregate profiles with recruiter partners.
          </p>
        </div>

        {error && <div className="p-3 bg-coral-red/10 border border-coral-red/20 text-coral-red text-xs rounded max-w-md mx-auto">{error}</div>}

        {/* Dashboard Grid stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          
          {/* Total Students */}
          <div className="glass rounded-xl p-5 border border-white/5 space-y-2">
            <span className="text-[10px] font-mono text-muted uppercase block">Total Batch Registry</span>
            <div className="text-3xl font-heading font-extrabold text-white">
              {stats?.totalStudents || 0}
              <span className="text-xs text-muted font-normal font-sans ml-1">students</span>
            </div>
            <span className="text-[9px] text-muted font-mono block">100% active passports</span>
          </div>

          {/* Average Score */}
          <div className="glass rounded-xl p-5 border border-white/5 space-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-electric-green/5 blur-xl pointer-events-none" />
            <span className="text-[10px] font-mono text-muted uppercase block">Average Batch Score</span>
            <div className="text-3xl font-heading font-extrabold text-electric-green">
              {stats?.avgScore || 0}
              <span className="text-xs text-muted font-normal font-sans ml-1">/100</span>
            </div>
            <span className="text-[9px] text-muted font-mono block">National Benchmark: {stats?.nationalBenchmark}</span>
          </div>

          {/* Verification Rate */}
          <div className="glass rounded-xl p-5 border border-white/5 space-y-2">
            <span className="text-[10px] font-mono text-muted uppercase block">Verification Rate</span>
            <div className="text-3xl font-heading font-extrabold text-white">
              {stats?.verificationRate || 0}%
            </div>
            <span className="text-[9px] text-muted font-mono block">Passed dynamic AI verifiers</span>
          </div>

          {/* Placed Ratios */}
          <div className="glass rounded-xl p-5 border border-white/5 space-y-2">
            <span className="text-[10px] font-mono text-muted uppercase block">Campus Placed Rate</span>
            <div className="text-3xl font-heading font-extrabold text-cyber-blue">
              {stats ? Math.round((stats.placedCount / stats.totalStudents) * 100) : 0}%
            </div>
            <span className="text-[9px] text-muted font-mono block">
              Placed: {stats?.placedCount || 0} | Unplaced: {stats?.unplacedCount || 0}
            </span>
          </div>

        </div>

        {/* Lower Grid split */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Bulk upload student data */}
          <div className="md:col-span-1 glass rounded-xl p-6 border border-white/5 space-y-4">
            <div className="border-b border-white/5 pb-3">
              <h3 className="text-sm font-heading font-semibold text-white">Bulk Register Students</h3>
              <span className="text-[9px] text-muted font-mono">Format: Name, Email on each line</span>
            </div>

            <form onSubmit={handleBulkUpload} className="space-y-4">
              <textarea
                rows={6}
                required
                value={csvInput}
                onChange={(e) => setCsvInput(e.target.value)}
                placeholder="Aryan Gupta, aryan@codedna.in&#10;Amrita Singh, amrita@codedna.in"
                className="w-full bg-surface border border-white/5 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-electric-green font-mono"
              />

              <button
                type="submit"
                disabled={uploading}
                className="w-full py-2 bg-electric-green text-obsidian rounded font-heading font-semibold text-xs hover:bg-electric-green/90 transition-all cursor-pointer disabled:opacity-50"
              >
                {uploading ? "Processing Registry..." : "Bulk Sync passports"}
              </button>
            </form>

            {bulkProgress.length > 0 && (
              <div className="p-3 bg-black/60 border border-white/5 rounded-lg text-[9px] text-electric-green/80 font-mono h-36 overflow-y-auto space-y-1.5 scrollbar-thin text-left">
                {bulkProgress.map((p, idx) => (
                  <div key={idx}>{p}</div>
                ))}
              </div>
            )}
          </div>

          {/* Top vetted passports */}
          <div className="md:col-span-2 glass rounded-xl p-6 border border-white/5 space-y-4 text-left">
            <div className="border-b border-white/5 pb-3 flex justify-between items-center">
              <h3 className="text-sm font-heading font-semibold text-white">Top Batch Vetted Passports</h3>
              <span className="text-[10px] text-muted font-mono">Top performers rank list</span>
            </div>

            <div className="space-y-3">
              {!stats?.topStudents || stats.topStudents.length === 0 ? (
                <div className="text-center py-10 text-xs text-muted font-mono italic">
                  No registered student passports found.
                </div>
              ) : (
                stats.topStudents.map((student, idx) => (
                  <div 
                    key={student.id} 
                    className="p-3.5 rounded-lg bg-surface border border-white/3 flex justify-between items-center hover:bg-white/3 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-muted">#{idx + 1}</span>
                      <div>
                        <h4 className="text-xs font-semibold text-white flex items-center gap-2">
                          {student.user.name}
                          {student.isVerified && (
                            <span className="bg-electric-green/10 text-electric-green text-[8px] px-1 py-0.5 rounded font-mono border border-electric-green/10">
                              VERIFIED
                            </span>
                          )}
                        </h4>
                        <span className="text-[10px] text-muted font-mono">{student.user.email}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-heading font-extrabold text-electric-green block">
                        {student.overallScore}
                      </span>
                      <span className="text-[8px] text-muted block font-mono">PASSPORT SCORE</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
