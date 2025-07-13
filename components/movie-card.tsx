"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Play, Heart, Plus } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Movie {
  id: number
  title: string
  poster: string
  year: number
  rating: number
  genres: string[]
  duration: string
}

interface MovieCardProps {
  movie: Movie
}

export function MovieCard({ movie }: MovieCardProps) {
  const [isInWatchlist, setIsInWatchlist] = useState(false)

  const toggleWatchlist = () => {
    const watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]")
    if (isInWatchlist) {
      const newWatchlist = watchlist.filter((id: number) => id !== movie.id)
      localStorage.setItem("watchlist", JSON.stringify(newWatchlist))
    } else {
      watchlist.push(movie.id)
      localStorage.setItem("watchlist", JSON.stringify(watchlist))
    }
    setIsInWatchlist(!isInWatchlist)
  }

  return (
    <Card className="group relative overflow-hidden hover:scale-105 transition-transform duration-300">
      <div className="relative aspect-[2/3]">
        <Image src={movie.poster || "/placeholder.svg"} alt={movie.title} fill className="object-cover" />

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="flex gap-2">
            <Link href={`/watch/${movie.id}`}>
              <Button size="sm" className="bg-red-600 hover:bg-red-700">
                <Play className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              size="sm"
              variant="outline"
              onClick={toggleWatchlist}
              className={isInWatchlist ? "bg-red-600 text-white" : ""}
            >
              {isInWatchlist ? <Heart className="h-4 w-4 fill-current" /> : <Plus className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Rating Badge */}
        <div className="absolute top-2 right-2 bg-black/70 rounded px-2 py-1 flex items-center gap-1">
          <Star className="h-3 w-3 text-yellow-400 fill-current" />
          <span className="text-xs text-white">{movie.rating}</span>
        </div>
      </div>

      <CardContent className="p-3">
        <Link href={`/movie/${movie.id}`}>
          <h3 className="font-semibold text-sm line-clamp-2 hover:text-red-600 transition-colors">{movie.title}</h3>
        </Link>
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span>{movie.year}</span>
          <span>{movie.duration}</span>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {movie.genres.slice(0, 2).map((genre) => (
            <Badge key={genre} variant="secondary" className="text-xs capitalize">
              {genre}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
