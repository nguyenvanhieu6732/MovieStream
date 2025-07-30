"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Navigation } from "@/components/navigation"
import { MovieCard } from "@/components/movie-card"
import { mockMovies } from "@/lib/mock-data"
import extractTextFromHtml from "@/lib/extractTextFromHtml"
import { getImageUrl } from "@/lib/getImageUrl"
import { OPhimMovie } from "@/lib/interface"



export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [selectedGenre, setSelectedGenre] = useState("all")
  const [latestMovies, setLatestMovies] = useState<OPhimMovie[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(10) // set mặc định

  const featuredMovies = latestMovies.slice(0, 3)
  const genres = ["all", "action", "drama", "comedy", "thriller", "sci-fi", "horror"]

  useEffect(() => {
    fetch(`https://ophim1.com/danh-sach/phim-moi-cap-nhat?page=${currentPage}`)
      .then((res) => res.json())
      .then((data) => {
        setLatestMovies(data.items || [])
        if (data.pagination?.totalPages) {
          setTotalPages(data.pagination.totalPages)
        }
      })
      .catch((err) => console.error("Lỗi khi fetch phim mới:", err))
  }, [currentPage])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredMovies.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [featuredMovies.length])

  const filteredLatest =
    selectedGenre === "all"
      ? latestMovies
      : latestMovies.filter((movie) =>
        movie.categories?.some((c) => c.name.toLowerCase().includes(selectedGenre))
      )

  const renderPagination = () => {
    const pages = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      const startPage = Math.max(2, currentPage - 1)
      const endPage = Math.min(totalPages - 1, currentPage + 1)

      pages.push(1)
      if (startPage > 2) pages.push("...")

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }

      if (endPage < totalPages - 1) pages.push("...")
      pages.push(totalPages)
    }

    return pages.map((page, index) =>
      typeof page === "number" ? (
        <Button
          key={index}
          variant={page === currentPage ? "default" : "outline"}
          onClick={() => setCurrentPage(page)}
          className="w-10 h-10 p-0"
        >
          {page}
        </Button>
      ) : (
        <span key={index} className="px-2 text-muted-foreground">
          ...
        </span>
      )
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <section className="relative h-[70vh] overflow-hidden">
        <div className="relative w-full h-full">
          {featuredMovies.map((movie, index) => (
            <div
              key={movie._id}
              className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
            >
              <Image
                src={getImageUrl(movie.poster_url)}
                alt={movie.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/50" />
              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
                <div className="max-w-2xl">
                  <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">{movie.name}</h1>
                  {/* <p className="text-lg text-gray-200 mb-6 line-clamp-3">{extractTextFromHtml(movie.content)}</p> */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {movie.categories?.map((genre) => (
                      <Badge key={genre.name} variant="secondary" className="capitalize">
                        {genre.name}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-4">
                    <Link href={`/watch/${movie.slug}`}>
                      <Button size="lg" className="bg-red-600 hover:bg-red-700">
                        <Play className="mr-2 h-5 w-5" />
                        Xem ngay
                      </Button>
                    </Link>
                    <Link href={`/movie/${movie.slug}`}>
                      <Button size="lg" variant="outline" className="text-white border-white">
                        Thông tin thêm
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() =>
            setCurrentSlide((prev) => (prev - 1 + featuredMovies.length) % featuredMovies.length)
          }
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % featuredMovies.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {featuredMovies.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full ${index === currentSlide ? "bg-white" : "bg-white/50"
                }`}
            />
          ))}
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Phim Mới Nhất</h2>
            <div className="flex gap-2">
              {genres.map((genre) => (
                <Button
                  key={genre}
                  variant={selectedGenre === genre ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedGenre(genre)}
                  className="capitalize"
                >
                  {genre}
                </Button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredLatest.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-2 mt-6">
            <Button
              size="icon"
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {renderPagination()}

            <Button
              size="icon"
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
