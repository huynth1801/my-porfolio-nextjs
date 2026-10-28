"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { story } from "./story-store";
import { getRig } from "./lighting";
import { sfx } from "@/lib/audio";

/* ================================================================== */
/* 1. RETRO MINI BUS (Chiếc xe buýt vàng tí hon)                       */
/* ================================================================== */

const BUS_WAYPOINTS = [
  new THREE.Vector3(-4.0, 0.22, 0.4),
  new THREE.Vector3(-2.6, 0.22, 3.8),
  new THREE.Vector3(1.2, 0.22, 4.2),
  new THREE.Vector3(4.2, 0.22, 2.2),
  new THREE.Vector3(4.4, 0.22, -0.4),
  new THREE.Vector3(2.6, 0.22, -2.8),
  new THREE.Vector3(0.2, 0.22, -3.8),
  new THREE.Vector3(-2.6, 0.22, -3.2),
];

export function RetroBus() {
  const busGroup = useRef<THREE.Group>(null!);
  const chassisRef = useRef<THREE.Group>(null!);
  const frontLeftWheel = useRef<THREE.Mesh>(null!);
  const frontRightWheel = useRef<THREE.Mesh>(null!);
  const rearLeftWheel = useRef<THREE.Mesh>(null!);
  const rearRightWheel = useRef<THREE.Mesh>(null!);
  const headlightGlowRef = useRef<THREE.MeshStandardMaterial>(null!);

  const rig = getRig();
  const progress = useRef(0);
  const currentSpeed = useRef(0.042);
  const honkCooldown = useRef(0);

  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3(BUS_WAYPOINTS, true, "centripetal", 0.4);
  }, []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const s = story;
    const group = busGroup.current;
    if (!group) return;

    // Check distance to boy (pedestrian safety!)
    const currentPos = group.position;
    const distToBoy = Math.hypot(currentPos.x - s.px, currentPos.z - s.pz);
    const isBoyClose = distToBoy < 1.3 && s.py < 1.0;

    // Decelerate if boy is blocking the road, otherwise cruise
    const targetSpeed = isBoyClose ? 0 : 0.045;
    currentSpeed.current += (targetSpeed - currentSpeed.current) * Math.min(1, dt * 4);

    // Friendly gentle horn if boy just stepped in front of bus
    honkCooldown.current = Math.max(0, honkCooldown.current - dt);
    if (isBoyClose && honkCooldown.current === 0) {
      sfx.honk();
      honkCooldown.current = 4.0;
    }

    // Advance along the circuit
    progress.current = (progress.current + currentSpeed.current * dt) % 1;

    const pos = curve.getPointAt(progress.current);
    const nextPos = curve.getPointAt((progress.current + 0.015) % 1);

    group.position.set(pos.x, pos.y, pos.z);
    group.lookAt(nextPos.x, nextPos.y, nextPos.z);

    // Rotate wheels as bus drives
    const wheelRot = currentSpeed.current * dt * 45;
    if (frontLeftWheel.current) frontLeftWheel.current.rotation.x += wheelRot;
    if (frontRightWheel.current) frontRightWheel.current.rotation.x += wheelRot;
    if (rearLeftWheel.current) rearLeftWheel.current.rotation.x += wheelRot;
    if (rearRightWheel.current) rearRightWheel.current.rotation.x += wheelRot;

    // Suspension chassis bobbing & slight turning roll
    if (chassisRef.current) {
      const bob =
        Math.sin(state.clock.elapsedTime * 14) * 0.015 * (currentSpeed.current > 0.01 ? 1 : 0);
      chassisRef.current.position.y = 0.12 + bob;
      chassisRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 6) * 0.025;
    }

    // Night headlight glow intensity
    if (headlightGlowRef.current) {
      headlightGlowRef.current.emissiveIntensity = 1.0 + rig.neon * 2.5;
    }
  });

  return (
    <group
      ref={busGroup}
      onClick={(e) => {
        e.stopPropagation();
        sfx.honk();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "";
      }}
    >
      {/* Chassis & Body Container */}
      <group ref={chassisRef} position={[0, 0.12, 0]}>
        {/* Main Yellow Bus Body */}
        <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.5, 0.28, 0.88]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.4} />
        </mesh>

        {/* White Retro Curved Roof */}
        <mesh position={[0, 0.32, -0.01]} castShadow>
          <boxGeometry args={[0.49, 0.07, 0.86]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} />
        </mesh>

        {/* Front Windshield Glass */}
        <mesh position={[0, 0.2, 0.445]}>
          <planeGeometry args={[0.42, 0.15]} />
          <meshStandardMaterial
            color="#7dd3fc"
            roughness={0.1}
            metalness={0.2}
            transparent
            opacity={0.88}
          />
        </mesh>

        {/* Rear Window Glass */}
        <mesh position={[0, 0.2, -0.445]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[0.4, 0.14]} />
          <meshStandardMaterial
            color="#7dd3fc"
            roughness={0.1}
            metalness={0.2}
            transparent
            opacity={0.88}
          />
        </mesh>

        {/* Left Side Windows */}
        {[-0.2, 0.05, 0.28].map((z, idx) => (
          <mesh key={`win-l-${idx}`} position={[-0.252, 0.2, z]} rotation={[0, -Math.PI / 2, 0]}>
            <planeGeometry args={[0.18, 0.13]} />
            <meshStandardMaterial
              color="#7dd3fc"
              roughness={0.1}
              metalness={0.2}
              transparent
              opacity={0.88}
            />
          </mesh>
        ))}

        {/* Right Side Windows */}
        {[-0.2, 0.05, 0.28].map((z, idx) => (
          <mesh key={`win-r-${idx}`} position={[0.252, 0.2, z]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[0.18, 0.13]} />
            <meshStandardMaterial
              color="#7dd3fc"
              roughness={0.1}
              metalness={0.2}
              transparent
              opacity={0.88}
            />
          </mesh>
        ))}

        {/* Chrome Front Grille & Bumper */}
        <mesh position={[0, 0.08, 0.45]}>
          <boxGeometry args={[0.44, 0.06, 0.04]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Chrome Rear Bumper */}
        <mesh position={[0, 0.08, -0.45]}>
          <boxGeometry args={[0.44, 0.06, 0.04]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Glowing Headlights */}
        {[-0.17, 0.17].map((x, idx) => (
          <mesh key={`hl-${idx}`} position={[x, 0.14, 0.448]}>
            <sphereGeometry args={[0.042, 8, 8]} />
            <meshStandardMaterial
              ref={idx === 0 ? headlightGlowRef : undefined}
              color="#fef08a"
              emissive="#fde047"
              emissiveIntensity={1.5}
            />
          </mesh>
        ))}

        {/* Red Taillights */}
        {[-0.18, 0.18].map((x, idx) => (
          <mesh key={`tl-${idx}`} position={[x, 0.14, -0.448]}>
            <boxGeometry args={[0.04, 0.04, 0.015]} />
            <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={1.2} />
          </mesh>
        ))}
      </group>

      {/* 4 Spinning Wheels */}
      <mesh
        ref={frontLeftWheel}
        position={[-0.24, 0.07, 0.26]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
      >
        <cylinderGeometry args={[0.07, 0.07, 0.045, 12]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>
      <mesh
        ref={frontRightWheel}
        position={[0.24, 0.07, 0.26]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
      >
        <cylinderGeometry args={[0.07, 0.07, 0.045, 12]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>
      <mesh
        ref={rearLeftWheel}
        position={[-0.24, 0.07, -0.26]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
      >
        <cylinderGeometry args={[0.07, 0.07, 0.045, 12]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>
      <mesh
        ref={rearRightWheel}
        position={[0.24, 0.07, -0.26]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
      >
        <cylinderGeometry args={[0.07, 0.07, 0.045, 12]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>
    </group>
  );
}

/* ================================================================== */
/* 2. ORIGAMI PAPER AIRPLANE (Máy bay giấy lượn trên trời)             */
/* ================================================================== */

const FLIGHT_WAYPOINTS = [
  new THREE.Vector3(0, 4.8, 1.2),
  new THREE.Vector3(3.2, 5.5, 2.4),
  new THREE.Vector3(4.5, 4.9, -1.0),
  new THREE.Vector3(1.8, 4.2, -4.4),
  new THREE.Vector3(-1.2, 5.2, -4.6),
  new THREE.Vector3(-3.8, 5.8, -2.4),
  new THREE.Vector3(-4.4, 5.1, 1.6),
];

export function PaperAirplane() {
  const planeGroup = useRef<THREE.Group>(null!);
  const planeMesh = useRef<THREE.Group>(null!);
  const progress = useRef(0.2);
  const prevYaw = useRef(0);

  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3(FLIGHT_WAYPOINTS, true, "centripetal", 0.5);
  }, []);

  // Custom procedural Origami Paper Plane geometry
  const planeGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    // Triangular faces for an origami folded paper airplane
    // Nose at [0, 0, 0.38], Wingtips at [-0.38, 0.06, -0.3] & [0.38, 0.06, -0.3]
    const vertices = new Float32Array([
      // Left wing top
      0, 0.02, 0.38, -0.38, 0.07, -0.3, 0, 0.03, -0.26,
      // Right wing top
      0, 0.02, 0.38, 0, 0.03, -0.26, 0.38, 0.07, -0.3,
      // Left keel
      0, 0.02, 0.38, 0, 0.03, -0.26, 0, -0.1, -0.05,
      // Right keel
      0, 0.02, 0.38, 0, -0.1, -0.05, 0, 0.03, -0.26,
    ]);
    geo.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  const planeMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#fcfbf7",
      roughness: 0.5,
      side: THREE.DoubleSide,
      flatShading: true,
    });
  }, []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const group = planeGroup.current;
    if (!group) return;

    // Glide smoothly along skyway
    progress.current = (progress.current + dt * 0.035) % 1;

    const pos = curve.getPointAt(progress.current);
    const nextPos = curve.getPointAt((progress.current + 0.012) % 1);

    group.position.set(pos.x, pos.y, pos.z);
    group.lookAt(nextPos.x, nextPos.y, nextPos.z);

    // Calculate turning bank angle (roll into turn)
    const currentYaw = group.rotation.y;
    const yawDelta = currentYaw - prevYaw.current;
    prevYaw.current = currentYaw;

    if (planeMesh.current) {
      // Natural aerodynamic roll and pitch
      const targetRoll = -THREE.MathUtils.clamp(yawDelta * 18, -0.7, 0.7);
      const gentleSway = Math.sin(state.clock.elapsedTime * 3) * 0.06;
      planeMesh.current.rotation.z +=
        (targetRoll + gentleSway - planeMesh.current.rotation.z) * Math.min(1, dt * 6);
    }
  });

  return (
    <group ref={planeGroup}>
      <group ref={planeMesh}>
        <mesh geometry={planeGeo} material={planeMat} castShadow />

        {/* Tiny playful cyan stripe on wing edge */}
        <mesh position={[-0.2, 0.06, -0.28]} rotation={[0, 0, 0.12]}>
          <boxGeometry args={[0.16, 0.005, 0.02]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        <mesh position={[0.2, 0.06, -0.28]} rotation={[0, 0, -0.12]}>
          <boxGeometry args={[0.16, 0.005, 0.02]} />
          <meshBasicMaterial color="#f43f5e" />
        </mesh>
      </group>
    </group>
  );
}

