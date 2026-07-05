export type UserRole = "OWNER" | "EDITOR" | "VIEWER";

export interface DocumentSummary {
  id: string;
  title: string;
  updatedAt: string;
  role: UserRole;
  ownerName: string;
}

export interface DocumentDetail {
  id: string;
  title: string;
  content: string;
  serverClock: number;
  role: UserRole;
  ownerId: string;
  ownerName: string;
  updatedAt: string;
}

export interface Collaborator {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface DocumentVersion {
  id: string;
  label: string | null;
  serverClock: number;
  createdAt: string;
  createdByName: string;
}

export interface SyncPayload {
  content: string;
  baseClock: number;
}

export interface SyncResult {
  content: string;
  serverClock: number;
  hadConflict: boolean;
}
