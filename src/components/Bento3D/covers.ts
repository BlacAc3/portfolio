/**
 * Cover artwork for each bento compartment, drawn once into a 2D canvas.
 *
 * The same canvas feeds two places: the 3D block's top face (as a texture)
 * and the DOM page that grows out of that face (as an image), so the morph
 * from compartment to page starts on exactly the same picture.
 */
import { bentoCells, type BentoCell } from "./bentoData";

const GOLD = "#d4a76a";
const GOLD_LIGHT = "#e8d5b5";
const DARK = "#0a0a0a";
const PX_PER_UNIT = 380;
const MAX_PX = 1100;

/** Face size of a compartment in world units (matches BentoBoxScene). */
export const faceUnits = (cell: BentoCell) => {
  const CELL = 1;
  const GAP = 0.08;
  return {
    w: cell.colSpan * CELL + (cell.colSpan - 1) * GAP - 0.04,
    d: cell.rowSpan * CELL + (cell.rowSpan - 1) * GAP - 0.04,
  };
};

const base: Record<BentoCell["theme"], [string, string]> = {
  glass: ["#332e2b", "#221f1d"],
  photo: ["#2a2523", "#1a1716"],
  dark: ["#1f1c1a", "#121110"],
  accent: ["#e2b979", "#c6965a"],
};

const fontsReady: Promise<void> =
  typeof document === "undefined"
    ? Promise.resolve()
    : Promise.all([
        document.fonts.load('800 120px "Bricolage Grotesque"'),
        document.fonts.load('700 24px "Space Grotesk"'),
      ])
        .then(() => undefined)
        .catch(() => undefined);

export const coversReady = () => fontsReady;

type Ctx = CanvasRenderingContext2D;

const roundRect = (c: Ctx, x: number, y: number, w: number, h: number, r: number) => {
  c.beginPath();
  c.roundRect(x, y, w, h, r);
};

/** Letter-spaced uppercase label. */
const label = (c: Ctx, text: string, x: number, y: number, size: number, colour: string, align: CanvasTextAlign = "left") => {
  c.save();
  c.font = `700 ${size}px "Space Grotesk", sans-serif`;
  c.fillStyle = colour;
  c.textAlign = align;
  c.textBaseline = "middle";
  (c as Ctx & { letterSpacing: string }).letterSpacing = `${size * 0.42}px`;
  c.fillText(text.toUpperCase(), x, y);
  c.restore();
};

/* ------------------------------------------------------------------ */
/* Motifs — one per compartment, each a diagram of what's inside.      */
/* ------------------------------------------------------------------ */

/** Philosophy: design ∩ engineering — two overlapping orbits. */
const synergy = (c: Ctx, W: number, H: number, m: number) => {
  const cx = W / 2;
  const cy = H * 0.54;
  const r = m * 0.27;
  const off = r * 0.55;
  c.save();
  // Lens fill where the circles intersect.
  c.beginPath();
  c.arc(cx - off, cy, r, 0, Math.PI * 2);
  c.clip();
  c.beginPath();
  c.arc(cx + off, cy, r, 0, Math.PI * 2);
  const lens = c.createLinearGradient(cx, cy - r, cx, cy + r);
  lens.addColorStop(0, "rgba(232,213,181,0.55)");
  lens.addColorStop(1, "rgba(212,167,106,0.25)");
  c.fillStyle = lens;
  c.fill();
  c.restore();

  c.lineWidth = m * 0.006;
  c.strokeStyle = GOLD;
  [cx - off, cx + off].forEach((x) => {
    c.beginPath();
    c.arc(x, cy, r, 0, Math.PI * 2);
    c.stroke();
  });
  // Outer dashed orbit.
  c.save();
  c.setLineDash([m * 0.006, m * 0.02]);
  c.strokeStyle = "rgba(212,167,106,0.45)";
  c.lineWidth = m * 0.004;
  c.beginPath();
  c.ellipse(cx, cy, r * 1.95, r * 1.32, 0, 0, Math.PI * 2);
  c.stroke();
  c.restore();
  // Satellites on the orbit.
  [0.3, 2.1, 4.2].forEach((a) => {
    c.beginPath();
    c.arc(cx + Math.cos(a) * r * 1.95, cy + Math.sin(a) * r * 1.32, m * 0.012, 0, Math.PI * 2);
    c.fillStyle = GOLD_LIGHT;
    c.fill();
  });
  label(c, "Design", cx - off - r * 0.35, cy + r + m * 0.06, m * 0.024, "rgba(255,255,255,0.6)", "center");
  label(c, "Engineering", cx + off + r * 0.35, cy + r + m * 0.06, m * 0.024, "rgba(255,255,255,0.6)", "center");
};

