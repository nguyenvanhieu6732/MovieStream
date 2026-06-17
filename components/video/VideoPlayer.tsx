"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Hls from "hls.js";
import {
  ArrowLeft,
  Maximize,
  Minimize,
  Pause,
  Play,
  Settings,
  Volume2,
  VolumeX,
} from "lucide-react";

type VideoPlayerProps = {
  src?: string | null;
  poster?: string;
  title?: string;
  autoPlay?: boolean;
  className?: string;
  onBack?: () => void;
};

const formatTime = (value: number) => {
  if (!Number.isFinite(value)) return "00:00";

  const totalSeconds = Math.max(0, Math.floor(value));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

export function VideoPlayer({
  src,
  poster,
  title = "Trình phát video",
  autoPlay = true,
  className = "",
  onBack,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [bufferedEnd, setBufferedEnd] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Center play/pause flash states
  const [centerAction, setCenterAction] = useState<"play" | "pause" | null>(null);
  const [actionKey, setActionKey] = useState(0);

  // Skip feedback states
  const [skipFeedback, setSkipFeedback] = useState<{
    type: "forward" | "backward";
    amount: number;
    visible: boolean;
  } | null>(null);
  const skipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Timeline hover coordinates/timestamp
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState<number>(0);

  // Preview thumbnail states
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const previewSeekTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastPreviewTimeRef = useRef<number>(-1);

  // Parse title into Main Title and Subtitle (e.g. Movie Name & Episode Name)
  const { mainTitle, subTitle } = useMemo(() => {
    if (!title) return { mainTitle: "", subTitle: "" };
    const parts = title.split(" - ");
    return {
      mainTitle: parts[0],
      subTitle: parts[1] || "",
    };
  }, [title]);

  const progress = useMemo(() => {
    if (!duration) return 0;
    return Math.min(100, Math.max(0, (currentTime / duration) * 100));
  }, [currentTime, duration]);

  // Initialize preview video element for timeline thumbnails
  useEffect(() => {
    if (!src) return;

    const previewVideo = document.createElement("video");
    previewVideo.preload = "metadata";
    previewVideo.muted = true;
    previewVideo.playsInline = true;
    previewVideo.crossOrigin = "anonymous";
    previewVideo.style.display = "none";
    document.body.appendChild(previewVideo);
    previewVideoRef.current = previewVideo;

    // Set up HLS for preview video if needed
    let previewHls: Hls | null = null;

    if (previewVideo.canPlayType("application/vnd.apple.mpegurl")) {
      previewVideo.src = src;
    } else if (Hls.isSupported()) {
      previewHls = new Hls({
        enableWorker: false,
        lowLatencyMode: false,
        maxBufferLength: 1,
        maxMaxBufferLength: 2,
      });
      previewHls.loadSource(src);
      previewHls.attachMedia(previewVideo);
    }

    // Create canvas for thumbnail capture
    const canvas = document.createElement("canvas");
    canvas.width = 192;
    canvas.height = 108;
    previewCanvasRef.current = canvas;

    return () => {
      previewHls?.destroy();
      previewVideo.pause();
      previewVideo.removeAttribute("src");
      previewVideo.load();
      if (previewVideo.parentNode) {
        previewVideo.parentNode.removeChild(previewVideo);
      }
      previewVideoRef.current = null;
      previewCanvasRef.current = null;
      setPreviewUrl(null);
      if (previewSeekTimeoutRef.current) {
        clearTimeout(previewSeekTimeoutRef.current);
      }
    };
  }, [src]);

  // Generate preview thumbnail at a given time
  const generatePreview = useCallback((targetTime: number) => {
    const previewVideo = previewVideoRef.current;
    const canvas = previewCanvasRef.current;
    if (!previewVideo || !canvas) return;

    // Avoid re-seeking if the rounded time hasn't changed (within 1s buckets)
    const bucketTime = Math.floor(targetTime);
    if (bucketTime === lastPreviewTimeRef.current) return;
    lastPreviewTimeRef.current = bucketTime;

    // Debounce the seek to avoid hammering the preview video
    if (previewSeekTimeoutRef.current) {
      clearTimeout(previewSeekTimeoutRef.current);
    }

    previewSeekTimeoutRef.current = setTimeout(() => {
      const handleSeeked = () => {
        try {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(previewVideo, 0, 0, canvas.width, canvas.height);
            setPreviewUrl(canvas.toDataURL("image/jpeg", 0.6));
          }
        } catch {
          // CORS or other errors - silently ignore
        }
        previewVideo.removeEventListener("seeked", handleSeeked);
      };

      previewVideo.addEventListener("seeked", handleSeeked);
      previewVideo.currentTime = targetTime;
    }, 80);
  }, []);

  // Handle HLS and source loading
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) {
      setError("Không có nguồn video hợp lệ.");
      return;
    }

    let hls: Hls | null = null;
    setError(null);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    setBufferedEnd(0);
    setIsBuffering(false);
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

  // Sync state with HTML5 video element events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const syncTime = () => {
      setCurrentTime(video.currentTime || 0);
      if (video.buffered.length > 0 && video.duration) {
        let currentBuffered = 0;
        for (let i = 0; i < video.buffered.length; i++) {
          const start = video.buffered.start(i);
          const end = video.buffered.end(i);
          if (video.currentTime >= start && video.currentTime <= end) {
            currentBuffered = end;
            break;
          }
        }
        setBufferedEnd((currentBuffered / video.duration) * 100);
      }
    };
    const syncDuration = () => setDuration(video.duration || 0);
    const syncPlayState = () => setIsPlaying(!video.paused);
    const syncVolume = () => {
      setIsMuted(video.muted);
      setVolume(video.volume);
    };
    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => setIsBuffering(false);

    video.addEventListener("timeupdate", syncTime);
    video.addEventListener("progress", syncTime);
    video.addEventListener("loadedmetadata", syncDuration);
    video.addEventListener("durationchange", syncDuration);
    video.addEventListener("play", syncPlayState);
    video.addEventListener("pause", syncPlayState);
    video.addEventListener("volumechange", syncVolume);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("seeking", handleWaiting);
    video.addEventListener("seeked", handlePlaying);

    syncTime();
    syncDuration();
    syncPlayState();
    syncVolume();

    return () => {
      video.removeEventListener("timeupdate", syncTime);
      video.removeEventListener("progress", syncTime);
      video.removeEventListener("loadedmetadata", syncDuration);
      video.removeEventListener("durationchange", syncDuration);
      video.removeEventListener("play", syncPlayState);
      video.removeEventListener("pause", syncPlayState);
      video.removeEventListener("volumechange", syncVolume);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("seeking", handleWaiting);
      video.removeEventListener("seeked", handlePlaying);
    };
  }, [src]);

  // Sync fullscreen state
  useEffect(() => {
    const syncFullscreen = () => {
      setIsFullscreen(document.fullscreenElement === wrapperRef.current);
    };

    document.addEventListener("fullscreenchange", syncFullscreen);
    syncFullscreen();

    return () => document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  // Controls Auto-Hide Logic
  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true);
      return;
    }

    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      setShowControls(true);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setShowControls(false);
        setShowSpeedMenu(false);
      }, 2500);
    };

    const handleMouseLeave = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setShowControls(false);
        setShowSpeedMenu(false);
      }, 800);
    };

    const container = wrapperRef.current;
    if (container) {
      container.addEventListener("mousemove", resetTimer);
      container.addEventListener("click", resetTimer);
      container.addEventListener("mouseleave", handleMouseLeave);
    }

    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      if (container) {
        container.removeEventListener("mousemove", resetTimer);
        container.removeEventListener("click", resetTimer);
        container.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, [isPlaying]);

  // Clean up skip feedback timeouts on unmount
  useEffect(() => {
    return () => {
      if (skipTimeoutRef.current) {
        clearTimeout(skipTimeoutRef.current);
      }
    };
  }, []);

  // Core Actions
  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(() => undefined);
      triggerCenterAction("play");
    } else {
      video.pause();
      triggerCenterAction("pause");
    }
  };

  const triggerCenterAction = (action: "play" | "pause") => {
    setCenterAction(action);
    setActionKey((prev) => prev + 1);
  };

  // Clear center icon flash state when timeout completes
  useEffect(() => {
    if (!centerAction) return;
    const timeout = setTimeout(() => setCenterAction(null), 500);
    return () => clearTimeout(timeout);
  }, [centerAction, actionKey]);

  const seekTo = (nextTime: number) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    const safeTime = Math.min(duration, Math.max(0, nextTime));
    video.currentTime = safeTime;
    setCurrentTime(safeTime);
  };

  // Skip backward/forward 5s with YouTube-like accumulation
  const triggerSkip = (type: "forward" | "backward") => {
    const video = videoRef.current;
    if (!video || !duration) return;

    const seekDelta = type === "forward" ? 5 : -5;

    setSkipFeedback((prev) => {
      const isSameType = prev && prev.type === type && prev.visible;
      const nextAmount = isSameType ? prev.amount + 5 : 5;
      return {
        type,
        amount: nextAmount,
        visible: true,
      };
    });

    if (skipTimeoutRef.current) {
      clearTimeout(skipTimeoutRef.current);
    }

    const newTime = video.currentTime + seekDelta;
    seekTo(newTime);

    skipTimeoutRef.current = setTimeout(() => {
      setSkipFeedback((prev) => (prev ? { ...prev, visible: false } : null));
    }, 800);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleVolumeChange = (nextVolume: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = nextVolume;
    setVolume(nextVolume);
    const isMutedNow = nextVolume === 0;
    video.muted = isMutedNow;
    setIsMuted(isMutedNow);
  };

  const toggleFullscreen = async () => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await wrapper.requestFullscreen();
      }
    } catch (err) {
      console.error("Lỗi khi chuyển đổi chế độ toàn màn hình:", err);
    }
  };

  const changeSpeed = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSpeedMenu(false);
  };

  // Seek bar hover information
  const handleTimelineMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const timeline = timelineRef.current;
    if (!timeline || !duration) return;

    const rect = timeline.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.min(1, Math.max(0, x / rect.width));
    const targetTime = pct * duration;

    setHoverTime(targetTime);
    setHoverX((x / rect.width) * 100);

    // Generate preview thumbnail
    generatePreview(targetTime);
  };

  const handleTimelineMouseLeave = () => {
    setHoverTime(null);
    setPreviewUrl(null);
    lastPreviewTimeRef.current = -1;
    if (previewSeekTimeoutRef.current) {
      clearTimeout(previewSeekTimeoutRef.current);
    }
  };

  // Keyboard controls
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;

    switch (e.key) {
      case " ":
        e.preventDefault();
        togglePlayback();
        break;
      case "ArrowLeft":
        e.preventDefault();
        triggerSkip("backward");
        break;
      case "ArrowRight":
        e.preventDefault();
        triggerSkip("forward");
        break;
      case "ArrowUp":
        e.preventDefault();
        handleVolumeChange(Math.min(1, video.volume + 0.1));
        break;
      case "ArrowDown":
        e.preventDefault();
        handleVolumeChange(Math.max(0, video.volume - 0.1));
        break;
      case "f":
      case "F":
        e.preventDefault();
        toggleFullscreen();
        break;
      case "m":
      case "M":
        e.preventDefault();
        toggleMute();
        break;
      default:
        break;
    }
  };

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  // Handle double click on video to seek left/right or toggle fullscreen center
  const handleDoubleClick = (e: React.MouseEvent<HTMLVideoElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const rect = video.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = clickX / rect.width;

    if (ratio < 0.4) {
      triggerSkip("backward");
    } else if (ratio > 0.6) {
      triggerSkip("forward");
    } else {
      toggleFullscreen();
    }
  };

  if (!src || error) {
    return (
      <div className={`flex h-full w-full items-center justify-center bg-black/90 text-primary ${className}`}>
        <div className="glass-panel max-w-md rounded-[2rem] border border-white/10 bg-[#0c0f16]/90 p-8 text-center shadow-2xl backdrop-blur-xl">
          <p className="text-xl font-bold text-red-600">Không thể phát phim</p>
          <p className="mt-3 text-sm text-gray-400 leading-relaxed">{error || "Tập phim này hiện chưa có liên kết HLS khả dụng."}</p>
          <button
            onClick={handleBackClick}
            className="mt-6 flex items-center justify-center gap-2 mx-auto px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-medium text-sm transition"
          >
            <ArrowLeft className="h-4 w-4" /> Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={wrapperRef}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className={`group relative h-full w-full overflow-hidden bg-black select-none outline-none focus-visible:ring-1 focus-visible:ring-red-600/30 ${className}`}
      style={{ cursor: showControls ? "default" : "none" }}
    >
      <style>{`
        @keyframes centerFlash {
          0% {
            transform: translate(-50%, -50%) scale(0.6);
            opacity: 0;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.1);
            opacity: 0.85;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.3);
            opacity: 0;
          }
        }
        .center-action-flash {
          animation: centerFlash 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes skipEntrance {
          0% {
            transform: scale(0.7);
            opacity: 0;
          }
          70% {
            transform: scale(1.18);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .skip-text-animate {
          animation: skipEntrance 0.22s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          transform-origin: center;
        }
      `}</style>

      {/* Main Video Element */}
      <video
        ref={videoRef}
        title={title}
        poster={poster}
        playsInline
        preload="metadata"
        className="h-full w-full bg-black object-contain cursor-pointer"
        onClick={togglePlayback}
        onDoubleClick={handleDoubleClick}
      />

      {/* Center Action (Play/Pause Flash Icon) */}
      {centerAction && (
        <div
          key={actionKey}
          className="center-action-flash pointer-events-none absolute left-1/2 top-1/2 grid h-24 w-24 place-items-center rounded-full bg-black/60 text-white shadow-2xl backdrop-blur-sm"
        >
          {centerAction === "play" ? (
            <Play className="h-10 w-10 fill-white translate-x-0.5" />
          ) : (
            <Pause className="h-10 w-10 fill-white" />
          )}
        </div>
      )}

      {/* YouTube-style Accumulative Double tap Seek Feedback */}
      {skipFeedback && skipFeedback.visible && (
        <div
          className={`absolute top-0 bottom-0 w-1/3 flex flex-col items-center justify-center pointer-events-none z-30 transition-opacity duration-300 ${
            skipFeedback.type === "forward" ? "right-0" : "left-0"
          }`}
        >
          <div
            key={`${skipFeedback.type}-${skipFeedback.amount}`}
            className="skip-text-animate text-white text-3xl md:text-4xl font-bold tracking-wide select-none drop-shadow-md"
          >
            {skipFeedback.type === "forward" ? `+ ${skipFeedback.amount} >` : `< - ${skipFeedback.amount}`}
          </div>
        </div>
      )}

      {/* Buffer/Waiting Loading Spinner */}
      {isBuffering && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-red-600 border-t-transparent shadow-md" />
        </div>
      )}

      {/* Top Header Bar Overlay */}
      <div
        className={`absolute top-0 inset-x-0 p-6 md:p-8 flex items-center gap-5 bg-gradient-to-b from-black/90 via-black/40 to-transparent transition-opacity duration-300 ${
          showControls ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <button
          type="button"
          onClick={handleBackClick}
          className="grid h-12 w-12 place-items-center rounded-full text-white/90 hover:text-white hover:scale-105 hover:bg-white/10 active:scale-95 transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
          aria-label="Quay lại"
        >
          <ArrowLeft className="h-6 w-6 stroke-[2.5]" />
        </button>

        <div className="flex flex-col">
          <h1 className="text-lg md:text-xl font-bold text-white tracking-wide truncate max-w-[70vw]">
            {mainTitle}
          </h1>
          {subTitle && (
            <span className="text-xs md:text-sm text-gray-400 font-medium mt-0.5 tracking-wider">
              {subTitle}
            </span>
          )}
        </div>
      </div>

      {/* Bottom Controls Overlay */}
      <div
        className={`absolute bottom-0 inset-x-0 p-6 md:p-8 flex flex-col gap-4 bg-gradient-to-t from-black/95 via-black/60 to-transparent transition-opacity duration-300 ${
          showControls ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Row 1: Interactive Netflix Style Timeline */}
        <div className="flex items-center gap-4 w-full">
          {/* Elapsed time text */}
          <span className="min-w-[3.5rem] text-xs md:text-sm font-semibold tabular-nums text-gray-300">
            {formatTime(currentTime)}
          </span>

          {/* Progress Timeline Track container */}
          <div
            ref={timelineRef}
            onMouseMove={handleTimelineMouseMove}
            onMouseLeave={handleTimelineMouseLeave}
            className="group/timeline relative flex-1 flex items-center h-5 cursor-pointer"
          >
            {/* Visual track wrapper */}
            <div className="w-full h-1 bg-white/20 rounded-full group-hover/timeline:h-1.5 transition-all duration-200 overflow-hidden relative">
              {/* Buffer progress bar */}
              <div
                className="absolute top-0 left-0 h-full bg-white/25 rounded-full transition-all duration-150"
                style={{ width: `${bufferedEnd}%` }}
              />
              {/* Active play progress bar */}
              <div
                className="absolute top-0 left-0 h-full bg-red-600 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Thumb Knob */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -ml-2 w-4 h-4 bg-red-600 border border-white rounded-full scale-0 group-hover/timeline:scale-100 transition-transform duration-150 shadow-[0_0_10px_rgba(229,9,20,0.8)]"
              style={{ left: `${progress}%` }}
            />

            {/* Hover Preview Tooltip with Thumbnail */}
            {hoverTime !== null && (
              <div
                className="absolute bottom-7 -translate-x-1/2 flex flex-col items-center gap-1.5 pointer-events-none z-50"
                style={{ left: `clamp(80px, ${hoverX}%, calc(100% - 80px))` }}
              >
                {/* Thumbnail preview */}
                {previewUrl && (
                  <div className="rounded-md overflow-hidden border border-white/20 shadow-2xl bg-black">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-[192px] h-[108px] object-cover"
                      draggable={false}
                    />
                  </div>
                )}
                {/* Time label */}
                <div className="bg-black/90 text-white text-xs font-semibold px-2.5 py-1.5 rounded border border-white/10 shadow-xl whitespace-nowrap">
                  {formatTime(hoverTime)}
                </div>
              </div>
            )}

            {/* Native Slider input layered on top */}
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={currentTime}
              onChange={(e) => seekTo(Number(e.target.value))}
              aria-label="Tua video"
              className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
            />
          </div>

          {/* Duration text */}
          <span className="min-w-[3.5rem] text-right text-xs md:text-sm font-semibold tabular-nums text-gray-300">
            {formatTime(duration)}
          </span>
        </div>

        {/* Row 2: Controls Panel */}
        <div className="flex items-center justify-between mt-1">
          {/* Left Controls */}
          <div className="flex items-center gap-6 md:gap-8">
            {/* Play / Pause */}
            <button
              type="button"
              onClick={togglePlayback}
              className="text-white hover:text-red-500 hover:scale-110 active:scale-95 transition duration-200 focus:outline-none"
              aria-label={isPlaying ? "Tạm dừng" : "Phát"}
            >
              {isPlaying ? (
                <Pause className="h-6 w-6 md:h-7 md:w-7 fill-current" />
              ) : (
                <Play className="h-6 w-6 md:h-7 md:w-7 fill-current translate-x-0.5" />
              )}
            </button>

            {/* Volume controller container with red speaker & custom visual track */}
            <div className="group/volume flex items-center gap-3">
              {/* Mute button (Red by default like the image) */}
              <button
                type="button"
                onClick={toggleMute}
                className="text-red-600 hover:scale-110 active:scale-95 transition duration-200 focus:outline-none"
                aria-label={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-5 w-5 md:h-6 md:w-6" />
                ) : (
                  <Volume2 className="h-5 w-5 md:h-6 md:w-6" />
                )}
              </button>

              {/* Slider wrapper - expands on hover */}
              <div className="relative h-5 w-0 opacity-0 group-hover/volume:w-20 md:group-hover/volume:w-24 group-hover/volume:opacity-100 transition-all duration-300 ease-out flex items-center">
                {/* Visual track */}
                <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden relative">
                  {/* Active volume portion (White) */}
                  <div
                    className="absolute top-0 left-0 h-full bg-white rounded-full"
                    style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                  />
                </div>
                {/* Visual thumb knob (Red, matches the image) */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-red-600 border border-red-500 rounded-full shadow-[0_0_4px_rgba(0,0,0,0.5)] transition-all"
                  style={{ left: `${(isMuted ? 0 : volume) * 100}%` }}
                />
                {/* Transparent input range layered on top */}
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  aria-label="Âm lượng"
                  className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                />
              </div>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-6 md:gap-8">
            {/* Playback Speed Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="flex items-center gap-1.5 text-xs md:text-sm font-bold tracking-wider text-white border border-white/25 rounded px-2.5 py-1 bg-white/5 hover:bg-white/15 hover:border-white/50 hover:scale-105 active:scale-95 transition duration-200 focus:outline-none"
                aria-label="Tốc độ phát"
              >
                <Settings className="h-4 w-4" />
                <span>{playbackRate === 1 ? "1.0x" : `${playbackRate}x`}</span>
              </button>

              {/* Speed Menu dropdown */}
              {showSpeedMenu && (
                <div className="absolute bottom-11 right-0 bg-black/90 border border-white/10 rounded-xl p-1.5 flex flex-col gap-0.5 w-28 backdrop-blur-md shadow-2xl z-50">
                  <div className="text-[10px] text-gray-500 font-bold px-2 py-1 uppercase tracking-wider text-center border-b border-white/10 mb-1">
                    Tốc độ
                  </div>
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => changeSpeed(rate)}
                      className={`text-xs text-left w-full px-2.5 py-1.5 rounded-md font-medium tracking-wide transition ${
                        playbackRate === rate
                          ? "bg-red-600 text-white"
                          : "text-gray-300 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {rate === 1 ? "Normal" : `${rate}x`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Toggle Fullscreen */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="text-white hover:text-red-500 hover:scale-110 active:scale-95 transition duration-200 focus:outline-none"
              aria-label={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
            >
              {isFullscreen ? (
                <Minimize className="h-5 w-5 md:h-6 md:w-6" />
              ) : (
                <Maximize className="h-5 w-5 md:h-6 md:w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
