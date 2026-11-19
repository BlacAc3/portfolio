/**
 * Turns the downloaded Sketchfab models (models-src/, not committed) into
 * small web-ready GLBs in public/models/.
 *
 *   pnpm models
 *
 * Node names are kept (no join/flatten) because the About page animates
 * parts by name. Credits: public/models/CREDITS.md.
 */
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import {
  dedup,
  flatten,
  join,
  metalRough,
  meshopt,
  prune,
  simplify,
  textureCompress,
  weld,
} from "@gltf-transform/functions";
import { MeshoptEncoder, MeshoptSimplifier } from "meshoptimizer";
import sharp from "sharp";
import { statSync } from "node:fs";

const SRC = "models-src";
const OUT = "public/models";

await MeshoptEncoder.ready;
await MeshoptSimplifier.ready;
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ "meshopt.encoder": MeshoptEncoder });

const tris = (doc) =>
  doc
    .getRoot()
    .listMeshes()
    .flatMap((m) => m.listPrimitives())
    .reduce((a, p) => a + (p.getIndices()?.getCount() ?? p.getAttribute("POSITION").getCount()) / 3, 0);

const meshNodes = (doc) => doc.getRoot().listNodes().filter((n) => n.getMesh());
const matNames = (n) => n.getMesh().listPrimitives().map((p) => p.getMaterial()?.getName() ?? "");

/** Drop every primitive whose material matches. */
const dropMaterials = (doc, names) => {
  for (const mesh of doc.getRoot().listMeshes())
    for (const p of mesh.listPrimitives())
      if (names.includes(p.getMaterial()?.getName())) p.dispose();
};

const stripLights = (doc) => {
  for (const ext of doc.getRoot().listExtensionsUsed())
    if (ext.extensionName === "KHR_lights_punctual") ext.dispose();
};

/**
 * `merge` flattens the hierarchy and joins primitives that share a
 * material: far fewer draw calls, but node names are lost, so only for
 * models nothing animates by name.
 */
async function build({ src, out, edit, ratio, error = 0.0008, texSize, merge = false }) {
  const doc = await io.read(`${SRC}/${src}`);
  const before = tris(doc);
  stripLights(doc);
  await edit?.(doc);
  await doc.transform(
    metalRough(),
    dedup(),
    prune({ keepLeaves: false }),
    ...(merge ? [flatten(), join({ keepNamed: false })] : []),
    weld(),
    simplify({ simplifier: MeshoptSimplifier, ratio, error }),
    textureCompress({ encoder: sharp, targetFormat: "webp", resize: [texSize, texSize], quality: 82 }),
    prune(),
    meshopt({ encoder: MeshoptEncoder, level: "medium" }),
  );
  await io.write(`${OUT}/${out}`, doc);
  const kb = (statSync(`${OUT}/${out}`).size / 1024).toFixed(0);
  console.log(`${out.padEnd(22)} ${Math.round(before)} → ${Math.round(tris(doc))} tris, ${kb} KB`);
}

// Ferrari 812: badges off, one wheel design (instanced ×4 at runtime).
await build({
  src: "ferrari_812.glb",
  out: "ferrari-812.glb",
  ratio: 0.6,
  texSize: 1024,
  edit: (doc) => {
    dropMaterials(doc, ["logo_812", "emblem_812", "ferrari812_logo_wheel", "emblemsteer_812", "material_0"]);
    for (const n of doc.getRoot().listNodes())
      if (["812_wheel_1", "812_wheel_2", "812_wheel_custom"].includes(n.getName())) {
        n.traverse((c) => c !== n && c.dispose());
        n.dispose();
      }
  },
});

// Ferrari F12berlinetta, parked at the meet: badges, plates and the
// cabin's small parts go; it's only ever seen from outside.
await build({
  src: "ferrari_f12_berlinetta.glb",
  out: "ferrari-f12.glb",
  ratio: 0.12,
  error: 0.005,
  texSize: 512,
  merge: true,
  edit: (doc) =>
    dropMaterials(doc, [
      "badge", "badge_caliper", "emblem", "rear_rim_logo", "f12_arrow", "EXT_PLATE", "EXT_door_key",
      "F12_DIGITAL_LCD", "F12_DIGITAL_LCD3", "INT_Decals_NM", "INT_Display_Luminosi", "INT_Display_RADIO",
      "INT_digital_gauge", "INT_digital_gauge.001", "INT_gauge_emissive_alpha", "INT_gauge_needle",
      "INT_gauge_needle.001", "INT_gauge_needle.002", "INT_speakers", "INT_belts", "INT_leather_stitching",
      "gauge_alpha", "gauge_emissive", "ledsiplayicon", "braid_pipe", "wire", "water_cooler",
    ]),
});

await build({ src: "boxing_gloves.glb", out: "boxing-glove.glb", ratio: 1, texSize: 1024 });
await build({ src: "ducati_panigale.glb", out: "ducati-panigale.glb", ratio: 0.22, error: 0.0015, texSize: 1024 });
await build({ src: "brake.glb", out: "brake.glb", ratio: 1, texSize: 512 });
