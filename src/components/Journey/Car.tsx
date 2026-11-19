// First: counts the model requests the preloads below send.
import "./loadTracker";
import { Suspense, useEffect, useMemo, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { CAR, GT_SHAPE, buildBody, type BodyShape } from "./carGeometry";
import { CAR_MODEL, ROSSO } from "./chapters";
import { clamp01, lerp, seg, smooth } from "./state";

/** Per-frame car controls, written by the scene director. */
export interface CarControl {
  /** Distance travelled (m): spins the wheels. */
  travel: number;
  /** 0 assembled → 1 fully exploded. */
  explode: number;
  /** 0 paint → 1 zebra-stripe surface analysis. */
  zebra: number;
  /** Brake lights, 0 → 1. */
  brake: number;
  /** Lift height (workshop), metres. */
  lift: number;
  /** Exploded-view labels, 0 → 1. */
  labels: number;
}

export const newCarControl = (): CarControl => ({
  travel: 0,
  explode: 0,
  zebra: 0,
  brake: 0,
  lift: 0,
  labels: 0,
});

/* ------------------------------------------------------------------ */
/* Materials                                                           */
/* ------------------------------------------------------------------ */

const paintMat = (color: string) =>
  new THREE.MeshPhysicalMaterial({
    color,
    vertexColors: true,
    metalness: 0.45,
    roughness: 0.3,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
  });

/**
 * Zebra analysis: stripes from the reflected view vector, like the
 * class-A surfacing checks in a car design studio. Smooth surfaces give
 * smooth stripes; any kink breaks them.
 */
const zebraMat = (plain = false) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -8,
    uniforms: { uOpacity: { value: 0 }, uDark: { value: new THREE.Color("#120e0b") }, uLight: { value: new THREE.Color("#f4ede3") } },
    vertexShader: /* glsl */ `
      varying vec3 vN;
      varying vec3 vV;
      varying vec3 vC;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = -mv.xyz;
        ${plain ? "vC = vec3(1.0);" : "vC = color;"}
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uOpacity;
      uniform vec3 uDark;
      uniform vec3 uLight;
      varying vec3 vN;
      varying vec3 vV;
      varying vec3 vC;
      void main() {
        vec3 r = reflect(-normalize(vV), normalize(vN));
        float f = fract(r.y * 5.0 + r.x * 1.2);
        float w = fwidth(r.y * 5.0) * 1.5;
        float s = smoothstep(0.5 - w, 0.5 + w, f) - smoothstep(1.0 - w, 1.0, f);
        vec3 col = mix(uDark, uLight, s);
        // Glass and trim stay dark so the body surfaces read.
        ${plain ? "" : "col = mix(uDark * 0.6, col, step(0.5, vC.r));"}
        gl_FragColor = vec4(col, uOpacity);
      }`,
    vertexColors: !plain,
  });

const rubber = new THREE.MeshStandardMaterial({ color: "#141210", roughness: 0.85 });
const alloy = new THREE.MeshStandardMaterial({ color: "#2b2b2e", metalness: 0.9, roughness: 0.3 });
const steel = new THREE.MeshStandardMaterial({ color: "#8d8a86", metalness: 0.85, roughness: 0.35 });
const carbon = new THREE.MeshStandardMaterial({ color: "#1d1d20", metalness: 0.3, roughness: 0.45 });
const gold = new THREE.MeshStandardMaterial({ color: "#dcb077", metalness: 0.6, roughness: 0.35 });
const leather = new THREE.MeshStandardMaterial({ color: "#2a1d16", roughness: 0.7 });
const camCover = new THREE.MeshPhysicalMaterial({ color: ROSSO, roughness: 0.4, clearcoat: 0.6 });

/* ------------------------------------------------------------------ */
/* Parts                                                               */
/* ------------------------------------------------------------------ */

