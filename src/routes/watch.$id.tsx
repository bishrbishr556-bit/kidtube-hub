import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { KidShell } from "@/components/KidShell";
import { VideoCard } from "@/components/VideoCard";
import { addWatchMinutes, isAllowed, videosQuery } from "@/lib/kids";
import { useParentSettings } from "@/hooks/useParentSettings";

export const Route = createFileRoute("/watch/$id")({
  head: () => ({
    meta: [
      { title: "Now playing — Playbox Kids" },
      { name: "description", content: "Watch a kid-safe video on Playbox Kids." },
      { property: "og:title", content: "Now playing — Playbox Kids" },
      { property: "og:description", content: "Watch a kid-safe video on Playbox Kids." },
    ],
  }),
  component: Watch,
});

function Watch() {
  const { id } = Route.useParams();
  const { data } = useQuery(videosQuery);
  const { settings } = useParentSettings();

  const video = (data ?? []).find((v) => v.id === id);
  const blocked = video ? !isAllowed(video, settings) : false;

  useEffect(() => {
    if (!video || blocked) return;
    const timer = window.setInterval(() => addWatchMinutes(1), 60_000);
    return () => window.clearInterval(timer);
  }, [video, blocked]);

  const others = (data ?? [])
    .filter((v) => v.id !== id && v.published && isAllowed(v, settings))
    .slice(0, 6);

  return (
    <KidShell>
      <main className="mx-auto max-w-7xl px-5">
        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm font-bold outline outline-foreground/10"
        >
          <ArrowLeft className="size-4" /> Back
        </Link>

        {!video ? (
          <p className="py-20 text-center font-display text-xl text-muted-foreground">
            This video is not here.
          </p>
        ) : blocked ? (
          <div className="card-pop p-10 text-center">
            <h1 className="font-display text-2xl">Ask a grown-up</h1>
            <p className="mt-2 font-bold text-muted-foreground">
              This video is switched off in parent controls.
            </p>
          </div>
        ) : (
          <>
            <div className="card-pop overflow-hidden p-3">
              <div className="overflow-hidden rounded-3xl bg-foreground">
                <iframe
                  key={video.id}
                  className="aspect-video w-full"
                  src={`https://www.youtube-nocookie.com/embed/${video.youtube_id}?rel=0&modestbranding=1`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <h1 className="mt-4 px-2 font-display text-2xl">{video.title}</h1>
              <p className="px-2 pb-2 text-sm font-bold text-muted-foreground">
                {video.category} · ages {video.age_range}
                {video.duration ? ` · ${video.duration}` : ""}
              </p>
            </div>

            <h2 className="mt-10 font-display text-2xl">Watch next</h2>
            <div className="mt-4 grid grid-cols-2 gap-5 sm:grid-cols-3">
              {others.map((v) => (
                <VideoCard key={v.id} video={v} wide />
              ))}
            </div>
          </>
        )}
      </main>
    </KidShell>
  );
}
