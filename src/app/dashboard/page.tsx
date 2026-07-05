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
  OWNER:  "text-[#6D28D9] bg-[#F5F3FF] border border-[#DDD6FE]",
  EDITOR: "text-[#22C55E] bg-[#F0FDF4] border border-[#BBF7D0]",
  VIEWER: "text-[#6B7280] bg-[#F9FAFB] border border-[#E5E7EB]",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const docs = await getDocuments(session.user.id);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[#111827]">Documents</h1>
          <p className="text-sm text-[#6B7280] mt-1">
            {docs.length === 0 ? "No documents yet" : `${docs.length} document${docs.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <NewDocumentButton />
      </div>

      {docs.length === 0 ? (
        <div className="border border-dashed border-[#E5E7EB] rounded-2xl flex flex-col items-center justify-center py-20 text-center bg-white">
          <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] flex items-center justify-center mb-4">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#6D28D9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="14 2 14 8 20 8" stroke="#6D28D9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="16" y1="13" x2="8" y2="13" stroke="#6D28D9" strokeWidth="1.8" strokeLinecap="round"/>
              <line x1="16" y1="17" x2="8" y2="17" stroke="#6D28D9" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="text-sm font-medium text-[#111827]">No documents yet</p>
          <p className="text-xs text-[#6B7280] mt-1 mb-5">Create your first document to get started</p>
          <NewDocumentButton />
        </div>
      ) : (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden divide-y divide-[#F3F4F6]">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="group flex items-center gap-4 px-6 py-4 hover:bg-[#FAFAFB] transition-colors duration-150"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[#9CA3AF] group-hover:text-[#6D28D9] transition-colors duration-150">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>

              <Link href={`/editor/${doc.id}`} className="flex-1 min-w-0">
                <p className="text-base font-medium text-[#111827] truncate group-hover:text-[#6D28D9] transition-colors duration-150">
                  {doc.title}
                </p>
                <p className="text-sm text-[#9CA3AF] mt-0.5">
                  {doc.role === "OWNER" ? "You" : doc.ownerName} · edited {formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })}
                </p>
              </Link>

              <div className="flex items-center gap-2.5 shrink-0">
                <span className={`text-sm font-medium px-3 py-1 rounded-full ${roleBadge[doc.role]}`}>
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
