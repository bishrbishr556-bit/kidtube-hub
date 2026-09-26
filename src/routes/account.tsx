import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { KidShell } from "@/components/KidShell";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Account — Playbox Kids" },
      { name: "description", content: "Manage your grown-up account on Playbox Kids." },
      { property: "og:title", content: "Account — Playbox Kids" },
      { property: "og:description", content: "Manage your grown-up account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Account,
});

function Account() {
  const { user, isAdmin, ready } = useAuth();
  const nav = useNavigate();
  return (
    <KidShell>
      <main className="mx-auto max-w-xl px-5">
        <div className="card-pop p-8">
          <h1 className="font-display text-2xl">Account</h1>
          {!ready ? null : user ? (
            <>
              <p className="mt-3 font-bold">{user.email}</p>
              <p className="text-sm font-bold text-muted-foreground">{isAdmin ? "Admin" : "Grown-up"}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/admin" className="btn-chunky px-5 py-3">Admin panel</Link>
                <Link to="/parent" className="rounded-full bg-secondary px-5 py-3 text-sm font-bold">Parent controls</Link>
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    nav({ to: "/auth", replace: true });
                  }}
                  className="rounded-full bg-secondary px-5 py-3 text-sm font-bold"
                >
                  Log out
                </button>
              </div>
            </>
          ) : (
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/auth" className="btn-chunky px-5 py-3">Log In</Link>
              <Link to="/auth" className="rounded-full bg-secondary px-5 py-3 text-sm font-bold">Sign Up</Link>
              <Link to="/auth" className="rounded-full bg-secondary px-5 py-3 text-sm font-bold">Continue with Google</Link>
            </div>
          )}
        </div>
      </main>
    </KidShell>
  );
}
