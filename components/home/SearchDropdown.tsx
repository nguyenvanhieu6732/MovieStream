"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { ImageWithLoader } from "@/components/ui/image-with-loader"
import { getImageUrl } from "@/lib/getImageUrl"
import { OPhimMovie } from "@/lib/interface"

export function SearchDropdown({
  results,
  onClose,
  position,
}: {
  results: OPhimMovie[]
  onClose: () => void
  position: { left: number; top: number; width: number }
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const dropdown = (
    <div
      className="glass-panel fixed z-[3000] overflow-hidden rounded-[1.75rem] border-white/18 bg-[#090d16]/94 p-1.5 text-white shadow-[0_30px_90px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur-[34px]"
      style={{
        left: position.left,
        top: position.top,
        width: position.width,
      }}
    >
      <div className="max-h-[min(24rem,calc(100vh-9rem))] overflow-auto rounded-[1.45rem] bg-white/[0.035] py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
        <div className="mb-1 flex items-center justify-between px-4 py-2">
          <span className="text-[11px] font-semibold uppercase text-white/46">
            Kết quả tìm kiếm
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.075] px-2.5 py-1 text-[11px] font-semibold text-white/62">
            {results.length}
          </span>
        </div>

        <div className="space-y-1 px-1">
          {results.map((movie) => (
            <Link
              key={movie._id}
              href={`/movie/${movie.slug}`}
              onClick={onClose}
              className="group flex items-center gap-3 rounded-[1.25rem] px-3 py-2.5 transition duration-300 ease-out hover:bg-white/[0.095] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
            >
              <div className="relative h-[4.25rem] w-[3.15rem] shrink-0 overflow-hidden rounded-[1rem] bg-white/[0.06] ring-1 ring-white/10">
                <ImageWithLoader
                  src={getImageUrl(movie.thumb_url)}
                  alt={movie.name}
                  fill
                  sizes="52px"
                  className="object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="min-w-0 flex-1">
                <span className="line-clamp-1 text-sm font-semibold text-white">
                  {movie.name}
                </span>
                <span className="mt-1 block text-xs text-white/50">
                  {movie.year || "Đang cập nhật"}
                </span>
              </div>
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.075] text-sm text-white/60 transition group-hover:border-primary/45 group-hover:bg-primary group-hover:text-white">
                -&gt;
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )

  if (!mounted) return null

  return createPortal(dropdown, document.body)
}