/** The Architect: monogram on a blueprint grid. */
const architect = (c: Ctx, W: number, H: number, m: number) => {
  c.save();
  c.strokeStyle = "rgba(232,213,181,0.07)";
  c.lineWidth = 1;
  const step = m * 0.08;
  for (let x = step; x < W; x += step) {
    c.beginPath();
    c.moveTo(x, 0);
    c.lineTo(x, H);
    c.stroke();
  }
  for (let y = step; y < H; y += step) {
    c.beginPath();
    c.moveTo(0, y);
    c.lineTo(W, y);
    c.stroke();
  }
  c.restore();

  const size = Math.min(W * 0.62, H * 0.42);
  const cy = H * 0.52;
  // Compass arc behind the monogram.
  c.save();
  c.strokeStyle = "rgba(212,167,106,0.35)";
  c.lineWidth = m * 0.004;
  c.beginPath();
  c.arc(W / 2, cy, size * 0.82, Math.PI * 0.85, Math.PI * 2.15);
  c.stroke();
  c.restore();

  c.save();
  c.font = `800 ${size}px "Bricolage Grotesque", sans-serif`;
  c.textAlign = "center";
  c.textBaseline = "middle";
  (c as Ctx & { letterSpacing: string }).letterSpacing = `${-size * 0.06}px`;
  const g = c.createLinearGradient(0, cy - size / 2, 0, cy + size / 2);
  g.addColorStop(0, GOLD_LIGHT);
  g.addColorStop(1, GOLD);
  c.fillStyle = g;
  c.fillText("AE", W / 2, cy);
  c.restore();
  label(c, "Full-stack", W / 2, cy + size * 0.78, m * 0.034, "rgba(255,255,255,0.55)", "center");
};

/** Experience: growth rings, like a cross-section of a tree. */
const experience = (c: Ctx, W: number, H: number, m: number) => {
  const cx = W * 0.62;
  const cy = H * 0.6;
  for (let i = 1; i <= 9; i++) {
    c.beginPath();
    const r = m * 0.045 * i * (1 + Math.sin(i * 1.7) * 0.04);
    c.ellipse(cx, cy, r * 1.08, r, -0.25, 0, Math.PI * 2);
    c.strokeStyle = `rgba(212,167,106,${(0.18 + (i / 9) * 0.55).toFixed(2)})`;
    c.lineWidth = m * (i % 3 === 0 ? 0.007 : 0.004);
    c.stroke();
  }
  c.beginPath();
  c.arc(cx, cy, m * 0.018, 0, Math.PI * 2);
  c.fillStyle = GOLD_LIGHT;
  c.fill();
};

/** Tech: circuit traces etched into the gold block. */
const technology = (c: Ctx, W: number, H: number, m: number) => {
  c.save();
  c.strokeStyle = "rgba(10,10,10,0.5)";
  c.fillStyle = "rgba(10,10,10,0.6)";
  c.lineWidth = m * 0.008;
  c.lineCap = "round";
  c.lineJoin = "round";
  const traces: [number, number][][] = [
    [[0.08, 0.32], [0.3, 0.32], [0.38, 0.4], [0.38, 0.5]],
    [[0.92, 0.3], [0.7, 0.3], [0.62, 0.38], [0.62, 0.5]],
    [[0.1, 0.82], [0.32, 0.82], [0.42, 0.72], [0.42, 0.64]],
    [[0.9, 0.86], [0.66, 0.86], [0.58, 0.76], [0.58, 0.64]],
    [[0.5, 0.2], [0.5, 0.46]],
  ];
  traces.forEach((t) => {
    c.beginPath();
    t.forEach(([x, y], k) => (k ? c.lineTo(x * W, y * H) : c.moveTo(x * W, y * H)));
    c.stroke();
    const [ex, ey] = t[0];
    c.beginPath();
    c.arc(ex * W, ey * H, m * 0.018, 0, Math.PI * 2);
    c.fill();
  });
  // Die in the middle.
  const s = m * 0.22;
  roundRect(c, W / 2 - s / 2, H * 0.57 - s / 2, s, s, s * 0.12);
  c.fillStyle = "rgba(10,10,10,0.78)";
  c.fill();
  c.font = `800 ${s * 0.36}px "Bricolage Grotesque", sans-serif`;
  c.fillStyle = GOLD;
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.fillText("</>", W / 2, H * 0.57);
  c.restore();
};

