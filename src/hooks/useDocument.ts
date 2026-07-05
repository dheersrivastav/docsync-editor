"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getDB } from "@/lib/idb";
import type { UserRole } from "@/types";

export type SyncStatus = "synced" | "pending" | "conflict" | "offline";

interface ServerDoc {
  id: string;
  title: string;
  content: string;
  serverClock: number;
  role: UserRole;
}

export function useDocument(serverDoc: ServerDoc) {
  const [content, setContent] = useState(serverDoc.content);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("synced");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestContent = useRef(content);

  // Seed IDB on first load — server wins if its clock is newer
  useEffect(() => {
    async function init() {
      const db = getDB();
      const local = await db.documents.get(serverDoc.id);

      if (!local || serverDoc.serverClock >= local.serverClock) {
        await db.documents.put({
          id: serverDoc.id,
          title: serverDoc.title,
          content: serverDoc.content,
          serverClock: serverDoc.serverClock,
          updatedAt: Date.now(),
          syncStatus: "synced",
        });
        setContent(serverDoc.content);
        latestContent.current = serverDoc.content;
      } else {
        // Local has unsaved work — use it
        setContent(local.content);
        latestContent.current = local.content;
        if (local.syncStatus === "pending") setSyncStatus("pending");
      }
    }
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverDoc.id]);

  // Debounced autosave to IDB
  const handleContentChange = useCallback((html: string) => {
    setContent(html);
    latestContent.current = html;
    setSyncStatus("pending");

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const db = getDB();
      const local = await db.documents.get(serverDoc.id);
      await db.documents.put({
        id: serverDoc.id,
        title: serverDoc.title,
        content: html,
        serverClock: local?.serverClock ?? serverDoc.serverClock,
        updatedAt: Date.now(),
        syncStatus: "pending",
      });
    }, 800);
  }, [serverDoc.id, serverDoc.title, serverDoc.serverClock]);

  // Track online status
  useEffect(() => {
    function onOffline() { setSyncStatus("offline"); }
    function onOnline() {
      setSyncStatus((prev) => (prev === "offline" ? "pending" : prev));
    }
    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);
    if (!navigator.onLine) setSyncStatus("offline");
    return () => {
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
  }, []);

  return { content, syncStatus, setSyncStatus, handleContentChange };
}
