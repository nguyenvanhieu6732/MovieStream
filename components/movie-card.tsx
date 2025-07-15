"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Play, Heart, Plus } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Movie {
  _id: string
  name: string
  origin_name: string
  slug: string
  poster_url: string
  thumb_url: string
  year: number
  tmdb?: {
    vote_average?: number
  }
  categories?: { name: string }[]
  time?: string
}

interface MovieCardProps {
  movie: Movie
}

export function MovieCard({ movie }: MovieCardProps) {
  const [isInWatchlist, setIsInWatchlist] = useState(false)
  const [imgSrc, setImgSrc] = useState(() => {
    const url = `https://img.ophim.live/uploads/movies/${movie.thumb_url}`
    console.log("Normalized image URL:", url)
    return url
  })

  const toggleWatchlist = () => {
    const watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]")
    if (isInWatchlist) {
      const newWatchlist = watchlist.filter((id: string) => id !== movie._id)
      localStorage.setItem("watchlist", JSON.stringify(newWatchlist))
    } else {
      watchlist.push(movie._id)
      localStorage.setItem("watchlist", JSON.stringify(watchlist))
    }
    setIsInWatchlist(!isInWatchlist)
  }

  const rating = movie.tmdb?.vote_average?.toFixed(1) || "N/A"

  return (
    <Card className="group relative overflow-hidden hover:scale-105 transition-transform duration-300">
      <div className="relative aspect-[2/3]">
        <Image
          src={imgSrc}
          alt={movie.name}
          fill
          className="object-cover"
          onError={() => setImgSrc("/fallback.jpg")}
          unoptimized
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="flex gap-2">
            <Link href={`/watch/${movie.slug}`}>
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
          <span className="text-xs text-white">{rating}</span>
        </div>
      </div>

      <CardContent className="p-3">
        <Link href={`/movie/${movie.slug}`}>
          <h3 className="font-semibold text-sm line-clamp-2 hover:text-red-600 transition-colors">
            {movie.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span>{movie.year}</span>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {movie.categories?.slice(0, 2).map((cat) => (
            <Badge key={cat.name} variant="secondary" className="text-xs capitalize">
              {cat.name}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
