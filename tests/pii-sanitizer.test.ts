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

  it("should redact bank routing/account numbers, tax IDs, passports, and addresses", () => {
    const text = `
      Wire funds to routing: 123456789 or account: 9876543210.
      Company Tax ID: 12-3456789. Passport No: A1234567.
      Premises located at 123 Main Street, Suite 400.
    `;
    const result = sanitizePII(text);

    expect(result.sanitizedText).toContain("[REDACTED_BANK_");
    expect(result.sanitizedText).toContain("[REDACTED_TAXID_1]");
    expect(result.sanitizedText).toContain("[REDACTED_PASSPORT_1]");
    expect(result.sanitizedText).toContain("[REDACTED_ADDRESS_1]");
    expect(result.redactionCount).toBeGreaterThanOrEqual(4);
  });

  it("should handle clean text without false positives", () => {
    const text = "Standard commercial terms for 12 months with Net 30 payments.";
    const result = sanitizePII(text);

    expect(result.sanitizedText).toBe(text);
    expect(result.redactionCount).toBe(0);
  });
});

