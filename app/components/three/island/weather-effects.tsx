"use client";

/* eslint-disable react-hooks/immutability --
   Three.js buffer geometry positions and particle matrices mutate continuously in useFrame for 60fps performance. */

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { phaseStore } from "./lighting";

function pseudoRand(i: number, salt = 1): number {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/* ================================================================== */
/* 1. MEKONG DELTA RAIN & WATER RIPPLES                               */
/* ================================================================== */

const RAIN_COUNT = 650;
const RIPPLE_COUNT = 24;

function MekongRainSystem() {
  const lineGeoRef = useRef<THREE.BufferGeometry>(null!);
  const lineMatRef = useRef<THREE.LineBasicMaterial>(null!);
  const ripplesRef = useRef<THREE.InstancedMesh>(null!);
  const rainOpacity = useRef(0);

  // Deterministic Rain drop positions and velocities (Purity safe for React 19)
  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(RAIN_COUNT * 6); // 2 vertices per drop (head & tail)
    const vel = new Float32Array(RAIN_COUNT);

    for (let i = 0; i < RAIN_COUNT; i++) {
      const x = (pseudoRand(i, 1) - 0.5) * 18;
      const y = pseudoRand(i, 2) * 12 + 0.5;
      const z = (pseudoRand(i, 3) - 0.5) * 18;
      const len = 0.35 + pseudoRand(i, 4) * 0.25;

      pos[i * 6] = x;
      pos[i * 6 + 1] = y;
      pos[i * 6 + 2] = z;

      // Tail extends upward and slightly against wind tilt
      pos[i * 6 + 3] = x - 0.05;
      pos[i * 6 + 4] = y + len;
      pos[i * 6 + 5] = z + 0.03;

      vel[i] = 18 + pseudoRand(i, 5) * 8; // fast downward speed
    }

    return { positions: pos, velocities: vel };
  }, []);

  // Ripple state: [x, y, z, progress, maxScale, speed]
  const rippleData = useMemo(() => {
    return Array.from({ length: RIPPLE_COUNT }, (_, i) => ({
      x: (pseudoRand(i, 6) - 0.5) * 12,
      z: (pseudoRand(i, 7) - 0.5) * 12,
      progress: pseudoRand(i, 8),
      maxScale: 0.3 + pseudoRand(i, 9) * 0.45,
      speed: 0.8 + pseudoRand(i, 10) * 0.6,
    }));
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, delta) => {
    const phase = phaseStore.get();
    const targetOpacity = phase === "rain" ? 0.75 : 0;
    rainOpacity.current += (targetOpacity - rainOpacity.current) * Math.min(1, delta * 3.5);

    if (rainOpacity.current < 0.01) return;

    // Update Rain Streaks
    const pos = positions;
    const dt = Math.min(delta, 0.05);

    for (let i = 0; i < RAIN_COUNT; i++) {
      const v = velocities[i] * dt;
      pos[i * 6 + 1] -= v;
      pos[i * 6 + 4] -= v;

      // Wind drift
      pos[i * 6] += 2.5 * dt;
      pos[i * 6 + 3] += 2.5 * dt;

      // Reset when drop hits ground or falls below diorama
      if (pos[i * 6 + 1] < -0.5) {
        const seed = (i * 17) % 1000;
        const resetX = (pseudoRand(seed, 11) - 0.5) * 18 - 2.0;
        const resetY = 11 + pseudoRand(seed, 12) * 3.5;
        const resetZ = (pseudoRand(seed, 13) - 0.5) * 18;
        const len = 0.35 + pseudoRand(seed, 14) * 0.25;

        pos[i * 6] = resetX;
        pos[i * 6 + 1] = resetY;
        pos[i * 6 + 2] = resetZ;

        pos[i * 6 + 3] = resetX - 0.06;
        pos[i * 6 + 4] = resetY + len;
        pos[i * 6 + 5] = resetZ + 0.04;
      }
    }

    if (lineGeoRef.current) {
      lineGeoRef.current.attributes.position.needsUpdate = true;
    }
    if (lineMatRef.current) {
      lineMatRef.current.opacity = rainOpacity.current;
    }

    // Update Water Ripples
    if (ripplesRef.current) {
      for (let i = 0; i < RIPPLE_COUNT; i++) {
        const r = rippleData[i];
        r.progress += dt * r.speed;
        if (r.progress >= 1) {
          r.progress = 0;
          r.x = (pseudoRand(i + 40, 15) - 0.5) * 11;
          r.z = (pseudoRand(i + 40, 16) - 0.5) * 11;
        }

        const currentScale = r.progress * r.maxScale;
        dummy.position.set(r.x, 0.035, r.z);
        dummy.rotation.set(-Math.PI / 2, 0, 0);
        dummy.scale.set(currentScale, currentScale, 1);
        dummy.updateMatrix();

        ripplesRef.current.setMatrixAt(i, dummy.matrix);
      }
      ripplesRef.current.instanceMatrix.needsUpdate = true;
      (ripplesRef.current.material as THREE.MeshBasicMaterial).opacity = rainOpacity.current * 0.55;
    }
  });

  return (
    <group>
      {/* Falling Raindrop Line Segments */}
      <lineSegments frustumCulled={false}>
        <bufferGeometry ref={lineGeoRef}>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          ref={lineMatRef}
          color="#93c5fd"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* Surface Water Ripples */}
      <instancedMesh
        ref={ripplesRef}
        args={[undefined, undefined, RIPPLE_COUNT]}
        frustumCulled={false}
      >
        <ringGeometry args={[0.08, 0.12, 16]} />
        <meshBasicMaterial
          color="#bae6fd"
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </instancedMesh>
    </group>
  );
}

