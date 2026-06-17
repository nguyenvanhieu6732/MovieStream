"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ExternalLink, Film, Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface PremiumMovie {
  id: string
  slug: string
  note?: string
  createdAt: string
}

export default function PremiumMoviesPage() {
  const [movies, setMovies] = useState<PremiumMovie[]>([])
  const [loading, setLoading] = useState(true)
  const [removingSlug, setRemovingSlug] = useState<string | null>(null)

  const fetchMovies = async () => {
    const res = await fetch("/api/admin/premium-movies")
    const data = await res.json()
    setMovies(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchMovies()
  }, [])

  const handleRemove = async (slug: string) => {
    if (!confirm("Gỡ phim này khỏi Premium?")) return

    setRemovingSlug(slug)
    await fetch("/api/admin/premium-movies", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    })

    await fetchMovies()
    setRemovingSlug(null)
  }

  if (loading) {
    return (
      <div className="glass-card flex min-h-60 items-center justify-center rounded-[1.85rem] p-8 text-white/62">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Đang tải danh sách phim Premium...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="glass-panel relative isolate overflow-hidden rounded-[2rem] p-6 md:p-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_0%,rgba(244,63,94,0.18),transparent_34%),radial-gradient(circle_at_90%_10%,rgba(255,255,255,0.10),transparent_30%)]" />
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.07] px-3 py-1 text-xs font-semibold text-white/62">
              <Film className="h-3.5 w-3.5" />
              Premium catalog
            </div>
            <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
              Quản lý phim Premium
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/54">
              Kiểm tra các phim đang được khóa cho tài khoản Premium và mở nhanh
              trang phim để đối soát nội dung.
            </p>
          </div>
          <div className="rounded-[1.45rem] border border-white/12 bg-white/[0.055] px-4 py-3">
            <p className="text-sm text-white/44">Tổng phim</p>
            <p className="mt-1 text-3xl font-semibold tabular-nums">
              {movies.length.toLocaleString("vi-VN")}
            </p>
          </div>
        </div>
      </section>

      <section className="glass-card rounded-[1.85rem] p-3">
        {movies.length === 0 ? (
          <div className="flex min-h-56 flex-col items-center justify-center rounded-[1.55rem] border border-dashed border-white/14 bg-white/[0.035] px-4 text-center">
            <Film className="h-9 w-9 text-white/40" />
            <p className="mt-4 text-lg font-semibold text-white">
              Chưa có phim Premium nào
            </p>
            <p className="mt-2 max-w-md text-sm leading-6 text-white/46">
              Khi có phim được đánh dấu Premium, danh sách sẽ xuất hiện ở đây để
              admin kiểm tra và gỡ nhanh.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Slug</TableHead>
                <TableHead>Tên / ghi chú</TableHead>
                <TableHead>Ngày thêm</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {movies.map((movie) => (
                <TableRow key={movie.id}>
                  <TableCell className="font-mono text-white/78">
                    {movie.slug}
                  </TableCell>
                  <TableCell>{movie.note || "-"}</TableCell>
                  <TableCell>
                    {new Date(movie.createdAt).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/movie/${movie.slug}`} target="_blank">
                          <ExternalLink className="h-4 w-4" />
                          Xem
                        </Link>
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemove(movie.slug)}
                        disabled={removingSlug === movie.slug}
                      >
                        {removingSlug === movie.slug ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        Gỡ
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  )
}
