import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

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
  full_rewritten_resume: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
}

export async function analyzeResume(
  resumeText: string,
  jobDescription: string,
  companyType: string,
  cgpa?: string
): Promise<AnalysisResult> {
  const systemPrompt = `You are an expert resume reviewer specializing in the Indian engineering job market. You deeply understand:
- On-campus placement drives at IITs, NITs, and private engineering colleges like MIT Manipal, VIT, SRM
- CGPA cutoffs (typically 6.0, 7.0, 7.5, 8.0 for different company tiers)
- The difference between product companies (Google, Microsoft, Amazon, Flipkart), service companies (TCS, Infosys, Wipro, Accenture), and Indian startups
- That Indian students often list too many irrelevant projects or use weak action verbs like "worked on", "helped with", "was involved in"
- ATS systems used by Indian companies and job portals like Naukri, LinkedIn, iimjobs
- The importance of internships, open source, competitive programming for product companies
- How to position CGPA strategically (hide if low, highlight if high)
- Strong action verbs: Engineered, Architected, Optimized, Spearheaded, Delivered, Reduced, Increased, Automated

You MUST respond with ONLY a valid JSON object. No markdown fences, no explanation text, no preamble — just the raw JSON object starting with { and ending with }.`;

  const userPrompt = `Company Type: ${companyType}
${cgpa ? `Candidate CGPA: ${cgpa}` : ""}

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Analyze this resume against the job description. Return ONLY this JSON structure (raw JSON, no markdown):
{
  "ats_score": <integer 0-100>,
  "score_breakdown": {
    "keywords": <integer 0-100>,
    "format": <integer 0-100>,
    "length": <integer 0-100>,
    "action_verbs": <integer 0-100>,
    "relevance": <integer 0-100>
  },
  "summary": "<2-3 sentence honest overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
  "improved_bullets": [
    {
      "original": "<exact bullet from resume>",
      "improved": "<rewritten with strong action verb, quantified impact, specific technologies>",
      "reason": "<why this change improves ATS score and readability>"
    }
  ],
  "missing_keywords": ["<keyword from JD not in resume>"],
  "india_specific_tips": ["<tip specific to Indian job market, company type, placement culture>"],
  "linkedin_tips": ["<specific tip 1>", "<specific tip 2>", "<specific tip 3>", "<specific tip 4>", "<specific tip 5>"],
  "cover_letter": "<complete 3-4 paragraph professional cover letter, ~300 words, formal Indian business English, referencing specific skills from resume and JD>"
}

Requirements:
- improved_bullets: at least 5 entries
- missing_keywords: at least 8 keywords  
- india_specific_tips: at least 5 tips
- linkedin_tips: array of 5 actionable tips for their LinkedIn profile
- cover_letter: complete and professional, ready to send`;

  const completion = await groq.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    model: "qwen/qwen3-32b",
    temperature: 0.2,
    max_tokens: 4096,
  });

  const text = completion.choices[0]?.message?.content ?? "";

  // Extract JSON — handle any accidental markdown wrapping
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse AI response as JSON");
  }

  return JSON.parse(jsonMatch[0]) as AnalysisResult;
}
