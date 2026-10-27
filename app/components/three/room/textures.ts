import * as THREE from "three";

/**
 * Lazy singletons, client-only (these modules only ever render inside the
 * Canvas, which is dynamically imported with ssr:false).
 */

let clockTexture: THREE.CanvasTexture | null = null;
let clockTimer: ReturnType<typeof setInterval> | null = null;

/** Live clock — the monitor and the shelf clock display the real time. */
export function getClockTexture(): THREE.CanvasTexture {
  if (clockTexture) return clockTexture;

  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  clockTexture = new THREE.CanvasTexture(canvas);
  clockTexture.colorSpace = THREE.SRGBColorSpace;

  const draw = () => {
    const ctx = canvas.getContext("2d")!;
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    ctx.fillStyle = "#0a0a0d";
    ctx.fillRect(0, 0, 512, 256);
    ctx.fillStyle = "#f4f2ee";
    ctx.font = "900 128px ui-monospace, 'SF Mono', Menlo, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${hh}:${mm}`, 256, 132);
    clockTexture!.needsUpdate = true;
  };

  draw();
  clockTimer = setInterval(draw, 1000);
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
