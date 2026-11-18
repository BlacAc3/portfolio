# Scroll-driven 3D bento box: research report

**Target stack:** React 19.1 · Vite 8 · `@react-three/fiber` 9.8 · `@react-three/drei` 10.7 · three 0.186 · GSAP 3.13 · Lenis 1.3 · Tailwind 4.1 · TypeScript 5.7 (pnpm).

**Goal:** a box whose lid opens as the user scrolls, revealing a grid of "bento" sections, without wrecking scroll feel, mobile frame rate, accessibility, or SEO.

**How this was researched.** No general web-search API was available in this environment (search endpoints returned HTTP 402, bot pages, or CAPTCHAs), and Reddit's JSON API returned 403, so there are **no Reddit anecdotes** in this report. Discovery instead came from structured APIs (GitHub Issues, `discourse.threejs.org/search.json`, Stack Exchange API) plus direct reads of primary docs and Codrops engineering write-ups. Every claim below is tied to a numbered source; where a claim is my inference rather than a source's, it is labelled *inference*.

---

## Executive summary

1. **Use one canvas, not one per section.** Two independent sources converge: browsers cap WebGL contexts and multiple canvases "can really kill performance", so the production pattern is a single fixed `<Canvas>` plus drei's `View` scissor regions tracked to DOM elements [3][7][8]. A large studio site rebuilt exactly this way and reported the multi-canvas version as the thing they had to abandon [8].
2. **Prefer `position: sticky` over ScrollTrigger `pin` for the stage.** Pinning is where nearly every reproducible bug in the issue corpus lives — Safari `position:fixed` lag, 1px sticky jumps on iOS, footer flicker, white gaps under pinned 100vh elements, invisible pinned headings [19][20][23][24]. A sticky stage plus a ScrollTrigger that only *reads* progress avoids the pin-spacer entirely.
3. **Wire Lenis through GSAP's ticker, once, with `lagSmoothing(0)`.** The canonical three-line integration is in Lenis's own README [16]; getting it wrong produces the "scroll jumps" and double-speed reports in the Lenis tracker [22].
4. **Model the box procedurally; ship glTF only for hero detail.** Rounded boxes, hinged lids, and panel insets are cheap to build from `RoundedBox`/`ExtrudeGeometry`; every byte you don't ship is a byte the shader compiler doesn't have to wait for. Two Codrops case studies both leaned on Blender only for the assets that actually needed it, exported via `gltfjsx` [8][9][10].
5. **Budget for the first frame.** Shader compilation is the classic jank source; `renderer.compileAsync()` exists specifically to avoid it [30], though one team skipped it on low-end devices because the memory it holds can *cause* a context loss [10].
6. **Tier the device, don't hope.** `PerformanceMonitor` + `AdaptiveDpr` are the maintained drei primitives [5][6], and the strongest write-up used `hardwareConcurrency` / `deviceMemory` / viewport width to pick an asset tier up front [10].
7. **Treat motion as a user setting, not a decoration.** WCAG 2.2.2 (Level A) requires pause/stop for motion that starts on scroll-in and lasts over 5s [33]; 2.3.3 (AAA) explicitly names parallax and scroll-triggered movement as things users must be able to disable [34]. Lenis already defaults to `respectReducedMotion: true` [16], which is only half the job — the 3D side needs its own branch.
8. **Keep the words in the DOM.** A canvas is opaque to assistive tech and to crawlers. Every source that touched this said the same thing; the clearest is a WebGPU portfolio author noting that HTML-inside-canvas "hurts accessibility" [11].

---

## 1. Canvas architecture options

There are four realistic shapes for this feature. They differ mainly in how many WebGL contexts you create and where the text lives.

### 1.1 One fixed canvas + `View` scissor regions (recommended)

drei's `View` renders multiple independent scenes/cameras into one renderer by scissoring the drawing buffer per region, tracking a DOM element's bounding box each frame [3]. You place `<View track={ref}>` wherever the 3D belongs in the document, and a single `<View.Port />` inside the `<Canvas>` does the drawing.

ToyFight, writing up the INK Games site, states the motivation directly: multiple canvases "can really kill performance and some browsers limit how many 3D contexts" you can hold, so they moved to "a single R3F canvas that renders to multiple `View` regions" [8]. A three.js Discourse thread reaches the same conclusion from the vanilla side, recommending one canvas plus scissor views over N canvases [7].

