import { CHAPTERS } from "./chapters";
import { window4 } from "./state";

/** Timing shared by the DOM layer and the scene (kept free of three.js). */
export const N = CHAPTERS.length;

/** The dive into the monitor: a screen-coloured veil at the cut. */
export const veilAt = (u: number) => window4(u, 4.88, 4.975, 5.02, 5.14);

/** Text panels and route stops: where each chapter reads best. */
export const READ_AT = [0.2, 0.6, 0.62, 0.58, 0.35, 0.45, 0.55, 0.62, 0.6];

/** How much of the side-panel framing offset applies: none during the dive. */
export const framingAt = (u: number) => 1 - window4(u, 4.72, 4.92, 5.05, 5.4);
