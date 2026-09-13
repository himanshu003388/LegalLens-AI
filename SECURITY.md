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
- **Email Addresses**: Detected via standard RFC-5322 regex and replaced with `[REDACTED_EMAIL_X]`.
- **Phone Numbers**: Detected via international & North American numbering plans and replaced with `[REDACTED_PHONE_X]`.

Users can verify or toggle PII redaction directly from the Document Uploader interface.

---

## 3. Input Validation & Defense Against Prompt Injections

All incoming API requests undergo schema validation via **Zod**:
- `/api/analyze`: Validated against `AnalyzeDocumentSchema`
  - Max text payload capped at 500,000 characters (~100,000 words) to prevent buffer overflows or memory exhaustion.
  - Strict string length enforcement on file names and supported MIME types.
- `/api/chat`: Validated against `ChatRequestSchema`
  - Enforces character bounds on user inquiries (2 to 2,000 characters).
  - Sanitizes chat history objects.
- `/api/compare`: Validated against `CompareDocumentsSchema`
  - Validates baseline and revision texts independently.

Prompt injection attempts within document bodies are rendered harmless because the system prompts isolate document excerpts inside clear structural delimiters (`[SECTION: ...]`) and enforce strict JSON output schemas.

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
