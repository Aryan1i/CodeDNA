import { GitHubData } from "./github";
import { LeetCodeData } from "./leetcode";
import { VercelData } from "./vercel";
import { 
  GitLabData, 
  CodeforcesData, 
  KaggleData, 
  HuggingFaceData, 
  NetlifyData, 
  RenderData, 
  GSoCData, 
  GSSoCData 
} from "./newIntegrations";

export interface ScoreResult {
  overallScore: number;
  hardSkillsScore: number;
  softSkillsScore: number;
  builderSkillsScore: number;
}

export function calculateScore(
  github: GitHubData,
  leetcode: LeetCodeData,
  vercel: VercelData,
  gitlab: GitLabData | null,
  codeforces: CodeforcesData | null,
  kaggle: KaggleData | null,
  huggingface: HuggingFaceData | null,
  netlify: NetlifyData | null,
  render: RenderData | null,
  gsoc: GSoCData | null,
  gssoc: GSSoCData | null
): ScoreResult {
  // ==========================================
  // 1. HARD SKILLS SCORE (30% weight)
  // ==========================================
  // Repo Part (50% of Hard Skills) - Combined GitHub + GitLab
  const commitsSum = github.commitCount + (gitlab?.commitCount || 0);
  const commitPoints = Math.min(commitsSum / 300, 1) * 25; // 300+ combined commits = 25 pts
  
  // Combine language bytes/counts
  const allLanguages = { ...github.languages };
  if (gitlab?.languages) {
    for (const [lang, bytes] of Object.entries(gitlab.languages)) {
      allLanguages[lang] = (allLanguages[lang] || 0) + bytes;
    }
  }
  const languagePoints = Math.min(Object.keys(allLanguages).length / 4, 1) * 25; // 4+ languages = 25 pts
  const repoHardScore = commitPoints + languagePoints;

  // DSA / ML Part (50% of Hard Skills) - Combined LeetCode, Codeforces, Kaggle, Hugging Face
  let dsaSolvedPoints = 0;
  let contestPoints = 0;

  // Normalized Codeforces solves vs LeetCode solves
  const lcEasy = leetcode.easySolved;
  const lcMed = leetcode.mediumSolved;
  const lcHard = leetcode.hardSolved;
  
  const cfSolvedCount = codeforces?.solvedCount || 0;
  // Estimate CF solved splits: 40% easy, 50% medium, 10% hard
  const cfEasy = Math.round(cfSolvedCount * 0.4);
  const cfMed = Math.round(cfSolvedCount * 0.5);
  const cfHard = Math.round(cfSolvedCount * 0.1);

  const totalEasy = lcEasy + cfEasy;
  const totalMed = lcMed + cfMed;
  const totalHard = lcHard + cfHard;

  const leetCodeRatingPoints = leetcode.contestRating !== null 
    ? Math.min(Math.max(leetcode.contestRating - 1200, 0) / 800, 1) * 30 
    : 0;

  const codeforcesRatingPoints = codeforces !== null
    ? Math.min(Math.max(codeforces.rating - 1000, 0) / 1000, 1) * 30
    : 0;

  const maxRatingPoints = Math.max(leetCodeRatingPoints, codeforcesRatingPoints);

  if (leetcode.contestRating !== null || codeforces !== null) {
    // If they have rating: rating is 30% of rating/solve score, solves are 70%
    const easyVal = Math.min(totalEasy / 100, 1) * 20; 
    const medVal = Math.min(totalMed / 70, 1) * 35;  
    const hardVal = Math.min(totalHard / 15, 1) * 15;   
    dsaSolvedPoints = easyVal + medVal + hardVal;
    contestPoints = maxRatingPoints;
  } else {
    // No rating: solves are 100%
    const easyVal = Math.min(totalEasy / 100, 1) * 30; 
    const medVal = Math.min(totalMed / 70, 1) * 50;  
    const hardVal = Math.min(totalHard / 15, 1) * 20;   
    dsaSolvedPoints = easyVal + medVal + hardVal;
  }

  // Active streak bonus: up to 10 points
  const streakBonus = Math.min(leetcode.activityStreak / 30, 1) * 10;
  
  // Kaggle ML baseline points: expert or master tier adds direct points to hard skills
  let mlBonus = 0;
  if (kaggle) {
    if (kaggle.tier === "Master") mlBonus += 15;
    else if (kaggle.tier === "Expert") mlBonus += 10;
    else if (kaggle.tier === "Contributor") mlBonus += 5;
  }

  const dsaMlHardScore = Math.min(dsaSolvedPoints + contestPoints + streakBonus + mlBonus, 100);
  const hardSkillsScore = Math.round((repoHardScore + dsaMlHardScore) * 10) / 10;

  // ==========================================
  // 2. SOFT SKILLS SCORE (40% weight)
  // ==========================================
  // Measures collaboration signals via GitHub, GitLab, GSoC, and GSSoC
  const combinedReviews = github.prReviewsCount + (gitlab?.prReviewsCount || 0);
  const combinedPrs = github.prCount + (gitlab?.prCount || 0);
  const combinedIssues = github.issuesCount + (gitlab?.issuesCount || 0);

  const reviewPoints = Math.min(combinedReviews / 15, 1) * 45; // 15 reviews = 45 pts
  const prCreationPoints = Math.min(combinedPrs / 25, 1) * 40;   // 25 PRs = 40 pts
  const issuePoints = Math.min(combinedIssues / 10, 1) * 15;     // 10 issues = 15 pts
  
  let collaborationScore = reviewPoints + prCreationPoints + issuePoints;

  // GSoC / GSSoC Open Source Program Soft Skills Boost (Collaboration proof)
  if (gsoc?.isParticipant) {
    collaborationScore += 30; // 30 points flat boost for GSoC accepted project
  }
  if (gssoc?.isParticipant) {
    collaborationScore += 15; // 15 points flat boost for GSSoC contribution
  }

  const softSkillsScore = Math.round(Math.min(collaborationScore, 100) * 10) / 10;

  // ==========================================
  // 3. BUILDER SKILLS SCORE (30% weight)
  // ==========================================
  // Measures deployment, project completion across Vercel, Netlify, Render
  const totalSites = vercel.projectCount + (netlify?.siteCount || 0) + (render?.serviceCount || 0);
  const totalDeploys = vercel.deploymentCount + (netlify?.deployCount || 0) + (render?.deployCount || 0);

  const projectPoints = Math.min(totalSites / 4, 1) * 40;       // 4 sites = 40 pts
  const deploymentPoints = Math.min(totalDeploys / 25, 1) * 40; // 25 deploys = 40 pts

  // Popularity/Star power from GitHub/GitLab
  let totalStars = 0;
  for (const proj of github.projects) {
    totalStars += proj.stars;
  }
  if (gitlab?.projects) {
    for (const proj of gitlab.projects) {
      totalStars += proj.stars;
    }
  }
  const popularityPoints = Math.min(totalStars / 20, 1) * 20; // 20 stars = 20 pts

  // ML models & datasets deployment on Hugging Face & Kaggle Notebooks count
  let mlDeployPoints = 0;
  if (huggingface) {
    const hfProjects = huggingface.modelCount + huggingface.spaceCount;
    mlDeployPoints = Math.min(hfProjects / 4, 1) * 20; // 4 HF models/spaces = 20 pts
  }

  const bestBuilderBonusPoints = Math.max(popularityPoints, mlDeployPoints);
  const builderSkillsScore = Math.round((projectPoints + deploymentPoints + bestBuilderBonusPoints) * 10) / 10;

  // ==========================================
  // OVERALL SCORE CALCULATION (30 / 40 / 30)
  // ==========================================
  const rawOverall = (hardSkillsScore * 0.3) + (softSkillsScore * 0.4) + (builderSkillsScore * 0.3);
  const overallScore = Math.round(rawOverall * 10) / 10;

  return {
    overallScore,
    hardSkillsScore,
    softSkillsScore,
    builderSkillsScore,
  };
}
