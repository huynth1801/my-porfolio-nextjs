"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

function pseudo(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Cute, rounded water coconut palm (Dừa nước chibi miền Tây)
 */
function CuteWaterCoconutPalm({
  position = [0, 0, 0],
  scale = 1,
  rotation = 0,
}: {
  position?: [number, number, number];
  scale?: number;
  rotation?: number;
}) {
  const fronds = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const angle = (i / 8) * Math.PI * 2;
      const tilt = 0.52 + pseudo(i * 2.1 + 1) * 0.22;
      const length = 2.2 + pseudo(i * 3.7 + 2) * 0.6;
      return { angle, tilt, length };
    });
  }, []);

  return (
    <group position={position} scale={scale} rotation={[0, rotation, 0]}>
      {/* Plump rounded root tuft */}
      <mesh position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.38, 12, 10]} />
        <meshStandardMaterial color="#4a3421" roughness={0.85} />
      </mesh>

      {/* Cute bouncy palm fronds */}
      {fronds.map((f, idx) => (
        <group key={idx} rotation={[0, f.angle, 0]}>
          <group rotation={[f.tilt, 0, 0]}>
            {/* Frond stem */}
            <mesh position={[0, f.length * 0.5, 0]} castShadow>
              <cylinderGeometry args={[0.05, 0.09, f.length, 6]} />
              <meshStandardMaterial color="#35692e" roughness={0.65} />
            </mesh>
            {/* Rounded leaf clusters */}
            {Array.from({ length: 5 }).map((_, li) => {
              const ly = 0.45 + li * 0.35;
              const lw = 0.32 - li * 0.04;
              return (
                <mesh key={li} position={[0, ly, 0]} rotation={[0.25, 0, Math.PI / 4]} castShadow>
                  <boxGeometry args={[lw, 0.03, 0.55]} />
                  <meshStandardMaterial
                    color={li % 2 === 0 ? "#438c39" : "#37772e"}
                    roughness={0.6}
                  />
                </mesh>
              );
            })}
          </group>
        </group>
      ))}
    </group>
  );
}

/**
 * Cute Mekong wooden sampan boat (Ghe tam bản chibi)
 * Chubby rounded hull loaded with cute miniature terracotta jars.
 */
function CuteRiverSampanBoat({
  position = [0, 0, 0],
  scale = 1,
  rotation = [0, 0, 0],
  bobSeed = 0,
}: {
  position?: [number, number, number];
  scale?: number;
  rotation?: [number, number, number];
  bobSeed?: number;
}) {
  const boatRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (!boatRef.current) return;
    const t = state.clock.getElapsedTime() + bobSeed;
    boatRef.current.position.y = position[1] + Math.sin(t * 1.6) * 0.04;
    boatRef.current.rotation.z = rotation[2] + Math.sin(t * 1.3) * 0.035;
    boatRef.current.rotation.x = rotation[0] + Math.cos(t * 1.0) * 0.025;
  });

  return (
    <group ref={boatRef} position={position} scale={scale} rotation={rotation}>
      {/* Wooden boat hull bottom with rounded edges */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.35, 0.38, 4.4]} />
        <meshStandardMaterial color="#663f25" roughness={0.75} />
      </mesh>

      {/* Chubby curved Bow and Stern */}
      <mesh position={[0, 0.22, 2.5]} rotation={[0.38, 0, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.68, 1.1, 8]} />
        <meshStandardMaterial color="#55331e" roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.22, -2.5]} rotation={[-0.38, 0, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.68, 1.1, 8]} />
        <meshStandardMaterial color="#55331e" roughness={0.75} />
      </mesh>

      {/* Gunwales */}
      <mesh position={[-0.7, 0.22, 0]} castShadow>
        <boxGeometry args={[0.1, 0.3, 4.4]} />
        <meshStandardMaterial color="#472b19" roughness={0.75} />
      </mesh>
      <mesh position={[0.7, 0.22, 0]} castShadow>
        <boxGeometry args={[0.1, 0.3, 4.4]} />
        <meshStandardMaterial color="#472b19" roughness={0.75} />
      </mesh>

      {/* Cozy woven bamboo canopy */}
      <mesh position={[0, 0.68, -0.3]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.72, 0.72, 1.8, 14, 1, true, 0, Math.PI]} />
        <meshStandardMaterial color="#ba945f" side={THREE.DoubleSide} roughness={0.8} />
      </mesh>

      {/* Miniature clay jars loaded in boat */}
      <group position={[0, 0.24, 0.9]}>
        <mesh position={[0, 0.16, 0]} castShadow>
          <boxGeometry args={[0.85, 0.38, 1.2]} />
          <meshStandardMaterial color="#d45a2d" roughness={0.8} />
        </mesh>
        {/* Two cute jars */}
        <mesh position={[-0.26, 0.44, -0.15]} castShadow>
          <sphereGeometry args={[0.2, 12, 12]} />
          <meshStandardMaterial color="#be4c22" roughness={0.65} />
        </mesh>
        <mesh position={[0.26, 0.44, 0.15]} castShadow>
          <sphereGeometry args={[0.22, 12, 12]} />
          <meshStandardMaterial color="#cd5527" roughness={0.65} />
        </mesh>
      </group>

      {/* Cute wooden oar */}
      <mesh position={[0.72, 0.52, -2.2]} rotation={[-0.5, 0.2, 0.3]} castShadow>
        <cylinderGeometry args={[0.035, 0.035, 2.4, 6]} />
        <meshStandardMaterial color="#cca36c" roughness={0.65} />
      </mesh>
    </group>
  );
}

