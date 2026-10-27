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
import { RoomShell, Desk, Shelf, Chair, Plant, Books, C } from "./furniture";import {
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

  return (
    <>
      <CameraRig />

      {/* warm interior + cool accents, matching the reference shot */}
      <ambientLight intensity={0.38} color="#ffe9d0" />
      <hemisphereLight args={["#cdd8ff", "#3a2a1c", 0.5]} />
      {/* "sunlight" through the window */}
      <directionalLight
        position={[4.2, 3.3, 1.1]}
        intensity={2.1}
        color="#ffe3c2"
        castShadow
        shadow-mapSize={low ? [1024, 1024] : [2048, 2048]}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
        shadow-camera-near={0.5}
        shadow-camera-far={12}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      {/* monitor backlight spill */}
      <pointLight position={[-0.45, 1.85, -2.25]} color={C.ledBlue} intensity={3.5} distance={3.5} decay={2} />
      {/* soft warm fill above the desk */}
      <pointLight position={[0.4, 2.9, -0.4]} color="#ffd9a6" intensity={4} distance={7} decay={2} />

      <RoomShell />
      <Desk />
      <Shelf />
      <ShelfItems shelfY={2.3175} />
      <Books position={[-1.28, 2.3175, -2.5]} />
      <group position={[-3.55, 0, -2.0]}>
        <Plant scale={1.9} />
      </group>
      <Chair />
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
        position={[0.05, 0.7, -1.12]}
        radius={0.62}
        height={0.45}
        glowY={-0.08}
        label="Skills"
        target="skills"
      >
        <MidiKeyboard />
      </Hotspot>

      <Dust count={low ? 60 : 140} />
    </>
  );
}
