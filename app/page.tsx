import Link from "next/link";

export default function HomePage() {
  return (
    <>
      {/* Ambient Orbs */}
      <div className="orb-container" aria-hidden="true">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-logo">
          <div className="navbar-logo-icon">🎯</div>
          PlacementAI
        </div>
        <Link href="/analyze" className="btn btn-primary btn-sm">
          Try for Free →
        </Link>
      </nav>

      <main>
        {/* Hero */}
        <section className="hero-section">
          <div className="hero-badge">
            🇮🇳 Built for Indian Engineering Students
          </div>

          <h1 className="hero-headline">
            Land Your{" "}
            <span className="gradient-text">Dream Job</span>
            <br />
            with an AI Resume Coach
          </h1>

          <p className="hero-sub">
            Upload your resume & paste any JD. Get an instant ATS score,
            AI-rewritten bullet points, missing keywords, LinkedIn tips,
            and a tailored cover letter — in under 30 seconds.
          </p>

          <div className="hero-cta-row">
            <Link href="/analyze" className="btn btn-primary btn-lg" id="hero-cta">
              🚀 Analyze My Resume — Free
            </Link>
            <a href="#how-it-works" className="btn btn-secondary btn-lg">
              See how it works
            </a>
          </div>

          <p className="social-proof">
            Used by <span>2,000+ students</span> from IIT, NIT, BITS, MIT Manipal, VIT
          </p>
        </section>

        {/* How It Works */}
        <section className="features-section" id="how-it-works">
          <div className="container">
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent-purple)", marginBottom: "12px" }}>
                How It Works
              </p>
              <h2 style={{ fontFamily: "'Outfit', sans-serif" }}>
                From resume to report{" "}
                <span className="gradient-text">in 30 seconds</span>
              </h2>
            </div>

            <div className="features-grid">
              {[
                {
                  icon: "📄",
                  iconClass: "feature-icon-purple",
                  step: "01",
                  title: "Upload Your Resume",
                  desc: "Drop your PDF resume. Our parser extracts every detail — education, experience, projects, and skills.",
                },
                {
                  icon: "🤖",
                  iconClass: "feature-icon-pink",
                  step: "02",
                  title: "AI Analyses the JD",
                  desc: "Paste any job description from Naukri, LinkedIn, or a company portal. Our AI cross-references it with your resume.",
                },
                {
                  icon: "📊",
                  iconClass: "feature-icon-green",
                  step: "03",
                  title: "Get Your Report",
                  desc: "Receive an ATS score, rewritten bullets, missing keywords, LinkedIn tips, and a full cover letter — ready to paste.",
                },
              ].map((f) => (
                <div className="feature-card" key={f.step}>
                  <span className="step-number">{f.step}</span>
                  <div className={`feature-icon ${f.iconClass}`}>{f.icon}</div>
                  <div className="feature-title">{f.title}</div>
                  <p className="feature-desc">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What You Get */}
        <section className="companies-section">
          <div className="container">
            <p style={{ fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent-pink)", marginBottom: "12px" }}>
              What You Get
            </p>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", marginBottom: "8px" }}>
              Everything you need to get{" "}
              <span className="gradient-text">placed faster</span>
            </h2>
            <p style={{ maxWidth: "480px", margin: "0 auto" }}>
              Free tier gives you the ATS score, strengths, and weaknesses. Unlock the full report for ₹99.
            </p>

            <div className="companies-grid" style={{ marginTop: "40px" }}>
              {[
                "✅ ATS Score (0–100)",
                "✅ Score Breakdown",
                "✅ Strengths & Weaknesses",
                "🔒 Bullet Point Rewriter",
                "🔒 Missing Keywords",
                "🔒 5 LinkedIn Tips",
                "🔒 Full Cover Letter",
                "🔒 India-Specific Advice",
              ].map((item) => (
                <div className="company-chip" key={item}>
                  {item}
                </div>
              ))}
            </div>

            <div style={{ marginTop: "48px" }}>
              <Link href="/analyze" className="btn btn-primary btn-lg" id="cta-bottom">
                🚀 Start Free Analysis
              </Link>
            </div>
          </div>
        </section>

        {/* Companies */}
        <section style={{ padding: "64px 24px", position: "relative", zIndex: 1 }}>
          <div className="container" style={{ textAlign: "center" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: "24px" }}>
              Optimised for placements at
            </p>
            <div className="companies-grid">
              {["Google", "Microsoft", "Amazon", "Flipkart", "Goldman Sachs", "JP Morgan", "TCS", "Infosys", "Wipro", "Razorpay", "Zepto", "CRED", "PhonePe", "Zomato", "Dream11"].map((c) => (
                <div className="company-chip" key={c}>{c}</div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>© {new Date().getFullYear()} PlacementAI · Made with ❤️ for Indian students · Powered by Groq AI</p>
      </footer>
    </>
  );
}
