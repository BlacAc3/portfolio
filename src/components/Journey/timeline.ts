import { CHAPTERS } from "./chapters";
import { window4 } from "./state";

/** Timing shared by the DOM layer and the scene (kept free of three.js). */

/** Where each chapter starts on the scene timeline (a chapter can span several beats). */
export const STARTS = CHAPTERS.reduce<number[]>((a, _, i) => [...a, i ? a[i - 1] + (CHAPTERS[i - 1].span ?? 1) : 0], []);
/** Length of the scene timeline: `u` runs from 0 to N. */
export const N = STARTS[STARTS.length - 1] + (CHAPTERS[CHAPTERS.length - 1].span ?? 1);
/** Number of chapters (text panels and route stops). */
export const STOPS = CHAPTERS.length;
export const spanOf = (i: number) => CHAPTERS[i].span ?? 1;
/** The chapter whose text owns scene position `u`. */
export const chapterAt = (u: number) => {
  let c = 0;
  while (c < STOPS - 1 && u >= STARTS[c + 1]) c++;
  return c;
};

/** The dive into the monitor: a screen-coloured veil at the cut. */
export const veilAt = (u: number) => window4(u, 4.88, 4.975, 5.02, 5.14);

/** Text panels and route stops: where each chapter reads best (offset from its start). */
export const READ_AT = [0.2, 0.62, 0.58, 0.35, 0.45, 0.55, 0.62, 0.6];
/** Scene position where chapter `i` reads best. */
export const readU = (i: number) => STARTS[i] + READ_AT[i];

/** How much of the side-panel framing offset applies: none during the dive. */
export const framingAt = (u: number) => 1 - window4(u, 4.72, 4.92, 5.05, 5.4);
