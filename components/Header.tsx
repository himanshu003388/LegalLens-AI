"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Scale,
  FileText,
  GitCompare,
  Briefcase,
  Key,
  Shield,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Trash2,
} from "lucide-react";
import {
  getStoredApiKey,
  getStoredProvider,
  setStoredApiKey,
  clearStoredApiKey,
  SupportedProvider,
} from "@/lib/security/client-keys";

interface HeaderProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export default function Header({ activeTab, onTabChange }: HeaderProps) {
  const pathname = usePathname();
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [customKey, setCustomKey] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<SupportedProvider>("gemini");
  const [saveStatus, setSaveStatus] = useState("");
  const [testStatus, setTestStatus] = useState<{
    type: "idle" | "testing" | "success" | "error";
    message: string;
  }>({ type: "idle", message: "" });
  const [activeEngineLabel, setActiveEngineLabel] = useState("Hybrid Local (Zero-Key)");

  const isCompare = pathname === "/compare";
  const isPrepKit = pathname === "/prep-kit";

  // Synchronize on mount and storage events
  const updateEngineLabel = () => {
    const key = getStoredApiKey();
    const provider = getStoredProvider();

    if (!key) {
      setActiveEngineLabel("Hybrid Local (Zero-Key)");
      return;
    }

    if (provider === "gemini" || key.startsWith("AIza")) {
      setActiveEngineLabel("Google Gemini 1.5 Flash");
    } else if (provider === "openai" || key.startsWith("sk-proj-") || key.startsWith("sk-")) {
      setActiveEngineLabel("OpenAI GPT-4o");
    } else if (provider === "anthropic" || key.startsWith("sk-ant-")) {
      setActiveEngineLabel("Claude 3.5 Sonnet");
    } else {
      setActiveEngineLabel("Custom AI Provider");
    }
  };

  useEffect(() => {
    const key = getStoredApiKey();
    const prov = getStoredProvider();
    setCustomKey(key);
    setSelectedProvider(prov);
    updateEngineLabel();

    const handleStorageChange = () => {
      updateEngineLabel();
    };

    const handleOpenModal = () => {
      setShowKeyModal(true);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("open-key-modal", handleOpenModal);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("open-key-modal", handleOpenModal);
    };
  }, []);

  // Auto-detect provider when user types or pastes key
  const handleKeyChange = (val: string) => {
    setCustomKey(val);
    const trimmed = val.trim();
    if (trimmed.startsWith("AIza")) {
      setSelectedProvider("gemini");
    } else if (trimmed.startsWith("sk-ant-")) {
      setSelectedProvider("anthropic");
    } else if (trimmed.startsWith("sk-")) {
      setSelectedProvider("openai");
    }
  };

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (customKey.trim()) {
      setStoredApiKey(customKey.trim(), selectedProvider);
      setSaveStatus("API key saved for this session!");
    } else {
      clearStoredApiKey();
      setSaveStatus("Reset to Zero-Key Local Engine!");
    }
    updateEngineLabel();

