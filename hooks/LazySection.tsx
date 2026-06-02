"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import MovieCarousel from "@/components/scrollEffect/MovieCarousel";
import { OPhimMovie } from "@/lib/interface";
import { LoadingEffect } from "@/components/effect/loading-effect";
import { useDeviceType } from "./use-mobile";

interface CarouselConfig {
  url: string;
  title: string;
  itemsPerRow: number | { device: number };
  showChevron?: boolean;
  layout?: "thumbnail" | "poster";
  seeAllLink?: string;
  itemPerRowMobile?: number;
}

export default function LazyCarousels({ carousels }: { carousels: CarouselConfig[] }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1, rootMargin: "300px" });
  const [moviesData, setMoviesData] = useState<Record<string, OPhimMovie[]>>({});
  const [loading, setLoading] = useState(false);
  const hasRequested = useRef(false);

  useEffect(() => {
    if (inView && !hasRequested.current) {
      hasRequested.current = true;
      const controller = new AbortController();
      setLoading(true);
      Promise.all(
        carousels.map(c =>
          fetch(c.url, { cache: 'force-cache', signal: controller.signal })
            .then(res => {
              if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
              return res.json();
            })
            .then(data => [c.title, data.data?.items || []] as [string, OPhimMovie[]])
        )
      )
        .then(results => {
          const map: Record<string, OPhimMovie[]> = {};
          results.forEach(([title, items]) => {
            map[title] = items;
          });
          setMoviesData(map);
        })
        .catch(err => {
          if (!controller.signal.aborted) {
            console.error(err);
            hasRequested.current = false;
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });

      return () => controller.abort();
    }
  }, [inView, carousels]);
  const device = useDeviceType();

  return (
    <div ref={ref} className="my-10 space-y-10">
      {loading && <LoadingEffect message="Đang tải phim..." />}
      {carousels.map(c =>
        moviesData[c.title]?.length > 0 ? (
          <MovieCarousel
            key={c.title}
            movies={moviesData[c.title]}
            title={c.title}
            layout={c.layout}
            itemsPerRow={
              device === "mobile"
                ? c.itemPerRowMobile ?? (typeof c.itemsPerRow === "number" ? c.itemsPerRow : undefined)
                : typeof c.itemsPerRow === "number"
                  ? c.itemsPerRow
                  : typeof c.itemsPerRow === "object" && "device" in c.itemsPerRow
                    ? c.itemsPerRow.device
                    : undefined
            }
            showChevron={c.showChevron}
            seeAllLink={c.seeAllLink}
          />
        ) : null
      )}
    </div>
  );
}
