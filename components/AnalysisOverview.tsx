"use client";

import React, { useState } from "react";
import { DocumentAnalysis } from "@/lib/types/legal";
import {
  BookOpen,
  Clock,
  FileCheck,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  Briefcase,
  Scale,
} from "lucide-react";

interface AnalysisOverviewProps {
  analysis: DocumentAnalysis;
}

export default function AnalysisOverview({ analysis }: AnalysisOverviewProps) {
  const [readingLevel, setReadingLevel] = useState<"plain" | "executive" | "legal">("plain");
  const { readingEaseScore, keyRisks, executiveSummary, plainEnglishBreakdown } = analysis;

  const getScoreColor = (score: number) => {
    if (score > 60) return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800";
    if (score > 35) return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800";
    return "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800";
  };

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Reading Ease Score */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Readability
            </span>
            <BookOpen className="w-4 h-4 text-legal-600 dark:text-legal-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              {readingEaseScore.score}
            </span>
            <span className="text-xs text-slate-400">/100</span>
          </div>
          <div className="mt-2">
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getScoreColor(
                readingEaseScore.score
              )}`}
            >
              {readingEaseScore.label}
            </span>
          </div>
        </div>

        {/* Reading Time */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Est. Reading Time
            </span>
            <Clock className="w-4 h-4 text-legal-600 dark:text-legal-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              ~{readingEaseScore.readingTimeMinutes}
            </span>
            <span className="text-xs text-slate-400">min</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Based on {analysis.wordCount.toLocaleString()} words
          </p>
        </div>

        {/* High Risk Flags */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              High Risk Flags
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-3xl font-extrabold ${
                keyRisks.high > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {keyRisks.high}
            </span>
            <span className="text-xs text-slate-400">clause(s)</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {keyRisks.medium} medium risk / {keyRisks.low} standard
          </p>
        </div>

        {/* Verified Clauses */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Classified Clauses
            </span>
            <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              {analysis.clauses.length}
            </span>
            <span className="text-xs text-slate-400">extracted</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {analysis.missingClauses.length} missing clause warnings
          </p>
        </div>
      </div>

      {/* Document Intelligence & Reading Level Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-legal-50 dark:bg-legal-950 text-legal-700 dark:text-legal-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-serif">
                Document Intelligence Summary
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Switch perspective to match your technical comfort level
              </p>
            </div>
          </div>

          {/* Reading Level Selector Pills */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs font-semibold gap-1">
            <button
              type="button"
              onClick={() => setReadingLevel("plain")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                readingLevel === "plain"
                  ? "bg-white dark:bg-slate-900 text-legal-700 dark:text-legal-300 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Plain English</span>
            </button>

            <button
              type="button"
              onClick={() => setReadingLevel("executive")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                readingLevel === "executive"
                  ? "bg-white dark:bg-slate-900 text-legal-700 dark:text-legal-300 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-blue-500" />
              <span>Executive Brief</span>
            </button>

            <button
              type="button"
              onClick={() => setReadingLevel("legal")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                readingLevel === "legal"
                  ? "bg-white dark:bg-slate-900 text-legal-700 dark:text-legal-300 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Scale className="w-3.5 h-3.5 text-emerald-500" />
              <span>Legal Precision</span>
            </button>
          </div>
        </div>

        {/* View 1: 8th-Grade Plain English */}
        {readingLevel === "plain" && (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                8th-Grade Plain English Translation
              </span>
              <span className="text-xs text-slate-400">Zero legal jargon guaranteed</span>
            </div>

            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
              {executiveSummary}
            </p>

            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Key Provisions in Everyday Terms:
            </h4>

            <div className="space-y-2.5">
              {plainEnglishBreakdown.map((item, index) => (
                <div
                  key={index}
                  className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed"
                >
                  <div
                    dangerouslySetInnerHTML={{
                      __html: item.replace(
                        /\*\*(.*?)\*\*/g,
                        '<strong class="text-slate-900 dark:text-slate-100 font-semibold">$1</strong>'
                      ),
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View 2: Executive Brief */}
        {readingLevel === "executive" && (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-800">
                Commercial & Executive Exposure Brief
              </span>
              <span className="text-xs text-slate-400">Focus on money, liability & operational milestones</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] font-bold uppercase text-slate-400">Financial Exposure</span>
                <p className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {analysis.lawyerPrepKit?.estimatedFinancialExposure || "Moderate"}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Based on indemnities & remedies</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] font-bold uppercase text-slate-400">Critical Red Flags</span>
                <p className={`text-base font-bold mt-1 ${keyRisks.high > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                  {keyRisks.high} High / {keyRisks.medium} Medium
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{keyRisks.summary}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] font-bold uppercase text-slate-400">Action Items</span>
                <p className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {analysis.checklist.length} Due Diligence Items
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Pre-signing & ongoing checkpoints</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Strategic Bottom Line:
              </h4>
              <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                {executiveSummary}
              </p>
            </div>
          </div>
        )}

        {/* View 3: Legal Precision */}
        {readingLevel === "legal" && (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800">
                Statutory & Contractual Rigor
              </span>
              <span className="text-xs text-slate-400">Formal legal structure & clause catalog</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Document Fingerprint ID: <code className="font-mono text-slate-700 dark:text-slate-300">{analysis.documentId}</code></span>
                <span>Word Count: <strong>{analysis.wordCount}</strong></span>
              </div>
              <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-mono text-xs">
                {executiveSummary}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Statutory Categorization & Clause Index ({analysis.clauses.length} identified):
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {analysis.clauses.slice(0, 6).map((cl) => (
                  <div key={cl.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{cl.title}</span>
                    <span className="block text-[11px] text-slate-500 dark:text-slate-400">{cl.category} • {cl.riskLevel} Risk</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
