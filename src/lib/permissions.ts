import { prisma } from "@/lib/prisma";

export type DocumentRole = "OWNER" | "EDITOR" | "VIEWER";

export async function getUserDocumentRole(
  userId: string,
  documentId: string
): Promise<DocumentRole | null> {
  const doc = await prisma.document.findUnique({
    where: { id: documentId },
    select: {
      ownerId: true,
      collaborators: {
        where: { userId },
        select: { role: true },
      },
    },
  });

  if (!doc) return null;
  if (doc.ownerId === userId) return "OWNER";
  if (doc.collaborators.length > 0) return doc.collaborators[0].role as DocumentRole;
  return null;
}

export function canWrite(role: DocumentRole | null): boolean {
  return role === "OWNER" || role === "EDITOR";
}

export function canManage(role: DocumentRole | null): boolean {
  return role === "OWNER";
}
