"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Hotspot } from "./hotspots";
import { Cat } from "./cat";
import { getRig } from "./lighting";
import { boot } from "./boot";
import { useProximity } from "@/lib/proximity-store";
import { createTerminalCanvas, drawTerminalToCanvas } from "./terminal-canvas";
import { getTerminalSnapshot } from "@/lib/terminal-store";

/** Low-poly cartoon smoke puffs rising from the chimney */
function ChimneySmoke() {
  const p1 = useRef<THREE.Mesh>(null!);
  const p2 = useRef<THREE.Mesh>(null!);
  const p3 = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.9;
    const animatePuff = (mesh: THREE.Mesh, offset: number) => {
      if (!mesh) return;
      const progress = ((t + offset) % 2) / 2;
      mesh.position.y = 1.95 + progress * 0.75;
      mesh.position.x = 0.55 + Math.sin(progress * 3) * 0.08;
      const s = 0.08 + progress * 0.14;
      mesh.scale.setScalar(s);
      const m = mesh.material as THREE.MeshStandardMaterial;
      m.opacity = Math.sin(progress * Math.PI) * 0.7;
    };
    animatePuff(p1.current, 0);
    animatePuff(p2.current, 0.65);
    animatePuff(p3.current, 1.3);
  });

  return (
    <group>
      <mesh ref={p1} position={[0.55, 1.95, -0.4]}>
        <sphereGeometry args={[1, 7, 7]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.3}
          transparent
          opacity={0.65}
          roughness={0.6}
          flatShading
        />
      </mesh>
      <mesh ref={p2} position={[0.55, 1.95, -0.4]}>
        <sphereGeometry args={[1, 7, 7]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.3}
          transparent
          opacity={0.65}
          roughness={0.6}
          flatShading
        />
      </mesh>
      <mesh ref={p3} position={[0.55, 1.95, -0.4]}>
        <sphereGeometry args={[1, 7, 7]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.3}
          transparent
          opacity={0.65}
          roughness={0.6}
          flatShading
        />
      </mesh>
    </group>
  );
}

