import * as constants from "@/lib/constants";

const BASE_URL = process.env.NEXT_PUBLIC_OPHIM_API;
const movieSlug = constants.MOVIE_SLUG;
const YEAR = 2025;
const LIMIT = 10;
const COUNTRY = constants.COUNTRY;


export const movieEndpoints = [
  {
    key: "latestMovies",
    url: `${BASE_URL}/danh-sach/${constants.MOVIE_SLUG.PHIM_CHIEU_RAP}?
    page=1&limit=${LIMIT}&sort_field=${constants.SORT_FIELD.MODIFIED_TIME}&
    sort_type=${constants.SORT_TYPE.DESC}&year=${YEAR}`,
    title: "Phim Chiếu Rạp",
    country: "",
    movieSlug: movieSlug.PHIM_CHIEU_RAP,
    seeAllLink: "/movies?movieSlug=phim-chieu-rap"
  },
  {
    key: "hanQuocMovies",
    url: `${BASE_URL}/danh-sach/${constants.MOVIE_SLUG.PHIM_MOI}
    ?page=1&limit=${LIMIT}&sort_field=${constants.SORT_FIELD.MODIFIED_TIME}
    &sort_type=${constants.SORT_TYPE.DESC}&year=${YEAR}&country=${constants.COUNTRY.HAN_QUOC}`,
    title: "Phim Hàn Quốc",
    country: COUNTRY.HAN_QUOC,
    movieSlug: movieSlug.PHIM_MOI,
    seeAllLink: "/movies?movieSlug=phim-han-quoc"
  },
  {
    key: "trungQuocMovies",
    url: `${BASE_URL}/danh-sach/${constants.MOVIE_SLUG.PHIM_BO}?
    page=1&limit=${LIMIT}&sort_field=${constants.SORT_FIELD.MODIFIED_TIME}&
    sort_type=${constants.SORT_TYPE.DESC}&year=${YEAR}&country=${constants.COUNTRY.TRUNG_QUOC}`,
    title: "Phim Trung Quốc",
    country: COUNTRY.TRUNG_QUOC,
    movieSlug: movieSlug.PHIM_MOI,
    seeAllLink: "/movies?movieSlug=phim-trung-quoc"
  },
  {
    key: "auMyMovies",
    url: `${BASE_URL}/danh-sach/${constants.MOVIE_SLUG.PHIM_BO}?
    page=1&limit=${LIMIT}&sort_field=${constants.SORT_FIELD.MODIFIED_TIME}&
    sort_type=${constants.SORT_TYPE.DESC}&year=${YEAR}&country=${constants.COUNTRY.AU_MY}`,
    title: "Phim Âu Mỹ",
    country: COUNTRY.AU_MY,
    movieSlug: movieSlug.PHIM_MOI,
    seeAllLink: "/movies?movieSlug=phim-au-my"
  },
  {
    key: "phimBo",
    url: `${BASE_URL}/danh-sach/${constants.MOVIE_SLUG.PHIM_BO}?
    page=1&limit=${LIMIT}&sort_field=${constants.SORT_FIELD.MODIFIED_TIME}&
    sort_type=${constants.SORT_TYPE.DESC}&year=${YEAR}`,
    title: "Phim Bộ",
    country: "",
    movieSlug: movieSlug.PHIM_BO,
    seeAllLink: "/movies?movieSlug=phim-bo"
  },
  {
    key: "phimLe",
    url: `${BASE_URL}/danh-sach/${constants.MOVIE_SLUG.PHIM_LE}?
    page=1&limit=${LIMIT}&sort_field=${constants.SORT_FIELD.MODIFIED_TIME}&
    sort_type=${constants.SORT_TYPE.DESC}&year=${YEAR}`,
    title: "Phim Lẻ",
    country: "",
    movieSlug: movieSlug.PHIM_LE,
    seeAllLink: "/movies?movieSlug=phim-le"
  },
  {
    key: "phimchieurap",
    url: `${BASE_URL}/danh-sach/${constants.MOVIE_SLUG.PHIM_CHIEU_RAP}?
    page=1&limit=${LIMIT}&sort_field=${constants.SORT_FIELD.MODIFIED_TIME}&
    sort_type=${constants.SORT_TYPE.DESC}&year=${YEAR}`,
    title: "Phim Chiếu Rạp",
    country: "",
    movieSlug: movieSlug.PHIM_CHIEU_RAP,
    seeAllLink: "/movies?movieSlug=phim-chieu-rap"
  },
  {
    key: "nhatBanMovies",
    url: `${BASE_URL}/danh-sach/${constants.MOVIE_SLUG.PHIM_MOI}?
    page=1&limit=${LIMIT}&sort_field=${constants.SORT_FIELD.MODIFIED_TIME}&
    sort_type=${constants.SORT_TYPE.DESC}&year=${YEAR}&country=${COUNTRY.NHAT_BAN}`,
    title: "Phim Nhật Bản",
    country: COUNTRY.NHAT_BAN,
    movieSlug: movieSlug.PHIM_MOI,
    seeAllLink: "/movies?movieSlug=phim-nhat-ban"
  },
  {
    key: "thaiLanMovies",
    url: `${BASE_URL}/danh-sach/${constants.MOVIE_SLUG.PHIM_MOI}?
    page=1&limit=${LIMIT}&sort_field=${constants.SORT_FIELD.MODIFIED_TIME}&
    sort_type=${constants.SORT_TYPE.DESC}&year=${YEAR}&country=${COUNTRY.THAI_LAN}`,
    title: "Phim Thái Lan",
    country: COUNTRY.THAI_LAN,
    movieSlug: movieSlug.PHIM_MOI,
    seeAllLink: "/movies?movieSlug=phim-thai-lan"
  },
  {
    key: "sapChieuMovies",
    url: `${BASE_URL}/danh-sach/${constants.MOVIE_SLUG.PHIM_SAP_CHIEU}?
    page=1&limit=${LIMIT}&sort_field=${constants.SORT_FIELD.MODIFIED_TIME}&
    sort_type=${constants.SORT_TYPE.DESC}&year=${YEAR}`,
    title: "Phim Sắp Chiếu",
    country: "",
    movieSlug: movieSlug.PHIM_SAP_CHIEU,
    seeAllLink: "/movies?movieSlug=phim-sap-chieu"
  }
];
