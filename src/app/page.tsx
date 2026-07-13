"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const DocIcon = ({ color = "#111" }: { color?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="14 2 14 8 20 8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="16" y1="13" x2="8" y2="13" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <line x1="16" y1="17" x2="8" y2="17" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export default function HomePage() {
  const [tab, setTab] = useState<"login" | "register">("login");

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* LEFT */}
      <div className="hidden lg:flex lg:w-[52%] flex-col justify-between p-16 bg-[#080808] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle at 30% 30%, rgba(124,58,237,0.18) 0%, transparent 65%)" }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-20">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <DocIcon color="#111" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">DocSync</span>
          </div>

          <div className="mb-12">
            <h1 className="font-extrabold text-white tracking-tight mb-5" style={{ fontSize: "3.5rem", lineHeight: 1.05 }}>
              Write anywhere.<br />
              <span className="text-gray-400">Sync everywhere.</span>
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed" style={{ maxWidth: "400px" }}>
              Local-first document editor with real-time collaboration, offline sync, conflict resolution, and version history.
            </p>
          </div>

          <div className="space-y-7">
            {[
              { n: "01", t: "Works offline — always", d: "Every keystroke saves locally. No network needed to write." },
              { n: "02", t: "Auto sync on reconnect", d: "Changes merge intelligently when you come back online." },
              { n: "03", t: "Real-time collaboration", d: "Invite teammates as Editors or Viewers. See edits live." },
            ].map((f) => (
              <div key={f.n} className="flex gap-5">
                <span className="text-gray-500 font-bold text-sm mt-0.5 w-8 shrink-0">{f.n}</span>
                <div>
                  <p className="text-white font-semibold text-base">{f.t}</p>
                  <p className="text-gray-400 text-sm mt-1 leading-relaxed">{f.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-sm text-gray-600">
          Built by{" "}
          <a href="https://github.com/dheersrivastav" target="_blank" rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors">Dheer Srivastava</a>
          {" · "}
          <a href="https://www.linkedin.com/in/dheer-srivastava" target="_blank" rel="noopener noreferrer"
            className="text-gray-400 hover:text-blue-400 transition-colors">LinkedIn</a>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex-1 bg-white flex items-center justify-center px-8 py-14">
        <div className="w-full max-w-[420px]">

          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-9 h-9 bg-gray-900 rounded-xl flex items-center justify-center">
              <DocIcon color="white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">DocSync</span>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-1.5">
            {tab === "login" ? "Welcome back" : "Create an account"}
          </h2>
          <p className="text-gray-400 text-base mb-8">
            {tab === "login" ? "Sign in to your workspace." : "Free forever. No credit card needed."}
          </p>

          <div className="flex bg-gray-100 rounded-2xl p-1 mb-8">
            {(["login", "register"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all duration-150 ${
                  tab === t ? "bg-gray-900 text-white shadow-sm" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {t === "login" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          {tab === "login"
            ? <LoginForm />
            : <RegisterForm onSuccess={() => setTab("login")} />
          }
        </div>
      </div>
    </div>
  );
}

function InputField({ label, type, placeholder, value, onChange, autoComplete }: {
  label: string; type: string; placeholder: string;
  value: string; onChange: (v: string) => void; autoComplete?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        autoComplete={autoComplete}
        className="w-full h-12 px-4 border border-gray-200 rounded-xl text-base text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
      />
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (result?.error) {
      setError("Invalid email or password.");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <InputField label="Email" type="email" placeholder="you@example.com" value={email} onChange={setEmail} autoComplete="email" />
      <InputField label="Password" type="password" placeholder="••••••••" value={password} onChange={setPassword} autoComplete="current-password" />
      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2.5 rounded-xl">{error}</p>}
      <button type="submit" disabled={loading}
        className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 text-base mt-1">
        {loading ? "Signing in…" : "Sign in →"}
      </button>
    </form>
  );
}

function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Something went wrong.");
    } else {
      onSuccess();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <InputField label="Full name" type="text" placeholder="John Doe" value={name} onChange={setName} autoComplete="name" />
      <InputField label="Email" type="email" placeholder="you@example.com" value={email} onChange={setEmail} autoComplete="email" />
      <InputField label="Password" type="password" placeholder="Min. 6 characters" value={password} onChange={setPassword} autoComplete="new-password" />
      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2.5 rounded-xl">{error}</p>}
      <button type="submit" disabled={loading}
        className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 text-base mt-1">
        {loading ? "Creating account…" : "Create account →"}
      </button>
    </form>
  );
}
