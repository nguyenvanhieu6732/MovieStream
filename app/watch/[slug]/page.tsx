import type { Metadata } from "next";
import { notFound } from "next/navigation";
import WatchClient from "./WatchClient";
import extractTextFromHtml from "@/lib/extractTextFromHtml";
import { fetchRelatedMovies } from "@/lib/relatedMovies";
import { MOVIE_API, getMovie, movieUrl } from "@/lib/movieApi";

type MoviePerson = {
  tmdb_people_id: number;
  name: string;
  original_name?: string;
  character?: string;
  known_for_department?: string;
  profile_path?: string | null;
};

async function fetchWatchMovie(slug: string) {
  try {
    const res = await fetch(movieUrl(slug), {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;

    return getMovie(await res.json());
  } catch (error) {
    console.error("[watch page] fetch movie failed:", error);
    return null;
  }
}

async function fetchPeoples(slug: string): Promise<MoviePerson[]> {
  try {
    const res = await fetch(`${MOVIE_API}/phim/${encodeURIComponent(slug)}/peoples`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];

    const json = await res.json();
    return (json.data?.peoples || []).slice(0, 8);
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const movie = await fetchWatchMovie(params.slug);
  if (!movie) {
    return {
      title: "Không tìm thấy phim - MovieStream",
    };
  }

  const description = extractTextFromHtml(movie.content || "").slice(0, 160);

  return {
    title: `Xem phim ${movie.name} - MovieStream`,
    description,
    openGraph: {
      title: movie.name,
      description,
      images: movie.poster_url ? [movie.poster_url] : undefined,
    },
  };
}

export default async function WatchPage({ params }: { params: { slug: string } }) {
  const movie = await fetchWatchMovie(params.slug);
  if (!movie) notFound();

  const [relatedMovies, peoples] = await Promise.all([
    fetchRelatedMovies(movie, 4),
    fetchPeoples(params.slug),
  ]);
  const descriptionText = extractTextFromHtml(movie.content || "");

  return (
    <WatchClient
      slug={params.slug}
      initialMovie={movie}
      initialRelatedMovies={relatedMovies}
      initialPeoples={peoples}
      initialIsLongDescription={descriptionText.split("\n").length > 4 || descriptionText.length > 300}
    />
  );
}
