import type { Metadata } from "next";
import "./globals.css";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import Header from "@/components/Header";
import { AnalysisProvider } from "@/context/AnalysisContext";

export const metadata: Metadata = {
  title: "LegalLens AI — Legal Document Intelligence & Access",
  description:
    "Empowering tenants, freelancers, and small businesses with plain-English legal document analysis, risk detection, grounded cited Q&A, redline comparisons, and attorney consultation prep kits.",
  keywords: [
    "legal document intelligence",
    "contract analysis",
    "lease agreement review",
    "plain English legal translator",
    "legal AI",
    "contract comparison diff",
    "lawyer prep kit",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased">
        <AnalysisProvider>
          {/* Permanent visible non-legal-advice banner */}
          <DisclaimerBanner />

          {/* Global application header */}
          <Header />

          {/* Main Content Area */}
          <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </AnalysisProvider>

        {/* Authoritative Accessible Footer */}
        <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-8 print:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-slate-200">LegalLens AI — Public Legal Intelligence Initiative</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Built for the AI for Legal Assistance & Access Challenge. Not affiliated with any legal bar association.
              </p>
            </div>
            <div className="flex items-center gap-4 text-slate-400 text-xs">
              <span>WCAG 2.1 AA Compliant</span>
              <span>•</span>
              <span>Zero Data Retention</span>
              <span>•</span>
              <span>Client-Side PII Masking</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
