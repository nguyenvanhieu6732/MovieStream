// interface danh sach phim
export interface OPhimMovie {
  _id: string
  name: string
  slug: string
  origin_name: string
  poster_url: string
  thumb_url: string
  year: number
  time?: string
  type?: string
  episode_current?: string
  quality?: string
  lang?: string
  sub_docquyen?: boolean
  chieurap?: boolean
  modified?: {
    time: string
  }
  categories?: {
    id: string
    name: string
    slug: string
  }[]
  country?: {
    id: string
    name: string
    slug: string
  }[]
  tmdb?: {
    type?: string
    id?: string
    season?: string | null
    vote_average?: number
    vote_count?: number
  }
  imdb?: {
    id?: string
    vote_average?: number
    vote_count?: number
  }
}




export interface EpisodeData {
  name: string
  slug: string
  filename: string
  link_embed: string
  link_m3u8: string
}

// interface detail phim
export interface Episode {
  server_name: string
  server_data: EpisodeData[]
}

export interface Category {
  id?: string
  name: string
  slug?: string
}

export interface Country {
  id?: string
  name: string
  slug?: string
}

export interface TmdbInfo {
  type: string
  id: string
  vote_average: number
  vote_count: number
}

export interface ImdbInfo {
  id: string
  vote_average: number
  vote_count: number
}

export interface MovieItem {
  _id: string
  name: string
  slug: string
  origin_name: string
  content: string
  type: string
  status: string
  thumb_url: string
  poster_url: string
  trailer_url: string
  time: string
  episode_current: string
  episode_total: string
  quality: string
  lang: string
  year: number
  view: number
  actor: string[]
  director: string[]
  category: Category[]
  country: Country[]
  episodes: Episode[]
  tmdb?: TmdbInfo
  imdb?: ImdbInfo
}

export interface SeoOnPage {
  [key: string]: any // Tùy chỉnh nếu bạn biết cụ thể các key
}

export interface BreadCrumbItem {
  id?: string
  name: string
  slug: string
  [key: string]: any
}


// interface phân trang
export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export interface PropsMovieHorizontalSlider {
  slug: string // bắt buộc
  title?: string
  gradient?: string
  page?: number
  limit?: number
  sort_field?: string
  sort_type?: string
  category?: string
  country?: string
  year?: string
}

export interface SectionHeaderProps {
  country?: string;
  link?: string;
  gradient?: string; // ví dụ: "from-purple-400 via-purple-500 to-white"
}