/**
 * Samples points from text rendered on an offscreen 2D canvas.
 * Zero dependencies, runs once at mount — the classic technique for
 * "text made of particles" without shipping a font/geometry asset.
 */

export type TextPoints = {
  /** where each particle flies in from (random sphere shell) */
  starts: Float32Array;
  /** where each particle settles (on the letterforms) */
  targets: Float32Array;
  /** per-particle random 0..1 */
  rand: Float32Array;
  /** per-particle size multiplier */
  size: Float32Array;
  count: number;
};

const CANVAS_W = 1024;
const CANVAS_H = 320;

export function sampleTextPoints(
  text: string,
  count: number,
  opts: { worldWidth?: number; depth?: number } = {},
): TextPoints {
  const worldWidth = opts.worldWidth ?? 9.5;
  const depth = opts.depth ?? 0.5;

  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `900 240px "Arial Black", "Helvetica Neue", Arial, sans-serif`;
  ctx.fillText(text, CANVAS_W / 2, CANVAS_H / 2 + 8);

  const { data } = ctx.getImageData(0, 0, CANVAS_W, CANVAS_H);
  const candidates: Array<[number, number]> = [];
  const step = 3;
  for (let y = 0; y < CANVAS_H; y += step) {
    for (let x = 0; x < CANVAS_W; x += step) {
      if (data[(y * CANVAS_W + x) * 4 + 3] > 120) candidates.push([x, y]);
    }
  }

  // Fisher-Yates so the subset we keep is spread evenly over the glyphs
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  const scale = worldWidth / CANVAS_W;
  const starts = new Float32Array(count * 3);
  const targets = new Float32Array(count * 3);
  const rand = new Float32Array(count);
  const size = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const [px, py] =
      candidates.length > 0
        ? candidates[i % candidates.length]
        : [CANVAS_W / 2, CANVAS_H / 2];
    const jx = candidates.length > 0 && i >= candidates.length ? (Math.random() - 0.5) * 3 : 0;
    const jy = candidates.length > 0 && i >= candidates.length ? (Math.random() - 0.5) * 3 : 0;

    targets[i * 3] = (px + jx - CANVAS_W / 2) * scale;
    targets[i * 3 + 1] = (CANVAS_H / 2 - (py + jy)) * scale;
    targets[i * 3 + 2] = (Math.random() - 0.5) * depth;

    // fly in from a sphere shell so the intro feels like assembly, not a slide
    const radius = 7 + Math.random() * 7;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    starts[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    starts[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    starts[i * 3 + 2] = radius * Math.cos(phi) + 1.5;

    rand[i] = Math.random();
    size[i] = 0.6 + Math.random() * 0.9;
  }

  return { starts, targets, rand, size, count };
}
