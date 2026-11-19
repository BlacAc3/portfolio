import {
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { Baked } from "./bake";
import { ProceduralCar, newCarControl } from "./Car";
import { CAR, COUPE_SHAPE, GT_SHAPE } from "./carGeometry";
import { BIKE_MODEL, F12_MODEL, WORLD } from "./chapters";
import type { FrameState } from "./frame";
import { curve1, easeOut, rand } from "./state";
import type { Palette } from "./palette";

/* ------------------------------------------------------------------ */
/* Pop-up wrapper                                                      */
/* ------------------------------------------------------------------ */

/**
 * A set that folds up out of the ground like a pop-up book page as `get()`
 * goes 0 → 1, and folds away again on the way out. Hidden while flat.
 */
export const Rise = ({
  get,
  children,
  position,
}: {
  get: () => number;
  children: ReactNode;
  position?: [number, number, number];
}) => {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    const v = get();
    g.visible = v > 0.002;
    const e = easeOut(Math.min(1, Math.max(0, v)));
    g.scale.set(0.94 + 0.06 * e, Math.max(0.001, e), 0.94 + 0.06 * e);
  });
  return (
    <group ref={ref} position={position} visible={false}>
      {children}
    </group>
  );
};

const canvasTex = (
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D) => void,
) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

/* ------------------------------------------------------------------ */
/* Road, ground, lamps                                                 */
/* ------------------------------------------------------------------ */

const ROAD_FROM = -80;
const ROAD_TO = 560;
const ROAD_W = 9;

export const Road = ({ pal }: { pal: Palette }) => {
  const tex = useMemo(() => {
    const t = canvasTex(512, 512, (ctx) => {
      ctx.fillStyle = pal.asphalt;
      ctx.fillRect(0, 0, 512, 512);
      // Grain
      const r = rand(7);
      for (let i = 0; i < 4000; i++) {
        ctx.fillStyle = `rgba(255,255,255,${r() * 0.035})`;
        ctx.fillRect(r() * 512, r() * 512, 2, 2);
      }
      ctx.fillStyle = pal.roadLine;
      // Edges (u across the road → canvas y)
      ctx.fillRect(0, 20, 512, 8);
      ctx.fillRect(0, 484, 512, 8);
      // Centre dashes
      ctx.fillRect(0, 252, 300, 8);
    });
    t.wrapS = THREE.RepeatWrapping;
    t.repeat.set((ROAD_TO - ROAD_FROM) / 9, 1);
    return t;
  }, [pal]);
  useEffect(() => () => tex.dispose(), [tex]);

  return (
    <group>
      <mesh
        rotation-x={-Math.PI / 2}
        position={[(ROAD_FROM + ROAD_TO) / 2, -0.01, 0]}
      >
        <planeGeometry args={[4000, 4000]} />
        <meshStandardMaterial color={pal.ground} roughness={1} />
      </mesh>
      <mesh
        rotation-x={-Math.PI / 2}
        position={[(ROAD_FROM + ROAD_TO) / 2, 0, 0]}
      >
        <planeGeometry args={[ROAD_TO - ROAD_FROM, ROAD_W]} />
        <meshStandardMaterial map={tex} roughness={0.9} />
      </mesh>
    </group>
  );
};

/** Street lamps on both verges: the clearest cue of speed. */
export const Lamps = ({ pal }: { pal: Palette }) => {
  const count = Math.floor((WORLD.meet - 6 - ROAD_FROM) / 16) * 2;
  const posts = useRef<THREE.InstancedMesh>(null);
  const heads = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    const m = new THREE.Matrix4();
    for (let i = 0; i < count; i++) {
      const side = i % 2 ? 1 : -1;
      const x = ROAD_FROM + Math.floor(i / 2) * 16 + (side > 0 ? 8 : 0);
      const z = side * (ROAD_W / 2 + 1.2);
      m.makeTranslation(x, 2.2, z);
      posts.current?.setMatrixAt(i, m);
      m.makeTranslation(x, 4.45, z - side * 0.7);
      heads.current?.setMatrixAt(i, m);
    }
    if (posts.current) posts.current.instanceMatrix.needsUpdate = true;
    if (heads.current) heads.current.instanceMatrix.needsUpdate = true;
  }, [count]);
  return (
    <group>
      <instancedMesh
        ref={posts}
        args={[undefined, undefined, count]}
        frustumCulled={false}
      >
        <boxGeometry args={[0.12, 4.4, 0.12]} />
        <meshStandardMaterial color={pal.metal} roughness={0.6} />
      </instancedMesh>
      <instancedMesh
        ref={heads}
        args={[undefined, undefined, count]}
        frustumCulled={false}
      >
        <boxGeometry args={[0.5, 0.1, 1.5]} />
        <meshStandardMaterial
          color="#fff3dc"
          emissive="#ffd9a0"
          emissiveIntensity={pal.night ? 2.4 : 0.6}
        />
      </instancedMesh>
    </group>
  );
};

