import { CAR } from "./carGeometry";
import { WORLD } from "./chapters";
import { N } from "./timeline";
import type { FrameState } from "./frame";
import { MONITOR } from "./sets";
import {
  clamp01,
    easeOut,
  lerp,
  pathAt,
  seg,
  smooth,
  smoother,
  window4,
  type V3,
} from "./state";

/**
 * The choreography. Every pose in the scene is a pure function of `u`
 * (scroll position in chapters), so scrolling back plays it all in reverse.
 */

const W = WORLD.workshop;
const H = WORLD.home;
const S = WORLD.space;
/** Where the car parks in the garage. */
const PARK = H + 0.55 + CAR.half;

const split = (u: number) => {
  const c = Math.min(N - 1, Math.max(0, Math.floor(u)));
  return { c, t: clamp01(u - c) };
};

/** The car's position along the road. */
export function carX(u: number) {
  const { c, t } = split(u);
  switch (c) {
    case 0:
      return 150 * (0.35 * t + 0.65 * t * t);
    case 1: {
      // Same speed as chapter 0 ends with (247.5 m per chapter), then brakes.
      const k = seg(t, 0, 0.404);
      return 150 + 50 * (1 - (1 - k) * (1 - k));
    }
    case 2:
      return lerp(WORLD.meet, W, smoother(seg(t, 0, 0.32)));
    case 3:
      return W;
    case 4:
      return lerp(W, PARK, smoother(seg(t, 0.05, 0.5)));
    default:
      return PARK;
  }
}

/** Behind the parked car at the meet, where the chase into the workshop begins. */
const CHASE_FROM: V3 = [WORLD.meet - 6.8, 2.0, 3.8];

/** Camera's resting spot inside the screen, shared by chapters 5 to 8. */
const REST: V3 = [0, 2.8, 9.6];

const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

export interface Shot {
  pos: V3;
  look: V3;
  /** Pull-back multiplier on tall screens (1 = never). */
  wide: number;
  fov: number;
}

/** How far into a chapter the lens (fov, phone pull-back) keeps blending from the last one. */
const LENS_BLEND = 0.2;

export function shotAt(u: number, fs: FrameState): Shot {
  const { c, t } = split(u);
  const shot = rawShot(c, t, fs);
  // Chapter 5 starts on the far side of the dive's veiled cut: no blend.
  if (c > 0 && c !== 5 && t < LENS_BLEND) {
    const prev = rawShot(c - 1, 1, fs);
    const k = smooth(t / LENS_BLEND);
    shot.fov = lerp(prev.fov, shot.fov, k);
    shot.wide = lerp(prev.wide, shot.wide, k);
  }
  return shot;
}

