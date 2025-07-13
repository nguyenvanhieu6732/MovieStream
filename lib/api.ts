// API utility functions for client-side data fetching

export async function fetchMovies(params?: {
  genre?: string
  search?: string
  page?: number
  limit?: number
}) {
  const searchParams = new URLSearchParams()

  if (params?.genre) searchParams.set("genre", params.genre)
  if (params?.search) searchParams.set("search", params.search)
  if (params?.page) searchParams.set("page", params.page.toString())
  if (params?.limit) searchParams.set("limit", params.limit.toString())

  const response = await fetch(`/api/movies?${searchParams}`)

  if (!response.ok) {
    throw new Error("Failed to fetch movies")
  }

  return response.json()
}

export async function fetchMovie(id: string) {
  const response = await fetch(`/api/movies/${id}`)

  if (!response.ok) {
    throw new Error("Failed to fetch movie")
  }

  return response.json()
}

export async function loginUser(email: string, password: string) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Login failed")
  }

  return response.json()
}

export async function logoutUser() {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
  })

  return response.json()
}

export async function fetchWatchlist() {
  const response = await fetch("/api/user/watchlist")

  if (!response.ok) {
    throw new Error("Failed to fetch watchlist")
  }

  return response.json()
}

export async function addToWatchlist(movieId: number) {
  const response = await fetch("/api/user/watchlist", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ movieId }),
  })

  return response.json()
}

export async function removeFromWatchlist(movieId: number) {
  const response = await fetch("/api/user/watchlist", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ movieId }),
  })

  return response.json()
}
