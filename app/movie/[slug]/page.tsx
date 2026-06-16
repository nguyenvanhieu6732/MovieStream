"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Calendar, ChevronDown, Clock, Play, Share2, Star, Ticket } from "lucide-react";
import Link from "next/link";
import Head from "next/head";
import dynamic from "next/dynamic";
import { ErrorBoundary } from "react-error-boundary";
import extractTextFromHtml from "@/lib/extractTextFromHtml";
import { LoadingEffect } from "@/components/effect/loading-effect";
import { MovieItem } from "@/lib/interface";
import AddToWatchlistButton from "@/components/button/AddToWatchlistButton";
import { getImageUrl } from "@/lib/getImageUrl";
import { useSession } from "next-auth/react";
import confirmToast from "@/lib/confirmToast";
import { toast } from "sonner"
import { ImageWithLoader } from "@/components/ui/image-with-loader";



const CommentSection = dynamic(() => import("@/components/detailMovie/comment-section"), {
  loading: () => <LoadingEffect />,
  ssr: false,
});

interface Episode {
  name?: string;
  link_embed: string;
}

const FallbackComponent = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div className="min-h-screen flex items-center justify-center">
    <Card className="p-6">
      <p className="text-primary">Có lỗi xảy ra: {error.message}</p>
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
  const [showAllEpisodes, setShowAllEpisodes] = useState(false);
  const [isLongDescription, setIsLongDescription] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession()
  const [isPremium, setIsPremium] = useState(false);
  const [loadingPremium, setLoadingPremium] = useState(false);


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

  useEffect(() => {
    if (selectedEpisode >= 12) {
      setShowAllEpisodes(true);
    }
  }, [selectedEpisode]);

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: movie?.name,
          text: `Xem phim ${movie?.name}`,
          url,
        });
      } catch (err) {
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Đã sao chép link phim")
      } catch (err) {
      }
    }
  };


