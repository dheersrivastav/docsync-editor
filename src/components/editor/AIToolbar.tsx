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
    <div className="border-b border-[#E5E7EB] bg-white">
      <div className="flex items-center gap-0.5 px-4 py-1.5">
        <Sparkles className="h-3 w-3 text-[#6D28D9] mr-2 shrink-0" />
        {actions.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => run(id)}
            disabled={loading !== null}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-[#6B7280] hover:text-[#6D28D9] hover:bg-[#F5F3FF] rounded-md transition-colors duration-150 disabled:opacity-50"
          >
            {loading === id && <Loader2 className="h-3 w-3 animate-spin" />}
            {label}
          </button>
        ))}
      </div>

      {summary && (
        <div className="mx-4 mb-3 flex gap-3 p-3 bg-[#F5F3FF] border border-[#DDD6FE] rounded-xl">
          <Sparkles className="h-3.5 w-3.5 text-[#6D28D9] mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#6D28D9] mb-1">Summary</p>
            <p className="text-sm text-[#374151] leading-relaxed">{summary}</p>
          </div>
          <button
            onClick={() => setSummary(null)}
            className="text-[#9CA3AF] hover:text-[#374151] shrink-0 transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
