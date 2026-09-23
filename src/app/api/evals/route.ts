import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const evaluations = await db.evaluation.findMany({
      include: {
        trace: {
          select: {
            id: true,
            traceId: true,
            name: true,
            agent: {
              select: { name: true, model: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const passedCount = evaluations.filter((e) => e.passed).length;
    const passRate =
      evaluations.length > 0
        ? ((passedCount / evaluations.length) * 100).toFixed(1)
        : "100.0";

    const avgScore =
      evaluations.length > 0
        ? (
            evaluations.reduce((sum, e) => sum + e.score, 0) / evaluations.length
          ).toFixed(2)
        : "1.00";

    return NextResponse.json({
      success: true,
      data: {
        evaluations,
        stats: {
          total: evaluations.length,
          passed: passedCount,
          passRate: `${passRate}%`,
          avgScore,
        },
      },
    });
  } catch (error) {
    console.error("Evals API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch evaluations" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { traceId, metricName, score, passed, feedback, evaluator = "LLM-as-a-Judge" } = body;

    const evaluation = await db.evaluation.create({
      data: {
        traceId,
        metricName,
        score,
        passed,
        feedback,
        evaluator,
      },
    });

    return NextResponse.json({
      success: true,
      data: evaluation,
    });
  } catch (error) {
    console.error("Evaluation submission error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create evaluation" },
      { status: 500 }
    );
  }
}
