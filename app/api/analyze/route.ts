/**
 * @file route.ts
 * @description API route for document intelligence analysis.
 * Validates input with Zod, enforces rate limiting, sanitizes PII, and produces
 * clause breakdown, risk radar, reading ease, and action checklists.
 */

import { NextRequest, NextResponse } from "next/server";
import { AnalyzeDocumentSchema } from "@/lib/security/schemas";
import { checkRateLimit, getClientIdentifier, UPLOAD_LIMIT_CONFIG } from "@/lib/security/rate-limiter";
import { sanitizePII } from "@/lib/parsing/pii-sanitizer";
import { analyzeLegalDocument } from "@/lib/ai/provider";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting enforcement
    const clientId = getClientIdentifier(req.headers);
    const rateLimit = checkRateLimit(clientId, UPLOAD_LIMIT_CONFIG);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please wait before submitting another document.",
          retryAfterSeconds: rateLimit.retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            "Retry-After": rateLimit.retryAfterSeconds.toString(),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    // 2. Input validation
    const json = await req.json();
    const validation = AnalyzeDocumentSchema.safeParse(json);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid request payload",
          details: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { fileName, text, anonymizePII, apiKey, provider } = validation.data;

    // Extract API key and provider preference from body or request headers
    const userApiKey =
      apiKey ||
      req.headers.get("x-gemini-api-key") ||
      req.headers.get("x-api-key") ||
      undefined;

    const userProvider =
      provider ||
      req.headers.get("x-ai-provider") ||
      undefined;

    // 3. Privacy & PII sanitization
    let processedText = text;
    let redactionStats = null;

    if (anonymizePII) {
      const sanitized = sanitizePII(text);
      processedText = sanitized.sanitizedText;
      redactionStats = sanitized.redactedTypes;
    }

    // 4. Document intelligence analysis
    const analysis = await analyzeLegalDocument(fileName, processedText, userApiKey, userProvider);

    return NextResponse.json(
      {
        success: true,
        analysis,
        redactionStats,
      },
      {
        headers: {
          "X-RateLimit-Remaining": rateLimit.remaining.toString(),
        },
      }
    );
  } catch (error: any) {
    console.error("API /api/analyze error:", error);
    return NextResponse.json(
      {
        error: "Failed to analyze legal document",
        message: error?.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
