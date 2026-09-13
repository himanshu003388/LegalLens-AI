/**
 * @file pii-sanitizer.ts
 * @description Privacy and data protection utility for detecting and redacting
 * Personally Identifiable Information (PII) before text is ingested into AI pipelines.
 * Sanitizes SSNs, email addresses, phone numbers, credit cards, bank accounts,
 * EIN/tax IDs, passport numbers, and street addresses.
 */

export interface SanitizationResult {
  sanitizedText: string;
  redactionCount: number;
  redactedTypes: {
    emails: number;
    phoneNumbers: number;
    socialSecurityNumbers: number;
    creditCards: number;
    bankAccounts: number;
    taxIds: number;
    passportNumbers: number;
    streetAddresses: number;
  };
}

/**
 * Regular expressions for identifying sensitive personal information.
 */
const PATTERNS = {
  // Social Security Numbers (e.g. 123-45-6789, 123 45 6789)
  ssn: /\b\d{3}[- ]?\d{2}[- ]?\d{4}\b/g,

  // Standard Email Addresses
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,

  // North American and International Phone Numbers
  phone: /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,

  // Standard Credit / Debit Card Numbers (13-16 digits with hyphen/space)
  creditCard: /\b(?:\d{4}[- ]?){3}\d{4}\b/g,

  // Bank Routing / Account indicators
  bankAccount: /\b(?:account|acct|routing|aba)\s*[:#]?\s*([0-9]{8,17})\b/gi,

  // Employer Identification Numbers / Tax IDs (XX-XXXXXXX)
  taxId: /\b\d{2}-\d{7}\b/g,

  // Passport Numbers (e.g. Passport: A1234567)
  passport: /\b(?:passport(?:\s*no\.?|\s*number|\s*#)?\s*[:#]?\s*)([A-Z0-9]{7,9})\b/gi,

  // Physical Street Address Lines (e.g., 123 Main Street, 4500 West Boulevard)
  streetAddress: /\b\d{1,5}\s+(?:[A-Za-z0-9.-]+\s+){1,4}(?:Street|St|Avenue|Ave|Boulevard|Blvd|Road|Rd|Drive|Dr|Lane|Ln|Way|Court|Ct|Plaza|Plz|Terrace|Ter|Parkway|Pkwy)\b/gi,
};

/**
 * Scans raw legal text, identifies personal identifiers, and replaces them with
 * standardized redaction markers (e.g., [REDACTED_EMAIL_1], [REDACTED_BANK_1]).
 *
 * @param text Raw un-sanitized document text
 * @returns SanitizationResult containing redacted text and audit statistics
 */
export function sanitizePII(text: string): SanitizationResult {
  let emailCount = 0;
  let phoneCount = 0;
  let ssnCount = 0;
  let cardCount = 0;
  let bankCount = 0;
  let taxIdCount = 0;
  let passportCount = 0;
  let addressCount = 0;

  let sanitized = text;

  // 1. Mask Social Security Numbers first
  sanitized = sanitized.replace(PATTERNS.ssn, () => {
    ssnCount++;
    return `[REDACTED_SSN_${ssnCount}]`;
  });

  // 2. Mask Credit Cards
  sanitized = sanitized.replace(PATTERNS.creditCard, () => {
    cardCount++;
    return `[REDACTED_CARD_${cardCount}]`;
  });

  // 3. Mask Bank Account & Routing Numbers
  sanitized = sanitized.replace(PATTERNS.bankAccount, (match, digits) => {
    bankCount++;
    return match.replace(digits, `[REDACTED_BANK_${bankCount}]`);
  });

  // 4. Mask Taxpayer IDs (EIN)
  sanitized = sanitized.replace(PATTERNS.taxId, () => {
    taxIdCount++;
    return `[REDACTED_TAXID_${taxIdCount}]`;
  });

  // 5. Mask Passport Numbers
  sanitized = sanitized.replace(PATTERNS.passport, (match, passDigits) => {
    passportCount++;
    return match.replace(passDigits, `[REDACTED_PASSPORT_${passportCount}]`);
  });

  // 6. Mask Physical Street Addresses
  sanitized = sanitized.replace(PATTERNS.streetAddress, () => {
    addressCount++;
    return `[REDACTED_ADDRESS_${addressCount}]`;
  });

  // 7. Mask Email Addresses
  sanitized = sanitized.replace(PATTERNS.email, () => {
    emailCount++;
    return `[REDACTED_EMAIL_${emailCount}]`;
  });

  // 8. Mask Phone Numbers
  sanitized = sanitized.replace(PATTERNS.phone, () => {
    phoneCount++;
    return `[REDACTED_PHONE_${phoneCount}]`;
  });

  const totalRedactions =
    emailCount + phoneCount + ssnCount + cardCount + bankCount + taxIdCount + passportCount + addressCount;

  return {
    sanitizedText: sanitized,
    redactionCount: totalRedactions,
    redactedTypes: {
      emails: emailCount,
      phoneNumbers: phoneCount,
      socialSecurityNumbers: ssnCount,
      creditCards: cardCount,
      bankAccounts: bankCount,
      taxIds: taxIdCount,
      passportNumbers: passportCount,
      streetAddresses: addressCount,
    },
  };
}
