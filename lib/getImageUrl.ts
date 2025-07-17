 export const getImageUrl = (url: string) => {
    if (!url) return "/placeholder.svg"
    if (url.startsWith("http")) return url
    return `https://img.ophim1.com/uploads/movies/${url}`
  }