"use client";

/* eslint-disable react-hooks/immutability, react-hooks/purity --
   three.js is imperative by design: uniforms/geometry are built once and
   mutated every frame in useFrame; Math.random seeds the starfield. */

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { journey, clamp01, smoothstep, type JourneyKey } from "@/lib/journey-store";
import { HeroParticles } from "./hero-particles";
import { getGlowTexture } from "./glow-texture";

gsap.registerPlugin(ScrollTrigger);

/* ------------------------------------------------------------------ */
/* Camera choreography                                                 */
/* ------------------------------------------------------------------ */

/**
 * One pose per `[data-zone]` section, in the order the sections appear in
 * the DOM. The journey runs along -Z: the camera flies from the hero text
 * through four company checkpoints, past the project slabs, the skills
 * cluster, and ends at the contact beacon.
 */
const POSES: Record<string, { pos: [number, number, number]; look: [number, number, number] }> = {
  hero: { pos: [0, 0.3, 11], look: [0, 0.2, 0] },
  about: { pos: [1.6, 0.5, 6.5], look: [0.4, 0.2, -3] },
  "exp-1": { pos: [0.5, 0, 0.5], look: [-0.6, 0, -12] },
  "exp-2": { pos: [-0.4, 0.2, -11], look: [0.7, 0.15, -23] },
  "exp-3": { pos: [0.3, -0.1, -22], look: [-0.6, 0.25, -34] },
  "exp-4": { pos: [-0.3, 0.25, -33], look: [0.3, -0.1, -45] },
  projects: { pos: [0, 0, -50], look: [0, 0.1, -62] },
  skills: { pos: [0, 0.35, -68], look: [0, 0, -80] },
  contact: { pos: [0, 0.2, -86], look: [0, 0, -97] },
};

function CameraRig() {
  const camera = useThree((s) => s.camera);
  const smoothedLook = useRef(new THREE.Vector3(0, 0.2, 0));
  const tmpPos = useMemo(() => new THREE.Vector3(), []);
  const tmpLook = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    const keys = journey.keys;
    if (keys.length >= 2) {
      const p = clamp01(journey.progress);
      let i = 0;
      while (i < keys.length - 2 && p > keys[i + 1].f) i++;
      const a = keys[i];
      const b = keys[i + 1];
      const t = smoothstep(clamp01((p - a.f) / Math.max(b.f - a.f, 1e-5)));
      tmpPos.lerpVectors(a.pos, b.pos, t);
      tmpLook.lerpVectors(a.look, b.look, t);
    } else {
      tmpPos.set(...POSES.hero.pos);
      tmpLook.set(...POSES.hero.look);
    }

    // gentle cursor parallax on top of the scroll-driven path
    tmpPos.x += journey.pointer.x * 0.35;
    tmpPos.y += journey.pointer.y * 0.25;

    const k = 1 - Math.exp(-5.5 * delta);
    camera.position.lerp(tmpPos, k);
    smoothedLook.current.lerp(tmpLook, k);
    camera.lookAt(smoothedLook.current);
  });

  return null;
}

/**
 * Measures where every `[data-zone]` section sits in the document and turns
 * that into camera keyframes. Re-measured on resize and on ScrollTrigger's
 * refresh (layout changes, fonts loading, accordions expanding...).
 */
function useJourneyKeys() {
  useEffect(() => {
    const compute = () => {
      const els = Array.from(document.querySelectorAll<HTMLElement>("[data-zone]"));
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const keys: JourneyKey[] = [];
      for (const el of els) {
        const pose = POSES[el.dataset.zone ?? ""];
        if (!pose) continue;
        const f = clamp01((el.offsetTop + el.offsetHeight / 2 - window.innerHeight / 2) / max);
        keys.push({
          f,
          pos: new THREE.Vector3(...pose.pos),
          look: new THREE.Vector3(...pose.look),
        });
      }
      if (keys.length >= 2) {
        keys.sort((a, b) => a.f - b.f);
        keys[0].f = 0;
        keys[keys.length - 1].f = 1;
        journey.keys = keys;
      }
    };

    compute();
    ScrollTrigger.addEventListener("refresh", compute);
    window.addEventListener("resize", compute);
    return () => {
      ScrollTrigger.removeEventListener("refresh", compute);
      window.removeEventListener("resize", compute);
      journey.keys = [];
    };
  }, []);
}

/* ------------------------------------------------------------------ */
/* Ambient starfield along the whole route                             */
/* ------------------------------------------------------------------ */

