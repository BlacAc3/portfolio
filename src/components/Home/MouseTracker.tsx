import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useMediaQuery, usePrefersReducedMotion } from "../../hooks/useMediaQuery";

type Tone = "dark" | "light";

/** Cursor colours per background tone: gold on dark, ink on light/gold. */
const TONES = {
  dark: {
    dot: "rgb(212,167,106)",
    border: "rgba(212,167,106,0.6)",
    fill: "rgba(212,167,106,0.25)",
    fillHover: "rgba(212,167,106,0.12)",
  },
  light: {
    dot: "rgb(10,10,10)",
    border: "rgba(10,10,10,0.6)",
    fill: "rgba(10,10,10,0.14)",
    fillHover: "rgba(10,10,10,0.07)",
  },
} as const;

const channel = (v: number) => {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

/**
 * Tone of what's actually painted under a point. Walks the full hit-test
 * stack (topmost first), not just the top element's ancestors, so transparent
 * overlays — the jump veil, fixed chrome, the 3D stage wrapper — don't mask
 * the surface beneath. The first element with a mostly opaque background (or
 * an explicit `data-cursor="light|dark"` hint) decides. Gold (#d4a76a,
 * L≈0.43) counts as light, since the gold cursor would vanish on it.
 */
function toneAt(x: number, y: number): Tone {
  for (const el of document.elementsFromPoint(x, y)) {
    if (el === document.documentElement) break;
    const hint = (el as HTMLElement).dataset?.cursor;
    if (hint === "light" || hint === "dark") return hint;
    const style = getComputedStyle(el);
    if (+style.opacity < 0.5) continue;
    const m = style.backgroundColor.match(/[\d.]+/g);
    if (m) {
      const [r, g, b, a = "1"] = m;
      if (+a >= 0.5) {
        const L = 0.2126 * channel(+r) + 0.7152 * channel(+g) + 0.0722 * channel(+b);
        return L > 0.2 ? "light" : "dark";
      }
    }
  }
  return "dark";
}

/**
 * Custom cursor (fine pointers only). Uses motion values so pointer movement
 * never triggers React re-renders. The native cursor is only hidden while this
 * component is active (see `.has-custom-cursor` in index.css). It flips to an
 * ink variant over light or gold surfaces so it always reads.
 */
const MouseTracker = () => {
  const finePointer = useMediaQuery("(hover: hover) and (pointer: fine)", false);
  const reduced = usePrefersReducedMotion();
  const enabled = finePointer && !reduced;

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { damping: 25, stiffness: 400, mass: 0.4 });
  const ringY = useSpring(y, { damping: 25, stiffness: 400, mass: 0.4 });
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);
  const [tone, setTone] = useState<Tone>("dark");
  const layer = useRef<HTMLDivElement>(null);

  // Modal dialogs live in the browser's top layer, above any z-index. Keep
  // the cursor there too, and re-raise it whenever a dialog opens so it
  // paints above that dialog.
  useEffect(() => {
    const el = layer.current;
    if (!enabled || !el || typeof el.showPopover !== "function") return;
    const raise = () => {
      if (el.matches(":popover-open")) el.hidePopover();
      el.showPopover();
    };
    raise();
    const mo = new MutationObserver((records) => {
      if (records.some((r) => (r.target as Element).matches("dialog[open]"))) raise();
    });
    mo.observe(document.body, { subtree: true, attributes: true, attributeFilter: ["open"] });
    const onToggle = (e: Event) => {
      if (e.target !== el && (e as ToggleEvent).newState === "open") raise();
    };
    document.addEventListener("toggle", onToggle, true);
    return () => {
      mo.disconnect();
      document.removeEventListener("toggle", onToggle, true);
      if (el.matches(":popover-open")) el.hidePopover();
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    const root = document.documentElement;
    root.classList.add("has-custom-cursor");

    // Sample the background on move and on scroll (content slides under a
    // resting pointer), but at most every 120 ms: each sample reads computed
    // styles, which forces a style recalc mid-scroll.
    let px = -1;
    let py = -1;
    let raf = 0;
    let last = 0;
    const sample = (now: number) => {
      raf = 0;
      if (px < 0) return;
      if (now - last < 120) {
        raf = requestAnimationFrame(sample);
        return;
      }
      last = now;
      setTone(toneAt(px, py));
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(sample);
    };

    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      px = e.clientX;
      py = e.clientY;
      setVisible(true);
      const target = e.target as Element | null;
      setHovering(!!target?.closest("a, button, [role='button'], input, textarea, select, label"));
      queue();
    };
    const leave = () => setVisible(false);

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("scroll", queue, { passive: true });
    document.addEventListener("pointerleave", leave);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      root.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("scroll", queue);
      document.removeEventListener("pointerleave", leave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;
  const c = TONES[tone];

  return (
    <div
      ref={layer}
      popover="manual"
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 m-0 h-full w-full overflow-visible border-0 bg-transparent p-0"
    >
      <motion.div
        aria-hidden="true"
        className="fixed top-0 left-0 z-[9999] pointer-events-none rounded-full -translate-x-1/2 -translate-y-1/2 border"
        style={{ x: ringX, y: ringY }}
        initial={false}
        animate={{
          width: hovering ? 56 : 32,
          height: hovering ? 56 : 32,
          borderColor: c.border,
          backgroundColor: hovering ? c.fillHover : c.fill,
          opacity: visible ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
      />
      <motion.div
        aria-hidden="true"
        className="fixed top-0 left-0 z-[9999] pointer-events-none w-2 h-2 rounded-full -translate-x-1/2 -translate-y-1/2"
        style={{ x, y, opacity: visible ? 1 : 0 }}
        initial={false}
        animate={{ backgroundColor: c.dot }}
        transition={{ duration: 0.2 }}
      />
    </div>
  );
};

export default MouseTracker;