const Wheel = ({ spinRef }: { spinRef: (g: THREE.Group | null) => void }) => {
  const { wheelR, tireW } = CAR;
  return (
    <group>
      <group ref={spinRef}>
        <mesh material={rubber} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[wheelR, wheelR, tireW, 36]} />
        </mesh>
        <mesh material={alloy} rotation-x={Math.PI / 2} position-z={0.005}>
          <cylinderGeometry args={[wheelR * 0.74, wheelR * 0.74, tireW + 0.012, 36]} />
        </mesh>
        {[0, 1, 2, 3, 4].map((k) => (
          <mesh key={k} material={steel} rotation-z={(k / 5) * Math.PI * 2} position-z={tireW / 2 + 0.01}>
            <boxGeometry args={[0.05, wheelR * 1.4, 0.02]} />
          </mesh>
        ))}
        <mesh material={steel} position-z={tireW / 2 + 0.015} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.05, 0.05, 0.02, 16]} />
        </mesh>
        {/* Carbon-ceramic disc */}
        <mesh material={carbon} rotation-x={Math.PI / 2} position-z={tireW / 2 - 0.06}>
          <cylinderGeometry args={[wheelR * 0.64, wheelR * 0.64, 0.03, 32]} />
        </mesh>
      </group>
      {/* Caliper: doesn't spin. */}
      <mesh material={gold} position={[0.12, 0.14, tireW / 2 - 0.035]} rotation-z={-0.7}>
        <boxGeometry args={[0.09, 0.2, 0.06]} />
      </mesh>
    </group>
  );
};

/** 65° V12: two banks of six, red cam covers, plenum on top. */
const Engine = () => (
  <group>
    <mesh material={alloy} position-y={0.1}>
      <boxGeometry args={[0.95, 0.3, 0.42]} />
    </mesh>
    {[-1, 1].map((side) => (
      <group key={side} position={[0, 0.27, side * 0.14]} rotation-x={side * 0.57}>
        {Array.from({ length: 6 }, (_, k) => (
          <mesh key={k} material={steel} position={[-0.4 + k * 0.16, 0.06, 0]}>
            <cylinderGeometry args={[0.055, 0.055, 0.2, 14]} />
          </mesh>
        ))}
        <mesh material={camCover} position-y={0.19}>
          <boxGeometry args={[0.98, 0.07, 0.15]} />
        </mesh>
      </group>
    ))}
    <mesh material={carbon} position-y={0.42}>
      <boxGeometry args={[0.7, 0.1, 0.14]} />
    </mesh>
  </group>
);

const Seat = () => (
  <group>
    <mesh material={leather} position-y={0.06}>
      <boxGeometry args={[0.5, 0.1, 0.46]} />
    </mesh>
    <mesh material={leather} position={[-0.24, 0.36, 0]} rotation-z={0.22}>
      <boxGeometry args={[0.1, 0.62, 0.44]} />
    </mesh>
  </group>
);

/** Aluminium spaceframe: what's left on the lift when everything comes off. */
const Frame = () => {
  const rails: [V, V][] = [];
  type V = [number, number, number];
  for (const z of [-0.58, 0.58]) {
    rails.push([[-2.05, 0.3, z], [2.05, 0.3, z]]);
    rails.push([[-0.25, 0.3, z], [0.1, 1.08, z * 0.78]]);
    rails.push([[-1.5, 0.3, z], [-1.05, 1.05, z * 0.78]]);
  }
  rails.push([[0.1, 1.08, -0.45], [0.1, 1.08, 0.45]]);
  rails.push([[-1.05, 1.05, -0.45], [-1.05, 1.05, 0.45]]);
  for (const x of [-1.9, -1.34, -0.4, 0.5, 1.38, 1.95]) rails.push([[x, 0.3, -0.58], [x, 0.3, 0.58]]);
  return (
    <group>
      {rails.map(([a, b], i) => {
        const va = new THREE.Vector3(...a);
        const vb = new THREE.Vector3(...b);
        const mid = va.clone().add(vb).multiplyScalar(0.5);
        const len = va.distanceTo(vb);
        const q = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          vb.clone().sub(va).normalize(),
        );
        return (
          <mesh key={i} material={steel} position={mid} quaternion={q}>
            <boxGeometry args={[0.05, len, 0.05]} />
          </mesh>
        );
      })}
    </group>
  );
};

