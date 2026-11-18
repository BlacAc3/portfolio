import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { PALETTE, useTheme } from "../../contexts/ThemeContext";
import { FloorShadow, ModelCanvas, PointerRig, StudioLights } from "./shared";
import type { ModelProps } from "./ModelStage";

/**
 * An exploded view of the systems the case studies describe:
 * interface → API → queue → database, with packets of data moving between.
 * Layer order matches STACK_LAYERS (./stackLayers), the DOM legend.
 */

const LAYER_Y = [1.35, 0.45, -0.45, -1.35];
const PACKETS = 9;

const Packets = ({ color, reduced }: { color: string; reduced: boolean }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const seeds = useMemo(
    () =>
      Array.from({ length: PACKETS }, (_, i) => ({
        x: ((i * 37) % 9) / 9 - 0.45,
        z: ((i * 53) % 7) / 7 - 0.42,
        speed: 0.25 + ((i * 17) % 10) / 30,
        phase: i / PACKETS,
        up: i % 3 !== 0,
      })),
    [],
  );
  const m = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = reduced ? 0 : clock.elapsedTime;
    seeds.forEach((s, i) => {
      const f = (s.phase + t * s.speed) % 1;
      const y = THREE.MathUtils.lerp(-1.35, 1.35, s.up ? f : 1 - f);
      m.position.set(s.x * 2.2, y, s.z * 2.2);
      const fade = Math.sin(f * Math.PI); // shrink in and out at the ends
      m.scale.setScalar(0.4 + fade * 0.6);
      m.updateMatrix();
      mesh.setMatrixAt(i, m.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, PACKETS]}>
      <sphereGeometry args={[0.055, 16, 16]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </instancedMesh>
  );
};

const Stack = ({ reduced }: { reduced: boolean }) => {
  const { theme } = useTheme();
  const p = PALETTE[theme];
  const layers = useRef<(THREE.Group | null)[]>([]);
  const light = theme === "light";
  const slab = light ? "#f3ece0" : p.raised;
  const deep = light ? "#ddd2c1" : p.surface;

  useFrame(({ clock }) => {
    const t = reduced ? 0 : clock.elapsedTime;
    layers.current.forEach((g, i) => {
      if (!g) return;
      // Layers breathe apart and back, slightly out of phase.
      g.position.y = LAYER_Y[i] * (1 + Math.sin(t * 0.8) * 0.06) + Math.sin(t * 1.1 + i) * 0.03;
    });
  });

  const setRef = (i: number) => (g: THREE.Group | null) => {
    layers.current[i] = g;
  };

  return (
    <group>
      {/* Interface — a glassy screen with UI blocks */}
      <group ref={setRef(0)}>
        <RoundedBox args={[2.6, 0.14, 1.9]} radius={0.06} smoothness={4}>
          <meshPhysicalMaterial color={slab} roughness={0.2} clearcoat={1} transparent opacity={0.92} />
        </RoundedBox>
        {[
          [-0.7, -0.45, 0.9, 0.34, true],
          [0.45, -0.45, 1.1, 0.34, false],
          [-0.35, 0.25, 1.6, 0.5, false],
          [0.85, 0.25, 0.5, 0.5, false],
        ].map(([x, z, w, d, gold], i) => (
          <RoundedBox
            key={i}
            args={[w as number, 0.05, d as number]}
            radius={0.02}
            position={[x as number, 0.09, z as number]}
          >
            <meshStandardMaterial
              color={gold ? p.accent : deep}
              metalness={gold ? 0.8 : 0.1}
              roughness={gold ? 0.3 : 0.6}
            />
          </RoundedBox>
        ))}
      </group>

      {/* API — a slab with a row of endpoints */}
      <group ref={setRef(1)}>
        <RoundedBox args={[2.4, 0.22, 1.7]} radius={0.07} smoothness={4}>
          <meshPhysicalMaterial color={deep} roughness={0.4} clearcoat={0.6} />
        </RoundedBox>
        {[-0.8, -0.27, 0.27, 0.8].map((x, i) => (
          <mesh key={x} position={[x, 0.13, 0]}>
            <cylinderGeometry args={[0.13, 0.13, 0.05, 32]} />
            <meshStandardMaterial
              color={i === 1 ? p.accent : slab}
              metalness={i === 1 ? 0.8 : 0.1}
              roughness={0.35}
              emissive={i === 1 ? p.accent : "#000000"}
              emissiveIntensity={i === 1 ? 0.25 : 0}
            />
          </mesh>
        ))}
      </group>

      {/* Queue — lanes of jobs */}
      <group ref={setRef(2)}>
        <RoundedBox args={[2.4, 0.18, 1.7]} radius={0.07} smoothness={4}>
          <meshPhysicalMaterial color={slab} roughness={0.45} clearcoat={0.4} />
        </RoundedBox>
        {[-0.45, 0, 0.45].map((z, lane) =>
          [0, 1, 2, 3].slice(0, 4 - lane).map((k) => (
            <RoundedBox
              key={`${lane}-${k}`}
              args={[0.34, 0.1, 0.26]}
              radius={0.03}
              position={[-0.85 + k * 0.42, 0.13, z]}
            >
              <meshStandardMaterial
                color={k === 0 ? p.accent : deep}
                metalness={k === 0 ? 0.7 : 0.1}
                roughness={0.4}
              />
            </RoundedBox>
          )),
        )}
      </group>

      {/* Data — the classic database drum */}
      <group ref={setRef(3)}>
        {[0, 1, 2].map((k) => (
          <mesh key={k} position={[0, -0.16 + k * 0.17, 0]}>
            <cylinderGeometry args={[0.95, 0.95, 0.14, 64]} />
            <meshPhysicalMaterial
              color={k === 2 ? p.accent : deep}
              metalness={k === 2 ? 0.75 : 0.15}
              roughness={k === 2 ? 0.28 : 0.45}
              clearcoat={0.7}
            />
          </mesh>
        ))}
      </group>

      {/* Spines that the packets ride */}
      {[
        [-0.99, -0.92],
        [0.99, 0.92],
      ].map(([x, z]) => (
        <mesh key={x} position={[x, 0, z]}>
          <cylinderGeometry args={[0.008, 0.008, 2.9, 6]} />
          <meshBasicMaterial color={p.accent} transparent opacity={0.4} toneMapped={false} />
        </mesh>
      ))}
      <Packets color={p.accent} reduced={reduced} />
    </group>
  );
};

const ArchitectureStack = ({ active, reduced }: ModelProps) => {
  const { theme } = useTheme();
  return (
    <ModelCanvas active={active} reduced={reduced} camera={{ position: [5.2, 3.6, 6.2], fov: 32 }}>
      <StudioLights theme={theme} />
      <Float enabled={!reduced} speed={1.2} rotationIntensity={0.1} floatIntensity={0.35}>
        <PointerRig baseY={-0.2} strength={0.35} enabled={!reduced}>
          <Stack reduced={reduced} />
        </PointerRig>
      </Float>
      <FloorShadow theme={theme} y={-2.1} />
    </ModelCanvas>
  );
};

export default ArchitectureStack;
