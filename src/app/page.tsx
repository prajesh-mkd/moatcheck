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
