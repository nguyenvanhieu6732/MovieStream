import { getImageUrl } from "@/lib/getImageUrl";

const OPHIM_API = process.env.NEXT_PUBLIC_OPHIM_API || "https://ophim1.com/v1/api";

type MovieTaxonomy = {
  slug?: string;
  name?: string;
};

type RelatedMovieSource = {
  slug?: string;
  type?: string;
  category?: MovieTaxonomy[];
  categories?: MovieTaxonomy[];
  country?: MovieTaxonomy[];
};

export type RelatedMovie = {
  _id?: string;
  name: string;
  slug: string;
  origin_name?: string;
  thumb_url?: string;
  poster_url?: string;
  year?: number;
  type?: string;
};

function getPrimaryType(type?: string) {
  if (type === "single") return "phim-le";
  if (type === "series") return "phim-bo";
  if (type === "hoathinh") return "hoat-hinh";
  if (type === "tvshows") return "tv-shows";
  return "phim-moi-cap-nhat";
}

async function fetchItems(url: string) {
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data?.items || data.items || [];
  } catch {
    return [];
  }
}

export async function fetchRelatedMovies(source: RelatedMovieSource, limit = 6): Promise<RelatedMovie[]> {
  const currentSlug = source.slug;
  const categories = source.category || source.categories || [];
  const categorySlug = categories[0]?.slug;
  const countrySlug = source.country?.[0]?.slug;
  const typeSlug = getPrimaryType(source.type);

  const urls = [
    categorySlug && `${OPHIM_API}/the-loai/${categorySlug}?page=1&limit=24${countrySlug ? `&country=${countrySlug}` : ""}`,
    categorySlug && `${OPHIM_API}/the-loai/${categorySlug}?page=2&limit=24`,
    `${OPHIM_API}/danh-sach/${typeSlug}?page=1&limit=24${countrySlug ? `&country=${countrySlug}` : ""}`,
    `${OPHIM_API}/danh-sach/phim-moi-cap-nhat?page=1&limit=24`,
  ].filter(Boolean) as string[];

  const seen = new Set<string>();
  const related: RelatedMovie[] = [];

  const results = await Promise.allSettled(urls.map((url) => fetchItems(url)));

  for (const result of results) {
    if (result.status !== "fulfilled") continue;

    const items = result.value;
    for (const item of items) {
      if (!item?.slug || item.slug === currentSlug || seen.has(item.slug)) continue;
      seen.add(item.slug);
      related.push({
        _id: item._id,
        name: item.name,
        slug: item.slug,
        origin_name: item.origin_name,
        thumb_url: getImageUrl(item.thumb_url || item.poster_url),
        poster_url: getImageUrl(item.poster_url || item.thumb_url),
        year: item.year,
        type: item.type,
      });
      if (related.length >= limit) return related;
    }
  }

  return related;
}
