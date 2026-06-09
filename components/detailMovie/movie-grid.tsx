"use client";

import { OPhimMovie } from "@/lib/interface";
import { MovieCard } from "../detailMovie/movie-card";

interface Props {
  movies: OPhimMovie[];
}

export default function MovieGrid({ movies }: Props) {
  if (!movies?.length) return null;

  return (
    <div className="content-visibility-auto grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-5 lg:grid-cols-5">
      {movies.map((movie) => (
        <MovieCard key={movie.slug} movie={movie} />  // ✅ Đúng
      ))}
    </div>
  );
}
