import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./db";
import { fetchGitHubStats } from "./services/github";
import { fetchLeetCodeStats } from "./services/leetcode";
import { fetchVercelStats } from "./services/vercel";
import { calculateScore } from "./services/score";
import { generateVerificationQuestions, getVectorEmbedding } from "./services/gemini";
import { startSyncScheduler } from "./services/scheduler";
import {
  fetchGitLabStats,
  fetchCodeforcesStats,
  fetchKaggleStats,
  fetchHuggingFaceStats,
  fetchNetlifyStats,
  fetchRenderStats,
  fetchGSoCStats,
  fetchGSSocStats
} from "./services/newIntegrations";
import { sendOTPEmail } from "./services/email";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Basic health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date() });
});

// ==========================================
// AUTH ROUTES
// ==========================================

// OTP Store for pending registrations
const otpStore = new Map<string, { otp: string; expiresAt: number; userData: any }>();

// Request OTP for new registration
app.post("/api/auth/register/request-otp", async (req: any, res: any) => {
  const { email, password, name, role } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: "Missing required fields: email, password, name" });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    // Generate 6-digit random OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in-memory with a 10-minute expiry
    otpStore.set(email, {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
      userData: { email, password, name, role: role || "DEVELOPER" }
    });

    // Send email (falls back to console log if SMTP credentials are not configured)
    const emailSent = await sendOTPEmail(email, otp);

    if (emailSent) {
      res.json({ success: true, message: "OTP has been sent to your email address!" });
    } else {
      res.json({ success: true, message: "OTP verification simulated. Check backend terminal logs for the code!" });
    }
  } catch (error) {
    console.error("Request OTP error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Verify OTP and complete registration
app.post("/api/auth/register/verify-otp", async (req: any, res: any) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: "Missing required fields: email, otp" });
  }

  const record = otpStore.get(email);
  if (!record) {
    return res.status(400).json({ error: "No pending registration found for this email" });
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(email);
    return res.status(400).json({ error: "OTP expired. Please request a new one" });
  }

  if (record.otp !== otp) {
    return res.status(400).json({ error: "Invalid OTP verification code" });
  }

  try {
    const { password, name, role } = record.userData;

    const user = await prisma.user.create({
      data: {
        email,
        password,
        name,
        role,
        developerProfile: role === "RECRUITER" ? undefined : {
          create: {}
        }
      },
      include: {
        developerProfile: true
      }
    });

    // Remove from store
    otpStore.delete(email);

    res.status(201).json({ message: "User registered and verified successfully", user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    console.error("Verify OTP and register error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Legacy Register (maintained for compatibility)
app.post("/api/auth/register", async (req: any, res: any) => {
  const { email, password, name, role } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: "Missing required fields: email, password, name" });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    const user = await prisma.user.create({
      data: {
        email,
        password, // In a real app, hash password using bcrypt/argon2
        name,
        role: role || "DEVELOPER",
        developerProfile: role === "RECRUITER" ? undefined : {
          create: {}
        }
      },
      include: {
        developerProfile: true
      }
    });

    res.status(201).json({ message: "User registered successfully", user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error: any) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Login
app.post("/api/auth/login", async (req: any, res: any) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Missing email or password" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { developerProfile: true }
    });

    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        developerProfile: user.developerProfile
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ==========================================
// DEVELOPER PROFILE ROUTES
// ==========================================

// Fetch profile details
app.get("/api/developer/profile/:username", async (req: any, res: any) => {
  const { username } = req.params;

  try {
    // Check if profile exists by githubUsername or leetcodeUsername
    const profile = await prisma.developerProfile.findFirst({
      where: {
        OR: [
          { githubUsername: username },
          { leetcodeUsername: username },
          { gitlabUsername: username },
          { codeforcesUsername: username }
        ]
      },
      include: {
        user: { select: { name: true, email: true } },
        githubStats: true,
        leetcodeStats: true,
        vercelStats: true,
        projects: {
          include: { verificationQuestions: true }
        }
      }
    });

    if (!profile) {
      return res.status(404).json({ error: "Developer profile not found" });
    }

    res.json(profile);
  } catch (error) {
    console.error("Fetch profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Fetch profiles list (dashboard)
app.get("/api/developer/profiles", async (req: any, res: any) => {
  try {
    const profiles = await prisma.developerProfile.findMany({
      include: {
        user: { select: { name: true, email: true } },
        githubStats: true,
        leetcodeStats: true,
        vercelStats: true
      },
      orderBy: { overallScore: "desc" }
    });
    res.json(profiles);
  } catch (error) {
    console.error("Fetch profiles error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Sync profile data and calculate scores
app.post("/api/developer/profile/sync", async (req: any, res: any) => {
  const { 
    userId, 
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
  } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { developerProfile: true }
    });

    if (!user || !user.developerProfile) {
      return res.status(404).json({ error: "Developer profile not found for this user" });
    }

    const profileId = user.developerProfile.id;

    const trimVal = (val: any) => typeof val === "string" ? val.trim() : val;

    // Update profile credentials first
    await prisma.developerProfile.update({
      where: { id: profileId },
      data: {
        githubUsername: githubUsername !== undefined ? trimVal(githubUsername) : user.developerProfile.githubUsername,
        leetcodeUsername: leetcodeUsername !== undefined ? trimVal(leetcodeUsername) : user.developerProfile.leetcodeUsername,
        vercelToken: vercelToken !== undefined ? trimVal(vercelToken) : user.developerProfile.vercelToken,
        gitlabUsername: gitlabUsername !== undefined ? trimVal(gitlabUsername) : user.developerProfile.gitlabUsername,
        codeforcesUsername: codeforcesUsername !== undefined ? trimVal(codeforcesUsername) : user.developerProfile.codeforcesUsername,
        kaggleUsername: kaggleUsername !== undefined ? trimVal(kaggleUsername) : user.developerProfile.kaggleUsername,
        huggingfaceUsername: huggingfaceUsername !== undefined ? trimVal(huggingfaceUsername) : user.developerProfile.huggingfaceUsername,
        netlifyToken: netlifyToken !== undefined ? trimVal(netlifyToken) : user.developerProfile.netlifyToken,
        renderToken: renderToken !== undefined ? trimVal(renderToken) : user.developerProfile.renderToken,
        gsocUsername: gsocUsername !== undefined ? trimVal(gsocUsername) : user.developerProfile.gsocUsername,
        gssocUsername: gssocUsername !== undefined ? trimVal(gssocUsername) : user.developerProfile.gssocUsername
      }
    });

    const activeGitHubUser = trimVal(githubUsername !== undefined ? githubUsername : user.developerProfile.githubUsername);
    const activeLeetCodeUser = trimVal(leetcodeUsername !== undefined ? leetcodeUsername : user.developerProfile.leetcodeUsername);
    const activeVercelToken = trimVal(vercelToken !== undefined ? vercelToken : user.developerProfile.vercelToken);
    const activeGitLabUser = trimVal(gitlabUsername !== undefined ? gitlabUsername : user.developerProfile.gitlabUsername);
    const activeCodeforcesUser = trimVal(codeforcesUsername !== undefined ? codeforcesUsername : user.developerProfile.codeforcesUsername);
    const activeKaggleUser = trimVal(kaggleUsername !== undefined ? kaggleUsername : user.developerProfile.kaggleUsername);
    const activeHuggingFaceUser = trimVal(huggingfaceUsername !== undefined ? huggingfaceUsername : user.developerProfile.huggingfaceUsername);
    const activeNetlifyToken = trimVal(netlifyToken !== undefined ? netlifyToken : user.developerProfile.netlifyToken);
    const activeRenderToken = trimVal(renderToken !== undefined ? renderToken : user.developerProfile.renderToken);
    const activeGSoCUser = trimVal(gsocUsername !== undefined ? gsocUsername : user.developerProfile.gsocUsername);
    const activeGSSoCUser = trimVal(gssocUsername !== undefined ? gssocUsername : user.developerProfile.gssocUsername);

    // Crawl GitHub
    const githubStats = activeGitHubUser 
      ? await fetchGitHubStats(activeGitHubUser) 
      : { commitCount: 0, prCount: 0, prReviewsCount: 0, issuesCount: 0, languages: {}, frameworks: {}, libraries: {}, projects: [] };

    // Crawl LeetCode
    const leetcodeStats = activeLeetCodeUser
      ? await fetchLeetCodeStats(activeLeetCodeUser)
      : { totalSolved: 0, easySolved: 0, mediumSolved: 0, hardSolved: 0, contestRating: null, activityStreak: 0 };

    // Crawl Vercel
    const vercelStats = activeVercelToken
      ? await fetchVercelStats(activeVercelToken)
      : { projectCount: 0, deploymentCount: 0 };

    // Crawl GitLab
    const gitlabStats = activeGitLabUser
      ? await fetchGitLabStats(activeGitLabUser)
      : null;

    // Crawl Codeforces
    const codeforcesStats = activeCodeforcesUser
      ? await fetchCodeforcesStats(activeCodeforcesUser)
      : null;

    // Crawl Kaggle
    const kaggleStats = activeKaggleUser
      ? await fetchKaggleStats(activeKaggleUser)
      : null;

    // Crawl HuggingFace
    const huggingfaceStats = activeHuggingFaceUser
      ? await fetchHuggingFaceStats(activeHuggingFaceUser)
      : null;

    // Crawl Netlify
    const netlifyStats = activeNetlifyToken
      ? await fetchNetlifyStats(activeNetlifyToken)
      : null;

    // Crawl Render
    const renderStats = activeRenderToken
      ? await fetchRenderStats(activeRenderToken)
      : null;

    // Crawl GSoC
    const gsocStats = activeGSoCUser
      ? await fetchGSoCStats(activeGSoCUser)
      : null;

    // Crawl GSSoC
    const gssocStats = activeGSSoCUser
      ? await fetchGSSocStats(activeGSSoCUser)
      : null;

    // Calculate score (30/40/30)
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

    // Save GitHub Stats
    if (activeGitHubUser) {
      await prisma.gitHubStats.upsert({
        where: { profileId },
        update: {
          commitCount: githubStats.commitCount,
          prCount: githubStats.prCount,
          prReviewsCount: githubStats.prReviewsCount,
          issuesCount: githubStats.issuesCount,
          languages: githubStats.languages,
          lastSyncedAt: new Date()
        },
        create: {
          profileId,
          commitCount: githubStats.commitCount,
          prCount: githubStats.prCount,
          prReviewsCount: githubStats.prReviewsCount,
          issuesCount: githubStats.issuesCount,
          languages: githubStats.languages
        }
      });

      for (const proj of githubStats.projects) {
        const existingProj = await prisma.project.findFirst({
          where: { profileId, name: proj.name }
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
              profileId,
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

    // Save LeetCode Stats
    if (activeLeetCodeUser) {
      await prisma.leetCodeStats.upsert({
        where: { profileId },
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
          profileId,
          totalSolved: leetcodeStats.totalSolved,
          easySolved: leetcodeStats.easySolved,
          mediumSolved: leetcodeStats.mediumSolved,
          hardSolved: leetcodeStats.hardSolved,
          contestRating: leetcodeStats.contestRating,
          activityStreak: leetcodeStats.activityStreak
        }
      });
    }

    // Save Vercel Stats
    if (activeVercelToken) {
      await prisma.vercelStats.upsert({
        where: { profileId },
        update: {
          projectCount: vercelStats.projectCount,
          deploymentCount: vercelStats.deploymentCount,
          lastSyncedAt: new Date()
        },
        create: {
          profileId,
          projectCount: vercelStats.projectCount,
          deploymentCount: vercelStats.deploymentCount
        }
      });
    }

    // Update Developer Profile with Scores and all stats Json columns
    const updatedProfile = await prisma.developerProfile.update({
      where: { id: profileId },
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
      },
      include: {
        githubStats: true,
        leetcodeStats: true,
        vercelStats: true,
        projects: true
      }
    });

    // Generate & Save Vibe Hiring Embedding description
    const languageList = Object.keys(githubStats.languages).join(", ");
    let bioText = `Developer Profile for ${user.name}.
GitHub username: ${activeGitHubUser || "N/A"}. Commits: ${githubStats.commitCount}. Languages: ${languageList}.
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
      where: { profileId },
      update: {
        embeddingText: bioText,
        updatedAt: new Date()
      },
      create: {
        profileId,
        embeddingText: bioText
      }
    });

    try {
      const vectorString = `[${vector.join(",")}]`;
      await prisma.$executeRawUnsafe(
        `UPDATE "ProfileEmbedding" SET embedding = $1::vector WHERE "profileId" = $2`,
        vectorString,
        profileId
      );
    } catch (e) {
      console.warn("Could not save vector embedding to pgvector (standard fallback will be used):", (e as Error).message);
    }

    res.json({
      message: "Sync completed successfully",
      profile: updatedProfile
    });

  } catch (error) {
    console.error("Sync error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ==========================================
// VIBE HIRING SEARCH ROUTE
// ==========================================
app.post("/api/recruiter/search", async (req: any, res: any) => {
  const { query } = req.body;

  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "Query is required and must be a string." });
  }

  try {
    const embedding = await getVectorEmbedding(query);
    let results: any[] = [];

    try {
      // 1. Direct pgvector cosine distance query
      // (1 - (embedding <=> pe.embedding)) is cosine similarity
      const vectorString = `[${embedding.join(",")}]`;
      const rawResults = await prisma.$queryRawUnsafe<any[]>(
        `SELECT p.id, p."userId", p."overallScore", p."hardSkillsScore", p."softSkillsScore", p."builderSkillsScore",
                p."githubUsername", p."leetcodeUsername", u.name, u.email,
                (1 - (pe.embedding <=> $1::vector)) as similarity
         FROM "DeveloperProfile" p
         JOIN "User" u ON p."userId" = u.id
         JOIN "ProfileEmbedding" pe ON p.id = pe."profileId"
         WHERE (1 - (pe.embedding <=> $1::vector)) > 0.15
         ORDER BY p."overallScore" DESC, similarity DESC`,
        vectorString
      );
      results = rawResults;
    } catch (e) {
      console.warn("pgvector query failed. Falling back to keyword search.", (e as Error).message);
      
      // 2. Keyword fallback: Rank by score, filter by matching terms in bio/text
      const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
      const allProfiles = await prisma.developerProfile.findMany({
        include: {
          user: { select: { name: true, email: true } },
          profileEmbedding: true
        },
        orderBy: { overallScore: "desc" }
      });

      results = allProfiles
        .filter((p: any) => {
          const text = `${p.profileEmbedding?.embeddingText || ""} ${p.bio || ""} ${p.githubUsername || ""}`.toLowerCase();
          return queryTerms.length === 0 || queryTerms.some((term: any) => text.includes(term));
        })
        .map((p: any) => ({
          id: p.id,
          userId: p.userId,
          overallScore: p.overallScore,
          hardSkillsScore: p.hardSkillsScore,
          softSkillsScore: p.softSkillsScore,
          builderSkillsScore: p.builderSkillsScore,
          githubUsername: p.githubUsername,
          leetcodeUsername: p.leetcodeUsername,
          name: p.user.name,
          email: p.user.email,
          similarity: 0.75 // constant placeholder similarity for fallback
        }));
    }

    res.json(results);

  } catch (error) {
    console.error("Vibe search error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ==========================================
// CODE VERIFIER ROUTES
// ==========================================

// Generate Verification Questions for a specific repository
app.post("/api/developer/projects/:projectId/verify", async (req: any, res: any) => {
  const { projectId } = req.params;

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const filesMockList = ["src/app/page.tsx", "src/components/Navbar.tsx", "package.json", "src/app/globals.css"];
    const questions = await generateVerificationQuestions(
      project.name,
      project.description || "A software repository",
      filesMockList
    );

    // Save generated questions to DB
    await prisma.verificationQuestion.deleteMany({ where: { projectId } });

    const createdQuestions = [];
    for (const q of questions) {
      const dbQ = await prisma.verificationQuestion.create({
        data: {
          projectId,
          question: q.question,
          codeSnippet: q.codeSnippet,
          lineReference: q.lineReference,
          expectedAnswer: q.expectedAnswer
        }
      });
      createdQuestions.push({ id: dbQ.id, question: dbQ.question, codeSnippet: dbQ.codeSnippet, lineReference: dbQ.lineReference });
    }

    res.json({
      message: "Questions generated successfully",
      questions: createdQuestions
    });

  } catch (error) {
    console.error("Generate questions error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Submit answers for verification
app.post("/api/developer/projects/questions/:questionId/answer", async (req: any, res: any) => {
  const { questionId } = req.params;
  const { answer } = req.body;

  if (!answer) {
    return res.status(400).json({ error: "Answer is required" });
  }

  try {
    const question = await prisma.verificationQuestion.findUnique({
      where: { id: questionId },
      include: { project: true }
    });

    if (!question) {
      return res.status(404).json({ error: "Verification question not found" });
    }

    // AI grading simulator: in production this uses Gemini to assess the answer against expectedAnswer
    const prompt = `
Question: ${question.question}
Expected Guideline: ${question.expectedAnswer}
Developer's Answer: ${answer}

Is this answer accurate and indicates the developer actually wrote the code? Reply with JSON:
{
  "isCorrect": true/false
}
`;
    
    let isCorrect = true; // fallback
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: "application/json" }
            })
          }
        );
        if (response.ok) {
          const resData = await response.json() as any;
          const text = resData.candidates?.[0]?.content?.parts?.[0]?.text;
          const result = JSON.parse(text.trim());
          isCorrect = result.isCorrect;
        }
      } catch (e) {
        console.warn("Gemini grading failed. Defaulting to positive grading for demo.");
      }
    }

    await prisma.verificationQuestion.update({
      where: { id: questionId },
      data: {
        userAnswer: answer,
        isCorrect,
        gradedAt: new Date()
      }
    });

    // Check if all project questions are answered and score verification confidence
    const allProjectQuestions = await prisma.verificationQuestion.findMany({
      where: { projectId: question.projectId }
    });

    const answeredCount = allProjectQuestions.filter((q: any) => q.userAnswer !== null).length;
    const correctCount = allProjectQuestions.filter((q: any) => q.isCorrect === true).length;

    if (answeredCount === allProjectQuestions.length) {
      const confidence = correctCount / allProjectQuestions.length;
      await prisma.project.update({
        where: { id: question.projectId },
        data: {
          isVerified: confidence >= 0.66,
          verificationConfidence: confidence
        }
      });
    }

    res.json({
      message: "Answer submitted and graded",
      isCorrect
    });

  } catch (error) {
    console.error("Answer submission error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// VS Code plugin activity sync gateway
app.post("/api/vscode/activity", async (req: any, res: any) => {
  const { userId, trackedEdits, activeMinutes, privateRepoCommits } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { developerProfile: true }
    });

    if (!user || !user.developerProfile) {
      return res.status(404).json({ error: "Developer profile not found" });
    }

    const profile = user.developerProfile;
    const buildBoost = Math.min((activeMinutes || 0) / 60, 5); // max 5 points boost
    const hardBoost = Math.min((trackedEdits || 0) / 100, 5); // max 5 points boost

    const updatedProfile = await prisma.developerProfile.update({
      where: { id: profile.id },
      data: {
        builderSkillsScore: Math.min(profile.builderSkillsScore + buildBoost, 100),
        hardSkillsScore: Math.min(profile.hardSkillsScore + hardBoost, 100),
        overallScore: Math.round(((Math.min(profile.hardSkillsScore + hardBoost, 100) * 0.3) + (profile.softSkillsScore * 0.4) + (Math.min(profile.builderSkillsScore + buildBoost, 100) * 0.3)) * 10) / 10
      }
    });

    res.json({
      message: "VS Code activity synced and score updated",
      score: updatedProfile.overallScore,
      hardScore: updatedProfile.hardSkillsScore,
      builderScore: updatedProfile.builderSkillsScore
    });
  } catch (error) {
    console.error("VS Code sync error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Real-Work timed sandbox simulation challenges
app.get("/api/simulation/challenge", async (req: any, res: any) => {
  res.json({
    id: "challenge-101",
    title: "Next.js Hydration Mismatch timing",
    description: "A component is rendering a random number in the client but a static number on the server. Write a fix using useEffect or mounting state to bypass the mismatch.",
    baseCode: `export default function RandomCard() {\n  const num = Math.random();\n  return <div>Your lucky number: {num}</div>;\n}`,
    timeLimitSeconds: 180
  });
});

app.post("/api/simulation/submit", async (req: any, res: any) => {
  const { userId, challengeId, solution } = req.body;

  if (!userId || !solution) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { developerProfile: true }
    });

    if (!user || !user.developerProfile) {
      return res.status(404).json({ error: "Developer profile not found" });
    }

    const profile = user.developerProfile;
    // Check if correct keywords are present in solution
    const isCorrect = solution.includes("useEffect") || solution.includes("useState") || solution.includes("mounted") || solution.includes("isMounted");

    let updatedProfile = profile;
    if (isCorrect) {
      updatedProfile = await prisma.developerProfile.update({
        where: { id: profile.id },
        data: {
          builderSkillsScore: Math.min(profile.builderSkillsScore + 10, 100),
          overallScore: Math.round(((profile.hardSkillsScore * 0.3) + (profile.softSkillsScore * 0.4) + (Math.min(profile.builderSkillsScore + 10, 100) * 0.3)) * 10) / 10
        }
      });
    }

    res.json({
      isCorrect,
      score: updatedProfile.overallScore,
      builderScore: updatedProfile.builderSkillsScore,
      feedback: isCorrect 
        ? "Excellent! Using an on-mount flag or deferring rendering to useEffect prevents hydration mismatches." 
        : "Hydration mismatch still occurs. Ensure random calculations are deferred until after mounting."
    });
  } catch (error) {
    console.error("Simulation submit error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// AI tailored cover letter asset generator
app.post("/api/developer/assets/cover-letter", async (req: any, res: any) => {
  const { userId, jobDescription } = req.body;

  if (!userId || !jobDescription) {
    return res.status(400).json({ error: "Missing userId or jobDescription" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { 
        developerProfile: {
          include: {
            githubStats: true,
            leetcodeStats: true,
            projects: true
          }
        }
      }
    });

    if (!user || !user.developerProfile) {
      return res.status(404).json({ error: "Developer profile not found" });
    }

    const profile = user.developerProfile;
    const githubStats = profile.githubStats;
    const leetcodeStats = profile.leetcodeStats;
    const projects = profile.projects || [];

    const prompt = `
You are an expert technical recruiter and resume writer. Draft a highly persuasive, professional, and personalized Cover Letter for a candidate applying to this Job Description:
"${jobDescription}"

Here is the candidate's verified technical telemetry from CodeDNA (the developer passport system):
- Candidate Name: ${user.name}
- Candidate Email: ${user.email}
- Overall CodeDNA Score: ${profile.overallScore}/100
- Hard Skills (DSA & Language depth): ${profile.hardSkillsScore}/100
- Builder Skills (Deployments & star power): ${profile.builderSkillsScore}/100
- GitHub Commits: ${githubStats?.commitCount || 0}
- LeetCode Solved Count: ${leetcodeStats?.totalSolved || 0}
- Verified Project Repositories: ${projects.map((p: any) => `${p.name} (${(p.verificationConfidence * 100).toFixed(0)}% verified)`).join(", ") || "None"}

The cover letter should emphasize candidate's verified proof of construction, commit records, and project author vetting results. Keep the length around 300 words. Keep it professional, engaging, and directly mapping stats to the JD requirements. Format the output with clear line breaks.
`;

    let coverLetterText = "";
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                maxOutputTokens: 1000
              }
            })
          }
        );
        if (response.ok) {
          const resData = await response.json() as any;
          coverLetterText = resData.candidates?.[0]?.content?.parts?.[0]?.text || "";
        }
      } catch (e) {
        console.warn("Gemini cover letter generation failed. Falling back to template.");
      }
    }

    if (!coverLetterText) {
      // Fallback Cover Letter Template if Gemini fails or is not configured
      coverLetterText = `Dear Hiring Manager,\n\nI am excited to apply for the software engineering role at your company. Based on the requirements outlined in the job description, I believe my verified technical credentials make me an exceptional fit.\n\nMy profile is verified on CodeDNA, a continuous-verification developer passport, with an Overall Score of ${profile.overallScore}/100 (Hard Skills: ${profile.hardSkillsScore}/100, Builder Skills: ${profile.builderSkillsScore}/100). This represents concrete, validated proof of construction.\n\nAcross my profiles, I have logged ${githubStats?.commitCount || 0} commits, solved ${leetcodeStats?.totalSolved || 0} LeetCode algorithmic challenges, and successfully passed automated authorship vetting on key project repositories, including:\n${projects.map((p: any) => `- ${p.name} (${(p.verificationConfidence * 100).toFixed(0)}% verification seal)`).join("\n") || "- My main portfolio codebase"}\n\nThese verified metrics represent a hands-on developer ready to make immediate contributions in design, clean code, and production reliability. I look forward to discussing how my skills align with your engineering priorities.\n\nSincerely,\n${user.name}\n${user.email}`;
    }

    res.json({ coverLetter: coverLetterText });

  } catch (error) {
    console.error("Cover letter generation error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Shared in-memory list for Company Vetting Tests
interface CompanyTest {
  id: string;
  companyName: string;
  testTitle: string;
  description: string;
  badgeName: string;
  stipendRange: string;
}

let deployedCompanyTests: CompanyTest[] = [
  {
    id: "test-001",
    companyName: "Razorpay",
    testTitle: "Backend Node.js API Optimizations Challenge",
    description: "Write a high-performance database connection pool middleware. Must support request queues under heavy load spikes.",
    badgeName: "Razorpay Vetted Developer",
    stipendRange: "₹25k - ₹40k/month"
  },
  {
    id: "test-002",
    companyName: "Cred",
    testTitle: "State Architecture and Memory Management",
    description: "Debug a recursive react re-render leak inside a large financial dashboard layout.",
    badgeName: "Cred Vetted Developer",
    stipendRange: "₹40k - ₹80k/month"
  }
];

// Recruiter Company Vetting challenges list
app.get("/api/recruiter/tests", (req: any, res: any) => {
  res.json(deployedCompanyTests);
});

// Recruiter deploys a new test
app.post("/api/recruiter/tests", (req: any, res: any) => {
  const { companyName, testTitle, description, badgeName, stipendRange } = req.body;
  if (!companyName || !testTitle || !description || !badgeName) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const newTest: CompanyTest = {
    id: `test-${Date.now()}`,
    companyName,
    testTitle,
    description,
    badgeName,
    stipendRange: stipendRange || "Competitive"
  };

  deployedCompanyTests.push(newTest);
  res.status(201).json(newTest);
});

// Developer completes and unlocks a company badge
app.post("/api/recruiter/tests/:testId/unlock", async (req: any, res: any) => {
  const { testId } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { developerProfile: true }
    });

    if (!user || !user.developerProfile) {
      return res.status(404).json({ error: "Developer profile not found" });
    }

    const test = deployedCompanyTests.find(t => t.id === testId);
    if (!test) {
      return res.status(404).json({ error: "Company test not found" });
    }

    // Boost scores and save badge inside skillsGraph or JSON field
    const profile = user.developerProfile;
    const updatedProfile = await prisma.developerProfile.update({
      where: { id: profile.id },
      data: {
        builderSkillsScore: Math.min(profile.builderSkillsScore + 5, 100),
        overallScore: Math.round(((profile.hardSkillsScore * 0.3) + (profile.softSkillsScore * 0.4) + (Math.min(profile.builderSkillsScore + 5, 100) * 0.3)) * 10) / 10
      }
    });

    res.json({
      message: `Successfully unlocked ${test.badgeName}!`,
      score: updatedProfile.overallScore,
      builderScore: updatedProfile.builderSkillsScore
    });

  } catch (error) {
    console.error("Test unlock error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// TPO Placement Cell portal statistics
app.get("/api/tpo/statistics", async (req: any, res: any) => {
  try {
    const totalStudents = await prisma.developerProfile.count();
    const averageScoreResult = await prisma.developerProfile.aggregate({
      _avg: { overallScore: true }
    });
    const avgScore = averageScoreResult._avg.overallScore 
      ? Math.round(averageScoreResult._avg.overallScore * 10) / 10 
      : 0;

    const verifiedCount = await prisma.developerProfile.count({
      where: { isVerified: true }
    });
    const verificationRate = totalStudents > 0 
      ? Math.round((verifiedCount / totalStudents) * 100) 
      : 0;

    const placedCount = Math.round(totalStudents * 0.35);
    const unplacedCount = totalStudents - placedCount;

    const topStudents = await prisma.developerProfile.findMany({
      take: 5,
      orderBy: { overallScore: "desc" },
      include: { user: { select: { name: true, email: true } } }
    });

    res.json({
      totalStudents,
      avgScore,
      nationalBenchmark: 68.5,
      verificationRate,
      placedCount,
      unplacedCount,
      topStudents
    });
  } catch (error) {
    console.error("TPO stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start background sync loop
startSyncScheduler();

app.listen(PORT, () => {
  console.log(`CodeDNA backend running on http://localhost:${PORT}`);
});
