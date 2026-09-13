"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { DocumentAnalysis, ComparisonAnalysis } from "@/lib/types/legal";

export type FontSizeScale = "normal" | "large" | "xlarge";

interface AnalysisContextType {
  analysis: DocumentAnalysis | null;
  setAnalysis: (analysis: DocumentAnalysis | null) => void;
  currentText: string;
  setCurrentText: (text: string) => void;
  currentFileName: string;
  setCurrentFileName: (fileName: string) => void;
  comparisonResult: ComparisonAnalysis | null;
  setComparisonResult: (comparison: ComparisonAnalysis | null) => void;
  fontSizeScale: FontSizeScale;
  setFontSizeScale: (scale: FontSizeScale) => void;
  highContrastMode: boolean;
  setHighContrastMode: (enabled: boolean) => void;
  resetAnalysis: () => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
  const [currentText, setCurrentText] = useState<string>("");
  const [currentFileName, setCurrentFileName] = useState<string>("");
  const [comparisonResult, setComparisonResult] = useState<ComparisonAnalysis | null>(null);
  const [fontSizeScale, setFontSizeScale] = useState<FontSizeScale>("normal");
  const [highContrastMode, setHighContrastMode] = useState<boolean>(false);

  // Restore accessibility preferences from storage on mount
  useEffect(() => {
    try {
      const savedScale = localStorage.getItem("legallens_font_scale") as FontSizeScale;
      if (savedScale === "normal" || savedScale === "large" || savedScale === "xlarge") {
        setFontSizeScale(savedScale);
      }
      const savedContrast = localStorage.getItem("legallens_high_contrast");
      if (savedContrast === "true") {
        setHighContrastMode(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSetFontScale = (scale: FontSizeScale) => {
    setFontSizeScale(scale);
    try {
      localStorage.setItem("legallens_font_scale", scale);
    } catch {
      // ignore
    }
  };

  const handleSetHighContrast = (enabled: boolean) => {
    setHighContrastMode(enabled);
    try {
      localStorage.setItem("legallens_high_contrast", enabled ? "true" : "false");
    } catch {
      // ignore
    }
  };

  const resetAnalysis = () => {
    setAnalysis(null);
    setCurrentText("");
    setCurrentFileName("");
  };

  return (
    <AnalysisContext.Provider
      value={{
        analysis,
        setAnalysis,
        currentText,
        setCurrentText,
        currentFileName,
        setCurrentFileName,
        comparisonResult,
        setComparisonResult,
        fontSizeScale,
        setFontSizeScale: handleSetFontScale,
        highContrastMode,
        setHighContrastMode: handleSetHighContrast,
        resetAnalysis,
      }}
    >
      <div
        className={`${highContrastMode ? "high-contrast-mode" : ""} ${
          fontSizeScale === "large"
            ? "text-scale-large"
            : fontSizeScale === "xlarge"
            ? "text-scale-xlarge"
            : ""
        }`}
      >
        {children}
      </div>
    </AnalysisContext.Provider>
  );
}

export function useAnalysis(): AnalysisContextType {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error("useAnalysis must be used within an AnalysisProvider");
  }
  return context;
}
