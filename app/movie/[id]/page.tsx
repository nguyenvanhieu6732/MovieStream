"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Play, Heart, Share2, Calendar, Clock, Send, Trash2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Navigation } from "@/components/navigation"
import { MovieCard } from "@/components/movie-card"
import { mockMovies, mockComments } from "@/lib/mock-data"

interface Comment {
  id: number
  user: string
  avatar: string
  comment: string
  timestamp: string
}

export default function MovieDetailPage({ params }: { params: { id: string } }) {
  const [movie, setMovie] = useState<any>(null)
  const [isInWatchlist, setIsInWatchlist] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [selectedEpisode, setSelectedEpisode] = useState(1)

  useEffect(() => {
    const movieData = mockMovies.find((m) => m.id === Number.parseInt(params.id))
    setMovie(movieData)

    // Load comments from localStorage or use mock data
    const savedComments = localStorage.getItem(`comments-${params.id}`)
    if (savedComments) {
      setComments(JSON.parse(savedComments))
    } else {
      setComments(mockComments)
    }

    // Check if movie is in watchlist
    const watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]")
    setIsInWatchlist(watchlist.includes(Number.parseInt(params.id)))
  }, [params.id])

  const toggleWatchlist = () => {
    const watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]")
    if (isInWatchlist) {
      const newWatchlist = watchlist.filter((id: number) => id !== Number.parseInt(params.id))
      localStorage.setItem("watchlist", JSON.stringify(newWatchlist))
    } else {
      watchlist.push(Number.parseInt(params.id))
      localStorage.setItem("watchlist", JSON.stringify(watchlist))
    }
    setIsInWatchlist(!isInWatchlist)
  }

  const handleAddComment = () => {
    if (!newComment.trim()) return

    const comment: Comment = {
      id: Date.now(),
      user: "John Doe",
      avatar: "/placeholder.svg?height=40&width=40",
      comment: newComment,
      timestamp: new Date().toLocaleString(),
    }

    const updatedComments = [comment, ...comments]
    setComments(updatedComments)
    localStorage.setItem(`comments-${params.id}`, JSON.stringify(updatedComments))
    setNewComment("")
  }

  const handleDeleteComment = (commentId: number) => {
    const updatedComments = comments.filter((c) => c.id !== commentId)
    setComments(updatedComments)
    localStorage.setItem(`comments-${params.id}`, JSON.stringify(updatedComments))
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
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <div className="relative h-[60vh] overflow-hidden">
        <Image src={movie.backdrop || "/placeholder.svg"} alt={movie.title} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Movie Poster */}
          <div className="lg:col-span-1">
            <Card className="overflow-hidden">
              <div className="aspect-[2/3] relative">
                <Image src={movie.poster || "/placeholder.svg"} alt={movie.title} fill className="object-cover" />
              </div>
            </Card>
          </div>

          {/* Movie Info */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg p-6">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{movie.title}</h1>

              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="font-semibold">{movie.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{movie.year}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{movie.duration}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {movie.genres.map((genre: string) => (
                  <Badge key={genre} variant="secondary" className="capitalize">
                    {genre}
                  </Badge>
                ))}
              </div>

              <p className="text-muted-foreground mb-6 leading-relaxed">{movie.description}</p>

              <div className="flex flex-wrap gap-4 mb-8">
                <Link href={`/watch/${movie.id}`}>
                  <Button size="lg" className="bg-red-600 hover:bg-red-700">
                    <Play className="mr-2 h-5 w-5" />
                    Watch Now
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={toggleWatchlist}
                  className={isInWatchlist ? "bg-red-600 text-white hover:bg-red-700" : ""}
                >
                  <Heart className={`mr-2 h-5 w-5 ${isInWatchlist ? "fill-current" : ""}`} />
                  {isInWatchlist ? "In Watchlist" : "Add to Watchlist"}
                </Button>
                <Button size="lg" variant="outline">
                  <Share2 className="mr-2 h-5 w-5" />
                  Share
                </Button>
              </div>

              {/* Trailer */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Trailer</h3>
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <iframe
                    src={`https://www.youtube.com/embed/${movie.trailerUrl}`}
                    title={`${movie.title} Trailer`}
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
              </div>

              {/* Episodes (for TV series) */}
              {movie.type === "series" && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">Episodes</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((episode) => (
                      <Button
                        key={episode}
                        variant={selectedEpisode === episode ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedEpisode(episode)}
                      >
                        Ep {episode}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-12">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-6">Comments</h3>

              {/* Add Comment */}
              <div className="mb-6">
                <div className="flex gap-4">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg?height=40&width=40" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="mb-2"
                    />
                    <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                      <Send className="mr-2 h-4 w-4" />
                      Post Comment
                    </Button>
                  </div>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-4 p-4 bg-muted/50 rounded-lg">
                    <Avatar>
                      <AvatarImage src={comment.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{comment.user.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{comment.user}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{comment.timestamp}</span>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteComment(comment.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-muted-foreground">{comment.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Related Movies */}
        {relatedMovies.length > 0 && (
          <div className="mt-12">
            <h3 className="text-2xl font-bold mb-6">You Might Also Like</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {relatedMovies.map((relatedMovie) => (
                <MovieCard key={relatedMovie.id} movie={relatedMovie} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
