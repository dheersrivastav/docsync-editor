import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200">
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
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center py-20">
        <div className="w-14 h-14 bg-violet-600 rounded-2xl flex items-center justify-center mb-6">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="14 2 14 8 20 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="16" y1="13" x2="8" y2="13" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            <line x1="16" y1="17" x2="8" y2="17" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">
          Collaborate on documents,<br />even offline.
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mb-10">
          DocSync is a local-first document editor. Write without internet, sync automatically when you reconnect, and collaborate in real-time with your team.
        </p>

        <div className="flex items-center gap-3">
          <Link
            href="/register"
            className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-xl transition-colors text-sm"
          >
            Create free account
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 bg-white border border-gray-200 hover:border-violet-300 hover:text-violet-700 text-gray-700 font-medium rounded-xl transition-colors text-sm"
          >
            Sign in
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl w-full text-left">
          {[
            {
              step: "1",
              title: "Create an account",
              desc: "Sign up with your email. Free to use, no credit card needed.",
            },
            {
              step: "2",
              title: "Create a document",
              desc: "Start writing instantly. Everything saves locally — no network needed.",
            },
            {
              step: "3",
              title: "Invite collaborators",
              desc: "Share with teammates as Editor or Viewer. Changes sync in real-time.",
            },
          ].map((item) => (
            <div key={item.step} className="bg-white border border-gray-200 rounded-2xl p-5">
              <div className="w-7 h-7 bg-violet-50 text-violet-600 rounded-lg flex items-center justify-center text-sm font-bold mb-3">
                {item.step}
              </div>
              <p className="text-sm font-semibold text-gray-900 mb-1">{item.title}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-gray-200 py-5 text-center text-xs text-gray-400">
        Built by{" "}
        <a href="https://github.com/dheersrivastav" target="_blank" rel="noopener noreferrer" className="hover:text-gray-700">
          Dheer Srivastava
        </a>{" "}
        ·{" "}
        <a href="https://www.linkedin.com/in/dheer-srivastava" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
          LinkedIn
        </a>
      </footer>
    </div>
  );
}
