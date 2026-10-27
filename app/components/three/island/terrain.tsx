"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { getRig } from "./lighting";
import { boot } from "./boot";

/** Low-poly pine tree */
export function PineTree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      {/* Trunk */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.08, 0.12, 0.8, 5]} />
        <meshStandardMaterial color="#533827" roughness={0.9} flatShading />
      </mesh>
      {/* 3 tiered foliage cones */}
      <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
        <coneGeometry args={[0.55, 0.7, 5]} />
        <meshStandardMaterial color="#2d6338" roughness={0.8} flatShading />
      </mesh>
      <mesh position={[0, 1.3, 0]} castShadow receiveShadow>
        <coneGeometry args={[0.45, 0.65, 5]} />
        <meshStandardMaterial color="#357442" roughness={0.8} flatShading />
      </mesh>
      <mesh position={[0, 1.65, 0]} castShadow receiveShadow>
        <coneGeometry args={[0.32, 0.55, 5]} />
        <meshStandardMaterial color="#428c50" roughness={0.8} flatShading />
      </mesh>
    </group>
  );
}

/** Low-poly round deciduous / sakura tree */
export function RoundTree({
  position,
  scale = 1,
  foliageColor = "#3d8847",
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
        <meshStandardMaterial color="#4e3629" roughness={0.9} flatShading />
      </mesh>
      {/* Clustered foliage */}
      <mesh position={[0, 1.25, 0]} castShadow receiveShadow>
        <dodecahedronGeometry args={[0.65, 1]} />
        <meshStandardMaterial color={foliageColor} roughness={0.8} flatShading />
      </mesh>
      <mesh position={[0.22, 1.45, 0.15]} castShadow receiveShadow>
        <dodecahedronGeometry args={[0.42, 1]} />
        <meshStandardMaterial color={foliageColor} roughness={0.8} flatShading />
      </mesh>
      <mesh position={[-0.2, 1.15, -0.2]} castShadow receiveShadow>
        <dodecahedronGeometry args={[0.45, 1]} />
        <meshStandardMaterial color={foliageColor} roughness={0.8} flatShading />
      </mesh>
    </group>
  );
}

/** Low-poly street lamp with warm glowing lantern at night */
export function StreetLamp({ position, rotation = [0, 0, 0] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  const lightRef = useRef<THREE.PointLight>(null!);
  const glowRef = useRef<THREE.MeshStandardMaterial>(null!);
  const rig = getRig();

  useFrame(() => {
    const b = boot.value;
    const factor = rig.neon * b;
    if (lightRef.current) {
      lightRef.current.intensity = factor * 1.5;
    }
    if (glowRef.current) {
      glowRef.current.emissiveIntensity = factor * 2.2;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Pole */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.05, 1.2, 5]} />
        <meshStandardMaterial color="#2d3238" roughness={0.6} metalness={0.6} />
      </mesh>
      {/* Arm */}
      <mesh position={[0.12, 1.18, 0]} rotation={[0, 0, -Math.PI / 4]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 0.35, 4]} />
        <meshStandardMaterial color="#2d3238" roughness={0.6} metalness={0.6} />
      </mesh>
      {/* Lantern cap */}
      <mesh position={[0.24, 1.3, 0]} castShadow>
        <coneGeometry args={[0.09, 0.08, 5]} />
        <meshStandardMaterial color="#1f2329" roughness={0.6} metalness={0.7} />
      </mesh>
      {/* Glowing bulb */}
      <mesh position={[0.24, 1.23, 0]}>
        <sphereGeometry args={[0.05, 6, 6]} />
        <meshStandardMaterial
          ref={glowRef}
          color="#ffe8a3"
          emissive="#ffba42"
          emissiveIntensity={rig.neon * 2.2}
          roughness={0.2}
        />
      </mesh>
      {/* Local warm point light at night */}
      <pointLight ref={lightRef} position={[0.24, 1.2, 0]} color="#ffba54" intensity={rig.neon * 1.5} distance={3.5} decay={2} />
    </group>
  );
}

