"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Users, History } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { TiptapEditor } from "@/components/editor/TiptapEditor";
import { CollaboratorPanel } from "@/components/editor/CollaboratorPanel";
import { SyncStatusBadge } from "@/components/editor/SyncStatusBadge";
import { PresenceAvatars } from "@/components/editor/PresenceAvatars";
import { VersionPanel } from "@/components/editor/VersionPanel";
import { AIToolbar } from "@/components/editor/AIToolbar";
import { useDocument } from "@/hooks/useDocument";
import { useSync } from "@/hooks/useSync";
import { useCollaboration } from "@/hooks/useCollaboration";
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

type Panel = "collaborators" | "versions" | null;

export function EditorShell({ document, currentUserId, currentUserName }: Props) {
  const [title, setTitle] = useState(document.title);
  const [panel, setPanel] = useState<Panel>(null);

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

  const { broadcastUpdate, broadcastTyping, onlineUsers, typingUser } = useCollaboration({
    docId: document.id,
    currentUserId,
    onRemoteUpdate: applyServerUpdate,
  });

  useSync({
    docId: document.id,
    setSyncStatus,
    onSynced(newContent, newClock) {
      applyServerUpdate(newContent, newClock);
      broadcastUpdate(newContent, newClock);
    },
    onConflict(mergedContent, newClock) {
      applyServerUpdate(mergedContent, newClock);
      broadcastUpdate(mergedContent, newClock);
      toast.warning("Conflict resolved", {
        description: "Your offline changes overlapped with another user's edits. The document was auto-merged.",
        duration: 6000,
      });
    },
  });

  const handleChange = useCallback((html: string) => {
    handleContentChange(html);
    broadcastTyping();
  }, [handleContentChange, broadcastTyping]);

  async function saveTitle(newTitle: string) {
    const trimmed = newTitle.trim();
    if (!trimmed || trimmed === title) return;
    await fetch(`/api/documents/${document.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: trimmed }),
    });
  }

  function handleRestored(newContent: string, newClock: number) {
    applyServerUpdate(newContent, newClock);
    broadcastUpdate(newContent, newClock);
  }

  return (
    <div className="h-screen flex flex-col bg-white">
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
              onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
              className="text-lg font-semibold text-gray-900 bg-transparent border-none outline-none truncate w-full max-w-sm"
              aria-label="Document title"
            />
          ) : (
            <h1 className="text-lg font-semibold text-gray-900 truncate">{title}</h1>
          )}
        </div>

        <div className="flex items-center gap-2 ml-4 shrink-0">
          <PresenceAvatars users={onlineUsers} typingUser={typingUser} />
          <SyncStatusBadge status={syncStatus} />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPanel(panel === "versions" ? null : "versions")}
            aria-label="Version history"
          >
            <History className="h-4 w-4 mr-1.5" />
            <span className="hidden sm:inline">History</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPanel(panel === "collaborators" ? null : "collaborators")}
            aria-label="Share document"
          >
            <Users className="h-4 w-4 mr-1.5" />
            <span className="hidden sm:inline">Share</span>
          </Button>
        </div>
      </header>

      {canEdit && (
        <AIToolbar
          content={content}
          onApply={handleChange}
          onTitleChange={(t) => {
            setTitle(t);
            saveTitle(t);
          }}
        />
      )}

      <TiptapEditor
        content={content}
        editable={canEdit}
        onChange={handleChange}
      />

      {panel === "collaborators" && (
        <CollaboratorPanel
          documentId={document.id}
          isOwner={document.role === "OWNER"}
          onClose={() => setPanel(null)}
        />
      )}

      {panel === "versions" && (
        <VersionPanel
          documentId={document.id}
          onClose={() => setPanel(null)}
          onRestored={handleRestored}
        />
      )}
    </div>
  );
}
