"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Calendar, Clock, Play, Share2, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import dynamic from "next/dynamic";
import { ErrorBoundary } from "react-error-boundary";
import extractTextFromHtml from "@/lib/extractTextFromHtml";
import { LoadingEffect } from "@/components/effect/loading-effect";
import { MovieItem } from "@/lib/interface";
import AddToWatchlistButton from "@/components/button/AddToWatchlistButton";
import { getImageUrl } from "@/lib/getImageUrl";
import { prisma } from "@/lib/prisma"; // Thêm import prisma

const CommentSection = dynamic(() => import("@/components/detailMovie/comment-section"), {
  loading: () => <LoadingEffect />,
  ssr: false,
});

interface Episode {
  name?: string;
  link_embed: string;
}

const FallbackComponent = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <Card className="p-6">
      <p className="text-red-600">Có lỗi xảy ra: {error.message}</p>
      <Button onClick={resetErrorBoundary} className="mt-4">Thử lại</Button>
    </Card>
  </div>
);

export default function MovieDetailPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const [movie, setMovie] = useState<MovieItem | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedEpisode, setSelectedEpisode] = useState(0);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isLongDescription, setIsLongDescription] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const descriptionText = useMemo(() => extractTextFromHtml(movie?.content || ""), [movie]);

  // Fetch movie details and create post if not exists
  useEffect(() => {
    const controller = new AbortController();
    const fetchMovie = async () => {
      try {
        setError(null);
        const API_URL = process.env.NEXT_PUBLIC_OPHIM_API || "https://ophim1.com/v1/api";
        const res = await fetch(`${API_URL}/phim/${encodeURIComponent(slug)}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          if (res.status === 404) {
            setError("Không tìm thấy phim với slug này.");
          } else {
            throw new Error(`Failed to fetch movie data (${res.status})`);
          }
        }
        const data = await res.json();
        const item = data?.data?.item;
        if (!item) throw new Error("Invalid movie data");
        setMovie(item as MovieItem);
        const eps: Episode[] = item.episodes?.[0]?.server_data || (Array.isArray(item.server_data) ? item.server_data : []);
        setEpisodes(eps);
        const plainText = extractTextFromHtml(item.content || "");
        setIsLongDescription(plainText.split("\n").length > 4 || plainText.length > 300);

        // Create post if not exists
        const post = await fetch(`/api/posts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug: item.slug,
            title: item.name,
            content: plainText,
          }),
        });
        if (!post.ok) {
          console.error("Failed to create post:", await post.json());
        }
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        console.error("Error fetching movie:", err);
        setError("Không thể tải dữ liệu phim. Vui lòng thử lại.");
      }
    };
    fetchMovie();
    return () => controller.abort();
  }, [slug]);

  // Check saved status from DB via API
  useEffect(() => {
    let mounted = true;
    const checkSaved = async () => {
      try {
        const res = await fetch(`/api/watchlist?movieId=${encodeURIComponent(slug)}`, {
          credentials: "include",
        });
        if (!mounted) return;
        if (!res.ok) {
          if (res.status === 401) {
            setIsInWatchlist(false);
            return;
          }
          console.error("Check watchlist failed", res.status);
          return;
        }
        const data = await res.json();
        setIsInWatchlist(Boolean(data.isSaved));
      } catch (err) {
        console.error("Error checking watchlist:", err);
      }
    };
    checkSaved();
    return () => { mounted = false; };
  }, [slug]);

  const handleWatchlistChange = (saved: boolean) => setIsInWatchlist(Boolean(saved));

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="p-6">
          <p className="text-red-600">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">Thử lại</Button>
        </Card>
      </div>
    );
  }

  if (!movie) return <LoadingEffect />;

  return (
    <ErrorBoundary FallbackComponent={FallbackComponent}>
      <div className="min-h-screen bg-black">
        <Head>
          <title>{movie.name} - Xem phim online</title>
          <meta name="description" content={descriptionText.slice(0, 160)} />
          <meta property="og:title" content={movie.name} />
          <meta property="og:image" content={movie.poster_url} />
          <meta property="og:description" content={descriptionText.slice(0, 160)} />
        </Head>

        <div className="relative h-[60vh] overflow-hidden">
          <Image src={getImageUrl(movie.poster_url)} alt={`${movie.name} poster`} fill sizes="100vw" priority placeholder="blur" blurDataURL="/low-res-poster.jpg" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>

        <div className="container mx-auto px-4 -mt-32 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div>
              <Card>
                <div className="aspect-[2/3] relative">
                  <Image src={getImageUrl(movie.thumb_url)} alt={`${movie.name} thumbnail`} fill sizes="(max-width: 1024px) 100vw, 33vw" loading="lazy" placeholder="blur" blurDataURL="/low-res-thumb.jpg" className="object-cover" />
                </div>
              </Card>
            </div>

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
                <div className="flex items-center gap-1" aria-label={`Điểm đánh giá: ${movie.tmdb?.vote_average ?? "Chưa có đánh giá"}`}>
                  <Star className="text-yellow-400 w-4 h-4" />
                  <span>{movie.tmdb?.vote_average ?? "Chưa có đánh giá"}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {movie.category?.map((cat: any) => (
                  <Badge key={cat.name} variant="secondary">{cat.name}</Badge>
                ))}
              </div>

              <div className="mb-6">
                <p id="movie-description" className={`text-muted-foreground transition-all duration-300 ease-in-out ${showFullDescription ? "" : "line-clamp-4"}`}>{descriptionText}</p>

                {isLongDescription && (
                  <button onClick={() => setShowFullDescription(!showFullDescription)} className="mt-2 text-red-600 hover:underline font-semibold flex items-center gap-1 group" aria-expanded={showFullDescription} aria-controls="movie-description">
                    {showFullDescription ? "Thu gọn" : "Xem thêm"}
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-4 mb-8">
                <Link href={`/watch/${slug}?ep=${selectedEpisode}`}>
                  <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white" aria-label="Xem phim ngay">
                    <Play className="mr-2 h-5 w-5" /> Xem ngay
                  </Button>
                </Link>

                <AddToWatchlistButton movieId={slug} isSavedInit={isInWatchlist} onChange={handleWatchlistChange} />

                <Button size="lg" variant="outline" aria-label="Chia sẻ phim">
                  <Share2 className="mr-2 h-5 w-5" /> Chia sẻ
                </Button>
              </div>

              {episodes.length > 0 ? (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">Danh sách tập</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {episodes.map((ep, i) => {
                      const episodeName = ep.name?.trim() || `Tập ${i + 1}`;
                      return (<Button key={i} variant={selectedEpisode === i ? "default" : "outline"} size="sm" onClick={() => setSelectedEpisode(i)}>{episodeName}</Button>);
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Không có tập phim nào được tìm thấy.</p>
              )}
            </div>
          </div>

          <div className="mt-12"><CommentSection slug={slug} /></div>
        </div>

        {showPlayer && episodes[selectedEpisode]?.link_embed && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onKeyDown={(e) => e.key === "Escape" && setShowPlayer(false)} tabIndex={0}>
            <div className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden">
              {episodes[selectedEpisode]?.link_embed ? (
                <iframe
                  src={episodes[selectedEpisode].link_embed}
                  allowFullScreen
                  sandbox="allow-same-origin allow-scripts"
                  referrerPolicy="no-referrer"
                  className="w-full h-full"
                  title="Video phát phim"
                  onLoad={() => console.log("Iframe loaded")}
                ></iframe>
              ) : (<p className="text-white">Không có link video hợp lệ.</p>)}
              <button onClick={() => setShowPlayer(false)} className="absolute top-2 right-2 text-white bg-black/70 hover:bg-black/90 p-2 rounded-full" aria-label="Đóng trình phát video">✕</button>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}