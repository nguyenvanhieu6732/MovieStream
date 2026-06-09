"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { getImageUrl } from "@/lib/getImageUrl";
import { OPhimMovie } from "@/lib/interface";
import { useDeviceType } from "@/hooks/use-mobile";
import { ImageWithLoader } from "@/components/ui/image-with-loader";

interface MovieSliderProps {
  movies: OPhimMovie[];
}

export default function MovieSlider({ movies }: MovieSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const device = useDeviceType();

  useEffect(() => {
    if (!emblaApi) return;
    const updateIndex = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", updateIndex);
    updateIndex();
    return () => {
      emblaApi.off("select", updateIndex);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const interval = setInterval(() => {
      if (!document.hidden) emblaApi.scrollNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [emblaApi]);

  return (
    <section className="relative h-[72dvh] min-h-[520px] w-full overflow-hidden md:h-[100dvh]">
      <div className="h-full overflow-hidden" ref={emblaRef}>
        <div className="flex h-full">
          {movies.map((movie, index) => (
            <div
              key={movie._id}
              className="min-w-full relative h-full flex-shrink-0"
            >
              <div className="relative h-full">
                <ImageWithLoader
                  src={getImageUrl(movie.thumb_url || movie.poster_url)}
                  alt={movie.name}
                  fill
                  wrapperClassName="absolute inset-0"
                  className="object-cover"
                  sizes="100vw"
                  priority={index === 0}
                  loading={index === 0 ? "eager" : "lazy"}
                />

                <div className="absolute inset-0 z-10">
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_76%,rgba(244,63,94,0.28),transparent_30rem),linear-gradient(to_top,rgba(2,3,8,1),rgba(2,3,8,0.62)_42%,rgba(2,3,8,0.08))]" />
                </div>
                {device === "mobile" && (
                  <Link
                    href={`/movie/${movie.slug}`}
                    prefetch={false}
                    className="absolute inset-0 z-20"
                    aria-label={`Xem chi tiết ${movie.name}`}
                  />
                )}

                <div className="absolute bottom-0 left-0 right-0 z-30 p-4 pb-10 sm:p-8 md:p-16">
                  <motion.div
                    key={`${movie._id}-${selectedIndex}`}
                    initial={{ opacity: 0, y: 28, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 110, damping: 24 }}
                    className="glass-panel max-w-md space-y-2 rounded-[2rem] p-5 sm:max-w-xl sm:space-y-3 sm:p-7 md:max-w-3xl md:space-y-5 md:p-8"
                  >
                    {device === "mobile" ? (
                      <h1 className="text-balance text-xl font-semibold tracking-tight text-white sm:text-2xl">
                        {movie.name}
                      </h1>
                    ) : (
                      <>
                        <h1 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-5xl md:text-6xl">
                          {movie.name}
                        </h1>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {movie.categories?.map((genre) => (
                            <Badge
                              key={genre.name}
                              variant="secondary"
                              className="rounded-full border-white/12 bg-white/10 text-xs capitalize text-white/86 backdrop-blur-xl sm:text-sm"
                            >
                              {genre.name}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-2 sm:gap-3 pt-2">
                          <Link href={`/watch/${movie.slug}`} prefetch={false}>
                            <Button
                              size="sm"
                              className="sm:size-md md:size-lg"
                            >
                              <Play className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                              Xem ngay
                            </Button>
                          </Link>
                          <Link href={`/movie/${movie.slug}`} prefetch={false}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="sm:size-md md:size-lg"
                            >
                              Thông tin thêm
                            </Button>
                          </Link>
                        </div>
                      </>
                    )}
                  </motion.div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {device !== "mobile" && (
        <>
          <button
            onClick={() => emblaApi?.scrollPrev()}
            className="glass-panel absolute left-3 top-1/2 z-30 -translate-y-1/2 rounded-full p-2 text-white transition hover:scale-105 sm:left-6"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6" />
          </button>
          <button
            onClick={() => emblaApi?.scrollNext()}
            className="glass-panel absolute right-3 top-1/2 z-30 -translate-y-1/2 rounded-full p-2 text-white transition hover:scale-105 sm:right-6"
            aria-label="Next Slide"
          >
            <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6" />
          </button>
        </>
      )}

      {device == "desktop" && (
        <div className="absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 gap-2">
          {movies.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              className={`h-2 rounded-full transition-all duration-300 ${selectedIndex === i
                ? "w-8 bg-white"
                : "w-2 bg-white/36 hover:bg-white/70"
                }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}

    </section>
  );
}

