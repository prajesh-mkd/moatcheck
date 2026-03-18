import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const GRADIENT_API_KEY = process.env.GRADIENT_MODEL_ACCESS_KEY || "";
const BASE_URL = "https://inference.do-ai.run/v1";
const ANALYSIS_MODEL = "openai-gpt-5.4";
const TAVILY_API_KEY = process.env.TAVILY_API_KEY || "";

// ── RAG Knowledge Base (loaded from disk, cached) ───────────────────

const RAG_DIR = path.join(process.cwd(), "rag-data");

function loadRAG(filename: string): string {
  try {
    return fs.readFileSync(path.join(RAG_DIR, filename), "utf-8");
  } catch {
    return "";
  }
}

const RAG_DATA = {
  market_data: loadRAG("market_data.md"),
  yc_insights: loadRAG("yc_insights.md"),
  success_cases: loadRAG("success_cases.md"),
  pivot_stories: loadRAG("pivot_stories.md"),
  failure_cases: loadRAG("failure_cases.md"),
  failure_reasons: loadRAG("failure_reasons.md"),
  moat_examples: loadRAG("moat_examples.md"),
  ai_disruption: loadRAG("ai_disruption.md"),
};

// ── Formatting & Anti-Hallucination Rules ───────────────────────────

const SHARED_RULES = `
FORMATTING RULES:
- Start with a **TL;DR** (1-2 sentences summarizing your key finding)
- Use bullet points over paragraphs — founders scan, they don't read essays
- Bold key takeaways and numbers
- Keep each section tight — quality over quantity
- Use tables when comparing multiple items

ANTI-HALLUCINATION RULES:
1. Do NOT invent or fabricate company names, funding amounts, or failure stories.
2. Only cite companies you are absolutely certain about.
3. If you cannot think of a verified example, say "No well-documented comparable case found."
4. NEVER fabricate funding amounts, revenue numbers, or dates.
5. When web search results are provided, PRIORITIZE those as your source of truth.
6. It is 100x better to say "I'm not certain" than to confidently state something false.
7. Do NOT ask follow-up questions or offer to generate additional outputs. End with your final verdict.`;

// ── Personality Prompts ─────────────────────────────────────────────

const PERSONALITY: Record<string, string> = {
  balanced: `Tone: Professional and honest. Present strengths and weaknesses equally. Be constructive and fair.`,
  brutal: `Tone: Ruthlessly honest. Rip apart weaknesses. Be like a skeptical VC who's seen 10,000 pitches. Use phrases like "Here's the hard truth", "This is a red flag", "Let me be blunt." If the idea is bad, SAY it directly. Be brutal with REAL facts, not made-up ones.`,
};

// ── Agent System Prompts ────────────────────────────────────────────

const MARKET_SCANNER_PROMPT = `You are **Market Scanner**, a competitive intelligence agent.

**TL;DR** — Start with 1-2 sentences: is this market hot, crowded, or niche?

Then provide:

## 🔍 Market Overview
- **TAM / SAM / SOM** — estimate with clear reasoning (show your math)
- **Growth rate** — is this market growing, flat, or shrinking?

## 🏢 Competitors (use web search data!)

| Company | What they do | Funding/Size | Threat level |
|---------|-------------|-------------|-------------|
| [Name]  | [Brief]     | [Amount]    | 🟢🟡🔴     |

- List 3-5 REAL competitors from the web search results
- How crowded is this market? (Blue ocean / Competitive / Red ocean)

## 🎯 Who's Paying?
- Primary customer persona (be specific: "Owner of 1-3 location coffee shop, $500K-2M revenue" not just "small businesses")
- Estimated number of potential customers
- Willingness to pay and typical price range

## 📊 Market Verdict
- **Opportunity window**: Open / Closing / Closed
- **Entry difficulty**: Easy / Moderate / Hard
- 1-sentence final take`;

const PATTERN_MATCHER_PROMPT = `You are **Pattern Matcher**, a startup success pattern analyst.

**TL;DR** — Start with 1-2 sentences: what proven playbook does this idea most resemble?

Then provide:

## 🏆 Similar Success Stories

For each (2-3 max), use this format:
- **[Company Name]** — what they did, when they took off, key insight
- **Parallel to this idea**: how it's similar
- **Key lesson**: what the founder should copy

Only cite well-known, verifiable companies.

## ✅ Success Patterns Detected
Rate which patterns are present (✅ = yes, ⚠️ = partial, ❌ = missing):
- **Timing advantage** — ✅/⚠️/❌ — brief explanation
- **10x improvement** — ✅/⚠️/❌ — brief explanation
- **Underserved market** — ✅/⚠️/❌ — brief explanation
- **Network effects** — ✅/⚠️/❌ — brief explanation
- **Founder-market fit signal** — ✅/⚠️/❌ — brief explanation

## 🗺️ Recommended 12-Month Playbook
- **Months 1-3**: [specific action]
- **Months 4-6**: [specific action]
- **Months 7-12**: [specific action]
- **Key milestone**: What proves product-market fit?`;

