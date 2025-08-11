import * as constants from "@/lib/constants";

const BASE_URL = process.env.NEXT_PUBLIC_OPHIM_API;
const YEAR = process.env.NEXT_PUBLIC_DEFAULT_YEAR;
const LIMIT = process.env.NEXT_PUBLIC_DEFAULT_LIMIT;

export const movieEndpoints = [
  {
    key: "latestMovies",
    url: `${BASE_URL}/danh-sach/${constants.MOVIE_SLUG.PHIM_MOI}
    ?page=1&year=${YEAR}&country=han-quoc`,
  },
  {
    key: "hanQuocMovies",
    url: `${BASE_URL}/danh-sach/${constants.MOVIE_SLUG.PHIM_MOI}
    ?page=1&limit=${LIMIT}&sort_field=${constants.SORT_FIELD.MODIFIED_TIME}
    &sort_type=${constants.SORT_TYPE.DESC}&year=${YEAR}&country=${constants.COUNTRY.HAN_QUOC}`,
  },
  {
    key: "trungQuocMovies",
    url: `${BASE_URL}/danh-sach/${constants.MOVIE_SLUG.PHIM_BO}?
    page=1&limit=${LIMIT}&sort_field=${constants.SORT_FIELD.MODIFIED_TIME}&
    sort_type=${constants.SORT_TYPE.DESC}&year=${YEAR}&country=${constants.COUNTRY.TRUNG_QUOC}`,
  },
  {
    key: "auMyMovies",
    url: `${BASE_URL}/danh-sach/${constants.MOVIE_SLUG.PHIM_BO}?
    page=1&limit=${LIMIT}&sort_field=${constants.SORT_FIELD.MODIFIED_TIME}&
    sort_type=${constants.SORT_TYPE.DESC}&year=${YEAR}&country=${constants.COUNTRY.AU_MY}`,
  },
];
