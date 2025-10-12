"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Film } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { toast } from "sonner" // Thêm import toaster

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
    setMessage("")
    setIsLoading(true)

    if (!email || !password) {
      setMessage("Vui lòng điền đầy đủ thông tin")
      setMessageType("error")
      toast.error("Vui lòng điền đầy đủ thông tin")
      setIsLoading(false)
      return
    }

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (res?.error) {
      setMessage("Email hoặc mật khẩu không đúng")
      setMessageType("error")
      toast.error("Email hoặc mật khẩu không đúng")
    } else {
      setMessage("Đăng nhập thành công! Đang chuyển hướng...")
      setMessageType("success")
      toast.success("Đăng nhập thành công!")
      setTimeout(() => {
        router.push("/")
      }, 1500)
    }

    setIsLoading(false)
  }

  const handleGoogleLogin = () => {
    toast.info("Đang chuyển hướng đăng nhập Google...")
    signIn("google", { callbackUrl: "/" })
  }
  const handleFacebookLogin = () => {
    toast.info("Đang chuyển hướng đăng nhập Facebook...")
    signIn("facebook", { callbackUrl: "/" })
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
          <CardDescription>Đăng nhập để tiếp tục xem phim</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                autoComplete="off"
                placeholder="Nhập email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label>Mật khẩu</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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


            {/* Submit */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Đang đăng nhập..." : "Đăng Nhập"}
            </Button>
          </form>

          {/* Social login */}
            <div className="mt-4">
            <Button onClick={handleGoogleLogin} variant="outline" className="w-full flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48">
              <g>
                <path fill="#4285F4" d="M24 9.5c3.54 0 6.72 1.22 9.22 3.22l6.9-6.9C36.16 2.36 30.45 0 24 0 14.82 0 6.73 5.48 2.69 13.44l8.06 6.27C12.7 13.13 17.91 9.5 24 9.5z"/>
                <path fill="#34A853" d="M46.1 24.5c0-1.56-.14-3.06-.39-4.5H24v9h12.44c-.54 2.89-2.17 5.34-4.62 6.98l7.19 5.59C43.91 37.07 46.1 31.26 46.1 24.5z"/>
                <path fill="#FBBC05" d="M10.75 28.71a14.5 14.5 0 0 1 0-9.42l-8.06-6.27A24.01 24.01 0 0 0 0 24c0 3.91.94 7.61 2.69 10.98l8.06-6.27z"/>
                <path fill="#EA4335" d="M24 48c6.45 0 11.87-2.13 15.83-5.81l-7.19-5.59c-2.01 1.35-4.59 2.15-8.64 2.15-6.09 0-11.3-3.63-13.25-8.71l-8.06 6.27C6.73 42.52 14.82 48 24 48z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </g>
              </svg>
              Đăng nhập bằng Google
            </Button>
            </div>
            <div className="mt-4">
            <Button onClick={handleFacebookLogin} variant="outline" className="w-full flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48">
              <path fill="#1877F2" d="M24 48C11 48 0 37 0 24S11 0 24 0s24 11 24 24-11 24-24 24z"/>
              <path fill="#fff" d="M33.5 24h-6v-4c0-.8.7-1 1-1h5v-6h-6c-3.3 0-6 2.7-6 6v5h-4v6h4v12h6v-12h5l1-6z"/>
              </svg>
              Đăng nhập bằng Facebook
            </Button>
            </div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Chưa có tài khoản?{" "}
            <Link href="/register" className="text-red-600 hover:underline">
              Đăng Ký
            </Link>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:underline">
              Quay về trang chủ
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
