import { Suspense, useEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { GLOVE_MODEL, ROSSO, WORLD } from "./chapters";
import { DESK_H, DESK_W, TILES, tileTexture, type TileKey } from "./desktop";
import type { FrameState } from "./frame";
import type { Palette } from "./palette";
import { Rise } from "./sets";
import { clamp01, rand, seg, smooth } from "./state";

/**
 * "Inside the screen": the computer, learning, languages and boxing chapters.
 * Everything here is local to WORLD.space.
 */

export const SCREEN = { w: 8, h: (8 * DESK_H) / DESK_W, cy: 2.6 };
export const BAG = { top: 3.35, bottom: 1.35, r: 0.5, pivot: 4.7 };

/** Where a tile sits once the windows come apart (spread = 1). */
const SPREAD: Record<TileKey, { z: number; ry: number; dy: number }> = {
  term: { z: 0.7, ry: 0.16, dy: 0 },
  edit: { z: -0.5, ry: -0.22, dy: 0.15 },
  mon: { z: -1.1, ry: -0.3, dy: -0.15 },
  bar: { z: 1.1, ry: 0, dy: 0.45 },
};

const tileCenter = (k: TileKey) => {
  const t = TILES[k];
  return new THREE.Vector3(
    (t.x + t.w / 2 - 0.5) * SCREEN.w,
    SCREEN.cy + (0.5 - (t.y + t.h / 2)) * SCREEN.h,
    0,
  );
};

const tileMatrix = (k: TileKey, spread: number) => {
  const c = tileCenter(k);
  const s = SPREAD[k];
  const m = new THREE.Matrix4().compose(
    new THREE.Vector3(c.x, c.y + s.dy * spread, s.z * spread),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(0, s.ry * spread, 0)),
    new THREE.Vector3(1, 1, 1),
  );
  return m;
};

/* ------------------------------------------------------------------ */
/* Hyprland tiles                                                      */
/* ------------------------------------------------------------------ */

