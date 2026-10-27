"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { C } from "./furniture";
import { getClockTexture, getPosterTexture } from "./textures";
import { boot } from "./boot";
import { getGlowTexture } from "../glow-texture";

/* ------------------------------------------------------------------ */
/* Monitor with live clock screen + backlight + hanging headphones     */
/* ------------------------------------------------------------------ */

export function Monitor() {
  const clock = getClockTexture(() => boot.value);
  const glowTexture = useMemo(() => getGlowTexture(), []);

  // local origin = centre of the stand base; placed by its Hotspot
  return (
    <group>
      {/* stand */}
      <mesh position={[0, 0.02, 0.06]} castShadow>
        <boxGeometry args={[0.5, 0.04, 0.24]} />
        <meshStandardMaterial color={C.metal} roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[0, 0.16, -0.02]} castShadow>
        <boxGeometry args={[0.08, 0.3, 0.06]} />
        <meshStandardMaterial color={C.metal} roughness={0.4} metalness={0.6} />
      </mesh>

      {/* backlight glow behind the panel */}
      <mesh position={[0, 0.52, -0.09]} scale={[3.1, 1.6, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={glowTexture}
          color={C.ledBlue}
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* bezel + screen */}
      <mesh position={[0, 0.52, 0]} castShadow>
        <boxGeometry args={[1.78, 0.74, 0.05]} />
        <meshStandardMaterial color="#101014" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.52, 0.028]}>
        <planeGeometry args={[1.68, 0.64]} />
        <meshBasicMaterial map={clock} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.1, 0.027]}>
        <circleGeometry args={[0.012, 12]} />
        <meshBasicMaterial color="#3a3a44" />
      </mesh>

      <Headphones position={[0.66, 0.9, 0]} />
    </group>
  );
}

function Headphones({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[0.1, -0.2, 0.12]}>
      {/* headband: upper half torus */}
      <mesh castShadow>
        <torusGeometry args={[0.13, 0.02, 10, 24, Math.PI]} />
        <meshStandardMaterial color={C.purple} roughness={0.5} />
      </mesh>
      {[-0.13, 0.13].map((x) => (
        <mesh key={x} position={[x, -0.01, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.055, 0.055, 0.045, 16]} />
          <meshStandardMaterial color={C.purpleDark} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Studio speakers                                                     */
/* ------------------------------------------------------------------ */

function Speaker({ x, z = -1.95 }: { x: number; z?: number }) {
  return (
    <group position={[x, 1.32, z]} rotation={[0, x > -0.45 ? -0.25 : 0.25, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.34, 0.5, 0.3]} />
        <meshStandardMaterial color={C.purple} roughness={0.6} />
      </mesh>
      {/* front baffle */}
      <mesh position={[0, 0, 0.153]}>
        <boxGeometry args={[0.28, 0.44, 0.01]} />
        <meshStandardMaterial color={C.purpleDark} roughness={0.7} />
      </mesh>
      {/* tweeter + woofer */}
      {[0.14, -0.08].map((y, i) => (
        <group key={y} position={[0, y, 0.16]}>
          <mesh>
            <torusGeometry args={[i === 0 ? 0.035 : 0.08, 0.012, 8, 24]} />
            <meshStandardMaterial color="#22222a" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0, 0.005]}>
            <sphereGeometry args={[i === 0 ? 0.03 : 0.065, 14, 14]} />
            <meshStandardMaterial color="#17171d" roughness={0.5} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.26, 0.05]}>
        <sphereGeometry args={[0.008, 8, 8]} />
        <meshBasicMaterial color="#66ff99" toneMapped={false} />
      </mesh>
    </group>
  );
}

export function Speakers() {
  return (
    <>
      <Speaker x={-1.52} />
      <Speaker x={0.84} z={-1.86} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* PC case with spinning RGB fans                                      */
/* ------------------------------------------------------------------ */

function Fan({ radius = 0.085 }: { radius?: number }) {
  const blades = useRef<THREE.Group>(null!);
  useFrame((_, delta) => {
    blades.current.rotation.z += delta * 7;
  });
  return (
    <group>
      <mesh>
        <torusGeometry args={[radius, 0.013, 8, 28]} />
        <meshBasicMaterial color={C.rgb} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, -0.008]}>
        <circleGeometry args={[radius - 0.008, 24]} />
        <meshBasicMaterial color="#0b2b3d" toneMapped={false} />
      </mesh>
      <group ref={blades} position={[0, 0, 0.004]}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh key={i} rotation={[0, 0, (i * Math.PI) / 3]}>
            <boxGeometry args={[radius * 1.7, 0.016, 0.006]} />
            <meshBasicMaterial color="#1d5a75" toneMapped={false} />
          </mesh>
        ))}
      </group>
      <mesh position={[0, 0, 0.008]}>
        <circleGeometry args={[0.022, 12]} />
        <meshBasicMaterial color={C.rgb} toneMapped={false} />
      </mesh>
    </group>
  );
}

