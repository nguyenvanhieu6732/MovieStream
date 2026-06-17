import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MovieDetailClient from "./MovieDetailClient";
import extractTextFromHtml from "@/lib/extractTextFromHtml";
import type { MovieItem } from "@/lib/interface";
import { fetchRelatedMovies } from "@/lib/relatedMovies";

const API_URL = process.env.NEXT_PUBLIC_OPHIM_API || "https://ophim1.com/v1/api";

type Episode = {
  name?: string;
  link_embed: string;
  link_m3u8?: string;
};

async function fetchMovie(slug: string): Promise<MovieItem | null> {
  try {
    const res = await fetch(`${API_URL}/phim/${encodeURIComponent(slug)}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;

    const data = await res.json();
    return data?.data?.item || null;
  } catch (error) {
    console.error("[movie page] fetch movie failed:", error);
    return null;
  }
}

function getEpisodes(movie: MovieItem): Episode[] {
  return movie.episodes?.[0]?.server_data || (Array.isArray((movie as any).server_data) ? (movie as any).server_data : []);
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const movie = await fetchMovie(params.slug);
  if (!movie) {
    return {
      title: "Không tìm thấy phim - MovieStream",
    };
  }

  const description = extractTextFromHtml(movie.content || "").slice(0, 160);

  return {
    title: `${movie.name} - Xem phim online`,
    description,
    openGraph: {
      title: movie.name,
      description,
      images: movie.poster_url ? [movie.poster_url] : undefined,
    },
  };
}

export default async function MovieDetailPage({ params }: { params: { slug: string } }) {
  const movie = await fetchMovie(params.slug);
  if (!movie) notFound();

  const [relatedMovies] = await Promise.all([
    fetchRelatedMovies(movie, 6),
  ]);
  const episodes = getEpisodes(movie);
  const descriptionText = extractTextFromHtml(movie.content || "");

  return (
    <MovieDetailClient
      slug={params.slug}
      initialMovie={movie}
      initialEpisodes={episodes}
      initialRelatedMovies={relatedMovies}
      initialIsLongDescription={descriptionText.split("\n").length > 4 || descriptionText.length > 300}
    />
  );
}
