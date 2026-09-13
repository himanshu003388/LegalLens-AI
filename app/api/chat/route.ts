/**
 * @file route.ts
 * @description Streaming API route for grounded cited Q&A over legal documents.
 * Answers questions by retrieving relevant sections and streaming responses via SSE.
 */

import { NextRequest, NextResponse } from "next/server";
import { ChatRequestSchema } from "@/lib/security/schemas";
import { checkRateLimit, getClientIdentifier, CHAT_LIMIT_CONFIG } from "@/lib/security/rate-limiter";
import { streamCitedAnswer } from "@/lib/ai/provider";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting
    const clientId = getClientIdentifier(req.headers);
    const rateLimit = checkRateLimit(clientId, CHAT_LIMIT_CONFIG);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Chat rate limit exceeded. Please wait before asking another question.",
          retryAfterSeconds: rateLimit.retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            "Retry-After": rateLimit.retryAfterSeconds.toString(),
          },
        }
      );
    }

    // 2. Validate input
    const body = await req.json();
    const validation = ChatRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid chat payload",
          details: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { question, documentText } = validation.data;

    // 3. Initiate grounded streaming completion
    const { stream } = await streamCitedAnswer(question, documentText);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-RateLimit-Remaining": rateLimit.remaining.toString(),
      },
    });
  } catch (error: any) {
    console.error("API /api/chat error:", error);
    return NextResponse.json(
      {
        error: "Failed to process legal inquiry",
        message: error?.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
