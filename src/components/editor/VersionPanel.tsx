"use client";

import { useEffect, useState } from "react";
import { X, RotateCcw, Save } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { DocumentVersion } from "@/types";

interface Props {
  documentId: string;
  onClose: () => void;
  onRestored: (content: string, serverClock: number) => void;
}

export function VersionPanel({ documentId, onClose, onRestored }: Props) {
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [label, setLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/documents/${documentId}/versions`)
      .then((r) => r.json())
      .then(setVersions);
  }, [documentId]);

  async function saveVersion(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/documents/${documentId}/versions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: label.trim() || undefined }),
    });
    setSaving(false);
    if (res.ok) {
      const v = await res.json();
      setVersions((prev) => [v, ...prev]);
      setLabel("");
      toast.success("Version saved");
    }
  }

  async function restoreVersion(versionId: string) {
    if (!confirm("Restore this version? The current state will be saved automatically.")) return;
    setRestoring(versionId);
    const res = await fetch(`/api/documents/${documentId}/restore`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ versionId }),
    });
    setRestoring(null);
    if (res.ok) {
      const data = await res.json();
      onRestored(data.content, data.serverClock);
      toast.success("Document restored");
      onClose();
    } else {
      toast.error("Restore failed");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="flex-1 bg-black/30" onClick={onClose} aria-hidden="true" />
      <div className="w-full max-w-sm bg-white h-full shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Version history</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-4 border-b border-gray-100">
          <form onSubmit={saveVersion} className="flex gap-2">
            <Input
              placeholder="Label (optional)"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="sm" disabled={saving}>
              <Save className="h-4 w-4 mr-1" />
              {saving ? "Saving..." : "Save"}
            </Button>
          </form>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {versions.length === 0 ? (
            <p className="text-sm text-gray-400">No saved versions yet.</p>
          ) : (
            <ul className="space-y-3">
              {versions.map((v) => (
                <li key={v.id} className="flex items-start justify-between gap-3 py-2 border-b border-gray-100 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {v.label ?? `Version at clock ${v.serverClock}`}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatDistanceToNow(new Date(v.createdAt), { addSuffix: true })} · {v.createdByName}
                    </p>
                  </div>
                  <button
                    onClick={() => restoreVersion(v.id)}
                    disabled={restoring === v.id}
                    className="text-gray-400 hover:text-blue-600 transition-colors shrink-0 mt-0.5"
                    aria-label="Restore this version"
                    title="Restore"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