function Stars({ count }: { count: number }) {
  const dpr = useThree((s) => s.viewport.dpr);

  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const phase = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 56;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 2] = 18 - Math.random() * 140;
      phase[i] = Math.random();
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: 1 },
      },
      vertexShader: /* glsl */ `
        uniform float uTime;
        uniform float uPixelRatio;
        attribute float aPhase;
        varying float vAlpha;
        void main() {
          vec3 pos = position;
          pos.x += sin(uTime * 0.05 + aPhase * 6.28) * 0.6;
          vec4 mv = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = (0.8 + aPhase * 1.6) * uPixelRatio * (26.0 / -mv.z);
          vAlpha = 0.18 + 0.32 * (0.5 + 0.5 * sin(uTime * (0.4 + aPhase) + aPhase * 50.0));
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float alpha = smoothstep(0.5, 0.1, d) * vAlpha;
          if (alpha < 0.01) discard;
          gl_FragColor = vec4(vec3(0.85, 0.92, 1.0), alpha);
        }
      `,
    });
    return { geometry, material };
  }, [count]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame((_, delta) => {
    material.uniforms.uTime.value += delta;
    material.uniforms.uPixelRatio.value = dpr;
  });

  return <points args={[geometry, material]} frustumCulled={false} />;
}

/* ------------------------------------------------------------------ */
/* Experience checkpoints — glowing gates the camera flies through     */
/* ------------------------------------------------------------------ */

const GATE_COLORS = ["#22d3ee", "#a78bfa", "#f472b6", "#fbbf24"];

