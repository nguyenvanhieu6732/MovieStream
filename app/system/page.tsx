import Link from "next/link"
import {
  Activity,
  ArrowUpRight,
  BadgeCheck,
  Film,
  ShieldAlert,
  UsersRound,
} from "lucide-react"
import { prisma } from "@/lib/prisma"

const numberFormatter = new Intl.NumberFormat("vi-VN")

async function getOPhimTotal() {
  if (!process.env.NEXT_PUBLIC_OPHIM_API) return 0

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_OPHIM_API}/home`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return 0
    const json = await res.json()
    return json?.data?.params?.pagination?.totalItems ?? 0
  } catch {
    return 0
  }
}

export default async function SystemPage() {
  const [
    userCount,
    activeUserCount,
    restrictedUserCount,
    premiumMovieCount,
    activeSubscriptionCount,
    totalMovies,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isBanned: false, isDeleted: false } }),
    prisma.user.count({
      where: {
        OR: [{ isBanned: true }, { isDeleted: true }],
      },
    }),
    prisma.premiumMovie.count(),
    prisma.subscription.count({ where: { status: "active" } }),
    getOPhimTotal(),
  ])

  const metrics = [
    {
      label: "Người dùng",
      value: userCount,
      helper: `${numberFormatter.format(activeUserCount)} tài khoản đang hoạt động`,
      icon: UsersRound,
    },
    {
      label: "Kho phim OPhim",
      value: totalMovies,
      helper: "Đồng bộ từ nguồn OPhim",
      icon: Film,
    },
    {
      label: "Phim Premium",
      value: premiumMovieCount,
      helper: "Nội dung đang khóa Premium",
      icon: BadgeCheck,
    },
    {
      label: "Tài khoản cần chú ý",
      value: restrictedUserCount,
      helper: "Bị cấm hoặc đã xóa mềm",
      icon: ShieldAlert,
    },
  ]

  const quickActions = [
    {
      href: "/system/users",
      title: "Quản lý người dùng",
      description: "Cấm, khôi phục và theo dõi trạng thái tài khoản.",
    },
    {
      href: "/system/movies",
      title: "Phim Premium",
      description: "Kiểm tra danh sách phim đang yêu cầu gói Premium.",
    },
  ]

  return (
    <div className="space-y-6">
      <section className="glass-panel relative isolate overflow-hidden rounded-[2rem] p-6 md:p-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_0%,rgba(244,63,94,0.22),transparent_34%),radial-gradient(circle_at_84%_18%,rgba(255,255,255,0.12),transparent_28%)]" />
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.07] px-3 py-1 text-xs font-semibold text-white/62">
              <Activity className="h-3.5 w-3.5 text-emerald-300" />
              Console đang hoạt động
            </div>
            <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-5xl">
              Bảng điều khiển hệ thống
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/56 md:text-base">
              Theo dõi người dùng, nội dung Premium và các chỉ số vận hành chính
              của MovieStream trong một màn hình gọn hơn.
            </p>
          </div>
          <div className="rounded-[1.55rem] border border-white/12 bg-white/[0.055] p-4">
            <p className="text-sm text-white/46">Gói Premium active</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums">
              {numberFormatter.format(activeSubscriptionCount)}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <div
              key={metric.label}
              className="glass-card glass-hover rounded-[1.75rem] p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="grid h-11 w-11 place-items-center rounded-[1.2rem] border border-white/12 bg-white/[0.065]">
                  <Icon className="h-5 w-5 text-white/72" />
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.055] px-2.5 py-1 text-[11px] font-semibold text-white/46">
                  Live
                </span>
              </div>
              <p className="mt-5 text-sm font-medium text-white/52">{metric.label}</p>
              <p className="mt-2 text-4xl font-semibold tabular-nums tracking-tight">
                {numberFormatter.format(metric.value)}
              </p>
              <p className="mt-3 text-sm leading-5 text-white/44">{metric.helper}</p>
            </div>
          )
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.72fr]">
        <div className="glass-card rounded-[1.85rem] p-5 md:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Lối tắt quản trị</h2>
              <p className="mt-2 text-sm text-white/50">
                Đi thẳng tới những màn cần thao tác thường xuyên.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="group rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-4 hover:border-white/20 hover:bg-white/[0.075]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-white">{action.title}</p>
                    <p className="mt-2 text-sm leading-5 text-white/48">
                      {action.description}
                    </p>
                  </div>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-white/62 group-hover:bg-white group-hover:text-black">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <aside className="glass-card rounded-[1.85rem] p-5 md:p-6">
          <h2 className="text-xl font-semibold tracking-tight">Tình trạng dữ liệu</h2>
          <div className="mt-5 space-y-3">
            <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.045] p-4">
              <p className="text-sm text-white/44">Nguồn phim</p>
              <p className="mt-1 font-semibold text-white">OPhim API</p>
            </div>
            <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.045] p-4">
              <p className="text-sm text-white/44">Cache dashboard</p>
              <p className="mt-1 font-semibold text-white">Revalidate 1 giờ</p>
            </div>
            <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.045] p-4">
              <p className="text-sm text-white/44">Quyền truy cập</p>
              <p className="mt-1 font-semibold text-white">Admin only</p>
            </div>
          </div>
        </aside>
      </section>
    </div>
  )
}
