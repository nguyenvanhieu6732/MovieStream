import * as constants from "@/lib/constants";
import { listUrl } from "@/lib/movieApi";

const movieSlug = constants.MOVIE_SLUG;
const COUNTRY = constants.COUNTRY;

export const movieEndpoints = [
  {
    key: "latestMovies",
    url: listUrl(constants.MOVIE_SLUG.PHIM_CHIEU_RAP),
    title: "Phim Chiếu Rạp",
    country: "",
    movieSlug: movieSlug.PHIM_CHIEU_RAP,
    seeAllLink: "/movies?movieSlug=phim-chieu-rap",
  },
  {
    key: "hanQuocMovies",
    url: listUrl(constants.MOVIE_SLUG.PHIM_MOI, { country: COUNTRY.HAN_QUOC }),
    title: "Phim Hàn Quốc",
    country: COUNTRY.HAN_QUOC,
    movieSlug: movieSlug.PHIM_MOI,
    seeAllLink: "/movies?movieSlug=phim-han-quoc",
  },
  {
    key: "trungQuocMovies",
    url: listUrl(constants.MOVIE_SLUG.PHIM_BO, { country: COUNTRY.TRUNG_QUOC }),
    title: "Phim Trung Quốc",
    country: COUNTRY.TRUNG_QUOC,
    movieSlug: movieSlug.PHIM_MOI,
    seeAllLink: "/movies?movieSlug=phim-trung-quoc",
  },
  {
    key: "auMyMovies",
    url: listUrl(constants.MOVIE_SLUG.PHIM_BO, { country: COUNTRY.AU_MY }),
    title: "Phim Âu Mỹ",
    country: COUNTRY.AU_MY,
    movieSlug: movieSlug.PHIM_MOI,
    seeAllLink: "/movies?movieSlug=phim-au-my",
  },
  {
    key: "phimBo",
    url: listUrl(constants.MOVIE_SLUG.PHIM_BO),
    title: "Phim Bộ",
    country: "",
    movieSlug: movieSlug.PHIM_BO,
    seeAllLink: "/movies?movieSlug=phim-bo",
  },
  {
    key: "phimLe",
    url: listUrl(constants.MOVIE_SLUG.PHIM_LE),
    title: "Phim Lẻ",
    country: "",
    movieSlug: movieSlug.PHIM_LE,
    seeAllLink: "/movies?movieSlug=phim-le",
  },
  {
    key: "phimchieurap",
    url: listUrl(constants.MOVIE_SLUG.PHIM_CHIEU_RAP),
    title: "Phim Chiếu Rạp",
    country: "",
    movieSlug: movieSlug.PHIM_CHIEU_RAP,
    seeAllLink: "/movies?movieSlug=phim-chieu-rap",
  },
  {
    key: "nhatBanMovies",
    url: listUrl(constants.MOVIE_SLUG.PHIM_MOI, { country: COUNTRY.NHAT_BAN }),
    title: "Phim Nhật Bản",
    country: COUNTRY.NHAT_BAN,
    movieSlug: movieSlug.PHIM_MOI,
    seeAllLink: "/movies?movieSlug=phim-nhat-ban",
  },
  {
    key: "thaiLanMovies",
    url: listUrl(constants.MOVIE_SLUG.PHIM_MOI, { country: COUNTRY.THAI_LAN }),
    title: "Phim Thái Lan",
    country: COUNTRY.THAI_LAN,
    movieSlug: movieSlug.PHIM_MOI,
    seeAllLink: "/movies?movieSlug=phim-thai-lan",
  },
  {
    key: "sapChieuMovies",
    url: listUrl(constants.MOVIE_SLUG.PHIM_SAP_CHIEU),
    title: "Phim Sắp Chiếu",
    country: "",
    movieSlug: movieSlug.PHIM_SAP_CHIEU,
    seeAllLink: "/movies?movieSlug=phim-sap-chieu",
  },
];
