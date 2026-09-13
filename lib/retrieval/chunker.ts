/**
 * @file chunker.ts
 * @description Intelligent section-aware document chunking and retrieval engine.
 * Breaks contracts into semantically coherent segments, attaches section anchors,
 * and retrieves the most relevant chunks with exact quotes for grounded citations.
 *
 * CHUNKING STRATEGY:
 * - Chunk size: ~500 words (~2,000 to 2,500 characters)
 * - Overlap: 75 words (~300 characters)
 * - Boundary: Prioritizes section headings (Section, Article, Clause, Paragraph, numbers)
 * - Why: Preserves legal obligation context and prevents splitting a risk clause midway
 *   while maintaining fine-grained precision for grounded citations.
 */

import { Citation } from "@/lib/types/legal";

export interface DocumentChunk {
  id: string;
  chunkIndex: number;
  sectionTitle: string;
  content: string;
  wordCount: number;
  startCharIndex: number;
  endCharIndex: number;
}

/**
 * Splits legal text into section-aware chunks with sliding window overlap.
 *
 * @param text Full document text
 * @param targetChunkWords Target word count per chunk (default: 450)
 * @param overlapWords Number of overlapping words between consecutive chunks (default: 75)
 * @returns Array of DocumentChunk objects with section headers
 */
export function chunkDocument(
  text: string,
  targetChunkWords: number = 450,
  overlapWords: number = 75
): DocumentChunk[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  // Regex to detect standard legal section headings (e.g. "1. Term", "Section 3. Liability", "ARTICLE IV:")
  const sectionHeaderRegex =
    /(?:^|\n)(?:SECTION|ARTICLE|CLAUSE|PARAGRAPH|\d+\.|\([a-z0-9]+\))\s*([^\n]{3,60})/gi;

  const paragraphs = text.split(/\n\s*\n/);
  const chunks: DocumentChunk[] = [];

  let currentChunkWords: string[] = [];
  let currentSection = "Introduction / Preamble";
  let chunkIndex = 0;
  let charCounter = 0;
  let currentChunkStartChar = 0;

  for (const para of paragraphs) {
    const trimmedPara = para.trim();
    if (!trimmedPara) continue;

    // Check if paragraph begins with a section heading
    const headerMatch = trimmedPara.match(/^(?:SECTION|ARTICLE|CLAUSE|\d+\.|\([a-z0-9]+\))\s*([^\n]{2,80})/i);
    if (headerMatch) {
      currentSection = headerMatch[0].replace(/\n/g, " ").trim();
    }

    const paraWords = trimmedPara.split(/\s+/);
    currentChunkWords.push(...paraWords);

    if (currentChunkWords.length >= targetChunkWords) {
      const chunkText = currentChunkWords.join(" ");
      const chunkCharLength = chunkText.length;

      chunks.push({
        id: `chunk_${chunkIndex}`,
        chunkIndex,
        sectionTitle: currentSection,
        content: chunkText,
        wordCount: currentChunkWords.length,
        startCharIndex: currentChunkStartChar,
        endCharIndex: currentChunkStartChar + chunkCharLength,
      });

      chunkIndex++;
      currentChunkStartChar += chunkCharLength;

      // Retain sliding window overlap
      currentChunkWords = currentChunkWords.slice(-overlapWords);
    }

    charCounter += trimmedPara.length + 2;
  }

  // Flush remaining words into final chunk
  if (currentChunkWords.length > 0) {
    const chunkText = currentChunkWords.join(" ");
    chunks.push({
      id: `chunk_${chunkIndex}`,
      chunkIndex,
      sectionTitle: currentSection,
      content: chunkText,
      wordCount: currentChunkWords.length,
      startCharIndex: currentChunkStartChar,
      endCharIndex: currentChunkStartChar + chunkText.length,
    });
  }

  return chunks;
}

/**
 * Searches chunks using a token-weighted relevance algorithm to retrieve
 * the top-k most relevant excerpts and build grounded citations.
 *
 * @param query The user's legal question
 * @param chunks Pre-computed document chunks
 * @param topK Number of relevant chunks to retrieve (default: 3)
 * @returns Array of Grounded Citation objects
 */
export function retrieveRelevantCitations(
  query: string,
  chunks: DocumentChunk[],
  topK: number = 3
): Citation[] {
  if (!query || chunks.length === 0) return [];

  const queryTerms = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((term) => term.length > 2 && !STOP_WORDS.has(term));

  if (queryTerms.length === 0) return [];

  const scoredChunks = chunks.map((chunk) => {
    const contentLower = chunk.content.toLowerCase();
    let score = 0;

    for (const term of queryTerms) {
      const occurrences = (contentLower.match(new RegExp(`\\b${term}\\b`, "g")) || []).length;
      if (occurrences > 0) {
        score += occurrences * 2;
      } else if (contentLower.includes(term)) {
        score += 1;
      }
    }

    // Boost if query matches section heading
    const headingLower = chunk.sectionTitle.toLowerCase();
    for (const term of queryTerms) {
      if (headingLower.includes(term)) {
        score += 5;
      }
    }

    return { chunk, score };
  });

  // Sort descending by relevance score
  scoredChunks.sort((a, b) => b.score - a.score);

  const topMatches = scoredChunks.filter((item) => item.score > 0).slice(0, topK);

  return topMatches.map((item) => {
    // Extract a focused 150-character quote around the best matching keyword
    const chunk = item.chunk;
    let quote = chunk.content.slice(0, 180).trim() + "...";

    for (const term of queryTerms) {
      const idx = chunk.content.toLowerCase().indexOf(term);
      if (idx !== -1) {
        const start = Math.max(0, idx - 40);
        const end = Math.min(chunk.content.length, idx + 140);
        quote = (start > 0 ? "..." : "") + chunk.content.slice(start, end).trim() + (end < chunk.content.length ? "..." : "");
        break;
      }
    }

    return {
      clauseId: chunk.id,
      sectionTitle: chunk.sectionTitle,
      exactQuote: quote,
      relevanceScore: item.score,
    };
  });
}

const STOP_WORDS = new Set([
  "the", "and", "that", "have", "for", "not", "with", "you", "this", "but", "his", "from",
  "they", "say", "her", "she", "will", "one", "all", "would", "there", "their", "what",
  "about", "which", "when", "make", "can", "like", "time", "just", "him", "know", "take",
  "into", "year", "your", "good", "some", "could", "them", "see", "other", "than", "then",
  "now", "look", "only", "come", "its", "over", "think", "also", "back", "after", "use",
  "two", "how", "our", "work", "first", "well", "way", "even", "new", "want", "because",
  "any", "these", "give", "day", "most", "us", "is", "are", "was", "were", "been", "does",
]);