Benefits: one context, one render loop, one place to handle context loss, and text stays real DOM (see §5). Cost: pointer events need `eventSource`/`eventPrefix` on the Canvas, and each `View` is its own scene, so lights/environment must be declared per view (or shared via `scene.environment`) — *inference from the View docs* [3].

### 1.2 One fixed canvas + drei `ScrollControls`

`ScrollControls` builds its own scroll container inside the canvas and exposes `data.range`, `data.curve`, `data.visible` to children [4]. It is the fastest way to prototype a scroll story, but it takes over scrolling (no real DOM scrollbar semantics), and it fights Lenis rather than cooperating with it. It also puts content in the canvas, which is the accessibility problem in §5, and it has a documented interaction bug with drei's `Html` [36] plus a Safari jitter report for lists rendered inside `View`s driven by it [37].

Use it for a one-off demo; not for a site that also has routes, anchors, and footer links.

### 1.3 `r3f-scroll-rig`

14islands' `r3f-scroll-rig` (MIT, ~1k stars) is the mature version of the "DOM drives the canvas" idea: a `GlobalCanvas` plus `useScrollRig` that tracks DOM elements and renders their 3D counterparts in a shared canvas [12]. If you want the `View` pattern with the plumbing already written, this is the library to read before hand-rolling it.

### 1.4 One canvas per section

Maximum isolation, minimum blast radius per section, and the worst context budget. Each canvas is a separate `WebGLRenderer`, separate context, separate draw loop, and separate shader cache. iPadOS texture memory pressure is already a documented cause of context loss on a *single* canvas [14]; multiplying contexts multiplies that exposure. Rejected.

### 1.5 Context loss is not hypothetical

Three concrete failure modes to design around:

- **GPU reset / tab eviction.** The `webglcontextlost` handler must call `event.preventDefault()` and stop the animation loop, or the browser will never attempt a restore [26]. A genuinely lost context only comes back if you call `WEBGL_lose_context.restoreContext()`; `webglcontextrestored` does not fire on its own for a hard loss [27].
- **Unmount leaks.** R3F issue #3093 documents `WebGLRenderer` not being released on unmount, which exhausts contexts across route changes [13].
- **Dev-only StrictMode trap.** In React 19 StrictMode, R3F's deferred 500 ms disposal could tear down the *live* remounted root, calling `forceContextLoss()` permanently and blanking the canvas after ~500 ms [15]. Reported against fiber 9.6.1/9.7.0 and closed as completed on 2026-09-22, so 9.8.x should be clear — but it is the first thing to suspect if a canvas dies only in `pnpm dev` [15].

---

## 2. Lenis + ScrollTrigger: wiring and pin bugs

### 2.1 The only correct wiring

Lenis's README gives the integration verbatim: forward `scroll` to `ScrollTrigger.update`, drive `lenis.raf` from `gsap.ticker`, and disable lag smoothing [16]:

```ts
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((time) => lenis.raf(time * 1000))
gsap.ticker.lagSmoothing(0)
```

Two details that cause most "my scroll is twice as fast" reports: Lenis's default `autoRaf` must be off when you own the loop (*inference; the README shows the manual-raf form* [16]), and the ticker callback receives **seconds** while `raf()` expects **milliseconds**, hence `* 1000` [16]. Stutter and jumping with GSAP's ticker is a recurring Lenis issue [22].

### 2.2 Documented pin failures

| Symptom | Source | Detail |
|---|---|---|
| Jitter on pinned sections, footer flicker, white gap under a pinned 100vh footer | [23] | macOS Safari + iOS; ~9 upvotes, no accepted answer at time of reading |
| `position: fixed` lag under Lenis | [19] | pre-M1 Safari specifically |
| `position: sticky` 1px jump | [20] | Mobile Safari, address-bar resize |
| `normalizeScroll` breaks Lenis | [21] | Firefox; the two smoothing strategies fight |
| Pinned `<h1>` disappears | [24] | root cause: an ancestor `transform`; solved with `pinReparent` |
| Snap points fight smooth scroll | [39] | Lenis snap needs its own tuning |

GSAP's own docs already warn about the adjacent hazards: never animate the pinned element itself (animate its children), nested pinning is unsupported, create triggers in DOM order because refresh order matters (`refreshPriority`), and `pinType` / `pinSpacing` / `anticipatePin` / `invalidateOnRefresh` exist precisely because layout is fragile around a pin [17]. `fastScrollEnd` and `preventOverlaps` handle the "user flicks past a 300vh pin before it can animate" case [17].

### 2.3 The recommendation: sticky stage, ScrollTrigger as a reader