/** Wind streaks that trail the car when it's quick. */
export const Streaks = ({ fs }: { fs: FrameState }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const seeds = useMemo(() => {
    const r = rand(42);
    return Array.from({ length: 36 }, () => ({
      y: 0.3 + r() * 2.2,
      z: (r() - 0.5) * 6,
      o: r() * 40,
      len: 1.5 + r() * 3,
    }));
  }, []);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(() => {
    const im = ref.current;
    if (!im) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const sp = Math.min(1, fs.speed / 60);
    if (mat.current) mat.current.opacity = sp * 0.35;
    im.visible = sp > 0.05;
    seeds.forEach((s, i) => {
      const x = fs.car.x + 14 - ((fs.car.x * 0.8 + s.o) % 40);
      m.compose(
        new THREE.Vector3(x, s.y, s.z),
        q,
        new THREE.Vector3(s.len * sp, 1, 1),
      );
      im.setMatrixAt(i, m);
    });
    im.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh
      ref={ref}
      args={[undefined, undefined, seeds.length]}
      frustumCulled={false}
    >
      <boxGeometry args={[1, 0.012, 0.012]} />
      <meshBasicMaterial
        ref={mat}
        color="#f4ede3"
        transparent
        opacity={0}
        depthWrite={false}
      />
    </instancedMesh>
  );
};

/* ------------------------------------------------------------------ */
/* Motorbike                                                           */
/* ------------------------------------------------------------------ */

const BikeWheel = ({
  x,
  spin,
}: {
  x: number;
  spin: (g: THREE.Group | null) => void;
}) => (
  <group position={[x, 0.32, 0]}>
    <group ref={spin}>
      <mesh>
        <torusGeometry args={[0.28, 0.06, 12, 32]} />
        <meshStandardMaterial color="#141210" roughness={0.8} />
      </mesh>
      {[0, 1, 2].map((k) => (
        <mesh key={k} rotation-z={(k / 3) * Math.PI}>
          <boxGeometry args={[0.03, 0.5, 0.02]} />
          <meshStandardMaterial
            color="#dcb077"
            metalness={0.6}
            roughness={0.35}
          />
        </mesh>
      ))}
    </group>
  </group>
);

/** Low-poly stand-in while the real bike loads. */
const ProceduralBike = ({ fs, color }: { fs: FrameState; color: string }) => {
  const spins = useRef<(THREE.Group | null)[]>([]);
  useFrame(() =>
    spins.current.forEach((s) => s && (s.rotation.z = -fs.bike.travel / 0.32)),
  );
  return (
    <group>
      <BikeWheel x={0.72} spin={(g) => (spins.current[0] = g)} />
      <BikeWheel x={-0.68} spin={(g) => (spins.current[1] = g)} />
      <mesh position={[0.35, 0.68, 0]} rotation-z={-0.35}>
        <capsuleGeometry args={[0.16, 0.55, 6, 14]} />
        <meshPhysicalMaterial
          color={color}
          metalness={0.4}
          roughness={0.3}
          clearcoat={1}
        />
      </mesh>
      <mesh position={[-0.05, 0.78, 0]} rotation-z={Math.PI / 2}>
        <capsuleGeometry args={[0.15, 0.35, 6, 14]} />
        <meshPhysicalMaterial
          color={color}
          metalness={0.4}
          roughness={0.3}
          clearcoat={1}
        />
      </mesh>
      <mesh position={[0.05, 0.45, 0]}>
        <boxGeometry args={[0.55, 0.28, 0.22]} />
        <meshStandardMaterial
          color="#2b2b2e"
          metalness={0.8}
          roughness={0.35}
        />
      </mesh>
    </group>
  );
};

/** Split a mesh that holds both wheels' parts into front (x > at) and rear. */
const splitAtX = (mesh: THREE.Mesh, at: number) => {
  const g = mesh.geometry;
  const pos = g.attributes.position;
  const idx = g.index;
  const n = idx ? idx.count : pos.count;
  const get = (i: number) => (idx ? idx.getX(i) : i);
  const v = new THREE.Vector3();
  const sides: number[][] = [[], []];
  for (let i = 0; i < n; i += 3) {
    let x = 0;
    for (let k = 0; k < 3; k++)
      x += v
        .fromBufferAttribute(pos, get(i + k))
        .applyMatrix4(mesh.matrixWorld).x;
    sides[x / 3 > at ? 0 : 1].push(get(i), get(i + 1), get(i + 2));
  }
  return sides.map((tri) => {
    const ng = new THREE.BufferGeometry();
    for (const [name, attr] of Object.entries(g.attributes))
      ng.setAttribute(name, attr);
    ng.setIndex(tri);
    const m = new THREE.Mesh(ng, mesh.material);
    m.matrix.copy(mesh.matrixWorld);
    m.matrix.decompose(m.position, m.quaternion, m.scale);
    return m;
  });
};

/**
 * The Panigale V4 SP. Tyres, rims and discs are regrouped onto one pivot
 * per wheel so they can spin.
 */
const Ducati = ({ fs }: { fs: FrameState }) => {
  const { scene } = useGLTF(BIKE_MODEL, false);
  const { root, wheels, geos } = useMemo(() => {
    const root = scene.clone(true);
    root.updateMatrixWorld(true);
    const tyre = (n: string) => {
      let t: THREE.Mesh | undefined;
      root.traverse((o) => {
        if (
          (o as THREE.Mesh).isMesh &&
          ((o as THREE.Mesh).material as THREE.Material).name === n
        )
          t = o as THREE.Mesh;
      });
      return t;
    };
    const front = tyre("mat_fronttyre001");
    const back = tyre("mat_backtyre001");
    const wheels: { pivot: THREE.Group; r: number }[] = [];
    const geos: THREE.BufferGeometry[] = [];
    if (!front || !back) return { root, wheels, geos };
    const boxF = new THREE.Box3().setFromObject(front);
    const boxB = new THREE.Box3().setFromObject(back);
    const cF = boxF.getCenter(new THREE.Vector3());
    const cB = boxB.getCenter(new THREE.Vector3());
    const pivots = [cF, cB].map((c) => {
      const p = new THREE.Group();
      p.position.copy(c);
      root.add(p);
      p.updateMatrixWorld(true);
      return p;
    });
    pivots[0].attach(front);
    pivots[1].attach(back);
    // Rims and discs come as one mesh for both wheels.
    const shared: THREE.Mesh[] = [];
    root.traverse((o) => {
      const m = o as THREE.Mesh;
      if (
        m.isMesh &&
        /rim160|brake160/.test((m.material as THREE.Material).name)
      )
        shared.push(m);
    });
    const mid = (cF.x + cB.x) / 2;
    for (const m of shared) {
      const halves = splitAtX(m, mid);
      m.removeFromParent();
      halves.forEach((h, i) => {
        root.add(h);
        root.updateMatrixWorld(true);
        pivots[i].attach(h);
        geos.push(h.geometry);
      });
    }
    wheels.push(
      { pivot: pivots[0], r: (boxF.max.y - boxF.min.y) / 2 },
      { pivot: pivots[1], r: (boxB.max.y - boxB.min.y) / 2 },
    );
    return { root, wheels, geos };
  }, [scene]);
  useEffect(() => () => geos.forEach((g) => g.dispose()), [geos]);
  useFrame(() => {
    for (const w of wheels) w.pivot.rotation.z = -fs.bike.travel / w.r;
  });
  return <primitive object={root} />;
};

/** A sports bike with its rider (rider hides when the bike is parked). */
export const Bike = ({ fs, pal }: { fs: FrameState; pal: Palette }) => {
  const ref = useRef<THREE.Group>(null);
  const lean = useRef<THREE.Group>(null);
  const rider = useRef<THREE.Group>(null);
  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    g.visible = fs.bike.visible;
    g.position.set(fs.bike.x, 0, fs.bike.z);
    if (lean.current) lean.current.rotation.x = fs.bike.lean;
    if (rider.current) rider.current.visible = fs.bike.parked < 0.5;
    // Parked: on its side stand.
    g.rotation.x = fs.bike.parked * 0.18;
  });
  return (
    <group ref={ref}>
      <group ref={lean}>
        <Suspense fallback={<ProceduralBike fs={fs} color={pal.bike} />}>
          <Ducati fs={fs} />
        </Suspense>
        {/* Rider, tucked in behind the screen */}
        <group ref={rider}>
          <mesh position={[0.02, 1.13, 0]} rotation-z={-1.2}>
            <capsuleGeometry args={[0.17, 0.42, 6, 12]} />
            <meshStandardMaterial color="#1c1a18" roughness={0.7} />
          </mesh>
          <mesh position={[0.4, 1.24, 0]}>
            <sphereGeometry args={[0.15, 20, 16]} />
            <meshPhysicalMaterial
              color="#f4ede3"
              clearcoat={1}
              roughness={0.2}
            />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[-0.22, 0.82, s * 0.2]} rotation-z={0.75}>
              <capsuleGeometry args={[0.07, 0.42, 4, 8]} />
              <meshStandardMaterial color="#1c1a18" roughness={0.7} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
};

