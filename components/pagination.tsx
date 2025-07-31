"use client"

import { Button } from "@/components/ui/button"
import { PaginationProps } from "@/lib/interface"
import { ChevronLeft, ChevronRight } from "lucide-react"



export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const maxVisible = 5
  const pages: (number | string)[] = []

  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    const startPage = Math.max(2, currentPage - 1)
    const endPage = Math.min(totalPages - 1, currentPage + 1)

    pages.push(1)
    if (startPage > 2) pages.push("...")

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    if (endPage < totalPages - 1) pages.push("...")
    pages.push(totalPages)
  }

  return (
    <div className="flex justify-center items-center gap-2 mt-6">
      <Button
        size="icon"
        variant="outline"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      {pages.map((page, index) =>
        typeof page === "number" ? (
          <Button
            key={index}
            variant={page === currentPage ? "default" : "outline"}
            onClick={() => onPageChange(page)}
            className="w-10 h-10 p-0"
          >
            {page}
          </Button>
        ) : (
          <span key={index} className="px-2 text-muted-foreground">
            ...
          </span>
        )
      )}

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
