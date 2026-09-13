"use client";

import React, { useState } from "react";
import { Clause, RiskLevel, ClauseCategory } from "@/lib/types/legal";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  FileCode,
  CheckCircle,
  ShieldAlert,
  Copy,
  Check,
} from "lucide-react";

interface ClauseListProps {
  clauses: Clause[];
}

function getNegotiationPlaybook(clause: Clause): { strategy: string; counterLanguage: string } {
  const cat = clause.category;
  if (cat.includes("Liability") || cat.includes("Indemnif")) {
    return {
      strategy: "Insert an aggregate liability cap tied to trailing fees paid and eliminate unilateral uncapped exposure.",
      counterLanguage:
        "Notwithstanding anything to the contrary in this Agreement, each party's maximum aggregate liability arising out of or related to this Agreement shall not exceed the total fees actually paid or payable by Client under this Agreement during the twelve (12) month period immediately preceding the event giving rise to liability. Neither party shall be liable for consequential, indirect, or punitive damages.",
    };
  }
  if (cat.includes("Termination") || cat.includes("Renewal")) {
    return {
      strategy: "Provide bilateral termination rights and eliminate surprise automatic renewal with a mandatory 60-day notice window.",
      counterLanguage:
        "Either party may terminate this Agreement upon sixty (60) days prior written notice. In the event of an alleged material breach, the non-breaching party shall provide written notice specifying the breach, and the breaching party shall have thirty (30) calendar days to cure such breach prior to termination taking effect.",
    };
  }
  if (cat.includes("Intellectual Property") || cat.includes("Confidentiality")) {
    return {
      strategy: "Clearly carve out pre-existing IP and ensure standard public domain exceptions are explicitly mutual.",
      counterLanguage:
        "Each party retains sole ownership of its pre-existing intellectual property, proprietary tools, and standard methodologies. Confidentiality obligations shall strictly exclude any information that is or becomes publicly known through no wrongful act of the Receiving Party.",
    };
  }
  if (cat.includes("Payment") || cat.includes("Financial")) {
    return {
      strategy: "Establish Net 30 payment milestones and restrict late fees to reasonable statutory interest on undisputed charges only.",
      counterLanguage:
        "Invoices shall be payable within thirty (30) days of receipt. Client may withhold payment of amounts disputed in good faith, provided Client gives prompt written notice within fifteen (15) days of invoice receipt. Undisputed amounts shall be paid on schedule.",
    };
  }
  return {
    strategy: "Propose reciprocal terms requiring reasonable commercial efforts and mutual written consent.",
    counterLanguage:
      "The parties agree to act in good faith and cooperate reasonably with respect to the obligations set forth in this Section, and neither party shall unreasonably withhold, condition, or delay its consent or approval.",
  };
}

