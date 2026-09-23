import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with realistic AI Agent telemetry...");

  // Clean existing data
  await prisma.evaluation.deleteMany();
  await prisma.span.deleteMany();
  await prisma.trace.deleteMany();
  await prisma.agent.deleteMany();
  await prisma.apiKey.deleteMany();

  // Create Agents
  const agentCoder = await prisma.agent.create({
    data: {
      name: "AutoCoder-X",
      description: "Autonomous code generation, refactoring, and PR review agent",
      model: "claude-3-5-sonnet",
      version: "v2.4.1",
      status: "ACTIVE",
      successRate: 98.2,
      totalRuns: 4210,
      avgLatency: 1840.5,
    },
  });

  const agentResearcher = await prisma.agent.create({
    data: {
      name: "DeepSynthesizer",
      description: "Multi-step web search, document synthesis, and report drafting agent",
      model: "gpt-4o",
      version: "v3.1.0",
      status: "ACTIVE",
      successRate: 96.5,
      totalRuns: 2890,
      avgLatency: 3420.0,
    },
  });

  const agentTriage = await prisma.agent.create({
    data: {
      name: "SecurityGuard-AI",
      description: "Static code analysis, vulnerability scanning, and dependency audit agent",
      model: "deepseek-r1",
      version: "v1.2.0",
      status: "ACTIVE",
      successRate: 99.1,
      totalRuns: 1650,
      avgLatency: 920.8,
    },
  });

  const agentSupport = await prisma.agent.create({
    data: {
      name: "CustomerVoice-Pulse",
      description: "Contextual ticket resolution, CRM lookup, and automated drafting agent",
      model: "gemini-1.5-pro",
      version: "v1.8.2",
      status: "IDLE",
      successRate: 94.3,
      totalRuns: 5120,
      avgLatency: 1150.2,
    },
  });

  // Create realistic Traces & Spans
  // Trace 1: Code generation with multiple tool calls
  const trace1 = await prisma.trace.create({
    data: {
      traceId: "trc_8f29ab44c1",
      agentId: agentCoder.id,
      name: "RefactorAuthenticationModule",
      status: "SUCCESS",
      durationMs: 2340,
      promptTokens: 1420,
      completionTokens: 890,
      totalTokens: 2310,
      costUsd: 0.0175,
      tags: "production,auth,refactor",
      metadata: JSON.stringify({ repo: "core-api", branch: "feat/jwt-refresh", user: "dev-lead" }),
    },
  });

  await prisma.span.createMany({
    data: [
      {
        traceId: trace1.id,
        name: "agent:initialize_context",
        spanType: "CHAIN",
        status: "OK",
        startOffsetMs: 0,
        durationMs: 120,
        input: JSON.stringify({ task: "Refactor JWT token refresh logic to support Redis session revocation" }),
        output: JSON.stringify({ loadedFiles: ["auth.service.ts", "token.util.ts"] }),
      },
      {
        traceId: trace1.id,
        name: "tool_call:read_codebase",
        spanType: "TOOL",
        status: "OK",
        startOffsetMs: 120,
        durationMs: 340,
        input: JSON.stringify({ path: "src/services/auth.service.ts", lines: "40-120" }),
        output: JSON.stringify({ status: 200, bytesRead: 4192 }),
      },
      {
        traceId: trace1.id,
        name: "llm_generate:claude-3-5-sonnet",
        spanType: "LLM",
        status: "OK",
        startOffsetMs: 460,
        durationMs: 1450,
        input: JSON.stringify({ temperature: 0.2, max_tokens: 2048, prompt_preview: "Refactor refreshToken method with Redis blocklist check..." }),
        output: JSON.stringify({ finish_reason: "stop", generated_diff: "+ await redis.set(`blacklist:${token}`, '1', 'EX', 86400);" }),
        model: "claude-3-5-sonnet",
        tokens: 1680,
      },
      {
        traceId: trace1.id,
        name: "tool_call:run_linter_and_tests",
        spanType: "TOOL",
        status: "OK",
        startOffsetMs: 1910,
        durationMs: 430,
        input: JSON.stringify({ command: "pnpm test:auth" }),
        output: JSON.stringify({ passed: 14, failed: 0, coverage: "94.8%" }),
      },
    ],
  });

  await prisma.evaluation.create({
    data: {
      traceId: trace1.id,
      metricName: "Instruction Adherence",
      score: 0.99,
      passed: true,
      feedback: "All Redis TTL requirements and fallback handlers properly implemented.",
      evaluator: "LLM-as-a-Judge",
    },
  });

  await prisma.evaluation.create({
    data: {
      traceId: trace1.id,
      metricName: "Security Audit",
      score: 0.97,
      passed: true,
      feedback: "No plaintext token logging detected in diff.",
      evaluator: "RuleBased",
    },
  });

  // Trace 2: Deep research with web retrieval
  const trace2 = await prisma.trace.create({
    data: {
      traceId: "trc_4b109cc28d",
      agentId: agentResearcher.id,
      name: "SemiconductorMarketForecast_Q3",
      status: "SUCCESS",
      durationMs: 4120,
      promptTokens: 3840,
      completionTokens: 2150,
      totalTokens: 5990,
      costUsd: 0.0418,
      tags: "finance,research,q3-report",
      metadata: JSON.stringify({ format: "executive_brief", sources: 12 }),
    },
  });

  await prisma.span.createMany({
    data: [
      {
        traceId: trace2.id,
        name: "tool_call:semantic_search",
        spanType: "RETRIEVAL",
        status: "OK",
        startOffsetMs: 0,
        durationMs: 650,
        input: JSON.stringify({ query: "HBM3e supply chain constraints 2026", topK: 8 }),
        output: JSON.stringify({ documentsRetrieved: 8, avgCosineSimilarity: 0.884 }),
      },
      {
        traceId: trace2.id,
        name: "llm_generate:gpt-4o",
        spanType: "LLM",
        status: "OK",
        startOffsetMs: 650,
        durationMs: 3100,
        input: JSON.stringify({ temperature: 0.4, prompt_preview: "Synthesize foundry yields and high-bandwidth memory packaging bottlenecks..." }),
        output: JSON.stringify({ sections: ["Executive Summary", "Foundry Allocation", "CapEx Forecast"] }),
        model: "gpt-4o",
        tokens: 5200,
      },
      {
        traceId: trace2.id,
        name: "chain:post_process_formatting",
        spanType: "CHAIN",
        status: "OK",
        startOffsetMs: 3750,
        durationMs: 370,
        input: JSON.stringify({ exportFormat: "markdown", citations: true }),
        output: JSON.stringify({ wordCount: 1420, footnotesCount: 14 }),
      },
    ],
  });

  await prisma.evaluation.create({
    data: {
      traceId: trace2.id,
      metricName: "Hallucination Risk",
      score: 0.04, // very low hallucination
      passed: true,
      feedback: "All data figures verified against cited SEC 10-Q filings.",
      evaluator: "LLM-as-a-Judge",
    },
  });

  // Trace 3: Failed dependency audit trace
  const trace3 = await prisma.trace.create({
    data: {
      traceId: "trc_99c81120f3",
      agentId: agentTriage.id,
      name: "DependencyVulnerabilityScan",
      status: "ERROR",
      durationMs: 890,
      promptTokens: 820,
      completionTokens: 140,
      totalTokens: 960,
      costUsd: 0.0032,
      errorMessage: "CVE-2026-4198 Critical threshold exceeded in package 'express-xml-bodyparser'",
      tags: "security,ci-cd,blocked",
      metadata: JSON.stringify({ exitCode: 1, alertLevel: "CRITICAL" }),
    },
  });

  await prisma.span.createMany({
    data: [
      {
        traceId: trace3.id,
        name: "tool_call:osv_database_lookup",
        spanType: "TOOL",
        status: "ERROR",
        startOffsetMs: 0,
        durationMs: 420,
        input: JSON.stringify({ lockfile: "package-lock.json", depth: 3 }),
        output: JSON.stringify({ vulnsFound: 1, cve: "CVE-2026-4198", severity: "CRITICAL", cvss: 9.8 }),
      },
      {
        traceId: trace3.id,
        name: "llm_generate:deepseek-r1",
        spanType: "LLM",
        status: "OK",
        startOffsetMs: 420,
        durationMs: 470,
        input: JSON.stringify({ prompt: "Generate mitigation advice for CVE-2026-4198..." }),
        output: JSON.stringify({ advice: "Upgrade to version 0.4.0 or replace with fast-xml-parser" }),
        model: "deepseek-r1",
        tokens: 380,
      },
    ],
  });

  await prisma.evaluation.create({
    data: {
      traceId: trace3.id,
      metricName: "Vulnerability Severity",
      score: 0.0,
      passed: false,
      feedback: "Build flagged and terminated due to CVSS 9.8 critical vulnerability.",
      evaluator: "RuleBased",
    },
  });

  // Create API Keys
  await prisma.apiKey.createMany({
    data: [
      {
        name: "Production Ingest Cluster",
        keyPrefix: "ap_live_79a2",
        keyHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        scopes: "traces:write,agents:read",
        lastUsedAt: new Date(Date.now() - 1000 * 60 * 12),
      },
      {
        name: "CI/CD Evaluation Runner",
        keyPrefix: "ap_live_41c0",
        keyHash: "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb",
        scopes: "traces:write,evals:write",
        lastUsedAt: new Date(Date.now() - 1000 * 60 * 45),
      },
      {
        name: "Local Development Key",
        keyPrefix: "ap_test_90e1",
        keyHash: "4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce",
        scopes: "read,write,admin",
        lastUsedAt: new Date(),
      },
    ],
  });

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