/** A label in the exploded view, faded by the director. */
const PartLabel = ({
  children,
  position,
  labelRef,
}: {
  children: ReactNode;
  position: [number, number, number];
  labelRef: (el: HTMLDivElement | null) => void;
}) => (
  <Html position={position} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
    <div
      ref={labelRef}
      className="whitespace-nowrap rounded-full border border-ink/15 bg-canvas/80 px-3 py-1.5 font-tech text-[11px] font-bold text-ink shadow-lg backdrop-blur-md"
      style={{ opacity: 0 }}
    >
      {children}
    </div>
  </Html>
);

/* ------------------------------------------------------------------ */
/* Procedural car                                                      */
/* ------------------------------------------------------------------ */

interface CarProps {
  ctl: CarControl;
  color?: string;
  shape?: BodyShape;
  /** Engine, frame, seats, labels: only the hero car needs them. */
  hero?: boolean;
  /**
   * The part labels (drei <Html>, each its own React root). Off when this car
   * is only the stand-in while the 812 loads: the loader hides it anyway, and
   * unmounting those roots mid-commit trips React's removeChild.
   */
  labels?: boolean;
}

const WHEELS: [number, number][] = [
  [CAR.frontAxle, 1],
  [CAR.frontAxle, -1],
  [CAR.rearAxle, 1],
  [CAR.rearAxle, -1],
];

