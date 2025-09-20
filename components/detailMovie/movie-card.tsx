"use client";

import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import { OPhimMovie } from "@/lib/interface";
import { getImageUrl } from "@/lib/getImageUrl";
import { useDeviceType } from "@/hooks/use-mobile";

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
      prefetch={true}
      className="group block rounded-lg overflow-hidden shadow hover:shadow-lg transition relative"
    >
      <div className={`relative w-full ${aspectClass}`}>
        <Image
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
          <span className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded line-clamp-1">
            {movie.episode_current}
          </span>
        )}
        {movie.lang && (
          <span className="absolute bottom-2 right-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded line-clamp-1">
            {movie.lang}
          </span>
        )}
      </div>
      <div className="p-2">
        <h3 className="text-sm font-semibold line-clamp-1">{movie.name}</h3>
        <p className="text-xs text-gray-400 line-clamp-1">{movie.origin_name}</p>
      </div>
    </Link>
  );
}

export const MovieCard = memo(MovieCardComponent);
