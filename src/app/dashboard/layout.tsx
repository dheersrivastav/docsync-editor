import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const initials = session.user.name
    ? session.user.name.slice(0, 2).toUpperCase()
    : "??";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-semibold text-gray-900 text-lg">DocSync</span>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 outline-none">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:block">{session.user.name}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <form
                  action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/login" });
                  }}
                >
                  <button type="submit" className="w-full text-left text-sm">
                    Sign out
                  </button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>

      <footer className="border-t border-gray-200 mt-16 py-6 text-center text-sm text-gray-500">
        Built by{" "}
        <a
          href="https://github.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          Your Name
        </a>{" "}
        ·{" "}
        <a
          href="https://linkedin.com/in/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          LinkedIn
        </a>
      </footer>
    </div>
  );
}
