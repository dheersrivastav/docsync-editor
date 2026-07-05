"use client";

import { useEffect, useRef, useCallback } from "react";
import { getDB } from "@/lib/idb";
import type { SyncStatus } from "@/hooks/useDocument";

const MAX_ATTEMPTS = 3;
const BACKOFF = [1000, 2000, 4000];

interface UseSyncOptions {
  docId: string;
  onSynced: (content: string, serverClock: number) => void;
  onConflict: (content: string, serverClock: number) => void;
  setSyncStatus: (s: SyncStatus) => void;
}

export function useSync({ docId, onSynced, onConflict, setSyncStatus }: UseSyncOptions) {
  const isSyncing = useRef(false);

  const flush = useCallback(async () => {
    if (isSyncing.current || !navigator.onLine) return;

    const db = getDB();
    const ops = await db.pendingOps.where("docId").equals(docId).sortBy("timestamp");
    if (ops.length === 0) return;

    isSyncing.current = true;

    const latest = ops[ops.length - 1];
    const allIds = ops.map((o) => o.id).filter((id): id is number => id !== undefined);

    let attempt = 0;

    while (attempt < MAX_ATTEMPTS) {
      try {
        const res = await fetch(`/api/documents/${docId}/sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: latest.content, baseClock: latest.baseClock }),
        });

        if (res.ok) {
          const data = await res.json();

          await db.documents.update(docId, {
            content: data.content,
            serverClock: data.serverClock,
            syncStatus: "synced",
            updatedAt: Date.now(),
          });

          await db.pendingOps.bulkDelete(allIds);

          if (data.hadConflict) {
            onConflict(data.content, data.serverClock);
          } else {
            onSynced(data.content, data.serverClock);
          }

          setSyncStatus("synced");
          break;
        }

        if (res.status === 401 || res.status === 403) {
          await db.pendingOps.bulkDelete(allIds);
          break;
        }

        attempt++;
        if (attempt < MAX_ATTEMPTS) await sleep(BACKOFF[attempt - 1]);
      } catch {
        attempt++;
        if (attempt < MAX_ATTEMPTS) await sleep(BACKOFF[attempt - 1]);
      }
    }

    if (attempt >= MAX_ATTEMPTS) {
      await db.documents.update(docId, { syncStatus: "conflict" });
      setSyncStatus("conflict");
    }

    isSyncing.current = false;
  }, [docId, onSynced, onConflict, setSyncStatus]);

  useEffect(() => {
    flush();
    window.addEventListener("online", flush);
    return () => window.removeEventListener("online", flush);
  }, [flush]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (navigator.onLine) flush();
    }, 30_000);
    return () => clearInterval(interval);
  }, [flush]);

  return { flush };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
