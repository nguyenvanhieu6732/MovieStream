"use client";

import { useEffect, useState } from "react";
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
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const [moviesData, setMoviesData] = useState<Record<string, OPhimMovie[]>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (inView && Object.keys(moviesData).length === 0 && !loading) {
      setLoading(true);
      Promise.all(
        carousels.map(c =>
          fetch(c.url, { cache: 'force-cache' }) // Sử dụng cache trình duyệt
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
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [inView, carousels, moviesData, loading]);
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