useGLTF.preload(BIKE_MODEL, false);

/* ------------------------------------------------------------------ */
/* The meet                                                            */
/* ------------------------------------------------------------------ */

const PARKED = [
  { x: 12.5, z: -4.2, yaw: 0.55, color: "#e6e1d8", coupe: true },
  { x: -1.5, z: -4.8, yaw: 0.55, color: "#21402f", coupe: false, f12: true },
  { x: 7.5, z: -4.6, yaw: 0.55, color: "#e0b400", coupe: true },
  { x: -10, z: 4.2, yaw: -0.8 + Math.PI, color: "#3a3d42", coupe: false },
  { x: 10.5, z: 3.6, yaw: 0.8 + Math.PI, color: "#1d3a6b", coupe: true },
];

/** The twin-turbo F12berlinetta, repainted to its bay's colour. Faces +X like every car here. */
const F12 = ({ color }: { color: string }) => {
  const { scene } = useGLTF(F12_MODEL, false);
  const { root, paint } = useMemo(() => {
    const root = scene.clone(true);
    const paint = new THREE.MeshPhysicalMaterial({
      color,
      metalness: 0.55,
      roughness: 0.3,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
    });
    root.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh && (m.material as THREE.Material).name === "carpaint")
        m.material = paint;
    });
    const box = new THREE.Box3().setFromObject(root);
    root.position.y = -box.min.y;
    return { root, paint };
  }, [scene, color]);
  useEffect(() => () => paint.dispose(), [paint]);
  return (
    <group rotation-y={Math.PI / 2}>
      <primitive object={root} />
    </group>
  );
};

