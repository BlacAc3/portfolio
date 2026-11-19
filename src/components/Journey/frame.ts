import { newCarControl } from "./Car";

/**
 * Everything the scene needs this frame, derived from the scroll position by
 * the director (JourneyScene) and read by the sets. Plain mutable object.
 */
export const newFrameState = () => ({
  time: 0,
  car: { x: 0, z: 0, yaw: 0, ctl: newCarControl() },
  bike: { x: 0, z: -2.3, travel: 0, lean: 0, visible: true, parked: 0 },
  /** Pop-up sets: 0 folded flat, 1 standing. */
  rise: { meet: 0, workshop: 0, tunnel: 0, garage: 0, ring: 0 },
  /** Streamline flow in the wind tunnel, 0 → 1. */
  streams: 0,
  /** Monitor glow in the garage. */
  screen: 0,
  space: {
    /** Tiled windows: 0 flat on the screen → 1 spread in depth. */
    spread: 0,
    tiles: 0,
    /** Particle morph stage: 0 windows, 1 graph, 2 Hello, 3 Bonjour, 4 bag. */
    stage: 0,
    particles: 0,
    graph: 0,
    bag: 0,
    /** Boxing combo time, 0 → 1 across the chapter. */
    combo: 0,
  },
  speed: 0,
});

export type FrameState = ReturnType<typeof newFrameState>;
