import {
  Suspense,
  lazy,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import BentoPageContent from "./BentoPageContent";
import { bentoCells, type BentoCell } from "./bentoData";
import {
  buildTrack,
  easeInOutCubic,
  easeOutQuart,
  frameAt,
  readStart,
  type Frame,
  type Track,
} from "./choreography";
import type { BentoSceneHandle, Quad, SceneInput } from "./BentoBoxScene";
import { coverTitleBox, coverURL, coversReady, isPortraitView, setCoverTitle } from "./covers";
import { jumpTo } from "../../lib/jump";
import Particles from "../magicui/particles";
import { hasWebGL, usePrefersReducedMotion } from "../../hooks/useMediaQuery";
import { usePalette } from "../../contexts/ThemeContext";

const BentoBoxCanvas = lazy(() => import("./BentoBoxScene"));

interface BentoShowcaseProps {
  experience?: string;
  onExpandImage: () => void;
  /** Hero copy laid over the first screen, above the closed box. */
  hero?: ReactNode;
}

/**
 * Cover → page beats, as fractions of the morph. The gap between them is the
 * blank: just the card's page colour, softly veiled, before content arrives.
 */
const COVER_OUT = [0.38, 0.62] as const;
const PAGE_IN = [0.72, 0.98] as const;

/**
 * Page layer background — the same token the page content paints, so as the
 * cover dissolves it fades into the page's own colour in either theme
 * (a fixed dark fill turned light-mode frames muddy grey mid-morph).
 */
const pageFill: Record<BentoCell["theme"], string> = {
  glass: "var(--color-surface)",
  dark: "var(--color-canvas)",
  accent: "var(--color-accent)",
  photo: "var(--color-raised)",
};

/**
 * Headline colour on the 3D face. The faces stay dark (gold for "accent") in
 * both themes, so the cover title is chosen for the face, not the page —
 * light-mode ink on a dark face was unreadable. The flyer then blends from
 * this to the page headline's real colour as it lands.
 */
const faceInk: Record<BentoCell["theme"], [number, number, number]> = {
  glass: [244, 237, 227],
  dark: [244, 237, 227],
  accent: [26, 22, 18],
  photo: [244, 237, 227],
};

const parseRGB = (c: string): [number, number, number] => {
  const m = c.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0];
  return [m[0] ?? 0, m[1] ?? 0, m[2] ?? 0];
};
/**
 * CSS matrix3d that maps a w×h box onto an arbitrary quad (TL TR BR BL):
 * the projective "square → quad" transform (Heckbert), scaled to w×h.
 * Lets a flat image sit exactly on the 3D face, perspective and all.
 */
function quadMatrix(w: number, h: number, q: number[][]) {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = q;
  const dx1 = x1 - x2;
  const dx2 = x3 - x2;
  const dx3 = x0 - x1 + x2 - x3;
  const dy1 = y1 - y2;
  const dy2 = y3 - y2;
  const dy3 = y0 - y1 + y2 - y3;
  const den = dx1 * dy2 - dx2 * dy1 || 1e-9;
  const g = (dx3 * dy2 - dx2 * dy3) / den;
  const k = (dx1 * dy3 - dx3 * dy1) / den;
  const a = x1 - x0 + g * x1;
  const b = x3 - x0 + k * x3;
  const d = y1 - y0 + g * y1;
  const e = y3 - y0 + k * y3;
  const m = [a / w, d / w, 0, g / w, b / h, e / h, 0, k / h, 0, 0, 1, 0, x0, y0, 0, 1];
  return `matrix3d(${m.map((n) => +n.toPrecision(8)).join(",")})`;
}

/** A point of the unit square (u, v) through the same homography. */
function projectUV(q: number[][], u: number, v: number): [number, number] {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = q;
  const dx1 = x1 - x2;
  const dx2 = x3 - x2;
  const dx3 = x0 - x1 + x2 - x3;
  const dy1 = y1 - y2;
  const dy2 = y3 - y2;
  const dy3 = y0 - y1 + y2 - y3;
  const den = dx1 * dy2 - dx2 * dy1 || 1e-9;
  const g = (dx3 * dy2 - dx2 * dy3) / den;
  const k = (dx1 * dy3 - dx3 * dy1) / den;
  const w = g * u + k * v + 1;
  return [
    ((x1 - x0 + g * x1) * u + (x3 - x0 + k * x3) * v + x0) / w,
    ((y1 - y0 + g * y1) * u + (y3 - y0 + k * y3) * v + y0) / w,
  ];
}

/** Layout offset of `el` inside `stop` — transforms ignored. */
function offsetWithin(el: HTMLElement, stop: HTMLElement) {
  let x = 0;
  let y = 0;
  let n: HTMLElement | null = el;
  while (n && n !== stop) {
    x += n.offsetLeft;
    y += n.offsetTop;
    n = n.offsetParent as HTMLElement | null;
  }
  return { x, y };
}

/** The rendered line breaks of a text block, as strings. */
function measureLines(el: HTMLElement): string[] {
  const text = el.firstChild;
  if (!(text instanceof Text)) return [el.textContent ?? ""];
  const src = text.data;
  const range = document.createRange();
  const lines: string[][] = [];
  let lastTop = -Infinity;
  let tol = 0;
  for (const match of src.matchAll(/\S+/g)) {
    range.setStart(text, match.index);
    range.setEnd(text, match.index + match[0].length);
    const r = range.getClientRects()[0];
    if (!r) continue;
    if (!tol) tol = r.height * 0.5;
    if (r.top > lastTop + tol) {
      lines.push([]);
      lastTop = r.top;
    }
    lines[lines.length - 1].push(match[0]);
  }
  return lines.map((l) => l.join(" "));
}

