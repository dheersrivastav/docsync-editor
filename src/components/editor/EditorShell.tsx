"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Users, History } from "lucide-react";
import { toast } from "sonner";
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

type Panel = "collaborators" | "versions" | null;

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

function HeaderButton({
  onClick,
  children,
  label,
}: {
  onClick: () => void;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#374151] border border-[#E5E7EB] rounded-lg hover:border-[#6D28D9] hover:text-[#6D28D9] transition-colors duration-150 bg-white"
    >
      {children}
    </button>
  );
}

export function EditorShell({ document, currentUserId, currentUserName }: Props) {
  const [title, setTitle] = useState(document.title);
  const [panel, setPanel] = useState<Panel>(null);
  const canEdit = document.role === "OWNER" || document.role === "EDITOR";

  const { content, syncStatus, setSyncStatus, handleContentChange, applyServerUpdate } = useDocument({
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
        description: "Your offline changes were auto-merged with server edits.",
        duration: 5000,
      });
    },
  });

  const handleChange = useCallback((html: string) => {
    handleContentChange(html);
    broadcastTyping();
  }, [handleContentChange, broadcastTyping]);

  async function saveTitle(newTitle: string) {
    const trimmed = newTitle.trim();
    if (!trimmed || trimmed === document.title) return;
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
      {/* Header */}
      <header className="h-14 border-b border-[#E5E7EB] px-6 flex items-center justify-between shrink-0 bg-white">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Link
            href="/dashboard"
            className="p-1.5 rounded-md text-[#9CA3AF] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors duration-150 shrink-0"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div className="w-px h-5 bg-[#E5E7EB] shrink-0" />

          {canEdit ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={(e) => saveTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
              className="text-base font-semibold text-[#111827] bg-transparent outline-none border-none truncate w-full max-w-md focus:text-[#6D28D9] transition-colors"
              aria-label="Document title"
            />
          ) : (
            <h1 className="text-base font-semibold text-[#111827] truncate">{title}</h1>
          )}
        </div>

        <div className="flex items-center gap-2.5 ml-4 shrink-0">
          <PresenceAvatars users={onlineUsers} typingUser={typingUser} />
          <SyncStatusBadge status={syncStatus} />
          <HeaderButton onClick={() => setPanel(panel === "versions" ? null : "versions")} label="Version history">
            <History className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-sm">History</span>
          </HeaderButton>
          <HeaderButton onClick={() => setPanel(panel === "collaborators" ? null : "collaborators")} label="Share document">
            <Users className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-sm">Share</span>
          </HeaderButton>
        </div>
      </header>

      {canEdit && (
        <AIToolbar
          content={content}
          onApply={handleChange}
          onTitleChange={(t) => { setTitle(t); saveTitle(t); }}
        />
      )}

      <TiptapEditor content={content} editable={canEdit} onChange={handleChange} />

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
