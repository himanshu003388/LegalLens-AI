import { describe, it, expect } from "vitest";
import { compareContracts } from "@/lib/diff/contract-diff";

describe("Contract Diff & Risk Shift Analysis", () => {
  const v1 = `
1. Term: 1 year agreement.
2. Termination: 30 days prior written notice.
3. Liability: Capped at fees paid in prior 12 months.
4. Governing Law: State of New York.
`;

  const v2 = `
1. Term: 1 year agreement.
2. Termination: 60 days prior written notice. Evergreen auto-renewal applies.
3. Liability: Customer agrees to unlimited liability.
4. Governing Law: State of Delaware.
`;

  it("should compute line additions and deletions accurately", () => {
    const diff = compareContracts("v1.txt", "v2.txt", v1, v2);

    expect(diff.stats.additions).toBeGreaterThan(0);
    expect(diff.stats.deletions).toBeGreaterThan(0);
    expect(diff.diffChunks.length).toBeGreaterThan(0);
  });

  it("should detect critical unfavorable risk shifts", () => {
    const diff = compareContracts("v1.txt", "v2.txt", v1, v2);

    const uncappedShift = diff.criticalModifications.find((m) =>
      m.description.toLowerCase().includes("unlimited liability")
    );
    expect(uncappedShift).toBeDefined();
    expect(uncappedShift?.impact).toBe("UNFAVORABLE");

    const autoRenewShift = diff.criticalModifications.find((m) =>
      m.description.toLowerCase().includes("automatic renewal")
    );
    expect(autoRenewShift).toBeDefined();
    expect(autoRenewShift?.impact).toBe("UNFAVORABLE");
  });

  it("should report 100% similarity for identical documents", () => {
    const diff = compareContracts("v1.txt", "v1_copy.txt", v1, v1);

    expect(diff.stats.similarityPercentage).toBe(100);
    expect(diff.stats.additions).toBe(0);
    expect(diff.stats.deletions).toBe(0);
  });
});
