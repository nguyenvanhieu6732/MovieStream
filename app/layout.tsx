import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/layout/theme-provider"
import Footer from "@/components/layout/footer"
import { Navigation } from "@/components/layout/navigation"
import SplashProvider from "@/components/effect/SplashProvider"
import AuthProvider from "@/providers/session-provider"
import { Toaster } from "sonner"  // ✅ Thêm
import HeaderWrapper from "@/components/layout/HeaderWrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MovieStream",
  description: "Stream the latest movies and TV shows online.",
  openGraph: {
    title: "MovieStream",
    description: "Stream the latest movies and TV shows online.",
    images: ["/favicon.ico"],
  },
  manifest: "/manifest.json",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <SplashProvider>
              <HeaderWrapper />
              {children}
              <Footer />
              <Toaster richColors position="top-center" />
            </SplashProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