Instead of pinning the stage, give it `position: sticky; top: 0; height: 100vh` inside a tall section, and let ScrollTrigger only compute progress:

```tsx
<section ref={stageRef} className="relative" style={{ height: '350vh' }}>
  <div className="sticky top-0 h-screen overflow-hidden">
    {/* 3D + DOM copy live here */}
  </div>
</section>
```

```tsx
useGSAP(() => {
  ScrollTrigger.create({
    trigger: stageRef.current,
    start: 'top top',
    end: 'bottom bottom',
    invalidateOnRefresh: true,
    onUpdate: (self) => { bento.progress = self.progress }, // mutable store, no re-render
    onToggle: (self) => setStageActive(self.isActive),      // gates the render loop
  })
}, { scope: stageRef })
```

Why this is better here, concretely:

- No pin-spacer is inserted, so `pinSpacing` gaps and the "white gap under the footer" class of bug cannot occur [23][17].
- Sticky is the browser's own scroll-anchored positioning; the 1px iOS jump is a known Lenis/Safari issue [20] but you can mitigate it with `ScrollTrigger.config({ ignoreMobileResize: true })` so the URL-bar resize doesn't trigger a refresh [17].
- Removing the pin removes the transform-within-transform problem that made a pinned heading vanish [24].
- Progress is a plain number, so the 3D side reads it in `useFrame` and never re-renders React on scroll.

If you *do* need a pin (e.g. a horizontal rail), follow the docs strictly: pin a wrapper, animate children, set `anticipatePin: 1`, keep `pinType` at its default for body scroll, and never combine it with `normalizeScroll` while Lenis is active [17][21].

**Double-smoothing warning (*inference*).** Lenis already lerps toward the target scroll. Layering GSAP `scrub: 1` or a `MathUtils.damp` on top produces a mushy, laggy lid. Pick one smoother: either `scrub: true` + direct 3D assignment, or raw progress + one damped `useFrame`. Both Codrops teams that shipped this effectively chose "one smoother": the 80s-tech build reads a per-frame scroll value straight from Lenis and maps it to per-section config with no second easing layer [11].

---

## 3. Procedural vs Blender, materials, and asset compression

### 3.1 What to model in code

For a bento box the geometry is: a shallow open box, a lid, an inset grid, and maybe a rim/chamfer. All of that is cheaper and more controllable as code:

- `RoundedBox` (drei) for the body/lid with a small radius gives the "machined aluminium" read without a normal map.
- Lid hinge = a `<group>` positioned at the *back edge*, with the lid geometry offset forward by half its depth, so `rotation.x` behaves like a real hinge. (A group centred on the lid rotates around its middle — the single most common "my lid swings wrong" mistake. *Inference.*)
- `ExtrudeGeometry` with a bevel for the section panels if they need thickness.

Benefits: no binary asset, no DRACO decoder, no loading state, and the lid's curvature is a prop you can tweak in the responsive branch.

### 3.2 What to model in Blender

Anything with organic or hand-authored detail: a hero object, embossed logo, sculpted interior. Both portfolio write-ups do this and both run the result through `gltfjsx` so the scene graph becomes typed React components [8][9]. The Szmajda build is explicit that the whole corridor is authored in Blender and exported, with chunking done at the React level [10].

### 3.3 Compression: two extensions, one real disagreement

The Khronos specs are unambiguous about what each does:

- **`KHR_draco_mesh_compression`** — compresses geometry; "allows glTF to support streaming compressed geometry data instead of the raw data" [32].
- **`KHR_texture_basisu`** — KTX2 + Basis Universal for textures, for "more efficient asset transmission and reducing GPU memory footprint", transcoded at runtime to a platform block-compressed format [31].

**Where sources disagree — flag this.** Santamaria reports success shipping KTX2/Basis textures and lists it among the optimisations behind 144 FPS on desktop [9]. Szmajda tried KTX2 and **reverted to WebP**, reporting the experiment as a net loss [10]. These are both first-hand production reports on comparable stacks. The honest read: KTX2's win is GPU memory and upload time, its cost is tooling friction and quality at low bitrates; whether it pays off depends on your texture count and your artists' pipeline, not on a general rule. Prototype both on your actual assets — do not take either write-up as the answer. (Neither source published a like-for-like benchmark, so the evidence here is genuinely thin.)

### 3.4 Materials and lighting

