"use client";

import { useState, useRef, FormEvent } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface AgentResult {
  key: string;
  agent: string;
  content: string;
}

interface WizardAnswers {
  idea: string;
  customer: string;
  stage: string;
  revenue: string;
  edge: string;
}

const WIZARD_STEPS = [
  {
    key: "idea",
    title: "What's your startup idea?",
    subtitle: "Describe your idea in one or two sentences.",
    type: "textarea" as const,
    placeholder: "e.g. 'An AI-powered platform that helps small restaurants optimize their menu pricing based on local competition, ingredient costs, and customer demand patterns.'",
  },
  {
    key: "customer",
    title: "Who is your target customer?",
    subtitle: "Who would pay for this?",
    type: "buttons" as const,
    options: [
      { value: "consumers", label: "👤 Consumers", desc: "Individual people" },
      { value: "smb", label: "🏪 Small Businesses", desc: "Local Shops & Companies" },
      { value: "midmarket", label: "🏢 Mid-Market", desc: "Growing companies" },
      { value: "enterprise", label: "🏛️ Enterprise", desc: "Large orgs, Fortune 500" },
      { value: "developers", label: "💻 Developers", desc: "Engineers & tech teams" },
    ],
  },
  {
    key: "stage",
    title: "What stage are you at?",
    subtitle: "Where are you in your journey?",
    type: "buttons" as const,
    options: [
      { value: "idea", label: "💡 Just an idea", desc: "Still thinking it through" },
      { value: "mvp", label: "🔨 Building MVP", desc: "In development" },
      { value: "users", label: "👥 Have early users", desc: "People are using it" },
      { value: "revenue", label: "💰 Generating revenue", desc: "Customers are paying" },
    ],
  },
  {
    key: "revenue",
    title: "How will you make money?",
    subtitle: "What's your primary revenue model?",
    type: "buttons" as const,
    options: [
      { value: "subscription", label: "📅 Subscription / SaaS", desc: "Monthly or annual fee" },
      { value: "product", label: "📦 Physical Product", desc: "One-time hardware/goods sale" },
      { value: "marketplace", label: "🏪 Marketplace", desc: "Take a cut of transactions" },
      { value: "freemium", label: "🎁 Freemium", desc: "Free tier + paid upgrades" },
      { value: "unsure", label: "🤷 Not sure yet", desc: "Still figuring it out" },
    ],
  },
  {
    key: "edge",
    title: "What gives you an edge?",
    subtitle: "What makes you the right person to build this? (optional)",
    type: "textarea" as const,
    placeholder: "e.g. 'I spent 10 years managing restaurants and know every pain point' or 'We built proprietary ML models trained on industry data' or 'Nothing yet — just passionate about solving this'",
  },
];

