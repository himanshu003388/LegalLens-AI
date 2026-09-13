import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getAIProviderConfig, analyzeLegalDocument, streamCitedAnswer } from "@/lib/ai/provider";

describe("AI Provider Configuration & Gemini Key Handling", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.GEMINI_API_KEY;
    delete process.env.GOOGLE_API_KEY;
    delete process.env.OPENAI_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.AI_PROVIDER;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("should return zero-key local mode by default when no keys are provided", () => {
    const config = getAIProviderConfig();
    expect(config.provider).toBe("local");
    expect(config.hasKey).toBe(false);
    expect(config.modelName).toContain("Local NLP Engine");
  });

  it("should detect Google Gemini API key by AIza prefix", () => {
    const config = getAIProviderConfig("AIzaSyB123456789_SampleKeyTest");
    expect(config.provider).toBe("gemini");
    expect(config.hasKey).toBe(true);
    expect(config.modelName).toBe("Google Gemini 1.5 Flash");
    expect(config.apiKey).toBe("AIzaSyB123456789_SampleKeyTest");
  });

  it("should honor explicit preferred provider 'gemini'", () => {
    const config = getAIProviderConfig("custom-test-key", "gemini");
    expect(config.provider).toBe("gemini");
    expect(config.hasKey).toBe(true);
    expect(config.modelName).toBe("Google Gemini 1.5 Flash");
  });

  it("should detect GEMINI_API_KEY from environment", () => {
    process.env.GEMINI_API_KEY = "AIzaSy_Env_Gemini_Key";
    const config = getAIProviderConfig();
    expect(config.provider).toBe("gemini");
    expect(config.hasKey).toBe(true);
    expect(config.modelName).toBe("Google Gemini 1.5 Flash");
  });

  it("should detect OpenAI key by sk- prefix", () => {
    const config = getAIProviderConfig("sk-test123456789");
    expect(config.provider).toBe("openai");
    expect(config.hasKey).toBe(true);
    expect(config.modelName).toContain("GPT-4o");
  });

  it("should detect Anthropic key by sk-ant- prefix", () => {
    const config = getAIProviderConfig("sk-ant-test123456789");
    expect(config.provider).toBe("anthropic");
    expect(config.hasKey).toBe(true);
    expect(config.modelName).toContain("Claude 3.5");
  });

  it("should analyze legal document and gracefully fallback if key is invalid", async () => {
    const sampleText = `
      SECTION 1. TERM AND TERMINATION
      This Agreement shall commence on the Effective Date and continue for twelve (12) months.
      Either party may terminate upon thirty (30) days written notice.
    `;

    // Testing with mock key should gracefully fall back to local analysis without crashing
    const analysis = await analyzeLegalDocument("sample.txt", sampleText, "AIzaSy_FakeKey", "gemini");
    expect(analysis).toBeDefined();
    expect(analysis.clauses.length).toBeGreaterThan(0);
    expect(analysis.readingEaseScore.score).toBeGreaterThan(0);
    expect(analysis.fileName).toBe("sample.txt");
  });

  it("should stream cited answer and return grounded citations", async () => {
    const sampleDoc = `
      SECTION 4. PAYMENT TERMS
      Client shall pay all undisputed invoices within Net 30 days of receipt.
      Late payments accrue interest at 1.5% per month.
    `;

    const { stream, citations } = await streamCitedAnswer(
      "When are invoices due?",
      sampleDoc,
      "AIzaSy_FakeKey",
      "gemini"
    );

    expect(stream).toBeDefined();
    expect(citations.length).toBeGreaterThan(0);
    expect(citations[0].sectionTitle).toContain("PAYMENT");
  });
});
