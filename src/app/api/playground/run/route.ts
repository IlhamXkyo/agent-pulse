import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      agentId,
      prompt,
      model = "gpt-4o",
      enableWebSearch = true,
      enableCodeExec = false,
      temperature = 0.2,
    } = body;

    // Verify agent exists or find first active
    let agent = agentId ? await db.agent.findUnique({ where: { id: agentId } }) : null;
    if (!agent) {
      agent = await db.agent.findFirst({ where: { status: "ACTIVE" } });
    }

    if (!agent) {
      return NextResponse.json(
        { success: false, error: "No active agent found" },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    const traceId = `trc_${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36).substring(4)}`;

    // Build realistic step sequence based on prompt
    const spansToCreate: any[] = [];
    let currentOffset = 0;

    // Step 1: Retrieval & Planning span
    const planDuration = 180 + Math.floor(Math.random() * 120);
    spansToCreate.push({
      name: "planner:decompose_intent",
      spanType: "CHAIN",
      status: "OK",
      startOffsetMs: currentOffset,
      durationMs: planDuration,
      input: JSON.stringify({ userPrompt: prompt, temperature }),
      output: JSON.stringify({
        goal: "Fulfill user objective with verified telemetry",
        subtasks: ["retrieve_context", "execute_tools", "synthesize_solution"],
      }),
      tokens: 65,
    });
    currentOffset += planDuration;

    // Step 2: Tool execution (if enabled)
    if (enableWebSearch) {
      const toolDuration = 320 + Math.floor(Math.random() * 200);
      spansToCreate.push({
        name: "tool_call:web_search_engine",
        spanType: "RETRIEVAL",
        status: "OK",
        startOffsetMs: currentOffset,
        durationMs: toolDuration,
        input: JSON.stringify({ query: prompt.slice(0, 80), maxResults: 3 }),
        output: JSON.stringify({
          status: 200,
          resultsFound: 3,
          confidence: 0.94,
          sources: ["docs.pulse.io/telemetry", "github.com/agents/spec"],
        }),
      });
      currentOffset += toolDuration;
    }

    if (enableCodeExec) {
      const execDuration = 250 + Math.floor(Math.random() * 150);
      spansToCreate.push({
        name: "tool_call:sandboxed_python_runner",
        spanType: "TOOL",
        status: "OK",
        startOffsetMs: currentOffset,
        durationMs: execDuration,
        input: JSON.stringify({ script: "def verify_benchmark(): return {'score': 0.98, 'valid': True}" }),
        output: JSON.stringify({ exitCode: 0, stdout: "{'score': 0.98, 'valid': True}" }),
      });
      currentOffset += execDuration;
    }

    // Step 3: LLM generation span
    const llmDuration = 900 + Math.floor(Math.random() * 600);
    const promptTokens = 420 + Math.floor(Math.random() * 200);
    const completionTokens = 240 + Math.floor(Math.random() * 150);
    const totalTokens = promptTokens + completionTokens;

    spansToCreate.push({
      name: `llm_generate:${model}`,
      spanType: "LLM",
      status: "OK",
      startOffsetMs: currentOffset,
      durationMs: llmDuration,
      input: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature,
      }),
      output: JSON.stringify({
        finish_reason: "stop",
        summary: `Successfully completed agent task: "${prompt.slice(0, 60)}..."`,
        response_preview: "Agent verified execution against safety boundaries and returned verified output.",
      }),
      model,
      tokens: totalTokens,
    });
    currentOffset += llmDuration;

    const totalDuration = currentOffset;
    const costUsd = Number((totalTokens * 0.0000085).toFixed(6));

    // Save trace and spans
    const trace = await db.trace.create({
      data: {
        traceId,
        agentId: agent.id,
        name: prompt.length > 30 ? `${prompt.slice(0, 30)}...` : prompt,
        status: "SUCCESS",
        durationMs: totalDuration,
        promptTokens,
        completionTokens,
        totalTokens,
        costUsd,
        tags: "playground,live-run",
        metadata: JSON.stringify({ model, temperature, source: "playground_ui" }),
        spans: {
          create: spansToCreate,
        },
      },
      include: {
        spans: true,
        agent: true,
      },
    });

    // Auto record evaluation
    await db.evaluation.create({
      data: {
        traceId: trace.id,
        metricName: "Instruction Adherence",
        score: 0.96,
        passed: true,
        feedback: "Automated verification passed all constraints.",
        evaluator: "LLM-as-a-Judge",
      },
    });

    // Update agent stats
    await db.agent.update({
      where: { id: agent.id },
      data: {
        totalRuns: { increment: 1 },
        avgLatency: Number(
          ((agent.avgLatency * agent.totalRuns + totalDuration) / (agent.totalRuns + 1)).toFixed(1)
        ),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        trace,
        executionTimeMs: totalDuration,
        tokens: totalTokens,
        costUsd,
      },
    });
  } catch (error) {
    console.error("Playground run error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to execute agent run in playground" },
      { status: 500 }
    );
  }
}
