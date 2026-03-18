import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

const FEATURES = [
  {
    icon: "🛡️",
    title: "7-Dimension MOAT Score",
    desc: "Network effects, switching costs, data advantage, cost advantage, regulatory/IP, brand, and technical IP — each scored 1-5 with real examples.",
  },
  {
    icon: "🤖",
    title: "AI Disruption Risk",
    desc: "Will LLMs crush your idea? We evaluate if your moat can survive the AI revolution — the most important question in 2026.",
  },
  {
    icon: "🔍",
    title: "Live Competitor Search",
    desc: "Real-time web search finds current competitors, recent funding rounds, and market news you didn't know existed.",
  },
  {
    icon: "💀",
    title: "Failure Pattern Matching",
    desc: "Your idea compared against real startups that tried similar things and failed. Learn from their mistakes before you repeat them.",
  },
  {
    icon: "🏆",
    title: "Success Pattern Matching",
    desc: "Find proven winners with similar models. Understand what made them succeed and how to replicate those patterns.",
  },

];

export default function FeaturesPage() {
  return (
    <>
      <Navbar />

      <main style={{ minHeight: "calc(100vh - 160px)", padding: "80px 24px" }}>
        <section className="features" style={{ padding: 0 }}>
          <h1 className="section-title">Not just another idea validator</h1>
          <p className="section-subtitle">
            MoatCheck goes deeper than generic AI analysis. We evaluate defensibility,
            find real competitors, and tell you if AI will eat your lunch.
          </p>
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className="feature-card" id={`feature-${i}`}>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ textAlign: "center", marginTop: "80px" }}>
          <Link href="/dashboard" className="btn-primary">
            Try It Now →
          </Link>
        </section>
      </main>

      <Footer />
    </>
  );
}