/** Speed: motion streaks into a gauge. */
const speed = (c: Ctx, W: number, H: number, m: number) => {
  const rows = 11;
  for (let i = 0; i < rows; i++) {
    const y = H * (0.3 + (i / (rows - 1)) * 0.58);
    const len = W * (0.18 + ((i * 37) % 11) / 22);
    const x0 = W * 0.06 + ((i * 53) % 7) * W * 0.012;
    const g = c.createLinearGradient(x0, 0, x0 + len, 0);
    g.addColorStop(0, "rgba(212,167,106,0)");
    g.addColorStop(1, `rgba(212,167,106,${(0.35 + (i % 3) * 0.2).toFixed(2)})`);
    c.strokeStyle = g;
    c.lineWidth = m * (i % 4 === 0 ? 0.012 : 0.006);
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(x0, y);
    c.lineTo(x0 + len, y);
    c.stroke();
  }
  // Gauge.
  const gx = W * 0.8;
  const gy = H * 0.68;
  const gr = Math.min(H * 0.34, W * 0.15);
  c.lineCap = "round";
  c.lineWidth = m * 0.012;
  c.strokeStyle = "rgba(255,255,255,0.12)";
  c.beginPath();
  c.arc(gx, gy, gr, Math.PI * 0.8, Math.PI * 2.2);
  c.stroke();
  c.strokeStyle = GOLD;
  c.beginPath();
  c.arc(gx, gy, gr, Math.PI * 0.8, Math.PI * 1.95);
  c.stroke();
  const a = Math.PI * 1.95;
  c.lineWidth = m * 0.008;
  c.strokeStyle = GOLD_LIGHT;
  c.beginPath();
  c.moveTo(gx, gy);
  c.lineTo(gx + Math.cos(a) * gr * 0.78, gy + Math.sin(a) * gr * 0.78);
  c.stroke();
  c.beginPath();
  c.arc(gx, gy, m * 0.016, 0, Math.PI * 2);
  c.fillStyle = GOLD_LIGHT;
  c.fill();
  label(c, "60 fps", gx, gy + gr * 0.62, m * 0.03, "rgba(255,255,255,0.6)", "center");
};

/** Work: a fanned stack of case-study cards. */
const curated = (c: Ctx, W: number, H: number, m: number) => {
  const cw = Math.min(W * 0.24, H * 0.6);
  const ch = cw * 1.25;
  const cy = H * 0.6;
  [-1, 0, 1].forEach((k, i) => {
    c.save();
    c.translate(W / 2 + k * cw * 0.78, cy + Math.abs(k) * ch * 0.05);
    c.rotate(k * 0.12);
    roundRect(c, -cw / 2, -ch / 2, cw, ch, cw * 0.08);
    c.fillStyle = i === 1 ? "#3a3330" : "#2a2523";
    c.fill();
    c.strokeStyle = i === 1 ? "rgba(212,167,106,0.8)" : "rgba(255,255,255,0.14)";
    c.lineWidth = m * 0.004;
    c.stroke();
    // Cover image block.
    roundRect(c, -cw * 0.4, -ch * 0.4, cw * 0.8, ch * 0.42, cw * 0.05);
    const g = c.createLinearGradient(0, -ch * 0.4, 0, ch * 0.02);
    g.addColorStop(0, i === 1 ? "rgba(212,167,106,0.7)" : "rgba(212,167,106,0.25)");
    g.addColorStop(1, "rgba(212,167,106,0.08)");
    c.fillStyle = g;
    c.fill();
    // Text lines.
    c.fillStyle = "rgba(255,255,255,0.22)";
    [0.12, 0.22, 0.31].forEach((y, r) => {
      roundRect(c, -cw * 0.4, ch * y, cw * (r === 0 ? 0.62 : 0.8 - r * 0.15), ch * 0.035, ch * 0.02);
      c.fill();
    });
    c.restore();
  });
};

