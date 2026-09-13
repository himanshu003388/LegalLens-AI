import { describe, it, expect } from "vitest";
import { sanitizePII } from "@/lib/parsing/pii-sanitizer";

describe("PII Sanitizer & Privacy Guard", () => {
  it("should redact Social Security Numbers (SSNs)", () => {
    const text = "Tenant Alex Johnson with SSN 123-45-6789 agrees to lease terms.";
    const result = sanitizePII(text);

    expect(result.sanitizedText).not.toContain("123-45-6789");
    expect(result.sanitizedText).toContain("[REDACTED_SSN_1]");
    expect(result.redactedTypes.socialSecurityNumbers).toBe(1);
  });

  it("should redact email addresses", () => {
    const text = "Notices must be sent to alex.johnson@example.com and legal@acmecorp.org.";
    const result = sanitizePII(text);

    expect(result.sanitizedText).not.toContain("alex.johnson@example.com");
    expect(result.sanitizedText).not.toContain("legal@acmecorp.org");
    expect(result.redactedTypes.emails).toBe(2);
  });

  it("should redact phone numbers", () => {
    const text = "Contact landlord at (555) 234-5678 or 555-987-6543.";
    const result = sanitizePII(text);

    expect(result.sanitizedText).not.toContain("(555) 234-5678");
    expect(result.redactedTypes.phoneNumbers).toBe(2);
  });

  it("should handle clean text without false positives", () => {
    const text = "Standard commercial terms for 12 months with Net 30 payments.";
    const result = sanitizePII(text);

    expect(result.sanitizedText).toBe(text);
    expect(result.redactionCount).toBe(0);
  });
});
