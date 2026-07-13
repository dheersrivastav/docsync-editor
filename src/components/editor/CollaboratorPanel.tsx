"use client";

import { useEffect, useState } from "react";
import { X, Trash2 } from "lucide-react";
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
      <div className="flex-1 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col">

        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Share document</h2>
            <p className="text-xs text-gray-400 mt-0.5">Invite people to collaborate</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {isOwner && (
            <form onSubmit={addCollaborator} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  placeholder="colleague@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Permission
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as "EDITOR" | "VIEWER")}
                  className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all bg-white"
                >
                  <option value="EDITOR">Editor — can edit and save</option>
                  <option value="VIEWER">Viewer — read only</option>
                </select>
              </div>
              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">{error}</p>
              )}
              <button
                type="submit"
                disabled={adding}
                className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60"
              >
                {adding ? "Adding..." : "Add collaborator"}
              </button>
            </form>
          )}

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">People with access</h3>
            {collaborators.length === 0 ? (
              <p className="text-sm text-gray-400 py-2">No collaborators yet.</p>
            ) : (
              <ul className="space-y-3">
                {collaborators.map((c) => (
                  <li key={c.userId} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{c.name}</p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{c.email}</p>
                    </div>
                    <div className="flex items-center gap-3 ml-3 shrink-0">
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                        {c.role.charAt(0) + c.role.slice(1).toLowerCase()}
                      </span>
                      {isOwner && (
                        <button
                          onClick={() => removeCollaborator(c.userId)}
                          className="text-gray-300 hover:text-red-500 transition-colors"
                          aria-label={`Remove ${c.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
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
