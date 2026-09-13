"use client";

import React, { useState } from "react";
import { ActionChecklistItem } from "@/lib/types/legal";
import { CheckSquare, Square, Calendar, Tag, CheckCircle2, ListFilter } from "lucide-react";

interface ActionChecklistProps {
  initialItems: ActionChecklistItem[];
}

export default function ActionChecklist({ initialItems }: ActionChecklistProps) {
  const [items, setItems] = useState<ActionChecklistItem[]>(initialItems);

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const completedCount = items.filter((i) => i.completed).length;
  const progressPercent = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-serif">
              Actionable Next Steps & Due Diligence Checklist
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Clear roadmap of pre-signing and ongoing contractual obligations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Progress: {completedCount} of {items.length} ({progressPercent}%)
          </span>
          <div className="w-24 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Checklist items */}
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className={`p-4 rounded-xl border transition cursor-pointer select-none flex items-start gap-3.5 ${
              item.completed
                ? "bg-slate-50/60 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-70"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-legal-400"
            }`}
            role="checkbox"
            aria-checked={item.completed}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                toggleItem(item.id);
              }
            }}
          >
            <div className="mt-0.5 text-legal-600 dark:text-legal-400">
              {item.completed ? (
                <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Square className="w-5 h-5 text-slate-400 hover:text-legal-500" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <h4
                  className={`text-sm font-bold ${
                    item.completed
                      ? "line-through text-slate-400 dark:text-slate-500"
                      : "text-slate-900 dark:text-slate-100"
                  }`}
                >
                  {item.title}
                </h4>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      item.priority === "HIGH"
                        ? "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300"
                        : item.priority === "MEDIUM"
                        ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {item.priority} PRIORITY
                  </span>

                  {item.category && (
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {item.category}
                    </span>
                  )}
                </div>
              </div>

              <p
                className={`text-xs ${
                  item.completed
                    ? "text-slate-400 dark:text-slate-500"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                {item.description}
              </p>

              {item.dueDate && (
                <div className="mt-2 flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                  <Calendar className="w-3 h-3" />
                  <span>Due: {item.dueDate}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
