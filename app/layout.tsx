import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/layout/theme-provider"
import SplashProvider from "@/components/effect/SplashProvider"
import AuthProvider from "@/providers/session-provider"
import { Toaster } from "sonner"
import HeaderWrapper from "@/components/layout/HeaderWrapper"
import FooterWrapper from "@/components/layout/FooterWrapper"
import PageTransition from "@/components/layout/PageTransition"
import WebMCPProvider from "@/components/agent/WebMCPProvider"

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
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
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <SplashProvider>
              <HeaderWrapper />
              <PageTransition>{children}</PageTransition>
              <FooterWrapper />
              <Toaster richColors position="top-center" />
              <WebMCPProvider />
            </SplashProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
