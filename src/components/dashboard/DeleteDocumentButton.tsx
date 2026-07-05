"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function DeleteDocumentButton({ docId }: { docId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this document? This cannot be undone.")) return;
    setLoading(true);

    await fetch(`/api/documents/${docId}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded"
      aria-label="Delete document"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
