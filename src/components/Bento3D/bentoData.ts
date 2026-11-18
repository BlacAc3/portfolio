/**
 * Single source of truth for the bento showcase.
 *
 * The showcase is one long scroll track: a short intro where the box opens,
 * then one full-screen "page" per compartment, then an outro. The same
 * constants drive the DOM timeline (BentoShowcase) and the 3D camera
 * (BentoBoxScene), so the two never drift apart.
 */

export type BentoTheme = "glass" | "photo" | "accent" | "dark";

export interface BentoPoint {
  title: string;
  body: string;
}

export interface BentoStat {
  value: string;
  label: string;
}

export interface BentoPage {
  /** Opening paragraph, set large. */
  lead: string;
  points: BentoPoint[];
  stats?: BentoStat[];
  quote?: string;
  toolkit?: string[];
  cta?: { label: string; to: string };
}

export interface BentoCell {
  id: string;
  col: number;
  row: number;
  colSpan: number;
  rowSpan: number;
  theme: BentoTheme;
  /** The cover is the page headline, which flies to its place on open. */
  coverTitle?: boolean;
  eyebrow: string;
  title: string;
  body: string;
  page: BentoPage;
}

export const GRID_COLS = 4;
export const GRID_ROWS = 3;

/** Order matters: it is both the box reveal order and the page order. */
export const bentoCells: BentoCell[] = [
  {
    id: "synergy",
    col: 0,
    row: 0,
    colSpan: 2,
    rowSpan: 2,
    theme: "glass",
    coverTitle: true,
    eyebrow: "Philosophy",
    title: "Like rice and stew — inseparable by nature.",
    body: "Design and engineering aren't different phases; they are the same soul in different forms.",
    page: {
      lead: "Design and engineering aren't different phases. They are the same soul in different forms — drawn and built in the same pass, so nothing is lost in translation.",
      points: [
        {
          title: "One vocabulary",
          body: "Type scale, colour and motion rules are written once, then consumed by both the canvas and the code.",
        },
        {
          title: "Built in the same breath",
          body: "Layout, state and motion are decided together — not handed off in a file and re-interpreted later.",
        },
        {
          title: "Taste over trend",
          body: "Fewer effects, better chosen. The restraint is the design; everything else is decoration.",
        },
      ],
      quote: "If you can feel the seam between the design and the build, neither one is finished.",
    },
  },
  {
    id: "aaron",
    col: 2,
    row: 0,
    colSpan: 1,
    rowSpan: 2,
    theme: "photo",
    coverTitle: true,
    eyebrow: "The Architect",
    title: "Aaron Ezeala.",
    body: "Building high-fidelity interfaces and the robust systems underneath them.",
    page: {
      lead: "Full-stack engineer working where interface fidelity meets system durability. I build the product surface and the machinery that keeps it honest.",
      points: [
        {
          title: "Interfaces",
          body: "React and TypeScript, with motion and accessibility treated as requirements rather than polish.",
        },
        {
          title: "Systems",
          body: "Django and Go services modelled around the domain, not around the framework's convenience.",
        },
        {
          title: "Delivery",
          body: "From schema to shipped screen — one owner, one thread of intent, no hand-off gaps.",
        },
      ],
      stats: [
        { value: "End-to-end", label: "Product ownership" },
        { value: "Full-stack", label: "Depth of scope" },
      ],
      cta: { label: "Read the full story", to: "/about" },
    },
  },
  {
    id: "experience",
    col: 3,
    row: 0,
    colSpan: 1,
    rowSpan: 1,
    theme: "glass",
    coverTitle: true,
    eyebrow: "Experience",
    title: "Years in the craft.",
    body: "Shipping production software across product teams and studios.",
    page: {
      lead: "Shipping production software across product teams and studios — the kind of work where the deadline is real and the users are not hypothetical.",
      points: [
        {
          title: "Product teams",
          body: "Embedded with designers and product managers, owning the front end and its contract with the API.",
        },
        {
          title: "Studios",
          body: "Short, intense builds where the whole stack is on the table from day one and nothing is decorative.",
        },
        {
          title: "Production",
          body: "Instrumentation, migrations and the unglamorous maintenance that keeps software alive past launch week.",
        },
      ],
      stats: [
        { value: "Years", label: "In the craft" },
        { value: "2", label: "Sides of the stack" },
      ],
    },
  },
  {
    id: "technology",
    col: 3,
    row: 1,
    colSpan: 1,
    rowSpan: 1,
    theme: "accent",
    coverTitle: true,
    eyebrow: "Tech",
    title: "Bleeding edge.",
    body: "Modern stacks, chosen deliberately — never for novelty alone.",
    page: {
      lead: "Modern stacks, chosen deliberately — never for novelty alone. The right tool is the one that still makes sense in the second year.",
      points: [
        {
          title: "Django",
          body: "Batteries included: auth, admin and a data model that holds its shape under real usage.",
        },
        {
          title: "React + TypeScript",
          body: "Typed component systems, with motion that degrades gracefully and semantics that survive it.",
        },
        {
          title: "Go",
          body: "Small, fast services where concurrency is the point and the binary is the deployment.",
        },
      ],
      toolkit: ["Django", "React", "TypeScript", "Go", "PostgreSQL"],
    },
  },
  {
    id: "speed",
    col: 0,
    row: 2,
    colSpan: 2,
    rowSpan: 1,
    theme: "dark",
    coverTitle: true,
    eyebrow: "Speed",
    title: "Precision enthusiast.",
    body: "Performance is a feature. Every millisecond is accounted for.",
    page: {
      quote: "Speed isn't just a metric; it's a discipline.",
      lead: "Performance is a feature. Every millisecond is accounted for — in the bundle, in the query, and in the frame.",
      points: [
        {
          title: "Budgeted",
          body: "Interaction under 100 ms, motion at 60 fps, and a bundle that earns every kilobyte it asks for.",
        },
        {
          title: "Measured",
          body: "Profiling before opinion. The flame graph settles arguments faster than taste ever will.",
        },
        {
          title: "Engineered",
          body: "Precision isn't polish applied at the end; it's a constraint held from the first commit.",
        },
      ],
      stats: [
        { value: "<100ms", label: "Interaction" },
        { value: "60fps", label: "Motion" },
      ],
    },
  },
  {
    id: "curated",
    col: 2,
    row: 2,
    colSpan: 2,
    rowSpan: 1,
    theme: "glass",
    coverTitle: true,
    eyebrow: "Work",
    title: "Curated Engineering.",
    body: "Case studies from platforms built end to end.",
    page: {
      lead: "Case studies from platforms built end to end — the brief, the constraints, and the decisions that survived contact with production.",
      points: [
        {
          title: "Problem first",
          body: "Every case starts with the constraint, not the screenshot. What was actually hard here?",
        },
        {
          title: "End to end",
          body: "Data model, API, interface and the deploy that carries it — one continuous surface.",
        },
        {
          title: "Outcomes",
          body: "What changed, what it cost, and what I would do differently with the next build.",
        },
      ],
      cta: { label: "View case studies", to: "/work" },
    },
  },
];

/* ------------------------------------------------------------------ */
/* Scroll choreography                                                 */
/* ------------------------------------------------------------------ */

/* Scroll choreography lives in ./choreography.ts (pixel-based track). */

/** Intro beats, normalised to the intro segment. */
export const INTRO = {
  bandOff: [0.04, 0.2],
  lidOpen: [0.16, 0.5],
  revealStart: 0.52,
  revealStep: 0.072,
  lift: [0.68, 0.96],
} as const;

/** Rise window for compartment `index` during the intro. */
export function revealWindow(index: number): [number, number] {
  const start = INTRO.revealStart + index * INTRO.revealStep;
  return [start, start + 0.08];
}
