import Dexie, { type Table } from "dexie";

export interface LocalDocument {
  id: string;
  title: string;
  content: string;
  serverClock: number;
  updatedAt: number; // epoch ms
  syncStatus: "synced" | "pending" | "conflict";
}

export interface PendingOp {
  id?: number; // auto-increment
  docId: string;
  content: string;
  baseClock: number;
  timestamp: number;
  attempts: number;
}

class EditorDB extends Dexie {
  documents!: Table<LocalDocument, string>;
  pendingOps!: Table<PendingOp, number>;

  constructor() {
    super("edtech-editor");
    this.version(1).stores({
      documents: "id, updatedAt, syncStatus",
      pendingOps: "++id, docId, timestamp",
    });
  }
}

// Singleton — safe to import anywhere on the client
let db: EditorDB;

export function getDB(): EditorDB {
  if (!db) db = new EditorDB();
  return db;
}
