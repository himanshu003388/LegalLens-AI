/**
 * @file pii-sanitizer.ts
 * @description Privacy and data protection utility for detecting and redacting
 * Personally Identifiable Information (PII) before text is ingested into AI pipelines.
 * Sanitizes SSNs, email addresses, phone numbers, credit cards, bank accounts,
 * EIN/tax IDs, passport numbers, street addresses, IBANs, UK NINOs, crypto private keys,
 * and HIPAA medical record identifiers. Also strips invisible zero-width unicode characters
 * to neutralize steganographic prompt injection attacks.
 */

export interface SanitizationResult {
  sanitizedText: string;
  redactionCount: number;
  zeroWidthCharsRemoved: number;
  redactedTypes: {
    emails: number;
    phoneNumbers: number;
    socialSecurityNumbers: number;
    creditCards: number;
    bankAccounts: number;
    taxIds: number;
    passportNumbers: number;
    streetAddresses: number;
    ibans: number;
    nationalInsuranceNumbers: number;
    cryptoPrivateKeys: number;
    medicalRecordNumbers: number;
  };
}

/**
 * Invisible zero-width and bidirectional override unicode characters
 * frequently used in steganography and prompt-injection bypasses.
 */
const ZERO_WIDTH_REGEX = /[\u200B-\u200D\uFEFF\u2060\u00AD\u200E\u200F\u202A-\u202E]/g;

/**
 * Strips hidden zero-width and bidirectional unicode characters from text.
 *
 * @param text Input raw text
 * @returns Clean text with all zero-width characters removed
 */
export function stripZeroWidthUnicode(text: string): { cleanText: string; count: number } {
  let count = 0;
  const cleanText = text.replace(ZERO_WIDTH_REGEX, () => {
    count++;
    return "";
  });
  return { cleanText, count };
}

/**
 * Regular expressions for identifying sensitive personal information.
 */
const PATTERNS = {
  // Cryptographic Private Keys (PEM format)
  cryptoKey: /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/gi,

  // International Bank Account Numbers (IBAN)
  iban: /\b[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}(?:[A-Z0-9]?){0,16}\b/g,

  // UK National Insurance Numbers (NINO, e.g. JH123456A or QQ 12 34 56 A)
  nino: /\b[A-Z]{2}\s*\d{2}\s*\d{2}\s*\d{2}\s*[A-D]\b/gi,

  // Medical Record Numbers (MRN / HIPAA PHI)
  mrn: /\b(?:mrn|patient\s*id|medical\s*record)\s*[:#]?\s*([A-Z0-9-]{6,14})\b/gi,

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
 * Scans raw legal text, neutralizes hidden unicode steganography, identifies
 * sensitive identifiers, and replaces them with standardized redaction markers.
 *
 * @param text Raw un-sanitized document text
 * @returns SanitizationResult containing redacted text and audit statistics
 */
export function sanitizePII(text: string): SanitizationResult {
  // Step 1: Strip invisible zero-width unicode characters
  const { cleanText, count: zeroWidthCount } = stripZeroWidthUnicode(text);
  let sanitized = cleanText;

  let emailCount = 0;
  let phoneCount = 0;
  let ssnCount = 0;
  let cardCount = 0;
  let bankCount = 0;
  let taxIdCount = 0;
  let passportCount = 0;
  let addressCount = 0;
  let ibanCount = 0;
  let ninoCount = 0;
  let cryptoKeyCount = 0;
  let mrnCount = 0;

  // 1. Mask Cryptographic Keys first (before tokens get broken up)
  sanitized = sanitized.replace(PATTERNS.cryptoKey, () => {
    cryptoKeyCount++;
    return `[REDACTED_CRYPTO_KEY_${cryptoKeyCount}]`;
  });

  // 2. Mask IBANs
  sanitized = sanitized.replace(PATTERNS.iban, () => {
    ibanCount++;
    return `[REDACTED_IBAN_${ibanCount}]`;
  });

  // 3. Mask Medical Record Numbers (MRN)
  sanitized = sanitized.replace(PATTERNS.mrn, (match, idDigits) => {
    mrnCount++;
    return match.replace(idDigits, `[REDACTED_MRN_${mrnCount}]`);
  });

  // 4. Mask UK National Insurance Numbers (NINO)
  sanitized = sanitized.replace(PATTERNS.nino, () => {
    ninoCount++;
    return `[REDACTED_NINO_${ninoCount}]`;
  });

  // 5. Mask Social Security Numbers
  sanitized = sanitized.replace(PATTERNS.ssn, () => {
    ssnCount++;
    return `[REDACTED_SSN_${ssnCount}]`;
  });

  // 6. Mask Credit Cards
  sanitized = sanitized.replace(PATTERNS.creditCard, () => {
    cardCount++;
    return `[REDACTED_CARD_${cardCount}]`;
  });

  // 7. Mask Bank Account & Routing Numbers
  sanitized = sanitized.replace(PATTERNS.bankAccount, (match, digits) => {
    bankCount++;
    return match.replace(digits, `[REDACTED_BANK_${bankCount}]`);
  });

  // 8. Mask Taxpayer IDs (EIN)
  sanitized = sanitized.replace(PATTERNS.taxId, () => {
    taxIdCount++;
    return `[REDACTED_TAXID_${taxIdCount}]`;
  });

  // 9. Mask Passport Numbers
  sanitized = sanitized.replace(PATTERNS.passport, (match, passDigits) => {
    passportCount++;
    return match.replace(passDigits, `[REDACTED_PASSPORT_${passportCount}]`);
  });

  // 10. Mask Physical Street Addresses
  sanitized = sanitized.replace(PATTERNS.streetAddress, () => {
    addressCount++;
    return `[REDACTED_ADDRESS_${addressCount}]`;
  });

  // 11. Mask Email Addresses
  sanitized = sanitized.replace(PATTERNS.email, () => {
    emailCount++;
    return `[REDACTED_EMAIL_${emailCount}]`;
  });

  // 12. Mask Phone Numbers
  sanitized = sanitized.replace(PATTERNS.phone, () => {
    phoneCount++;
    return `[REDACTED_PHONE_${phoneCount}]`;
  });

  const totalRedactions =
    emailCount +
    phoneCount +
    ssnCount +
    cardCount +
    bankCount +
    taxIdCount +
    passportCount +
    addressCount +
    ibanCount +
    ninoCount +
    cryptoKeyCount +
    mrnCount;

  return {
    sanitizedText: sanitized,
    redactionCount: totalRedactions,
    zeroWidthCharsRemoved: zeroWidthCount,
    redactedTypes: {
      emails: emailCount,
      phoneNumbers: phoneCount,
      socialSecurityNumbers: ssnCount,
      creditCards: cardCount,
      bankAccounts: bankCount,
      taxIds: taxIdCount,
      passportNumbers: passportCount,
      streetAddresses: addressCount,
      ibans: ibanCount,
      nationalInsuranceNumbers: ninoCount,
      cryptoPrivateKeys: cryptoKeyCount,
      medicalRecordNumbers: mrnCount,
    },
  };
}
