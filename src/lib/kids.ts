import { supabase } from "@/integrations/supabase/client";

export type Video = {
  id: string;
  title: string;
  youtube_id: string;
  kind: string;
  category: string;
  age_range: string;
  duration: string | null;
  thumbnail_url: string | null;
  published: boolean;
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
  return v.thumbnail_url && v.thumbnail_url.trim().length > 0
    ? v.thumbnail_url
    : `https://img.youtube.com/vi/${v.youtube_id}/hqdefault.jpg`;
}

export function parseYouTubeId(input: string) {
  const s = input.trim();
  const m = s.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([A-Za-z0-9_-]{6,})/);
  return m && m[1] ? m[1] : s;
}

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
  allowed: { Cartoons: true, Shorts: true, Live: false, Learning: true, Stories: true },
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
