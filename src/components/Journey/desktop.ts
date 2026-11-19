import * as THREE from "three";

/**
 * The Omarchy desktop, painted once onto a canvas: a waybar strip and three
 * Hyprland tiles (terminal, editor, system monitor). The garage monitor shows
 * the whole thing; the "inside the screen" chapter crops each tile out of it.
 */

export const DESK_W = 2048;
export const DESK_H = 1152;

/** Tiles in normalised screen space (x, y from the top-left; w, h). */
export const TILES = {
  bar: { x: 0.008, y: 0.008, w: 0.984, h: 0.04 },
  term: { x: 0.008, y: 0.06, w: 0.552, h: 0.932 },
  edit: { x: 0.572, y: 0.06, w: 0.42, h: 0.46 },
  mon: { x: 0.572, y: 0.532, w: 0.42, h: 0.46 },
} as const;
export type TileKey = keyof typeof TILES;

const BG = "#16120f";
const WIN = "#1d1814";
const INK = "#f4ede3";
const DIM = "rgba(244,237,227,0.45)";
const GOLD = "#dcb077";
const ARCH = "#1793d1";
const MONO = `"JetBrains Mono", "Fira Code", ui-monospace, "SFMono-Regular", Menlo, monospace`;

const px = (k: TileKey) => {
  const t = TILES[k];
  return { x: t.x * DESK_W, y: t.y * DESK_H, w: t.w * DESK_W, h: t.h * DESK_H };
};

const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
};

const window = (ctx: CanvasRenderingContext2D, k: TileKey, active: boolean) => {
  const { x, y, w, h } = px(k);
  roundRect(ctx, x, y, w, h, 14);
  ctx.fillStyle = WIN;
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = active ? GOLD : "rgba(244,237,227,0.14)";
  ctx.stroke();
  return { x, y, w, h };
};

type Run = [string, string];
const line = (ctx: CanvasRenderingContext2D, runs: Run[], x: number, y: number) => {
  let cx = x;
  for (const [color, text] of runs) {
    ctx.fillStyle = color;
    ctx.fillText(text, cx, y);
    cx += ctx.measureText(text).width;
  }
};

/** The Arch logo, simplified: a tall "A" with the notch cut out of its foot. */
const archLogo = (ctx: CanvasRenderingContext2D, cx: number, top: number, s: number) => {
  ctx.fillStyle = ARCH;
  ctx.beginPath();
  ctx.moveTo(cx, top);
  ctx.lineTo(cx + s * 0.5, top + s);
  ctx.lineTo(cx + s * 0.12, top + s * 0.78);
  ctx.quadraticCurveTo(cx, top + s * 0.55, cx - s * 0.12, top + s * 0.78);
  ctx.lineTo(cx - s * 0.5, top + s);
  ctx.closePath();
  ctx.fill();
};

