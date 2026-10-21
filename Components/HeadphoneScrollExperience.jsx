// 3d component added

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  Sparkles,
  ArrowDown
} from 'lucide-react';

const TOTAL_FRAMES = 176;

const HeadphoneScrollExperience = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const [loadedCount, setLoadedCount] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(1);
  const [progressPercent, setProgressPercent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  const targetProgressRef = useRef(0);
  const smoothProgressRef = useRef(0);
  const lastDrawnFrameRef = useRef(1);
  const animationFrameIdRef = useRef(null);
  const autoPlayTimerRef = useRef(null);

  // Helper to get image path for given frame number (1-176)
  const getFramePath = useCallback((index) => {
    const padded = String(index).padStart(3, '0');
    return `/headphonevideo_frames/frame_${padded}.png`;
  }, []);

  // Preload all frames immediately
  useEffect(() => {
    const images = new Array(TOTAL_FRAMES);
    imagesRef.current = images;
    let mounted = true;
    let loaded = 0;

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFramePath(i);
      img.onload = () => {
        if (!mounted) return;
        loaded++;
        setLoadedCount(loaded);
        if (i === 1) {
          drawFrameToCanvas(img);
        }
      };
      images[i - 1] = img;
    }

    return () => {
      mounted = false;
    };
  }, [getFramePath]);

  // Draw image on canvas maintaining clean aspect-fit resolution
  const drawFrameToCanvas = useCallback((img) => {
    const canvas = canvasRef.current;
    if (!canvas || !img || !img.complete || img.naturalWidth === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set internal resolution matching source frames (1280x720)
    if (canvas.width !== 1280) canvas.width = 1280;
    if (canvas.height !== 720) canvas.height = 720;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.fillStyle = '#050811';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }, []);

  // Find the closest loaded frame to avoid black or blank frames
  const getClosestLoadedFrame = useCallback((targetIndex) => {
    const images = imagesRef.current;
    if (images[targetIndex - 1]?.complete && images[targetIndex - 1]?.naturalWidth > 0) {
      return images[targetIndex - 1];
    }
    // Search outward: 1 frame back, 1 frame forward, etc.
    for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
      const prev = targetIndex - 1 - offset;
      if (prev >= 0 && images[prev]?.complete && images[prev]?.naturalWidth > 0) {
        return images[prev];
      }
      const next = targetIndex - 1 + offset;
      if (next < TOTAL_FRAMES && images[next]?.complete && images[next]?.naturalWidth > 0) {
        return images[next];
      }
    }
    return images[0] || null;
  }, []);

  // Update canvas with target frame
  const renderFrameIndex = useCallback((frameIndex) => {
    const safeIndex = Math.max(1, Math.min(TOTAL_FRAMES, frameIndex));
    const img = getClosestLoadedFrame(safeIndex);
    if (img) {
      drawFrameToCanvas(img);
      lastDrawnFrameRef.current = safeIndex;
      setCurrentFrame(safeIndex);
    }
  }, [drawFrameToCanvas, getClosestLoadedFrame]);

  // Smooth animation loop for scroll interpolation
  useEffect(() => {
    let isRunning = true;

    const tick = () => {
      if (!isRunning) return;

      // Responsive adaptive lerping
      const diff = targetProgressRef.current - smoothProgressRef.current;
      const lerpFactor = Math.abs(diff) > 0.05 ? 0.35 : 0.22;
      
      if (Math.abs(diff) > 0.0005) {
        smoothProgressRef.current += diff * lerpFactor;
      } else {
        smoothProgressRef.current = targetProgressRef.current;
      }

      const progress = Math.max(0, Math.min(1, smoothProgressRef.current));
      setProgressPercent(Math.round(progress * 100));

      const targetFrame = Math.floor(progress * (TOTAL_FRAMES - 1)) + 1;
      if (targetFrame !== lastDrawnFrameRef.current) {
        renderFrameIndex(targetFrame);
      }

      animationFrameIdRef.current = requestAnimationFrame(tick);
    };

    animationFrameIdRef.current = requestAnimationFrame(tick);

    return () => {
      isRunning = false;
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [renderFrameIndex]);

  // Handle scroll calculation with generous runway and deliberate hold buffer
  useEffect(() => {
    const handleScroll = () => {
      if (isPlaying) return;
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const scrollableHeight = rect.height - window.innerHeight;

      if (scrollableHeight <= 0) return;

      // When the top of container reaches 0, progress starts from 0 to 1
      const rawProgress = -rect.top / scrollableHeight;
      const progress = Math.max(0, Math.min(1, rawProgress));

      // Buffer zones:
      // 0.00 - 0.04: gentle entrance buffer (hold Frame 1)
      // 0.04 - 0.85: active scrub through all 176 frames (comfortable, deliberate pacing)
      // 0.85 - 1.00: hold completed finale (Frame 176) so user fully experiences the finish before leaving
      let animProgress = 0;
      if (progress <= 0.04) {
        animProgress = 0;
      } else if (progress >= 0.85) {
        animProgress = 1;
      } else {
        animProgress = (progress - 0.04) / (0.85 - 0.04);
      }

      targetProgressRef.current = animProgress;

      if (progress > 0.02 && !hasScrolled) {
        setHasScrolled(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isPlaying, hasScrolled]);

  // Auto-play / continuous 360 spin preview
  useEffect(() => {
    if (!isPlaying) {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
      return;
    }

    autoPlayTimerRef.current = setInterval(() => {
      let nextProgress = targetProgressRef.current + 0.006;
      if (nextProgress > 1) {
        nextProgress = 0;
      }
      targetProgressRef.current = nextProgress;
    }, 28);

    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [isPlaying]);

  // Handle clicking on the interactive scrub bar
  const handleScrubberClick = (e) => {
    setIsPlaying(false);
    const rect = e.currentTarget.getBoundingClientRect();
    const clickRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    
    targetProgressRef.current = clickRatio;

    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const containerTop = containerRect.top + scrollTop;
    const scrollableDistance = containerRect.height - window.innerHeight;

    const overallProgress = 0.04 + clickRatio * (0.85 - 0.04);
    const targetScrollY = containerTop + (overallProgress * scrollableDistance);

    window.scrollTo({
      top: targetScrollY,
      behavior: 'smooth'
    });
  };

  return (
    <section 
      ref={containerRef} 
      className="relative w-full h-[520vh] bg-[#050811] text-white selection:bg-cyan-500 selection:text-black"
    >
      {/* Top subtle fade gradient seamlessly connecting to preceding sections */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#030712] via-[#050811]/90 to-transparent pointer-events-none z-20" />

      {/* Sticky Viewport Stage */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        
        {/* Soft Ambient Cinematic Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.07),rgba(99,102,241,0.03),transparent_70%)] rounded-full blur-[90px] pointer-events-none" />

        {/* REFINED FLOATING HEADER: Pure Modern Typography, Zero Bulky Boxes */}
        <div className="absolute top-8 sm:top-10 left-0 right-0 z-20 text-center max-w-xl mx-auto px-4 pointer-events-none select-none">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold tracking-[0.25em] uppercase mb-1">
            <Sparkles size={11} className="text-cyan-400" />
            <span>Acoustic Architecture</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight drop-shadow-md">
            Sound in Motion
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 max-w-sm mx-auto font-medium">
            Scroll to dismantle and explore handcrafted acoustic mastery.
          </p>
        </div>

        {/* CENTER STAGE: Canvas Centered Elegantly */}
        <div className="relative w-full h-full flex items-center justify-center p-4">
          <canvas
            ref={canvasRef}
            className="w-auto h-auto max-w-[88vw] max-h-[70vh] object-contain drop-shadow-[0_25px_60px_rgba(0,0,0,0.95)] filter brightness-[1.03]"
          />
        </div>

        {/* BOTTOM HUD: Sleek, Floating Glassmorphic Capsule */}
        <div className="absolute bottom-8 sm:bottom-10 left-0 right-0 z-20 flex flex-col items-center px-4 space-y-2 pointer-events-auto">
          {/* Subtle scroll hint beacon */}
          {!hasScrolled && !isPlaying && (
            <div className="flex items-center justify-center gap-2 text-[10px] font-bold tracking-widest text-slate-400 animate-bounce pb-0.5 uppercase pointer-events-none">
              <ArrowDown className="w-3 h-3 text-cyan-400" />
              <span>Scroll to dismantle acoustic layers</span>
              <ArrowDown className="w-3 h-3 text-cyan-400" />
            </div>
          )}

          {/* Minimalist Glassmorphic Control Capsule */}
          <div className="flex items-center gap-3.5 bg-black/60 border border-white/10 rounded-full px-4 sm:px-5 py-2 backdrop-blur-xl shadow-2xl max-w-md w-full">
            {/* Play/Pause Auto-Spin */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-1.5 sm:p-2 rounded-full transition-all duration-300 flex items-center justify-center flex-shrink-0 ${
                isPlaying 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/20' 
                  : 'bg-white/10 text-slate-300 hover:text-white hover:bg-white/15'
              }`}
              title={isPlaying ? "Pause 360°" : "Auto 360° preview"}
            >
              {isPlaying ? <Pause size={13} /> : <Play size={13} />}
            </button>

            {/* Frame Percentage */}
            <span className="text-[11px] sm:text-xs font-mono font-bold text-cyan-400 w-9 text-right select-none flex-shrink-0">
              {progressPercent}%
            </span>

            {/* Interactive Scrubber Track */}
            <div 
              className="relative flex-1 h-2 bg-white/15 rounded-full cursor-pointer overflow-hidden group hover:h-2.5 transition-all"
              onClick={handleScrubberClick}
              title="Click to jump to any frame"
            >
              <div 
                className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 rounded-full transition-all duration-75"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Minimalist Frame Counter */}
            <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-mono text-slate-400 select-none flex-shrink-0">
              <span className="text-slate-200 font-semibold">{String(currentFrame).padStart(3, '0')}</span>
              <span>/</span>
              <span>{TOTAL_FRAMES}</span>
            </div>

            {/* Preload buffer indicator dot */}
            <div className="hidden sm:flex items-center gap-1 pl-1.5 border-l border-white/10 text-[9px] text-slate-400 flex-shrink-0">
              <span className={`w-1.5 h-1.5 rounded-full ${loadedCount === TOTAL_FRAMES ? 'bg-emerald-400' : 'bg-cyan-400 animate-pulse'}`} />
              <span>{Math.round((loadedCount / TOTAL_FRAMES) * 100)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient seamlessly blending into Footer's dark border */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-black/90 to-transparent pointer-events-none z-20" />
    </section>
  );
};

export default HeadphoneScrollExperience;
