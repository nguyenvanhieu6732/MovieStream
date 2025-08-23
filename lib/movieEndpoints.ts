import * as constants from "@/lib/constants";

const BASE_URL = process.env.NEXT_PUBLIC_OPHIM_API;
const movieSlug = constants.MOVIE_SLUG;
const YEAR = 2025;
const LIMIT = 20;
const COUNTRY = constants.COUNTRY;


export const movieEndpoints = [
  {
    key: "latestMovies",
    url: `${BASE_URL}/danh-sach/${constants.MOVIE_SLUG.PHIM_MOI}
    ?page=1&year=${YEAR}&country=han-quoc`,
    title: "Phim Mới",
    country: "",
    movieSlug: movieSlug.PHIM_MOI
  },
  {
    key: "hanQuocMovies",
    url: `${BASE_URL}/danh-sach/${constants.MOVIE_SLUG.PHIM_MOI}
    ?page=1&limit=${LIMIT}&sort_field=${constants.SORT_FIELD.MODIFIED_TIME}
    &sort_type=${constants.SORT_TYPE.DESC}&year=${YEAR}&country=${constants.COUNTRY.HAN_QUOC}`,
    title: "Phim Hàn Quốc",
    country: COUNTRY.HAN_QUOC,
    movieSlug: movieSlug.PHIM_MOI
  },
  {
    key: "trungQuocMovies",
    url: `${BASE_URL}/danh-sach/${constants.MOVIE_SLUG.PHIM_BO}?
    page=1&limit=${LIMIT}&sort_field=${constants.SORT_FIELD.MODIFIED_TIME}&
    sort_type=${constants.SORT_TYPE.DESC}&year=${YEAR}&country=${constants.COUNTRY.TRUNG_QUOC}`,
    title: "Phim Trung Quốc",
    country: COUNTRY.TRUNG_QUOC,
    movieSlug: movieSlug.PHIM_MOI
  },
  {
    key: "auMyMovies",
    url: `${BASE_URL}/danh-sach/${constants.MOVIE_SLUG.PHIM_BO}?
    page=1&limit=${LIMIT}&sort_field=${constants.SORT_FIELD.MODIFIED_TIME}&
    sort_type=${constants.SORT_TYPE.DESC}&year=${YEAR}&country=${constants.COUNTRY.AU_MY}`,
    title: "Phim Âu Mỹ",
    country: COUNTRY.AU_MY,
    movieSlug: movieSlug.PHIM_MOI
  },
  {
    key: "phimBo",
    url: `${BASE_URL}/danh-sach/${constants.MOVIE_SLUG.PHIM_BO}?
    page=1&limit=${LIMIT}&sort_field=${constants.SORT_FIELD.MODIFIED_TIME}&
    sort_type=${constants.SORT_TYPE.DESC}&year=${YEAR}`,
    title: "Phim Bộ",
    country: "",
    movieSlug: movieSlug.PHIM_BO
  },
  {
    key: "phimLe",
    url: `${BASE_URL}/danh-sach/${constants.MOVIE_SLUG.PHIM_LE}?
    page=1&limit=${LIMIT}&sort_field=${constants.SORT_FIELD.MODIFIED_TIME}&
    sort_type=${constants.SORT_TYPE.DESC}&year=${YEAR}`,
    title: "Phim Lẻ",
    country: "",
    movieSlug: movieSlug.PHIM_LE
  },
  {
    key: "phimchieurap",
    url: `${BASE_URL}/danh-sach/${constants.MOVIE_SLUG.PHIM_CHIEU_RAP}?
    page=1&limit=${LIMIT}&sort_field=${constants.SORT_FIELD.MODIFIED_TIME}&
    sort_type=${constants.SORT_TYPE.DESC}&year=${YEAR}`,
    title: "Phim Chiếu Rạp",
    country: "",
    movieSlug: movieSlug.PHIM_CHIEU_RAP
  }
];