useGLTF.preload(F12_MODEL, false);

/** String lights strung between poles, sagging in a catenary. */
const StringLights = ({
  from,
  to,
  pal,
}: {
  from: THREE.Vector3;
  to: THREE.Vector3;
  pal: Palette;
}) => {
  const bulbs = useMemo(() => {
    const out: THREE.Vector3[] = [];
    for (let i = 0; i <= 22; i++) {
      const t = i / 22;
      const p = from.clone().lerp(to, t);
      p.y -= Math.sin(t * Math.PI) * 0.6;
      out.push(p);
    }
    return out;
  }, [from, to]);
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const im = ref.current;
    if (!im) return;
    const m = new THREE.Matrix4();
    bulbs.forEach((p, i) =>
      im.setMatrixAt(i, m.makeTranslation(p.x, p.y, p.z)),
    );
    im.instanceMatrix.needsUpdate = true;
    im.computeBoundingSphere();
  }, [bulbs]);
  // One draw call per string.
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, bulbs.length]}>
      <sphereGeometry args={[0.05, 10, 8]} />
      <meshStandardMaterial
        color="#fff2d6"
        emissive="#ffcf87"
        emissiveIntensity={pal.night ? 3 : 1}
      />
    </instancedMesh>
  );
};

const STRINGS: [THREE.Vector3, THREE.Vector3][] = [
  [new THREE.Vector3(-11, 3.9, -7.5), new THREE.Vector3(11, 3.9, -7.5)],
  [new THREE.Vector3(-11, 3.9, -10.5), new THREE.Vector3(11, 3.9, -10.5)],
  [new THREE.Vector3(-11, 3.9, -7.5), new THREE.Vector3(11, 3.9, -10.5)],
];

