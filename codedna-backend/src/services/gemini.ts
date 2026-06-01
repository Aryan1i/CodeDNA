export interface GeneratedQuestion {
  question: string;
  codeSnippet: string | null;
  lineReference: number | null;
  expectedAnswer: string;
}

export async function generateVerificationQuestions(
  projectName: string,
  description: string,
  filesList: string[]
): Promise<GeneratedQuestion[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not defined. Returning mock verification questions.");
    return getMockQuestions(projectName);
  }

  const prompt = `
You are an expert technical interviewer assessing a developer's authorship of a software repository.
The repository is named "${projectName}" and is described as: "${description}".
Here are some primary files found in the repository:
${filesList.map(f => `- ${f}`).join("\n")}

Generate exactly 3 highly specific, context-aware verification questions. These questions should target actual development choices, structure, or implementation details of these files. They should be impossible to answer by someone who simply cloned a template or tutorial.

Return the output as a valid JSON array of objects with the following structure:
[
  {
    "question": "A specific question about a file, e.g. 'In your auth routing file, you used bcrypt for password hashing. Why did you choose bcrypt over crypto, and where is the salt length defined?'",
    "codeSnippet": "Snippet of relevant code or file structure (optional, otherwise null)",
    "lineReference": 12, // approximate line number of interest (optional, otherwise null)
    "expectedAnswer": "A short, concise answer key/rubric describing what the developer should explain (e.g. 'Bcrypt salt rounds set to 10 in config/auth.js')"
  }
]

CRITICAL: Return ONLY raw JSON. No markdown blocks, no \`\`\`json wrappers.
`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const data = await response.json() as any;
    const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!jsonText) {
      throw new Error("Empty response from Gemini API");
    }

    const questions = JSON.parse(jsonText.trim()) as GeneratedQuestion[];
    return questions;

  } catch (error: any) {
    console.error("Error generating Gemini verification questions:", error.message);
    return getMockQuestions(projectName);
  }
}

export async function getVectorEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not defined. Returning a mock zero-vector.");
    return new Array(1536).fill(0).map(() => Math.random() * 2 - 1);
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "models/text-embedding-004",
          content: {
            parts: [{ text }],
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini Embedding API returned status ${response.status}`);
    }

    const data = await response.json() as any;
    const values = data.embedding?.values;
    if (!Array.isArray(values)) {
      throw new Error("Invalid embedding response format");
    }

    return values;

  } catch (error: any) {
    console.error("Error fetching Gemini text embedding:", error.message);
    // Return standard size random vector for testing
    return new Array(1536).fill(0).map(() => Math.random() * 2 - 1);
  }
}

function getMockQuestions(projectName: string): GeneratedQuestion[] {
  return [
    {
      "question": `In your "${projectName}" repository, what database or data storage mechanism did you choose, and on what line is the connection configuration initialized?`,
      "codeSnippet": "const db = initializeDatabase();",
      "lineReference": 15,
      "expectedAnswer": "Answers should specify PostgreSQL, MongoDB, or local cache connection initialization details."
    },
    {
      "question": `Why did you use middleware or custom error wrappers in this application, and how do you catch and format database exceptions?`,
      "codeSnippet": "app.use((err, req, res, next) => { ... })",
      "lineReference": 45,
      "expectedAnswer": "Answers should explain routing exceptions catchers or custom Express error middlewares."
    },
    {
      "question": `How did you configure your production builds and pipeline (e.g. package.json compile scripts or container configuration)?`,
      "codeSnippet": "\"build\": \"next build\"",
      "lineReference": 7,
      "expectedAnswer": "Should describe Next build, Dockerfile setup, or compilation commands."
    }
  ];
}
