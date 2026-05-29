import { NextRequest, NextResponse } from "next/server";
import { analyzeResume } from "@/lib/gemini";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // 60 second timeout for AI calls

// Use lib path to bypass pdf-parse's test-file check that breaks in Next.js
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse/lib/pdf-parse.js");
  const data = await pdfParse(buffer);
  return data.text;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const resumeFile = formData.get("resume") as File | null;
    const jobDescription = formData.get("jobDescription") as string;
    const companyType = formData.get("companyType") as string;
    const cgpa = formData.get("cgpa") as string | null;

    if (!resumeFile) {
      return NextResponse.json({ error: "No resume file provided" }, { status: 400 });
    }

    if (!jobDescription) {
      return NextResponse.json({ error: "No job description provided" }, { status: 400 });
    }

    // File size check (5MB max)
    if (resumeFile.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Please upload a PDF under 5MB." }, { status: 400 });
    }

    // Extract text from PDF
    const bytes = await resumeFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let resumeText: string;
    try {
      resumeText = await extractTextFromPDF(buffer);
    } catch {
      return NextResponse.json(
        { error: "Could not read PDF. Make sure it's a text-based PDF, not a scanned image." },
        { status: 400 }
      );
    }

    if (!resumeText || resumeText.trim().length < 100) {
      return NextResponse.json(
        { error: "Could not extract enough text from your PDF. Please ensure it's a text-based PDF." },
        { status: 400 }
      );
    }

    // Run AI analysis
    const results = await analyzeResume(
      resumeText,
      jobDescription,
      companyType,
      cgpa || undefined
    );

    const id = uuidv4();

    return NextResponse.json({
      id,
      ...results,
      metadata: {
        companyType,
        cgpa: cgpa || null,
        analyzedAt: new Date().toISOString(),
      },
    });
  } catch (error: unknown) {
    console.error("Analysis error:", error);

    const message = error instanceof Error ? error.message : "Analysis failed";

    if (message.includes("API_KEY") || message.includes("403")) {
      return NextResponse.json(
        { error: "AI service configuration error. Please contact support." },
        { status: 500 }
      );
    }

    if (message.includes("429") || message.includes("Quota") || message.includes("quota")) {
      return NextResponse.json(
        { error: "AI quota exceeded. Please wait 1 minute and try again." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Analysis failed. Please try again in a moment." },
      { status: 500 }
    );
  }
}
