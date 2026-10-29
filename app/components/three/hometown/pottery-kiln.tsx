"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { KilnSmoke } from "./kiln-smoke";

/**
 * Creates a procedural high-res terracotta brick texture
 * with characteristic Mang Thit horizontal circular brick courses,
 * weathered lime/salt efflorescence streaks, and soot darkening.
 */
function createKilnTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  // Base warm terracotta tone
  const baseGrad = ctx.createLinearGradient(0, 0, 0, 512);
  baseGrad.addColorStop(0, "#4a1e12"); // soot darkened top
  baseGrad.addColorStop(0.15, "#8d3016");
  baseGrad.addColorStop(0.45, "#b5441d");
  baseGrad.addColorStop(0.75, "#c24b22");
  baseGrad.addColorStop(1, "#8e3519"); // ground footing
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, 1024, 512);

  // Horizontal brick courses
  const rows = 48;
  const rowHeight = 512 / rows;
  for (let r = 0; r < rows; r++) {
    const y = r * rowHeight;
    // Course mortar line
    ctx.strokeStyle = "rgba(40, 18, 12, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();

    // Subtle individual brick hue variations
    const bricksInRow = 40;
    const brickWidth = 1024 / bricksInRow;
    const offset = (r % 2) * (brickWidth * 0.5);

    for (let c = 0; c < bricksInRow; c++) {
      const x = (c * brickWidth + offset) % 1024;
      const noise = Math.random();
      if (noise > 0.55) {
        ctx.fillStyle = noise > 0.8 ? "rgba(220, 100, 50, 0.12)" : "rgba(80, 25, 12, 0.12)";
        ctx.fillRect(x + 1, y + 1, brickWidth - 2, rowHeight - 2);
      }
    }
  }

  // Mang Thit iconic weathered white salt / lime efflorescence patches
  // (Decades of thermal baking & mineral precipitation)
  ctx.fillStyle = "rgba(235, 226, 215, 0.28)";
  for (let i = 0; i < 22; i++) {
    const cx = Math.random() * 1024;
    const cy = 180 + Math.random() * 260;
    const rw = 40 + Math.random() * 90;
    const rh = 30 + Math.random() * 80;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rw, rh, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  // Additional fine vertical drip streaks of lime wash
  ctx.fillStyle = "rgba(240, 235, 225, 0.18)";
  for (let s = 0; s < 30; s++) {
    const sx = Math.random() * 1024;
    const sy = 160 + Math.random() * 150;
    const sw = 3 + Math.random() * 8;
    const sh = 40 + Math.random() * 120;
    ctx.fillRect(sx, sy, sw, sh);
  }

  // Soot wash near top
  const sootGrad = ctx.createLinearGradient(0, 0, 0, 120);
  sootGrad.addColorStop(0, "rgba(25, 15, 12, 0.75)");
  sootGrad.addColorStop(0.5, "rgba(45, 20, 15, 0.35)");
  sootGrad.addColorStop(1, "rgba(60, 25, 18, 0)");
  ctx.fillStyle = sootGrad;
  ctx.fillRect(0, 0, 1024, 120);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.repeat.set(2, 1);
  return texture;
}

/**
 * Procedural profile of a Mang Thit bell kiln:
 * Wide footing -> paraboloid curved flank -> narrow top aperture rim.
 */
function getKilnRadiusAtHeight(y: number, maxHeight: number, baseRadius: number): number {
  const normY = THREE.MathUtils.clamp(y / maxHeight, 0, 1);
  // Parabolic bell curve: starts wide, curves inward faster near the top
  const factor = 1 - Math.pow(normY, 1.35) * 0.76;
  return baseRadius * factor;
}

export type KilnProps = {
  position?: [number, number, number];
  scale?: number;
  rotation?: [number, number, number];
  hasSmoke?: boolean;
  hasFire?: boolean;
  hasSpiralStairs?: boolean;
};

