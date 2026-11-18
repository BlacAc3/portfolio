/**
 * Theme switch as a turning day/night wheel.
 *
 * The sun and the moon sit at opposite ends of one large elliptical orbit.
 * On a switch the wheel makes a short counter-clockwise turn (about 40°):
 *
 *   turn   both bodies slide in from the sides. The current one (say the
 *          moon) comes in from the left and sinks toward the bottom-left
 *          corner. The incoming one (the sun), opposite it, comes in from the
 *          right and rises to the top-right. Its light reveals
 *          the new theme around it; the bottom-left is still the old theme.
 *   exit   a short rest, then the two bodies glide out by
 *          opposite corners while the new theme floods the screen.
 *
 * Layering (View Transitions API): the bodies are separate named elements
 * painted *behind* the app (`#root` is named too). So they sit in the
 * background, under the text and cards:
 *
 *   root old/new   page backgrounds; the new one is revealed by a disc mask
 *   orbs           sun + moon
 *   page old/new   the app; new = disc mask, old = the inverse of that disc
 */

export type CelestialBody = "sun" | "moon";

const TURN = 1450; // slide in from the sides and one short, even turn
const HOLD = 250; // a short rest at the top-right
const EXIT = 750;
const TOTAL = TURN + HOLD + EXIT;
const STEP = 1000 / 60;
/** Must match the solid stop in the mask gradients (index.css). */
const SOLID = 0.82;
const DEG = Math.PI / 180;

let running = false;
export const isCelestialRunning = () => running;

