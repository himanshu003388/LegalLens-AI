"use client";

import React, { useState } from "react";
import ComparisonView from "@/components/ComparisonView";
import { ComparisonAnalysis } from "@/lib/types/legal";
import { useAnalysis } from "@/context/AnalysisContext";

export default function ComparePage() {
  const { comparisonResult, setComparisonResult } = useAnalysis();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleRunComparison = async (
    origText: string,
    revText: string,
    origName: string,
    revName: string
  ) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalFileName: origName,
          revisedFileName: revName,
          originalText: origText,
          revisedText: revText,
        }),
      });

      const data = await res.json();
      if (res.ok && data.comparison) {
        setComparisonResult(data.comparison);
      }
    } catch (e) {
      console.error("Comparison error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <ComparisonView
        onRunComparison={handleRunComparison}
        comparisonResult={comparisonResult}
        isLoading={isLoading}
      />
    </div>
  );
}