/** Little floating satellite rock with tiny crystal or tree */
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
      group.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8 + initialAngle) * 0.2;
    }
  });

  return (
    <group ref={group} position={position} scale={scale}>
      <mesh castShadow receiveShadow>
        <dodecahedronGeometry args={[0.7, 0]} />
        <meshStandardMaterial color="#473e38" roughness={0.9} flatShading />
      </mesh>
      <mesh position={[0, -0.6, 0]} castShadow receiveShadow>
        <coneGeometry args={[0.65, 1.1, 5]} />
        <meshStandardMaterial color="#37302b" roughness={0.95} flatShading />
      </mesh>
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.65, 0.7, 0.25, 6]} />
        <meshStandardMaterial color="#458245" roughness={0.8} flatShading />
      </mesh>
      {/* Tiny crystal on top */}
      <mesh position={[0.1, 0.75, 0.1]}>
        <octahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial color="#6be4ff" emissive="#26a8d6" emissiveIntensity={0.8} roughness={0.1} />
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
        <meshStandardMaterial color="#d1c7b7" roughness={0.9} />
      </mesh>
      {/* Decorative plaza border ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} receiveShadow>
        <ringGeometry args={[2.0, 2.2, 24]} />
        <meshStandardMaterial color="#7a6e65" roughness={0.9} />
      </mesh>
      {/* Inner circular compass / star mosaic */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <ringGeometry args={[0, 1.1, 16]} />
        <meshStandardMaterial color="#b8aba0" roughness={0.85} />
      </mesh>

      {/* Low-poly fountain basin */}
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.75, 0.85, 0.35, 12]} />
        <meshStandardMaterial color="#887f77" roughness={0.8} flatShading />
      </mesh>
      {/* Fountain water */}
      <mesh position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.68, 0.68, 0.05, 12]} />
        <meshStandardMaterial ref={waterRef} color="#48aee6" roughness={0.1} metalness={0.2} transparent opacity={0.85} />
      </mesh>
      {/* Fountain central pillar */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.22, 0.45, 8]} />
        <meshStandardMaterial color="#6e665f" roughness={0.8} flatShading />
      </mesh>
      <mesh position={[0, 0.75, 0]} castShadow>
        <dodecahedronGeometry args={[0.16, 0]} />
        <meshStandardMaterial color="#55d4ff" emissive="#1f98d4" emissiveIntensity={0.6} roughness={0.2} />
      </mesh>
    </group>
  );
}

/**
 * Main floating island terrain:
 * - Huge multifaceted floating rock underside with crags and stalactites
 * - Lush green multi-layered top surface with roads connecting the 5 districts
 * - Trees, streetlamps, satellite rocks
 */
