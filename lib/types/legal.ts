/**
 * @file legal.ts
 * @description Core TypeScript definitions and data interfaces for LegalLens AI.
 * Covers documents, parsed clauses, risk assessments, grounded citations,
 * contract comparisons, and lawyer consultation kits.
 */

/**
 * Severity level of legal risk associated with a clause or document.
 */
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

/**
 * Standard classification category for contractual clauses.
 */
export type ClauseCategory =
  | "Liability & Indemnification"
  | "Termination & Renewal"
  | "Payment & Financial Obligations"
  | "Intellectual Property & Confidentiality"
  | "Dispute Resolution & Jurisdiction"
  | "Data Privacy & Security"
  | "Representations & Warranties"
  | "General & Miscellaneous";

/**
 * Represents an extracted contractual clause with analysis and risk classification.
 */
export interface Clause {
  id: string;
  sectionNumber?: string;
  title: string;
  category: ClauseCategory;
  rawText: string;
  plainEnglishSummary: string;
  riskLevel: RiskLevel;
  riskExplanation: string;
  obligations: {
    party: string;
    action: string;
    deadlineOrCondition?: string;
  }[];
  potentialPitfalls: string[];
}

/**
 * Warning regarding standard clauses that are absent from the document.
 */
export interface MissingClauseWarning {
  clauseName: string;
  category: ClauseCategory;
  whyItMatters: string;
  recommendedAction: string;
  severity: RiskLevel;
}

/**
 * Actionable next steps derived from document obligations and risks.
 */
export interface ActionChecklistItem {
  id: string;
  title: string;
  description: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  dueDate?: string;
  category: string;
  completed: boolean;
  relatedClauseId?: string;
}

/**
 * Complete document intelligence analysis payload.
 */
export interface DocumentAnalysis {
  documentId: string;
  fileName: string;
  fileSizeBytes: number;
  wordCount: number;
  readingEaseScore: {
    score: number; // 0-100 scale (Flesch-Kincaid)
    label: "Easy" | "Standard" | "Difficult" | "Very Difficult" | "Dense Legalese";
    readingTimeMinutes: number;
  };
  executiveSummary: string;
  plainEnglishBreakdown: string[];
  keyRisks: {
    high: number;
    medium: number;
    low: number;
    summary: string;
  };
  clauses: Clause[];
  missingClauses: MissingClauseWarning[];
  checklist: ActionChecklistItem[];
  lawyerPrepKit: LawyerPrepKitData;
  analyzedAt: string;
}

/**
 * Grounded citation linking an AI answer to a specific clause or chunk.
 */
export interface Citation {
  clauseId?: string;
  sectionTitle: string;
  exactQuote: string;
  relevanceScore: number;
}

/**
 * Message in the cited Q&A chat interface.
 */
export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  content: string;
  citations?: Citation[];
  timestamp: string;
}

/**
 * Data packet for preparing an informed consultation with a licensed attorney.
 */
export interface LawyerPrepKitData {
  documentTitle: string;
  consultationObjective: string;
  estimatedFinancialExposure: string;
  topConcernClauses: {
    title: string;
    riskSummary: string;
    suggestedQuestionForLawyer: string;
  }[];
  keyQuestionsToAsk: string[];
  recommendedExhibits: string[];
  disclaimer: string;
}

/**
 * Diff segment type for contract comparison.
 */
export type DiffChangeType = "added" | "removed" | "unchanged" | "modified";

/**
 * Line-level or chunk-level difference between two contract versions.
 */
export interface DiffChunk {
  type: DiffChangeType;
  content: string;
  originalLineNumber?: number;
  newLineNumber?: number;
}

/**
 * Complete comparison analysis between two document revisions.
 */
export interface ComparisonAnalysis {
  originalFileName: string;
  revisedFileName: string;
  summaryOfChanges: string;
  criticalModifications: {
    category: ClauseCategory;
    description: string;
    impact: "FAVORABLE" | "UNFAVORABLE" | "NEUTRAL";
    riskShift: string;
  }[];
  diffChunks: DiffChunk[];
  stats: {
    additions: number;
    deletions: number;
    modifications: number;
    similarityPercentage: number;
  };
}
