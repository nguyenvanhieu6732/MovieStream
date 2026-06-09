// components/MovieHorizontalSlider.tsx
"use client";
import Link from "next/link";
import { OPhimMovie } from "@/lib/interface";
import { getImageUrl } from "@/lib/getImageUrl";
import SectionHeader from "./SectionHeader";
import HorizontalCarousel from "../scrollEffect/HorizontalCarousel";
import { ChevronRight } from "lucide-react";
import { useDeviceType } from "@/hooks/use-mobile";
import { ImageWithLoader } from "@/components/ui/image-with-loader";


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
      prefetch={false}
      onClick={handleClick}
      className="glass-card glass-hover group relative flex h-full w-full min-w-0 flex-col overflow-hidden rounded-[1.75rem] transition"
    >
      <div className="relative h-[220px] w-full overflow-hidden rounded-t-[1.7rem]">
        <ImageWithLoader
          src={getImageUrl(movie.poster_url)}
          alt={movie.name}
          fill
          className="object-cover transition duration-500 ease-out 
                     group-hover:scale-105 group-hover:brightness-90"
          loading="lazy"
          sizes="(max-width: 640px) 100vw, 380px"
        />
        {movie.episode_current && (
          <span className="glass-panel absolute left-4 top-4 max-w-[58%] rounded-full px-3 py-1.5 text-xs font-medium text-white shadow-[0_10px_28px_rgba(0,0,0,0.35)] line-clamp-1">
            {movie.episode_current}
          </span>
        )}
        {movie.lang && (
          <span className="absolute bottom-4 right-4 max-w-[42%] rounded-full border border-white/14 bg-black/36 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-xl line-clamp-1">
            {movie.lang}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1 p-4">
        <h3 className="truncate text-base font-semibold leading-snug text-white" title={movie.name}>
          {movie.name}
        </h3>
        <p className="mt-1 truncate text-sm text-white/48" title={movie.origin_name}>
          {movie.origin_name}
        </p>
      </div>
    </Link>
  ));

  return (
    <section className="relative mb-8 mt-9 px-4 md:mt-14 md:px-8">
      {device == "mobile" ? (
        <>
          {/* Mobile layout */}
          <div className="mb-4 flex items-center justify-between gap-3">
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
              className="glass-panel inline-flex h-10 w-10 items-center justify-center rounded-full text-white/82 hover:text-white"
            >
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>

          <HorizontalCarousel items={items} gap={24} itemPerRow={1} />
        </>
      ) : (
        <>
          {/* Desktop/Tablet layout */}
          <div className="grid items-stretch gap-5 lg:grid-cols-[230px_1fr]">
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
