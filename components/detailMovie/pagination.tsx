"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PaginationProps } from "@/lib/interface"
import { useState, useEffect } from "react"

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const [inputPage, setInputPage] = useState(currentPage)

  useEffect(() => {
    setInputPage(currentPage)
  }, [currentPage])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value)
    if (val >= 1 && val <= totalPages) {
      setInputPage(val)
    } else {
      setInputPage(NaN)
    }
  }

  const handleInputBlur = () => {
    if (!isNaN(inputPage)) {
      onPageChange(inputPage)
    } else {
      setInputPage(currentPage)
    }
  }

  return (
    <div className="flex justify-center items-center gap-4 mt-6">
      {/* Nút trái */}
      <Button
        size="icon"
        className="rounded-full w-10 h-10 hover:bg-white/10 transition"
        variant="ghost"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>

      {/* Ô giữa */}
      <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full text-white">
        <span>Trang</span>
        <input
          type="number"
          min={1}
          max={totalPages}
          value={isNaN(inputPage) ? "" : inputPage}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          className="w-14 h-8 rounded-md bg-background text-center text-white outline-none border border-border appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <span>/ {totalPages}</span>
      </div>

      {/* Nút phải */}
      <Button
        size="icon"
        className="rounded-full w-10 h-10 hover:bg-white/10 transition"
        variant="ghost"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ChevronRight className="w-5 h-5" />
      </Button>
    </div>
  )
}
