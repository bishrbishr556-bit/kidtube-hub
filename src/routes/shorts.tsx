import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { KidShell } from "@/components/KidShell";
import { VideoCard } from "@/components/VideoCard";
import { isAllowed, videosQuery } from "@/lib/kids";
import { useParentSettings } from "@/hooks/useParentSettings";

export const Route = createFileRoute("/shorts")({
  head: () => ({
    meta: [
      { title: "Shorts — Playbox Kids" },
      { name: "description", content: "Quick, funny kid-safe short videos under a minute." },
      { property: "og:title", content: "Shorts — Playbox Kids" },
      { property: "og:description", content: "Quick, funny kid-safe short videos." },
    ],
  }),
  component: Shorts,
});

function Shorts() {
  const { data } = useQuery(videosQuery);
  const { settings } = useParentSettings();
  const shorts = (data ?? []).filter(
    (v) => v.published && v.kind === "short" && isAllowed(v, settings),
  );

  return (
    <KidShell>
      <main className="mx-auto max-w-7xl px-5">
        <h1 className="font-display text-3xl">Shorts</h1>
        <p className="mt-1 text-sm font-bold text-muted-foreground">Little videos, big giggles</p>
        <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
          {shorts.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>
        {shorts.length === 0 && (
          <p className="py-20 text-center font-display text-xl text-muted-foreground">
            No shorts to watch right now.
          </p>
        )}
      </main>
    </KidShell>
  );
}
