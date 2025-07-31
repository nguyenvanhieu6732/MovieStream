export interface OPhimMovie {
  _id: string
  name: string
  slug: string
  origin_name: string
  poster_url: string
  thumb_url: string
  year: number
  time?: string
  categories?: { name: string }[]
  tmdb?: {
    vote_average?: number
  }
}

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

