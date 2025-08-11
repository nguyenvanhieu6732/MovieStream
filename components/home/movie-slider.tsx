"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getImageUrl } from "@/lib/getImageUrl";
import { OPhimMovie } from "@/lib/interface";

interface MovieSliderProps {
  movies: OPhimMovie[];
}

export default function MovieSlider({ movies }: MovieSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Update selected index khi slide thay đổi
  useEffect(() => {
    if (!emblaApi) return;
    const updateIndex = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", updateIndex);
    updateIndex();
  }, [emblaApi]);

  // Auto-play 5s
  useEffect(() => {
    if (!emblaApi) return;
    const interval = setInterval(() => {
      if (!document.hidden) emblaApi.scrollNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [emblaApi]);

  return (
    <section className="relative h-[80vh] overflow-hidden">
      {/* Slider */}
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {movies.map((movie, index) => (
            <div
              key={movie._id}
              className="min-w-full relative h-full flex-shrink-0 min-h-full"
            >
              <Image
                src={getImageUrl(movie.poster_url)}
                alt={movie.name}
                fill
                className="object-cover"
                sizes="100vw"
                priority={index === 0}
                loading={index === 0 ? "eager" : "lazy"}
              />

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent z-10" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-16 z-20">
                <div className="max-w-2xl space-y-4">
                  <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow">
                    {movie.name}
                  </h1>
                  <div className="flex flex-wrap gap-2">
                    {movie.categories?.map((genre) => (
                      <Badge
                        key={genre.name}
                        variant="secondary"
                        className="capitalize text-white bg-white/20 backdrop-blur-sm"
                      >
                        {genre.name}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-4 pt-2">
                    <Link href={`/watch/${movie.slug}`}>
                      <Button
                        size="lg"
                        className="bg-red-600 hover:bg-red-700 text-white shadow-md"
                      >
                        <Play className="mr-2 h-5 w-5" />
                        Xem ngay
                      </Button>
                    </Link>
                    <Link href={`/movie/${movie.slug}`}>
                      <Button
                        size="lg"
                        variant="outline"
                        className="border text-white bg-white/20"
                      >
                        Thông tin thêm
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chevron controls */}
      <button
        onClick={() => emblaApi?.scrollPrev()}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-black/60 hover:bg-black/80 p-2 rounded-full text-white transition"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={() => emblaApi?.scrollNext()}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-black/60 hover:bg-black/80 p-2 rounded-full text-white transition"
        aria-label="Next Slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {movies.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              selectedIndex === i
                ? "bg-white scale-110"
                : "bg-white/40 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
