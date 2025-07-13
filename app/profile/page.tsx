"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, Bookmark, Edit, Save, X } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { MovieCard } from "@/components/movie-card"
import { mockMovies } from "@/lib/mock-data"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState("")
  const [editedEmail, setEditedEmail] = useState("")
  const [watchlist, setWatchlist] = useState<number[]>([])
  const [favorites, setFavorites] = useState<number[]>([])
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    setEditedName(parsedUser.name)
    setEditedEmail(parsedUser.email)

    // Load watchlist and favorites
    const savedWatchlist = JSON.parse(localStorage.getItem("watchlist") || "[]")
    const savedFavorites = JSON.parse(localStorage.getItem("favorites") || "[]")
    setWatchlist(savedWatchlist)
    setFavorites(savedFavorites)
  }, [router])

  const handleSaveProfile = () => {
    const updatedUser = {
      ...user,
      name: editedName,
      email: editedEmail,
    }
    setUser(updatedUser)
    localStorage.setItem("user", JSON.stringify(updatedUser))
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditedName(user.name)
    setEditedEmail(user.email)
    setIsEditing(false)
  }

  const removeFromWatchlist = (movieId: number) => {
    const newWatchlist = watchlist.filter((id) => id !== movieId)
    setWatchlist(newWatchlist)
    localStorage.setItem("watchlist", JSON.stringify(newWatchlist))
  }

  const removeFromFavorites = (movieId: number) => {
    const newFavorites = favorites.filter((id) => id !== movieId)
    setFavorites(newFavorites)
    localStorage.setItem("favorites", JSON.stringify(newFavorites))
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    )
  }

  const watchlistMovies = mockMovies.filter((movie) => watchlist.includes(movie.id))
  const favoriteMovies = mockMovies.filter((movie) => favorites.includes(movie.id))

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user.avatar || "/placeholder.svg"} />
                <AvatarFallback className="text-2xl">
                  {user.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" value={editedName} onChange={(e) => setEditedName(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={editedEmail}
                        onChange={(e) => setEditedEmail(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveProfile} size="sm">
                        <Save className="mr-2 h-4 w-4" />
                        Save
                      </Button>
                      <Button onClick={handleCancelEdit} variant="outline" size="sm">
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-4 mb-2">
                      <h1 className="text-2xl font-bold">{user.name}</h1>
                      <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </div>
                    <p className="text-muted-foreground mb-4">{user.email}</p>
                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Bookmark className="h-4 w-4" />
                        <span>{watchlist.length} in watchlist</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        <span>{favorites.length} favorites</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Profile Content */}
        <Tabs defaultValue="watchlist" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="watchlist" className="flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              My Watchlist
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Favorites
            </TabsTrigger>
          </TabsList>

          <TabsContent value="watchlist" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>My Watchlist</CardTitle>
                <CardDescription>Movies and shows you want to watch later</CardDescription>
              </CardHeader>
              <CardContent>
                {watchlistMovies.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {watchlistMovies.map((movie) => (
                      <div key={movie.id} className="relative group">
                        <MovieCard movie={movie} />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeFromWatchlist(movie.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Your watchlist is empty</h3>
                    <p className="text-muted-foreground">Start adding movies and shows you want to watch later</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="favorites" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Favorites</CardTitle>
                <CardDescription>Movies and shows you loved</CardDescription>
              </CardHeader>
              <CardContent>
                {favoriteMovies.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {favoriteMovies.map((movie) => (
                      <div key={movie.id} className="relative group">
                        <MovieCard movie={movie} />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeFromFavorites(movie.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
                    <p className="text-muted-foreground">Start marking movies and shows as favorites</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
