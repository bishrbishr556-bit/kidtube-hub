import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Trash2, ArrowLeft, Tv2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  AGE_RANGES,
  CATEGORIES,
  KINDS,
  parseYouTubeId,
  parseYouTubeChannelId,
  thumbOf,
  videosQuery,
  channelsQuery,
  type Channel,
} from "@/lib/kids";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin panel — Playbox Kids" },
      {
        name: "description",
        content: "Add and manage videos, shorts, live streams and cartoons in the kids library.",
      },
      { property: "og:title", content: "Admin panel — Playbox Kids" },
      {
        property: "og:description",
        content: "Add and manage videos, shorts, live streams and cartoons.",
      },
    ],
  }),
  component: Admin,
});

const emptyForm = {
  title: "",
  youtube: "",
  kind: "video",
  category: "Cartoons",
  age_range: "4-8",
  duration: "",
  thumbnail_url: "",
  channel_id: "",
};

const emptyChannelForm = {
  name: "",
  channel_url: "",
  thumbnail_url: "",
  description: "",
};

function Admin() {
  const qc = useQueryClient();
  const { data: videos } = useQuery(videosQuery);
  const { data: channels } = useQuery(channelsQuery);

  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [channelForm, setChannelForm] = useState(emptyChannelForm);
  const [channelMessage, setChannelMessage] = useState<string | null>(null);

  /* ── Add video ── */
  const add = useMutation({
    mutationFn: async () => {
      if (!file && !form.youtube.trim()) throw new Error("Add a YouTube link or upload a video file.");
      let video_path: string | null = null;
      if (file) {
        const ext = file.name.split(".").pop() || "mp4";
        video_path = `${crypto.randomUUID()}.${ext}`;
        const up = await supabase.storage.from("videos").upload(video_path, file, { contentType: file.type });
        if (up.error) throw up.error;
      }
      const { error } = await supabase.from("videos").insert({
        title: form.title.trim(),
        youtube_id: file ? "" : parseYouTubeId(form.youtube),
        video_path,
        kind: form.kind,
        category: form.category,
        age_range: form.age_range,
        duration: form.duration.trim() || null,
        thumbnail_url: form.thumbnail_url.trim() || null,
        channel_id: form.channel_id || null,
      } as never);
      if (error) throw error;
      setFile(null);
    },
    onSuccess: () => {
      setForm(emptyForm);
      setMessage("Video added to the library.");
      qc.invalidateQueries({ queryKey: ["videos"] });
    },
    onError: (e: Error) => setMessage(e.message),
  });

  /* ── Delete video ── */
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("videos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["videos"] }),
  });

  /* ── Toggle publish ── */
  const togglePublish = useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
      const { error } = await supabase.from("videos").update({ published }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["videos"] }),
  });

  /* ── Add channel ── */
  const addChannel = useMutation({
    mutationFn: async () => {
      if (!channelForm.name.trim()) throw new Error("Channel name is required.");
      if (!channelForm.channel_url.trim()) throw new Error("Channel URL is required.");
      const youtube_channel_id = parseYouTubeChannelId(channelForm.channel_url);
      const { error } = await supabase.from("channels").insert({
        name: channelForm.name.trim(),
        channel_url: channelForm.channel_url.trim(),
        youtube_channel_id: youtube_channel_id || null,
        thumbnail_url: channelForm.thumbnail_url.trim() || null,
        description: channelForm.description.trim() || null,
      } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      setChannelForm(emptyChannelForm);
      setChannelMessage("Channel added successfully.");
      qc.invalidateQueries({ queryKey: ["channels"] });
    },
    onError: (e: Error) => setChannelMessage(e.message),
  });

  /* ── Delete channel ── */
  const removeChannel = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("channels").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["channels"] }),
  });

  const field = "mt-2 w-full rounded-2xl bg-secondary px-4 py-3 text-sm font-bold outline outline-foreground/10 focus:outline-2 focus:outline-brand";
  const labelCls = "block text-xs font-bold uppercase tracking-wide text-muted-foreground";

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center gap-4 px-5 py-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm font-bold outline outline-foreground/10"
        >
          <ArrowLeft className="size-4" /> Kids app
        </Link>
        <h1 className="font-display text-2xl">Admin panel</h1>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-5 pb-20">

        {/* ── Add Channel section ── */}
        <section className="card-pop p-6">
          <div className="flex items-center gap-3 mb-1">
            <Tv2 className="size-5 text-brand" />
            <h2 className="font-display text-xl">Add a channel</h2>
          </div>
          <p className="text-xs text-muted-foreground font-bold mb-5">
            Paste a YouTube channel URL (e.g. https://www.youtube.com/@PeppaPigOfficial). Once added, you can link videos to this channel.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setChannelMessage(null);
              addChannel.mutate();
            }}
            className="grid gap-5 sm:grid-cols-2"
          >
            <div>
              <label className={labelCls}>Channel name</label>
              <input
                required
                value={channelForm.name}
                onChange={(e) => setChannelForm({ ...channelForm, name: e.target.value })}
                placeholder="e.g. Peppa Pig Official"
                className={field}
              />
            </div>
            <div>
              <label className={labelCls}>YouTube channel URL</label>
              <input
                required
                value={channelForm.channel_url}
                onChange={(e) => setChannelForm({ ...channelForm, channel_url: e.target.value })}
                placeholder="https://www.youtube.com/@PeppaPigOfficial"
                className={field}
              />
            </div>
            <div>
              <label className={labelCls}>Channel thumbnail URL (optional)</label>
              <input
                value={channelForm.thumbnail_url}
                onChange={(e) => setChannelForm({ ...channelForm, thumbnail_url: e.target.value })}
                placeholder="https://..."
                className={field}
              />
            </div>
            <div>
              <label className={labelCls}>Description (optional)</label>
              <input
                value={channelForm.description}
                onChange={(e) => setChannelForm({ ...channelForm, description: e.target.value })}
                placeholder="Short description of the channel"
                className={field}
              />
            </div>
            <div className="flex items-center gap-4 sm:col-span-2">
              <button
                type="submit"
                disabled={addChannel.isPending}
                className="btn-chunky px-6 py-3 active:btn-chunky-active disabled:opacity-60"
              >
                {addChannel.isPending ? "Adding…" : "Add channel"}
              </button>
              {channelMessage && (
                <p className="text-sm font-bold text-muted-foreground">{channelMessage}</p>
              )}
            </div>
          </form>
        </section>

        {/* ── Channels list ── */}
        {(channels ?? []).length > 0 && (
          <section className="card-pop overflow-hidden">
            <h2 className="px-6 pt-6 font-display text-xl">
              Channels ({channels?.length ?? 0})
            </h2>
            <div className="mt-4 divide-y divide-foreground/10">
              {(channels ?? []).map((ch: Channel) => (
                <div key={ch.id} className="flex items-center gap-4 px-6 py-3">
                  {ch.thumbnail_url ? (
                    <img
                      src={ch.thumbnail_url}
                      alt=""
                      className="h-10 w-10 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/20">
                      <Tv2 className="size-5 text-brand" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{ch.name}</p>
                    <p className="truncate text-xs font-bold text-muted-foreground">
                      {ch.channel_url}
                    </p>
                  </div>
                  <Link
                    to="/channel/$id"
                    params={{ id: ch.id }}
                    className="rounded-full bg-secondary px-3 py-1 text-xs font-bold outline outline-foreground/10 hover:bg-card"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => removeChannel.mutate(ch.id)}
                    aria-label={`Delete ${ch.name}`}
                    className="rounded-full p-2 text-brand hover:bg-brand/10"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Add video section ── */}
        <section className="card-pop p-6">
          <h2 className="font-display text-xl">Add a video</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setMessage(null);
              add.mutate();
            }}
            className="mt-5 grid gap-5 sm:grid-cols-2"
          >
            <div className="sm:col-span-2">
              <label className={labelCls}>Title</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Baby Shark Dance"
                className={field}
              />
            </div>
            <div>
              <label className={labelCls}>YouTube link (online only)</label>
              <input
                value={form.youtube}
                disabled={!!file}
                onChange={(e) => setForm({ ...form, youtube: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
                className={field}
              />
            </div>
            <div>
              <label className={labelCls}>Or upload video file (downloadable, max 50MB)</label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className={field}
              />
            </div>
            <div>
              <label className={labelCls}>Type</label>
              <select
                value={form.kind}
                onChange={(e) => setForm({ ...form, kind: e.target.value })}
                className={field}
              >
                {KINDS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className={field}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Age range</label>
              <select
                value={form.age_range}
                onChange={(e) => setForm({ ...form, age_range: e.target.value })}
                className={field}
              >
                {AGE_RANGES.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Channel (optional)</label>
              <select
                value={form.channel_id}
                onChange={(e) => setForm({ ...form, channel_id: e.target.value })}
                className={field}
              >
                <option value="">— No channel —</option>
                {(channels ?? []).map((ch: Channel) => (
                  <option key={ch.id} value={ch.id}>
                    {ch.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Duration (optional)</label>
              <input
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                placeholder="3:22"
                className={field}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Thumbnail link (optional)</label>
              <input
                value={form.thumbnail_url}
                onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
                placeholder="Leave empty to use the YouTube thumbnail"
                className={field}
              />
            </div>
            <div className="flex items-center gap-4 sm:col-span-2">
              <button
                type="submit"
                disabled={add.isPending}
                className="btn-chunky px-6 py-3 active:btn-chunky-active disabled:opacity-60"
              >
                {add.isPending ? "Adding…" : "Publish video"}
              </button>
              {message && <p className="text-sm font-bold text-muted-foreground">{message}</p>}
            </div>
          </form>
        </section>

        {/* ── Library ── */}
        <section className="card-pop overflow-hidden">
          <h2 className="px-6 pt-6 font-display text-xl">Library ({videos?.length ?? 0})</h2>
          <div className="mt-4 divide-y divide-foreground/10">
            {(videos ?? []).map((v) => {
              const ch = (channels ?? []).find((c: Channel) => c.id === v.channel_id);
              return (
                <div key={v.id} className="flex items-center gap-4 px-6 py-3">
                  <img
                    src={thumbOf(v)}
                    alt=""
                    className="h-12 w-20 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{v.title}</p>
                    <p className="text-xs font-bold text-muted-foreground">
                      {v.kind} · {v.category} · ages {v.age_range}
                      {ch ? ` · ${ch.name}` : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => togglePublish.mutate({ id: v.id, published: !v.published })}
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      v.published ? "bg-mint/20 text-foreground" : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {v.published ? "Published" : "Hidden"}
                  </button>
                  <button
                    onClick={() => remove.mutate(v.id)}
                    aria-label={`Delete ${v.title}`}
                    className="rounded-full p-2 text-brand hover:bg-brand/10"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