    setTimeout(() => {
      setShowKeyModal(false);
      setSaveStatus("");
      setTestStatus({ type: "idle", message: "" });
    }, 1000);
  };

  const handleClearKey = () => {
    clearStoredApiKey();
    setCustomKey("");
    setSelectedProvider("gemini");
    updateEngineLabel();
    setSaveStatus("Key cleared. Operating in Zero-Key Local Mode.");
    setTimeout(() => {
      setSaveStatus("");
      setTestStatus({ type: "idle", message: "" });
    }, 1500);
  };

  const handleTestKey = async () => {
    if (!customKey.trim()) {
      setTestStatus({
        type: "error",
        message: "Please enter an API key to test.",
      });
      return;
    }

    setTestStatus({ type: "testing", message: "Verifying API key connection..." });

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: "connectivity-check.txt",
          text: "1. Term and Termination: This agreement shall terminate upon 30 days notice.",
          anonymizePII: true,
          apiKey: customKey.trim(),
          provider: selectedProvider,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestStatus({
          type: "success",
          message: `Connected successfully to ${selectedProvider === "gemini" ? "Google Gemini 1.5 Flash" : selectedProvider.toUpperCase()}!`,
        });
      } else {
        setTestStatus({
          type: "error",
          message: data.error || "Verification failed. Check your API key.",
        });
      }
    } catch {
      setTestStatus({
        type: "error",
        message: "Failed to connect to API endpoint. Check internet connection.",
      });
    }
  };

  const hasActiveKey = !!customKey.trim();

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
                    LegalLens{" "}
                    <span className="text-amber-400 font-sans text-xs uppercase px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-700/60 font-semibold tracking-wider">
                      AI
                    </span>
                  </span>
                  <p className="text-[11px] text-slate-400 leading-none">
                    Document Intelligence & Access
                  </p>
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
                <span>Compare Contracts</span>
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
              {/* Active Engine Badge */}
              <button
                type="button"
                onClick={() => setShowKeyModal(true)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs transition cursor-pointer ${
                  selectedProvider === "gemini" && hasActiveKey
                    ? "bg-cyan-950/60 border-cyan-700/60 text-cyan-200 hover:bg-cyan-900/60"
                    : hasActiveKey
                    ? "bg-emerald-950/60 border-emerald-700/60 text-emerald-200 hover:bg-emerald-900/60"
                    : "bg-slate-800/90 border-slate-700 text-slate-300 hover:bg-slate-700/80"
                }`}
                title="Click to configure Google Gemini / OpenAI / Anthropic API Key"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    hasActiveKey ? "bg-cyan-400 animate-pulse" : "bg-emerald-400"
                  }`}
                  aria-hidden="true"
                />
                <span className="hidden sm:inline text-slate-400 font-normal">Engine:</span>
                <strong className="font-semibold">{activeEngineLabel}</strong>
              </button>

              {/* Key Settings Button */}
              <button
                type="button"
                onClick={() => setShowKeyModal(true)}
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-legal-400 transition"
                aria-label="API Key Settings"
                title="Configure Gemini, OpenAI, or Anthropic Key"
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
        >
          <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative space-y-5">
            {/* Modal Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 id="modal-title" className="text-lg font-bold text-white">
                  GenAI Model Configuration
                </h2>
                <p className="text-xs text-slate-400">
                  Connect Google Gemini, OpenAI, or Anthropic for live streaming AI
                </p>
              </div>
            </div>

            {/* Provider Switcher */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Select Active GenAI Provider:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedProvider("gemini")}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition ${
                    selectedProvider === "gemini"
                      ? "bg-cyan-950/80 border-cyan-500 text-cyan-200 ring-1 ring-cyan-500 shadow-sm"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  <span className="font-bold text-sm">Google Gemini</span>
                  <span className="text-[10px] text-cyan-400 font-normal">Recommended (Free)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedProvider("openai")}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition ${
                    selectedProvider === "openai"
                      ? "bg-emerald-950/80 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500 shadow-sm"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  <span className="font-bold text-sm">OpenAI</span>
                  <span className="text-[10px] text-emerald-400 font-normal">GPT-4o / Mini</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedProvider("anthropic")}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition ${
                    selectedProvider === "anthropic"
                      ? "bg-amber-950/80 border-amber-500 text-amber-200 ring-1 ring-amber-500 shadow-sm"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  <span className="font-bold text-sm">Anthropic</span>
                  <span className="text-[10px] text-amber-400 font-normal">Claude 3.5</span>
                </button>
              </div>
            </div>

            {/* Free Gemini Key Helper Banner */}
            {selectedProvider === "gemini" && (
              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/60 flex items-start gap-2.5 text-xs text-cyan-200">
                <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-cyan-100">Free Google Gemini API Key Available:</p>
                  <p className="text-cyan-300/80 mt-0.5">
                    Google provides free Gemini API access for developers. You can generate a free key in 30 seconds at Google AI Studio.
                  </p>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-cyan-300 font-bold hover:underline mt-1.5"
                  >
                    <span>Get Free Gemini Key at Google AI Studio</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            {/* API Key Form */}
            <form onSubmit={handleSaveKey} className="space-y-4">
              <div>
                <label
                  htmlFor="apiKeyInput"
                  className="block text-xs font-semibold uppercase text-slate-400 mb-1.5"
                >
                  {selectedProvider === "gemini"
                    ? "Google Gemini API Key"
                    : selectedProvider === "openai"
                    ? "OpenAI API Key"
                    : "Anthropic API Key"}
                </label>
                <input
                  id="apiKeyInput"
                  type="password"
                  value={customKey}
                  onChange={(e) => handleKeyChange(e.target.value)}
                  placeholder={
                    selectedProvider === "gemini"
                      ? "AIzaSy..."
                      : selectedProvider === "openai"
                      ? "sk-..."
                      : "sk-ant-..."
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-slate-600 font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Keys are processed purely in-memory and never permanently stored on disk.
                </p>
              </div>

              {/* Status feedback */}
              {saveStatus && (
                <p className="text-xs text-emerald-400 font-medium flex items-center gap-1.5 p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/60">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{saveStatus}</span>
                </p>
              )}

              {testStatus.message && (
                <div
                  className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                    testStatus.type === "success"
                      ? "bg-emerald-950/40 border-emerald-800 text-emerald-300"
                      : testStatus.type === "error"
                      ? "bg-rose-950/40 border-rose-800 text-rose-300"
                      : "bg-slate-800 border-slate-700 text-slate-300"
                  }`}
                >
                  {testStatus.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : testStatus.type === "error" ? (
                    <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  ) : (
                    <span className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                  )}
                  <span>{testStatus.message}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  {hasActiveKey && (
                    <button
                      type="button"
                      onClick={handleClearKey}
                      className="px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-950/40 border border-rose-900/60 transition flex items-center gap-1.5"
                      title="Clear key and revert to Zero-Key mode"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear Key</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleTestKey}
                    disabled={!customKey.trim() || testStatus.type === "testing"}
                    className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition disabled:opacity-50"
                  >
                    Test Connection
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowKeyModal(false)}
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm text-slate-400 hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-legal-600 hover:bg-legal-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition shadow-md"
                  >
                    Save & Activate
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
