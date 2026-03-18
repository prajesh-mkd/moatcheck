import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <Navbar />

      {/* ── Hero ─────────────────────────────────── */}
      <section className="hero" id="hero">
        <div className="hero-glow" />
        <h1>
          <span>Stress-test your</span>
          <span>startup idea <span className="hero-highlight">before</span></span>
          <span className="hero-highlight">you burn the cash</span>
        </h1>

        <div className="hero-squad">
          <div className="hero-squad-title">Agent Squad</div>
          <div className="hero-squad-agents">
            <div className="hero-squad-agent">
              <div className="hero-squad-avatar" style={{ background: "var(--text-primary)" }}>🦉</div>
              <div className="hero-squad-name">Vera</div>
            </div>
            <div className="hero-squad-agent">
              <div className="hero-squad-avatar" style={{ background: "var(--accent)" }}>🦦</div>
              <div className="hero-squad-name">Max</div>
            </div>
            <div className="hero-squad-agent">
              <div className="hero-squad-avatar" style={{ background: "var(--success)" }}>🐼</div>
              <div className="hero-squad-name">Pat</div>
            </div>
            <div className="hero-squad-agent">
              <div className="hero-squad-avatar" style={{ background: "var(--danger)" }}>🦏</div>
              <div className="hero-squad-name">Rex</div>
            </div>
            <div className="hero-squad-agent">
              <div className="hero-squad-avatar" style={{ background: "var(--warning)" }}>🐢</div>
              <div className="hero-squad-name">Momo</div>
            </div>
          </div>
        </div>

        <p>
          5 AI agents evaluate your idea&apos;s competitive moat, find real competitors,
          compare against successes &amp; failures, and score your AI disruption risk. Blunt & unfiltered.
        </p>
        <div className="hero-actions">
          <Link href="/dashboard" className="btn-primary" id="hero-cta">
            Test Your Idea →
          </Link>
        </div>
        <p className="hero-powered" style={{ marginTop: "40px", fontSize: "0.95rem", fontWeight: 700, color: "var(--text-muted)" }}>
          Powered by DigitalOcean Gradient AI
        </p>
      </section>

      {/* Sections removed (moved to /features and /agents) */}

      <Footer />
    </>
  );
}
