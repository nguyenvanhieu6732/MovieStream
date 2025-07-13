import { type NextRequest, NextResponse } from "next/server"
import { mockMovies } from "@/lib/mock-data"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const genre = searchParams.get("genre")
  const search = searchParams.get("search")
  const page = Number.parseInt(searchParams.get("page") || "1")
  const limit = Number.parseInt(searchParams.get("limit") || "12")

  let filteredMovies = mockMovies

  // Filter by genre
  if (genre && genre !== "all") {
    filteredMovies = filteredMovies.filter((movie) => movie.genres.includes(genre.toLowerCase()))
  }

  // Filter by search query
  if (search) {
    filteredMovies = filteredMovies.filter(
      (movie) =>
        movie.title.toLowerCase().includes(search.toLowerCase()) ||
        movie.description.toLowerCase().includes(search.toLowerCase()),
    )
  }

  // Pagination
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedMovies = filteredMovies.slice(startIndex, endIndex)

  return NextResponse.json({
    movies: paginatedMovies,
    total: filteredMovies.length,
    page,
    totalPages: Math.ceil(filteredMovies.length / limit),
  })
}
