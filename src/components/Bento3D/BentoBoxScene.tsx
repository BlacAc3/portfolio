import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Lightformer,
  RoundedBox,
} from "@react-three/drei";
import * as THREE from "three";
import { useTheme, type Theme } from "../../contexts/ThemeContext";
import { coverCanvas, coversReady, isPortraitView, onCoversChange } from "./covers";
import {
  bentoCells,
  GRID_COLS,
  GRID_ROWS,
  INTRO,
  revealWindow,
  type BentoCell,
} from "./bentoData";
import { easeInOutCubic, type Frame } from "./choreography";

/* ------------------------------------------------------------------ */
/* Palette — mirrors the @theme tokens in styles/index.css             */
/* ------------------------------------------------------------------ */
const C = {
  dark: "#0a0a0a",
  medium: "#1d1b1a",
  light: "#2a2625",
  accent: "#d4a76a",
  lightAccent: "#e8d5b5",
};

/**
 * Shell finish per theme. The tray is what the hero view mostly sees, so it
 * carries the contrast: on the dark page a light cognac lacquer under an
 * espresso lid (two-tone, like a lacquered jubako); on parchment a deep
 * chocolate that reads as a solid silhouette.
 */
const SHELL: Record<Theme, { tray: string; lid: string; well: string }> = {
  dark: { tray: "#9a6f4b", lid: "#4f3d31", well: "#2c2521" },
  light: { tray: "#3b2b20", lid: "#4d3b2d", well: "#2c2521" },
};

/* ------------------------------------------------------------------ */
/* Dimensions (world units). One grid cell = 1 unit.                   */
/* ------------------------------------------------------------------ */
const CELL = 1;
const GAP = 0.08;
const RIM = 0.22;
const TRAY_H = 0.62;
const LID_H = 0.2;
const BLOCK_H = 0.44;
const INNER_W = GRID_COLS * CELL + (GRID_COLS - 1) * GAP;
const INNER_D = GRID_ROWS * CELL + (GRID_ROWS - 1) * GAP;
const OUTER_W = INNER_W + RIM * 2;
const OUTER_D = INNER_D + RIM * 2;
const REST_LIFT = 0.24;
const ACTIVE_LIFT = 0.3;
const HIDDEN_Y = TRAY_H - BLOCK_H / 2 - 0.03;
const FOV = 32;
const TAN_HALF = Math.tan((FOV * Math.PI) / 360);
/** How much of the screen the compartment face fills once the dive lands. */
const DIVE_FILL = 0.78;
/** Camera tilt off vertical when locked over a compartment (radians). */
const DIVE_TILT = 0.3;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const range = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
const smooth = (t: number) => t * t * (3 - 2 * t);

const cellGeometry = (cell: BentoCell) => {
  const w = cell.colSpan * CELL + (cell.colSpan - 1) * GAP;
  const d = cell.rowSpan * CELL + (cell.rowSpan - 1) * GAP;
  const x = -INNER_W / 2 + cell.col * (CELL + GAP) + w / 2;
  const z = -INNER_D / 2 + cell.row * (CELL + GAP) + d / 2;
  return { w: w - 0.04, d: d - 0.04, x, z };
};

const makeBlockMaterial = (theme: BentoCell["theme"]) => {
  const accent = new THREE.Color(C.accent);
  switch (theme) {
    case "accent":
      return new THREE.MeshPhysicalMaterial({
        color: C.accent,
        metalness: 0.75,
        roughness: 0.28,
        clearcoat: 0.6,
        emissive: accent,
        emissiveIntensity: 0,
      });
    case "dark":
      return new THREE.MeshPhysicalMaterial({
        color: C.medium,
        metalness: 0.15,
        roughness: 0.42,
        clearcoat: 0.8,
        clearcoatRoughness: 0.25,
        emissive: accent,
        emissiveIntensity: 0,
      });
    case "photo":
      return new THREE.MeshPhysicalMaterial({
        color: C.medium,
        metalness: 0.1,
        roughness: 0.5,
        emissive: accent,
        emissiveIntensity: 0,
      });
    default:
      return new THREE.MeshPhysicalMaterial({
        color: C.light,
        metalness: 0.2,
        roughness: 0.22,
        clearcoat: 1,
        clearcoatRoughness: 0.12,
        sheen: 0.25,
        sheenColor: new THREE.Color(C.lightAccent),
        emissive: accent,
        emissiveIntensity: 0,
      });
  }
};

