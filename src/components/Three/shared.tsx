import { useEffect, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import type { Theme } from "../../contexts/ThemeContext";

/** Viewport-wide pointer in [-1, 1], shared by every model (no re-renders). */
const pointer = { x: 0, y: 0 };
let listening = false;
const listen = () => {
  if (listening || typeof window === "undefined") return;
  listening = true;
  window.addEventListener(
    "pointermove",
    (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    },
    { passive: true },
  );
};

/** Eases a group's rotation toward the pointer — the whole model "looks" at you. */
export const PointerRig = ({
  children,
  strength = 0.35,
  baseX = 0,
  baseY = 0,
  enabled = true,
}: {
  children: ReactNode;
  strength?: number;
  baseX?: number;
  baseY?: number;
  enabled?: boolean;
}) => {
  const ref = useRef<THREE.Group>(null);
  useEffect(listen, []);
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    const tx = baseX + (enabled ? pointer.y * strength * 0.6 : 0);
    const ty = baseY + (enabled ? pointer.x * strength : 0);
    const k = 1 - Math.exp(-dt * 3);
    g.rotation.x += (tx - g.rotation.x) * k;
    g.rotation.y += (ty - g.rotation.y) * k;
  });
  return (
    <group ref={ref} rotation={[baseX, baseY, 0]}>
      {children}
    </group>
  );
};

/** Studio lighting built from local light-formers — no HDR download. */
export const StudioLights = ({ theme }: { theme: Theme }) => (
  <>
    <ambientLight intensity={theme === "light" ? 0.7 : 0.45} />
    <directionalLight position={[4, 6, 5]} intensity={theme === "light" ? 1.35 : 1.3} />
    <directionalLight position={[-5, 2, -3]} intensity={0.5} color="#ffd9a6" />
    <Environment resolution={128}>
      <Lightformer form="rect" intensity={2} position={[0, 5, 2]} scale={[8, 3, 1]} />
      <Lightformer form="rect" intensity={1.2} color="#ffd9a6" position={[-5, 1, 1]} rotation-y={Math.PI / 2} scale={[6, 2, 1]} />
      <Lightformer form="rect" intensity={0.8} position={[5, 0, -1]} rotation-y={-Math.PI / 2} scale={[6, 2, 1]} />
      <Lightformer form="ring" intensity={1.5} color="#dcb077" position={[0, -2, 4]} scale={2} />
    </Environment>
  </>
);

export const FloorShadow = ({ theme, y = -1.6 }: { theme: Theme; y?: number }) => (
  <ContactShadows
    position={[0, y, 0]}
    opacity={theme === "light" ? 0.35 : 0.6}
    scale={10}
    blur={2.6}
    far={4}
    resolution={512}
    color={theme === "light" ? "#4a341c" : "#000000"}
  />
);

/** Canvas defaults shared by the page models. */
export const ModelCanvas = ({
  children,
  active,
  reduced,
  camera = { position: [0, 0.6, 7] as [number, number, number], fov: 32 },
}: {
  children: ReactNode;
  active: boolean;
  reduced: boolean;
  camera?: { position: [number, number, number]; fov: number };
}) => (
  <Canvas
    className="!absolute inset-0"
    dpr={[1, 1.75]}
    camera={camera}
    // Off screen nothing renders; reduced motion draws on demand (one still frame).
    frameloop={!active ? "never" : reduced ? "demand" : "always"}
    gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
  >
    {children}
  </Canvas>
);

/** A crisp text glyph on a transparent canvas texture. */
export const glyphTexture = (text: string, color: string, size = 256) => {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const px = text.length > 2 ? size * 0.3 : size * 0.38;
  ctx.font = `700 ${px}px "Space Grotesk", ui-monospace, monospace`;
  ctx.fillText(text, size / 2, size / 2 + size * 0.02);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
};
