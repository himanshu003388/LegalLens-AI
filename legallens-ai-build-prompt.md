# LEGALLENS AI — BUILD PROMPT (PromptWars-optimized)

Paste this into your AI IDE (Cursor / Replit Agent / Copilot Workspace / etc.).

## 0. NON-NEGOTIABLE CONSTRAINT
Build a **single, fully-working, deployable application first**. Do not add a
feature, service, or dependency unless it can be finished and demonstrated
working in this same build. A smaller app that fully works and is fully
provable beats a larger app that is half-wired. If you run low on scope,
cut features from the bottom of the priority list in Section 7 — never cut
the proof artifacts in Section 6.

## 0a. USE EVERY SKILL/TOOL YOUR ENVIRONMENT OFFERS
Before writing any code, check whether your AI IDE exposes a skills, plugins,
or extensions system (for example, a skill-discovery script or command such
as `find skills.sh`, a `/skills` directory, an installed-tools list, or an
MCP/plugin registry). If one exists, run it and actually use whatever it
surfaces that helps with these 6 criteria — don't just note that it exists:

- **Code Quality** — linting/formatting skills, a code-review or refactoring
  skill, language-specific style-guide skills.
- **Security** — a security-scanning or dependency-audit skill (e.g. one that
  runs `npm audit`/`pip-audit` or checks for exposed secrets), an
  OWASP-checklist skill.
- **Efficiency** — a performance-profiling or Lighthouse-running skill, a
  bundle-analysis skill.
- **Testing** — a test-generation skill, a coverage-reporting skill, a CI
  workflow skill.
- **Accessibility** — an axe-core or WCAG-audit skill, an ARIA-linting skill.
- **Problem Statement Alignment** — a document-creation skill (for the
  README/ARCHITECTURE.md/SECURITY.md) so those deliverables are well
  formatted, not just present.

If your environment has no discoverable skills, say so explicitly in your
final summary rather than silently skipping this step — that itself is
useful information for whoever reviews the build log.

## 1. PROJECT OVERVIEW
Build "LegalLens AI" — a legal document intelligence platform that helps
users understand, compare, and navigate legal documents through plain-language
analysis, Q&A, and consultation prep. It provides information and assistance
only; it never claims to replace a lawyer, and it says so visibly in the UI.

**Problem Statement Alignment table — implement every row and keep this table
in the README, feature name matched exactly to what's live in the app:**

| PS use case | Feature that implements it |
|---|---|
| Simplifying complex legal documents | Plain-language Summary panel |
| Comparing contracts/agreements/policies | Document Comparison view |
| Highlighting clauses, obligations, risks, inconsistencies | Clause Extraction + Risk badges |
| Answering questions based on provided documents | Cited Q&A chat |
| Understanding options / next steps | Action Checklist generator |
| Summaries, checklists, actionable outputs | Export-to-PDF summary |
| Preparing for a legal professional | Lawyer Prep Kit |

## 2. GENAI SERVICES UTILIZED (required disclosure — fill in exactly what you use, then keep this section accurate in the README)
Most PromptWars-style rubrics score "Problem Statement Alignment" and "Code
Quality" partly on whether you can clearly name which GenAI services power
which feature — vague answers ("we used AI") score worse than a precise list.
Use this table as the template, and edit the "Model/Service" column to match
what you actually wire in:

| Feature | GenAI capability needed | Suggested Model/Service |
|---|---|---|
| Plain-language summary | Long-context summarization | Claude (Sonnet-class) or GPT-4-class model via API |
| Clause extraction + risk scoring | Structured extraction / classification | Same LLM, prompted for structured JSON output |
| Cited Q&A chat | Retrieval-augmented Q&A over the uploaded doc | LLM + an embeddings model (e.g. `text-embedding-3-small` or Voyage embeddings) for chunk retrieval, or long-context stuffing for short docs |
| Document comparison | Semantic diff / change summarization | Same LLM, given both documents' text |
| Action checklist / Lawyer Prep Kit | Instruction-style generation from prior analysis | Same LLM, chained off the summary + clause outputs |
| (Optional) Scanned/image PDFs | OCR | A dedicated OCR service (e.g. Tesseract locally, or a cloud OCR API) before the text ever reaches the LLM |

