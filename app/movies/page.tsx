import { Suspense } from "react"
import { Navigation } from "@/components/navigation"
import { MovieGrid } from "@/components/movie-grid"
import { MovieGridSkeleton } from "@/components/movie-grid-skeleton"

export default function MoviesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">All Movies</h1>

        <Suspense fallback={<MovieGridSkeleton />}>
          <MovieGrid />
        </Suspense>
      </div>
    </div>
  )
}

export const metadata = {
  title: "Movies - MovieStream",
  description: "Browse all movies available on MovieStream",
}
