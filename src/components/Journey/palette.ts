import type { Theme } from "../../contexts/ThemeContext";

/**
 * Scene colours per theme. Dark is dusk under street lamps; light is a
 * hazy parchment afternoon. Both keep the site's umber and gold, and the
 * fog is the page colour, so the world dissolves into the page at its edges.
 */
const SCENE = {
  dark: {
    night: true,
    fog: "#1a1612",
    ground: "#1f1a16",
    asphalt: "#26211d",
    roadLine: "#cdbfa8",
    lot: "#2a241f",
    metal: "#3b342d",
    wall: "#2f2822",
    tool: "#4a4038",
    floor: "#3a332d",
    tunnel: "#14110e",
    tunnelLine: "#3d342a",
    roof: "#241e19",
    house: "#2f2822",
    bike: "#e8e2d6",
    void: "#14110e",
    particle: "#ecdcc0",
    hemiSky: "#ffe3bf",
    hemiGround: "#1a1612",
  },
  light: {
    night: false,
    fog: "#e8e0d3",
    ground: "#ddd3c3",
    asphalt: "#8d8378",
    roadLine: "#f4ede3",
    lot: "#cfc4b2",
    metal: "#6b6157",
    wall: "#e2d8c8",
    tool: "#a89a87",
    floor: "#cfc5b5",
    tunnel: "#efe8dc",
    tunnelLine: "#c9bba5",
    roof: "#b9a993",
    house: "#efe6d7",
    bike: "#2b2219",
    void: "#e8e0d3",
    particle: "#7d5118",
    hemiSky: "#fff6e8",
    hemiGround: "#b59b7a",
  },
};

export type Palette = (typeof SCENE)["dark"] | (typeof SCENE)["light"];
export const scenePalette = (t: Theme): Palette => SCENE[t];