export default function DashboardPage() {
  // Wizard state
  const [wizardStep, setWizardStep] = useState(0);
  const [slideDir, setSlideDir] = useState<"left" | "right">("left");
  const [answers, setAnswers] = useState<WizardAnswers>({
    idea: "",
    customer: "",
    stage: "",
    revenue: "",
    edge: "",
  });
  const [showWizard, setShowWizard] = useState(true);

  // Analysis state
  const [personality, setPersonality] = useState<"balanced" | "brutal">("balanced");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AgentResult[]>([]);
  const [documents, setDocuments] = useState<{ name: string; size: string; content: string }[]>([]);
  const [activeTab, setActiveTab] = useState<string>("verdict");
  const [refinement, setRefinement] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  // ── Wizard Navigation ──────────────────────────

  const currentStep = WIZARD_STEPS[wizardStep];

  const canAdvance = () => {
    const step = WIZARD_STEPS[wizardStep];
    if (step.key === "idea") return answers.idea.trim().length > 10;
    if (step.key === "customer") return answers.customer !== "";
    if (step.key === "stage") return answers.stage !== "";
    if (step.key === "revenue") return answers.revenue !== "";
    if (step.key === "edge") return true; // optional, can always advance
    return false;
  };

  const handleNext = () => {
    setSlideDir("left");
    if (wizardStep < WIZARD_STEPS.length - 1) {
      setWizardStep(wizardStep + 1);
    } else {
      setShowWizard(false);
      setTimeout(() => {
        runAnalysis();
      }, 50);
    }
  };

  const handleBack = () => {
    setSlideDir("right");
    if (wizardStep > 0) {
      setWizardStep(wizardStep - 1);
    }
  };

  const setAnswer = (key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };



  // ── Build context string from wizard answers ───

  const buildContext = () => {
    const customerMap: Record<string, string> = {
      consumers: "Individual consumers (B2C)",
      smb: "Small businesses (SMB)",
      midmarket: "Mid-market companies",
      enterprise: "Enterprise / large organizations",
      developers: "Developers and technical teams",
    };
    const stageMap: Record<string, string> = {
      idea: "Just an idea — no product yet",
      mvp: "Building MVP — in development",
      users: "Have early users — people are using it",
      revenue: "Generating revenue — customers are paying",
    };
    const revenueMap: Record<string, string> = {
      subscription: "Subscription / SaaS (monthly or annual fee)",
      product: "Physical Product (one-time hardware or goods sale)",
      marketplace: "Marketplace (take a cut of transactions)",
      freemium: "Freemium (free tier + paid upgrades)",
      unsure: "Revenue model not yet determined",
    };


    let ctx = "";
    if (answers.customer) ctx += `Target customer: ${customerMap[answers.customer] || answers.customer}\n`;
    if (answers.stage) ctx += `Stage: ${stageMap[answers.stage] || answers.stage}\n`;
    if (answers.revenue) ctx += `Revenue model: ${revenueMap[answers.revenue] || answers.revenue}\n`;
    if (answers.edge.trim()) {
      ctx += `Founder's edge/advantage: ${answers.edge}\n`;
    }
    return ctx;
  };

  // ── Analysis Logic ─────────────────────────────

  const runAnalysis = async (extraRefinement?: string, forcedIdea?: string, forcedDocs?: { name: string; size: string; content: string }[]) => {
    const targetIdea = forcedIdea || answers.idea;
    if (!targetIdea.trim()) return;

    const isRefine = !!extraRefinement;
    if (isRefine) {
      setIsRefining(true);
    } else {
      setIsAnalyzing(true);
      setResults([]);
    }

    const docsToUse = forcedDocs || documents;
    const docContext = docsToUse
      .map((d) => `--- Document: ${d.name} ---\n${d.content}`)
      .join("\n\n");

    const wizardContext = buildContext();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: targetIdea,
          documentContext: docContext || undefined,
          personality,
          refinement: extraRefinement || undefined,
          wizardContext: wizardContext || undefined,
        }),
      });

      const data = await res.json();
      setResults(data.results || []);
      setActiveTab("verdict");
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 200);
    } catch {
      setResults([{
        key: "error",
        agent: "System",
        content: "⚠️ Connection error. Please check your setup.",
      }]);
    } finally {
      setIsAnalyzing(false);
      setIsRefining(false);
    }
  };

  const handleAnalyze = async (e: FormEvent) => {
    e.preventDefault();
    if (!answers.idea.trim() || isAnalyzing) return;
    await runAnalysis();
  };

  const handleRefine = async (e: FormEvent) => {
    e.preventDefault();
    if (!refinement.trim() || isRefining) return;
    await runAnalysis(refinement);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, autoAnalyze = false) => {
    const files = e.target.files;
    if (!files) return;
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      const sizeKB = (file.size / 1024).toFixed(1);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        const newDocs = [
          ...documents,
          { name: file.name, size: `${sizeKB} KB`, content: data.extractedText || "" },
        ];
        setDocuments(newDocs);
        
        if (autoAnalyze && wizardStep === 0) {
          // If bypassing wizard via pitch deck upload on step 1
          const freshIdea = `Analyzing pitch deck: ${file.name}`;
          setAnswers((prev) => ({ ...prev, idea: freshIdea }));
          setShowWizard(false);
          // Auto trigger
          setTimeout(() => {
            runAnalysis(undefined, freshIdea, newDocs);
          }, 50);
        }
      } catch {
        // skip
      }
    }
    e.target.value = "";
  };

  const handleStartOver = () => {
    setShowWizard(true);
    setWizardStep(0);
    setAnswers({ idea: "", customer: "", stage: "", revenue: "", edge: "" });
    setResults([]);
    setDocuments([]);
    setRefinement("");
  };

  const TABS = [
    { key: "verdict", label: "🦉 Vera", icon: "🦉" },
    { key: "moat", label: "🐢 Momo", icon: "🐢" },
    { key: "market", label: "🦦 Max", icon: "🦦" },
    { key: "patterns", label: "🐼 Pat", icon: "🐼" },
    { key: "risks", label: "🦏 Rex", icon: "🦏" },
  ];

  const getResult = (key: string) => results.find((r) => r.key === key);

  // ── Wizard View ────────────────────────────────

  if (showWizard) {
    return (
      <>
        <Navbar />
        <div className="wizard-container">
          {/* Progress Bar */}
          <div className="wizard-progress">
            {WIZARD_STEPS.map((_, i) => (
              <div
                key={i}
                className={`wizard-progress-dot ${i <= wizardStep ? "active" : ""} ${i === wizardStep ? "current" : ""}`}
              />
            ))}
          </div>

          {/* Question Card */}
          <div className={`wizard-card slide-${slideDir}`} key={wizardStep}>
            <h2 className="wizard-title">{currentStep.title}</h2>
            <p className="wizard-subtitle">{currentStep.subtitle}</p>

            {/* Textarea input */}
            {currentStep.type === "textarea" && (
              <>
                <textarea
                  className="wizard-textarea"
                  style={{ marginBottom: currentStep.key === "idea" ? "12px" : "32px" }}
                  id={currentStep.key === "idea" ? "idea-input" : `${currentStep.key}-input`}
                  value={answers[currentStep.key as keyof WizardAnswers] as string}
                  onChange={(e) => setAnswer(currentStep.key, e.target.value)}
                  placeholder={currentStep.placeholder}
                  rows={currentStep.key === "idea" ? 5 : 3}
                  autoFocus
                />
                
                {currentStep.key === "idea" && (
                  <div style={{ textAlign: "center", marginBottom: "32px" }}>
                    <label htmlFor="wizard-doc-upload" style={{
                      color: "var(--success)", fontWeight: 800, textDecoration: "underline", 
                      cursor: "pointer", fontSize: "0.95rem"
                    }}>
                      Or upload your pitch deck instead
                    </label>
                    <input
                      id="wizard-doc-upload"
                      type="file"
                      accept=".pdf,.docx,.doc,.xlsx,.csv,.txt,.md,.pptx"
                      onChange={(e) => handleFileUpload(e, true)}
                      style={{ display: "none" }}
                    />
                  </div>
                )}
              </>
            )}

            {/* Single-select buttons */}
            {currentStep.type === "buttons" && (
              <div className="wizard-options">
                {currentStep.options?.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`wizard-option ${answers[currentStep.key as keyof WizardAnswers] === opt.value ? "selected" : ""}`}
                    onClick={() => {
                      setAnswer(currentStep.key, opt.value);
                      // Auto-advance after selecting
                      setTimeout(() => {
                        if (wizardStep < WIZARD_STEPS.length - 1) {
                          setSlideDir("left");
                          setWizardStep(wizardStep + 1);
                        }
                      }, 300);
                    }}
                  >
                    <span className="wizard-option-label">{opt.label}</span>
                    {"desc" in opt && <span className="wizard-option-desc">{opt.desc}</span>}
                  </button>
                ))}
              </div>
            )}


          </div>

          {/* Navigation */}
          <div className="wizard-nav">
            {wizardStep > 0 && (
              <button type="button" className="btn-secondary wizard-back" onClick={handleBack}>
                ← Back
              </button>
            )}
            <div style={{ flex: 1 }} />
            {currentStep.type === "textarea" && (
              <button
                type="button"
                className="btn-primary wizard-next"
                onClick={handleNext}
                disabled={currentStep.key === "idea" && !canAdvance()}
              >
                {wizardStep === WIZARD_STEPS.length - 1 ? "Analyze My Idea →" : "Next →"}
              </button>
            )}
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // ── Analysis View (after wizard) ───────────────

  return (
    <>
      <Navbar />
      <div className="dashboard-layout" style={{ flexDirection: "column", maxWidth: "1000px", margin: "0 auto" }}>

        {/* ── Idea Summary ──────────────── */}
        <section className="idea-input-section" style={{ padding: "32px 24px 32px" }}>
          <div className="idea-summary-bar" style={{ marginBottom: 0 }}>
            <div className="idea-summary-text">
              <span className="idea-summary-label">Your idea:</span>
              <span className="idea-summary-idea">{answers.idea}</span>
            </div>
          </div>
        </section>

        {/* ── Loading State ──────────────────────── */}
        {(isAnalyzing || isRefining) && (
          <section className="analyzing-section">
            <div className="analyzing-animation">
              <div className="analyzing-ring" />
              <span className="analyzing-text">
                {isRefining ? "Refining analysis with your context..." : "5 agents analyzing your idea..."}
              </span>
            </div>
            <div className="agent-progress">
              {["🦦 Max the Market Meerkat", "🐼 Pat the Pattern Panda", "🦏 Rex the Risk Rhino", "🐢 Momo the Moat Turtle", "🦉 Vera the Verdict Owl"].map((a, i) => (
                <div key={i} className="agent-loading">
                  <span>{a}</span>
                  <div className="loading-bar"><div className="loading-fill" style={{ animationDelay: `${i * 0.3}s` }} /></div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Results ────────────────────────────── */}
        {results.length > 0 && !isAnalyzing && !isRefining && (
          <section className="results-section" ref={resultsRef}>
            <div className="result-tabs">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  className={`result-tab ${activeTab === tab.key ? "active" : ""} ${tab.key === "verdict" ? "verdict-tab" : ""}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="result-content">
              {TABS.map((tab, idx) => {
                const result = getResult(tab.key);
                if (!result || activeTab !== tab.key) return null;
                const cleanContent = result.content
                  .replace(/<br\s*\/?>/gi, "\n")
                  .replace(/<\/?[^>]+(>|$)/g, "");
                  
                // Determine next tab for navigation nudge
                const nextTab = idx < TABS.length - 1 ? TABS[idx + 1] : null;

                return (
                  <div key={tab.key} className={`result-panel ${tab.key === "verdict" ? "verdict-panel" : ""}`}>
                    <div className="result-agent-tag">{result.agent}</div>
                    <div className="result-body">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h2: ({ node, ...props }) => {
                            if (typeof props.children === 'string') {
                              let text = props.children;
                              if (text.includes("VERDICT: GO")) {
                                return <h2>{text.replace("GO", "")} <span style={{ color: "var(--success)" }}>GO</span></h2>;
                              }
                              if (text.includes("VERDICT: CAUTION")) {
                                return <h2>{text.replace("CAUTION", "")} <span style={{ color: "var(--warning)" }}>CAUTION</span></h2>;
                              }
                              if (text.includes("VERDICT: NO-GO")) {
                                return <h2>{text.replace("NO-GO", "")} <span style={{ color: "var(--danger)" }}>NO-GO</span></h2>;
                              }
                            }
                            // Also handle arrays of children when remark parses emojis differently
                            if (Array.isArray(props.children)) {
                               const textObj = props.children.find(c => typeof c === 'string' && c.includes("VERDICT:"));
                               if (textObj && typeof textObj === 'string') {
                                  const text = textObj;
                                  const renderArray = [...props.children];
                                  const index = renderArray.indexOf(textObj);
                                  
                                  if (text.includes("GO") && !text.includes("NO-GO")) {
                                    renderArray[index] = <>{text.replace("GO", "")} <span style={{ color: "var(--success)" }}>GO</span></>;
                                  } else if (text.includes("CAUTION")) {
                                    renderArray[index] = <>{text.replace("CAUTION", "")} <span style={{ color: "var(--warning)" }}>CAUTION</span></>;
                                  } else if (text.includes("NO-GO")) {
                                    renderArray[index] = <>{text.replace("NO-GO", "")} <span style={{ color: "var(--danger)" }}>NO-GO</span></>;
                                  }
                                  return <h2>{renderArray}</h2>;
                               }
                            }

                            return <h2 {...props} />;
                          }
                        }}
                      >
                        {cleanContent}
                      </ReactMarkdown>
                    </div>
                    
                    {nextTab && (
                      <div className="next-agent-nudge" style={{ marginTop: "32px", paddingTop: "24px", borderTop: "2px solid var(--border)", textAlign: "right" }}>
                        <button 
                          className="btn-primary" 
                          onClick={() => setActiveTab(nextTab.key)}
                          style={{ padding: "12px 24px" }}
                        >
                          View {nextTab.label} →
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Refine Analysis */}
            <div className="refine-section">
              <form onSubmit={handleRefine} className="refine-form">
                <div className="refine-header">
                  <span className="refine-icon">💡</span>
                  <span className="refine-label">Provide additional details</span>
                </div>
                <textarea
                  className="refine-textarea"
                  id="refine-input"
                  value={refinement}
                  onChange={(e) => setRefinement(e.target.value)}
                  placeholder='e.g. "We already have 200 paying customers" or "We have a patent on this technology" or "Our founder sold a company in this space for $50M"'
                  rows={3}
                />
                <button
                  type="submit"
                  className="btn-primary refine-btn"
                  id="refine-btn"
                  disabled={!refinement.trim() || isRefining}
                >
                  {isRefining ? "Refining..." : "Refine Analysis →"}
                </button>
              </form>
            </div>
          </section>
        )}
      </div>
      <Footer />
    </>
  );
}
