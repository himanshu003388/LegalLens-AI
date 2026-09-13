"use client";

import React from "react";
import { AlertTriangle, ShieldCheck } from "lucide-react";

/**
 * Permanent, high-contrast disclaimer banner ensuring ethical AI compliance.
 * WCAG 2.1 AA compliant text contrast (>4.5:1 ratio).
 */
export default function DisclaimerBanner() {
  return (
    <aside
      aria-label="Legal Disclaimer"
      className="bg-amber-900/90 text-amber-50 border-b border-amber-700 px-4 py-2.5 text-xs sm:text-sm font-medium transition-colors"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <AlertTriangle
            className="w-4 h-4 text-amber-300 flex-shrink-0"
            aria-hidden="true"
          />
          <p>
            <strong className="font-semibold text-amber-200">
              NOT LEGAL ADVICE:
            </strong>{" "}
            LegalLens AI provides automated document intelligence and informational assistance only. It is not a law firm, does not provide legal representation, and is designed to help you prepare before consulting a licensed attorney.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-1.5 text-amber-200 text-xs flex-shrink-0 bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-700/50">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
          <span>Zero-Retention Ephemeral Processing</span>
        </div>
      </div>
    </aside>
  );
}
