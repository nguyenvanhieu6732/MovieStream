import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  function getPages(): (number | "...")[] {
    const delta = 2
    const range: (number | "...")[] = []
    const rangeWithDots: (number | "...")[] = []
    let l: number = 0;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i)
      }
    }

    for (let i of range) {
      if (l !== 0) {
        if ((Number(i) - l) === 2) rangeWithDots.push(l + 1)
        else if ((Number(i) - l) !== 1) rangeWithDots.push("...")
      }
      rangeWithDots.push(i)
      l = i as number
    }

    return rangeWithDots
  }

  return (
    <div className="flex justify-center items-center gap-2 mt-6">
      {/* Prev */}
      <Button
        size="icon"
        variant="outline"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      {/* Page numbers */}
      {getPages().map((page, index) =>
        page === "..." ? (
          <span key={index} className="px-2 text-gray-400">
            ...
          </span>
        ) : (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "outline"}
            onClick={() => onPageChange(page)}
            className="w-10 h-10 p-0"
          >
            {page}
          </Button>
        )
      )}

      {/* Next */}
      <Button
        size="icon"
        variant="outline"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  )
}
