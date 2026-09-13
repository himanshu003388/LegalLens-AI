/**
 * @file provider.ts
 * @description Unified AI provider supporting Google Gemini, OpenAI, Anthropic, and Local Zero-Key Engine.
 * Transparently manages streaming completions, chunk retrieval, and graceful fallback logic.
 */

import { DocumentAnalysis, Citation } from "@/lib/types/legal";
import { analyzeDocumentLocally } from "./local-intelligence";
import { chunkDocument, retrieveRelevantCitations } from "../retrieval/chunker";
import { LEGAL_ANALYSIS_SYSTEM_PROMPT, CITED_QA_SYSTEM_PROMPT } from "./prompts";

export type SupportedAIProvider = "gemini" | "openai" | "anthropic" | "local";

export interface AIProviderConfig {
  provider: SupportedAIProvider;
  modelName: string;
  hasKey: boolean;
  apiKey?: string;
}

/**
 * Inspects active environment variables and optional user-supplied credentials
 * to detect the active GenAI service.
 *
 * @param customKey Optional user-supplied API key from session/header
 * @param preferredProvider Optional user-selected provider ("gemini", "openai", "anthropic", "local", "auto")
 */
export function getAIProviderConfig(
  customKey?: string,
  preferredProvider?: string
): AIProviderConfig {
  const geminiEnvKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY)?.trim();
  const openaiEnvKey = process.env.OPENAI_API_KEY?.trim();
  const anthropicEnvKey = process.env.ANTHROPIC_API_KEY?.trim();
  const envProvider = process.env.AI_PROVIDER?.toLowerCase()?.trim();

  const userKey = customKey?.trim();
  const reqProvider = preferredProvider?.toLowerCase()?.trim();

  // 1. Explicit provider requested with a key
  if (reqProvider === "gemini" && (userKey || geminiEnvKey)) {
    return {
      provider: "gemini",
      modelName: "Google Gemini 1.5 Flash",
      hasKey: true,
      apiKey: userKey || geminiEnvKey,
    };
  }
  if (reqProvider === "openai" && (userKey || openaiEnvKey)) {
    return {
      provider: "openai",
      modelName: "GPT-4o / GPT-4o-mini",
      hasKey: true,
      apiKey: userKey || openaiEnvKey,
    };
  }
  if (reqProvider === "anthropic" && (userKey || anthropicEnvKey)) {
    return {
      provider: "anthropic",
      modelName: "Claude 3.5 Sonnet",
      hasKey: true,
      apiKey: userKey || anthropicEnvKey,
    };
  }

  // 2. Auto-detect based on key prefix if user provided a key
  if (userKey) {
    if (userKey.startsWith("AIza")) {
      return {
        provider: "gemini",
        modelName: "Google Gemini 1.5 Flash",
        hasKey: true,
        apiKey: userKey,
      };
    }
    if (userKey.startsWith("sk-ant-")) {
      return {
        provider: "anthropic",
        modelName: "Claude 3.5 Sonnet",
        hasKey: true,
        apiKey: userKey,
      };
    }
    if (userKey.startsWith("sk-")) {
      return {
        provider: "openai",
        modelName: "GPT-4o / GPT-4o-mini",
        hasKey: true,
        apiKey: userKey,
      };
    }
    // Default arbitrary custom key
    if (reqProvider === "openai") {
      return { provider: "openai", modelName: "GPT-4o", hasKey: true, apiKey: userKey };
    }
    if (reqProvider === "anthropic") {
      return { provider: "anthropic", modelName: "Claude 3.5 Sonnet", hasKey: true, apiKey: userKey };
    }
    return {
      provider: "gemini",
      modelName: "Google Gemini 1.5 Flash",
      hasKey: true,
      apiKey: userKey,
    };
  }

  // 3. Check environment provider preference
  if (envProvider === "gemini" && geminiEnvKey) {
    return {
      provider: "gemini",
      modelName: "Google Gemini 1.5 Flash",
      hasKey: true,
      apiKey: geminiEnvKey,
    };
  }
  if (envProvider === "anthropic" && anthropicEnvKey) {
    return {
      provider: "anthropic",
      modelName: "Claude 3.5 Sonnet",
      hasKey: true,
      apiKey: anthropicEnvKey,
    };
  }
  if (envProvider === "openai" && openaiEnvKey) {
    return {
      provider: "openai",
      modelName: "GPT-4o / GPT-4o-mini",
      hasKey: true,
      apiKey: openaiEnvKey,
    };
  }

  // 4. Default priority order if keys exist in environment
  if (geminiEnvKey) {
    return {
      provider: "gemini",
      modelName: "Google Gemini 1.5 Flash",
      hasKey: true,
      apiKey: geminiEnvKey,
    };
  }
  if (openaiEnvKey) {
    return {
      provider: "openai",
      modelName: "GPT-4o / GPT-4o-mini",
      hasKey: true,
      apiKey: openaiEnvKey,
    };
  }
  if (anthropicEnvKey) {
    return {
      provider: "anthropic",
      modelName: "Claude 3.5 Sonnet",
      hasKey: true,
      apiKey: anthropicEnvKey,
    };
  }

  return {
    provider: "local",
    modelName: "LegalLens Local NLP Engine (Zero-Key Evaluator Mode)",
    hasKey: false,
  };
}

