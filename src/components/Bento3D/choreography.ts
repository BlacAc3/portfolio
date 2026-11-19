/**
 * Scroll choreography for the bento showcase, in real pixels.
 *
 * The track is one long scroll distance. Every compartment gets its own
 * contiguous window, and within it the beats never overlap:
 *
 *   dive      camera travels from the overview down onto the compartment
 *   expand    the compartment's top face morphs into the full-screen page
 *   read      the page scrolls 1:1 with the wheel (length = content height)
 *   collapse  the page shrinks back onto the compartment face
 *   rise      camera pulls back out so the whole box is visible again
 *
 * Because each beat owns its own slice, two pages can never be on screen at
 * the same time, and the box is always seen again between pages.
 */

export interface PageWindow {
  start: number;
  diveEnd: number;
  expandEnd: number;
  /** Where the content starts translating. */
  readFrom: number;
  readEnd: number;
  collapseEnd: number;
  end: number;
  /** How far the page content translates while reading. */
  readTravel: number;
}

export interface Track {
  /** End of the hero: the closed box resting under the headline. */
  heroEnd: number;
  introEnd: number;
  pages: PageWindow[];
  outroStart: number;
  total: number;
  viewport: number;
}

/** Beat lengths as multiples of the viewport height. */
const BEAT = {
  hero: 0.9,
  intro: 1.5,
  dive: 0.55,
  expand: 0.75, // grow crisp, fade the cover, a blank beat, then the page
  readLead: 0.3, // settle on the page's first screen before it scrolls
  readHold: 0.2, // dwell on the last screen before it closes
  collapse: 0.4,
  rise: 0.5,
  outro: 1.1,
} as const;

export function buildTrack(viewport: number, contentHeights: number[]): Track {
  const v = Math.max(1, viewport);
  const heroEnd = BEAT.hero * v;
  let y = heroEnd + BEAT.intro * v;
  const introEnd = y;

  const pages = contentHeights.map((h) => {
    const readTravel = Math.max(0, h - v);
    const start = y;
    const diveEnd = start + BEAT.dive * v;
    const expandEnd = diveEnd + BEAT.expand * v;
    const readEnd =
      expandEnd + BEAT.readLead * v + readTravel + BEAT.readHold * v;
    const collapseEnd = readEnd + BEAT.collapse * v;
    const end = collapseEnd + BEAT.rise * v;
    y = end;
    return {
      start,
      diveEnd,
      expandEnd,
      readFrom: expandEnd + BEAT.readLead * v,
      readEnd,
      collapseEnd,
      end,
      readTravel,
    };
  });

  const outroStart = y;
  const total = y + BEAT.outro * v;
  return { heroEnd, introEnd, pages, outroStart, total, viewport: v };
}

export interface Frame {
  phase: "hero" | "intro" | "page" | "outro";
  /** 0 → 1 as the box leaves the hero for the stage (stays 1 afterwards). */
  hero: number;
  /** Active compartment, -1 outside pages. */
  index: number;
  /** 0 → 1 through the intro (stays 1 afterwards). */
  intro: number;
  /** 0 = overview framing, 1 = camera locked over the compartment. */
  dive: number;
  /** 0 = compartment face, 1 = full-screen page. */
  morph: number;
  /** Pixels the page content has scrolled. */
  read: number;
  /** 0 → 1 through the outro. */
  outro: number;
  /** True while the camera pulls back out after a page has closed. */
  rising: boolean;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const seg = (y: number, a: number, b: number) =>
  b <= a ? (y >= b ? 1 : 0) : clamp01((y - a) / (b - a));

export function frameAt(track: Track, y: number): Frame {
  if (y < track.heroEnd) {
    return {
      phase: "hero",
      hero: seg(y, 0, track.heroEnd),
      index: -1,
      intro: 0,
      dive: 0,
      morph: 0,
      read: 0,
      outro: 0,
      rising: false,
    };
  }
  if (y < track.introEnd) {
    return {
      phase: "intro",
      hero: 1,
      index: -1,
      intro: seg(y, track.heroEnd, track.introEnd),
      dive: 0,
      morph: 0,
      read: 0,
      outro: 0,
      rising: false,
    };
  }
  if (y >= track.outroStart) {
    return {
      phase: "outro",
      hero: 1,
      index: -1,
      intro: 1,
      dive: 0,
      morph: 0,
      read: 0,
      outro: seg(y, track.outroStart, track.total - track.viewport * 0.15),
      rising: false,
    };
  }

  let index = track.pages.findIndex((p) => y < p.end);
  if (index < 0) index = track.pages.length - 1;
  const p = track.pages[index];

  const dive = y < p.collapseEnd ? seg(y, p.start, p.diveEnd) : 1 - seg(y, p.collapseEnd, p.end);
  const morph = y < p.readEnd ? seg(y, p.diveEnd, p.expandEnd) : 1 - seg(y, p.readEnd, p.collapseEnd);
  const read = Math.min(p.readTravel, Math.max(0, y - p.readFrom));

  return {
    phase: "page",
    hero: 1,
    index,
    intro: 1,
    dive,
    morph,
    read,
    outro: 0,
    rising: y >= p.collapseEnd,
  };
}

/** Scroll offset (within the track) where page `index` is fully open. */
export const readStart = (track: Track, index: number) =>
  track.pages[index]?.expandEnd ?? 0;

/* Easing shared by the DOM and the camera so they stay in lock-step. */
export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
