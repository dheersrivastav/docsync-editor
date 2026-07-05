"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

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
    <Button onClick={createDocument} disabled={loading}>
      <Plus className="h-4 w-4 mr-2" />
      {loading ? "Creating..." : "New Document"}
    </Button>
  );
}
