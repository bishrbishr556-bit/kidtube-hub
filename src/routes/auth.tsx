import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Log in or sign up — Playbox Kids" },
      { name: "description", content: "Grown-ups can log in or create an account for Playbox Kids." },
      { property: "og:title", content: "Log in or sign up — Playbox Kids" },
      { property: "og:description", content: "Grown-up accounts for Playbox Kids." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg(error.message);
      else nav({ to: "/account" });
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      setMsg(error ? error.message : "Check your email to confirm your account, then log in.");
    }
    setBusy(false);
  };

  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) return setMsg(r.error.message ?? "Google sign-in failed");
    if (r.redirected) return;
    nav({ to: "/account" });
  };

  const field =
    "mt-2 w-full rounded-2xl bg-secondary px-4 py-3 text-sm font-bold outline outline-foreground/10 focus:outline-2 focus:outline-brand";

  return (
    <div className="play-mesh grid min-h-screen place-items-center px-5">
      <div className="card-pop w-full max-w-md p-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground">
          <ArrowLeft className="size-4" /> Back
        </Link>
        <div className="mt-4 flex gap-2 rounded-full bg-secondary p-1">
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 rounded-full py-2 text-sm font-bold ${mode === m ? "bg-brand text-brand-foreground" : "text-muted-foreground"}`}
            >
              {m === "login" ? "Log In" : "Sign Up"}
            </button>
          ))}
        </div>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-xs font-bold uppercase text-muted-foreground">
            Email
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
          </label>
          <label className="block text-xs font-bold uppercase text-muted-foreground">
            Password
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className={field} />
          </label>
          <button disabled={busy} className="btn-chunky w-full py-3 active:btn-chunky-active disabled:opacity-60">
            {busy ? "Please wait…" : mode === "login" ? "Log In" : "Sign Up"}
          </button>
        </form>
        <div className="my-5 text-center text-xs font-bold text-muted-foreground">or</div>
        <button
          onClick={google}
          className="w-full rounded-full bg-card py-3 text-sm font-bold outline outline-foreground/15 hover:bg-secondary"
        >
          Continue with Google
        </button>
        {msg && <p className="mt-4 text-center text-sm font-bold text-muted-foreground">{msg}</p>}
      </div>
    </div>
  );
}
