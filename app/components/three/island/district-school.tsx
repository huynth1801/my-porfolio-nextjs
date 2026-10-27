"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Hotspot } from "./hotspots";
import { getRig } from "./lighting";
import { boot } from "./boot";

/**
 * District 2: Tech Academy (Trường học → Education)
 * Classical low-poly academic campus: grand hall, clock tower with lit clock face,
 * lecture wings with glowing classroom windows, flag pole, and courtyard.
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
      windowMat.current.emissiveIntensity = factor * 2.0;
    }
    if (clockMat.current) {
      clockMat.current.emissiveIntensity = factor * 2.4;
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
        {/* Main central hall */}
        <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 1.4, 1.6]} />
          <meshStandardMaterial color="#ebe2d3" roughness={0.9} />
        </mesh>
        {/* Foundation stone base */}
        <mesh position={[0, 0.08, 0]} receiveShadow>
          <boxGeometry args={[3.6, 0.16, 1.8]} />
          <meshStandardMaterial color="#8a7e75" roughness={0.95} flatShading />
        </mesh>

        {/* Portico pediment & entrance columns */}
        <mesh position={[0, 1.6, 0.82]} rotation={[0, 0, 0]} castShadow>
          <coneGeometry args={[1.0, 0.5, 4]} />
          <meshStandardMaterial color="#ded4c3" roughness={0.85} flatShading />
        </mesh>
        {/* Portico steps */}
        <mesh position={[0, 0.06, 0.95]} receiveShadow>
          <boxGeometry args={[1.2, 0.12, 0.35]} />
          <meshStandardMaterial color="#b2a89c" roughness={0.9} />
        </mesh>
        {/* Classical pillars */}
        {[-0.45, -0.15, 0.15, 0.45].map((x, i) => (
          <mesh key={i} position={[x, 0.7, 0.88]} castShadow>
            <cylinderGeometry args={[0.045, 0.055, 1.15, 6]} />
            <meshStandardMaterial color="#f2ebde" roughness={0.8} />
          </mesh>
        ))}

        {/* Central Clock Tower */}
        <mesh position={[0, 1.85, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.7, 1.1, 0.7]} />
          <meshStandardMaterial color="#d4c8b6" roughness={0.85} />
        </mesh>
        {/* Clock tower pyramid roof */}
        <mesh position={[0, 2.65, 0]} castShadow>
          <coneGeometry args={[0.55, 0.75, 4]} />
          <meshStandardMaterial color="#3d5166" roughness={0.8} flatShading />
        </mesh>
        {/* Spire needle */}
        <mesh position={[0, 3.1, 0]}>
          <cylinderGeometry args={[0.015, 0.04, 0.45, 5]} />
          <meshStandardMaterial color="#d99b38" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Illuminated Clock Faces (front & back) */}
        <mesh position={[0, 1.95, 0.36]}>
          <circleGeometry args={[0.18, 16]} />
          <meshStandardMaterial
            ref={clockMat}
            color="#fff6cf"
            emissive="#ffbe3b"
            emissiveIntensity={rig.neon * 2.4}
            roughness={0.2}
          />
        </mesh>
        <mesh position={[0, 1.95, -0.36]} rotation={[0, Math.PI, 0]}>
          <circleGeometry args={[0.18, 16]} />
          <meshStandardMaterial
            color="#fff6cf"
            emissive="#ffbe3b"
            emissiveIntensity={rig.neon * 2.4}
            roughness={0.2}
          />
        </mesh>

        {/* Left lecture wing */}
        <mesh position={[-1.25, 0.6, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.05, 1.1, 1.3]} />
          <meshStandardMaterial color="#dfd6c6" roughness={0.9} />
        </mesh>
        <mesh position={[-1.25, 1.3, 0]} rotation={[0, 0, 0]} castShadow>
          <coneGeometry args={[0.9, 0.55, 4]} />
          <meshStandardMaterial color="#3d5166" roughness={0.8} flatShading />
        </mesh>

        {/* Right lecture wing */}
        <mesh position={[1.25, 0.6, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.05, 1.1, 1.3]} />
          <meshStandardMaterial color="#dfd6c6" roughness={0.9} />
        </mesh>
        <mesh position={[1.25, 1.3, 0]} rotation={[0, 0, 0]} castShadow>
          <coneGeometry args={[0.9, 0.55, 4]} />
          <meshStandardMaterial color="#3d5166" roughness={0.8} flatShading />
        </mesh>

        {/* Classroom windows that glow with warm scholastic light */}
        {[-1.5, -1.0, 1.0, 1.5].map((x, i) => (
          <group key={i} position={[x, 0.65, 0.66]}>
            <mesh>
              <planeGeometry args={[0.26, 0.42]} />
              <meshStandardMaterial
                ref={i === 0 ? windowMat : undefined}
                color="#fff0aa"
                emissive="#ffa834"
                emissiveIntensity={rig.neon * 2.0}
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
          <meshStandardMaterial color="#silver" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 1.52, 0]}>
          <sphereGeometry args={[0.04, 6, 6]} />
          <meshStandardMaterial color="#d4a444" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Swaying flag */}
        <mesh ref={flagRef} position={[0.15, 1.35, 0]} castShadow>
          <boxGeometry args={[0.3, 0.2, 0.015]} />
          <meshStandardMaterial color="#2563eb" roughness={0.7} />
        </mesh>
      </group>

      {/* Manicured courtyard topiaries */}
      {[-0.8, 0.8].map((x, i) => (
        <group key={i} position={[x, 0, 1.25]}>
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.16, 0.18, 0.2, 7]} />
            <meshStandardMaterial color="#8a7e75" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.32, 0]} castShadow>
            <dodecahedronGeometry args={[0.2, 1]} />
            <meshStandardMaterial color="#2d6e36" roughness={0.7} flatShading />
          </mesh>
        </group>
      ))}
    </group>
  );
}
