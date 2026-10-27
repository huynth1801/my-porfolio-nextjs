"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { getGlowTexture } from "../glow-texture";
import { getSkylineTexture } from "./textures";
import { getDayPhase, getRig } from "./lighting";
import { toyStore } from "./hotspot-store";

/* Palette shared by every room part */
export const C = {
  wall: "#b5a28c",
  wallShade: "#9d8b76",
  baseboard: "#3a3630",
  floor: "#4a2e1c",
  wood: "#7c4a2a",
  woodLight: "#935c34",
  frameDark: "#23232a",
  metal: "#33333c",
  purple: "#7268e8",
  purpleDark: "#5a50cf",
  keycap: "#e9e7f0",
  caseDark: "#141419",
  fabric: "#9aa0ab",
  fabricDark: "#1c1c22",
  curtain: "#5f7ba4",
  night: "#1d2b4a",
  plant: "#43a05e",
  plantDark: "#2f7d47",
  pot: "#d9d2c7",
  ceramic: "#efece6",
  ledBlue: "#4f8dff",
  rgb: "#35d0ff",
  rug: "#1d1d24",
  rugInner: "#26262e",
} as const;

/* ------------------------------------------------------------------ */
/* Room shell                                                          */
/* ------------------------------------------------------------------ */

export function RoomShell() {
  return (
    <group>
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.85]} receiveShadow>
        <planeGeometry args={[10, 7.4]} />
        <meshStandardMaterial color={C.floor} roughness={0.85} />
      </mesh>
      {/* back wall */}
      <mesh position={[0, 1.85, -2.75]} receiveShadow>
        <planeGeometry args={[10, 3.7]} />
        <meshStandardMaterial color={C.wall} roughness={0.95} />
      </mesh>
      {/* right wall */}
      <mesh position={[4.7, 1.85, 0.85]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[7.4, 3.7]} />
        <meshStandardMaterial color={C.wallShade} roughness={0.95} />
      </mesh>
      {/* baseboards */}
      <mesh position={[0, 0.06, -2.73]}>
        <boxGeometry args={[10, 0.12, 0.04]} />
        <meshStandardMaterial color={C.baseboard} roughness={0.7} />
      </mesh>
      <mesh position={[4.68, 0.06, 0.85]} rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[7.4, 0.12, 0.04]} />
        <meshStandardMaterial color={C.baseboard} roughness={0.7} />
      </mesh>
      <Rug />
      <WindowAndCurtain />
      <AcousticFoam />
    </group>
  );
}

function Rug() {
  return (
    <group position={[0.55, 0, 0.35]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]} receiveShadow>
        <planeGeometry args={[2.7, 1.9]} />
        <meshStandardMaterial color={C.rug} roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.016, 0]}>
        <planeGeometry args={[2.3, 1.5]} />
        <meshStandardMaterial color={C.rugInner} roughness={1} />
      </mesh>
    </group>
  );
}

function WindowAndCurtain() {
  // window lives on the BACK wall (visible from the default camera), with
  // the curtain half drawn over its right edge. The view follows the
  // visitor's real clock: day sky or a night skyline.
  const night = getDayPhase() === "night";
  const skyline = useMemo(() => getSkylineTexture(night), [night]);

  return (
    <group>
      {/* the view */}
      <mesh position={[2.65, 2.1, -2.72]}>
        <planeGeometry args={[1.5, 1.7]} />
        <meshBasicMaterial map={skyline} toneMapped={night ? false : true} />
      </mesh>
      {/* frame: horizontal + vertical bars */}
      {[-0.87, 0.87].map((y) => (
        <mesh key={y} position={[2.65, 2.1 + y, -2.72]}>
          <boxGeometry args={[1.66, 0.09, 0.07]} />
          <meshStandardMaterial color={C.ceramic} roughness={0.6} />
        </mesh>
      ))}
      {[-0.76, 0, 0.76].map((x) => (
        <mesh key={x} position={[2.65 + x, 2.1, -2.72]}>
          <boxGeometry args={[0.09, 1.78, 0.07]} />
          <meshStandardMaterial color={C.ceramic} roughness={0.6} />
        </mesh>
      ))}
      <Curtain />
    </group>
  );
}

function Curtain() {
  const ref = useRef<THREE.Mesh>(null!);
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(1.4, 3.1, 36, 1);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      pos.setZ(i, Math.sin(x * 16) * 0.055 + Math.sin(x * 5 + 1.2) * 0.03);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state) => {
    // a slow draught through the room
    ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.35) * 0.05;
  });

  return (
    <mesh ref={ref} geometry={geometry} position={[3.62, 1.62, -2.64]} castShadow>
      <meshStandardMaterial color={C.curtain} roughness={1} side={THREE.DoubleSide} />
    </mesh>
  );
}