- `MeshPhysicalMaterial` with `transmission` or `clearcoat` is the most expensive material in three; on a lid you almost never need it. `meshStandardMaterial` + a good environment map reads as "premium" at a fraction of the cost (*inference, consistent with the perf guidance in* [1][2]).
- drei's `Environment` gives you image-based lighting in one component; use `frames={1}` for a static scene so the env map is rendered once instead of every frame.
- Shadows are the usual hidden tax. Szmajda's biggest single win was **deleting two directional lights plus ambient**, which removed shadow-map cost entirely on flat planes [10]. drei's `contact-shadows` / `accumulative-shadows` are the cheaper primitives when you want contact darkening without a shadow camera.
- `renderer.compileAsync(scene, camera)` uses `KHR_parallel_shader_compile` and resolves when the scene "can be rendered without unnecessary stalling due to shader compilation" [30] — the correct fix for the first-interaction hitch. But see §4: it is not free on constrained devices [10].

---

## 4. Mobile and low-end performance

### 4.1 Measure, then downgrade

drei ships the primitives: `PerformanceMonitor` samples frame time (`ms` default 250, `iterations` 10, `threshold` 0.75) and fires `onIncline` / `onDecline` / `onFallback`, with `flipflops` and `bounds` to stop it oscillating [5]. `AdaptiveDpr` then drops resolution while the user is scrolling and restores it when they stop [6]. Pair them:

```tsx
<PerformanceMonitor onDecline={() => setTier('low')} flipflops={3} onFallback={() => setTier('low')} />
<AdaptiveDpr pixelated />
```

Cap DPR regardless of what the monitor says — `dpr={[1, 1.75]}` on desktop, `[0.75, 1.25]` on coarse pointers. Full-DPR 3× phones are the single most common cause of "it runs at 20fps on my phone" (*inference; supported by the tiering approach in* [10]).

### 4.2 Tier up front, not only reactively

Szmajda's approach is the most concrete published example: read `navigator.hardwareConcurrency`, `navigator.deviceMemory`, and viewport width to pick an asset tier before the first render, then let `PerformanceMonitor` correct downward if the guess was wrong [10]. Results reported: 60 FPS on phones, 144 on desktop, and 15–30 FPS on an €80 ThinkPad — i.e. the low tier is *playable*, not pretty [10].

Practical tiers for this feature:

| Tier | Geometry | Textures | Lights | Extras |
|---|---|---|---|---|
| high | full | 2K KTX2/WebP | env + 1 key light | shadows, `compileAsync` |
| mid | merged | 1K | env only | no shadows, DPR ≤1.5 |
| low | simplified, no bevels | 512 | env only | no shadows, DPR ≤1, `frameloop` gated hard |

### 4.3 Stop rendering when nothing is visible

Two independent confirmations:

- Check `getBoundingClientRect()` in `useFrame` (or an `IntersectionObserver`) and skip all work when the canvas is offscreen [28].
- Toggle the canvas `frameloop` from a ScrollTrigger `onToggle` so the renderer idles between sections — exactly what ToyFight did [8].

Also: never drive WebGL from a scroll or rAF handler you wrote yourself. Older Macs and Safari degrade badly with per-scroll rAF work; the recommendation is `useFrame` (`ScrollControls` if you must) [29].

### 4.4 Mobile scroll specifics

Lenis's own README is candid about limits: no CSS scroll-snap without `lenis/snap`, smoothing capped at 60 fps in Safari and 30 fps in low-power mode, no smoothing over iframes, and `syncTouch` unstable on iOS < 16 [16]. For a portfolio, the safe configuration is **native touch scrolling** (`syncTouch: false`, the default) and Lenis only on wheel/pointer devices. That also keeps iOS inertial scroll, which users expect, and sidesteps the mobile-Safari sticky jump as much as possible [20].

Texture memory is the other mobile cliff: iPadOS 17.5.1 was reported to lose the WebGL context under texture pressure [14]. That is an argument for the low texture tier, and for not holding a full 2K KTX2 set plus env map in memory on a tablet.

---

## 5. Accessibility and SEO

### 5.1 The normative requirements

