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
import { useDeviceType } from "@/hooks/use-mobile";

interface MovieSliderProps {
  movies: OPhimMovie[];
}

export default function MovieSlider({ movies }: MovieSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const device = useDeviceType();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!emblaApi) return;
    const updateIndex = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", updateIndex);
    updateIndex();
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const interval = setInterval(() => {
      if (!document.hidden) emblaApi.scrollNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [emblaApi]);

  // 🚨 Nếu chưa mounted, return null để tránh hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <section className="relative aspect-[16/9] md:h-[80vh] w-full overflow-hidden">
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {movies.map((movie, index) => (
            <div
              key={movie._id}
              className="min-w-full relative h-full flex-shrink-0"
            >
              {/* ✅ Bây giờ không bị mismatch nữa vì chỉ render khi mounted */}
              <Link href={device === "mobile" ? `/movie/${movie.slug}` : "#"}>
                <Image
                  src={getImageUrl(movie.poster_url)}
                  alt={movie.name}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  priority={index === 0}
                  loading={index === 0 ? "eager" : "lazy"}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />

                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8 md:p-16 z-20">
                  <div className="max-w-md sm:max-w-xl md:max-w-3xl space-y-2 sm:space-y-3 md:space-y-5">
                    {device === "mobile" ? (
                      <h1 className="text-lg sm:text-xl font-bold text-white drop-shadow">
                        {movie.name}
                      </h1>
                    ) : (
                      <>
                        <h1 className="text-xl sm:text-3xl md:text-5xl font-bold text-white drop-shadow">
                          {movie.name}
                        </h1>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {movie.categories?.map((genre) => (
                            <Badge
                              key={genre.name}
                              variant="secondary"
                              className="capitalize text-white bg-white/20 backdrop-blur-sm text-xs sm:text-sm"
                            >
                              {genre.name}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-2 sm:gap-3 pt-2">
                          <Link href={`/watch/${movie.slug}`}>
                            <Button
                              size="sm"
                              className="bg-red-600 hover:bg-red-700 text-white shadow-md sm:size-md md:size-lg"
                            >
                              <Play className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                              Xem ngay
                            </Button>
                          </Link>
                          <Link href={`/movie/${movie.slug}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border text-white bg-white/20 sm:size-md md:size-lg"
                            >
                              Thông tin thêm
                            </Button>
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {device !== "mobile" && (
        <>
          <button
            onClick={() => emblaApi?.scrollPrev()}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 bg-black/50 hover:bg-black/80 p-1.5 sm:p-2 rounded-full text-white transition"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6" />
          </button>
          <button
            onClick={() => emblaApi?.scrollNext()}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 bg-black/50 hover:bg-black/80 p-1.5 sm:p-2 rounded-full text-white transition"
            aria-label="Next Slide"
          >
            <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6" />
          </button>
        </>
      )}

      {device == "desktop" && (
        <div className="absolute bottom-3 pt-8 sm:bottom-5 left-1/2 -translate-x-1/2 z-30 flex gap-1.5 sm:gap-2">
          {movies.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${selectedIndex === i
                  ? "bg-white scale-110"
                  : "bg-white/40 hover:bg-white/70"
                }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}

    </section>
  );
}