export const ProceduralCar = ({ ctl, color = ROSSO, shape = GT_SHAPE, hero = false, labels = hero }: CarProps) => {
  const body = useMemo(() => buildBody(shape), [shape]);
  const paint = useMemo(() => paintMat(color), [color]);
  const zebra = useMemo(() => zebraMat(), []);
  useEffect(
    () => () => {
      body.dispose();
      paint.dispose();
      zebra.dispose();
    },
    [body, paint, zebra],
  );

  const bodyRef = useRef<THREE.Group>(null);
  const zebraRef = useRef<THREE.Mesh>(null);
  const wheelRefs = useRef<(THREE.Group | null)[]>([]);
  const spinRefs = useRef<(THREE.Group | null)[]>([]);
  const engineRef = useRef<THREE.Group>(null);
  const boxRef = useRef<THREE.Group>(null);
  const shaftRef = useRef<THREE.Mesh>(null);
  const seatsRef = useRef<THREE.Group>(null);
  const frameRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.MeshStandardMaterial>(null);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const liftRef = useRef<THREE.Group>(null);

  useFrame(() => {
    const e = smooth(clamp01(ctl.explode));
    // Staggered: body lifts first, then wheels, then the drivetrain.
    const eb = smooth(seg(e, 0, 0.6));
    const ew = smooth(seg(e, 0.15, 0.75));
    const ed = smooth(seg(e, 0.3, 1));
    if (liftRef.current) liftRef.current.position.y = ctl.lift;
    if (bodyRef.current) {
      bodyRef.current.position.y = eb * 2.1;
      bodyRef.current.rotation.z = eb * 0.06;
    }
    WHEELS.forEach(([, side], i) => {
      const g = wheelRefs.current[i];
      if (g) {
        g.position.z = side * (CAR.track + ew * 1.05);
        g.position.y = CAR.wheelR + ew * 0.25;
      }
      const s = spinRefs.current[i];
      // Left wheels are mirrored (yawed π), so they spin the other way locally.
      if (s) s.rotation.z = (-side * ctl.travel) / CAR.wheelR;
    });
    if (engineRef.current) {
      engineRef.current.position.set(0.75 + ed * 0.35, 0.32 + ed * 1.0, 0);
      engineRef.current.rotation.y = ed * 0.35;
    }
    if (boxRef.current) boxRef.current.position.set(CAR.rearAxle - ed * 0.85, 0.36 + ed * 0.7, 0);
    if (shaftRef.current) shaftRef.current.position.y = 0.33 + ed * 0.45;
    if (seatsRef.current) seatsRef.current.position.y = 0.24 + eb * 1.25;
    if (frameRef.current) frameRef.current.visible = e > 0.02;
    if (zebraRef.current) {
      zebraRef.current.visible = ctl.zebra > 0.01;
      zebra.uniforms.uOpacity.value = ctl.zebra;
    }
    if (tailRef.current) tailRef.current.emissiveIntensity = lerp(1.4, 4.5, ctl.brake);
    const l = clamp01(ctl.labels);
    labelRefs.current.forEach((el, i) => {
      if (!el) return;
      const o = smooth(seg(l, i * 0.12, i * 0.12 + 0.4));
      el.style.opacity = String(o);
      el.style.transform = `translateY(${(1 - o) * 8}px)`;
    });
  });

  return (
    <group ref={liftRef}>
      <group ref={bodyRef}>
        <mesh geometry={body} material={paint} />
        <mesh ref={zebraRef} geometry={body} material={zebra} renderOrder={2} visible={false} />
        {/* Headlights: thin swept strips */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[2.12, 0.66, s * 0.6]} rotation={[0, s * 0.5, -0.32]}>
            <boxGeometry args={[0.32, 0.035, 0.05]} />
            <meshStandardMaterial color="#fff6e6" emissive="#fff1d6" emissiveIntensity={2.2} />
          </mesh>
        ))}
        {/* Four round tail lights */}
        {[-0.72, -0.44, 0.44, 0.72].map((z) => (
          <mesh key={z} position={[-2.29, 0.8, z]} rotation-y={-Math.PI / 2}>
            <circleGeometry args={[0.065, 24]} />
            <meshStandardMaterial
              ref={z === -0.72 ? tailRef : undefined}
              color="#ff2a2a"
              emissive="#ff1a1a"
              emissiveIntensity={1.4}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
        {/* Quad exhausts */}
        {[-0.5, -0.36, 0.36, 0.5].map((z) => (
          <mesh key={z} material={steel} position={[-2.3, 0.33, z]} rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[0.045, 0.05, 0.12, 16]} />
          </mesh>
        ))}
        {labels && (
          <PartLabel position={[-0.4, 1.5, 0]} labelRef={(el) => (labelRefs.current[3] = el)}>
            Bodywork: active aero flaps
          </PartLabel>
        )}
      </group>

      {/* Floor pan, so there's never daylight through the car */}
      <mesh material={carbon} position={[0, 0.26, 0]}>
        <boxGeometry args={[4.2, 0.06, 1.5]} />
      </mesh>

      {WHEELS.map(([x], i) => (
        <group key={i} ref={(g) => (wheelRefs.current[i] = g)} position={[x, CAR.wheelR, WHEELS[i][1] * CAR.track]}>
          <group rotation-y={WHEELS[i][1] < 0 ? Math.PI : 0}>
            <Wheel spinRef={(g) => (spinRefs.current[i] = g)} />
          </group>
        </group>
      ))}

      {hero && (
        <>
          <group ref={engineRef} position={[0.75, 0.32, 0]}>
            <Engine />
            {labels && (
              <PartLabel position={[0, 0.75, 0]} labelRef={(el) => (labelRefs.current[0] = el)}>
                6.5 L V12, 800 cv
              </PartLabel>
            )}
          </group>
          <mesh ref={shaftRef} material={steel} position={[-0.3, 0.33, 0]} rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[0.05, 0.05, 2.2, 12]} />
          </mesh>
          <group ref={boxRef} position={[CAR.rearAxle, 0.36, 0]}>
            <mesh material={alloy}>
              <boxGeometry args={[0.6, 0.32, 0.5]} />
            </mesh>
            <mesh material={steel} rotation-x={Math.PI / 2}>
              <cylinderGeometry args={[0.07, 0.07, 1.4, 12]} />
            </mesh>
            {labels && (
              <PartLabel position={[0, 0.5, 0]} labelRef={(el) => (labelRefs.current[1] = el)}>
                7-speed dual-clutch transaxle
              </PartLabel>
            )}
          </group>
          <group ref={seatsRef} position={[-0.55, 0.24, 0]}>
            <group position-z={0.36}>
              <Seat />
            </group>
            <group position-z={-0.36}>
              <Seat />
            </group>
            <mesh material={carbon} position={[0.55, 0.42, 0.36]} rotation-z={1.2}>
              <torusGeometry args={[0.17, 0.025, 10, 28]} />
            </mesh>
          </group>
          <group ref={frameRef} visible={false}>
            <Frame />
          </group>
          {/* The brake label rides on the front-left wheel's spot. */}
          <group position={[CAR.frontAxle, 0, 0]}>
            {labels && <BrakeLabel ctl={ctl} labelRef={(el) => (labelRefs.current[2] = el)} />}
          </group>
        </>
      )}
    </group>
  );
};