/**
 * Runs full document analysis via active AI provider (Gemini, OpenAI, Anthropic) or local engine fallback.
 *
 * @param fileName Document file name
 * @param text Document raw text
 * @param userApiKey Optional user-supplied API key
 * @param userProvider Optional provider override
 * @returns Complete DocumentAnalysis object
 */
export async function analyzeLegalDocument(
  fileName: string,
  text: string,
  userApiKey?: string,
  userProvider?: string
): Promise<DocumentAnalysis> {
  const config = getAIProviderConfig(userApiKey, userProvider);
  const baseline = analyzeDocumentLocally(fileName, text);

  // 1. Google Gemini Provider
  if (config.provider === "gemini" && config.apiKey) {
    try {
      const geminiResult = await callGeminiAnalysis(fileName, text, config.apiKey);
      if (geminiResult) {
        return {
          ...baseline,
          ...geminiResult,
          fileName,
          analyzedAt: new Date().toISOString(),
        };
      }
    } catch (err) {
      console.warn("Google Gemini API call failed, falling back to local engine:", err);
    }
  }

  // 2. OpenAI Provider
  if (config.provider === "openai" && config.apiKey) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: LEGAL_ANALYSIS_SYSTEM_PROMPT },
            {
              role: "user",
              content: `Analyze this legal document ("${fileName}") and return structured JSON:\n\n${text.slice(0, 30000)}`,
            },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          return {
            ...baseline,
            ...parsed,
            fileName,
            analyzedAt: new Date().toISOString(),
          };
        }
      }
    } catch (err) {
      console.warn("OpenAI API call failed, falling back to local engine:", err);
    }
  }

  // 3. Anthropic Provider
  if (config.provider === "anthropic" && config.apiKey) {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": config.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 4000,
          system: LEGAL_ANALYSIS_SYSTEM_PROMPT,
          messages: [
            {
              role: "user",
              content: `Analyze this legal document ("${fileName}") and return structured JSON:\n\n${text.slice(0, 30000)}`,
            },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const contentText = data.content?.[0]?.text;
        if (contentText) {
          const parsed = JSON.parse(contentText);
          return {
            ...baseline,
            ...parsed,
            fileName,
            analyzedAt: new Date().toISOString(),
          };
        }
      }
    } catch (err) {
      console.warn("Anthropic API call failed, falling back to local engine:", err);
    }
  }

  // Default: Local deterministic fallback
  return baseline;
}

/**
 * Invokes Google Gemini 1.5 Flash API for structured document intelligence.
 */
