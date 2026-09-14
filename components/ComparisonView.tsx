"use client";

import React, { useState } from "react";
import { ComparisonAnalysis } from "@/lib/types/legal";
import { GitCompare, ArrowRight, CheckCircle, AlertTriangle, ShieldCheck, Sparkles } from "lucide-react";

interface ComparisonViewProps {
  onRunComparison?: (origText: string, revText: string, origName: string, revName: string) => void;
  comparisonResult: ComparisonAnalysis | null;
  isLoading: boolean;
}

export default function ComparisonView({
  onRunComparison,
  comparisonResult,
  isLoading,
}: ComparisonViewProps) {
  const [origText, setOrigText] = useState("");
  const [revText, setRevText] = useState("");
  const [origName, setOrigName] = useState("Agreement_v1.txt");
  const [revName, setRevName] = useState("Agreement_v2.txt");

  const loadSamplePair = async () => {
    try {
      const res1 = await fetch("/samples/saas-agreement-v1.txt");
      const res2 = await fetch("/samples/saas-agreement-v2.txt");
      const t1 = await res1.text();
      const t2 = await res2.text();

      setOrigText(t1);
      setRevText(t2);
      setOrigName("SaaS_Agreement_v1.0.txt");
      setRevName("SaaS_Agreement_v2.0_Revised.txt");

      if (onRunComparison) {
        onRunComparison(t1, t2, "SaaS_Agreement_v1.0.txt", "SaaS_Agreement_v2.0_Revised.txt");
      }
    } catch (e) {
      console.error("Failed to load comparison sample pair", e);
    }
  };

  const handleCompareSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origText.trim() || !revText.trim() || !onRunComparison) return;
    onRunComparison(origText, revText, origName, revName);
  };

  return (
    <div className="space-y-8">
      {/* Upload/Paste Form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-legal-100 dark:bg-legal-950 text-legal-700 dark:text-legal-300">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-serif">
                Contract Comparison & Redline Diff
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Identify additions, deletions, and legal risk shifts between two versions
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={loadSamplePair}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800 text-xs font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/60 transition shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Load Sample SaaS v1 vs v2</span>
          </button>
        </div>

        <form onSubmit={handleCompareSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Document 1: Baseline */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Document 1 (Baseline / Original)
                </label>
                <input
                  type="text"
                  value={origName}
                  onChange={(e) => setOrigName(e.target.value)}
                  placeholder="Original_Name.txt"
                  className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-slate-700 dark:text-slate-300"
                />
              </div>
              <textarea
                value={origText}
                onChange={(e) => setOrigText(e.target.value)}
                placeholder="Paste original contract text here..."
                rows={10}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-xs font-mono text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-legal-500 focus:outline-none"
              />
            </div>

            {/* Document 2: Revised */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Document 2 (Revised / Counterparty)
                </label>
                <input
                  type="text"
                  value={revName}
                  onChange={(e) => setRevName(e.target.value)}
                  placeholder="Revised_Name.txt"
                  className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-slate-700 dark:text-slate-300"
                />
              </div>
              <textarea
                value={revText}
                onChange={(e) => setRevText(e.target.value)}
                placeholder="Paste revised contract text here..."
                rows={10}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-xs font-mono text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-legal-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!origText.trim() || !revText.trim() || isLoading}
            className="w-full sm:w-auto px-6 py-3 bg-legal-600 hover:bg-legal-500 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
          >
            <GitCompare className="w-4 h-4" />
            <span>{isLoading ? "Analyzing Semantic Diffs..." : "Run Redline Comparison"}</span>
          </button>
        </form>
      </div>

      {/* Comparison Results */}
      {comparisonResult && (
        <div className="space-y-6">
          {/* Summary stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <span className="text-xs font-semibold uppercase text-slate-400">Similarity</span>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                {comparisonResult.stats.similarityPercentage}%
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <span className="text-xs font-semibold uppercase text-emerald-500">Additions</span>
              <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                +{comparisonResult.stats.additions} <span className="text-xs text-slate-400">lines</span>
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <span className="text-xs font-semibold uppercase text-rose-500">Deletions</span>
              <p className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
                -{comparisonResult.stats.deletions} <span className="text-xs text-slate-400">lines</span>
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <span className="text-xs font-semibold uppercase text-amber-500">Risk Shifts</span>
              <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                {comparisonResult.criticalModifications.length} <span className="text-xs text-slate-400">detected</span>
              </p>
            </div>
          </div>

          {/* Plain English Change Summary */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-serif mb-2">
              Plain-Language Change Summary
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
              {comparisonResult.summaryOfChanges}
            </p>
          </div>

          {/* Critical Risk Shifts Table */}
          {comparisonResult.criticalModifications.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-serif mb-4">
                Critical Clause Shifts & Exposure Impact
              </h3>
              <div className="space-y-3">
                {comparisonResult.criticalModifications.map((mod, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border ${
                      mod.impact === "UNFAVORABLE"
                        ? "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50"
                        : mod.impact === "FAVORABLE"
                        ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50"
                        : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {mod.category}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          mod.impact === "UNFAVORABLE"
                            ? "bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200"
                            : mod.impact === "FAVORABLE"
                            ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                        }`}
                      >
                        {mod.impact} IMPACT
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mb-1.5">{mod.description}</p>
                    <p className="text-xs font-semibold text-legal-700 dark:text-legal-300">
                      Risk Shift: {mod.riskShift}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Redline Diff Viewer */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-serif">
                Line-by-Line Redline Diff (Myers Algorithm)
              </h3>
              {/* Color-Blind Accessible Legend */}
              <div className="flex items-center gap-3 text-[11px] font-mono">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                  <span className="px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 border border-emerald-500/40">[+] ADDED</span>
                </span>
                <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold">
                  <span className="px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-950 border border-rose-500/40 line-through">[-] DELETED</span>
                </span>
              </div>
            </div>

            <div
              className="bg-slate-950 text-slate-200 rounded-xl p-4 overflow-x-auto text-xs font-mono max-h-[550px] border border-slate-800"
              role="region"
              aria-label="Contract Redline Differences"
            >
              {comparisonResult.diffChunks.map((chunk, idx) => (
                <div
                  key={idx}
                  className={`py-1 px-2 rounded flex items-start ${
                    chunk.type === "added"
                      ? "bg-emerald-950/80 text-emerald-200 border-l-4 border-emerald-500 font-medium"
                      : chunk.type === "removed"
                      ? "bg-rose-950/80 text-rose-200 border-l-4 border-rose-500 line-through opacity-85 bg-[repeating-linear-gradient(45deg,transparent,transparent_6px,rgba(239,68,68,0.1)_6px,rgba(239,68,68,0.1)_12px)]"
                      : "text-slate-400 hover:bg-slate-900/50"
                  }`}
                >
                  <span className="inline-block flex-shrink-0 select-none mr-2">
                    {chunk.type === "added" ? (
                      <span className="px-1 py-0.5 rounded bg-emerald-900 text-[10px] font-bold text-emerald-200 border border-emerald-600">
                        [+] ADD
                      </span>
                    ) : chunk.type === "removed" ? (
                      <span className="px-1 py-0.5 rounded bg-rose-900 text-[10px] font-bold text-rose-200 border border-rose-600">
                        [-] DEL
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-600 font-mono px-1">
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                      </span>
                    )}
                  </span>
                  <span className="flex-1 break-all">{chunk.content || " "}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
