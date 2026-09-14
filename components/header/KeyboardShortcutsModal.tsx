"use client";

import React, { useEffect, useRef } from "react";
import { Keyboard } from "lucide-react";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => closeBtnRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Focus trap and Escape handler
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "Tab" && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          last.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 id="shortcuts-title" className="text-base font-bold font-serif text-white">
                Accessibility & Keyboard Shortcuts
              </h3>
              <p className="text-xs text-slate-400">Quick navigation & compliance controls</p>
            </div>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm px-2 py-1 rounded-lg hover:bg-slate-800"
            aria-label="Close shortcuts dialog"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
            <span className="text-slate-300">Document Studio (Analysis)</span>
            <kbd className="px-2 py-0.5 rounded bg-slate-700 font-mono text-[11px] text-amber-300 border border-slate-600">Alt + 1</kbd>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
            <span className="text-slate-300">Compare Contracts (Diff)</span>
            <kbd className="px-2 py-0.5 rounded bg-slate-700 font-mono text-[11px] text-amber-300 border border-slate-600">Alt + 2</kbd>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
            <span className="text-slate-300">Lawyer Consultation Prep Kit</span>
            <kbd className="px-2 py-0.5 rounded bg-slate-700 font-mono text-[11px] text-amber-300 border border-slate-600">Alt + 3</kbd>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
            <span className="text-slate-300">Configure AI Engine / API Key</span>
            <kbd className="px-2 py-0.5 rounded bg-slate-700 font-mono text-[11px] text-amber-300 border border-slate-600">Alt + K</kbd>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
            <span className="text-slate-300">Toggle High Contrast Mode (WCAG AAA)</span>
            <kbd className="px-2 py-0.5 rounded bg-slate-700 font-mono text-[11px] text-amber-300 border border-slate-600">Alt + C</kbd>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
            <span className="text-slate-300">Cycle Font Size Scale (A / A+ / A++)</span>
            <kbd className="px-2 py-0.5 rounded bg-slate-700 font-mono text-[11px] text-amber-300 border border-slate-600">Alt + F</kbd>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
            <span className="text-slate-300">Show Keyboard Shortcuts Cheatsheet</span>
            <kbd className="px-2 py-0.5 rounded bg-slate-700 font-mono text-[11px] text-amber-300 border border-slate-600">?</kbd>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
            <span className="text-slate-300">Close Open Dialog / Modal</span>
            <kbd className="px-2 py-0.5 rounded bg-slate-700 font-mono text-[11px] text-amber-300 border border-slate-600">Esc</kbd>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-legal-600 hover:bg-legal-500 text-white rounded-xl text-xs font-semibold transition"
          >
            Close (Esc)
          </button>
        </div>
      </div>
    </div>
  );
}