/**
 * Complete Cute River Canal Landscape
 */
export function RiverLandscape() {
  const waterMeshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (!waterMeshRef.current) return;
    const time = state.clock.getElapsedTime();
    waterMeshRef.current.position.y = -0.42 + Math.sin(time * 1.0) * 0.025;
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Terracotta Alluvial Clay Ground */}
      <mesh position={[0, -0.4, 0]} receiveShadow>
        <boxGeometry args={[34, 0.8, 22]} />
        <meshStandardMaterial color="#9c4a25" roughness={0.9} metalness={0.04} />
      </mesh>

      {/* Soft grassy bank */}
      <mesh position={[-2, 0.02, 1.5]} receiveShadow>
        <planeGeometry args={[18, 12]} />
        <meshStandardMaterial
          color="#5b783f"
          roughness={0.9}
          polygonOffset
          polygonOffsetFactor={-1}
        />
      </mesh>

      {/* River Canal Water Surface with warm sunset reflections */}
      <mesh
        ref={waterMeshRef}
        position={[0, -0.4, 13.5]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[36, 12, 32, 32]} />
        <meshStandardMaterial
          color="#204050"
          roughness={0.16}
          metalness={0.8}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* Wooden Wharf / Pier */}
      <group position={[3.2, -0.15, 8.2]}>
        {[
          [-1.1, 0],
          [-1.1, 2.0],
          [1.1, 0],
          [1.1, 2.0],
        ].map(([px, pz], i) => (
          <mesh key={i} position={[px, -0.4, pz]} castShadow receiveShadow>
            <cylinderGeometry args={[0.08, 0.09, 1.8, 8]} />
            <meshStandardMaterial color="#42291b" roughness={0.85} />
          </mesh>
        ))}

        {/* Pier wooden decking */}
        <mesh position={[0, 0.1, 1.0]} castShadow receiveShadow>
          <boxGeometry args={[2.6, 0.08, 2.4]} />
          <meshStandardMaterial color="#5c3c25" roughness={0.85} />
        </mesh>

        {/* Cute jars stacked on pier */}
        <mesh position={[0.7, 0.38, 0.6]} castShadow>
          <sphereGeometry args={[0.26, 12, 12]} />
          <meshStandardMaterial color="#d95427" roughness={0.65} />
        </mesh>
        <mesh position={[0.75, 0.34, 1.2]} castShadow>
          <sphereGeometry args={[0.23, 12, 12]} />
          <meshStandardMaterial color="#c4491f" roughness={0.65} />
        </mesh>
      </group>

      {/* Cute Sampan Boats */}
      <CuteRiverSampanBoat
        position={[3.2, -0.32, 11.0]}
        rotation={[0, 0.15, 0]}
        scale={0.95}
        bobSeed={0}
      />
      <CuteRiverSampanBoat
        position={[-6.8, -0.32, 13.2]}
        rotation={[0, -0.28, 0]}
        scale={1.05}
        bobSeed={2.4}
      />

      {/* Cute Water Coconut Palms along the river bank */}
      <CuteWaterCoconutPalm position={[-10.2, -0.2, 8.5]} scale={1.15} rotation={0.4} />
      <CuteWaterCoconutPalm position={[-7.0, -0.2, 8.2]} scale={0.95} rotation={1.2} />
      <CuteWaterCoconutPalm position={[-4.3, -0.2, 8.8]} scale={0.82} rotation={2.1} />
      <CuteWaterCoconutPalm position={[7.6, -0.2, 8.4]} scale={1.1} rotation={0.8} />
      <CuteWaterCoconutPalm position={[10.2, -0.2, 8.6]} scale={1.2} rotation={1.9} />
    </group>
  );
}
