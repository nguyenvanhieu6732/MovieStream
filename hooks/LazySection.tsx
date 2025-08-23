"use client";

import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import MovieCarousel from "@/components/scrollEffect/MovieCarousel";
import { OPhimMovie } from "@/lib/interface";
import { LoadingEffect } from "@/components/effect/loading-effect";

interface CarouselConfig {
  url: string;
  title: string;
  itemsPerRow: number;
  showChevron?: boolean;
  layout?: "thumbnail" | "poster";
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
          fetch(c.url)
            .then(res => res.json())
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
            itemsPerRow={c.itemsPerRow}
            showChevron={c.showChevron}
          />
        ) : null
      )}
    </div>
  );
}