/* ================================================================== */
/* 2. GOLDEN SUNBEAM DUST & POLLEN MOTES                              */
/* ================================================================== */

const POLLEN_COUNT = 110;

function SunbeamDustSystem() {
  const pointsRef = useRef<THREE.Points>(null!);
  const matRef = useRef<THREE.ShaderMaterial>(null!);
  const opacityRef = useRef(0);

  const { geometry, material } = useMemo(() => {
    const pos = new Float32Array(POLLEN_COUNT * 3);
    const seeds = new Float32Array(POLLEN_COUNT * 2);

    for (let i = 0; i < POLLEN_COUNT; i++) {
      pos[i * 3] = (pseudoRand(i, 20) - 0.5) * 13;
      pos[i * 3 + 1] = 0.3 + pseudoRand(i, 21) * 4.5;
      pos[i * 3 + 2] = (pseudoRand(i, 22) - 0.5) * 13;

      seeds[i * 2] = pseudoRand(i, 23) * Math.PI * 2;
      seeds[i * 2 + 1] = 0.5 + pseudoRand(i, 24) * 1.5; // oscillation speed
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 2));

    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uOpacity: { value: 0 },
      },
      vertexShader: /* glsl */ `
        uniform float uTime;
        attribute vec2 aSeed;
        varying float vAlpha;

        void main() {
          vec3 p = position;
          // Brownian gentle float
          p.x += sin(uTime * aSeed.y * 0.4 + aSeed.x) * 0.35;
          p.y += sin(uTime * aSeed.y * 0.6 + aSeed.x * 2.0) * 0.25;
          p.z += cos(uTime * aSeed.y * 0.5 + aSeed.x * 1.5) * 0.35;

          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = (2.2 + sin(uTime * 2.0 + aSeed.x) * 1.2) * (35.0 / -mv.z);
          vAlpha = 0.4 + 0.6 * sin(uTime * 1.8 + aSeed.x);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uOpacity;
        varying float vAlpha;

        void main() {
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.05, d) * vAlpha * uOpacity;
          if (a < 0.01) discard;
          // Warm golden pollen glow
          gl_FragColor = vec4(1.0, 0.92, 0.65, a);
        }
      `,
    });

    return { geometry: geo, material: mat };
  }, []);

  useFrame((state, delta) => {
    const phase = phaseStore.get();
    const targetOpacity = phase === "day" ? 0.85 : phase === "golden" ? 0.95 : 0;
    opacityRef.current += (targetOpacity - opacityRef.current) * Math.min(1, delta * 3.0);

    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      matRef.current.uniforms.uOpacity.value = opacityRef.current;
    }
  });

  return (
    <points ref={pointsRef} args={[geometry]} frustumCulled={false}>
      <primitive object={material} ref={matRef} attach="material" />
    </points>
  );
}

