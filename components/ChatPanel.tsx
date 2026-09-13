"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Send, Sparkles, MessageSquare, Quote, Bot, User, CornerDownLeft } from "lucide-react";
import { ChatMessage, Citation } from "@/lib/types/legal";
import { getStoredApiKey, getStoredProvider, getApiKeyHeaders } from "@/lib/security/client-keys";

interface ChatPanelProps {
  documentText: string;
  documentTitle: string;
}

function getDynamicStarterQuestions(title: string, text: string): string[] {
  const lowerTitle = title.toLowerCase();
  const lowerText = text.toLowerCase();

  if (
    lowerTitle.includes("nda") ||
    lowerTitle.includes("non-disclosure") ||
    lowerText.includes("confidential information")
  ) {
    return [
      "What is the exact duration of my confidentiality obligations?",
      "Can I share confidential information with external contractors?",
      "What exceptions apply if information is already in the public domain?",
      "What happens to residual knowledge or general business skills?",
    ];
  }

  if (
    lowerTitle.includes("lease") ||
    lowerTitle.includes("rental") ||
    lowerText.includes("premises") ||
    lowerText.includes("landlord")
  ) {
    return [
      "Can the landlord increase rent or fees during the initial lease term?",
      "What are the specific conditions for receiving my security deposit back?",
      "Who is responsible for HVAC, structural repairs, and routine maintenance?",
      "What notice is required if I do not intend to renew the lease?",
    ];
  }

  if (
    lowerTitle.includes("saas") ||
    lowerTitle.includes("software") ||
    lowerTitle.includes("service") ||
    lowerText.includes("services agreement")
  ) {
    return [
      "Are there uncapped liability or indemnity obligations for either party?",
      "What uptime guarantees, warranties, or SLA credits are specified?",
      "Who owns custom intellectual property and data created during performance?",
      "What happens if I need to terminate for convenience or breach?",
    ];
  }

  if (
    lowerTitle.includes("employment") ||
    lowerTitle.includes("consult") ||
    lowerText.includes("non-compete")
  ) {
    return [
      "Are there restrictive non-compete or non-solicitation covenants?",
      "What severance, notice periods, or termination terms apply?",
      "How are intellectual property assignments and inventions handled?",
      "What are the payment milestones and expense reimbursement guidelines?",
    ];
  }

  return [
    "What happens if I need to terminate this agreement early?",
    "Are there any uncapped liability or indemnification clauses?",
    "What are my exact payment deadlines and late penalty fees?",
    "What governing law and dispute jurisdiction apply?",
  ];
}

