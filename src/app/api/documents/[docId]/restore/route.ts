import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserDocumentRole, canWrite } from "@/lib/permissions";
import { z } from "zod";

const schema = z.object({
  versionId: z.string().cuid(),
});

type Params = { params: Promise<{ docId: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { docId } = await params;
  const role = await getUserDocumentRole(session.user.id, docId);
  if (!canWrite(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const [doc, targetVersion] = await Promise.all([
    prisma.document.findUnique({
      where: { id: docId },
      select: { content: true, serverClock: true },
    }),
    prisma.documentVersion.findUnique({
      where: { id: parsed.data.versionId },
      select: { content: true, serverClock: true, documentId: true },
    }),
  ]);

  if (!doc || !targetVersion || targetVersion.documentId !== docId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Auto-snapshot the current state before overwriting
  await prisma.documentVersion.create({
    data: {
      documentId: docId,
      content: doc.content,
      serverClock: doc.serverClock,
      label: "Before restore",
      createdById: session.user.id,
    },
  });

  const updated = await prisma.document.update({
    where: { id: docId },
    data: {
      content: targetVersion.content,
      serverClock: { increment: 1 },
    },
    select: { content: true, serverClock: true },
  });

  // Notify other clients if Socket.IO is available
  const io = (globalThis as unknown as Record<string, unknown>).__io as import("socket.io").Server | undefined;
  if (io) {
    io.to(docId).emit("document-updated", {
      content: updated.content,
      serverClock: updated.serverClock,
      updatedBy: session.user.id,
    });
  }

  return NextResponse.json({
    content: updated.content,
    serverClock: updated.serverClock,
  });
}