export function PotteryKiln({
  position = [0, 0, 0],
  scale = 1,
  rotation = [0, 0, 0],
  hasSmoke = true,
  hasFire = true,
  hasSpiralStairs = true,
}: KilnProps) {
  const fireLightRef = useRef<THREE.PointLight>(null!);

  const height = 9.2;
  const baseRadius = 3.6;

  // Bell-shaped Lathe silhouette points
  const lathePoints = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    const segments = 32;

    // Outer profile
    for (let i = 0; i <= segments; i++) {
      const y = (i / segments) * height;
      const r = getKilnRadiusAtHeight(y, height, baseRadius);
      pts.push(new THREE.Vector2(r, y));
    }

    // Top rim lip
    pts.push(new THREE.Vector2(baseRadius * 0.28, height + 0.15));
    pts.push(new THREE.Vector2(baseRadius * 0.22, height + 0.15));
    // Inner hollow chimney
    pts.push(new THREE.Vector2(baseRadius * 0.2, height - 1.2));

    return pts;
  }, [height, baseRadius]);

  // Spiral stairs spiraling up the outer dome
  const spiralSteps = useMemo(() => {
    if (!hasSpiralStairs) return [];
    const steps: { pos: [number, number, number]; rotY: number; width: number }[] = [];
    const stepCount = 28;
    const startAngle = 0.4;
    const turns = 0.85; // ~300 degree spiral around one side

    for (let i = 0; i < stepCount; i++) {
      const frac = i / stepCount;
      const y = 0.5 + frac * (height * 0.75);
      const angle = startAngle + frac * Math.PI * 2 * turns;
      const r = getKilnRadiusAtHeight(y, height, baseRadius) + 0.14;

      steps.push({
        pos: [Math.cos(angle) * r, y, Math.sin(angle) * r],
        rotY: -angle + Math.PI / 2,
        width: 0.55 - frac * 0.15,
      });
    }
    return steps;
  }, [hasSpiralStairs, height, baseRadius]);

  // Terracotta & brick material
  const kilnTexture = useMemo(() => {
    if (typeof window === "undefined") return null;
    return createKilnTexture();
  }, []);

  // Flickering fire in combustion chamber
  useFrame((state) => {
    if (fireLightRef.current && hasFire) {
      const time = state.clock.getElapsedTime();
      const flicker =
        Math.sin(time * 12.0) * 0.25 +
        Math.cos(time * 23.0) * 0.15 +
        Math.sin(time * 7.5) * 0.35 +
        1.0;
      fireLightRef.current.intensity = 2.4 * Math.max(0.6, flicker);
    }
  });

  return (
    <group position={position} scale={scale} rotation={rotation}>
      {/* Kiln Main Bell Dome */}
      <mesh castShadow receiveShadow>
        <latheGeometry args={[lathePoints, 36]} />
        <meshStandardMaterial
          color="#b5441d"
          map={kilnTexture || undefined}
          roughness={0.88}
          metalness={0.06}
        />
      </mesh>

      {/* Top Rim Brick Cap / Chimney Collar */}
      <mesh position={[0, height + 0.08, 0]} castShadow>
        <torusGeometry args={[baseRadius * 0.25, 0.12, 10, 24]} />
        <meshStandardMaterial color="#4a1e12" roughness={0.92} />
      </mesh>

      {/* Exterior Spiral Climbing Steps */}
      {hasSpiralStairs && (
        <group>
          {spiralSteps.map((step, idx) => (
            <mesh
              key={idx}
              position={step.pos}
              rotation={[0, step.rotY, 0]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[step.width, 0.14, 0.35]} />
              <meshStandardMaterial color="#8e3519" roughness={0.9} />
            </mesh>
          ))}
        </group>
      )}

      {/* Arched Lower Combustion Doorway (Cửa Lò Nung) */}
      <group position={[0, 0.85, baseRadius - 0.1]}>
        {/* Dark interior chamber recess */}
        <mesh position={[0, 0, -0.45]}>
          <boxGeometry args={[1.5, 1.8, 1.2]} />
          <meshStandardMaterial color="#180b06" roughness={1.0} />
        </mesh>

        {/* Arch Frame Left Post */}
        <mesh position={[-0.7, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.26, 1.7, 0.35]} />
          <meshStandardMaterial color="#6e2511" roughness={0.9} />
        </mesh>
        {/* Arch Frame Right Post */}
        <mesh position={[0.7, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.26, 1.7, 0.35]} />
          <meshStandardMaterial color="#6e2511" roughness={0.9} />
        </mesh>
        {/* Arch Top Lintelle */}
        <mesh position={[0, 0.9, 0]} castShadow>
          <boxGeometry args={[1.66, 0.28, 0.38]} />
          <meshStandardMaterial color="#5a1e0d" roughness={0.9} />
        </mesh>

        {/* Interior Fire Flame PointLight & Inner Embers */}
        {hasFire && (
          <>
            <pointLight
              ref={fireLightRef}
              color="#ff6a00"
              distance={6.5}
              decay={2}
              position={[0, 0.1, -0.3]}
              intensity={2.8}
            />
            {/* Glowing coal / rice husk embers bed */}
            <mesh position={[0, -0.7, -0.2]}>
              <boxGeometry args={[1.1, 0.18, 0.8]} />
              <meshStandardMaterial
                color="#ff3b00"
                emissive="#ff4500"
                emissiveIntensity={2.2}
                roughness={0.6}
              />
            </mesh>
          </>
        )}

        {/* Pile of firewood / trấu bags outside door */}
        <mesh position={[-1.15, -0.65, 0.4]} rotation={[0, 0.4, 0.1]} castShadow>
          <cylinderGeometry args={[0.09, 0.09, 1.1, 8]} />
          <meshStandardMaterial color="#3e2723" roughness={0.95} />
        </mesh>
        <mesh position={[-1.25, -0.55, 0.42]} rotation={[0.2, -0.3, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.95, 8]} />
          <meshStandardMaterial color="#4e342e" roughness={0.95} />
        </mesh>
      </group>

      {/* Chimney Billowing Smoke */}
      {hasSmoke && <KilnSmoke position={[0, height + 0.3, 0]} intensity={1.1} />}
    </group>
  );
}

