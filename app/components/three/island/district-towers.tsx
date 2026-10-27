"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Hotspot } from "./hotspots";
import { getRig } from "./lighting";
import { boot } from "./boot";

/**
 * District 3: Career Towers (Dãy tháp văn phòng → Experience)
 * 4 low-poly office skyscrapers representing the company journey:
 * - TGM Tower (tallest glass skyscraper + spire)
 * - CAS Tower (modern angular tower + helipad)
 * - Likelion Studio (tech hub with warm accents)
 * - Onechain Lab (game studio block + rooftop dish)
 * Connected by an elevated skybridge; windows blaze with city lights at night.
 */
export function DistrictTowers() {
  const windowCyanMat = useRef<THREE.MeshStandardMaterial>(null!);
  const windowWarmMat = useRef<THREE.MeshStandardMaterial>(null!);
  const spireLightRef = useRef<THREE.MeshStandardMaterial>(null!);
  const rig = getRig();

  useFrame((state) => {
    const b = boot.value;
    const factor = rig.neon * b;
    if (windowCyanMat.current) {
      windowCyanMat.current.emissiveIntensity = factor * 2.2;
    }
    if (windowWarmMat.current) {
      windowWarmMat.current.emissiveIntensity = factor * 2.0;
    }
    if (spireLightRef.current) {
      // pulsating aviation warning light at top of TGM spire
      const pulse = 0.5 + 0.5 * Math.sin(state.clock.elapsedTime * 4);
      spireLightRef.current.emissiveIntensity = factor * (1.5 + pulse * 2.0);
    }
  });

  return (
    <group position={[3.6, 0.3, -1.1]} rotation={[0, -0.9, 0]}>
      <Hotspot
        position={[0, 1.8, 0]}
        radius={2.1}
        height={3.4}
        glowY={-1.5}
        label="Experience"
        target="experience"
      >
        {/* Base podium plaza */}
        <mesh position={[0, 0.1, 0]} receiveShadow>
          <boxGeometry args={[3.2, 0.2, 2.8]} />
          <meshStandardMaterial color="#404652" roughness={0.8} />
        </mesh>

        {/* --- Tower 1: TGM Research (Tallest Flagship Skyscraper) --- */}
        <group position={[-0.7, 0, -0.4]}>
          {/* Main glass tower body */}
          <mesh position={[0, 1.6, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.0, 3.0, 1.0]} />
            <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Upper setback penthouse */}
          <mesh position={[0, 3.3, 0]} castShadow>
            <boxGeometry args={[0.75, 0.5, 0.75]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Spire mast */}
          <mesh position={[0, 3.8, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.05, 0.8, 5]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Pulsing aviation beacon tip */}
          <mesh position={[0, 4.22, 0]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial
              ref={spireLightRef}
              color="#38bdf8"
              emissive="#0284c7"
              emissiveIntensity={rig.neon * 2.5}
            />
          </mesh>

          {/* Grid of luminous windows on front & sides */}
          {/* Front windows (cyan tech vibe) */}
          {[0.6, 1.1, 1.6, 2.1, 2.6].map((y, row) => (
            <mesh key={row} position={[0, y, 0.51]}>
              <planeGeometry args={[0.78, 0.26]} />
              <meshStandardMaterial
                ref={row === 0 ? windowCyanMat : undefined}
                color="#67e8f9"
                emissive="#06b6d4"
                emissiveIntensity={rig.neon * 2.2}
                roughness={0.2}
              />
            </mesh>
          ))}
          {/* Side windows */}
          {[0.6, 1.1, 1.6, 2.1, 2.6].map((y, row) => (
            <mesh key={row} position={[-0.51, y, 0]} rotation={[0, -Math.PI / 2, 0]}>
              <planeGeometry args={[0.78, 0.26]} />
              <meshStandardMaterial
                color="#67e8f9"
                emissive="#06b6d4"
                emissiveIntensity={rig.neon * 2.2}
                roughness={0.2}
              />
            </mesh>
          ))}
        </group>

        {/* --- Tower 2: CAS Corporation (Modern Tower with Helipad) --- */}
        <group position={[0.75, 0, -0.3]}>
          {/* Main body */}
          <mesh position={[0, 1.3, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.05, 2.4, 0.95]} />
            <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.4} />
          </mesh>
          {/* Rooftop Helipad pad */}
          <mesh position={[0, 2.55, 0]} receiveShadow>
            <cylinderGeometry args={[0.45, 0.45, 0.08, 12]} />
            <meshStandardMaterial color="#1e293b" roughness={0.7} />
          </mesh>
          {/* Helipad 'H' marking */}
          <mesh position={[0, 2.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.3, 0.3]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.5} />
          </mesh>

          {/* Windows with warm corporate gold light */}
          {[0.5, 0.95, 1.4, 1.85, 2.2].map((y, row) => (
            <mesh key={row} position={[0, y, 0.49]}>
              <planeGeometry args={[0.82, 0.22]} />
              <meshStandardMaterial
                ref={row === 0 ? windowWarmMat : undefined}
                color="#fde047"
                emissive="#eab308"
                emissiveIntensity={rig.neon * 2.0}
                roughness={0.2}
              />
            </mesh>
          ))}
        </group>

        {/* Elevated Skybridge linking TGM and CAS Towers */}
        <group position={[0.02, 1.6, -0.35]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.5, 0.35, 0.35]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Skybridge glass view */}
          <mesh position={[0, 0, 0.18]}>
            <planeGeometry args={[0.46, 0.22]} />
            <meshStandardMaterial
              color="#bae6fd"
              emissive="#38bdf8"
              emissiveIntensity={rig.neon * 1.8}
              transparent
              opacity={0.85}
            />
          </mesh>
        </group>

        {/* --- Tower 3: Likelion (Mid-Rise Tech Building) --- */}
        <group position={[-0.7, 0, 0.8]}>
          <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.95, 1.6, 0.85]} />
            <meshStandardMaterial color="#475569" roughness={0.5} />
          </mesh>
          {/* Orange/Amber accent band */}
          <mesh position={[0, 1.65, 0]}>
            <boxGeometry args={[0.98, 0.12, 0.88]} />
            <meshStandardMaterial color="#f97316" emissive="#ea580c" emissiveIntensity={rig.neon * 1.5} />
          </mesh>
          {/* Rooftop AC unit */}
          <mesh position={[0, 1.8, 0]} castShadow>
            <boxGeometry args={[0.4, 0.2, 0.4]} />
            <meshStandardMaterial color="#64748b" roughness={0.8} />
          </mesh>
          {/* Windows */}
          {[0.45, 0.85, 1.25].map((y, row) => (
            <mesh key={row} position={[0, y, 0.44]}>
              <planeGeometry args={[0.75, 0.2]} />
              <meshStandardMaterial
                color="#fed7aa"
                emissive="#f97316"
                emissiveIntensity={rig.neon * 1.9}
                roughness={0.2}
              />
            </mesh>
          ))}
        </group>

        {/* --- Tower 4: Onechain Game Studio (Creative Block) --- */}
        <group position={[0.65, 0, 0.8]}>
          <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.9, 1.3, 0.8]} />
            <meshStandardMaterial color="#3b4252" roughness={0.6} />
          </mesh>
          {/* Creative purple accent line */}
          <mesh position={[0, 1.35, 0]}>
            <boxGeometry args={[0.92, 0.1, 0.82]} />
            <meshStandardMaterial color="#a855f7" emissive="#9333ea" emissiveIntensity={rig.neon * 2.0} />
          </mesh>
          {/* Rooftop satellite dish */}
          <group position={[0.1, 1.5, -0.1]} rotation={[0.4, 0.6, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.02, 0.02, 0.25, 4]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.8} />
            </mesh>
            <mesh position={[0, 0.18, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
              <coneGeometry args={[0.22, 0.12, 8]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.7} roughness={0.3} />
            </mesh>
          </group>
          {/* Windows */}
          {[0.4, 0.8, 1.15].map((y, row) => (
            <mesh key={row} position={[0, y, 0.41]}>
              <planeGeometry args={[0.7, 0.18]} />
              <meshStandardMaterial
                color="#e9d5ff"
                emissive="#a855f7"
                emissiveIntensity={rig.neon * 2.0}
                roughness={0.2}
              />
            </mesh>
          ))}
        </group>
      </Hotspot>
    </group>
  );
}
