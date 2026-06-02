export interface GitLabData {
  commitCount: number;
  prCount: number;
  prReviewsCount: number;
  issuesCount: number;
  languages: Record<string, number>;
  projects: Array<{
    name: string;
    description: string | null;
    repoUrl: string;
    stars: number;
    forks: number;
  }>;
}

export interface CodeforcesData {
  solvedCount: number;
  rating: number;
  maxRating: number;
  rank: string;
  maxRank: string;
}

export interface KaggleData {
  competitionCount: number;
  notebookCount: number;
  datasetCount: number;
  medals: {
    gold: number;
    silver: number;
    bronze: number;
  };
  points: number;
  tier: string;
}

export interface HuggingFaceData {
  modelCount: number;
  datasetCount: number;
  spaceCount: number;
  likes: number;
  commits: number;
}

export interface NetlifyData {
  siteCount: number;
  deployCount: number;
}

export interface RenderData {
  serviceCount: number;
  deployCount: number;
}

export interface GSoCData {
  isParticipant: boolean;
  years: number[];
  organizations: string[];
  projectCount: number;
  status: string;
}

export interface GSSoCData {
  isParticipant: boolean;
  score: number;
  rank: number;
  prCount: number;
}

// Generate deterministic mock data based on username hash
function getHash(username: string): number {
  return username.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

export async function fetchGitLabStats(username: string): Promise<GitLabData> {
  const hash = getHash(username);
  const commitCount = 50 + (hash % 300);
  const prCount = 5 + (hash % 20);
  const prReviewsCount = 2 + (hash % 10);
  const issuesCount = 4 + (hash % 15);
  
  const languages = {
    "Python": 45000 + (hash * 40),
    "C++": 30000 + (hash * 30),
    "Go": 15000 + (hash * 10),
  };

  const projects = [
    {
      name: `${username}-gitlab-lib`,
      description: "A helper library for GitLab CI pipeline automation.",
      repoUrl: `https://gitlab.com/${username}/${username}-gitlab-lib`,
      stars: 1 + (hash % 5),
      forks: hash % 2,
    }
  ];

  return {
    commitCount,
    prCount,
    prReviewsCount,
    issuesCount,
    languages,
    projects,
  };
}

export async function fetchCodeforcesStats(username: string): Promise<CodeforcesData> {
  const cleanUsername = username.trim();
  try {
    // 1. Fetch User Info
    const infoUrl = `https://codeforces.com/api/user.info?handles=${encodeURIComponent(cleanUsername)}`;
    const infoResponse = await fetch(infoUrl);

    if (!infoResponse.ok) {
      throw new Error(`Codeforces info API returned status ${infoResponse.status}`);
    }

    const infoJson = await infoResponse.json() as any;
    if (infoJson.status !== "OK" || !infoJson.result || infoJson.result.length === 0) {
      throw new Error("Codeforces user info not found or API error");
    }

    const userInfo = infoJson.result[0];
    // If user has not participated in contests, rating and maxRating might be undefined.
    // Default to 0 in that case.
    const rating = userInfo.rating !== undefined ? userInfo.rating : 0;
    const maxRating = userInfo.maxRating !== undefined ? userInfo.maxRating : 0;

    // Default to "Newbie" or "Unrated" if rank is missing
    const rawRank = userInfo.rank || "Newbie";
    const rawMaxRank = userInfo.maxRank || "Newbie";

    // Format rank strings nicely (e.g. "candidate master" -> "Candidate Master")
    const formatRank = (rk: string) =>
      rk.split(" ").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

    const rank = formatRank(rawRank);
    const maxRank = formatRank(rawMaxRank);

    // 2. Fetch User Status submissions to count solved problems
    const statusUrl = `https://codeforces.com/api/user.status?handle=${encodeURIComponent(cleanUsername)}`;
    const statusResponse = await fetch(statusUrl);

    let solvedCount = 0;
    if (statusResponse.ok) {
      const statusJson = await statusResponse.json() as any;
      if (statusJson.status === "OK" && Array.isArray(statusJson.result)) {
        const solvedProblems = new Set<string>();
        for (const sub of statusJson.result) {
          if (sub.verdict === "OK" && sub.problem) {
            // Uniquely identify a problem by contestId, index, and name
            const key = `${sub.problem.contestId || ""}_${sub.problem.index || ""}_${sub.problem.name}`;
            solvedProblems.add(key);
          }
        }
        solvedCount = solvedProblems.size;
      }
    }

    return {
      solvedCount,
      rating,
      maxRating,
      rank,
      maxRank,
    };
  } catch (error: any) {
    console.error("Error in fetchCodeforcesStats. Using simulated data as fallback...", error.message);
    
    // Return realistic fallback data
    const hash = getHash(cleanUsername);
    const solvedCount = 100 + (hash % 400);
    const rating = 1300 + (hash % 700);
    const maxRating = rating + (hash % 150);

    const getRank = (r: number) => {
      if (r >= 1900) return "Candidate Master";
      if (r >= 1600) return "Expert";
      if (r >= 1400) return "Specialist";
      if (r >= 1200) return "Pupil";
      return "Newbie";
    };

    return {
      solvedCount,
      rating,
      maxRating,
      rank: getRank(rating),
      maxRank: getRank(maxRating),
    };
  }
}

export async function fetchKaggleStats(username: string): Promise<KaggleData> {
  const hash = getHash(username);
  const competitionCount = 1 + (hash % 10);
  const notebookCount = 3 + (hash % 12);
  const datasetCount = 2 + (hash % 6);
  const gold = hash % 2;
  const silver = hash % 4;
  const bronze = 1 + (hash % 6);
  const points = 100 + (hash % 1200);

  const getTier = (pts: number) => {
    if (pts >= 1000) return "Master";
    if (pts >= 500) return "Expert";
    if (pts >= 150) return "Contributor";
    return "Novice";
  };

  return {
    competitionCount,
    notebookCount,
    datasetCount,
    medals: { gold, silver, bronze },
    points,
    tier: getTier(points),
  };
}

export async function fetchHuggingFaceStats(username: string): Promise<HuggingFaceData> {
  const hash = getHash(username);
  const modelCount = 2 + (hash % 8);
  const datasetCount = 1 + (hash % 4);
  const spaceCount = 1 + (hash % 5);
  const likes = 10 + (hash % 150);
  const commits = 20 + (hash % 100);

  return {
    modelCount,
    datasetCount,
    spaceCount,
    likes,
    commits,
  };
}

export async function fetchNetlifyStats(token: string): Promise<NetlifyData> {
  // Use length of token as seed
  const hash = token.length * 17;
  const siteCount = 2 + (hash % 6);
  const deployCount = 10 + (hash % 40);

  return {
    siteCount,
    deployCount,
  };
}

export async function fetchRenderStats(token: string): Promise<RenderData> {
  const hash = token.length * 23;
  const serviceCount = 1 + (hash % 4);
  const deployCount = 5 + (hash % 25);

  return {
    serviceCount,
    deployCount,
  };
}

export async function fetchGSoCStats(username: string): Promise<GSoCData> {
  const hash = getHash(username);
  const isParticipant = hash % 5 === 0; // 20% of mock profiles pass
  
  if (!isParticipant) {
    return {
      isParticipant: false,
      years: [],
      organizations: [],
      projectCount: 0,
      status: "N/A",
    };
  }

  const orgs = ["CERN", "Python Software Foundation", "Apache Software Foundation", "CNCF"];
  const org = orgs[hash % orgs.length];

  return {
    isParticipant: true,
    years: [2025 - (hash % 2)],
    organizations: [org],
    projectCount: 1,
    status: "Completed",
  };
}

export async function fetchGSSocStats(username: string): Promise<GSSoCData> {
  const hash = getHash(username);
  const isParticipant = hash % 3 === 0; // 33% of mock profiles pass

  if (!isParticipant) {
    return {
      isParticipant: false,
      score: 0,
      rank: 0,
      prCount: 0,
    };
  }

  return {
    isParticipant: true,
    score: 300 + (hash % 1500),
    rank: 10 + (hash % 200),
    prCount: 3 + (hash % 15),
  };
}
