// components/carousel/HorizontalCarousel.tsx
"use client";
import useEmblaCarousel from "embla-carousel-react";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useDeviceType } from "@/hooks/use-mobile";

interface Props {
  items: React.ReactNode[];
  itemWidth?: string;
  itemPerRow?: number;
  gap?: number;
}

export default function HorizontalCarousel({
  items,
  gap = 24,
  itemPerRow = 5,
  itemWidth =`calc((100% - ${(itemPerRow - 1) * gap}px) / ${itemPerRow})`,
}: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    dragFree: true,
  });
  const [isReady, setIsReady] = useState(false);
  const device = useDeviceType();
  useEffect(() => {
    if (emblaApi) setIsReady(true);
  }, [emblaApi]);

  return (
    <div className="relative w-full overflow-hidden">
      {isReady && device === "desktop" && (
        <>
          {/* Chevron trái */}
          <div className="absolute left-0 top-0 bottom-0 w-12 z-20 flex items-center">
            <button
              onClick={() => emblaApi?.scrollPrev()}
              className="bg-white text-black p-2 rounded-full shadow-lg"
            >
              <ChevronLeft size={28} strokeWidth={2.5} />
            </button>
          </div>

          {/* Chevron phải */}
          <div className="absolute right-0 top-0 bottom-0 w-12 z-20 flex items-center justify-end">
            <button
              onClick={() => emblaApi?.scrollNext()}
              className="bg-white text-black p-2 rounded-full shadow-lg"
            >
              <ChevronRight size={28} strokeWidth={2.5} />
            </button>
          </div>
        </>
      )}

      {/* Track */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex" style={{ gap: `${gap}px` }}>
          {items.map((item, idx) => (
            <div key={idx} className="flex-shrink-0" style={{ width: itemWidth }}>
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
