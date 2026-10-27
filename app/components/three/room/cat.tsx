"use client";

/* eslint-disable react-hooks/purity --
   blink schedule is seeded with Math.random by design. */

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { toyStore } from "./hotspot-store";

const FUR = "#e0954f";
const FUR_DARK = "#c47a38";
const CREAM = "#f3e3c8";

/**
 * The room's mascot: a low-poly cat loafing on the office chair.
 * Tail sways, eyes blink on their own schedule; poking it (Hotspot
 * target "meow") makes it hop with a startle.
 */
export function Cat() {
  const group = useRef<THREE.Group>(null!);
  const tail = useRef<THREE.Group>(null!);
  const eyeL = useRef<THREE.Mesh>(null!);
  const eyeR = useRef<THREE.Mesh>(null!);

  const hopT = useRef(1); // >=1 means idle
  const lastPoke = useRef(toyStore.catPokes);
  const blinkAt = useRef(2 + Math.random() * 3);
  const blinkT = useRef(-1);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    // detect a poke from the hotspot
    if (toyStore.catPokes !== lastPoke.current) {
      lastPoke.current = toyStore.catPokes;
      hopT.current = 0;
    }

    // startle hop: quick up-down spring
    if (hopT.current < 1) {
      hopT.current = Math.min(1, hopT.current + delta * 2.4);
      const p = hopT.current;
      const hop = Math.sin(p * Math.PI) * 0.09;
      group.current.position.y = 0.07 + hop;
      group.current.rotation.z = Math.sin(p * Math.PI) * (Math.random() < 0 ? 0 : 0.06);
    } else {
      // idle breathing
      group.current.position.y = 0.07 + Math.sin(t * 1.8) * 0.006;
      group.current.rotation.z *= 0.9;
    }

    // tail sway, faster right after a poke
    const excited = hopT.current < 1 ? 6 : 1.4;
    tail.current.rotation.y = Math.sin(t * excited) * 0.5;
    tail.current.rotation.x = -0.5 + Math.sin(t * excited * 0.7) * 0.15;

    // blinking
    if (blinkT.current < 0 && t > blinkAt.current) blinkT.current = 0;
    if (blinkT.current >= 0) {
      blinkT.current += delta;
      const s = blinkT.current < 0.12 ? Math.max(0.08, 1 - (blinkT.current / 0.12) * 2) : 1;
      eyeL.current.scale.y = s;
      eyeR.current.scale.y = s;
      if (blinkT.current > 0.2) {
        blinkT.current = -1;
        blinkAt.current = t + 1.8 + Math.random() * 3;
        eyeL.current.scale.y = 1;
        eyeR.current.scale.y = 1;
      }
    }
  });

  return (
    <group ref={group} position={[0, 0.07, 0]} rotation={[0, 0.3, 0]}>
      {/* loaf body */}
      <mesh scale={[1, 0.72, 1.25]} castShadow>
        <sphereGeometry args={[0.13, 18, 14]} />
        <meshStandardMaterial color={FUR} roughness={1} />
      </mesh>
      {/* chest patch */}
      <mesh position={[0, -0.028, 0.1]} scale={[0.9, 0.5, 0.9]}>
        <sphereGeometry args={[0.085, 14, 12]} />
        <meshStandardMaterial color={CREAM} roughness={1} />
      </mesh>
      {/* head */}
      <group position={[0, 0.085, 0.12]}>
        <mesh castShadow>
          <sphereGeometry args={[0.078, 18, 14]} />
          <meshStandardMaterial color={FUR} roughness={1} />
        </mesh>
        {/* ears */}
        {[-0.042, 0.042].map((x) => (
          <group key={x} position={[x, 0.062, -0.01]} rotation={[0, 0, -x * 4]}>
            <mesh>
              <coneGeometry args={[0.026, 0.05, 4]} />
              <meshStandardMaterial color={FUR} roughness={1} />
            </mesh>
            <mesh position={[0, -0.004, 0.008]} scale={0.6}>
              <coneGeometry args={[0.026, 0.05, 4]} />
              <meshStandardMaterial color="#e8a4a4" roughness={1} />
            </mesh>
          </group>
        ))}
        {/* eyes (blink by scaling y) */}
        <mesh ref={eyeL} position={[-0.028, 0.008, 0.066]}>
          <sphereGeometry args={[0.0095, 8, 8]} />
          <meshStandardMaterial color="#1c1c22" roughness={0.3} />
        </mesh>
        <mesh ref={eyeR} position={[0.028, 0.008, 0.066]}>
          <sphereGeometry args={[0.0095, 8, 8]} />
          <meshStandardMaterial color="#1c1c22" roughness={0.3} />
        </mesh>
        {/* nose + whisker dots */}
        <mesh position={[0, -0.012, 0.074]}>
          <sphereGeometry args={[0.006, 6, 6]} />
          <meshStandardMaterial color="#d98a8a" />
        </mesh>
      </group>
      {/* front paws peeking out of the loaf */}
      {[-0.05, 0.05].map((x) => (
        <mesh key={x} position={[x, -0.045, 0.13]}>
          <sphereGeometry args={[0.024, 10, 8]} />
          <meshStandardMaterial color={CREAM} roughness={1} />
        </mesh>
      ))}
      {/* tail: three segments fanned out */}
      <group ref={tail} position={[0, 0.01, -0.15]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[Math.sin(i * 0.9) * 0.05, 0.02 * i + 0.015, -i * 0.045]} castShadow>
            <sphereGeometry args={[0.024 - i * 0.004, 10, 8]} />
            <meshStandardMaterial color={i === 2 ? FUR_DARK : FUR} roughness={1} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
