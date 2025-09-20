"use client";

import { useEffect, useState } from "react";
import { OPhimMovie } from "@/lib/interface";
import MovieGrid from "@/components/detailMovie/movie-grid";
import { Pagination } from "@/components/detailMovie/pagination";
import { LoadingEffect } from "@/components/effect/loading-effect";
import { MOVIE_SLUG_LABEL } from "@/lib/constants";
import ScrollRestore from "@/components/scrollEffect/ScrollRestore";

async function fetchMovies(countrySlug: string, page: number, movieSlug?: string) {
  const apiUrl = `https://ophim1.com/v1/api/danh-sach/${movieSlug}?page=${page}
  &limit=30&sort_field=modified.time&sort_type=desc&year=2025&country=${countrySlug}`;

  const res = await fetch(apiUrl);
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
  const data = await res.json();

  return {
    movies: data.data?.items || [],
    totalPages: 2,
  };
}

export default function MoviesPage({ searchParams }: { searchParams: { country?: string; movieSlug?: string } }) {
  const country = searchParams.country || "";
  const movieSlug = searchParams.movieSlug || "";
  const [movies, setMovies] = useState<OPhimMovie[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    if (currentPage > 1) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    fetchMovies(country, currentPage, movieSlug).then((data) => {
      setMovies(data.movies);
      setTotalPages(data.totalPages);
      setLoading(false);
    });
  }, [country, currentPage, movieSlug]);

  return (
    <ScrollRestore storageKey="movies-scroll" >
      <div className="min-h-screen pt-16">
        <h1 className="text-2xl font-bold mb-6 px-4 mt-4">
          {movieSlug
            ? `${MOVIE_SLUG_LABEL[movieSlug] || movieSlug} mới nhất`
            : country
              ? `Phim ${movies[0]?.country?.[0]?.name} mới nhất`
              : "Tất cả phim"}
        </h1>

        {loading ? <LoadingEffect /> : <MovieGrid movies={movies} />}

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
    </ScrollRestore>
  );
}
