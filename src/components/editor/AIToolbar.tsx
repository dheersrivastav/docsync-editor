"use client";

import { useState } from "react";
import { Loader2, X, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface Props {
  content: string;
  onApply: (newContent: string) => void;
  onTitleChange: (title: string) => void;
}

type Action = "grammar" | "summarize" | "title";

const actions: { id: Action; label: string }[] = [
  { id: "grammar", label: "Fix grammar" },
  { id: "summarize", label: "Summarize" },
  { id: "title", label: "Generate title" },
];

export function AIToolbar({ content, onApply, onTitleChange }: Props) {
  const [loading, setLoading] = useState<Action | null>(null);
  const [summary, setSummary] = useState<string | null>(null);

  async function run(action: Action) {
    const plain = content.replace(/<[^>]+>/g, " ").trim();
    if (!plain) { toast.error("Document is empty"); return; }

    setLoading(action);
    if (action === "summarize") setSummary(null);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, content }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "AI request failed"); return; }

      if (action === "title") {
        onTitleChange(data.result);
        toast.success("Title updated");
      } else if (action === "grammar") {
        onApply(`<p>${data.result}</p>`);
        toast.success("Grammar fixed");
      } else {
        setSummary(data.result);
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="border-b border-gray-100 bg-gray-50">
      <div className="flex items-center gap-1 px-5 py-2">
        <div className="flex items-center gap-1.5 mr-3">
          <Sparkles className="h-3.5 w-3.5 text-violet-500" />
          <span className="text-xs font-medium text-violet-500 uppercase tracking-wide">AI</span>
        </div>
        {actions.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => run(id)}
            disabled={loading !== null}
            className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium text-gray-600 hover:text-violet-700 hover:bg-violet-50 rounded-lg transition-colors duration-150 disabled:opacity-50"
          >
            {loading === id && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {label}
          </button>
        ))}
      </div>

      {summary && (
        <div className="mx-5 mb-3 flex gap-3 p-4 bg-violet-50 border border-violet-200 rounded-xl">
          <Sparkles className="h-4 w-4 text-violet-500 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-violet-600 mb-1.5 uppercase tracking-wide">Summary</p>
            <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
          </div>
          <button
            onClick={() => setSummary(null)}
            className="text-gray-400 hover:text-gray-600 shrink-0 transition-colors mt-0.5"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
