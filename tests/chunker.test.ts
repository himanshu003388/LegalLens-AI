import { describe, it, expect } from "vitest";
import { chunkDocument, retrieveRelevantCitations } from "@/lib/retrieval/chunker";

describe("Document Chunker & Citation Retrieval", () => {
  const sampleDocument = `
SECTION 1. DEFINITIONS
"Services" refers to the analytics platform. "Customer Data" refers to input files.

SECTION 2. TERM AND TERMINATION
Either party may terminate this agreement upon thirty (30) days prior written notice. If Customer terminates without cause, early cancellation penalties of $500 apply.

SECTION 3. INDEMNIFICATION AND LIABILITY
Provider agrees to indemnify Customer against third party copyright infringement claims. Neither party shall be liable for indirect or consequential damages.
`;

  it("should chunk documents along section boundaries", () => {
    const chunks = chunkDocument(sampleDocument, 30, 10);
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0].sectionTitle).toBeDefined();
    expect(chunks[0].content.length).toBeGreaterThan(0);
  });

  it("should retrieve grounded citations matching query keywords", () => {
    const chunks = chunkDocument(sampleDocument, 30, 10);
    const citations = retrieveRelevantCitations("termination cancellation notice", chunks, 2);

    expect(citations.length).toBeGreaterThan(0);
    expect(citations[0].sectionTitle).toContain("TERMINATION");
    expect(citations[0].exactQuote).toBeDefined();
    expect(citations[0].relevanceScore).toBeGreaterThan(0);
  });

  it("should return empty citations if query is irrelevant", () => {
    const chunks = chunkDocument(sampleDocument, 30, 10);
    const citations = retrieveRelevantCitations("flying purple elephants on Mars", chunks, 2);
    expect(citations.length).toBe(0);
  });
});
