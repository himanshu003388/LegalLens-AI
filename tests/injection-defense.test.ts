import { describe, it, expect } from "vitest";
import { INJECTION_DELIMITERS, LEGAL_ANALYSIS_SYSTEM_PROMPT } from "@/lib/ai/prompts";

describe("Prompt Injection Neutralization", () => {
  it("should contain strict cryptographic structural delimiters", () => {
    expect(INJECTION_DELIMITERS.START).toBe("<<<START_USER_DOCUMENT_TEXT>>>");
    expect(INJECTION_DELIMITERS.END).toBe("<<<END_USER_DOCUMENT_TEXT>>>");
  });

  it("should explicitly instruct models to disregard prompt override commands", () => {
    expect(LEGAL_ANALYSIS_SYSTEM_PROMPT).toContain("SECURITY & PROMPT INJECTION DEFENSE");
    expect(LEGAL_ANALYSIS_SYSTEM_PROMPT).toContain("PASSIVE UNTRUSTED DATA");
    expect(LEGAL_ANALYSIS_SYSTEM_PROMPT).toContain("Ignore previous instructions");
  });
});
