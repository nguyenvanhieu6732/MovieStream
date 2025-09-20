"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Navigation } from "@/components/layout/navigation";
import { Calendar, Clock, Heart, Play, Share2, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import dynamic from "next/dynamic";
import { ErrorBoundary } from "react-error-boundary";
import extractTextFromHtml from "@/lib/extractTextFromHtml";
import { LoadingEffect } from "@/components/effect/loading-effect";
import { MovieItem } from "@/lib/interface";

// Lazy load CommentSection
const CommentSection = dynamic(() => import("@/components/detailMovie/comment-section"), {
  loading: () => <LoadingEffect />,
  ssr: false,
});

// Types for better type safety


interface Episode {
  name?: string;
  link_embed: string;
}

// ErrorBoundary Fallback
const FallbackComponent = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <Card className="p-6">
      <p className="text-red-600">Có lỗi xảy ra: {error.message}</p>
      <Button onClick={resetErrorBoundary} className="mt-4">
        Thử lại
      </Button>
    </Card>
  </div>
);

export default function MovieDetailPage({ params }: { params: { slug: string } }) {
  const [movie, setMovie] = useState<MovieItem | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedEpisode, setSelectedEpisode] = useState(0);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isLongDescription, setIsLongDescription] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [watchlist, setWatchlist] = useState<string[]>(() => JSON.parse(localStorage.getItem("watchlist") || "[]"));

  // Memoized description text
  const descriptionText = useMemo(() => extractTextFromHtml(movie?.content || ""), [movie]);

  // Fetch movie data with AbortController
  useEffect(() => {
    const controller = new AbortController();
    const fetchMovie = async () => {
      try {
        setError(null);
        const res = await fetch(`https://ophim1.com/phim/${params.slug}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed to fetch movie data");
        const data = await res.json();
        setMovie(data.movie);
        setEpisodes(data.episodes[0]?.server_data || []);
        const plainText = extractTextFromHtml(data.movie.content || "");
        setIsLongDescription(plainText.split("\n").length > 4 || plainText.length > 300);
      } catch (error) {
        if (typeof error === "object" && error !== null && "name" in error && (error as any).name === "AbortError") return;
        setError("Không thể tải dữ liệu phim. Vui lòng thử lại.");
        console.error("Error fetching movie:", error);
      }
    };

    fetchMovie();
    return () => controller.abort();
  }, [params.slug]);

  // Check watchlist status
  useEffect(() => {
    setIsInWatchlist(watchlist.includes(params.slug));
  }, [watchlist, params.slug]);

  // Toggle watchlist
  const toggleWatchlist = useCallback(() => {
    const newList = isInWatchlist
      ? watchlist.filter((slug: string) => slug !== params.slug)
      : [...watchlist, params.slug];
    setWatchlist(newList);
    localStorage.setItem("watchlist", JSON.stringify(newList));
    setIsInWatchlist(!isInWatchlist);
  }, [isInWatchlist, watchlist, params.slug]);

  // Focus management for video player
  useEffect(() => {
    if (showPlayer) {
      const iframe = document.querySelector("iframe");
      iframe?.focus();
    }
  }, [showPlayer]);

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="p-6">
          <p className="text-red-600">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Thử lại
          </Button>
        </Card>
      </div>
    );
  }

  if (!movie) return <LoadingEffect />;

  return (
    <ErrorBoundary FallbackComponent={FallbackComponent}>
      <div className="min-h-screen bg-black">
        {/* SEO Metadata */}
        <Head>
          <title>{movie.name} - Xem phim online</title>
          <meta name="description" content={descriptionText.slice(0, 160)} />
          <meta property="og:title" content={movie.name} />
          <meta property="og:image" content={movie.poster_url} />
          <meta property="og:description" content={descriptionText.slice(0, 160)} />
        </Head>

        {/* Hero */}
        <div className="relative h-[60vh] overflow-hidden">
          <Image
            src={movie.poster_url || "/fallback-poster.jpg"}
            alt={`${movie.name} poster`}
            fill
            sizes="100vw"
            priority
            placeholder="blur"
            blurDataURL="/low-res-poster.jpg"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>

        <div className="container mx-auto px-4 -mt-32 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Poster */}
            <div>
              <Card>
                <div className="aspect-[2/3] relative">
                  <Image
                    src={movie.thumb_url || "/fallback-thumb.jpg"}
                    alt={`${movie.name} thumbnail`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    loading="lazy"
                    placeholder="blur"
                    blurDataURL="/low-res-thumb.jpg"
                    className="object-cover"
                  />
                </div>
              </Card>
            </div>

            {/* Info */}
            <div className="lg:col-span-2 bg-card rounded-lg p-6">
              <h1 className="text-3xl font-bold mb-4">{movie.name}</h1>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1" aria-label={`Năm phát hành: ${movie.year}`}>
                  <Calendar className="w-4 h-4" />
                  <span>{movie.year}</span>
                </div>
                <div className="flex items-center gap-1" aria-label={`Thời lượng: ${movie.time}`}>
                  <Clock className="w-4 h-4" />
                  <span>{movie.time}</span>
                </div>
                <div
                  className="flex items-center gap-1"
                  aria-label={`Điểm đánh giá: ${movie.tmdb?.vote_average ?? "Chưa có đánh giá"}`}
                >
                  <Star className="text-yellow-400 w-4 h-4" />
                  <span>{movie.tmdb?.vote_average ?? "Chưa có đánh giá"}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {movie.category?.map((cat) => (
                  <Badge key={cat.name} variant="secondary">
                    {cat.name}
                  </Badge>
                ))}
              </div>

              {/* Mô tả phim */}
              <div className="mb-6">
                <p
                  id="movie-description"
                  className={`text-muted-foreground transition-all duration-300 ease-in-out ${
                    showFullDescription ? "" : "line-clamp-4"
                  }`}
                >
                  {descriptionText}
                </p>

                {isLongDescription && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="mt-2 text-red-600 hover:underline font-semibold flex items-center gap-1 group"
                    aria-expanded={showFullDescription}
                    aria-controls="movie-description"
                  >
                    {showFullDescription ? (
                      <>
                        Thu gọn
                        <svg
                          className="w-4 h-4 rotate-180 transition-transform group-hover:scale-110"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </>
                    ) : (
                      <>
                        Xem thêm
                        <svg
                          className="w-4 h-4 transition-transform group-hover:scale-110"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-4 mb-8">
                <Link href={`/watch/${params.slug}?ep=${selectedEpisode}`}>
                  <Button
                    size="lg"
                    className="bg-red-600 hover:bg-red-700 text-white"
                    aria-label="Xem phim ngay"
                  >
                    <Play className="mr-2 h-5 w-5" /> Xem ngay
                  </Button>
                </Link>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={toggleWatchlist}
                  className={isInWatchlist ? "bg-red-600 text-white hover:bg-red-700" : ""}
                  aria-label={isInWatchlist ? "Xóa khỏi danh sách theo dõi" : "Thêm vào danh sách theo dõi"}
                >
                  <Heart className={`mr-2 h-5 w-5 ${isInWatchlist ? "fill-current" : ""}`} />
                  {isInWatchlist ? "Đã lưu" : "Lưu xem sau"}
                </Button>

                <Button size="lg" variant="outline" aria-label="Chia sẻ phim">
                  <Share2 className="mr-2 h-5 w-5" /> Chia sẻ
                </Button>
              </div>

              {/* Episodes */}
              {episodes.length > 0 ? (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">Danh sách tập</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {episodes.map((ep, i) => {
                      const episodeName = ep.name?.trim() || `Tập ${i + 1}`;
                      return (
                        <Button
                          key={i}
                          variant={selectedEpisode === i ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedEpisode(i)}
                          aria-label={`Chọn ${episodeName}`}
                        >
                          {episodeName}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Không có tập phim nào được tìm thấy.</p>
              )}
            </div>
          </div>

          {/* Comment Section */}
          <div className="mt-12">
            <CommentSection slug={params.slug} />
          </div>
        </div>

        {/* Video Modal */}
        {showPlayer && episodes[selectedEpisode]?.link_embed && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
            onKeyDown={(e) => e.key === "Escape" && setShowPlayer(false)}
            tabIndex={0}
          >
            <div className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden">
              {episodes[selectedEpisode]?.link_embed ? (
                <iframe
                  src={episodes[selectedEpisode].link_embed}
                  allowFullScreen
                  className="w-full h-full"
                  title="Video phát phim"
                  onLoad={() => console.log("Iframe loaded")}
                ></iframe>
              ) : (
                <p className="text-white">Không có link video hợp lệ.</p>
              )}
              <button
                onClick={() => setShowPlayer(false)}
                className="absolute top-2 right-2 text-white bg-black/70 hover:bg-black/90 p-2 rounded-full"
                aria-label="Đóng trình phát video"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}