"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { KilnSmoke } from "./kiln-smoke";
import { Cat } from "../island/cat";

/**
 * Creates a cozy, warm, stylized terracotta texture
 * with soft friendly rings and warm baked clay hues.
 */
function createCuteKilnTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Soft warm terracotta gradient
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, "#732410"); // warm roasted top
  grad.addColorStop(0.18, "#b9421e");
  grad.addColorStop(0.5, "#d65327");
  grad.addColorStop(0.82, "#e26436");
  grad.addColorStop(1, "#c44c23");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 512);

  // Friendly soft brick course bands
  const rows = 32;
  const rowHeight = 512 / rows;
  for (let r = 0; r < rows; r++) {
    const y = r * rowHeight;
    ctx.strokeStyle = "rgba(70, 20, 10, 0.25)";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();

    // Subtle gentle hue highlights
    const bricks = 28;
    const bw = 1024 / bricks;
    const offset = (r % 2) * (bw * 0.5);
    for (let c = 0; c < bricks; c++) {
      const x = (c * bw + offset) % 1024;
      if (Math.sin(c * 13.5 + r * 7.2) > 0.3) {
        ctx.fillStyle = "rgba(255, 170, 120, 0.08)";
        ctx.fillRect(x + 2, y + 2, bw - 4, rowHeight - 4);
      }
    }
  }

  // Soft, cute cloudy efflorescence patches
  ctx.fillStyle = "rgba(255, 240, 225, 0.22)";
  for (let i = 0; i < 16; i++) {
    const cx = (i * 64 + 32) % 1024;
    const cy = 200 + Math.sin(i * 4.3) * 120;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 55, 45, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.repeat.set(2, 1);
  return texture;
}

/**
 * Chubby, round bell-shaped profile:
 * Plumper belly, soft rounded shoulders, cute donut collar rim.
 */
function getCuteKilnRadius(y: number, maxHeight: number, baseRadius: number): number {
  const normY = THREE.MathUtils.clamp(y / maxHeight, 0, 1);
  // Chubby cute bell curve: slight plump waist then smooth round taper
  const belly = Math.sin(normY * Math.PI * 0.9) * 0.2;
  const taper = Math.pow(normY, 1.45) * 0.72;
  return baseRadius * (1 + belly - taper);
}

export type KilnProps = {
  position?: [number, number, number];
  scale?: number;
  rotation?: [number, number, number];
  hasSmoke?: boolean;
  hasFire?: boolean;
  hasSpiralStairs?: boolean;
};

