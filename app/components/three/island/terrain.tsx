"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { getRig } from "./lighting";
import { boot } from "./boot";

/** Low-poly pine tree with vibrant green foliage */
export function PineTree({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      {/* Trunk */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.08, 0.12, 0.8, 5]} />
        <meshStandardMaterial color="#5c3f2b" roughness={0.9} flatShading />
      </mesh>
      {/* 3 tiered foliage cones */}
      <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
        <coneGeometry args={[0.55, 0.7, 5]} />
        <meshStandardMaterial color="#2e7d32" roughness={0.7} flatShading />
      </mesh>
      <mesh position={[0, 1.3, 0]} castShadow receiveShadow>
        <coneGeometry args={[0.45, 0.65, 5]} />
        <meshStandardMaterial color="#388e3c" roughness={0.7} flatShading />
      </mesh>
      <mesh position={[0, 1.65, 0]} castShadow receiveShadow>
        <coneGeometry args={[0.32, 0.55, 5]} />
        <meshStandardMaterial color="#4caf50" roughness={0.7} flatShading />
      </mesh>
    </group>
  );
}

/** Low-poly deciduous / sakura tree */
export function RoundTree({
  position,
  scale = 1,
  foliageColor = "#43a047",
}: {
  position: [number, number, number];
  scale?: number;
  foliageColor?: string;
}) {
  return (
    <group position={position} scale={scale}>
      {/* Trunk */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.09, 0.14, 1.0, 5]} />
        <meshStandardMaterial color="#553926" roughness={0.9} flatShading />
      </mesh>
      {/* Clustered foliage */}
      <mesh position={[0, 1.25, 0]} castShadow receiveShadow>
        <dodecahedronGeometry args={[0.65, 1]} />
        <meshStandardMaterial color={foliageColor} roughness={0.75} flatShading />
      </mesh>
      <mesh position={[0.22, 1.45, 0.15]} castShadow receiveShadow>
        <dodecahedronGeometry args={[0.42, 1]} />
        <meshStandardMaterial color={foliageColor} roughness={0.75} flatShading />
      </mesh>
      <mesh position={[-0.2, 1.15, -0.2]} castShadow receiveShadow>
        <dodecahedronGeometry args={[0.45, 1]} />
        <meshStandardMaterial color={foliageColor} roughness={0.75} flatShading />
      </mesh>
    </group>
  );
}

/** Little low-poly flower blossoms scattered on the lawn */
function FlowerPatch({
  position,
  color = "#facc15",
}: {
  position: [number, number, number];
  color?: string;
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.08, 4]} />
        <meshStandardMaterial color="#4ade80" />
      </mesh>
      <mesh position={[0, 0.09, 0]}>
        <dodecahedronGeometry args={[0.045, 0]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
    </group>
  );
}

/** Low-poly street lamp with warm glowing lantern at night */
export function StreetLamp({
  position,
  rotation = [0, 0, 0],
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  const lightRef = useRef<THREE.PointLight>(null!);
  const glowRef = useRef<THREE.MeshStandardMaterial>(null!);
  const rig = getRig();

  useFrame(() => {
    const b = boot.value;
    const factor = rig.neon * b;
    if (lightRef.current) {
      lightRef.current.intensity = factor * 1.6;
    }
    if (glowRef.current) {
      glowRef.current.emissiveIntensity = factor * 2.4;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Pole */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.05, 1.2, 5]} />
        <meshStandardMaterial color="#334155" roughness={0.6} metalness={0.6} />
      </mesh>
      {/* Arm */}
      <mesh position={[0.12, 1.18, 0]} rotation={[0, 0, -Math.PI / 4]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 0.35, 4]} />
        <meshStandardMaterial color="#334155" roughness={0.6} metalness={0.6} />
      </mesh>
      {/* Lantern cap */}
      <mesh position={[0.24, 1.3, 0]} castShadow>
        <coneGeometry args={[0.09, 0.08, 5]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} metalness={0.7} />
      </mesh>
      {/* Glowing bulb */}
      <mesh position={[0.24, 1.23, 0]}>
        <sphereGeometry args={[0.05, 6, 6]} />
        <meshStandardMaterial
          ref={glowRef}
          color="#fef08a"
          emissive="#f59e0b"
          emissiveIntensity={rig.neon * 2.4}
          roughness={0.2}
        />
      </mesh>
      <pointLight
        ref={lightRef}
        position={[0.24, 1.2, 0]}
        color="#f59e0b"
        intensity={rig.neon * 1.6}
        distance={4}
        decay={2}
      />
    </group>
  );
}

