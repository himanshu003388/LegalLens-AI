"use client";

import React from "react";
import { MissingClauseWarning } from "@/lib/types/legal";
import { AlertOctagon, AlertTriangle, ShieldAlert, CheckCircle, ArrowRight } from "lucide-react";

interface RiskRadarProps {
  keyRisks: {
    high: number;
    medium: number;
    low: number;
    summary: string;
  };
  missingClauses: MissingClauseWarning[];
  onSelectClauseCategory?: (category: string) => void;
}

export default function RiskRadar({
  keyRisks,
  missingClauses,
  onSelectClauseCategory,
}: RiskRadarProps) {
  const totalClauses = keyRisks.high + keyRisks.medium + keyRisks.low;
  const highPct = totalClauses > 0 ? (keyRisks.high / totalClauses) * 100 : 0;
  const medPct = totalClauses > 0 ? (keyRisks.medium / totalClauses) * 100 : 0;
  const lowPct = totalClauses > 0 ? (keyRisks.low / totalClauses) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Risk Distribution Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-serif">
              Contract Risk Radar & Exposure Breakdown
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Severity distribution across extracted operational commitments
            </p>
          </div>
        </div>

        {/* Multi-segment Risk Bar */}
        <div className="w-full h-4 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex mb-4">
          <div
            style={{ width: `${highPct}%` }}
            className="bg-rose-500 transition-all duration-500"
            title={`High Risk: ${keyRisks.high}`}
          />
          <div
            style={{ width: `${medPct}%` }}
            className="bg-amber-500 transition-all duration-500"
            title={`Medium Risk: ${keyRisks.medium}`}
          />
          <div
            style={{ width: `${lowPct}%` }}
            className="bg-emerald-500 transition-all duration-500"
            title={`Standard/Low Risk: ${keyRisks.low}`}
          />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40">
            <span className="w-3 h-3 rounded-full bg-rose-500 flex-shrink-0" />
            <div className="text-xs">
              <strong className="text-slate-900 dark:text-slate-100">High Risk ({keyRisks.high})</strong>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">Uncapped liability, auto-renewals</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40">
            <span className="w-3 h-3 rounded-full bg-amber-500 flex-shrink-0" />
            <div className="text-xs">
              <strong className="text-slate-900 dark:text-slate-100">Medium Risk ({keyRisks.medium})</strong>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">Notice windows, late fee rules</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
            <span className="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0" />
            <div className="text-xs">
              <strong className="text-slate-900 dark:text-slate-100">Standard / Low ({keyRisks.low})</strong>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">Customary boilerplate terms</p>
            </div>
          </div>
        </div>
      </div>

      {/* Missing Clauses Detection */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-serif">
              Missing Critical Clauses & Omissions
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Standard legal protections that were not found in this document
            </p>
          </div>
        </div>

        {missingClauses.length === 0 ? (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>No critical omitted clauses identified. Standard baseline protections are present.</span>
          </div>
        ) : (
          <div className="space-y-3">
            {missingClauses.map((missing, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100">
                      {missing.severity} Risk Omission
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {missing.clauseName}
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Category: {missing.category}
                  </span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 mb-2">
                  <strong className="text-slate-900 dark:text-slate-100">Why it matters:</strong> {missing.whyItMatters}
                </p>

                <div className="flex items-start gap-1.5 text-xs text-legal-700 dark:text-legal-300 bg-legal-50/70 dark:bg-legal-950/40 p-2.5 rounded-lg border border-legal-100 dark:border-legal-900">
                  <ArrowRight className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <p>
                    <strong className="font-semibold">Recommended Negotiation Fix:</strong> {missing.recommendedAction}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
