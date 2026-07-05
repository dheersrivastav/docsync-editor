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

      <footer className="border-t border-[#E5E7EB] mt-20 py-6">
        <div className="max-w-5xl mx-auto px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#9CA3AF]">
          <span>DocSync — Local-first collaborative editor</span>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/dheersrivastav"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#111827] transition-colors duration-150"
            >
              Dheer Srivastava
            </a>
            <span>·</span>
            <a
              href="https://linkedin.com/in/dheer-srivastava"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#6D28D9] transition-colors duration-150"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
