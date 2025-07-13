"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, SkipBack, SkipForward, Moon, Sun } from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { MovieCard } from "@/components/movie-card"
import { mockMovies } from "@/lib/mock-data"

export default function WatchPage({ params }: { params: { id: string } }) {
  const [movie, setMovie] = useState<any>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [selectedEpisode, setSelectedEpisode] = useState(1)
  const [isDarkMode, setIsDarkMode] = useState(true)

  useEffect(() => {
    const movieData = mockMovies.find((m) => m.id === Number.parseInt(params.id))
    setMovie(movieData)

    // Enable dark mode for better viewing experience
    document.documentElement.classList.add("dark")
    setIsDarkMode(true)
  }, [params.id])

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    if (!isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Movie not found</div>
        </div>
      </div>
    )
  }

  const relatedMovies = mockMovies
    .filter((m) => m.id !== movie.id && m.genres.some((g) => movie.genres.includes(g)))
    .slice(0, 6)

  return (
    <div className="min-h-screen bg-black">
      <Navigation />

      <div className="container mx-auto px-4 py-4">
        {/* Video Player */}
        <div className="mb-6">
          <Card className="overflow-hidden bg-black border-gray-800">
            <div className="aspect-video relative bg-black">
              {/* Video Player Placeholder */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Play className="h-8 w-8 text-white ml-1" />
                  </div>
                  <h3 className="text-white text-xl font-semibold mb-2">{movie.title}</h3>
                  {movie.type === "series" && <p className="text-gray-400">Episode {selectedEpisode}</p>}
                </div>
              </div>

              {/* Video Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="text-white hover:bg-white/20"
                    >
                      {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                    </Button>
                    <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                      <SkipBack className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                      <SkipForward className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsMuted(!isMuted)}
                      className="text-white hover:bg-white/20"
                    >
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={toggleDarkMode} className="text-white hover:bg-white/20">
                      {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </Button>
                    <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                      <Maximize className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="w-full bg-gray-600 rounded-full h-1">
                    <div className="bg-red-600 h-1 rounded-full" style={{ width: "35%" }}></div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Movie Info */}
            <Card className="mb-6 bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <h1 className="text-2xl font-bold text-white mb-4">{movie.title}</h1>

                <div className="flex flex-wrap items-center gap-4 mb-4 text-gray-300">
                  <span>{movie.year}</span>
                  <span>{movie.duration}</span>
                  <div className="flex items-center gap-1">
                    <span>★</span>
                    <span>{movie.rating}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {movie.genres.map((genre: string) => (
                    <Badge key={genre} variant="secondary" className="capitalize bg-gray-800 text-gray-300">
                      {genre}
                    </Badge>
                  ))}
                </div>

                <p className="text-gray-400 leading-relaxed">{movie.description}</p>
              </CardContent>
            </Card>

            {/* Episodes (for TV series) */}
            {movie.type === "series" && (
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Episodes</h3>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((episode) => (
                      <Button
                        key={episode}
                        variant={selectedEpisode === episode ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedEpisode(episode)}
                        className={
                          selectedEpisode === episode
                            ? "bg-red-600 hover:bg-red-700"
                            : "border-gray-600 text-gray-300 hover:bg-gray-800"
                        }
                      >
                        {episode}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Up Next / Recommended */}
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Up Next</h3>
                <div className="space-y-4">
                  {relatedMovies.slice(0, 3).map((relatedMovie) => (
                    <Link key={relatedMovie.id} href={`/watch/${relatedMovie.id}`}>
                      <div className="flex gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors">
                        <div className="w-16 h-24 relative rounded overflow-hidden flex-shrink-0">
                          <img
                            src={relatedMovie.poster || "/placeholder.svg"}
                            alt={relatedMovie.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium text-sm line-clamp-2 mb-1">{relatedMovie.title}</h4>
                          <p className="text-gray-400 text-xs mb-1">{relatedMovie.year}</p>
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <span>★</span>
                            <span>{relatedMovie.rating}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* More Like This */}
        {relatedMovies.length > 3 && (
          <div className="mt-8">
            <h3 className="text-2xl font-bold text-white mb-6">More Like This</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {relatedMovies.slice(3).map((relatedMovie) => (
                <MovieCard key={relatedMovie.id} movie={relatedMovie} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
