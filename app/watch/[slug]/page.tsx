"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Star, Ticket } from "lucide-react";
import extractTextFromHtml from "@/lib/extractTextFromHtml";
import CommentSection from "@/components/detailMovie/comment-section";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { getImageUrl } from "@/lib/getImageUrl";
import { LoadingEffect } from "@/components/effect/loading-effect";
import { useSession } from "next-auth/react";

export default function WatchPage({ params }: { params: { slug: string } }) {
  const { slug } = useParams();
  const [movie, setMovie] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isLongDescription, setIsLongDescription] = useState(false);
  const [relatedMovies, setRelatedMovies] = useState<any[]>([]);
  const searchParams = useSearchParams();
  const epFromQuery = searchParams.get("ep");

  const defaultEpisode = epFromQuery ? parseInt(epFromQuery) : 0;
  const [selectedEpisode, setSelectedEpisode] = useState(defaultEpisode);
  const [isMoviePremium, setIsMoviePremium] = useState(false)
  const [isUserPremium, setIsUserPremium] = useState(false)
  const { data: session } = useSession()

  const canWatch =
    !isMoviePremium ||
    isUserPremium ||
    session?.user?.role === "admin"


  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = await fetch(`https://ophim1.com/phim/${slug}`);
        const json = await res.json();
        setMovie({
          ...json.movie,
          episodes: json.episodes,
        });

        const plainText = extractTextFromHtml(json.movie.content || "");
        const lineCount = plainText.split("\n").length;
        setIsLongDescription(lineCount > 4 || plainText.length > 300);

        // Fetch phim liên quan
        const firstCategorySlug = json.movie.category?.[0]?.slug;
        if (firstCategorySlug) {
          const relatedRes = await fetch(`https://ophim1.com/danh-sach/phim-moi-cap-nhat?page=1`);
          const relatedJson = await relatedRes.json();
          const suggestions = relatedJson.items.filter((m: any) => m.slug !== slug).slice(0, 4);
          setRelatedMovies(suggestions);
        }
      } catch (err) {
        console.error("Lỗi khi tải phim:", err);
      }
    };

    fetchMovie();
    document.documentElement.classList.add("dark");
  }, [slug]);

  useEffect(() => {
    const checkMoviePremium = async () => {
      const res = await fetch(`/api/premium-check/check?slug=${slug}`)
      if (!res.ok) return
      const data = await res.json()
      setIsMoviePremium(Boolean(data.isPremium))
    }
    checkMoviePremium()
  }, [slug])


  useEffect(() => {
    const checkUserPremium = async () => {
      const res = await fetch("/api/premium/status")
      if (!res.ok) return
      const data = await res.json()
      setIsUserPremium(Boolean(data.isPremium))
    }
    checkUserPremium()
  }, [])



  useEffect(() => {
    setIsPlaying(false);
  }, [selectedEpisode]);

  if (!movie) {
    return <LoadingEffect message="Đang tải thông tin phim..." />;
  }

  const episodeList = movie.episodes?.[0]?.server_data || [];
  const currentEpisode = episodeList[selectedEpisode];
  const currentEpisodeName =
    currentEpisode?.filename?.trim() === ""
      ? "1"
      : currentEpisode?.name || "1";

  const descriptionText = extractTextFromHtml(movie.content);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-6">
        <div className="text-xl font-semibold mb-4 mt-16">
          Xem phim {movie.name} - Tập {currentEpisodeName}
        </div>

        {/* Video player */}
        <Card className="mb-6 bg-black border-gray-800">
          <div className="aspect-video relative rounded-md overflow-hidden">

            {!isPlaying ? (
              /* ================= POSTER ================= */
              <div className="aspect-video relative">
                <Image
                  src={movie.poster_url}
                  alt={`Poster ${movie.name}`}
                  fill
                  className="object-cover brightness-75"
                />

                {/* 🔒 PREMIUM + KHÔNG CÓ QUYỀN */}
                {!canWatch && isMoviePremium ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-center p-4">
                    <Ticket className="w-12 h-12 text-yellow-400 mb-2" />
                    <p className="text-lg font-semibold text-yellow-400">
                      Phim Premium
                    </p>
                    <p className="text-sm text-white/80 mb-4">
                      Bạn cần nâng cấp tài khoản để xem phim này
                    </p>
                    <Link href="/profile">
                      <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
                        Nâng cấp Premium
                      </Button>
                    </Link>
                  </div>
                ) : (
                  /* ▶️ CÓ QUYỀN → PLAY */
                  <button
                    onClick={() => setIsPlaying(true)}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/60 transition"
                  >
                    <Play className="w-12 h-12 text-white" />
                  </button>
                )}
              </div>

            ) : canWatch ? (
              /* ================= ĐANG PLAY ================= */

              currentEpisode?.link_embed ? (
                <iframe
                  src={currentEpisode.link_embed}
                  allowFullScreen
                  className="w-full h-full"
                />
              ) : (
                /* ⚠️ LINK LỖI */
                <div className="w-full h-full flex items-center justify-center bg-black/70 text-red-500">
                  <div className="text-center p-4 border border-red-500 rounded-lg bg-black/60">
                    <p className="text-lg font-semibold">Không thể phát video</p>
                    <p className="text-sm text-white/80">
                      Link bị lỗi hoặc không tồn tại
                    </p>
                  </div>
                </div>
              )

            ) : (
              /* 🚫 KHÔNG CÓ QUYỀN */
              <div className="w-full h-full flex items-center justify-center bg-black/70 text-red-500">
                <p>Bạn không có quyền xem nội dung này</p>
              </div>
            )}

          </div>
        </Card>


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2">
            <Card className="mb-6 bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <h1 className="text-2xl font-bold mb-4">{movie.name}</h1>
                <div className="flex flex-wrap items-center gap-4 mb-4 text-gray-300">
                  <span>{movie.year}</span>
                  <span>{movie.time}</span>
                  <div className="flex items-center gap-1">
                    <Star className="text-yellow-400 w-4 h-4" />
                    <span>{movie.tmdb.vote_average || "Chưa có đánh giá"}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {movie.category?.map((g: any) => (
                    <Badge
                      key={g.name}
                      variant="secondary"
                      className="bg-gray-800 text-gray-300 capitalize"
                    >
                      {g.name}
                    </Badge>
                  ))}
                </div>

                <div className="text-gray-400 leading-relaxed">
                  <p
                    className={`transition-all duration-300 ease-in-out ${showFullDescription ? "" : "line-clamp-4"
                      }`}
                  >
                    {descriptionText}
                  </p>
                  {isLongDescription && (
                    <button
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="mt-2 text-red-500 hover:underline font-semibold flex items-center gap-1 group"
                    >
                      {showFullDescription ? (
                        <>
                          Thu gọn
                          <svg className="w-4 h-4 rotate-180 group-hover:scale-110 transition" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </>
                      ) : (
                        <>
                          Xem thêm
                          <svg className="w-4 h-4 group-hover:scale-110 transition" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>

            {episodeList.length > 0 && (
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Danh sách tập</h3>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {episodeList.map((ep: any, index: number) => {
                      const episodeName = ep.name?.trim() || `Tập ${index + 1}`;
                      const isSelected = selectedEpisode === index;
                      return (
                        <Button
                          key={index}
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedEpisode(index)}
                        >
                          {episodeName}
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            <CommentSection slug={Array.isArray(slug) ? slug[0] : slug} /> {/* Đảm bảo slug là string */}
          </div>

          {/* Sidebar: Gợi ý phim */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-4">
                <h3 className="text-xl font-semibold mb-4">Gợi ý phim</h3>
                <div className="space-y-4">
                  {relatedMovies.map((item) => (
                    <Link
                      key={item.slug}
                      href={`/watch/${item.slug}`}
                      className="block group"
                    >
                      <div className="flex gap-3 hover:bg-gray-800 p-2 rounded-lg transition">
                        <div className="relative w-20 h-[120px] rounded overflow-hidden">
                          <Image
                            src={getImageUrl(item.thumb_url)}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-white group-hover:text-red-400 line-clamp-2">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-400">{item.year}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}