async function doTogglePremium() {
  if (!movie?.slug) return

  try {
    setLoadingPremium(true)

    const res = await fetch("/api/admin/premium-movies", {
      method: isPremium ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: movie.slug,
        note: movie.name,
      }),
    })

    if (!res.ok) {
      throw new Error("Request failed")
    }

    setIsPremium((prev) => !prev)

    toast.success(
      isPremium
        ? "Đã gỡ phim khỏi danh sách Premium"
        : "Đã thêm phim vào danh sách Premium"
    )
  } catch (error) {
    toast.error("Thao tác thất bại, vui lòng thử lại")
  } finally {
    setLoadingPremium(false)
  }
}




  function confirmTogglePremium() {
    confirmToast(
      isPremium
        ? `Gỡ phim "${movie?.name}" khỏi Premium?`
        : `Thêm phim "${movie?.name}" vào Premium?`,
      doTogglePremium
    )
  }





  useEffect(() => {
    let mounted = true;

    const checkPremium = async () => {
      try {
        const res = await fetch(`/api/premium-check/check?slug=${slug}`);
        if (!res.ok) return;

        const data = await res.json();
        if (mounted) {
          setIsPremium(Boolean(data.isPremium));
        }
      } catch (err) {
        console.error("Check premium failed", err);
      }
    };

    checkPremium();
    return () => {
      mounted = false;
    };
  }, [slug]);



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
  const visibleEpisodes = showAllEpisodes ? episodes : episodes.slice(0, 12);
  const hasMoreEpisodes = episodes.length > 4;
  const showMoreButtonClassName =
    episodes.length > 12
      ? "mt-4 flex justify-center"
      : episodes.length > 8
        ? "mt-4 flex justify-center lg:hidden"
        : "mt-4 flex justify-center md:hidden";

  const getCollapsedEpisodeClassName = (index: number) => {
    if (showAllEpisodes) return "";
    if (index >= 8) return "hidden lg:inline-flex";
    if (index >= 4) return "hidden md:inline-flex";
    return "";
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6">
          <p className="text-primary">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">Thử lại</Button>
        </Card>
      </div>
    );
  }

  if (!movie) return <LoadingEffect />;

  return (
    <ErrorBoundary FallbackComponent={FallbackComponent}>
      <div className="min-h-screen pb-16">
        <Head>
          <title>{movie.name} - Xem phim online</title>
          <meta name="description" content={descriptionText.slice(0, 160)} />
          <meta property="og:title" content={movie.name} />
          <meta property="og:image" content={movie.poster_url} />
          <meta property="og:description" content={descriptionText.slice(0, 160)} />
        </Head>

        <div className="relative h-[68dvh] min-h-[520px] overflow-hidden">
          <ImageWithLoader src={getImageUrl(movie.poster_url)} alt={`${movie.name} poster`} fill sizes="100vw" priority className="object-cover" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_74%,rgba(244,63,94,0.28),transparent_32rem),linear-gradient(to_top,rgba(2,3,8,1),rgba(2,3,8,0.72)_48%,rgba(2,3,8,0.12))]" />
        </div>

        <div className="spatial-container relative z-10 -mt-44 px-1">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(260px,360px)_1fr]">
            <div>
              <Card className="glass-hover p-3">
                <div className="relative aspect-[2/3] overflow-hidden rounded-[1.4rem]">
                  <ImageWithLoader src={getImageUrl(movie.thumb_url)} alt={`${movie.name} thumbnail`} fill sizes="(max-width: 1024px) 100vw, 33vw" loading="lazy" className="object-cover" />
                </div>
              </Card>
            </div>

            <div className="glass-card rounded-[2rem] p-6 md:p-8">
              <h1 className="text-balance mb-5 flex items-center gap-3 text-3xl font-semibold tracking-tight md:text-5xl">
                {movie.name}

                {isPremium && (
                  <Badge variant="destructive" className="rounded-full text-sm">
                    PREMIUM
                  </Badge>
                )}
              </h1>


              <div className="mb-5 flex flex-wrap items-center gap-3 text-white/70">
                <div className="flex items-center gap-1" aria-label={`Năm phát hành: ${movie.year}`}>
                  <Calendar className="w-4 h-4" />
                  <span>{movie.year}</span>
                </div>
                <div className="flex items-center gap-1" aria-label={`Thời lượng: ${movie.time}`}>
                  <Clock className="w-4 h-4" />
                  <span>{movie.time}</span>
                </div>
                <div className="flex items-center gap-1" aria-label={`Điểm đánh giá: ${movie.tmdb?.vote_average ?? "Chưa có đánh giá"}`}>
                  <Star className="text-primary w-4 h-4" />
                  <span>{movie.tmdb?.vote_average ?? "Chưa có đánh giá"}</span>
                </div>
              </div>

              <div className="mb-6 flex flex-wrap gap-2">
                {movie.category?.map((cat: any) => (
                  <Badge key={cat.name} variant="secondary" className="rounded-full border-white/10 bg-white/10 text-white/76">{cat.name}</Badge>
                ))}
              </div>

              <div className="mb-6">
                <p id="movie-description" className={`max-w-[75ch] text-white/62 leading-relaxed transition-all duration-300 ease-in-out ${showFullDescription ? "" : "line-clamp-4"}`}>{descriptionText}</p>

                {isLongDescription && (
                  <button onClick={() => setShowFullDescription(!showFullDescription)} className="mt-3 flex items-center gap-1 font-semibold text-primary hover:text-primary/80" aria-expanded={showFullDescription} aria-controls="movie-description">
                    {showFullDescription ? "Thu gọn" : "Xem thêm"}
                  </button>
                )}
              </div>

              <div className="mb-8 flex flex-wrap gap-3">
                <Link href={`/watch/${slug}?ep=${selectedEpisode}`}>
                  <Button size="lg" aria-label="Xem phim ngay">
                    <Play className="mr-2 h-5 w-5" /> Xem ngay
                  </Button>
                </Link>

                <AddToWatchlistButton movieId={slug} isSavedInit={isInWatchlist} onChange={handleWatchlistChange} />

                <Button
                  size="lg"
                  variant="outline"
                  aria-label="Chia sẻ phim"
                  onClick={handleShare}
                >
                  <Share2 className="mr-2 h-5 w-5" /> Chia sẻ
                </Button>
                {session?.user?.role === "admin" && (
                  <Button
                    size="lg"
                    variant={isPremium ? "destructive" : "outline"}
                    disabled={loadingPremium}
                    onClick={confirmTogglePremium}
                  >
                    <Ticket className="mr-2 h-5 w-5" />
                    {isPremium ? "Gỡ Premium" : "Thêm Premium"}
                  </Button>
                )}



              </div>

              {episodes.length > 0 ? (
                <div className="mb-6">
                  <h3 className="mb-4 text-xl font-semibold">Danh sách tập</h3>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-6">
                    {visibleEpisodes.map((ep, i) => {
                      const episodeName = ep.name?.trim() || `Tập ${i + 1}`;
                      return (
                        <Button
                          key={i}
                          variant={selectedEpisode === i ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedEpisode(i)}
                          className={getCollapsedEpisodeClassName(i)}
                        >
                          {episodeName}
                        </Button>
                      );
                    })}
                  </div>
                  {hasMoreEpisodes && (
                    <div className={showMoreButtonClassName}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAllEpisodes((value) => !value)}
                        className="min-w-36"
                      >
                        {showAllEpisodes ? "Thu gọn" : "Xem thêm"}
                        <ChevronDown
                          className={`h-4 w-4 transition ${showAllEpisodes ? "rotate-180" : ""}`}
                        />
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-white/54">Không có tập phim nào được tìm thấy.</p>
              )}
            </div>
          </div>

          <div className="mt-12"><CommentSection slug={slug} /></div>
        </div>

        {showPlayer && episodes[selectedEpisode]?.link_embed && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl" onKeyDown={(e) => e.key === "Escape" && setShowPlayer(false)} tabIndex={0}>
            <div className="glass-panel relative aspect-video w-full max-w-4xl overflow-hidden rounded-[2rem] bg-black">
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
              <button onClick={() => setShowPlayer(false)} className="absolute right-3 top-3 rounded-full bg-black/70 p-2 text-white hover:bg-white/12" aria-label="Đóng trình phát video">Đóng</button>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
