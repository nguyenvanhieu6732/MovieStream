import MovieSlider from "@/components/home/movie-slider";
import MovieHorizontalSlider from "@/components/home/MovieHorizontalSlider";
import { OPhimMovie } from "@/lib/interface";
import { movieEndpoints } from "@/lib/movieEndpoints";
import * as constants from "@/lib/constants";
import LazyCarousels from "../../hooks/LazySection";

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
  const results = await Promise.allSettled([
    fetchMovies(movieEndpoints[0].url),
    fetchMovies(movieEndpoints[1].url),
    fetchMovies(movieEndpoints[2].url),
    fetchMovies(movieEndpoints[3].url),
  ]);

  const latestMovies = results[0].status === "fulfilled" ? results[0].value : [];
  const featuredMovies = latestMovies.slice(0, 5);

  const hanQuocMovies = results[1].status === "fulfilled" ? results[1].value : [];
  const trungQuocMovies = results[2].status === "fulfilled" ? results[2].value : [];
  const auMyMovies = results[3].status === "fulfilled" ? results[3].value : [];

  return (
    <div className="min-h-screen bg-black">
      <MovieSlider movies={featuredMovies} />

      <MovieHorizontalSlider
        gradient={constants.GRADIENTS.PURPLE}
        movies={hanQuocMovies}
        title={movieEndpoints[1].title}
        country={movieEndpoints[1].country}
        movieSlug={movieEndpoints[1].movieSlug}
      />

      <MovieHorizontalSlider
        gradient={constants.GRADIENTS.GREEN_TEAL}
        movies={trungQuocMovies}
        title={movieEndpoints[2].title}
        country={movieEndpoints[2].country}
        movieSlug={movieEndpoints[2].movieSlug}
      />

      <MovieHorizontalSlider
        gradient={constants.GRADIENTS.PINK_RED}
        movies={auMyMovies}
        title={movieEndpoints[3].title}
        country={movieEndpoints[3].country}
        movieSlug={movieEndpoints[3].movieSlug}
      />

      <LazyCarousels
        carousels={[
          {
            url: movieEndpoints[5].url,
            title: "Phim lẻ mới nhất",
            itemsPerRow: 7,
            itemPerRowMobile: 3,  
            showChevron: false,
            layout: "thumbnail",
            seeAllLink: movieEndpoints[5].seeAllLink
          },
          {
            url: movieEndpoints[4].url,
            title: "Phim bộ mới cóng",
            itemsPerRow: 5,
            showChevron: false,
            itemPerRowMobile: 2,
            layout: "thumbnail",
            seeAllLink: movieEndpoints[4].seeAllLink
          },
          {
            url: movieEndpoints[6].url,
            title: "Phim chiếu rạp mới nhất",
            itemsPerRow: 3,
            itemPerRowMobile: 2,
            showChevron: false,
            layout: "poster",
            seeAllLink: movieEndpoints[6].seeAllLink

          },
        ]}
      />

      <LazyCarousels
        carousels={[
          {
            url: movieEndpoints[7].url,
            title: "Phim Nhật Bản mới nhất",
            itemsPerRow: 7,
            itemPerRowMobile: 2,
            showChevron: false,
            layout: "thumbnail",
            seeAllLink: movieEndpoints[7].seeAllLink
          },
          {
            url: movieEndpoints[8].url,
            title: "Phim Thái New: Không Drama Đời Không Nể",
            itemsPerRow: 5,
            itemPerRowMobile: 2,
            showChevron: false,
            layout: "thumbnail",
            seeAllLink: movieEndpoints[8].seeAllLink
          },
          {
            url: movieEndpoints[9].url,
            title: "Phim Sắp Tới Trên MovieStream",
            itemsPerRow: 3,
            itemPerRowMobile: 2,
            showChevron: false,
            layout: "poster",
            seeAllLink: movieEndpoints[9].seeAllLink
          },
        ]}
      />
    </div>
  );
}
