# 🛡️ MoatCheck — AI-Powered Startup Idea Validator

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
> **Is your startup idea defensible?** MoatCheck uses a specialized team of 5 AI agents to evaluate your startup's competitive moat, identify risks, and synthesize a final verdict — all powered by DigitalOcean Gradient AI.

🔗 **Live:** [moatcheck.co](https://moatcheck.co)

---

## 🎯 What it Does

MoatCheck analyzes startup ideas across 7 competitive dimensions and provides a comprehensive MOAT Scorecard:

- **🌐 Network Effects** — Does more users = more value?
- **🔄 Switching Costs** — How painful is it to leave?
- **📊 Data Advantage** — Does usage create a data moat?
- **💰 Cost Advantage** — Can you undercut at scale?
- **🏛️ Regulatory/IP** — Legal barriers to entry?
- **🎯 Brand/Trust** — Reputation moat potential?
- **⚙️ Technical IP** — Hard-to-replicate tech?
- **🤖 AI Disruption Risk** — Will LLMs crush this idea?

## 🏗️ Architecture

### Multi-Agent System (5 Specialized Agents)

| Agent | Role | Data Sources |
|-------|------|-------------|
| 🦉 **Verdict Owl** | Final GO/NO-GO Synthesis | Output from the 4 prior agents |
| 🔍 **Market Scanner** | Competitive intelligence, TAM/SAM/SOM | Live web search + market data |
| 🏆 **Pattern Matcher** | Success pattern analysis | Verified success cases + YC insights |
| 💀 **Risk Analyzer** | Failure pattern detection | Verified failure cases + statistics |
| 🛡️ **Moat Evaluator** | 7-dimension moat scoring | Moat examples + AI disruption framework |

### Data Pipeline

```
User Input → Tavily Web Search (4 parallel queries)
                ↓
           RAG Knowledge Base (7 curated data files)
                ↓
           4 AI Agents (parallel execution)
                ↓
           1 Verdict Agent (final synthesis)
                ↓
           Aggregated Results Dashboard
```

### Anti-Hallucination System

LLMs can fabricate company names and statistics. MoatCheck addresses this with:
1. **Live web search** — Each agent gets targeted Tavily search results for grounding
2. **RAG Knowledge Base** — 7 curated markdown files with verified data
3. **Anti-hallucination rules** — Explicit instructions to never fabricate data
4. **Low temperature (0.3)** — More factual, less creative outputs

## 🎨 Personality Modes

- **⚖️ Balanced** — Professional and constructive analysis
- **🔥 Brutal** — Ruthlessly honest, VC-skeptic perspective

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | Next.js 16, React, TypeScript |
| **Styling** | Custom CSS with glassmorphism dark theme |
| **LLM** | DigitalOcean Gradient Serverless Inference |
| **Analysis Model** | OpenAI GPT-OSS-120B (via DO Gradient) |
| **Web Search** | Tavily API (AI-optimized search) |
| **Markdown** | react-markdown + remark-gfm |
| **Document Parsing** | pdf-parse, mammoth (DOCX) |

## 📁 RAG Knowledge Base

7 curated data files powering the analysis:

| File | Contents |
|------|----------|
| `failure_reasons.md` | CB Insights failure statistics, rates by stage/industry |
| `failure_cases.md` | 15+ verified failure case studies (Quibi, Theranos, etc.) |
| `success_cases.md` | 12+ success stories with moat scores (Airbnb, Stripe, etc.) |
| `moat_examples.md` | Real examples for each moat dimension |
| `ai_disruption.md` | AI disruption risk framework + AI-proof strategies |
| `market_data.md` | Market size data by industry (TAM, CAGR) |
| `yc_insights.md` | YC advice, success patterns, founder traits |
| `pivot_stories.md` | 8 famous pivot stories with lessons |

## 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/your-username/moatcheck.git
cd moatcheck

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Add your keys:
# GRADIENT_MODEL_ACCESS_KEY=your-do-gradient-key
# TAVILY_API_KEY=your-tavily-key

# Run development server
npm run dev
```

Visit `http://localhost:3000` 🎉

## 📸 Screenshots

### Landing Page
Premium dark theme with flat orange accents, featuring the 5 AI agents and how-it-works flow.

### Dashboard
Idea input with personality toggle (Balanced/Brutal), document upload, and tabbed results view.

### MOAT Scorecard
7-dimension scoring with real-world comparisons to companies like Uber, Stripe, and Airbnb.

### Risk Analysis
Verified failure case studies with funding amounts sourced from TechCrunch and Crunchbase.

## 🏆 Built for DigitalOcean Hackathon

MoatCheck showcases DigitalOcean Gradient's Serverless Inference capabilities, demonstrating:
- **Multi-agent orchestration** — 5 agents cooperating (4 parallel, 1 synthesis)
- **RAG (Retrieval-Augmented Generation)** — Curated knowledge base
- **Real-time web search integration** — Tavily-powered grounding
- **Anti-hallucination engineering** — Production-ready AI output quality

## 📄 License

MIT License — built with ❤️ and ☕ at 2 AM.
