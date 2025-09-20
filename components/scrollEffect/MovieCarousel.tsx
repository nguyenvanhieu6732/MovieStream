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
    <div className="relative mx-auto px-2 py-4">
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl">{title}</h2>

          {seeAllLink && (
            <Link
              href={seeAllLink}
              className="text-sm text-white/90 hover:underline inline-flex items-center gap-1 ml-4"
            >
              Xem toàn bộ <span>&rarr;</span>
            </Link>
          )}
        </div>
      )}

      {/* Carousel viewport */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {movies.map((movie) => (
            <div
              key={movie._id}
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
            className="absolute top-1/2 left-0 -translate-y-1/2 bg-white text-black p-2 rounded-full transition"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute top-1/2 right-0 -translate-y-1/2 bg-white text-black p-2 rounded-full transition"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}
    </div>
  );
}
