"use client";

/* eslint-disable react-hooks/immutability, react-hooks/purity --
   three.js is imperative by design: uniforms are mutated every frame in
   useFrame; Math.random seeds the dust motes. */

import * as THREE from "three";
import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { journey } from "@/lib/journey-store";
import { CameraRig } from "./camera-rig";
import { Hotspot } from "./hotspots";
import { RoomLighting } from "./lighting";
import { useBoot } from "./boot";
import { Cat } from "./cat";
import { RoomShell, Desk, Shelf, Chair, Plant, Books } from "./furniture";
import {
  Monitor,
  Speakers,
  PcCase,
  DeskPeripherals,
  Keycaps,
  Phone,
  MidiKeyboard,
  ShelfItems,
} from "./electronics";

function Dust({ count }: { count: number }) {
  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const phase = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = -1.8 + Math.random() * 3.6;
      positions[i * 3 + 1] = 0.3 + Math.random() * 2.3;
      positions[i * 3 + 2] = -2.5 + Math.random() * 3;
      phase[i] = Math.random() * Math.PI * 2;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 } },
      vertexShader: /* glsl */ `
        uniform float uTime;
        attribute float aPhase;
        varying float vAlpha;
        void main() {
          vec3 pos = position;
          pos.x += sin(uTime * 0.12 + aPhase) * 0.12;
          pos.y += sin(uTime * 0.09 + aPhase * 1.7) * 0.08;
          vec4 mv = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = (1.1 + fract(aPhase) * 1.4) * (14.0 / -mv.z);
          vAlpha = 0.12 + 0.14 * sin(uTime * 0.6 + aPhase * 3.0);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float alpha = smoothstep(0.5, 0.05, d) * vAlpha;
          if (alpha < 0.01) discard;
          gl_FragColor = vec4(vec3(0.85, 0.9, 1.0), alpha);
        }
      `,
    });
    return { geometry, material };
  }, [count]);

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return <points args={[geometry, material]} frustumCulled={false} />;
}

export function Room() {
  const low = journey.tier === "low";
  useBoot();

  return (
    <>
      <CameraRig />
      <RoomLighting />

      <RoomShell />
      <Desk />
      <Shelf />
      <ShelfItems shelfY={2.3175} />
      <Books position={[-1.28, 2.3175, -2.5]} />
      <group position={[-3.55, 0, -2.0]}>
        <Plant scale={1.9} />
      </group>
      <Speakers />
      <DeskPeripherals />

      {/* interactive objects — click to open their quick-view panel */}
      <Hotspot
        position={[-0.45, 1.7, -2.02]}
        radius={0.8}
        height={1.05}
        glowY={-0.4}
        label="Experience"
        target="experience"
      >
        <group position={[0, -0.425, -0.03]}>
          <Monitor />
        </group>
      </Hotspot>

      {/* poster on the shelf */}
      <Hotspot
        position={[0.32, 2.6, -2.55]}
        radius={0.42}
        height={0.72}
        glowY={-0.27}
        label="About me"
        target="about"
      />

      {/* stack of books */}
      <Hotspot
        position={[-1.28, 2.53, -2.5]}
        radius={0.48}
        height={0.42}
        glowY={-0.19}
        label="Education"
        target="education"
      />

      <Hotspot
        position={[1.66, 1.6, -1.85]}
        radius={0.55}
        height={1.15}
        glowY={-0.52}
        label="Projects"
        target="projects"
      >
        <PcCase />
      </Hotspot>

      <Hotspot
        position={[-0.2, 1.11, -1.4]}
        radius={0.55}
        height={0.3}
        glowY={-0.035}
        label="Download CV"
        target="resume"
      >
        <group rotation={[0, 0.05, 0]}>
          <Keycaps />
        </group>
      </Hotspot>

      <Hotspot
        position={[-1.08, 1.1, -1.32]}
        radius={0.28}
        height={0.3}
        glowY={-0.02}
        label="Contact"
        target="contact"
      >
        <group position={[0, -0.015, 0]}>
          <Phone />
        </group>
      </Hotspot>

      <Hotspot
        position={[0.05, 0.85, -1.18]}
        radius={0.55}
        height={0.25}
        glowY={-0.14}
        label="Skills"
        target="skills"
      >
        <MidiKeyboard />
      </Hotspot>

      {/* the chair — poke it for a spin */}
      <Hotspot
        position={[1.05, 0.6, 0.55]}
        radius={0.5}
        height={1.3}
        glowY={-0.58}
        label="Spin!"
        target="spin"
      >
        <group scale={0.92}>
          <Chair />
        </group>
      </Hotspot>

      {/* the mascot, curled up in the corner where the two walls meet */}
      <Hotspot
        position={[3.55, 0.3, -2.25]}
        radius={0.34}
        height={0.5}
        glowY={-0.28}
        label="Meow"
        target="meow"
      >
        <group position={[0, -0.3, 0]} rotation={[0, -0.75, 0]} scale={1.45}>
          <Cat />
        </group>
      </Hotspot>

      <Dust count={low ? 60 : 140} />
    </>
  );
}
