"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Scale, FileText, GitCompare, Briefcase } from "lucide-react";
import { getStoredApiKey, getStoredProvider } from "@/lib/security/client-keys";
import { useAnalysis } from "@/context/AnalysisContext";
import ApiKeyModal from "./header/ApiKeyModal";
import KeyboardShortcutsModal from "./header/KeyboardShortcutsModal";
import A11yControls from "./header/A11yControls";

interface HeaderProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export default function Header({ activeTab, onTabChange }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    highContrastMode,
    setHighContrastMode,
    fontSizeScale,
    setFontSizeScale,
  } = useAnalysis();

  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState("");
  const [activeEngineLabel, setActiveEngineLabel] = useState("Hybrid Local (Zero-Key)");
  const [hasActiveKey, setHasActiveKey] = useState(false);

  const isCompare = pathname === "/compare";
  const isPrepKit = pathname === "/prep-kit";

  const updateEngineLabel = useCallback(() => {
    const key = getStoredApiKey();
    const provider = getStoredProvider();

    if (!key) {
      setActiveEngineLabel("Hybrid Local (Zero-Key)");
      setHasActiveKey(false);
      return;
    }

    setHasActiveKey(true);
    if (provider === "gemini" || key.startsWith("AIza")) {
      setActiveEngineLabel("Google Gemini 1.5 Flash");
    } else if (provider === "openai" || key.startsWith("sk-proj-") || key.startsWith("sk-")) {
      setActiveEngineLabel("OpenAI GPT-4o");
    } else if (provider === "anthropic" || key.startsWith("sk-ant-")) {
      setActiveEngineLabel("Claude 3.5 Sonnet");
    } else {
      setActiveEngineLabel("Custom API Key");
    }
  }, []);

  const toggleContrast = useCallback(() => {
    const next = !highContrastMode;
    setHighContrastMode(next);
    setLiveAnnouncement(next ? "High contrast mode enabled" : "High contrast mode disabled");
  }, [highContrastMode, setHighContrastMode]);

  const cycleFontSize = useCallback(() => {
    const nextScale =
      fontSizeScale === "normal"
        ? "large"
        : fontSizeScale === "large"
        ? "xlarge"
        : "normal";
    setFontSizeScale(nextScale);
    setLiveAnnouncement(`Text scale set to ${nextScale}`);
  }, [fontSizeScale, setFontSizeScale]);

  useEffect(() => {
    updateEngineLabel();
    window.addEventListener("storage", updateEngineLabel);
    return () => window.removeEventListener("storage", updateEngineLabel);
  }, [updateEngineLabel]);

  // Global Keyboard Shortcuts Matrix
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      // Ignore when typing in form fields
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      // Alt + 1: Document Studio
      if (e.altKey && e.key === "1") {
        e.preventDefault();
        router.push("/");
        setLiveAnnouncement("Navigated to Document Studio");
      }
      // Alt + 2: Compare Contracts
      else if (e.altKey && e.key === "2") {
        e.preventDefault();
        router.push("/compare");
        setLiveAnnouncement("Navigated to Contract Comparison");
      }
      // Alt + 3: Lawyer Prep Kit
      else if (e.altKey && e.key === "3") {
        e.preventDefault();
        router.push("/prep-kit");
        setLiveAnnouncement("Navigated to Lawyer Prep Kit");
      }
      // Alt + K: Engine Configuration
      else if (e.altKey && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setShowKeyModal(true);
      }
      // Alt + C: High Contrast Toggle
      else if (e.altKey && (e.key === "c" || e.key === "C")) {
        e.preventDefault();
        toggleContrast();
      }
      // Alt + F: Font Size Cycle
      else if (e.altKey && (e.key === "f" || e.key === "F")) {
        e.preventDefault();
        cycleFontSize();
      }
      // ?: Keyboard Shortcuts Dialog
      else if (e.key === "?" && !e.altKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setShowShortcutsModal(true);
      }
    };

    const handleOpenKeyModal = () => setShowKeyModal(true);

    window.addEventListener("keydown", handleGlobalShortcuts);
    window.addEventListener("open-key-modal", handleOpenKeyModal);

    return () => {
      window.removeEventListener("keydown", handleGlobalShortcuts);
      window.removeEventListener("open-key-modal", handleOpenKeyModal);
    };
  }, [router, toggleContrast, cycleFontSize]);

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

            {/* Right-side status & Accessibility Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Active Engine Badge */}
              <button
                type="button"
                onClick={() => setShowKeyModal(true)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs transition cursor-pointer ${
                  hasActiveKey
                    ? "bg-cyan-950/60 border-cyan-700/60 text-cyan-200 hover:bg-cyan-900/60"
                    : "bg-slate-800/90 border-slate-700 text-slate-300 hover:bg-slate-700/80"
                }`}
                title="Click to configure Google Gemini / OpenAI / Anthropic API Key (Alt+K)"
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

              {/* Accessibility & Cheatsheet Controls */}
              <A11yControls
                highContrastMode={highContrastMode}
                fontSizeScale={fontSizeScale}
                onToggleContrast={toggleContrast}
                onCycleFontSize={cycleFontSize}
                onOpenShortcuts={() => setShowShortcutsModal(true)}
              />
            </div>
          </div>
        </div>

        {/* Screen Reader Live Status Announcer */}
        <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {liveAnnouncement}
        </div>
      </header>

      {/* Modular Modals */}
      <ApiKeyModal
        isOpen={showKeyModal}
        onClose={() => setShowKeyModal(false)}
        onKeyUpdated={updateEngineLabel}
      />

      <KeyboardShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />
    </>
  );
}