function paint(ctx: CanvasRenderingContext2D) {
  // Wallpaper: umber with a soft gold bloom.
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, DESK_W, DESK_H);
  const g = ctx.createRadialGradient(DESK_W * 0.7, DESK_H * 0.2, 0, DESK_W * 0.7, DESK_H * 0.2, DESK_W * 0.7);
  g.addColorStop(0, "rgba(220,176,119,0.16)");
  g.addColorStop(1, "rgba(220,176,119,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, DESK_W, DESK_H);

  ctx.textBaseline = "middle";

  // Waybar
  {
    const { x, y, w, h } = px("bar");
    roundRect(ctx, x, y, w, h, 10);
    ctx.fillStyle = "rgba(29,24,20,0.92)";
    ctx.fill();
    ctx.font = `700 24px ${MONO}`;
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = i === 0 ? GOLD : DIM;
      ctx.fillText(String(i + 1), x + 28 + i * 44, y + h / 2);
    }
    ctx.fillStyle = INK;
    ctx.textAlign = "center";
    ctx.fillText("Thursday 21:04", x + w / 2, y + h / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = DIM;
    ctx.fillText("wifi   vol 60   100%", x + w - 28, y + h / 2);
    ctx.textAlign = "left";
  }

  // Terminal: fastfetch + the obligatory line.
  {
    const { x, y } = window(ctx, "term", true);
    const lh = 44;
    ctx.font = `500 30px ${MONO}`;
    let ty = y + 56;
    line(ctx, [[GOLD, "❯ "], [INK, "fastfetch"]], x + 40, ty);
    ty += lh * 1.4;
    archLogo(ctx, x + 190, ty - 8, 300);
    const info: Run[][] = [
      [[ARCH, "aaron"], [INK, "@"], [ARCH, "omarchy"]],
      [[DIM, "────────────────"]],
      [[ARCH, "OS      "], [INK, "Arch Linux x86_64"]],
      [[ARCH, "Distro  "], [INK, "Omarchy"]],
      [[ARCH, "WM      "], [INK, "Hyprland"]],
      [[ARCH, "Shell   "], [INK, "zsh"]],
      [[ARCH, "Kernel  "], [INK, "linux-omarchy"]],
      [[ARCH, "Theme   "], [INK, "umber + gold"]],
    ];
    info.forEach((runs, i) => line(ctx, runs, x + 400, ty + i * lh));
    ty += lh * 9.2;
    line(ctx, [[GOLD, "❯ "], [INK, 'echo "I use Arch, btw"']], x + 40, ty);
    ty += lh;
    line(ctx, [[INK, "I use Arch, btw"]], x + 40, ty);
    ty += lh * 1.4;
    line(ctx, [[GOLD, "❯ "], [INK, "sudo pacman -Syu"]], x + 40, ty);
    ty += lh;
    line(ctx, [[DIM, ":: Synchronising package databases..."]], x + 40, ty);
    ty += lh;
    line(ctx, [[DIM, " core is up to date"]], x + 40, ty);
    ty += lh * 1.4;
    line(ctx, [[GOLD, "❯ "]], x + 40, ty);
    ctx.fillStyle = INK;
    ctx.fillRect(x + 80, ty - 18, 18, 36);
  }

  // Editor
  {
    const { x, y, w } = window(ctx, "edit", false);
    ctx.font = `500 24px ${MONO}`;
    ctx.fillStyle = DIM;
    ctx.fillText("journey.ts", x + 32, y + 40);
    ctx.fillStyle = "rgba(244,237,227,0.08)";
    ctx.fillRect(x + 2, y + 66, w - 4, 2);
    const K = "#e0a96d";
    const S = "#a7c080";
    const F = "#7fbbb3";
    const code: Run[][] = [
      [[K, "export const "], [F, "drive"], [INK, " = (u: "], [K, "number"], [INK, ") => {"]],
      [[INK, "  "], [K, "const "], [INK, "stop = chapters[Math."], [F, "floor"], [INK, "(u)];"]],
      [[INK, "  "], [K, "if "], [INK, "(stop.id === "], [S, '"workshop"'], [INK, ")"]],
      [[INK, "    car."], [F, "explode"], [INK, "(u % 1);"]],
      [[INK, "  "], [K, "return "], [INK, "stop."], [F, "next"], [INK, "();"]],
      [[INK, "};"]],
      [[DIM, "// ~ 60 fps, no excuses"]],
    ];
    code.forEach((runs, i) => {
      ctx.fillStyle = DIM;
      ctx.fillText(String(i + 1).padStart(2, " "), x + 32, y + 110 + i * 40);
      line(ctx, runs, x + 92, y + 110 + i * 40);
    });
  }

  // System monitor
  {
    const { x, y, w, h } = window(ctx, "mon", false);
    ctx.font = `500 24px ${MONO}`;
    ctx.fillStyle = DIM;
    ctx.fillText("cpu", x + 32, y + 40);
    const gx = x + 32;
    const gy = y + 80;
    const gw = w - 64;
    const gh = h * 0.42;
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let i = 0; i <= 60; i++) {
      const v = 0.35 + 0.25 * Math.sin(i * 0.4) + 0.15 * Math.sin(i * 1.7);
      const px2 = gx + (gw * i) / 60;
      const py = gy + gh * (1 - v);
      if (i) ctx.lineTo(px2, py);
      else ctx.moveTo(px2, py);
    }
    ctx.stroke();
    // Core bars
    for (let i = 0; i < 16; i++) {
      const v = 0.2 + ((i * 37) % 70) / 100;
      ctx.fillStyle = "rgba(244,237,227,0.1)";
      ctx.fillRect(gx + i * (gw / 16), y + h - 120, gw / 16 - 8, 80);
      ctx.fillStyle = i % 5 === 0 ? GOLD : ARCH;
      ctx.fillRect(gx + i * (gw / 16), y + h - 40 - 80 * v, gw / 16 - 8, 80 * v);
    }
  }
}

/** The desktop as a texture; repaints once web fonts arrive. */
export function desktopTexture() {
  const c = document.createElement("canvas");
  c.width = DESK_W;
  c.height = DESK_H;
  const ctx = c.getContext("2d")!;
  paint(ctx);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  document.fonts?.ready.then(() => {
    paint(ctx);
    tex.needsUpdate = true;
  });
  return tex;
}

/** A crop of the desktop texture showing one tile. */
export function tileTexture(src: THREE.Texture, k: TileKey) {
  const t = src.clone();
  const r = TILES[k];
  t.repeat.set(r.w, r.h);
  t.offset.set(r.x, 1 - r.y - r.h);
  t.needsUpdate = true;
  return t;
}
