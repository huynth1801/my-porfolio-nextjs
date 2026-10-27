import * as THREE from "three";

/**
 * Lazy singletons, client-only (these modules only ever render inside the
 * Canvas, which is dynamically imported with ssr:false).
 */

let clockTexture: THREE.CanvasTexture | null = null;
let clockTimer: ReturnType<typeof setInterval> | null = null;

const BOOT_LINES = [
  "HUY.OS v2.6 — booting",
  "> loading creative-core.... ok",
  "> mounting /dev/projects.. ok",
  "> launching interface",
];

/**
 * Live clock — the monitor displays the real time. During the boot
 * sequence (boot.value < 1) it shows a CRT-style boot screen instead,
 * and the monitor turns on only after the first flicker.
 */
export function getClockTexture(boot?: () => number): THREE.CanvasTexture {
  if (clockTexture) return clockTexture;

  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  clockTexture = new THREE.CanvasTexture(canvas);
  clockTexture.colorSpace = THREE.SRGBColorSpace;

  const draw = () => {
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#050507";
    ctx.fillRect(0, 0, 512, 256);

    const t = boot ? boot() : 1;
    if (t < 0.999) {
      // CRT boot screen: lines type in as boot progresses
      ctx.font = "600 22px ui-monospace, 'SF Mono', Menlo, monospace";
      ctx.fillStyle = "#67e8f9";
      const lines = Math.min(BOOT_LINES.length, Math.floor(t * (BOOT_LINES.length + 1)));
      for (let i = 0; i < lines; i++) {
        ctx.globalAlpha = Math.max(0.75, 0.4 + 0.6 * Math.min(1, t * 3 - i * 0.5));
        ctx.fillText(BOOT_LINES[i], 34, 52 + i * 32);
      }
      ctx.globalAlpha = 1;
      // blinking cursor on the next line
      if (Math.floor(Date.now() / 300) % 2 === 0) {
        ctx.fillRect(34, 52 + lines * 32 - 14, 12, 16);
      }
      // progress blocks
      const blocks = Math.floor(t * 24);
      for (let i = 0; i < blocks; i++) {
        ctx.fillStyle = "#22d3ee";
        ctx.fillRect(34 + i * 19, 208, 13, 12);
      }
      ctx.strokeStyle = "#2a3a44";
      ctx.strokeRect(33, 206, 446, 16);
    } else {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      ctx.fillStyle = "#f4f2ee";
      ctx.font = "900 128px ui-monospace, 'SF Mono', Menlo, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${hh}:${mm}`, 256, 132);
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
    }
    clockTexture!.needsUpdate = true;
  };

  draw();
  clockTimer = setInterval(draw, 120);
  return clockTexture;
}

export function disposeClockTexture() {
  if (clockTimer) clearInterval(clockTimer);
  clockTexture?.dispose();
  clockTexture = null;
}

let posterTexture: THREE.CanvasTexture | null = null;

