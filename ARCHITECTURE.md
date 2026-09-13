# LegalLens AI — System Architecture & Data Flow

LegalLens AI is an end-to-end legal document intelligence platform built with Next.js 14, TypeScript, and Tailwind CSS. It empowers non-lawyers, tenants, freelancers, and small business owners to understand complex legal documents, detect hidden risks, compare contract revisions, interact via grounded streaming Q&A, and generate attorney consultation briefs.

---

## 1. High-Level Data Flow Architecture

```mermaid
flowchart TD
    subgraph Client["Client Browser (React / Next.js 14)"]
        UI[Document Studio / Compare View]
        Upload[Document Uploader & Sample Selector]
        PIISwitch[PII Sanitizer Toggle]
        Chat[Streaming Cited Q&A Panel]
        Dossier[Lawyer Prep Kit / Print View]
    end

    subgraph Security["Security & Ingestion Layer"]
        RateLimiter["In-Memory Token Bucket Rate Limiter\n(10 req/min upload, 30 req/min chat)"]
        ZodValidator["Zod Input Schema Validation\n(500,000 char cap, safe types)"]
        PIIRedactor["PII Redaction Engine\n(SSN, Email, Phone, Credit Cards)"]
    end

    subgraph Processing["Document Intelligence & Retrieval Engine"]
        Parser["Multi-Format Parser\n(PDF, DOCX, TXT, MD)"]
        Chunker["Section-Aware Chunker\n(500 words, 75-word sliding overlap)"]
        Retriever["BM25 / Keyword Token Retriever\n(Citation Anchor Scoring)"]
        DiffEngine["Myers Diff Algorithm\n(O((N+M)D) Line & Risk Shift Diff)"]
    end

    subgraph AI["GenAI Intelligence Layer (Hybrid Engine)"]
        Dispatcher{"Key Available?"}
        LiveLLM["Google Gemini 1.5 Flash / OpenAI GPT-4o / Claude 3.5\n(Streaming SSE & JSON Extraction)"]
        LocalEngine["LegalLens Deterministic NLP Engine\n(Rule AST, Flesch-Kincaid, Risk Radar)"]
    end

    Upload --> PIISwitch
    PIISwitch --> RateLimiter
    RateLimiter --> ZodValidator
    ZodValidator --> PIIRedactor
    PIIRedactor --> Parser
    Parser --> Chunker
    Chunker --> Dispatcher
    Dispatcher -- "Yes (Gemini / OpenAI / Anthropic Key)" --> LiveLLM
    Dispatcher -- "No (Zero-Key Demo)" --> LocalEngine
    LiveLLM --> UI
    LocalEngine --> UI
    Chunker --> Retriever
    Chat --> RateLimiter
    Retriever --> Dispatcher
    Dispatcher --> Chat
    UI --> DiffEngine
    UI --> Dossier
```

---

## 2. Core Subsystems

### 2.1 Ingestion, Security & Privacy Layer
- **Input Validation**: All incoming payloads are validated strictly with `zod` schemas (`AnalyzeDocumentSchema`, `ChatRequestSchema`, `CompareDocumentsSchema`), rejecting malformed structures and requests exceeding 500,000 characters.
- **Multi-Tier PII Redaction**: Sensitive personal identifiers (SSNs, credit cards, bank account/routing numbers, taxpayer IDs/EINs, passport numbers, and physical street addresses) are detected via regular expressions and replaced with deterministic redaction markers (`[REDACTED_BANK_1]`, `[REDACTED_SSN_1]`) prior to AI processing.
- **Prompt Injection Defense**: All untrusted document text is wrapped in strict bounding delimiters (`<<<START_USER_DOCUMENT_TEXT>>>` ... `<<<END_USER_DOCUMENT_TEXT>>>`) paired with explicit passive data directives instructing the LLM to ignore any embedded system command overrides.
- **In-Memory Rate Limiting with Auto-Eviction**: Token bucket rate limiter with stale bucket cleanup (`cleanExpiredBuckets`) preventing memory leaks during extended server uptime.
- **Zero Data Retention**: Document text is parsed purely in-memory (ephemeral processing) and never saved unencrypted to disk or external databases.

### 2.2 In-Memory LRU Document Caching Layer
- **SHA-256 Fingerprinting**: Contracts are normalized and hashed via SHA-256 (`computeDocumentHash(text, provider)`).
- **Sub-2ms Hit Latency**: Duplicate analyses and view reloads are served instantly from the LRU cache without hitting LLM endpoints or incurring token costs.
- **Telemetry & Cache Eviction**: Dynamic tracking of hits, misses, and hit ratio with automatic least-recently-used eviction at 100 entries.

### 2.3 Semantic Chunking & Grounded Retrieval
- **Section-Aware Boundary Splitting**: Legal contracts are partitioned along standard section titles (`SECTION`, `ARTICLE`, `CLAUSE`, numbered headings).
- **Sliding Window**: Chunks are sized at ~450–500 words with a 75-word overlap to ensure cross-sentence obligations and covenants remain intact.
- **Citation Anchors**: When questions are asked, the retrieval engine scores chunks against query terms, extracts a 150-character contextual snippet, and generates a grounded citation object referencing the exact section title and quote.

### 2.4 Hybrid GenAI Dispatcher
- **Live LLM Integration**: When `GEMINI_API_KEY`, `OPENAI_API_KEY`, or `ANTHROPIC_API_KEY` is present in `.env.local` or user session settings, requests are routed to **Google Gemini 1.5 Flash** (`gemini-1.5-flash`), OpenAI (`gpt-4o` / `gpt-4o-mini`), or Anthropic (`claude-3-5-sonnet`) with streaming Server-Sent Events (SSE) and strict JSON schema responses.
- **Local Intelligence Engine**: When running in zero-key evaluator mode, the built-in deterministic legal intelligence engine extracts clauses across 7 categories, calculates Flesch-Kincaid reading scores, flags omitted protections (e.g. missing liability caps, missing cure periods), and streams grounded responses.

### 2.5 Contract Comparison & Diff Engine
- **Myers Diff Algorithm**: Evaluates differences between original and revised contracts.
- **Algorithmic Complexity**:
  - **Time Complexity**: $O((N + M) \times D)$ where $N$ and $M$ are line counts and $D$ is the edit distance.
  - **Space Complexity**: $O(N + M)$ linear space.
  - **Practical Performance**: Under 15 milliseconds for typical 20-page commercial contracts.
- **Semantic Risk Shift Detection**: Tracks shifts in liability exposure (capped vs uncapped), termination notice windows, evergreen auto-renewal clauses, and governing jurisdictions.

### 2.6 Problem Statement Specializations & Export Pipeline
- **Reading Level Perspectives**: Provides instant toggling between *8th-Grade Plain English*, *Commercial Executive Brief*, and *Statutory Legal Precision*.
- **Negotiation Playbook**: Concrete counter-proposals and negotiation strategies for high/medium risk clauses with 1-click clipboard export.
- **Due Diligence Action Checklist**: Interactive checklist with 1-click export to Markdown (`.md`), CSV (`.csv`), or Clipboard.
- **Lawyer Prep Kit**: Synthesizes high-risk clauses, financial exposure estimates, and customized questions into a structured 1-page consultation dossier with PDF printing, Markdown export, and copying.
- **WCAG 2.1 AAA Accessibility**: High-contrast mode, typographic scaler, global access keys (`Alt+1..3`, `Alt+K`, `Alt+C`, `Alt+F`, `?`), and screen-reader live announcements.
