# Colour, theming & page models — research notes

## Findings that shaped the palette
- **Avoid pure black.** `#000`/`#0a0a0a` makes high-contrast text "vibrate" and hides elevation. Base the dark theme on a warm charcoal (`#1a1612`) and show depth with *lighter* surfaces (`#241e19` → `#2f2822`), not with shadows.
- **Off-white text.** Use `#f4ede3` instead of `#fff`: 15.8:1 on the canvas, and less glare.
- **Desaturate the accent in dark mode.** Gold `#dcb077` reaches 9.3:1 on the canvas.
- **Light mode is warm cream, not white.** Canvas is `#f5efe6` and cards are `#fffbf5`. Bright gold fails as text on cream, so the light accent darkens to `#8a5a1c` (5.2:1, AA), and bright gold is kept for fills and 3D.
- **Semantic tokens, not colour names.** Components use `canvas / surface / raised / ink / accent`, and each theme only redefines the variables.

## Theme mechanics
- `[data-theme]` sits on `<html>`, with Tailwind v4 `@custom-variant dark/light`.
- An inline `<head>` script applies the stored choice or the OS preference before first paint, so the wrong theme never flashes.
- The choice persists in `localStorage`. Until the visitor picks, the site follows the OS.
- The toggle uses a View Transitions circular reveal; with reduced motion it switches instantly.

## 3D models (About / Contact / Work)
- All three are procedural geometry, so no model or HDR downloads; lighting comes from `Lightformer`s.
- Each model is lazy-loaded with `React.lazy` and mounted only near the viewport. It uses `frameloop="never"` off screen and `"demand"` under reduced motion.
- Each model is a `role="img"` with a text description. Information shown in the model (stack layers, skills) is also present as real DOM text.

## Sources
- https://atmos.style/blog/dark-mode-ui-best-practices
- https://blog.logrocket.com/ux-design/dark-mode-ui-design-best-practices-and-examples/
- https://uxcel.com/blog/12-principles-of-dark-mode-design-627
- https://www.accessibilitychecker.org/blog/dark-mode-accessibility/
- https://ihatecolors.pages.dev/palette/boulangerie
- https://www.washington.edu/docs/best-practices/uw-specific/uw-colors-contrast-table/
- https://developer.chrome.com/docs/modern-web-guidance/guides/ui-components/dark-mode-toggle
- https://dev.to/izznatsir/flicker-free-dark-mode-in-vite-spa-180o
- https://r3f.docs.pmnd.rs/advanced/scaling-performance
- https://schoen-world.vercel.app/n/tailwind-dark-mode-custom-variant
- https://dev.to/vrauuss_softwares/-create-custom-themes-in-tailwind-css-v4-custom-variant-12-2nf0
