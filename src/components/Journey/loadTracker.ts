import * as THREE from "three";
import { journeyLoad } from "./loading";

/**
 * Counts every file three's default loading manager fetches (the GLBs and
 * their textures). Imported first by each module that preloads a model, so
 * it is in place before the first request goes out. Wraps the manager's
 * item methods rather than its callbacks, which drei's useProgress owns.
 */
const mgr = THREE.DefaultLoadingManager as THREE.LoadingManager & { __journey?: boolean };
let pending = 0;
const idle = new Set<() => void>();

if (!mgr.__journey) {
  mgr.__journey = true;
  const start = mgr.itemStart.bind(mgr);
  const end = mgr.itemEnd.bind(mgr);
  const done = () => {
    pending = Math.max(0, pending - 1);
    journeyLoad.set({ loaded: journeyLoad.get().loaded + 1 });
    if (!pending) idle.forEach((f) => f());
  };
  mgr.itemStart = (url) => {
    pending++;
    journeyLoad.set({ total: journeyLoad.get().total + 1 });
    start(url);
  };
  // Also called after a failure (that model keeps its procedural stand-in).
  mgr.itemEnd = (url) => {
    end(url);
    done();
  };
}
journeyLoad.set({ chunk: true });

/**
 * Bytes per file, for a smooth progress bar: the files download in parallel
 * and finish close together, so a file count alone moves in big jumps.
 * FileLoader streams every response and reports bytes to its callbacks; the
 * preloads pass none, so add one that records them.
 */
type Load = THREE.FileLoader["load"];
const fl = THREE.FileLoader.prototype as THREE.FileLoader & { __journey?: boolean };
const bytes = new Map<string, { loaded: number; total: number }>();
const publish = () => {
  let loaded = 0;
  let total = 0;
  bytes.forEach((b) => {
    loaded += b.loaded;
    total += b.total;
  });
  journeyLoad.set({ bytes: loaded, bytesTotal: total });
};
if (!fl.__journey) {
  fl.__journey = true;
  const load = fl.load;
  fl.load = function (this: THREE.FileLoader, url, onLoad, onProgress, onError) {
    const key = (this.path ?? "") + url;
    const track = (e: ProgressEvent) => {
      if (e.lengthComputable) {
        bytes.set(key, { loaded: e.loaded, total: e.total });
        publish();
      }
      onProgress?.(e);
    };
    return load.call(this, url, onLoad, track, onError);
  } as Load;
}

/** True while any file is still on its way. */
export const loadsPending = () => pending > 0;
/** Called each time the last outstanding file finishes. */
export const onLoadsIdle = (f: () => void) => {
  idle.add(f);
  return () => void idle.delete(f);
};
