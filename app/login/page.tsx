"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Film } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"   // 🔑 Import NextAuth

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error">("success")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    // Nếu muốn dùng NextAuth credentials thì thay đổi ở đây
    if (email && password) {
      setMessage("Mock login thành công (chưa kết nối DB)")
      setMessageType("success")
      setTimeout(() => {
        router.push("/")
      }, 1000)
    } else {
      setMessage("Please fill in all fields")
      setMessageType("error")
    }
    setIsLoading(false)
  }

  // 🔑 Hàm login bằng Google (NextAuth)
  const handleGoogleLogin = async () => {
    await signIn("google", { callbackUrl: "/" })
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Film className="h-8 w-8 text-red-600 mr-2" />
            <span className="text-2xl font-bold">MovieStream</span>
          </div>
          <CardTitle className="text-2xl">Chào Mừng Trở Lại</CardTitle>
          <CardDescription>Đăng nhập vào tài khoản của bạn để tiếp tục xem</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu của bạn"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {message && (
              <Alert className={messageType === "error" ? "border-red-500" : "border-green-500"}>
                <AlertDescription className={messageType === "error" ? "text-red-700" : "text-green-700"}>
                  {message}
                </AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Đang đăng nhập..." : "Đăng Nhập"}
            </Button>
          </form>

          {/* 🔑 Thêm nút login Google */}
          <div className="mt-4">
            <Button onClick={handleGoogleLogin} variant="outline" className="w-full">
              Đăng Nhập Bằng Google
            </Button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Chưa có tài khoản?{" "}
              <Link href="/register" className="text-red-600 hover:underline">
                Đăng Ký
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:underline">
              Quay Về Trang Chủ
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
