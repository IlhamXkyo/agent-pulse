import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";

export async function GET() {
  try {
    const keys = await db.apiKey.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: keys,
    });
  } catch (error) {
    console.error("API keys query error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch API keys" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, scopes = "read,write" } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Key name is required" },
        { status: 400 }
      );
    }

    const randomSuffix = crypto.randomBytes(16).toString("hex");
    const rawKey = `ap_live_${randomSuffix}`;
    const keyPrefix = rawKey.substring(0, 12);
    const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

    const newKey = await db.apiKey.create({
      data: {
        name,
        keyPrefix,
        keyHash,
        scopes,
        lastUsedAt: null,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...newKey,
        rawKey, // Only returned once on creation!
      },
    });
  } catch (error) {
    console.error("API key creation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate API key" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Key ID is required" },
        { status: 400 }
      );
    }

    await db.apiKey.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "API key revoked successfully",
    });
  } catch (error) {
    console.error("API key revocation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to revoke API key" },
      { status: 500 }
    );
  }
}