const RISK_ANALYZER_PROMPT = `You are **Risk Analyzer**, a startup failure pattern expert.

**TL;DR** — Start with 1-2 sentences: what's the #1 thing that kills ideas like this?

Then provide:

## 💀 Cautionary Tales

For each (2-3 max), use this format:

| Failed Startup | What it did | Why it died | Money lost |
|---------------|-------------|-------------|-----------|
| [Real name]   | [Brief]     | [Root cause]| [$amount] |

ONLY cite verifiable failures. If unsure, discuss the failure PATTERN instead.

## ⚠️ Red Flags Detected
List each red flag with severity:
- 🔴 **[Critical]**: [description] — this kills most startups in this space
- 🟡 **[Warning]**: [description] — manageable but needs attention
- 🟢 **[Low]**: [description] — minor concern

## 🔥 Top 3 Existential Risks

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|-----------|
| 1 | [risk] | HIGH/MED/LOW | [what happens] | [specific action] |
| 2 | [risk] | HIGH/MED/LOW | [what happens] | [specific action] |
| 3 | [risk] | HIGH/MED/LOW | [what happens] | [specific action] |

## 💊 Survival Checklist
- Top 3 things the founder MUST do in the first 90 days to de-risk this idea`;

const MOAT_EVALUATOR_PROMPT = `You are **Moat Evaluator**, the core scoring agent.

**TL;DR** — Start with 1-2 sentences: how defensible is this idea, in plain English?

Then provide your scorecard STRICTLY as a table:

## 🛡️ MOAT Scorecard

| Dimension | Score | Why (1 sentence) | Comparable |
|-----------|-------|------------------|-----------|
| 🌐 Network Effects | X/5 | [reason] | [real company] |
| 🔄 Switching Costs | X/5 | [reason] | [real company] |
| 📊 Data Advantage | X/5 | [reason] | [real company] |
| 💰 Cost Advantage | X/5 | [reason] | [real company] |
| 🏛️ Regulatory/IP | X/5 | [reason] | [real company] |
| 🎯 Brand/Trust | X/5 | [reason] | [real company] |
| ⚙️ Technical IP | X/5 | [reason] | [real company] |
| **🏆 OVERALL** | **X/5** | **[1-sentence verdict]** | |

YOU MUST USE THIS EXACT TABLE FORMAT. Do not use headers or bullet points for the scores.

## 🤖 AI Disruption Risk: [LOW / MEDIUM / HIGH / CRITICAL]
- Can AI replicate the core value? (yes/no and why)
- What's AI-proof about this idea?
- How fast could OpenAI or Google ship a competitor?

## 💡 3 Ways to Strengthen the Moat
1. **[Strategy]** — [specific action with expected impact]
2. **[Strategy]** — [specific action with expected impact]
3. **[Strategy]** — [specific action with expected impact]`;

// ── Verdict Agent (runs after the 4 main agents) ────────────────────

const VERDICT_PROMPT = `You are the **Final Verdict** engine at MoatCheck. You've just received analysis from 4 specialized agents. Your job is to synthesize everything into a clear, decisive recommendation.

Provide EXACTLY this format:

## 🚦 VERDICT: [GO / CAUTION / NO-GO]

**In one sentence**: [Why this verdict]

## 📊 Quick Scores
| Dimension | Rating |
|-----------|--------|
| Market Opportunity | 🟢🟡🔴 [one word] |
| Competitive Moat | 🟢🟡🔴 [one word] |
| Execution Risk | 🟢🟡🔴 [one word] |
| Timing | 🟢🟡🔴 [one word] |
| AI Disruption Risk | 🟢🟡🔴 [one word] |

## 🎯 If You Build This...
- **Do this FIRST**: [most critical action]
- **Avoid this trap**: [biggest mistake to avoid]
- **You win if**: [the one condition for success]

RULES:
- Be decisive. GO means "worth pursuing." CAUTION means "needs work but has potential." NO-GO means "don't waste your time."
- Base your verdict on ALL 4 agent reports provided
- Keep it SHORT — this is the executive summary, not another essay
- Do NOT ask follow-up questions`;

// ── Web Search (Tavily) ─────────────────────────────────────────────

async function webSearch(query: string): Promise<string> {
  if (!TAVILY_API_KEY) return "";
  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query,
        search_depth: "basic",
        max_results: 6,
      }),
    });
    if (!res.ok) return "";
    const data = await res.json();
    const results = (data.results || [])
      .map((r: { title: string; content: string; url: string }) =>
        `- ${r.title}: ${r.content} (${r.url})`
      )
      .join("\n");
    return results ? `\n\nWeb search results for "${query}":\n${results}` : "";
  } catch {
    return "";
  }
}

// ── Helper: Call LLM ────────────────────────────────────────────────

