import * as THREE from "three";
import { curve1 } from "./state";

/**
 * A procedural long-bonnet V12 GT body (812-ish proportions), lofted from
 * cross-sections. Units are metres; the nose points to +x, y is up, the
 * body is centred on x = 0, z = 0 and sits on y = 0.
 *
 * Each section is a superellipse between the floor line and the roof line,
 * pulled in above the beltline where the cabin is (tumblehome). Glass and
 * trim are painted in with vertex colours, so one material can carry any paint.
 */

export const CAR = {
  length: 4.7,
  half: 2.35,
  wheelR: 0.36,
  tireW: 0.3,
  frontAxle: 1.38,
  rearAxle: -1.34,
  track: 0.84,
};

export interface BodyShape {
  top: [number, number][];
  bot: [number, number][];
  halfW: [number, number][];
  cabin: [number, number][];
  /** Cabin width at the roof, as a share of the body width. */
  roofRatio: number;
  belt: number;
}

/** The hero car. */
export const GT_SHAPE: BodyShape = {
  top: [
    [-2.36, 0.62],
    [-2.27, 0.86],
    [-2.0, 0.94],
    [-1.6, 0.98],
    [-1.2, 1.08],
    [-0.75, 1.22],
    [-0.4, 1.26],
    [-0.1, 1.22],
    [0.25, 1.02],
    [0.55, 0.93],
    [1.2, 0.88],
    [1.75, 0.8],
    [2.12, 0.66],
    [2.36, 0.48],
  ],
  bot: [
    [-2.36, 0.48],
    [-2.18, 0.34],
    [-1.8, 0.22],
    [1.9, 0.22],
    [2.24, 0.27],
    [2.36, 0.36],
  ],
  halfW: [
    [-2.36, 0.62],
    [-2.2, 0.86],
    [-1.85, 0.96],
    [-1.35, 1.0],
    [-0.8, 0.95],
    [0.1, 0.92],
    [0.85, 0.94],
    [1.38, 0.97],
    [1.9, 0.9],
    [2.2, 0.76],
    [2.36, 0.56],
  ],
  cabin: [
    [-2.36, 0],
    [-1.95, 0],
    [-1.5, 0.7],
    [-1.05, 1],
    [0.0, 1],
    [0.35, 0.45],
    [0.6, 0],
    [2.36, 0],
  ],
  roofRatio: 0.6,
  belt: 0.93,
};

/** A shorter, taller coupé for the parked cars at the meet. */
export const COUPE_SHAPE: BodyShape = {
  ...GT_SHAPE,
  top: [
    [-2.36, 0.66],
    [-2.25, 0.92],
    [-1.9, 1.0],
    [-1.4, 1.2],
    [-0.9, 1.3],
    [-0.3, 1.3],
    [0.25, 1.12],
    [0.7, 0.96],
    [1.5, 0.88],
    [2.1, 0.72],
    [2.36, 0.52],
  ],
  cabin: [
    [-2.36, 0],
    [-2.0, 0],
    [-1.6, 0.8],
    [-1.2, 1],
    [0.15, 1],
    [0.55, 0.3],
    [0.8, 0],
    [2.36, 0],
  ],
};

const RINGS = 240;
const AROUND = 84;
/** Exponent of the cross-section superellipse: higher = boxier. */
const N = 3.2;

const ARCH_R = 0.45;

const se = (v: number, n: number) => Math.sign(v) * Math.pow(Math.abs(v), 2 / n);

