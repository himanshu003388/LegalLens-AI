import React from "react";

export default function Loading() {
  return (
    <div
      className="space-y-6 animate-pulse max-w-7xl mx-auto p-4 sm:p-6"
      aria-label="Loading content..."
      role="status"
    >
      <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/3" />
      <div className="h-4 bg-slate-100 dark:bg-slate-800/60 rounded-lg w-1/2" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-32 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 p-4"
          />
        ))}
      </div>

      <div className="h-96 bg-slate-100 dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-800 p-8" />
      <span className="sr-only">Loading LegalLens document studio...</span>
    </div>
  );
}
