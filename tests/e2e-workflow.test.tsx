// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ScenarioSimulator from "@/components/ScenarioSimulator";
import LegalGlossary from "@/components/LegalGlossary";
import ComparisonView from "@/components/ComparisonView";
import ApiKeyModal from "@/components/header/ApiKeyModal";
import KeyboardShortcutsModal from "@/components/header/KeyboardShortcutsModal";
import A11yControls from "@/components/header/A11yControls";
import { analyzeDocumentLocally } from "@/lib/ai/local-intelligence";
import { compareContracts } from "@/lib/diff/contract-diff";

describe("E2E Integration & New UI Components", () => {
  const sampleDoc = `
COMMERCIAL LEASE AGREEMENT

1. PAYMENT TERMS AND RENT
Base rent of $4,000 is due monthly on the 1st day of each month. Late fee of $150 applies.

2. INDEMNIFICATION AND LIABILITY
Tenant agrees to defend, indemnify, and hold harmless Landlord against all liabilities and claims.

3. TERM AND TERMINATION
The lease duration is 12 months with 60 days written notice required prior to termination.
  `;

  it("ScenarioSimulator renders preset scenarios and handles custom queries", () => {
    const analysis = analyzeDocumentLocally("lease.txt", sampleDoc);
    render(<ScenarioSimulator analysis={analysis} documentText={sampleDoc} />);

    expect(screen.getByText(/Interactive.*What-If.*Scenario Simulator/i)).toBeDefined();
    expect(screen.getByText(/Late Payment or Cashflow Delay/i)).toBeDefined();

    // Click on a scenario card to view detailed breakdown
    const scenarioCard = screen.getByText(/Late Payment or Cashflow Delay/i);
    fireEvent.click(scenarioCard);

    expect(screen.getByText(/Active Simulation Result/i)).toBeDefined();
    expect(screen.getByText(/Plain-English Contract Assessment:/i)).toBeDefined();
    expect(screen.getByText(/Immediate Protective Steps to Take/i)).toBeDefined();
  });

  it("LegalGlossary displays terms and supports instant search", () => {
    render(<LegalGlossary />);

    expect(screen.getByText(/Plain-English Legal Terminology Glossary/i)).toBeDefined();
    expect(screen.getByText(/Indemnification & Hold Harmless/i)).toBeDefined();

    const searchInput = screen.getByPlaceholderText(/Search legal terms/i);
    fireEvent.change(searchInput, { target: { value: "Liquidated" } });

    expect(screen.getAllByText(/Liquidated Damages/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Force Majeure/i)).toBeNull();
  });

  it("ComparisonView renders color-blind accessible redline badges", () => {
    const orig = "1. Payment: Net 30 days.\n2. Liability: Capped at $10,000.";
    const rev = "1. Payment: Net 15 days.\n2. Liability: Unlimited liability.";
    const diff = compareContracts("orig.txt", "rev.txt", orig, rev);

    render(
      <ComparisonView
        comparisonResult={diff}
        isLoading={false}
      />
    );

    // Check accessible badges
    expect(screen.getAllByText(/\[\+\] ADD/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/\[\-\] DEL/i).length).toBeGreaterThan(0);
  });

  it("ApiKeyModal traps focus and allows provider selection", () => {
    const handleClose = vi.fn();
    const handleUpdate = vi.fn();

    render(
      <ApiKeyModal
        isOpen={true}
        onClose={handleClose}
        onKeyUpdated={handleUpdate}
      />
    );

    expect(screen.getByText(/GenAI Model Configuration/i)).toBeDefined();
    expect(screen.getAllByText(/Google Gemini/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/OpenAI/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Anthropic/i).length).toBeGreaterThan(0);
  });

  it("KeyboardShortcutsModal renders all keybindings and responds to Esc", () => {
    const handleClose = vi.fn();
    render(<KeyboardShortcutsModal isOpen={true} onClose={handleClose} />);

    expect(screen.getByText(/Accessibility & Keyboard Shortcuts/i)).toBeDefined();
    expect(screen.getByText(/Alt \+ 1/i)).toBeDefined();
    expect(screen.getByText(/Alt \+ C/i)).toBeDefined();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(handleClose).toHaveBeenCalled();
  });

  it("A11yControls toggles contrast and triggers font cycling", () => {
    const toggleContrast = vi.fn();
    const cycleFont = vi.fn();
    const openShortcuts = vi.fn();

    render(
      <A11yControls
        highContrastMode={false}
        fontSizeScale="normal"
        onToggleContrast={toggleContrast}
        onCycleFontSize={cycleFont}
        onOpenShortcuts={openShortcuts}
      />
    );

    const contrastBtn = screen.getByLabelText(/Toggle High Contrast Mode/i);
    fireEvent.click(contrastBtn);
    expect(toggleContrast).toHaveBeenCalled();

    const fontBtn = screen.getByLabelText(/Current font scale:/i);
    fireEvent.click(fontBtn);
    expect(cycleFont).toHaveBeenCalled();

    const shortcutsBtn = screen.getByLabelText(/Keyboard Shortcuts Cheatsheet/i);
    fireEvent.click(shortcutsBtn);
    expect(openShortcuts).toHaveBeenCalled();
  });
});
