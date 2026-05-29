import Groq from "groq-sdk";

export interface AnalysisResult {
  ats_score: number;
  score_breakdown: {
    keywords: number;
    format: number;
    length: number;
    action_verbs: number;
    relevance: number;
  };
  improved_bullets: Array<{
    original: string;
    improved: string;
    reason: string;
  }>;
  missing_keywords: string[];
  india_specific_tips: string[];
  linkedin_tips: string[];
  cover_letter: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
}

/**
 * Extracts the first complete JSON object from any model output.
 * Handles: <think> blocks, ```json fences, preamble text, trailing text.
 */
function extractJSON(raw: string): string {
  // Find the first { and last }
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("No JSON object found in AI response.");
  }
  return raw.slice(start, end + 1);
}

export async function analyzeResume(
  resumeText: string,
  jobDescription: string,
  companyType: string,
  cgpa?: string
): Promise<AnalysisResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured in environment variables.");
  }

  const groq = new Groq({ apiKey });

  const systemPrompt = `You are an elite ATS analyst and career coach specializing in the Indian engineering job market (IITs, NITs, BITS, private colleges like MIT Manipal, VIT, SRM).

You deeply understand:
- On-campus placement culture, CGPA cutoffs (6.0 / 7.0 / 7.5 / 8.0 for different company tiers)
- The difference between product companies (Google, Microsoft, Amazon, Flipkart), service companies (TCS, Infosys, Wipro), and Indian startups
- Indian job portals: Naukri, LinkedIn, iimjobs, Internshala
- ATS systems used by Indian recruiters
- Strong action verbs: Engineered, Architected, Optimized, Spearheaded, Delivered, Reduced, Automated, Orchestrated

OUTPUT FORMAT: You MUST respond with ONLY a raw JSON object. Absolutely no markdown fences, no explanation, no preamble. Start your response directly with { and end with }.

JSON structure:
{
  "ats_score": <integer 0-100>,
  "score_breakdown": {
    "keywords": <integer 0-100>,
    "format": <integer 0-100>,
    "length": <integer 0-100>,
    "action_verbs": <integer 0-100>,
    "relevance": <integer 0-100>
  },
  "summary": "<2-3 sentence honest overall assessment of this resume vs this JD>",
  "strengths": ["<strength>", "<strength>", "<strength>"],
  "weaknesses": ["<weakness>", "<weakness>", "<weakness>"],
  "improved_bullets": [
    {
      "original": "<exact bullet text from resume>",
      "improved": "<rewritten with strong action verb + quantified impact + specific tech>",
      "reason": "<why this improves ATS score>"
    }
  ],
  "missing_keywords": ["<keyword from JD missing in resume>"],
  "india_specific_tips": ["<India job market tip>"],
  "linkedin_tips": ["<tip 1>", "<tip 2>", "<tip 3>", "<tip 4>", "<tip 5>"],
  "cover_letter": "<full 3-4 paragraph professional cover letter ready to send>"
}

Requirements: improved_bullets >= 5 entries, missing_keywords >= 8, india_specific_tips >= 5, linkedin_tips exactly 5.`;

  const userPrompt = `Company Type: ${companyType}
${cgpa ? `Candidate CGPA: ${cgpa}` : ""}

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Analyze this resume against the job description and return the JSON object now.`;

  // Attempt with retry on rate limit
  async function callAPI(retryCount = 0): Promise<string> {
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.6,
        max_tokens: 4096,
      });
      return completion.choices[0]?.message?.content ?? "";
    } catch (error: any) {
      const is429 =
        error?.status === 429 ||
        error?.message?.includes("429") ||
        error?.message?.toLowerCase().includes("rate limit");

      if (is429 && retryCount < 1) {
        // Wait 3 seconds and try once more
        await new Promise((r) => setTimeout(r, 3000));
        return callAPI(retryCount + 1);
      }
      throw error;
    }
  }

  const rawText = await callAPI();

  if (!rawText || rawText.trim().length === 0) {
    throw new Error("AI returned an empty response. Please try again.");
  }

  const jsonString = extractJSON(rawText);
  const result = JSON.parse(jsonString) as AnalysisResult;

  // Validate critical fields exist
  if (typeof result.ats_score !== "number") {
    throw new Error("AI response missing ats_score field.");
  }

  return result;
}