export function IslandTerrain() {
  // Road segments leading from center to each district
  const roads = useMemo(() => {
    return [
      // Road to House (About: -3.4, 0, 2.3)
      { pos: [-1.7, 0.012, 1.15] as [number, number, number], rot: Math.atan2(2.3, -3.4) + Math.PI / 2, len: 3.8 },
      // Road to School (Education: 3.2, 0, 2.8)
      { pos: [1.6, 0.012, 1.4] as [number, number, number], rot: Math.atan2(2.8, 3.2) + Math.PI / 2, len: 3.9 },
      // Road to Towers (Experience: 3.6, 0, -1.1)
      { pos: [1.8, 0.012, -0.55] as [number, number, number], rot: Math.atan2(-1.1, 3.6) + Math.PI / 2, len: 3.5 },
      // Road to Arcade (Projects: -3.2, 0, -2.2)
      { pos: [-1.6, 0.012, -1.1] as [number, number, number], rot: Math.atan2(-2.2, -3.2) + Math.PI / 2, len: 3.6 },
      // Road to Radio Tower (Contact: 0.2, 0, -4.3)
      { pos: [0.1, 0.012, -2.15] as [number, number, number], rot: Math.atan2(-4.3, 0.2) + Math.PI / 2, len: 4.1 },
    ];
  }, []);

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Underside Floating Rock: faceted low-poly crags tapering down */}
      {/* Main rock body */}
      <mesh position={[0, -1.6, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[6.8, 2.2, 3.2, 14, 2]} />
        <meshStandardMaterial color="#473f38" roughness={0.95} flatShading />
      </mesh>
      {/* Bottom inverted cones & crags forming stalactites */}
      <mesh position={[0, -3.8, 0]} castShadow receiveShadow>
        <coneGeometry args={[2.4, 2.8, 9]} />
        <meshStandardMaterial color="#38312b" roughness={0.98} flatShading />
      </mesh>
      <mesh position={[-1.2, -3.4, 0.8]} castShadow receiveShadow>
        <coneGeometry args={[1.2, 2.2, 7]} />
        <meshStandardMaterial color="#322b25" roughness={0.98} flatShading />
      </mesh>
      <mesh position={[1.5, -3.1, -0.9]} castShadow receiveShadow>
        <coneGeometry args={[1.4, 2.0, 7]} />
        <meshStandardMaterial color="#302924" roughness={0.98} flatShading />
      </mesh>
      <mesh position={[-0.8, -2.8, -1.4]} castShadow receiveShadow>
        <coneGeometry args={[1.0, 1.8, 6]} />
        <meshStandardMaterial color="#362f29" roughness={0.98} flatShading />
      </mesh>

      {/* 2. Top Grass Surface Layer */}
      {/* Main grass plateau */}
      <mesh position={[0, 0.0, 0]} receiveShadow>
        <cylinderGeometry args={[6.85, 6.8, 0.4, 24]} />
        <meshStandardMaterial color="#4c8f47" roughness={0.88} flatShading />
      </mesh>
      {/* Slight raised terrain mounds giving low-poly topography */}
      <mesh position={[-3.2, 0.15, 2.1]} receiveShadow>
        <cylinderGeometry args={[2.2, 2.5, 0.3, 10]} />
        <meshStandardMaterial color="#55994f" roughness={0.88} flatShading />
      </mesh>
      <mesh position={[3.2, 0.15, 2.6]} receiveShadow>
        <cylinderGeometry args={[2.3, 2.6, 0.3, 10]} />
        <meshStandardMaterial color="#55994f" roughness={0.88} flatShading />
      </mesh>
      <mesh position={[3.5, 0.15, -1.1]} receiveShadow>
        <cylinderGeometry args={[2.4, 2.7, 0.3, 10]} />
        <meshStandardMaterial color="#50924b" roughness={0.88} flatShading />
      </mesh>
      <mesh position={[-3.1, 0.15, -2.1]} receiveShadow>
        <cylinderGeometry args={[2.2, 2.5, 0.3, 10]} />
        <meshStandardMaterial color="#52964d" roughness={0.88} flatShading />
      </mesh>
      <mesh position={[0.2, 0.15, -4.0]} receiveShadow>
        <cylinderGeometry args={[2.0, 2.3, 0.3, 10]} />
        <meshStandardMaterial color="#4f9049" roughness={0.88} flatShading />
      </mesh>

      {/* 3. Central Plaza & Cobblestone Roads */}
      <CentralPlaza />

      {/* Radiating pathways */}
      {roads.map((r, i) => (
        <mesh key={i} position={r.pos} rotation={[-Math.PI / 2, 0, r.rot]} receiveShadow>
          <planeGeometry args={[0.7, r.len]} />
          <meshStandardMaterial color="#c5bcae" roughness={0.92} />
        </mesh>
      ))}

      {/* 4. Street Lamps along the paths */}
      <StreetLamp position={[-1.3, 0.2, 0.9]} rotation={[0, 0.7, 0]} />
      <StreetLamp position={[1.3, 0.2, 1.1]} rotation={[0, -0.6, 0]} />
      <StreetLamp position={[1.4, 0.2, -0.6]} rotation={[0, -1.8, 0]} />
      <StreetLamp position={[-1.2, 0.2, -1.0]} rotation={[0, 2.2, 0]} />
      <StreetLamp position={[0.4, 0.2, -1.8]} rotation={[0, 3.1, 0]} />

      {/* 5. Trees & Foliage dotted around the island */}
      <PineTree position={[-4.8, 0.2, 0.5]} scale={1.2} />
      <PineTree position={[-4.5, 0.2, -0.4]} scale={0.9} />
      <PineTree position={[0.8, 0.2, 4.6]} scale={1.1} />
      <PineTree position={[-1.2, 0.2, 4.4]} scale={0.85} />
      <PineTree position={[4.6, 0.2, 0.8]} scale={1.15} />
      <PineTree position={[4.8, 0.2, -2.8]} scale={1.0} />
      <PineTree position={[-1.6, 0.2, -4.5]} scale={1.1} />
      <PineTree position={[1.8, 0.2, -4.3]} scale={0.95} />

      <RoundTree position={[-2.2, 0.2, 3.6]} scale={1.0} foliageColor="#4a9c52" />
      <RoundTree position={[2.2, 0.2, 4.0]} scale={0.9} foliageColor="#45924d" />
      <RoundTree position={[4.8, 0.2, 2.0]} scale={0.85} foliageColor="#3e8846" />
      <RoundTree position={[-4.6, 0.2, -3.2]} scale={1.05} foliageColor="#4ea056" />

      {/* 6. Satellite hovering rocks */}
      <SatelliteRock position={[-9, -1.5, 3]} scale={1.1} orbitRadius={9.5} speed={0.06} initialAngle={0.5} />
      <SatelliteRock position={[8.5, -2.0, -4]} scale={0.85} orbitRadius={9} speed={0.075} initialAngle={2.6} />
      <SatelliteRock position={[2, -3.0, 8.5]} scale={0.95} orbitRadius={8.8} speed={0.05} initialAngle={4.5} />
    </group>
  );
}
