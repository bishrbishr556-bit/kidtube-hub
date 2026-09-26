import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { KidShell } from "@/components/KidShell";
import { VideoCard } from "@/components/VideoCard";
import { isAllowed, videosQuery } from "@/lib/kids";
import { useParentSettings } from "@/hooks/useParentSettings";

export const Route = createFileRoute("/videos")({
  head: () => ({
    meta: [
      { title: "All videos — Playbox Kids" },
      { name: "description", content: "Every kid-safe video in the Playbox Kids library." },
      { property: "og:title", content: "All videos — Playbox Kids" },
      { property: "og:description", content: "Every kid-safe video in the library." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Videos,
});

function Videos() {
  const { data } = useQuery(videosQuery);
  const { settings } = useParentSettings();
  const list = (data ?? []).filter((v) => v.published && v.kind !== "short" && isAllowed(v, settings));
  return (
    <KidShell>
      <main className="mx-auto max-w-7xl px-5">
        <h1 className="font-display text-3xl">Videos</h1>
        <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {list.map((v) => <VideoCard key={v.id} video={v} wide />)}
        </div>
      </main>
    </KidShell>
  );
}