export const Meet = ({ fs, pal }: { fs: FrameState; pal: Palette }) => {
  const parkedCtl = useMemo(() => PARKED.map(() => newCarControl()), []);
  const poles: [number, number][] = [
    [-11, -7.5],
    [11, -7.5],
    [-11, -10.5],
    [11, -10.5],
  ];
  return (
    <Rise get={() => fs.rise.meet} position={[WORLD.meet, 0, 0]}>
      <mesh rotation-x={-Math.PI / 2} position-y={0.012}>
        <circleGeometry args={[13, 64]} />
        <meshStandardMaterial color={pal.lot} roughness={0.95} />
      </mesh>
      {/* Parking bays */}
      {PARKED.map((p, i) => (
        <group key={i} position={[p.x, 0, p.z]} rotation-y={p.yaw}>
          {p.f12 ? (
            <Suspense
              fallback={
                <ProceduralCar
                  ctl={parkedCtl[i]}
                  color={p.color}
                  shape={GT_SHAPE}
                />
              }
            >
              <F12 color={p.color} />
            </Suspense>
          ) : (
            // Parked cars never move: bake ~50 parts into a few meshes.
            <Baked bakeKey={p.color}>
              <ProceduralCar
                ctl={parkedCtl[i]}
                color={p.color}
                shape={p.coupe ? COUPE_SHAPE : GT_SHAPE}
              />
            </Baked>
          )}
        </group>
      ))}
      {poles.map(([x, z], i) => (
        <mesh key={i} position={[x, 2, z]}>
          <cylinderGeometry args={[0.07, 0.09, 4, 10]} />
          <meshStandardMaterial color={pal.metal} />
        </mesh>
      ))}
      {STRINGS.map(([from, to], i) => (
        <StringLights key={i} from={from} to={to} pal={pal} />
      ))}
      {/* Cones */}
      {[-9, 9].map((x) => (
        <mesh key={x} position={[x, 0.3, -2.8]}>
          <coneGeometry args={[0.22, 0.6, 14]} />
          <meshStandardMaterial color="#e2702b" roughness={0.6} />
        </mesh>
      ))}
    </Rise>
  );
};

/* ------------------------------------------------------------------ */
/* Workshop                                                            */
/* ------------------------------------------------------------------ */

const pegboard = (pal: Palette) =>
  canvasTex(1024, 384, (ctx) => {
    ctx.fillStyle = pal.wall;
    ctx.fillRect(0, 0, 1024, 384);
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    for (let y = 12; y < 384; y += 24)
      for (let x = 12; x < 1024; x += 24) ctx.fillRect(x, y, 3, 3);
    // Tool silhouettes
    ctx.fillStyle = pal.tool;
    const r = rand(3);
    for (let i = 0; i < 22; i++) {
      const x = 40 + i * 44;
      const h = 80 + r() * 120;
      ctx.fillRect(x, 60, 8, h);
      if (i % 3 === 0) {
        ctx.beginPath();
        ctx.arc(x + 4, 60 + h, 16, 0, Math.PI * 2);
        ctx.fill();
      } else ctx.fillRect(x - 8, 60 + h - 10, 24, 18);
    }
    ctx.fillStyle = "#dcb077";
    ctx.fillRect(0, 330, 1024, 10);
  });

const floorLines = (pal: Palette) =>
  canvasTex(1024, 1024, (ctx) => {
    ctx.fillStyle = pal.floor;
    ctx.fillRect(0, 0, 1024, 1024);
    ctx.strokeStyle = "#dcb077";
    ctx.lineWidth = 10;
    ctx.strokeRect(250, 300, 524, 424);
    ctx.setLineDash([30, 24]);
    ctx.strokeRect(120, 160, 784, 704);
  });

