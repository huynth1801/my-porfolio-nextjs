"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Hotspot } from "./hotspots";
import { getRig } from "./lighting";
import { boot } from "./boot";

/**
 * District 4: Pixel Arcade & Games Zone (Khu Arcade → Projects & Skills)
 * Retro neon-drenched arcade hall: glowing marquee, neon trims, arcade cabinet
 * silhouettes, retro joystick statue, and an interactive Skills kiosk terminal.
 */
export function DistrictArcade() {
  const neonPinkRef = useRef<THREE.MeshStandardMaterial>(null!);
  const neonCyanRef = useRef<THREE.MeshStandardMaterial>(null!);
  const marqueeRef = useRef<THREE.MeshStandardMaterial>(null!);
  const joystickBallRef = useRef<THREE.Mesh>(null!);
  const rig = getRig();

  useFrame((state) => {
    const b = boot.value;
    const factor = rig.neon * b;
    const t = state.clock.elapsedTime;

    // pulsating neon glow
    const pulsePink = 0.85 + 0.15 * Math.sin(t * 3.5);
    const pulseCyan = 0.85 + 0.15 * Math.cos(t * 4.0);

    if (neonPinkRef.current) {
      neonPinkRef.current.emissiveIntensity = factor * 2.8 * pulsePink;
    }
    if (neonCyanRef.current) {
      neonCyanRef.current.emissiveIntensity = factor * 2.8 * pulseCyan;
    }
    if (marqueeRef.current) {
      // intermittent neon flicker for that authentic retro arcade buzz
      const flicker = Math.sin(t * 12) > 0.85 ? 0.4 : 1.0;
      marqueeRef.current.emissiveIntensity = factor * 3.0 * flicker;
    }
    if (joystickBallRef.current) {
      joystickBallRef.current.rotation.x = Math.sin(t * 2) * 0.15;
      joystickBallRef.current.rotation.z = Math.cos(t * 2) * 0.15;
    }
  });

  return (
    <group position={[-3.2, 0.3, -2.2]} rotation={[0, 0.8, 0]}>
      {/* Main Arcade Building Hotspot -> Projects */}
      <Hotspot
        position={[0, 1.2, 0]}
        radius={1.8}
        height={2.2}
        glowY={-0.9}
        label="Projects"
        target="projects"
      >
        {/* Main building foundation */}
        <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.2, 1.5, 1.8]} />
          <meshStandardMaterial color="#1f1d2b" roughness={0.7} />
        </mesh>
        {/* Foundation plinth */}
        <mesh position={[0, 0.08, 0]} receiveShadow>
          <boxGeometry args={[2.4, 0.16, 2.0]} />
          <meshStandardMaterial color="#353344" roughness={0.9} />
        </mesh>

        {/* Angular Retro Roof with overhang */}
        <mesh position={[0, 1.65, 0.1]} rotation={[-0.15, 0, 0]} castShadow>
          <boxGeometry args={[2.35, 0.22, 2.1]} />
          <meshStandardMaterial color="#13111c" roughness={0.6} />
        </mesh>

        {/* Glowing Neon Roof Trim (Pink / Magenta) */}
        <mesh position={[0, 1.76, 1.15]}>
          <boxGeometry args={[2.36, 0.06, 0.06]} />
          <meshStandardMaterial
            ref={neonPinkRef}
            color="#ff4bb8"
            emissive="#ff1493"
            emissiveIntensity={rig.neon * 2.8}
          />
        </mesh>
        {/* Glowing Neon Roof Trim (Cyan) */}
        <mesh position={[0, 1.76, -0.95]}>
          <boxGeometry args={[2.36, 0.06, 0.06]} />
          <meshStandardMaterial
            ref={neonCyanRef}
            color="#38bdf8"
            emissive="#06b6d4"
            emissiveIntensity={rig.neon * 2.8}
          />
        </mesh>

        {/* Large ARCADE Marquee Signboard on Roof */}
        <group position={[0, 2.15, 0.6]}>
          {/* Signboard backing frame */}
          <mesh castShadow>
            <boxGeometry args={[1.7, 0.55, 0.12]} />
            <meshStandardMaterial color="#0b0a12" roughness={0.6} metalness={0.5} />
          </mesh>
          {/* Glowing neon display face */}
          <mesh position={[0, 0, 0.07]}>
            <planeGeometry args={[1.56, 0.42]} />
            <meshStandardMaterial
              ref={marqueeRef}
              color="#ff3399"
              emissive="#ff007f"
              emissiveIntensity={rig.neon * 3.0}
            />
          </mesh>
          {/* Inner neon text border / accent */}
          <mesh position={[0, 0, 0.08]}>
            <planeGeometry args={[1.4, 0.26]} />
            <meshStandardMaterial
              color="#00ffff"
              emissive="#00e5ff"
              emissiveIntensity={rig.neon * 2.5}
            />
          </mesh>
        </group>

        {/* Entrance Portal with Neon Arch */}
        <group position={[0, 0.55, 0.92]}>
          {/* Recessed glass door */}
          <mesh position={[0, 0, -0.05]}>
            <planeGeometry args={[0.9, 1.05]} />
            <meshStandardMaterial
              color="#1e1833"
              emissive="#9333ea"
              emissiveIntensity={rig.neon * 0.9}
              roughness={0.2}
            />
          </mesh>
          {/* Neon entrance outline */}
          <mesh position={[-0.48, 0, 0.02]}>
            <boxGeometry args={[0.06, 1.1, 0.06]} />
            <meshStandardMaterial color="#00ffff" emissive="#00e5ff" emissiveIntensity={rig.neon * 2.5} />
          </mesh>
          <mesh position={[0.48, 0, 0.02]}>
            <boxGeometry args={[0.06, 1.1, 0.06]} />
            <meshStandardMaterial color="#00ffff" emissive="#00e5ff" emissiveIntensity={rig.neon * 2.5} />
          </mesh>
          <mesh position={[0, 0.55, 0.02]}>
            <boxGeometry args={[1.02, 0.06, 0.06]} />
            <meshStandardMaterial color="#00ffff" emissive="#00e5ff" emissiveIntensity={rig.neon * 2.5} />
          </mesh>
        </group>
      </Hotspot>

      {/* Giant Retro Arcade Joystick Monument outside on the patio */}
      <group position={[1.4, 0, 0.8]}>
        {/* Base console */}
        <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.55, 0.5, 0.55]} />
          <meshStandardMaterial color="#2d2b3d" roughness={0.6} />
        </mesh>
        {/* Joystick stick & red ball */}
        <group ref={joystickBallRef} position={[0, 0.5, 0]}>
          <mesh position={[0, 0.15, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 0.3, 8]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.32, 0]} castShadow>
            <sphereGeometry args={[0.11, 12, 12]} />
            <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={rig.neon * 1.5} roughness={0.3} />
          </mesh>
        </group>
        {/* Arcade push buttons */}
        {[-0.14, 0.14].map((x, i) => (
          <mesh key={i} position={[x, 0.52, 0.15]}>
            <cylinderGeometry args={[0.05, 0.05, 0.04, 8]} />
            <meshStandardMaterial color={i === 0 ? "#3b82f6" : "#eab308"} roughness={0.4} />
          </mesh>
        ))}
      </group>

      {/* Skills Kiosk Terminal Hotspot -> Skills */}
      <Hotspot
        position={[-1.35, 0.5, 0.9]}
        radius={0.48}
        height={0.9}
        glowY={-0.45}
        label="Skills"
        target="skills"
      >
        {/* Terminal pedestal */}
        <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.42, 0.7, 0.32]} />
          <meshStandardMaterial color="#1e1e2d" roughness={0.7} />
        </mesh>
        {/* Glowing holographic display screen */}
        <mesh position={[0, 0.55, 0.17]} rotation={[-0.35, 0, 0]}>
          <planeGeometry args={[0.36, 0.26]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#0284c7"
            emissiveIntensity={rig.neon * 2.5}
            roughness={0.2}
          />
        </mesh>
        {/* Neon base strip */}
        <mesh position={[0, 0.04, 0]}>
          <boxGeometry args={[0.46, 0.06, 0.36]} />
          <meshStandardMaterial color="#ec4899" emissive="#db2777" emissiveIntensity={rig.neon * 2.2} />
        </mesh>
      </Hotspot>
    </group>
  );
}
