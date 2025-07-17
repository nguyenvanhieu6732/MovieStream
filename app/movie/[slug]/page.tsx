"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"
import { Calendar, Clock, Heart, Play, Share2, Star } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import extractTextFromHtml from "@/lib/extractTextFromHtml"
import CommentSection from "@/components/comment-section"

export default function MovieDetailPage({ params }: { params: { slug: string } }) {
  const [movie, setMovie] = useState<any>(null)
  const [episodes, setEpisodes] = useState<any[]>([])
  const [selectedEpisode, setSelectedEpisode] = useState(0)
  const [isInWatchlist, setIsInWatchlist] = useState(false)
  const [showPlayer, setShowPlayer] = useState(false)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [isLongDescription, setIsLongDescription] = useState(false)

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = await fetch(`https://ophim1.com/phim/${params.slug}`)
        const data = await res.json()
        setMovie(data.movie)
        setEpisodes(data.episodes[0]?.server_data || [])

        const plainText = extractTextFromHtml(data.movie.content || "")
        const lineCount = plainText.split("\n").length
        setIsLongDescription(lineCount > 4 || plainText.length > 300)
      } catch (err) {
        console.error("Error fetching movie:", err)
      }
    }

    fetchMovie()

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

  if (!movie) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white px-4">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600 mb-6" />
      <p className="text-lg font-semibold animate-pulse">Đang tải phim, xin vui lòng chờ...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">

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
              <div className="flex items-center gap-1"><Star className="text-yellow-400 w-4 h-4" /><span>{movie.tmdb?.vote_average || "Chưa có đánh giá"}</span></div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {movie.category?.map((cat: any) => (
                <Badge key={cat.name} variant="secondary">{cat.name}</Badge>
              ))}
            </div>

            {/* Mô tả phim */}
            <div className="mb-6">
              <p
                className={`text-muted-foreground transition-all duration-300 ease-in-out ${
                  showFullDescription ? "" : "line-clamp-4"
                }`}
              >
                {extractTextFromHtml(movie.content)}
              </p>

              {isLongDescription && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="mt-2 text-red-600 hover:underline font-semibold flex items-center gap-1 group"
                >
                  {showFullDescription ? (
                    <>
                      Thu gọn
                      <svg className="w-4 h-4 rotate-180 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </>
                  ) : (
                    <>
                      Xem thêm
                      <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-4 mb-8">
              <Link href={`/watch/${params.slug}`}>
                <Button
                  size="lg"
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
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
                  {episodes.map((ep, i) => {
                    const episodeName = ep.name?.trim() || `Tập ${i + 1}`
                    return (
                      <Button
                        key={i}
                        variant={selectedEpisode === i ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedEpisode(i)}
                      >
                        {episodeName}
                      </Button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Comment Section */}
        <div className="mt-12">
          <CommentSection slug={params.slug} />
        </div>
      </div>

      {/* Video Modal */}
      {showPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden">
            <iframe
              src={episodes[selectedEpisode]?.link_embed}
              allowFullScreen
              className="w-full h-full"
            ></iframe>
            <button
              onClick={() => setShowPlayer(false)}
              className="absolute top-2 right-2 text-white bg-black/70 hover:bg-black/90 p-2 rounded-full"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
