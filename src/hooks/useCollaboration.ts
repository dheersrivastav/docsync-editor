"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getSocket } from "@/lib/socket";

export interface OnlineUser {
  userId: string;
  userName: string;
}

interface UseCollaborationOptions {
  docId: string;
  currentUserId: string;
  onRemoteUpdate: (content: string, serverClock: number) => void;
}

export function useCollaboration({ docId, currentUserId, onRemoteUpdate }: UseCollaborationOptions) {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const socket = getSocket();

    socket.emit("join-document", docId);

    socket.on("presence-update", ({ userId, userName, online }: OnlineUser & { online: boolean }) => {
      if (userId === currentUserId) return;
      setOnlineUsers((prev) => {
        if (online) {
          const exists = prev.find((u) => u.userId === userId);
          return exists ? prev : [...prev, { userId, userName }];
        }
        return prev.filter((u) => u.userId !== userId);
      });
    });

    socket.on("user-joined", ({ userId, userName }: OnlineUser) => {
      if (userId === currentUserId) return;
      setOnlineUsers((prev) => {
        const exists = prev.find((u) => u.userId === userId);
        return exists ? prev : [...prev, { userId, userName }];
      });
    });

    socket.on("document-updated", ({ content, serverClock, updatedBy }: {
      content: string;
      serverClock: number;
      updatedBy: string;
    }) => {
      if (updatedBy === currentUserId) return;
      onRemoteUpdate(content, serverClock);
    });

    socket.on("user-typing", ({ userId, userName }: OnlineUser) => {
      if (userId === currentUserId) return;
      setTypingUser(userName);
      if (typingTimer.current) clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => setTypingUser(null), 2500);
    });

    return () => {
      socket.emit("leave-document", docId);
      socket.off("presence-update");
      socket.off("user-joined");
      socket.off("document-updated");
      socket.off("user-typing");
    };
  }, [docId, currentUserId, onRemoteUpdate]);

  const broadcastUpdate = useCallback((content: string, serverClock: number) => {
    const socket = getSocket();
    socket.emit("document-updated", { docId, content, serverClock });
  }, [docId]);

  const broadcastTyping = useCallback(() => {
    const socket = getSocket();
    socket.emit("typing", docId);
  }, [docId]);

  return { onlineUsers, typingUser, broadcastUpdate, broadcastTyping };
}
