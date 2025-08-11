// app/HomePageServer.tsx
import MovieSlider from "@/components/home/movie-slider";
import MovieHorizontalSlider from "@/components/home/MovieHorizontalSlider";
import { OPhimMovie } from "@/lib/interface";
import { movieEndpoints } from "@/lib/movieEndpoints";
import * as constants from "@/lib/constants";

async function fetchMovies(url: string): Promise<OPhimMovie[]> {
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
    const data = await res.json();
    return data.data?.items || [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

export default async function HomePageServer() {
  const results = await Promise.allSettled(
    movieEndpoints.map(ep => fetchMovies(ep.url))
  );

  const latestMovies = results[0].status === "fulfilled" ? results[0].value : [];
  const featuredMovies = latestMovies.slice(0, 5);

  const hanQuocMovies = results[1].status === "fulfilled" ? results[1].value : [];
  const trungQuocMovies = results[2].status === "fulfilled" ? results[2].value : [];
  const auMyMovies = results[3].status === "fulfilled" ? results[3].value : [];

  return (
    <div className="min-h-screen bg-background">
      <MovieSlider movies={featuredMovies} />
      <MovieHorizontalSlider gradient={constants.GRADIENTS.PURPLE} movies={hanQuocMovies} />
      <MovieHorizontalSlider gradient={constants.GRADIENTS.GREEN_TEAL} movies={trungQuocMovies} />
      <MovieHorizontalSlider gradient={constants.GRADIENTS.PINK_RED} movies={auMyMovies} />
    </div>
  );
}
