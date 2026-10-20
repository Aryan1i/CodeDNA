# 🧬 CodeDNA — Get Hired for What You Build

<p align="center">
  <strong>The Developer Passport & Verified Talent Ecosystem</strong>
  <br />
  Connecting developers with opportunities through verified skills, real-world projects, and engineering ability.
</p>

<p align="center">
  <em>Get hired for what you build, not where you study.</em>
</p>

---

## 🚀 About CodeDNA

**CodeDNA** is a developer identity and talent platform designed to bridge the gap between technical ability and hiring opportunities.

Traditional recruitment often relies heavily on resumes, college reputation, and self-reported skills. However, these signals do not always reflect a developer's actual ability to build software.

CodeDNA aims to change this by creating a continuously updated developer profile that highlights real engineering work, verified projects, technical skills, collaboration, and practical building experience.

Developers can showcase their work through a single professional profile, while recruiters can discover and evaluate talent based on evidence rather than just resumes or college names.

Our mission is simple:

**Help developers get recognized for their skills, projects, and ability to build real software.**

## 🎯 The Problem

- **Resume-based screening:** Skilled developers may be overlooked because of their college, background, or resume presentation.
- **Unverified projects:** Recruiters often cannot determine whether a candidate genuinely built the projects listed on their resume.
- **Scattered developer identity:** Coding profiles, repositories, projects, and deployments are spread across multiple platforms.
- **Skill verification challenges:** Self-reported skills do not always demonstrate practical proficiency.
- **Inefficient recruitment:** Recruiters spend significant time manually reviewing resumes and searching for relevant candidates.

## 💡 The Solution

CodeDNA brings developer evidence and talent discovery into one ecosystem.

- Aggregate developer activity from supported platforms.
- Analyze technical skills using real project evidence.
- Verify project understanding through AI-assisted assessments.
- Generate professional developer profiles and career assets.
- Match candidates with opportunities based on their demonstrated abilities.
- Help recruiters discover suitable candidates through natural-language hiring requirements.

---

## ✨ Key Features

> Features are planned across multiple development phases. Not every feature described below is necessarily implemented in the current version.

### 👨‍💻 1. Developer Passport

A centralized developer profile that brings together technical achievements, projects, and professional identity.

Planned capabilities:

- GitHub and GitLab activity.
- LeetCode and Codeforces statistics.
- Kaggle and Hugging Face contributions.
- Vercel, Netlify, and other supported deployment information.
- Public developer profile and shareable portfolio URL.
- Technical skills and project showcase.
- Graduation year and professional information.

### 🧠 2. AI Project Verifier

An AI-assisted system designed to evaluate whether developers understand the code they submit.

Planned workflow:

1. Connect or submit a supported repository.
2. Analyze the project structure and implementation.
3. Generate context-aware questions about the codebase.
4. Evaluate the developer's explanations.
5. Display a verification result and supporting evidence.
6. Offer additional verification methods for higher-trust profiles.

The goal is to evaluate genuine project understanding rather than relying exclusively on repository appearance.

### 📊 3. CodeDNA Scoring System

A transparent scoring framework intended to represent different dimensions of engineering ability.

The proposed scoring model consists of:

| Dimension | Weight | Focus |
|---|---:|---|
| Hard Skills | 30% | Code quality, security, DSA, reliability, and language proficiency |
| Soft Skills | 40% | Collaboration, peer feedback, code reviews, and teamwork |
| Builder Skills | 30% | Deployed projects, open-source work, CI/CD, and system design |

The weights represent the proposed blueprint and may evolve as the scoring methodology is validated.

### 🕸️ 4. Dynamic Skill DNA

A technology skill graph generated from evidence in supported repositories and projects.

Planned capabilities:

- Framework and language detection.
- Dependency and technology-stack analysis.
- Project-based skill evidence.
- Related technology visualization.
- Skill development and history tracking.
- Recommendations for improving technical proficiency.

### 📄 5. AI Career Asset Generator

Help developers present their verified experience professionally.

Planned outputs:

- ATS-friendly resumes.
- PDF and LaTeX resumes.
- Portfolio websites.
- LinkedIn headlines and summaries.
- Job-specific cover letters.
- Skill-gap recommendations.

### 💼 6. Recruiter Dashboard

A talent discovery workspace for companies seeking developers based on their technical abilities.

Planned capabilities:

- Search and filter developer profiles.
- Filter by skills, graduation year, experience, and verification evidence.
- Review project quality and technical strengths.
- Save and shortlist candidates.
- Communicate with interested candidates.
- Track hiring pipelines.
- Analyze candidate and recruitment metrics.

### ⚡ 7. Vibe Hiring — AI-Powered Talent Discovery

**Describe the developer you want to hire in plain English. Let CodeDNA help you discover relevant candidates.**

Instead of manually configuring dozens of filters, recruiters can describe their requirements naturally.

Example prompt:

> Looking for a full-stack developer with experience in Next.js and Tailwind CSS. The candidate should have built and deployed real-world applications, understand API development and databases, and demonstrate strong problem-solving skills.

The proposed Vibe Hiring workflow:

1. **Describe the role:** Enter a natural-language hiring prompt.
2. **Understand the requirements:** Extract required skills, preferred skills, experience, project evidence, and other job criteria.
3. **Find relevant candidates:** Search available developer profiles and verified project information.
4. **Rank matches:** Prioritize candidates using transparent, configurable matching criteria.
5. **Explain recommendations:** Show the evidence behind each match, including relevant projects and demonstrated skills.
6. **Review candidates:** Open profiles, shortlist developers, and initiate contact.
7. **Improve the search:** Refine the prompt or add constraints to discover better matches.