/**
 * A clip-path `path()` for a quad with rounded corners: each corner is cut
 * back `r` px along both edges and joined with a circular-ish cubic, so
 * the rounding follows the quad's perspective like the 3D face's does.
 */
function roundedQuadPath(q: number[][], r: number) {
  const K = 0.5523; // cubic ≈ quarter circle
  const f = (n: number) => n.toFixed(1);
  let d = "";
  for (let k = 0; k < 4; k++) {
    const c = q[k];
    const p = q[(k + 3) % 4];
    const n = q[(k + 1) % 4];
    const lp = Math.hypot(p[0] - c[0], p[1] - c[1]) || 1;
    const ln = Math.hypot(n[0] - c[0], n[1] - c[1]) || 1;
    const rk = Math.min(r, lp / 2, ln / 2);
    const a = [c[0] + ((p[0] - c[0]) / lp) * rk, c[1] + ((p[1] - c[1]) / lp) * rk];
    const b = [c[0] + ((n[0] - c[0]) / ln) * rk, c[1] + ((n[1] - c[1]) / ln) * rk];
    d += `${k ? "L" : "M"}${f(a[0])} ${f(a[1])}`;
    d += `C${f(a[0] + (c[0] - a[0]) * K)} ${f(a[1] + (c[1] - a[1]) * K)} ${f(b[0] + (c[0] - b[0]) * K)} ${f(b[1] + (c[1] - b[1]) * K)} ${f(b[0])} ${f(b[1])}`;
  }
  return `path("${d}Z")`;
}

/** Quick-jump chapters: the intro, each compartment, and the finale. */
const CHAPTERS = [
  { key: "intro", label: "Intro" },
  ...bentoCells.map((c) => ({ key: c.id, label: c.eyebrow })),
  { key: "finale", label: "Finale" },
];

