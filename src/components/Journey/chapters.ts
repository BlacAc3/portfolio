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
}

export const CHAPTERS: Chapter[] = [
  {
    id: "fast",
    stop: "Fast things",
    title: "I'm a petrolhead.",
    body: "Anything with an engine and a good exhaust note has my attention. Cars first, bikes a close second. This is a Ferrari 812 Superfast, my favourite front-engined V12, and it's driving you through the rest of this page.",
    short: "Cars, bikes and anything with a V12.",
    facts: ["Supercars", "Superbikes", "Naturally aspirated V12s"],
  },
  {
    id: "meet",
    stop: "The meet",
    title: "Weekends end at a car meet.",
    body: "Rows of cars, people who know the build sheets by heart, and the same argument every time: naturally aspirated or turbo. I'm usually the one with the numbers ready.",
    short: "Car meets, spec sheets and the NA vs turbo debate.",
    facts: ["Car meets", "Spec sheets", "Bikes welcome"],
  },
  {
    id: "workshop",
    stop: "Workshop",
    title: "I want to know how it works.",
    body: "Pull the 812 apart and it reads like a systems diagram. A V12 behind the front axle, a gearbox at the back for balance, carbon-ceramic brakes at every corner. I like knowing what every part is for.",
    short: "How cars work, from the V12 to the transaxle.",
    facts: ["6.5 L V12", "800 cv at 8,500 rpm", "0–100 km/h in 2.9 s"],
    note: "Front-mid engine, rear transaxle: about 47/53 front-to-rear weight.",
  },
  {
    id: "design",
    stop: "Design",
    title: "Where art meets engineering.",
    body: "The curves aren't decoration. Every surface moves air somewhere on purpose, and the reflections show whether the surfacing is clean. Good design and good engineering turn out to be the same discipline.",
    short: "Curves that move air: where design meets engineering.",
    facts: ["Aerodynamics", "Surfacing", "Industrial design"],
    note: "The stripes are a zebra analysis. Car designers use it to check that a surface flows without kinks.",
  },
  {
    id: "home",
    stop: "Home",
    title: "Then the drive ends at my desk.",
    body: "The car goes in the garage and the other half of me takes over. Look at the screen on the workbench. That's where we're going next.",
    short: "From the garage to the desk.",
    facts: ["Garage", "Workbench", "One more screen"],
  },
  {
    id: "computers",
    stop: "Computers",
    title: "I use Arch, btw.",
    body: "My daily machine runs Omarchy: Arch Linux with Hyprland tiling every window into place. It's keyboard-driven and tuned by hand, and it's fast. It's what I love about cars, applied to a computer.",
    short: "Omarchy on Arch Linux, tiled with Hyprland.",
    facts: ["Arch Linux", "Omarchy", "Hyprland", "zsh"],
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
