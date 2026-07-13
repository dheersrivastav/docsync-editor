"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, LogOut } from "lucide-react";

interface Props {
  name: string;
  email: string;
}

export function DashboardHeader({ name, email }: Props) {
  const [loggingOut, setLoggingOut] = useState(false);
  const initials = name.slice(0, 2).toUpperCase();

  async function handleSignOut() {
    setLoggingOut(true);
    await signOut({ callbackUrl: "/login" });
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="14 2 14 8 20 8" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="16" y1="13" x2="8" y2="13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <line x1="16" y1="17" x2="8" y2="17" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-sm font-semibold text-gray-900 tracking-tight">DocSync</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 outline-none group">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-xs bg-violet-600 text-white font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:block text-sm text-gray-700 font-medium group-hover:text-gray-900 transition-colors">
              {name}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-gray-400 hidden sm:block" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 rounded-xl">
            <div className="px-3 py-2.5">
              <p className="text-xs font-semibold text-gray-900 truncate">{name}</p>
              <p className="text-xs text-gray-500 truncate mt-0.5">{email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="rounded-lg mx-1 cursor-pointer p-0">
              <button
                onClick={handleSignOut}
                disabled={loggingOut}
                className="flex items-center gap-2 w-full text-left text-sm text-gray-700 px-2 py-1.5 disabled:opacity-60"
              >
                {loggingOut ? (
                  <svg className="h-3.5 w-3.5 animate-spin text-gray-400" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/>
                    <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" className="opacity-75"/>
                  </svg>
                ) : (
                  <LogOut className="h-3.5 w-3.5 text-gray-400" />
                )}
                {loggingOut ? "Signing out..." : "Sign out"}
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
