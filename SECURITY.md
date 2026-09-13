# LegalLens AI — Security & Privacy Architecture

This document formalizes the security policies, data governance, threat modeling, and defensive measures implemented across the LegalLens AI platform.

---

## 1. Core Data Retention Policy

### Ephemeral In-Memory Processing (Zero Data at Rest)
LegalLens AI adheres strictly to an **ephemeral data retention model**:
1. **No Raw Document Storage at Rest**: Uploaded files and textual content are processed exclusively in-memory within volatile Node.js runtime buffers.
2. **Immediate Garbage Collection**: As soon as chunking, clause classification, and risk scoring are completed and returned to the client, the in-memory document text buffers are immediately dereferenced for garbage collection.
3. **No Database Document Persisting**: No database stores full contract text, proprietary clauses, or raw user submissions. Only transient session state (e.g. client-side React memory) retains the document during the user's active browser session.

---

## 2. Personally Identifiable Information (PII) Redaction

Prior to passing any text to GenAI services (Google Gemini, OpenAI, or Anthropic), LegalLens executes a deterministic PII sanitization pipeline:
- **Social Security Numbers (SSNs)**: Detected via `/\b\d{3}[- ]?\d{2}[- ]?\d{4}\b/g` and replaced with `[REDACTED_SSN_X]`.
- **Credit & Debit Cards**: Detected via `/\b(?:\d{4}[- ]?){3}\d{4}\b/g` and replaced with `[REDACTED_CARD_X]`.
- **Bank Account & Routing Numbers**: Detected via routing/account patterns and replaced with `[REDACTED_BANK_X]`.
- **Taxpayer IDs (EIN)**: Detected via `/\b\d{2}-\d{7}\b/g` and replaced with `[REDACTED_TAXID_X]`.
- **Passport Numbers**: Detected via standard passport regex and replaced with `[REDACTED_PASSPORT_X]`.
- **Physical Street Addresses**: Detected via postal street patterns and replaced with `[REDACTED_ADDRESS_X]`.
- **Email Addresses**: Detected via standard RFC-5322 regex and replaced with `[REDACTED_EMAIL_X]`.
- **Phone Numbers**: Detected via international & North American numbering plans and replaced with `[REDACTED_PHONE_X]`.

Users can verify or toggle PII redaction directly from the Document Uploader interface.

---

## 3. Defense Against Prompt Injections & OWASP Top 10 for LLMs

All incoming API requests undergo schema validation via **Zod**:
- `/api/analyze`: Validated against `AnalyzeDocumentSchema` (capped at 500,000 characters).
- `/api/chat`: Validated against `ChatRequestSchema` (inquiries capped at 2,000 characters).
- `/api/compare`: Validated against `CompareDocumentsSchema`.

### OWASP Top 10 for LLM Applications Compliance Matrix

| OWASP Vulnerability | Defensive Control Implemented in LegalLens AI |
|---|---|
| **LLM01: Prompt Injection** | Document text is strictly encapsulated between structural delimiters (`<<<START_USER_DOCUMENT_TEXT>>>` ... `<<<END_USER_DOCUMENT_TEXT>>>`). System instructions strictly designate enclosed text as untrusted passive data. |
| **LLM02: Sensitive Data Disclosure** | Pre-LLM PII Sanitizer strips SSNs, credit cards, bank accounts, emails, and phone numbers before text is sent to LLMs. Zero data at rest. |
| **LLM04: Model Denial of Service** | Strict Zod length bounds (500k char max), section chunking, and token bucket rate limiting (10 req/min upload, 30 req/min chat). |
| **LLM06: Excessive Agency** | LegalLens AI is read-only. It executes zero external tool calls, database mutations, or automated legal filings. |
| **LLM09: Overreliance** | Permanent high-contrast ethical disclaimer displayed across every screen and consultation brief, mandating attorney review. |


---

## 4. In-Memory Token Bucket Rate Limiting

To safeguard against denial-of-service and automated scraping, an in-memory token bucket rate limiter is enforced on all API endpoints:

| Endpoint | Max Burst Capacity | Refill Velocity | Effective Limit |
|---|---|---|---|
| `/api/analyze` | 10 tokens | 0.166 tokens/sec | ~10 requests / minute |
| `/api/compare` | 10 tokens | 0.166 tokens/sec | ~10 requests / minute |
| `/api/chat` | 30 tokens | 0.500 tokens/sec | ~30 requests / minute |

When depleted, the server responds with **HTTP 429 Too Many Requests**, providing standard `Retry-After` and `X-RateLimit-Remaining` headers.

---

## 5. API Key Protection & Server-Side Isolation

- All Google Gemini (`GEMINI_API_KEY`), OpenAI (`OPENAI_API_KEY`), and Anthropic (`ANTHROPIC_API_KEY`) credentials reside exclusively in server-side environment variables (`.env.local`).
- No private API keys or secrets are ever bundled into client-side JavaScript or emitted in HTTP responses.
- Users supplying ephemeral session keys do so only through client-side session/local storage which communicates with the backend via isolated server-side proxy routes.

---

## 6. HTTP Security Headers

Configured in `next.config.mjs` and applied to all HTTP responses:

```http
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https:; connect-src 'self' https://api.openai.com https://api.anthropic.com https://generativelanguage.googleapis.com;
```
