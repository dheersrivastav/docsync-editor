"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function NewDocumentButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function createDocument() {
    setLoading(true);
    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Untitled Document" }),
    });
    if (res.ok) {
      const doc = await res.json();
      router.push(`/editor/${doc.id}`);
    } else {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={createDocument}
      disabled={loading}
      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#6D28D9] hover:bg-[#5b21b6] text-white text-sm font-medium rounded-lg transition-colors duration-150 disabled:opacity-60"
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
      </svg>
      {loading ? "Creating..." : "New document"}
    </button>
  );
}
