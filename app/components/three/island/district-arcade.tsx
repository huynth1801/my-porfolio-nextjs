"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Hotspot } from "./hotspots";
import { getRig } from "./lighting";
import { boot } from "./boot";
import { attachFlappyCanvas, flappy, flappyUpdate, flappyPress, flappyOpen } from "./flappy";
import { useEffect, useMemo } from "react";

/**
 * District 4: Pixel Arcade & Games Zone (Khu Arcade → Projects & Skills)
 * Retro synthwave arcade palace: deep violet walls, vibrant cyan trims,
 * glowing neon marquee, retro joystick statue, and interactive Skills kiosk.
 */
export function DistrictArcade() {
  const neonPinkRef = useRef<THREE.MeshStandardMaterial>(null!);
  const neonCyanRef = useRef<THREE.MeshStandardMaterial>(null!);
  const marqueeRef = useRef<THREE.MeshStandardMaterial>(null!);
  const joystickBallRef = useRef<THREE.Mesh>(null!);
  const rig = getRig();
  const gameCanvas = useMemo(() => {
    const canvas = document.createElement("canvas");
    attachFlappyCanvas(canvas);
    return canvas;
  }, []);
  const gameTex = useMemo(() => {
    const tex = new THREE.CanvasTexture(gameCanvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [gameCanvas]);
  useEffect(() => () => gameTex.dispose(), [gameTex]);
  // Space = flap while a game is running without overlay
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && flappy.mode === "play" && !flappy.isOpen) {
        e.preventDefault();
        flappyPress();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useFrame((state, dtd) => {
    const dt = Math.min(dtd, 0.05);
    const b = boot.value;
    const factor = rig.neon * b;
    const t = state.clock.elapsedTime;

    const pulsePink = 0.85 + 0.15 * Math.sin(t * 3.5);
    const pulseCyan = 0.85 + 0.15 * Math.cos(t * 4.0);

    if (neonPinkRef.current) {
      neonPinkRef.current.emissiveIntensity = factor * 3.0 * pulsePink;
    }
    if (neonCyanRef.current) {
      neonCyanRef.current.emissiveIntensity = factor * 3.0 * pulseCyan;
    }
    if (marqueeRef.current) {
      const flicker = Math.sin(t * 12) > 0.85 ? 0.5 : 1.0;
      marqueeRef.current.emissiveIntensity = factor * 3.2 * flicker;
    }
    if (joystickBallRef.current) {
      // idle sway, plus a lean back on every flap while a game is running
      joystickBallRef.current.rotation.x =
        Math.sin(t * 2) * 0.15 - flappy.flapPulse * 0.55;
      joystickBallRef.current.rotation.z = Math.cos(t * 2) * 0.15;
    }
    // drive the door-screen game; redraw the texture when it rendered
    const redrew = flappyUpdate(dt, t);
    // eslint-disable-next-line react-hooks/immutability
    if (redrew || flappy.dirty) gameTex.needsUpdate = true;
    flappy.dirty = false;
  });

  return (
    <group position={[-3.2, 0.3, -2.2]} rotation={[0, 0.8, 0]}>
      {/* Main Arcade Building Hotspot -> Projects */}
      <Hotspot
        position={[0, 1.35, -0.35]}
        radius={1.15}
        height={2.3}
        glowY={-1.15}
        label="Projects"
        target="projects"
      >
        {/* Main building: vibrant deep royal violet */}
        <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.2, 1.5, 1.8]} />
          <meshStandardMaterial color="#4c1d95" roughness={0.65} />
        </mesh>
        {/* Foundation plinth */}
        <mesh position={[0, 0.08, 0]} receiveShadow>
          <boxGeometry args={[2.4, 0.16, 2.0]} />
          <meshStandardMaterial color="#2e1065" roughness={0.8} />
        </mesh>

        {/* Angular Retro Roof with overhang */}
        <mesh position={[0, 1.65, 0.1]} rotation={[-0.15, 0, 0]} castShadow>
          <boxGeometry args={[2.35, 0.22, 2.1]} />
          <meshStandardMaterial color="#3b0764" roughness={0.5} />
        </mesh>

        {/* Glowing Neon Roof Trim (Pink / Magenta) */}
        <mesh position={[0, 1.76, 1.15]}>
          <boxGeometry args={[2.36, 0.06, 0.06]} />
          <meshStandardMaterial
            ref={neonPinkRef}
            color="#ff4bb8"
            emissive="#ff1493"
            emissiveIntensity={rig.neon * 3.0}
          />
        </mesh>
        {/* Glowing Neon Roof Trim (Cyan) */}
        <mesh position={[0, 1.76, -0.95]}>
          <boxGeometry args={[2.36, 0.06, 0.06]} />
          <meshStandardMaterial
            ref={neonCyanRef}
            color="#38bdf8"
            emissive="#06b6d4"
            emissiveIntensity={rig.neon * 3.0}
          />
        </mesh>

        {/* Large ARCADE Marquee Signboard on Roof */}
        <group position={[0, 2.15, 0.6]}>
          {/* Signboard backing frame */}
          <mesh castShadow>
            <boxGeometry args={[1.7, 0.55, 0.12]} />
            <meshStandardMaterial color="#1e1b4b" roughness={0.6} metalness={0.5} />
          </mesh>
          {/* Glowing neon display face */}
          <mesh position={[0, 0, 0.07]}>
            <planeGeometry args={[1.56, 0.42]} />
            <meshStandardMaterial
              ref={marqueeRef}
              color="#ff3399"
              emissive="#ff007f"
              emissiveIntensity={rig.neon * 3.2}
            />
          </mesh>
          {/* Inner neon text border */}
          <mesh position={[0, 0, 0.08]}>
            <planeGeometry args={[1.4, 0.26]} />
            <meshStandardMaterial
              color="#00ffff"
              emissive="#00e5ff"
              emissiveIntensity={rig.neon * 2.8}
            />
          </mesh>
        </group>

        {/* Entrance Portal with Neon Arch */}
        <group position={[0, 0.55, 0.92]}>
          {/* Flappy.DEV game screen (the recessed door) */}
          <mesh
            position={[0, 0, -0.04]}
            onClick={(e) => {
              e.stopPropagation();
              flappyOpen();
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => {
              document.body.style.cursor = "";
            }}
          >
            <planeGeometry args={[0.9, 1.05]} />
            <meshBasicMaterial map={gameTex} toneMapped={false} />
          </mesh>
          {/* Bright Cyan Entrance Arch */}
          <mesh position={[-0.48, 0, 0.02]}>
            <boxGeometry args={[0.06, 1.1, 0.06]} />
            <meshStandardMaterial color="#00ffff" emissive="#00e5ff" emissiveIntensity={rig.neon * 2.8} />
          </mesh>
          <mesh position={[0.48, 0, 0.02]}>
            <boxGeometry args={[0.06, 1.1, 0.06]} />
            <meshStandardMaterial color="#00ffff" emissive="#00e5ff" emissiveIntensity={rig.neon * 2.8} />
          </mesh>
          <mesh position={[0, 0.55, 0.02]}>
            <boxGeometry args={[1.02, 0.06, 0.06]} />
            <meshStandardMaterial color="#00ffff" emissive="#00e5ff" emissiveIntensity={rig.neon * 2.8} />
          </mesh>
        </group>
      </Hotspot>

      {/* Flappy.DEV — the door screen itself is playable */}
      <Hotspot
        position={[0, 0.85, 0.92]}
        radius={0.5}
        height={1.1}
        glowY={-0.62}
        label="Play Flappy.DEV"
        target="flappy"
      />

      {/* Giant Retro Arcade Joystick Monument */}
      <group position={[1.4, 0, 0.8]}>
        {/* Base console */}
        <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.55, 0.5, 0.55]} />
          <meshStandardMaterial color="#312e81" roughness={0.6} />
        </mesh>
        {/* Joystick stick & red ball */}
        <group ref={joystickBallRef} position={[0, 0.5, 0]}>
          <mesh position={[0, 0.15, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 0.3, 8]} />
            <meshStandardMaterial color="#f1f5f9" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.32, 0]} castShadow>
            <sphereGeometry args={[0.11, 12, 12]} />
            <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={rig.neon * 1.8} roughness={0.3} />
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
        <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.42, 0.7, 0.32]} />
          <meshStandardMaterial color="#1e1b4b" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.55, 0.17]} rotation={[-0.35, 0, 0]}>
          <planeGeometry args={[0.36, 0.26]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#0284c7"
            emissiveIntensity={rig.neon * 2.8}
            roughness={0.2}
          />
        </mesh>
        <mesh position={[0, 0.04, 0]}>
          <boxGeometry args={[0.46, 0.06, 0.36]} />
          <meshStandardMaterial color="#ec4899" emissive="#db2777" emissiveIntensity={rig.neon * 2.4} />
        </mesh>
      </Hotspot>
    </group>
  );
}