/** Follows the exploded front-left wheel. */
const BrakeLabel = ({
  ctl,
  labelRef,
}: {
  ctl: CarControl;
  labelRef: (el: HTMLDivElement | null) => void;
}) => {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    const ew = smooth(seg(smooth(clamp01(ctl.explode)), 0.15, 0.75));
    if (ref.current) ref.current.position.set(0, CAR.wheelR + ew * 0.25 + 0.6, CAR.track + ew * 1.05 + 0.2);
  });
  return (
    <group ref={ref}>
      <PartLabel position={[0, 0, 0]} labelRef={labelRef}>
        Carbon-ceramic brakes
      </PartLabel>
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* The real 812                                                        */
/* ------------------------------------------------------------------ */

/*
 * Everything below works in the 812 file's own frame: x across the car
 * (+x = left side), y up, z along it (+z = nose), metres. One wrapper
 * yaws it to the scene's +x.
 */

type V = [number, number, number];
type Stage = 0 | 1 | 2; // body, wheels, drivetrain: matches the procedural stagger

/** Where each named part flies to when the car comes apart. */
const EXPLODE: [RegExp, Stage, V][] = [
  [/^812_body(001)?$/, 0, [0, 2.1, 0]],
  [/^812_hood$/, 0, [0, 2.75, 0.6]],
  [/^812_(tailgate|spoiler)$/, 0, [0, 2.6, -0.6]],
  [/^812_(door|doorglass|mirror)_L$/, 0, [1.1, 1.6, 0.1]],
  [/^812_(door|doorglass|mirror)_R$/, 0, [-1.1, 1.6, 0.1]],
  [/^812_fender_L$/, 0, [0.8, 2.1, 0.3]],
  [/^812_fender_R$/, 0, [-0.8, 2.1, 0.3]],
  [/^812_fenderflare_R$/, 0, [0, 2.1, -0.3]],
  [/^812_(bumper_F|bumper_b_F|headlightglass_[LR])$/, 0, [0, 1.8, 1.1]],
  [/^812_(bumper_R|bumper_b_R|taillightglass_[LR])$/, 0, [0, 1.8, -1.1]],
  [/^812_(interior|screen)$/, 0, [0, 1.2, -0.1]],
  [/^812_seat_FL$/, 0, [0.45, 1.3, -0.2]],
  [/^812_seat_FR$/, 0, [-0.45, 1.3, -0.2]],
  [/^812_brakedisc_.L$/, 1, [0.6, 0.25, 0]],
  [/^812_brakedisc_.R$/, 1, [-0.6, 0.25, 0]],
  [/^812_subframe_F$/, 2, [0, 0.95, 0.4]],
  [/^812_subframe_R$/, 2, [0, 0.95, -0.4]],
  [/^812_.*_F$/, 2, [0, 0.55, 0.25]],
  [/^812_.*_R$/, 2, [0, 0.55, -0.25]],
  [/^812_steeringbox$/, 2, [0, 0.55, 0.25]],
];
const BADGES = /logo|emblem/i;
/** Tyre outer radius: hubs sit this high so all four touch the ground. */
const WHEEL_R = 0.32;
/** The file's rim (no tyre in it) is drawn at this radius inside the rubber. */
const RIM_R = 0.245;
const TYRE_W = 0.235;

/**
 * Low-profile tyre turned on a lathe: bead, bulging sidewall, rounded
 * shoulder and a tread with three circumferential grooves. Axis is x.
 */
function tyreGeometry() {
  const h = TYRE_W / 2;
  const pts: [number, number][] = [
    [RIM_R - 0.012, -h * 0.8],
    [RIM_R + 0.004, -h * 0.97],
    [RIM_R + 0.03, -h],
    [WHEEL_R - 0.03, -h * 0.98],
    [WHEEL_R - 0.012, -h * 0.9],
    [WHEEL_R - 0.003, -h * 0.76],
  ];
  // Tread from shoulder to shoulder, dipping into each groove.
  const grooves = [-0.5, 0, 0.5].map((g) => g * h);
  const tread: [number, number][] = [[WHEEL_R, -h * 0.66]];
  for (const g of grooves) tread.push([WHEEL_R, g - 0.011], [WHEEL_R - 0.007, g - 0.008], [WHEEL_R - 0.007, g + 0.008], [WHEEL_R, g + 0.011]);
  const half = [...pts, ...tread];
  const mirrored = pts.map(([r, y]) => [r, -y] as [number, number]).reverse();
  const profile = [...half, [WHEEL_R, h * 0.66] as [number, number], ...mirrored].map(([r, y]) => new THREE.Vector2(r, y));
  const g = new THREE.LatheGeometry(profile, 72);
  g.rotateZ(Math.PI / 2);
  return g;
}
/** Wheels sit this far out from the centreline. */
const WHEEL_X = 0.78;

const stages = (explode: number): [number, number, number] => {
  const e = smooth(clamp01(explode));
  return [smooth(seg(e, 0, 0.6)), smooth(seg(e, 0.15, 0.75)), smooth(seg(e, 0.3, 1))];
};

interface Part {
  obj: THREE.Object3D;
  base: THREE.Vector3;
  /** The flight vector in the part's parent frame. */
  delta: THREE.Vector3;
  stage: Stage;
}

/** World-space centre of an object's bounds. */
const centre = (o: THREE.Object3D) => new THREE.Box3().setFromObject(o).getCenter(new THREE.Vector3());

function rig812(scene: THREE.Object3D) {
  const root = scene.clone(true);
  root.updateMatrixWorld(true);

  const paint = new THREE.MeshPhysicalMaterial({
    color: ROSSO,
    metalness: 0.5,
    roughness: 0.28,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    // The file's black inner shell sits a hair under the panels; nudge the
    // paint toward the camera in depth so the two never fight (flicker).
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -4,
  });
  const zebra = zebraMat(true);
  const tail = new THREE.MeshStandardMaterial({ color: "#5a0808", emissive: "#ff1a1a", emissiveIntensity: 1 });
  const lamp = new THREE.MeshStandardMaterial({ color: "#fff6e6", emissive: "#fff1d6", emissiveIntensity: 2.2 });
  // The file's chrome and bare-metal parts read as chalk under the studio lights.
  const rim = new THREE.MeshStandardMaterial({ color: "#b4b4b9", metalness: 0.7, roughness: 0.32 });
  const chassis = new THREE.MeshStandardMaterial({ color: "#6d6a66", metalness: 0.75, roughness: 0.45 });
  const rubber = new THREE.MeshStandardMaterial({ color: "#1b1b1c", metalness: 0, roughness: 0.88, side: THREE.DoubleSide });
  const tyre = tyreGeometry();

  const parts: Part[] = [];
  const zebras: THREE.Mesh[] = [];
  let wheel: THREE.Object3D | null = null;
  const discs: Record<string, THREE.Object3D> = {};

  const visit = (o: THREE.Object3D) => {
    const name = o.name;
    if (name === "812_wheel") {
      wheel = o;
      return;
    }
    if (name.startsWith("812_brakedisc_")) discs[name.slice(-2)] = o;
    const rule = EXPLODE.find(([re]) => re.test(name));
    if (rule && o.parent) {
      const c = centre(o);
      const a = o.parent.worldToLocal(c.clone());
      const b = o.parent.worldToLocal(c.clone().add(new THREE.Vector3(...rule[2])));
      parts.push({ obj: o, base: o.position.clone(), delta: b.sub(a), stage: rule[1] });
    }
    // Children move with their parent, so only the outermost match counts.
    if (!rule) o.children.forEach(visit);
    else o.traverse((m) => style(m));
  };
  const style = (o: THREE.Object3D) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mat = mesh.material as THREE.MeshStandardMaterial;
    const n = mat.name ?? "";
    if (BADGES.test(n)) mesh.visible = false;
    else if (n === "body_812") {
      mesh.material = paint;
      const z = new THREE.Mesh(mesh.geometry, zebra);
      z.renderOrder = 2;
      z.visible = false;
      mesh.add(z);
      zebras.push(z);
    } else if (n === "812_taillight") mesh.material = tail;
    else if (n === "chromeplast_812") mesh.material = rim;
    else if (n === "material") mesh.material = chassis;
    else if (/lowbeam|runninglight$/.test(n) && !/rear/.test(n)) mesh.material = lamp;
  };
  root.children.forEach(visit);
  root.traverse(style);

  // The file carries one wheel at the origin: lift it out to copy ×4.
  let wheelTmpl: THREE.Group | null = null;
  if (wheel) {
    const w = wheel as THREE.Object3D;
    const size = new THREE.Box3().setFromObject(w).getSize(new THREE.Vector3());
    wheelTmpl = new THREE.Group();
    wheelTmpl.matrixAutoUpdate = false;
    wheelTmpl.matrix.copy(w.parent!.matrixWorld);
    w.removeFromParent();
    wheelTmpl.add(w);
    wheelTmpl.userData.scale = RIM_R / (size.y / 2);
  }

  const hubs = (["FL", "FR", "RL", "RR"] as const).map((k) => {
    const d = discs[k];
    const c = d ? centre(d) : new THREE.Vector3(0, WHEEL_R, k[0] === "F" ? 1.25 : -1.25);
    // The file's discs sit at uneven heights; bring each onto the common axle line.
    if (d?.parent) {
      const p = d.parent;
      const shift = p.worldToLocal(c.clone().setY(WHEEL_R)).sub(p.worldToLocal(c.clone()));
      d.position.add(shift);
      parts.find((x) => x.obj === d)?.base.add(shift);
    }
    return { key: k, side: k[1] === "L" ? 1 : -1, y: WHEEL_R, z: c.z, disc: d };
  });

  return { root, parts, zebras, mats: [zebra, paint, tail, lamp, rim, chassis, rubber], geos: [tyre], zebra, tail, wheelTmpl, hubs, tyre, rubber };
}