export default function ChatPanel({ documentText, documentTitle }: ChatPanelProps) {
  const [activeEngine, setActiveEngine] = useState("Streaming Q&A");

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg_welcome",
      sender: "assistant",
      content: `Hello! I have analyzed **${documentTitle}**. Ask me any question about your obligations, termination clauses, fees, or risks. Every answer will be grounded with exact citations.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const starterQuestions = useMemo(
    () => getDynamicStarterQuestions(documentTitle, documentText),
    [documentTitle, documentText]
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  useEffect(() => {
    const key = getStoredApiKey();
    const provider = getStoredProvider();
    if (provider === "gemini" || key.startsWith("AIza")) {
      setActiveEngine(key ? "Gemini 1.5 Flash" : "Gemini / Local Engine");
    } else if (provider === "openai") {
      setActiveEngine(key ? "GPT-4o Streaming" : "Local Engine");
    } else if (provider === "anthropic") {
      setActiveEngine(key ? "Claude 3.5 Streaming" : "Local Engine");
    } else {
      setActiveEngine("Local Engine Streaming");
    }
  }, []);

  const handleAsk = async (questionText: string) => {
    if (!questionText.trim() || isStreaming) return;

    const userMessage: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      sender: "user",
      content: questionText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuestion("");
    setIsStreaming(true);

    const assistantMessageId = `msg_bot_${Date.now()}`;
    // Add placeholder assistant message
    setMessages((prev) => [
      ...prev,
      {
        id: assistantMessageId,
        sender: "assistant",
        content: "",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);

    try {
      const apiKey = getStoredApiKey() || undefined;
      const provider = getStoredProvider() || undefined;

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getApiKeyHeaders(),
        },
        body: JSON.stringify({
          question: questionText,
          documentText,
          apiKey,
          provider,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to connect to streaming chat service.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamedContent = "";
      let collectedCitations: Citation[] = [];

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) {
                streamedContent += data.text;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId ? { ...msg, content: streamedContent } : msg
                  )
                );
              }
              if (data.done && data.citations) {
                collectedCitations = data.citations;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, citations: collectedCitations }
                      : msg
                  )
                );
              }
            } catch (e) {
              // Ignore malformed SSE chunk lines
            }
          }
        }
      }
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: "I apologize, but I encountered an issue retrieving an answer. Please verify your connection or try again.",
              }
            : msg
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col h-[650px] overflow-hidden">
      {/* Chat header */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-legal-100 dark:bg-legal-950 text-legal-700 dark:text-legal-300 flex items-center justify-center">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Cited Q&A Assistant
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Answers grounded strictly in &quot;{documentTitle}&quot;
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
          <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
          <span>{activeEngine}</span>
        </div>
      </div>

      {/* Message Feed */}
      <div
        className="flex-1 p-6 overflow-y-auto space-y-4"
        role="log"
        aria-live="polite"
        aria-label="Chat conversation log"
      >
        {messages.map((message) => {
          const isUser = message.sender === "user";
          return (
            <div
              key={message.id}
              className={`flex gap-3 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold ${
                  isUser
                    ? "bg-legal-600 text-white"
                    : "bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800"
                }`}
                aria-hidden="true"
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  isUser
                    ? "bg-legal-600 text-white rounded-tr-none shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-700 shadow-sm"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>

                {/* Grounded Citations Box */}
                {message.citations && message.citations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Quote className="w-3 h-3 text-amber-500" />
                      Grounded Citations from Document:
                    </span>
                    {message.citations.map((citation, cIdx) => (
                      <div
                        key={cIdx}
                        className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs"
                      >
                        <p className="font-semibold text-legal-700 dark:text-legal-300 mb-0.5">
                          {citation.sectionTitle}
                        </p>
                        <p className="text-slate-600 dark:text-slate-400 italic text-[11px]">
                          &quot;{citation.exactQuote}&quot;
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <div
                  className={`mt-1.5 text-[10px] ${
                    isUser ? "text-legal-200 text-right" : "text-slate-400 text-left"
                  }`}
                >
                  {message.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isStreaming && (
          <div className="flex items-center gap-2 text-xs text-slate-400 p-2 italic">
            <span className="w-2 h-2 rounded-full bg-legal-500 animate-ping" />
            Analyzing contract sections and generating grounded response...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Starter Prompts */}
      <div className="px-6 py-2 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-slate-400 text-[11px] font-medium whitespace-nowrap">Suggested:</span>
        {starterQuestions.map((prompt, pIdx) => (
          <button
            key={pIdx}
            type="button"
            onClick={() => handleAsk(prompt)}
            disabled={isStreaming}
            className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 whitespace-nowrap transition disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk(inputQuestion);
        }}
        className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 bg-white dark:bg-slate-900"
      >
        <input
          type="text"
          value={inputQuestion}
          onChange={(e) => setInputQuestion(e.target.value)}
          placeholder="Ask a question about this contract (e.g. 'Can I terminate early?')..."
          disabled={isStreaming}
          className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-legal-500 placeholder-slate-400"
          aria-label="Ask a question about the document"
        />
        <button
          type="submit"
          disabled={!inputQuestion.trim() || isStreaming}
          className="p-3 bg-legal-600 hover:bg-legal-500 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-legal-400 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
