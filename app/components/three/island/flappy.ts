"use client";

/**
 * Flappy.DEV — a tiny playable Flappy Bird that lives on the arcade door
 * screen. Pure canvas-2D pixel art rendered into a CanvasTexture; physics
 * runs in the arcade's useFrame. Score persists in localStorage.
 *
 * Modes: "attract" (idle blink screen) → press → "play" → death →
 * "over" (shows score) → press → restart. Press = flappyPress().
 */

export type FlappyMode = "attract" | "play" | "over";

const W = 256;
const H = 300;
const GROUND = 22;
const GRAVITY = 780;
const FLAP_V = -265;
const PIPE_SPEED = 105;
const PIPE_W = 44;
const GAP = 96;
const SPAWN_DIST = 148;

export const flappy = {
  mode: "attract" as FlappyMode,
  score: 0,
  best: 0,
  flapPulse: 0, // 1 → 0 decay; the joystick statue leans on this
  dirty: true,
};

let birdY = H * 0.45;
let vel = 0;
let pipes: Array<{ x: number; gapY: number; passed: boolean }> = [];
let _overAt = 0;
let blinkAcc = 0;
let _idleAt = 0;

try {
  flappy.best = Number(localStorage.getItem("huy:flappy-best")) || 0;
} catch {}

function saveBest() {
  try {
    localStorage.setItem("huy:flappy-best", String(flappy.best));
  } catch {}
}

function reset() {
  birdY = H * 0.45;
  vel = 0;
  pipes = [
    { x: W + 60, gapY: 90 + Math.random() * (H - GROUND - GAP - 150), passed: false },
    { x: W + 60 + SPAWN_DIST, gapY: 90 + Math.random() * (H - GROUND - GAP - 150), passed: false },
  ];
  flappy.score = 0;
}

/** Press = start / flap / retry, depending on the current mode. */
export function flappyPress() {
  if (flappy.mode !== "play") {
    reset();
    flappy.mode = "play";
  } else {
    vel = FLAP_V;
  }
  flappy.flapPulse = 1;
  flappy.dirty = true;
}

/** Leave the game (called when navigating away) — back to attract mode. */
export function flappyExitToAttract() {
  flappy.mode = "attract";
  flappy.dirty = true;
  _idleAt = 0;
}

export function flappyUpdate(dt: number, now: number): boolean {
  flappy.flapPulse = Math.max(0, flappy.flapPulse - dt * 3.5);
  blinkAcc += dt;

  if (flappy.mode === "play") {
    vel += GRAVITY * dt;
    birdY += vel * dt;

    for (const p of pipes) {
      p.x -= PIPE_SPEED * dt;
      if (!p.passed && p.x + PIPE_W < 70) {
        p.passed = true;
        flappy.score++;
        flappy.dirty = true;
      }
    }
    if (pipes[0].x < -PIPE_W) {
      pipes.shift();
      pipes.push({
        x: pipes[pipes.length - 1].x + SPAWN_DIST,
        gapY: 60 + Math.random() * (H - GROUND - GAP - 100),
        passed: false,
      });
    }

    // collisions: ground / ceiling / pipes
    const birdR = 9;
    if (birdY + birdR > H - GROUND || birdY - birdR < 0) return die(now);
    for (const p of pipes) {
      if (70 + birdR > p.x && 70 - birdR < p.x + PIPE_W) {
        if (birdY - birdR < p.gapY || birdY + birdR > p.gapY + GAP) return die(now);
      }
    }

    draw(now);
    return true;
  }

  // attract / over: redraw at ~3fps for blinking text
  if (blinkAcc > 0.35) {
    blinkAcc = 0;
    draw(now);
    return true;
  }
  return false;

  function die(nowTs: number): boolean {
    flappy.mode = "over";
    _overAt = nowTs;
    if (flappy.score > flappy.best) {
      flappy.best = flappy.score;
      saveBest();
    }
    import("@/lib/achievements").then((m) => m.noteFlappyScore(flappy.score));
    draw(nowTs);
    return true;
  }
}

