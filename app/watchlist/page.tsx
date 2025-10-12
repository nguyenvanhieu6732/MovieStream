"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { OPhimMovie } from "@/lib/interface";
import MovieGrid from "@/components/detailMovie/movie-grid";
import { LoadingEffect } from "@/components/effect/loading-effect";
import ScrollRestore from "@/components/scrollEffect/ScrollRestore";

async function fetchMovieBySlug(slug: string) {
  try {
    const res = await fetch(`https://ophim1.com/v1/api/phim/${slug}`);
    const data = await res.json();
    if (data?.data?.item) {
      return data.data.item as OPhimMovie;
    }
  } catch (err) {
    console.error("Fetch movie error:", err);
  }
  return null;
}

export default function WatchlistPage() {
  const [movies, setMovies] = useState<OPhimMovie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWatchlistAndMovies = async () => {
      try {
        const res = await fetch("/api/watchlist", { credentials: "include" });
        const data = await res.json();

        if (res.status === 401) {
          toast.warning("Vui lòng đăng nhập để xem Watchlist");
          setLoading(false);
          return;
        }

        const list = data.watchlist || [];
        if (list.length === 0) {
          setMovies([]);
          setLoading(false);
          return;
        }

        const fetchedMovies: OPhimMovie[] = [];
        for (const item of list) {
          const movie = await fetchMovieBySlug(item.movieId);
          if (movie) fetchedMovies.push(movie);
        }

        setMovies(fetchedMovies);
      } catch (err) {
        console.error("Lỗi lấy watchlist:", err);
        toast.error("Lấy danh sách thất bại");
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlistAndMovies();
  }, []);

  if (loading) return <LoadingEffect />;
  if (movies.length === 0)
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
      Danh sách xem sau trống.
      </div>
    );

  return (
    <ScrollRestore storageKey="watchlist-scroll">
      <div className="min-h-screen pt-16 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 mt-4">Danh sách xem sau</h1>
        <MovieGrid movies={movies} />
      </div>
    </ScrollRestore>
  );
}
