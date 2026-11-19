/**
 * Loading state for the about-page drive, shared by the 3D scene (which
 * writes it) and the DOM loader (which reads it). Free of three.js, so the
 * page can show progress before the scene's chunk has even arrived.
 */
export interface JourneyLoad {
  /** The scene's code has arrived and started fetching models. */
  chunk: boolean;
  /** Files finished / files requested, as counted by three's loading manager. */
  loaded: number;
  total: number;
  /** Bytes received / expected, over the files that report a size. */
  bytes: number;
  bytesTotal: number;
  /** Models in place and every shader compiled: safe to show without a hitch. */
  ready: boolean;
}

let state: JourneyLoad = { chunk: false, loaded: 0, total: 0, bytes: 0, bytesTotal: 0, ready: false };
const subs = new Set<() => void>();

export const journeyLoad = {
  get: () => state,
  set(patch: Partial<JourneyLoad>) {
    state = { ...state, ...patch };
    subs.forEach((f) => f());
  },
  subscribe(f: () => void) {
    subs.add(f);
    return () => void subs.delete(f);
  },
};

/** Fetch the scene's code, and with it every model (they preload on import). */
export const preloadJourney = () => import("./JourneyScene");
