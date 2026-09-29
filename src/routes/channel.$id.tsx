import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Tv2, ExternalLink } from "lucide-react";
import { KidShell } from "@/components/KidShell";
import { VideoCard } from "@/components/VideoCard";
import { videosQuery, channelsQuery, isAllowed, type Channel } from "@/lib/kids";
import { useParentSettings } from "@/hooks/useParentSettings";

export const Route = createFileRoute("/channel/$id")({
  head: () => ({
    meta: [{ title: "Channel — Playbox Kids" }],
  }),
  component: ChannelPage,
});

function ChannelPage() {
  const { id } = Route.useParams();
  const { data: allVideos, isLoading: videosLoading } = useQuery(videosQuery);
  const { data: channels, isLoading: channelsLoading } = useQuery(channelsQuery);
  const { settings } = useParentSettings();

  const channel: Channel | undefined = (channels ?? []).find((c: Channel) => c.id === id);

  const videos = (allVideos ?? []).filter(
    (v) => v.published && isAllowed(v, settings) && v.channel_id === id,
  );

  const isLoading = videosLoading || channelsLoading;

  return (
    <KidShell>
      <main className="mx-auto max-w-7xl px-5 pb-20">
        {/* ── Back button ── */}
        <div className="py-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm font-bold outline outline-foreground/10 hover:bg-secondary"
          >
            <ArrowLeft className="size-4" /> Home
          </Link>
        </div>

        {isLoading ? (
          <p className="py-20 text-center font-display text-xl text-muted-foreground">Loading…</p>
        ) : !channel ? (
          <div className="py-20 text-center">
            <p className="font-display text-xl text-muted-foreground">Channel not found.</p>
            <Link to="/" className="mt-4 inline-block text-sm font-bold text-brand underline">
              Go back home
            </Link>
          </div>
        ) : (
          <>
            {/* ── Channel header ── */}
            <div className="card-pop mb-8 flex flex-wrap items-center gap-5 p-6">
              {channel.thumbnail_url ? (
                <img
                  src={channel.thumbnail_url}
                  alt={channel.name}
                  className="h-20 w-20 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-brand/20">
                  <Tv2 className="size-10 text-brand" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h1 className="font-display text-3xl leading-tight">{channel.name}</h1>
                {channel.description && (
                  <p className="mt-1 text-sm font-bold text-muted-foreground">
                    {channel.description}
                  </p>
                )}
                <p className="mt-1 text-xs font-bold text-muted-foreground">
                  {videos.length} video{videos.length !== 1 ? "s" : ""}
                </p>
              </div>
              {channel.channel_url && (
                <a
                  href={channel.channel_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-2 rounded-full bg-card px-4 py-2 text-sm font-bold outline outline-foreground/10 hover:bg-secondary"
                >
                  <ExternalLink className="size-4" />
                  YouTube
                </a>
              )}
            </div>

            {/* ── Videos grid ── */}
            {videos.length === 0 ? (
              <p className="py-16 text-center font-display text-xl text-muted-foreground">
                No videos yet in this channel.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {videos.map((v) => (
                  <VideoCard key={v.id} video={v} wide />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </KidShell>
  );
}
