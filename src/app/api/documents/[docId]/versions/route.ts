import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserDocumentRole, canWrite } from "@/lib/permissions";
import { z } from "zod";

type Params = { params: Promise<{ docId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { docId } = await params;
  const role = await getUserDocumentRole(session.user.id, docId);
  if (!role) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const versions = await prisma.documentVersion.findMany({
    where: { documentId: docId },
    select: {
      id: true,
      label: true,
      serverClock: true,
      createdAt: true,
      createdBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    versions.map((v: {
      id: string;
      label: string | null;
      serverClock: number;
      createdAt: Date;
      createdBy: { name: string };
    }) => ({
      id: v.id,
      label: v.label,
      serverClock: v.serverClock,
      createdAt: v.createdAt.toISOString(),
      createdByName: v.createdBy.name,
    }))
  );
}

const createSchema = z.object({
  label: z.string().max(100).optional(),
});

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
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const doc = await prisma.document.findUnique({
    where: { id: docId },
    select: { content: true, serverClock: true },
  });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const version = await prisma.documentVersion.create({
    data: {
      documentId: docId,
      content: doc.content,
      serverClock: doc.serverClock,
      label: parsed.data.label ?? null,
      createdById: session.user.id,
    },
    select: {
      id: true,
      label: true,
      serverClock: true,
      createdAt: true,
      createdBy: { select: { name: true } },
    },
  });

  return NextResponse.json({
    id: version.id,
    label: version.label,
    serverClock: version.serverClock,
    createdAt: version.createdAt.toISOString(),
    createdByName: version.createdBy.name,
  }, { status: 201 });
}