const motifs: Record<string, (c: Ctx, W: number, H: number, m: number) => void> = {
  synergy,
  aaron: architect,
  experience,
  technology,
  speed,
  curated,
};

/* ------------------------------------------------------------------ */
/* Drawing + cache                                                     */
/* ------------------------------------------------------------------ */
const cache = new Map<string, HTMLCanvasElement>();
const urls = new Map<string, string>();

/* ------------------------------------------------------------------ */
/* Title covers — a compartment whose cover *is* its page headline.    */
/* ------------------------------------------------------------------ */

/**
 * The page headline as laid out in the DOM: its exact line breaks and font
 * at its real size. The cover draws those same lines (scaled), so the DOM
 * copy that flies out of the face is pixel-for-pixel the same text.
 */
export interface CoverTitle {
  lines: string[];
  /** CSS font shorthand at the DOM size, e.g. `900 68px "Bricolage…"`. */
  font: string;
  letterSpacing: number;
  lineHeight: number;
  /** Width of the widest line at the DOM size. */
  widest: number;
  color: string;
}

const titles = new Map<number, CoverTitle>();
const listeners = new Set<() => void>();

/** Called whenever a cover canvas is repainted in place (3D textures). */
export const onCoversChange = (fn: () => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};

const dims = (index: number, portrait: boolean) => {
  const { w, d } = faceUnits(bentoCells[index]);
  // In portrait the box is turned 90°, so the face reads rotated on screen.
  const uw = portrait ? d : w;
  const uh = portrait ? w : d;
  const scale = Math.min(PX_PER_UNIT, MAX_PX / Math.max(uw, uh));
  const W = Math.round(uw * scale);
  const H = Math.round(uh * scale);
  const m = Math.min(W, H) * (Math.max(W, H) / Math.min(W, H) > 1.6 ? 1.25 : 1);
  const pad = Math.min(W, H) * 0.09;
  return { W, H, m, pad };
};

/** Where (canvas px) and how large the title sits on a face. */
function titleLayout(index: number, portrait: boolean) {
  const t = titles.get(index);
  if (!t || !t.lines.length) return null;
  const { W, H, m, pad } = dims(index, portrait);
  const x = pad * 1.3;
  const y = pad + m * 0.13;
  const natH = t.lines.length * t.lineHeight;
  const scale = Math.min(((W - x * 2) * 0.94) / t.widest, (H - y - pad * 1.4) / natH);
  return { x, y, scale, W, H, w: t.widest * scale, h: natH * scale };
}

/** The title's box on the face, normalised to the cover (0..1). */
export function coverTitleBox(index: number, portrait: boolean) {
  const L = titleLayout(index, portrait);
  return L ? { u: L.x / L.W, v: L.y / L.H, w: L.w / L.W, h: L.h / L.H } : null;
}

const drawTitle = (c: Ctx, index: number, portrait: boolean) => {
  const t = titles.get(index);
  const L = titleLayout(index, portrait);
  if (!t || !L) return;
  c.save();
  // Drawn at the DOM size and scaled, so glyph metrics (and the variable
  // font's optical size) match the HTML headline exactly.
  c.translate(L.x, L.y);
  c.scale(L.scale, L.scale);
  c.font = t.font;
  c.fillStyle = t.color;
  c.textBaseline = "alphabetic";
  (c as Ctx & { letterSpacing: string }).letterSpacing = `${t.letterSpacing}px`;
  const mt = c.measureText("Hg");
  const A = mt.fontBoundingBoxAscent;
  const D = mt.fontBoundingBoxDescent;
  // CSS line box: half-leading above the ascent.
  const base = (t.lineHeight - (A + D)) / 2 + A;
  t.lines.forEach((line, k) => c.fillText(line, 0, k * t.lineHeight + base));
  c.restore();
};