function rawShot(c: number, t: number, fs: FrameState): Shot {
  const C: V3 = [fs.car.x, 0, 0];
  const carLook = add(C, [0, 0.6, 0]);
  switch (c) {
    case 0: {
      const pos = pathAt(
        [
          [0, add(C, [6.4, 1.05, 5.4])],
          [0.38, add(C, [0.8, 0.85, 6.2])],
          [0.72, add(C, [-5.6, 1.25, 3.9])],
          [1, add(C, [-7.5, 1.8, 2.4])],
        ],
        t,
      );
      return { pos, look: carLook, wide: 1.45, fov: 38 + fs.speed * 0.14 };
    }
    case 1: {
      const meet: V3 = [WORLD.meet, 0.8, 0];
      const pos = pathAt(
        [
          [0, add(C, [-7.5, 1.8, 2.4])],
          // x stays ahead of the braking car's own key (car - 7.5 tops out at meet - 7.5).
          [0.42, [WORLD.meet - 6.5, 5.8, 11.5]],
          [0.72, [WORLD.meet + 4.5, 3.2, 9.5]],
          // Swing round behind the car, ready to chase it out of the meet.
          [1, CHASE_FROM],
        ],
        t,
      );
      const k = smooth(seg(t, 0.25, 0.7));
      const look: V3 = [lerp(carLook[0], meet[0], k * 0.5), lerp(0.6, 0.8, k), 0];
      return { pos, look, wide: 1.4, fov: 40 };
    }
    case 2: {
      const pos = pathAt(
        [
          [0, CHASE_FROM],
          [0.28, add(C, [-6.8, 2.2, 4.4])],
          [0.5, [W + 6, 3.2, 9]],
          [0.75, [W + 3.6, 3.4, 7.6]],
          [1, [W + 0.5, 4.4, 9.4]],
        ],
        t,
      );
      // Starts at the meet shot's eye line (0.2 higher), settles onto the car.
      const settle = 0.2 * (1 - smooth(seg(t, 0, 0.25)));
      const look = add(carLook, [0, settle + fs.car.ctl.lift + smooth(seg(t, 0.4, 0.8)) * 0.8, 0]);
      return { pos, look, wide: 1.5, fov: 40 };
    }
    case 3: {
      const keys: [number, V3, V3][] = [
        [0, [W + 0.5, 4.4, 9.4], [W, 1.95, 0]],
        [0.24, [W + 4.8, 1.6, 5.6], [W, 0.6, 0]],
        [0.45, [W + 2.7, 0.95, 2.0], [W + 1.4, 0.72, 0.9]],
        [0.62, [W + 0.2, 1.08, 2.45], [W - 1.2, 0.85, 0.95]],
        [0.8, [W - 3.7, 1.1, 2.3], [W - 1.9, 0.8, 0.5]],
        [1, [W - 6.4, 2.4, 5.2], [W, 0.6, 0]],
      ];
      return {
        pos: pathAt(keys.map(([k, p]) => [k, p]), t),
        look: pathAt(keys.map(([k, , l]) => [k, l]), t),
        wide: 1.2,
        fov: 38,
      };
    }
    case 4: {
      const m = MONITOR.pos;
      const dive: V3 = [m.x - 0.72, m.y, m.z];
      const keys: [number, V3, V3][] = [
        [0, add(C, [-6.4, 2.4, 5.2]), carLook],
        [0.4, add(C, [-7.2, 1.9, 3.8]), carLook],
        [0.58, [H + 3.8, 2.6, 8.2], [H + 3.8, 1.2, 0]],
        [0.78, [H + 5.4, 1.75, 3.9], [m.x, m.y, m.z]],
        [1, dive, [m.x, m.y, m.z]],
      ];
      return {
        pos: pathAt(keys.map(([k, p]) => [k, p]), t),
        look: pathAt(keys.map(([k, , l]) => [k, l]), t),
        // The dive must end with the screen filling the frame.
        wide: lerp(1.45, 1, seg(t, 0.75, 0.95)),
        fov: 40,
      };
    }
    case 5: {
      const pos = pathAt(
        [
          [0, add(S, [0, 2.6, 6.2])],
          [0.4, add(S, [2.4, 3.2, 10.6])],
          [0.85, add(S, [-2.2, 3.0, 10.4])],
          [1, add(S, REST)],
        ],
        t,
      );
      const look = add(S, [0, lerp(2.5, 2.6, smooth(seg(t, 0.6, 1))), 0]);
      return { pos, look, wide: lerp(1.1, 1.5, smooth(seg(t, 0, 0.4))), fov: 40 };
    }
    case 6: {
      // Eased so the orbit starts and ends at rest.
      const b = Math.sin(smoother(t) * Math.PI);
      const a = b * 0.95;
      const r = REST[2] - b * 1.4;
      const pos: V3 = add(S, [Math.sin(a) * r, REST[1] + b * 1.1, Math.cos(a) * r]);
      return { pos, look: add(S, [0, 2.6, 0]), wide: 1.5, fov: 40 };
    }
    case 7: {
      const e = smoother(t);
      const pos = add(S, [Math.sin(e * Math.PI * 2) * 0.6, REST[1], REST[2] - Math.sin(e * Math.PI) * 0.6]);
      // Phones pull back further here; ease the change in and out.
      const w = Math.sin(e * Math.PI);
      return { pos, look: add(S, [0, 2.6, 0]), wide: lerp(1.5, 1.75, w), fov: 40 };
    }
    default: {
      const sway = Math.sin(t * 40) * 0.015;
      const pos = pathAt(
        [
          [0, add(S, REST)],
          [0.3, add(S, [0, 2.5, 3.7])],
          [0.84, add(S, [sway, 2.5, 3.7])],
          [1, add(S, [5, 3.4, 7.6])],
        ],
        t,
      );
      const look = pathAt(
        [
          [0, add(S, [0, 2.6, 0])],
          [0.3, add(S, [0, 2.4, 0])],
          [0.84, add(S, [0, 2.4, 0])],
          [1, add(S, [0, 2.2, 0])],
        ],
        t,
      );
      return { pos, look, wide: lerp(1.25, 1.5, seg(t, 0.84, 1)), fov: 42 };
    }
  }
}

