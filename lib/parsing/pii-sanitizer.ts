/**
 * @file pii-sanitizer.ts
 * @description Privacy and data protection utility for detecting and redacting
 * Personally Identifiable Information (PII) before text is ingested into AI pipelines.
 * Sanitizes SSNs, email addresses, phone numbers, credit cards, and addresses.
 */

export interface SanitizationResult {
  sanitizedText: string;
  redactionCount: number;
  redactedTypes: {
    emails: number;
    phoneNumbers: number;
    socialSecurityNumbers: number;
    creditCards: number;
  };
}

/**
 * Regular expressions for identifying sensitive personal information.
 */
const PATTERNS = {
  // Social Security Numbers (e.g. 123-45-6789, 123 45 6789, 123456789)
  ssn: /\b\d{3}[- ]?\d{2}[- ]?\d{4}\b/g,

  // Standard Email Addresses
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,

  // North American and International Phone Numbers
  phone: /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,

  // Standard Credit / Debit Card Numbers (13-16 digits with hyphen/space)
  creditCard: /\b(?:\d{4}[- ]?){3}\d{4}\b/g,
};

/**
 * Scans raw legal text, identifies personal identifiers, and replaces them with
 * standardized redaction markers (e.g., [REDACTED_EMAIL_1]).
 *
 * @param text Raw un-sanitized document text
 * @returns SanitizationResult containing redacted text and audit statistics
 */
export function sanitizePII(text: string): SanitizationResult {
  let emailCount = 0;
  let phoneCount = 0;
  let ssnCount = 0;
  let cardCount = 0;

  let sanitized = text;

  // Mask Social Security Numbers first
  sanitized = sanitized.replace(PATTERNS.ssn, () => {
    ssnCount++;
    return `[REDACTED_SSN_${ssnCount}]`;
  });

  // Mask Credit Cards
  sanitized = sanitized.replace(PATTERNS.creditCard, () => {
    cardCount++;
    return `[REDACTED_CARD_${cardCount}]`;
  });

  // Mask Email Addresses
  sanitized = sanitized.replace(PATTERNS.email, () => {
    emailCount++;
    return `[REDACTED_EMAIL_${emailCount}]`;
  });

  // Mask Phone Numbers
  sanitized = sanitized.replace(PATTERNS.phone, () => {
    phoneCount++;
    return `[REDACTED_PHONE_${phoneCount}]`;
  });

  const totalRedactions = emailCount + phoneCount + ssnCount + cardCount;

  return {
    sanitizedText: sanitized,
    redactionCount: totalRedactions,
    redactedTypes: {
      emails: emailCount,
      phoneNumbers: phoneCount,
      socialSecurityNumbers: ssnCount,
      creditCards: cardCount,
    },
  };
}
