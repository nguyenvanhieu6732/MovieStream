"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { MovieCard } from "@/components/movie-card"
import { useDebounce } from "@/hooks/useDebounce"
import { LoadingEffect } from "@/components/loading-effect"

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
    const fetchData = async () => {
      if (!debouncedSearchQuery.trim()) {
        setResults([])
        return
      }

      setLoading(true)
      try {
        const res = await fetch(
          `https://ophim1.com/v1/api/tim-kiem?keyword=${encodeURIComponent(debouncedSearchQuery)}`
        )
        const json = await res.json()
        if (json.status && Array.isArray(json.data?.items)) {
          setResults(json.data.items)
        } else {
          setResults([])
        }
      } catch (error) {
        console.error("Lỗi tìm kiếm:", error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
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

  if (loading) {
    return (
      <LoadingEffect message="Đang tải kết quả tìm kiếm..." />
    )
  }


  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">
          {searchQuery ? `Kết quả cho "${searchQuery}"` : "Tìm kiếm phim"}
        </h1>

        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm kiếm phim..."
              className="pl-10 h-12 text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        {loading ? (
          <LoadingEffect message="Đang tải kết quả tìm kiếm..." />
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            {results.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">Không tìm thấy kết quả</h3>
            <p className="text-muted-foreground">Thử lại với từ khóa khác</p>
          </div>
        )}
      </div>
    </div>
  )
}