/** Fill the frame state for scroll position u. */
export function direct(u: number, fs: FrameState) {
  const { c, t } = split(u);
  const at = (ch: number) => (c === ch ? t : c > ch ? 1 : 0);

  // Car
  const x = carX(u);
  const dx = (carX(u + 0.004) - carX(u - 0.004)) / 0.008;
  const ddx = carX(u + 0.004) - 2 * x + carX(u - 0.004);
  fs.car.x = x;
  fs.car.ctl.travel = x;
  fs.speed = dx / 4;
  fs.car.ctl.brake = ddx < -0.0005 && dx > 1 ? 1 : 0;
  fs.car.ctl.lift = 0.55 * (smooth(seg(at(2), 0.32, 0.42)) - smooth(seg(at(3), 0.1, 0.2)));
  fs.car.ctl.explode = smooth(seg(at(2), 0.4, 0.72)) - smooth(seg(at(3), 0, 0.18));
  fs.car.ctl.labels = seg(at(2), 0.55, 0.85) * (1 - seg(at(3), 0, 0.08));
  fs.car.ctl.zebra = window4(c === 3 ? t : c > 3 ? 1 : 0, 0.42, 0.55, 0.88, 0.98);

  // Bike: overtakes in chapter 0, parks at the meet in chapter 1.
  if (c === 0) {
    const off = pathAt([[0, [-12, 0, 0]], [0.45, [7, 0, 0]], [0.75, [3, 0, 0]], [1, [-3, 0, 0]]], t)[0];
    fs.bike.x = x + off;
    fs.bike.z = -2.3;
    fs.bike.lean = Math.sin(t * Math.PI * 3) * 0.06;
    fs.bike.parked = 0;
  } else {
    const k = easeOut(seg(at(1), 0, 0.55));
    const startX = carX(1) - 3;
    fs.bike.x = lerp(startX, WORLD.meet + 3, k);
    fs.bike.z = lerp(-2.3, -4.5, smooth(seg(at(1), 0.3, 0.55)));
    fs.bike.lean = Math.sin(seg(at(1), 0.3, 0.55) * Math.PI) * -0.18;
    fs.bike.parked = seg(at(1), 0.55, 0.6);
  }
  fs.bike.travel = fs.bike.x;

  // Sets
  fs.rise.meet = smooth(seg(at(1), 0, 0.3)) - smooth(seg(at(2), 0.1, 0.28));
  fs.rise.workshop = smooth(seg(at(2), 0.08, 0.3)) - smooth(seg(at(3), 0.06, 0.2));
  fs.rise.tunnel = smooth(seg(at(3), 0.1, 0.28)) - smooth(seg(at(4), 0, 0.14));
  fs.rise.garage = smooth(seg(at(4), 0.22, 0.44));
  fs.rise.ring = smooth(seg(at(8), 0.1, 0.3));
  fs.streams = window4(c === 3 ? t : c > 3 ? 1 : 0, 0.22, 0.36, 0.92, 1);
  fs.screen = seg(at(4), 0.5, 0.9);
  // The bike leaves with the meet.
  fs.bike.visible = c < 2 || fs.rise.meet > 0.02;

  // Inside the screen
  const sp = fs.space;
  sp.spread = seg(at(5), 0.12, 0.55);
  sp.tiles = c >= 5 ? 1 - seg(at(5), 0.75, 0.9) : c === 4 ? 1 : 0;
  sp.particles = seg(at(5), 0.7, 0.84) - seg(at(8), 0.26, 0.4);
  sp.stage =
    seg(at(6), 0, 0.35) + seg(at(7), 0, 0.3) + seg(at(7), 0.45, 0.75) + seg(at(8), 0, 0.22);
  sp.graph = window4(c === 6 ? t : c > 6 ? 1 : 0, 0.3, 0.5, 0.82, 1);
  sp.bag = seg(at(8), 0.2, 0.34);
  sp.combo = c === 8 ? t : 0;
}

