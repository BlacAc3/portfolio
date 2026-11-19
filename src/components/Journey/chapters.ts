/**
 * The about-page drive: one chapter per stop. Copy lives here so the
 * 3D journey, the static fallback and "The short version" never drift apart.
 */
export interface Chapter {
  id: string;
  /** Route-map label. */
  stop: string;
  title: string;
  body: string;
  /** One line for "The short version". */
  short: string;
  facts: string[];
  /** Small print under the panel. */
  note?: string;
  /** How many units of the scene timeline this chapter covers (default 1). */
  span?: number;
}

export const CHAPTERS: Chapter[] = [
  {
    id: "fast",
    stop: "Fast things",
    title: "I'm a petrolhead.",
    body: "I love engines. Fast cars, beautiful cars, cool bikes: if it has an engine, it has my attention. And nothing beats a good exhaust note. A V12 winding up to the redline is my favourite sound in the world.",
    short: "Engines, fast cars, cool bikes and a good exhaust note.",
    facts: ["Fast cars", "Superbikes", "Exhaust notes"],
    // The opening drive and the car meet play under this one chapter.
    span: 2,
  },
  {
    id: "workshop",
    stop: "Workshop",
    title: "I want to know how it works.",
    body: "Looking at a car is only half of it. I want to see inside: how the engine makes its power, how that power reaches the wheels, why every part sits where it does. Taking things apart to understand them is how I learn anything, and the inner workings are where it gets interesting.",
    short: "Taking things apart to understand how they work.",
    facts: ["Engines", "Drivetrains", "How things work"],
  },
  {
    id: "design",
    stop: "Design",
    title: "Where art meets engineering.",
    body: "Art has a real place in science and engineering. Good design gives a thing visual meaning, but it's never just decoration: every line is intentional and every surface has a job. When form and function agree, you get work that's beautiful because it works.",
    short: "Art with intent: design that's beautiful and functional.",
    facts: ["Intentional design", "Form and function", "Industrial design"],
    note: "The stripes are a zebra analysis. Car designers use it to check that a surface flows without kinks.",
  },
  {
    id: "tech",
    stop: "Tech",
    title: "Tech pulls me in the same way.",
    body: "Computers, operating systems, software: I want to know how they work inside, not just how to use them. New tech fascinates me. I'm a Linux user through and through, and I daily drive Omarchy, the opinionated Arch Linux setup by DHH. I love the open-source world, where you can read the code behind everything you run.",
    short: "Computers, Linux, open source and new tech.",
    facts: ["Linux", "Omarchy", "Open source"],
  },
  {
    id: "computers",
    stop: "Computers",
    title: "I use Arch, btw.",
    body: "My setup is keyboard-driven, with Hyprland tiling every window into place and everything tuned by hand. It's fast, and I understand every part of it. It's what I love about cars, applied to a computer.",
    short: "Arch Linux, tiled with Hyprland, tuned by hand.",
    facts: ["Arch Linux", "Hyprland", "zsh"],
  },
  {
    id: "learning",
    stop: "Learning",
    title: "I'm always learning something new.",
    body: "I collect skills the way some people collect parts: languages, protocols, tools. Lately it's peer-to-peer networking with libp2p. Each new thing links up with something I already know, and the map keeps growing.",
    short: "New languages, protocols and tools, all the time.",
    facts: ["libp2p", "Distributed systems", "Whatever's next"],
  },
  {
    id: "languages",
    stop: "Languages",
    title: "Hello. Bonjour.",
    body: "I speak French as well as English. Learning a spoken language changes how you think in the same way learning a new programming language does.",
    short: "English and French.",
    facts: ["English", "Français"],
  },
  {
    id: "boxing",
    stop: "Boxing",
    title: "Hands up.",
    body: "Away from the screen, I box. It's the most honest sport I know: footwork, timing and discipline, with nowhere to hide if you skip the basics. That's how I try to write software too.",
    short: "Boxing: footwork, timing, discipline.",
    facts: ["Boxing", "Jab, cross, hook", "Roadwork"],
  },
];

const M = `${import.meta.env.BASE_URL}models/`;

/**
 * Real models (optimised by `pnpm models`, credits in public/models/CREDITS.md).
 * The procedural car and bike stand in while these load. `yaw` turns the
 * 812's nose (+z in the file) toward +x.
 */
export const CAR_MODEL = {
  url: `${M}ferrari-812.glb` as string | null,
  brake: `${M}brake.glb`,
  yaw: Math.PI / 2,
};
export const BIKE_MODEL = `${M}ducati-panigale.glb`;
export const F12_MODEL = `${M}ferrari-f12.glb`;
export const GLOVE_MODEL = `${M}boxing-glove.glb`;

/** CC BY 4.0 attribution for the models above. Keep in step with public/models/CREDITS.md. */
export const MODEL_CREDITS = [
  {
    title: "Ferrari 812 SuperFast 2017-2024",
    url: "https://sketchfab.com/3d-models/ferrari-812-superfast-2017-2024-cd7dfc79a98244ca81d86d82ce2b49a7",
    author: "szymonpasterczyk734",
    authorUrl: "https://sketchfab.com/szymonpasterczyk734",
  },
  {
    title: "DDE | Twin Turbo Ferrari F12 Berlinetta",
    url: "https://sketchfab.com/3d-models/dde-twin-turbo-ferrari-f12-berlinetta-f400aff0f46247bea0d7dbb3d7c47487",
    author: "kevin (ケビン)",
    authorUrl: "https://sketchfab.com/sohyalebret",
  },
  {
    title: "2021 Ducati Panigale V4 SP",
    url: "https://sketchfab.com/3d-models/2021-ducati-panigale-v4-sp-8c0632e4c54249758114490390f0b73f",
    author: "Gratisphile",
    authorUrl: "https://sketchfab.com/brainlesszombie5",
  },
  {
    title: "Brake Disk and Caliper",
    url: "https://sketchfab.com/3d-models/brake-disk-and-caliper-5feda9dbf20a49cf9fd29d550e55e4b9",
    author: "Vladi",
    authorUrl: "https://sketchfab.com/vladivpg",
  },
  {
    title: "boxing gloves",
    url: "https://sketchfab.com/3d-models/boxing-gloves-9d244a5bfaf84ea398cff99154e99eab",
    author: "ayumi ikeda",
    authorUrl: "https://sketchfab.com/rxf10240",
  },
];

/** Where each set stands along the road (x, metres). */
export const WORLD = {
  meet: 200,
  workshop: 320,
  home: 460,
  /** The computer chapters happen "inside the screen", far off the road. */
  space: [2000, 0, 0] as [number, number, number],
};

export const ROSSO = "#c41e2a";
