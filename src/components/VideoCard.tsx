import { Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { thumbOf, type Video } from "@/lib/kids";

export function VideoCard({ video, wide = false }: { video: Video; wide?: boolean }) {
  return (
    <Link
      to="/watch/$id"
      params={{ id: video.id }}
      className="card-pop group block w-full shrink-0 p-3 transition-transform duration-200 hover:-translate-y-1.5"
    >
      <div className="relative overflow-hidden rounded-2xl">
        <img
          src={thumbOf(video)}
          alt={video.title}
          loading="lazy"
          className={
            wide
              ? "aspect-video w-full object-cover"
              : "aspect-[9/16] w-full object-cover"
          }
        />
        {video.kind === "live" ? (
          <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-brand px-2.5 py-1 text-xs font-bold text-brand-foreground">
            <span className="size-1.5 rounded-full bg-brand-foreground" />
            LIVE
          </span>
        ) : video.duration ? (
          <span className="absolute bottom-2 right-2 rounded-md bg-foreground/80 px-2 py-0.5 text-xs font-bold text-cream">
            {video.duration}
          </span>
        ) : null}
        <span className="absolute inset-0 grid place-items-center opacity-0 transition-opacity group-hover:opacity-100">
          <span className="grid size-14 place-items-center rounded-full bg-brand text-brand-foreground">
            <Play className="ml-1 size-6 fill-current" />
          </span>
        </span>
      </div>
      <p className="mt-3 font-display text-base font-bold leading-snug">{video.title}</p>
      <p className="mt-1 text-xs font-bold text-muted-foreground">
        {video.category} · ages {video.age_range}
      </p>
    </Link>
  );
}
