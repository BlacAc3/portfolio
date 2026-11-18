import type Lenis from "lenis";

/**
 * "Teleport" navigation: instead of scrolling through everything in
 * between, a soft blur veil comes up, the page cuts to the target while
 * covered, and the veil clears. Fast (~0.5s) and never shows the travel.
 */

let lenis: Lenis | null = null;
/** Registered by `useLenisSetup` so jumps go through the same scroller. */
export const registerLenis = (instance: Lenis | null) => {
  lenis = instance;
};

let veil: HTMLDivElement | null = null;
let busy = false;

const getVeil = () => {
  if (veil && document.body.contains(veil)) return veil;
  veil = document.createElement("div");
  veil.setAttribute("aria-hidden", "true");
  Object.assign(veil.style, {
    position: "fixed",
    inset: "0",
    zIndex: "200",
    pointerEvents: "none",
    opacity: "0",
    background:
      "radial-gradient(ellipse at 50% 45%, rgba(29,27,26,0.55), rgba(10,10,10,0.82))",
    backdropFilter: "blur(18px) saturate(1.1)",
  } satisfies Partial<CSSStyleDeclaration>);
  veil.style.setProperty("-webkit-backdrop-filter", "blur(18px) saturate(1.1)");
  document.body.appendChild(veil);
  return veil;
};

const nextFrames = (n: number) =>
  new Promise<void>((resolve) => {
    const step = () => (--n <= 0 ? resolve() : requestAnimationFrame(step));
    requestAnimationFrame(step);
  });

const cut = (y: number) => {
  if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
  else window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior });
};

export async function jumpTo(y: number) {
  const target = Math.max(0, Math.round(y));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || Math.abs(window.scrollY - target) < 4) {
    cut(target);
    return;
  }
  if (busy) return;
  busy = true;
  const el = getVeil();
  el.style.pointerEvents = "auto"; // swallow clicks mid-jump
  try {
    await el.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 200,
      easing: "cubic-bezier(0.33, 1, 0.68, 1)",
      fill: "forwards",
    }).finished;
    cut(target);
    // Let the render loops pose the new position before revealing it.
    await nextFrames(3);
    await el.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 360,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      fill: "forwards",
    }).finished;
  } finally {
    el.style.pointerEvents = "none";
    busy = false;
  }
}
