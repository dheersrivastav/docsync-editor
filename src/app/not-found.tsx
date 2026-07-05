import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-5xl font-bold text-gray-200 mb-4">404</p>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Page not found</h1>
        <p className="text-sm text-gray-500 mb-6">
          This document doesn&apos;t exist or you don&apos;t have access to it.
        </p>
        <Button>
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