function AcousticFoam() {
  // instanced pyramid-ish panels on the back wall, right of the shelf and far left
  const meshes = useMemo(() => {
    const build = (xStart: number, xEnd: number, rows: number) => {
      const cols = Math.round((xEnd - xStart) / 0.5);
      const count = cols * rows;
      const geo = new THREE.BoxGeometry(0.44, 0.44, 0.07);
      const mat = new THREE.MeshStandardMaterial({ color: "#191922", roughness: 1 });
      const inst = new THREE.InstancedMesh(geo, mat, count);
      const m = new THREE.Matrix4();
      let i = 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          m.setPosition(xStart + 0.25 + c * 0.5, 1.72 + r * 0.5, -2.7);
          inst.setMatrixAt(i++, m);
        }
      }
      inst.instanceMatrix.needsUpdate = true;
      return inst;
    };
    return [build(-4.4, -2.2, 2)];
  }, []);

  useEffect(
    () => () =>
      meshes.forEach((m) => {
        m.geometry.dispose();
        (m.material as THREE.Material).dispose();
      }),
    [meshes],
  );

  return (
    <group>
      {meshes.map((m, i) => (
        <primitive key={i} object={m} />
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Wood furniture                                                      */
/* ------------------------------------------------------------------ */

export function Desk() {
  return (
    <group position={[0, 0, -1.75]}>
      {/* top */}
      <mesh position={[0, 1.02, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.7, 0.1, 1.35]} />
        <meshStandardMaterial color={C.wood} roughness={0.55} />
      </mesh>
      {/* raised monitor stand shelf */}
      <mesh position={[-0.35, 1.24, -0.32]} castShadow>
        <boxGeometry args={[1.9, 0.07, 0.55]} />
        <meshStandardMaterial color={C.woodLight} roughness={0.55} />
      </mesh>
      {/* side panels */}
      {[-1.76, 1.76].map((x) => (
        <mesh key={x} position={[x, 0.49, 0]} castShadow>
          <boxGeometry args={[0.07, 0.98, 1.25]} />
          <meshStandardMaterial color={C.frameDark} roughness={0.6} metalness={0.3} />
        </mesh>
      ))}
      {/* back panel */}
      <mesh position={[0, 0.49, -0.6]}>
        <boxGeometry args={[3.5, 0.98, 0.05]} />
        <meshStandardMaterial color={C.frameDark} roughness={0.7} />
      </mesh>
      {/* front skirt */}
      <mesh position={[0, 0.93, 0.64]}>
        <boxGeometry args={[3.7, 0.16, 0.05]} />
        <meshStandardMaterial color={C.frameDark} roughness={0.6} />
      </mesh>
    </group>
  );
}

export function Shelf() {
  const glow = useRef<THREE.Mesh>(null!);
  const glowTexture = useMemo(() => getGlowTexture(), []);

  useFrame(() => {
    // gentle LED flicker, brighter at night (the phase tuning decides how loud it is)
    const m = glow.current.material as THREE.MeshBasicMaterial;
    const base = 0.32 * Math.min(1.7, getRig().led / 0.32);
    m.opacity = base + Math.sin(performance.now() * 0.002) * 0.03;
  });

  return (
    <group position={[-0.45, 2.28, -2.5]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.3, 0.075, 0.42]} />
        <meshStandardMaterial color={C.wood} roughness={0.55} />
      </mesh>
      {/* brackets */}
      {[-0.95, 0.95].map((x) => (
        <mesh key={x} position={[x, -0.12, -0.12]}>
          <boxGeometry args={[0.05, 0.18, 0.3]} />
          <meshStandardMaterial color={C.metal} roughness={0.5} metalness={0.5} />
        </mesh>
      ))}
      {/* LED strip under the front edge + its glow */}
      <mesh position={[0, -0.055, 0.19]}>
        <boxGeometry args={[2.2, 0.02, 0.03]} />
        <meshBasicMaterial color={C.ledBlue} toneMapped={false} />
      </mesh>
      <mesh ref={glow} position={[0, -0.42, 0.32]} rotation={[0, 0, 0]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={glowTexture}
          color={C.ledBlue}
          transparent
          opacity={0.32}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

const CHAIR_YAW = -0.55;

export function Chair() {
  const group = useRef<THREE.Group>(null!);
  const spin = useRef(0);

  useFrame((_, delta) => {
    // spin eases toward the accumulated target poked via the Hotspot
    spin.current += (toyStore.spinTarget - spin.current) * Math.min(1, delta * 2.2);
    group.current.rotation.y = CHAIR_YAW + spin.current;
  });

  // local origin = floor under the seat centre; placed (and spun) by the
  // Hotspot wrapper in room.tsx
  return (
    <group ref={group} rotation={[0, CHAIR_YAW, 0]}>
      {/* star base */}
      {[0, 1, 2, 3, 4].map((i) => (
        <group key={i} rotation={[0, (i * Math.PI * 2) / 5, 0]}>
          <mesh position={[0.19, 0.05, 0]} castShadow>
            <boxGeometry args={[0.34, 0.04, 0.06]} />
            <meshStandardMaterial color={C.fabricDark} roughness={0.6} />
          </mesh>
          <mesh position={[0.34, 0.035, 0]}>
            <sphereGeometry args={[0.035, 10, 10]} />
            <meshStandardMaterial color={C.fabricDark} roughness={0.4} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.032, 0.032, 0.42, 12]} />
        <meshStandardMaterial color={C.metal} roughness={0.35} metalness={0.7} />
      </mesh>
      {/* seat */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[0.52, 0.09, 0.5]} />
        <meshStandardMaterial color={C.fabric} roughness={1} />
      </mesh>
      {/* backrest: slimmer, tilted, so it doesn't read as a slab */}
      <mesh position={[0, 0.94, 0.25]} rotation={[-0.12, 0, 0]} castShadow>
        <boxGeometry args={[0.44, 0.66, 0.055]} />
        <meshStandardMaterial color="#878c96" roughness={1} />
      </mesh>
      <mesh position={[0, 1.34, 0.18]} rotation={[-0.12, 0, 0]} castShadow>
        <boxGeometry args={[0.3, 0.13, 0.055]} />
        <meshStandardMaterial color="#878c96" roughness={1} />
      </mesh>
      {/* lumbar gap */}
      <mesh position={[0, 0.72, 0.22]} rotation={[-0.12, 0, 0]}>
        <boxGeometry args={[0.3, 0.09, 0.03]} />
        <meshStandardMaterial color={C.fabricDark} roughness={0.8} />
      </mesh>
      {/* armrests */}
      {[-0.3, 0.3].map((x) => (
        <group key={x}>
          <mesh position={[x, 0.66, 0.02]}>
            <boxGeometry args={[0.05, 0.24, 0.05]} />
            <meshStandardMaterial color={C.fabricDark} roughness={0.6} />
          </mesh>
          <mesh position={[x, 0.8, -0.06]}>
            <boxGeometry args={[0.07, 0.035, 0.34]} />
            <meshStandardMaterial color={C.fabricDark} roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Stack of books on the shelf — the Education hotspot lives here. */
export function Books({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {(
        [
          ["#22d3ee", 0.3, 0.045, 0.22, 0.06],
          ["#a78bfa", 0.27, 0.05, 0.2, -0.09],
          ["#f472b6", 0.24, 0.04, 0.18, 0.14],
        ] as const
      ).map(([color, w, h, d, rot], i) => (
        <mesh
          key={i}
          position={[Math.sin(rot) * 0.012, 0.03 + i * 0.048, 0]}
          rotation={[0, rot, 0]}
          castShadow
        >
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

export function Plant({ scale = 1 }: { scale?: number }) {
  const leaves = useMemo(() => {
    const arr: Array<{ pos: [number, number, number]; rot: [number, number, number]; h: number }> =
      [];
    const n = 8;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + (i % 2) * 0.4;
      const tilt = 0.35 + (i % 3) * 0.16;
      arr.push({
        pos: [Math.cos(a) * 0.07, 0.28 + (i % 3) * 0.05, Math.sin(a) * 0.07],
        rot: [Math.cos(a) * tilt, a, Math.sin(a) * tilt],
        h: 0.34 + (i % 4) * 0.07,
      });
    }
    return arr;
  }, []);

  return (
    <group scale={scale}>
      <mesh position={[0, 0.12, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.1, 0.24, 14]} />
        <meshStandardMaterial color={C.pot} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.245, 0]}>
        <cylinderGeometry args={[0.115, 0.115, 0.01, 14]} />
        <meshStandardMaterial color="#2a1f16" roughness={1} />
      </mesh>
      {leaves.map((leaf, i) => (
        <mesh key={i} position={leaf.pos} rotation={leaf.rot} castShadow>
          <coneGeometry args={[0.075, leaf.h, 6]} />
          <meshStandardMaterial
            color={i % 2 ? C.plant : C.plantDark}
            roughness={0.8}
          />
        </mesh>
      ))}
    </group>
  );
}
