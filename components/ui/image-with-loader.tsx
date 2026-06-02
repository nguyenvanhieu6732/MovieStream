"use client"

import Image, { type ImageProps } from "next/image"
import { useState } from "react"
import { cn } from "@/lib/utils"

type ImageWithLoaderProps = ImageProps & {
  wrapperClassName?: string
}

export function ImageWithLoader({
  className,
  wrapperClassName,
  onLoad,
  onError,
  ...props
}: ImageWithLoaderProps) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden bg-slate-900",
        props.fill && "absolute inset-0",
        wrapperClassName
      )}
    >
      {!loaded && (
        <div className="absolute inset-0 z-10 bg-gradient-to-br from-white/10 via-white/5 to-white/10">
          <div className="absolute inset-0 image-loading-shimmer" />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white/60">
            {failed ? "Không tải được ảnh" : "Đang tải ảnh..."}
          </div>
        </div>
      )}
      <Image
        {...props}
        className={cn(
          "transition duration-500",
          loaded ? "opacity-100 blur-0" : "opacity-0 blur-sm",
          className
        )}
        onLoad={(event) => {
          setLoaded(true)
          onLoad?.(event)
        }}
        onError={(event) => {
          setFailed(true)
          setLoaded(false)
          onError?.(event)
        }}
      />
    </div>
  )
}
