import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserDocumentRole, canWrite, canManage } from "@/lib/permissions";
import { z } from "zod";

type Params = { params: Promise<{ docId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { docId } = await params;
  const role = await getUserDocumentRole(session.user.id, docId);
  if (!role) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const doc = await prisma.document.findUnique({
    where: { id: docId },
    select: {
      id: true,
      title: true,
      content: true,
      serverClock: true,
      ownerId: true,
      updatedAt: true,
      owner: { select: { name: true } },
    },
  });

  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: doc.id,
    title: doc.title,
    content: doc.content,
    serverClock: doc.serverClock,
    ownerId: doc.ownerId,
    ownerName: doc.owner.name,
    updatedAt: doc.updatedAt.toISOString(),
    role,
  });
}

const patchSchema = z.object({
  title: z.string().min(1).max(200),
});

export async function PATCH(req: NextRequest, { params }: Params) {
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
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const doc = await prisma.document.update({
    where: { id: docId },
    data: { title: parsed.data.title },
    select: { id: true, title: true },
  });

  return NextResponse.json(doc);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { docId } = await params;
  const role = await getUserDocumentRole(session.user.id, docId);
  if (!canManage(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.document.delete({ where: { id: docId } });

  return NextResponse.json({ success: true });
}
