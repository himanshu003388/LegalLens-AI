"use client";

import React, { useState } from "react";
import { LegalTermDefinition } from "@/lib/types/legal";
import { BookOpen, Search, AlertTriangle, Shield, CheckCircle, Tag } from "lucide-react";

export const GLOSSARY_TERMS: LegalTermDefinition[] = [
  {
    term: "Indemnification & Hold Harmless",
    category: "Liability & Indemnification",
    phoneticSpelling: "in-dem-nuh-fih-KAY-shun",
    formalDefinition:
      "A contractual agreement where one party promises to compensate or defend the other party for certain designated legal costs, damages, third-party lawsuits, or liabilities.",
    plainEnglishExplanation:
      "A legal promise to pay the other person's legal bills and damages if someone sues them because of something you did (or didn't do).",
    realWorldExample:
      "If a software developer uses a copyrighted image in a website they build for a client, an indemnification clause makes the developer pay the client's legal fees and any court judgments.",
    dangerLevel: "HIGH",
    whatToLookFor:
      "Watch out for unilateral (one-way) indemnification or agreements requiring you to pay for the other party's own negligence.",
  },
  {
    term: "Liquidated Damages",
    category: "Payment & Financial Obligations",
    phoneticSpelling: "LIK-wih-day-tid DAM-ih-jez",
    formalDefinition:
      "A predetermined, fixed sum specified in a contract that a party agrees to pay as compensation upon a breach, intended to estimate actual damages where losses are difficult to quantify.",
    plainEnglishExplanation:
      "A fixed penalty fee you must pay automatically if you break a specific rule in the contract, regardless of whether the other person actually lost that much money.",
    realWorldExample:
      "A commercial lease charging an automatic $10,000 penalty if a tenant moves out before the 3-year term expires.",
    dangerLevel: "HIGH",
    whatToLookFor:
      "Courts invalidate liquidated damages if they are purely punitive. Ensure the amount represents a reasonable pre-estimate of probable loss, not a punishment.",
  },
  {
    term: "Joint and Several Liability",
    category: "Liability & Indemnification",
    phoneticSpelling: "joint and SEV-er-ul ly-uh-BIL-ih-tee",
    formalDefinition:
      "A liability structure where two or more parties are each individually liable for the full amount of the relevant obligation or debt.",
    plainEnglishExplanation:
      "If you sign a contract with a partner or roommate, the landlord or creditor can collect 100% of the entire debt from YOU alone if the other person disappears or refuses to pay.",
    realWorldExample:
      "If three roommates sign an apartment lease with joint and several liability, and two fail to pay rent, the landlord can legally evict or sue the single paying roommate for the entire unpaid balance.",
    dangerLevel: "HIGH",
    whatToLookFor:
      "Avoid joint and several liability whenever possible; ask for 'several liability only' where you are only accountable for your own pro-rata share.",
  },
  {
    term: "Work Made For Hire (IP Assignment)",
    category: "Intellectual Property & Confidentiality",
    phoneticSpelling: "work meyd for hire",
    formalDefinition:
      "A statutory doctrine under copyright law whereby the employer or commissioning client is legally deemed the original author and exclusive owner of creative work product.",
    plainEnglishExplanation:
      "Anything you write, design, or code for the client immediately belongs to them forever. You have zero rights to reuse it, sell it, or showcase it without permission.",
    realWorldExample:
      "A freelance developer builds an admin dashboard using their own custom helper utility. Under a broad work-for-hire clause, the client now owns that utility, preventing the developer from using it for future clients.",
    dangerLevel: "MEDIUM",
    whatToLookFor:
      "Always include an explicit carve-out for 'Contractor Pre-Existing Background IP' to retain ownership of your developer tools and frameworks.",
  },
  {
    term: "Evergreen / Automatic Renewal",
    category: "Termination & Renewal",
    phoneticSpelling: "EV-er-green ree-NOO-ul",
    formalDefinition:
      "A clause providing that the contract term automatically rolls over into an identical or subsequent renewal period unless one party provides written notice of non-renewal prior to a strict cutoff date.",
    plainEnglishExplanation:
      "The contract renews automatically every year unless you remember to cancel it within a narrow window (e.g., between 60 and 90 days before it ends).",
    realWorldExample:
      "A business SaaS tool auto-renews for another 12 months at $1,200/month because the customer gave notice 29 days before expiration instead of 30 days.",
    dangerLevel: "MEDIUM",
    whatToLookFor:
      "Mark your calendar with calendar alerts 45 days ahead of any notice deadline. Negotiate for 30-day notice windows and written renewal reminder notices from the vendor.",
  },
  {
    term: "Force Majeure",
    category: "General & Miscellaneous",
    phoneticSpelling: "fors mah-ZHUR",
    formalDefinition:
      "A provision that frees parties from contractual obligation or liability when an extraordinary event or circumstance beyond their control (act of God, war, pandemic) prevents performance.",
    plainEnglishExplanation:
      "A clause that forgives you or the other party from fulfilling contract promises if an uncontrollable catastrophe occurs (like a hurricane, war, or government shutdown).",
    realWorldExample:
      "A wedding photographer cannot photograph a venue due to an emergency hurricane evacuation order.",
    dangerLevel: "LOW",
    whatToLookFor:
      "Check whether payment obligations are exempted from force majeure (usually contracts still require payment even during disasters).",
  },
  {
    term: "Severability",
    category: "General & Miscellaneous",
    phoneticSpelling: "sev-er-uh-BIL-ih-tee",
    formalDefinition:
      "A provision stating that if a court declares any specific clause of the agreement illegal or unenforceable, the remainder of the contract survives and remains in full legal force.",
    plainEnglishExplanation:
      "If a judge finds one rule in the contract illegal (like an excessive non-compete), they throw out only that one rule while the rest of the contract stays valid.",
    realWorldExample:
      "A judge strikes down an illegal 5-year non-compete clause, but the employee's non-disclosure obligations remain fully enforceable.",
    dangerLevel: "LOW",
    whatToLookFor:
      "Standard boiler-plate protection present in almost all modern commercial contracts.",
  },
];

