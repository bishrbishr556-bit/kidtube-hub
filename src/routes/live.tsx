import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { KidShell } from "@/components/KidShell";
import { VideoCard } from "@/components/VideoCard";
import { isAllowed, videosQuery } from "@/lib/kids";
import { useParentSettings } from "@/hooks/useParentSettings";

export const Route = createFileRoute("/live")({
  head: () => ({
    meta: [
      { title: "Live shows — Playbox Kids" },
      { name: "description", content: "Live storytime and nursery rhyme streams for children." },
      { property: "og:title", content: "Live shows — Playbox Kids" },
      { property: "og:description", content: "Live storytime and nursery rhyme streams." },
    ],
  }),
  component: LivePage,
});

function LivePage() {
  const { data } = useQuery(videosQuery);
  const { settings } = useParentSettings();
  const live = (data ?? []).filter(
    (v) => v.published && v.kind === "live" && isAllowed(v, settings),
  );

  return (
    <KidShell>
      <main className="mx-auto max-w-7xl px-5">
        <h1 className="font-display text-3xl">Live now</h1>
        <p className="mt-1 text-sm font-bold text-muted-foreground">Shows playing this minute</p>
        {settings.allowed["Live"] === false && (
          <p className="mt-6 rounded-3xl bg-card p-5 font-bold text-muted-foreground outline outline-foreground/10">
            Live shows are switched off in the grown-ups section.
          </p>
        )}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {live.map((v) => (
            <VideoCard key={v.id} video={v} wide />
          ))}
        </div>
      </main>
    </KidShell>
  );
}
