"use client"

import { useEffect, useState } from "react"
import { useDeviceType } from "@/hooks/use-mobile";
import Image from "next/image";


export default function SplashProvider({ children }: { children: React.ReactNode }) {
  const [hideSplash, setHideSplash] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const device = useDeviceType();
  useEffect(() => {
    // Scroll về đầu trang khi hiển thị splash
    window.scrollTo(0, 0)

    const timer = setTimeout(() => {
      setIsExiting(true)
    }, 2000)

    const removeTimer = setTimeout(() => {
      setHideSplash(true)
    }, 2700)

    return () => {
      clearTimeout(timer)
      clearTimeout(removeTimer)
    }
  }, [])

  return (
    <div className="relative">
      {children}

      {!hideSplash && (
        <div className={`splash-screen fixed inset-0 z-[9999] flex items-center justify-center bg-black pointer-events-none ${isExiting ? "splash-screen-exit" : ""}`}>
            <div className="splash-content flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10 px-4 text-center md:text-left">
              {/* Logo */}
              <Image
                src="/logo.png"
                alt="MovieStream Logo"
                width={160}
                height={160}
                className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 object-contain"
                priority
              />

              {/* Text content */}
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                  MovieStream
                </h1>
                {device !== "mobile" && (
                  <>
                    <p className="text-xs sm:text-sm md:text-base text-gray-300 italic mt-1">
                      Phim hay trên MovieStream
                    </p>
                    <p className="mt-3 text-xs sm:text-sm md:text-base font-medium text-gray-400 max-w-[300px] leading-snug">
                      Xem Phim Miễn Phí Cực Nhanh, Chất Lượng Cao Và Cập Nhật Liên Tục
                    </p>
                  </>
                )}

              </div>
            </div>
        </div>
      )}
    </div>
  )
}
