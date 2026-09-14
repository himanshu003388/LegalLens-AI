import { describe, it, expect } from "vitest";
import { analyzeDocumentLocally } from "@/lib/ai/local-intelligence";

describe("What-If Scenario Simulator & Risk Evaluation", () => {
  const sampleLease = `
RESIDENTIAL LEASE AGREEMENT

1. PAYMENT TERMS AND RENT
Monthly rent of $2,500 is due on the 1st of each month. A late fee penalty of $150 shall apply after 3 days.

2. TERM AND AUTOMATIC RENEWAL
The initial lease term is 12 months. This agreement will auto-renew for successive one-year terms unless 60 days written notice is provided.

3. INDEMNIFICATION AND LIABILITY
Tenant agrees to defend, indemnify, and hold harmless Landlord against all liabilities and claims even for Landlord negligence. Tenant agrees to unlimited liability.
  `;

  const freelanceDoc = `
FREELANCE SERVICES AGREEMENT

1. INTELLECTUAL PROPERTY AND WORK FOR HIRE
All code, designs, and tools developed during this contract are work made for hire and owned exclusively by Client without limitation.

2. PAYMENT MILESTONES
Invoices are payable on Net 90 terms upon Client subjective approval.
  `;

  it("should extract applicable clauses and calculate exposure for late payment", () => {
    const analysis = analyzeDocumentLocally("lease.txt", sampleLease);
    expect(analysis.clauses.length).toBeGreaterThan(0);

    const paymentClause = analysis.clauses.find((c) => c.category === "Payment & Financial Obligations");
    expect(paymentClause).toBeDefined();
    expect(paymentClause?.plainEnglishSummary).toBeDefined();
  });

  it("should detect high exposure on strict termination notice periods", () => {
    const analysis = analyzeDocumentLocally("lease.txt", sampleLease);
    const termClause = analysis.clauses.find((c) => c.category === "Termination & Renewal");
    expect(termClause).toBeDefined();
    expect(termClause?.riskLevel).toBe("HIGH");
    expect(termClause?.potentialPitfalls.length).toBeGreaterThan(0);
  });

  it("should flag unilateral indemnification as a severe risk scenario", () => {
    const analysis = analyzeDocumentLocally("lease.txt", sampleLease);
    const liabClause = analysis.clauses.find((c) => c.category === "Liability & Indemnification");
    expect(liabClause).toBeDefined();
    expect(liabClause?.riskLevel).toBe("HIGH");
  });

  it("should evaluate intellectual property and work-for-hire risks in freelance agreements", () => {
    const analysis = analyzeDocumentLocally("freelance.txt", freelanceDoc);
    const ipClause = analysis.clauses.find((c) => c.category === "Intellectual Property & Confidentiality");
    expect(ipClause).toBeDefined();
    expect(ipClause?.potentialPitfalls.length).toBeGreaterThan(0);
  });

  it("should calculate due diligence checklist items from extracted obligations", () => {
    const analysis = analyzeDocumentLocally("lease.txt", sampleLease);
    expect(analysis.checklist.length).toBeGreaterThan(0);
    expect(analysis.checklist[0].title).toBeDefined();
    expect(analysis.checklist[0].priority).toBeDefined();
  });

  it("should synthesize lawyer prep kit exposure recommendations", () => {
    const analysis = analyzeDocumentLocally("lease.txt", sampleLease);
    expect(analysis.lawyerPrepKit).toBeDefined();
    expect(analysis.lawyerPrepKit.keyQuestionsToAsk.length).toBeGreaterThan(0);
    expect(analysis.lawyerPrepKit.topConcernClauses.length).toBeGreaterThan(0);
  });
});
