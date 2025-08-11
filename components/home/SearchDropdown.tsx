import Link from "next/link"
import Image from "next/image"
import { OPhimMovie } from "@/lib/interface"
import { getImageUrl } from "@/lib/getImageUrl"

export function SearchDropdown({
  results,
  onClose
}: {
  results: OPhimMovie[]
  onClose: () => void
}) {
  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border z-50 rounded shadow-lg max-h-96 overflow-auto">
      {results.map((movie) => (
        <Link
          key={movie._id}
          href={`/movie/${movie.slug}`}
          onClick={onClose}
          className="flex items-center px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 gap-3"
        >
          <Image
            src={getImageUrl(movie.thumb_url)}
            alt={movie.name}
            width={48}
            height={64}
            className="object-cover rounded"
            loading="lazy"
            unoptimized
          />
          <div className="flex flex-col">
            <span className="text-sm font-medium">{movie.name}</span>
            <span className="text-xs text-muted-foreground">{movie.year}</span>
          </div>
        </Link>
      ))}
    </div>
  )
}