- **WCAG 2.2.2 Pause, Stop, Hide (Level A).** Any moving/scrolling content that (1) starts automatically, (2) lasts more than five seconds, and (3) sits alongside other content needs a mechanism to pause, stop, or hide it, unless the motion is essential [33]. Critically, the Understanding doc says content counts as "starting automatically" when it starts from an **indirect interaction such as scrolling an element into view** [33]. A lid that opens because you scrolled to it is in scope. A "pause 3D" control is not a nice-to-have.
- **WCAG 2.3.3 Animation from Interactions (Level AAA).** Motion triggered by interaction can be disabled unless essential; the doc names **parallax scrolling** and scroll-triggered element movement as the canonical examples, notes vestibular reactions include nausea and migraine, and lists `prefers-reduced-motion` as a sufficient technique (C39/SCR40) [34]. It also carves out the essential part: "moving new content into the viewport is essential for scrolling" — so plain scrolling is fine; the *extra* lid choreography is what needs the off switch [34].
- **`prefers-reduced-motion`** is baseline "widely available"; `reduce` means "minimize the amount of non-essential motion", and the MDN page notes that scaling or panning large objects are vestibular triggers [35].

### 5.2 What that means in practice

Lenis already honours the preference: `respectReducedMotion: true` is the default and forces `lerp: 1` with instant programmatic scroll — importantly, it **still runs**, so WebGL stays in sync rather than freezing mid-animation [16]. But that only fixes scrolling. The lid needs its own branch:

```tsx
const reduced = useReducedMotion()
// no scroll-linked lid rotation; render the box open (or static) instead
const lidAngle = reduced ? OPEN_ANGLE : OPEN_ANGLE * progress
```

Provide a visible control too, not just the media query — 2.3.3's "Gx: Allowing users to set a preference" is an explicit sufficient technique, and users on shared machines cannot change OS settings [34]. A small "Reduce motion" toggle that (a) kills Lenis, (b) snaps the box open, and (c) disables `scrub` is a few lines and covers both criteria.

### 5.3 Text must not live in the canvas

A WebGL canvas exposes nothing to screen readers and nothing to crawlers. The Shader.se build notes HTML rendered inside the canvas "hurts accessibility" and structured the site so copy stays in the DOM [11]. drei's `Html` is a partial workaround but has known interaction problems inside `ScrollControls` [36].

The pattern that satisfies both: `<View track={ref}>` for the 3D, sibling DOM for every heading, paragraph, and link, with the canvas marked decorative:

```tsx
<canvas aria-hidden="true" />          {/* or on the Canvas wrapper */}
<h2>Selected work</h2>                  {/* real, focusable, crawlable */}
```

Then verify the boring things: the page is fully readable with JS disabled (prerender the route), tab order follows visual order, no focus trap, a skip link to the bento content, and `scroll-behavior: auto` when the reduce toggle is on.

### 5.4 SEO

For a Vite SPA this is a build concern, not a canvas concern: if the copy is in React and the crawler doesn't execute, there is nothing to index. Whatever you do about rendering (prerender, SSG, or a static fallback route), the rule from §5.3 applies — the words must exist as HTML. Three.js adds nothing to crawlable content, so a canvas-only hero is an indexing hole (*inference, consistent with* [11]).

---

## 6. Failure modes checklist

| # | Symptom | Likely cause | Fix | Source |
|---|---|---|---|---|
| 1 | Canvas blank ~500 ms after load, **dev only** | StrictMode double-mount deferred `forceContextLoss()` | Update fiber; suspect this before anything else | [15] |
| 2 | Canvas stays black after GPU reset / tab eviction | `webglcontextlost` not prevented, no restore call | `preventDefault()` + stop loop; `restoreContext()` | [26][27] |
| 3 | Context exhausted after navigating routes | Renderer not disposed on unmount | Explicit dispose / single persistent canvas | [13] |
| 4 | Pinned section jitters, footer flickers | Lenis + pin + Safari `position:fixed` | Sticky stage instead of pin | [23][19] |
| 5 | 1px jump on iOS | `position: sticky` + URL-bar resize refresh | `ignoreMobileResize`, avoid resize-driven refresh | [20][17] |
| 6 | White gap under pinned 100vh block | Pin-spacer / `pinSpacing` | Sticky, or `pinSpacing: false` + manual padding | [23][17] |
| 7 | Pinned heading invisible | Ancestor `transform` creates a containing block | `pinReparent: true` | [24] |
| 8 | Scrolling feels doubled / jumpy | `autoRaf` on *and* ticker-driven `raf`, or ms/s mix-up | One loop only; `time * 1000`; `lagSmoothing(0)` | [16][22] |
| 9 | Lenis breaks on Firefox after adding `normalizeScroll` | Two smoothing strategies | Remove `normalizeScroll` | [21] |
| 10 | Frame rate collapses when more sections mount | Multiple canvases / contexts | Single canvas + `View` | [8][7] |
| 11 | First interaction hitches | Shader compile stall | `compileAsync()` before reveal | [30] |
| 12 | Low-end phones die on load | `compileAsync` + full texture set memory pressure | Skip precompile on low tier, lower texture budget | [10][14] |
| 13 | `Html` content drifts inside `ScrollControls` | Known integration bug | Don't nest `Html` in `ScrollControls` | [36] |
| 14 | Safari list jitter inside `View` | Reported with `ScrollControls`-driven lists | Use `View` + sticky, not `ScrollControls` | [37] |
| 15 | Animation replays after HMR / remount | Root re-created on repeat mount | Fresh `gsap.context` / `useGSAP` per mount | [38][18] |
| 16 | Snap points fight Lenis | CSS `scroll-snap` used directly | `lenis/snap` or tuned GSAP snap | [16][39] |
| 17 | Text soft in sticky sections | Subpixel rounding on transformed layer | Avoid `will-change` on text; keep text out of the 3D layer (*inference*) | — |

