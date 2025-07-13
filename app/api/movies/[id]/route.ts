import { type NextRequest, NextResponse } from "next/server"
import { mockMovies } from "@/lib/mock-data"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const movie = mockMovies.find((m) => m.id === Number.parseInt(params.id))

  if (!movie) {
    return NextResponse.json({ error: "Movie not found" }, { status: 404 })
  }

  // Get related movies
  const relatedMovies = mockMovies
    .filter((m) => m.id !== movie.id && m.genres.some((g) => movie.genres.includes(g)))
    .slice(0, 6)

  return NextResponse.json({
    movie,
    relatedMovies,
  })
}
