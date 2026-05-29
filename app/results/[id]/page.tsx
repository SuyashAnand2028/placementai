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

// ── Score Ring Component ────────────────────────────────────────────────────
function ScoreRing({ score, color }: { score: number; color: string }) {
  const r = 68;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <div className="score-ring">
      <svg width="160" height="160" viewBox="0 0 160 160">
        {/* Track */}
        <circle cx="80" cy="80" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        {/* Progress */}
        <circle
          cx="80" cy="80" r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }}
        />
      </svg>
      <div className="score-ring-center">
        <span className="score-number" style={{ color }}>{score}</span>
        <span className="score-label">ATS Score</span>
      </div>
    </div>
  );
}

function getScoreColor(score: number) {
  if (score >= 75) return "var(--accent-green)";
  if (score >= 50) return "var(--accent-amber)";
  return "var(--accent-pink)";
}

function getScoreLabel(score: number) {
  if (score >= 80) return "Excellent";
  if (score >= 65) return "Good";
  if (score >= 45) return "Needs Work";
  return "Critical";
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function ResultsPage() {
  const params = useParams();
  const id = params?.id as string;

  const [analysis, setAnalysis] = useState<StoredAnalysis | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"bullets" | "keywords" | "linkedin" | "cover">("bullets");
  const [scoreVisible, setScoreVisible] = useState(false);

  useEffect(() => {
    if (!id) return;
    const stored = localStorage.getItem(`analysis_${id}`);
    if (stored) setAnalysis(JSON.parse(stored));
    if (localStorage.getItem(`paid_${id}`) === "true") setIsPaid(true);
    // Trigger score ring animation after mount
    const t = setTimeout(() => setScoreVisible(true), 200);
    return () => clearTimeout(t);
  }, [id]);

  const loadRazorpay = (): Promise<boolean> =>
    new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

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

      if (!res.ok) {
        alert(order.error || "Payment setup failed. Please try again.");
        setPaymentLoading(false);
        return;
      }

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
            body: JSON.stringify({ ...response, analysisId: id }),
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
        theme: { color: "#7c6cff" },
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

  // ── Loading State ─────────────────────────────────────────────────────────
  if (!analysis) {
    return (
      <>
        <div className="orb-container" aria-hidden="true">
          <div className="orb orb-1" /><div className="orb orb-2" />
        </div>
        <nav className="navbar">
          <Link href="/" className="navbar-logo">
            <div className="navbar-logo-icon">🎯</div>PlacementAI
          </Link>
        </nav>
        <div className="loading-screen">
          <div className="loading-spinner" />
          <p>Loading your report...</p>
          <Link href="/analyze" className="btn btn-secondary" style={{ marginTop: "8px" }}>
            Start New Analysis
          </Link>
        </div>
      </>
    );
  }

  const scoreColor = getScoreColor(analysis.ats_score);
  const scoreLabel = getScoreLabel(analysis.ats_score);
  const displayScore = scoreVisible ? analysis.ats_score : 0;

  // ── Main Render ───────────────────────────────────────────────────────────
  return (
    <>
      <div className="orb-container" aria-hidden="true">
        <div className="orb orb-1" /><div className="orb orb-2" />
      </div>

      <nav className="navbar">
        <Link href="/" className="navbar-logo">
          <div className="navbar-logo-icon">🎯</div>PlacementAI
        </Link>
        <Link href="/analyze" className="btn btn-primary btn-sm" id="new-analysis-nav">
          New Analysis →
        </Link>
      </nav>

      <div className="results-page">
        <div className="container">

          {/* ── Hero Row ── */}
          <div className="results-hero">
            {/* Left: Summary */}
            <div>
              <p className="results-meta">
                Analysis · {new Date(analysis.metadata.analyzedAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                {analysis.metadata.companyType && ` · ${analysis.metadata.companyType}`}
              </p>
              <h1 className="results-title">Your Resume Report</h1>
              <p className="results-summary">{analysis.summary}</p>

              {/* Strengths / Weaknesses */}
              <div className="sw-grid">
                <div className="sw-card sw-card-green">
                  <div className="sw-label" style={{ color: "var(--accent-green)" }}>
                    ✓ Strengths
                  </div>
                  {analysis.strengths?.map((s, i) => (
                    <p className="sw-item" key={i}>• {s}</p>
                  ))}
                </div>
                <div className="sw-card sw-card-pink">
                  <div className="sw-label" style={{ color: "var(--accent-pink)" }}>
                    ✗ Weaknesses
                  </div>
                  {analysis.weaknesses?.map((w, i) => (
                    <p className="sw-item" key={i}>• {w}</p>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Score Ring */}
            <div className="score-ring-wrap">
              <ScoreRing score={displayScore} color={scoreColor} />
              <span
                className="score-badge"
                style={{
                  background: `${scoreColor}18`,
                  color: scoreColor,
                  border: `1px solid ${scoreColor}30`,
                }}
              >
                {scoreLabel}
              </span>
            </div>
          </div>

          {/* ── Score Breakdown ── */}
          <div className="breakdown-section">
            <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "16px", color: "var(--text-secondary)" }}>
              Score Breakdown
            </h2>
            <div className="breakdown-grid">
              {Object.entries(analysis.score_breakdown || {}).map(([key, val]) => {
                const score = val as number;
                const color = getScoreColor(score);
                return (
                  <div className="breakdown-bar-card" key={key}>
                    <div className="breakdown-score" style={{ color }}>
                      {score}
                    </div>
                    <div className="breakdown-bar-outer">
                      <div
                        className="breakdown-bar-inner"
                        style={{
                          width: scoreVisible ? `${score}%` : "0%",
                          background: color,
                          transition: "width 1s ease",
                        }}
                      />
                    </div>
                    <div className="breakdown-name">
                      {key.replace("_", " ")}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Paywall or Full Report ── */}
          {!isPaid ? (
            <div className="paywall">
              <span className="paywall-icon">🔓</span>
              <h2 className="paywall-title">Unlock Your Full Report</h2>
              <p className="paywall-desc">
                Get AI-rewritten bullets, missing keywords, LinkedIn tips, India-specific career advice, and a complete cover letter tailored to this exact JD.
              </p>

              <div className="paywall-features">
                {[
                  "✍️ Rewritten bullet points",
                  "🔍 Missing keywords",
                  "💼 5 LinkedIn tips",
                  "📝 Full cover letter",
                  "🇮🇳 India-specific advice",
                ].map((f) => (
                  <div className="paywall-feature" key={f}>{f}</div>
                ))}
              </div>

              <button
                id="unlock-report-btn"
                className="btn btn-primary btn-lg"
                onClick={handlePayment}
                disabled={paymentLoading}
              >
                {paymentLoading ? "⏳ Loading..." : "🔓 Unlock Full Report — ₹99"}
              </button>

              <p className="paywall-secure">
                🔒 Secured by Razorpay · UPI, Cards, Net Banking accepted
              </p>
            </div>
          ) : (
            <div className="report-section">
              {/* Tabs */}
              <div className="tabs-row">
                {[
                  { key: "bullets",  label: "✍️ Bullets" },
                  { key: "keywords", label: "🔍 Keywords" },
                  { key: "linkedin", label: "💼 LinkedIn" },
                  { key: "cover",    label: "📝 Cover Letter" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    id={`tab-${tab.key}`}
                    className={`tab-btn ${activeTab === tab.key ? "active" : ""}`}
                    onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="tab-content">

                {/* Bullet Rewriter */}
                {activeTab === "bullets" && (
                  <div>
                    <h2 className="tab-title">✍️ AI Bullet Point Rewriter</h2>
                    <p style={{ fontSize: "0.875rem", marginBottom: "24px" }}>
                      Each bullet has been rewritten with a strong action verb, quantified impact, and specific technologies to maximise your ATS score.
                    </p>
                    <div className="bullet-grid">
                      {analysis.improved_bullets?.map((b, i) => (
                        <div className="bullet-pair" key={i}>
                          <div className="bullet-before">
                            <div className="bullet-tag" style={{ color: "var(--accent-pink)" }}>Before</div>
                            <div className="bullet-text">{b.original}</div>
                          </div>
                          <div className="bullet-after">
                            <div className="bullet-tag" style={{ color: "var(--accent-green)" }}>After</div>
                            <div className="bullet-text" style={{ color: "var(--text-primary)" }}>{b.improved}</div>
                            {b.reason && (
                              <div className="bullet-reason">💡 {b.reason}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing Keywords */}
                {activeTab === "keywords" && (
                  <div>
                    <h2 className="tab-title">🔍 Missing Keywords</h2>
                    <p style={{ fontSize: "0.875rem", marginBottom: "24px" }}>
                      These keywords appear in the job description but are absent from your resume. Add them naturally to boost your ATS score.
                    </p>
                    <div className="keywords-wrap">
                      {analysis.missing_keywords?.map((kw, i) => (
                        <span className="kw-chip" key={i}>{kw}</span>
                      ))}
                    </div>

                    {analysis.india_specific_tips && analysis.india_specific_tips.length > 0 && (
                      <>
                        <div className="divider" />
                        <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "16px" }}>
                          🇮🇳 India-Specific Advice
                        </h3>
                        <div className="tips-list">
                          {analysis.india_specific_tips.map((tip, i) => (
                            <div className="tip-item" key={i}>
                              <div className="tip-number">{i + 1}</div>
                              <span className="tip-text">{tip}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* LinkedIn Tips */}
                {activeTab === "linkedin" && (
                  <div>
                    <h2 className="tab-title">💼 LinkedIn Profile Tips</h2>
                    <p style={{ fontSize: "0.875rem", marginBottom: "24px" }}>
                      5 specific changes to make your LinkedIn profile stand out to recruiters for this exact role.
                    </p>
                    <div className="tips-list">
                      {analysis.linkedin_tips?.map((tip, i) => (
                        <div className="tip-item" key={i}>
                          <div className="tip-number">{i + 1}</div>
                          <span className="tip-text">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cover Letter */}
                {activeTab === "cover" && (
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
                      <h2 className="tab-title" style={{ margin: 0 }}>📝 Cover Letter</h2>
                      <button
                        id="copy-cover-letter"
                        className="btn btn-outline btn-sm"
                        onClick={copyCoverLetter}
                      >
                        {copied ? "✓ Copied!" : "📋 Copy"}
                      </button>
                    </div>
                    <p style={{ fontSize: "0.875rem", marginBottom: "20px" }}>
                      Tailored to the job description. Customize with your name before sending.
                    </p>
                    <div className="cover-letter-box">{analysis.cover_letter}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bottom CTA */}
          <div className="bottom-cta">
            <p style={{ marginBottom: "16px" }}>
              Applying to multiple companies? Each JD gets its own tailored analysis.
            </p>
            <Link href="/analyze" className="btn btn-primary" id="new-analysis-btn">
              Analyse Another JD →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
