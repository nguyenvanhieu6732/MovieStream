"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clapperboard, Info, Play } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { getImageUrl } from "@/lib/getImageUrl";
import { OPhimMovie } from "@/lib/interface";
import { useDeviceType } from "@/hooks/use-mobile";
import { ImageWithLoader } from "@/components/ui/image-with-loader";

interface MovieSliderProps {
  movies: OPhimMovie[];
  imageBaseUrl?: string;
}

function getHeroImageUrl(url?: string | null, imageBaseUrl?: string) {
  if (!url) return getImageUrl(url);

  const value = url.trim();
  if (
    !value ||
    !imageBaseUrl ||
    /^https?:\/\//i.test(value) ||
    value.startsWith("//") ||
    value.startsWith("/")
  ) {
    return getImageUrl(value);
  }

  const base = imageBaseUrl.replace(/\/$/, "");
  const filename = value.replace(/^\/+/, "");
  const cdnRoot = base.replace(/\/uploads\/movies$/i, "");

  if (/^uploads\/movies\//i.test(filename)) {
    return `${cdnRoot}/${filename}`;
  }

  return `${cdnRoot}/uploads/movies/${filename}`;
}

function getImageSources(movie: OPhimMovie, imageBaseUrl?: string) {
  return Array.from(
    new Set([
      getHeroImageUrl(movie.thumb_url, imageBaseUrl),
      getHeroImageUrl(movie.poster_url, imageBaseUrl),
      "/placeholder.svg",
    ].filter(Boolean))
  );
}

function HeroImage({
  movie,
  imageBaseUrl,
  index,
  className,
  wrapperClassName,
  sizes,
}: {
  movie: OPhimMovie;
  imageBaseUrl?: string;
  index: number;
  className?: string;
  wrapperClassName?: string;
  sizes: string;
}) {
  const sources = getImageSources(movie, imageBaseUrl);
  const [sourceIndex, setSourceIndex] = useState(0);

  useEffect(() => {
    setSourceIndex(0);
  }, [movie._id, movie.thumb_url, movie.poster_url, imageBaseUrl]);

  return (
    <ImageWithLoader
      src={sources[sourceIndex] || "/placeholder.svg"}
      alt={movie.name}
      fill
      wrapperClassName={wrapperClassName}
      className={className}
      sizes={sizes}
      unoptimized
      priority={index === 0}
      loading={index === 0 ? "eager" : "lazy"}
      onError={() => {
        setSourceIndex((current) => Math.min(current + 1, sources.length - 1));
      }}
    />
  );
}

