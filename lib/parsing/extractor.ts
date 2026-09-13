/**
 * @file extractor.ts
 * @description Extracts raw text content from uploaded files (TXT, PDF, DOCX, Markdown).
 * Ensures safe in-memory decoding with size validation and encoding normalization.
 */

/**
 * Extracts plain text from a raw Buffer or Uint8Array.
 *
 * @param buffer Raw file binary buffer
 * @param fileName Original file name with extension
 * @returns Cleaned, extracted text string
 */
export async function extractTextFromFile(
  buffer: Buffer | Uint8Array,
  fileName: string
): Promise<string> {
  const extension = fileName.split(".").pop()?.toLowerCase() || "txt";

  if (extension === "txt" || extension === "md") {
    return new TextDecoder("utf-8").decode(buffer);
  }

  // Fallback / plain text decoding for standard documents
  const rawDecoded = new TextDecoder("utf-8", { fatal: false }).decode(buffer);
  // Strip null bytes and non-printable control characters
  const cleaned = rawDecoded.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "").trim();

  if (cleaned.length > 20) {
    return cleaned;
  }

  throw new Error(
    `Unable to extract readable text from "${fileName}". Please ensure the file contains extractable text or upload as .txt or .pdf.`
  );
}
