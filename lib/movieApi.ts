const DEFAULT_MOVIE_API = "https://vsmov.com/api";

// Chuẩn hóa biến môi trường: bỏ "/" cuối (vsmov trả 404 với "//danh-sach"),
// thêm "/api" nếu thiếu, và bỏ qua domain ophim cũ đã ngừng hoạt động
function resolveMovieApi(value?: string) {
  const url = value?.trim().replace(/\/+$/, "");
  if (!url || /ophim/i.test(url)) return DEFAULT_MOVIE_API;
  return /\/api$/i.test(url) ? url : `${url}/api`;
}

export const MOVIE_API = resolveMovieApi(process.env.NEXT_PUBLIC_OPHIM_API);

// Slug danh sách mà vsmov hỗ trợ qua /danh-sach/{slug}
const LIST_SLUGS = new Set(["phim-moi", "phim-moi-cap-nhat", "phim-bo", "phim-le", "phim-chieu-rap", "subteam"]);

// Slug "phim-<quốc gia>" cũ -> slug quốc gia
const COUNTRY_ALIASES: Record<string, string> = {
  "phim-han-quoc": "han-quoc",
  "phim-trung-quoc": "trung-quoc",
  "phim-au-my": "au-my",
  "phim-nhat-ban": "nhat-ban",
  "phim-thai-lan": "thai-lan",
};

// Slug không có trên vsmov -> slug thể loại tương đương
const GENRE_ALIASES: Record<string, string> = {
  "tinh-cam": "lang-man",
  "tv-show": "truyen-hinh-thuc-te",
  "tv-shows": "truyen-hinh-thuc-te",
  "phim-sap-chieu": "phim-moi",
};

/**
 * Tạo URL danh sách phim. vsmov bỏ qua các query lọc (country, year, limit, sort),
 * nên lọc quốc gia phải đi qua /quoc-gia/{slug}.
 */
export function listUrl(slug: string, { page = 1, country = "" }: { page?: number; country?: string } = {}) {
  const query = `page=${page}`;
  const countrySlug = country || COUNTRY_ALIASES[slug];
  if (countrySlug) return `${MOVIE_API}/quoc-gia/${countrySlug}?${query}`;

  const resolved = GENRE_ALIASES[slug] || slug;
  if (LIST_SLUGS.has(resolved)) return `${MOVIE_API}/danh-sach/${resolved}?${query}`;
  return `${MOVIE_API}/the-loai/${resolved}?${query}`;
}

export function movieUrl(slug: string) {
  return `${MOVIE_API}/phim/${encodeURIComponent(slug)}`;
}

export function searchUrl(keyword: string) {
  return `${MOVIE_API}/tim-kiem?keyword=${encodeURIComponent(keyword)}`;
}

// vsmov đôi khi trả poster_url/thumb_url là {}: đổi về "" để fallback `poster_url || thumb_url` hoạt động
function normalizeImages<T>(movie: T): T {
  if (!movie || typeof movie !== "object") return movie;
  const m = movie as any;
  return {
    ...m,
    poster_url: typeof m.poster_url === "string" ? m.poster_url : "",
    thumb_url: typeof m.thumb_url === "string" ? m.thumb_url : "",
  };
}

// Hỗ trợ cả định dạng ophim v1 ({ data: { items } }) và vsmov ({ items })
export function getItems<T = any>(json: any): T[] {
  return (json?.data?.items || json?.items || []).map(normalizeImages);
}

export function getTotalPages(json: any): number {
  const pagination = json?.pagination || json?.data?.params?.pagination;
  return Number(pagination?.totalPages) || 1;
}

export function getTotalItems(json: any): number {
  const pagination = json?.pagination || json?.data?.params?.pagination;
  return Number(pagination?.totalItems) || 0;
}

// Hỗ trợ cả { data: { item } } và { movie, episodes }
export function getMovie<T = any>(json: any): T | null {
  if (json?.data?.item) return normalizeImages(json.data.item);
  if (json?.movie) return normalizeImages({ ...json.movie, episodes: json.episodes || json.movie.episodes || [] });
  return null;
}
