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
  const clockRef = useRef(serverDoc.serverClock);

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
        clockRef.current = serverDoc.serverClock;
      } else {
        setContent(local.content);
        clockRef.current = local.serverClock;
        if (local.syncStatus === "pending") setSyncStatus("pending");
      }
    }
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverDoc.id]);

  const handleContentChange = useCallback((html: string) => {
    setContent(html);
    setSyncStatus("pending");

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const db = getDB();
      const local = await db.documents.get(serverDoc.id);
      const clock = local?.serverClock ?? clockRef.current;

      await db.documents.put({
        id: serverDoc.id,
        title: serverDoc.title,
        content: html,
        serverClock: clock,
        updatedAt: Date.now(),
        syncStatus: "pending",
      });

      await db.pendingOps.add({
        docId: serverDoc.id,
        content: html,
        baseClock: clock,
        timestamp: Date.now(),
        attempts: 0,
      });
    }, 800);
  }, [serverDoc.id, serverDoc.title]);

  const applyServerUpdate = useCallback((newContent: string, newClock: number) => {
    setContent(newContent);
    clockRef.current = newClock;
    setSyncStatus("synced");
  }, []);

  useEffect(() => {
    function onOffline() {
      setSyncStatus("offline");
    }
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

  return { content, syncStatus, setSyncStatus, handleContentChange, applyServerUpdate };
}
