"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Film } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error">("success")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    if (!name || !email || !password || !confirmPassword) {
      setMessage("Hãy điền vào tất cả các trường")
      setMessageType("error")
      toast.error("Hãy điền vào tất cả các trường")
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setMessage("Mật khẩu không khớp")
      setMessageType("error")
      toast.error("Mật khẩu không khớp")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setMessage("Mật khẩu phải có ít nhất 6 ký tự")
      setMessageType("error")
      toast.error("Mật khẩu phải có ít nhất 6 ký tự")
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage(data.message || "Đăng ký thất bại")
        setMessageType("error")
        toast.error(data.message || "Đăng ký thất bại")
      } else {
        setMessage("Tạo tài khoản thành công. Đang chuyển hướng...")
        setMessageType("success")
        toast.success("Tạo tài khoản thành công. Đang chuyển hướng...")

        setTimeout(() => {
          router.push("/login")
        }, 1500)
      }
    } catch (error) {
      setMessage("Lỗi kết nối server")
      setMessageType("error")
      toast.error("Lỗi kết nối server")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 pt-28">
      <Card className="w-full max-w-md p-1">
        <CardHeader className="text-center">
          <div className="mb-4 flex items-center justify-center">
            <div className="glass-panel inline-flex items-center gap-3 rounded-[1.5rem] px-4 py-3">
              <Film className="h-7 w-7 text-primary" />
              <span className="text-2xl font-semibold tracking-tight">MovieStream</span>
            </div>
          </div>
          <CardTitle className="text-3xl">Tạo tài khoản</CardTitle>
          <CardDescription>Tham gia MovieStream để bắt đầu xem nội dung tuyệt vời</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Họ tên</Label>
              <Input
                id="name"
                type="text"
                placeholder="Nhập họ tên của bạn"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu của bạn"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-10 px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Xác nhận mật khẩu của bạn"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-10 px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>


            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Đã có tài khoản?{" "}
              <Link href="/login" className="font-semibold text-primary hover:text-primary/80">
                Đăng nhập
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-white/52 hover:text-white">
              Quay về trang chủ
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
