"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

const getImageUrl = (url?: string) => {
  return url || "/default-avatar.png";
};

export default function ProfilePage() {
  const { data: session, update, status } = useSession();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState<string>(session?.user?.name ?? "");
  const [email] = useState<string | undefined>(session?.user?.email ?? undefined);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(session?.user?.image ?? undefined);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Kiểm tra domain của avatarUrl
  const isRestrictedDomain = useCallback(() => {
    if (!avatarUrl) return false;
    try {
      const url = new URL(avatarUrl);
      const restrictedDomains = ["lh3.googleusercontent.com", "scontent.fhan15-2.fna.fbcdn.net"];
      return restrictedDomains.includes(url.hostname);
    } catch {
      return false; // Nếu URL không hợp lệ, không vô hiệu hóa
    }
  }, [avatarUrl]);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name ?? "");
      setAvatarUrl(session.user.image ?? undefined);
    }
  }, [session?.user?.name, session?.user?.image]);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isRestrictedDomain()) {
      toast.error("Không thể thay đổi ảnh đã đồng bộ từ Google hoặc Facebook.");
      return;
    }

    const file = e.target.files?.[0];
    if (!file) {
      toast.error("Vui lòng chọn một tệp ảnh.");
      return;
    }

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      toast.error("Cấu hình Cloudinary không hợp lệ.");
      console.error("Missing Cloudinary env variables:", { CLOUD_NAME, UPLOAD_PRESET });
      return;
    }

    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", UPLOAD_PRESET);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();

      if (!res.ok || !data.secure_url) {
        console.error("Cloudinary upload error:", data);
        toast.error(data.error?.message || "Upload ảnh thất bại");
        return;
      }

      setAvatarUrl(data.secure_url);
      toast.success("Upload ảnh thành công");
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Lỗi upload ảnh. Vui lòng thử lại.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }, [isRestrictedDomain]);

  const handleSave = useCallback(async () => {
    if (!session?.user?.email) {
      toast.error("Bạn cần đăng nhập để cập nhật profile.");
      return;
    }

    if (!name.trim()) {
      toast.error("Tên không được để trống.");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({ name: name.trim(), avatar: avatarUrl }),
      });

      if (!res.ok) {
        const data = await res.json();
        console.error("API error:", data);
        toast.error(data?.message || "Cập nhật profile thất bại");
        return;
      }

      const data = await res.json();
      await update({
        name: data.user.name,
        image: data.user.image,
      });

      toast.success("Cập nhật profile thành công");
      router.refresh();
    } catch (err) {
      console.error("Save profile failed:", err);
      toast.error("Lỗi server. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  }, [name, avatarUrl, session, update, router]);

  const handleChooseFile = useCallback(() => {
    if (isRestrictedDomain()) {
      toast.error("Không thể thay đổi ảnh đã đồng bộ từ Google hoặc Facebook.");
      return;
    }
    fileRef.current?.click();
  }, [isRestrictedDomain]);

  const handleDeleteAvatar = useCallback(() => {
    if (isRestrictedDomain()) {
      toast.error("Không thể xóa ảnh đã đồng bộ từ Google hoặc Facebook.");
      return;
    }
    setAvatarUrl(undefined);
  }, [isRestrictedDomain]);

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 mt-16">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">Tài khoản của tôi</h1>

        <Card className="p-6 bg-card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 relative rounded-full overflow-hidden bg-neutral-700">
                {avatarUrl ? (
                  <Image
                    src={getImageUrl(avatarUrl)}
                    alt="avatar"
                    fill
                    sizes="128px"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-2xl font-bold text-white/80">
                    {name?.charAt(0) ?? "U"}
                  </div>
                )}
              </div>
              <div className="mt-4 flex flex-col items-center gap-2">
                {isRestrictedDomain() ? (
                  <p className="text-sm text-gray-400">Ảnh đã được đồng bộ</p>
                ) : (
                  <div className="flex gap-2">
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <Button
                      variant="outline"
                      onClick={handleChooseFile}
                      disabled={uploading || saving || status === "loading" || isRestrictedDomain()}
                    >
                      {uploading ? "Đang tải..." : "Đổi ảnh"}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={handleDeleteAvatar}
                      disabled={uploading || saving || status === "loading" || isRestrictedDomain()}
                    >
                      Xóa
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="mb-4">
                <Label htmlFor="name">Họ và tên</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tên hiển thị"
                />
              </div>
              <div className="flex gap-3">
                <Button onClick={handleSave} disabled={saving || status === "loading"}>
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
                <Button variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>
                  Đăng xuất
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}