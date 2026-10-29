"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

function pseudo(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Procedural water coconut palm (Dừa nước miền Tây)
 * Iconic flora along the riverbanks of Vinh Long & Mang Thit.
 */
function WaterCoconutPalm({
  position = [0, 0, 0],
  scale = 1,
  rotation = 0,
}: {
  position?: [number, number, number];
  scale?: number;
  rotation?: number;
}) {
  const fronds = useMemo(() => {
    return Array.from({ length: 9 }, (_, i) => {
      const angle = (i / 9) * Math.PI * 2;
      const tilt = 0.55 + pseudo(i * 2.1 + 1) * 0.25;
      const length = 2.4 + pseudo(i * 3.7 + 2) * 0.8;
      return { angle, tilt, length };
    });
  }, []);

  return (
    <group position={position} scale={scale} rotation={[0, rotation, 0]}>
      {/* Root base tuft */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.3, 0.45, 0.4, 8]} />
        <meshStandardMaterial color="#422e1b" roughness={0.9} />
      </mesh>

      {/* Palm fronds arching outward */}
      {fronds.map((f, idx) => (
        <group key={idx} rotation={[0, f.angle, 0]}>
          <group rotation={[f.tilt, 0, 0]}>
            {/* Frond stem */}
            <mesh position={[0, f.length * 0.5, 0]} castShadow>
              <cylinderGeometry args={[0.04, 0.08, f.length, 6]} />
              <meshStandardMaterial color="#2d5a27" roughness={0.7} />
            </mesh>
            {/* Feathery leaves along stem */}
            {Array.from({ length: 6 }).map((_, li) => {
              const ly = 0.4 + li * 0.35;
              const lw = 0.35 - li * 0.04;
              return (
                <mesh key={li} position={[0, ly, 0]} rotation={[0.2, 0, Math.PI / 4]}>
                  <boxGeometry args={[lw, 0.02, 0.65]} />
                  <meshStandardMaterial
                    color={li % 2 === 0 ? "#3b7a33" : "#2f6728"}
                    roughness={0.65}
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
 * Traditional Mekong wooden sampan boat (Ghe tam bản / Thuyền gỗ)
 * Loaded with red pottery and bricks, rocking gently on the water.
 */
function RiverSampanBoat({
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
    // Gentle water bobbing and yaw rocking
    boatRef.current.position.y = position[1] + Math.sin(t * 1.5) * 0.045;
    boatRef.current.rotation.z = rotation[2] + Math.sin(t * 1.2) * 0.03;
    boatRef.current.rotation.x = rotation[0] + Math.cos(t * 0.9) * 0.02;
  });

  return (
    <group ref={boatRef} position={position} scale={scale} rotation={rotation}>
      {/* Wooden boat hull bottom */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.4, 4.8]} />
        <meshStandardMaterial color="#5c3821" roughness={0.8} />
      </mesh>

      {/* Bow and Stern pointed prows */}
      <mesh position={[0, 0.25, 2.7]} rotation={[0.4, 0, 0]} castShadow>
        <coneGeometry args={[0.75, 1.2, 4]} />
        <meshStandardMaterial color="#4d2e1b" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.25, -2.7]} rotation={[-0.4, 0, 0]} castShadow>
        <coneGeometry args={[0.75, 1.2, 4]} />
        <meshStandardMaterial color="#4d2e1b" roughness={0.8} />
      </mesh>

      {/* Gunwales (thành thuyền) */}
      <mesh position={[-0.72, 0.25, 0]} castShadow>
        <boxGeometry args={[0.1, 0.35, 4.8]} />
        <meshStandardMaterial color="#3d2315" roughness={0.8} />
      </mesh>
      <mesh position={[0.72, 0.25, 0]} castShadow>
        <boxGeometry args={[0.1, 0.35, 4.8]} />
        <meshStandardMaterial color="#3d2315" roughness={0.8} />
      </mesh>

      {/* Arched woven bamboo canopy (Mui thuyền lá dừa/tre) */}
      <mesh position={[0, 0.75, -0.4]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.75, 0.75, 2.0, 16, 1, true, 0, Math.PI]} />
        <meshStandardMaterial color="#a68453" side={THREE.DoubleSide} roughness={0.85} />
      </mesh>

      {/* Cargo: Stacks of red Mang Thit bricks & ceramic pots inside boat */}
      <group position={[0, 0.25, 1.0]}>
        <mesh position={[0, 0.2, 0]} castShadow>
          <boxGeometry args={[0.9, 0.45, 1.4]} />
          <meshStandardMaterial color="#c24b22" roughness={0.85} />
        </mesh>
        {/* Two pottery jars on boat */}
        <mesh position={[-0.28, 0.5, -0.2]} castShadow>
          <sphereGeometry args={[0.22, 12, 12]} />
          <meshStandardMaterial color="#a83e18" roughness={0.7} />
        </mesh>
        <mesh position={[0.28, 0.5, 0.2]} castShadow>
          <sphereGeometry args={[0.24, 12, 12]} />
          <meshStandardMaterial color="#b8461c" roughness={0.7} />
        </mesh>
      </group>

      {/* Steering oar / bamboo pole (Mái dầm) */}
      <mesh position={[0.75, 0.6, -2.4]} rotation={[-0.5, 0.2, 0.3]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 2.6, 6]} />
        <meshStandardMaterial color="#c29b63" roughness={0.7} />
      </mesh>
    </group>
  );
}

/**
 * Complete River Canal & Alluvial Bank Landscape
 */
export function RiverLandscape() {
  const waterMeshRef = useRef<THREE.Mesh>(null!);

  // River water undulating animation
  useFrame((state) => {
    if (!waterMeshRef.current) return;
    const time = state.clock.getElapsedTime();
    // Subtle wave tilting and scale pulse
    waterMeshRef.current.position.y = -0.42 + Math.sin(time * 0.9) * 0.025;
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Terracotta Alluvial Ground / Riverbank (Đất sét phù sa Cổ Chiên) */}
      <mesh position={[0, -0.4, 0]} receiveShadow>
        <boxGeometry args={[34, 0.8, 22]} />
        <meshStandardMaterial color="#9c4d28" roughness={0.92} metalness={0.05} />
      </mesh>

      {/* Riverbank green grass / moss patches along kiln base */}
      <mesh position={[-2, 0.02, 1.5]} receiveShadow>
        <planeGeometry args={[18, 12]} />
        <meshStandardMaterial
          color="#526b38"
          roughness={0.95}
          polygonOffset
          polygonOffsetFactor={-1}
        />
      </mesh>

      {/* River Canal Water Surface (Kênh Thầy Cai / Sông Cổ Chiên) */}
      <mesh
        ref={waterMeshRef}
        position={[0, -0.4, 13.5]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[36, 12, 32, 32]} />
        <meshStandardMaterial
          color="#1e3a47"
          roughness={0.18}
          metalness={0.82}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* Wooden Wharf / Pier (Bến đò gốm Mang Thít) */}
      <group position={[3.2, -0.15, 8.2]}>
        {/* Pier posts driven into water */}
        {[
          [-1.2, 0],
          [-1.2, 2.2],
          [1.2, 0],
          [1.2, 2.2],
        ].map(([px, pz], i) => (
          <mesh key={i} position={[px, -0.4, pz]} castShadow receiveShadow>
            <cylinderGeometry args={[0.09, 0.09, 1.8, 8]} />
            <meshStandardMaterial color="#3a2417" roughness={0.9} />
          </mesh>
        ))}

        {/* Pier wooden decking boards */}
        <mesh position={[0, 0.1, 1.1]} castShadow receiveShadow>
          <boxGeometry args={[2.8, 0.08, 2.6]} />
          <meshStandardMaterial color="#543722" roughness={0.88} />
        </mesh>

        {/* Terracotta jars stacked on pier ready for transport */}
        <mesh position={[0.8, 0.45, 0.6]} castShadow>
          <sphereGeometry args={[0.3, 12, 12]} />
          <meshStandardMaterial color="#c24b22" roughness={0.7} />
        </mesh>
        <mesh position={[0.85, 0.4, 1.3]} castShadow>
          <sphereGeometry args={[0.26, 12, 12]} />
          <meshStandardMaterial color="#b3421b" roughness={0.7} />
        </mesh>
      </group>

      {/* Sampan Boats docked on river */}
      {/* Boat 1: At the pier loaded with bricks & pots */}
      <RiverSampanBoat
        position={[3.2, -0.32, 11.2]}
        rotation={[0, 0.15, 0]}
        scale={0.95}
        bobSeed={0}
      />

      {/* Boat 2: Cruising along canal */}
      <RiverSampanBoat
        position={[-6.8, -0.32, 13.5]}
        rotation={[0, -0.3, 0]}
        scale={1.05}
        bobSeed={2.4}
      />

      {/* Water Coconut Palms along the river bank */}
      <WaterCoconutPalm position={[-10.5, -0.2, 8.5]} scale={1.2} rotation={0.4} />
      <WaterCoconutPalm position={[-7.2, -0.2, 8.2]} scale={1.0} rotation={1.2} />
      <WaterCoconutPalm position={[-4.5, -0.2, 8.8]} scale={0.85} rotation={2.1} />
      <WaterCoconutPalm position={[7.8, -0.2, 8.4]} scale={1.15} rotation={0.8} />
      <WaterCoconutPalm position={[10.5, -0.2, 8.6]} scale={1.25} rotation={1.9} />
    </group>
  );
}
