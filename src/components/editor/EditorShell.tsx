"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CollaboratorPanel } from "@/components/editor/CollaboratorPanel";
import type { UserRole } from "@/types";

interface EditorShellProps {
  document: {
    id: string;
    title: string;
    content: string;
    serverClock: number;
    ownerId: string;
    ownerName: string;
    role: UserRole;
  };
  currentUserId: string;
  currentUserName: string;
}

export function EditorShell({ document, currentUserId, currentUserName }: EditorShellProps) {
  const [title, setTitle] = useState(document.title);
  const [showCollaborators, setShowCollaborators] = useState(false);

  async function saveTitle(newTitle: string) {
    if (!newTitle.trim() || newTitle === document.title) return;
    await fetch(`/api/documents/${document.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    });
  }

  const canEdit = document.role === "OWNER" || document.role === "EDITOR";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top bar */}
      <header className="border-b border-gray-200 px-4 h-14 flex items-center justify-between sticky top-0 bg-white z-10">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Link
            href="/dashboard"
            className="text-gray-500 hover:text-gray-900 transition-colors shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          {canEdit ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={(e) => saveTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
              }}
              className="text-lg font-semibold text-gray-900 bg-transparent border-none outline-none truncate w-full max-w-md"
              aria-label="Document title"
            />
          ) : (
            <h1 className="text-lg font-semibold text-gray-900 truncate">{title}</h1>
          )}
        </div>

        <div className="flex items-center gap-2 ml-4 shrink-0">
          <span className="text-xs text-gray-400 hidden sm:block">
            {document.role}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCollaborators(true)}
          >
            <Users className="h-4 w-4 mr-1.5" />
            Share
          </Button>
        </div>
      </header>

      {/* Editor area — placeholder until Phase 3 */}
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <p className="text-sm">Editor loads in Phase 3</p>
      </div>

      {showCollaborators && (
        <CollaboratorPanel
          documentId={document.id}
          isOwner={document.role === "OWNER"}
          onClose={() => setShowCollaborators(false)}
        />
      )}
    </div>
  );
}
