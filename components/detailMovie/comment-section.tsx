"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Trash2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

interface Comment {
  id: string;
  userId: string;
  user: string;
  avatar: string | null;
  content: string;
  timestamp: string;
}

export default function CommentSection({ slug }: { slug: string }) {
  const { data: session, status } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loadingFetch, setLoadingFetch] = useState(false);
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState<string | null>(null);

  useEffect(() => {
    async function fetchComments() {
      try {
        setLoadingFetch(true);
        const res = await fetch(`/api/comments?slug=${encodeURIComponent(slug)}`, {
          cache: "no-store",
        });

        if (res.status === 401) {
          toast.error("Bạn cần đăng nhập để xem bình luận.");
          setComments([]);
          return;
        }

        if (!res.ok) {
          const errorData = await res.json();
          console.error("Fetch error:", errorData.message || res.statusText);
          if (res.status === 404) {
          } else {
            throw new Error(errorData.message || `Failed to fetch comments (Status: ${res.status})`);
          }
        }

        const data = await res.json();
        setComments(data);
        if (data.length === 0) {
        }
      } catch (error) {
        console.error("Fetch comments error:", error);
      } finally {
        setLoadingFetch(false);
      }
    }
    fetchComments();
  }, [slug]);

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.error("Bình luận không được để trống.");
      return;
    }
    if (status !== "authenticated") {
      toast.error("Bạn cần đăng nhập để bình luận.");
      return;
    }

    try {
      setLoadingAdd(true);
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment.trim(), slug }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Post error:", errorData.message || res.statusText);
        throw new Error(errorData.message || "Failed to add comment");
      }

      const comment = await res.json();
      setComments([comment, ...comments]);
      setNewComment("");
      toast.success("Đã thêm bình luận.");
    } catch (error) {
      console.error("Add comment error:", error);
      toast.error("Không thể thêm bình luận. Vui lòng thử lại.");
    } finally {
      setLoadingAdd(false);
    }
  };

  const handleDeleteComment = async (id: string) => {
    if (status !== "authenticated") {
      return;
    }

    // Hiển thị hộp thoại xác nhận
    const confirmed = await new Promise<boolean>((resolve) => {
      toast(
      () => (
        <div className="p-4">
        <div className="mb-3 text-base font-medium">
          Bạn có chắc chắn muốn xóa bình luận này?
        </div>
        <div className="flex gap-3 justify-end">
          <Button
          size="sm"
          // variant="outline"
          className="border-destructive text-black hover:bg-black/10"
          onClick={() => {
            toast.dismiss();
            resolve(false);
          }}
          >
          Hủy
          </Button>
          <Button
          size="sm"
          variant="destructive"
          className="shadow-md"
          onClick={() => {
            toast.dismiss();
            resolve(true);
          }}
          >
          Xóa
          </Button>
        </div>
        </div>
      ),
      { duration: 999999 }
      );
    });
    if (!confirmed) {
      return;
    }

    try {
      setLoadingDelete(id);
      const res = await fetch("/api/comments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Delete error:", errorData.message || res.statusText);
        throw new Error(errorData.message || "Failed to delete comment");
      }

      setComments(comments.filter((c) => c.id !== id));
      toast.success("Đã xóa bình luận.");
    } catch (error) {
      console.error("Delete comment error:", error);
      toast.error("Không thể xóa bình luận. Vui lòng thử lại.");
    } finally {
      setLoadingDelete(null);
    }
  };

  return (
    <div className="mt-12 space-y-6 py-6 bg-[#020817] p-6 rounded-lg">
      <h3 className="text-xl font-semibold">Bình luận</h3>

      <div className="flex gap-4">
        <Avatar>
          <AvatarImage src={session?.user?.image || "/placeholder.svg"} />
          <AvatarFallback>{session?.user?.name?.[0] || "U"}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Textarea
            placeholder="Viết bình luận..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={status !== "authenticated" || loadingAdd}
          />
          <Button
            onClick={handleAddComment}
            className="mt-2"
            disabled={!newComment.trim() || status !== "authenticated" || loadingAdd}
          >
            <Send className="mr-2 h-4 w-4" /> Gửi
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {loadingFetch ? (
          <p className="text-sm text-muted-foreground">Đang tải bình luận...</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có bình luận nào.</p>
        ) : (
          comments.map((c) => (
            <div
              key={c.id}
              className="flex items-start gap-4 p-4 rounded-lg bg-muted/40"
            >
              <Avatar>
                <AvatarImage src={c.avatar || "/placeholder.svg"} />
                <AvatarFallback>{c.user[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <strong>{c.user}</strong>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{c.timestamp}</span>
                    {session?.user?.id === c.userId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteComment(c.id)}
                        disabled={loadingDelete === c.id}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-gray-300">{c.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}