"use client";

import { Cloud, CloudOff, Loader2, AlertTriangle } from "lucide-react";
import type { SyncStatus } from "@/hooks/useDocument";

const config: Record<SyncStatus, { icon: React.ReactNode; label: string; className: string }> = {
  synced: {
    icon: <Cloud className="h-3.5 w-3.5" />,
    label: "Saved",
    className: "text-green-600",
  },
  pending: {
    icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
    label: "Saving...",
    className: "text-blue-500",
  },
  offline: {
    icon: <CloudOff className="h-3.5 w-3.5" />,
    label: "Offline",
    className: "text-gray-400",
  },
  conflict: {
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
    label: "Conflict",
    className: "text-amber-500",
  },
};

export function SyncStatusBadge({ status }: { status: SyncStatus }) {
  const { icon, label, className } = config[status];
  return (
    <span className={`flex items-center gap-1 text-xs font-medium ${className}`}>
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </span>
  );
}
