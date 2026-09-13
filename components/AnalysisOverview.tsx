"use client";

import React from "react";
import { DocumentAnalysis } from "@/lib/types/legal";
import { BookOpen, Clock, FileCheck, AlertTriangle, ShieldCheck } from "lucide-react";

interface AnalysisOverviewProps {
  analysis: DocumentAnalysis;
}

export default function AnalysisOverview({ analysis }: AnalysisOverviewProps) {
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

      {/* Executive Summary Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-xl bg-legal-50 dark:bg-legal-950 text-legal-700 dark:text-legal-300">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-serif">
              Plain-Language Executive Summary
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              High-level translation generated without legal jargon
            </p>
          </div>
        </div>

        <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base mb-6 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
          {executiveSummary}
        </p>

        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          Key Provisions Simplified:
        </h4>

        <div className="space-y-2.5">
          {plainEnglishBreakdown.map((item, index) => (
            <div
              key={index}
              className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed"
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: item.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 dark:text-slate-100 font-semibold">$1</strong>'),
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
