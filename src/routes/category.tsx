import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import { KidShell } from "@/components/KidShell";
import { VideoCard } from "@/components/VideoCard";
import { CATEGORIES, isAllowed, videosQuery } from "@/lib/kids";
import { useParentSettings } from "@/hooks/useParentSettings";

const searchSchema = z.object({
  cat: z.string().optional(),
});

export const Route = createFileRoute("/category")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Browse categories — Playbox Kids" },
      {
        name: "description",
        content: "Pick a category to see all its videos — cartoons, stories, learning, live shows and more.",
      },
      { property: "og:title", content: "Browse categories — Playbox Kids" },
      {
        property: "og:description",
        content: "Pick a category to see all its videos — cartoons, stories, learning, live shows and more.",
      },
    ],
  }),
  component: CategoryPage,
});

function CategoryPage() {
  const { cat } = Route.useSearch();
  const { data } = useQuery(videosQuery);
  const { settings } = useParentSettings();

  const active = cat && CATEGORIES.includes(cat as (typeof CATEGORIES)[number]) ? cat : "All";

  const all = (data ?? []).filter((v) => v.published && isAllowed(v, settings));
  const shown = active === "All" ? all : all.filter((v) => v.category === active);

  return (
    <KidShell>
      <main className="mx-auto max-w-7xl px-5">
        <h1 className="font-display text-3xl">Browse</h1>
        <p className="mt-1 text-sm font-bold text-muted-foreground">
          Pick a category to see its videos
        </p>

        <div className="no-scrollbar -mx-5 mt-5 flex gap-3 overflow-x-auto px-5 pb-2">
          {["All", ...CATEGORIES].map((c) => (
            <Link
              key={c}
              to="/category"
              search={{ cat: c === "All" ? undefined : c }}
              className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-bold transition-colors ${
                active === c
                  ? "bg-foreground text-background"
                  : "bg-card text-foreground/80 outline outline-foreground/10 hover:bg-secondary"
              }`}
            >
              {c}
            </Link>
          ))}
        </div>

        {shown.length === 0 ? (
          <p className="py-20 text-center font-display text-xl text-muted-foreground">
            No videos in {active} yet — add some in the Admin panel.
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {shown.map((v) => (
              <VideoCard key={v.id} video={v} wide />
            ))}
          </div>
        )}
      </main>
    </KidShell>
  );
}
