"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { LoadingEffect } from "@/components/effect/loading-effect";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
const getImageUrl = (url?: string) => url || "/default-avatar.png";

type Plan = {
  id: string;
  key: string;
  name: string;
  price: number;
  currency: string;
  duration: string;
  maxMembers: number;
  description?: string;
};

export default function ProfilePage() {
  const { data: session, update, status } = useSession();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState<string>(session?.user?.name ?? "");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(session?.user?.image ?? undefined);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);

  const [isPremium, setIsPremium] = useState(false);
  const [premiumInfo, setPremiumInfo] = useState<any>(null);
  const [role, setRole] = useState<"owner" | "member" | null>(null);

  const [processing, setProcessing] = useState(false);

  const isRestrictedDomain = useCallback(() => {
    if (!avatarUrl) return false;
    try {
      const url = new URL(avatarUrl);
      const restrictedDomains = ["lh3.googleusercontent.com", "scontent.fhan15-2.fna.fbcdn.net"];
      return restrictedDomains.includes(url.hostname);
    } catch {
      return false;
    }
  }, [avatarUrl]);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name ?? "");
      setAvatarUrl(session.user.image ?? undefined);
    }
  }, [session?.user?.name, session?.user?.image]);

useEffect(() => {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  const p = params.get("payment");
  if (!p) return;

  if (p === "success") {
    toast.success("Thanh toán thành công! Gói đã được kích hoạt.");
  } else if (p === "failed") {
    toast.error("Thanh toán thất bại hoặc bị hủy.");
  } else if (p === "invalid") {
    toast.error("Chữ ký VNPay không hợp lệ.");
  } else {
    toast.message(`Kết quả thanh toán: ${p}`);
  }

  try {
    const pathname = window.location.pathname;
    router.replace(pathname);
  } catch {}

  fetchPremiumStatus();
}, []);

  useEffect(() => {
    (async () => {
      setLoadingPlans(true);
      try {
        const res = await fetch("/api/premium/plans");
        const data = await res.json();
        setPlans(data.plans || []);
      } catch (err) {
        console.error("Fetch plans failed", err);
      } finally {
        setLoadingPlans(false);
      }
    })();
  }, []);

  const fetchPremiumStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/premium/status");
      if (!res.ok) {
        setIsPremium(false);
        setPremiumInfo(null);
        setRole(null);
        return;
      }
      const data = await res.json();
      setIsPremium(Boolean(data.isPremium));
      setPremiumInfo(data.subscription ?? null);
      setRole(data.role ?? null);
    } catch (err) {
      console.error("Check premium failed", err);
      setIsPremium(false);
      setPremiumInfo(null);
      setRole(null);
    }
  }, []);
  useEffect(() => {
    fetchPremiumStatus();
  }, [fetchPremiumStatus]);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        toast.error("Cloudinary chưa cấu hình.");
        return;
      }
      try {
        setUploading(true);
        const fd = new FormData();
        fd.append("file", file);
        fd.append("upload_preset", UPLOAD_PRESET);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok || !data.secure_url) {
          console.error("Cloudinary error", data);
          toast.error("Upload ảnh thất bại");
          return;
        }
        setAvatarUrl(data.secure_url);
        toast.success("Upload ảnh thành công");
      } catch (err) {
        console.error(err);
        toast.error("Lỗi upload");
      } finally {
        setUploading(false);
        if (fileRef.current) fileRef.current.value = "";
      }
    },
    [isRestrictedDomain]
  );

  const handleSave = useCallback(async () => {
    if (!session?.user?.email) {
      toast.error("Bạn cần đăng nhập.");
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), avatar: avatarUrl }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data?.message || "Cập nhật thất bại");
        return;
      }
      const data = await res.json();
      await update?.({ name: data.user.name, image: data.user.image });
      toast.success("Cập nhật thành công");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Lỗi server");
    } finally {
      setSaving(false);
    }
  }, [name, avatarUrl, session, update, router]);

  const handleChooseFile = useCallback(() => {
    if (isRestrictedDomain()) {
      toast.error("Không thể thay đổi ảnh đồng bộ.");
      return;
    }
    fileRef.current?.click();
  }, [isRestrictedDomain]);

  const handleDeleteAvatar = useCallback(() => {
    if (isRestrictedDomain()) {
      toast.error("Không thể xóa ảnh đồng bộ.");
      return;
    }
    setAvatarUrl(undefined);
  }, [isRestrictedDomain]);

  const handlePurchase = useCallback(
    async (planKey: string) => {
      if (!session?.user?.email) {
        toast.error("Vui lòng đăng nhập để mua gói.");
        return;
      }
      try {
        setProcessing(true);
        const res = await fetch("/api/premium/create-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planKey }),
        });
        const data = await res.json();
        if (!res.ok || !data.paymentUrl) {
          toast.error(data?.message || "Không thể tạo thanh toán");
          setProcessing(false);
          return;
        }
        window.location.href = data.paymentUrl;
      } catch (err) {
        console.error(err);
        toast.error("Lỗi khi khởi tạo thanh toán");
      } finally {
        setProcessing(false);
      }
    },
    [session]
  );

  const currentPlan: Plan | undefined = (() => {
    if (!premiumInfo) return undefined;
    if (premiumInfo.plan) {
      return premiumInfo.plan as Plan;
    }
    const planKey = (premiumInfo.planKey || premiumInfo.planKey || premiumInfo.plan?.key) as string | undefined;
    if (planKey) return plans.find((p) => p.key === planKey);
    return undefined;
  })();

  const ownerEmail: string | undefined = (() => {
    if (!premiumInfo) return undefined;
    if (premiumInfo.owner && premiumInfo.owner.email) return premiumInfo.owner.email;
    if (premiumInfo.subscription?.owner && premiumInfo.subscription.owner.email) return premiumInfo.subscription.owner.email;
    if (premiumInfo.ownerEmail) return premiumInfo.ownerEmail;
    return undefined;
  })();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    }
  }, [status, router]);

  return (
    <div className="min-h-screen bg-gray-900 text-white py-4 mt-16">
      <div className="max-w-5xl mx-auto px-4">
        {/* Profile Card */}
        <Card className="p-6 bg-card">
          <h1 className="text-2xl font-bold mb-6">
            Tài khoản của tôi -{" "}
            <span className={isPremium ? "text-green-400 font-semibold" : "text-yellow-300 font-semibold"}>
              {isPremium ? "Premium" : "Free"}
            </span>
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 relative rounded-full overflow-hidden bg-neutral-700">
                {avatarUrl ? (
                  <Image src={getImageUrl(avatarUrl)} alt="avatar" fill sizes="128px" className="object-cover" priority />
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
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    <Button variant="outline" onClick={handleChooseFile} disabled={uploading || saving || status === "loading"}>
                      {uploading ? "Đang tải..." : "Đổi ảnh"}
                    </Button>
                    <Button variant="ghost" onClick={handleDeleteAvatar} disabled={uploading || saving || status === "loading"}>
                      Xóa
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="mb-4">
                <Label htmlFor="name">Họ và tên</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên hiển thị" />
              </div>
              <div className="flex gap-3">
                <Button onClick={handleSave} disabled={saving || status === "loading"}>{saving ? "Đang lưu..." : "Lưu thay đổi"}</Button>
                <Button variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>Đăng xuất</Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Premium Card */}
        <Card className="mt-4 p-6 bg-card">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Nâng cấp tài khoản</h2>
            <div className="text-sm">
              Trạng thái:{" "}
              <span className={isPremium ? "text-green-400 font-semibold" : "text-yellow-300 font-semibold"}>
                {isPremium ? "Premium" : "Free"}
              </span>
            </div>
          </div>

          {!isPremium ? (
            <>
              <ul className="list-disc ml-6 text-sm text-gray-300 mt-4">
                <li>Xem phim chất lượng cao không quảng cáo</li>
                <li>Ưu tiên truy cập server nhanh hơn</li>
                <li>Hỗ trợ tải phim về thiết bị</li>
                <li>Chia sẻ gói Family cho tối đa 3 tài khoản (nếu mua gói Family)</li>
              </ul>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {loadingPlans ? (
                  <LoadingEffect message="Đang tải gói" />
                ) : plans.length === 0 ? (
                  <div>Chưa có gói nào.</div>
                ) : (
                  plans.map((p) => (
                    <div key={p.id} className="border bg-gradient-to-r from-indigo-500 to-purple-500 rounded p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-lg font-semibold">{p.name}</div>
                          <div className="text-sm text-gray-300">{p.description}</div>
                          <div className="mt-2 text-xl font-bold">{p.price.toLocaleString()} {p.currency} / {p.duration}</div>
                          <div className="text-sm text-gray-400">Tối đa: {p.maxMembers} người</div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button onClick={() => handlePurchase(p.key)} disabled={processing}>{processing ? "Chuyển..." : "Mua ngay"}</Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className=" p-4  rounded">
              <p className="text-lg font-semibold">Bạn đang sử dụng gói: {currentPlan?.name ?? premiumInfo?.plan?.name ?? premiumInfo?.planKey}</p>
              <p className="text-sm text-gray-300">Hết hạn: {premiumInfo?.endDate ? new Date(premiumInfo.endDate).toLocaleString() : "—"}</p>
              {role === "member" && ownerEmail && (
                <p className="text-sm mt-2 text-gray-300">Bạn đang dùng gói do <strong>{ownerEmail}</strong> chia sẻ</p>
              )}
            </div>
          )}
        </Card>

        {isPremium && role === "owner" && (currentPlan?.maxMembers ?? premiumInfo?.plan?.maxMembers ?? 1) > 1 && (
          <Card className="mt-4 p-6 bg-card">
            <h2 className="text-xl font-bold mb-4">Chia sẻ gói Premium</h2>
            <div>
              <p className="text-sm">Bạn đang có gói: <strong>{currentPlan?.name ?? premiumInfo?.plan?.name ?? premiumInfo?.planKey}</strong></p>
              <p className="text-sm">Hết hạn: <strong>{premiumInfo?.endDate ? new Date(premiumInfo.endDate).toLocaleString() : "—"}</strong></p>
              <div className="mt-3">
                <p className="text-sm font-semibold">Thành viên:</p>
                {premiumInfo?.members && premiumInfo.members.length > 0 ? (
                  <ul className="ml-4 text-sm">
                    {premiumInfo.members.map((m: any) => (
                      <li key={m.id}>{m.userId}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-300">Chưa có thành viên được thêm.</p>
                )}
              </div>
              <div className="mt-4">
                <p className="text-sm">Bạn có thể chia sẻ gói này cho tối đa <strong>{currentPlan?.maxMembers ?? premiumInfo?.plan?.maxMembers}</strong> tài khoản (tính cả tài khoản của bạn).</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
