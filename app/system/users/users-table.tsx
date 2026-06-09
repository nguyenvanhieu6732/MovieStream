"use client"

import { useState } from "react"
import { toast } from "sonner"

type User = {
  id: string
  name: string | null
  email: string
  role: "user" | "admin"
  createdAt: string
  isBanned: boolean
  isDeleted: boolean
}

export default function UsersTable({ users }: { users: User[] }) {
  const [list, setList] = useState<User[]>(users)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  function confirmToast(message: string, onConfirm: () => void) {
    toast(message, {
      duration: 10000,
      action: {
        label: "Xác nhận",
        onClick: onConfirm,
      },
      cancel: {
        label: "Hủy",
      },
    })
  }

  function confirmAction(
    user: User,
    action: "ban" | "unban" | "delete" | "restore"
  ) {
    const text =
      action === "ban"
        ? `Bạn có muốn BAN người dùng ${user.email}?`
        : action === "unban"
        ? `Gỡ BAN người dùng ${user.email}?`
        : action === "delete"
        ? `Bạn có muốn XÓA người dùng ${user.email}?`
        : `Khôi phục người dùng ${user.email}?`

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
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              isDeleted:
                action === "delete"
                  ? true
                  : action === "restore"
                  ? false
                  : u.isDeleted,
              isBanned:
                action === "ban"
                  ? true
                  : action === "unban"
                  ? false
                  : u.isBanned,
            }
          : u
      )
    )

    toast.success("Thao tác thành công")
    setLoadingId(null)
  }

  return (
    <div className="glass-card overflow-x-auto rounded-[1.75rem] p-3">
      <table className="w-full text-sm">
        <thead className="text-white/54">
          <tr>
            <th className="p-3 text-left">Họ Tên</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Vai Trò</th>
            <th className="p-3 text-left">Ngày Tạo</th>
            <th className="p-3 text-left">Hành Động</th>
          </tr>
        </thead>

        <tbody>
          {list.map((user) => (
            <tr key={user.id} className="border-t border-white/8">
              <td className="p-3">{user.name ?? "-"}</td>

              <td
                className={`p-3 ${
                  user.isDeleted ? "line-through text-white/38" : ""
                }`}
              >
                {user.email != null ? user.email : "Facebook User"}
              </td>

              <td className="p-3">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    user.role === "admin"
                      ? "border border-primary/20 bg-primary/12 text-primary"
                      : "border border-white/12 bg-white/10 text-white/68"
                  }`}
                >
                  {user.role}
                </span>
              </td>

              <td className="p-3">
                {new Date(user.createdAt).toLocaleDateString("vi-VN")}
              </td>

              <td className="p-3">
                {user.role === "admin" ? (
                  <span className="text-white/42 italic">admin</span>
                ) : user.isDeleted ? (
                  <button
                    disabled={loadingId === user.id}
                    onClick={() => confirmAction(user, "restore")}
                    className="rounded-full border border-white/12 bg-white/10 px-3 py-1 text-white/72 hover:bg-white/14"
                  >
                    Khôi Phục
                  </button>
                ) : (
                  <div className="flex gap-2">
                    {user.isBanned ? (
                      <button
                        disabled={loadingId === user.id}
                        onClick={() => confirmAction(user, "unban")}
                        className="rounded-full border border-white/12 bg-white/10 px-3 py-1 text-white/72 hover:bg-white/14"
                      >
                        Gỡ Cấm
                      </button>
                    ) : (
                      <button
                        disabled={loadingId === user.id}
                        onClick={() => confirmAction(user, "ban")}
                        className="rounded-full border border-white/12 bg-white/10 px-3 py-1 text-white/72 hover:bg-white/14"
                      >
                        Cấm
                      </button>
                    )}

                    <button
                      disabled={loadingId === user.id}
                      onClick={() => confirmAction(user, "delete")}
                      className="rounded-full border border-primary/20 bg-primary/12 px-3 py-1 text-primary hover:bg-primary/18"
                    >
                      Xóa
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
