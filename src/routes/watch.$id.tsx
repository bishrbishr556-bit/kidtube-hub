import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowLeft, Download, Check } from "lucide-react";
import { KidShell } from "@/components/KidShell";
import { VideoCard } from "@/components/VideoCard";
import { addWatchMinutes, isAllowed, videosQuery, type Video } from "@/lib/kids";
import { useParentSettings } from "@/hooks/useParentSettings";
import { downloadVideo, fileUrl, getOffline } from "@/lib/offline";

function FilePlayer({ path }: { path: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    fileUrl(path).then(setUrl).catch(() => setUrl(null));
  }, [path]);
  return url ? (
    <video src={url} controls className="aspect-video w-full" />
  ) : (
    <div className="aspect-video w-full" />
  );
}

function DownloadButton({ video }: { video: Video }) {
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  useEffect(() => {
    getOffline(video.id).then((v) => v && setState("done")).catch(() => {});
  }, [video.id]);
  return (
    <button
      disabled={state === "busy" || state === "done"}
      onClick={async () => {
        setState("busy");
        try {
          await downloadVideo(video);
          setState("done");
        } catch {
          setState("error");
        }
      }}
      className="btn-chunky inline-flex items-center gap-2 px-5 py-3 active:btn-chunky-active disabled:opacity-70"
    >
      {state === "done" ? <Check className="size-4" /> : <Download className="size-4" />}
      {state === "busy" ? "Saving…" : state === "done" ? "Saved offline" : state === "error" ? "Try again" : "Download"}
    </button>
  );
}

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
                {video.video_path ? (
                  <FilePlayer path={video.video_path} />
                ) : (
                  <iframe
                    key={video.id}
                    className="aspect-video w-full"
                    src={`https://www.youtube-nocookie.com/embed/${video.youtube_id}?rel=0&modestbranding=1`}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 px-2 pt-4">
                <div className="min-w-0 flex-1">
                  <h1 className="font-display text-2xl">{video.title}</h1>
                  <p className="pb-2 text-sm font-bold text-muted-foreground">
                    {video.category} · ages {video.age_range}
                    {video.duration ? ` · ${video.duration}` : ""}
                  </p>
                </div>
                {video.video_path ? (
                  <DownloadButton video={video} />
                ) : (
                  <span className="text-xs font-bold text-muted-foreground">
                    YouTube videos can't be downloaded
                  </span>
                )}
              </div>
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
