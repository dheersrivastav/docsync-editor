import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { NewDocumentButton } from "@/components/dashboard/NewDocumentButton";
import { DeleteDocumentButton } from "@/components/dashboard/DeleteDocumentButton";
import { FileText } from "lucide-react";

async function getDocuments(userId: string) {
  const [owned, collaborated] = await Promise.all([
    prisma.document.findMany({
      where: { ownerId: userId },
      select: { id: true, title: true, updatedAt: true, owner: { select: { name: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.documentCollaborator.findMany({
      where: { userId },
      select: {
        role: true,
        document: {
          select: { id: true, title: true, updatedAt: true, owner: { select: { name: true } } },
        },
      },
      orderBy: { document: { updatedAt: "desc" } },
    }),
  ]);

  const docs = [
    ...owned.map((d) => ({ ...d, role: "OWNER" as const, updatedAt: d.updatedAt, ownerName: d.owner.name })),
    ...collaborated.map((c) => ({
      ...c.document,
      role: c.role as "EDITOR" | "VIEWER",
      ownerName: c.document.owner.name,
    })),
  ];

  return docs.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

const roleBadgeStyle: Record<string, string> = {
  OWNER: "bg-blue-100 text-blue-700",
  EDITOR: "bg-green-100 text-green-700",
  VIEWER: "bg-gray-100 text-gray-600",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const docs = await getDocuments(session.user.id);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Documents</h1>
        <NewDocumentButton />
      </div>

      {docs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center text-gray-500">
          <FileText className="h-12 w-12 mb-4 text-gray-300" />
          <p className="text-lg font-medium">No documents yet</p>
          <p className="text-sm mt-1">Create your first document to get started</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {docs.map((doc) => (
            <Card key={doc.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="flex items-center justify-between p-4">
                <Link
                  href={`/editor/${doc.id}`}
                  className="flex items-center gap-3 flex-1 min-w-0"
                >
                  <FileText className="h-5 w-5 text-gray-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{doc.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      by {doc.ownerName} ·{" "}
                      {formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })}
                    </p>
                  </div>
                </Link>

                <div className="flex items-center gap-3 ml-4 shrink-0">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${roleBadgeStyle[doc.role]}`}
                  >
                    {doc.role}
                  </span>
                  {doc.role === "OWNER" && (
                    <DeleteDocumentButton docId={doc.id} />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
