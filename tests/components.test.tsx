// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import RiskRadar from "@/components/RiskRadar";
import ActionChecklist from "@/components/ActionChecklist";
import AnalysisOverview from "@/components/AnalysisOverview";
import ClauseList from "@/components/ClauseList";
import LawyerPrepKit from "@/components/LawyerPrepKit";
import { DocumentAnalysis, MissingClauseWarning, ActionChecklistItem } from "@/lib/types/legal";

const mockAnalysis: DocumentAnalysis = {
  documentId: "doc_comp_1",
  fileName: "master_services_agreement.docx",
  fileSizeBytes: 45000,
  wordCount: 1420,
  readingEaseScore: {
    score: 45,
    label: "Difficult",
    readingTimeMinutes: 7,
  },
  executiveSummary: "This Master Services Agreement governs consulting deliverables, uncapped indemnification, and payment milestones.",
  plainEnglishBreakdown: [
    "**Payment Terms**: Invoices payable within 30 days.",
    "**Indemnification**: Provider indemnifies client against third-party claims.",
  ],
  keyRisks: {
    high: 2,
    medium: 3,
    low: 5,
    summary: "Significant exposure in section 8 indemnification.",
  },
  clauses: [
    {
      id: "clause-1",
      title: "Indemnity & Hold Harmless",
      category: "Liability & Indemnification",
      rawText: "Consultant agrees to defend and hold harmless Client from any and all damages.",
      plainEnglishSummary: "You pay for all legal defense if someone sues the client.",
      riskLevel: "HIGH",
      riskExplanation: "Uncapped liability without mutual defense obligations.",
      obligations: [{ party: "Consultant", action: "Indemnify client", deadlineOrCondition: "Immediate" }],
      potentialPitfalls: ["No financial ceiling specified."],
    },
    {
      id: "clause-2",
      title: "Notice of Termination",
      category: "Termination & Renewal",
      rawText: "Agreement renews automatically unless canceled 60 days before expiration.",
      plainEnglishSummary: "Must cancel at least 60 days before end date or you are locked in.",
      riskLevel: "MEDIUM",
      riskExplanation: "Evergreen auto-renewal trap.",
      obligations: [{ party: "Client", action: "Send written notice", deadlineOrCondition: "60 days prior" }],
      potentialPitfalls: ["Missed notice window locks in another year."],
    },
  ],
  missingClauses: [
    {
      clauseName: "Mutual Limitation of Liability",
      category: "Liability & Indemnification",
      whyItMatters: "Without a liability cap, potential damages could exceed total contract value.",
      recommendedAction: "Add an aggregate cap tied to the last 12 months fees paid.",
      severity: "HIGH",
    },
  ],
  checklist: [
    {
      id: "chk-1",
      title: "Negotiate Mutual Liability Cap",
      description: "Request standard 12-month trailing fees liability ceiling.",
      priority: "HIGH",
      category: "Liability & Indemnification",
      completed: false,
    },
    {
      id: "chk-2",
      title: "Confirm Invoicing Protocol",
      description: "Verify electronic billing email address with accounts payable.",
      priority: "LOW",
      category: "Payment & Financial Obligations",
      completed: true,
    },
  ],
  lawyerPrepKit: {
    documentTitle: "master_services_agreement.docx",
    consultationObjective: "Negotiate liability and IP rights",
    estimatedFinancialExposure: "High ($100k+)",
    topConcernClauses: [
      {
        title: "Indemnity & Hold Harmless",
        riskSummary: "Uncapped liability without mutual protection.",
        suggestedQuestionForLawyer: "Can we cap indemnification to fees paid?",
      },
    ],
    keyQuestionsToAsk: ["Can we cap indemnification to fees received?"],
    recommendedExhibits: ["Exhibit A - Scope of Work"],
    disclaimer: "Informational only.",
  },
  analyzedAt: new Date().toISOString(),
};

