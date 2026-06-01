import { prisma } from "../db";
import { fetchGitHubStats } from "./github";
import { fetchLeetCodeStats } from "./leetcode";
import { fetchVercelStats } from "./vercel";
import { calculateScore } from "./score";
import { getVectorEmbedding } from "./gemini";
import {
  fetchGitLabStats,
  fetchCodeforcesStats,
  fetchKaggleStats,
  fetchHuggingFaceStats,
  fetchNetlifyStats,
  fetchRenderStats,
  fetchGSoCStats,
  fetchGSSocStats
} from "./newIntegrations";

// Synchronize all developer profiles in the database
export async function syncAllProfiles() {
  console.log("[Scheduler] Starting global profile synchronization...");
  try {
    const profiles = await prisma.developerProfile.findMany({
      include: { user: true }
    });

    console.log(`[Scheduler] Found ${profiles.length} profiles to synchronize.`);

    for (const profile of profiles) {
      try {
        console.log(`[Scheduler] Syncing user: ${profile.user.name} (${profile.githubUsername || "no-github"})...`);

        const githubUsername = profile.githubUsername;
        const leetcodeUsername = profile.leetcodeUsername;
        const vercelToken = profile.vercelToken;
        const gitlabUsername = profile.gitlabUsername;
        const codeforcesUsername = profile.codeforcesUsername;
        const kaggleUsername = profile.kaggleUsername;
        const huggingfaceUsername = profile.huggingfaceUsername;
        const netlifyToken = profile.netlifyToken;
        const renderToken = profile.renderToken;
        const gsocUsername = profile.gsocUsername;
        const gssocUsername = profile.gssocUsername;

        // Fetch crawler stats
        const githubStats = githubUsername 
          ? await fetchGitHubStats(githubUsername) 
          : { commitCount: 0, prCount: 0, prReviewsCount: 0, issuesCount: 0, languages: {}, frameworks: {}, libraries: {}, projects: [] };

        const leetcodeStats = leetcodeUsername
          ? await fetchLeetCodeStats(leetcodeUsername)
          : { totalSolved: 0, easySolved: 0, mediumSolved: 0, hardSolved: 0, contestRating: null, activityStreak: 0 };

        const vercelStats = vercelToken
          ? await fetchVercelStats(vercelToken)
          : { projectCount: 0, deploymentCount: 0 };

        const gitlabStats = gitlabUsername ? await fetchGitLabStats(gitlabUsername) : null;
        const codeforcesStats = codeforcesUsername ? await fetchCodeforcesStats(codeforcesUsername) : null;
        const kaggleStats = kaggleUsername ? await fetchKaggleStats(kaggleUsername) : null;
        const huggingfaceStats = huggingfaceUsername ? await fetchHuggingFaceStats(huggingfaceUsername) : null;
        const netlifyStats = netlifyToken ? await fetchNetlifyStats(netlifyToken) : null;
        const renderStats = renderToken ? await fetchRenderStats(renderToken) : null;
        const gsocStats = gsocUsername ? await fetchGSoCStats(gsocUsername) : null;
        const gssocStats = gssocUsername ? await fetchGSSocStats(gssocUsername) : null;

        // Calculate score
        const scores = calculateScore(
          githubStats,
          leetcodeStats,
          vercelStats,
          gitlabStats,
          codeforcesStats,
          kaggleStats,
          huggingfaceStats,
          netlifyStats,
          renderStats,
          gsocStats,
          gssocStats
        );

        // Update stats
        if (githubUsername) {
          await prisma.gitHubStats.upsert({
            where: { profileId: profile.id },
            update: {
              commitCount: githubStats.commitCount,
              prCount: githubStats.prCount,
              prReviewsCount: githubStats.prReviewsCount,
              issuesCount: githubStats.issuesCount,
              languages: githubStats.languages,
              lastSyncedAt: new Date()
            },
            create: {
              profileId: profile.id,
              commitCount: githubStats.commitCount,
              prCount: githubStats.prCount,
              prReviewsCount: githubStats.prReviewsCount,
              issuesCount: githubStats.issuesCount,
              languages: githubStats.languages
            }
          });

          // Sync repos
          for (const proj of githubStats.projects) {
            const existingProj = await prisma.project.findFirst({
              where: { profileId: profile.id, name: proj.name }
            });

            if (existingProj) {
              await prisma.project.update({
                where: { id: existingProj.id },
                data: {
                  description: proj.description,
                  repoUrl: proj.repoUrl,
                  stars: proj.stars,
                  forks: proj.forks,
                  languages: proj.languages
                }
              });
            } else {
              await prisma.project.create({
                data: {
                  profileId: profile.id,
                  name: proj.name,
                  description: proj.description,
                  repoUrl: proj.repoUrl,
                  stars: proj.stars,
                  forks: proj.forks,
                  languages: proj.languages
                }
              });
            }
          }
        }

        if (leetcodeUsername) {
          await prisma.leetCodeStats.upsert({
            where: { profileId: profile.id },
            update: {
              totalSolved: leetcodeStats.totalSolved,
              easySolved: leetcodeStats.easySolved,
              mediumSolved: leetcodeStats.mediumSolved,
              hardSolved: leetcodeStats.hardSolved,
              contestRating: leetcodeStats.contestRating,
              activityStreak: leetcodeStats.activityStreak,
              lastSyncedAt: new Date()
            },
            create: {
              profileId: profile.id,
              totalSolved: leetcodeStats.totalSolved,
              easySolved: leetcodeStats.easySolved,
              mediumSolved: leetcodeStats.mediumSolved,
              hardSolved: leetcodeStats.hardSolved,
              contestRating: leetcodeStats.contestRating,
              activityStreak: leetcodeStats.activityStreak
            }
          });
        }

        if (vercelToken) {
          await prisma.vercelStats.upsert({
            where: { profileId: profile.id },
            update: {
              projectCount: vercelStats.projectCount,
              deploymentCount: vercelStats.deploymentCount,
              lastSyncedAt: new Date()
            },
            create: {
              profileId: profile.id,
              projectCount: vercelStats.projectCount,
              deploymentCount: vercelStats.deploymentCount
            }
          });
        }

        // Update score and JSON stats fields
        await prisma.developerProfile.update({
          where: { id: profile.id },
          data: {
            overallScore: scores.overallScore,
            hardSkillsScore: scores.hardSkillsScore,
            softSkillsScore: scores.softSkillsScore,
            builderSkillsScore: scores.builderSkillsScore,
            isVerified: (githubStats.commitCount > 50 || (gitlabStats?.commitCount || 0) > 50) && 
                        (leetcodeStats.totalSolved > 10 || (codeforcesStats?.solvedCount || 0) > 10),
            skillsGraph: {
              languages: {
                ...githubStats.languages,
                ...(gitlabStats?.languages || {})
              },
              frameworks: {
                ...githubStats.frameworks,
                ...((gitlabStats as any)?.frameworks || {})
              },
              libraries: {
                ...githubStats.libraries,
                ...((gitlabStats as any)?.libraries || {})
              }
            },
            gitlabStats: gitlabStats ? JSON.parse(JSON.stringify(gitlabStats)) : undefined,
            codeforcesStats: codeforcesStats ? JSON.parse(JSON.stringify(codeforcesStats)) : undefined,
            kaggleStats: kaggleStats ? JSON.parse(JSON.stringify(kaggleStats)) : undefined,
            huggingfaceStats: huggingfaceStats ? JSON.parse(JSON.stringify(huggingfaceStats)) : undefined,
            netlifyStats: netlifyStats ? JSON.parse(JSON.stringify(netlifyStats)) : undefined,
            renderStats: renderStats ? JSON.parse(JSON.stringify(renderStats)) : undefined,
            gsocStats: gsocStats ? JSON.parse(JSON.stringify(gsocStats)) : undefined,
            gssocStats: gssocStats ? JSON.parse(JSON.stringify(gssocStats)) : undefined
          }
        });

        // Regenerate and Save Vibe Hiring Embedding
        const languageList = Object.keys(githubStats.languages).join(", ");
        let bioText = `Developer Profile for ${profile.user.name}.
GitHub username: ${githubUsername || "N/A"}. Commits: ${githubStats.commitCount}. Languages: ${languageList}.
LeetCode solved: ${leetcodeStats.totalSolved}, Contest Rating: ${leetcodeStats.contestRating || "N/A"}.`;
        
        if (gitlabStats) bioText += ` GitLab commits: ${gitlabStats.commitCount}.`;
        if (codeforcesStats) bioText += ` Codeforces rating: ${codeforcesStats.rating} (${codeforcesStats.rank}).`;
        if (kaggleStats) bioText += ` Kaggle tier: ${kaggleStats.tier}, Points: ${kaggleStats.points}.`;
        if (huggingfaceStats) bioText += ` Hugging Face models: ${huggingfaceStats.modelCount}, Likes: ${huggingfaceStats.likes}.`;
        if (netlifyStats) bioText += ` Netlify sites: ${netlifyStats.siteCount}.`;
        if (renderStats) bioText += ` Render services: ${renderStats.serviceCount}.`;
        if (gsocStats?.isParticipant) bioText += ` GSoC Open Source Contributor at ${gsocStats.organizations.join(", ")}.`;
        if (gssocStats?.isParticipant) bioText += ` GSSoC contributor (Rank: ${gssocStats.rank}, Score: ${gssocStats.score}).`;

        bioText += ` Overall Score: ${scores.overallScore}. Hard: ${scores.hardSkillsScore}, Soft: ${scores.softSkillsScore}, Builder: ${scores.builderSkillsScore}.`;

        const vector = await getVectorEmbedding(bioText);
        
        await prisma.profileEmbedding.upsert({
          where: { profileId: profile.id },
          update: {
            embeddingText: bioText,
            updatedAt: new Date()
          },
          create: {
            profileId: profile.id,
            embeddingText: bioText
          }
        });

        try {
          const vectorString = `[${vector.join(",")}]`;
          await prisma.$executeRawUnsafe(
            `UPDATE "ProfileEmbedding" SET embedding = $1::vector WHERE "profileId" = $2`,
            vectorString,
            profile.id
          );
        } catch (e) {
          // ignore extension error in background worker
        }

        console.log(`[Scheduler] Successfully synced: ${profile.user.name}`);
      } catch (err: any) {
        console.error(`[Scheduler] Failed to sync profile ${profile.id}:`, err.message);
      }
    }
    console.log("[Scheduler] Global profile synchronization completed.");
  } catch (error: any) {
    console.error("[Scheduler] Error in global sync schedule:", error.message);
  }
}

// Start recurring synchronization job (every 24 hours)
export function startSyncScheduler() {
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  
  // Set up interval for daily execution
  setInterval(async () => {
    await syncAllProfiles();
  }, TWENTY_FOUR_HOURS);

  console.log("[Scheduler] Daily profile synchronization scheduler initialized.");
}