function CheckpointGate({
  position,
  color,
  index,
}: {
  position: [number, number, number];
  color: string;
  index: number;
}) {
  const ring = useRef<THREE.Mesh>(null!);
  const core = useRef<THREE.Mesh>(null!);
  const orb = useRef<THREE.Mesh>(null!);
  const glow = useRef<THREE.Mesh>(null!);
  const glowTexture = useMemo(() => getGlowTexture(), []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    ring.current.rotation.z += delta * 0.15;
    core.current.rotation.y += delta * 0.45;
    core.current.rotation.x += delta * 0.2;
    core.current.scale.setScalar(1 + Math.sin(t * 1.3 + index * 1.7) * 0.06);

    const angle = t * (0.5 + index * 0.1) + index * 2;
    orb.current.position.set(Math.cos(angle) * 2.1, Math.sin(angle) * 2.1, 0);

    // glow ramps up as the camera approaches, so each gate "arrives"
    const d = Math.abs(state.camera.position.z - position[2]);
    const proximity = clamp01(1 - d / 20);
    (glow.current.material as THREE.MeshBasicMaterial).opacity = 0.32 * proximity * proximity;
  });

  return (
    <group position={position}>
      <mesh ref={ring}>
        <torusGeometry args={[1.7, 0.03, 12, 96]} />
        <meshBasicMaterial color={color} transparent opacity={0.9} />
      </mesh>
      <mesh ref={glow} scale={7}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={glowTexture}
          color={color}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          fog={false}
        />
      </mesh>
      <mesh ref={core}>
        <icosahedronGeometry args={[0.55, 0]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.8} />
      </mesh>
      <mesh ref={orb}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Projects zone — floating slabs (the HTML cards carry the content)   */
/* ------------------------------------------------------------------ */

const PROJECT_SLABS: Array<{
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
  speed: number;
  phase: number;
}> = [
  { position: [-2.9, 0.7, -60], rotation: [0.05, 0.5, 0.02], color: "#22d3ee", speed: 0.7, phase: 0 },
  { position: [2.9, -0.5, -63], rotation: [-0.04, -0.45, -0.03], color: "#f472b6", speed: 0.55, phase: 2 },
  { position: [-2.2, 1.3, -66], rotation: [0.03, 0.35, 0.05], color: "#a78bfa", speed: 0.62, phase: 4 },
];

function ProjectSlab({ config }: { config: (typeof PROJECT_SLABS)[number] }) {
  const group = useRef<THREE.Group>(null!);
  const glow = useRef<THREE.Mesh>(null!);
  const glowTexture = useMemo(() => getGlowTexture(), []);

  const edges = useMemo(() => {
    const box = new THREE.BoxGeometry(2.5, 1.55, 0.06);
    const edges = new THREE.EdgesGeometry(box);
    box.dispose();
    return edges;
  }, []);

  useEffect(() => () => edges.dispose(), [edges]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    group.current.position.y = config.position[1] + Math.sin(t * config.speed + config.phase) * 0.16;
    group.current.rotation.z = config.rotation[2] + Math.sin(t * config.speed * 0.8 + config.phase) * 0.02;
    const d = Math.abs(state.camera.position.z - config.position[2]);
    const proximity = clamp01(1 - d / 22);
    (glow.current.material as THREE.MeshBasicMaterial).opacity = 0.22 * proximity * proximity;
    group.current.rotation.y += 0; // keep authored tilt; bob is the motion
    void delta;
  });

  return (
    <group ref={group} position={config.position} rotation={config.rotation}>
      <lineSegments>
        <primitive object={edges} attach="geometry" />
        <lineBasicMaterial color={config.color} transparent opacity={0.75} />
      </lineSegments>
      <mesh>
        <boxGeometry args={[2.5, 1.55, 0.06]} />
        <meshBasicMaterial color={config.color} transparent opacity={0.05} />
      </mesh>
      <mesh ref={glow} scale={5}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={glowTexture}
          color={config.color}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          fog={false}
        />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Skills zone — a slowly turning cluster of wireframe solids          */
/* ------------------------------------------------------------------ */

function fibonacciSphere(n: number, radius: number): Array<[number, number, number]> {
  const pts: Array<[number, number, number]> = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    pts.push([Math.cos(theta) * r * radius, y * radius, Math.sin(theta) * r * radius]);
  }
  return pts;
}

function SkillCluster({ count }: { count: number }) {
  const group = useRef<THREE.Group>(null!);
  const glow = useRef<THREE.Mesh>(null!);
  const glowTexture = useMemo(() => getGlowTexture(), []);

  const shapes = useMemo(() => {
    const positions = fibonacciSphere(count, 2.4);
    const geometries = [
      new THREE.OctahedronGeometry(0.24),
      new THREE.IcosahedronGeometry(0.24, 0),
      new THREE.TetrahedronGeometry(0.28),
    ];
    return positions.map((position, i) => ({
      position,
      geometry: geometries[i % geometries.length],
      color: GATE_COLORS[i % GATE_COLORS.length],
      speed: 0.3 + (i % 4) * 0.12,
      phase: i,
    }));
  }, [count]);

  useEffect(
    () => () => {
      shapes.forEach((s) => s.geometry.dispose());
    },
    [shapes],
  );

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    group.current.rotation.y += delta * 0.12;
    group.current.children.forEach((child, i) => {
      child.rotation.x += delta * (0.4 + i * 0.03);
      child.rotation.y += delta * (0.3 + i * 0.02);
    });
    const d = Math.abs(state.camera.position.z + 80);
    const proximity = clamp01(1 - d / 22);
    (glow.current.material as THREE.MeshBasicMaterial).opacity = 0.26 * proximity * proximity;
    void t;
  });

  return (
    <group position={[0, 0, -80]}>
      <mesh ref={glow} scale={6}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={glowTexture}
          color="#a78bfa"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          fog={false}
        />
      </mesh>
      <group ref={group}>
        {shapes.map((shape, i) => (
          <mesh key={i} position={shape.position} geometry={shape.geometry}>
            <meshBasicMaterial color={shape.color} wireframe transparent opacity={0.85} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Contact beacon — the destination at the end of the route            */
/* ------------------------------------------------------------------ */

function Beacon() {
  const outer = useRef<THREE.Mesh>(null!);
  const inner = useRef<THREE.Mesh>(null!);
  const glow = useRef<THREE.Mesh>(null!);
  const glowTexture = useMemo(() => getGlowTexture(), []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    outer.current.rotation.z += delta * 0.1;
    inner.current.rotation.z -= delta * 0.22;
    const pulse = 1 + Math.sin(t * 1.4) * 0.05;
    outer.current.scale.setScalar(pulse);
    const d = Math.abs(state.camera.position.z + 97);
    const proximity = clamp01(1 - d / 26);
    (glow.current.material as THREE.MeshBasicMaterial).opacity = 0.4 * proximity * proximity;
    void t;
  });

  return (
    <group position={[0, 0, -97]}>
      <mesh ref={glow} scale={11}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={glowTexture}
          color="#22d3ee"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          fog={false}
        />
      </mesh>
      <mesh ref={outer}>
        <torusGeometry args={[2.3, 0.035, 12, 120]} />
        <meshBasicMaterial color="#67e8f9" transparent opacity={0.9} />
      </mesh>
      <mesh ref={inner}>
        <torusGeometry args={[1.45, 0.02, 10, 90]} />
        <meshBasicMaterial color="#f0abfc" transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* The route itself — a faint spline through every camera pose         */
/* ------------------------------------------------------------------ */

function RouteLine() {
  const line = useMemo(() => {
    const points = Object.values(POSES).map((p) => new THREE.Vector3(...p.pos));
    const curve = new THREE.CatmullRomCurve3(points);
    const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(220));
    const material = new THREE.LineBasicMaterial({
      color: "#22d3ee",
      transparent: true,
      opacity: 0.14,
    });
    return new THREE.Line(geometry, material);
  }, []);

  useEffect(
    () => () => {
      line.geometry.dispose();
      (line.material as THREE.Material).dispose();
    },
    [line],
  );

  return <primitive object={line} />;
}

/* ------------------------------------------------------------------ */

export function JourneyWorld() {
  useJourneyKeys();
  const starCount = journey.tier === "low" ? 600 : 1400;
  const skillCount = journey.tier === "low" ? 8 : 12;

  const gates: Array<[number, number, number]> = [
    POSES["exp-1"].look,
    POSES["exp-2"].look,
    POSES["exp-3"].look,
    POSES["exp-4"].look,
  ];

  return (
    <>
      <CameraRig />
      <HeroParticles />
      <Stars count={starCount} />
      <RouteLine />
      {gates.map((position, i) => (
        <CheckpointGate key={i} position={position} color={GATE_COLORS[i]} index={i} />
      ))}
      {PROJECT_SLABS.map((config, i) => (
        <ProjectSlab key={i} config={config} />
      ))}
      <SkillCluster count={skillCount} />
      <Beacon />
    </>
  );
}
