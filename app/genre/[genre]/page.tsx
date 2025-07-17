"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"
import { MovieCard } from "@/components/movie-card"
import { mockMovies } from "@/lib/mock-data"

export default function GenrePage({ params }: { params: { genre: string } }) {
  const [sortBy, setSortBy] = useState("latest")
  const [currentPage, setCurrentPage] = useState(1)
  const [filteredMovies, setFilteredMovies] = useState<any[]>([])

  const itemsPerPage = 12
  const genre = decodeURIComponent(params.genre)

  useEffect(() => {
    const filtered = mockMovies.filter((movie) => movie.genres.includes(genre.toLowerCase()))

    // Sort movies
    switch (sortBy) {
      case "title":
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
      case "year":
        filtered.sort((a, b) => b.year - a.year)
        break
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case "latest":
      default:
        // Keep original order for latest
        break
    }

    setFilteredMovies(filtered)
    setCurrentPage(1)
  }, [genre, sortBy])

  const totalPages = Math.ceil(filteredMovies.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentMovies = filteredMovies.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="min-h-screen bg-background">

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 capitalize">{genre} Movies</h1>
          <p className="text-muted-foreground">Discover the best {genre} movies and TV shows</p>
        </div>

        {/* Sort Options */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="font-medium">Sort by:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">Latest</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="year">Year</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="text-sm text-muted-foreground">{filteredMovies.length} movies found</div>
            </div>
          </CardContent>
        </Card>

        {/* Movies Grid */}
        {currentMovies.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
              {currentMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(currentPage - 2 + i, totalPages - 4 + i))
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  )
                })}

                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No {genre} movies found</h3>
            <p className="text-muted-foreground">Try browsing other genres</p>
          </div>
        )}
      </div>
    </div>
  )
}