/** Gentle ease-in-out for the turn, with a soft settle of a degree or two. */
const turnEase = (t: number) => {
  const base = 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, Math.max(0, t)));
  return base + 0.012 * Math.sin(Math.PI * smooth(0.72, 1, t));
};

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const smooth = (a: number, b: number, t: number) => {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * The orb elements rest this far off the left edge. Their view-transition
 * groups start out there too, so there's no flash at the top-left in the
 * frames before the animation takes over, or if a transition is skipped.
 */
const PARKED = -10000;

function buildOrb(body: CelestialBody, size: number) {
  const orb = document.createElement("div");
  orb.style.left = `${PARKED}px`;
  orb.className = `celestial-orb celestial-orb--${body}`;
  orb.setAttribute("aria-hidden", "true");
  orb.style.width = orb.style.height = `${size}px`;
  orb.style.viewTransitionName = `theme-orb-${body}`;
  orb.innerHTML =
    body === "sun"
      ? '<span class="celestial-rays"></span><span class="celestial-core"></span>'
      : '<span class="celestial-core"><i></i><i></i><i></i></span>';
  return orb;
}

/**
 * Runs `commit` inside a view transition and turns the wheel so `incoming`
 * rises. Falls back to an instant switch when the API is missing or motion
 * is reduced.
 */
export function celestialTransition(incoming: CelestialBody, commit: () => void) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!document.startViewTransition || reduced || running) {
    if (!running) commit();
    return;
  }
  running = true;
  const outgoing: CelestialBody = incoming === "sun" ? "moon" : "sun";

  const W = window.innerWidth;
  const H = window.innerHeight;
  const small = W < 640;
  const size = Math.round(Math.min(140, Math.max(72, W * 0.085)));
  // Keyframe left/top are offsets on top of the element's parked position.
  const half = size / 2;
  const ox = half + PARKED;

  // The wheel: an ellipse wide enough to reach near the screen edges.
  const cx = W * 0.5;
  const cy = H * 0.55;
  const rx = W * (small ? 0.42 : 0.46);
  const ry = H * 0.5;
  const at = (deg: number) => ({ x: cx + rx * Math.cos(deg * DEG), y: cy + ry * Math.sin(deg * DEG) });

  // A short counter-clockwise turn. The current body starts low on the left
  // (165°) and sinks toward the bottom-left corner. The incoming body starts
  // opposite it on the right edge (-15°) and rises to the top-right (PARK).
  const inStart = -15;
  const PARK = -55;
  const sweep = PARK - inStart;

  const inPark = at(PARK);
  const outPark = at(PARK + 180);
  // Where they enter from: just past the right and left edges, so they slide
  // in from the sides (the mirror of how they leave), rather than fading in.
  const inStartPt = at(inStart);
  const outStartPt = at(inStart + 180);
  const inFrom = { x: W + size * 0.6, y: inStartPt.y + size * 0.5 };
  const outFrom = { x: -size * 0.6, y: outStartPt.y - size * 0.5 };
  const inGone = { x: W + size * 1.5, y: -size * 1.5 };
  const outGone = { x: -size * 1.5, y: H + size * 1.5 };

  // Reveal radius: a halo while the body sweeps round, then at the park it
  // covers the top-right half and leaves the bottom-left in the old theme.
  const toFar = (x: number, y: number) => Math.hypot(x, H - y);
  const halo = size * 1.4;
  const parkR = Math.min(toFar(inPark.x, inPark.y) * 0.66, Math.hypot(inPark.x - outPark.x, inPark.y - outPark.y) - size * 1.2);
  const endR = (toFar(inGone.x, inGone.y) + 60) / SOLID;

  // The app's own box, so its masks can use the same viewport coordinates.
  const app = document.getElementById("root");
  const box = app?.getBoundingClientRect() ?? { left: 0, top: 0 };

  type F = { root: Keyframe; pageNew: Keyframe; pageOld: Keyframe; inOrb: Keyframe; outOrb: Keyframe };
  const frames: F[] = [];
  for (let ms = 0; ms <= TOTAL + 0.5; ms += STEP) {
    let a: { x: number; y: number }, b: { x: number; y: number }, r: number;
    if (ms <= TURN + HOLD) {
      const p = turnEase(ms / TURN);
      const ang = inStart + sweep * p;
      // Arc position plus an entry offset that melts away early in the turn,
      // so the slide-in flows straight into the arc without a stop.
      const k = 1 - smooth(0, 0.45, p);
      const arcA = at(ang);
      const arcB = at(ang + 180);
      a = { x: arcA.x + (inFrom.x - inStartPt.x) * k, y: arcA.y + (inFrom.y - inStartPt.y) * k };
      b = { x: arcB.x + (outFrom.x - outStartPt.x) * k, y: arcB.y + (outFrom.y - outStartPt.y) * k };
      r = lerp(halo * smooth(0.05, 0.3, p), parkR, smooth(0.3, 1, p));
    } else {
      const e = Math.min(1, (ms - TURN - HOLD) / EXIT);
      const q = easeInOutCubic(e);
      a = { x: lerp(inPark.x, inGone.x, q), y: lerp(inPark.y, inGone.y, q) };
      b = { x: lerp(outPark.x, outGone.x, q), y: lerp(outPark.y, outGone.y, q) };
      r = lerp(parkR, endR, smooth(0.05, 1, e));
    }
    const d = Math.max(0, r) * 2;
    const vx = a.x - d / 2;
    const vy = a.y - d / 2;
    const sz = `${d.toFixed(1)}px ${d.toFixed(1)}px`;
    const pp = `${(vx - box.left).toFixed(1)}px ${(vy - box.top).toFixed(1)}px`;
    frames.push({
      root: { maskSize: sz, maskPosition: `${vx.toFixed(1)}px ${vy.toFixed(1)}px` },
      pageNew: { maskSize: sz, maskPosition: pp },
      pageOld: { maskSize: `${sz}, 100% 100%`, maskPosition: `${pp}, 0px 0px` },
      // left/top (not transform) keep the orbs on the main thread with the
      // masks, so they can't drift apart when the page is busy.
      inOrb: { left: `${(a.x - ox).toFixed(1)}px`, top: `${(a.y - half).toFixed(1)}px` },
      outOrb: { left: `${(b.x - ox).toFixed(1)}px`, top: `${(b.y - half).toFixed(1)}px` },
    });
  }

  const root = document.documentElement;
  const inOrb = buildOrb(incoming, size);
  const outOrb = buildOrb(outgoing, size);
  root.classList.add("celestial-vt");
  if (app) app.style.viewTransitionName = "app";

  const vt = document.startViewTransition(() => {
    commit();
    document.body.prepend(outOrb, inOrb);
  });

  const cleanup = () => {
    inOrb.remove();
    outOrb.remove();
    if (app) app.style.viewTransitionName = "";
    root.classList.remove("celestial-vt");
    running = false;
  };

  vt.ready
    .then(() => {
      const timing = { duration: TOTAL, easing: "linear", fill: "both" as const };
      const play = (key: keyof F, pseudoElement: string) =>
        root.animate(frames.map((f) => f[key]), { ...timing, pseudoElement });
      play("root", "::view-transition-new(root)");
      if (app) {
        play("pageNew", "::view-transition-new(app)");
        play("pageOld", "::view-transition-old(app)");
      }
      play("inOrb", `::view-transition-group(theme-orb-${incoming})`);
      play("outOrb", `::view-transition-group(theme-orb-${outgoing})`);
    })
    .catch(cleanup);
  vt.finished.then(cleanup, cleanup);
}
