"use client";

/* eslint-disable react-hooks/immutability, react-hooks/purity --
   the character is a procedural puppet: refs mutate every frame,
   blink schedule is seeded with Math.random. */

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { story } from "./story-store";

/**
 * Procedural low-poly chibi protagonist of "The Developer's Odyssey".
 *
 * GSAP only tweens the plain scalars on the story store; this component
 * converts them into a pose every frame: damped limb angles per pose,
 * procedural run cycle, squash & stretch, jump parabola and prop fades.
 * Nothing here triggers a React re-render.
 */

const SKIN = "#ffcf9f";
const SHIRT = "#58b6ff";
const HOODIE = "#6d4df2";
const PANTS = "#3d4460";
const CAP = "#d84f4f";
const SHOE = "#2f2f38";

function shortestAngle(from: number, to: number) {
  const diff = (to - from) % (Math.PI * 2);
  return from + (((diff + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
}

export function BoyCharacter() {
  const root = useRef<THREE.Group>(null!);
  const flip = useRef<THREE.Group>(null!);
  const rise = useRef<THREE.Group>(null!);
  const body = useRef<THREE.Group>(null!);
  const armL = useRef<THREE.Group>(null!);
  const armR = useRef<THREE.Group>(null!);
  const legL = useRef<THREE.Group>(null!);
  const legR = useRef<THREE.Group>(null!);
  const head = useRef<THREE.Group>(null!);
  const eyeL = useRef<THREE.Mesh>(null!);
  const eyeR = useRef<THREE.Mesh>(null!);
  const ring = useRef<THREE.Mesh>(null!);
  const gradCap = useRef<THREE.Group>(null!);
  const backpack = useRef<THREE.Group>(null!);
  const laptop = useRef<THREE.Group>(null!);
  const book = useRef<THREE.Group>(null!);
  const glasses = useRef<THREE.Group>(null!);
  const badge = useRef<THREE.Group>(null!);
  const hoodie = useRef<THREE.Group>(null!);

  const heading = useRef(2.4);
  const walkPhase = useRef(0);
  const poseBlend = useRef({ armL: 0, armR: 0, legL: 0, legR: 0, bodyX: 0 });
  const blinkAt = useRef(2 + Math.random() * 3);
  const blinkT = useRef(-1);
  const sparkleSeen = useRef(story.fx.sparkle);
  const tossT = useRef(1);
  const headTarget = useMemo(() => new THREE.Vector3(), []);

  const camera = useThree((s) => s.camera);

  const mats = useMemo(
    () => ({
      skin: new THREE.MeshStandardMaterial({ color: SKIN, roughness: 0.9 }),
      shirt: new THREE.MeshStandardMaterial({ color: SHIRT, roughness: 0.85 }),
      hoodieM: new THREE.MeshStandardMaterial({ color: HOODIE, roughness: 0.85 }),
      pants: new THREE.MeshStandardMaterial({ color: PANTS, roughness: 0.9 }),
      cap: new THREE.MeshStandardMaterial({ color: CAP, roughness: 0.8 }),
      shoe: new THREE.MeshStandardMaterial({ color: SHOE, roughness: 0.7 }),
      dark: new THREE.MeshStandardMaterial({ color: "#1c1c22", roughness: 0.5 }),
      white: new THREE.MeshStandardMaterial({ color: "#f2f0ea", roughness: 0.7 }),
      red: new THREE.MeshStandardMaterial({ color: "#e2574c", roughness: 0.8 }),
      cyan: new THREE.MeshBasicMaterial({ color: "#67e8f9", toneMapped: false }),
      gold: new THREE.MeshBasicMaterial({ color: "#ffd24a", toneMapped: false }),
    }),
    [],
  );

  useFrame((state, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    const s = story;
    const t = state.clock.elapsedTime;

    /* ---------- world transform ---------- */
    const airborne = s.jumpT < 1;
    const arc = airborne ? s.jumpH * 4 * s.jumpT * (1 - s.jumpT) : 0;
    const hop = s.pose === "cheer" && !airborne ? Math.abs(Math.sin(t * 7)) * 0.07 : 0;
    root.current.position.set(s.px, s.py + arc + hop, s.pz);

    heading.current += shortestAngle(heading.current, s.heading) * Math.min(1, dt * 8);
    root.current.rotation.y = heading.current;

    const squash = s.squash;
    const stretch = airborne ? 0.08 : 0;
    root.current.scale.set(
      s.scale * (1 + squash * 0.22 - stretch * 0.5),
      s.scale * (1 - squash * 0.3 + stretch),
      s.scale * (1 + squash * 0.22 - stretch * 0.5),
    );

    flip.current.rotation.x = -s.flip * Math.PI * 2;
    rise.current.rotation.x = (1 - s.rise) * 1.15;
    rise.current.position.z = (1 - s.rise) * 0.1;

    /* ---------- pose targets per state ---------- */
    let tArmL = 0.1;
    let tArmR = 0.1;
    let tLegL = 0;
    let tLegR = 0;
    let bodyX = 0;
    const walking = s.speed > 0.05;

    if (airborne) {
      tLegL = -0.55;
      tLegR = -0.35;
      if (s.pose === "jump" && !s.flip) {
        tArmL = -2.3;
        tArmR = -2.3;
      } else {
        tArmL = -1.1;
        tArmR = -1.6;
      }
      bodyX = 0.12;
    } else if (walking) {
      const swing = Math.sin(walkPhase.current) * 0.7;
      tLegL = swing;
      tLegR = -swing;
      tArmL = -swing * 0.6;
      tArmR = swing * 0.6;
      bodyX = 0.06;
    } else {
      switch (s.pose) {
        case "pet":
          tArmR = -1.35 + Math.sin(t * 6) * 0.25;
          bodyX = 0.12;
          break;
        case "prep":
          tLegL = 0.35;
          tLegR = 0.35;
          bodyX = 0.18;
          break;
        case "land":
          tLegL = 0.4;
          tLegR = 0.4;
          bodyX = 0.14;
          break;
        case "study":
        case "type":
          tArmL = -1.2;
          tArmR = -1.2;
          bodyX = 0.1;
          break;
        case "cheer":
          tArmL = -2.7;
          tArmR = -2.7;
          break;
        case "peace":
          tArmL = 0.2;
          tArmR = -2.65;
          break;
        default:
          tArmL = 0.1 + Math.sin(t * 1.8) * 0.04;
          tArmR = 0.1 + Math.sin(t * 1.8 + 1) * 0.04;
      }
    }

    walkPhase.current += s.speed * 9 * dt;

    const pk = 1 - Math.exp(-11 * dt);
    const pb = poseBlend.current;
    pb.armL += (tArmL - pb.armL) * pk;
    pb.armR += (tArmR - pb.armR) * pk;
    pb.legL += (tLegL - pb.legL) * pk;
    pb.legR += (tLegR - pb.legR) * pk;
    pb.bodyX += (bodyX - pb.bodyX) * pk;

    armL.current.rotation.x = pb.armL + (walking ? Math.sin(walkPhase.current) * 0.15 : 0);
    armR.current.rotation.x = pb.armR - (walking ? Math.sin(walkPhase.current) * 0.15 : 0);
    armR.current.rotation.z = s.pose === "peace" && !airborne ? -0.5 : 0;
    legL.current.rotation.x = pb.legL;
    legR.current.rotation.x = pb.legR;

    body.current.position.y =
      0.06 + Math.abs(Math.sin(walkPhase.current)) * 0.025 * s.speed + Math.sin(t * 2) * 0.006;
    body.current.rotation.x = pb.bodyX;

    head.current.rotation.x = s.pose === "peace" ? -0.08 : Math.sin(t * 1.2) * 0.03;
    head.current.rotation.z = s.pose === "peace" ? 0.1 : 0;

    /* ---------- blinking ---------- */
    if (blinkT.current < 0 && t > blinkAt.current) blinkT.current = 0;
    if (blinkT.current >= 0) {
      blinkT.current += dt;
      const closed = s.pose === "sleep" || blinkT.current < 0.12;
      const sc = closed ? 0.12 : 1;
      eyeL.current.scale.y = sc;
      eyeR.current.scale.y = sc;
      if (blinkT.current > 0.22) {
        blinkT.current = -1;
        blinkAt.current = t + 1.6 + Math.random() * 2.8;
      }
    }

    /* ---------- props ---------- */
    const pop = (g: THREE.Group, v: number) => {
      g.scale.setScalar(0.001 + v * (1 + Math.sin(v * Math.PI) * 0.15));
    };
    pop(backpack.current, s.props.backpack);
    pop(hoodie.current, s.props.hoodie);
    pop(glasses.current, s.props.glasses);
    pop(badge.current, s.props.badge);
    pop(book.current, s.props.book);
    pop(laptop.current, s.props.laptop);
    pop(gradCap.current, s.props.gradCap);

    // graduation cap toss on each sparkle beat
    if (story.fx.sparkle !== sparkleSeen.current) {
      if (sparkleSeen.current < story.fx.sparkle && s.props.gradCap > 0.5 && tossT.current >= 1) {
        tossT.current = 0;
      }
      sparkleSeen.current = story.fx.sparkle;
    }
    if (tossT.current < 1) {
      tossT.current = Math.min(1, tossT.current + dt * 0.9);
      gradCap.current.position.y = 0.16 + Math.sin(tossT.current * Math.PI) * 0.75;
      gradCap.current.rotation.x = tossT.current * Math.PI * 2;
    } else {
      gradCap.current.position.y = 0.16;
      gradCap.current.rotation.x = 0;
    }

    /* ---------- level-up ring ---------- */
    ring.current.scale.setScalar(0.6 + s.fx.levelUp * 1.8);
    ring.current.rotation.z += dt * 2.5;
    (ring.current.material as THREE.MeshBasicMaterial).opacity = s.fx.levelUp * 0.9;

    /* ---------- finale: look at the camera ---------- */
    if (s.pose === "peace") {
      camera.getWorldPosition(headTarget);
      head.current.parent!.worldToLocal(headTarget);
      head.current.lookAt(headTarget);
      head.current.rotation.z = 0.1;
    }
  });

  return (
    <group ref={root} position={[story.px, story.py, story.pz]}>
      <group ref={flip}>
        <group ref={rise}>
          <group ref={body}>
            {/* legs */}
            <group ref={legL} position={[-0.055, 0.26, 0]}>
              <mesh position={[0, -0.09, 0]} material={mats.pants} castShadow>
                <capsuleGeometry args={[0.042, 0.13, 4, 8]} />
              </mesh>
              <mesh position={[0, -0.185, 0.03]} material={mats.shoe} castShadow>
                <boxGeometry args={[0.075, 0.045, 0.12]} />
              </mesh>
            </group>
            <group ref={legR} position={[0.055, 0.26, 0]}>
              <mesh position={[0, -0.09, 0]} material={mats.pants} castShadow>
                <capsuleGeometry args={[0.042, 0.13, 4, 8]} />
              </mesh>
              <mesh position={[0, -0.185, 0.03]} material={mats.shoe} castShadow>
                <boxGeometry args={[0.075, 0.045, 0.12]} />
              </mesh>
            </group>

            {/* torso */}
            <mesh position={[0, 0.42, 0]} material={mats.shirt} castShadow>
              <capsuleGeometry args={[0.105, 0.17, 4, 10]} />
            </mesh>
            <group ref={hoodie} scale={0.001}>
              <mesh position={[0, 0.42, 0]} material={mats.hoodieM} castShadow>
                <capsuleGeometry args={[0.115, 0.17, 4, 10]} />
              </mesh>
            </group>

            {/* badge + lanyard */}
            <group ref={badge} scale={0.001}>
              <mesh position={[0.03, 0.5, 0.1]} rotation={[0.15, 0, 0]} material={mats.white}>
                <boxGeometry args={[0.055, 0.07, 0.008]} />
              </mesh>
              <mesh position={[0.03, 0.58, 0.08]} material={mats.dark}>
                <boxGeometry args={[0.008, 0.09, 0.004]} />
              </mesh>
            </group>

            {/* arms */}
            <group ref={armL} position={[-0.15, 0.53, 0]}>
              <mesh position={[0, -0.1, 0]} material={mats.shirt} castShadow>
                <capsuleGeometry args={[0.038, 0.13, 4, 8]} />
              </mesh>
              <mesh position={[0, -0.2, 0]} material={mats.skin} castShadow>
                <sphereGeometry args={[0.036, 10, 8]} />
              </mesh>
            </group>
            <group ref={armR} position={[0.15, 0.53, 0]}>
              <mesh position={[0, -0.1, 0]} material={mats.shirt} castShadow>
                <capsuleGeometry args={[0.038, 0.13, 4, 8]} />
              </mesh>
              <mesh position={[0, -0.2, 0]} material={mats.skin} castShadow>
                <sphereGeometry args={[0.036, 10, 8]} />
              </mesh>
            </group>

            {/* head */}
            <group ref={head} position={[0, 0.68, 0]}>
              <mesh material={mats.skin} castShadow>
                <sphereGeometry args={[0.155, 18, 16]} />
              </mesh>
              <mesh position={[0, 0.075, -0.01]} scale={[1, 0.62, 1]} material={mats.cap} castShadow>
                <sphereGeometry args={[0.158, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
              </mesh>
              <mesh position={[0, 0.035, 0.13]} material={mats.cap}>
                <boxGeometry args={[0.14, 0.02, 0.09]} />
              </mesh>
              <mesh ref={eyeL} position={[-0.055, 0.02, 0.135]}>
                <sphereGeometry args={[0.019, 8, 8]} />
                <meshBasicMaterial color="#1c1c22" />
              </mesh>
              <mesh ref={eyeR} position={[0.055, 0.02, 0.135]}>
                <sphereGeometry args={[0.019, 8, 8]} />
                <meshBasicMaterial color="#1c1c22" />
              </mesh>
              <group ref={glasses} scale={0.001}>
                {[-0.055, 0.055].map((x) => (
                  <mesh key={x} position={[x, 0.02, 0.148]} material={mats.dark}>
                    <torusGeometry args={[0.032, 0.007, 8, 16]} />
                  </mesh>
                ))}
                <mesh position={[0, 0.02, 0.148]} material={mats.dark}>
                  <boxGeometry args={[0.05, 0.006, 0.004]} />
                </mesh>
              </group>
              {/* graduation cap */}
              <group ref={gradCap} position={[0, 0.16, 0]} scale={0.001}>
                <mesh material={mats.dark} castShadow>
                  <cylinderGeometry args={[0.1, 0.12, 0.05, 4]} />
                </mesh>
                <mesh position={[0, 0.04, 0]} rotation={[0, Math.PI / 4, 0]} material={mats.dark} castShadow>
                  <boxGeometry args={[0.3, 0.018, 0.3]} />
                </mesh>
                <mesh position={[0.12, 0, 0.12]} material={mats.gold}>
                  <boxGeometry args={[0.015, 0.09, 0.015]} />
                </mesh>
              </group>
            </group>

            {/* backpack */}
            <group ref={backpack} scale={0.001}>
              <mesh position={[0, 0.44, -0.15]} material={mats.red} castShadow>
                <boxGeometry args={[0.17, 0.22, 0.09]} />
              </mesh>
              <mesh position={[0, 0.52, -0.16]} material={mats.red}>
                <boxGeometry args={[0.12, 0.06, 0.07]} />
              </mesh>
            </group>

            {/* book (study) */}
            <group ref={book} position={[0, 0.5, 0.2]} rotation={[-0.5, 0, 0]} scale={0.001}>
              <mesh material={mats.white} castShadow>
                <boxGeometry args={[0.16, 0.025, 0.12]} />
              </mesh>
              <mesh position={[0, 0.016, 0]} material={mats.cyan}>
                <boxGeometry args={[0.14, 0.004, 0.1]} />
              </mesh>
            </group>

            {/* laptop (career) */}
            <group ref={laptop} position={[0, 0.52, 0.2]} rotation={[-0.35, 0, 0]} scale={0.001}>
              <mesh material={mats.dark} castShadow>
                <boxGeometry args={[0.22, 0.012, 0.15]} />
              </mesh>
              <mesh position={[0, 0.07, -0.07]} rotation={[-0.35, 0, 0]}>
                <boxGeometry args={[0.22, 0.14, 0.008]} />
                <meshBasicMaterial color="#22d3ee" toneMapped={false} />
              </mesh>
            </group>
          </group>
        </group>
      </group>

      {/* level-up ring */}
      <mesh ref={ring} position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.55, 0.035, 8, 40]} />
        <meshBasicMaterial color="#67e8f9" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}
