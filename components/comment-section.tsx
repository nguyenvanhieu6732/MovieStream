"use client"

import { useEffect, useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Send, Trash2 } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

interface Comment {
  id: number
  user: string
  avatar: string
  comment: string
  timestamp: string
}

export default function CommentSection({ slug }: { slug: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")

  useEffect(() => {
    const saved = localStorage.getItem(`comments-${slug}`)
    if (saved) setComments(JSON.parse(saved))
  }, [slug])

  const handleAddComment = () => {
    if (!newComment.trim()) return
    const comment: Comment = {
      id: Date.now(),
      user: "User",
      avatar: "/placeholder.svg",
      comment: newComment,
      timestamp: new Date().toLocaleString(),
    }
    const updated = [comment, ...comments]
    setComments(updated)
    localStorage.setItem(`comments-${slug}`, JSON.stringify(updated))
    setNewComment("")
  }

  const handleDeleteComment = (id: number) => {
    const updated = comments.filter(c => c.id !== id)
    setComments(updated)
    localStorage.setItem(`comments-${slug}`, JSON.stringify(updated))
  }

  return (
    <div className="mt-12 space-y-6">
      <h3 className="text-xl font-semibold">Bình luận</h3>

      {/* Thêm bình luận */}
      <div className="flex gap-4">
        <Avatar>
          <AvatarImage src="/placeholder.svg" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Textarea
            placeholder="Viết bình luận..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <Button
            onClick={handleAddComment}
            className="mt-2"
            disabled={!newComment.trim()}
          >
            <Send className="mr-2 h-4 w-4" /> Gửi
          </Button>
        </div>
      </div>

      {/* Danh sách bình luận */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có bình luận nào.</p>
        ) : (
          comments.map(c => (
            <div
              key={c.id}
              className="flex items-start gap-4 p-4 rounded-lg bg-muted/40"
            >
              <Avatar>
                <AvatarImage src={c.avatar} />
                <AvatarFallback>{c.user[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <strong>{c.user}</strong>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{c.timestamp}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteComment(c.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-gray-300">{c.comment}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