export default function ClauseList({ clauses }: ClauseListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedRisk, setSelectedRisk] = useState<string>("ALL");
  const [expandedClauseIds, setExpandedClauseIds] = useState<Set<string>>(new Set([clauses[0]?.id]));
  const [copiedClauseId, setCopiedClauseId] = useState<string | null>(null);

  const handleCopyCounterLanguage = (clauseId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedClauseId(clauseId);
    setTimeout(() => setCopiedClauseId(null), 2000);
  };

  const toggleExpand = (id: string) => {
    setExpandedClauseIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const categories = Array.from(new Set(clauses.map((c) => c.category)));

  const filteredClauses = clauses.filter((c) => {
    if (selectedCategory !== "ALL" && c.category !== selectedCategory) return false;
    if (selectedRisk !== "ALL" && c.riskLevel !== selectedRisk) return false;
    return true;
  });

  const getRiskBadge = (risk: RiskLevel) => {
    switch (risk) {
      case "HIGH":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <AlertTriangle className="w-3 h-3" />
            HIGH RISK
          </span>
        );
      case "MEDIUM":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <AlertTriangle className="w-3 h-3" />
            MEDIUM RISK
          </span>
        );
      case "LOW":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle className="w-3 h-3" />
            LOW / STANDARD
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls & Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="riskFilter" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Filter Risk:
          </label>
          <select
            id="riskFilter"
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-legal-500"
          >
            <option value="ALL">All Risk Levels ({clauses.length})</option>
            <option value="HIGH">High Risk Only</option>
            <option value="MEDIUM">Medium Risk Only</option>
            <option value="LOW">Low / Standard Only</option>
          </select>

          <label htmlFor="categoryFilter" className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-2">
            Category:
          </label>
          <select
            id="categoryFilter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-legal-500"
          >
            <option value="ALL">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400">
          Showing <strong>{filteredClauses.length}</strong> of {clauses.length} clauses
        </div>
      </div>

      {/* Clause Cards */}
      <div className="space-y-4">
        {filteredClauses.map((clause) => {
          const isExpanded = expandedClauseIds.has(clause.id);
          return (
            <div
              key={clause.id}
              className={`bg-white dark:bg-slate-900 border rounded-2xl transition-all shadow-sm overflow-hidden ${
                clause.riskLevel === "HIGH"
                  ? "border-rose-200 dark:border-rose-900/60"
                  : clause.riskLevel === "MEDIUM"
                  ? "border-amber-200 dark:border-amber-900/60"
                  : "border-slate-200 dark:border-slate-800"
              }`}
            >
              {/* Header bar */}
              <button
                type="button"
                onClick={() => toggleExpand(clause.id)}
                className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition"
                aria-expanded={isExpanded}
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {getRiskBadge(clause.riskLevel)}
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {clause.category}
                    </span>
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 font-serif">
                    {clause.title}
                  </h4>
                </div>

                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {/* Body */}
              {isExpanded && (
                <div className="px-5 pb-6 sm:px-6 space-y-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                  {/* Plain English Summary */}
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Plain English Breakdown:
                    </h5>
                    <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                      {clause.plainEnglishSummary}
                    </p>
                  </div>

                  {/* Risk Explanation */}
                  <div
                    className={`p-3.5 rounded-xl border text-xs sm:text-sm leading-relaxed ${
                      clause.riskLevel === "HIGH"
                        ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200"
                        : clause.riskLevel === "MEDIUM"
                        ? "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200"
                        : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <strong>Why this matters:</strong> {clause.riskExplanation}
                  </div>

                  {/* Obligations Tagging */}
                  {clause.obligations && clause.obligations.length > 0 && (
                    <div>
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Allocated Obligations:
                      </h5>
                      <div className="space-y-1.5">
                        {clause.obligations.map((ob, i) => (
                          <div
                            key={i}
                            className="text-xs bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-1"
                          >
                            <span className="font-semibold text-legal-700 dark:text-legal-300">
                              {ob.party}:
                            </span>
                            <span className="text-slate-700 dark:text-slate-300">{ob.action}</span>
                            {ob.deadlineOrCondition && (
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                                ({ob.deadlineOrCondition})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Negotiation Strategy & Counter-Language */}
                  {(() => {
                    const playbook = getNegotiationPlaybook(clause);
                    return (
                      <div className="p-4 rounded-xl bg-legal-50/70 dark:bg-legal-950/40 border border-legal-200 dark:border-legal-800 space-y-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="p-1 rounded-md bg-legal-600 text-white">
                              <ShieldAlert className="w-3.5 h-3.5" />
                            </span>
                            <h6 className="text-xs font-bold text-legal-900 dark:text-legal-200 uppercase tracking-wider">
                              Negotiation Playbook & Suggested Counter-Language:
                            </h6>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleCopyCounterLanguage(clause.id, playbook.counterLanguage)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-legal-300 dark:border-legal-700 text-legal-700 dark:text-legal-300 hover:bg-legal-100 dark:hover:bg-slate-700 transition"
                            title="Copy proposed counter-language to clipboard"
                          >
                            {copiedClauseId === clause.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-500" />
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy Counter-Proposal</span>
                              </>
                            )}
                          </button>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          <strong className="text-slate-800 dark:text-slate-200">Recommended Strategy:</strong>{" "}
                          {playbook.strategy}
                        </p>

                        <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-legal-200 dark:border-legal-800/80 text-xs font-serif italic text-slate-800 dark:text-slate-200 leading-relaxed select-text">
                          &ldquo;{playbook.counterLanguage}&rdquo;
                        </div>
                      </div>
                    );
                  })()}

                  {/* Raw Text Excerpt */}
                  <details className="text-xs">
                    <summary className="cursor-pointer text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-semibold inline-flex items-center gap-1 select-none">
                      <FileCode className="w-3.5 h-3.5" />
                      <span>View original contractual clause</span>
                    </summary>
                    <pre className="mt-2 p-3 bg-slate-950 text-slate-300 rounded-xl overflow-x-auto text-[11px] font-mono leading-relaxed whitespace-pre-wrap">
                      {clause.rawText}
                    </pre>
                  </details>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
