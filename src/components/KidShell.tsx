import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  Home,
  Video,
  Play,
  Tag,
  Bookmark,
  User,
  Radio,
  Download,
  Shield,
} from "lucide-react";

const sideItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/videos", label: "Videos", icon: Video },
  { to: "/shorts", label: "Shorts", icon: Play },
  { to: "/category", label: "Categories", icon: Tag },
  { to: "/favorites", label: "Favorites", icon: Bookmark },
  { to: "/live", label: "Live", icon: Radio },
  { to: "/downloads", label: "Downloads", icon: Download },
  { to: "/parent", label: "Grown-ups", icon: Shield },
  { to: "/account", label: "Account", icon: User },
] as const;

const bottomItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/videos", label: "Videos", icon: Video },
  { to: "/shorts", label: "Shorts", icon: Play },
  { to: "/downloads", label: "Saved", icon: Download },
  { to: "/account", label: "Account", icon: User },
] as const;

export function KidShell({ children }: { children: ReactNode }) {
  return (
    <div className="play-mesh min-h-screen pb-32 lg:pb-10 lg:pl-60">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col gap-1 border-r border-foreground/10 bg-card/80 p-4 backdrop-blur-md lg:flex">
        <Link to="/" className="mb-6 flex items-center gap-3 px-2">
          <span className="grid size-10 place-items-center rounded-2xl bg-brand font-display text-xl font-bold text-brand-foreground">
            P
          </span>
          <span className="font-display text-lg font-bold">Playbox Kids</span>
        </Link>
        {sideItems.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: to === "/" }}
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-muted-foreground transition-colors hover:bg-secondary"
            activeProps={{ className: "bg-brand/15 !text-foreground outline outline-brand/30" }}
          >
            <Icon className="size-5" />
            {label}
          </Link>
        ))}
        <Link
          to="/admin"
          className="mt-auto rounded-2xl px-4 py-3 text-sm font-bold text-muted-foreground hover:bg-secondary"
        >
          Admin panel
        </Link>
      </aside>

      <header className="mx-auto flex max-w-7xl items-center gap-4 px-5 py-5">
        <Link to="/" className="flex items-center gap-3 lg:hidden">
          <span className="grid size-12 place-items-center rounded-3xl bg-brand font-display text-2xl font-bold text-brand-foreground">
            P
          </span>
          <span className="block font-display text-xl font-bold">Playbox Kids</span>
        </Link>
        <Link
          to="/category"
          search={{ cat: undefined }}
          className="ml-auto rounded-full bg-card px-4 py-2 text-sm font-bold text-muted-foreground outline outline-foreground/10 lg:hidden"
        >
          Categories
        </Link>
      </header>

      {children}

      <nav className="fixed bottom-5 left-1/2 z-40 -translate-x-1/2 lg:hidden">
        <div className="flex items-center gap-2 rounded-full bg-foreground/90 p-2 backdrop-blur-md">
          {bottomItems.map(({ to, label, icon: Icon }) => (
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