const pad = (n: number) => String(n).padStart(2, "0");
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const seg = (v: number, a: number, b: number) => clamp01((v - a) / (b - a));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ------------------------------------------------------------------ */
/* Static fallback — reduced motion or no WebGL.                       */
/* ------------------------------------------------------------------ */
function StaticShowcase({ experience, onExpandImage, hero }: BentoShowcaseProps) {
  return (
    <>
    {hero}
    <section
      id="synergy"
      aria-labelledby="synergy-title"
      className="relative z-10 w-full px-4 py-20 md:px-6 lg:py-28"
    >
      <div className="mx-auto mb-12 max-w-6xl">
        <p className="font-tech text-[0.65rem] uppercase tracking-[0.5em] text-accent/80">
          Unboxing
        </p>
        <h2
          id="synergy-title"
          className="mt-5 font-display text-[clamp(2.6rem,10vw,6rem)] font-semibold leading-[0.92] tracking-tight text-ink"
        >
          The synergy
        </h2>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-ink/60">
          Design &amp; engineering, boxed into one system.
        </p>
      </div>
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        {bentoCells.map((cell, i) => (
          <div
            key={cell.id}
            className="overflow-hidden rounded-3xl border border-ink/10"
          >
            <BentoPageContent
              cell={cell}
              index={i}
              total={bentoCells.length}
              experience={experience}
              onExpandImage={onExpandImage}
            />
          </div>
        ))}
      </div>
    </section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Stage                                                               */
/*                                                                     */
/* One render loop per animation frame, strictly in this order:        */
/*   1. read scroll → pure Frame (no smoothing; Lenis already smooths) */
/*   2. pose + render the 3D, get the active face's projected corners  */
/*   3. clip the DOM page to those corners, morphing to the viewport   */
/* Because 2 and 3 share one Frame, the page is glued to the box.      */
/* ------------------------------------------------------------------ */
export default function BentoShowcase({
  experience,
  onExpandImage,
  hero,
}: BentoShowcaseProps) {
  const reduced = usePrefersReducedMotion();
  const [webgl] = useState(hasWebGL);
  const enabled = webgl && !reduced;
  const palette = usePalette();

  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const sceneApi = useRef<BentoSceneHandle | null>(null);

  useLayoutEffect(() => {
    if (!enabled) return;
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;
    gsap.registerPlugin(ScrollTrigger);

    const q = <T extends HTMLElement>(sel: string) =>
      Array.from(stage.querySelectorAll<T>(sel));
    const pages = q<HTMLDivElement>("[data-page]");
    const screens = q<HTMLDivElement>("[data-screen]");
    const scrollers = q<HTMLDivElement>("[data-scroller]");
    const contents = q<HTMLDivElement>("[data-content]");
    // Title covers: the page headline, and the copy of it that flies from
    // the face to the headline's place while the page opens.
    const titleEls = pages.map((p) => p.querySelector<HTMLElement>("[data-title]"));
    const flyers = pages.map((p) => p.querySelector<HTMLElement>("[data-flyer]"));
    const flyBox: ({ x: number; y: number; w: number; h: number } | null)[] = pages.map(() => null);
    // Flyer colour: from the face's ink to the page headline's (per theme).
    const flyInk: { from: [number, number, number]; to: [number, number, number] }[] = pages.map(
      () => ({ from: [244, 237, 227], to: [244, 237, 227] }),
    );
    const intro = stage.querySelector<HTMLElement>("[data-intro]");
    const cue = stage.querySelector<HTMLElement>("[data-cue]");
    const chrome = stage.querySelector<HTMLElement>("[data-chrome]");
    const caption = stage.querySelector<HTMLElement>("[data-caption]");
    const captionEyebrow = stage.querySelector<HTMLElement>("[data-caption-eyebrow]");
    const captionTitle = stage.querySelector<HTMLElement>("[data-caption-title]");
    const outro = stage.querySelector<HTMLElement>("[data-outro]");
    const heroEl = stage.querySelector<HTMLElement>("[data-hero]");
    const heroL = stage.querySelector<HTMLElement>("[data-hero-l]");
    const heroR = stage.querySelector<HTMLElement>("[data-hero-r]");
    const heroBg = stage.querySelector<HTMLElement>("[data-hero-bg]");
    const heroStars = stage.querySelector<HTMLElement>("[data-hero-stars]");
    const peekEl = stage.querySelector<HTMLButtonElement>("[data-peek]");
    const heroSlot = stage.querySelector<HTMLElement>("[data-hero-box]");
    const covers = q<HTMLImageElement>("[data-cover]");
    const canvasWrap = stage.querySelector<HTMLElement>("[data-canvas]");
    const jumpBtns = q<HTMLButtonElement>("[data-jump]");
    const stepBtns = q<HTMLButtonElement>("[data-jump-step]");
    const jumpLabel = stage.querySelector<HTMLElement>("[data-jump-label]");
    const jumpNum = stage.querySelector<HTMLElement>("[data-jump-num]");
    let chapter = -1;

    /* Quick jumps: chapter → scroll offset on the current track. */
    const chapterY = (c: number) => {
      const top = section.getBoundingClientRect().top + window.scrollY;
      if (c <= 0) return 0;
      if (c <= bentoCells.length) return top + readStart(track, c - 1) + 2;
      const end = track.total - track.viewport * 0.15;
      return top + track.outroStart + (end - track.outroStart) * 0.6;
    };
    const onJump = (e: Event) => {
      const c = Number((e.currentTarget as HTMLElement).dataset.jump);
      jumpTo(chapterY(c));
    };
    const onStep = (e: Event) => {
      const d = Number((e.currentTarget as HTMLElement).dataset.jumpStep);
      const c = Math.min(CHAPTERS.length - 1, Math.max(0, chapter + d));
      if (c !== chapter) jumpTo(chapterY(c));
    };
    jumpBtns.forEach((b) => b.addEventListener("click", onJump));
    stepBtns.forEach((b) => b.addEventListener("click", onStep));
    let canvasBlur = "";
    let faceRadius = 24;
    const root = document.documentElement;

    /* Hover / tap on the resting box → the scene's peek spring. */
    const input: SceneInput = { peek: 0, kicks: 0 };
    let tapTimer = 0;
    let tapPointer = "";
    const onDown = (e: PointerEvent) => {
      tapPointer = e.pointerType;
    };
    const onEnter = (e: PointerEvent) => {
      if (e.pointerType === "mouse") input.peek = 1;
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType === "mouse") input.peek = 0;
    };
    const onTap = () => {
      input.kicks += 1;
      input.peek = 1;
      window.clearTimeout(tapTimer);
      // A mouse keeps it open while it hovers. Touch has no real hover
      // (phones leave :hover stuck on the last thing tapped), so a tap
      // always lets the lid fall shut again after a short beat.
      const mouse = tapPointer === "mouse";
      tapTimer = window.setTimeout(
        () => {
          if (!(mouse && peekEl?.matches(":hover"))) input.peek = 0;
        },
        mouse ? 1500 : 900,
      );
    };
    peekEl?.addEventListener("pointerdown", onDown);
    peekEl?.addEventListener("pointerenter", onEnter);
    peekEl?.addEventListener("pointerleave", onLeave);
    peekEl?.addEventListener("click", onTap);

    /* Cover art — same canvases as the 3D faces, per orientation. */
    let coverMode = "";
    let coversLoaded = false;
    const syncCovers = () => {
      if (!coversLoaded) return;
      const portrait = isPortraitView(stage.clientWidth, stage.clientHeight);
      const mode = portrait ? "p" : "l";
      if (mode === coverMode) return;
      coverMode = mode;
      covers.forEach((img, i) => {
        img.src = coverURL(i, portrait);
      });
    };
    coversReady().then(() => {
      coversLoaded = true;
      syncCovers();
    });
    let lastBox = "";

    let track: Track = buildTrack(stage.clientHeight, scrollers.map(() => 0));
    let shownIndex = -2;
    let captionIndex = -2;
    let navHidden = false;
    let lastKey = "";
    let refreshTimer = 0;

    /* ---------- measure: viewport + every page's real content height ---------- */
    const measureTitles = () => {
      pages.forEach((page, i) => {
        const el = titleEls[i];
        const fly = flyers[i];
        if (!el || !fly) return;
        const cs = getComputedStyle(el);
        const lines = measureLines(el);
        fly.replaceChildren(
          ...lines.map((line) => {
            const span = document.createElement("span");
            span.className = "block";
            span.textContent = line;
            return span;
          }),
        );
        Object.assign(fly.style, {
          fontFamily: cs.fontFamily,
          fontWeight: cs.fontWeight,
          fontSize: cs.fontSize,
          lineHeight: cs.lineHeight,
          letterSpacing: cs.letterSpacing,
        });
        const from = faceInk[bentoCells[i]?.theme ?? "dark"];
        flyInk[i] = { from, to: parseRGB(cs.color) };
        fly.style.color = `rgb(${from.join(",")})`;
        const w = fly.offsetWidth;
        const h = fly.offsetHeight;
        const { x, y } = offsetWithin(el, page);
        flyBox[i] = { x, y, w, h };
        const size = parseFloat(cs.fontSize);
        setCoverTitle(i, {
          lines,
          font: `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`,
          letterSpacing: parseFloat(cs.letterSpacing) || 0,
          lineHeight: parseFloat(cs.lineHeight) || size,
          widest: w,
          color: `rgb(${from.join(",")})`,
        });
      });
    };

    const measureSlot = () => {
      input.slot = heroSlot
        ? { ...offsetWithin(heroSlot, stage), w: heroSlot.offsetWidth, h: heroSlot.offsetHeight }
        : null;
      // The warm pool of light follows the box to wherever the slot is.
      const sl = input.slot;
      if (heroBg && sl && heroBg.offsetHeight > 0) {
        const px = ((sl.x + sl.w / 2) / stage.clientWidth) * 100;
        const py = ((sl.y + sl.h * 0.62 - heroBg.offsetTop) / heroBg.offsetHeight) * 100;
        heroBg.style.setProperty("--pool-x", `${px.toFixed(1)}%`);
        heroBg.style.setProperty("--pool-y", `${Math.min(95, Math.max(5, py)).toFixed(1)}%`);
      }
      lastKey = "";
    };

    const measure = () => {
      measureSlot();
      measureTitles();
      const v = stage.clientHeight;
      const heights = scrollers.map((s) => s.offsetHeight);
      const next = buildTrack(v, heights);
      if (next.total === track.total && next.viewport === track.viewport) return;
      track = next;
      section.style.height = `${Math.round(track.total + v)}px`;
      syncCovers();
      lastKey = "";
      window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 120);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    if (heroSlot) ro.observe(heroSlot);
    scrollers.forEach((s) => ro.observe(s));
    document.fonts?.ready.then(measure);
    // Theme flips change the headline colour (and nothing else): re-measure
    // titles so the flyer lands on the right ink, then redraw the frame.
    const themeObs = new MutationObserver(() => {
      measureTitles();
      lastKey = "";
    });
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    /* ---------- DOM pass ---------- */
    const showPage = (index: number) => {
      if (index === shownIndex) return;
      pages.forEach((p, i) => {
        p.style.visibility = i === index ? "visible" : "hidden";
      });
      shownIndex = index;
    };

    const applyPage = (frame: Frame, quad: Quad | null) => {
      const i = frame.index;
      const page = pages[i];
      const screen = screens[i];
      const content = contents[i];
      const scroller = scrollers[i];
      if (!page || !screen || !content || !scroller) return;

      const W = stage.clientWidth;
      const H = stage.clientHeight;
      const m = easeInOutCubic(frame.morph);
      const face: Quad = quad ?? [
        [W * 0.3, H * 0.3],
        [W * 0.7, H * 0.3],
        [W * 0.7, H * 0.7],
        [W * 0.3, H * 0.7],
      ];
      const rect: Quad = [
        [0, 0],
        [W, 0],
        [W, H],
        [0, H],
      ];
      const poly = face.map(([x, y], k) => [
        lerp(x, rect[k][0], m),
        lerp(y, rect[k][1], m),
      ]);
      // Rounded like the compartment: it leaves the face on the face's own
      // corner radius, keeps a soft card radius while it grows, and only
      // squares off as it settles full-bleed.
      const r0 = quad ? faceRadius : 24;
      const r1 = W < 768 ? 22 : 30;
      const radius = lerp(r0, r1, m) * (1 - easeInOutCubic(seg(frame.morph, 0.86, 1)));
      page.style.clipPath = roundedQuadPath(poly, radius);

      // Three beats, never overlapping: the cover (warped onto the face's exact
      // corners) blurs away, the growing card holds a beat of soft blank page
      // colour, then the content resolves out of a blur. Collapse plays the
      // same beats backwards.
      page.style.opacity = String(easeOutQuart(seg(frame.morph, 0, 0.16)));
      const small = W < 768;

      // One veil over everything in flight — cover, flying headline and the
      // resolving page together — so no layer ever reads as a hard swap.
      // Zero on the face and on landing; filter runs before clip-path, so the
      // card's edge stays crisp while what's inside it softens.
      const veil = Math.sin(Math.PI * seg(frame.morph, COVER_OUT[0], 0.96)) * (small ? 3 : 5);
      const pf = veil > 0.05 ? `blur(${veil.toFixed(2)}px)` : "none";
      if (page.style.filter !== pf) page.style.filter = pf;

      const xs = poly.map((p) => p[0]);
      const ys = poly.map((p) => p[1]);
      const bx = Math.min(...xs);
      const by = Math.min(...ys);
      const bw = Math.max(...xs) - bx;
      const bh = Math.max(...ys) - by;

      const cover = covers[i];
      if (cover) {
        const c = 1 - easeInOutCubic(seg(frame.morph, COVER_OUT[0], COVER_OUT[1]));
        // "inherit", not "visible": a visible child would outlive its hidden page.
        cover.style.visibility = c > 0.001 ? "inherit" : "hidden";
        if (c > 0.001) {
          const blur = easeInOutCubic(seg(frame.morph, COVER_OUT[0] - 0.04, COVER_OUT[1])) * (small ? 10 : 16);
          cover.style.opacity = String(c);
          cover.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : "none";
          cover.style.width = `${W}px`;
          cover.style.height = `${H}px`;
          cover.style.transform = quadMatrix(W, H, poly);
        }
      }

      /* Depth of field: the box behind softens while the page is in flight. */
      if (canvasWrap) {
        const dof = frame.morph < 0.999 ? easeInOutCubic(seg(frame.morph, 0, 0.6)) : 0;
        const f =
          dof > 0.01
            ? `blur(${(dof * (small ? 4 : 8)).toFixed(2)}px) brightness(${(1 - dof * 0.3).toFixed(3)})`
            : "";
        if (f !== canvasBlur) {
          canvasBlur = f;
          canvasWrap.style.filter = f;
        }
      }

      /* Lay the full-size "screen" into the polygon's bounds, uniform scale. */
      const s = Math.max(bw / W, bh / H);
      const ox = bx + (bw - W * s) / 2;
      const oy = by + (bh - H * s) / 2;
      screen.style.transform = `translate3d(${ox.toFixed(2)}px,${oy.toFixed(2)}px,0) scale(${s.toFixed(4)})`;

      /* Title cover: the headline leaves the face (riding its perspective)
         and lands on its own place in the page, then hands over to it. */
      const fly = flyers[i];
      const fb = flyBox[i];
      const titleEl = titleEls[i];
      const tb = fly && fb ? coverTitleBox(i, isPortraitView(W, H)) : null;
      if (fly && fb && titleEl) {
        // The cover's headline drifts toward its place in the page but fades
        // out with the cover; the real headline arrives with the content.
        const gone = easeInOutCubic(seg(frame.morph, COVER_OUT[0], COVER_OUT[1]));
        const on = !!tb && gone < 0.999;
        const hand = gone;
        fly.style.visibility = on ? "inherit" : "hidden";
        titleEl.style.visibility = "";
        titleEl.style.opacity = "";
        titleEl.style.filter = "";
        if (on && tb) {
          const k = easeInOutCubic(seg(frame.morph, 0.04, 0.9)) * 0.35;
          const from = [
            projectUV(poly, tb.u, tb.v),
            projectUV(poly, tb.u + tb.w, tb.v),
            projectUV(poly, tb.u + tb.w, tb.v + tb.h),
            projectUV(poly, tb.u, tb.v + tb.h),
          ];
          // Where the page will put it, tracking the page as it settles.
          const ex = ox + fb.x * s;
          const ey = oy + (fb.y - frame.read) * s;
          const to = [
            [ex, ey],
            [ex + fb.w * s, ey],
            [ex + fb.w * s, ey + fb.h * s],
            [ex, ey + fb.h * s],
          ];
          // A slight in-flight blur: zero on the face and on landing, so both
          // ends stay crisp, softest mid-travel when the text moves fastest.
          const fb2 = hand * (small ? 10 : 16);
          fly.style.opacity = (1 - hand).toFixed(3);
          const ink = flyInk[i];
          const ck = easeInOutCubic(seg(frame.morph, 0.2, 0.8));
          fly.style.color = `rgb(${ink.from.map((v, n) => Math.round(lerp(v, ink.to[n], ck))).join(",")})`;
          fly.style.filter = fb2 > 0.05 ? `blur(${fb2.toFixed(2)}px)` : "none";
          fly.style.transform = quadMatrix(
            fb.w,
            fb.h,
            from.map((p, n) => [lerp(p[0], to[n][0], k), lerp(p[1], to[n][1], k)]),
          );
        }
      }

      const reveal = easeInOutCubic(seg(frame.morph, PAGE_IN[0], PAGE_IN[1]));
      const unblur = (1 - reveal) * (small ? 10 : 16);
      content.style.opacity = String(reveal);
      content.style.filter = unblur > 0.05 ? `blur(${unblur.toFixed(2)}px)` : "none";
      content.style.transform = `translate3d(0,${((1 - reveal) * 28).toFixed(1)}px,0) scale(${(1 + (1 - reveal) * 0.035).toFixed(4)})`;
      scroller.style.transform = `translate3d(0,${(-frame.read).toFixed(1)}px,0)`;
      page.style.pointerEvents = frame.morph > 0.98 ? "auto" : "none";
    };

    const render = (time: number) => {
      const y = -section.getBoundingClientRect().top;
      const frame = frameAt(track, Math.max(0, y));
      const timeMs = time * 1000;

      // 3D — always rendered while on screen (pointer parallax, float, peek).
      const out = sceneApi.current?.render(frame, timeMs, input) ?? null;
      const quad = out?.quad ?? null;
      if (quad && out) faceRadius = out.radius;

      /* Peek target follows the resting box; it retires once we scroll. */
      if (peekEl) {
        const box = out?.box;
        const live = !!box && frame.hero < 0.12;
        const k = live && box ? box.map((n) => Math.round(n)).join(",") : "off";
        if (k !== lastBox) {
          lastBox = k;
          if (live && box) {
            peekEl.style.visibility = "visible";
            peekEl.style.transform = `translate3d(${box[0].toFixed(0)}px,${box[1].toFixed(0)}px,0)`;
            peekEl.style.width = `${box[2].toFixed(0)}px`;
            peekEl.style.height = `${box[3].toFixed(0)}px`;
          } else {
            peekEl.style.visibility = "hidden";
            input.peek = 0;
          }
        }
      }

      const key = `${frame.phase}|${frame.hero.toFixed(4)}|${frame.index}|${frame.intro.toFixed(4)}|${frame.dive.toFixed(4)}|${frame.morph.toFixed(4)}|${frame.read.toFixed(1)}|${frame.outro.toFixed(4)}|${quad?.flat().map((n) => n.toFixed(1)).join(",")}`;
      if (key === lastKey) return;
      lastKey = key;

      /* Hero copy: splits apart and lifts away as the box rises. */
      const h = frame.hero;
      if (heroEl) {
        const fade = easeOutQuart(seg(h, 0, 0.55));
        heroEl.style.opacity = String(1 - fade);
        heroEl.style.transform = `translate3d(0,${(-h * 90).toFixed(1)}px,0) scale(${(1 - h * 0.1).toFixed(4)})`;
        heroEl.style.visibility = h < 0.999 ? "visible" : "hidden";
      }
      if (heroL) heroL.style.transform = `translate3d(${(-h * 160).toFixed(1)}px,0,0)`;
      if (heroR) heroR.style.transform = `translate3d(${(h * 160).toFixed(1)}px,0,0)`;
      if (heroBg) heroBg.style.opacity = String(1 - seg(h, 0.2, 0.9));
      if (heroStars) {
        const st = 1 - seg(h, 0.15, 0.8);
        heroStars.style.opacity = String(st);
        heroStars.style.visibility = st > 0.001 ? "visible" : "hidden";
      }

      /* Intro copy + cue — arrive as the hero leaves, go as the lid opens. */
      if (intro) {
        const gone = seg(frame.intro, 0.06, 0.2);
        const arrive = easeOutQuart(seg(h, 0.65, 1));
        intro.style.opacity = String(arrive * (1 - gone));
        intro.style.transform = `translate3d(0,${((1 - arrive) * 28 + gone * 28).toFixed(1)}px,0)`;
      }
      if (cue) cue.style.opacity = String(1 - seg(frame.intro, 0.02, 0.08));

      /* Active page */
      const open = frame.phase === "page" && frame.morph > 0;
      showPage(open ? frame.index : -1);
      if (open) applyPage(frame, quad);
      else if (canvasBlur && canvasWrap) {
        canvasBlur = "";
        canvasWrap.style.filter = "";
      }

      /* Quick-jump state */
      const ch =
        frame.phase === "page"
          ? frame.index + 1
          : frame.phase === "outro"
            ? CHAPTERS.length - 1
            : 0;
      if (ch !== chapter) {
        chapter = ch;
        jumpBtns.forEach((b, k) => {
          if (k === ch) b.setAttribute("aria-current", "step");
          else b.removeAttribute("aria-current");
        });
        if (jumpLabel) jumpLabel.textContent = CHAPTERS[ch].label;
        if (jumpNum) jumpNum.textContent = ch === 0 || ch === CHAPTERS.length - 1 ? "··" : pad(ch);
        stepBtns.forEach((b) => {
          const d = Number(b.dataset.jumpStep);
          b.disabled = ch + d < 0 || ch + d > CHAPTERS.length - 1;
        });
      }

      /* Hide the site nav while a page owns the screen. */
      const hideNav = open && frame.morph > 0.55;
      if (hideNav !== navHidden) {
        navHidden = hideNav;
        root.toggleAttribute("data-bento-open", hideNav);
      }

      /* Chapter chrome */
      if (chrome) {
        // Kept off the hero so the first screen stays quiet; it arrives as
        // the hero clears, and bows out as the finale hands over below.
        const on =
          frame.phase === "hero"
            ? seg(frame.hero, 0.08, 0.4)
            : frame.phase === "outro"
              ? 1 - seg(frame.outro, 0.75, 1)
              : 1;
        chrome.style.opacity = String(on);
        chrome.style.visibility = on > 0.01 ? "visible" : "hidden";
      }

      /* "Up next" caption — names the compartment while the camera travels. */
      if (caption) {
        const target =
          frame.phase === "page"
            ? frame.rising
              ? frame.index + 1
              : frame.index
            : -1;
        const valid = target >= 0 && target < bentoCells.length;
        const show =
          valid && frame.morph === 0 ? 1 - seg(frame.dive, 0.3, 0.8) : 0;
        caption.style.opacity = String(show);
        caption.style.transform = `translate3d(-50%,${((1 - show) * 14).toFixed(1)}px,0)`;
        if (valid && target !== captionIndex) {
          captionIndex = target;
          const cell = bentoCells[target];
          if (captionEyebrow)
            captionEyebrow.textContent = `${pad(target + 1)} — ${cell.eyebrow}`;
          if (captionTitle) captionTitle.textContent = cell.title;
        }
      }

      /* Outro */
      if (outro) {
        const o = easeOutQuart(seg(frame.outro, 0.05, 0.5));
        outro.style.opacity = String(o);
        outro.style.transform = `translate3d(0,${((1 - o) * 40).toFixed(1)}px,0)`;
        outro.style.pointerEvents = o > 0.6 ? "auto" : "none";
        outro.style.visibility = o > 0.001 ? "visible" : "hidden";
      }
    };

    /* Only tick while the stage is near the viewport. */
    let ticking = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !ticking) {
          ticking = true;
          gsap.ticker.add(render);
        } else if (!entry.isIntersecting && ticking) {
          ticking = false;
          gsap.ticker.remove(render);
          if (navHidden) {
            navHidden = false;
            root.removeAttribute("data-bento-open");
          }
        }
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(section);

    return () => {
      peekEl?.removeEventListener("pointerdown", onDown);
      peekEl?.removeEventListener("pointerenter", onEnter);
      peekEl?.removeEventListener("pointerleave", onLeave);
      peekEl?.removeEventListener("click", onTap);
      jumpBtns.forEach((b) => b.removeEventListener("click", onJump));
      stepBtns.forEach((b) => b.removeEventListener("click", onStep));
      window.clearTimeout(tapTimer);
      io.disconnect();
      ro.disconnect();
      themeObs.disconnect();
      window.clearTimeout(refreshTimer);
      gsap.ticker.remove(render);
      root.removeAttribute("data-bento-open");
      section.style.height = "";
    };
  }, [enabled]);

  if (!enabled) {
    return (
      <StaticShowcase
        experience={experience}
        onExpandImage={onExpandImage}
        hero={hero}
      />
    );
  }

  return (
    <section
      ref={sectionRef}
      id="synergy"
      aria-labelledby="synergy-title"
      className="relative z-10 w-full bg-canvas"
      style={{ height: "900vh" }}
    >
      <div
        ref={stageRef}
        className="sticky top-0 h-[100svh] w-full overflow-hidden bg-canvas"
      >
        {/* Ambient depth behind the box */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[70vmax] w-[70vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(var(--accent-rgb)/0.17),rgb(var(--accent-rgb)/0.05)_38%,transparent_64%)]" />
          <div className="absolute -left-32 bottom-0 h-[40vmax] w-[40vmax] rounded-full bg-[radial-gradient(circle,rgb(var(--accent-soft-rgb)/0.05),transparent_65%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(var(--canvas-rgb)/0.85),rgb(var(--canvas-rgb)/0.15)_36%,rgb(var(--canvas-rgb)/0.8))]" />
          {/* Hero only: the site's star field (the stage is opaque, so the
              global one can't show through) and a warm pool of light the
              closed box rests in. Both fade as the box rises. */}
          <div data-hero-stars className="absolute inset-0">
            <Particles className="absolute inset-0" quantity={160} ease={50} color={palette.particles} refresh />
          </div>
          <div
            data-hero-bg
            className="absolute inset-x-0 bottom-0 h-[70%] bg-[radial-gradient(ellipse_50%_38%_at_var(--pool-x,50%)_var(--pool-y,76%),rgb(var(--accent-rgb)/0.3),transparent_70%)]"
          />
        </div>

        {/* 3D box */}
        <div data-canvas className="absolute inset-0">
          <Suspense fallback={null}>
            <BentoBoxCanvas api={sceneApi} />
          </Suspense>
        </div>

        {/* Hover / tap target over the resting box — positioned each frame */}
        <button
          type="button"
          data-peek
          aria-label="Peek inside the bento box"
          className="absolute left-0 top-0 z-[15] cursor-pointer rounded-[24px] outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
          style={{ visibility: "hidden" }}
        />

        {/* Hero copy */}
        {hero && (
          <div
            data-hero
            className="pointer-events-none absolute inset-0 z-20 origin-top will-change-transform"
          >
            {hero}
          </div>
        )}

        {/* Intro */}
        <div
          data-intro
          className="pointer-events-none absolute inset-0 z-20"
          style={{ opacity: hero ? 0 : 1 }}
        >
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-[58vh] bg-[linear-gradient(to_top,rgb(var(--canvas-rgb)/0.94),rgb(var(--canvas-rgb)/0.6)_44%,transparent)]"
          />
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 px-6 pb-12 sm:gap-5 sm:px-10 sm:pb-16 lg:px-14 lg:pb-20">
            <p className="font-tech text-[0.55rem] uppercase tracking-[0.5em] text-accent/85 sm:text-[0.6rem]">
              Unboxing
            </p>
            <h2
              id="synergy-title"
              className="max-w-[18ch] font-display text-[clamp(2.15rem,5.4vw,4rem)] font-semibold leading-[0.94] tracking-[-0.03em] text-ink"
            >
              The synergy
            </h2>
            <p className="max-w-[32ch] text-sm leading-relaxed text-ink/70 sm:text-base">
              Design &amp; engineering, boxed into one system.
            </p>
            <p
              data-cue
              className="mt-2 flex items-center gap-3 font-tech text-[0.55rem] uppercase tracking-[0.4em] text-ink/50 sm:text-[0.6rem]"
            >
              <span
                aria-hidden="true"
                className="h-px w-10 bg-gradient-to-r from-accent to-transparent"
              />
              Scroll to open
            </p>
          </div>
        </div>

        {/* "Up next" caption while the camera travels between compartments */}
        <div
          data-caption
          aria-hidden="true"
          className="pointer-events-none absolute bottom-10 left-1/2 z-20 flex max-w-[calc(100vw-2rem)] flex-col items-center gap-2 rounded-2xl border border-ink/10 bg-canvas/95 px-6 py-4 text-center opacity-0 shadow-[var(--card-shadow)] backdrop-blur-md sm:bottom-14"
          style={{ transform: "translate3d(-50%,14px,0)" }}
        >
          <p
            data-caption-eyebrow
            className="font-tech text-[0.55rem] uppercase tracking-[0.45em] text-accent/90 sm:text-[0.6rem]"
          />
          <p
            data-caption-title
            className="max-w-[22ch] font-display text-xl font-semibold leading-tight tracking-tight text-ink sm:text-2xl"
          />
        </div>

        {/* Pages — each one is clipped to its compartment's projected face and
            morphs from there to the full viewport. */}
        {bentoCells.map((cell, i) => (
          <div
            key={cell.id}
            data-page={i}
            className="absolute inset-0 z-30 overflow-hidden"
            style={{
              visibility: "hidden",
              opacity: 0,
              pointerEvents: "none",
              background: pageFill[cell.theme],
              clipPath: "polygon(50% 50%,50% 50%,50% 50%,50% 50%)",
            }}
          >
            <img
              data-cover
              alt=""
              aria-hidden="true"
              decoding="async"
              className="absolute left-0 top-0 z-10 origin-top-left object-fill will-change-transform"
              style={{ visibility: "hidden", width: 0, height: 0 }}
            />
            {cell.coverTitle && (
              <div
                data-flyer
                aria-hidden="true"
                className="pointer-events-none absolute left-0 top-0 z-20 origin-top-left whitespace-nowrap will-change-transform"
                style={{ visibility: "hidden" }}
              />
            )}
            <div
              data-screen
              className="absolute left-0 top-0 h-full w-full origin-top-left overflow-hidden will-change-transform"
            >
              <div data-content className="h-full w-full will-change-transform">
                <div data-scroller className="w-full will-change-transform">
                  <BentoPageContent
                    cell={cell}
                    index={i}
                    total={bentoCells.length}
                    experience={experience}
                    onExpandImage={onExpandImage}
                    className="min-h-[100svh]"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Chapter navigation — above pages, so it's always reachable. */}
        <nav
          data-chrome
          aria-label="Jump to a chapter"
          className="pointer-events-none absolute inset-0 z-40"
        >
          {/* Desktop: a rail of chapters; labels slide out on hover. */}
          <div className="absolute right-3 top-1/2 hidden -translate-y-1/2 sm:block lg:right-5">
            <ol className="pointer-events-auto flex list-none flex-col items-end gap-0.5 rounded-full border border-ink/10 bg-canvas/45 px-1.5 py-3 backdrop-blur-md">
              {CHAPTERS.map((c, k) => (
                <li key={c.key}>
                  <button
                    type="button"
                    data-jump={k}
                    aria-label={`Jump to ${c.label}`}
                    className="group/j relative flex h-6 w-6 items-center justify-center outline-none"
                  >
                    <span className="pointer-events-none absolute right-8 flex translate-x-2 items-center gap-2 whitespace-nowrap rounded-full border border-ink/10 bg-canvas/85 px-3 py-1.5 font-tech text-[10px] font-bold uppercase tracking-[0.25em] text-ink/80 opacity-0 backdrop-blur-md transition duration-300 group-hover/j:translate-x-0 group-hover/j:opacity-100 group-focus-visible/j:translate-x-0 group-focus-visible/j:opacity-100">
                      {k > 0 && k <= bentoCells.length && (
                        <span className="text-accent">{pad(k)}</span>
                      )}
                      {c.label}
                    </span>
                    <span className="h-[3px] w-[3px] rounded-full bg-ink/40 transition-all duration-500 group-hover/j:bg-ink group-focus-visible/j:bg-ink group-aria-[current=step]/j:h-4 group-aria-[current=step]/j:w-[3px] group-aria-[current=step]/j:bg-accent" />
                  </button>
                </li>
              ))}
            </ol>
          </div>

          {/* Phones: a compact pill — previous / current / next. */}
          <div className="absolute inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] flex justify-center sm:hidden">
            <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-ink/10 bg-canvas/70 p-1 backdrop-blur-md">
              <button
                type="button"
                data-jump-step={-1}
                aria-label="Previous chapter"
                className="grid h-10 w-10 place-items-center rounded-full text-ink/80 transition active:scale-90 disabled:opacity-25"
              >
                <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4"><path d="M8 12V4M4 8l4-4 4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <p className="min-w-[8.5rem] text-center font-tech text-[10px] font-bold uppercase tracking-[0.25em] text-ink/85" aria-live="polite">
                <span data-jump-num className="mr-2 text-accent">··</span>
                <span data-jump-label>Intro</span>
              </p>
              <button
                type="button"
                data-jump-step={1}
                aria-label="Next chapter"
                className="grid h-10 w-10 place-items-center rounded-full bg-ink/10 text-ink transition active:scale-90 disabled:opacity-25"
              >
                <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4"><path d="M8 4v8M4 8l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
          </div>
        </nav>

        {/* Outro */}
        <div
          data-outro
          className="absolute inset-0 z-30 flex flex-col items-center justify-center px-6 text-center"
          style={{ opacity: 0, visibility: "hidden", pointerEvents: "none" }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_55%,rgb(var(--canvas-rgb)/0.9),rgb(var(--canvas-rgb)/0.5)_60%,rgb(var(--canvas-rgb)/0.2)_100%)]" />
          <div className="relative z-10">
            <p className="font-tech text-[0.6rem] uppercase tracking-[0.5em] text-accent/90">
              The full picture
            </p>
            <h2 className="mt-6 max-w-[18ch] font-display text-[clamp(2.4rem,7.5vw,5.4rem)] font-semibold leading-[0.94] tracking-tight text-ink">
              Design that moves.
              <br />
              Engineering that lasts.
            </h2>
            <p className="mx-auto mt-6 max-w-sm text-sm leading-relaxed text-ink/65 sm:text-base">
              Six disciplines, one system. Let&apos;s build the next one
              together.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-full bg-accent px-7 py-3 font-tech text-[0.65rem] uppercase tracking-[0.28em] text-canvas transition-colors hover:bg-light-accent"
              >
                Start a project
              </Link>
              <Link
                to="/work"
                className="inline-flex items-center justify-center rounded-full border border-ink/20 px-7 py-3 font-tech text-[0.65rem] uppercase tracking-[0.28em] text-ink/80 transition-colors hover:border-ink/45 hover:text-ink"
              >
                See the work
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