/** Cozy Lo-Fi Indie Dev Desk setup in the cottage garden */
function DevDesk() {
  const steam1 = useRef<THREE.Mesh>(null!);
  const steam2 = useRef<THREE.Mesh>(null!);
  const screenLightRef = useRef<THREE.PointLight>(null!);
  const lastBlink = useRef(0);
  const cursorVis = useRef(true);

  const terminalCanvas = useMemo(() => createTerminalCanvas(), []);
  const terminalTex = useMemo(() => {
    const tex = new THREE.CanvasTexture(terminalCanvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [terminalCanvas]);

  useEffect(() => () => terminalTex.dispose(), [terminalTex]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (steam1.current) {
      const p1 = (t * 0.7) % 1;
      steam1.current.position.y = 0.38 + p1 * 0.08;
      steam1.current.position.x = 0.17 + Math.sin(t * 3) * 0.008;
      const m1 = steam1.current.material as THREE.MeshStandardMaterial;
      m1.opacity = Math.sin(p1 * Math.PI) * 0.45;
      steam1.current.scale.setScalar(0.008 + p1 * 0.012);
    }
    if (steam2.current) {
      const p2 = (t * 0.7 + 0.5) % 1;
      steam2.current.position.y = 0.38 + p2 * 0.08;
      steam2.current.position.x = 0.17 + Math.sin(t * 3 + 2) * 0.008;
      const m2 = steam2.current.material as THREE.MeshStandardMaterial;
      m2.opacity = Math.sin(p2 * Math.PI) * 0.45;
      steam2.current.scale.setScalar(0.008 + p2 * 0.012);
    }

    // Blink cursor every 0.42s
    if (t - lastBlink.current > 0.42) {
      lastBlink.current = t;
      cursorVis.current = !cursorVis.current;
    }

    const term = getTerminalSnapshot();
    drawTerminalToCanvas(
      terminalCanvas,
      term.theme,
      term.lines,
      term.currentInput,
      cursorVis.current,
    );
    // eslint-disable-next-line react-hooks/immutability
    terminalTex.needsUpdate = true;

    if (screenLightRef.current) {
      const themeColor =
        term.theme === "green" ? "#22c55e" : term.theme === "cyan" ? "#06b6d4" : "#ffb000";
      screenLightRef.current.color.set(themeColor);
      screenLightRef.current.intensity = term.isOpen ? 1.4 : 0.6;
    }
  });

  return (
    <group>
      {/* Wooden Table Top */}
      <mesh position={[0, 0.32, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.52, 0.028, 0.3]} />
        <meshStandardMaterial color="#6b4423" roughness={0.7} />
      </mesh>

      {/* Under-desk Drawer */}
      <mesh position={[0.12, 0.28, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.18, 0.05, 0.26]} />
        <meshStandardMaterial color="#553518" roughness={0.8} />
      </mesh>
      {/* Drawer brass handle */}
      <mesh position={[0.12, 0.28, 0.135]}>
        <boxGeometry args={[0.04, 0.008, 0.01]} />
        <meshStandardMaterial color="#fcd34d" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* 4 Wooden Table Legs */}
      {[
        [-0.23, 0.16, -0.12],
        [0.23, 0.16, -0.12],
        [-0.23, 0.16, 0.12],
        [0.23, 0.16, 0.12],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <cylinderGeometry args={[0.014, 0.014, 0.32, 5]} />
          <meshStandardMaterial color="#553518" roughness={0.8} />
        </mesh>
      ))}

      {/* Stool with cushion */}
      <group position={[0, 0, 0.24]}>
        <mesh position={[0, 0.17, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.09, 0.024, 12]} />
          <meshStandardMaterial color="#1e293b" roughness={0.8} />
        </mesh>
        {[
          [-0.06, 0.085, -0.06],
          [0.06, 0.085, -0.06],
          [-0.06, 0.085, 0.06],
          [0.06, 0.085, 0.06],
        ].map(([x, y, z], i) => (
          <mesh key={i} position={[x, y, z]} castShadow>
            <cylinderGeometry args={[0.009, 0.009, 0.17, 5]} />
            <meshStandardMaterial color="#553518" roughness={0.8} />
          </mesh>
        ))}
      </group>

      {/* Laptop */}
      <group position={[-0.04, 0.334, 0]}>
        {/* Base chassis */}
        <mesh position={[0, 0.006, 0]} castShadow>
          <boxGeometry args={[0.18, 0.012, 0.13]} />
          <meshStandardMaterial color="#334155" metalness={0.5} roughness={0.4} />
        </mesh>
        {/* Keyboard recess */}
        <mesh position={[0, 0.013, 0.01]}>
          <boxGeometry args={[0.15, 0.004, 0.07]} />
          <meshStandardMaterial color="#0f172a" roughness={0.9} />
        </mesh>
        {/* Trackpad */}
        <mesh position={[0, 0.013, 0.05]}>
          <boxGeometry args={[0.05, 0.002, 0.03]} />
          <meshStandardMaterial color="#1e293b" roughness={0.6} />
        </mesh>

        {/* Screen Lid (angled slightly backward) */}
        <group position={[0, 0.012, -0.065]} rotation={[-0.32, 0, 0]}>
          <mesh position={[0, 0.06, 0]} castShadow>
            <boxGeometry args={[0.18, 0.12, 0.008]} />
            <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.4} />
          </mesh>
          {/* Live Dynamic 3D CRT Terminal Display Screen */}
          <mesh position={[0, 0.06, 0.005]}>
            <planeGeometry args={[0.164, 0.104]} />
            <meshStandardMaterial
              map={terminalTex}
              emissiveMap={terminalTex}
              emissive="#ffffff"
              emissiveIntensity={1.8}
              roughness={0.2}
            />
          </mesh>
          {/* Screen Light illuminating the desk & keyboard */}
          <pointLight
            ref={screenLightRef}
            position={[0, 0.06, 0.08]}
            color="#ffb000"
            intensity={0.6}
            distance={1.2}
            decay={2}
          />
        </group>
      </group>

      {/* Cozy Desk Gooseneck Lamp */}
      <group position={[-0.19, 0.334, -0.06]}>
        {/* Base */}
        <mesh position={[0, 0.006, 0]} castShadow>
          <cylinderGeometry args={[0.028, 0.028, 0.012, 8]} />
          <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Stem */}
        <mesh position={[0.015, 0.06, 0]} rotation={[0, 0, -0.25]} castShadow>
          <cylinderGeometry args={[0.005, 0.005, 0.11, 6]} />
          <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Lamp Shade */}
        <mesh position={[0.035, 0.11, 0.02]} rotation={[0.4, 0, -0.5]} castShadow>
          <coneGeometry args={[0.025, 0.04, 8]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
        </mesh>
        {/* Lamp Bulb & Warm Point Light */}
        <mesh position={[0.035, 0.105, 0.02]}>
          <sphereGeometry args={[0.01, 8, 8]} />
          <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={3} />
        </mesh>
        <pointLight
          position={[0.035, 0.105, 0.02]}
          color="#fef08a"
          intensity={0.65}
          distance={0.9}
          decay={2}
        />
      </group>

      {/* Steaming Coffee Mug */}
      <group position={[0.17, 0.334, 0.04]}>
        {/* Mug body */}
        <mesh position={[0, 0.022, 0]} castShadow>
          <cylinderGeometry args={[0.02, 0.016, 0.044, 10]} />
          <meshStandardMaterial color="#fed7aa" roughness={0.6} />
        </mesh>
        {/* Dark espresso coffee inside */}
        <mesh position={[0, 0.038, 0]}>
          <cylinderGeometry args={[0.017, 0.017, 0.004, 10]} />
          <meshStandardMaterial color="#2d1b0d" roughness={0.3} />
        </mesh>
        {/* Steam Puffs */}
        <mesh ref={steam1} position={[0, 0.05, 0]}>
          <sphereGeometry args={[1, 6, 6]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.4}
            roughness={0.9}
            flatShading
          />
        </mesh>
        <mesh ref={steam2} position={[0, 0.05, 0]}>
          <sphereGeometry args={[1, 6, 6]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.4}
            roughness={0.9}
            flatShading
          />
        </mesh>
      </group>

      {/* Tiny Succulent Pot on Desk */}
      <group position={[0.18, 0.334, -0.08]}>
        <mesh position={[0, 0.015, 0]} castShadow>
          <cylinderGeometry args={[0.018, 0.013, 0.03, 8]} />
          <meshStandardMaterial color="#c2410c" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.035, 0]} castShadow>
          <dodecahedronGeometry args={[0.02, 0]} />
          <meshStandardMaterial color="#15803d" roughness={0.7} flatShading />
        </mesh>
      </group>
    </group>
  );
}

