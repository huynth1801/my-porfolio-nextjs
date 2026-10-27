"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { getDayPhase } from "./lighting";

const SKY_COLORS = {
  day: "#68b2e8",
  golden: "#d67a4e",
  night: "#080c1e",
};

const FOG_DENSITY = {
  day: 0.015,
  golden: 0.018,
  night: 0.022,
};

/** Low-poly fluffy cloud made of merged spheres/boxes */
function LowPolyCloud({
  position,
  scale = 1,
  speed = 0.08,
  radius = 14,
  initialAngle = 0,
}: {
  position?: [number, number, number];
  scale?: number;
  speed?: number;
  radius?: number;
  initialAngle?: number;
}) {
  const group = useRef<THREE.Group>(null!);
  const angle = useRef(initialAngle);
  const y = position ? position[1] : 4;
  const isNight = getDayPhase() === "night";

  useFrame((_, delta) => {
    angle.current += speed * delta;
    if (group.current) {
      group.current.position.x = Math.cos(angle.current) * radius;
      group.current.position.z = Math.sin(angle.current) * radius;
      group.current.position.y = y + Math.sin(angle.current * 2) * 0.4;
    }
  });

  const cloudColor = isNight ? "#1c223c" : "#ffffff";

  return (
    <group ref={group} scale={scale}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[1.2, 7, 6]} />
        <meshStandardMaterial color={cloudColor} roughness={0.9} flatShading />
      </mesh>
      <mesh position={[0.9, -0.15, 0.2]} castShadow receiveShadow>
        <sphereGeometry args={[0.9, 7, 6]} />
        <meshStandardMaterial color={cloudColor} roughness={0.9} flatShading />
      </mesh>
      <mesh position={[-0.9, -0.2, -0.1]} castShadow receiveShadow>
        <sphereGeometry args={[0.85, 7, 6]} />
        <meshStandardMaterial color={cloudColor} roughness={0.9} flatShading />
      </mesh>
      <mesh position={[0.2, 0.4, -0.3]} castShadow receiveShadow>
        <sphereGeometry args={[0.8, 7, 6]} />
        <meshStandardMaterial color={cloudColor} roughness={0.9} flatShading />
      </mesh>
      <mesh position={[-0.4, 0.35, 0.3]} castShadow receiveShadow>
        <sphereGeometry args={[0.7, 7, 6]} />
        <meshStandardMaterial color={cloudColor} roughness={0.9} flatShading />
      </mesh>
    </group>
  );
}

/** Deterministic pseudo-random float 0..1 based on seed index */
function seeded(index: number, salt: number): number {
  const x = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/** Starlight dust field active during night phase */
function NightStars({ count = 180 }: { count?: number }) {
  const isNight = getDayPhase() === "night";
  const isGolden = getDayPhase() === "golden";
  const matRef = useRef<THREE.ShaderMaterial>(null!);

  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const phase = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const theta = seeded(i, 1) * Math.PI * 2;
      const phi = Math.acos(2 * seeded(i, 2) - 1);
      const r = 24 + seeded(i, 3) * 20;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = Math.abs(r * Math.cos(phi)) + 1; // keep above horizon
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      phase[i] = seeded(i, 4) * Math.PI * 2;
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geom.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));

    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uOpacity: { value: isNight ? 0.9 : isGolden ? 0.25 : 0 } },
      vertexShader: /* glsl */ `
        uniform float uTime;
        attribute float aPhase;
        varying float vAlpha;
        void main() {
          vec3 pos = position;
          vec4 mv = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = (1.4 + fract(aPhase * 3.1) * 2.2) * (18.0 / -mv.z);
          vAlpha = 0.35 + 0.65 * sin(uTime * 1.5 + aPhase * 4.0);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uOpacity;
        varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.05, d) * vAlpha * uOpacity;
          if (a < 0.01) discard;
          gl_FragColor = vec4(vec3(0.9, 0.95, 1.0), a);
        }
      `,
    });
    return { geometry: geom, material: mat };
  }, [count, isNight, isGolden]);

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <points args={[geometry]} frustumCulled={false}>
      <primitive object={material} ref={matRef} attach="material" />
    </points>
  );
}

export function IslandEnvironment() {
  const phase = getDayPhase();
  const skyColor = SKY_COLORS[phase];
  const fogDensity = FOG_DENSITY[phase];

  return (
    <>
      <color attach="background" args={[skyColor]} />
      <fogExp2 attach="fog" args={[skyColor, fogDensity]} />

      {/* Dynamic drifting low-poly clouds */}
      <LowPolyCloud scale={1.3} speed={0.035} radius={18} initialAngle={0.4} position={[0, 4.5, 0]} />
      <LowPolyCloud scale={0.9} speed={0.045} radius={15} initialAngle={2.1} position={[0, 2.8, 0]} />
      <LowPolyCloud scale={1.5} speed={0.028} radius={21} initialAngle={4.2} position={[0, 6.2, 0]} />
      <LowPolyCloud scale={0.8} speed={0.05} radius={13} initialAngle={5.3} position={[0, 1.6, 0]} />
      <LowPolyCloud scale={1.1} speed={0.038} radius={17} initialAngle={1.2} position={[0, -2.5, 0]} />

      {/* Starlight dust particles */}
      <NightStars count={160} />
    </>
  );
}
