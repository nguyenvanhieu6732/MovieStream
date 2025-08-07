// src/app/page.tsx
import MovieSlider from "@/components/movie-slider"
import MovieHorizontalSlider from "@/components/MovieHorizontalSlider"
import { OPhimMovie } from "@/lib/interface"

async function getMovies(): Promise<OPhimMovie[]> {
  const res = await fetch(`https://ophim1.com/v1/api/danh-sach/phim-moi?page=1&year=2025&country=han-quoc`, {
    next: { revalidate: 3600 },
  })
  const data = await res.json()
  return data.data?.items || []
}

export default async function HomePage() {
  const latestMovies = await getMovies()
  const featuredMovies = latestMovies.slice(0, 5)

  return (
    <div className="min-h-screen bg-background">
      <MovieSlider movies={featuredMovies} />
      <MovieHorizontalSlider movies={latestMovies} title="Phim mới " />
    </div>
  )
}