/**
 * Cluster of Mang Thit Kilns:
 * Creates the vast "Vương Quốc Đỏ" skyline with multiple clustered kilns,
 * brick sheds with terracotta tile roofs, drying racks, and ceramic jars.
 */
export function MangThitKilnCluster() {
  return (
    <group position={[0, 0, 0]}>
      {/* Main Hero Kiln (Front Center-Left) */}
      <PotteryKiln
        position={[-1.5, 0, 1.2]}
        scale={1.05}
        rotation={[0, -0.35, 0]}
        hasSmoke={true}
        hasFire={true}
        hasSpiralStairs={true}
      />

      {/* Secondary Kiln (Right, slightly behind, tall) */}
      <PotteryKiln
        position={[4.6, 0, -1.8]}
        scale={1.18}
        rotation={[0, 0.7, 0]}
        hasSmoke={true}
        hasFire={true}
        hasSpiralStairs={true}
      />

      {/* Third Kiln (Back Left, deep background) */}
      <PotteryKiln
        position={[-6.2, 0, -3.5]}
        scale={0.95}
        rotation={[0, 1.2, 0]}
        hasSmoke={true}
        hasFire={false}
        hasSpiralStairs={false}
      />

      {/* Fourth Kiln (Far Right Background) */}
      <PotteryKiln
        position={[9.5, 0, -6.0]}
        scale={0.88}
        rotation={[0, -0.8, 0]}
        hasSmoke={false}
        hasFire={false}
        hasSpiralStairs={false}
      />

      {/* Fifth Kiln (Far Center-Back) */}
      <PotteryKiln
        position={[0.8, 0, -8.2]}
        scale={0.92}
        rotation={[0, 0.4, 0]}
        hasSmoke={true}
        hasFire={false}
        hasSpiralStairs={false}
      />

      {/* Traditional brick shed with pitched terracotta roof (Nhà chứa gạch mộc) */}
      <group position={[-5.8, 0, 2.8]} rotation={[0, 0.25, 0]}>
        {/* Pillars */}
        {[
          [-2.2, -1.6],
          [-2.2, 1.6],
          [2.2, -1.6],
          [2.2, 1.6],
        ].map(([px, pz], i) => (
          <mesh key={i} position={[px, 1.5, pz]} castShadow receiveShadow>
            <cylinderGeometry args={[0.12, 0.12, 3, 8]} />
            <meshStandardMaterial color="#4a2e1d" roughness={0.9} />
          </mesh>
        ))}

        {/* Pitched Roof (Mái ngói âm dương đỏ) */}
        <mesh position={[0, 3.4, 0]} rotation={[0, 0, 0]} castShadow>
          <coneGeometry args={[3.2, 1.4, 4]} />
          <meshStandardMaterial color="#a83917" roughness={0.82} />
        </mesh>

        {/* Stacks of unbaked raw bricks drying inside shed */}
        <mesh position={[-0.8, 0.45, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.6, 0.9, 1.8]} />
          <meshStandardMaterial color="#8c5835" roughness={0.95} />
        </mesh>
        <mesh position={[0.9, 0.55, 0.2]} castShadow receiveShadow>
          <boxGeometry args={[1.2, 1.1, 1.4]} />
          <meshStandardMaterial color="#945d39" roughness={0.95} />
        </mesh>
      </group>

      {/* Rows of finished terracotta ceramic jars (Lu gốm, khạp sành) stacked on ground */}
      <group position={[1.8, 0, 4.2]}>
        {[
          { x: 0, z: 0, r: 0.38, h: 0.72 },
          { x: 0.9, z: -0.2, r: 0.42, h: 0.8 },
          { x: 1.7, z: 0.1, r: 0.35, h: 0.65 },
          { x: 0.4, z: 0.8, r: 0.4, h: 0.75 },
          { x: 1.2, z: 0.7, r: 0.36, h: 0.7 },
        ].map((pot, idx) => (
          <group key={idx} position={[pot.x, 0, pot.z]}>
            {/* Urn belly */}
            <mesh position={[0, pot.h * 0.5, 0]} castShadow receiveShadow>
              <sphereGeometry args={[pot.r, 16, 16]} />
              <meshStandardMaterial color="#bf5326" roughness={0.7} />
            </mesh>
            {/* Urn neck/rim */}
            <mesh position={[0, pot.h * 0.85, 0]} castShadow>
              <cylinderGeometry args={[pot.r * 0.6, pot.r * 0.7, pot.h * 0.3, 16]} />
              <meshStandardMaterial color="#963714" roughness={0.75} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