export function PcCase() {
  const glassTexture = useMemo(() => getGlowTexture(), []);
  // local origin = case centre; placed by its Hotspot
  return (
    <group>
      {/* chassis */}
      <mesh castShadow>
        <boxGeometry args={[0.62, 1.06, 1.08]} />
        <meshStandardMaterial color={C.caseDark} roughness={0.45} metalness={0.4} />
      </mesh>
      {/* glass front with vertical fans */}
      <mesh position={[0, 0, 0.545]}>
        <planeGeometry args={[0.5, 0.94]} />
        <meshStandardMaterial color="#0e0e14" roughness={0.15} metalness={0.2} />
      </mesh>
      {[0.32, 0, -0.32].map((y) => (
        <group key={y} position={[0, y, 0.552]}>
          <Fan />
        </group>
      ))}
      {/* side fans facing into the room */}
      <mesh position={[-0.315, 0.05, -0.1]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[0.9, 0.5]} />
        <meshStandardMaterial color="#0e0e14" roughness={0.15} metalness={0.2} />
      </mesh>
      <group position={[-0.32, 0.18, -0.1]} rotation={[0, -Math.PI / 2, 0]}>
        <Fan radius={0.075} />
      </group>
      <group position={[-0.32, -0.08, -0.1]} rotation={[0, -Math.PI / 2, 0]}>
        <Fan radius={0.075} />
      </group>
      {/* interior glow */}
      <mesh position={[-0.2, 0, 0.25]} scale={[1.4, 1.6, 1]} rotation={[0, -Math.PI / 2.4, 0]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={glassTexture}
          color={C.rgb}
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <pointLight position={[-0.4, 0, 0.3]} color={C.rgb} intensity={1.6} distance={1.6} decay={2} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Keyboard, deskmat, mouse, phone, coffee                             */
/* ------------------------------------------------------------------ */

export function Keycaps() {
  const mesh = useMemo(() => {
    const cols = 13;
    const rows = 4;
    const geo = new THREE.BoxGeometry(0.06, 0.022, 0.06);
    const mat = new THREE.MeshStandardMaterial({ roughness: 0.55 });
    const count = cols * rows;
    const inst = new THREE.InstancedMesh(geo, mat, count);
    const m = new THREE.Matrix4();
    const color = new THREE.Color();
    let i = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = (c - (cols - 1) / 2) * 0.074;
        const z = (r - (rows - 1) / 2) * 0.074;
        m.setPosition(x, 0.033, z);
        inst.setMatrixAt(i, m);
        // purple accent: top row + scattered modifiers, the rest cream
        const accent = r === 0 || (r === 3 && c % 4 === 1) || (i * 7) % 23 === 0;
        color.set(accent ? C.purple : C.keycap);
        inst.setColorAt(i, color);
        i++;
      }
    }
    inst.instanceMatrix.needsUpdate = true;
    if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
    return inst;
  }, []);

  useEffect(() => () => {
    mesh.geometry.dispose();
    (mesh.material as THREE.Material).dispose();
  }, [mesh]);

  return (
    <group>
      <mesh position={[0, 0.018, 0]} castShadow>
        <boxGeometry args={[1.02, 0.03, 0.34]} />
        <meshStandardMaterial color="#1a1a21" roughness={0.5} />
      </mesh>
      <primitive object={mesh} />
      {/* spacebar */}
      <mesh position={[0, 0.033, 0.148]}>
        <boxGeometry args={[0.42, 0.022, 0.06]} />
        <meshStandardMaterial color={C.keycap} roughness={0.55} />
      </mesh>
      {/* coiled cable, a mech-keyboard flex */}
      <mesh position={[0.56, 0.02, -0.1]} rotation={[Math.PI / 2, 0, 0.3]}>
        <torusGeometry args={[0.05, 0.012, 8, 20, Math.PI * 1.5]} />
        <meshStandardMaterial color={C.purple} roughness={0.6} />
      </mesh>
    </group>
  );
}

export function DeskPeripherals() {
  return (
    <group>
      {/* deskmat */}
      <mesh position={[-0.1, 1.076, -1.42]} receiveShadow>
        <boxGeometry args={[1.55, 0.008, 0.55]} />
        <meshStandardMaterial color="#14141a" roughness={0.9} />
      </mesh>
      {/* keyboard is placed by its Hotspot */}
      {/* mouse */}
      <mesh position={[0.58, 1.098, -1.36]} scale={[1, 0.5, 1.45]} castShadow>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color="#dedbe4" roughness={0.4} />
      </mesh>
      {/* coffee */}
      <group position={[0.98, 1.07, -1.62]}>
        <mesh position={[0, 0.008, 0]} castShadow>
          <cylinderGeometry args={[0.115, 0.115, 0.016, 20]} />
          <meshStandardMaterial color={C.ceramic} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.075, 0]} castShadow>
          <cylinderGeometry args={[0.072, 0.058, 0.13, 20]} />
          <meshStandardMaterial color={C.ceramic} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.141, 0]}>
          <circleGeometry args={[0.065, 20]} />
          <meshStandardMaterial color="#4a2b18" roughness={0.3} />
        </mesh>
        <mesh position={[0.082, 0.075, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.035, 0.011, 8, 18]} />
          <meshStandardMaterial color={C.ceramic} roughness={0.5} />
        </mesh>
        <Steam />
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Steam wisps above the coffee                                        */
/* ------------------------------------------------------------------ */