export function buildBody(shape: BodyShape, rings = RINGS, around = AROUND) {
  const { half } = CAR;
  const positions: number[] = [];
  const meta: number[] = []; // per vertex: cabin, height above belt, depth below roof, arch
  for (let r = 0; r < rings; r++) {
    const x = -half + (2 * half * r) / (rings - 1);
    // Round the nose and tail: sections shrink toward their centre at the ends.
    const d = Math.min(x + half, half - x);
    const end = Math.sqrt(1 - Math.pow(1 - Math.min(1, d / 0.09), 2));
    const top = curve1(shape.top, x);
    const bot = curve1(shape.bot, x);
    const w = curve1(shape.halfW, x);
    const cabin = curve1(shape.cabin, x);
    const yc = (top + bot) / 2;
    const h = ((top - bot) / 2) * Math.max(0.05, end);
    const belt = Math.min(top - 0.01, shape.belt);
    for (let a = 0; a < around; a++) {
      const phi = (a / around) * Math.PI * 2;
      const y = yc + h * se(Math.sin(phi), N);
      let z = w * Math.max(0.05, end) * se(Math.cos(phi), N);
      // Tumblehome: the glasshouse leans in above the beltline.
      const k = cabin * Math.pow(THREE.MathUtils.smoothstep(y, belt - 0.03, top), 0.75);
      z *= 1 - k * (1 - shape.roofRatio);
      // Shoulders: a faint crease that bulges the fenders over the wheels.
      const haunch =
        Math.exp(-Math.pow((x - CAR.rearAxle) / 0.55, 2)) * 0.035 +
        Math.exp(-Math.pow((x - CAR.frontAxle) / 0.5, 2)) * 0.025;
      const shoulder = Math.exp(-Math.pow((y - (belt - 0.12)) / 0.12, 2));
      z += Math.sign(z) * haunch * shoulder * (1 - cabin * 0.5);
      // Wheel arches: recess the flank around each axle so the wheels show.
      let arch = 0;
      for (const ax of [CAR.frontAxle, CAR.rearAxle]) {
        const dist = Math.hypot(x - ax, y - CAR.wheelR);
        arch = Math.max(arch, 1 - THREE.MathUtils.smoothstep(dist, ARCH_R - 0.08, ARCH_R));
      }
      if (arch > 0) {
        const inner = CAR.track - CAR.tireW / 2 - 0.04;
        if (Math.abs(z) > inner) z = Math.sign(z) * THREE.MathUtils.lerp(Math.abs(z), inner, arch);
      }
      positions.push(x, y, z);
      meta.push(cabin, y - belt, top - y, arch);
    }
  }

  const index: number[] = [];
  for (let r = 0; r < rings - 1; r++) {
    for (let a = 0; a < around; a++) {
      const i0 = r * around + a;
      const i1 = r * around + ((a + 1) % around);
      const j0 = i0 + around;
      const j1 = i1 + around;
      index.push(i0, j0, i1, i1, j0, j1);
    }
  }
  // Caps at nose and tail (the sections there are already tiny).
  const capStart = positions.length / 3;
  const c0 = [-half, (curve1(shape.top, -half) + curve1(shape.bot, -half)) / 2, 0];
  const c1 = [half, (curve1(shape.top, half) + curve1(shape.bot, half)) / 2, 0];
  positions.push(...c0, ...c1);
  meta.push(0, -1, 1, 0, 0, -1, 1, 0);
  const last = (rings - 1) * around;
  for (let a = 0; a < around; a++) {
    const b = (a + 1) % around;
    index.push(capStart, b, a);
    index.push(capStart + 1, last + a, last + b);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(index);
  geo.computeVertexNormals();

  // Paint: body (white → takes the material colour), glass, black trim.
  const nrm = geo.getAttribute("normal");
  const colors = new Float32Array(positions.length);
  for (let i = 0; i < positions.length / 3; i++) {
    const x = positions[i * 3];
    const y = positions[i * 3 + 1];
    const z = positions[i * 3 + 2];
    const cabin = meta[i * 4];
    const aboveBelt = meta[i * 4 + 1];
    const belowTop = meta[i * 4 + 2];
    const arch = meta[i * 4 + 3];
    const ny = nrm.getY(i);
    const ss = THREE.MathUtils.smoothstep;
    let c = 1;
    // Soft edges everywhere: hard thresholds turn into saw-teeth on a mesh.
    const roof = ss(ny, 0.78, 0.86) * ss(x, -1.1, -1.0) * (1 - ss(x, -0.2, -0.1)) * (1 - ss(belowTop, 0.04, 0.08));
    const glass = ss(cabin, 0.28, 0.42) * ss(aboveBelt, 0.02, 0.05) * (1 - roof);
    c = THREE.MathUtils.lerp(c, 0.035, glass);
    const sill = Math.max(1 - ss(y, 0.27, 0.31), (1 - ss(x, -2.1, -2.0)) * (1 - ss(y, 0.47, 0.52)));
    c = THREE.MathUtils.lerp(c, 0.06, sill); // sills, diffuser
    const mouth = ss(x, 2.17, 2.23) * (1 - ss(y, 0.37, 0.42)) * (1 - ss(Math.abs(z), 0.52, 0.58));
    c = THREE.MathUtils.lerp(c, 0.05, mouth); // grille mouth
    c = THREE.MathUtils.lerp(c, 0.03, ss(arch, 0.35, 0.75)); // arch liners
    colors[i * 3] = colors[i * 3 + 1] = colors[i * 3 + 2] = c;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geo;
}
