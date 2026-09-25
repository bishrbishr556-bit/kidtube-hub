import { supabase } from "@/integrations/supabase/client";
import type { Video } from "@/lib/kids";

const DB = "playbox-offline";
const STORE = "videos";

export type OfflineVideo = { id: string; video: Video; blob: Blob; savedAt: number };

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: "id" });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>) {
  const db = await open();
  return new Promise<T>((resolve, reject) => {
    const r = fn(db.transaction(STORE, mode).objectStore(STORE));
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

export const listOffline = () => tx<OfflineVideo[]>("readonly", (s) => s.getAll());
export const getOffline = (id: string) =>
  tx<OfflineVideo | undefined>("readonly", (s) => s.get(id));
export const removeOffline = (id: string) => tx("readwrite", (s) => s.delete(id));

export async function fileUrl(path: string) {
  const { data, error } = await supabase.storage.from("videos").createSignedUrl(path, 60 * 60 * 24);
  if (error) throw error;
  return data.signedUrl;
}

export async function downloadVideo(video: Video) {
  if (!video.video_path) throw new Error("This video can't be downloaded");
  const { data, error } = await supabase.storage.from("videos").download(video.video_path);
  if (error) throw error;
  await tx("readwrite", (s) => s.put({ id: video.id, video, blob: data, savedAt: Date.now() }));
}