const Car812 = ({ ctl }: { ctl: CarControl }) => {
  const { scene } = useGLTF(CAR_MODEL.url!, false);
  const brake = useGLTF(CAR_MODEL.brake, false).scene;
  const rig = useMemo(() => rig812(scene), [scene]);
  useEffect(
    () => () => {
      rig.mats.forEach((m) => m.dispose());
      rig.geos.forEach((g) => g.dispose());
    },
    [rig],
  );

  // Four wheels from the one template; right-hand ones mirrored.
  const wheels = useMemo(
    () =>
      rig.hubs.map((h) => {
        const spin = new THREE.Group();
        if (rig.wheelTmpl) {
          const rimGroup = new THREE.Group();
          rimGroup.add(rig.wheelTmpl.clone(true));
          rimGroup.scale.setScalar(rig.wheelTmpl.userData.scale as number);
          spin.add(rimGroup);
        }
        const t = new THREE.Mesh(rig.tyre, rig.rubber);
        t.castShadow = true;
        spin.add(t);
        return { ...h, spin, obj: spin };
      }),
    [rig],
  );

  const brakeObj = useMemo(() => {
    const b = brake.clone(true);
    const size = new THREE.Box3().setFromObject(b).getSize(new THREE.Vector3());
    const g = new THREE.Group();
    g.add(b);
    g.scale.setScalar(0.4 / size.y);
    return g;
  }, [brake]);

  const wheelRefs = useRef<(THREE.Group | null)[]>([]);
  const engineRef = useRef<THREE.Group>(null);
  const boxRef = useRef<THREE.Group>(null);
  const shaftRef = useRef<THREE.Mesh>(null);
  const brakeRef = useRef<THREE.Group>(null);
  const bodyLabelRef = useRef<THREE.Group>(null);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const fl = rig.hubs[0];
  const ENGINE_AT: V = [0, 0.3, 0.72];
  const BOX_AT: V = [0, 0.36, -1.25];

  useFrame(() => {
    const st = stages(ctl.explode);
    const [eb, ew, ed] = st;
    for (const p of rig.parts) p.obj.position.copy(p.base).addScaledVector(p.delta, st[p.stage]);

    wheels.forEach((w, i) => {
      const g = wheelRefs.current[i];
      if (g) g.position.set(w.side * (WHEEL_X + ew * 1.05), w.y + ew * 0.25, w.z);
      w.spin.rotation.x = ctl.travel / WHEEL_R;
    });

    const apart = ctl.explode > 0.01;
    if (engineRef.current) {
      engineRef.current.visible = apart;
      engineRef.current.position.set(ENGINE_AT[0], ENGINE_AT[1] + ed * 1.05, ENGINE_AT[2] + ed * 0.45);
      engineRef.current.rotation.y = ed * 0.35;
    }
    if (boxRef.current) {
      boxRef.current.visible = apart;
      boxRef.current.position.set(BOX_AT[0], BOX_AT[1] + ed * 0.7, BOX_AT[2] - ed * 0.85);
    }
    if (shaftRef.current) {
      shaftRef.current.visible = apart;
      shaftRef.current.position.y = 0.33 + ed * 0.45;
    }
    if (brakeRef.current) {
      brakeRef.current.visible = apart;
      brakeRef.current.position.set(fl.side * (0.77 + ew * 0.6), fl.y + ew * 0.25, fl.z);
    }
    if (fl.disc) fl.disc.visible = !apart;
    if (bodyLabelRef.current) bodyLabelRef.current.position.set(0, 1.25 + eb * 2.1, -0.5);

    for (const z of rig.zebras) z.visible = ctl.zebra > 0.01;
    rig.zebra.uniforms.uOpacity.value = ctl.zebra;
    rig.tail.emissiveIntensity = lerp(1, 4.5, ctl.brake);

    const l = clamp01(ctl.labels);
    labelRefs.current.forEach((el, i) => {
      if (!el) return;
      const o = smooth(seg(l, i * 0.12, i * 0.12 + 0.4));
      el.style.opacity = String(o);
      el.style.transform = `translateY(${(1 - o) * 8}px)`;
    });
  });

  const label = (i: number) => (el: HTMLDivElement | null) => (labelRefs.current[i] = el);
  return (
    <group rotation-y={CAR_MODEL.yaw}>
      <primitive object={rig.root} />
      {wheels.map((w, i) => (
        <group key={w.key} ref={(g) => (wheelRefs.current[i] = g)}>
          <group scale-x={w.side < 0 ? -1 : 1}>
            <primitive object={w.obj} />
          </group>
        </group>
      ))}
      <group ref={engineRef} visible={false}>
        <group rotation-y={-Math.PI / 2}>
          <Engine />
        </group>
        <PartLabel position={[0, 0.75, 0]} labelRef={label(0)}>
          6.5 L V12, 800 cv
        </PartLabel>
      </group>
      <mesh ref={shaftRef} material={steel} position={[0, 0.33, -0.2]} rotation-x={Math.PI / 2} visible={false}>
        <cylinderGeometry args={[0.05, 0.05, 1.9, 12]} />
      </mesh>
      <group ref={boxRef} visible={false}>
        <mesh material={alloy}>
          <boxGeometry args={[0.5, 0.32, 0.6]} />
        </mesh>
        <mesh material={steel} rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.07, 0.07, 1.4, 12]} />
        </mesh>
        <PartLabel position={[0, 0.5, 0]} labelRef={label(1)}>
          7-speed dual-clutch transaxle
        </PartLabel>
      </group>
      <group ref={brakeRef} visible={false}>
        <primitive object={brakeObj} />
        <PartLabel position={[0.1, 0.55, 0.15]} labelRef={label(2)}>
          Carbon-ceramic brakes
        </PartLabel>
      </group>
      <group ref={bodyLabelRef}>
        <PartLabel position={[0, 0, 0]} labelRef={label(3)}>
          Bodywork: active aero flaps
        </PartLabel>
      </group>
    </group>
  );
};

/** The hero car: the real 812 once it has loaded, the procedural one until then. */
export const HeroCar = ({ ctl }: { ctl: CarControl }) => {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (ref.current) ref.current.position.y = ctl.lift;
  });
  if (!CAR_MODEL.url) return <ProceduralCar ctl={ctl} hero />;
  return (
    <Suspense fallback={<ProceduralCar ctl={ctl} hero labels={false} />}>
      <group ref={ref}>
        <Car812 ctl={ctl} />
      </group>
    </Suspense>
  );
};

if (CAR_MODEL.url) {
  useGLTF.preload(CAR_MODEL.url, false);
  useGLTF.preload(CAR_MODEL.brake, false);
}
