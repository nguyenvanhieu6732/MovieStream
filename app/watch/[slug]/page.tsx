"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, Play, Star, Ticket, UserRound } from "lucide-react";
import extractTextFromHtml from "@/lib/extractTextFromHtml";
import CommentSection from "@/components/detailMovie/comment-section";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getImageUrl } from "@/lib/getImageUrl";
import { LoadingEffect } from "@/components/effect/loading-effect";
import { useSession } from "next-auth/react";
import { ImageWithLoader } from "@/components/ui/image-with-loader";

const OPHIM_API = process.env.NEXT_PUBLIC_OPHIM_API || "https://ophim1.com/v1/api";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

type MoviePerson = {
  tmdb_people_id: number;
  name: string;
  original_name?: string;
  character?: string;
  known_for_department?: string;
  profile_path?: string | null;
};

function getProfileImageUrl(profilePath?: string | null, size = "w185") {
  if (!profilePath) return "/placeholder.svg";
  if (/^https?:\/\//i.test(profilePath)) return profilePath;
  return `${TMDB_IMAGE_BASE}/${size}${profilePath.startsWith("/") ? profilePath : `/${profilePath}`}`;
}

export default function WatchPage({ params }: { params: { slug: string } }) {
  const { slug } = useParams();
  const [movie, setMovie] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isLongDescription, setIsLongDescription] = useState(false);
  const [showAllEpisodes, setShowAllEpisodes] = useState(false);
  const [relatedMovies, setRelatedMovies] = useState<any[]>([]);
  const [peoples, setPeoples] = useState<MoviePerson[]>([]);
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

        const peoplesRes = await fetch(`${OPHIM_API}/phim/${slug}/peoples`);
        if (peoplesRes.ok) {
          const peoplesJson = await peoplesRes.json();
          setPeoples((peoplesJson.data?.peoples || []).slice(0, 8));
        } else {
          setPeoples([]);
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

  useEffect(() => {
    if (selectedEpisode >= 12) {
      setShowAllEpisodes(true);
    }
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
  const hasMoreEpisodes = episodeList.length > 6;
  const visibleEpisodes = showAllEpisodes ? episodeList : episodeList.slice(0, 12);
  const showMoreButtonClassName = episodeList.length > 12 ? "mt-4 flex justify-center" : "mt-4 flex justify-center md:hidden";

  return (
    <div className="min-h-screen pb-16 text-white">
      <div className="spatial-container px-1 py-6 pt-32 md:pt-36">
        <div className="mb-5 text-balance text-2xl font-semibold tracking-tight md:text-4xl">
          Xem phim {movie.name} - Tập {currentEpisodeName}
        </div>

        <Card className="mb-8 p-3">
          <div className="relative aspect-video overflow-hidden rounded-[1.6rem]">

            {!isPlaying ? (
              /* ================= POSTER ================= */
              <div className="aspect-video relative">
                <ImageWithLoader
                  src={getImageUrl(movie.poster_url)}
                  alt={`Poster ${movie.name}`}
                  fill
                  sizes="100vw"
                  className="object-cover brightness-75"
                />

                {/* 🔒 PREMIUM + KHÔNG CÓ QUYỀN */}
                {!canWatch && isMoviePremium ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 p-4 text-center backdrop-blur-md">
                    <Ticket className="mb-3 h-12 w-12 text-primary" />
                    <p className="text-lg font-semibold text-white">
                      Phim Premium
                    </p>
                    <p className="mb-4 text-sm text-white/72">
                      Bạn cần nâng cấp tài khoản để xem phim này
                    </p>
                    <Link href="/profile">
                      <Button>
                        Nâng cấp Premium
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsPlaying(true)}
                    className="absolute inset-0 flex items-center justify-center bg-black/35 transition hover:bg-black/52"
                  >
                    <span className="glass-panel grid h-24 w-24 place-items-center rounded-full">
                      <Play className="h-12 w-12 text-white" />
                    </span>
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
                <div className="flex h-full w-full items-center justify-center bg-black/70 text-primary">
                  <div className="glass-panel rounded-[1.5rem] p-6 text-center">
                    <p className="text-lg font-semibold">Không thể phát video</p>
                    <p className="text-sm text-white/80">
                      Link bị lỗi hoặc không tồn tại
                    </p>
                  </div>
                </div>
              )

            ) : (
              /* 🚫 KHÔNG CÓ QUYỀN */
              <div className="flex h-full w-full items-center justify-center bg-black/70 text-primary">
                <p>Bạn không có quyền xem nội dung này</p>
              </div>
            )}

          </div>
        </Card>


        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardContent className="p-6 md:p-7">
                <h1 className="mb-4 text-2xl font-semibold tracking-tight md:text-3xl">{movie.name}</h1>
                <div className="mb-4 flex flex-wrap items-center gap-4 text-white/64">
                  <span>{movie.year}</span>
                  <span>{movie.time}</span>
                  <div className="flex items-center gap-1">
                    <Star className="text-primary w-4 h-4" />
                    <span>{movie.tmdb.vote_average || "Chưa có đánh giá"}</span>
                  </div>
                </div>
                <div className="mb-4 flex flex-wrap gap-2">
                  {movie.category?.map((g: any) => (
                    <Badge
                      key={g.name}
                      variant="secondary"
                      className="rounded-full border-white/10 bg-white/10 text-white/72 capitalize"
                    >
                      {g.name}
                    </Badge>
                  ))}
                </div>

                <div className="leading-relaxed text-white/62">
                  <p
                    className={`transition-all duration-300 ease-in-out ${showFullDescription ? "" : "line-clamp-4"
                      }`}
                  >
                    {descriptionText}
                  </p>
                  {isLongDescription && (
                    <button
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="group mt-3 flex items-center gap-1 font-semibold text-primary hover:text-primary/80"
                    >
                      {showFullDescription ? (
                        <>
                          Thu gọn
                          <ChevronDown className="h-4 w-4 rotate-180 transition group-hover:scale-110" />
                        </>
                      ) : (
                        <>
                          Xem thêm
                          <ChevronDown className="h-4 w-4 transition group-hover:scale-110" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>

            {episodeList.length > 0 && (
              <Card>
                <CardContent className="p-6 md:p-7">
                  <h3 className="mb-4 text-xl font-semibold">Danh sách tập</h3>
                  <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
                    {visibleEpisodes.map((ep: any, index: number) => {
                      const episodeName = ep.name?.trim() || `Tập ${index + 1}`;
                      const isSelected = selectedEpisode === index;
                      return (
                        <Button
                          key={index}
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedEpisode(index)}
                          className={!showAllEpisodes && index >= 6 ? "hidden md:inline-flex" : ""}
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
                </CardContent>
              </Card>
            )}

            <CommentSection slug={Array.isArray(slug) ? slug[0] : slug} /> {/* Đảm bảo slug là string */}
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4 md:p-5">
                <h3 className="mb-4 text-xl font-semibold">Gợi ý phim</h3>
                <div className="space-y-4">
                  {relatedMovies.map((item) => (
                    <Link
                      key={item.slug}
                      href={`/watch/${item.slug}`}
                      prefetch={false}
                      className="block group"
                    >
                      <div className="flex gap-3 rounded-[1.35rem] p-2 transition hover:bg-white/10">
                        <div className="relative h-[120px] w-20 overflow-hidden rounded-[1rem]">
                          <ImageWithLoader
                            src={getImageUrl(item.thumb_url)}
                            alt={item.name}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-white group-hover:text-primary line-clamp-2">
                            {item.name}
                          </p>
                          <p className="text-xs text-white/46">{item.year}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4 md:p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="text-xl font-semibold">Diễn viên</h3>
                  <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs text-white/54">
                    {peoples.length}
                  </span>
                </div>

                {peoples.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
                    {peoples.map((person) => (
                      <div
                        key={`${person.tmdb_people_id}-${person.character || person.name}`}
                        className="flex gap-3 rounded-[1.35rem] p-2 transition hover:bg-white/10"
                      >
                        <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-[1rem] bg-slate-900">
                          <ImageWithLoader
                            src={getProfileImageUrl(person.profile_path)}
                            alt={person.name}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1 py-1">
                          <p className="line-clamp-1 text-sm font-semibold text-white">
                            {person.name}
                          </p>
                          {person.character && (
                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/56">
                              {person.character}
                            </p>
                          )}
                          {person.known_for_department && (
                            <p className="mt-1 text-[11px] font-medium text-primary/80">
                              {person.known_for_department}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.04] p-5 text-center text-sm text-white/54">
                    <UserRound className="mx-auto mb-3 h-8 w-8 text-white/42" />
                    Chưa có dữ liệu diễn viên
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