function paint(canvas: HTMLCanvasElement, index: number, portrait: boolean, withTitle: boolean) {
  const cell = bentoCells[index];
  const { W, H, m, pad } = dims(index, portrait);
  canvas.width = W;
  canvas.height = H;
  const c = canvas.getContext("2d");
  if (!c) return;

  const [top, bottom] = base[cell.theme];
  const bg = c.createLinearGradient(0, 0, W * 0.4, H);
  bg.addColorStop(0, top);
  bg.addColorStop(1, bottom);
  c.fillStyle = bg;
  c.fillRect(0, 0, W, H);

  // Soft glow, then the motif (or, for a title cover, the headline).
  const glow = c.createRadialGradient(W * 0.7, H * 0.2, 0, W * 0.7, H * 0.2, Math.max(W, H) * 0.8);
  glow.addColorStop(0, cell.theme === "accent" ? "rgba(255,240,215,0.35)" : "rgba(212,167,106,0.16)");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  c.fillStyle = glow;
  c.fillRect(0, 0, W, H);

  if (cell.coverTitle) {
    // The motif steps back to a faint backdrop; the headline is the cover.
    c.save();
    c.globalAlpha = cell.theme === "accent" ? 0.26 : 0.17;
    motifs[cell.id]?.(c, W, H, Math.min(W, H));
    c.restore();
    if (withTitle) drawTitle(c, index, portrait);
  } else {
    motifs[cell.id]?.(c, W, H, Math.min(W, H));
  }

  // Header: index + eyebrow, hairline frame.
  const ink = cell.theme === "accent" ? "rgba(10,10,10,0.72)" : "rgba(232,213,181,0.85)";
  label(c, String(index + 1).padStart(2, "0"), pad, pad + m * 0.01, m * 0.036, cell.theme === "accent" ? DARK : GOLD);
  label(c, cell.eyebrow, pad + m * 0.1, pad + m * 0.01, m * 0.036, ink);
  c.strokeStyle = cell.theme === "accent" ? "rgba(10,10,10,0.25)" : "rgba(212,167,106,0.3)";
  c.lineWidth = Math.max(1, m * 0.003);
  roundRect(c, pad * 0.45, pad * 0.45, W - pad * 0.9, H - pad * 0.9, m * 0.04);
  c.stroke();
}

const keyOf = (index: number, portrait: boolean) => `${index}|${portrait ? "p" : "l"}`;

/** The face artwork (3D texture). Title covers include the headline. */
export function coverCanvas(index: number, portrait: boolean): HTMLCanvasElement {
  const key = keyOf(index, portrait);
  let canvas = cache.get(key);
  if (!canvas) {
    canvas = document.createElement("canvas");
    paint(canvas, index, portrait, true);
    cache.set(key, canvas);
  }
  return canvas;
}

/**
 * The page's cover image (DOM). For a title cover it leaves the headline
 * out — the flying DOM headline takes its place.
 */
export function coverURL(index: number, portrait: boolean): string {
  const key = keyOf(index, portrait);
  let url = urls.get(key);
  if (!url) {
    let canvas: HTMLCanvasElement;
    if (bentoCells[index].coverTitle) {
      canvas = document.createElement("canvas");
      paint(canvas, index, portrait, false);
    } else {
      canvas = coverCanvas(index, portrait);
    }
    url = canvas.toDataURL("image/webp", 0.9);
    urls.set(key, url);
  }
  return url;
}

/**
 * Hand the cover a title cell's measured headline. Repaints its face
 * canvases in place (once fonts are ready) and pings the 3D textures.
 * Returns false when nothing changed.
 */
export function setCoverTitle(index: number, title: CoverTitle): boolean {
  const prev = titles.get(index);
  if (prev && JSON.stringify(prev) === JSON.stringify(title)) return false;
  titles.set(index, title);
  fontsReady.then(() => {
    if (titles.get(index) !== title) return;
    for (const portrait of [false, true]) {
      const canvas = cache.get(keyOf(index, portrait));
      if (canvas) paint(canvas, index, portrait, true);
    }
    listeners.forEach((fn) => fn());
  });
  return true;
}

/** Same rule the scene uses to decide whether the box is turned. */
export const isPortraitView = (w: number, h: number) => h > w * 1.05;
