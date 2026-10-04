const OPHIM_IMAGE_CDN = "https://img.ophim.live"

export const getImageUrl = (url?: string | null) => {
  // vsmov đôi khi trả poster_url là {} thay vì chuỗi
  if (!url || typeof url !== "string") return "/placeholder.svg"

  const value = url.trim()
  if (!value) return "/placeholder.svg"

  if (/^https?:\/\//i.test(value)) return value
  if (value.startsWith("//")) return `https:${value}`
  if (value.startsWith("/")) return `${OPHIM_IMAGE_CDN}${value}`

  return `${OPHIM_IMAGE_CDN}/uploads/movies/${value}`
}
