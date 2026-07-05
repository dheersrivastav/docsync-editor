import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { NewDocumentButton } from "@/components/dashboard/NewDocumentButton";
import { DeleteDocumentButton } from "@/components/dashboard/DeleteDocumentButton";

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

  return [
    ...owned.map((d) => ({ ...d, role: "OWNER" as const, ownerName: d.owner.name })),
    ...collaborated.map((c) => ({
      ...c.document,
      role: c.role as "EDITOR" | "VIEWER",
      ownerName: c.document.owner.name,
    })),
  ].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

const roleBadge: Record<string, string> = {
  OWNER:  "text-violet-600 bg-violet-50 border border-violet-200",
  EDITOR: "text-emerald-600 bg-emerald-50 border border-emerald-200",
  VIEWER: "text-gray-500 bg-gray-50 border border-gray-200",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const docs = await getDocuments(session.user.id);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Documents</h1>
          <p className="text-sm text-gray-500 mt-1">
            {docs.length === 0 ? "No documents yet" : `${docs.length} document${docs.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <NewDocumentButton />
      </div>

      {docs.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center py-24 text-center bg-white">
          <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center mb-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#7C3AED" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="14 2 14 8 20 8" stroke="#7C3AED" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="16" y1="13" x2="8" y2="13" stroke="#7C3AED" strokeWidth="1.8" strokeLinecap="round"/>
              <line x1="16" y1="17" x2="8" y2="17" stroke="#7C3AED" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="text-base font-medium text-gray-900">No documents yet</p>
          <p className="text-sm text-gray-400 mt-1 mb-6">Create your first document to get started</p>
          <NewDocumentButton />
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100 shadow-sm">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="group flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
            >
              <svg
                width="18" height="18" viewBox="0 0 24 24" fill="none"
                className="shrink-0 text-gray-300 group-hover:text-violet-400 transition-colors duration-150"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>

              <Link href={`/editor/${doc.id}`} className="flex-1 min-w-0">
                <p className="text-[15px] font-medium text-gray-900 truncate group-hover:text-violet-700 transition-colors duration-150">
                  {doc.title}
                </p>
                <p className="text-sm text-gray-400 mt-0.5">
                  {doc.role === "OWNER" ? "You" : doc.ownerName} · edited {formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })}
                </p>
              </Link>

              <div className="flex items-center gap-3 shrink-0">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${roleBadge[doc.role]}`}>
                  {doc.role.charAt(0) + doc.role.slice(1).toLowerCase()}
                </span>
                {doc.role === "OWNER" && <DeleteDocumentButton docId={doc.id} />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
