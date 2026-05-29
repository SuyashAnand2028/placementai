"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const COMPANY_TYPES = [
  "Product (FAANG/Unicorn)",
  "Finance / Investment Banking",
  "Consulting",
  "Service (TCS/Infosys)",
  "Indian Startup",
  "PSU / Government",
];

const LOADING_STEPS = [
  "Parsing your PDF resume...",
  "Reading the job description...",
  "Scoring against ATS criteria...",
  "Generating improvement suggestions...",
  "Writing your cover letter...",
];

type Step = 1 | 2 | 3;

export default function AnalyzePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jd, setJd] = useState("");
  const [companyType, setCompanyType] = useState("Product (FAANG/Unicorn)");
  const [cgpa, setCgpa] = useState("");

  // UI state
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState("");

  // Animate loading steps
  useEffect(() => {
    if (!isLoading) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      if (i < LOADING_STEPS.length) setLoadingStep(i);
      else clearInterval(interval);
    }, 4000);
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleFile = useCallback((file: File) => {
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File must be under 5MB.");
      return;
    }
    setError("");
    setResumeFile(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleSubmit = async () => {
    if (!resumeFile) { setError("Please upload your resume."); return; }
    if (!jd.trim()) { setError("Please paste the job description."); return; }

    setError("");
    setIsLoading(true);
    setLoadingStep(0);

    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);
      formData.append("jobDescription", jd.trim());
      formData.append("companyType", companyType);
      if (cgpa) formData.append("cgpa", cgpa);

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data.error || "Analysis failed. Please try again.";
        if (res.status === 429) {
          setError("AI quota exceeded. Please wait a minute and try again.");
        } else {
          setError(msg);
        }
        setIsLoading(false);
        return;
      }

      // Store result and navigate
      localStorage.setItem(`analysis_${data.id}`, JSON.stringify(data));
      router.push(`/results/${data.id}`);
    } catch {
      setError("Network error. Please check your connection and try again.");
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <div className="orb-container" aria-hidden="true">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
        </div>
        <nav className="navbar">
          <Link href="/" className="navbar-logo">
            <div className="navbar-logo-icon">🎯</div>
            PlacementAI
          </Link>
        </nav>
        <div className="loading-overlay">
          <div className="ai-pulse">🤖</div>
          <div>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", marginBottom: "8px" }}>
              Analysing your resume...
            </h2>
            <p style={{ fontSize: "0.9rem" }}>This takes about 15–20 seconds</p>
          </div>
          <div className="loading-steps">
            {LOADING_STEPS.map((step, i) => (
              <p
                key={i}
                className={`loading-step ${
                  i === loadingStep ? "active" : i < loadingStep ? "done" : ""
                }`}
              >
                {i < loadingStep ? "✓ " : i === loadingStep ? "⟳ " : "○ "}
                {step}
              </p>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="orb-container" aria-hidden="true">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
      </div>

      <nav className="navbar">
        <Link href="/" className="navbar-logo">
          <div className="navbar-logo-icon">🎯</div>
          PlacementAI
        </Link>
        <Link href="/" className="btn btn-secondary btn-sm">
          ← Home
        </Link>
      </nav>

      <div className="analyze-page">
        <div className="analyze-wrapper">
          {/* Header */}
          <div className="analyze-header">
            <h1>
              Analyse Your{" "}
              <span className="gradient-text">Resume</span>
            </h1>
            <p>Upload your resume and paste a job description to get started.</p>
          </div>

          {/* Step Progress */}
          <div className="step-progress">
            {(["Resume", "Job Description", "Details"] as const).map(
              (label, i) => {
                const stepNum = (i + 1) as Step;
                const isDone = currentStep > stepNum;
                const isActive = currentStep === stepNum;
                return (
                  <div
                    key={label}
                    style={{ display: "flex", alignItems: "center", gap: 0 }}
                  >
                    <div className="step-item">
                      <div
                        className={`step-dot ${isDone ? "done" : isActive ? "active" : ""}`}
                      >
                        {isDone ? "✓" : stepNum}
                      </div>
                      <span
                        className={`step-label ${isDone ? "done" : isActive ? "active" : ""}`}
                      >
                        {label}
                      </span>
                    </div>
                    {i < 2 && (
                      <div
                        className={`step-line ${isDone ? "done" : ""}`}
                      />
                    )}
                  </div>
                );
              }
            )}
          </div>

          {/* Error Banner */}
          {error && (
            <div className="error-banner" role="alert">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: Resume Upload */}
          {currentStep === 1 && (
            <div className="form-card">
              <label className="form-label">Step 1 — Upload Your Resume (PDF)</label>

              <div
                id="drop-zone"
                className={`drop-zone ${isDragOver ? "drag-over" : ""} ${resumeFile ? "file-loaded" : ""}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                role="button"
                tabIndex={0}
                aria-label="Upload resume PDF"
                onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  style={{ display: "none" }}
                  id="resume-file-input"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                />

                {resumeFile ? (
                  <>
                    <span className="drop-icon">✅</span>
                    <div className="drop-title" style={{ color: "var(--accent-green)" }}>
                      {resumeFile.name}
                    </div>
                    <p className="drop-sub">
                      {(resumeFile.size / 1024).toFixed(0)} KB · Click to change
                    </p>
                  </>
                ) : (
                  <>
                    <span className="drop-icon">📄</span>
                    <div className="drop-title">Drop your PDF here</div>
                    <p className="drop-sub">or click to browse · Max 5MB</p>
                  </>
                )}
              </div>

              <div className="form-divider" />

              <button
                id="step1-next"
                className="btn btn-primary"
                style={{ width: "100%" }}
                onClick={() => {
                  if (!resumeFile) { setError("Please upload your resume first."); return; }
                  setError("");
                  setCurrentStep(2);
                }}
              >
                Continue → Paste Job Description
              </button>
            </div>
          )}

          {/* Step 2: Job Description */}
          {currentStep === 2 && (
            <div className="form-card">
              <label className="form-label" htmlFor="jd-textarea">
                Step 2 — Paste the Job Description
              </label>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "16px" }}>
                Copy the full JD from Naukri, LinkedIn, or the company careers page.
              </p>

              <textarea
                id="jd-textarea"
                className="form-textarea"
                rows={10}
                placeholder="Paste the job description here..."
                value={jd}
                onChange={(e) => setJd(e.target.value)}
              />
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "8px", textAlign: "right" }}>
                {jd.length} characters
              </p>

              <div className="form-divider" />

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => { setError(""); setCurrentStep(1); }}
                >
                  ← Back
                </button>
                <button
                  id="step2-next"
                  className="btn btn-primary"
                  style={{ flex: 2 }}
                  onClick={() => {
                    if (!jd.trim() || jd.trim().length < 50) {
                      setError("Please paste a full job description (at least 50 characters).");
                      return;
                    }
                    setError("");
                    setCurrentStep(3);
                  }}
                >
                  Continue → Final Details
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Company Type + CGPA */}
          {currentStep === 3 && (
            <div className="form-card">
              <div style={{ marginBottom: "28px" }}>
                <label className="form-label">Step 3A — Company Type</label>
                <div className="company-pills">
                  {COMPANY_TYPES.map((type) => (
                    <button
                      key={type}
                      id={`company-${type.replace(/\W/g, "-")}`}
                      className={`company-pill ${companyType === type ? "selected" : ""}`}
                      onClick={() => setCompanyType(type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="form-label" htmlFor="cgpa-input">
                  Step 3B — Your CGPA (optional)
                </label>
                <input
                  id="cgpa-input"
                  type="text"
                  className="form-input"
                  placeholder="e.g. 8.2"
                  value={cgpa}
                  onChange={(e) => setCgpa(e.target.value)}
                  style={{ maxWidth: "200px" }}
                />
              </div>

              <div className="form-divider" />

              <p className="form-note" style={{ marginBottom: "16px" }}>
                🎉 Your first analysis is <strong>completely free</strong>. ATS score and summary unlocked instantly. Full report (bullets, cover letter, LinkedIn tips) for ₹99.
              </p>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => { setError(""); setCurrentStep(2); }}
                >
                  ← Back
                </button>
                <button
                  id="analyze-btn"
                  className="btn btn-primary"
                  style={{ flex: 2 }}
                  onClick={handleSubmit}
                >
                  ⚡ Analyse My Resume — Free
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
