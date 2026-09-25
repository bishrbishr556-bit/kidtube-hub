import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { KidShell } from "@/components/KidShell";
import { listOffline, removeOffline, type OfflineVideo } from "@/lib/offline";

export const Route = createFileRoute("/downloads")({
  head: () => ({
    meta: [
      { title: "My downloads — Playbox Kids" },
      { name: "description", content: "Watch saved videos without internet on Playbox Kids." },
      { property: "og:title", content: "My downloads — Playbox Kids" },
      { property: "og:description", content: "Watch saved videos without internet." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Downloads,
});

function Downloads() {
  const [items, setItems] = useState<OfflineVideo[]>([]);
  const [playing, setPlaying] = useState<{ id: string; url: string } | null>(null);

  const refresh = () => listOffline().then(setItems).catch(() => setItems([]));
  useEffect(() => {
    refresh();
  }, []);
  useEffect(() => () => { if (playing) URL.revokeObjectURL(playing.url); }, [playing]);

  return (
    <KidShell>
      <main className="mx-auto max-w-7xl px-5">
        <h1 className="font-display text-3xl">My downloads</h1>
        <p className="font-bold text-muted-foreground">These videos play even without internet.</p>

        {playing && (
          <div className="card-pop mt-5 overflow-hidden p-3">
            <video src={playing.url} controls autoPlay className="aspect-video w-full rounded-3xl bg-foreground" />
          </div>
        )}

        {items.length === 0 ? (
          <p className="py-20 text-center font-display text-xl text-muted-foreground">
            No downloads yet. Tap Download on a video to save it.
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3">
            {items.map((it) => (
              <div key={it.id} className="card-pop overflow-hidden p-3">
                <button
                  onClick={() => setPlaying({ id: it.id, url: URL.createObjectURL(it.blob) })}
                  className="block w-full text-left"
                >
                  <div className="grid aspect-video place-items-center rounded-2xl bg-brand/15 font-display text-4xl text-brand">▶</div>
                  <p className="mt-2 truncate font-bold">{it.video.title}</p>
                </button>
                <button
                  onClick={async () => { await removeOffline(it.id); refresh(); }}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-brand"
                >
                  <Trash2 className="size-3" /> Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </KidShell>
  );
}