Document in the README:
- **Which specific model/version** you called (e.g. "Claude Sonnet 4.5 via
  Anthropic API" or "GPT-4o via OpenAI API") — name the real one you used,
  not a placeholder.
- **Whether you used RAG** (embeddings + retrieval) or **long-context
  stuffing** (pasting the whole doc into the prompt) for Q&A, and why —
  this is a real architectural choice a grader may ask about.
- **Any non-LLM GenAI service** used (OCR, speech-to-text, etc.), if any.
- That **no user document content is sent anywhere except the disclosed
  API(s)**, and is not used to train models (check the provider's data-use
  terms and state your assumption).

## 3. TECH STACK (deliberately lean — one repo, one deploy target)
- **Next.js 14 (App Router, TypeScript)** — frontend AND backend via API routes.
  No separate FastAPI service, no Redis, no Celery. This is a hackathon-scale
  build; every extra service is a point of failure the grader will see.
- **SQLite via Prisma** (or Vercel Postgres if you already provision it) —
  document metadata only, never raw document text at rest longer than needed.
- **Anthropic or OpenAI API** for analysis, comparison, and chat — called
  server-side only, key never exposed to the client. (Name the exact one in
  Section 2's table once decided.)
- **Tailwind + shadcn/ui** for UI.
- Deploy target: Vercel (or your existing hosting) — must have a live URL
  before you touch polish items.

## 4. CORE FEATURES (build in this order; each must fully work before starting the next)
1. **Upload + Analysis**: PDF/DOCX/TXT upload → text extraction → AI summary,
   clause extraction with risk level (Low/Medium/High), missing-clause flags.
2. **Cited Q&A chat**: ask questions about the uploaded doc, answers reference
   the specific section/paragraph they came from.
3. **Comparison view**: two documents, side-by-side diff highlighting
   additions/removals/changes, plain-language summary of what changed.
4. **Action checklist + Lawyer Prep Kit**: generated checklist of next steps
   and a one-page consultation brief with suggested questions to ask a lawyer.

## 5. THE 6 SCORING PARAMETERS — BUILD THESE IN, DON'T JUST CLAIM THEM

### Code Quality
- TypeScript strict mode on.
- ESLint + Prettier configured and passing with zero errors (run and fix
  before finishing — don't just add the config).
- Modular structure: `/app`, `/components`, `/lib/ai`, `/lib/parsing`,
  `/lib/db` — no God-files.
- JSDoc/docstrings on every exported function.
- A short `ARCHITECTURE.md` with one diagram (text/mermaid is fine) showing
  data flow: upload → parse → AI call → render.

### Security
- API key read only from server-side env vars, never sent to client.
- Zod (or similar) input validation on every API route.
- Rate limiting middleware on upload and chat endpoints (even a simple
  in-memory token bucket is fine — it must actually run, not just be described).
- Documents stored encrypted at rest OR deleted immediately after analysis
  (pick one, document which, and implement it — don't claim both).
- Security headers (CSP, X-Content-Type-Options, X-Frame-Options) set in
  `next.config.js` and verifiable via curl/browser devtools.
- `SECURITY.md` documenting the actual data retention policy — must match
  what the code does.

### Efficiency
- Stream the AI response to the chat UI (don't wait for the full completion) —
  this is the single most visible "efficiency" win a grader will notice.
- Chunk large documents before sending to the model; document the chunk size
  and why.
- Run Lighthouse on the deployed site and put the Performance score in the
  README (target 85+; if you don't hit it, note what you'd fix next).
- Note big-O or practical complexity of the diff algorithm used in Comparison.

### Testing
- Vitest/Jest unit tests for parsing and clause-extraction logic (aim for
  meaningful coverage of logic, not just snapshot tests).
- Playwright test for one critical path (upload → see summary).
- A GitHub Actions workflow that runs lint + tests on push — commit the
  `.github/workflows/ci.yml` file itself; a badge in the README linking to
  a passing run is strong proof.
- Put a coverage summary (even a plain-text `coverage.txt` or the Vitest
  output) in the repo — graders check for evidence, not adjectives.

### Accessibility
- Semantic HTML, ARIA labels on all interactive controls.
- Full keyboard navigation through upload → analysis → chat.
- Run `axe-core` (via `@axe-core/playwright` or the browser extension) against
  the deployed pages and include the results (even "3 issues found, 2 fixed"
  is more credible than "fully WCAG 2.1 AA compliant" with no evidence).
- Visible, permanent "Not legal advice" disclaimer that itself meets contrast
  requirements (4.5:1) — don't let the safety copy be the thing that fails
  the audit.

### Problem Statement Alignment
- Keep the use-case table from Section 1 in the README, updated to reflect
  what's actually live.
- Disclaimer visible on every page that outputs AI analysis, not just the
  landing page.
- In the Lawyer Prep Kit output, explicitly frame it as "for your reference
  ahead of speaking with a licensed attorney" — reinforces the PS's own note
  that this assists rather than replaces professional advice.

## 6. PROOF ARTIFACTS TO SHIP (this is what a grader actually checks)
- [ ] Live deployed URL, working end to end
- [ ] Public repo with clean commit history
- [ ] README containing: the PS-alignment table, the GenAI-services table
      (Section 2) with real model names filled in, architecture diagram,
      Lighthouse score, security/retention policy, how to run tests
- [ ] `.github/workflows/ci.yml` with a green run
- [ ] Sample legal documents included in `/samples` for graders to test with
      immediately (an NDA and a lease agreement are good defaults)
- [ ] `SECURITY.md` and `ARCHITECTURE.md`

## 7. IF TIME REMAINS (nice-to-haves, in priority order — cut from the bottom, not the proof artifacts)
1. Export chat/summary to PDF
2. Dark mode
3. Multi-document batch upload
4. Simplified-language reading-level toggle
