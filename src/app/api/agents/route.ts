import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const agents = await db.agent.findMany({
      include: {
        _count: {
          select: { traces: true },
        },
      },
      orderBy: { totalRuns: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: agents,
    });
  } catch (error) {
    console.error("Agents API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch agents" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, model, version = "v1.0.0", status = "ACTIVE" } = body;

    if (!name || !model) {
      return NextResponse.json(
        { success: false, error: "Agent name and model are required" },
        { status: 400 }
      );
    }

    const agent = await db.agent.create({
      data: {
        name,
        description,
        model,
        version,
        status,
        successRate: 100.0,
        totalRuns: 0,
        avgLatency: 0.0,
      },
    });

    return NextResponse.json({
      success: true,
      data: agent,
    });
  } catch (error) {
    console.error("Agent creation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create agent" },
      { status: 500 }
    );
  }
}
