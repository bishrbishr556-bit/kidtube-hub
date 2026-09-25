import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Play } from "lucide-react";
import { KidShell } from "@/components/KidShell";
import { VideoCard } from "@/components/VideoCard";
import { CATEGORIES, isAllowed, thumbOf, videosQuery, type Video } from "@/lib/kids";
import { useParentSettings } from "@/hooks/useParentSettings";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Playbox Kids — safe cartoons, shorts and live shows" },
      {
        name: "description",
        content:
          "A kid-safe video app with cartoons, shorts, live shows and learning videos, plus parent controls and an admin panel.",
      },
      { property: "og:title", content: "Playbox Kids — safe cartoons, shorts and live shows" },
      {
        property: "og:description",
        content: "Kid-safe cartoons, shorts, live shows and learning videos with parent controls.",
      },
    ],
  }),
  component: Home,
});

function Rail({ title, videos, wide }: { title: string; videos: Video[]; wide?: boolean }) {
  if (videos.length === 0) return null;
  return (
    <section className="mt-10">
      <h2 className="mb-4 font-display text-2xl">{title}</h2>
      <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-2">
        {videos.map((v) => (
          <div key={v.id} className={wide ? "w-72 shrink-0 snap-start" : "w-48 shrink-0 snap-start"}>
            <VideoCard video={v} wide={wide} />
          </div>
        ))}
      </div>
    </section>
  );
}

function Home() {
  const { data, isLoading } = useQuery(videosQuery);
  const { settings } = useParentSettings();

  const all = (data ?? []).filter((v) => v.published && isAllowed(v, settings));
  const featured = all.find((v) => v.kind !== "short") ?? all[0];
  const by = (kindOrCat: (v: Video) => boolean) => all.filter(kindOrCat);

  return (
    <KidShell>
      <main className="mx-auto max-w-7xl px-5">
        <div className="no-scrollbar -mx-5 mb-2 flex gap-3 overflow-x-auto px-5 pb-2">
          <Link
            to="/category"
            search={{ cat: undefined }}
            className="shrink-0 rounded-full bg-foreground px-5 py-2.5 text-sm font-bold text-background"
          >
            All
          </Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              to="/category"
              search={{ cat: c }}
              className="shrink-0 rounded-full bg-card px-5 py-2.5 text-sm font-bold text-foreground/80 outline outline-foreground/10 transition-colors hover:bg-secondary"
            >
              {c}
            </Link>
          ))}
        </div>
        {isLoading ? (
          <p className="py-20 text-center font-display text-xl text-muted-foreground">Loading…</p>
        ) : !featured ? (
          <p className="py-20 text-center font-display text-xl text-muted-foreground">
            No videos yet — add some in the Admin panel.
          </p>
        ) : (
          <>
            <div className="card-pop overflow-hidden p-4">
              <div className="relative overflow-hidden rounded-3xl">
                <img
                  src={thumbOf(featured)}
                  alt={featured.title}
                  className="aspect-video w-full object-cover"
                />
                <span className="absolute left-4 top-4 rounded-full bg-sun px-3 py-1 text-xs font-bold text-foreground">
                  Featured today
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <div className="flex-1">
                  <h1 className="font-display text-3xl leading-tight">{featured.title}</h1>
                  <p className="mt-1 text-sm font-bold text-muted-foreground">
                    {featured.category} · ages {featured.age_range}
                    {featured.duration ? ` · ${featured.duration}` : ""}
                  </p>
                </div>
                <Link
                  to="/watch/$id"
                  params={{ id: featured.id }}
                  className="btn-chunky flex items-center gap-2 px-7 py-4 text-lg active:btn-chunky-active"
                >
                  <Play className="size-5 fill-current" /> Play
                </Link>
              </div>
            </div>

            <Rail
              title="Cartoons"
              videos={by((v) => v.category === "Cartoons" || v.kind === "cartoon")}
              wide
            />
            <Rail title="Shorts" videos={by((v) => v.kind === "short")} />
            <Rail title="Live now" videos={by((v) => v.kind === "live")} wide />
            <Rail title="Learning" videos={by((v) => v.category === "Learning")} wide />
            <Rail title="Stories" videos={by((v) => v.category === "Stories")} wide />
          </>
        )}
      </main>
    </KidShell>
  );
}
