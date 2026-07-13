"use client";

import { Cloud, CloudOff, Loader2, AlertTriangle } from "lucide-react";
import type { SyncStatus } from "@/hooks/useDocument";

const config: Record<SyncStatus, { icon: React.ReactNode; label: string; className: string }> = {
  synced: {
    icon: <Cloud className="h-3.5 w-3.5" />,
    label: "Saved",
    className: "text-emerald-600 bg-emerald-50 border-emerald-200",
  },
  pending: {
    icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
    label: "Saving",
    className: "text-gray-900 bg-gray-100 border-gray-200",
  },
  offline: {
    icon: <CloudOff className="h-3.5 w-3.5" />,
    label: "Offline",
    className: "text-amber-600 bg-amber-50 border-amber-200",
  },
  conflict: {
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
    label: "Conflict",
    className: "text-red-600 bg-red-50 border-red-200",
  },
};

export function SyncStatusBadge({ status }: { status: SyncStatus }) {
  const { icon, label, className } = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border ${className}`}>
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </span>
  );
}
