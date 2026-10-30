"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { phaseStore } from "./lighting";

const SKY_COLORS = {
  day: "#5ea5e6",
  golden: "#d97445",
  rain: "#334155",
  night: "#0a0e24",
};

const FOG_DENSITY = {
  day: 0.012,
  golden: 0.015,
  rain: 0.024,
  night: 0.018,
};

/**
 * Beautiful stylized low-poly fluffy cloud.
 * Self-illuminated with soft emissive glow so it never renders as a dark/gray rock.
 */
function FluffyCloud({
  scale = 1,
  speed = 0.05,
  radius = 16,
  initialAngle = 0,
  y = 4,
}: {
  scale?: number;
  speed?: number;
  radius?: number;
  initialAngle?: number;
  y?: number;
}) {
  const group = useRef<THREE.Group>(null!);
  const angle = useRef(initialAngle);

  useFrame((_, delta) => {
    angle.current += speed * delta;
    if (group.current) {
      group.current.position.x = Math.cos(angle.current) * radius;
      group.current.position.z = Math.sin(angle.current) * radius;
      group.current.position.y = y + Math.sin(angle.current * 1.5) * 0.35;
    }
  });

  return (
    <group ref={group} scale={scale}>
      {/* Central big puff */}
      <mesh>
        <sphereGeometry args={[1.3, 10, 8]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.5}
          roughness={0.4}
          flatShading
        />
      </mesh>
      {/* Side puffs */}
      <mesh position={[1.0, -0.15, 0.2]}>
        <sphereGeometry args={[0.95, 8, 7]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.5}
          roughness={0.4}
          flatShading
        />
      </mesh>
      <mesh position={[-1.0, -0.2, -0.1]}>
        <sphereGeometry args={[0.9, 8, 7]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.5}
          roughness={0.4}
          flatShading
        />
      </mesh>
      <mesh position={[0.2, 0.45, -0.3]}>
        <sphereGeometry args={[0.85, 8, 7]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.5}
          roughness={0.4}
          flatShading
        />
      </mesh>
      <mesh position={[-0.45, 0.4, 0.35]}>
        <sphereGeometry args={[0.75, 8, 7]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.5}
          roughness={0.4}
          flatShading
        />
      </mesh>
    </group>
  );
}

/** Little whimsical low-poly hot air balloon drifting peacefully around the island */
function HotAirBalloon() {
  const balloonRef = useRef<THREE.Group>(null!);
  const angle = useRef(3.8);

  useFrame((state, delta) => {
    angle.current += 0.025 * delta;
    if (balloonRef.current) {
      balloonRef.current.position.x = Math.cos(angle.current) * 13;
      balloonRef.current.position.z = Math.sin(angle.current) * 13;
      balloonRef.current.position.y = 5.2 + Math.sin(state.clock.elapsedTime * 0.8) * 0.25;
      balloonRef.current.rotation.y = -angle.current + Math.PI / 2;
    }
  });

  return (
    <group ref={balloonRef} scale={0.75}>
      <mesh position={[0, 0.9, 0]}>
        <sphereGeometry args={[0.7, 12, 10]} />
        <meshStandardMaterial color="#f43f5e" roughness={0.5} flatShading />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <coneGeometry args={[0.55, 0.6, 12]} />
        <meshStandardMaterial color="#38bdf8" roughness={0.5} flatShading />
      </mesh>
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[0.22, 0.18, 0.22]} />
        <meshStandardMaterial color="#854d0e" roughness={0.8} />
      </mesh>
      {[-0.08, 0.08].map((x) =>
        [-0.08, 0.08].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 0.12, z]}>
            <cylinderGeometry args={[0.008, 0.008, 0.35, 3]} />
            <meshStandardMaterial color="#d4d4d8" roughness={0.6} />
          </mesh>
        )),
      )}
    </group>
  );
}

function seeded(index: number, salt: number): number {
  const x = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/** Starlight dust field active during night phase */
function NightStars({ count = 200 }: { count?: number }) {
  const matRef = useRef<THREE.ShaderMaterial>(null!);
  const opacityRef = useRef(0);

  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const phase = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const theta = seeded(i, 1) * Math.PI * 2;
      const phi = Math.acos(2 * seeded(i, 2) - 1);
      const r = 26 + seeded(i, 3) * 22;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = Math.abs(r * Math.cos(phi)) + 1.2;
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
      uniforms: { uTime: { value: 0 }, uOpacity: { value: 0 } },
      vertexShader: /* glsl */ `
        uniform float uTime;
        attribute float aPhase;
        varying float vAlpha;
        void main() {
          vec3 pos = position;
          vec4 mv = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = (1.5 + fract(aPhase * 3.1) * 2.5) * (20.0 / -mv.z);
          vAlpha = 0.4 + 0.6 * sin(uTime * 1.6 + aPhase * 4.0);
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
          gl_FragColor = vec4(vec3(0.92, 0.96, 1.0), a);
        }
      `,
    });
    return { geometry: geom, material: mat };
  }, [count]);

  useFrame((state, delta) => {
    const phase = phaseStore.get();
    const targetOpacity = phase === "night" ? 0.95 : phase === "golden" ? 0.3 : 0;
    opacityRef.current += (targetOpacity - opacityRef.current) * Math.min(1, delta * 3.0);

    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      matRef.current.uniforms.uOpacity.value = opacityRef.current;
    }
  });

  return (
    <points args={[geometry]} frustumCulled={false}>
      <primitive object={material} ref={matRef} attach="material" />
    </points>
  );
}

export function IslandEnvironment() {
  const bgRef = useRef<THREE.Color>(null!);
  const fogRef = useRef<THREE.FogExp2>(null!);
  const curColor = useRef(new THREE.Color(SKY_COLORS[phaseStore.get()]));

  useFrame((_, delta) => {
    const phase = phaseStore.get();
    const targetHex = SKY_COLORS[phase];
    curColor.current.lerp(new THREE.Color(targetHex), Math.min(1, delta * 3.0));

    if (bgRef.current) {
      bgRef.current.copy(curColor.current);
    }
    if (fogRef.current) {
      fogRef.current.color.copy(curColor.current);
      fogRef.current.density = FOG_DENSITY[phase];
    }
  });

  const initColor = SKY_COLORS[phaseStore.get()];
  const initFog = FOG_DENSITY[phaseStore.get()];

  return (
    <>
      <color ref={bgRef} attach="background" args={[initColor]} />
      <fogExp2 ref={fogRef} attach="fog" args={[initColor, initFog]} />

      {/* Radiant, fluffy marshmallow white clouds */}
      <FluffyCloud scale={1.25} speed={0.032} radius={18} initialAngle={0.4} y={5.2} />
      <FluffyCloud scale={0.9} speed={0.042} radius={15} initialAngle={2.1} y={3.6} />
      <FluffyCloud scale={1.4} speed={0.026} radius={21} initialAngle={3.8} y={6.5} />
      <FluffyCloud scale={0.85} speed={0.048} radius={14} initialAngle={5.1} y={2.4} />
      <FluffyCloud scale={1.1} speed={0.035} radius={17} initialAngle={1.3} y={-1.8} />

      {/* Whimsical hot-air balloon */}
      <HotAirBalloon />

      {/* Twinkling stardust at night */}
      <NightStars count={180} />
    </>
  );
}