---

## 7. Recommended setup

Everything below assumes the existing stack; no new dependencies.

### 7.1 Smooth scroll (Lenis + GSAP), with a reduced-motion bail-out

```tsx
// src/lib/smooth-scroll.ts
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function createSmoothScroll({ reduced }: { reduced: boolean }) {
  if (reduced) {
    document.documentElement.style.scrollBehavior = 'auto'
    return () => {}
  }

  const lenis = new Lenis({
    autoRaf: false,        // we own the loop via gsap.ticker
    lerp: 0.1,             // README default
    smoothWheel: true,
    syncTouch: false,      // native iOS inertia; syncTouch unstable < iOS 16
  })

  lenis.on('scroll', ScrollTrigger.update)

  const tick = (time: number) => lenis.raf(time * 1000) // ticker: seconds → raf: ms
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)

  // Sticky sections need one refresh after fonts/layout settle.
  ScrollTrigger.refresh()

  return () => {
    gsap.ticker.remove(tick)
    lenis.destroy()
  }
}
```

Defaults cited from the Lenis README: `lerp: 0.1`, `duration: 1.2`, `autoResize: true`, `respectReducedMotion: true`, plus the 60/30 fps Safari caps and the `syncTouch` caveat [16].

### 7.2 The stage: sticky, measured, and cheap

```tsx
// src/features/bento/BentoStage.tsx
export function BentoStage() {
  const sectionRef = useRef<HTMLElement>(null!)
  const trackRef = useRef<HTMLDivElement>(null!)
  const [active, setActive] = useState(false)
  const [frameloop, setFrameloop] = useState<'always' | 'demand'>('demand')

  useGSAP(() => {
    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: 'bottom bottom',
      invalidateOnRefresh: true,
      onUpdate: (self) => { bento.progress = self.progress },
      onToggle: (self) => {
        setActive(self.isActive)
        setFrameloop(self.isActive ? 'always' : 'demand')
      },
    })
  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} className="relative" style={{ height: '350vh' }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        <View track={trackRef} className="absolute inset-0">
          <BentoBox />
        </View>
        <div ref={trackRef} className="relative z-10 h-full p-8">…DOM copy…</div>
      </div>
    </section>
  )
}
```

`frameloop` is toggled from `onToggle`, the same idle-between-sections trick the ToyFight build uses [8], and the offscreen skip is redundant safety [28].

### 7.3 One canvas for the whole app

```tsx
// src/three/SceneCanvas.tsx
export function SceneCanvas({ rootRef }: { rootRef: React.RefObject<HTMLElement> }) {
  const [dpr, setDpr] = useState(1.5)

  return (
    <Canvas
      frameloop={frameloop}                 // lifted from the stage
      dpr={dpr}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      eventSource={rootRef}                  // View regions need DOM-sourced pointers
      eventPrefix="client"
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', (e) => e.preventDefault())
      }}
    >
      <PerformanceMonitor
        flipflops={3}
        onDecline={() => setDpr(1)}
        onFallback={() => setDpr(0.75)}
      />
      <AdaptiveDpr pixelated />
      <View.Port />
      <Preload all />
    </Canvas>
  )
}
```

`PerformanceMonitor` props (`ms` 250, `iterations` 10, `threshold` 0.75, `flipflops`, `bounds`) and `AdaptiveDpr`'s behaviour are from the drei docs [5][6]. `eventSource`/`eventPrefix` are required because the canvas no longer owns the pointer targets — the DOM regions do [3].

### 7.4 The lid, procedural and hinge-correct

