"use client";

import { useEffect, useState } from "react";
import { X, UserPlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Collaborator } from "@/types";

interface Props {
  documentId: string;
  isOwner: boolean;
  onClose: () => void;
}

export function CollaboratorPanel({ documentId, isOwner, onClose }: Props) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"EDITOR" | "VIEWER">("EDITOR");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/documents/${documentId}/collaborators`)
      .then((r) => r.json())
      .then(setCollaborators);
  }, [documentId]);

  async function addCollaborator(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setAdding(true);

    const res = await fetch(`/api/documents/${documentId}/collaborators`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });

    const data = await res.json();
    setAdding(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to add collaborator");
    } else {
      setCollaborators((prev) => {
        const exists = prev.find((c) => c.userId === data.userId);
        if (exists) return prev.map((c) => (c.userId === data.userId ? data : c));
        return [...prev, data];
      });
      setEmail("");
    }
  }

  async function removeCollaborator(userId: string) {
    await fetch(`/api/documents/${documentId}/collaborators`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    setCollaborators((prev) => prev.filter((c) => c.userId !== userId));
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="flex-1 bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="w-full max-w-sm bg-white h-full shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Share document</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          {isOwner && (
            <form onSubmit={addCollaborator} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="collab-email">Invite by email</Label>
                <Input
                  id="collab-email"
                  type="email"
                  placeholder="colleague@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="collab-role">Role</Label>
                <select
                  id="collab-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as "EDITOR" | "VIEWER")}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="EDITOR">Editor — can edit</option>
                  <option value="VIEWER">Viewer — read only</option>
                </select>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" size="sm" disabled={adding} className="w-full">
                <UserPlus className="h-4 w-4 mr-2" />
                {adding ? "Adding..." : "Add collaborator"}
              </Button>
            </form>
          )}

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              People with access
            </h3>
            {collaborators.length === 0 ? (
              <p className="text-sm text-gray-400">No collaborators yet.</p>
            ) : (
              <ul className="space-y-3">
                {collaborators.map((c) => (
                  <li key={c.userId} className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {c.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{c.email}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-3 shrink-0">
                      <span className="text-xs text-gray-500">{c.role}</span>
                      {isOwner && (
                        <button
                          onClick={() => removeCollaborator(c.userId)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          aria-label={`Remove ${c.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
