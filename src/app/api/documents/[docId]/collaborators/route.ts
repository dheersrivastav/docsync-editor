import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserDocumentRole, canManage } from "@/lib/permissions";
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

  const collaborators = await prisma.documentCollaborator.findMany({
    where: { documentId: docId },
    select: {
      id: true,
      role: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json(
    collaborators.map((c) => ({
      id: c.id,
      userId: c.user.id,
      name: c.user.name,
      email: c.user.email,
      role: c.role,
    }))
  );
}

const addSchema = z.object({
  email: z.string().email(),
  role: z.enum(["EDITOR", "VIEWER"]),
});

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { docId } = await params;
  const role = await getUserDocumentRole(session.user.id, docId);
  if (!canManage(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = addSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const targetUser = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, name: true, email: true },
  });

  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (targetUser.id === session.user.id) {
    return NextResponse.json(
      { error: "You are already the owner" },
      { status: 400 }
    );
  }

  const collab = await prisma.documentCollaborator.upsert({
    where: { documentId_userId: { documentId: docId, userId: targetUser.id } },
    update: { role: parsed.data.role },
    create: { documentId: docId, userId: targetUser.id, role: parsed.data.role },
    select: {
      id: true,
      role: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json({
    id: collab.id,
    userId: collab.user.id,
    name: collab.user.name,
    email: collab.user.email,
    role: collab.role,
  }, { status: 201 });
}

const removeSchema = z.object({
  userId: z.string().cuid(),
});

export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { docId } = await params;
  const role = await getUserDocumentRole(session.user.id, docId);
  if (!canManage(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = removeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  await prisma.documentCollaborator.deleteMany({
    where: { documentId: docId, userId: parsed.data.userId },
  });

  return NextResponse.json({ success: true });
}
