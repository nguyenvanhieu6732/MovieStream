// components/MovieHorizontalSlider.tsx
"use client";
import useEmblaCarousel from "embla-carousel-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { OPhimMovie } from "@/lib/interface";
import { getImageUrl } from "@/lib/getImageUrl";
import SectionHeader from "./SectionHeader";

interface Props {
  gradient: string;
  movies: OPhimMovie[];
}

export default function MovieHorizontalSlider({ gradient, movies }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
  });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (emblaApi) setIsReady(true);
  }, [emblaApi]);

  const handleClick = () => {
    sessionStorage.setItem("home-scroll", window.scrollY.toString());
  };

  if (!movies?.length) return null;

  return (
    <section className="relative mb-6 px-8 mt-12">
      <div className="grid grid-cols-[200px_1fr] gap-4 items-stretch">
        <SectionHeader
          country={movies[0]?.country?.[0]?.name}
          link={`/movies?country=${encodeURIComponent(movies[0]?.country?.[0]?.slug || "")}`}
          gradient={gradient}
        />

        <div className="relative w-full overflow-hidden">
          {isReady && (
            <>
              <div className="absolute left-0 top-0 bottom-0 w-12 z-20 bg-gradient-to-r from-background to-transparent flex items-center">
                <button
                  onClick={() => emblaApi?.scrollPrev()}
                  className="bg-white text-black p-2 rounded-full shadow-lg"
                >
                  <ChevronLeft size={28} strokeWidth={2.5} />
                </button>
              </div>

              <div className="absolute right-0 top-0 bottom-0 w-12 z-20 bg-gradient-to-l from-background to-transparent flex items-center justify-end">
                <button
                  onClick={() => emblaApi?.scrollNext()}
                  className="bg-white text-black p-2 rounded-full shadow-lg"
                >
                  <ChevronRight size={28} strokeWidth={2.5} />
                </button>
              </div>
            </>
          )}

          <div className="overflow-hidden px-8" ref={emblaRef}>
            <div className="flex gap-6">
              {movies.map((movie) => (
                <Link
                  key={movie._id}
                  href={`/movie/${movie.slug}`}
                  onClick={handleClick}
                  className="group relative flex-shrink-0 w-[380px] rounded-md overflow-hidden bg-background transition-all duration-300 hover:shadow-xl"
                >
                  <div className="relative w-full h-[220px] overflow-hidden">
                    <Image
                      src={getImageUrl(movie.poster_url)}
                      alt={movie.name}
                      fill
                      className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105 group-hover:brightness-75"
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
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