function Steam() {
  const group = useRef<THREE.Group>(null!);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    group.current.children.forEach((child, i) => {
      const p = ((t * 0.35 + i * 0.45) % 1.4) / 1.4; // 0..1 lifecycle
      child.position.y = 0.18 + p * 0.28;
      child.position.x = Math.sin((p + i * 0.8) * 7) * 0.018;
      const m = (child as THREE.Sprite).material as THREE.SpriteMaterial;
      m.opacity = 0.22 * Math.sin(p * Math.PI);
      child.scale.setScalar(0.6 + p * 0.7);
    });
  });

  return (
    <group ref={group}>
      {[0, 1, 2].map((i) => (
        <sprite key={i} position={[0, 0.18, 0]} scale={[0.06, 0.09, 1]}>
          <spriteMaterial
            map={getGlowTexture()}
            color="#ffffff"
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </sprite>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Phone — hotspot to the contact section                              */
/* ------------------------------------------------------------------ */

export function Phone() {
  return (
    <group rotation={[0, 0.55, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.17, 0.02, 0.34]} />
        <meshStandardMaterial color="#8fbcea" roughness={0.3} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.012, -0.13]}>
        <circleGeometry args={[0.02, 12]} />
        <meshBasicMaterial color="#2a2a33" />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* MIDI keyboard in the drawer under the desk                          */
/* ------------------------------------------------------------------ */

export function MidiKeyboard() {
  const white = useMemo(() => buildKeys(false), []);
  const black = useMemo(() => buildKeys(true), []);

  useEffect(
    () => () =>
      [white, black].forEach((inst) => {
        inst.geometry.dispose();
        (inst.material as THREE.Material).dispose();
      }),
    [white, black],
  );

  // local origin = tray centre; placed by its Hotspot. The tray is tucked
  // under the desk top with vertical rails bridging up to it, so it reads
  // as a real slide-out drawer instead of a floating box.
  return (
    <group>
      <mesh castShadow>
        <boxGeometry args={[1.18, 0.08, 0.4]} />
        <meshStandardMaterial color="#17171d" roughness={0.5} />
      </mesh>
      {/* slide rails bridging up to the underside of the desk */}
      {[-0.56, 0.56].map((x) => (
        <mesh key={x} position={[x, 0.06, -0.02]}>
          <boxGeometry args={[0.05, 0.12, 0.34]} />
          <meshStandardMaterial color={C.metal} roughness={0.4} metalness={0.5} />
        </mesh>
      ))}
      <primitive object={white} />
      <primitive object={black} />
      {/* knobs */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[-0.44 + i * 0.075, 0.062, -0.12]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.024, 0.024, 0.03, 14]} />
          <meshStandardMaterial color="#2c2c34" roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function buildKeys(black: boolean) {
  const count = black ? 10 : 15;
  const geo = black
    ? new THREE.BoxGeometry(0.03, 0.026, 0.1)
    : new THREE.BoxGeometry(0.058, 0.02, 0.17);
  const mat = new THREE.MeshStandardMaterial({
    color: black ? "#111114" : "#efece4",
    roughness: 0.45,
  });
  const inst = new THREE.InstancedMesh(geo, mat, count);
  const m = new THREE.Matrix4();
  for (let i = 0; i < count; i++) {
    if (black) {
      // between white keys, skipping the E-F and B-C gaps
      const slot = i + Math.floor(i / 3) + 1;
      m.setPosition(-0.36 + slot * 0.062, 0.055, -0.028);
    } else {
      m.setPosition(-0.36 + i * 0.062, 0.052, 0.03);
    }
    inst.setMatrixAt(i, m);
  }
  inst.instanceMatrix.needsUpdate = true;
  return inst;
}

/* ------------------------------------------------------------------ */
/* Shelf decorations: second clock, poster                             */
/* ------------------------------------------------------------------ */

export function ShelfItems({ shelfY }: { shelfY: number }) {
  const clock = getClockTexture(() => boot.value);
  const poster = getPosterTexture();
  return (
    <group>
      {/* digital clock */}
      <group position={[-0.5, shelfY + 0.13, -2.52]}>
        <mesh castShadow>
          <boxGeometry args={[0.52, 0.26, 0.09]} />
          <meshStandardMaterial color="#1b1b22" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0.047]}>
          <planeGeometry args={[0.46, 0.2]} />
          <meshBasicMaterial map={clock} toneMapped={false} />
        </mesh>
      </group>
      {/* poster leaning on the wall */}
      <group position={[0.32, shelfY + 0.32, -2.6]} rotation={[-0.14, 0.05, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.44, 0.64, 0.015]} />
          <meshStandardMaterial color="#101014" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0, 0.009]}>
          <planeGeometry args={[0.4, 0.6]} />
          <meshBasicMaterial map={poster} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}
