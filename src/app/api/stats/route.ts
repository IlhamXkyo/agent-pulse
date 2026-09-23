import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const totalTraces = await db.trace.count();
    const activeAgents = await db.agent.count({
      where: { status: "ACTIVE" },
    });

    const traces = await db.trace.findMany({
      select: {
        durationMs: true,
        totalTokens: true,
        costUsd: true,
        status: true,
      },
    });

    const totalTokens = traces.reduce((acc, t) => acc + t.totalTokens, 0);
    const totalCost = traces.reduce((acc, t) => acc + t.costUsd, 0);
    const errorCount = traces.filter((t) => t.status === "ERROR").length;
    const errorRate =
      traces.length > 0
        ? ((errorCount / traces.length) * 100).toFixed(1)
        : "0.0";

    const latencies = traces.map((t) => t.durationMs).sort((a, b) => a - b);
    const avgLatency =
      latencies.length > 0
        ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
        : 0;
    const p95Latency =
      latencies.length > 0
        ? latencies[Math.floor(latencies.length * 0.95)] || latencies[latencies.length - 1]
        : 0;

    return NextResponse.json({
      success: true,
      data: {
        totalTraces,
        activeAgents,
        totalTokens,
        totalCost,
        avgLatency,
        p95Latency,
        errorRate: `${errorRate}%`,
      },
    });
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch telemetry stats" },
      { status: 500 }
    );
  }
}
