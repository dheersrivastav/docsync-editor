import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const [owned, collaborated] = await Promise.all([
    prisma.document.findMany({
      where: { ownerId: userId },
      select: {
        id: true,
        title: true,
        updatedAt: true,
        owner: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.documentCollaborator.findMany({
      where: { userId },
      select: {
        role: true,
        document: {
          select: {
            id: true,
            title: true,
            updatedAt: true,
            owner: { select: { name: true } },
          },
        },
      },
      orderBy: { document: { updatedAt: "desc" } },
    }),
  ]);

  const ownedDocs = owned.map((d: {
    id: string;
    title: string;
    updatedAt: Date;
    owner: { name: string };
  }) => ({
    id: d.id,
    title: d.title,
    updatedAt: d.updatedAt.toISOString(),
    role: "OWNER" as const,
    ownerName: d.owner.name,
  }));

  const collabDocs = collaborated.map((c: {
    role: string;
    document: { id: string; title: string; updatedAt: Date; owner: { name: string } };
  }) => ({
    id: c.document.id,
    title: c.document.title,
    updatedAt: c.document.updatedAt.toISOString(),
    role: c.role as "EDITOR" | "VIEWER",
    ownerName: c.document.owner.name,
  }));

  return NextResponse.json([...ownedDocs, ...collabDocs]);
}

const createSchema = z.object({
  title: z.string().min(1).max(200).optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const doc = await prisma.document.create({
    data: {
      title: parsed.data.title ?? "Untitled Document",
      ownerId: session.user.id,
    },
    select: { id: true, title: true },
  });

  return NextResponse.json(doc, { status: 201 });
}
