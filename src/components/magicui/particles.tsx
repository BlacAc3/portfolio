import React, { useEffect, useRef } from "react";

interface ParticlesProps {
  className?: string;
  quantity?: number;
  staticity?: number;
  ease?: number;
  size?: number;
  /** Kept for API compatibility; the field re-seeds on resize and colour change. */
  refresh?: boolean;
  color?: string;
  vx?: number;
  vy?: number;
}

type Circle = {
  x: number;
  y: number;
  tx: number;
  ty: number;
  size: number;
  alpha: number;
  targetAlpha: number;
  dx: number;
  dy: number;
  magnetism: number;
};

/**
 * Pause every particle field while something opaque covers the viewport
 * (the About page's 3D drive). Counted, so overlapping callers compose.
 */
let pauses = 0;
const wakers = new Set<() => void>();
export const pauseParticles = () => {
  pauses++;
  return () => {
    pauses = Math.max(0, pauses - 1);
    if (!pauses) wakers.forEach((w) => w());
  };
};

const hexToRgb = (hex: string) => {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.substring(i, i + 2), 16)).join(", ");
};

/**
 * Drifting dots that lean toward the pointer. One rAF loop per field,
 * cancelled on unmount; pointer tracking lives in a ref (no re-renders);
 * the loop sleeps while the field is off screen, the tab is hidden, or a
 * caller has paused it, and draws one still frame under reduced motion.
 */
const Particles: React.FC<ParticlesProps> = ({
  className = "",
  quantity = 100,
  staticity = 50,
  ease = 50,
  size = 0.4,
  color = "#ffffff",
  vx = 0,
  vy = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const box = boxRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !box || !ctx) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const rgb = hexToRgb(color);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let left = 0;
    let top = 0;
    const mouse = { x: 0, y: 0 };
    let circles: Circle[] = [];

    const spawn = (): Circle => ({
      x: Math.random() * w,
      y: Math.random() * h,
      tx: 0,
      ty: 0,
      size: Math.floor(Math.random() * 2) + size,
      alpha: 0,
      targetAlpha: Math.round((Math.random() * 0.6 + 0.1) * 10) / 10,
      dx: (Math.random() - 0.5) * 0.1 + vx,
      dy: (Math.random() - 0.5) * 0.1 + vy,
      magnetism: 0.1 + Math.random() * 4,
    });

    const measure = () => {
      const r = box.getBoundingClientRect();
      left = r.left;
      top = r.top;
    };
    const resize = () => {
      w = box.offsetWidth;
      h = box.offsetHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      measure();
      circles = Array.from({ length: quantity }, spawn);
    };

    const draw = (step: boolean) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = `rgb(${rgb})`;
      for (let i = 0; i < circles.length; i++) {
        const c = circles[i];
        if (step) {
          const edge = Math.min(
            c.x + c.tx - c.size,
            w - c.x - c.tx - c.size,
            c.y + c.ty - c.size,
            h - c.y - c.ty - c.size,
          );
          const near = Math.max(0, edge / 20);
          if (near > 1) c.alpha = Math.min(c.targetAlpha, c.alpha + 0.02);
          else c.alpha = c.targetAlpha * near;
          c.x += c.dx;
          c.y += c.dy;
          c.tx += (mouse.x / (staticity / c.magnetism) - c.tx) / ease;
          c.ty += (mouse.y / (staticity / c.magnetism) - c.ty) / ease;
          if (
            c.x < -c.size ||
            c.x > w + c.size ||
            c.y < -c.size ||
            c.y > h + c.size
          ) {
            circles[i] = spawn();
            continue;
          }
        } else c.alpha = c.targetAlpha;
        ctx.globalAlpha = c.alpha;
        ctx.beginPath();
        ctx.arc(c.x + c.tx, c.y + c.ty, c.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    let raf = 0;
    let onScreen = true;
    const running = () => onScreen && !pauses && !document.hidden && !reduced;
    const frame = () => {
      raf = 0;
      if (!running()) return;
      draw(true);
      raf = requestAnimationFrame(frame);
    };
    const wake = () => {
      if (!raf && running()) raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      const x = e.clientX - left;
      const y = e.clientY - top;
      if (x > 0 && x < w && y > 0 && y < h) {
        mouse.x = x;
        mouse.y = y;
      }
    };
    const onResize = () => {
      resize();
      if (reduced) draw(false);
    };

    resize();
    if (reduced) draw(false);
    else wake();

    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      if (onScreen) {
        measure();
        wake();
      }
    });
    io.observe(box);
    const ro = new ResizeObserver(onResize);
    ro.observe(box);
    wakers.add(wake);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", measure, { passive: true });
    document.addEventListener("visibilitychange", wake);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      wakers.delete(wake);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", measure);
      document.removeEventListener("visibilitychange", wake);
    };
  }, [color, quantity, staticity, ease, size, vx, vy]);

  return (
    <div className={className} ref={boxRef} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default Particles;