```tsx
// src/features/bento/BentoBox.tsx
const OPEN = THREE.MathUtils.degToRad(-112)
const bento = { progress: 0 }   // module-level mutable store: no React re-render per scroll px

function Lid() {
  const hinge = useRef<THREE.Group>(null!)

  useFrame((_, delta) => {
    // Lenis already smooths; one damp here is the only extra easing.
    hinge.current.rotation.x = THREE.MathUtils.damp(
      hinge.current.rotation.x,
      OPEN * bento.progress,
      8,
      delta,
    )
  })

  return (
    // pivot at the BACK edge; geometry pushed forward by half its depth
    <group ref={hinge} position={[0, 0.1, -1]}>
      <RoundedBox args={[3, 0.12, 2]} radius={0.03} smoothness={4} position={[0, 0, 1]}>
        <meshStandardMaterial color="#e8e6e1" roughness={0.35} metalness={0.1} />
      </RoundedBox>
    </group>
  )
}
```

`RoundedBox` is a drei primitive; the hinge offset is the part that is easy to get wrong (*inference, not from a source*). Keep progress in a module-level object or a `useRef` — pushing it through React state re-renders the tree on every scroll pixel and is the classic way to destroy frame rate (*inference; the "measure with `useFrame`, don't prop-drill per frame" guidance in* [1] is the same principle).

### 7.5 Reduced motion, as a product feature

```tsx
// src/lib/use-reduced-motion.ts
export function useReducedMotion() {
  const query = '(prefers-reduced-motion: reduce)'
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  )
  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}
```

Then: `const motionOff = reduced || userToggledOff`, pass it to `createSmoothScroll`, and in the 3D branch set `bento.progress` to `1` (box fully open) instead of reading scroll. This satisfies 2.2.2's pause requirement functionally and 2.3.3's preference requirement literally [33][34][35].

### 7.6 Cleanup discipline

`useGSAP()` reverts everything created inside its callback via `gsap.context()` [18]. Anything created *later* — in a click handler, a `setTimeout`, a `lenis.on` callback — is not covered and needs `contextSafe()` [18]:

```tsx
const { contextSafe } = useGSAP({ scope: ref })

const onOpenAll = contextSafe(() => {
  gsap.to('.panel', { y: 0, stagger: 0.05 })
})
```

Without this, HMR and route changes leave orphaned triggers that fire on the new page — the React-specific failure the GSAP guide exists to prevent [18][38].

---

## Evidence notes and gaps

- **Strongest cross-source consensus:** single canvas + `View` [7][8][3], and "sticky over pin" as a bug-avoidance strategy [23][19][20][24][17]. The latter is a convergent inference from five independent bug reports rather than a single source's recommendation — no source says "always use sticky".
- **Genuine disagreement:** KTX2/Basis textures. Santamaria ships them successfully [9]; Szmajda tried and reverted to WebP [10]. Neither published a benchmark. Treat as unresolved; test on your own assets.
- **Thin evidence:** the exact fps cost of `MeshPhysicalMaterial` vs `meshStandardMaterial` for this geometry, and the "DPR cap" numbers in §4.1, are engineering judgement, not sourced measurements.
- **Missing by constraint:** Reddit (r/threejs, r/webdev) returned 403, and no general web search was available, so community sentiment is under-represented. Hacker News Algolia returned no on-topic hits for three.js scroll-performance queries. If you want a second opinion on the sticky-vs-pin call, the r/threejs and `discourse.threejs.org` threads are the places to look next.
- **Not verified:** Blender's glTF exporter documentation — the manual URLs I tried returned 404 after Blender's docs reorganisation, so the Blender side is cited only through the two Codrops write-ups that used it [9][10].

---

## Sources

