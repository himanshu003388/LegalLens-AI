/**
 * @file route.ts
 * @description API route for contract comparison and semantic redline diffing.
 * Computes Myers diff, categorizes modifications, and identifies risk shifts.
 */

import { NextRequest, NextResponse } from "next/server";
import { CompareDocumentsSchema } from "@/lib/security/schemas";
import { checkRateLimit, getClientIdentifier, UPLOAD_LIMIT_CONFIG } from "@/lib/security/rate-limiter";
import { compareContracts } from "@/lib/diff/contract-diff";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const clientId = getClientIdentifier(req.headers);
    const rateLimit = checkRateLimit(clientId, UPLOAD_LIMIT_CONFIG);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please wait before submitting another comparison.",
          retryAfterSeconds: rateLimit.retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validation = CompareDocumentsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid comparison input",
          details: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { originalFileName, revisedFileName, originalText, revisedText } = validation.data;
    const comparison = compareContracts(originalFileName, revisedFileName, originalText, revisedText);

    return NextResponse.json({
      success: true,
      comparison,
    });
  } catch (error: any) {
    console.error("API /api/compare error:", error);
    return NextResponse.json(
      {
        error: "Failed to compare contract revisions",
        message: error?.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
