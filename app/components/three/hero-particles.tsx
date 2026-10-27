"use client";

/* eslint-disable react-hooks/immutability --
   three.js is imperative by design: uniforms/geometry are built once and
   mutated every frame in useFrame; Math.random seeds the particle field. */

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { journey, clamp01, smoothstep } from "@/lib/journey-store";
import { sampleTextPoints } from "./text-points";

const ORIGIN = new THREE.Vector3(0, 0, 0);
/** world-space lift of the particle name, mirrored in useFrame */
const GROUP_Y = 1.1;

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uReveal;
  uniform float uScatter;
  uniform float uPixelRatio;
  uniform float uSize;
  uniform vec2 uPointer;

  attribute vec3 aTarget;
  attribute float aRand;
  attribute float aSize;

  varying float vRand;
  varying float vFade;

  void main() {
    vRand = aRand;

    // staggered assembly: each particle joins a bit later than the last
    float r = clamp(uReveal * 1.35 - aRand * 0.35, 0.0, 1.0);
    r = 1.0 - pow(1.0 - r, 3.0);
    vec3 pos = mix(position, aTarget, r);

    // idle breathing so the letters feel alive while you read
    pos.x += sin(uTime * (0.5 + aRand) + aRand * 40.0) * 0.05;
    pos.y += cos(uTime * (0.4 + aRand) + aRand * 80.0) * 0.05;

    // cursor repulsion, in world space at the text plane
    vec2 toPointer = pos.xy - uPointer;
    float dist = length(toPointer);
    float force = smoothstep(2.0, 0.0, dist);
    pos.xy += (toPointer / max(dist, 0.001)) * force * 0.6;

    // scrolling away blows the letters apart along a per-particle direction
    vec3 dir = normalize(vec3(
      sin(aRand * 640.0),
      cos(aRand * 320.0),
      (aRand - 0.5) * 2.0
    ));
    pos += dir * uScatter * (2.5 + aRand * 10.0);

    vFade = r * (1.0 - uScatter);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = uSize * aSize * uPixelRatio * (9.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;

  varying float vRand;
  varying float vFade;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float alpha = smoothstep(0.5, 0.12, d) * vFade;
    if (alpha < 0.01) discard;

    vec3 color = mix(uColorA, uColorB, vRand);
    color = mix(color, vec3(1.0), smoothstep(0.28, 0.0, d) * 0.35);
    gl_FragColor = vec4(color, alpha);
  }
`;

/**
 * The hero: the name "HUY" assembled from ~6k shader points that react to
 * the cursor and blow apart as you scroll into the journey.
 */
export function HeroParticles() {
  const group = useRef<THREE.Group>(null!);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  // viewport.width is in CSS pixels; getCurrentViewport gives world units
  const viewport = useThree((s) => s.viewport);
  const pixelRatio = useThree((s) => s.viewport.dpr);

  const count = journey.tier === "low" ? 3200 : 6000;

  const { geometry, material } = useMemo(() => {
    const points = sampleTextPoints("HUY", count);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(points.starts, 3));
    geometry.setAttribute("aTarget", new THREE.BufferAttribute(points.targets, 3));
    geometry.setAttribute("aRand", new THREE.BufferAttribute(points.rand, 1));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(points.size, 1));

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uReveal: { value: journey.reduced ? 1 : 0 },
        uScatter: { value: 0 },
        uPixelRatio: { value: 1 },
        uSize: { value: 2.1 },
        uPointer: { value: new THREE.Vector2(999, 999) },
        uColorA: { value: new THREE.Color("#67e8f9") },
        uColorB: { value: new THREE.Color("#f0abfc") },
      },
    });
    return { geometry, material };
  }, [count]);

  useEffect(() => {
    const uniforms = material.uniforms;
    if (journey.reduced) {
      uniforms.uReveal.value = 1;
      return;
    }
    const tween = gsap.to(uniforms.uReveal, {
      value: 1,
      duration: 2.6,
      ease: "power2.inOut",
      delay: 0.35,
    });
    return () => {
      tween.kill();
    };
  }, [material]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame((_, delta) => {
    const u = material.uniforms;
    u.uTime.value += delta;
    u.uPixelRatio.value = pixelRatio;

    const target = smoothstep(clamp01((journey.progress - 0.02) / 0.14));
    u.uScatter.value += (target - u.uScatter.value) * Math.min(1, delta * 6);

    // World units visible at the text plane (z = 0) with the current camera
    const worldWidth = viewport.getCurrentViewport(camera, ORIGIN).width;

    // Keep the name ~70% of the viewport width on any aspect ratio, and
    // lifted to the upper half so the HTML hero copy owns the bottom.
    const scale = Math.min(1.35, Math.max(0.42, (worldWidth * 0.7) / 9.5));
    group.current.scale.setScalar(scale);

    // The shader runs in object space; convert the world-space cursor into
    // this group's local space so repulsion tracks the real cursor.
    u.uPointer.value.set(
      (journey.pointer.x * worldWidth * 0.5) / scale,
      (journey.pointer.y * (worldWidth / camera.aspect) - GROUP_Y) / scale,
    );
  });

  return (
    <group ref={group} position={[0, 1.1, 0]}>
      <points args={[geometry, material]} frustumCulled={false} />
    </group>
  );
}
