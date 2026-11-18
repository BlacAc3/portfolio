import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles, Trail } from "@react-three/drei";
import * as THREE from "three";
import { PALETTE, useTheme } from "../../contexts/ThemeContext";
import { ModelCanvas, PointerRig, StudioLights } from "./shared";
import type { ModelProps } from "./ModelStage";
import { PLANE_LAUNCH_EVENT } from "./planeEvents";


/** A folded paper dart, nose pointing +X. Two wings, two keel flaps. */
const usePlaneGeometry = () =>
  useMemo(() => {
    const N = [1.5, 0, 0]; // nose
    const T = [-1.1, 0.02, 0]; // tail, on the spine
    const L = [-1.1, 0.22, 0.95]; // left wing tip
    const R = [-1.1, 0.22, -0.95]; // right wing tip
    const K = [-1.1, -0.38, 0]; // keel bottom
    const tris = [
      [N, T, L],
      [N, R, T],
      [N, K, T],
      [N, T, K],
    ].flat(2);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(tris, 3));
    g.computeVertexNormals();
    return g;
  }, []);

const Plane = ({ reduced }: { reduced: boolean }) => {
  const { theme } = useTheme();
  const p = PALETTE[theme];
  const geometry = usePlaneGeometry();
  const ref = useRef<THREE.Group>(null);
  const boost = useRef(0);
  const loop = useRef(0);
  const prev = useRef(new THREE.Vector3());

  useEffect(() => {
    const onLaunch = () => {
      boost.current = 1;
    };
    window.addEventListener(PLANE_LAUNCH_EVENT, onLaunch);
    return () => window.removeEventListener(PLANE_LAUNCH_EVENT, onLaunch);
  }, []);

  useFrame(({ clock }, dt) => {
    const g = ref.current;
    if (!g) return;
    const t = reduced ? 0.6 : clock.elapsedTime * 0.45;
    // Lazy figure-eight, with a vertical loop added when launched.
    boost.current = Math.max(0, boost.current - dt * 0.45);
    loop.current += dt * boost.current * 5.5;
    const x = Math.sin(t) * 1.9;
    const z = Math.sin(t * 2) * 0.8;
    const y = Math.sin(t * 1.3) * 0.25 + Math.sin(loop.current) * boost.current * 0.9;
    g.position.set(x, y, z);

    // Point along the velocity, bank into the turn.
    const vel = g.position.clone().sub(prev.current);
    if (vel.lengthSq() > 1e-7) {
      const heading = Math.atan2(-vel.z, vel.x);
      const pitch = Math.atan2(vel.y, Math.hypot(vel.x, vel.z));
      g.rotation.set(0, 0, 0);
      g.rotateY(heading);
      g.rotateZ(pitch);
      g.rotateX(-Math.cos(t * 2) * 0.55 + boost.current * Math.sin(loop.current) * 0.4);
    }
    prev.current.copy(g.position);
  });

  const paper = theme === "light" ? "#f6f0e6" : "#f2e9db";

  return (
    <Trail
      width={1.4}
      length={reduced ? 0 : 5}
      decay={1.2}
      color={p.accent}
      attenuation={(w) => w * w}
    >
      <group ref={ref} scale={0.62}>
        <mesh geometry={geometry} castShadow>
          <meshStandardMaterial
            color={paper}
            roughness={0.75}
            side={THREE.DoubleSide}
            flatShading
          />
        </mesh>
        {/* gold centre crease */}
        <mesh position={[0.2, 0.012, 0]} rotation={[0, 0, -0.008]}>
          <boxGeometry args={[2.6, 0.012, 0.012]} />
          <meshStandardMaterial color={p.accent} metalness={0.8} roughness={0.3} />
        </mesh>
      </group>
    </Trail>
  );
};

const PaperPlane = ({ active, reduced }: ModelProps) => {
  const { theme } = useTheme();
  const p = PALETTE[theme];
  return (
    <ModelCanvas active={active} reduced={reduced} camera={{ position: [0, 1.6, 6.5], fov: 34 }}>
      <StudioLights theme={theme} />
      <PointerRig baseX={0.12} strength={0.25} enabled={!reduced}>
        <Plane reduced={reduced} />
        {!reduced && (
          <Sparkles count={40} scale={[6, 3, 3]} size={2.4} speed={0.3} opacity={0.7} color={p.accent} />
        )}
        {/* Orbit ring the plane circles — the "signal" it carries. */}
        <mesh rotation={[Math.PI / 2 - 0.15, 0, 0]} position={[0, -0.9, 0]}>
          <torusGeometry args={[2.2, 0.008, 8, 128]} />
          <meshBasicMaterial color={p.accent} transparent opacity={0.45} toneMapped={false} />
        </mesh>
        <mesh rotation={[Math.PI / 2 - 0.15, 0, 0]} position={[0, -0.9, 0]}>
          <torusGeometry args={[1.4, 0.006, 8, 96]} />
          <meshBasicMaterial color={p.accent} transparent opacity={0.25} toneMapped={false} />
        </mesh>
      </PointerRig>
    </ModelCanvas>
  );
};

export default PaperPlane;
