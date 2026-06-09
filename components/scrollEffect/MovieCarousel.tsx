"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { OPhimMovie } from "@/lib/interface";
import { MovieCard } from "@/components/detailMovie/movie-card";
import Link from "next/link";

interface Props {
  movies: OPhimMovie[];
  title?: string;
  seeAllLink?: string;
  itemsPerRow?: number;
  showChevron?: boolean;
  layout?: "thumbnail" | "poster";
}

export default function MovieCarousel({
  movies,
  title,
  seeAllLink,
  itemsPerRow = 5,
  showChevron = true,
  layout,
}: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    dragFree: true,
  });

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const gap = 16;
  const itemWidth = `calc((100% - ${(itemsPerRow - 1) * gap}px) / ${itemsPerRow})`;

  return (
    <div className="content-visibility-auto spatial-container relative px-1 py-4">
      {title && (
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">{title}</h2>

          {seeAllLink && (
            <Link
              href={seeAllLink}
              className="ml-4 inline-flex items-center gap-1 text-sm font-medium text-white/62 hover:text-white"
            >
              Xem toàn bộ <span>&rarr;</span>
            </Link>
          )}
        </div>
      )}

      {/* Carousel viewport */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex items-stretch gap-4">
          {movies.map((movie) => (
            <div
              key={movie._id}
              className="flex min-w-0"
              style={{ flex: `0 0 ${itemWidth}` }}
            >
              <MovieCard movie={movie} variant={layout} />
            </div>
          ))}
        </div>
      </div>

      {/* Chevron */}
      {showChevron && (
        <>
          <button
            onClick={scrollPrev}
            className="glass-panel absolute top-1/2 left-0 -translate-y-1/2 p-2 rounded-full text-white transition hover:bg-white/15"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={scrollNext}
            className="glass-panel absolute top-1/2 right-0 -translate-y-1/2 p-2 rounded-full text-white transition hover:bg-white/15"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}
    </div>
  );
}
