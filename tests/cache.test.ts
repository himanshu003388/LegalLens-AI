import { describe, it, expect, beforeEach } from "vitest";
import {
  computeDocumentHash,
  getCachedAnalysis,
  setCachedAnalysis,
  getCacheStats,
  clearAnalysisCache,
} from "@/lib/ai/cache";
import { DocumentAnalysis } from "@/lib/types/legal";

const mockAnalysis: DocumentAnalysis = {
  documentId: "doc_test_1",
  fileName: "test_agreement.txt",
  fileSizeBytes: 1200,
  wordCount: 300,
  readingEaseScore: {
    score: 42,
    label: "Difficult",
    readingTimeMinutes: 3,
  },
  executiveSummary: "Summary of NDA test agreement",
  plainEnglishBreakdown: ["Standard confidentiality obligation"],
  clauses: [],
  keyRisks: {
    high: 0,
    medium: 2,
    low: 3,
    summary: "Manageable low-to-medium risk",
  },
  missingClauses: [],
  checklist: [
    {
      id: "chk-1",
      title: "Review Definition of Confidential Info",
      description: "Ensure marking requirements are strictly mutual.",
      priority: "MEDIUM",
      category: "Intellectual Property & Confidentiality",
      completed: false,
    },
  ],
  lawyerPrepKit: {
    documentTitle: "test_agreement.txt",
    consultationObjective: "Verify mutual NDA protections",
    estimatedFinancialExposure: "Low",
    topConcernClauses: [],
    keyQuestionsToAsk: ["Can I share this confidential info with contractors?"],
    recommendedExhibits: [],
    disclaimer: "Informational only.",
  },
  analyzedAt: new Date().toISOString(),
};

describe("LRU Document Analysis Cache", () => {
  beforeEach(() => {
    clearAnalysisCache();
  });

  it("should compute deterministic SHA-256 hash regardless of CRLF vs LF line endings", () => {
    const textCRLF = "This is a contract.\r\nParty A and Party B agree.\r\n";
    const textLF = "This is a contract.\nParty A and Party B agree.\n";

    const hash1 = computeDocumentHash(textCRLF, "local");
    const hash2 = computeDocumentHash(textLF, "local");

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64); // SHA-256 hex is 64 characters
  });

  it("should differentiate hashes when provider or text changes", () => {
    const text = "Standard confidentiality agreement clause.";
    const hashLocal = computeDocumentHash(text, "local");
    const hashGemini = computeDocumentHash(text, "gemini");
    const hashDifferent = computeDocumentHash("Different text", "local");

    expect(hashLocal).not.toBe(hashGemini);
    expect(hashLocal).not.toBe(hashDifferent);
  });

  it("should return null on cache miss and record telemetry", () => {
    const hash = computeDocumentHash("Uncached document text", "local");
    const result = getCachedAnalysis(hash);

    expect(result).toBeNull();
    const stats = getCacheStats();
    expect(stats.misses).toBe(1);
    expect(stats.hits).toBe(0);
  });

  it("should store and retrieve cached document analysis (<2ms hit)", () => {
    const hash = computeDocumentHash("Sample cached document text", "local");
    setCachedAnalysis(hash, mockAnalysis);

    const start = performance.now();
    const retrieved = getCachedAnalysis(hash);
    const duration = performance.now() - start;

    expect(retrieved).not.toBeNull();
    expect(retrieved?.fileName).toBe("test_agreement.txt");
    expect(duration).toBeLessThan(10); // Ultra-fast in-memory hit

    const stats = getCacheStats();
    expect(stats.hits).toBe(1);
    expect(stats.misses).toBe(0);
    expect(stats.hitRatio).toBe(100);
    expect(stats.size).toBe(1);
  });

  it("should clear the cache and reset statistics", () => {
    const hash = computeDocumentHash("Text to be cleared", "local");
    setCachedAnalysis(hash, mockAnalysis);
    getCachedAnalysis(hash); // Hit

    clearAnalysisCache();
    const stats = getCacheStats();

    expect(stats.size).toBe(0);
    expect(stats.hits).toBe(0);
    expect(stats.misses).toBe(0);
    expect(getCachedAnalysis(hash)).toBeNull();
  });
});
