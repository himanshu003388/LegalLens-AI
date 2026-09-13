import React from "react";
import Link from "next/link";
import { FileQuestion, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[500px] flex items-center justify-center p-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 max-w-md w-full text-center shadow-lg space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto border border-amber-100 dark:border-amber-900">
          <FileQuestion className="w-8 h-8" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">404 Error</span>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-serif">
            Page Not Found
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            The legal view or document endpoint you requested could not be located.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-legal-600 hover:bg-legal-500 text-white rounded-xl text-sm font-semibold transition shadow-sm w-full"
        >
          <Home className="w-4 h-4" />
          <span>Return to Document Studio</span>
        </Link>
      </div>
    </div>
  );
}
