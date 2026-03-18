import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// ── DO GenAI Agent Keys ─────────────────────────────────────────────

// We map process.env keys explicitly, but provide the hardcoded hackathon fallbacks so deployments cannot fail.
const KEYS = {
  market: process.env.AGENT_KEY_MAX || "wKf0NlfUEyKROQ2tfBijZQJsmBe-SFWy",
  patterns: process.env.AGENT_KEY_PAT || "gXQ53jSjX20G9ywrh4IW4ZJb2CHvHw2e",
  risks: process.env.AGENT_KEY_REX || "qmJ4f0Tn6muXB1y5yr_jekiYwKrEbQAE",
  moat: process.env.AGENT_KEY_MOMO || "9aCO6_yZd7ot5OfVImXIjcgE_yQUdPqt",
  verdict: process.env.AGENT_KEY_VERA || "DyZt-QKQnBU29ydQ3bVl2_oWXTJZtUzd",
};

const TAVILY_API_KEY = process.env.TAVILY_API_KEY || "";

// ── DO Agent Endpoints ──────────────────────────────────────────────
// These represent the explicitly mapped DigitalOcean Agent SDK paths provided by the user

const ENDPOINTS = {
  market: "https://r3lcrgpbwkc6xtqw7m5sdhhr.agents.do-ai.run/api/v1/chat/completions", // Max
  patterns: "https://sirharhukenp36dj66yydouw.agents.do-ai.run/api/v1/chat/completions", // Pat
  risks: "https://cxt47t6brshjz2ytkipfrjcu.agents.do-ai.run/api/v1/chat/completions", // Rex
  moat: "https://aphmlgd5gs67xkygzznvipnz.agents.do-ai.run/api/v1/chat/completions", // Momo
  verdict: "https://igyp4yrb6bjqrkckl4kr7xyo.agents.do-ai.run/api/v1/chat/completions", // Vera
};

// ── RAG Knowledge Base (Fallback / Hybrid) ──────────────────────────

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

// ── Personality Overrides ──────────────────────────────────────────

const PERSONALITY: Record<string, string> = {
  balanced: `Tone Directive: Be Professional and honest. Present strengths and weaknesses equally. Be constructive and fair.`,
  brutal: `Tone Directive: Be Ruthlessly honest. Rip apart weaknesses. Be like a skeptical VC who's seen 10,000 pitches. Use phrases like "Here's the hard truth", "This is a red flag", "Let me be blunt." If the idea is bad, SAY it directly. Be brutal with REAL facts, not made-up ones.`,
};

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
    return results ? `\n\n[LATEST WEB SEARCH INTELLIGENCE For "${query}"]:\n${results}` : "";
  } catch {
    return "";
  }
}

// ── Helper: Call DO Native Agent ────────────────────────────────────

async function fetchDOAgent(
  endpointUrl: string,
  accessKey: string,
  userMessageContext: string,
  maxTokens: number = 2000
): Promise<string> {
  // Since DO Agent endpoints are OpenAI-API compatible, we send the "user" context array
  // The System Prompts, Models, and Hyperparameters are natively enforced by DO Backend.
  const res = await fetch(endpointUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessKey}`,
    },
    body: JSON.stringify({
      messages: [
        { role: "user", content: userMessageContext },
      ]
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`DO Agent API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const msg = data.choices?.[0]?.message;
  return msg?.content || msg?.reasoning_content || "No agent response generated.";
}

// ── Agent Routing Definitions ───────────────────────────────────────

