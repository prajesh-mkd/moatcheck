import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

const AGENTS = [
  {
    emoji: "🦉",
    name: "Vera the Verdict Owl",
    role: "The Final Judge",
    desc: "Synthesizes all 4 independent agent reports to deliver a decisive bottom-line GO, CAUTION, or NO-GO verdict.",
    color: "var(--text-primary)",
  },
  {
    emoji: "🦦",
    name: "Max the Market Meerkat",
    role: "Competitive Intelligence",
    desc: "Finds competitors, estimates market size, identifies gaps. Uses live web search for current data.",
    color: "var(--accent)",
  },
  {
    emoji: "🐼",
    name: "Pat the Pattern Panda",
    role: "Success Analyst",
    desc: "Compares your idea against startups that won. Identifies which success patterns you have — and which you're missing.",
    color: "var(--success)",
  },
  {
    emoji: "🦏",
    name: "Rex the Risk Rhino",
    role: "Failure Detective",
    desc: "Finds startups with similar models that died. Surfaces the red flags and existential risks before they burn you.",
    color: "var(--danger)",
  },
  {
    emoji: "🐢",
    name: "Momo the Moat Turtle",
    role: "Defensibility Expert",
    desc: "Scores your competitive moat across 7 dimensions + AI disruption risk. The core of MoatCheck.",
    color: "var(--warning)",
  },
];

export default function AgentsPage() {
  return (
    <>
      <Navbar />

      <main style={{ minHeight: "calc(100vh - 160px)", padding: "80px 24px" }}>
        <section className="agents-section" style={{ padding: 0 }}>
          <h1 className="section-title">Your AI analysis team</h1>
          <p className="section-subtitle">
            5 specialist agents powered by DigitalOcean Gradient AI, each bringing a different lens to your idea.
          </p>
          <div className="agents-grid">
            {AGENTS.map((a, i) => (
              <div key={i} className="agent-card" id={`agent-${i}`}>
                <div className="agent-avatar" style={{ background: `${a.color}`, color: "white" }}>
                  {a.emoji}
                </div>
                <h3>{a.name}</h3>
                <span className="agent-role">{a.role}</span>
                <p>{a.desc}</p>
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
