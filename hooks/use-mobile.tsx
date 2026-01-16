"use client"

import { useEffect, useState } from "react"

const BREAKPOINTS = {
  mobile: 640,
  tablet: 1024,
}

type DeviceType = "mobile" | "tablet" | "desktop"

/* ========= HOOK CŨ – GIỮ NGUYÊN ========= */
export function useDeviceType(): DeviceType | null {
  const [device, setDevice] = useState<DeviceType | null>(null)

  useEffect(() => {
    function updateDevice() {
      const width = window.innerWidth
      if (width < BREAKPOINTS.mobile) {
        setDevice("mobile")
      } else if (width < BREAKPOINTS.tablet) {
        setDevice("tablet")
      } else {
        setDevice("desktop")
      }
    }

    updateDevice()
    window.addEventListener("resize", updateDevice)
    return () => window.removeEventListener("resize", updateDevice)
  }, [])

  return device
}

/* ========= HOOK SHADCN CẦN ========= */
export function useIsMobile(): boolean {
  const device = useDeviceType()
  return device === "mobile" || device === "tablet"
}
