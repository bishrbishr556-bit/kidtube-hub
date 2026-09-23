import { useEffect, useState } from "react";
import { defaultSettings, loadSettings, saveSettings, type ParentSettings } from "@/lib/kids";

export function useParentSettings() {
  const [settings, setSettings] = useState<ParentSettings>(defaultSettings);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSettings(loadSettings());
    setReady(true);
  }, []);

  const update = (patch: Partial<ParentSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  };

  return { settings, update, ready };
}
