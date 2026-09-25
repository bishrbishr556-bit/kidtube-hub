import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Home, Clapperboard, Radio, Shield, Download } from "lucide-react";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/shorts", label: "Shorts", icon: Clapperboard },
  { to: "/live", label: "Live", icon: Radio },
  { to: "/downloads", label: "Saved", icon: Download },
  { to: "/parent", label: "Grown-ups", icon: Shield },
] as const;

export function KidShell({ children }: { children: ReactNode }) {
  return (
    <div className="play-mesh min-h-screen pb-32">
      <header className="mx-auto flex max-w-7xl items-center gap-4 px-5 py-5">
        <Link to="/" className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-3xl bg-brand font-display text-2xl font-bold text-brand-foreground shadow-[0_5px_0_0_color-mix(in_oklch,var(--brand)_70%,black)]">
            P
          </span>
          <span className="leading-tight">
            <span className="block font-display text-xl font-bold">Playbox Kids</span>
            <span className="block text-xs font-semibold text-muted-foreground">
              safe videos for little ones
            </span>
          </span>
        </Link>
        <Link
          to="/admin"
          className="ml-auto rounded-full bg-card px-4 py-2 text-sm font-bold text-muted-foreground outline outline-foreground/10"
        >
          Admin
        </Link>
      </header>

      {children}

      <nav className="fixed bottom-5 left-1/2 z-40 -translate-x-1/2">
        <div className="flex items-center gap-2 rounded-full bg-foreground/90 p-2 backdrop-blur-md">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="flex size-16 flex-col items-center justify-center gap-1 rounded-full text-cream/70 transition-colors"
              activeProps={{ className: "bg-brand !text-brand-foreground" }}
            >
              <Icon className="size-6" />
              <span className="text-[10px] font-bold">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
