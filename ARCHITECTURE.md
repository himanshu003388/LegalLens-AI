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
        LiveLLM["OpenAI GPT-4o / Claude 3.5 Sonnet\n(Streaming SSE & JSON Extraction)"]
        LocalEngine["LegalLens Deterministic NLP Engine\n(Rule AST, Flesch-Kincaid, Risk Radar)"]
    end

    Upload --> PIISwitch
    PIISwitch --> RateLimiter
    RateLimiter --> ZodValidator
    ZodValidator --> PIIRedactor
    PIIRedactor --> Parser
    Parser --> Chunker
    Chunker --> Dispatcher
    Dispatcher -- "Yes (API Key Provided)" --> LiveLLM
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

### 2.1 Ingestion & Privacy Layer
- **Input Validation**: All incoming payloads are validated strictly with `zod` schemas (`AnalyzeDocumentSchema`, `ChatRequestSchema`, `CompareDocumentsSchema`), rejecting malformed structures and requests exceeding 500,000 characters.
- **Client/Server PII Redaction**: Sensitive personal identifiers (Social Security Numbers, credit cards, emails, and phone numbers) are detected via regular expressions and replaced with deterministic redaction markers (`[REDACTED_SSN_1]`, `[REDACTED_EMAIL_1]`) prior to AI processing.
- **Zero Data Retention**: Document text is parsed purely in-memory (ephemeral processing) and never saved unencrypted to disk or external databases.

### 2.2 Semantic Chunking & Grounded Retrieval
- **Section-Aware Boundary Splitting**: Legal contracts are partitioned along standard section titles (`SECTION`, `ARTICLE`, `CLAUSE`, numbered headings).
- **Sliding Window**: Chunks are sized at ~450–500 words with a 75-word overlap to ensure cross-sentence obligations and covenants remain intact.
- **Citation Anchors**: When questions are asked, the retrieval engine scores chunks against query terms, extracts a 150-character contextual snippet, and generates a grounded citation object referencing the exact section title and quote.

### 2.3 Hybrid GenAI Dispatcher
- **Live LLM Integration**: When `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` is present in `.env.local` or session settings, requests are routed to OpenAI (`gpt-4o` / `gpt-4o-mini`) or Anthropic (`claude-3-5-sonnet`) with streaming Server-Sent Events (SSE).
- **Local Intelligence Engine**: When running in zero-key evaluator mode, the built-in deterministic legal intelligence engine extracts clauses across 7 categories, calculates Flesch-Kincaid reading scores, flags omitted protections (e.g. missing liability caps, missing cure periods), and streams grounded responses.

### 2.4 Contract Comparison & Diff Engine
- **Myers Diff Algorithm**: Evaluates differences between original and revised contracts.
- **Algorithmic Complexity**:
  - **Time Complexity**: $O((N + M) \times D)$ where $N$ and $M$ are line counts and $D$ is the edit distance.
  - **Space Complexity**: $O(N + M)$ linear space.
  - **Practical Performance**: Under 15 milliseconds for typical 20-page commercial contracts.
- **Semantic Risk Shift Detection**: Tracks shifts in liability exposure (capped vs uncapped), termination notice windows, evergreen auto-renewal clauses, and governing jurisdictions.

### 2.5 Lawyer Prep Kit & Export Pipeline
- Synthesizes high-risk clauses, financial exposure estimates, and customized questions into a structured 1-page consultation dossier.
- Formatted with `@media print` CSS for instant clean export to PDF or physical printout.