export default function LegalGlossary() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const filteredTerms = GLOSSARY_TERMS.filter((item) => {
    const matchesSearch =
      item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.plainEnglishExplanation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.formalDefinition.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "ALL" || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const categories = ["ALL", ...Array.from(new Set(GLOSSARY_TERMS.map((t) => t.category)))];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-serif">
              Plain-English Legal Terminology Glossary
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Demystify complex legal terms, dangerous provisions, and hidden traps in contracts.
            </p>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search legal terms (e.g., 'Indemnification', 'Severability')..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "ALL" ? "All Categories" : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Terms List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredTerms.map((t) => (
          <div
            key={t.term}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-serif">
                    {t.term}
                  </h3>
                  {t.phoneticSpelling && (
                    <span className="text-[11px] text-slate-400 italic">
                      ({t.phoneticSpelling})
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                  {t.category}
                </span>
              </div>

              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full self-start sm:self-auto ${
                  t.dangerLevel === "HIGH"
                    ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                    : t.dangerLevel === "MEDIUM"
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                }`}
              >
                {t.dangerLevel} Risk Term
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Plain English */}
              <div className="bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 rounded-xl p-4">
                <h4 className="font-bold text-purple-900 dark:text-purple-300 mb-1">
                  Plain-English (8th-Grade Translation):
                </h4>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {t.plainEnglishExplanation}
                </p>
              </div>

              {/* Real World Example */}
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">
                  Real-World Practical Example:
                </h4>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed italic">
                  &ldquo;{t.realWorldExample}&rdquo;
                </p>
              </div>
            </div>

            {/* What to look for */}
            <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl p-3.5 flex items-start gap-2.5 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-900 dark:text-amber-200">
                  What to Watch Out For in Contracts:{" "}
                </span>
                <span className="text-amber-800 dark:text-amber-300">
                  {t.whatToLookFor}
                </span>
              </div>
            </div>
          </div>
        ))}

        {filteredTerms.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-xs">
            No matching legal terms found for &quot;{searchTerm}&quot;.
          </div>
        )}
      </div>
    </div>
  );
}