export default function MovieSlider({ movies, imageBaseUrl }: MovieSliderProps) {
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
    }, 9000);
    return () => clearInterval(interval);
  }, [emblaApi]);

  if (!movies.length) {
    return (
      <section className="relative grid h-[68dvh] min-h-[500px] place-items-center overflow-hidden bg-[#05070d] px-6 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(244,63,94,0.24),transparent_26rem),linear-gradient(180deg,rgba(5,7,13,0.2),#05070d)]" />
        <div className="relative z-10 max-w-md">
          <Clapperboard className="mx-auto mb-5 h-10 w-10 text-white/70" />
          <h1 className="text-2xl font-semibold tracking-normal text-white md:text-4xl">Chưa tải được phim nổi bật</h1>
          <p className="mt-3 text-sm leading-6 text-white/62">
            Dữ liệu ảnh lớn sẽ xuất hiện khi API trang chủ phản hồi thành công.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-[78dvh] min-h-[560px] w-full overflow-hidden bg-[#05070d] md:h-[100dvh]">
      <div className="h-full overflow-hidden" ref={emblaRef}>
        <div className="flex h-full">
          {movies.map((movie, index) => (
            <div key={movie._id} className="relative h-full min-w-full flex-shrink-0">
              <HeroImage
                movie={movie}
                imageBaseUrl={imageBaseUrl}
                index={index}
                wrapperClassName="absolute inset-0"
                className="scale-105 object-cover"
                sizes="100vw"
              />

              <div className="absolute inset-0 z-10">
                <div className="absolute inset-0 bg-[#05070d]/20" />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,#05070d_0%,rgba(5,7,13,0.88)_30%,rgba(5,7,13,0.24)_72%,rgba(5,7,13,0.7)_100%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_72%,rgba(244,63,94,0.28),transparent_26rem),radial-gradient(circle_at_78%_28%,rgba(255,255,255,0.15),transparent_24rem),linear-gradient(to_top,#05070d_0%,rgba(5,7,13,0.72)_24%,rgba(5,7,13,0.04)_68%)]" />
                <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:80px_80px]" />
              </div>

              <div className="absolute inset-x-0 bottom-0 z-30 px-4 pb-8 pt-28 sm:px-8 sm:pb-12 md:px-12 lg:px-16">
                <motion.div
                  key={`${movie._id}-${selectedIndex}`}
                  initial={{ opacity: 0, y: 34, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 105, damping: 22 }}
                  className="mx-auto grid max-w-7xl items-end gap-8 md:grid-cols-[minmax(0,1fr)_minmax(220px,330px)] lg:gap-14"
                >
                  <div className="max-w-3xl">
                    <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase text-white/72 md:mb-5">
                      <span className="rounded-md border border-white/16 bg-white/10 px-3 py-1.5 backdrop-blur-xl">
                        MovieStream chọn lọc
                      </span>
                      {movie.year && (
                        <span className="rounded-md border border-white/12 bg-black/20 px-3 py-1.5 backdrop-blur-xl">
                          {movie.year}
                        </span>
                      )}
                      {movie.type && (
                        <span className="rounded-md border border-white/12 bg-black/20 px-3 py-1.5 capitalize backdrop-blur-xl">
                          {movie.type}
                        </span>
                      )}
                    </div>

                    <h1 className="text-balance text-4xl font-semibold leading-[0.95] tracking-normal text-white drop-shadow-[0_18px_42px_rgba(0,0,0,0.55)] sm:text-6xl lg:text-7xl">
                      {movie.name}
                    </h1>

                    {movie.origin_name && (
                      <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-white/70 sm:text-lg">
                        {movie.origin_name}
                      </p>
                    )}

                    {!!movie.categories?.length && (
                      <div className="mt-5 flex flex-wrap gap-2">
                        {movie.categories.slice(0, 4).map((genre) => (
                          <Badge
                            key={genre.slug || genre.name}
                            variant="secondary"
                            className="rounded-md border-white/12 bg-white/12 px-3 py-1 text-xs capitalize text-white/88 backdrop-blur-xl"
                          >
                            {genre.name}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="mt-7 flex flex-wrap items-center gap-3">
                      <Link href={`/watch/${movie.slug}`} prefetch={false}>
                        <Button
                          size="lg"
                          className="h-12 rounded-md bg-white px-5 text-[#06070c] shadow-[0_18px_60px_rgba(255,255,255,0.22)] hover:bg-white/90"
                        >
                          <Play className="h-5 w-5 fill-current" />
                          Xem ngay
                        </Button>
                      </Link>
                      <Link href={`/movie/${movie.slug}`} prefetch={false}>
                        <Button
                          size="lg"
                          variant="outline"
                          className="h-12 rounded-md border-white/18 bg-white/10 px-5 text-white backdrop-blur-xl hover:bg-white/16"
                        >
                          <Info className="h-5 w-5" />
                          Thông tin
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="hidden md:block">
                    <div className="relative ml-auto aspect-[2/3] w-full max-w-[310px] overflow-hidden rounded-lg border border-white/16 bg-white/8 shadow-[0_32px_100px_rgba(0,0,0,0.62)]">
                      <HeroImage
                        movie={movie}
                        imageBaseUrl={imageBaseUrl}
                        index={index}
                        wrapperClassName="absolute inset-0"
                        className="object-cover"
                        sizes="330px"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/86 to-transparent p-4">
                        <p className="line-clamp-2 text-sm font-semibold leading-5 text-white">{movie.name}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {device === "desktop" && (
        <div className="absolute right-6 top-1/2 z-40 flex -translate-y-1/2 flex-col gap-3 xl:right-10">
          {movies.map((movie, i) => (
            <button
              key={movie._id}
              onClick={() => emblaApi?.scrollTo(i)}
              className={`group relative w-20 overflow-hidden rounded-md border transition-all duration-300 ${
                selectedIndex === i
                  ? "h-32 border-white/70 shadow-[0_18px_50px_rgba(244,63,94,0.28)]"
                  : "h-20 border-white/12 opacity-70 hover:h-28 hover:opacity-100"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            >
              <HeroImage
                movie={movie}
                imageBaseUrl={imageBaseUrl}
                index={i}
                wrapperClassName="absolute inset-0"
                className="object-cover transition duration-500 group-hover:scale-105"
                sizes="128px"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/8 to-transparent" />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