/* ================================================================== */
/* 3. CENTRAL PLAZA PIGEONS (Đàn chim bồ câu giật mình bay)           */
/* ================================================================== */

interface PigeonData {
  homeX: number;
  homeZ: number;
  homeRot: number;
  flightOffset: number;
}

export function PlazaPigeons() {
  const pigeonsData = useMemo<PigeonData[]>(() => {
    return [
      { homeX: -0.65, homeZ: 0.9, homeRot: 0.5, flightOffset: 0.0 },
      { homeX: -1.1, homeZ: 0.35, homeRot: 1.8, flightOffset: 0.12 },
      { homeX: -0.4, homeZ: -0.9, homeRot: 3.1, flightOffset: 0.25 },
      { homeX: 0.75, homeZ: -0.6, homeRot: -1.4, flightOffset: 0.08 },
      { homeX: 1.15, homeZ: 0.45, homeRot: -0.6, flightOffset: 0.18 },
      { homeX: 0.3, homeZ: 1.1, homeRot: 2.2, flightOffset: 0.3 },
    ];
  }, []);

  const flockRef = useRef<THREE.Group>(null!);
  const isScattered = useRef(false);
  const flightTimer = useRef(0);
  const flapCooldown = useRef(0);

  // Common pigeon materials
  const bodyMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#64748b", roughness: 0.8, flatShading: true }),
    [],
  );
  const wingMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({ color: "#475569", roughness: 0.8, side: THREE.DoubleSide }),
    [],
  );
  const beakMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#ea580c", roughness: 0.5 }),
    [],
  );

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const s = story;
    const flock = flockRef.current;
    if (!flock) return;

    // Check distance between boy and central plaza center [0, 0]
    const distToPlaza = Math.hypot(s.px, s.pz);
    const isBoyThreat = distToPlaza < 1.7 && s.py < 1.0;

    // Scatter trigger
    if (isBoyThreat && !isScattered.current) {
      isScattered.current = true;
      flightTimer.current = 0;
      if (flapCooldown.current === 0) {
        sfx.flap();
        flapCooldown.current = 3.0;
      }
    }
    flapCooldown.current = Math.max(0, flapCooldown.current - dt);

    if (isScattered.current) {
      flightTimer.current += dt;
      // After circling in the air, return to ground when boy moves away
      if (flightTimer.current > 4.5 && !isBoyThreat) {
        isScattered.current = false;
        flightTimer.current = 0;
      }
    }

    const t = state.clock.elapsedTime;

    // Animate each pigeon individually
    flock.children.forEach((pigeonGroup, i) => {
      const data = pigeonsData[i];
      if (!data) return;

      const head = pigeonGroup.getObjectByName("pigeon_head");
      const leftWing = pigeonGroup.getObjectByName("wing_l");
      const rightWing = pigeonGroup.getObjectByName("wing_r");

      if (!isScattered.current) {
        // Peaceful state on cobblestones: peck crumbs, bob head, turn
        const peck = Math.sin(t * 8 + i * 1.5);
        if (head) {
          head.rotation.x = Math.max(0, peck) * 0.45;
        }
        if (leftWing && rightWing) {
          leftWing.rotation.z = -0.15;
          rightWing.rotation.z = 0.15;
        }

        // Rest at home position on plaza floor
        pigeonGroup.position.set(data.homeX, 0.03, data.homeZ);
        pigeonGroup.rotation.y = data.homeRot + Math.sin(t * 0.8 + i) * 0.2;
      } else {
        // Startled flight state: take off in arc, circle the fountain, then glide
        const flightT = Math.min(1, flightTimer.current / 0.8);
        const flightAlt = Math.sin(flightT * Math.PI * 0.5) * (1.8 + i * 0.25);

        // Circle radius expands outward
        const orbitAngle = t * 2.2 + data.flightOffset * Math.PI * 2;
        const orbitRadius = 1.3 + Math.sin(t * 0.8) * 0.4;
        const targetX = Math.cos(orbitAngle) * orbitRadius;
        const targetZ = Math.sin(orbitAngle) * orbitRadius;

        pigeonGroup.position.set(targetX, 0.03 + flightAlt, targetZ);
        // Face tangential forward direction
        pigeonGroup.rotation.y = -orbitAngle - Math.PI / 2;

        // Vigorously flap wings
        const flap = Math.sin(t * 32 + i * 2) * 0.85;
        if (leftWing && rightWing) {
          leftWing.rotation.z = -0.2 + flap;
          rightWing.rotation.z = 0.2 - flap;
        }
        if (head) {
          head.rotation.x = -0.15; // stretch forward while flying
        }
      }
    });
  });

  return (
    <group ref={flockRef}>
      {pigeonsData.map((p, idx) => (
        <group
          key={idx}
          position={[p.homeX, 0.03, p.homeZ]}
          rotation={[0, p.homeRot, 0]}
          scale={0.16}
        >
          {/* Pigeon Body */}
          <mesh position={[0, 0.22, 0]} material={bodyMat} castShadow>
            <dodecahedronGeometry args={[0.3, 0]} />
          </mesh>

          {/* Greenish Iridescent Neck Collar */}
          <mesh position={[0, 0.38, 0.1]}>
            <cylinderGeometry args={[0.16, 0.2, 0.14, 6]} />
            <meshStandardMaterial color="#059669" roughness={0.4} />
          </mesh>

          {/* Bobbing Head */}
          <group name="pigeon_head" position={[0, 0.46, 0.16]}>
            <mesh material={bodyMat}>
              <sphereGeometry args={[0.13, 8, 8]} />
            </mesh>
            {/* Orange Beak */}
            <mesh position={[0, -0.02, 0.15]} rotation={[Math.PI / 2, 0, 0]} material={beakMat}>
              <coneGeometry args={[0.045, 0.12, 4]} />
            </mesh>
          </group>

          {/* Left Wing (Pivoting at shoulder) */}
          <group name="wing_l" position={[-0.2, 0.28, 0]}>
            <mesh position={[-0.18, 0, -0.06]} material={wingMat}>
              <boxGeometry args={[0.34, 0.04, 0.44]} />
            </mesh>
          </group>

          {/* Right Wing (Pivoting at shoulder) */}
          <group name="wing_r" position={[0.2, 0.28, 0]}>
            <mesh position={[0.18, 0, -0.06]} material={wingMat}>
              <boxGeometry args={[0.34, 0.04, 0.44]} />
            </mesh>
          </group>

          {/* Tail Feathers */}
          <mesh position={[0, 0.25, -0.32]} rotation={[-0.3, 0, 0]} material={wingMat}>
            <boxGeometry args={[0.22, 0.03, 0.28]} />
          </mesh>

          {/* Tiny Orange Feet */}
          {[-0.09, 0.09].map((x, fIdx) => (
            <mesh key={`foot-${fIdx}`} position={[x, 0.05, 0]} material={beakMat}>
              <cylinderGeometry args={[0.02, 0.02, 0.1, 4]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/* ================================================================== */
/* 4. MASTER EXPORT: AMBIENT LIFE                                     */
/* ================================================================== */

export function AmbientLife() {
  return (
    <group name="island_ambient_life">
      {/* 1. Yellow Retro Mini Bus cruising around the loop road */}
      <RetroBus />

      {/* 2. Origami Paper Airplane soaring across the sky & clouds */}
      <PaperAirplane />

      {/* 3. Interactive Pigeon Flock on the Central Plaza */}
      <PlazaPigeons />
    </group>
  );
}
