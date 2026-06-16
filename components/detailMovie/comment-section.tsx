"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Send, Trash2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

interface Comment {
  id: string;
  parentId?: string | null;
  userId: string;
  user: string;
  avatar: string | null;
  content: string;
  timestamp: string;
  likeCount: number;
  likedByMe: boolean;
  replies: Comment[];
}

function updateCommentTree(
  comments: Comment[],
  id: string,
  updater: (comment: Comment) => Comment
): Comment[] {
  return comments.map((comment) => {
    if (comment.id === id) return updater(comment);
    return {
      ...comment,
      replies: updateCommentTree(comment.replies || [], id, updater),
    };
  });
}

function removeCommentFromTree(comments: Comment[], id: string): Comment[] {
  return comments
    .filter((comment) => comment.id !== id)
    .map((comment) => ({
      ...comment,
      replies: removeCommentFromTree(comment.replies || [], id),
    }));
}

export default function CommentSection({ slug }: { slug: string }) {
  const { data: session, status } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [loadingFetch, setLoadingFetch] = useState(false);
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [loadingReply, setLoadingReply] = useState<string | null>(null);
  const [loadingLike, setLoadingLike] = useState<string | null>(null);
  const [loadingDelete, setLoadingDelete] = useState<string | null>(null);

  useEffect(() => {
    async function fetchComments() {
      try {
        setLoadingFetch(true);
        const res = await fetch(`/api/comments?slug=${encodeURIComponent(slug)}`, {
          cache: "no-store",
        });

        if (res.status === 404) {
          setComments([]);
          return;
        }

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || `Failed to fetch comments (Status: ${res.status})`);
        }

        setComments(await res.json());
      } catch (error) {
        console.error("Fetch comments error:", error);
      } finally {
        setLoadingFetch(false);
      }
    }
    fetchComments();
  }, [slug]);

  const addComment = async (content: string, parentId?: string) => {
    if (!content.trim()) {
      toast.error("Bình luận không được để trống.");
      return;
    }
    if (status !== "authenticated") {
      toast.error("Bạn cần đăng nhập để bình luận.");
      return;
    }

    try {
      if (parentId) setLoadingReply(parentId);
      else setLoadingAdd(true);

      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim(), slug, parentId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to add comment");
      }

      const comment = await res.json();
      if (parentId) {
        setComments((current) =>
          updateCommentTree(current, parentId, (parent) => ({
            ...parent,
            replies: [...(parent.replies || []), comment],
          }))
        );
        setReplyTo(null);
        setReplyContent("");
        toast.success("Đã trả lời bình luận.");
      } else {
        setComments((current) => [comment, ...current]);
        setNewComment("");
        toast.success("Đã thêm bình luận.");
      }
    } catch (error) {
      console.error("Add comment error:", error);
      toast.error("Không thể gửi bình luận. Vui lòng thử lại.");
    } finally {
      setLoadingAdd(false);
      setLoadingReply(null);
    }
  };

  const handleToggleLike = async (id: string) => {
    if (status !== "authenticated") {
      toast.error("Bạn cần đăng nhập để thả tim.");
      return;
    }

    try {
      setLoadingLike(id);
      const res = await fetch("/api/comments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to like comment");
      }

      const data = await res.json();
      setComments((current) =>
        updateCommentTree(current, id, (comment) => ({
          ...comment,
          likedByMe: data.likedByMe,
          likeCount: data.likeCount,
        }))
      );
    } catch (error) {
      console.error("Like comment error:", error);
      toast.error("Không thể cập nhật tim. Vui lòng thử lại.");
    } finally {
      setLoadingLike(null);
    }
  };

  const handleDeleteComment = async (id: string) => {
    if (status !== "authenticated") return;

    const confirmed = await new Promise<boolean>((resolve) => {
      toast(
        () => (
          <div className="p-4">
            <div className="mb-3 text-base font-medium">
              Bạn có chắc chắn muốn xóa bình luận này?
            </div>
            <div className="flex justify-end gap-3">
              <Button
                size="sm"
                className="border-destructive text-white hover:bg-white/10"
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
    if (!confirmed) return;

    try {
      setLoadingDelete(id);
      const res = await fetch("/api/comments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete comment");
      }

      setComments((current) => removeCommentFromTree(current, id));
      toast.success("Đã xóa bình luận.");
    } catch (error) {
      console.error("Delete comment error:", error);
      toast.error("Không thể xóa bình luận. Vui lòng thử lại.");
    } finally {
      setLoadingDelete(null);
    }
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div
      key={comment.id}
      className={`${isReply ? "ml-12 mt-3" : ""} glass-panel rounded-[1.5rem] p-4`}
    >
      <div className="flex items-start gap-4">
        <Avatar className="border border-white/12 bg-white/10">
          <AvatarImage src={comment.avatar || "/placeholder.svg"} />
          <AvatarFallback>{comment.user?.[0] || "U"}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-start justify-between gap-3">
            <div>
              <strong className="block text-sm text-white">{comment.user}</strong>
              <span className="text-xs text-white/42">{comment.timestamp}</span>
            </div>
            {session?.user?.id === comment.userId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteComment(comment.id)}
                disabled={loadingDelete === comment.id}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          <p className="whitespace-pre-wrap text-sm leading-6 text-white/72">{comment.content}</p>

          <div className="mt-3 flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleToggleLike(comment.id)}
              disabled={loadingLike === comment.id}
              className={comment.likedByMe ? "text-primary hover:text-primary" : "text-white/62"}
            >
              <Heart className={`h-4 w-4 ${comment.likedByMe ? "fill-current" : ""}`} />
              {comment.likeCount}
            </Button>

            {!isReply && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setReplyTo(replyTo === comment.id ? null : comment.id);
                  setReplyContent("");
                }}
                className="text-white/62"
              >
                <MessageCircle className="h-4 w-4" />
                Trả lời
              </Button>
            )}
          </div>

          {replyTo === comment.id && (
            <div className="mt-3 flex gap-3">
              <Textarea
                placeholder={`Trả lời ${comment.user}...`}
                value={replyContent}
                onChange={(event) => setReplyContent(event.target.value)}
                disabled={status !== "authenticated" || loadingReply === comment.id}
                className="min-h-[88px]"
              />
              <Button
                onClick={() => addComment(replyContent, comment.id)}
                disabled={!replyContent.trim() || status !== "authenticated" || loadingReply === comment.id}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {!!comment.replies?.length && (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => renderComment(reply, true))}
        </div>
      )}
    </div>
  );

  return (
    <div className="glass-card mt-12 space-y-6 rounded-[2rem] p-6 md:p-8">
      <h3 className="text-2xl font-semibold tracking-tight">Bình luận</h3>

      <div className="flex gap-4">
        <Avatar className="border border-white/12 bg-white/10">
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
            onClick={() => addComment(newComment)}
            className="mt-2"
            disabled={!newComment.trim() || status !== "authenticated" || loadingAdd}
          >
            <Send className="mr-2 h-4 w-4" /> Gửi
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {loadingFetch ? (
          <p className="text-sm text-white/54">Đang tải bình luận...</p>
        ) : comments.length === 0 ? (
          <p className="glass-panel rounded-[1.5rem] p-5 text-sm text-white/54">Chưa có bình luận nào.</p>
        ) : (
          comments.map((comment) => renderComment(comment))
        )}
      </div>
    </div>
  );
}
