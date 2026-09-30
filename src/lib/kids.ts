import { supabase } from "@/integrations/supabase/client";

export type Video = {
  id: string;
  title: string;
  youtube_id: string;
  video_path?: string | null;
  kind: string;
  category: string;
  age_range: string;
  duration: string | null;
  thumbnail_url: string | null;
  published: boolean;
  created_at: string;
  channel_id?: string | null;
};

export type Channel = {
  id: string;
  name: string;
  channel_url: string;
  youtube_channel_id: string | null;
  thumbnail_url: string | null;
  description: string | null;
  created_at: string;
};

export const CATEGORIES = [
  "Cartoons",
  "Shorts",
  "Live",
  "Learning",
  "Stories",
  "Announcements",
  "Education",
  "English",
  "Gaming",
  "Islamic",
  "Islamic stories",
  "Mathematics",
  "Qawwali",
  "Science",
  "Technology",
  "Tutorials",
  "Vlog",
] as const;
export const KINDS = ["video", "short", "live", "cartoon"] as const;
export const AGE_RANGES = ["2-4", "4-8", "8-12"] as const;

export function thumbOf(v: Pick<Video, "thumbnail_url" | "youtube_id">) {
  if (v.thumbnail_url && v.thumbnail_url.trim().length > 0) return v.thumbnail_url;
  if (!v.youtube_id) return "https://placehold.co/480x360/ff8a65/ffffff?text=%E2%96%B6";
  return `https://img.youtube.com/vi/${v.youtube_id}/hqdefault.jpg`;
}

export function parseYouTubeId(input: string) {
  const s = input.trim();
  const m = s.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([A-Za-z0-9_-]{6,})/);
  return m && m[1] ? m[1] : s;
}

/** Extract a YouTube channel identifier from various URL formats:
 *  https://www.youtube.com/@Handle
 *  https://www.youtube.com/channel/UCxxxxxx
 *  https://www.youtube.com/c/CustomName
 *  https://www.youtube.com/user/Username
 */
export function parseYouTubeChannelId(input: string): string {
  const s = input.trim();
  // @Handle style
  const handle = s.match(/youtube\.com\/(@[A-Za-z0-9_.-]+)/);
  if (handle?.[1]) return handle[1];
  // /channel/UCxxxxxx
  const channelId = s.match(/youtube\.com\/channel\/([A-Za-z0-9_-]+)/);
  if (channelId?.[1]) return channelId[1];
  // /c/CustomName or /user/Username
  const custom = s.match(/youtube\.com\/(?:c|user)\/([A-Za-z0-9_.-]+)/);
  if (custom?.[1]) return custom[1];
  // fallback: return the raw input (could be just a handle or ID typed directly)
  return s;
}

export const channelsQuery = {
  queryKey: ["channels"],
  queryFn: async (): Promise<Channel[]> => {
    const { data, error } = await (supabase as any)
      .from("channels")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Channel[];
  },
};

export const videosQuery = {
  queryKey: ["videos"],
  queryFn: async (): Promise<Video[]> => {
    const { data, error } = await supabase
      .from("videos")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Video[];
  },
};

/* ---------- Parent controls (stored on this device) ---------- */

export type ParentSettings = {
  pin: string;
  dailyMinutes: number;
  bedtimeEnabled: boolean;
  bedtime: string;
  allowed: Record<string, boolean>;
  blocked: string[];
};

const KEY = "playbox-parent-settings";

export const defaultSettings: ParentSettings = {
  pin: "1234",
  dailyMinutes: 45,
  bedtimeEnabled: true,
  bedtime: "20:00",
  allowed: {
    Cartoons: true,
    Shorts: true,
    Live: false,
    Learning: true,
    Stories: true,
    Announcements: true,
    Education: true,
    English: true,
    Gaming: false,
    Islamic: true,
    "Islamic stories": true,
    Mathematics: true,
    Qawwali: false,
    Science: true,
    Technology: true,
    Tutorials: true,
    Vlog: false,
  },
  blocked: [],
};

export function loadSettings(): ParentSettings {
  if (typeof window === "undefined") return defaultSettings;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return defaultSettings;
    return { ...defaultSettings, ...(JSON.parse(raw) as Partial<ParentSettings>) };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(s: ParentSettings) {
  window.localStorage.setItem(KEY, JSON.stringify(s));
}

export function isAllowed(v: Video, s: ParentSettings) {
  if (s.blocked.includes(v.id)) return false;
  return s.allowed[v.category] !== false;
}

/* ---------- Watch time (stored on this device) ---------- */

const WATCH_KEY = "playbox-watch-minutes";

export function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function getWatchLog(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(WATCH_KEY) ?? "{}") as Record<string, number>;
  } catch {
    return {};
  }
}

export function addWatchMinutes(minutes: number) {
  const log = getWatchLog();
  const k = todayKey();
  log[k] = (log[k] ?? 0) + minutes;
  window.localStorage.setItem(WATCH_KEY, JSON.stringify(log));
}

/* ---------- Favorites (stored on this device) ---------- */

const FAV_KEY = "playbox-favorites";

export function getFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(FAV_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

export function toggleFavorite(id: string): boolean {
  const f = getFavorites();
  const on = !f.includes(id);
  const next = on ? [...f, id] : f.filter((x) => x !== id);
  window.localStorage.setItem(FAV_KEY, JSON.stringify(next));
  return on;
}
