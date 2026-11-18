import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { PALETTE, useTheme } from "../../contexts/ThemeContext";
import { FloorShadow, ModelCanvas, PointerRig, StudioLights, glyphTexture } from "./shared";
import type { ModelProps } from "./ModelStage";

/** The toolkit, as a little mechanical keyboard that types on its own. */
const KEYS = ["Py", "Go", "TS", "JS", "SQL", "</>", "$_", "{ }", "λ", "git", "⌘", "↵"];
const ACCENT_KEYS = new Set([5, 11]);
const COLS = 4;
const ROWS = 3;
const PITCH = 1.08;
const TRAVEL = 0.16;

interface KeyState {
  press: number; // 0 → resting, 1 → bottomed out
  target: number;
}

const Keycaps = ({ reduced }: { reduced: boolean }) => {
  const { theme } = useTheme();
  const p = PALETTE[theme];
  const keyRefs = useRef<(THREE.Group | null)[]>([]);
  const state = useRef<KeyState[]>(KEYS.map(() => ({ press: 0, target: 0 })));
  const nextAt = useRef(0);

  const textures = useMemo(
    () =>
      KEYS.map((k, i) =>
        glyphTexture(k, ACCENT_KEYS.has(i) ? p.canvas : theme === "light" ? p.ink : p.accentSoft),
      ),
    [p, theme],
  );
  useEffect(() => () => textures.forEach((t) => t.dispose()), [textures]);

  // Redraw glyphs once the web font is in, so they don't stick to the fallback.
  useEffect(() => {
    let live = true;
    document.fonts?.ready.then(() => {
      if (!live) return;
      textures.forEach((t, i) => {
        const fresh = glyphTexture(
          KEYS[i],
          ACCENT_KEYS.has(i) ? p.canvas : theme === "light" ? p.ink : p.accentSoft,
        );
        t.image = fresh.image;
        t.needsUpdate = true;
        fresh.dispose();
      });
    });
    return () => {
      live = false;
    };
  }, [textures, p, theme]);

  const press = (i: number) => {
    state.current[i].target = 1;
  };

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    // "Typing": every so often a random key goes down.
    if (!reduced && t > nextAt.current) {
      press(Math.floor(Math.random() * KEYS.length));
      nextAt.current = t + 0.28 + Math.random() * 0.5;
    }
    state.current.forEach((s, i) => {
      const k = 1 - Math.exp(-dt * (s.target ? 28 : 10));
      s.press += (s.target - s.press) * k;
      if (s.target && s.press > 0.95) s.target = 0;
      const g = keyRefs.current[i];
      if (g) g.position.y = -s.press * TRAVEL;
    });
  });

  const plateW = COLS * PITCH + 0.35;
  const plateD = ROWS * PITCH + 0.35;

  return (
    <group>
      {/* Case */}
      <RoundedBox args={[plateW, 0.42, plateD]} radius={0.16} smoothness={4} position={[0, -0.36, 0]}>
        <meshPhysicalMaterial
          color={theme === "light" ? "#ddd2c1" : p.surface}
          roughness={0.45}
          metalness={0.1}
          clearcoat={0.6}
        />
      </RoundedBox>
      {/* Gold trim line around the case */}
      <RoundedBox args={[plateW + 0.02, 0.05, plateD + 0.02]} radius={0.02} position={[0, -0.16, 0]}>
        <meshStandardMaterial color={p.accent} metalness={0.9} roughness={0.25} />
      </RoundedBox>

      {KEYS.map((_, i) => {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        const x = (col - (COLS - 1) / 2) * PITCH;
        const z = (row - (ROWS - 1) / 2) * PITCH;
        const accent = ACCENT_KEYS.has(i);
        return (
          <group key={i} position={[x, 0, z]}>
            <group
              ref={(g) => {
                keyRefs.current[i] = g;
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                press(i);
              }}
            >
              <RoundedBox args={[0.92, 0.42, 0.92]} radius={0.12} smoothness={4}>
                <meshPhysicalMaterial
                  color={accent ? p.accent : theme === "light" ? "#f3ece0" : p.raised}
                  metalness={accent ? 0.6 : 0.05}
                  roughness={accent ? 0.3 : 0.5}
                  clearcoat={accent ? 0.8 : 0.4}
                  clearcoatRoughness={0.3}
                />
              </RoundedBox>
              <mesh position={[0, 0.212, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.7, 0.7]} />
                <meshBasicMaterial map={textures[i]} transparent toneMapped={false} />
              </mesh>
            </group>
          </group>
        );
      })}
    </group>
  );
};

const KeycapCluster = ({ active, reduced }: ModelProps) => {
  const { theme } = useTheme();
  return (
    <ModelCanvas active={active} reduced={reduced} camera={{ position: [0, 4.2, 6.4], fov: 30 }}>
      <StudioLights theme={theme} />
      <Float enabled={!reduced} speed={1.4} rotationIntensity={0.15} floatIntensity={0.5}>
        <PointerRig baseX={0.05} baseY={-0.45} strength={0.3} enabled={!reduced}>
          <group rotation={[0, 0, 0.04]}>
            <Keycaps reduced={reduced} />
          </group>
        </PointerRig>
      </Float>
      <FloorShadow theme={theme} y={-1.15} />
    </ModelCanvas>
  );
};

export default KeycapCluster;
