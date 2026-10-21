
import React, { useCallback, useEffect, useRef } from "react";

const TOTAL_FRAMES = 176;
const SCROLL_HEIGHT = "280vh";

const HeadphoneScrollExperience = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const rafRef = useRef(null);

  const targetProgressRef = useRef(0);
  const smoothProgressRef = useRef(0);
  const lastFrameRef = useRef(-1);
  const lastScrollYRef = useRef(0);

  const getFramePath = useCallback((index) => {
    return `/headphonevideo_frames/frame_${String(index).padStart(3, "0")}.png`;
  }, []);

  // Draw a frame while preserving its original aspect ratio.
  const drawFrame = useCallback((index) => {
    const canvas = canvasRef.current;
    const image = imagesRef.current[index - 1];

    if (!canvas || !image?.complete || !image.naturalWidth) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    if (canvas.width !== 1280 || canvas.height !== 720) {
      canvas.width = 1280;
      canvas.height = 720;
    }

    ctx.fillStyle = "#0B0F17";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const scale = Math.min(
      canvas.width / image.naturalWidth,
      canvas.height / image.naturalHeight
    );

    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    const x = (canvas.width - width) / 2;
    const y = (canvas.height - height) / 2;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(image, x, y, width, height);

    lastFrameRef.current = index;
  }, []);

  // Find the closest frame that has finished loading.
  const findLoadedFrame = useCallback((targetIndex) => {
    const images = imagesRef.current;

    if (
      images[targetIndex - 1]?.complete &&
      images[targetIndex - 1]?.naturalWidth
    ) {
      return targetIndex;
    }

    for (let distance = 1; distance < TOTAL_FRAMES; distance++) {
      const previous = targetIndex - 1 - distance;
      const next = targetIndex - 1 + distance;

      if (
        previous >= 0 &&
        images[previous]?.complete &&
        images[previous]?.naturalWidth
      ) {
        return previous + 1;
      }

      if (
        next < TOTAL_FRAMES &&
        images[next]?.complete &&
        images[next]?.naturalWidth
      ) {
        return next + 1;
      }
    }

    return -1;
  }, []);

  // Preload frames and show the first one as soon as it is available.
  useEffect(() => {
    let cancelled = false;
    const images = new Array(TOTAL_FRAMES);
    imagesRef.current = images;

    for (let index = 1; index <= TOTAL_FRAMES; index++) {
      const image = new Image();
      images[index - 1] = image;

      image.onload = () => {
        if (cancelled) return;

        if (index === 1 && lastFrameRef.current === -1) {
          drawFrame(1);
        }
      };

      image.src = getFramePath(index);
    }

    return () => {
      cancelled = true;
    };
  }, [drawFrame, getFramePath]);

  // Read scroll position without doing heavy work inside the scroll event.
  useEffect(() => {
    const updateTargetProgress = () => {
      const section = containerRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const scrollableDistance = section.offsetHeight - window.innerHeight;

      if (scrollableDistance <= 0) return;

      const rawProgress = -rect.top / scrollableDistance;
      targetProgressRef.current = Math.max(0, Math.min(1, rawProgress));

      lastScrollYRef.current = window.scrollY;
    };

    let scrollRequest = null;

    const onScroll = () => {
      if (scrollRequest !== null) return;

      scrollRequest = requestAnimationFrame(() => {
        updateTargetProgress();
        scrollRequest = null;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    updateTargetProgress();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);

      if (scrollRequest !== null) {
        cancelAnimationFrame(scrollRequest);
      }
    };
  }, []);

  // Smoothly interpolate scroll progress to reduce visual stepping.
  useEffect(() => {
    let running = true;

    const animate = () => {
      if (!running) return;

      const target = targetProgressRef.current;
      const current = smoothProgressRef.current;
      const difference = target - current;

      // Faster response for large scrolls, finer easing for small changes.
      const easing = Math.abs(difference) > 0.12 ? 0.16 : 0.085;

      if (Math.abs(difference) < 0.00015) {
        smoothProgressRef.current = target;
      } else {
        smoothProgressRef.current = current + difference * easing;
      }

      const progress = Math.max(
        0,
        Math.min(1, smoothProgressRef.current)
      );

      const frame = Math.round(progress * (TOTAL_FRAMES - 1)) + 1;

      if (frame !== lastFrameRef.current) {
        const availableFrame = findLoadedFrame(frame);

        if (availableFrame !== -1) {
          drawFrame(availableFrame);
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      running = false;

      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [drawFrame, findLoadedFrame]);

  return (
    <section
      ref={containerRef}
      className="relative w-full bg-[#0B0F17]"
      style={{ height: SCROLL_HEIGHT }}
      aria-label="Headphone product animation"
    >
      <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden bg-[#0B0F17]">
        {/* Soft blue lighting blends with the existing dark website. */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[min(80vw,850px)] w-[min(80vw,850px)] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(59,130,246,0.10) 0%, rgba(59,130,246,0.035) 38%, transparent 70%)",
            filter: "blur(24px)",
          }}
        />

        {/* Subtle ambient light behind the product. */}
        <div
          className="pointer-events-none absolute left-1/2 top-[52%] h-[38vh] w-[70vw] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(ellipse, rgba(148,163,184,0.045), transparent 70%)",
            filter: "blur(30px)",
          }}
        />

        {/* Scroll-controlled headphone animation. */}
        <div className="relative z-10 flex h-full w-full items-center justify-center px-2 sm:px-6">
          <canvas
            ref={canvasRef}
            width={1280}
            height={720}
            className="block h-auto max-h-[84vh] w-auto max-w-[98vw] object-contain sm:max-w-[92vw]"
            style={{
              background: "transparent",
              filter: "drop-shadow(0 26px 48px rgba(0,0,0,0.25))",
              willChange: "contents",
            }}
          />
        </div>

        {/* Seamless edges to avoid a visibly separate section. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#0B0F17] to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0B0F17] to-transparent" />
      </div>
    </section>
  );
};

export default HeadphoneScrollExperience;
