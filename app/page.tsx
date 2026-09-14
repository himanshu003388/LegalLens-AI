"use client";

import React, { useState } from "react";
import DocumentUploader from "@/components/DocumentUploader";
import AnalysisOverview from "@/components/AnalysisOverview";
import RiskRadar from "@/components/RiskRadar";
import ClauseList from "@/components/ClauseList";
import ChatPanel from "@/components/ChatPanel";
import ActionChecklist from "@/components/ActionChecklist";
import LawyerPrepKit from "@/components/LawyerPrepKit";
import ScenarioSimulator from "@/components/ScenarioSimulator";
import LegalGlossary from "@/components/LegalGlossary";
import { DocumentAnalysis } from "@/lib/types/legal";
import {
  FileText,
  ShieldAlert,
  MessageSquare,
  CheckSquare,
  Briefcase,
  RefreshCw,
  AlertCircle,
  Compass,
  BookOpen,
} from "lucide-react";
import { getStoredApiKey, getStoredProvider, getApiKeyHeaders } from "@/lib/security/client-keys";
import { useAnalysis } from "@/context/AnalysisContext";

export default function HomePage() {
  const {
    analysis,
    setAnalysis,
    currentText,
    setCurrentText,
    currentFileName,
    setCurrentFileName,
    resetAnalysis,
  } = useAnalysis();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<
    "summary" | "clauses" | "simulator" | "glossary" | "chat" | "checklist" | "prepkit"
  >("summary");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleDocumentLoaded = async (fileName: string, text: string, anonymizePII: boolean) => {
    setCurrentFileName(fileName);
    setCurrentText(text);
    setIsLoading(true);
    setErrorMessage("");

    try {
      const apiKey = getStoredApiKey() || undefined;
      const provider = getStoredProvider() || undefined;

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getApiKeyHeaders(),
        },
        body: JSON.stringify({
          fileName,
          text,
          anonymizePII,
          apiKey,
          provider,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze document");
      }

      setAnalysis(data.analysis);
      setActiveTab("summary");
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || "Failed to analyze legal document. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    resetAnalysis();
    setErrorMessage("");
  };

  return (
    <div className="space-y-8">
      {/* Page Title & Hero */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-serif tracking-tight">
            Legal Document Intelligence Studio
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Demystify contracts, understand obligations, detect hidden risks, and prepare for legal counsel.
          </p>
        </div>

        {analysis && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Analyze Another Document</span>
          </button>
        )}
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl flex items-center gap-3 text-sm text-rose-800 dark:text-rose-200">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />
          <p>{errorMessage}</p>
        </div>
      )}

      {/* Upload Box (visible when no analysis active) */}
      {!analysis && (
        <DocumentUploader
          onDocumentLoaded={handleDocumentLoaded}
          isLoading={isLoading}
        />
      )}

      {/* Loading state indicator */}
      {isLoading && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm space-y-4 animate-pulse">
          <div className="w-12 h-12 rounded-full border-4 border-legal-600 border-t-transparent animate-spin mx-auto" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-serif">
            Analyzing Legal Document...
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Extracting clauses, evaluating liability caps, calculating reading ease scores, and preparing plain-English summaries.
          </p>
        </div>
      )}

      {/* Main Studio View when Analysis is ready */}
      {analysis && !isLoading && (
        <div className="space-y-6">
          {/* Document Title Banner */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-legal-100 dark:bg-legal-950 text-legal-700 dark:text-legal-300">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Active Document
                </span>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {analysis.fileName}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 font-medium">
                {analysis.wordCount.toLocaleString()} words
              </span>
              <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 font-medium">
                {analysis.clauses.length} extracted clauses
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div
            className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800"
            role="tablist"
            aria-label="Document Studio Tabs"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "summary"}
              onClick={() => setActiveTab("summary")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
                activeTab === "summary"
                  ? "bg-legal-600 text-white shadow-sm"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Plain-English Summary</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "clauses"}
              onClick={() => setActiveTab("clauses")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
                activeTab === "clauses"
                  ? "bg-legal-600 text-white shadow-sm"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Clauses & Risk Radar ({analysis.keyRisks.high} High)</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "simulator"}
              onClick={() => setActiveTab("simulator")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
                activeTab === "simulator"
                  ? "bg-legal-600 text-white shadow-sm"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>&quot;What-If&quot; Simulator</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "glossary"}
              onClick={() => setActiveTab("glossary")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
                activeTab === "glossary"
                  ? "bg-legal-600 text-white shadow-sm"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Legal Glossary</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "chat"}
              onClick={() => setActiveTab("chat")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
                activeTab === "chat"
                  ? "bg-legal-600 text-white shadow-sm"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Cited Q&A Assistant</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "checklist"}
              onClick={() => setActiveTab("checklist")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
                activeTab === "checklist"
                  ? "bg-legal-600 text-white shadow-sm"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Action Checklist</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "prepkit"}
              onClick={() => setActiveTab("prepkit")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
                activeTab === "prepkit"
                  ? "bg-legal-600 text-white shadow-sm"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Lawyer Prep Kit</span>
            </button>
          </div>

          {/* Active Tab Content */}
          <div>
            {activeTab === "summary" && <AnalysisOverview analysis={analysis} />}

            {activeTab === "clauses" && (
              <div className="space-y-8">
                <RiskRadar
                  keyRisks={analysis.keyRisks}
                  missingClauses={analysis.missingClauses}
                />
                <ClauseList clauses={analysis.clauses} />
              </div>
            )}

            {activeTab === "simulator" && (
              <ScenarioSimulator
                analysis={analysis}
                documentText={currentText}
              />
            )}

            {activeTab === "glossary" && <LegalGlossary />}

            {activeTab === "chat" && (
              <ChatPanel
                documentText={currentText}
                documentTitle={analysis.fileName}
              />
            )}

            {activeTab === "checklist" && (
              <ActionChecklist initialItems={analysis.checklist} />
            )}

            {activeTab === "prepkit" && (
              <LawyerPrepKit
                data={analysis.lawyerPrepKit}
                documentTitle={analysis.fileName}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