/** Little floating satellite rock with tiny crystal */
function SatelliteRock({
  position,
  scale = 1,
  orbitRadius,
  speed = 0.1,
  initialAngle = 0,
}: {
  position: [number, number, number];
  scale?: number;
  orbitRadius?: number;
  speed?: number;
  initialAngle?: number;
}) {
  const group = useRef<THREE.Group>(null!);
  const angle = useRef(initialAngle);

  useFrame((state, delta) => {
    if (orbitRadius && group.current) {
      angle.current += speed * delta;
      group.current.position.x = Math.cos(angle.current) * orbitRadius;
      group.current.position.z = Math.sin(angle.current) * orbitRadius;
      group.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 0.8 + initialAngle) * 0.25;
    }
  });

  return (
    <group ref={group} position={position} scale={scale}>
      <mesh castShadow receiveShadow>
        <dodecahedronGeometry args={[0.7, 0]} />
        <meshStandardMaterial color="#554b44" roughness={0.9} flatShading />
      </mesh>
      <mesh position={[0, -0.6, 0]} castShadow receiveShadow>
        <coneGeometry args={[0.65, 1.1, 5]} />
        <meshStandardMaterial color="#433b35" roughness={0.95} flatShading />
      </mesh>
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.65, 0.7, 0.25, 6]} />
        <meshStandardMaterial color="#56b64e" roughness={0.8} flatShading />
      </mesh>
      {/* Glowing floating crystal */}
      <mesh position={[0.1, 0.78, 0.1]}>
        <octahedronGeometry args={[0.22, 0]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#0284c7"
          emissiveIntensity={0.9}
          roughness={0.1}
        />
      </mesh>
    </group>
  );
}

/** Central plaza with fountain and circular pavement */
function CentralPlaza() {
  const waterRef = useRef<THREE.MeshStandardMaterial>(null!);

  useFrame((state) => {
    if (waterRef.current) {
      waterRef.current.roughness = 0.1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  return (
    <group position={[0, 0.02, 0]}>
      {/* Cobblestone outer plaza disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[0, 2.2, 24]} />
        <meshStandardMaterial color="#e2dcd2" roughness={0.85} />
      </mesh>
      {/* Decorative plaza border ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} receiveShadow>
        <ringGeometry args={[2.0, 2.25, 24]} />
        <meshStandardMaterial color="#8c7e72" roughness={0.85} />
      </mesh>
      {/* Inner star mosaic */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <ringGeometry args={[0, 1.15, 16]} />
        <meshStandardMaterial color="#c8beaf" roughness={0.8} />
      </mesh>

      {/* Low-poly fountain basin */}
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.78, 0.88, 0.35, 12]} />
        <meshStandardMaterial color="#9c9288" roughness={0.75} flatShading />
      </mesh>
      {/* Fountain water */}
      <mesh position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.7, 0.7, 0.05, 12]} />
        <meshStandardMaterial
          ref={waterRef}
          color="#38bdf8"
          roughness={0.1}
          metalness={0.3}
          transparent
          opacity={0.88}
        />
      </mesh>
      {/* Fountain central pillar */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.24, 0.45, 8]} />
        <meshStandardMaterial color="#786f67" roughness={0.75} flatShading />
      </mesh>
      {/* Floating fountain crystal prism */}
      <mesh position={[0, 0.78, 0]} castShadow>
        <dodecahedronGeometry args={[0.18, 0]} />
        <meshStandardMaterial
          color="#67e8f9"
          emissive="#06b6d4"
          emissiveIntensity={0.8}
          roughness={0.15}
        />
      </mesh>
    </group>
  );
}