export function CutePotteryKiln({
  position = [0, 0, 0],
  scale = 1,
  rotation = [0, 0, 0],
  hasSmoke = true,
  hasFire = true,
  hasSpiralStairs = true,
}: KilnProps) {
  const fireLightRef = useRef<THREE.PointLight>(null!);

  const height = 7.6;
  const baseRadius = 3.4;

  // Chubby Lathe profile
  const lathePoints = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    const segments = 32;

    for (let i = 0; i <= segments; i++) {
      const y = (i / segments) * height;
      const r = getCuteKilnRadius(y, height, baseRadius);
      pts.push(new THREE.Vector2(r, y));
    }

    // Top rim lip
    pts.push(new THREE.Vector2(baseRadius * 0.32, height + 0.12));
    pts.push(new THREE.Vector2(baseRadius * 0.25, height + 0.12));
    // Inner shaft
    pts.push(new THREE.Vector2(baseRadius * 0.22, height - 0.9));

    return pts;
  }, [height, baseRadius]);

  // Cute rounded spiral stepping stones
  const spiralSteps = useMemo(() => {
    if (!hasSpiralStairs) return [];
    const steps: { pos: [number, number, number]; rotY: number; scale: number }[] = [];
    const count = 22;
    const startAngle = 0.35;
    const turns = 0.78;

    for (let i = 0; i < count; i++) {
      const frac = i / count;
      const y = 0.45 + frac * (height * 0.72);
      const angle = startAngle + frac * Math.PI * 2 * turns;
      const r = getCuteKilnRadius(y, height, baseRadius) + 0.16;

      steps.push({
        pos: [Math.cos(angle) * r, y, Math.sin(angle) * r],
        rotY: -angle + Math.PI / 2,
        scale: 0.95 - frac * 0.15,
      });
    }
    return steps;
  }, [hasSpiralStairs, height, baseRadius]);

  const kilnTexture = useMemo(() => {
    if (typeof window === "undefined") return null;
    return createCuteKilnTexture();
  }, []);

  // Soft cozy fire flicker
  useFrame((state) => {
    if (fireLightRef.current && hasFire) {
      const time = state.clock.getElapsedTime();
      const flicker = Math.sin(time * 9.0) * 0.2 + Math.cos(time * 16.0) * 0.15 + 1.0;
      fireLightRef.current.intensity = 2.2 * Math.max(0.7, flicker);
    }
  });

  return (
    <group position={position} scale={scale} rotation={rotation}>
      {/* Plump Bell Kiln Dome */}
      <mesh castShadow receiveShadow>
        <latheGeometry args={[lathePoints, 40]} />
        <meshStandardMaterial
          color="#d95427"
          map={kilnTexture || undefined}
          roughness={0.75}
          metalness={0.05}
        />
      </mesh>

      {/* Cute Rounded Donut Collar Rim on Chimney */}
      <mesh position={[0, height + 0.08, 0]} castShadow>
        <torusGeometry args={[baseRadius * 0.29, 0.18, 12, 28]} />
        <meshStandardMaterial color="#8a2e15" roughness={0.7} />
      </mesh>

      {/* Cute Rounded Stepping Stones Spiraling Up */}
      {hasSpiralStairs && (
        <group>
          {spiralSteps.map((step, idx) => (
            <mesh
              key={idx}
              position={step.pos}
              rotation={[0, step.rotY, 0]}
              scale={step.scale}
              castShadow
              receiveShadow
            >
              {/* Cute rounded disc stepping stone */}
              <cylinderGeometry args={[0.32, 0.36, 0.14, 14]} />
              <meshStandardMaterial color="#9c3a1c" roughness={0.8} />
            </mesh>
          ))}
        </group>
      )}

      {/* Arched Cute Combustion Doorway */}
      <group position={[0, 0.78, baseRadius * 0.96]}>
        {/* Dark interior chamber */}
        <mesh position={[0, 0, -0.4]}>
          <boxGeometry args={[1.4, 1.6, 1.0]} />
          <meshStandardMaterial color="#1f0e08" roughness={1.0} />
        </mesh>

        {/* Cute Arched Architrave Portal */}
        <mesh position={[-0.65, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.15, 0.16, 1.5, 10]} />
          <meshStandardMaterial color="#873016" roughness={0.75} />
        </mesh>
        <mesh position={[0.65, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.15, 0.16, 1.5, 10]} />
          <meshStandardMaterial color="#873016" roughness={0.75} />
        </mesh>
        {/* Rounded Top Arch */}
        <mesh position={[0, 0.78, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.15, 0.15, 1.3, 10]} />
          <meshStandardMaterial color="#73250f" roughness={0.75} />
        </mesh>

        {/* Cozy Warm Fireplace Glow & Glowing Coal Bed */}
        {hasFire && (
          <>
            <pointLight
              ref={fireLightRef}
              color="#ff7b1a"
              distance={6.0}
              decay={2}
              position={[0, 0.1, -0.2]}
              intensity={2.6}
            />
            {/* Glowing Embers */}
            <mesh position={[0, -0.65, -0.2]}>
              <boxGeometry args={[1.0, 0.16, 0.7]} />
              <meshStandardMaterial
                color="#ff4d00"
                emissive="#ff5e00"
                emissiveIntensity={2.5}
                roughness={0.5}
              />
            </mesh>
          </>
        )}

        {/* Cute Little Firewood Sticks by Door */}
        <mesh position={[-1.0, -0.62, 0.35]} rotation={[0, 0.35, 0.12]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.9, 8]} />
          <meshStandardMaterial color="#503527" roughness={0.85} />
        </mesh>
        <mesh position={[-1.08, -0.54, 0.38]} rotation={[0.2, -0.25, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 0.85, 8]} />
          <meshStandardMaterial color="#624231" roughness={0.85} />
        </mesh>
      </group>

      {/* Billowing Cute Marshmallow Smoke Puffs */}
      {hasSmoke && <KilnSmoke position={[0, height + 0.25, 0]} intensity={1.1} />}
    </group>
  );
}

/**
 * Chubby Ceramic Jar (Lu gốm chibi):
 * Plump round belly, flared neck, and two cute little side handles!
 */