/* ------------------------------------------------------------------ */
/* Public API — the showcase drives the scene, one frame at a time.    */
/* ------------------------------------------------------------------ */

/** Screen-space corners (CSS px) of a compartment face: TL, TR, BR, BL. */
export type Quad = [number, number][];

/** Live input from the DOM: the hero's hover/tap "peek". */
export interface SceneInput {
  /** 1 while the pointer is over the box (or a tap is holding it open). */
  peek: number;
  /** Increments on every click/tap — each one kicks the lid. */
  kicks: number;
  /**
   * The free space the hero layout leaves for the resting box, in stage
   * pixels. The box is sized and centred into it, so the copy never
   * collides with it on short or narrow screens.
   */
  slot?: { x: number; y: number; w: number; h: number } | null;
}

export interface SceneOutput {
  /** Active compartment's top face (CSS px, TL TR BR BL), pages only. */
  quad: Quad | null;
  /** The face's corner radius on screen (CSS px), pages only. */
  radius: number;
  /** Screen-space bounds of the closed box, hero only: x, y, w, h. */
  box: [number, number, number, number] | null;
}

export interface BentoSceneHandle {
  /**
   * Pose the scene for `frame`, render it, and report where things landed.
   * The pose is deterministic in `frame` (only the peek spring has state),
   * so the DOM page that is laid over the face can never drift from the 3D.
   */
  render: (frame: Frame, timeMs: number, input: SceneInput) => SceneOutput;
}

/** Plan-view corner radius of a compartment (the RoundedBox radius). */
const BLOCK_R = 0.06;

/**
 * A flat rounded rectangle in the XY plane (like planeGeometry) with
 * 0..1 UVs across its bounds, so a texture maps exactly as on a plane.
 */
function roundedPlane(w: number, h: number, r: number) {
  const x = -w / 2;
  const y = -h / 2;
  const shape = new THREE.Shape();
  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + h - r);
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  shape.lineTo(x + r, y + h);
  shape.quadraticCurveTo(x, y + h, x, y + h - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  const g = new THREE.ShapeGeometry(shape, 10);
  const pos = g.attributes.position;
  const uv = g.attributes.uv;
  for (let k = 0; k < pos.count; k++) {
    uv.setXY(k, (pos.getX(k) - x) / w, (pos.getY(k) - y) / h);
  }
  uv.needsUpdate = true;
  return g;
}