/* ------------------------------------------------------------------ */
/* Rendering (chunky pixel-art look, no images)                        */
/* ------------------------------------------------------------------ */

let ctx: CanvasRenderingContext2D | null = null;

export function attachFlappyCanvas(canvas: HTMLCanvasElement) {
  canvas.width = W;
  canvas.height = H;
  ctx = canvas.getContext("2d");
  draw(0);
}

function px(x: number, y: number, w: number, h: number, color: string) {
  ctx!.fillStyle = color;
  ctx!.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function draw(now: number) {
  if (!ctx) return;

  // sky
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#0b1030");
  sky.addColorStop(1, "#1c2a52");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  if (flappy.mode === "attract") {
    drawBird(W / 2 - 8, H * 0.38 + Math.sin(now * 3) * 8, now);
    drawTitle("FLAPPY.DEV", W / 2, 52, "#67e8f9");
    if (Math.floor(now * 2) % 2 === 0) drawTitle("CLICK TO PLAY", W / 2, H - 52, "#f2ead9", 13);
    drawBest(W / 2, H - 30);
    return;
  }

  // pipes
  for (const p of pipes) {
    px(p.x, 0, PIPE_W, p.gapY, "#43a047");
    px(p.x + 4, p.gapY - 8, PIPE_W - 8, 8, "#66bb6a");
    px(p.x, p.gapY + GAP, PIPE_W, H - GROUND - p.gapY - GAP, "#43a047");
    px(p.x + 4, p.gapY + GAP, PIPE_W - 8, 8, "#66bb6a");
  }

  // ground with stripes
  px(0, H - GROUND, W, GROUND, "#5c3f2b");
  for (let x = ((now * 60) % 24) - 24; x < W; x += 24) {
    px(x, H - GROUND, 12, GROUND, "#4a3221");
  }

  drawBird(70, birdY, now);

  // score
  drawTitle(String(flappy.score), W / 2, 44, "#ffffff", 30);

  if (flappy.mode === "over") {
    ctx.fillStyle = "rgba(6, 8, 20, 0.78)";
    ctx.fillRect(0, H * 0.3, W, 108);
    drawTitle("GAME OVER", W / 2, H * 0.3 + 34, "#ff5f56", 22);
    drawTitle(`SCORE ${flappy.score} — BEST ${flappy.best}`, W / 2, H * 0.3 + 62, "#f2ead9", 13);
    if (Math.floor(now * 2) % 2 === 0) drawTitle("CLICK TO RETRY", W / 2, H * 0.3 + 90, "#67e8f9", 13);
  }
}

function drawBird(x: number, y: number, now: number) {
  // chunky pixel bird: body, wing, eye, beak
  const flapUp = Math.sin(now * 14) > 0 ? -4 : 0;
  px(x - 10, y - 8, 20, 16, "#ffd24a");
  px(x - 12, y - 2 + flapUp, 8, 6, "#f0a832"); // wing
  px(x + 2, y - 6, 5, 5, "#1c1c22"); // eye
  px(x + 9, y - 1, 6, 4, "#ff7043"); // beak
}

function drawTitle(text: string, x: number, y: number, color: string, size = 20) {
  if (!ctx) return;
  ctx.font = `900 ${size}px ui-monospace, 'SF Mono', Menlo, monospace`;
  ctx.textAlign = "center";
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.textAlign = "left";
}

function drawBest(x: number, y: number) {
  if (!ctx) return;
  ctx.font = "600 12px ui-monospace, Menlo, monospace";
  ctx.textAlign = "center";
  ctx.fillStyle = "#8b98c9";
  ctx.fillText(`BEST ${flappy.best}`, x, y);
  ctx.textAlign = "left";
}

// dev/testing aid: drive the game from tests/console
if (typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>).__flappy = { press: flappyPress, state: flappy };
}
