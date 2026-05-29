"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AnalyzePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [companyType, setCompanyType] = useState("product");
  const [cgpa, setCgpa] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState("");
  const [dragover, setDragover] = useState(false);

  const loadingSteps = [
    "📄 Reading your resume...",
    "🔍 Extracting text and structure...",
    "🤖 Running AI analysis...",
    "📊 Calculating ATS score...",
    "✍️  Rewriting bullet points...",
    "📝 Generating cover letter...",
    "✅ Finalizing your report...",
  ];

  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setError("");
    } else if (selectedFile) {
      setError("Please upload a PDF file.");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragover(false);
    const dropped = e.dataTransfer.files[0];
    handleFileChange(dropped);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setError("Please upload your resume PDF."); return; }
    if (!jobDescription.trim()) { setError("Please paste the job description."); return; }

    setLoading(true);
    setError("");

    // Animate through loading steps
    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => Math.min(prev + 1, loadingSteps.length - 1));
    }, 1200);

    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("jobDescription", jobDescription);
      formData.append("companyType", companyType);
      if (cgpa) formData.append("cgpa", cgpa);

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Analysis failed. Please try again.");
      }

      const data = await res.json();

      // Store in localStorage
      const analysisId = data.id;
      localStorage.setItem(`analysis_${analysisId}`, JSON.stringify(data));

      clearInterval(stepInterval);
      router.push(`/results/${analysisId}`);
    } catch (err: unknown) {
      clearInterval(stepInterval);
      setLoading(false);
      setLoadingStep(0);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "8px" }}>
            Analyzing your resume...
          </h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "32px" }}>
            This usually takes 20–40 seconds
          </p>
        </div>
        <div className="loading-steps">
          {loadingSteps.map((step, i) => (
            <div
              key={i}
              className={`loading-step ${i === loadingStep ? "active" : i < loadingStep ? "done" : ""}`}
            >
              {i < loadingStep ? "✓ " : i === loadingStep ? "⟳ " : "○ "}
              {step}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <main>
      {/* Header */}
      <div className="page-header">
        <Link href="/" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "0.875rem", display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "20px" }}>
          ← Back to Home
        </Link>
        <h1>Analyze Your Resume</h1>
        <p>Upload your PDF + paste the JD. Get results in under a minute.</p>
      </div>

      <div className="analyze-form">
        <div className="container-sm">
          {/* Steps Indicator */}
          <div className="form-steps">
            {["Upload Resume", "Paste Job Description", "Context", "Get Results"].map((s, i) => (
              <div key={i} className={`form-step-indicator ${i === 0 ? "active" : ""}`}>
                <span>{i + 1}</span> {s}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            {/* Upload */}
            <div className="form-group">
              <label>Step 1 — Your Resume (PDF)</label>
              <div
                className={`upload-zone ${file ? "uploaded" : ""} ${dragover ? "dragover" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragover(true); }}
                onDragLeave={() => setDragover(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  id="resume-upload"
                  onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                  style={{ display: "none" }}
                />
                {file ? (
                  <>
                    <span className="upload-icon">✅</span>
                    <h3>{file.name}</h3>
                    <p style={{ color: "var(--accent-green)" }}>
                      {(file.size / 1024).toFixed(0)} KB · Click to change
                    </p>
                  </>
                ) : (
                  <>
                    <span className="upload-icon">📄</span>
                    <h3>Drop your resume here</h3>
                    <p>or click to browse · PDF only · Max 5MB</p>
                  </>
                )}
              </div>
            </div>

            {/* JD */}
            <div className="form-group">
              <label>Step 2 — Job Description</label>
              <textarea
                id="job-description"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here. Include requirements, responsibilities, and qualifications. The more detail, the better your analysis..."
                rows={8}
                required
              />
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Tip: Copy the entire JD from Naukri, LinkedIn, or the company careers page.
              </p>
            </div>

            {/* Company Type & CGPA */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div className="form-group">
                <label>Step 3a — Company Type</label>
                <select
                  id="company-type"
                  value={companyType}
                  onChange={(e) => setCompanyType(e.target.value)}
                >
                  <option value="product">Product Company (Google, Microsoft, Flipkart)</option>
                  <option value="service">Service Company (TCS, Infosys, Wipro)</option>
                  <option value="startup">Indian Startup</option>
                  <option value="psu">PSU / Government</option>
                  <option value="finance">Finance / Investment Banking</option>
                  <option value="consulting">Consulting (McKinsey, BCG, Deloitte)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Step 3b — Your CGPA (Optional)</label>
                <input
                  id="cgpa"
                  type="number"
                  min="1"
                  max="10"
                  step="0.01"
                  value={cgpa}
                  onChange={(e) => setCgpa(e.target.value)}
                  placeholder="e.g. 8.2"
                />
              </div>
            </div>

            {error && (
              <div className="alert alert-error">
                ⚠️ {error}
              </div>
            )}

            <div className="alert alert-info">
              🎁 Your first analysis is <strong>completely free</strong>. ATS score and summary unlocked instantly. Full report (bullets, cover letter, LinkedIn tips) for ₹99.
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              id="analyze-submit"
              disabled={!file || !jobDescription.trim()}
              style={{ width: "100%" }}
            >
              🚀 Analyze My Resume — Free
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