/* ------------------------------------------------------------------ */
/* Cover inlay — the drawn cover on each compartment's top face        */
/* ------------------------------------------------------------------ */
const CoverInlay = ({
  index,
  w,
  d,
  portrait,
  onMaterial,
}: {
  index: number;
  w: number;
  d: number;
  portrait: boolean;
  onMaterial: (m: THREE.MeshPhysicalMaterial | null) => void;
}) => {
  const texture = useMemo(() => {
    const t = new THREE.CanvasTexture(coverCanvas(index, portrait));
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [index, portrait]);
  useEffect(() => () => texture.dispose(), [texture]);
  // Title covers repaint their canvas once the page headline is measured.
  useEffect(
    () =>
      onCoversChange(() => {
        texture.needsUpdate = true;
      }),
    [texture],
  );

  // In portrait the whole box is turned 90°; the cover is drawn for the
  // turned face and counter-rotated so it reads upright on screen.
  const pw = (portrait ? d : w) - 0.07;
  const pd = (portrait ? w : d) - 0.07;
  // Inset 0.035 from the block's edge, so concentric with its corners.
  const shape = useMemo(() => roundedPlane(pw, pd, BLOCK_R - 0.035 + 0.012), [pw, pd]);
  useEffect(() => () => shape.dispose(), [shape]);

  return (
    <group rotation-y={portrait ? -Math.PI / 2 : 0}>
      <mesh rotation-x={-Math.PI / 2} position-y={BLOCK_H / 2 + 0.003} geometry={shape}>
        <meshPhysicalMaterial
          ref={onMaterial}
          map={texture}
          emissiveMap={texture}
          emissive="#ffffff"
          emissiveIntensity={0.12}
          roughness={0.34}
          metalness={0.05}
          clearcoat={0.9}
          clearcoatRoughness={0.14}
        />
      </mesh>
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* The bento box                                                       */
/* ------------------------------------------------------------------ */
const BentoBox = ({ api }: { api: RefObject<BentoSceneHandle | null> }) => {
  const { theme } = useTheme();
  const rig = useRef<THREE.Group>(null);
  const lid = useRef<THREE.Group>(null);
  const blocks = useRef<(THREE.Mesh | null)[]>([]);
  const coverMats = useRef<(THREE.MeshPhysicalMaterial | null)[]>([]);
  const get = useThree((s) => s.get);
  const size = useThree((s) => s.size);
  const portrait = isPortraitView(size.width, size.height);
  const [coversOn, setCoversOn] = useState(false);
  useEffect(() => {
    let live = true;
    coversReady().then(() => live && setCoversOn(true));
    return () => {
      live = false;
    };
  }, []);

  const geo = useMemo(() => bentoCells.map(cellGeometry), []);
  const slotShapes = useMemo(
    () => geo.map((g) => roundedPlane(g.w + 0.03, g.d + 0.03, BLOCK_R + 0.015)),
    [geo],
  );
  useEffect(() => () => slotShapes.forEach((g) => g.dispose()), [slotShapes]);
  const liningShape = useMemo(() => roundedPlane(OUTER_W - 0.06, OUTER_D - 0.06, 0.08), []);
  useEffect(() => () => liningShape.dispose(), [liningShape]);
  const materials = useMemo(
    () => bentoCells.map((c) => makeBlockMaterial(c.theme)),
    [],
  );

  const shell = useMemo(
    () => ({
      // Warm lacquer a few steps above the page's near-black, so the shell's
      // silhouette always separates from the background.
      tray: new THREE.MeshPhysicalMaterial({
        color: "#3a2f28",
        metalness: 0.2,
        roughness: 0.35,
        clearcoat: 1,
        clearcoatRoughness: 0.18,
      }),
      lid: new THREE.MeshPhysicalMaterial({
        color: "#4a3d34",
        metalness: 0.25,
        roughness: 0.3,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        sheen: 0.4,
        sheenColor: new THREE.Color(C.lightAccent),
      }),
      well: new THREE.MeshStandardMaterial({ color: "#2c2521", roughness: 0.95 }),
      // Inside of the lid: matte velvet, so the light inside the box can't
      // throw a hot specular glint off it when the lid opens.
      lining: new THREE.MeshPhysicalMaterial({
        color: "#221c19",
        roughness: 0.92,
        metalness: 0,
        sheen: 0.35,
        sheenRoughness: 0.8,
        sheenColor: new THREE.Color(C.lightAccent),
      }),
      slot: new THREE.MeshStandardMaterial({ color: "#1a1411", roughness: 1 }),
      gold: new THREE.MeshPhysicalMaterial({
        color: C.accent,
        metalness: 1,
        roughness: 0.22,
        clearcoat: 0.5,
      }),
    }),
    [],
  );

  // Re-finish the shell when the theme flips; the scroll loop redraws it.
  useEffect(() => {
    const f = SHELL[theme];
    shell.tray.color.set(f.tray);
    shell.lid.color.set(f.lid);
    shell.well.color.set(f.well);
    shell.tray.clearcoatRoughness = theme === "dark" ? 0.12 : 0.18;
  }, [theme, shell]);

  useEffect(
    () => () => {
      materials.forEach((m) => m.dispose());
      Object.values(shell).forEach((m) => m.dispose());
    },
    [materials, shell],
  );

  /* Scratch objects — allocated once, reused every frame. */
  const scratch = useMemo(
    () => ({
      camStart: new THREE.Vector3(1.1, 3.6, 8.2),
      camMid: new THREE.Vector3(0, 7.4, 7.6),
      overview: new THREE.Vector3(0, 10.6, 4.4),
      overviewLook: new THREE.Vector3(0, 0.5, -0.35),
      cam: new THREE.Vector3(),
      look: new THREE.Vector3(),
      pageCam: new THREE.Vector3(),
      pageLook: new THREE.Vector3(),
      wide: new THREE.Vector3(),
      corners: [0, 1, 2, 3].map(() => new THREE.Vector3()),
      centre: new THREE.Vector3(),
      pointer: new THREE.Vector2(),
      heroCam: new THREE.Vector3(),
      heroLook: new THREE.Vector3(),
      introCam: new THREE.Vector3(),
      introLook: new THREE.Vector3(),
      bound: new THREE.Vector3(),
      last: 0,
      peek: 0,
      peekV: 0,
      kicks: 0,
    }),
    [],
  );

  useLayoutEffect(() => {
    const s = scratch;

    const render = (frame: Frame, timeMs: number, input: SceneInput): SceneOutput => {
      const state = get();
      const { camera, size: view } = state;
      const cam = camera as THREE.PerspectiveCamera;
      const dt = Math.min(0.1, Math.max(0, (timeMs - s.last) / 1000));
      s.last = timeMs;
      const t = timeMs / 1000;
      const aspect = view.width / Math.max(view.height, 1);
      const isPortrait = isPortraitView(view.width, view.height);
      const heroT = smooth(frame.hero);
      const inHero = frame.phase === "hero";

      /* Peek: an under-damped spring, so the lid pops open with a bounce.
         It only answers while the box is still resting in the hero. */
      const peekTarget = inHero && frame.hero < 0.12 ? input.peek : 0;
      if (input.kicks !== s.kicks) {
        if (inHero) s.peekV += 9;
        s.kicks = input.kicks;
      }
      const steps = 4;
      for (let k = 0; k < steps; k++) {
        const h = dt / steps;
        s.peekV += (240 * (peekTarget - s.peek) - 13 * s.peekV) * h;
        s.peek += s.peekV * h;
      }
      const peek = Math.max(-0.15, s.peek);

      /* Fit: a touch closer than before so the box reads bigger. */
      const fit = isPortrait
        ? 1.28 * Math.max(1, 0.5 / Math.max(aspect, 0.3))
        : aspect < 1.25
          ? 1.05
          : aspect < 1.6
            ? 0.9
            : 0.8;

      const introT = frame.intro;
      const dive = easeInOutCubic(frame.dive);
      const pageIndex = frame.phase === "page" ? frame.index : -1;

      /* Lid: hinge open, then lift away behind the box. */
      const lidT = smooth(range(introT, INTRO.lidOpen[0], INTRO.lidOpen[1]));
      const liftT = smooth(
        range(introT, INTRO.revealStart - 0.03, INTRO.revealStart + 0.07),
      );
      if (lid.current) {
        lid.current.rotation.x = -lidT * 1.95 - peek * 0.42;
        lid.current.position.y = TRAY_H + 0.004 + liftT * 1.4;
        lid.current.position.z = -OUTER_D / 2 - liftT * 9;
        lid.current.visible = liftT < 0.999;
      }
      const lidFrame = lidT * (1 - liftT);

      /* Compartments rise one at a time; the active one lifts towards you. */
      bentoCells.forEach((cell, i) => {
        const mesh = blocks.current[i];
        if (!mesh) return;
        const [a, b] = revealWindow(i);
        const risen = smooth(range(introT, a, b));
        const active = i === pageIndex ? dive : 0;
        // A peek nudges the compartments up so their covers catch the light.
        const nudge = Math.max(0, peek) * 0.1;
        mesh.position.y = HIDDEN_Y + risen * REST_LIFT + active * ACTIVE_LIFT + nudge;
        mesh.visible = risen > 0.001 || peek > 0.005;
        const mat = materials[i];
        // Others sink into shadow while one is being opened.
        const dim = pageIndex >= 0 && i !== pageIndex ? dive : 0;
        mat.emissiveIntensity =
          (cell.theme === "accent" ? 0.12 * risen : 0) + active * 0.18;
        mat.color.set(cell.theme === "accent" ? C.accent : cell.theme === "glass" ? C.light : C.medium);
        mat.color.multiplyScalar(1 - dim * 0.45);
        const cover = coverMats.current[i];
        if (cover) {
          cover.color.setScalar((0.55 + Math.max(risen, Math.max(0, peek)) * 0.45) * (1 - dim * 0.5));
          cover.emissiveIntensity = 0.1 + active * 0.22;
        }
      });

      /* Rig: settle from an angled presentation, pointer parallax that calms
         to zero as the camera locks on (so the projection is rock-steady). */
      const calm = 1 - dive;
      if (rig.current) {
        const settle = smooth(range(introT, 0, INTRO.lidOpen[1]));
        // Hero: square-on and flat. It turns to the stage's opening angle
        // (and, on phones, onto its side) as it leaves the hero.
        const base = isPortrait ? (Math.PI / 2) * heroT : 0;
        s.pointer.lerp(state.pointer, 1 - Math.exp(-4 * dt));
        rig.current.rotation.y =
          base - 0.6 * heroT * (1 - settle) + s.pointer.x * (inHero ? 0.008 : 0.08) * calm + frame.outro * 0.18;
        rig.current.rotation.x = -s.pointer.y * (inHero ? 0.008 : 0.04) * calm;
        rig.current.position.y =
          Math.sin(t * 0.8) * 0.04 * calm * heroT + Math.max(0, peek) * 0.14;
        rig.current.updateMatrixWorld(true);
      }

      /* Camera — no damping: the camera is a pure function of the frame. */
      s.wide.copy(s.overview).multiplyScalar(fit);
      if (frame.phase === "hero") {
        /* Resting in the hero: seen from a low angle, sitting at the bottom
           middle of the screen, sized to sit between the hero's columns. */
        // ~1° at rest: the box reads as a flat slab. While the lid peeks the
        // view rises a few degrees so the covers inside are actually seen.
        const EL = ((1 + Math.max(0, peek) * 9) * Math.PI) / 180;
        // Sized to sit between the hero's bottom-row columns, and raised so
        // its base clears them (it centres in the band under the headline).
        const fill = isPortrait ? 0.74 : aspect < 1.25 ? 0.5 : 0.32;
        let dist = OUTER_W / 2 / (fill * TAN_HALF * aspect);
        // Where the box's centre sits, in NDC (+y is down the screen).
        const rest = isPortrait ? 0.44 : 0.4;
        let ndcX = 0;
        let ndcY = rest;
        const slot = input.slot;
        if (slot && slot.w > 40 && slot.h > 40) {
          // Pixels per world unit at the box: as large as the default, but
          // shrunk so the box (with a little headroom for the float and the
          // peek) fits inside the slot on both axes.
          const maxPx = (fill * view.width) / OUTER_W;
          const tall = TRAY_H + LID_H + 0.3;
          const px = Math.min(maxPx, (slot.w * 0.92) / OUTER_W, (slot.h * 0.8) / tall);
          dist = view.height / 2 / (px * TAN_HALF);
          ndcX = ((slot.x + slot.w / 2) / view.width) * 2 - 1;
          ndcY = ((slot.y + slot.h / 2) / view.height) * 2 - 1;
        }
        // Aiming the camera above the box puts it low on screen *and* keeps
        // the view looking slightly down onto the lid. Anything past that
        // (a slot higher up, or off to the side) is a shift of the
        // projection instead, so the box never turns to show its underside.
        const aim = Math.max(ndcY, rest);
        const lift = aim * TAN_HALF * dist;
        const off = 1 - heroT;
        cam.setViewOffset(
          view.width,
          view.height,
          (-ndcX * view.width * off) / 2,
          (-(ndcY - aim) * view.height * off) / 2,
          view.width,
          view.height,
        );
        s.heroLook.set(0, 0.42 + lift * Math.cos(EL), -lift * Math.sin(EL));
        s.heroCam.set(0, 0.42 + dist * Math.sin(EL), dist * Math.cos(EL));
        s.heroCam.add(s.heroLook).sub(s.bound.set(0, 0.42, 0));
        s.introCam.copy(s.camStart).multiplyScalar(fit);
        s.introLook.set(0, 0.35, 0);
        s.cam.lerpVectors(s.heroCam, s.introCam, heroT);
        s.look.lerpVectors(s.heroLook, s.introLook, heroT);
      } else if (frame.phase === "intro") {
        if (cam.view?.enabled) cam.clearViewOffset();
        const a = smooth(range(introT, 0, INTRO.revealStart));
        const b = smooth(range(introT, INTRO.revealStart, 1));
        s.cam.lerpVectors(s.camStart, s.camMid, a);
        s.cam.multiplyScalar(fit * (1 + lidFrame * 0.18)).lerp(s.wide, b);
        s.look
          .set(0, 0.35 + lidFrame * 0.9, -lidFrame * 1.1)
          .lerp(s.overviewLook, b);
      } else {
        if (cam.view?.enabled) cam.clearViewOffset();
        s.cam.copy(s.wide);
        s.look.copy(s.overviewLook);
        if (frame.phase === "outro") {
          s.cam.multiplyScalar(1 + frame.outro * 0.06);
        }
      }

      let quad: Quad | null = null;
      const mesh = pageIndex >= 0 ? blocks.current[pageIndex] : null;
      if (mesh) {
        const g = geo[pageIndex];
        const top = BLOCK_H / 2;
        const local = [
          [-g.w / 2, -g.d / 2],
          [g.w / 2, -g.d / 2],
          [g.w / 2, g.d / 2],
          [-g.w / 2, g.d / 2],
        ];
        s.centre.set(0, 0, 0);
        local.forEach(([x, z], k) => {
          s.corners[k].set(x, top, z).applyMatrix4(mesh.matrixWorld);
          s.centre.add(s.corners[k]);
        });
        s.centre.multiplyScalar(0.25);

        /* Distance that makes the face fill DIVE_FILL of the limiting axis. */
        let ex = 0;
        let ez = 0;
        s.corners.forEach((c) => {
          ex = Math.max(ex, Math.abs(c.x - s.centre.x));
          ez = Math.max(ez, Math.abs(c.z - s.centre.z));
        });
        const distV = (ez * 2 * Math.cos(DIVE_TILT)) / (DIVE_FILL * 2 * TAN_HALF);
        const distH = (ex * 2) / (DIVE_FILL * 2 * TAN_HALF * aspect);
        const dist = Math.max(distV, distH);
        s.pageLook.copy(s.centre);
        s.pageCam.set(
          s.centre.x,
          s.centre.y + dist * Math.cos(DIVE_TILT),
          s.centre.z + dist * Math.sin(DIVE_TILT),
        );
        s.cam.lerp(s.pageCam, dive);
        s.look.lerp(s.pageLook, dive);
      }

      camera.position.copy(s.cam);
      camera.lookAt(s.look);
      camera.updateMatrixWorld();

      let radius = 0;
      if (mesh) {
        quad = s.corners.map((c) => {
          const p = c.clone().project(camera);
          return [((p.x + 1) / 2) * view.width, ((1 - p.y) / 2) * view.height];
        }) as Quad;
        /* Corner radius in px: the block's radius, scaled by how long each
           edge (0-1/2-3 run along w, 1-2/3-0 along d) is on screen. */
        const g = geo[pageIndex];
        const len = (a: number, b: number) =>
          Math.hypot(quad![a][0] - quad![b][0], quad![a][1] - quad![b][1]);
        radius =
          ((len(0, 1) + len(2, 3)) / (2 * g.w) + (len(1, 2) + len(3, 0)) / (2 * g.d)) *
          0.5 *
          BLOCK_R;
        /* Order clockwise on screen, starting top-left. */
        const cx = quad.reduce((a, q) => a + q[0], 0) / 4;
        const cy = quad.reduce((a, q) => a + q[1], 0) / 4;
        quad.sort(
          (a, b) =>
            Math.atan2(a[1] - cy, a[0] - cx) - Math.atan2(b[1] - cy, b[0] - cx),
        );
      }

      /* Hero: report the box's screen bounds so the DOM can put a hover /
         tap target exactly over it. */
      let box: SceneOutput["box"] = null;
      if (inHero && rig.current) {
        let x0 = Infinity;
        let y0 = Infinity;
        let x1 = -Infinity;
        let y1 = -Infinity;
        for (const sx of [-1, 1])
          for (const sy of [0, 1])
            for (const sz of [-1, 1]) {
              s.bound
                .set((sx * OUTER_W) / 2, sy * (TRAY_H + LID_H), (sz * OUTER_D) / 2)
                .applyMatrix4(rig.current.matrixWorld)
                .project(camera);
              const px = ((s.bound.x + 1) / 2) * view.width;
              const py = ((1 - s.bound.y) / 2) * view.height;
              x0 = Math.min(x0, px);
              y0 = Math.min(y0, py);
              x1 = Math.max(x1, px);
              y1 = Math.max(y1, py);
            }
        box = [x0, y0, x1 - x0, y1 - y0];
      }

      state.advance(timeMs, true);
      return { quad, radius, box };
    };

    api.current = { render };
    return () => {
      api.current = null;
    };
  }, [api, get, geo, materials, scratch]);

  return (
    <group ref={rig}>
      {/* Tray */}
      <RoundedBox
        args={[OUTER_W, TRAY_H, OUTER_D]}
        radius={0.12}
        smoothness={5}
        position-y={TRAY_H / 2}
        material={shell.tray}
      />
      {/* Gold pin-line along the tray rim. Its top sits a hair above the
          tray's top face: if the two were coplanar they'd z-fight and the
          rim would flicker in stripes as the box moves. */}
      <RoundedBox
        args={[OUTER_W + 0.012, 0.022, OUTER_D + 0.012]}
        radius={0.011}
        smoothness={3}
        position-y={TRAY_H - 0.009}
        material={shell.gold}
      />
      {/* Second pin-line at the foot: frames the tray's base against the page */}
      <RoundedBox
        args={[OUTER_W + 0.012, 0.018, OUTER_D + 0.012]}
        radius={0.009}
        smoothness={3}
        position-y={0.05}
        material={shell.gold}
      />
      {/* Compartment well + slots */}
      <RoundedBox
        args={[INNER_W + 0.08, 0.02, INNER_D + 0.08]}
        radius={0.01}
        smoothness={2}
        position-y={TRAY_H}
        material={shell.well}
      />
      {geo.map((g, i) => (
        <mesh
          key={`slot-${bentoCells[i].id}`}
          rotation-x={-Math.PI / 2}
          position={[g.x, TRAY_H + 0.013, g.z]}
          material={shell.slot}
          geometry={slotShapes[i]}
        />
      ))}

      {/* Compartments */}
      {geo.map((g, i) => (
        <RoundedBox
          key={bentoCells[i].id}
          ref={(el: THREE.Mesh | null) => {
            blocks.current[i] = el;
          }}
          args={[g.w, BLOCK_H, g.d]}
          radius={BLOCK_R}
          smoothness={4}
          position={[g.x, HIDDEN_Y, g.z]}
          material={materials[i]}
          visible={false}
        >
          {coversOn && (
            <CoverInlay
              index={i}
              w={g.w}
              d={g.d}
              portrait={portrait}
              onMaterial={(m) => {
                coverMats.current[i] = m;
              }}
            />
          )}
        </RoundedBox>
      ))}

      {/* Lid, hinged on the back edge */}
      <group ref={lid} position={[0, TRAY_H + 0.004, -OUTER_D / 2]}>
        <RoundedBox
          args={[OUTER_W, LID_H, OUTER_D]}
          radius={0.1}
          smoothness={5}
          position={[0, LID_H / 2, OUTER_D / 2]}
          material={shell.lid}
        />
        {/* Lining on the underside, facing down into the box. */}
        <mesh
          rotation-x={Math.PI / 2}
          position={[0, -0.002, OUTER_D / 2]}
          geometry={liningShape}
          material={shell.lining}
        />
        <mesh position={[0, LID_H + 0.012, OUTER_D / 2]} material={shell.gold}>
          <cylinderGeometry args={[0.2, 0.2, 0.024, 64]} />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh
            key={`frame-x-${side}`}
            position={[0, LID_H + 0.004, OUTER_D / 2 + side * ((OUTER_D - 0.7) / 2)]}
            material={shell.gold}
          >
            <boxGeometry args={[OUTER_W - 0.7, 0.006, 0.016]} />
          </mesh>
        ))}
        {[-1, 1].map((side) => (
          <mesh
            key={`frame-z-${side}`}
            position={[side * ((OUTER_W - 0.7) / 2), LID_H + 0.004, OUTER_D / 2]}
            material={shell.gold}
          >
            <boxGeometry args={[0.016, 0.006, OUTER_D - 0.7]} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* Canvas — frameloop "never": the showcase's scroll loop renders it.  */
/* ------------------------------------------------------------------ */
interface BentoBoxCanvasProps {
  api: RefObject<BentoSceneHandle | null>;
}

const BentoBoxCanvas = ({ api }: BentoBoxCanvasProps) => (
  <Canvas
    frameloop="never"
    dpr={[1, 1.75]}
    camera={{ fov: FOV, near: 0.1, far: 80, position: [1.1, 3.6, 8.2] }}
    gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    style={{ background: "transparent" }}
  >
    <ambientLight intensity={0.42} />
    <directionalLight position={[4, 7, 5]} intensity={1.5} color="#ffe6c4" />
    <directionalLight position={[-5, 3, -6]} intensity={1.1} color={C.accent} />
    {/* Rim light from behind: traces the box's edges against the dark. */}
    <directionalLight position={[0, 4, -9]} intensity={1.6} color="#ffd9a8" />
    <pointLight
      position={[0, 1.9, 0.4]}
      intensity={5}
      distance={6}
      decay={2}
      color="#ffd7ab"
    />

    <Environment resolution={256} frames={1}>
      <Lightformer form="rect" intensity={2.2} position={[0, 5, -3]} scale={[10, 2, 1]} color="#ffffff" />
      <Lightformer form="rect" intensity={1.4} position={[-5, 2, 1]} rotation-y={Math.PI / 2} scale={[6, 1.2, 1]} color={C.lightAccent} />
      <Lightformer form="rect" intensity={1.2} position={[5, 1, 2]} rotation-y={-Math.PI / 2} scale={[6, 1, 1]} color={C.accent} />
      <Lightformer form="ring" intensity={0.8} position={[0, 6, 4]} scale={3} color="#ffffff" />
      {/* Warm strip behind and above: a bright edge on the clearcoat rims. */}
      <Lightformer form="rect" intensity={1.6} position={[0, 3, -7]} scale={[12, 1.2, 1]} color={C.lightAccent} />
      {/* Soft warm panel in front, so the tray's front face — what the
          near-level hero view mostly sees — reads as lacquer, not a void. */}
      <Lightformer form="rect" intensity={1.3} position={[0, 0.6, 9]} scale={[9, 1.6, 1]} color={C.lightAccent} />
      {/* Low strip under the front edge: a bright line along the tray's foot. */}
      <Lightformer form="rect" intensity={1.1} position={[0, -1.2, 6]} rotation-x={-0.4} scale={[10, 0.6, 1]} color="#ffe2bd" />
    </Environment>

    <BentoBox api={api} />

    <ContactShadows
      position={[0, -0.02, 0]}
      opacity={0.75}
      scale={14}
      blur={3}
      far={4}
      resolution={384}
      color="#000000"
    />
  </Canvas>
);

export default BentoBoxCanvas;