/**
 * District 1: Huy's House (Nhà → About me)
 * Cozy cottage: cream stucco walls, terracotta roof, timber beams,
 * warm glowing windows, smoking chimney, blooming sakura, and mascot cat.
 */
export function DistrictHouse() {
  const windowMat = useRef<THREE.MeshStandardMaterial>(null!);
  const mailFlagRef = useRef<THREE.Mesh>(null!);
  const envelopeRef = useRef<THREE.Mesh>(null!);
  const rig = getRig();
  const { mailboxOpen } = useProximity();

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    if (windowMat.current) {
      const b = boot.value;
      windowMat.current.emissiveIntensity = rig.neon * b * 2.4;
    }
    if (mailFlagRef.current) {
      const targetAngle = mailboxOpen ? 1.55 : 0.4;
      mailFlagRef.current.rotation.z = THREE.MathUtils.damp(
        mailFlagRef.current.rotation.z,
        targetAngle,
        8,
        dt,
      );
    }
    if (envelopeRef.current) {
      const targetY = mailboxOpen ? 0.48 : 0.35;
      const targetScale = mailboxOpen ? 1 : 0.001;
      envelopeRef.current.position.y = THREE.MathUtils.damp(
        envelopeRef.current.position.y,
        targetY,
        8,
        dt,
      );
      envelopeRef.current.scale.setScalar(targetScale);
    }
  });

  return (
    <group position={[-3.4, 0.3, 2.3]} rotation={[0, 0.35, 0]}>
      {/* Interactive Hotspot for the house -> About me */}
      <Hotspot
        position={[0, 1.1, 0]}
        radius={1.6}
        height={1.8}
        glowY={-0.8}
        label="About me"
        target="about"
      >
        {/* Main house walls: warm cream plaster */}
        <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.7, 1.1, 1.5]} />
          <meshStandardMaterial color="#faf6ec" roughness={0.8} />
        </mesh>
        {/* Stone foundation base */}
        <mesh position={[0, 0.08, 0]} receiveShadow>
          <boxGeometry args={[1.78, 0.16, 1.58]} />
          <meshStandardMaterial color="#948b81" roughness={0.9} flatShading />
        </mesh>

        {/* Terracotta Gable Roof */}
        <mesh position={[0, 1.45, 0]} castShadow receiveShadow>
          <coneGeometry args={[1.38, 0.88, 4]} />
          <meshStandardMaterial color="#df5b3b" roughness={0.7} flatShading />
        </mesh>
        {/* Roof ridge beam */}
        <mesh position={[0, 1.88, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
          <boxGeometry args={[0.08, 0.08, 1.62]} />
          <meshStandardMaterial color="#8c331c" roughness={0.7} />
        </mesh>

        {/* Chimney */}
        <mesh position={[0.55, 1.5, -0.4]} castShadow>
          <boxGeometry args={[0.26, 0.75, 0.26]} />
          <meshStandardMaterial color="#b94c34" roughness={0.85} flatShading />
        </mesh>
        <mesh position={[0.55, 1.9, -0.4]} castShadow>
          <boxGeometry args={[0.32, 0.08, 0.32]} />
          <meshStandardMaterial color="#883523" roughness={0.85} />
        </mesh>
        <ChimneySmoke />

        {/* Wooden front door */}
        <mesh position={[0.2, 0.42, 0.76]} castShadow>
          <boxGeometry args={[0.36, 0.68, 0.04]} />
          <meshStandardMaterial color="#784528" roughness={0.75} />
        </mesh>
        {/* Brass doorknob */}
        <mesh position={[0.32, 0.42, 0.79]}>
          <sphereGeometry args={[0.025, 6, 6]} />
          <meshStandardMaterial color="#facc15" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Windows with emissive night glow */}
        {/* Front window */}
        <group position={[-0.45, 0.58, 0.76]}>
          <mesh>
            <boxGeometry args={[0.46, 0.46, 0.04]} />
            <meshStandardMaterial color="#5c3822" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[0.38, 0.38]} />
            <meshStandardMaterial
              ref={windowMat}
              color="#fef08a"
              emissive="#f59e0b"
              emissiveIntensity={rig.neon * 2.4}
              roughness={0.2}
            />
          </mesh>
        </group>

        {/* Side windows */}
        {[-0.3, 0.3].map((z, idx) => (
          <group key={idx} position={[-0.86, 0.58, z]} rotation={[0, -Math.PI / 2, 0]}>
            <mesh>
              <boxGeometry args={[0.42, 0.42, 0.04]} />
              <meshStandardMaterial color="#5c3822" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0, 0.01]}>
              <planeGeometry args={[0.34, 0.34]} />
              <meshStandardMaterial
                color="#fef08a"
                emissive="#f59e0b"
                emissiveIntensity={rig.neon * 2.4}
                roughness={0.2}
              />
            </mesh>
          </group>
        ))}

        {/* Wooden porch deck & steps */}
        <mesh position={[0.15, 0.08, 1.05]} receiveShadow castShadow>
          <boxGeometry args={[1.1, 0.12, 0.65]} />
          <meshStandardMaterial color="#8f5b35" roughness={0.8} />
        </mesh>
        <mesh position={[0.2, 0.04, 1.45]} receiveShadow castShadow>
          <boxGeometry args={[0.5, 0.07, 0.25]} />
          <meshStandardMaterial color="#7a4b2a" roughness={0.8} />
        </mesh>
        {/* Porch posts */}
        <mesh position={[-0.35, 0.45, 1.32]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.75, 4]} />
          <meshStandardMaterial color="#faf6ec" roughness={0.8} />
        </mesh>
        <mesh position={[0.65, 0.45, 1.32]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.75, 4]} />
          <meshStandardMaterial color="#faf6ec" roughness={0.8} />
        </mesh>
        {/* Porch awning roof */}
        <mesh position={[0.15, 0.85, 1.15]} rotation={[0.25, 0, 0]} castShadow>
          <boxGeometry args={[1.2, 0.06, 0.75]} />
          <meshStandardMaterial color="#df5b3b" roughness={0.7} />
        </mesh>
      </Hotspot>

      {/* Lo-Fi Indie Dev Desk */}
      <Hotspot
        position={[0.38, 0.02, 0.98]}
        radius={0.42}
        height={0.7}
        glowY={0.01}
        label="Lập trình (~ / CLI)"
        target="desk"
      >
        <DevDesk />
      </Hotspot>

      {/* Cat mascot loafing on the porch deck */}
      <Hotspot
        position={[-0.15, 0.16, 1.08]}
        radius={0.36}
        height={0.5}
        glowY={-0.2}
        label="Meow"
        target="meow"
      >
        <group scale={1.15} rotation={[0, 0.5, 0]}>
          <Cat />
        </group>
      </Hotspot>

      {/* Mailbox (Download CV Hotspot) */}
      <Hotspot
        position={[0.75, 0.35, 1.45]}
        radius={0.28}
        height={0.6}
        glowY={-0.28}
        label="Download CV"
        target="resume"
      >
        <mesh position={[0, 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.4, 5]} />
          <meshStandardMaterial color="#553d2d" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.42, 0]} castShadow>
          <boxGeometry args={[0.16, 0.14, 0.24]} />
          <meshStandardMaterial color="#0284c7" roughness={0.4} metalness={0.4} />
        </mesh>
        {/* Animated Mailbox Flag */}
        <mesh ref={mailFlagRef} position={[0.09, 0.47, -0.04]} rotation={[0, 0, 0.4]}>
          <boxGeometry args={[0.02, 0.1, 0.04]} />
          <meshStandardMaterial color="#ef4444" roughness={0.4} />
        </mesh>
        {/* Golden peek envelope emerging on interaction */}
        <mesh ref={envelopeRef} position={[0, 0.35, 0.08]} rotation={[-0.2, 0, 0]}>
          <boxGeometry args={[0.11, 0.015, 0.13]} />
          <meshStandardMaterial
            color="#fef08a"
            roughness={0.3}
            emissive="#fef08a"
            emissiveIntensity={0.25}
          />
        </mesh>
      </Hotspot>

      {/* Sakura / Blossom tree in the front garden */}
      <group position={[-1.3, 0, 1.1]}>
        <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.09, 0.14, 1.2, 5]} />
          <meshStandardMaterial color="#5a3d2b" roughness={0.9} />
        </mesh>
        <mesh position={[0, 1.4, 0]} castShadow receiveShadow>
          <dodecahedronGeometry args={[0.75, 1]} />
          <meshStandardMaterial color="#f472b6" roughness={0.7} flatShading />
        </mesh>
        <mesh position={[0.3, 1.6, 0.2]} castShadow receiveShadow>
          <dodecahedronGeometry args={[0.5, 1]} />
          <meshStandardMaterial color="#fbcfe8" roughness={0.7} flatShading />
        </mesh>
        <mesh position={[-0.25, 1.3, -0.25]} castShadow receiveShadow>
          <dodecahedronGeometry args={[0.52, 1]} />
          <meshStandardMaterial color="#ec4899" roughness={0.7} flatShading />
        </mesh>
      </group>

      {/* Low-poly white picket fence */}
      {[-0.6, -0.2, 0.2, 0.6].map((x, i) => (
        <mesh key={i} position={[-1.1 + x * 0.4, 0.18, 1.8]} castShadow>
          <boxGeometry args={[0.05, 0.32, 0.02]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.7} />
        </mesh>
      ))}
      <mesh position={[-1.1, 0.18, 1.8]}>
        <boxGeometry args={[1.0, 0.03, 0.02]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.7} />
      </mesh>
    </group>
  );
}
