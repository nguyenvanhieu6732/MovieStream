"use client"

import { useMemo, useState } from "react"
import { Ban, Loader2, RotateCcw, ShieldCheck, Trash2, UserRound } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

type User = {
  id: string
  name: string | null
  email: string
  role: string
  createdAt: string
  isBanned: boolean
  isDeleted: boolean
}

function statusLabel(user: User) {
  if (user.isDeleted) return "Đã xóa"
  if (user.isBanned) return "Bị cấm"
  return "Hoạt động"
}

function statusClass(user: User) {
  if (user.isDeleted) return "border-white/10 bg-white/[0.055] text-white/42"
  if (user.isBanned) return "border-amber-300/20 bg-amber-300/10 text-amber-200"
  return "border-emerald-300/20 bg-emerald-300/10 text-emerald-200"
}

export default function UsersTable({ users }: { users: User[] }) {
  const [list, setList] = useState<User[]>(users)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const admins = useMemo(
    () => list.filter((user) => user.role === "admin").length,
    [list]
  )

  function confirmToast(message: string, onConfirm: () => void) {
    toast(message, {
      duration: 10000,
      action: {
        label: "Xác nhận",
        onClick: onConfirm,
      },
      cancel: {
        label: "Hủy",
        onClick: () => undefined,
      },
    })
  }

  function confirmAction(
    user: User,
    action: "ban" | "unban" | "delete" | "restore"
  ) {
    const email = user.email || "tài khoản không email"
    const text =
      action === "ban"
        ? `Bạn muốn cấm người dùng ${email}?`
        : action === "unban"
          ? `Gỡ cấm người dùng ${email}?`
          : action === "delete"
            ? `Bạn muốn xóa mềm người dùng ${email}?`
            : `Khôi phục người dùng ${email}?`

    confirmToast(text, () => doAction(user.id, action))
  }

  async function doAction(
    userId: string,
    action: "ban" | "unban" | "delete" | "restore"
  ) {
    setLoadingId(userId)

    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    })

    if (!res.ok) {
      toast.error("Thao tác thất bại")
      setLoadingId(null)
      return
    }

    setList((prev) =>
      prev.map((user) =>
        user.id === userId
          ? {
              ...user,
              isDeleted:
                action === "delete"
                  ? true
                  : action === "restore"
                    ? false
                    : user.isDeleted,
              isBanned:
                action === "ban"
                  ? true
                  : action === "unban"
                    ? false
                    : user.isBanned,
            }
          : user
      )
    )

    toast.success("Đã cập nhật người dùng")
    setLoadingId(null)
  }

  return (
    <section className="glass-card rounded-[1.85rem] p-3">
      <div className="flex flex-col gap-3 px-3 pb-4 pt-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Danh sách tài khoản</h2>
          <p className="mt-1 text-sm text-white/46">
            {list.length.toLocaleString("vi-VN")} tài khoản · {admins} admin
          </p>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="flex min-h-56 flex-col items-center justify-center rounded-[1.55rem] border border-dashed border-white/14 bg-white/[0.035] px-4 text-center">
          <UserRound className="h-9 w-9 text-white/40" />
          <p className="mt-4 text-lg font-semibold text-white">Chưa có người dùng</p>
          <p className="mt-2 max-w-md text-sm leading-6 text-white/46">
            Khi có tài khoản đăng ký, danh sách quản trị sẽ xuất hiện ở đây.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px] text-sm">
            <thead>
              <tr className="border-y border-white/10 text-left text-xs font-semibold uppercase text-white/42">
                <th className="px-4 py-3">Người dùng</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Vai trò</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Ngày tạo</th>
                <th className="px-4 py-3 text-right">Hành động</th>
              </tr>
            </thead>

            <tbody>
              {list.map((user) => {
                const isBusy = loadingId === user.id
                return (
                  <tr
                    key={user.id}
                    className="border-b border-white/8 transition-colors hover:bg-white/[0.045]"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[1.05rem] border border-white/10 bg-white/[0.06] text-sm font-semibold text-white/72">
                          {(user.name || user.email || "U").charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-white/82">
                            {user.name || "Chưa đặt tên"}
                          </p>
                          <p className="truncate text-xs text-white/42">ID {user.id}</p>
                        </div>
                      </div>
                    </td>

                    <td
                      className={`px-4 py-4 text-white/66 ${
                        user.isDeleted ? "line-through text-white/38" : ""
                      }`}
                    >
                      {user.email || "Tài khoản mạng xã hội"}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                          user.role === "admin"
                            ? "border-primary/25 bg-primary/14 text-white"
                            : "border-white/12 bg-white/[0.065] text-white/58"
                        }`}
                      >
                        {user.role === "admin" && <ShieldCheck className="h-3.5 w-3.5" />}
                        {user.role}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass(
                          user
                        )}`}
                      >
                        {statusLabel(user)}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-white/58">
                      {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        {user.role === "admin" ? (
                          <span className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-2 text-xs font-semibold text-white/42">
                            Admin
                          </span>
                        ) : user.isDeleted ? (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isBusy}
                            onClick={() => confirmAction(user, "restore")}
                          >
                            {isBusy ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RotateCcw className="h-4 w-4" />
                            )}
                            Khôi phục
                          </Button>
                        ) : (
                          <>
                            {user.isBanned ? (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isBusy}
                                onClick={() => confirmAction(user, "unban")}
                              >
                                {isBusy ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <RotateCcw className="h-4 w-4" />
                                )}
                                Gỡ cấm
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isBusy}
                                onClick={() => confirmAction(user, "ban")}
                              >
                                {isBusy ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Ban className="h-4 w-4" />
                                )}
                                Cấm
                              </Button>
                            )}

                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={isBusy}
                              onClick={() => confirmAction(user, "delete")}
                            >
                              {isBusy ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                              Xóa
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
