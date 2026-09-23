import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get("agentId");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const where: any = {};
    if (agentId && agentId !== "all") where.agentId = agentId;
    if (status && status !== "all") where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { traceId: { contains: search } },
        { tags: { contains: search } },
      ];
    }

    const traces = await db.trace.findMany({
      where,
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            model: true,
            version: true,
          },
        },
        spans: {
          orderBy: { startOffsetMs: "asc" },
        },
        evaluations: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: traces,
    });
  } catch (error) {
    console.error("Traces API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch traces" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      agentId,
      name,
      status = "SUCCESS",
      durationMs,
      promptTokens = 0,
      completionTokens = 0,
      costUsd = 0.0,
      tags = "api",
      metadata,
      errorMessage,
      spans = [],
    } = body;

    const traceId = `trc_${Math.random().toString(36).substring(2, 12)}`;
    const totalTokens = promptTokens + completionTokens;

    const newTrace = await db.trace.create({
      data: {
        traceId,
        agentId,
        name,
        status,
        durationMs,
        promptTokens,
        completionTokens,
        totalTokens,
        costUsd,
        tags,
        metadata: metadata ? JSON.stringify(metadata) : null,
        errorMessage,
        spans: {
          create: spans.map((s: any) => ({
            name: s.name,
            spanType: s.spanType || "CHAIN",
            status: s.status || "OK",
            startOffsetMs: s.startOffsetMs || 0,
            durationMs: s.durationMs || 100,
            input: typeof s.input === "string" ? s.input : JSON.stringify(s.input || {}),
            output: typeof s.output === "string" ? s.output : JSON.stringify(s.output || {}),
            model: s.model,
            tokens: s.tokens,
          })),
        },
      },
      include: {
        spans: true,
        agent: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: newTrace,
    });
  } catch (error) {
    console.error("Trace ingest error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to ingest trace" },
      { status: 500 }
    );
  }
}
