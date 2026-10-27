"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Hotspot } from "./hotspots";
import { getRig } from "./lighting";
import { boot } from "./boot";

/**
 * District 2: Tech Academy (Trường học → Education)
 * Neoclassical academic campus: ivory sandstone, navy slate roof,
 * classical columns, clock tower with glowing clock face, and waving flag.
 */
export function DistrictSchool() {
  const windowMat = useRef<THREE.MeshStandardMaterial>(null!);
  const clockMat = useRef<THREE.MeshStandardMaterial>(null!);
  const flagRef = useRef<THREE.Mesh>(null!);
  const rig = getRig();

  useFrame((state) => {
    const b = boot.value;
    const factor = rig.neon * b;
    if (windowMat.current) {
      windowMat.current.emissiveIntensity = factor * 2.2;
    }
    if (clockMat.current) {
      clockMat.current.emissiveIntensity = factor * 2.6;
    }
    if (flagRef.current) {
      flagRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 3) * 0.15;
    }
  });

  return (
    <group position={[3.2, 0.3, 2.8]} rotation={[0, -0.4, 0]}>
      <Hotspot
        position={[0, 1.3, 0]}
        radius={1.9}
        height={2.2}
        glowY={-1.0}
        label="Education"
        target="education"
      >
        {/* Main central hall: ivory sandstone */}
        <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 1.4, 1.6]} />
          <meshStandardMaterial color="#faf6ee" roughness={0.8} />
        </mesh>
        {/* Foundation stone base */}
        <mesh position={[0, 0.08, 0]} receiveShadow>
          <boxGeometry args={[3.6, 0.16, 1.8]} />
          <meshStandardMaterial color="#948c82" roughness={0.9} flatShading />
        </mesh>

        {/* Portico pediment & entrance columns */}
        <mesh position={[0, 1.6, 0.82]} rotation={[0, 0, 0]} castShadow>
          <coneGeometry args={[1.0, 0.5, 4]} />
          <meshStandardMaterial color="#ede7da" roughness={0.75} flatShading />
        </mesh>
        {/* Portico steps */}
        <mesh position={[0, 0.06, 0.95]} receiveShadow>
          <boxGeometry args={[1.2, 0.12, 0.35]} />
          <meshStandardMaterial color="#c4bcb0" roughness={0.85} />
        </mesh>
        {/* Classical white marble pillars */}
        {[-0.45, -0.15, 0.15, 0.45].map((x, i) => (
          <mesh key={i} position={[x, 0.7, 0.88]} castShadow>
            <cylinderGeometry args={[0.045, 0.055, 1.15, 6]} />
            <meshStandardMaterial color="#ffffff" roughness={0.6} />
          </mesh>
        ))}

        {/* Central Clock Tower */}
        <mesh position={[0, 1.85, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.7, 1.1, 0.7]} />
          <meshStandardMaterial color="#ede7da" roughness={0.8} />
        </mesh>
        {/* Navy slate pyramid roof */}
        <mesh position={[0, 2.65, 0]} castShadow>
          <coneGeometry args={[0.55, 0.75, 4]} />
          <meshStandardMaterial color="#2d4666" roughness={0.6} flatShading />
        </mesh>
        {/* Golden spire needle */}
        <mesh position={[0, 3.12, 0]}>
          <cylinderGeometry args={[0.015, 0.04, 0.45, 5]} />
          <meshStandardMaterial color="#eab308" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Illuminated Clock Faces (front & back) */}
        <mesh position={[0, 1.95, 0.36]}>
          <circleGeometry args={[0.18, 16]} />
          <meshStandardMaterial
            ref={clockMat}
            color="#fef08a"
            emissive="#f59e0b"
            emissiveIntensity={rig.neon * 2.6}
            roughness={0.2}
          />
        </mesh>
        <mesh position={[0, 1.95, -0.36]} rotation={[0, Math.PI, 0]}>
          <circleGeometry args={[0.18, 16]} />
          <meshStandardMaterial
            color="#fef08a"
            emissive="#f59e0b"
            emissiveIntensity={rig.neon * 2.6}
            roughness={0.2}
          />
        </mesh>

        {/* Left lecture wing */}
        <mesh position={[-1.25, 0.6, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.05, 1.1, 1.3]} />
          <meshStandardMaterial color="#f2eee4" roughness={0.8} />
        </mesh>
        <mesh position={[-1.25, 1.3, 0]} rotation={[0, 0, 0]} castShadow>
          <coneGeometry args={[0.9, 0.55, 4]} />
          <meshStandardMaterial color="#2d4666" roughness={0.6} flatShading />
        </mesh>

        {/* Right lecture wing */}
        <mesh position={[1.25, 0.6, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.05, 1.1, 1.3]} />
          <meshStandardMaterial color="#f2eee4" roughness={0.8} />
        </mesh>
        <mesh position={[1.25, 1.3, 0]} rotation={[0, 0, 0]} castShadow>
          <coneGeometry args={[0.9, 0.55, 4]} />
          <meshStandardMaterial color="#2d4666" roughness={0.6} flatShading />
        </mesh>

        {/* Classroom windows that glow with warm scholastic light */}
        {[-1.5, -1.0, 1.0, 1.5].map((x, i) => (
          <group key={i} position={[x, 0.65, 0.66]}>
            <mesh>
              <planeGeometry args={[0.26, 0.42]} />
              <meshStandardMaterial
                ref={i === 0 ? windowMat : undefined}
                color="#fef08a"
                emissive="#f59e0b"
                emissiveIntensity={rig.neon * 2.2}
                roughness={0.2}
              />
            </mesh>
          </group>
        ))}
      </Hotspot>

      {/* Flagpole in front courtyard */}
      <group position={[0.8, 0, 1.3]}>
        <mesh position={[0, 0.75, 0]} castShadow>
          <cylinderGeometry args={[0.02, 0.03, 1.5, 6]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 1.52, 0]}>
          <sphereGeometry args={[0.04, 6, 6]} />
          <meshStandardMaterial color="#eab308" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh ref={flagRef} position={[0.15, 1.35, 0]} castShadow>
          <boxGeometry args={[0.3, 0.2, 0.015]} />
          <meshStandardMaterial color="#2563eb" roughness={0.6} />
        </mesh>
      </group>

      {/* Manicured courtyard topiaries */}
      {[-0.8, 0.8].map((x, i) => (
        <group key={i} position={[x, 0, 1.25]}>
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.16, 0.18, 0.2, 7]} />
            <meshStandardMaterial color="#948c82" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.32, 0]} castShadow>
            <dodecahedronGeometry args={[0.2, 1]} />
            <meshStandardMaterial color="#2e7d32" roughness={0.7} flatShading />
          </mesh>
        </group>
      ))}
    </group>
  );
}
