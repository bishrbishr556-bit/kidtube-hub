import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Lock } from "lucide-react";
import { KidShell } from "@/components/KidShell";
import { CATEGORIES, getWatchLog, todayKey, videosQuery } from "@/lib/kids";
import { useParentSettings } from "@/hooks/useParentSettings";

export const Route = createFileRoute("/parent")({
  head: () => ({
    meta: [
      { title: "Parent controls — Playbox Kids" },
      {
        name: "description",
        content: "PIN-protected parent controls: screen time, bedtime, categories and blocked videos.",
      },
      { property: "og:title", content: "Parent controls — Playbox Kids" },
      {
        property: "og:description",
        content: "Screen time, bedtime, allowed categories and blocked videos.",
      },
    ],
  }),
  component: ParentPage,
});

function PinPad({ onUnlock, pin }: { onUnlock: () => void; pin: string }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  const press = (d: string) => {
    const next = (value + d).slice(0, 4);
    setValue(next);
    setError(false);
    if (next.length === 4) {
      if (next === pin) onUnlock();
      else {
        setError(true);
        setValue("");
      }
    }
  };

  return (
    <div className="card-pop mx-auto mt-10 max-w-sm p-8 text-center">
      <span className="mx-auto grid size-14 place-items-center rounded-3xl bg-grape/15 text-grape">
        <Lock className="size-6" />
      </span>
      <h1 className="mt-4 font-display text-2xl">Grown-ups only</h1>
      <p className="mt-1 text-sm font-bold text-muted-foreground">
        Enter the 4-digit PIN {pin === "1234" ? "(starts as 1234)" : ""}
      </p>
      <div className="mt-6 flex justify-center gap-3">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`size-4 rounded-full ${i < value.length ? "bg-brand" : "bg-foreground/15"}`}
          />
        ))}
      </div>
      {error && <p className="mt-3 text-sm font-bold text-brand">Wrong PIN, try again</p>}
      <div className="mx-auto mt-6 grid max-w-[15rem] grid-cols-3 gap-3">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"].map((k, i) =>
          k === "" ? (
            <span key={i} />
          ) : (
            <button
              key={i}
              onClick={() => (k === "⌫" ? setValue(value.slice(0, -1)) : press(k))}
              className="rounded-2xl bg-secondary py-4 font-display text-xl font-bold outline outline-foreground/10 active:translate-y-0.5"
            >
              {k}
            </button>
          ),
        )}
      </div>
    </div>
  );
}

function ParentPage() {
  const [unlocked, setUnlocked] = useState(false);
  const { settings, update } = useParentSettings();
  const { data } = useQuery(videosQuery);
  const videos = data ?? [];

  const week = useMemo(() => {
    const log = getWatchLog();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const key = d.toISOString().slice(0, 10);
      return { key, label: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()], minutes: log[key] ?? 0 };
    });
  }, [unlocked]);

  const today = week.find((d) => d.key === todayKey())?.minutes ?? 0;
  const max = Math.max(settings.dailyMinutes, ...week.map((d) => d.minutes), 1);

  if (!unlocked) {
    return (
      <KidShell>
        <main className="mx-auto max-w-7xl px-5">
          <PinPad pin={settings.pin} onUnlock={() => setUnlocked(true)} />
        </main>
      </KidShell>
    );
  }

  return (
    <KidShell>
      <main className="mx-auto max-w-5xl px-5">
        <h1 className="font-display text-3xl">Parent controls</h1>
        <p className="mt-1 text-sm font-bold text-muted-foreground">
          Settings are kept on this device
        </p>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <section className="card-pop p-6">
            <h2 className="font-display text-xl">Watch time</h2>
            <div className="mt-5 flex h-36 items-end gap-3">
              {week.map((d) => (
                <div key={d.key} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className={`w-full rounded-t-lg ${d.minutes > settings.dailyMinutes ? "bg-brand" : "bg-sky"}`}
                    style={{ height: `${Math.max((d.minutes / max) * 100, 4)}%` }}
                  />
                  <span className="text-[11px] font-bold text-muted-foreground">{d.label}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm font-bold text-muted-foreground">
              {today} of {settings.dailyMinutes} minutes used today
            </p>
            <label className="mt-4 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Daily limit: {settings.dailyMinutes} min
            </label>
            <input
              type="range"
              min={15}
              max={180}
              step={5}
              value={settings.dailyMinutes}
              onChange={(e) => update({ dailyMinutes: Number(e.target.value) })}
              className="mt-2 w-full accent-[var(--brand)]"
            />
          </section>

          <section className="card-pop p-6">
            <h2 className="font-display text-xl">What Mia can watch</h2>
            <div className="mt-4 space-y-3">
              {CATEGORIES.map((c) => (
                <label
                  key={c}
                  className="flex items-center justify-between rounded-2xl bg-secondary px-4 py-3 font-bold"
                >
                  {c}
                  <input
                    type="checkbox"
                    checked={settings.allowed[c] !== false}
                    onChange={(e) =>
                      update({ allowed: { ...settings.allowed, [c]: e.target.checked } })
                    }
                    className="size-5 accent-[var(--mint)]"
                  />
                </label>
              ))}
            </div>
          </section>

          <section className="card-pop p-6">
            <h2 className="font-display text-xl">Bedtime &amp; PIN</h2>
            <label className="mt-4 flex items-center justify-between rounded-2xl bg-secondary px-4 py-3 font-bold">
              Bedtime lock
              <input
                type="checkbox"
                checked={settings.bedtimeEnabled}
                onChange={(e) => update({ bedtimeEnabled: e.target.checked })}
                className="size-5 accent-[var(--mint)]"
              />
            </label>
            <label className="mt-3 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Videos stop at
            </label>
            <input
              type="time"
              value={settings.bedtime}
              onChange={(e) => update({ bedtime: e.target.value })}
              className="mt-2 w-full rounded-2xl bg-secondary px-4 py-3 font-bold outline outline-foreground/10"
            />
            <label className="mt-4 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Change PIN (4 digits)
            </label>
            <input
              value={settings.pin}
              inputMode="numeric"
              maxLength={4}
              onChange={(e) => update({ pin: e.target.value.replace(/\D/g, "").slice(0, 4) })}
              className="mt-2 w-full rounded-2xl bg-secondary px-4 py-3 font-bold outline outline-foreground/10"
            />
          </section>

          <section className="card-pop p-6">
            <h2 className="font-display text-xl">Block single videos</h2>
            <div className="mt-4 max-h-80 space-y-2 overflow-y-auto pr-1">
              {videos.map((v) => {
                const blocked = settings.blocked.includes(v.id);
                return (
                  <div
                    key={v.id}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-secondary px-4 py-2.5"
                  >
                    <span className="truncate text-sm font-bold">{v.title}</span>
                    <button
                      onClick={() =>
                        update({
                          blocked: blocked
                            ? settings.blocked.filter((b) => b !== v.id)
                            : [...settings.blocked, v.id],
                        })
                      }
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                        blocked ? "bg-brand text-brand-foreground" : "bg-mint/20 text-foreground"
                      }`}
                    >
                      {blocked ? "Blocked" : "Allowed"}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>
    </KidShell>
  );
}