/* ================================================================== */
/* 3. BIOLUMINESCENT FIREFLIES AT NIGHT                               */
/* ================================================================== */

const FIREFLY_COUNT = 65;

function NightFirefliesSystem() {
  const pointsRef = useRef<THREE.Points>(null!);
  const matRef = useRef<THREE.ShaderMaterial>(null!);
  const opacityRef = useRef(0);

  const { geometry, material } = useMemo(() => {
    const pos = new Float32Array(FIREFLY_COUNT * 3);
    const seeds = new Float32Array(FIREFLY_COUNT * 3);

    for (let i = 0; i < FIREFLY_COUNT; i++) {
      pos[i * 3] = (pseudoRand(i, 30) - 0.5) * 11;
      pos[i * 3 + 1] = 0.4 + pseudoRand(i, 31) * 2.2;
      pos[i * 3 + 2] = (pseudoRand(i, 32) - 0.5) * 11;

      seeds[i * 3] = pseudoRand(i, 33) * Math.PI * 2;
      seeds[i * 3 + 1] = 0.4 + pseudoRand(i, 34) * 0.8; // speed
      seeds[i * 3 + 2] = pseudoRand(i, 35); // color mix: green-gold
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aParams", new THREE.BufferAttribute(seeds, 3));

    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uOpacity: { value: 0 },
      },
      vertexShader: /* glsl */ `
        uniform float uTime;
        attribute vec3 aParams;
        varying float vAlpha;
        varying float vMix;

        void main() {
          vec3 p = position;
          float t = uTime * aParams.y;
          // Organic curved flight path around trees
          p.x += sin(t + aParams.x) * 0.65;
          p.y += sin(t * 1.6 + aParams.x) * 0.4;
          p.z += cos(t * 1.2 + aParams.x) * 0.65;

          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          // Rhythmic breathing light pulse
          float pulse = pow(sin(t * 3.2 + aParams.x) * 0.5 + 0.5, 2.0);
          gl_PointSize = (3.5 + pulse * 4.5) * (35.0 / -mv.z);
          vAlpha = 0.2 + 0.8 * pulse;
          vMix = aParams.z;
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uOpacity;
        varying float vAlpha;
        varying float vMix;

        void main() {
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.05, d) * vAlpha * uOpacity;
          if (a < 0.01) discard;

          // Bioluminescent glow from yellow-green to soft chartreuse
          vec3 col = mix(vec3(0.72, 0.98, 0.22), vec3(1.0, 0.88, 0.35), vMix);
          gl_FragColor = vec4(col, a);
        }
      `,
    });

    return { geometry: geo, material: mat };
  }, []);

  useFrame((state, delta) => {
    const phase = phaseStore.get();
    const targetOpacity = phase === "night" ? 0.95 : 0;
    opacityRef.current += (targetOpacity - opacityRef.current) * Math.min(1, delta * 3.0);

    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      matRef.current.uniforms.uOpacity.value = opacityRef.current;
    }
  });

  return (
    <points ref={pointsRef} args={[geometry]} frustumCulled={false}>
      <primitive object={material} ref={matRef} attach="material" />
    </points>
  );
}

/* ================================================================== */
/* MAIN EXPORT: COMBINED WEATHER EFFECTS ENGINE                       */
/* ================================================================== */

export function WeatherEffects() {
  return (
    <group name="weather-effects">
      {/* 🌧️ Mekong Delta Rain System */}
      <MekongRainSystem />

      {/* ☀️ Golden Sunbeam Dust System */}
      <SunbeamDustSystem />

      {/* ✨ Night Fireflies System */}
      <NightFirefliesSystem />
    </group>
  );
}