export const Tiles = ({ fs, desktop, pal }: { fs: FrameState; desktop: THREE.Texture; pal: Palette }) => {
  const keys = Object.keys(TILES) as TileKey[];
  const crops = useMemo(() => keys.map((k) => tileTexture(desktop, k)), [desktop]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => crops.forEach((t) => t.dispose()), [crops]);
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const wall = useRef<THREE.Mesh>(null);
  const grid = useRef<THREE.GridHelper>(null);

  useFrame(() => {
    const sp = smooth(clamp01(fs.space.spread));
    const o = clamp01(fs.space.tiles);
    keys.forEach((k, i) => {
      const m = refs.current[i];
      if (!m) return;
      m.visible = o > 0.01;
      const mat = tileMatrix(k, sp);
      mat.decompose(m.position, m.quaternion, m.scale);
      (m.material as THREE.MeshBasicMaterial).opacity = o;
    });
    if (wall.current) {
      const wo = o * (1 - sp);
      wall.current.visible = wo > 0.01;
      (wall.current.material as THREE.MeshBasicMaterial).opacity = wo;
    }
    if (grid.current) {
      const mat = grid.current.material as THREE.Material;
      mat.opacity = 0.35 * Math.max(o * sp, fs.space.particles);
      grid.current.visible = mat.opacity > 0.01;
    }
  });

  return (
    <group>
      {/* The wallpaper behind the tiles, only while they sit flat. */}
      <mesh ref={wall} position={[0, SCREEN.cy, -0.02]}>
        <planeGeometry args={[SCREEN.w, SCREEN.h]} />
        <meshBasicMaterial map={desktop} transparent toneMapped={false} />
      </mesh>
      {keys.map((k, i) => {
        const t = TILES[k];
        return (
          <mesh key={k} ref={(m) => (refs.current[i] = m)}>
            <planeGeometry args={[t.w * SCREEN.w, t.h * SCREEN.h]} />
            <meshBasicMaterial map={crops[i]} transparent toneMapped={false} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
      <gridHelper
        ref={grid}
        args={[40, 40, pal.tunnelLine, pal.tunnelLine]}
        position={[0, 0, 0]}
        material-transparent
        material-opacity={0}
        material-depthWrite={false}
      />
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* Particle morph                                                      */
/* ------------------------------------------------------------------ */

/** Points sampled from rendered text, centred, `width` wide. */
function textPoints(text: string, n: number, width: number, cy: number, seed: number) {
  const W = 1200;
  const H = 300;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `800 220px "Bricolage Grotesque", "Plus Jakarta Sans", sans-serif`;
  ctx.fillText(text, W / 2, H / 2 + 10);
  const data = ctx.getImageData(0, 0, W, H).data;
  const filled: number[] = [];
  let minX = W;
  let maxX = 0;
  for (let y = 0; y < H; y += 2)
    for (let x = 0; x < W; x += 2)
      if (data[(y * W + x) * 4 + 3] > 140) {
        filled.push(x, y);
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
      }
  const out = new Float32Array(n * 3);
  if (!filled.length) return out;
  const scale = width / Math.max(1, maxX - minX);
  const r = rand(seed);
  for (let i = 0; i < n; i++) {
    const j = Math.floor(r() * (filled.length / 2)) * 2;
    out[i * 3] = (filled[j] - (minX + maxX) / 2 + (r() - 0.5) * 2) * scale;
    out[i * 3 + 1] = cy - (filled[j + 1] - H / 2) * scale;
    out[i * 3 + 2] = (r() - 0.5) * 0.25;
  }
  return out;
}

const HUBS = 90;

function buildTargets(n: number) {
  const r = rand(2024);
  const a = new Float32Array(n * 3);
  const b = new Float32Array(n * 3);
  const e = new Float32Array(n * 3);
  const dir = new Float32Array(n * 3);
  const seed = new Float32Array(n);
  const keys = Object.keys(TILES) as TileKey[];
  const mats = keys.map((k) => tileMatrix(k, 1));
  const areas = keys.map((k) => TILES[k].w * TILES[k].h);
  const total = areas.reduce((s, v) => s + v, 0);
  const v = new THREE.Vector3();

  // Graph hubs on a Fibonacci sphere.
  const hubs: THREE.Vector3[] = [];
  for (let i = 0; i < HUBS; i++) {
    const y = 1 - (2 * (i + 0.5)) / HUBS;
    const rr = Math.sqrt(1 - y * y);
    const th = i * 2.39996;
    const rad = 2.2 + (r() - 0.5) * 0.7;
    hubs.push(new THREE.Vector3(Math.cos(th) * rr * rad, SCREEN.cy + y * rad, Math.sin(th) * rr * rad));
  }

  for (let i = 0; i < n; i++) {
    // A: a point on one of the tiles, weighted by area.
    let pick = r() * total;
    let k = 0;
    while (k < keys.length - 1 && pick > areas[k]) pick -= areas[k++];
    const t = TILES[keys[k]];
    v.set((r() - 0.5) * t.w * SCREEN.w, (r() - 0.5) * t.h * SCREEN.h, 0).applyMatrix4(mats[k]);
    a.set([v.x, v.y, v.z], i * 3);
    // B: hubs first, then clouds around them.
    if (i < HUBS) b.set([hubs[i].x, hubs[i].y, hubs[i].z], i * 3);
    else {
      const h = hubs[Math.floor(r() * HUBS)];
      const g = () => (r() + r() + r() - 1.5) * 0.28;
      b.set([h.x + g(), h.y + g(), h.z + g()], i * 3);
    }
    // E: the heavy bag's surface.
    const th = r() * Math.PI * 2;
    const y = BAG.bottom + r() * (BAG.top - BAG.bottom);
    e.set([Math.cos(th) * BAG.r, y, Math.sin(th) * BAG.r], i * 3);
    // Arc direction for the in-between flight.
    v.set(r() - 0.5, r() - 0.5, r() - 0.5).normalize();
    dir.set([v.x, v.y, v.z], i * 3);
    seed[i] = r();
  }

  // Edges: each hub to its three nearest neighbours.
  const edges: number[] = [];
  hubs.forEach((h, i) => {
    hubs
      .map((o, j) => ({ j, d: o.distanceToSquared(h) }))
      .filter((o) => o.j !== i)
      .sort((p, q) => p.d - q.d)
      .slice(0, 3)
      .forEach(({ j }) => edges.push(h.x, h.y, h.z, hubs[j].x, hubs[j].y, hubs[j].z));
  });

  return { a, b, e, dir, seed, edges: new Float32Array(edges) };
}

const morphMat = (color: string) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uStage: { value: 0 },
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uSpin: { value: 0 },
      uSize: { value: 26 },
      uColor: { value: new THREE.Color(color) },
      uAccent: { value: new THREE.Color("#dcb077") },
      uCy: { value: SCREEN.cy },
    },
    vertexShader: /* glsl */ `
      attribute vec3 aA; attribute vec3 aB; attribute vec3 aC; attribute vec3 aD; attribute vec3 aE;
      attribute vec3 aDir; attribute float aSeed;
      uniform float uStage; uniform float uTime; uniform float uSpin; uniform float uSize; uniform float uCy;
      varying float vSeed; varying float vMove;
      float step01(float x) { return smoothstep(0.0, 1.0, clamp(x * 1.5 - aSeed * 0.5, 0.0, 1.0)); }
      vec3 spin(vec3 p) {
        float c = cos(uSpin), s = sin(uSpin);
        p.y -= uCy;
        p = vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
        p.y += uCy;
        return p;
      }
      void main() {
        float f0 = step01(uStage);
        float f1 = step01(uStage - 1.0);
        float f2 = step01(uStage - 2.0);
        float f3 = step01(uStage - 3.0);
        vec3 p = mix(aA, spin(aB), f0);
        p = mix(p, aC, f1);
        p = mix(p, aD, f2);
        p = mix(p, aE, f3);
        // Particles arc out mid-flight instead of sliding in straight lines.
        float move = sin(3.14159 * f0) + sin(3.14159 * f1) + sin(3.14159 * f2) + sin(3.14159 * f3);
        p += aDir * move * 0.9;
        p += 0.03 * vec3(sin(uTime * 0.7 + aSeed * 40.0), cos(uTime * 0.6 + aSeed * 31.0), sin(uTime * 0.5 + aSeed * 17.0));
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = uSize * (0.6 + aSeed * 0.8) / -mv.z;
        vSeed = aSeed; vMove = move;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uOpacity; uniform vec3 uColor; uniform vec3 uAccent;
      varying float vSeed; varying float vMove;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.15, d);
        vec3 col = mix(uColor, uAccent, step(0.82, vSeed));
        gl_FragColor = vec4(col, a * uOpacity);
      }`,
  });

export const Morph = ({ fs, pal, count }: { fs: FrameState; pal: Palette; count: number }) => {
  const { gl } = useThree();
  const [hello, bonjour] = useMemo(
    () => [textPoints("Hello", count, 5.6, SCREEN.cy, 5), textPoints("Bonjour", count, 7.0, SCREEN.cy, 6)],
    [count],
  );
  const geo = useMemo(() => {
    const t = buildTargets(count);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(t.a, 3));
    g.setAttribute("aA", new THREE.BufferAttribute(t.a, 3));
    g.setAttribute("aB", new THREE.BufferAttribute(t.b, 3));
    g.setAttribute("aC", new THREE.BufferAttribute(hello, 3));
    g.setAttribute("aD", new THREE.BufferAttribute(bonjour, 3));
    g.setAttribute("aE", new THREE.BufferAttribute(t.e, 3));
    g.setAttribute("aDir", new THREE.BufferAttribute(t.dir, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(t.seed, 1));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, SCREEN.cy, 0), 12);
    const lines = new THREE.BufferGeometry();
    lines.setAttribute("position", new THREE.BufferAttribute(t.edges, 3));
    return { points: g, lines };
  }, [count, hello, bonjour]);
  const mat = useMemo(() => morphMat(pal.particle), [pal]);
  useEffect(() => () => (geo.points.dispose(), geo.lines.dispose(), mat.dispose()), [geo, mat]);

  // Redo the letters once the display face has loaded.
  useEffect(() => {
    let live = true;
    document.fonts?.ready.then(() => {
      if (!live) return;
      geo.points.setAttribute("aC", new THREE.BufferAttribute(textPoints("Hello", count, 5.6, SCREEN.cy, 5), 3));
      geo.points.setAttribute("aD", new THREE.BufferAttribute(textPoints("Bonjour", count, 7.0, SCREEN.cy, 6), 3));
    });
    return () => {
      live = false;
    };
  }, [geo, count]);

  const pts = useRef<THREE.Points>(null);
  const lineRef = useRef<THREE.LineSegments>(null);
  const lineGroup = useRef<THREE.Group>(null);
  const lineMat = useRef<THREE.LineBasicMaterial>(null);
  useFrame(() => {
    const u = mat.uniforms;
    u.uStage.value = fs.space.stage;
    u.uTime.value = fs.time;
    u.uOpacity.value = fs.space.particles;
    // Spin the graph while it's on screen; stays put otherwise.
    u.uSpin.value = fs.space.stage * 0.9 + fs.time * 0.05 * fs.space.graph;
    u.uSize.value = 30 * gl.getPixelRatio();
    if (pts.current) pts.current.visible = fs.space.particles > 0.01;
    if (lineRef.current && lineMat.current) {
      lineRef.current.visible = fs.space.graph > 0.01;
      if (lineGroup.current) lineGroup.current.rotation.y = u.uSpin.value;
      lineMat.current.opacity = fs.space.graph * 0.35;
    }
  });

  return (
    <group>
      <points ref={pts} geometry={geo.points} material={mat} frustumCulled={false} />
      {/* Edges rotate about the graph centre, like the particles do. */}
      <group ref={lineGroup} position={[0, SCREEN.cy, 0]}>
        <lineSegments ref={lineRef} geometry={geo.lines} position={[0, -SCREEN.cy, 0]} visible={false}>
          <lineBasicMaterial ref={lineMat} color="#dcb077" transparent opacity={0} depthWrite={false} />
        </lineSegments>
      </group>
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* Boxing                                                              */
/* ------------------------------------------------------------------ */

type Hand = -1 | 1;
interface Punch {
  t: number;
  hand: Hand;
  kind: "jab" | "cross" | "hook";
}
/** One combination across the chapter: jab, cross, hook, then jab, cross. */
export const COMBO: Punch[] = [
  { t: 0.42, hand: -1, kind: "jab" },
  { t: 0.5, hand: 1, kind: "cross" },
  { t: 0.6, hand: -1, kind: "hook" },
  { t: 0.7, hand: -1, kind: "jab" },
  { t: 0.76, hand: 1, kind: "cross" },
];

/** Extension of a punch at combo time t: snaps out, eases back. */
const extension = (t: number, p: Punch) => {
  const d = t - p.t;
  if (d < -0.03 || d > 0.05) return 0;
  return d < 0 ? smooth((d + 0.03) / 0.03) : 1 - smooth(d / 0.05);
};

/** The bag's swing: a damped ring after every landed punch. Pure function of t. */
const swing = (t: number) => {
  let x = 0;
  let z = 0;
  for (const p of COMBO) {
    const d = t - p.t;
    if (d <= 0) continue;
    const ring = Math.exp(-d / 0.09) * Math.sin((d / 0.11) * Math.PI * 2);
    const k = p.kind === "cross" ? 0.16 : p.kind === "hook" ? 0.1 : 0.1;
    if (p.kind === "hook") z += ring * k * -p.hand;
    else x -= ring * k;
  }
  return { x, z };
};

const ProceduralGlove = ({ mat, cuff }: { mat: THREE.Material; cuff: THREE.Material }) => (
  <group scale={0.85}>
    {/* Fist, padded and a touch longer than it is wide */}
    <mesh material={mat} scale={[1, 0.92, 1.2]}>
      <sphereGeometry args={[0.17, 28, 20]} />
    </mesh>
    {/* Thumb, tucked along the inside */}
    <mesh material={mat} position={[0.13, 0.03, -0.01]} rotation-x={0.35} scale={[0.6, 0.6, 1]}>
      <capsuleGeometry args={[0.07, 0.12, 6, 12]} />
    </mesh>
    {/* Cuff toward the wrist (the camera), with a laced band */}
    <mesh material={cuff} position={[0, -0.01, 0.2]} rotation-x={Math.PI / 2}>
      <cylinderGeometry args={[0.115, 0.125, 0.2, 24]} />
    </mesh>
    <mesh position={[0, -0.01, 0.16]}>
      <torusGeometry args={[0.122, 0.012, 8, 32]} />
      <meshStandardMaterial color="#f4ede3" roughness={0.6} />
    </mesh>
  </group>
);

/** Glove length, knuckles to cuff, in metres (matches the stand-in). */
const GLOVE_LEN = 0.44;

/**
 * The real glove (a left one; the right is mirrored by the caller). The file
 * has the cuff at -x and the knuckles at +x, back of the hand up. Turned so the
 * knuckles point -z at the bag, the fist centred on the origin.
 */
const GloveModel = () => {
  const { scene } = useGLTF(GLOVE_MODEL, false);
  const { root, s } = useMemo(() => {
    const root = scene.clone(true);
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const c = box.getCenter(new THREE.Vector3());
    // Fist centre: one half-height in from the knuckle end.
    root.position.set(-(box.max.x - size.y * 0.55), -c.y, -c.z);
    return { root, s: GLOVE_LEN / size.x };
  }, [scene]);
  return (
    // Mirror after turning, so the thumb lands on the side the caller expects.
    <group scale-x={-1}>
      <group scale={s} rotation-y={Math.PI / 2}>
        <primitive object={root} />
      </group>
    </group>
  );
};

useGLTF.preload(GLOVE_MODEL, false);

/** The guard: fists up near the camera (which rests at z = 3.7, eye height 2.5). */
const GUARD = { x: 0.24, y: 2.36, z: 2.55 };

/**
 * Glove orientations for each hand (index 0 = left). At rest the glove has its
 * knuckles toward the bag (-z) and the palm down: that is the landing pose.
 *   guard  knuckles up, palm facing the other hand, canted in a touch
 *   hook   knuckles turned in toward the centre, palm toward you
 */
const POSE = (() => {
  const q = (x: number, y: number, z: number) => new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z, "YXZ"));
  const both = (f: (hand: Hand) => THREE.Quaternion) => [f(-1), f(1)];
  return {
    guard: both((h) => q(Math.PI * 0.44, h * 0.18, -h * Math.PI * 0.5)),
    punch: both((h) => q(0, 0, h * 0.08)),
    hook: both((h) => q(0.1, h * Math.PI * 0.36, -h * Math.PI * 0.5)),
  };
})();

export const Boxing = ({ fs, pal }: { fs: FrameState; pal: Palette }) => {
  const glove = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: ROSSO, roughness: 0.35, clearcoat: 0.8, clearcoatRoughness: 0.2 }),
    [],
  );
  const cuff = useMemo(() => new THREE.MeshStandardMaterial({ color: "#a8141d", roughness: 0.45 }), []);
  useEffect(() => () => (glove.dispose(), cuff.dispose()), [glove, cuff]);
  const bag = useRef<THREE.Group>(null);
  const bagMat = useRef<THREE.MeshStandardMaterial>(null);
  const bandMat = useRef<THREE.MeshStandardMaterial>(null);
  const hands = useRef<(THREE.Group | null)[]>([]);
  const ropes = [0.55, 0.95, 1.35];

  useFrame(() => {
    const t = fs.space.combo;
    const solid = clamp01(fs.space.bag);
    if (bag.current) {
      bag.current.visible = solid > 0.01;
      const s = swing(t);
      bag.current.rotation.set(s.x, 0, s.z);
    }
    for (const m of [bagMat.current, bandMat.current]) if (m) m.opacity = solid;
    // Gloves: up into a guard close to the camera, then punches that twist
    // from the guard (knuckles up) to the landing pose and back.
    const show = smooth(seg(t, 0.28, 0.36));
    ([-1, 1] as Hand[]).forEach((hand, i) => {
      const g = hands.current[i];
      if (!g) return;
      g.visible = show > 0.01;
      const bob = Math.sin(t * 60 + i * 1.7) * 0.012;
      const guard = new THREE.Vector3(hand * GUARD.x, GUARD.y - (1 - show) * 0.7 + bob, GUARD.z);
      const p = guard.clone();
      const q = POSE.guard[i].clone();
      for (const c of COMBO) {
        if (c.hand !== hand) continue;
        const e = extension(t, c);
        if (!e) continue;
        // The fist turns over a little ahead of the reach, so it lands turned.
        const turn = Math.min(1, e * 1.25);
        if (c.kind === "hook") {
          // Elbow up, arcing in from the side, palm toward you.
          const a = e * Math.PI * 0.5;
          p.set(
            hand * (GUARD.x + Math.sin(a) * 0.42 - e * 0.64),
            guard.y + e * 0.18,
            guard.z - Math.sin(a) * (guard.z - BAG.r - 0.2),
          );
          q.slerpQuaternions(POSE.guard[i], POSE.hook[i], turn);
        } else {
          p.lerp(new THREE.Vector3(hand * 0.09, 2.44, BAG.r + 0.14), e);
          q.slerpQuaternions(POSE.guard[i], POSE.punch[i], turn);
        }
      }
      g.position.copy(p);
      g.quaternion.copy(q);
    });
  });

  return (
    <group>
      <Rise get={() => fs.rise.ring}>
        <mesh rotation-x={-Math.PI / 2} position-y={0.01}>
          <planeGeometry args={[7, 7]} />
          <meshStandardMaterial color={pal.lot} roughness={0.85} />
        </mesh>
        {[
          [-3.5, -3.5],
          [3.5, -3.5],
          [3.5, 3.5],
          [-3.5, 3.5],
        ].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.85, z]}>
            <cylinderGeometry args={[0.08, 0.08, 1.7, 12]} />
            <meshStandardMaterial color="#dcb077" metalness={0.6} roughness={0.35} />
          </mesh>
        ))}
        {ropes.map((y) =>
          [
            [0, -3.5, 0],
            [3.5, 0, Math.PI / 2],
            [-3.5, 0, Math.PI / 2],
          ].map(([x, z, r], k) => (
            <mesh key={`${y}-${k}`} position={[x, y, z]} rotation={[0, r, Math.PI / 2]}>
              <cylinderGeometry args={[0.025, 0.025, 7, 8]} />
              <meshStandardMaterial color={k ? "#f4ede3" : ROSSO} roughness={0.6} />
            </mesh>
          )),
        )}
      </Rise>
      {/* Heavy bag, swinging from its chain */}
      <group ref={bag} position={[0, BAG.pivot, 0]} visible={false}>
        <mesh position={[0, (BAG.top + 0.3 - BAG.pivot) / 2, 0]}>
          <cylinderGeometry args={[0.02, 0.02, BAG.pivot - BAG.top - 0.3, 6]} />
          <meshStandardMaterial color="#8d8a86" metalness={0.9} roughness={0.3} />
        </mesh>
        <mesh position={[0, (BAG.top + BAG.bottom) / 2 - BAG.pivot, 0]}>
          <capsuleGeometry args={[BAG.r, BAG.top - BAG.bottom - BAG.r, 8, 32]} />
          <meshStandardMaterial ref={bagMat} color="#2a1d16" roughness={0.55} transparent opacity={0} />
        </mesh>
        {[BAG.top - 0.35, BAG.bottom + 0.35].map((y) => (
          <mesh key={y} position={[0, y - BAG.pivot, 0]}>
            <cylinderGeometry args={[BAG.r + 0.012, BAG.r + 0.012, 0.12, 32]} />
            <meshStandardMaterial ref={y > 2 ? bandMat : undefined} color="#dcb077" metalness={0.5} roughness={0.4} transparent />
          </mesh>
        ))}
      </group>
      {([-1, 1] as Hand[]).map((hand, i) => (
        <group key={hand} ref={(g) => (hands.current[i] = g)} visible={false}>
          <group scale={[hand, 1, 1]}>
            <Suspense fallback={<ProceduralGlove mat={glove} cuff={cuff} />}>
              <GloveModel />
            </Suspense>
          </group>
        </group>
      ))}
    </group>
  );
};

/** All the "inside the screen" pieces, placed at WORLD.space. */
export const Space = ({
  fs,
  pal,
  desktop,
  particles,
}: {
  fs: FrameState;
  pal: Palette;
  desktop: THREE.Texture;
  particles: number;
}) => (
  <group position={WORLD.space}>
    <Tiles fs={fs} desktop={desktop} pal={pal} />
    <Morph fs={fs} pal={pal} count={particles} />
    <Boxing fs={fs} pal={pal} />
  </group>
);