async function callGeminiAnalysis(
  fileName: string,
  text: string,
  apiKey: string
): Promise<Partial<DocumentAnalysis> | null> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const promptText = `Analyze this legal document ("${fileName}") and return structured JSON matching the LegalLens analysis schema:\n\n${text.slice(0, 45000)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: promptText }],
        },
      ],
      systemInstruction: {
        parts: [{ text: LEGAL_ANALYSIS_SYSTEM_PROMPT }],
      },
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.warn("Gemini generateContent error:", response.status, errorText);
    return null;
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) return null;

  try {
    return JSON.parse(rawText);
  } catch (parseErr) {
    console.warn("Failed to parse Gemini JSON output:", parseErr);
    return null;
  }
}

/**
 * Answers a user question with grounded citations, streaming the response as SSE chunks.
 * Supports Google Gemini streaming, OpenAI streaming, and deterministic local streaming.
 *
 * @param question User's question
 * @param documentText Full document text
 * @param userApiKey Optional user-supplied API key
 * @param userProvider Optional provider override
 * @returns ReadableStream delivering text chunks and final citations JSON
 */
export async function streamCitedAnswer(
  question: string,
  documentText: string,
  userApiKey?: string,
  userProvider?: string
): Promise<{ stream: ReadableStream; citations: Citation[] }> {
  const chunks = chunkDocument(documentText);
  const citations = retrieveRelevantCitations(question, chunks, 3);
  const config = getAIProviderConfig(userApiKey, userProvider);

  const context = citations
    .map((c) => `[SECTION: ${c.sectionTitle}]\nQuote: ${c.exactQuote}`)
    .join("\n\n");

  // 1. Google Gemini Streaming
  if (config.provider === "gemini" && config.apiKey) {
    try {
      const geminiStream = await streamGeminiCitedResponse(question, context, config.apiKey, citations);
      if (geminiStream) {
        return { stream: geminiStream, citations };
      }
    } catch (e) {
      console.warn("Live Gemini streaming failed, streaming from local engine instead:", e);
    }
  }

  // 2. OpenAI Streaming
  if (config.provider === "openai" && config.apiKey) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          stream: true,
          messages: [
            { role: "system", content: CITED_QA_SYSTEM_PROMPT },
            {
              role: "user",
              content: `Document Excerpts:\n${context}\n\nQuestion: ${question}`,
            },
          ],
        }),
      });

      if (response.ok && response.body) {
        return { stream: response.body, citations };
      }
    } catch (e) {
      console.warn("Live OpenAI streaming failed, streaming from local engine instead:", e);
    }
  }

  // 3. Local streaming engine: builds grounded response and streams words with realistic pacing
  const answerText = generateLocalCitedAnswer(question, citations, documentText);

  const encoder = new TextEncoder();
  const words = answerText.split(" ");
  let wordIndex = 0;

  const stream = new ReadableStream({
    async start(controller) {
      const interval = setInterval(() => {
        if (wordIndex < words.length) {
          const chunk = (wordIndex > 0 ? " " : "") + words[wordIndex++];
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`));
        } else {
          // Stream completed, deliver citations metadata
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ done: true, citations })}\n\n`)
          );
          clearInterval(interval);
          controller.close();
        }
      }, 35); // 35ms per word for natural reading stream
    },
  });

  return { stream, citations };
}

/**
 * Streams real-time tokens from Google Gemini 1.5 Flash over SSE.
 */
async function streamGeminiCitedResponse(
  question: string,
  context: string,
  apiKey: string,
  citations: Citation[]
): Promise<ReadableStream | null> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?alt=sse&key=${apiKey}`;

  const promptText = `Document Excerpts:\n${context}\n\nUser Inquiry: ${question}\n\nPlease answer the question, citing relevant clauses and explaining the legal risk clearly.`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: promptText }],
        },
      ],
      systemInstruction: {
        parts: [{ text: CITED_QA_SYSTEM_PROMPT }],
      },
      generationConfig: {
        temperature: 0.2,
      },
    }),
  });

  if (!response.ok || !response.body) {
    const err = await response.text();
    console.warn("Gemini stream response error:", response.status, err);
    return null;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith("data: ")) {
              const jsonStr = trimmed.slice(6);
              try {
                const parsed = JSON.parse(jsonStr);
                const textChunk = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                if (textChunk) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ text: textChunk })}\n\n`)
                  );
                }
              } catch {
                // Ignore chunk parse anomalies
              }
            }
          }
        }

        // Send final citations and completion marker
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ done: true, citations })}\n\n`)
        );
        controller.close();
      } catch (streamErr) {
        console.warn("Error during Gemini stream processing:", streamErr);
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ done: true, citations })}\n\n`)
        );
        controller.close();
      }
    },
  });
}

function generateLocalCitedAnswer(
  question: string,
  citations: Citation[],
  fullText: string
): string {
  const q = question.toLowerCase();

  if (citations.length === 0) {
    return (
      "Based on the provided document, there are no specific clauses or terms addressing your question. " +
      "Contractual agreements typically silence unmentioned terms, which means standard statutory rules apply. " +
      "We recommend consulting a licensed attorney to clarify your rights regarding this topic."
    );
  }

  const primaryCitation = citations[0];

  if (q.includes("terminate") || q.includes("cancel") || q.includes("exit") || q.includes("end")) {
    return (
      `According to **${primaryCitation.sectionTitle}**, termination is governed by specific notice requirements. ` +
      `The agreement states: *"${primaryCitation.exactQuote}"*. ` +
      `To protect yourself, ensure any cancellation notice is sent via certified mail or tracked email within the specified notice window.`
    );
  }

  if (q.includes("liab") || q.includes("damage") || q.includes("sue") || q.includes("fault") || q.includes("indemn")) {
    return (
      `Under **${primaryCitation.sectionTitle}**, the contract defines the allocation of liability between the parties. ` +
      `Specifically, the text notes: *"${primaryCitation.exactQuote}"*. ` +
      `Ensure you verify whether this liability is subject to an aggregate monetary cap and whether indirect or consequential damages are waived.`
    );
  }

  if (q.includes("pay") || q.includes("fee") || q.includes("cost") || q.includes("price") || q.includes("rent") || q.includes("deposit")) {
    return (
      `Payment obligations are outlined in **${primaryCitation.sectionTitle}**. ` +
      `The governing language indicates: *"${primaryCitation.exactQuote}"*. ` +
      `Be sure to observe the payment due date and check if late interest or grace periods apply.`
    );
  }

  return (
    `Regarding your inquiry, **${primaryCitation.sectionTitle}** provides the directly applicable contractual framework. ` +
    `The clause states: *"${primaryCitation.exactQuote}"*. ` +
    `Review this provision carefully in the context of the entire agreement to understand your full rights and obligations.`
  );
}
