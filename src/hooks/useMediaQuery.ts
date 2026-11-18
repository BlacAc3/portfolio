import { useSyncExternalStore } from "react";

/** SSR-safe, tear-free media query subscription. */
export const useMediaQuery = (query: string, serverFallback = false) =>
  useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => serverFallback,
  );

export const usePrefersReducedMotion = () =>
  useMediaQuery("(prefers-reduced-motion: reduce)");

let webglCache: boolean | null = null;

/** True when the browser can create a WebGL context (cached after first probe). */
export const hasWebGL = () => {
  if (webglCache !== null) return webglCache;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    webglCache = !!gl;
    (gl as WebGLRenderingContext | null)
      ?.getExtension("WEBGL_lose_context")
      ?.loseContext();
  } catch {
    webglCache = false;
  }
  return webglCache;
};
