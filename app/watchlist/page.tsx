"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { OPhimMovie } from "@/lib/interface";
import MovieGrid from "@/components/detailMovie/movie-grid";
import { LoadingEffect } from "@/components/effect/loading-effect";
import ScrollRestore from "@/components/scrollEffect/ScrollRestore";

export default function WatchlistPage() {
  const [movies, setMovies] = useState<OPhimMovie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWatchlistAndMovies = async () => {
      try {
        const res = await fetch("/api/watchlist?includeDetails=1", { credentials: "include" });
        const data = await res.json();

        if (res.status === 401) {
          toast.warning("Vui lòng đăng nhập để xem Watchlist");
          setLoading(false);
          return;
        }

        setMovies((data.movies || []).filter((movie: OPhimMovie | null): movie is OPhimMovie => Boolean(movie)));
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
      <div className="flex min-h-screen items-center justify-center p-4 pt-28">
        <div className="glass-panel max-w-lg rounded-[2rem] p-8 text-center">
          <h1 className="mb-2 text-3xl font-semibold tracking-tight">Danh sách xem sau trống</h1>
          <p className="text-white/58">Lưu một bộ phim để quay lại sau.</p>
        </div>
      </div>
    );

  return (
    <ScrollRestore storageKey="watchlist-scroll">
      <div className="spatial-container min-h-screen px-1 pb-16 pt-32 md:pt-36">
        <div className="glass-panel mb-8 rounded-[2rem] p-6 md:p-8">
          <p className="mb-2 text-sm font-medium text-white/46">Thư viện cá nhân</p>
          <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-5xl">Danh sách xem sau</h1>
        </div>
        <MovieGrid movies={movies} />
      </div>
    </ScrollRestore>
  );
}
