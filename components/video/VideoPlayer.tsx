"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

type VideoPlayerProps = {
  src?: string | null;
  poster?: string;
  title?: string;
  autoPlay?: boolean;
  className?: string;
};

export function VideoPlayer({
  src,
  poster,
  title = "Trình phát video",
  autoPlay = true,
  className = "",
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) {
      setError("Không có nguồn video hợp lệ.");
      return;
    }

    let hls: Hls | null = null;
    setError(null);
    video.pause();
    video.removeAttribute("src");
    video.load();

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      video.load();
      if (autoPlay) {
        video.play().catch(() => undefined);
      }
      return () => {
        video.pause();
        video.removeAttribute("src");
        video.load();
      };
    }

    if (!Hls.isSupported()) {
      setError("Trình duyệt không hỗ trợ phát video HLS.");
      return;
    }

    hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90,
    });

    hls.loadSource(src);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      if (autoPlay) {
        video.play().catch(() => undefined);
      }
    });

    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (!data.fatal) return;

      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        hls?.startLoad();
        return;
      }

      if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        hls?.recoverMediaError();
        return;
      }

      setError("Không thể phát video này.");
      hls?.destroy();
      hls = null;
    });

    return () => {
      hls?.destroy();
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, [autoPlay, src]);

  if (!src || error) {
    return (
      <div className={`flex h-full w-full items-center justify-center bg-black/80 text-primary ${className}`}>
        <div className="glass-panel rounded-[1.5rem] p-6 text-center">
          <p className="text-lg font-semibold text-white">Không thể phát video</p>
          <p className="text-sm text-white/80">{error || "Tập này chưa có link HLS hợp lệ."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative h-full w-full overflow-hidden bg-black ${className}`}>
      <video
        ref={videoRef}
        title={title}
        poster={poster}
        controls
        playsInline
        preload="metadata"
        className="h-full w-full bg-black object-contain"
      />
    </div>
  );
}
