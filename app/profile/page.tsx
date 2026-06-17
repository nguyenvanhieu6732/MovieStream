"use client"

import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  BadgeCheck,
  Camera,
  Check,
  Crown,
  CreditCard,
  LogOut,
  Shield,
  Sparkles,
  Trash2,
  Upload,
  UserRound,
  UsersRound,
  WalletCards,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ImageWithLoader } from "@/components/ui/image-with-loader"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingEffect } from "@/components/effect/loading-effect"

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
const getImageUrl = (url?: string) => url || "/default-avatar.png"

type Plan = {
  id: string
  key: string
  name: string
  price: number
  currency: string
  duration: string
  maxMembers: number
  description?: string
}

const formatPrice = (price: number, currency: string) =>
  `${price.toLocaleString("vi-VN")} ${currency}`

const formatDate = (value?: string) => {
  if (!value) return "-"
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export default function ProfilePage() {
  const { data: session, update, status } = useSession()
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement | null>(null)

  const [name, setName] = useState<string>(session?.user?.name ?? "")
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(
    session?.user?.image ?? undefined
  )
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [plans, setPlans] = useState<Plan[]>([])
  const [loadingPlans, setLoadingPlans] = useState(false)

  const [isPremium, setIsPremium] = useState(false)
  const [premiumInfo, setPremiumInfo] = useState<any>(null)
  const [role, setRole] = useState<"owner" | "member" | null>(null)

  const [processing, setProcessing] = useState(false)

  const isRestrictedDomain = useCallback(() => {
    if (!avatarUrl) return false
    try {
      const url = new URL(avatarUrl)
      const restrictedDomains = [
        "lh3.googleusercontent.com",
        "scontent.fhan15-2.fna.fbcdn.net",
      ]
      return restrictedDomains.includes(url.hostname)
    } catch {
      return false
    }
  }, [avatarUrl])

  const fetchPremiumStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/premium/status")
      if (!res.ok) {
        setIsPremium(false)
        setPremiumInfo(null)
        setRole(null)
        return
      }
      const data = await res.json()
      setIsPremium(Boolean(data.isPremium))
      setPremiumInfo(data.subscription ?? null)
      setRole(data.role ?? null)
    } catch (err) {
      console.error("Check premium failed", err)
      setIsPremium(false)
      setPremiumInfo(null)
      setRole(null)
    }
  }, [])

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name ?? "")
      setAvatarUrl((prev) => prev ?? session.user.image ?? undefined)
    }
  }, [session?.user?.name, session?.user?.image])

  useEffect(() => {
    if (typeof window === "undefined") return

    const params = new URLSearchParams(window.location.search)
    const payment = params.get("payment")
    if (!payment) return

    if (payment === "success") {
      toast.success("Thanh toán thành công. Gói đã được kích hoạt.")
    } else if (payment === "failed") {
      toast.error("Thanh toán thất bại hoặc bị hủy.")
    } else if (payment === "invalid") {
      toast.error("Chữ ký VNPay không hợp lệ.")
    } else {
      toast.message(`Kết quả thanh toán: ${payment}`)
    }

    try {
      router.replace(window.location.pathname)
    } catch {}

    fetchPremiumStatus()
  }, [fetchPremiumStatus, router])

  useEffect(() => {
    ;(async () => {
      setLoadingPlans(true)
      try {
        const res = await fetch("/api/premium/plans")
        const data = await res.json()
        setPlans(data.plans || [])
      } catch (err) {
        console.error("Fetch plans failed", err)
      } finally {
        setLoadingPlans(false)
      }
    })()
  }, [])

  useEffect(() => {
    fetchPremiumStatus()
  }, [fetchPremiumStatus])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin")
    }
  }, [status, router])

  const handleFileChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      if (isRestrictedDomain()) {
        toast.error("Không thể thay đổi ảnh đã đồng bộ từ Google hoặc Facebook.")
        return
      }
      const file = e.target.files?.[0]
      if (!file) {
        toast.error("Vui lòng chọn một tệp ảnh.")
        return
      }
      if (!CLOUD_NAME || !UPLOAD_PRESET) {
        toast.error("Cloudinary chưa cấu hình.")
        return
      }
      try {
        setUploading(true)
        const fd = new FormData()
        fd.append("file", file)
        fd.append("upload_preset", UPLOAD_PRESET)
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
          { method: "POST", body: fd }
        )
        const data = await res.json()
        if (!res.ok || !data.secure_url) {
          console.error("Cloudinary error", data)
          toast.error("Upload ảnh thất bại")
          return
        }
        setAvatarUrl(`${data.secure_url}?t=${Date.now()}`)
        toast.success("Upload ảnh thành công")
      } catch (err) {
        console.error(err)
        toast.error("Lỗi upload")
      } finally {
        setUploading(false)
        if (fileRef.current) fileRef.current.value = ""
      }
    },
    [isRestrictedDomain]
  )

  const handleSave = useCallback(async () => {
    if (!session?.user?.email) {
      toast.error("Bạn cần đăng nhập.")
      return
    }
    if (!name.trim()) {
      toast.error("Tên không được để trống.")
      return
    }
    try {
      setSaving(true)
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), avatar: avatarUrl }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data?.message || "Cập nhật thất bại")
        return
      }
      const data = await res.json()
      await update?.({
        name: data.user.name,
        image: data.user.image ? `${data.user.image}?t=${Date.now()}` : undefined,
      })

      toast.success("Cập nhật thành công")
      router.refresh()
    } catch (err) {
      console.error(err)
      toast.error("Lỗi server")
    } finally {
      setSaving(false)
    }
  }, [name, avatarUrl, session, update, router])

  const handleChooseFile = useCallback(() => {
    if (isRestrictedDomain()) {
      toast.error("Không thể thay đổi ảnh đồng bộ.")
      return
    }
    fileRef.current?.click()
  }, [isRestrictedDomain])

  const handleDeleteAvatar = useCallback(() => {
    if (isRestrictedDomain()) {
      toast.error("Không thể xóa ảnh đồng bộ.")
      return
    }
    setAvatarUrl(undefined)
  }, [isRestrictedDomain])

  const handlePurchase = useCallback(
    async (planKey: string) => {
      if (!session?.user?.email) {
        toast.error("Vui lòng đăng nhập để mua gói.")
        return
      }
      try {
        setProcessing(true)
        const res = await fetch("/api/premium/create-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planKey }),
        })
        const data = await res.json()
        if (!res.ok || !data.paymentUrl) {
          toast.error(data?.message || "Không thể tạo thanh toán")
          setProcessing(false)
          return
        }
        window.location.href = data.paymentUrl
      } catch (err) {
        console.error(err)
        toast.error("Lỗi khi khởi tạo thanh toán")
      } finally {
        setProcessing(false)
      }
    },
    [session]
  )

  const currentPlan: Plan | undefined = useMemo(() => {
    if (!premiumInfo) return undefined
    if (premiumInfo.plan) {
      return premiumInfo.plan as Plan
    }
    const planKey = (premiumInfo.planKey || premiumInfo.plan?.key) as
      | string
      | undefined
    if (planKey) return plans.find((p) => p.key === planKey)
    return undefined
  }, [plans, premiumInfo])

  const ownerEmail: string | undefined = useMemo(() => {
    if (!premiumInfo) return undefined
    if (premiumInfo.owner?.email) return premiumInfo.owner.email
    if (premiumInfo.subscription?.owner?.email) {
      return premiumInfo.subscription.owner.email
    }
    if (premiumInfo.ownerEmail) return premiumInfo.ownerEmail
    return undefined
  }, [premiumInfo])

  const displayName = name.trim() || session?.user?.name || "MovieStream User"
  const initials = displayName.charAt(0).toUpperCase() || "U"
  const accountEmail = session?.user?.email ?? "Chưa có email"
  const activePlanName =
    currentPlan?.name ?? premiumInfo?.plan?.name ?? premiumInfo?.planKey ?? "Free"
  const planCapacity = currentPlan?.maxMembers ?? premiumInfo?.plan?.maxMembers ?? 1
  const members = Array.isArray(premiumInfo?.members) ? premiumInfo.members : []
  const usedSeats = role === "owner" ? Math.min(planCapacity, members.length + 1) : 1
  const premiumFeatures = [
    "Xem phim chất lượng cao không quảng cáo",
    "Ưu tiên truy cập server nhanh hơn",
    "Hỗ trợ tải phim về thiết bị",
    "Chia sẻ Family cho tối đa 3 tài khoản",
  ]

  if (status === "loading") {
    return (
      <div className="min-h-screen pt-28">
        <LoadingEffect message="Đang tải tài khoản..." />
      </div>
    )
  }

  return (
    <main className="min-h-screen pb-20 pt-28 text-white md:pt-36">
      <div className="spatial-container max-w-7xl px-1">
        <section className="glass-panel relative isolate overflow-hidden rounded-[2rem] border-white/16 p-5 shadow-[0_28px_90px_rgba(0,0,0,0.36)] md:p-8">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(244,63,94,0.20),transparent_34%),radial-gradient(circle_at_82%_12%,rgba(255,255,255,0.10),transparent_28%)]" />
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[1.8rem] border border-white/16 bg-white/[0.06] shadow-[0_22px_70px_rgba(0,0,0,0.35)] md:h-28 md:w-28">
                {avatarUrl ? (
                  <ImageWithLoader
                    src={getImageUrl(avatarUrl)}
                    alt={displayName}
                    fill
                    sizes="112px"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-white/[0.045] text-4xl font-semibold text-white/80">
                    {initials}
                  </div>
                )}
                <div className="absolute bottom-2 right-2 grid h-8 w-8 place-items-center rounded-full border border-white/18 bg-black/45 text-white shadow-lg backdrop-blur-xl">
                  <Camera className="h-4 w-4" />
                </div>
              </div>

              <div className="min-w-0">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.075] px-3 py-1 text-xs font-semibold text-white/68">
                  {isPremium ? (
                    <BadgeCheck className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <Shield className="h-3.5 w-3.5" />
                  )}
                  {isPremium ? "Premium active" : "Free account"}
                </div>
                <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-5xl">
                  {displayName}
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-white/56 md:text-base">
                  {accountEmail}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[22rem]">
              <div className="rounded-[1.5rem] border border-white/12 bg-white/[0.055] p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase text-white/42">
                  <WalletCards className="h-4 w-4" />
                  Gói hiện tại
                </div>
                <p className="mt-2 text-xl font-semibold text-white">{activePlanName}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/12 bg-white/[0.055] p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase text-white/42">
                  <UsersRound className="h-4 w-4" />
                  Thiết bị
                </div>
                <p className="mt-2 text-xl font-semibold text-white">
                  {usedSeats}/{planCapacity}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="glass-card rounded-[1.85rem] p-5 md:p-6">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/[0.075] text-white">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold tracking-tight">Hồ sơ cá nhân</h2>
                <p className="text-sm text-white/48">Cập nhật tên hiển thị và ảnh đại diện.</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-4">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              {isRestrictedDomain() ? (
                <div className="rounded-[1.35rem] border border-white/12 bg-white/[0.045] px-4 py-3 text-sm text-white/58">
                  Ảnh này được đồng bộ từ tài khoản mạng xã hội.
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    onClick={handleChooseFile}
                    disabled={uploading || saving}
                  >
                    {uploading ? (
                      <Upload className="h-4 w-4 animate-pulse" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                    {uploading ? "Đang tải..." : "Đổi ảnh"}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleDeleteAvatar}
                    disabled={uploading || saving}
                  >
                    <Trash2 className="h-4 w-4" />
                    Xóa ảnh
                  </Button>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-white/68">
                  Họ và tên
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tên hiển thị"
                  className="h-12 rounded-[1.25rem] border-white/14 bg-white/[0.06]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/68">
                  Email
                </Label>
                <Input
                  id="email"
                  value={accountEmail}
                  disabled
                  className="h-12 rounded-[1.25rem] border-white/10 bg-white/[0.035] text-white/58"
                />
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button onClick={handleSave} disabled={saving}>
                  <Check className="h-4 w-4" />
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
                <Button variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>
                  <LogOut className="h-4 w-4" />
                  Đăng xuất
                </Button>
              </div>
            </div>
          </div>

          <div className="glass-card overflow-hidden rounded-[1.85rem] p-5 md:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/12 px-3 py-1 text-xs font-semibold text-primary">
                  <Crown className="h-3.5 w-3.5" />
                  MovieStream Premium
                </div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  {isPremium ? "Gói của bạn đang hoạt động" : "Nâng cấp trải nghiệm xem phim"}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/54">
                  Tối ưu chất lượng xem, giảm gián đoạn và mở thêm quyền chia sẻ cho gia đình.
                </p>
              </div>
              <div className="rounded-[1.35rem] border border-white/12 bg-white/[0.055] px-4 py-3 text-sm">
                <span className="text-white/45">Trạng thái</span>
                <p className={isPremium ? "font-semibold text-primary" : "font-semibold text-white"}>
                  {isPremium ? "Premium" : "Free"}
                </p>
              </div>
            </div>

            {!isPremium ? (
              <>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {premiumFeatures.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-start gap-3 rounded-[1.35rem] border border-white/10 bg-white/[0.045] px-4 py-3 text-sm text-white/68"
                    >
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/18 text-primary">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      {feature}
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {loadingPlans ? (
                    <div className="rounded-[1.5rem] border border-white/12 bg-white/[0.045] p-5 text-white/62">
                      Đang tải gói...
                    </div>
                  ) : plans.length === 0 ? (
                    <div className="rounded-[1.5rem] border border-white/12 bg-white/[0.045] p-5 text-white/62">
                      Chưa có gói nào.
                    </div>
                  ) : (
                    plans.map((plan) => (
                      <div
                        key={plan.id}
                        className="group rounded-[1.65rem] border border-white/12 bg-white/[0.05] p-5 transition duration-300 hover:border-primary/35 hover:bg-white/[0.075]"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-lg font-semibold text-white">{plan.name}</p>
                            <p className="mt-1 min-h-10 text-sm leading-5 text-white/50">
                              {plan.description}
                            </p>
                          </div>
                          <Sparkles className="h-5 w-5 shrink-0 text-primary/80" />
                        </div>
                        <div className="mt-5">
                          <p className="text-2xl font-semibold tracking-tight">
                            {formatPrice(plan.price, plan.currency)}
                          </p>
                          <p className="text-sm text-white/46">
                            {plan.duration} · tối đa {plan.maxMembers} người
                          </p>
                        </div>
                        <Button
                          className="mt-5 w-full"
                          onClick={() => handlePurchase(plan.key)}
                          disabled={processing}
                        >
                          <CreditCard className="h-4 w-4" />
                          {processing ? "Đang chuyển..." : "Mua ngay"}
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-[1.5rem] border border-white/12 bg-white/[0.05] p-5">
                  <p className="text-sm text-white/45">Gói đang dùng</p>
                  <p className="mt-2 text-xl font-semibold">{activePlanName}</p>
                </div>
                <div className="rounded-[1.5rem] border border-white/12 bg-white/[0.05] p-5">
                  <p className="text-sm text-white/45">Hết hạn</p>
                  <p className="mt-2 text-base font-semibold">{formatDate(premiumInfo?.endDate)}</p>
                </div>
                <div className="rounded-[1.5rem] border border-white/12 bg-white/[0.05] p-5">
                  <p className="text-sm text-white/45">Vai trò</p>
                  <p className="mt-2 text-base font-semibold">
                    {role === "owner" ? "Chủ gói" : "Thành viên"}
                  </p>
                </div>
                {role === "member" && ownerEmail && (
                  <div className="rounded-[1.5rem] border border-primary/20 bg-primary/10 p-5 md:col-span-3">
                    <p className="text-sm text-white/62">
                      Bạn đang dùng gói do <strong>{ownerEmail}</strong> chia sẻ.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {isPremium && role === "owner" && planCapacity > 1 && (
          <section className="glass-card mt-6 rounded-[1.85rem] p-5 md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-3 py-1 text-xs font-semibold text-white/58">
                  <UsersRound className="h-3.5 w-3.5" />
                  Family sharing
                </div>
                <h2 className="text-2xl font-semibold tracking-tight">Chia sẻ gói Premium</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/54">
                  Gói {activePlanName} có thể dùng cho tối đa {planCapacity} tài khoản,
                  tính cả tài khoản của bạn.
                </p>
              </div>
              <div className="rounded-[1.35rem] border border-white/12 bg-white/[0.055] px-4 py-3 text-sm">
                <span className="text-white/45">Ghế đã dùng</span>
                <p className="text-xl font-semibold text-white">
                  {usedSeats}/{planCapacity}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm font-semibold text-white/78">Thành viên</p>
              {members.length > 0 ? (
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {members.map((member: any) => (
                    <div
                      key={member.id}
                      className="rounded-[1.15rem] border border-white/10 bg-white/[0.045] px-4 py-3 text-sm text-white/62"
                    >
                      {member.user?.email ?? member.userId}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-white/50">
                  Chưa có thành viên được thêm.
                </p>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
