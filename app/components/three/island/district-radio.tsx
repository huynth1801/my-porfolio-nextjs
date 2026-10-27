"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Hotspot } from "./hotspots";
import { getRig } from "./lighting";
import { boot } from "./boot";

/** Low-poly radio broadcast wave rings pulsing outwards into the sky */
function RadioWaveRings() {
  const ring1 = useRef<THREE.Mesh>(null!);
  const ring2 = useRef<THREE.Mesh>(null!);
  const ring3 = useRef<THREE.Mesh>(null!);
  const rig = getRig();

  useFrame((state) => {
    const t = state.clock.elapsedTime * 1.3;
    const animateWave = (mesh: THREE.Mesh, offset: number) => {
      if (!mesh) return;
      const progress = ((t + offset) % 2) / 2;
      const scale = 0.3 + progress * 2.4;
      mesh.scale.set(scale, scale, scale);
      const m = mesh.material as THREE.MeshBasicMaterial;
      m.opacity = Math.sin(progress * Math.PI) * (0.45 + rig.neon * 0.45);
    };
    animateWave(ring1.current, 0);
    animateWave(ring2.current, 0.66);
    animateWave(ring3.current, 1.33);
  });

  return (
    <group position={[0, 4.3, 0]}>
      <mesh ref={ring1} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 0.98, 24]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh ref={ring2} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 0.98, 24]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh ref={ring3} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 0.98, 24]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}

/**
 * District 5: Broadcast Radio Station (Đài phát thanh → Contact)
 * Towering red-and-white striped antenna tower with pulsating top beacon,
 * animated radio wave rings, satellite dish, spinning radar, and transmission bunker.
 */
export function DistrictRadio() {
  const beaconMat = useRef<THREE.MeshStandardMaterial>(null!);
  const radarRef = useRef<THREE.Group>(null!);
  const cabinWindowMat = useRef<THREE.MeshStandardMaterial>(null!);
  const rig = getRig();

  useFrame((state) => {
    const b = boot.value;
    const factor = rig.neon * b;
    const t = state.clock.elapsedTime;

    if (beaconMat.current) {
      const blink = Math.sin(t * 5.0) > 0 ? 1.0 : 0.2;
      beaconMat.current.emissiveIntensity = factor * (2.0 + blink * 2.8);
    }
    if (radarRef.current) {
      radarRef.current.rotation.y = t * 1.5;
    }
    if (cabinWindowMat.current) {
      cabinWindowMat.current.emissiveIntensity = factor * 2.2;
    }
  });

  return (
    <group position={[0.2, 0.3, -4.3]} rotation={[0, 3.14, 0]}>
      <Hotspot
        position={[0, 2.1, 0]}
        radius={1.7}
        height={3.8}
        glowY={-1.8}
        label="Contact"
        target="contact"
      >
        {/* Concrete transmission bunker base */}
        <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 0.9, 1.3]} />
          <meshStandardMaterial color="#475569" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.05, 0]} receiveShadow>
          <boxGeometry args={[1.7, 0.12, 1.5]} />
          <meshStandardMaterial color="#334155" roughness={0.85} />
        </mesh>

        {/* Transmission cabin glowing monitoring window */}
        <mesh position={[0, 0.48, 0.66]}>
          <planeGeometry args={[0.55, 0.32]} />
          <meshStandardMaterial
            ref={cabinWindowMat}
            color="#34d399"
            emissive="#10b981"
            emissiveIntensity={rig.neon * 2.2}
            roughness={0.2}
          />
        </mesh>

        {/* Spinning small radar dish on cabin roof */}
        <group ref={radarRef} position={[0.5, 1.0, 0.3]}>
          <mesh position={[0, 0.1, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.2, 5]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.8} />
          </mesh>
          <mesh position={[0, 0.22, 0]} rotation={[0.4, 0, 0]} castShadow>
            <coneGeometry args={[0.16, 0.08, 8]} />
            <meshStandardMaterial color="#f8fafc" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>

        {/* --- Tall Lattice Radio Transmission Tower --- */}
        {/* Tower legs / lower pyramid base */}
        <mesh position={[0, 1.45, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.5, 1.1, 4]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.6} />
        </mesh>

        {/* Red and White striped tower mast segments */}
        {[
          { y: 2.3, color: "#ef4444" },
          { y: 2.8, color: "#ffffff" },
          { y: 3.3, color: "#ef4444" },
          { y: 3.8, color: "#ffffff" },
        ].map((seg, i) => (
          <mesh key={i} position={[0, seg.y, 0]} castShadow>
            <cylinderGeometry args={[0.12 - i * 0.02, 0.15 - i * 0.02, 0.5, 4]} />
            <meshStandardMaterial color={seg.color} roughness={0.5} />
          </mesh>
        ))}

        {/* Antenna needle spire */}
        <mesh position={[0, 4.15, 0]} castShadow>
          <cylinderGeometry args={[0.015, 0.04, 0.6, 4]} />
          <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Pulsing Ruby Red Beacon Spherical Lamp */}
        <mesh position={[0, 4.48, 0]}>
          <sphereGeometry args={[0.075, 10, 10]} />
          <meshStandardMaterial
            ref={beaconMat}
            color="#ef4444"
            emissive="#dc2626"
            emissiveIntensity={rig.neon * 3.2}
            roughness={0.2}
          />
        </mesh>

        {/* Large Parabolic Satellite Dish */}
        <group position={[-0.35, 2.6, 0]} rotation={[0.3, 0.7, 0]}>
          <mesh position={[0, 0, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.35, 4]} />
            <meshStandardMaterial color="#64748b" metalness={0.8} />
          </mesh>
          <mesh position={[0, 0.15, 0]} rotation={[0, 0, Math.PI / 3]} castShadow>
            <coneGeometry args={[0.36, 0.16, 12]} />
            <meshStandardMaterial color="#f8fafc" metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.22, 0]}>
            <sphereGeometry args={[0.04, 6, 6]} />
            <meshStandardMaterial color="#0284c7" emissive="#38bdf8" emissiveIntensity={rig.neon * 1.8} />
          </mesh>
        </group>
      </Hotspot>

      {/* Animated broadcast radio wave rings */}
      <RadioWaveRings />
    </group>
  );
}
