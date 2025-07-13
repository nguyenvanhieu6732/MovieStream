import { fetchMovies } from "@/lib/api"
import { MovieCard } from "./movie-card"

export async function MovieGrid() {
  const data = await fetchMovies({ limit: 24 })

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {data.movies.map((movie: any) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  )
}