1. React Three Fiber — *Scaling performance* — https://r3f.docs.pmnd.rs/advanced/scaling-performance
2. React Three Fiber — *Performance pitfalls* — https://r3f.docs.pmnd.rs/advanced/pitfalls
3. drei — *View* — https://drei.docs.pmnd.rs/portals/view
4. drei — *ScrollControls* — https://drei.docs.pmnd.rs/controls/scroll-controls
5. drei — *PerformanceMonitor* — https://drei.docs.pmnd.rs/performances/performance-monitor
6. drei — *AdaptiveDpr* — https://drei.docs.pmnd.rs/performances/adaptive-dpr
7. three.js Discourse — one canvas with scissor views vs. many canvases — https://discourse.threejs.org/t/37901
8. Codrops — ToyFight, *One canvas to rule them all* (INK Games) — https://tympanus.net/codrops/2025/11/21/one-canvas-to-rule-them-all-building-a-webgl-site-with-a-single-canvas/
9. Codrops — Joseph Santamaria, *More than a portfolio* — https://tympanus.net/codrops/2026/04/28/more-than-a-portfolio/
10. Codrops — Tomasz Szmajda, *Sketching the impossible* — https://tympanus.net/codrops/2026/06/11/sketching-the-impossible/
11. Codrops — Shader.se / Filip Kantedal, *80s business tech* — https://tympanus.net/codrops/2026/05/19/80s-business-tech/
12. 14islands — `r3f-scroll-rig` (MIT) — https://github.com/14islands/r3f-scroll-rig
13. GitHub — `pmndrs/react-three-fiber` #3093, WebGLRenderer not disposed on unmount — https://github.com/pmndrs/react-three-fiber/issues/3093
14. GitHub — `pmndrs/react-three-fiber` #3309, iPadOS 17.5.1 texture context loss — https://github.com/pmndrs/react-three-fiber/issues/3309
15. GitHub — `pmndrs/react-three-fiber` #3863, StrictMode deferred dispose force-loses context — https://github.com/pmndrs/react-three-fiber/issues/3863
16. Lenis — README (defaults, GSAP wiring, limits) — https://github.com/darkroomengineering/lenis/blob/main/README.md
17. GSAP — *ScrollTrigger* documentation — https://gsap.com/docs/v3/Plugins/ScrollTrigger/
18. GSAP — *React & GSAP (`useGSAP`, `contextSafe`)* — https://gsap.com/resources/React
19. GitHub — `darkroomengineering/lenis` #103, macOS Safari `position: fixed` jitter — https://github.com/darkroomengineering/lenis/issues/103
20. GitHub — `darkroomengineering/lenis` #499, Mobile Safari `position: sticky` 1px jump — https://github.com/darkroomengineering/lenis/issues/499
21. GitHub — `darkroomengineering/lenis` #274, `normalizeScroll` breaks Lenis on Firefox — https://github.com/darkroomengineering/lenis/issues/274
22. GitHub — `darkroomengineering/lenis` #136, GSAP ticker scroll jumping — https://github.com/darkroomengineering/lenis/issues/136
23. Stack Overflow — #79315339, pinned section jitter + footer flicker + white gap (Safari) — https://stackoverflow.com/questions/79315339
24. Stack Overflow — #74331773, pinned heading disappears (ancestor transform → `pinReparent`) — https://stackoverflow.com/questions/74331773
25. Stack Overflow — #78689319, `@studio-freight/react-lenis` provider pattern — https://stackoverflow.com/questions/78689319
26. Stack Overflow — #14350350, `webglcontextlost` needs `preventDefault()` + `cancelAnimationFrame` — https://stackoverflow.com/q/14350350
27. Stack Overflow — #35136616, context restore requires `WEBGL_lose_context.restoreContext()` — https://stackoverflow.com/q/35136616
28. three.js Discourse — skip `useFrame` work when the canvas is offscreen — https://discourse.threejs.org/t/78051
29. three.js Discourse — poor R3F/drei performance on older Macs and Safari — https://discourse.threejs.org/t/84788
30. three.js source — `WebGLRenderer.compileAsync()` (`KHR_parallel_shader_compile`) — https://github.com/mrdoob/three.js/blob/dev/src/renderers/WebGLRenderer.js
31. Khronos — `KHR_texture_basisu` specification — https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR_texture_basisu/README.md
32. Khronos — `KHR_draco_mesh_compression` specification — https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR_draco_mesh_compression/README.md
33. W3C WAI — *Understanding SC 2.2.2: Pause, Stop, Hide* (Level A) — https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html
34. W3C WAI — *Understanding SC 2.3.3: Animation from Interactions* (Level AAA) — https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html
35. MDN — *`prefers-reduced-motion`* — https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
36. GitHub — `pmndrs/drei` #1048, `Html` inside `ScrollControls` — https://github.com/pmndrs/drei/issues/1048
37. GitHub — `pmndrs/drei` #1890, Safari jitter in `View` lists — https://github.com/pmndrs/drei/issues/1890
38. GitHub — `pmndrs/drei` #2431, `createRoot()` on repeat mount — https://github.com/pmndrs/drei/issues/2431
39. GitHub — `darkroomengineering/lenis` #389, snap interaction — https://github.com/darkroomengineering/lenis/issues/389
