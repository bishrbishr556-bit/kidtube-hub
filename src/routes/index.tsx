import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Play, Search, X, Tv2 } from "lucide-react";
import { useState } from "react";
import { KidShell } from "@/components/KidShell";
import { VideoCard } from "@/components/VideoCard";
import {
  CATEGORIES,
  isAllowed,
  thumbOf,
  videosQuery,
  channelsQuery,
  type Video,
  type Channel,
} from "@/lib/kids";
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

function ChannelSearchResults({
  query,
  videos,
  channels,
}: {
  query: string;
  videos: Video[];
  channels: Channel[];
}) {
  const q = query.toLowerCase().trim();

  // Find channels whose name matches the search query
  const matchedChannels = channels.filter((ch) => ch.name.toLowerCase().includes(q));

  // Videos that match by title OR belong to a matched channel
  const matchedChannelIds = new Set(matchedChannels.map((ch) => ch.id));
  const results = videos.filter(
    (v) =>
      v.title.toLowerCase().includes(q) ||
      (v.channel_id && matchedChannelIds.has(v.channel_id)),
  );

  if (results.length === 0) {
    return (
      <p className="py-16 text-center font-display text-xl text-muted-foreground">
        No results for "{query}"
      </p>
    );
  }

  // Group: channel sections first, then title-only matches
  const channelSections = matchedChannels
    .map((ch) => ({
      channel: ch,
      videos: results.filter((v) => v.channel_id === ch.id),
    }))
    .filter((s) => s.videos.length > 0);

  const channelVideoIds = new Set(channelSections.flatMap((s) => s.videos.map((v) => v.id)));
  const titleOnlyMatches = results.filter((v) => !channelVideoIds.has(v.id));

  return (
    <div>
      {channelSections.map(({ channel, videos: cvids }) => (
        <section key={channel.id} className="mt-10">
          <div className="mb-4 flex items-center gap-3">
            {channel.thumbnail_url ? (
              <img
                src={channel.thumbnail_url}
                alt=""
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/20">
                <Tv2 className="size-5 text-brand" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-2xl truncate">{channel.name}</h2>
              {channel.description && (
                <p className="text-xs font-bold text-muted-foreground truncate">
                  {channel.description}
                </p>
              )}
            </div>
            <Link
              to="/channel/$id"
              params={{ id: channel.id }}
              className="shrink-0 rounded-full bg-card px-4 py-2 text-xs font-bold outline outline-foreground/10 hover:bg-secondary"
            >
              See all
            </Link>
          </div>
          <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-2">
            {cvids.map((v) => (
              <div key={v.id} className="w-72 shrink-0 snap-start">
                <VideoCard video={v} wide />
              </div>
            ))}
          </div>
        </section>
      ))}

      {titleOnlyMatches.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 font-display text-2xl">More results</h2>
          <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-2">
            {titleOnlyMatches.map((v) => (
              <div key={v.id} className="w-72 shrink-0 snap-start">
                <VideoCard video={v} wide />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Home() {
  const { data, isLoading } = useQuery(videosQuery);
  const { data: channels } = useQuery(channelsQuery);
  const { settings } = useParentSettings();
  const [query, setQuery] = useState("");

  const all = (data ?? []).filter((v) => v.published && isAllowed(v, settings));
  const featured = all.find((v) => v.kind !== "short") ?? all[0];
  const by = (kindOrCat: (v: Video) => boolean) => all.filter(kindOrCat);

  const isSearching = query.trim().length > 0;

  return (
    <KidShell>
      <main className="mx-auto max-w-7xl px-5">
        {/* ── Search bar ── */}
        <div className="mb-4 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search videos or channels…"
            className="w-full rounded-2xl bg-card py-3 pl-11 pr-11 text-sm font-bold outline outline-foreground/10 focus:outline-2 focus:outline-brand"
            aria-label="Search videos or channels"
          />
          {isSearching && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* ── Category pills (hidden while searching) ── */}
        {!isSearching && (
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
        )}

        {isLoading ? (
          <p className="py-20 text-center font-display text-xl text-muted-foreground">Loading…</p>
        ) : isSearching ? (
          /* ── Search results ── */
          <ChannelSearchResults
            query={query}
            videos={all}
            channels={channels ?? []}
          />
        ) : !featured ? (
          <p className="py-20 text-center font-display text-xl text-muted-foreground">
            No videos yet — add some in the Admin panel.
          </p>
        ) : (
          <>
            {/* ── Featured hero ── */}
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

            {/* ── Content rails ── */}
            <Rail
              title="Cartoons"
              videos={by((v) => v.category === "Cartoons" || v.kind === "cartoon")}
              wide
            />
            <Rail title="Shorts" videos={by((v) => v.kind === "short")} />
            <Rail title="Live now" videos={by((v) => v.kind === "live")} wide />
            <Rail title="🕌 Islamic" videos={by((v) => v.category === "Islamic")} wide />
            <Rail title="📖 Islamic Stories" videos={by((v) => v.category === "Islamic stories")} wide />
            <Rail title="Learning" videos={by((v) => v.category === "Learning")} wide />
            <Rail title="Education" videos={by((v) => v.category === "Education")} wide />
            <Rail title="Stories" videos={by((v) => v.category === "Stories")} wide />
            <Rail title="Mathematics" videos={by((v) => v.category === "Mathematics")} wide />
            <Rail title="Science" videos={by((v) => v.category === "Science")} wide />
            <Rail title="English" videos={by((v) => v.category === "English")} wide />
            <Rail title="Technology" videos={by((v) => v.category === "Technology")} wide />
            <Rail title="Tutorials" videos={by((v) => v.category === "Tutorials")} wide />
            <Rail title="Gaming" videos={by((v) => v.category === "Gaming")} wide />
            <Rail title="Vlog" videos={by((v) => v.category === "Vlog")} wide />
            <Rail title="Qawwali" videos={by((v) => v.category === "Qawwali")} wide />
            <Rail title="Announcements" videos={by((v) => v.category === "Announcements")} wide />
          </>
        )}
      </main>
    </KidShell>
  );
}
