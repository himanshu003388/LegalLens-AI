import { describe, it, expect } from "vitest";
import { analyzeDocumentLocally } from "@/lib/ai/local-intelligence";

describe("Local Legal Intelligence Engine", () => {
  const leaseText = `
RESIDENTIAL LEASE AGREEMENT

1. TERM AND AUTOMATIC RENEWAL
The lease term shall be 12 months. This agreement will auto-renew for successive one-year terms unless 60 days written notice is given.

2. PAYMENT TERMS AND LATE FEES
Rent is $2,000 per month. Late payments incur a penalty fee of $150.

3. INDEMNIFICATION AND LIABILITY
Tenant agrees to defend, indemnify, and hold harmless Landlord from all claims even if caused by Landlord negligence. Tenant agrees to unlimited liability.

4. GOVERNING LAW AND ARBITRATION
Governing law shall be Illinois. Any disputes must be resolved through mandatory arbitration in Chicago.
`;

  it("should extract clauses and correctly flag high-risk terms", () => {
    const analysis = analyzeDocumentLocally("lease.txt", leaseText);

    expect(analysis.clauses.length).toBeGreaterThan(0);
    expect(analysis.keyRisks.high).toBeGreaterThan(0);

    const highRiskClause = analysis.clauses.find((c) => c.riskLevel === "HIGH");
    expect(highRiskClause).toBeDefined();
    expect(highRiskClause?.riskExplanation).toBeDefined();
  });

  it("should calculate reading ease score and metrics", () => {
    const analysis = analyzeDocumentLocally("lease.txt", leaseText);

    expect(analysis.wordCount).toBeGreaterThan(50);
    expect(analysis.readingEaseScore.score).toBeGreaterThanOrEqual(0);
    expect(analysis.readingEaseScore.score).toBeLessThanOrEqual(100);
    expect(analysis.readingEaseScore.label).toBeDefined();
  });

  it("should detect missing standard clauses", () => {
    const analysis = analyzeDocumentLocally("lease.txt", leaseText);

    // Force majeure is missing from the lease text
    const missingForceMajeure = analysis.missingClauses.find(
      (m) => m.clauseName.toLowerCase().includes("force majeure")
    );
    expect(missingForceMajeure).toBeDefined();
  });

  it("should generate actionable checklist and lawyer prep kit", () => {
    const analysis = analyzeDocumentLocally("lease.txt", leaseText);

    expect(analysis.checklist.length).toBeGreaterThan(0);
    expect(analysis.lawyerPrepKit.keyQuestionsToAsk.length).toBeGreaterThan(0);
    expect(analysis.lawyerPrepKit.topConcernClauses.length).toBeGreaterThan(0);
    expect(analysis.lawyerPrepKit.disclaimer).toContain("ahead of speaking with a licensed attorney");
  });
});
