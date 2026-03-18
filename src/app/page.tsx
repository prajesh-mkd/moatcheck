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
          <div className="hero-desktop">
            <span>Stress-test your startup idea</span>
            <span className="hero-highlight">before you burn the cash</span>
          </div>
          <div className="hero-mobile">
            <span>Stress-test your</span>
            <span>startup idea <span className="hero-highlight">before</span></span>
            <span className="hero-highlight">you burn the cash</span>
          </div>
        </h1>

        <div className="hero-squad">
          <div className="hero-squad-title">Agent Squad</div>
          <div className="hero-squad-agents">
            <div className="hero-squad-agent">
              <div className="hero-squad-avatar">🦉</div>
              <div className="hero-squad-name">Vera</div>
              <div className="hero-squad-role">
                <span>The Verdict</span>
                <span>Owl</span>
              </div>
            </div>
            <div className="hero-squad-agent">
              <div className="hero-squad-avatar">🐢</div>
              <div className="hero-squad-name">Momo</div>
              <div className="hero-squad-role">
                <span>The Moat</span>
                <span>Turtle</span>
              </div>
            </div>
            <div className="hero-squad-agent">
              <div className="hero-squad-avatar">🦦</div>
              <div className="hero-squad-name">Max</div>
              <div className="hero-squad-role">
                <span>The Market</span>
                <span>Meerkat</span>
              </div>
            </div>
            <div className="hero-squad-agent">
              <div className="hero-squad-avatar">🐼</div>
              <div className="hero-squad-name">Pat</div>
              <div className="hero-squad-role">
                <span>The Pattern</span>
                <span>Panda</span>
              </div>
            </div>
            <div className="hero-squad-agent">
              <div className="hero-squad-avatar">🦏</div>
              <div className="hero-squad-name">Rex</div>
              <div className="hero-squad-role">
                <span>The Risk</span>
                <span>Rhino</span>
              </div>
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