/** Poster art leaning on the shelf — a tiny personal touch. */
export function getPosterTexture(): THREE.CanvasTexture {
  if (posterTexture) return posterTexture;

  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 384;
  posterTexture = new THREE.CanvasTexture(canvas);
  posterTexture.colorSpace = THREE.SRGBColorSpace;

  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#141419";
  ctx.fillRect(0, 0, 256, 384);
  ctx.strokeStyle = "#2c2c36";
  ctx.lineWidth = 6;
  ctx.strokeRect(14, 14, 228, 356);
  // concentric circles — a nod to the studio-poster look
  ctx.strokeStyle = "#4b4b58";
  for (let r = 18; r <= 66; r += 16) {
    ctx.beginPath();
    ctx.arc(128, 120, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = "#67e8f9";
  ctx.font = "800 34px 'Space Grotesk', ui-sans-serif, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("HUY.DEV", 128, 250);
  ctx.fillStyle = "#8b8b98";
  ctx.font = "500 17px ui-sans-serif, sans-serif";
  ctx.fillText("FRONTEND · GAMEPLAY", 128, 284);
  ctx.fillText("HCMC — VN", 128, 310);

  return posterTexture;
}

/* ------------------------------------------------------------------ */
/* Window view — day sky or night skyline with lit windows             */
/* ------------------------------------------------------------------ */

export function getSkylineTexture(night: boolean): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const W = canvas.width;
  const H = canvas.height;

  if (night) {
    // deep night sky
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#070b1c");
    sky.addColorStop(0.7, "#101a38");
    sky.addColorStop(1, "#1a2547");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // stars
    for (let i = 0; i < 90; i++) {
      const a = 0.25 + Math.random() * 0.75;
      ctx.fillStyle = `rgba(226, 232, 255, ${a})`;
      ctx.fillRect(Math.random() * W, Math.random() * H * 0.55, 2, 2);
    }

    // moon with halo
    const moonX = W * 0.72;
    const moonY = H * 0.2;
    const halo = ctx.createRadialGradient(moonX, moonY, 8, moonX, moonY, 90);
    halo.addColorStop(0, "rgba(230, 236, 255, 0.5)");
    halo.addColorStop(1, "rgba(230, 236, 255, 0)");
    ctx.fillStyle = halo;
    ctx.fillRect(moonX - 100, moonY - 100, 200, 200);
    ctx.fillStyle = "#e8ecff";
    ctx.beginPath();
    ctx.arc(moonX, moonY, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#c9d2f0";
    ctx.beginPath();
    ctx.arc(moonX - 10, moonY - 6, 7, 0, Math.PI * 2);
    ctx.arc(moonX + 12, moonY + 10, 5, 0, Math.PI * 2);
    ctx.fill();

    // skyline: two layers for depth
    const layer = (color: string, maxH: number, litChance: number) => {
      ctx.fillStyle = color;
      let x = -10;
      while (x < W) {
        const w = 40 + Math.random() * 70;
        const h = 80 + Math.random() * maxH;
        const y = H - h;
        ctx.fillRect(x, y, w, h);
        // lit windows
        for (let wy = y + 10; wy < H - 12; wy += 18) {
          for (let wx = x + 7; wx < x + w - 10; wx += 16) {
            if (Math.random() < litChance) {
              ctx.fillStyle = Math.random() < 0.75 ? "#ffd27a" : "#7fd4ff";
              ctx.globalAlpha = 0.55 + Math.random() * 0.45;
              ctx.fillRect(wx, wy, 6, 9);
              ctx.globalAlpha = 1;
            }
          }
        }
        ctx.fillStyle = color;
        x += w + 6;
      }
    };
    layer("#0d1530", 190, 0.28);
    layer("#080d20", 130, 0.42);
  } else {
    // day sky
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#5fb2e8");
    sky.addColorStop(0.65, "#a8d8f5");
    sky.addColorStop(1, "#d6ecfa");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // sun haze
    const sun = ctx.createRadialGradient(W * 0.24, H * 0.18, 10, W * 0.24, H * 0.18, 190);
    sun.addColorStop(0, "rgba(255, 246, 214, 0.95)");
    sun.addColorStop(1, "rgba(255, 246, 214, 0)");
    ctx.fillStyle = sun;
    ctx.fillRect(0, 0, W, H * 0.6);

    // soft clouds
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    for (let i = 0; i < 7; i++) {
      const cx = Math.random() * W;
      const cy = H * (0.12 + Math.random() * 0.3);
      const s = 26 + Math.random() * 34;
      for (const [dx, dy, r] of [[0, 0, s], [s * 0.8, s * 0.15, s * 0.7], [-s * 0.8, s * 0.18, s * 0.6]] as const) {
        ctx.beginPath();
        ctx.ellipse(cx + dx, cy + dy, r, r * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // distant city silhouette
    ctx.fillStyle = "#5a7ba0";
    let x = -10;
    while (x < W) {
      const w = 50 + Math.random() * 70;
      const h = 60 + Math.random() * 130;
      ctx.fillRect(x, H - h, w, h);
      x += w + 8;
    }
  }

  return texture;
}