describe("React UI Components", () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
    global.URL.createObjectURL = vi.fn(() => "blob:mock-url");
    global.URL.revokeObjectURL = vi.fn();
    HTMLAnchorElement.prototype.click = vi.fn();
  });

  describe("DisclaimerBanner Component", () => {
    it("renders non-legal advice warning and ethical AI badge", () => {
      render(<DisclaimerBanner />);

      expect(screen.getByText("NOT LEGAL ADVICE:")).toBeDefined();
      expect(screen.getByLabelText("Legal Disclaimer")).toBeDefined();
      expect(screen.getByText("Zero-Retention Ephemeral Processing")).toBeDefined();
    });
  });

  describe("RiskRadar Component", () => {
    it("renders risk counts and missing clause alerts", () => {
      const missing: MissingClauseWarning[] = [
        {
          clauseName: "Data Breach Notification Window",
          category: "Data Privacy & Security",
          whyItMatters: "Need explicit 72-hour window for GDPR/HIPAA compliance.",
          recommendedAction: "Insert standard 72-hour incident response obligation.",
          severity: "HIGH",
        },
      ];

      render(
        <RiskRadar
          keyRisks={{ high: 3, medium: 2, low: 4, summary: "Elevated risk profile" }}
          missingClauses={missing}
        />
      );

      expect(screen.getByText("Contract Risk Radar & Exposure Breakdown")).toBeDefined();
      expect(screen.getByText("High Risk (3)")).toBeDefined();
      expect(screen.getByText("Medium Risk (2)")).toBeDefined();
      expect(screen.getByText("Standard / Low (4)")).toBeDefined();
      expect(screen.getByText("Data Breach Notification Window")).toBeDefined();
      expect(screen.getByText(/Insert standard 72-hour incident response obligation/i)).toBeDefined();
    });

    it("displays clean state message when no clauses are missing", () => {
      render(
        <RiskRadar
          keyRisks={{ high: 0, medium: 1, low: 5, summary: "Clean baseline" }}
          missingClauses={[]}
        />
      );

      expect(
        screen.getByText(/No critical omitted clauses identified. Standard baseline protections are present./i)
      ).toBeDefined();
    });
  });

  describe("ActionChecklist Component", () => {
    it("renders items and toggles completion state on user click", () => {
      const items: ActionChecklistItem[] = [
        {
          id: "item-1",
          title: "Deliver Insurance Certificate",
          description: "Upload COI before site access.",
          priority: "HIGH",
          category: "Compliance",
          completed: false,
        },
      ];

      render(<ActionChecklist initialItems={items} />);

      expect(screen.getByText("Deliver Insurance Certificate")).toBeDefined();
      expect(screen.getByText("Progress: 0 of 1 (0%)")).toBeDefined();

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox.getAttribute("aria-checked")).toBe("false");

      // Click to toggle
      fireEvent.click(checkbox);
      expect(checkbox.getAttribute("aria-checked")).toBe("true");
      expect(screen.getByText("Progress: 1 of 1 (100%)")).toBeDefined();
    });

    it("exports checklist to markdown, csv, and clipboard", () => {
      const items: ActionChecklistItem[] = [
        {
          id: "item-exp",
          title: "Audit Payment Milestones",
          description: "Verify invoices match deliverables.",
          priority: "HIGH",
          category: "Payment",
          completed: false,
        },
      ];

      render(<ActionChecklist initialItems={items} />);

      // Copy All button
      const copyBtn = screen.getByText("Copy All");
      fireEvent.click(copyBtn);
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
      expect(screen.getByText("Copied!")).toBeDefined();

      // Markdown export button
      const mdBtn = screen.getByText("Markdown (.md)");
      fireEvent.click(mdBtn);
      expect(global.URL.createObjectURL).toHaveBeenCalled();

      // CSV export button
      const csvBtn = screen.getByText("CSV (.csv)");
      fireEvent.click(csvBtn);
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });
  });

  describe("AnalysisOverview Component", () => {
    it("renders readability score and switches between reading levels", () => {
      render(<AnalysisOverview analysis={mockAnalysis} />);

      expect(screen.getByText("45")).toBeDefined();
      expect(screen.getByText("Difficult")).toBeDefined();
      expect(screen.getByText("~7")).toBeDefined();

      // Switch to Executive Brief
      const execBtn = screen.getByText("Executive Brief");
      fireEvent.click(execBtn);
      expect(screen.getByText("Commercial & Executive Exposure Brief")).toBeDefined();
      expect(screen.getByText("Critical Red Flags")).toBeDefined();

      // Switch to Legal Precision
      const legalBtn = screen.getByText("Legal Precision");
      fireEvent.click(legalBtn);
      expect(screen.getByText("Statutory & Contractual Rigor")).toBeDefined();
      expect(screen.getByText(/Statutory Categorization & Clause Index/i)).toBeDefined();

      // Switch back to Plain English
      const plainBtn = screen.getByText("Plain English");
      fireEvent.click(plainBtn);
      expect(screen.getByText("8th-Grade Plain English Translation")).toBeDefined();
    });
  });

  describe("ClauseList Component", () => {
    it("renders clauses with negotiation playbook and copies counter-proposal", () => {
      render(<ClauseList clauses={mockAnalysis.clauses} />);

      expect(screen.getByText("Indemnity & Hold Harmless")).toBeDefined();
      expect(screen.getByText("HIGH RISK")).toBeDefined();
      expect(screen.getByText(/Negotiation Playbook & Suggested Counter-Language/i)).toBeDefined();

      const copyCounterBtn = screen.getAllByText("Copy Counter-Proposal")[0];
      fireEvent.click(copyCounterBtn);
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
      expect(screen.getByText("Copied!")).toBeDefined();
    });
  });

  describe("LawyerPrepKit Component", () => {
    it("renders attorney dossier and allows copying the brief", () => {
      render(
        <LawyerPrepKit
          data={mockAnalysis.lawyerPrepKit}
          documentTitle="master_services_agreement.docx"
        />
      );

      expect(screen.getByText("Attorney Consultation Brief & Prep Dossier")).toBeDefined();
      expect(screen.getByText("Negotiate liability and IP rights")).toBeDefined();

      const copyBriefBtn = screen.getByText("Copy Brief");
      fireEvent.click(copyBriefBtn);
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
      expect(screen.getByText("Copied!")).toBeDefined();

      const mdBtn = screen.getByText("Markdown (.md)");
      fireEvent.click(mdBtn);
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });
  });
});
