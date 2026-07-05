"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { TiptapEditor } from "@/components/editor/TiptapEditor";
import { CollaboratorPanel } from "@/components/editor/CollaboratorPanel";
import { SyncStatusBadge } from "@/components/editor/SyncStatusBadge";
import { useDocument } from "@/hooks/useDocument";
import { useSync } from "@/hooks/useSync";
import type { UserRole } from "@/types";

interface Props {
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

export function EditorShell({ document, currentUserId, currentUserName }: Props) {
  const [title, setTitle] = useState(document.title);
  const [showCollaborators, setShowCollaborators] = useState(false);

  const canEdit = document.role === "OWNER" || document.role === "EDITOR";

  const {
    content,
    syncStatus,
    setSyncStatus,
    handleContentChange,
    applyServerUpdate,
  } = useDocument({
    id: document.id,
    title: document.title,
    content: document.content,
    serverClock: document.serverClock,
    role: document.role,
  });

  useSync({
    docId: document.id,
    setSyncStatus,
    onSynced(newContent, newClock) {
      applyServerUpdate(newContent, newClock);
    },
    onConflict(mergedContent, newClock) {
      applyServerUpdate(mergedContent, newClock);
      toast.warning("Conflict resolved", {
        description:
          "Your offline changes overlapped with edits from another user. The document has been auto-merged — server changes were kept where both sides edited the same section.",
        duration: 6000,
      });
    },
  });

  async function saveTitle(newTitle: string) {
    const trimmed = newTitle.trim();
    if (!trimmed || trimmed === document.title) return;
    await fetch(`/api/documents/${document.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: trimmed }),
    });
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Top bar */}
      <header className="border-b border-gray-200 px-4 h-14 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Link
            href="/dashboard"
            className="text-gray-500 hover:text-gray-900 transition-colors shrink-0"
            aria-label="Back to dashboard"
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
              className="text-lg font-semibold text-gray-900 bg-transparent border-none outline-none truncate w-full max-w-sm"
              aria-label="Document title"
            />
          ) : (
            <h1 className="text-lg font-semibold text-gray-900 truncate">{title}</h1>
          )}
        </div>

        <div className="flex items-center gap-3 ml-4 shrink-0">
          <SyncStatusBadge status={syncStatus} />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCollaborators(true)}
            aria-label="Share document"
          >
            <Users className="h-4 w-4 mr-1.5" />
            Share
          </Button>
        </div>
      </header>

      {/* Editor */}
      <TiptapEditor
        content={content}
        editable={canEdit}
        onChange={handleContentChange}
      />

      {/* Collaborator slide-over */}
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
