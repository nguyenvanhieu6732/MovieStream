"use client";

import Link from "next/link";
import { memo } from "react";
import { OPhimMovie } from "@/lib/interface";
import { getImageUrl } from "@/lib/getImageUrl";
import { useDeviceType } from "@/hooks/use-mobile";
import { ImageWithLoader } from "@/components/ui/image-with-loader";

interface Props {
  movie: OPhimMovie;
  variant?: "thumbnail" | "poster"; // <-- thêm variant
}

function MovieCardComponent({ movie, variant = "thumbnail" }: Props) {
  const aspectClass = variant === "thumbnail" ? "aspect-[2/3]" : "aspect-[16/9]";
  const device = useDeviceType();
  return (
    <Link
      href={`/movie/${movie.slug}`}
      prefetch={false}
      className="glass-card glass-hover group relative flex h-full w-full min-w-0 flex-col overflow-hidden rounded-[1.6rem] transition"
    >
      <div className={`relative w-full ${aspectClass}`}>
        <ImageWithLoader
          src={getImageUrl(
            variant === "thumbnail" ? movie.thumb_url : movie.poster_url
          )}
          alt={movie.name}
          fill
          sizes="(max-width: 768px) 50vw, 20vw"
          placeholder="blur"
          blurDataURL="/blur-placeholder.png"
          className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
          loading="lazy"
        />
        {movie.episode_current && (
          <span className="glass-panel absolute bottom-2 left-2 text-white text-xs px-2 py-0.5 rounded line-clamp-1">
            {movie.episode_current}
          </span>
        )}
        {movie.lang && (
          <span className="absolute bottom-2 right-2 bg-emerald-500/90 text-white text-xs px-2 py-0.5 rounded line-clamp-1">
            {movie.lang}
          </span>
        )}
      </div>
      <div className="min-h-[72px] min-w-0 flex-1 p-3">
        <h3 className="truncate text-sm font-semibold leading-snug text-white" title={movie.name}>{movie.name}</h3>
        <p className="mt-1 truncate text-xs text-white/48" title={movie.origin_name}>{movie.origin_name}</p>
      </div>
    </Link>
  );
}

export const MovieCard = memo(MovieCardComponent);
