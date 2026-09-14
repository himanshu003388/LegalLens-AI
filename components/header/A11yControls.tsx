"use client";

import React from "react";
import { Sun, Type, Keyboard } from "lucide-react";

interface A11yControlsProps {
  highContrastMode: boolean;
  fontSizeScale: "normal" | "large" | "xlarge";
  onToggleContrast: () => void;
  onCycleFontSize: () => void;
  onOpenShortcuts: () => void;
}

export default function A11yControls({
  highContrastMode,
  fontSizeScale,
  onToggleContrast,
  onCycleFontSize,
  onOpenShortcuts,
}: A11yControlsProps) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {/* High Contrast Mode Toggle */}
      <button
        type="button"
        onClick={onToggleContrast}
        className={`p-2 rounded-xl border text-xs font-semibold transition flex items-center gap-1 ${
          highContrastMode
            ? "bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-300"
            : "bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700/80 hover:text-white"
        }`}
        title="Toggle WCAG AAA High Contrast Mode (Alt+C)"
        aria-label="Toggle High Contrast Mode (Alt+C)"
      >
        <Sun className="w-4 h-4" aria-hidden="true" />
        <span className="hidden lg:inline text-[11px]">
          {highContrastMode ? "AAA Contrast" : "Contrast"}
        </span>
      </button>

      {/* Font Size Scaler */}
      <button
        type="button"
        onClick={onCycleFontSize}
        className="p-2 rounded-xl border border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white text-xs font-semibold transition flex items-center gap-1"
        title="Cycle text size scale: Normal, Large (+15%), Extra Large (+30%) (Alt+F)"
        aria-label={`Current font scale: ${fontSizeScale}. Click to cycle.`}
      >
        <Type className="w-4 h-4" aria-hidden="true" />
        <span className="text-[11px] font-mono">
          {fontSizeScale === "normal" ? "1x" : fontSizeScale === "large" ? "1.15x" : "1.3x"}
        </span>
      </button>

      {/* Keyboard Shortcuts Cheatsheet Trigger */}
      <button
        type="button"
        onClick={onOpenShortcuts}
        className="p-2 rounded-xl border border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white transition"
        title="Keyboard Shortcuts & Accessibility Cheatsheet (?)"
        aria-label="Keyboard Shortcuts Cheatsheet"
      >
        <Keyboard className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
}
