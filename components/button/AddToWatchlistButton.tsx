"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Props {
  movieId: string;
  isSavedInit?: boolean;
  onChange?: (saved: boolean) => void;
}

export default function AddToWatchlistButton({ movieId, isSavedInit = false, onChange }: Props) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [isSaved, setIsSaved] = useState<boolean>(isSavedInit);
  const [loading, setLoading] = useState(false);

  // sync when parent prop changes
  useEffect(() => {
    setIsSaved(Boolean(isSavedInit));
  }, [isSavedInit]);

  const add = async () => {
    if (status === "loading") return;
    if (!session) {
      toast.warning("Vui lòng đăng nhập để lưu phim vào danh sách!");
      return;
    }
    try {
      setLoading(true);
      // optimistic update
      setIsSaved(true);
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId }),
      });
      const data = await res.json();
      if (res.ok && data.message === "ADDED") {
        toast.success("Đã thêm vào danh sách xem sau!");
        onChange?.(true);
        // optional: refresh server data
        // router.refresh();
      } else if (res.ok && data.message === "EXISTS") {
        toast("Phim đã có trong danh sách");
        onChange?.(true);
      } else if (res.status === 401) {
        setIsSaved(false);
        toast.warning("Vui lòng đăng nhập để sử dụng chức năng này!");
      } else {
        setIsSaved(false);
        toast.error("Đã có lỗi, thử lại sau.");
      }
    } catch (err) {
      console.error(err);
      setIsSaved(false);
      toast.error("Lỗi mạng, thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const remove = async () => {
    if (status === "loading") return;
    if (!session) { toast.warning("Vui lòng đăng nhập để sử dụng chức năng này!"); return; }
    try {
      setLoading(true);
      // optimistic
      setIsSaved(false);
      const res = await fetch(`/api/watchlist?movieId=${encodeURIComponent(movieId)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.message === "REMOVED") {
        toast.success("Đã xóa khỏi danh sách xem sau!");
        onChange?.(false);
        // router.refresh(); // optional
      } else {
        setIsSaved(true); // revert
        toast.error("Xóa thất bại, thử lại.");
      }
    } catch (err) {
      console.error(err);
      setIsSaved(true);
      toast.error("Lỗi mạng, thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size="lg"
      variant={isSaved ? "default" : "outline"}
      onClick={() => (isSaved ? remove() : add())}
      disabled={loading || status === "loading"}
      aria-label={isSaved ? "Xóa khỏi danh sách theo dõi" : "Thêm vào danh sách theo dõi"}
    >
      <Heart className={`mr-2 h-5 w-5 ${isSaved ? "fill-current" : ""}`} />
      {isSaved ? "Đã lưu" : "Lưu xem sau"}
    </Button>
  );
}
