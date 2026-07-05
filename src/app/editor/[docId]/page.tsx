import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getUserDocumentRole } from "@/lib/permissions";
import { EditorShell } from "@/components/editor/EditorShell";

type Props = { params: Promise<{ docId: string }> };

export async function generateMetadata({ params }: Props) {
  const { docId } = await params;
  const doc = await prisma.document.findUnique({
    where: { id: docId },
    select: { title: true },
  });
  return { title: doc?.title ?? "Document" };
}

export default async function EditorPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { docId } = await params;
  const role = await getUserDocumentRole(session.user.id, docId);
  if (!role) notFound();

  const doc = await prisma.document.findUnique({
    where: { id: docId },
    select: {
      id: true,
      title: true,
      content: true,
      serverClock: true,
      ownerId: true,
      owner: { select: { name: true } },
    },
  });

  if (!doc) notFound();

  return (
    <EditorShell
      document={{
        id: doc.id,
        title: doc.title,
        content: doc.content,
        serverClock: doc.serverClock,
        ownerId: doc.ownerId,
        ownerName: doc.owner.name,
        role,
      }}
      currentUserId={session.user.id}
      currentUserName={session.user.name ?? ""}
    />
  );
}
