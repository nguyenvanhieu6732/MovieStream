"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { MovieCard } from "@/components/detailMovie/movie-card"
import { useDebounce } from "@/hooks/useDebounce"
import { LoadingEffect } from "@/components/effect/loading-effect"

export default function SearchPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const debouncedSearchQuery = useDebounce(searchQuery, 1000)

  // Đồng bộ query từ URL
  useEffect(() => {
    const q = searchParams.get("q") || ""
    setSearchQuery(q)
  }, [searchParams])

  // Gọi API khi debounced query thay đổi
  useEffect(() => {
    const controller = new AbortController()

    const fetchData = async () => {
      if (!debouncedSearchQuery.trim()) {
        setResults([])
        return
      }

      setLoading(true)
      try {
        const res = await fetch(
          `https://ophim1.com/v1/api/tim-kiem?keyword=${encodeURIComponent(debouncedSearchQuery)}`,
          { signal: controller.signal }
        )
        const json = await res.json()
        if (json.status && Array.isArray(json.data?.items)) {
          setResults(json.data.items)
        } else {
          setResults([])
        }
      } catch (error) {
        if (controller.signal.aborted) return
        console.error("Lỗi tìm kiếm:", error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    return () => controller.abort()
  }, [debouncedSearchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery.trim()) {
      params.set("q", searchQuery.trim())
    } else {
      params.delete("q")
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="min-h-screen">
      <div className="spatial-container px-1 py-8 pt-32 md:pt-36">
        <div className="glass-panel mb-8 rounded-[2rem] p-6 md:p-8">
          <p className="mb-2 text-sm font-medium text-white/46">Tìm trong không gian phim</p>
          <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-5xl">
            {searchQuery ? `Kết quả cho "${searchQuery}"` : "Tìm kiếm phim"}
          </h1>
        </div>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative max-w-3xl">
            <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-white/46" />
            <Input
              type="search"
              placeholder="Tìm kiếm phim..."
              className="h-14 rounded-[1.65rem] pl-12 text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        {loading ? (
          <LoadingEffect message="Đang tải kết quả tìm kiếm..." />
        ) : results.length > 0 ? (
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5 lg:grid-cols-6">
            {results.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="glass-panel mx-auto max-w-xl rounded-[2rem] px-6 py-20 text-center">
            <h3 className="mb-2 text-xl font-semibold">Không tìm thấy kết quả</h3>
            <p className="text-white/54">Thử lại với từ khóa khác</p>
          </div>
        )}
      </div>
    </div>
  )
}
