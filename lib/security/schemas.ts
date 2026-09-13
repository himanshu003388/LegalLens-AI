/**
 * @file schemas.ts
 * @description Zod validation schemas for all incoming API payloads.
 * Ensures strict typing and rejects malformed or oversized requests.
 */

import { z } from "zod";

/**
 * Maximum allowed character length for document text (~100,000 words).
 */
const MAX_DOCUMENT_LENGTH = 500_000;

/**
 * Validation schema for document analysis request.
 */
export const AnalyzeDocumentSchema = z.object({
  fileName: z.string().min(1).max(255),
  text: z.string().min(10, "Document text must be at least 10 characters").max(MAX_DOCUMENT_LENGTH, "Document exceeds 500,000 character limit"),
  fileType: z.enum(["txt", "pdf", "docx", "raw"]).default("txt"),
  anonymizePII: z.boolean().default(true),
  apiKey: z.string().max(500).optional(),
  provider: z.enum(["gemini", "openai", "anthropic", "local", "auto"]).optional(),
});

export type AnalyzeDocumentInput = z.infer<typeof AnalyzeDocumentSchema>;

/**
 * Validation schema for streaming cited Q&A chat.
 */
export const ChatRequestSchema = z.object({
  documentText: z.string().min(10).max(MAX_DOCUMENT_LENGTH),
  question: z.string().min(2, "Question must be at least 2 characters").max(2000, "Question is too long"),
  history: z
    .array(
      z.object({
        sender: z.enum(["user", "assistant"]),
        content: z.string().max(4000),
      })
    )
    .optional()
    .default([]),
  apiKey: z.string().max(500).optional(),
  provider: z.enum(["gemini", "openai", "anthropic", "local", "auto"]).optional(),
});

export type ChatRequestInput = z.infer<typeof ChatRequestSchema>;

/**
 * Validation schema for contract comparison request.
 */
export const CompareDocumentsSchema = z.object({
  originalFileName: z.string().min(1).max(255).default("Document_v1.txt"),
  revisedFileName: z.string().min(1).max(255).default("Document_v2.txt"),
  originalText: z.string().min(10).max(MAX_DOCUMENT_LENGTH),
  revisedText: z.string().min(10).max(MAX_DOCUMENT_LENGTH),
  apiKey: z.string().max(500).optional(),
  provider: z.enum(["gemini", "openai", "anthropic", "local", "auto"]).optional(),
});

export type CompareDocumentsInput = z.infer<typeof CompareDocumentsSchema>;

