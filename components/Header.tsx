"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Scale, FileText, GitCompare, Briefcase, Key, Shield, Sparkles } from "lucide-react";

interface HeaderProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export default function Header({ activeTab, onTabChange }: HeaderProps) {
  const pathname = usePathname();
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [customKey, setCustomKey] = useState("");
  const [saveStatus, setSaveStatus] = useState("");

  const isCompare = pathname === "/compare";
  const isPrepKit = pathname === "/prep-kit";

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      sessionStorage.setItem("legallens_user_key", customKey);
      setSaveStatus("API key saved for this session!");
      setTimeout(() => {
        setShowKeyModal(false);
        setSaveStatus("");
      }, 1200);
    }
  };

  return (
    <>
      <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-legal-400 rounded-lg p-1"
                aria-label="LegalLens AI Home"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-legal-800 to-legal-600 flex items-center justify-center text-white shadow-md border border-legal-400/20">
                  <Scale className="w-5 h-5 text-amber-300" aria-hidden="true" />
                </div>
                <div>
                  <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5 font-serif">
                    LegalLens <span className="text-amber-400 font-sans text-xs uppercase px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-700/60 font-semibold tracking-wider">AI</span>
                  </span>
                  <p className="text-[11px] text-slate-400 leading-none">Document Intelligence & Access</p>
                </div>
              </Link>
            </div>

            {/* Navigation links */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
              <Link
                href="/"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  pathname === "/"
                    ? "bg-legal-800 text-white shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                <FileText className="w-4 h-4" aria-hidden="true" />
                <span>Document Studio</span>
              </Link>

              <Link
                href="/compare"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  isCompare
                    ? "bg-legal-800 text-white shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                <GitCompare className="w-4 h-4" aria-hidden="true" />
                <span>Compare Contracts (Redline)</span>
              </Link>

              <Link
                href="/prep-kit"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  isPrepKit
                    ? "bg-legal-800 text-white shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Briefcase className="w-4 h-4" aria-hidden="true" />
                <span>Lawyer Prep Kit</span>
              </Link>
            </nav>

            {/* Right-side status & Settings */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true"></span>
                <span className="hidden sm:inline">Engine:</span>
                <strong className="text-slate-100 font-medium">Hybrid GenAI</strong>
              </div>

              <button
                type="button"
                onClick={() => setShowKeyModal(true)}
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-legal-400 transition"
                aria-label="API Key Settings"
                title="Configure OpenAI / Anthropic Key"
              >
                <Key className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Modal for API Key configuration */}
      {showKeyModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
        >
          <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h2 id="modal-title" className="text-lg font-bold text-white">
                  GenAI Model Configuration
                </h2>
                <p className="text-xs text-slate-400">Zero-Key mode runs automatically by default</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 mb-4 leading-relaxed">
              LegalLens AI is completely functional out-of-the-box using its built-in deterministic Legal Intelligence Engine. Optionally, you can connect your OpenAI or Anthropic API key here for live LLM completions.
            </p>

            <form onSubmit={handleSaveKey}>
              <div className="mb-4">
                <label htmlFor="apiKeyInput" className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                  OpenAI or Anthropic API Key
                </label>
                <input
                  id="apiKeyInput"
                  type="password"
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  placeholder="sk-... or sk-ant-..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-legal-500 placeholder-slate-500"
                />
              </div>

              {saveStatus && (
                <p className="text-xs text-emerald-400 font-medium mb-3 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  {saveStatus}
                </p>
              )}

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="px-4 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-legal-600 hover:bg-legal-500 text-white rounded-lg text-sm font-medium transition shadow-md"
                >
                  Save Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
