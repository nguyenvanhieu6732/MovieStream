// components/carousel/HorizontalCarousel.tsx
"use client";
import useEmblaCarousel from "embla-carousel-react";
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
  const device = useDeviceType();

  return (
    <div className="relative w-full overflow-hidden rounded-[1.75rem]">
      {emblaApi && device === "desktop" && (
        <>
          {/* Chevron trái */}
          <div className="absolute bottom-0 left-0 top-0 z-20 flex w-14 items-center bg-gradient-to-r from-[#05070d]/80 to-transparent">
            <button
              onClick={() => emblaApi?.scrollPrev()}
              className="glass-panel rounded-full p-2 text-white"
            >
              <ChevronLeft size={28} strokeWidth={2.5} />
            </button>
          </div>

          {/* Chevron phải */}
          <div className="absolute bottom-0 right-0 top-0 z-20 flex w-14 items-center justify-end bg-gradient-to-l from-[#05070d]/80 to-transparent">
            <button
              onClick={() => emblaApi?.scrollNext()}
              className="glass-panel rounded-full p-2 text-white"
            >
              <ChevronRight size={28} strokeWidth={2.5} />
            </button>
          </div>
        </>
      )}

      {/* Track */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex items-stretch" style={{ gap: `${gap}px` }}>
          {items.map((item, idx) => (
            <div key={idx} className="flex min-w-0 flex-shrink-0" style={{ width: itemWidth }}>
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