export function CutePotteryJar({
  position = [0, 0, 0],
  scale = 1,
  color = "#df5c2c",
}: {
  position?: [number, number, number];
  scale?: number;
  color?: string;
}) {
  return (
    <group position={position} scale={scale}>
      {/* Plump Round Belly */}
      <mesh position={[0, 0.36, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.38, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.65} metalness={0.08} />
      </mesh>

      {/* Cute Flared Neck */}
      <mesh position={[0, 0.65, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.3, 0.22, 16]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* Collar Rim */}
      <mesh position={[0, 0.76, 0]} castShadow>
        <torusGeometry args={[0.24, 0.045, 8, 16]} />
        <meshStandardMaterial color="#913618" roughness={0.65} />
      </mesh>

      {/* Two Cute Little Ear-Handles */}
      <mesh position={[-0.34, 0.44, 0]} rotation={[0, 0, 0.3]} castShadow>
        <torusGeometry args={[0.09, 0.03, 8, 12]} />
        <meshStandardMaterial color="#913618" roughness={0.7} />
      </mesh>
      <mesh position={[0.34, 0.44, 0]} rotation={[0, 0, -0.3]} castShadow>
        <torusGeometry args={[0.09, 0.03, 8, 12]} />
        <meshStandardMaterial color="#913618" roughness={0.7} />
      </mesh>
    </group>
  );
}

/**
 * Cluster of Cute Mang Thit Kilns:
 * Adorable diorama landscape with chubby bell kilns, cute jars,
 * a cozy brick drying shed, and a friendly mascot cat enjoying the river view!
 */
export function MangThitKilnCluster() {
  return (
    <group position={[0, 0, 0]}>
      {/* Main Hero Chubby Kiln */}
      <CutePotteryKiln
        position={[-1.2, 0, 1.4]}
        scale={1.08}
        rotation={[0, -0.35, 0]}
        hasSmoke={true}
        hasFire={true}
        hasSpiralStairs={true}
      />

      {/* Secondary Cute Kiln (Right, friendly plump dome) */}
      <CutePotteryKiln
        position={[4.6, 0, -1.5]}
        scale={1.15}
        rotation={[0, 0.65, 0]}
        hasSmoke={true}
        hasFire={true}
        hasSpiralStairs={true}
      />

      {/* Third Cute Kiln (Back left) */}
      <CutePotteryKiln
        position={[-5.8, 0, -2.8]}
        scale={0.94}
        rotation={[0, 1.1, 0]}
        hasSmoke={true}
        hasFire={false}
        hasSpiralStairs={false}
      />

      {/* Fourth Cute Kiln (Far right background) */}
      <CutePotteryKiln
        position={[9.0, 0, -5.2]}
        scale={0.88}
        rotation={[0, -0.7, 0]}
        hasSmoke={false}
        hasFire={false}
        hasSpiralStairs={false}
      />

      {/* Fifth Cute Kiln (Far center-back) */}
      <CutePotteryKiln
        position={[0.6, 0, -7.0]}
        scale={0.92}
        rotation={[0, 0.4, 0]}
        hasSmoke={true}
        hasFire={false}
        hasSpiralStairs={false}
      />

      {/* Cozy Chibi Brick Drying Shed (Nhà chứa gạch mộc chibi) */}
      <group position={[-5.4, 0, 2.6]} rotation={[0, 0.22, 0]}>
        {/* Chunky rounded wooden pillars */}
        {[
          [-1.8, -1.4],
          [-1.8, 1.4],
          [1.8, -1.4],
          [1.8, 1.4],
        ].map(([px, pz], i) => (
          <mesh key={i} position={[px, 1.25, pz]} castShadow receiveShadow>
            <cylinderGeometry args={[0.12, 0.14, 2.5, 8]} />
            <meshStandardMaterial color="#5a3825" roughness={0.85} />
          </mesh>
        ))}

        {/* Cute Pitched Terracotta Roof with rounded overhang */}
        <mesh position={[0, 2.9, 0]} rotation={[0, 0, 0]} castShadow>
          <coneGeometry args={[2.8, 1.35, 4]} />
          <meshStandardMaterial color="#c24823" roughness={0.7} />
        </mesh>

        {/* Cute stacks of miniature toy bricks drying inside */}
        <mesh position={[-0.6, 0.42, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.4, 0.8, 1.5]} />
          <meshStandardMaterial color="#b8532b" roughness={0.85} />
        </mesh>
        <mesh position={[0.7, 0.52, 0.2]} castShadow receiveShadow>
          <boxGeometry args={[1.1, 1.0, 1.2]} />
          <meshStandardMaterial color="#c75c32" roughness={0.85} />
        </mesh>

        {/* Adorable friendly Cat loafing on top of the brick stack! */}
        <group position={[-0.6, 0.82, 0.2]} scale={1.2}>
          <Cat />
        </group>
      </group>

      {/* Cute Chubby Ceramic Jars Stacked on Ground */}
      <group position={[2.0, 0, 4.0]}>
        <CutePotteryJar position={[0, 0, 0]} scale={1.05} color="#e66333" />
        <CutePotteryJar position={[0.85, 0, -0.25]} scale={1.15} color="#d95427" />
        <CutePotteryJar position={[1.65, 0, 0.1]} scale={0.92} color="#ec7042" />
        <CutePotteryJar position={[0.45, 0, 0.75]} scale={1.0} color="#de5b2c" />
        <CutePotteryJar position={[1.25, 0, 0.65]} scale={0.96} color="#e66333" />
      </group>
    </group>
  );
}
