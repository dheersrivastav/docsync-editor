import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { signOut } from "@/lib/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, ChevronDown } from "lucide-react";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const initials = session.user.name?.slice(0, 2).toUpperCase() ?? "??";

  return (
    <div className="min-h-screen bg-[#FAFAFB]">
      <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#6D28D9] rounded-lg flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="14 2 14 8 20 8" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="16" y1="13" x2="8" y2="13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <line x1="16" y1="17" x2="8" y2="17" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-sm font-semibold text-[#111827] tracking-tight">DocSync</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 outline-none group">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-xs bg-[#6D28D9] text-white font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:block text-sm text-[#374151] font-medium group-hover:text-[#111827] transition-colors">
                {session.user.name}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-[#9CA3AF] hidden sm:block" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-xl border-[#E5E7EB]">
              <div className="px-3 py-2.5">
                <p className="text-xs font-semibold text-[#111827] truncate">{session.user.name}</p>
                <p className="text-xs text-[#6B7280] truncate mt-0.5">{session.user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="rounded-lg mx-1 cursor-pointer">
                <form
                  action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/login" });
                  }}
                >
                  <button type="submit" className="flex items-center gap-2 w-full text-left text-sm text-[#374151]">
                    <LogOut className="h-3.5 w-3.5 text-[#9CA3AF]" />
                    Sign out
                  </button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-10">{children}</main>

      <footer className="border-t border-gray-100 mt-20 py-6">
        <div className="max-w-5xl mx-auto px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-400">
          <span className="text-gray-400">DocSync — Local-first collaborative editor</span>
          <div className="flex items-center gap-5">
            <a
              href="https://github.com/dheersrivastav"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors duration-150"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              <span className="font-medium">Dheer Srivastava</span>
            </a>
            <a
              href="https://www.linkedin.com/in/dheer-srivastava"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors duration-150"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <span className="font-medium">LinkedIn</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
