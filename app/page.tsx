"use client";
import Link from "next/link";
import { useState } from "react";

const faqs = [
  {
    q: "Is the first analysis really free?",
    a: "Yes! Your first resume analysis is completely free — no credit card required. You get the ATS score and a preview of the improvements. Full results (improved bullets, cover letter, LinkedIn tips) unlock for ₹99.",
  },
  {
    q: "Which file formats are supported?",
    a: "We currently support PDF files. Make sure your resume is a text-based PDF (not a scanned image). Most resumes made in Word, Google Docs, or Canva export as text-based PDFs.",
  },
  {
    q: "Is my resume data safe?",
    a: "Your resume text is only used to generate your analysis. We don't store your resume long-term or share it with any third parties. Each analysis is private to you.",
  },
  {
    q: "How is PlacementAI different from generic tools like Resume Worded?",
    a: "PlacementAI is built specifically for Indian engineering students. It understands CGPA culture, on-campus placement drives, the difference between service companies (TCS/Infosys) vs product companies (Google/Microsoft), and the ATS systems used by Indian portals like Naukri and iimjobs.",
  },
  {
    q: "Can I use this for off-campus applications too?",
    a: "Absolutely! PlacementAI works for any job application — on-campus placements, off-campus drives, internships, and lateral hiring. Just paste the JD and select the right company type.",
  },
  {
    q: "What payment methods are accepted?",
    a: "We accept UPI, debit cards, credit cards, and net banking via Razorpay — all major Indian payment methods work.",
  },
];

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main>
      {/* Navbar */}
      <nav className="navbar">
        <Link href="/" className="navbar-logo">
          <div className="navbar-logo-icon">🎯</div>
          PlacementAI
        </Link>
        <ul className="navbar-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#how-it-works">How it works</a></li>
          <li><a href="#pricing">Pricing</a></li>
          <li><Link href="/analyze" className="navbar-cta">Try Free →</Link></li>
        </ul>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="hero-badge">
            🇮🇳 Built for Indian Engineering Students
          </div>
          <h1>
            Get Placed Faster with{" "}
            <span className="gradient-text">AI-Powered</span>
            <br />
            Resume Intelligence
          </h1>
          <p className="hero-subtitle">
            Upload your resume, paste the JD — get an ATS score, rewritten bullet
            points, LinkedIn improvements, and a tailored cover letter. Built
            specifically for Indian placement culture.
          </p>
          <div className="hero-cta-group">
            <Link href="/analyze" className="btn btn-primary btn-lg">
              Analyze My Resume Free →
            </Link>
            <a href="#how-it-works" className="btn btn-secondary btn-lg">
              See How It Works
            </a>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <div className="stat-number">99%</div>
              <div className="stat-label">Indian JD Coverage</div>
            </div>
            <div className="stat">
              <div className="stat-number">₹99</div>
              <div className="stat-label">Full Analysis</div>
            </div>
            <div className="stat">
              <div className="stat-number">60s</div>
              <div className="stat-label">To Get Results</div>
            </div>
            <div className="stat">
              <div className="stat-number">Free</div>
              <div className="stat-label">First Analysis</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section" id="features">
        <div className="container">
          <div className="section-tag">Features</div>
          <h2 className="section-title">
            Everything you need to{" "}
            <span className="gradient-text">get placed</span>
          </h2>
          <p className="section-subtitle">
            Stop guessing what recruiters want. Our AI knows exactly what Indian
            companies look for — from CGPA cutoffs to ATS keywords.
          </p>

          <div className="features-grid">
            {[
              {
                icon: "🎯",
                color: "rgba(108, 99, 255, 0.15)",
                title: "ATS Score & Breakdown",
                desc: "See exactly how your resume scores against the job description — keyword match, format quality, action verbs, length, and relevance — all scored individually.",
              },
              {
                icon: "✍️",
                color: "rgba(255, 107, 157, 0.15)",
                title: "Bullet Point Rewriter",
                desc: "Weak bullets like 'Worked on a project' become 'Engineered a REST API serving 10K+ requests/day, reducing latency by 40%'. Side-by-side comparison included.",
              },
              {
                icon: "📝",
                color: "rgba(255, 140, 66, 0.15)",
                title: "Tailored Cover Letter",
                desc: "Get a complete, professional cover letter that references your specific skills and the JD. Formatted for Indian business communication standards.",
              },
              {
                icon: "💼",
                color: "rgba(0, 212, 170, 0.15)",
                title: "LinkedIn Optimizer",
                desc: "5 specific, actionable suggestions to improve your LinkedIn profile for the target role — headline, about, skills section, and more.",
              },
              {
                icon: "🔍",
                color: "rgba(255, 215, 0, 0.1)",
                title: "Missing Keywords",
                desc: "Instantly see which critical keywords from the JD are absent from your resume — the exact terms that ATS systems filter on.",
              },
              {
                icon: "🇮🇳",
                color: "rgba(108, 99, 255, 0.15)",
                title: "India-Specific Advice",
                desc: "Context-aware tips for CGPA presentation, product vs service company positioning, campus placement strategies, and Indian job portal optimization.",
              },
            ].map((f, i) => (
              <div className="feature-card" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="feature-icon" style={{ background: f.color }}>
                  {f.icon}
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="steps-section" id="how-it-works">
        <div className="container">
          <div className="section-tag">How It Works</div>
          <h2 className="section-title">
            From upload to offer in{" "}
            <span className="gradient-text">60 seconds</span>
          </h2>

          <div className="steps-grid">
            {[
              {
                n: "1",
                title: "Upload Your Resume",
                desc: "Upload your PDF resume. Our system extracts all text automatically.",
              },
              {
                n: "2",
                title: "Paste the JD",
                desc: "Copy-paste the job description from Naukri, LinkedIn, or company website.",
              },
              {
                n: "3",
                title: "Get Your Score",
                desc: "AI analyzes your resume against the JD and generates a detailed ATS score.",
              },
              {
                n: "4",
                title: "Unlock Full Report",
                desc: "Pay ₹99 to unlock rewritten bullets, cover letter, and LinkedIn tips.",
              },
            ].map((s, i) => (
              <div className="step" key={i}>
                <div className="step-number">{s.n}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="pricing-section" id="pricing">
        <div className="container" style={{ textAlign: "center" }}>
          <div className="section-tag">Pricing</div>
          <h2 className="section-title">
            Less than a{" "}
            <span className="gradient-text">cup of chai</span>
          </h2>
          <p className="section-subtitle" style={{ margin: "0 auto" }}>
            One analysis per job application. No subscriptions, no hidden fees.
          </p>

          <div style={{ display: "flex", gap: "24px", justifyContent: "center", marginTop: "64px", flexWrap: "wrap" }}>
            <div className="pricing-card" style={{ border: "1px solid var(--border-default)", boxShadow: "none" }}>
              <div className="pricing-badge" style={{ background: "var(--bg-card)", color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}>
                Free
              </div>
              <div className="price">₹0</div>
              <div className="price-period">First analysis</div>
              <ul className="pricing-features">
                <li><span className="check-icon">✓</span> ATS Score (0–100)</li>
                <li><span className="check-icon">✓</span> Score Breakdown</li>
                <li><span className="check-icon">✓</span> Top 3 strengths & weaknesses</li>
                <li style={{ color: "var(--text-muted)" }}>🔒 Bullet Point Rewriter</li>
                <li style={{ color: "var(--text-muted)" }}>🔒 Cover Letter</li>
                <li style={{ color: "var(--text-muted)" }}>🔒 LinkedIn Tips</li>
              </ul>
              <Link href="/analyze" className="btn btn-secondary" style={{ width: "100%" }}>
                Try Free
              </Link>
            </div>

            <div className="pricing-card">
              <div className="pricing-badge">Best Value</div>
              <div className="price">₹99</div>
              <div className="price-period">per analysis</div>
              <ul className="pricing-features">
                <li><span className="check-icon">✓</span> Everything in Free</li>
                <li><span className="check-icon">✓</span> Bullet Point Rewriter (all)</li>
                <li><span className="check-icon">✓</span> Missing Keywords list</li>
                <li><span className="check-icon">✓</span> 5 LinkedIn Tips</li>
                <li><span className="check-icon">✓</span> Full Cover Letter</li>
                <li><span className="check-icon">✓</span> India-specific advice</li>
              </ul>
              <Link href="/analyze" className="btn btn-primary" style={{ width: "100%" }}>
                Analyze Now →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-section" id="faq">
        <div className="container" style={{ textAlign: "center" }}>
          <div className="section-tag">FAQ</div>
          <h2 className="section-title">Common Questions</h2>

          <div className="faq-list">
            {faqs.map((faq, i) => (
              <div className="faq-item" key={i}>
                <button
                  className="faq-question"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  id={`faq-${i}`}
                  aria-expanded={openFaq === i}
                >
                  {faq.q}
                  <span style={{ fontSize: "1.2rem", transition: "transform 0.2s", transform: openFaq === i ? "rotate(45deg)" : "none" }}>+</span>
                </button>
                {openFaq === i && (
                  <div className="faq-answer animate-fade-in-up">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "100px 24px", textAlign: "center", background: "var(--bg-primary)" }}>
        <div className="container">
          <div style={{
            background: "var(--gradient-card)",
            border: "1px solid var(--border-accent)",
            borderRadius: "var(--radius-xl)",
            padding: "72px 40px",
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", inset: 0,
              background: "radial-gradient(ellipse 80% 80% at 50% 50%, rgba(108, 99, 255, 0.1) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 900, marginBottom: "16px", position: "relative" }}>
              Your dream company is one{" "}
              <span className="gradient-text">better resume</span> away
            </h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "36px", fontSize: "1.05rem", position: "relative" }}>
              Join students who&apos;ve already improved their chances. First analysis is free.
            </p>
            <Link href="/analyze" className="btn btn-primary btn-lg" style={{ position: "relative" }}>
              Analyze My Resume — It&apos;s Free →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <span className="footer-logo">🎯 PlacementAI</span>
        <p>Built by a student, for students. MIT Manipal × Indian Placement Culture.</p>
        <p style={{ marginTop: "8px", fontSize: "0.75rem" }}>
          © {new Date().getFullYear()} PlacementAI. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