export const Workshop = ({ fs, pal }: { fs: FrameState; pal: Palette }) => {
  const textures = useMemo(
    () => ({ wall: pegboard(pal), floor: floorLines(pal) }),
    [pal],
  );
  useEffect(
    () => () => Object.values(textures).forEach((t) => t.dispose()),
    [textures],
  );
  const armRefs = useRef<(THREE.Mesh | null)[]>([]);
  const legRefs = useRef<(THREE.Mesh | null)[]>([]);
  useFrame(() => {
    const h = fs.car.ctl.lift;
    armRefs.current.forEach((a) => a && (a.position.y = h - 0.03));
    // Each leg spans the gap diagonally; flat when the lift is down.
    const ang = Math.asin(Math.min(1, Math.max(0, h - 0.06) / 2.4));
    legRefs.current.forEach((l, k) => {
      if (!l) return;
      l.position.y = Math.max(0.035, (h - 0.06) / 2);
      l.rotation.z = k % 2 ? ang : -ang;
      l.visible = h > 0.02;
    });
  });
  return (
    <Rise get={() => fs.rise.workshop} position={[WORLD.workshop, 0, 0]}>
      <mesh rotation-x={-Math.PI / 2} position-y={0.012}>
        <planeGeometry args={[16, 13]} />
        <meshStandardMaterial
          map={textures.floor}
          roughness={0.45}
          metalness={0.1}
        />
      </mesh>
      {/* Back wall with tools, right wall; the front and left stay open. */}
      <mesh position={[0, 2.6, -6.5]}>
        <planeGeometry args={[16, 5.2]} />
        <meshStandardMaterial map={textures.wall} roughness={0.9} />
      </mesh>
      <mesh position={[8, 2.6, 0]} rotation-y={-Math.PI / 2}>
        <planeGeometry args={[13, 5.2]} />
        <meshStandardMaterial color={pal.wall} roughness={0.9} />
      </mesh>
      {/* Scissor lift: runways under the wheels, nothing in front of the car */}
      {[-1, 1].map((side, i) => (
        <group key={side} position-z={side * CAR.track}>
          <mesh ref={(m) => (armRefs.current[i] = m)} position-y={-0.03}>
            <boxGeometry args={[4.4, 0.06, 0.46]} />
            <meshStandardMaterial
              color="#c4952e"
              metalness={0.3}
              roughness={0.5}
            />
          </mesh>
          {[-1, 1].map((d) => (
            <mesh
              key={d}
              ref={(m) => (legRefs.current[i * 2 + (d < 0 ? 0 : 1)] = m)}
            >
              <boxGeometry args={[2.4, 0.07, 0.1]} />
              <meshStandardMaterial
                color="#8d8a86"
                metalness={0.8}
                roughness={0.35}
              />
            </mesh>
          ))}
        </group>
      ))}
      {/* Tool chest */}
      <group position={[4.8, 0, -5.6]}>
        <mesh position-y={0.55}>
          <boxGeometry args={[1.6, 1.1, 0.7]} />
          <meshStandardMaterial
            color="#8f1d22"
            metalness={0.4}
            roughness={0.4}
          />
        </mesh>
        {[0.25, 0.5, 0.75, 1].map((y) => (
          <mesh key={y} position={[0, y, 0.36]}>
            <boxGeometry args={[1.4, 0.02, 0.02]} />
            <meshStandardMaterial
              color="#d8d4cc"
              metalness={0.9}
              roughness={0.2}
            />
          </mesh>
        ))}
      </group>
      {/* Tyre stack */}
      {[0, 1, 2, 3].map((k) => (
        <mesh
          key={k}
          position={[-5.5, 0.16 + k * 0.3, -5.2]}
          rotation-x={Math.PI / 2}
        >
          <torusGeometry args={[0.34, 0.14, 12, 28]} />
          <meshStandardMaterial color="#151311" roughness={0.85} />
        </mesh>
      ))}
      {/* Overhead light bars */}
      {[-2.4, 2.4].map((z) => (
        <mesh key={z} position={[0, 4.8, z]}>
          <boxGeometry args={[6, 0.06, 0.25]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#fff4e2"
            emissiveIntensity={2.5}
          />
        </mesh>
      ))}
    </Rise>
  );
};

/* ------------------------------------------------------------------ */
/* Wind tunnel                                                         */
/* ------------------------------------------------------------------ */

/** A thin tube along a streamline, with dashes of air flowing down it. */
const flowMat = (color: string) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uPhase: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uTime; uniform float uOpacity; uniform vec3 uColor; uniform float uPhase;
      varying vec2 vUv;
      void main() {
        float d = fract(vUv.x * 7.0 - uTime * 0.9 + uPhase);
        float dash = smoothstep(0.0, 0.15, d) * (1.0 - smoothstep(0.45, 0.8, d));
        float ends = smoothstep(0.0, 0.12, vUv.x) * (1.0 - smoothstep(0.88, 1.0, vUv.x));
        gl_FragColor = vec4(uColor, (0.2 + dash) * ends * uOpacity);
      }`,
  });

export const WindTunnel = ({ fs, pal }: { fs: FrameState; pal: Palette }) => {
  const lines = useMemo(() => {
    const out: { geo: THREE.TubeGeometry; mat: THREE.ShaderMaterial }[] = [];
    const r = rand(11);
    // Over the roof: lines that hug the profile, loosening with height.
    for (let k = 0; k < 9; k++) {
      const z = (k - 4) * 0.17;
      const clear = 0.05 + (k % 3) * 0.12;
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 60; i++) {
        const x = -6 + (12 * i) / 60;
        const xb = Math.max(-CAR.half, Math.min(CAR.half, x));
        const top = curve1(GT_SHAPE.top, xb);
        const reach = Math.exp(
          -Math.pow(Math.max(0, Math.abs(x) - CAR.half) / 1.6, 2),
        );
        const y =
          THREE.MathUtils.lerp(0.75 + clear, top + clear, reach) -
          (x < -CAR.half ? (-CAR.half - x) * 0.06 : 0);
        pts.push(new THREE.Vector3(x, y, z * (1 - 0.2 * reach)));
      }
      const geo = new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(pts),
        160,
        0.012,
        5,
      );
      const mat = flowMat(k % 4 === 0 ? "#f4ede3" : "#dcb077");
      mat.uniforms.uPhase.value = r();
      out.push({ geo, mat });
    }
    // Along the flanks.
    for (const side of [-1, 1]) {
      for (const h of [0.48, 0.74]) {
        const pts: THREE.Vector3[] = [];
        for (let i = 0; i <= 60; i++) {
          const x = -6 + (12 * i) / 60;
          const xb = Math.max(-CAR.half, Math.min(CAR.half, x));
          const reach = Math.exp(
            -Math.pow(Math.max(0, Math.abs(x) - CAR.half) / 1.4, 2),
          );
          const w = curve1(GT_SHAPE.halfW, xb) + 0.06;
          pts.push(
            new THREE.Vector3(x, h, side * THREE.MathUtils.lerp(0.5, w, reach)),
          );
        }
        const geo = new THREE.TubeGeometry(
          new THREE.CatmullRomCurve3(pts),
          160,
          0.012,
          5,
        );
        const mat = flowMat("#dcb077");
        mat.uniforms.uPhase.value = r();
        out.push({ geo, mat });
      }
    }
    return out;
  }, []);
  useEffect(
    () => () => lines.forEach((l) => (l.geo.dispose(), l.mat.dispose())),
    [lines],
  );

  const gridTex = useMemo(() => {
    const t = canvasTex(256, 256, (ctx) => {
      ctx.fillStyle = pal.tunnel;
      ctx.fillRect(0, 0, 256, 256);
      ctx.strokeStyle = pal.tunnelLine;
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, 256, 256);
    });
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(24, 10);
    return t;
  }, [pal]);
  useEffect(() => () => gridTex.dispose(), [gridTex]);

  useFrame(() => {
    for (const l of lines) {
      l.mat.uniforms.uTime.value = fs.time;
      l.mat.uniforms.uOpacity.value = fs.streams;
    }
  });

  return (
    <group position={[WORLD.workshop, 0, 0]}>
      <Rise get={() => fs.rise.tunnel}>
        <mesh position={[0, 0, 0]} rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[7.5, 7.5, 34, 48, 1, true, 0, Math.PI]} />
          <meshStandardMaterial
            map={gridTex}
            side={THREE.BackSide}
            roughness={0.95}
          />
        </mesh>
        <mesh rotation-x={-Math.PI / 2} position-y={0.02}>
          <planeGeometry args={[34, 15]} />
          <meshStandardMaterial map={gridTex} roughness={0.9} />
        </mesh>
      </Rise>
      {lines.map((l, i) => (
        <mesh key={i} geometry={l.geo} material={l.mat} renderOrder={3} />
      ))}
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* Home: house and garage                                              */
/* ------------------------------------------------------------------ */

export const GARAGE = { x0: WORLD.home, len: 7.6, halfW: 2.8 };
/** The monitor on the workbench, in world space (faces -x). */
export const MONITOR = {
  pos: new THREE.Vector3(WORLD.home + 7.305, 1.42, 1.65),
  w: 0.96,
  h: 0.54,
};

export const Garage = ({
  fs,
  pal,
  screen,
}: {
  fs: FrameState;
  pal: Palette;
  screen: THREE.Texture;
}) => {
  const glow = useRef<THREE.MeshBasicMaterial>(null);
  const lamp = useRef<THREE.PointLight>(null);
  useFrame(() => {
    if (glow.current) glow.current.color.setScalar(0.35 + 0.65 * fs.screen);
    if (lamp.current) lamp.current.intensity = fs.rise.garage * 14;
  });
  const { x0, len, halfW } = GARAGE;
  const cx = len / 2;
  return (
    <>
      {/* Outside the Rise so it's never hidden: hiding a light changes the
        scene's light count and makes every material recompile. It fades
        to zero instead. */}
      <pointLight
        ref={lamp}
        position={[x0 + cx, 2.8, 0]}
        color="#ffcf8a"
        intensity={0}
        distance={12}
        decay={1.6}
      />
      <Rise get={() => fs.rise.garage} position={[x0, 0, 0]}>
        <mesh rotation-x={-Math.PI / 2} position={[cx, 0.012, 0]}>
          <planeGeometry args={[len, halfW * 2]} />
          <meshStandardMaterial color={pal.floor} roughness={0.6} />
        </mesh>
        {/* Back and end walls; the near side is cut away like a doll's house. */}
        <mesh position={[cx, 1.6, -halfW]}>
          <boxGeometry args={[len, 3.2, 0.12]} />
          <meshStandardMaterial color={pal.wall} roughness={0.9} />
        </mesh>
        <mesh position={[len, 1.6, 0]}>
          <boxGeometry args={[0.12, 3.2, halfW * 2]} />
          <meshStandardMaterial color={pal.wall} roughness={0.9} />
        </mesh>
        <mesh position={[cx, 3.25, -0.6]}>
          <boxGeometry args={[len + 0.2, 0.12, halfW * 2 - 1.2]} />
          <meshStandardMaterial color={pal.roof} roughness={0.9} />
        </mesh>
        {/* Door header */}
        <mesh position={[0, 2.9, 0]}>
          <boxGeometry args={[0.18, 0.6, halfW * 2]} />
          <meshStandardMaterial color={pal.roof} roughness={0.8} />
        </mesh>
        {/* Workbench, monitor, keyboard */}
        <group position={[len - 0.45, 0, 1.65]}>
          <mesh position-y={0.85}>
            <boxGeometry args={[0.7, 0.06, 1.8]} />
            <meshStandardMaterial color="#5a3d26" roughness={0.7} />
          </mesh>
          {[-0.8, 0.8].map((z) => (
            <mesh key={z} position={[0, 0.42, z]}>
              <boxGeometry args={[0.6, 0.84, 0.05]} />
              <meshStandardMaterial color="#2b2b2e" />
            </mesh>
          ))}
          <mesh position={[0.18, 1.42, 0]}>
            <boxGeometry args={[0.04, MONITOR.h + 0.05, MONITOR.w + 0.05]} />
            <meshStandardMaterial color="#121212" roughness={0.4} />
          </mesh>
          <mesh position={[0.155, 1.42, 0]} rotation-y={-Math.PI / 2}>
            <planeGeometry args={[MONITOR.w, MONITOR.h]} />
            <meshBasicMaterial ref={glow} map={screen} toneMapped={false} />
          </mesh>
          <mesh position={[0.2, 1.05, 0]}>
            <boxGeometry args={[0.05, 0.4, 0.06]} />
            <meshStandardMaterial color="#121212" />
          </mesh>
          <mesh position={[-0.08, 0.9, 0]}>
            <boxGeometry args={[0.16, 0.025, 0.5]} />
            <meshStandardMaterial color="#2f2822" />
          </mesh>
        </group>
        {/* The house next door, lights on */}
        <group position={[cx + 1, 0, -halfW - 4.6]}>
          <mesh position-y={2.4}>
            <boxGeometry args={[10, 4.8, 8.6]} />
            <meshStandardMaterial color={pal.house} roughness={0.9} />
          </mesh>
          <mesh position={[0, 5.6, 0]} rotation-y={Math.PI / 2}>
            <cylinderGeometry args={[0.01, 6.4, 1.8, 4, 1]} />
            <meshStandardMaterial color={pal.roof} roughness={0.9} />
          </mesh>
          {[-3, 0, 3].map((x) => (
            <mesh key={x} position={[x, 2.6, 4.31]}>
              <planeGeometry args={[1.4, 1.6]} />
              <meshStandardMaterial
                color="#ffd497"
                emissive="#ffb85c"
                emissiveIntensity={pal.night ? 1.8 : 0.5}
              />
            </mesh>
          ))}
        </group>
      </Rise>
    </>
  );
};
