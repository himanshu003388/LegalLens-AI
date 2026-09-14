"use client";

import React, { useState } from "react";
import { DocumentAnalysis, ScenarioSimulation } from "@/lib/types/legal";
import {
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Copy,
  Check,
  Send,
  Sparkles,
  DollarSign,
  Compass,
} from "lucide-react";

interface ScenarioSimulatorProps {
  analysis: DocumentAnalysis;
  documentText: string;
}

export default function ScenarioSimulator({
  analysis,
  documentText,
}: ScenarioSimulatorProps) {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioSimulation | null>(null);
  const [customQuestion, setCustomQuestion] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Generate dynamic contextual scenarios based on contract clauses
  const defaultScenarios: ScenarioSimulation[] = React.useMemo(() => {
    const textLower = documentText.toLowerCase();
    const scenarios: ScenarioSimulation[] = [];

    // Scenario 1: Late Payment / Rent default
    const paymentClause = analysis.clauses.find((c) => c.category === "Payment & Financial Obligations");
    if (paymentClause || textLower.includes("rent") || textLower.includes("payment")) {
      scenarios.push({
        id: "scenario-payment",
        title: "Late Payment or Cashflow Delay",
        prompt: "What happens if I make a payment 5 to 10 days late due to unexpected bank or cashflow delay?",
        applicableClauses: [paymentClause?.title || "Payment Terms & Default"],
        riskOutcome: paymentClause?.riskLevel === "HIGH" ? "SEVERE_RISK" : "MODERATE_RISK",
        plainEnglishExplanation:
          "The agreement strictly enforces punctual payments. Paying late can trigger statutory default, late fees, forfeiture of discounts, or even immediate acceleration of the remaining contract balance.",
        financialExposureEstimate: "Late fee penalty + interest charges + risk of deposit forfeiture or service suspension.",
        actionableRemedy:
          "Request a written 5-day grace period before late penalties activate. Immediately notify the other party in writing citing temporary delay prior to the due date.",
        suggestedNegotiationCounter:
          "\"Tenant/Client shall be entitled to a five (5) business day grace period following written notice before any late fee, interest, or default remedy shall apply.\"",
      });
    }

    // Scenario 2: Early Termination / Walk-away
    const termClause = analysis.clauses.find((c) => c.category === "Termination & Renewal");
    if (termClause || textLower.includes("terminat") || textLower.includes("notice")) {
      scenarios.push({
        id: "scenario-termination",
        title: "Cancelling or Exiting the Agreement Early",
        prompt: "What if I need to cancel the contract before the full term ends?",
        applicableClauses: [termClause?.title || "Term & Termination"],
        riskOutcome: termClause?.riskLevel === "HIGH" ? "SEVERE_RISK" : "MODERATE_RISK",
        plainEnglishExplanation:
          "The agreement imposes strict notice windows. Terminating without proper cause or failing to deliver written notice within the specified window could be deemed a material breach, making you liable for the remainder of the contract duration.",
        financialExposureEstimate: "Liability for remaining term balance or loss of pre-paid fees / deposits.",
        actionableRemedy:
          "Review the required notice window (e.g. 30, 60, or 90 days). Send notice via certified mail with receipt tracking rather than casual chat or phone calls.",
        suggestedNegotiationCounter:
          "\"Either party may terminate this Agreement for convenience upon thirty (30) days' prior written notice without penalty, fee, or further recurring obligation.\"",
      });
    }

    // Scenario 3: Third-Party Dispute or Defect Claim
    const liabilityClause = analysis.clauses.find((c) => c.category === "Liability & Indemnification");
    if (liabilityClause || textLower.includes("indemnif") || textLower.includes("liability")) {
      scenarios.push({
        id: "scenario-liability",
        title: "Third-Party Claim or Customer Lawsuit",
        prompt: "What happens if a customer or third party threatens legal action over the work or premises?",
        applicableClauses: [liabilityClause?.title || "Indemnification & Liability"],
        riskOutcome: liabilityClause?.riskLevel === "HIGH" ? "SEVERE_RISK" : "MODERATE_RISK",
        plainEnglishExplanation:
          "The indemnification provision requires one party to defend and pay all legal costs for claims. If liability is uncapped, personal or business assets may be exposed without upper limit.",
        financialExposureEstimate: "Uncapped legal defense fees and potential court judgments unless shielded by a mutual cap.",
        actionableRemedy:
          "Ensure your professional commercial liability insurance policy covers the exact indemnification scope described in this agreement.",
        suggestedNegotiationCounter:
          "\"Each party's total aggregate liability arising under or relating to this Agreement shall be strictly limited to the total fees actually paid in the preceding 12 months.\"",
      });
    }

    // Scenario 4: Work Ownership / Intellectual Property
    const ipClause = analysis.clauses.find((c) => c.category === "Intellectual Property & Confidentiality");
    if (ipClause || textLower.includes("work made for hire") || textLower.includes("intellectual property")) {
      scenarios.push({
        id: "scenario-ip",
        title: "Reusing Code, Tools, or Background IP",
        prompt: "Can I reuse my pre-existing software tools, templates, or methodologies for other clients?",
        applicableClauses: [ipClause?.title || "Intellectual Property & Work for Hire"],
        riskOutcome: "MODERATE_RISK",
        plainEnglishExplanation:
          "Broad 'work made for hire' and unconditional assignment clauses may inadvertently assign your pre-existing developer libraries, templates, and frameworks to the client.",
        financialExposureEstimate: "Loss of ownership of proprietary tools or claims of copyright infringement.",
        actionableRemedy:
          "Attach an explicit 'Exhibit of Pre-Existing Materials' specifically listing all open-source libraries and proprietary tools excluded from the assignment.",
        suggestedNegotiationCounter:
          "\"Contractor retains sole ownership of all pre-existing tools, libraries, and methodologies. Client receives a non-exclusive, perpetual, royalty-free license to use such materials solely as incorporated into the Deliverables.\"",
      });
    }

    return scenarios;
  }, [analysis.clauses, documentText]);

  const handleCopyCounter = (id: string, counter: string) => {
    navigator.clipboard.writeText(counter);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;

    // Simulate custom question evaluation
    const customScenario: ScenarioSimulation = {
      id: "custom-" + Date.now(),
      title: "Custom Inquiry",
      prompt: customQuestion,
      applicableClauses: analysis.clauses.slice(0, 2).map((c) => c.title),
      riskOutcome: "MODERATE_RISK",
      plainEnglishExplanation: `Based on your contract "${analysis.fileName}", inquiries regarding this matter are governed by the general terms and dispute mechanisms. Silence or ambiguity in the contract typically reverts to standard statutory law.`,
      financialExposureEstimate: "Dependent on court interpretation or arbitration damages.",
      actionableRemedy: "Request written clarification from the opposing party and document all relevant dates and notices.",
      suggestedNegotiationCounter: "\"Any dispute or ambiguity regarding this matter shall be resolved through good-faith executive negotiation prior to initiating formal arbitration.\"",
    };

    setSelectedScenario(customScenario);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-serif">
              Interactive &quot;What-If&quot; Scenario Simulator
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Test real-world legal scenarios, estimate financial exposure, and generate negotiation counters.
            </p>
          </div>
        </div>

        {/* Custom Scenario Bar */}
        <form onSubmit={handleCustomSubmit} className="mt-6 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            placeholder="Type a scenario (e.g. 'What if I need to terminate after 3 months?')..."
            className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <button
            type="submit"
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulate Scenario</span>
          </button>
        </form>
      </div>

      {/* Preset Scenario Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {defaultScenarios.map((scen) => {
          const isSelected = selectedScenario?.id === scen.id;
          return (
            <div
              key={scen.id}
              onClick={() => setSelectedScenario(scen)}
              className={`cursor-pointer rounded-2xl p-5 border transition-all duration-200 text-left ${
                isSelected
                  ? "bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-500 ring-2 ring-indigo-500/20 shadow-md"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                  <span>{scen.title}</span>
                </h3>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    scen.riskOutcome === "SEVERE_RISK"
                      ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                  }`}
                >
                  {scen.riskOutcome === "SEVERE_RISK" ? "Severe Exposure" : "Moderate Risk"}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 italic mb-3">
                &ldquo;{scen.prompt}&rdquo;
              </p>
              <div className="flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                <span>Evaluate Contract Impact</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Scenario Detailed Breakdown */}
      {selectedScenario && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400">
                Active Simulation Result
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-serif">
                {selectedScenario.title}
              </h3>
            </div>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${
                selectedScenario.riskOutcome === "SEVERE_RISK"
                  ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
              }`}
            >
              Outcome: {selectedScenario.riskOutcome.replace("_", " ")}
            </span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Plain English Explanation */}
            <div>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">
                Plain-English Contract Assessment:
              </h4>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                {selectedScenario.plainEnglishExplanation}
              </p>
            </div>

            {/* Financial Exposure Estimate */}
            {selectedScenario.financialExposureEstimate && (
              <div className="bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl p-4">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span>Estimated Potential Financial Exposure</span>
                </div>
                <p className="text-red-900 dark:text-red-300">
                  {selectedScenario.financialExposureEstimate}
                </p>
              </div>
            )}

            {/* Actionable Remedy */}
            <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl p-4">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Immediate Protective Steps to Take</span>
              </div>
              <p className="text-emerald-900 dark:text-emerald-300">
                {selectedScenario.actionableRemedy}
              </p>
            </div>

            {/* Suggested Counter-Clause */}
            {selectedScenario.suggestedNegotiationCounter && (
              <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-500" />
                    Suggested Counter-Clause to Propose
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyCounter(
                        selectedScenario.id,
                        selectedScenario.suggestedNegotiationCounter || ""
                      )
                    }
                    className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-900 transition"
                  >
                    {copiedId === selectedScenario.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Clause</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="font-mono text-xs text-amber-900 dark:text-amber-200 bg-amber-100/60 dark:bg-amber-950/80 p-3 rounded-lg border border-amber-300/40">
                  {selectedScenario.suggestedNegotiationCounter}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
