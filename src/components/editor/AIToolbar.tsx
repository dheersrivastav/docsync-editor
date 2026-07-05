"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  content: string;
  onApply: (newContent: string) => void;
  onTitleChange: (title: string) => void;
}

type Action = "grammar" | "summarize" | "title";

const labels: Record<Action, string> = {
  grammar: "Fix grammar",
  summarize: "Summarize",
  title: "Generate title",
};

export function AIToolbar({ content, onApply, onTitleChange }: Props) {
  const [loading, setLoading] = useState<Action | null>(null);

  async function run(action: Action) {
    const plainText = content.replace(/<[^>]+>/g, " ").trim();
    if (!plainText) {
      toast.error("Document is empty");
      return;
    }

    setLoading(action);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, content }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "AI request failed");
        return;
      }

      if (action === "title") {
        onTitleChange(data.result);
        toast.success("Title updated");
      } else if (action === "grammar") {
        onApply(`<p>${data.result}</p>`);
        toast.success("Grammar fixed");
      } else {
        toast.info(data.result, { duration: 8000 });
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-100 bg-gray-50/50">
      <Sparkles className="h-3.5 w-3.5 text-purple-500 mr-1" />
      {(["grammar", "summarize", "title"] as Action[]).map((action) => (
        <Button
          key={action}
          variant="ghost"
          size="sm"
          onClick={() => run(action)}
          disabled={loading !== null}
          className="h-7 text-xs text-gray-600 hover:text-purple-700 hover:bg-purple-50"
        >
          {loading === action ? (
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
          ) : null}
          {labels[action]}
        </Button>
      ))}
    </div>
  );
}
