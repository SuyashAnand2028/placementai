"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { AnalysisResult } from "@/lib/gemini";

interface StoredAnalysis extends AnalysisResult {
  id: string;
  metadata: {
    companyType: string;
    cgpa: string | null;
    analyzedAt: string;
  };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: { name: string; email: string };
  theme: { color: string };
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
}

function ScoreRing({ score, color }: { score: number; color: string }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="score-ring">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <circle
          cx="70" cy="70" r={radius} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="score-ring-label">
        <span className="score-number" style={{ color }}>{score}</span>
        <span className="score-label">ATS Score</span>
      </div>
    </div>
  );
}

function getScoreColor(score: number) {
  if (score >= 75) return "#00d4aa";
  if (score >= 50) return "#ffd700";
  return "#ff6b9d";
}

function getScoreLabel(score: number) {
  if (score >= 80) return { label: "Excellent", color: "#00d4aa" };
  if (score >= 65) return { label: "Good", color: "#ffd700" };
  if (score >= 45) return { label: "Needs Work", color: "#ff8c42" };
  return { label: "Critical", color: "#ff6b9d" };
}

export default function ResultsPage() {
  const params = useParams();
  const id = params?.id as string;

  const [analysis, setAnalysis] = useState<StoredAnalysis | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"bullets" | "keywords" | "linkedin" | "cover">("bullets");

  useEffect(() => {
    if (!id) return;
    const stored = localStorage.getItem(`analysis_${id}`);
    if (stored) {
      setAnalysis(JSON.parse(stored));
    }

    // Check if already paid
    const paidStatus = localStorage.getItem(`paid_${id}`);
    if (paidStatus === "true") setIsPaid(true);
  }, [id]);

  const loadRazorpay = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setPaymentLoading(true);

    const loaded = await loadRazorpay();
    if (!loaded) {
      alert("Could not load payment gateway. Please check your connection.");
      setPaymentLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysisId: id }),
      });

      const order = await res.json();

      const options: RazorpayOptions = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "PlacementAI",
        description: "Full Resume Analysis Report",
        order_id: order.orderId,
        handler: async (response: RazorpayResponse) => {
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...response,
              analysisId: id,
            }),
          });

          if (verifyRes.ok) {
            localStorage.setItem(`paid_${id}`, "true");
            setIsPaid(true);
          } else {
            alert("Payment verification failed. Contact support.");
          }
          setPaymentLoading(false);
        },
        prefill: { name: "", email: "" },
        theme: { color: "#6c63ff" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      alert("Something went wrong. Please try again.");
      setPaymentLoading(false);
    }
  };

  const copyCoverLetter = () => {
    if (analysis?.cover_letter) {
      navigator.clipboard.writeText(analysis.cover_letter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!analysis) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p style={{ color: "var(--text-secondary)" }}>Loading your results...</p>
        <Link href="/analyze" className="btn btn-secondary" style={{ marginTop: "16px" }}>
          Start New Analysis
        </Link>
      </div>
    );
  }

  const scoreColor = getScoreColor(analysis.ats_score);
  const scoreLabel = getScoreLabel(analysis.ats_score);

  return (
    <main>
      <nav className="navbar">
        <Link href="/" className="navbar-logo">
          <div className="navbar-logo-icon">🎯</div>
          PlacementAI
        </Link>
        <Link href="/analyze" className="btn btn-primary btn-sm">
          New Analysis →
        </Link>
      </nav>

      <div className="results-page">
        <div className="container">

          {/* Header Row */}
          <div className="results-header animate-fade-in-up">
            <div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Analysis · {new Date(analysis.metadata.analyzedAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
              </p>
              <h1 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 800, marginBottom: "12px" }}>
                Your Resume Report
              </h1>
              <p style={{ color: "var(--text-secondary)", maxWidth: "560px", lineHeight: "1.6" }}>
                {analysis.summary}
              </p>

              {/* Strengths & Weaknesses */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "24px", maxWidth: "560px" }}>
                <div style={{ background: "rgba(0, 212, 170, 0.05)", border: "1px solid rgba(0, 212, 170, 0.2)", borderRadius: "var(--radius-md)", padding: "16px" }}>
                  <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--accent-green)", textTransform: "uppercase", marginBottom: "10px" }}>✓ Strengths</p>
                  {analysis.strengths?.map((s, i) => (
                    <p key={i} style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "6px", lineHeight: "1.5" }}>• {s}</p>
                  ))}
                </div>
                <div style={{ background: "rgba(255, 107, 157, 0.05)", border: "1px solid rgba(255, 107, 157, 0.15)", borderRadius: "var(--radius-md)", padding: "16px" }}>
                  <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#ff8fc7", textTransform: "uppercase", marginBottom: "10px" }}>✗ Weaknesses</p>
                  {analysis.weaknesses?.map((w, i) => (
                    <p key={i} style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "6px", lineHeight: "1.5" }}>• {w}</p>
                  ))}
                </div>
              </div>
            </div>

            {/* Score Ring */}
            <div className="score-ring-container">
              <ScoreRing score={analysis.ats_score} color={scoreColor} />
              <span className="badge" style={{ background: `${scoreColor}18`, color: scoreColor }}>
                {scoreLabel.label}
              </span>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="score-breakdown-grid" style={{ marginBottom: "40px" }}>
            {Object.entries(analysis.score_breakdown || {}).map(([key, val]) => {
              const isRelevance = key === "relevance";
              const isLocked = isRelevance && !isPaid;
              return (
                <div
                  className="breakdown-item"
                  key={key}
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    ...(isLocked ? { cursor: "pointer" } : {}),
                  }}
                  onClick={isLocked ? handlePayment : undefined}
                  title={isLocked ? "Unlock to see Relevance score" : undefined}
                >
                  {isLocked && (
                    <div style={{
                      position: "absolute", inset: 0,
                      backdropFilter: "blur(6px)",
                      background: "rgba(10,10,15,0.5)",
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center",
                      gap: "4px", zIndex: 2,
                      borderRadius: "var(--radius-md)",
                    }}>
                      <span style={{ fontSize: "1.2rem" }}>🔒</span>
                      <span style={{ fontSize: "0.65rem", color: "var(--accent-primary)", fontWeight: 700 }}>UNLOCK</span>
                    </div>
                  )}
                  <div className="breakdown-value" style={{ color: getScoreColor(val as number) }}>
                    {val as number}
                  </div>
                  <div className="breakdown-name">{key.replace("_", " ")}</div>
                </div>
              );
            })}
          </div>

          {/* Paywall or Full Content */}
          {!isPaid ? (
            <div className="paywall animate-fade-in-up">
              <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🔓</div>
              <h2>Unlock Your Full Report</h2>
              <p>
                Get AI-rewritten bullets, missing keywords, LinkedIn tips, and a complete cover letter tailored to this JD.
              </p>

              <div className="paywall-features">
                {[
                  "✍️ Rewritten bullet points",
                  "🔍 Missing keywords",
                  "💼 5 LinkedIn tips",
                  "📝 Full cover letter",
                  "🇮🇳 India-specific advice",
                ].map((f, i) => (
                  <div className="paywall-feature" key={i}>{f}</div>
                ))}
              </div>

              <button
                id="unlock-report-btn"
                className="btn btn-primary btn-lg"
                onClick={handlePayment}
                disabled={paymentLoading}
              >
                {paymentLoading ? "Loading..." : "🔓 Unlock Full Report — ₹99"}
              </button>

              <p style={{ marginTop: "16px", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Secured by Razorpay · UPI, Cards, Net Banking accepted
              </p>
            </div>
          ) : (
            <div className="results-grid animate-fade-in-up">
              {/* Tabs */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
                {[
                  { key: "bullets", label: "✍️ Bullet Rewriter" },
                  { key: "keywords", label: "🔍 Missing Keywords" },
                  { key: "linkedin", label: "💼 LinkedIn Tips" },
                  { key: "cover", label: "📝 Cover Letter" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    className={`btn ${activeTab === tab.key ? "btn-primary" : "btn-secondary"} btn-sm`}
                    onClick={() => setActiveTab(tab.key as typeof activeTab)}
                    id={`tab-${tab.key}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Bullet Rewriter Tab */}
              {activeTab === "bullets" && (
                <div className="result-section">
                  <h2>✍️ Bullet Point Rewriter</h2>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
                    <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#ff8fc7", textTransform: "uppercase", letterSpacing: "0.05em" }}>Original</div>
                    <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--accent-green)", textTransform: "uppercase", letterSpacing: "0.05em" }}>AI-Improved</div>
                  </div>
                  {analysis.improved_bullets?.map((bullet, i) => (
                    <div key={i} className="bullet-pair">
                      <div className="bullet-original">
                        <div className="bullet-label" style={{ color: "#ff8fc7" }}>Before</div>
                        {bullet.original}
                      </div>
                      <div className="bullet-improved">
                        <div className="bullet-label" style={{ color: "var(--accent-green)" }}>After</div>
                        {bullet.improved}
                        {bullet.reason && (
                          <div style={{ marginTop: "8px", fontSize: "0.75rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                            💡 {bullet.reason}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Missing Keywords Tab */}
              {activeTab === "keywords" && (
                <div className="result-section">
                  <h2>🔍 Missing Keywords</h2>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "24px" }}>
                    These keywords appear in the job description but are missing from your resume. Add them naturally to boost your ATS score.
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                    {analysis.missing_keywords?.map((kw, i) => (
                      <span key={i} className="keyword-chip missing">{kw}</span>
                    ))}
                  </div>
                  {analysis.india_specific_tips && analysis.india_specific_tips.length > 0 && (
                    <>
                      <div className="divider" />
                      <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "16px" }}>
                        🇮🇳 India-Specific Advice
                      </h3>
                      {analysis.india_specific_tips.map((tip, i) => (
                        <div className="tip-item" key={i}>
                          <div className="tip-bullet">{i + 1}</div>
                          <span>{tip}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}

              {/* LinkedIn Tips Tab */}
              {activeTab === "linkedin" && (
                <div className="result-section">
                  <h2>💼 LinkedIn Profile Tips</h2>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "24px" }}>
                    5 specific improvements to make your LinkedIn profile stand out to recruiters for this role.
                  </p>
                  {analysis.linkedin_tips?.map((tip, i) => (
                    <div className="tip-item" key={i}>
                      <div className="tip-bullet">{i + 1}</div>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Cover Letter Tab */}
              {activeTab === "cover" && (
                <div className="result-section">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
                    <h2 style={{ margin: 0 }}>📝 Cover Letter</h2>
                    <button
                      id="copy-cover-letter"
                      className="btn btn-outline btn-sm"
                      onClick={copyCoverLetter}
                    >
                      {copied ? "✓ Copied!" : "📋 Copy"}
                    </button>
                  </div>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "20px" }}>
                    Tailored to the job description. Customize with your name and any specific details before sending.
                  </p>
                  <div className="cover-letter-text">
                    {analysis.cover_letter}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bottom CTA */}
          <div style={{ textAlign: "center", marginTop: "48px", padding: "32px", background: "var(--bg-card)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-default)" }}>
            <p style={{ color: "var(--text-secondary)", marginBottom: "16px" }}>
              Applying to multiple companies? Each JD gets its own tailored analysis.
            </p>
            <Link href="/analyze" className="btn btn-primary" id="new-analysis-btn">
              Analyze Another JD →
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}
