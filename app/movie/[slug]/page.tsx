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

interface Comment {
  id: number
  user: string
  avatar: string
  comment: string
  timestamp: string
}

export default function MovieDetailPage({ params }: { params: { slug: string } }) {
  const [movie, setMovie] = useState<any>(null)
  const [episodes, setEpisodes] = useState<any[]>([])
  const [selectedEpisode, setSelectedEpisode] = useState(0)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isInWatchlist, setIsInWatchlist] = useState(false)

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = await fetch(`https://ophim1.com/phim/${params.slug}`)
        const data = await res.json()
        setMovie(data.movie)
        setEpisodes(data.episodes[0]?.server_data || [])
      } catch (err) {
        console.error("Error fetching movie:", err)
      }
    }

    fetchMovie()

    // Load comments
    const saved = localStorage.getItem(`comments-${params.slug}`)
    setComments(saved ? JSON.parse(saved) : [])

    // Watchlist
    const wl = JSON.parse(localStorage.getItem("watchlist") || "[]")
    setIsInWatchlist(wl.includes(params.slug))
  }, [params.slug])

  const toggleWatchlist = () => {
    const watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]")
    let newList
    if (isInWatchlist) {
      newList = watchlist.filter((slug: string) => slug !== params.slug)
    } else {
      newList = [...watchlist, params.slug]
    }
    localStorage.setItem("watchlist", JSON.stringify(newList))
    setIsInWatchlist(!isInWatchlist)
  }

  const handleAddComment = () => {
    if (!newComment.trim()) return
    const comment: Comment = {
      id: Date.now(),
      user: "User",
      avatar: "/placeholder.svg",
      comment: newComment,
      timestamp: new Date().toLocaleString(),
    }
    const updated = [comment, ...comments]
    setComments(updated)
    localStorage.setItem(`comments-${params.slug}`, JSON.stringify(updated))
    setNewComment("")
  }

  const handleDeleteComment = (id: number) => {
    const updated = comments.filter((c) => c.id !== id)
    setComments(updated)
    localStorage.setItem(`comments-${params.slug}`, JSON.stringify(updated))
  }

  if (!movie) return <div className="p-10 text-center">Đang tải phim...</div>

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero */}
      <div className="relative h-[60vh] overflow-hidden">
        <Image src={movie.poster_url || "/placeholder.svg"} alt={movie.name} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Poster */}
          <div>
            <Card>
              <div className="aspect-[2/3] relative">
                <Image src={movie.thumb_url || "/placeholder.svg"} alt={movie.name} fill className="object-cover" />
              </div>
            </Card>
          </div>

          {/* Info */}
          <div className="lg:col-span-2 bg-card rounded-lg p-6">
            <h1 className="text-3xl font-bold mb-4">{movie.name}</h1>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1"><Calendar className="w-4 h-4" /><span>{movie.year}</span></div>
              <div className="flex items-center gap-1"><Clock className="w-4 h-4" /><span>{movie.time}</span></div>
              <div className="flex items-center gap-1"><Star className="text-yellow-400 w-4 h-4" /><span>{movie.rating || "?"}</span></div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {movie.category?.map((cat: any) => (
                <Badge key={cat.name} variant="secondary">{cat.name}</Badge>
              ))}
            </div>

            <p className="text-muted-foreground mb-6">{movie.content}</p>

            <div className="flex flex-wrap gap-4 mb-8">
              <Link href={episodes[selectedEpisode]?.link_embed || "#"}>
                <Button size="lg" className="bg-red-600 hover:bg-red-700">
                  <Play className="mr-2 h-5 w-5" /> Xem ngay
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                onClick={toggleWatchlist}
                className={isInWatchlist ? "bg-red-600 text-white hover:bg-red-700" : ""}
              >
                <Heart className={`mr-2 h-5 w-5 ${isInWatchlist ? "fill-current" : ""}`} />
                {isInWatchlist ? "Đã lưu" : "Lưu xem sau"}
              </Button>
              <Button size="lg" variant="outline"><Share2 className="mr-2 h-5 w-5" /> Chia sẻ</Button>
            </div>

            {/* Episodes */}
            {episodes.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4">Danh sách tập</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {episodes.map((ep, i) => (
                    <Button
                      key={ep.name}
                      variant={selectedEpisode === i ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedEpisode(i)}
                    >
                      {ep.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Comments */}
        <div className="mt-12">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-6">Bình luận</h3>

              {/* Add Comment */}
              <div className="flex gap-4 mb-6">
                <Avatar>
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="Viết bình luận..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <Button onClick={handleAddComment} className="mt-2" disabled={!newComment.trim()}>
                    <Send className="mr-2 h-4 w-4" /> Gửi
                  </Button>
                </div>
              </div>

              {/* List */}
              <div className="space-y-4">
                {comments.map((c) => (
                  <div key={c.id} className="flex gap-4 p-4 bg-muted/50 rounded-lg">
                    <Avatar><AvatarImage src={c.avatar} /><AvatarFallback>{c.user[0]}</AvatarFallback></Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <strong>{c.user}</strong>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{c.timestamp}</span>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteComment(c.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <p>{c.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
