// components/MovieHorizontalSlider.tsx
"use client";
import Link from "next/link";
import Image from "next/image";
import { OPhimMovie } from "@/lib/interface";
import { getImageUrl } from "@/lib/getImageUrl";
import SectionHeader from "./SectionHeader";
import HorizontalCarousel from "../scrollEffect/HorizontalCarousel";
import { ChevronRight } from "lucide-react";
import { useDeviceType } from "@/hooks/use-mobile";


interface Props {
  gradient: string;
  title?: string;
  country?: string;
  movieSlug?: string;
  movies: OPhimMovie[];
}

export default function MovieHorizontalSlider({ 
  gradient, movies, title, country, movieSlug 
}: Props) {
  const handleClick = () => {
    sessionStorage.setItem("home-scroll", window.scrollY.toString());
  };

  if (!movies?.length) return null;

  const device = useDeviceType()
  const items = movies.map((movie) => (
    <Link
      key={movie._id}
      href={`/movie/${movie.slug}`}
      onClick={handleClick}
      className="group relative block rounded-md overflow-hidden bg-black transition-all duration-300 hover:shadow-xl"
    >
      <div className="relative w-full h-[220px] overflow-hidden">
        <Image
          src={getImageUrl(movie.poster_url)}
          alt={movie.name}
          fill
          className="object-cover transition-transform duration-300 ease-in-out 
                     group-hover:scale-105 group-hover:brightness-75"
          loading="lazy"
        />
        {movie.episode_current && (
          <span className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {movie.episode_current}
          </span>
        )}
        {movie.lang && (
          <span className="absolute bottom-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
            {movie.lang}
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-base font-semibold text-foreground line-clamp-2">
          {movie.name}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-1">
          {movie.origin_name}
        </p>
      </div>
    </Link>
  ));

  return (
<section className="relative mb-6 px-4 md:px-8 mt-12">
      {device == "mobile" ? (
        <>
          {/* Mobile layout */}
          <div className="flex items-center justify-between mb-3">
            <SectionHeader
              country={country || "mới"}
              movieSlug={movieSlug}
              gradient={gradient}
              title={title}
            />

            <Link
              href={
                country
                  ? `/movies?country=${encodeURIComponent(country)}`
                  : `/movies?movieSlug=${encodeURIComponent(movieSlug || "")}`
              }
              className="text-sm text-white/90 hover:underline inline-flex items-center gap-1"
            >
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>

          <HorizontalCarousel items={items} gap={24} itemPerRow={1} />
        </>
      ) : (
        <>
          {/* Desktop/Tablet layout */}
          <div className="grid grid-cols-[200px_1fr] gap-4 items-stretch">
            <SectionHeader
              country={country || "mới"}
              movieSlug={movieSlug}
              link={
                country
                  ? `/movies?country=${encodeURIComponent(country)}`
                  : `/movies?movieSlug=${encodeURIComponent(movieSlug || "")}`
              }
              gradient={gradient}
              title={title}
            />

            <HorizontalCarousel items={items} itemWidth="380px" gap={24} itemPerRow={3} />
          </div>
        </>
      )}
    </section>
  );
}
