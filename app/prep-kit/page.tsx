"use client";

import React, { useState } from "react";
import LawyerPrepKit from "@/components/LawyerPrepKit";
import { LawyerPrepKitData } from "@/lib/types/legal";
import { useAnalysis } from "@/context/AnalysisContext";

export default function PrepKitPage() {
  const { analysis } = useAnalysis();

  const defaultPrepKit: LawyerPrepKitData = {
    documentTitle: "Commercial Services Agreement / Residential Lease",
    consultationObjective:
      "Review high-exposure indemnity provisions, confirm termination rights, and negotiate balanced liability caps before execution.",
    estimatedFinancialExposure:
      "Potentially Uncapped (due to broad indemnification clause)",
    topConcernClauses: [
      {
        title: "Indemnification & Third-Party Claims",
        riskSummary:
          "Obligates you to defend and pay for the counterparty's losses without a reciprocal duty or monetary limit.",
        suggestedQuestionForLawyer:
          "Can we insert a mutual liability cap tied to fees paid over the prior 12 months?",
      },
      {
        title: "Evergreen Automatic Renewal",
        riskSummary:
          "Requires written cancellation 60 days in advance or automatically binds you for another 12-month term.",
        suggestedQuestionForLawyer:
          "Can we reduce the auto-renewal opt-out window to 30 days and require affirmative consent?",
      },
      {
        title: "Mandatory Binding Arbitration & Jury Waiver",
        riskSummary:
          "Waives constitutional right to a jury trial and mandates confidential private arbitration in a foreign venue.",
        suggestedQuestionForLawyer:
          "Is this arbitration venue enforceable, and should we specify local courts instead?",
      },
    ],
    keyQuestionsToAsk: [
      "Is the indemnification clause mutual, and does it exclude consequential or indirect damages?",
      "Can we reduce the auto-renewal opt-out notice window from 60 days to 30 days?",
      "Does this agreement restrict my ability to perform similar work for other clients in my industry?",
      "What are the mandatory dispute resolution steps before either party can file a court action?",
    ],
    recommendedExhibits: [
      "Prior version of the agreement (if negotiating an amendment)",
      "Standard pricing or statement of work attachment",
      "List of pre-existing background intellectual property to exclude",
    ],
    disclaimer:
      "This preparation kit is an automated AI-assisted briefing summary generated to help you ask informed questions. It is for your reference ahead of speaking with a licensed attorney and does not constitute legal representation.",
  };

  const activeData = analysis?.lawyerPrepKit || defaultPrepKit;
  const activeTitle = analysis?.fileName || "Standard Commercial Agreement";

  return (
    <div className="space-y-6">
      <LawyerPrepKit
        data={activeData}
        documentTitle={activeTitle}
      />
    </div>
  );
}

