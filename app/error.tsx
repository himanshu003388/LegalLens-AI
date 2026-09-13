"use client";

import React, { useEffect } from "react";
import { AlertOctagon, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("LegalLens runtime error:", error);
  }, [error]);

  return (
    <div className="min-h-[500px] flex items-center justify-center p-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 max-w-lg w-full text-center shadow-lg space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-100 dark:border-rose-900">
          <AlertOctagon className="w-8 h-8" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-serif">
            Something went wrong
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            LegalLens AI encountered an unexpected error while processing this view. Your session data remains safe.
          </p>
          {error?.message && (
            <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl text-xs font-mono text-slate-700 dark:text-slate-300 text-left overflow-x-auto border border-slate-200 dark:border-slate-700">
              {error.message}
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="flex items-center gap-2 px-5 py-2.5 bg-legal-600 hover:bg-legal-500 text-white rounded-xl text-sm font-semibold transition shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold transition border border-slate-200 dark:border-slate-700"
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
