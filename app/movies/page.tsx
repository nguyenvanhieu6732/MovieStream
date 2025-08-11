"use client";

import { useEffect, useState } from "react";
import { OPhimMovie } from "@/lib/interface";
import MovieGrid from "@/components/detailMovie/movie-grid";
import { Pagination } from "@/components/detailMovie/pagination";
import { LoadingEffect } from "@/components/effect/loading-effect";

async function fetchMovies(countrySlug: string, page: number) {
  const apiUrl = `https://ophim1.com/v1/api/danh-sach/phim-moi?page=${page}
  &limit=30&sort_field=modified.time&sort_type=desc&year=2025&country=${countrySlug}`;

  const res = await fetch(apiUrl);
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
  const data = await res.json();

  return {
    movies: data.data?.items || [],
    totalPages: 2
  };
}

export default function MoviesPage({ searchParams }: { searchParams: { country?: string } }) {
  const country = searchParams.country || "";
  const [movies, setMovies] = useState<OPhimMovie[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    setLoading(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    fetchMovies(country, currentPage).then((data) => {
      setMovies(data.movies);
      setTotalPages(data.totalPages);
      setLoading(false);
    });
  }, [country, currentPage]);

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-6">
        {country ? `Phim ${movies[0]?.country?.[0]?.name} mới nhất` : "Tất cả phim"}
      </h1>

      {loading ? (
        <LoadingEffect />
      ) : (
        <MovieGrid movies={movies} />
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
