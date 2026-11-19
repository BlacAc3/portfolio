import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/** Materials that look the same share a batch, even if they're separate instances. */
const matKey = (m: THREE.Material) => {
  const s = m as THREE.MeshStandardMaterial;
  return [
    m.type,
    s.color?.getHexString(),
    s.emissive?.getHexString(),
    s.emissiveIntensity,
    s.roughness,
    s.metalness,
    s.map?.uuid,
    m.side,
    m.transparent,
    m.opacity,
  ].join("|");
};

const attrKey = (g: THREE.BufferGeometry) =>
  `${g.index ? "i" : "n"}:${Object.keys(g.attributes).sort().join(",")}`;

/**
 * Renders its children once, then swaps them for one merged mesh per
 * material: dozens of draw calls become a handful. Only for static props;
 * anything the children animate afterwards is ignored. Change `bakeKey`
 * to re-bake (e.g. on a colour change).
 */
export const Baked = ({
  children,
  bakeKey,
}: {
  children: ReactNode;
  bakeKey?: string;
}) => {
  const src = useRef<THREE.Group>(null);
  const [baked, setBaked] = useState<THREE.Group | null>(null);

  useLayoutEffect(() => {
    const root = src.current;
    if (!root) return;
    root.visible = true;
    root.updateWorldMatrix(true, true);
    const inv = root.matrixWorld.clone().invert();
    const groups = new Map<
      string,
      { mat: THREE.Material; geos: THREE.BufferGeometry[] }
    >();
    root.traverseVisible((o) => {
      const mesh = o as THREE.Mesh;
      if (
        !mesh.isMesh ||
        Array.isArray(mesh.material) ||
        (mesh as THREE.InstancedMesh).isInstancedMesh
      )
        return;
      const g = mesh.geometry.clone();
      g.applyMatrix4(inv.clone().multiply(mesh.matrixWorld));
      const k = `${matKey(mesh.material)}#${attrKey(g)}`;
      const entry = groups.get(k) ?? { mat: mesh.material, geos: [] };
      entry.geos.push(g);
      groups.set(k, entry);
    });
    const out = new THREE.Group();
    for (const { mat, geos } of groups.values()) {
      const merged = geos.length > 1 ? mergeGeometries(geos) : geos[0];
      if (geos.length > 1) geos.forEach((g) => g.dispose());
      if (merged) out.add(new THREE.Mesh(merged, mat));
    }
    root.visible = false;
    setBaked(out);
    return () => {
      out.traverse((o) => (o as THREE.Mesh).geometry?.dispose());
      setBaked(null);
    };
  }, [bakeKey]);

  // Keep the source hidden once a bake exists (React re-renders reset nothing,
  // but be explicit in case a child toggles visibility).
  useEffect(() => {
    if (baked && src.current) src.current.visible = false;
  });

  return (
    <>
      <group ref={src}>{children}</group>
      {baked && <primitive object={baked} />}
    </>
  );
};
