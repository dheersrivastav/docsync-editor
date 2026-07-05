"use client";

import { Cloud, CloudOff, Loader2, AlertTriangle } from "lucide-react";
import type { SyncStatus } from "@/hooks/useDocument";

const config: Record<SyncStatus, { icon: React.ReactNode; label: string; className: string }> = {
  synced: {
    icon: <Cloud className="h-3 w-3" />,
    label: "Saved",
    className: "text-[#22C55E] bg-[#F0FDF4] border-[#BBF7D0]",
  },
  pending: {
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
    label: "Saving",
    className: "text-[#6D28D9] bg-[#F5F3FF] border-[#DDD6FE]",
  },
  offline: {
    icon: <CloudOff className="h-3 w-3" />,
    label: "Offline",
    className: "text-[#6B7280] bg-[#F9FAFB] border-[#E5E7EB]",
  },
  conflict: {
    icon: <AlertTriangle className="h-3 w-3" />,
    label: "Conflict",
    className: "text-[#EF4444] bg-[#FEF2F2] border-[#FECACA]",
  },
};

export function SyncStatusBadge({ status }: { status: SyncStatus }) {
  const { icon, label, className } = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${className}`}>
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </span>
  );
}
