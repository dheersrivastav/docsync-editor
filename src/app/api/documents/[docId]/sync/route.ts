import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserDocumentRole, canWrite } from "@/lib/permissions";
import { mergeContent } from "@/lib/mergeContent";
import { z } from "zod";

const MAX_BYTES = 512 * 1024;

const syncSchema = z.object({
  content: z.string().max(MAX_BYTES, "Content too large"),
  baseClock: z.number().int().min(0),
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

  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BYTES + 1024) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = syncSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { content: clientContent, baseClock } = parsed.data;

  const doc = await prisma.document.findUnique({
    where: { id: docId },
    select: { content: true, serverClock: true },
  });

  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let finalContent: string;
  let hadConflict = false;

  if (baseClock === doc.serverClock) {
    finalContent = clientContent;
  } else {
    const baseVersion = await prisma.documentVersion.findFirst({
      where: { documentId: docId, serverClock: { lte: baseClock } },
      orderBy: { serverClock: "desc" },
      select: { content: true },
    });

    const result = mergeContent(baseVersion?.content ?? "", doc.content, clientContent);
    finalContent = result.merged;
    hadConflict = result.hadConflict;
  }

  const updated = await prisma.document.update({
    where: { id: docId },
    data: { content: finalContent, serverClock: { increment: 1 } },
    select: { content: true, serverClock: true },
  });

  // Notify other clients in the room via Socket.IO if server is available
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
    hadConflict,
  });
}
