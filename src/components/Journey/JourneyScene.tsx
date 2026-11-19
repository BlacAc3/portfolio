import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import type { Theme } from "../../contexts/ThemeContext";
import { StudioLights } from "../Three/shared";
import { HeroCar } from "./Car";
import { desktopTexture } from "./desktop";
import { direct, shotAt } from "./director";
import { framingAt } from "./timeline";
import { newFrameState, type FrameState } from "./frame";
import { scenePalette, type Palette } from "./palette";
import {
  Bike,
  Garage,
  Lamps,
  Meet,
  Road,
  Streaks,
  Workshop,
  WindTunnel,
} from "./sets";
import { Space } from "./space";
import { journey, lerp } from "./state";

/**
 * The 3D drive. One Director computes the whole frame from `journey.u`;
 * everything else just reads the frame state. Mounted first, so it runs
 * before the sets in every frame.
 */

const Director = ({
  fs,
  pal,
  framing,
}: {
  fs: FrameState;
  pal: Palette;
  framing: boolean;
}) => {
  const { camera, scene, size } = useThree();
  const cam = camera as THREE.PerspectiveCamera;
  const look = useMemo(() => new THREE.Vector3(), []);
  const road = useMemo(() => new THREE.Color(pal.fog), [pal]);
  const space = useMemo(() => new THREE.Color(pal.void), [pal]);

  useEffect(() => {
    scene.fog = new THREE.Fog(pal.fog, 30, 140);
    scene.background = new THREE.Color(pal.fog);
    return () => {
      scene.fog = null;
      scene.background = null;
    };
  }, [scene, pal]);

  useFrame((state) => {
    const u = journey.u;
    fs.time = state.clock.elapsedTime;
    direct(u, fs);
    const shot = shotAt(u, fs);

    // Tall screens: back off along the view direction so the subject fits.
    const portrait = size.height > size.width;
    const wide = portrait ? shot.wide : 1;
    look.set(...shot.look);
    cam.position.set(
      lerp(shot.look[0], shot.pos[0], wide),
      lerp(shot.look[1], shot.pos[1], wide),
      lerp(shot.look[2], shot.pos[2], wide),
    );
    cam.lookAt(look);
    cam.fov = shot.fov;

    // The chapter panel sits left on desktop, at the bottom on phones;
    // shift the picture away from it.
    const f = framing ? framingAt(u) : 0;
    const w = size.width;
    const h = size.height;
    if (portrait) cam.setViewOffset(w, h, 0, h * 0.16 * f, w, h);
    else cam.setViewOffset(w, h, -w * 0.17 * f, 0, w, h);
    cam.updateProjectionMatrix();

    // Inside the screen the world is a plain void; out on the road, dusk.
    const inSpace = u >= 5;
    const fog = scene.fog as THREE.Fog | null;
    const bg = inSpace ? space : road;
    (scene.background as THREE.Color | null)?.copy(bg);
    if (fog) {
      fog.color.copy(bg);
      fog.near = inSpace ? 14 : 30;
      fog.far = inSpace ? 42 : 140;
    }
  });

  return null;
};

/**
 * Compile every shader and upload every texture up front, including the
 * sets that are hidden until later chapters, so scrolling into a new set
 * never stalls on a first-use compile. Re-runs whenever a model finishes
 * loading.
 */
const Warmup = () => {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    let raf = 0;
    const run = () => {
      const hidden: THREE.Object3D[] = [];
      const textures = new Set<THREE.Texture>();
      scene.traverse((o) => {
        if (!o.visible) {
          hidden.push(o);
          o.visible = true;
        }
        const mats = (o as THREE.Mesh).material;
        if (!mats) return;
        for (const m of Array.isArray(mats) ? mats : [mats])
          for (const v of Object.values(m))
            if ((v as THREE.Texture)?.isTexture)
              textures.add(v as THREE.Texture);
      });
      // compileAsync builds the programs synchronously, then waits on the driver.
      gl.compileAsync(scene, camera).catch(() => {});
      for (const o of hidden) o.visible = false;
      textures.forEach((t) => gl.initTexture(t));
    };
    const schedule = () => {
      cancelAnimationFrame(raf);
      // Two frames: let Suspense mount the model that just arrived.
      raf = requestAnimationFrame(() => (raf = requestAnimationFrame(run)));
    };
    schedule();
    const mgr = THREE.DefaultLoadingManager;
    const prev = mgr.onLoad;
    mgr.onLoad = () => {
      prev?.();
      schedule();
    };
    return () => {
      cancelAnimationFrame(raf);
      mgr.onLoad = prev;
    };
  }, [gl, scene, camera]);
  return null;
};

/** The hero car's root: rides along the road. */
const CarRig = ({ fs }: { fs: FrameState }) => {
  const g = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!g.current) return;
    g.current.position.x = fs.car.x;
    g.current.visible = journey.u < 5.05;
  });
  return (
    <group ref={g}>
      <HeroCar ctl={fs.car.ctl} />
      <BlobShadow />
    </group>
  );
};

const BlobShadow = () => {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
    g.addColorStop(0, "rgba(0,0,0,0.75)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }, []);
  useEffect(() => () => tex.dispose(), [tex]);
  return (
    <mesh
      rotation-x={-Math.PI / 2}
      position-y={0.012}
      scale={[5.6, 2.5, 1]}
      renderOrder={1}
    >
      <planeGeometry />
      <meshBasicMaterial map={tex} transparent depthWrite={false} />
    </mesh>
  );
};

const World = ({
  theme,
  framing,
  particles,
}: {
  theme: Theme;
  framing: boolean;
  particles: number;
}) => {
  const pal = scenePalette(theme);
  const fs = useMemo(newFrameState, []);
  const desktop = useMemo(desktopTexture, []);
  useEffect(() => () => desktop.dispose(), [desktop]);

  return (
    <>
      <Director fs={fs} pal={pal} framing={framing} />
      <Warmup />
      <StudioLights theme={theme} />
      <hemisphereLight
        args={[pal.hemiSky, pal.hemiGround, pal.night ? 0.35 : 0.6]}
      />
      <Road pal={pal} />
      <Lamps pal={pal} />
      <Streaks fs={fs} />
      <Bike fs={fs} pal={pal} />
      <CarRig fs={fs} />
      <Meet fs={fs} pal={pal} />
      <Workshop fs={fs} pal={pal} />
      <WindTunnel fs={fs} pal={pal} />
      <Garage fs={fs} pal={pal} screen={desktop} />
      <Space fs={fs} pal={pal} desktop={desktop} particles={particles} />
    </>
  );
};

export default function JourneyScene({
  theme,
  active,
  framing,
  particles,
}: {
  theme: Theme;
  active: boolean;
  framing: boolean;
  particles: number;
}) {
  // Start sharp; drop to 1× if the device can't hold its frame rate.
  const [maxDpr, setMaxDpr] = useState(1.5);
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, maxDpr]}
      camera={{ fov: 40, near: 0.2, far: 400, position: [6, 1.2, 5] }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      aria-hidden="true"
    >
      <PerformanceMonitor
        flipflops={3}
        onDecline={() => setMaxDpr(1)}
        onIncline={() => setMaxDpr(1.5)}
        onFallback={() => setMaxDpr(1)}
      />
      <World theme={theme} framing={framing} particles={particles} />
    </Canvas>
  );
}
