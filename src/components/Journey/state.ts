/**
 * Shared, mutable journey state. The DOM layer writes `u` from the scroll
 * position; the 3D scene reads it every frame. No React re-renders involved.
 *
 * `u` runs from 0 to CHAPTERS.length — chapter `i` owns [i, i + 1).
 */
export const journey = {
  u: 0,
  /** Viewport is portrait (phones): cameras pull back a little. */
  portrait: false,
};

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/** 0 → 1 as v moves from a to b. */
export const seg = (v: number, a: number, b: number) => clamp01((v - a) / (b - a));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (t: number) => t * t * (3 - 2 * t);
export const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeIn = (t: number) => t * t;
/** Rises 0 → 1 over [a, b], holds, then falls 1 → 0 over [c, d]. */
export const window4 = (v: number, a: number, b: number, c: number, d: number) =>
  Math.min(seg(v, a, b), 1 - seg(v, c, d));

export type V3 = [number, number, number];

/** Quintic ease: zero velocity and acceleration at both ends. */
export const smoother = (t: number) => t * t * t * (t * (6 * t - 15) + 10);

/**
 * Smooth curve through keyed points, sampled at t ∈ [0, 1]. Keys are
 * [t, value] with t ascending; ends are clamped and start/stop at rest, so
 * chained paths meet with matching (zero) velocity.
 *
 * Each axis is a monotone cubic Hermite (Fritsch–Carlson) over the keys' real
 * times: the camera flows through interior keys without stopping, never
 * overshoots a key (so holds stay holds), and speed doesn't jump where keys
 * are unevenly spaced.
 */
export function pathAt(keys: [number, V3][], t: number): V3 {
  const n = keys.length;
  if (t <= keys[0][0]) return keys[0][1];
  if (t >= keys[n - 1][0]) return keys[n - 1][1];
  let i = 0;
  while (i < n - 2 && t > keys[i + 1][0]) i++;
  const [t1, p1] = keys[i];
  const [t2, p2] = keys[i + 1];
  const h = t2 - t1;
  const s = (t - t1) / h;
  const s2 = s * s;
  const s3 = s2 * s;
  const out: V3 = [0, 0, 0];
  for (let k = 0; k < 3; k++) {
    const m1 = slopeAt(keys, i, k) * h;
    const m2 = slopeAt(keys, i + 1, k) * h;
    out[k] = (2 * s3 - 3 * s2 + 1) * p1[k] + (s3 - 2 * s2 + s) * m1 + (-2 * s3 + 3 * s2) * p2[k] + (s3 - s2) * m2;
  }
  return out;
}

/** Monotone tangent of axis k at key j: zero at the ends and at turning points. */
function slopeAt(keys: [number, V3][], j: number, k: number) {
  if (j === 0 || j === keys.length - 1) return 0;
  const d0 = (keys[j][1][k] - keys[j - 1][1][k]) / (keys[j][0] - keys[j - 1][0]);
  const d1 = (keys[j + 1][1][k] - keys[j][1][k]) / (keys[j + 1][0] - keys[j][0]);
  if (d0 * d1 <= 0) return 0;
  // Weighted harmonic mean: stays within 3× the smaller slope, so no overshoot.
  const h0 = keys[j][0] - keys[j - 1][0];
  const h1 = keys[j + 1][0] - keys[j][0];
  const w0 = 2 * h1 + h0;
  const w1 = h1 + 2 * h0;
  return (w0 + w1) / (w0 / d0 + w1 / d1);
}

/** 1-D Hermite through [x, y] keys with finite-difference tangents. */
export function curve1(keys: [number, number][], x: number): number {
  const n = keys.length;
  if (x <= keys[0][0]) return keys[0][1];
  if (x >= keys[n - 1][0]) return keys[n - 1][1];
  let i = 0;
  while (i < n - 2 && x > keys[i + 1][0]) i++;
  const [x0, y0] = keys[i];
  const [x1, y1] = keys[i + 1];
  const h = x1 - x0;
  const tan = (j: number) => {
    const a = keys[Math.max(0, j - 1)];
    const b = keys[Math.min(n - 1, j + 1)];
    return (b[1] - a[1]) / (b[0] - a[0]);
  };
  const m0 = tan(i) * h;
  const m1 = tan(i + 1) * h;
  const t = (x - x0) / h;
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    (2 * t3 - 3 * t2 + 1) * y0 + (t3 - 2 * t2 + t) * m0 + (-2 * t3 + 3 * t2) * y1 + (t3 - t2) * m1
  );
}

/** Deterministic pseudo-random in [0, 1) — same scene on every load. */
export const rand = (seed: number) => {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};