async function callLLM(
  systemPrompt: string,
  userMessage: string,
  model: string = ANALYSIS_MODEL,
  maxTokens: number = 2000
): Promise<string> {
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GRADIENT_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      max_tokens: maxTokens,
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`LLM API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const msg = data.choices?.[0]?.message;
  return msg?.content || msg?.reasoning_content || "No response generated.";
}

// ── Agent Definitions ───────────────────────────────────────────────

const AGENTS = [
  {
    key: "market",
    name: "Max the Market Meerkat 🦦",
    prompt: MARKET_SCANNER_PROMPT,
    searchQuery: (idea: string) => `${idea} startup competitors market size`,
    ragContext: `\n\n--- CURATED MARKET DATA ---\n${RAG_DATA.market_data}\n\n--- YC INSIGHTS ---\n${RAG_DATA.yc_insights}`,
  },
  {
    key: "patterns",
    name: "Pat the Pattern Panda 🐼",
    prompt: PATTERN_MATCHER_PROMPT,
    searchQuery: (idea: string) => `${idea} successful similar startups`,
    ragContext: `\n\n--- VERIFIED SUCCESS CASE STUDIES ---\n${RAG_DATA.success_cases}\n\n--- PIVOT STORIES ---\n${RAG_DATA.pivot_stories}`,
  },
  {
    key: "risks",
    name: "Rex the Risk Rhino 🦏",
    prompt: RISK_ANALYZER_PROMPT,
    searchQuery: (idea: string) => `${idea} startup failed shut down`,
    ragContext: `\n\n--- VERIFIED FAILURE CASE STUDIES ---\n${RAG_DATA.failure_cases}\n\n--- FAILURE STATISTICS ---\n${RAG_DATA.failure_reasons}`,
  },
  {
    key: "moat",
    name: "Momo the Moat Turtle 🐢",
    prompt: MOAT_EVALUATOR_PROMPT,
    searchQuery: (idea: string) => `${idea} competitive advantage moat defensibility`,
    ragContext: `\n\n--- MOAT EXAMPLES BY TYPE ---\n${RAG_DATA.moat_examples}\n\n--- AI DISRUPTION FRAMEWORK ---\n${RAG_DATA.ai_disruption}`,
  },
];

// ── Main Handler ────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, documentContext, personality = "balanced", refinement, wizardContext } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Missing 'prompt' in request body" },
        { status: 400 }
      );
    }

    if (!GRADIENT_API_KEY) {
      return NextResponse.json({
        results: [{
          agent: "System",
          key: "error",
          content: "⚠️ **GRADIENT_MODEL_ACCESS_KEY not set.** Add your key to `.env.local` and restart.",
        }],
      });
    }

    // Step 1: Run targeted web searches for each agent in parallel
    const searchPromises = AGENTS.map((agent) =>
      webSearch(agent.searchQuery(prompt))
    );
    const searchResults = await Promise.all(searchPromises);

    // Step 2: Build base context
    let baseContext = `Startup idea: ${prompt}`;
    if (wizardContext) {
      baseContext += `\n\nFounder profile:\n${wizardContext}`;
    }
    if (refinement) {
      baseContext += `\n\nAdditional context from the founder:\n${refinement}`;
    }
    if (documentContext) {
      const maxChars = 50000;
      const docs = documentContext.length > maxChars
        ? documentContext.slice(0, maxChars) + "\n[truncated]"
        : documentContext;
      baseContext += `\n\nFounder's documents:\n${docs}`;
    }

    // Step 3: Run all 5 agents in parallel
    const toneDirective = PERSONALITY[personality] || PERSONALITY.balanced;

    const agentPromises = AGENTS.map(async (agent, i) => {
      const agentContext = baseContext + (searchResults[i] || "") + (agent.ragContext || "");
      const fullPrompt = `${agent.prompt}\n\n${toneDirective}\n\n${SHARED_RULES}`;
      const content = await callLLM(fullPrompt, agentContext);
      return { key: agent.key, agent: agent.name, content };
    });

    const results = await Promise.all(agentPromises);

    // Step 4: Generate verdict based on all 4 agent outputs
    const agentSummaries = results
      .map((r) => `### ${r.agent}\n${r.content}`)
      .join("\n\n---\n\n");

    const verdictContext = `Startup idea: ${prompt}\n\nHere are the reports from 4 specialized agents:\n\n${agentSummaries}`;
    const verdictContent = await callLLM(
      `${VERDICT_PROMPT}\n\n${toneDirective}`,
      verdictContext,
      ANALYSIS_MODEL,
      800
    );

    // Add verdict as the first result
    const allResults = [
      { key: "verdict", agent: "Vera the Verdict Owl 🦉", content: verdictContent },
      ...results,
    ];

    return NextResponse.json({ results: allResults });
  } catch (error) {
    console.error("Chat API error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({
      results: [{
        agent: "System",
        key: "error",
        content: `⚠️ **Error:** ${message}\n\nCheck your \`GRADIENT_MODEL_ACCESS_KEY\` in \`.env.local\`.`,
      }],
    });
  }
}
