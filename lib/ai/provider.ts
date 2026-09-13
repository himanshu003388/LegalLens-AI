/**
 * @file provider.ts
 * @description Unified AI provider supporting OpenAI, Anthropic, and Local Zero-Key Engine.
 * Transparently manages streaming completions, chunk retrieval, and fallback logic.
 */

import { DocumentAnalysis, Citation } from "@/lib/types/legal";
import { analyzeDocumentLocally } from "./local-intelligence";
import { chunkDocument, retrieveRelevantCitations } from "../retrieval/chunker";
import { LEGAL_ANALYSIS_SYSTEM_PROMPT, CITED_QA_SYSTEM_PROMPT } from "./prompts";

export interface AIProviderConfig {
  provider: "openai" | "anthropic" | "local";
  modelName: string;
  hasKey: boolean;
}

/**
 * Inspects active environment variables to detect configured GenAI services.
 */
export function getAIProviderConfig(): AIProviderConfig {
  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  const anthropicKey = process.env.ANTHROPIC_API_KEY?.trim();
  const providerPreference = process.env.AI_PROVIDER?.toLowerCase();

  if (providerPreference === "anthropic" && anthropicKey) {
    return { provider: "anthropic", modelName: "Claude 3.5 Sonnet", hasKey: true };
  }

  if (openaiKey) {
    return { provider: "openai", modelName: "GPT-4o / GPT-4o-mini", hasKey: true };
  }

  if (anthropicKey) {
    return { provider: "anthropic", modelName: "Claude 3.5 Sonnet", hasKey: true };
  }

  return {
    provider: "local",
    modelName: "LegalLens Local NLP Engine (Zero-Key Evaluator Mode)",
    hasKey: false,
  };
}

/**
 * Runs full document analysis via active AI provider or local engine fallback.
 *
 * @param fileName Document file name
 * @param text Document raw text
 * @returns Complete DocumentAnalysis object
 */
export async function analyzeLegalDocument(
  fileName: string,
  text: string
): Promise<DocumentAnalysis> {
  const config = getAIProviderConfig();

  if (config.provider === "openai" && process.env.OPENAI_API_KEY) {
    try {
      // Direct fetch call to OpenAI API (avoids heavy dependencies)
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
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
            ...analyzeDocumentLocally(fileName, text), // baseline structure
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

  // Local deterministic fallback
  return analyzeDocumentLocally(fileName, text);
}

/**
 * Answers a user question with grounded citations, streaming the response as SSE chunks.
 *
 * @param question User's question
 * @param documentText Full document text
 * @returns ReadableStream delivering text chunks and final citations JSON
 */
export async function streamCitedAnswer(
  question: string,
  documentText: string
): Promise<{ stream: ReadableStream; citations: Citation[] }> {
  const chunks = chunkDocument(documentText);
  const citations = retrieveRelevantCitations(question, chunks, 3);
  const config = getAIProviderConfig();

  // If OpenAI key is set, stream from OpenAI
  if (config.provider === "openai" && process.env.OPENAI_API_KEY) {
    try {
      const context = citations
        .map((c) => `[SECTION: ${c.sectionTitle}]\nQuote: ${c.exactQuote}`)
        .join("\n\n");

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
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

  // Local streaming engine: builds grounded response and streams words with realistic pacing
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