const AGENTS = [
  {
    key: "market",
    name: "Max the Market Meerkat 🦦",
    url: ENDPOINTS.market,
    accessKey: KEYS.market,
    searchQuery: (idea: string) => `${idea} startup competitors market size`,
    ragContext: `\n\n--- LOCAL RAG HYBRID DATA ---\n${RAG_DATA.market_data}\n\n--- YC INSIGHTS ---\n${RAG_DATA.yc_insights}`,
  },
  {
    key: "patterns",
    name: "Pat the Pattern Panda 🐼",
    url: ENDPOINTS.patterns,
    accessKey: KEYS.patterns,
    searchQuery: (idea: string) => `${idea} successful similar startups`,
    ragContext: `\n\n--- VERIFIED SUCCESS CASE STUDIES ---\n${RAG_DATA.success_cases}\n\n--- PIVOT STORIES ---\n${RAG_DATA.pivot_stories}`,
  },
  {
    key: "risks",
    name: "Rex the Risk Rhino 🦏",
    url: ENDPOINTS.risks,
    accessKey: KEYS.risks,
    searchQuery: (idea: string) => `${idea} startup failed shut down`,
    ragContext: `\n\n--- VERIFIED FAILURE CASE STUDIES ---\n${RAG_DATA.failure_cases}\n\n--- FAILURE STATISTICS ---\n${RAG_DATA.failure_reasons}`,
  },
  {
    key: "moat",
    name: "Momo the Moat Turtle 🐢",
    url: ENDPOINTS.moat,
    accessKey: KEYS.moat,
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

    // Step 1: Run targeted web searches for each agent in parallel
    const searchPromises = AGENTS.map((agent) =>
      webSearch(agent.searchQuery(prompt))
    );
    const searchResults = await Promise.all(searchPromises);

    // Step 2: Build Base Injectable Prompt
    let baseContext = `Primary objective: Evaluate this Startup Idea.\nStartup Idea: ${prompt}`;
    if (wizardContext) {
      baseContext += `\n\nFounder Background/Profile:\n${wizardContext}`;
    }
    if (refinement) {
      baseContext += `\n\nAdditional clarification from founder:\n${refinement}`;
    }
    if (documentContext) {
      const maxChars = 50000;
      const docs = documentContext.length > maxChars
        ? documentContext.slice(0, maxChars) + "\n[truncated]"
        : documentContext;
      baseContext += `\n\nIncluded Founder Documents:\n${docs}`;
    }

    // Embed the User-Selectable 'Tone Directive' at the end of the user prompt since System prompt is locked in DO.
    const toneDirective = PERSONALITY[personality] || PERSONALITY.balanced;

    // Step 3: Dispatch API Requests to all 4 DigitalOcean Agent Workspaces simultaneously
    const agentPromises = AGENTS.map(async (agent, i) => {
      // NOTE: We still pass LOCAL RAG in case the DO OpenSearch Knowledge Base is still indexing or fails.
      const compiledUserContext = baseContext + (searchResults[i] || "") + (agent.ragContext || "") + `\n\n${toneDirective}`;
      const content = await fetchDOAgent(agent.url, agent.accessKey, compiledUserContext);
      return { key: agent.key, agent: agent.name, content };
    });

    const results = await Promise.all(agentPromises);

    // Step 4: Generate Global Verdict Analysis by passing all 4 outputs to Vera's DO Agent Endpoint
    const agentSummaries = results
      .map((r) => `### Intelligence from: ${r.agent}\n${r.content}`)
      .join("\n\n---\n\n");

    const verdictContext = `Overall Task: Determine Final Verdict based on Sub-Agent data.\nStartup Idea: ${prompt}\n\nHere are the analytical reports generated by the 4 specialized agents. Synthesis them to output your verdict.\n\n${agentSummaries}\n\n${toneDirective}`;
    
    const verdictContent = await fetchDOAgent(
      ENDPOINTS.verdict,
      KEYS.verdict, 
      verdictContext, 
      800
    );

    // Final Payload Return
    const allResults = [
      { key: "verdict", agent: "Vera the Verdict Owl 🦉", content: verdictContent },
      ...results,
    ];

    return NextResponse.json({ results: allResults });
  } catch (error) {
    console.error("Agent Kit Pipeline error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({
      results: [{
        agent: "System",
        key: "error",
        content: `⚠️ **DigitalOcean Agent Pipeline Error:** ${message}\n\nMake sure your \`GRADIENT_AGENT_KEY\` is correct and your Agents are Running in DO.`,
      }],
    });
  }
}