Example result:

- **Candidate A:** Strong Next.js evidence, multiple deployed applications, and relevant database experience.
- **Candidate B:** Strong Tailwind CSS experience, API development, and full-stack project contributions.
- **Candidate C:** Relevant technology stack and strong evidence of practical project work.

Vibe Hiring is intended to prioritize demonstrated skills and relevant evidence over college prestige alone. Any match scores should be explainable and should not be presented as guarantees of job performance.

### 🧪 8. Real-Work Simulations

Planned practical assessments designed to evaluate engineering work beyond conventional coding puzzles.

- Bug-fixing challenges.
- Merge-conflict resolution.
- Collaborative repository tasks.
- Code review exercises.
- Open-source contribution tracking.
- Teamwork and project ownership assessments.

### 🧩 9. VS Code Extension

A planned extension that brings CodeDNA closer to developers' everyday workflows.

Potential capabilities:

- Developer activity insights.
- CodeDNA score and improvement suggestions.
- Code quality analysis.
- Pull request review assistance.
- Private repository metrics with privacy-conscious processing.

Private repository analysis must protect confidential source code and respect employer policies. Raw code should not be transmitted or stored unnecessarily.

### 🏢 10. Enterprise & College Placement

Planned tools for organizations and educational institutions.

- College placement cell portal.
- Bulk student onboarding.
- Batch-level analytics.
- Company-specific technical assessments.
- Hiring pipeline management.
- ATS integrations with platforms such as Keka, Darwinbox, and GreytHR.
- Enterprise access controls and team accounts.
- Hiring outcome and retention analytics.

---

## 🛠️ Proposed Technology Stack

The following stack is based on the CodeDNA platform blueprint. Individual technologies may be introduced as the project evolves.

| Layer | Technology |
|---|---|
| Frontend | Next.js, React, Tailwind CSS |
| Backend API | Node.js, GraphQL, Apollo |
| Database | PostgreSQL |
| Vector Search | pgvector |
| Caching | Redis |
| Search Engine | Elasticsearch |
| Background Jobs | RabbitMQ |
| AI & Code Analysis | LLM APIs, Python workers, custom analysis rules |
| Developer IDE | VS Code Extension API, TypeScript |
| Authentication | GitHub OAuth, Google OAuth, JWT |
| Infrastructure | AWS, with an India-region deployment planned |

## 🏗️ Development Roadmap

CodeDNA is planned to evolve incrementally, with each phase building on the previous one.

| Version | Focus |
|---|---|
| V1 | Developer authentication, GitHub integration, basic scoring, and public profiles |
| V2 | AI-assisted project verification |
| V3 | AI resume, portfolio, and career asset generation |
| V4 | Recruiter dashboard and candidate discovery |
| V5 | Vibe Hiring and natural-language candidate matching |
| V6 | VS Code extension and developer workflow insights |
| V7 | Real-work simulations and collaboration assessments |
| V8 | Placement cell portal, enterprise tools, ATS integrations, and hiring analytics |

The roadmap is directional rather than a claim that every feature is already available.

## 🔒 Privacy, Security & Trust

Trust is central to a developer verification and recruitment platform.

CodeDNA aims to:

- Use secure authentication and authorization.
- Request only the permissions necessary for each integration.
- Protect private repository content and confidential information.
- Make scoring criteria as transparent as practical.
- Distinguish verified evidence from self-reported information.
- Provide meaningful explanations for candidate matching.
- Reduce opportunities for fraudulent contributions and endorsements.
- Respect applicable data protection requirements, including India's DPDP framework where applicable.

## 🌍 Who Is CodeDNA For?

**Developers and students**
- Showcase practical engineering ability.
- Build a credible professional identity.
- Demonstrate project ownership.
- Discover relevant career opportunities.

**Recruiters and hiring teams**
- Discover candidates based on demonstrated skills.
- Review project evidence more efficiently.
- Use Vibe Hiring to describe roles naturally.
- Build more focused candidate pipelines.

**Colleges and placement cells**
- Help students build verifiable profiles.
- Showcase batch-level technical achievements.
- Connect students with participating employers.

## 🎯 Vision

We envision a future where a developer's opportunities are determined by what they can demonstrate, build, and contribute—not simply by the name of their college or the presentation of their resume.

CodeDNA aims to make technical ability more visible, project ownership more verifiable, and talent discovery more effective.

---

## 🤝 Contributing

CodeDNA is being developed incrementally. Contribution guidelines, issue templates, and pull request procedures can be added as the repository and collaboration process mature.

If you would like to contribute:

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Test your implementation.
5. Submit a pull request describing the changes.

Please open an issue before starting large changes so the proposed direction can be discussed.

## 📌 Project Status

**Development status:** Planned / In development.

CodeDNA's feature set is intended to expand through the roadmap above. Check the repository's issues, releases, and project documentation for the latest implementation status.

## 📜 License

A license has not yet been specified. Add a `LICENSE` file before distributing the project under an open-source license.

---

<p align="center">
  <strong>CodeDNA</strong>
  <br />
  <em>Get hired for what you build, not where you study.</em>
</p>