/**
 * Main floating island terrain with vibrant meadow grass,
 * stratified warm rock underside, cobblestone paths, and lively nature.
 */
export function IslandTerrain() {
  const roads = useMemo(() => {
    return [
      {
        pos: [-1.7, 0.012, 1.15] as [number, number, number],
        rot: Math.atan2(2.3, -3.4) + Math.PI / 2,
        len: 3.8,
      },
      {
        pos: [1.6, 0.012, 1.4] as [number, number, number],
        rot: Math.atan2(2.8, 3.2) + Math.PI / 2,
        len: 3.9,
      },
      {
        pos: [1.8, 0.012, -0.55] as [number, number, number],
        rot: Math.atan2(-1.1, 3.6) + Math.PI / 2,
        len: 3.5,
      },
      {
        pos: [-1.6, 0.012, -1.1] as [number, number, number],
        rot: Math.atan2(-2.2, -3.2) + Math.PI / 2,
        len: 3.6,
      },
      {
        pos: [0.1, 0.012, -2.15] as [number, number, number],
        rot: Math.atan2(-4.3, 0.2) + Math.PI / 2,
        len: 4.1,
      },
    ];
  }, []);

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Underside Floating Rock: stratified warm earthy rock facets */}
      <mesh position={[0, -1.6, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[6.8, 2.2, 3.2, 14, 2]} />
        <meshStandardMaterial color="#554b43" roughness={0.92} flatShading />
      </mesh>
      {/* Bottom stalactite crags */}
      <mesh position={[0, -3.8, 0]} castShadow receiveShadow>
        <coneGeometry args={[2.4, 2.8, 9]} />
        <meshStandardMaterial color="#423a34" roughness={0.95} flatShading />
      </mesh>
      <mesh position={[-1.2, -3.4, 0.8]} castShadow receiveShadow>
        <coneGeometry args={[1.2, 2.2, 7]} />
        <meshStandardMaterial color="#3a332d" roughness={0.95} flatShading />
      </mesh>
      <mesh position={[1.5, -3.1, -0.9]} castShadow receiveShadow>
        <coneGeometry args={[1.4, 2.0, 7]} />
        <meshStandardMaterial color="#38312b" roughness={0.95} flatShading />
      </mesh>
      <mesh position={[-0.8, -2.8, -1.4]} castShadow receiveShadow>
        <coneGeometry args={[1.0, 1.8, 6]} />
        <meshStandardMaterial color="#3f3731" roughness={0.95} flatShading />
      </mesh>

      {/* 2. Top Grass Surface Layer: Lush, vibrant, sunny meadow green */}
      <mesh position={[0, 0.0, 0]} receiveShadow>
        <cylinderGeometry args={[6.85, 6.8, 0.4, 24]} />
        <meshStandardMaterial color="#56b64e" roughness={0.82} flatShading />
      </mesh>
      {/* Gentle terraced hills */}
      <mesh position={[-3.2, 0.15, 2.1]} receiveShadow>
        <cylinderGeometry args={[2.2, 2.5, 0.3, 10]} />
        <meshStandardMaterial color="#62c458" roughness={0.82} flatShading />
      </mesh>
      <mesh position={[3.2, 0.15, 2.6]} receiveShadow>
        <cylinderGeometry args={[2.3, 2.6, 0.3, 10]} />
        <meshStandardMaterial color="#62c458" roughness={0.82} flatShading />
      </mesh>
      <mesh position={[3.5, 0.15, -1.1]} receiveShadow>
        <cylinderGeometry args={[2.4, 2.7, 0.3, 10]} />
        <meshStandardMaterial color="#5cb854" roughness={0.82} flatShading />
      </mesh>
      <mesh position={[-3.1, 0.15, -2.1]} receiveShadow>
        <cylinderGeometry args={[2.2, 2.5, 0.3, 10]} />
        <meshStandardMaterial color="#5ebb55" roughness={0.82} flatShading />
      </mesh>
      <mesh position={[0.2, 0.15, -4.0]} receiveShadow>
        <cylinderGeometry args={[2.0, 2.3, 0.3, 10]} />
        <meshStandardMaterial color="#5ab652" roughness={0.82} flatShading />
      </mesh>

      {/* 3. Central Plaza & Cobblestone Roads */}
      <CentralPlaza />
      {roads.map((r, i) => (
        <mesh key={i} position={r.pos} rotation={[-Math.PI / 2, 0, r.rot]} receiveShadow>
          <planeGeometry args={[0.75, r.len]} />
          <meshStandardMaterial color="#dcd4c5" roughness={0.88} />
        </mesh>
      ))}

      {/* 4. Street Lamps */}
      <StreetLamp position={[-1.3, 0.2, 0.9]} rotation={[0, 0.7, 0]} />
      <StreetLamp position={[1.3, 0.2, 1.1]} rotation={[0, -0.6, 0]} />
      <StreetLamp position={[1.4, 0.2, -0.6]} rotation={[0, -1.8, 0]} />
      <StreetLamp position={[-1.2, 0.2, -1.0]} rotation={[0, 2.2, 0]} />
      <StreetLamp position={[0.4, 0.2, -1.8]} rotation={[0, 3.1, 0]} />

      {/* 5. Trees & Nature */}
      <PineTree position={[-4.8, 0.2, 0.5]} scale={1.2} />
      <PineTree position={[-4.5, 0.2, -0.4]} scale={0.9} />
      <PineTree position={[0.8, 0.2, 4.6]} scale={1.1} />
      <PineTree position={[-0.6, 0.2, 4.8]} scale={0.85} />
      <PineTree position={[4.6, 0.2, 0.8]} scale={1.15} />
      <PineTree position={[4.8, 0.2, -2.8]} scale={1.0} />
      <PineTree position={[-1.6, 0.2, -4.5]} scale={1.1} />
      <PineTree position={[1.8, 0.2, -4.3]} scale={0.95} />

      <RoundTree position={[-0.8, 0.2, 4.6]} scale={0.9} foliageColor="#52b756" />
      <RoundTree position={[2.2, 0.2, 4.0]} scale={0.9} foliageColor="#4cae50" />
      <RoundTree position={[4.8, 0.2, 2.0]} scale={0.85} foliageColor="#43a047" />
      <RoundTree position={[-4.6, 0.2, -3.2]} scale={1.05} foliageColor="#5cb860" />

      {/* 6. Colorful wildflower patches */}
      <FlowerPatch position={[-2.6, 0.2, 1.8]} color="#facc15" />
      <FlowerPatch position={[-2.8, 0.2, 1.5]} color="#f472b6" />
      <FlowerPatch position={[-2.4, 0.2, 2.1]} color="#ffffff" />
      <FlowerPatch position={[2.4, 0.2, 2.2]} color="#facc15" />
      <FlowerPatch position={[2.7, 0.2, 2.0]} color="#38bdf8" />
      <FlowerPatch position={[-1.8, 0.2, -2.8]} color="#f472b6" />
      <FlowerPatch position={[-2.2, 0.2, -2.9]} color="#facc15" />
      <FlowerPatch position={[1.2, 0.2, -3.6]} color="#ffffff" />

      {/* 7. Orbiting Satellite rocks */}
      <SatelliteRock
        position={[-9, -1.5, 3]}
        scale={1.1}
        orbitRadius={9.5}
        speed={0.06}
        initialAngle={0.5}
      />
      <SatelliteRock
        position={[8.5, -2.0, -4]}
        scale={0.85}
        orbitRadius={9}
        speed={0.075}
        initialAngle={2.6}
      />
      <SatelliteRock
        position={[2, -3.0, 8.5]}
        scale={0.95}
        orbitRadius={8.8}
        speed={0.05}
        initialAngle={4.5}
      />
    </group>
  );
}
