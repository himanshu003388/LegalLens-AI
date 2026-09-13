"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, FileText, Shield, CheckCircle2, Sparkles, AlertCircle } from "lucide-react";

interface DocumentUploaderProps {
  onDocumentLoaded: (fileName: string, text: string, anonymizePII: boolean) => void;
  isLoading: boolean;
}

export default function DocumentUploader({
  onDocumentLoaded,
  isLoading,
}: DocumentUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [anonymizePII, setAnonymizePII] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setErrorMessage("");

    try {
      const text = await file.text();
      if (!text || text.trim().length < 10) {
        setErrorMessage("Uploaded file appears to be empty or contains unreadable text.");
        return;
      }
      onDocumentLoaded(file.name, text, anonymizePII);
    } catch (err: any) {
      setErrorMessage("Failed to read document file. Please upload a plain text or markdown file.");
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // 1-Click sample contract loaders
  const loadSample = async (sampleName: string, title: string) => {
    setErrorMessage("");
    try {
      const response = await fetch(`/samples/${sampleName}`);
      if (!response.ok) {
        throw new Error("Sample file not found");
      }
      const text = await response.text();
      onDocumentLoaded(title, text, anonymizePII);
    } catch (e) {
      setErrorMessage("Could not load sample file.");
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-serif">
            Upload Legal Document
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Upload any contract, lease, policy, or agreement for plain-English breakdown and risk scoring.
          </p>
        </div>

        {/* PII Redaction toggle */}
        <label className="flex items-center gap-2 cursor-pointer select-none bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
          <input
            type="checkbox"
            checked={anonymizePII}
            onChange={(e) => setAnonymizePII(e.target.checked)}
            className="w-4 h-4 text-legal-600 rounded border-slate-300 focus:ring-legal-500"
          />
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Redact PII (SSN, Phone, Email)</span>
          </div>
        </label>
      </div>

      {/* Drag & Drop Box */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
          dragActive
            ? "border-legal-500 bg-legal-50/50 dark:bg-legal-950/20"
            : "border-slate-300 dark:border-slate-700 hover:border-legal-400 dark:hover:border-legal-500 hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
        } ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
        role="button"
        tabIndex={0}
        aria-label="Upload document area"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            fileInputRef.current?.click();
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md,.pdf,.docx"
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          aria-hidden="true"
        />

        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-legal-50 dark:bg-legal-950/60 text-legal-600 dark:text-legal-400 flex items-center justify-center mb-4 shadow-sm border border-legal-100 dark:border-legal-800">
            <UploadCloud className="w-7 h-7" aria-hidden="true" />
          </div>

          <p className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">
            Drag & drop your document here, or <span className="text-legal-600 dark:text-legal-400 underline underline-offset-2">browse</span>
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Supports PDF, DOCX, TXT, and MD contracts up to 10MB
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="mt-4 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 1-Click Quick Sample Pickers */}
      <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Or test immediately with a curated legal sample:</span>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => loadSample("residential-lease.txt", "Residential Lease Agreement (Illinois)")}
            disabled={isLoading}
            className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-legal-400 dark:hover:border-legal-500 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-left transition group"
          >
            <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 group-hover:bg-rose-100 transition">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Residential Lease</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">High-risk auto-renew & deposit</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => loadSample("mutual-nda.txt", "Mutual Non-Disclosure Agreement")}
            disabled={isLoading}
            className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-legal-400 dark:hover:border-legal-500 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-left transition group"
          >
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 transition">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Mutual NDA</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Confidentiality & survival</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => loadSample("saas-agreement-v1.txt", "Master SaaS Services Agreement")}
            disabled={isLoading}
            className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-legal-400 dark:hover:border-legal-500 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-left transition group"
          >
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-100 transition">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">SaaS Services Agreement</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Liability cap & Net 30 fees</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
