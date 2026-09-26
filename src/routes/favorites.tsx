import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { KidShell } from "@/components/KidShell";
import { VideoCard } from "@/components/VideoCard";
import { getFavorites, videosQuery } from "@/lib/kids";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [
      { title: "Favorites — Playbox Kids" },
      { name: "description", content: "Your favorite videos on Playbox Kids." },
      { property: "og:title", content: "Favorites — Playbox Kids" },
      { property: "og:description", content: "Your favorite videos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Favorites,
});

function Favorites() {
  const { data } = useQuery(videosQuery);
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => setIds(getFavorites()), []);
  const list = (data ?? []).filter((v) => ids.includes(v.id));
  return (
    <KidShell>
      <main className="mx-auto max-w-7xl px-5">
        <h1 className="font-display text-3xl">Favorites</h1>
        {list.length === 0 ? (
          <p className="mt-10 font-bold text-muted-foreground">
            No favorites yet — tap the heart on any video. <Link to="/videos" className="text-brand">Browse videos</Link>
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {list.map((v) => <VideoCard key={v.id} video={v} wide />)}
          </div>
        )}
      </main>
    </KidShell>
  );
}
