"use client";

/* eslint-disable react-hooks/immutability, react-hooks/purity --
   the character is a procedural puppet: refs mutate every frame,
   blink schedule is seeded with Math.random. */

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { story, type StoryPose } from "./story-store";

/**
 * Procedural low-poly protagonist — v2 rig.
 *
 * Skeleton: hips → (thigh → knee → shin/shoe) ×2, spine → (upper arm →
 * elbow → forearm/hand) ×2, head. 2 joints per limb so walks bend knees
 * and elbows instead of swinging sticks.
 *
 * Animation: GSAP tweens scalars on the story store; useFrame converts
 * them into a pose. Poses crossfade over ~0.3s (from/to snapshot blend),
 * with additive procedural layers on top: speed-scaled run cycle (knee
 * flexion, pelvis bob/roll, spine counter-twist), jump tuck, landing
 * squash, idle breathing. No React re-renders during playback.
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

/* ------------------------------------------------------------------ */
/* Pose definition & blending                                          */
/* ------------------------------------------------------------------ */

type Channels = {
  hipL: number; hipR: number; kneeL: number; kneeR: number;
  shoL: number; shoR: number; shoLZ: number; shoRZ: number;
  elbL: number; elbR: number;
  spineX: number; spineY: number; headX: number;
};

const CH_KEYS = Object.keys({
  hipL: 0, hipR: 0, kneeL: 0, kneeR: 0,
  shoL: 0, shoR: 0, shoLZ: 0, shoRZ: 0,
  elbL: 0, elbR: 0, spineX: 0, spineY: 0, headX: 0,
}) as Array<keyof Channels>;

const ZERO = Object.fromEntries(CH_KEYS.map((k) => [k, 0])) as Channels;

/** Static per-pose targets (radians). Cycles are added on top at runtime. */
const POSES: Record<StoryPose, Partial<Channels>> = {
  sleep: { spineX: 0.5 },
  idle: {},
  pet: { shoR: -1.25, elbR: 0.55, spineX: 0.14, headX: 0.1 },
  prep: { hipL: 0.5, hipR: 0.5, kneeL: 0.95, kneeR: 0.95, spineX: 0.32, shoL: -0.4, shoR: -0.4, elbL: 0.5, elbR: 0.5 },
  jump: { hipL: 0.45, hipR: 0.45, kneeL: 1.1, kneeR: 1.1 },
  land: { hipL: 0.5, hipR: 0.5, kneeL: 0.85, kneeR: 0.85, spineX: 0.2, shoL: -0.5, shoR: -0.5, elbL: 0.6, elbR: 0.6 },
  walk: {},
  study: { shoL: -1.15, shoR: -1.15, elbL: 0.55, elbR: 0.55, spineX: 0.12, headX: 0.18 },
  type: { shoL: -1.05, shoR: -1.05, elbL: 0.7, elbR: 0.7, spineX: 0.14, headX: 0.22 },
  cheer: { shoL: -2.7, shoR: -2.7, elbL: 0.2, elbR: 0.2, spineX: -0.1, headX: -0.1 },
  peace: { shoL: 0.15, shoR: -2.55, elbR: 0.35, shoRZ: -0.4, spineY: -0.1, headX: -0.06 },
};

const BLEND_TIME = 0.3;

export function BoyCharacter() {
  const root = useRef<THREE.Group>(null!);
  const flip = useRef<THREE.Group>(null!);
  const rise = useRef<THREE.Group>(null!);
  const hips = useRef<THREE.Group>(null!);
  const spine = useRef<THREE.Group>(null!);
  const hipL = useRef<THREE.Group>(null!);
  const hipR = useRef<THREE.Group>(null!);
  const kneeL = useRef<THREE.Group>(null!);
  const kneeR = useRef<THREE.Group>(null!);
  const shoL = useRef<THREE.Group>(null!);
  const shoR = useRef<THREE.Group>(null!);
  const elbL = useRef<THREE.Group>(null!);
  const elbR = useRef<THREE.Group>(null!);
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
  const stridePhase = useRef(0);
  const blinkAt = useRef(2 + Math.random() * 3);
  const blinkT = useRef(-1);
  const sparkleSeen = useRef(story.fx.sparkle);
  const tossT = useRef(1);
  const headTarget = useMemo(() => new THREE.Vector3(), []);

  // pose crossfade: channels snapshot at the moment the pose changes
  const blend = useRef({
    prev: { ...ZERO },
    target: { ...ZERO },
    t: 1,
  });
  const curPose = useRef<StoryPose>("idle");
  const lastPoseTime = useRef(0);

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
      gold: new THREE.MeshBasicMaterial({ color: "#ffd24a", toneMapped: false }),
      cyan: new THREE.MeshBasicMaterial({ color: "#67e8f9", toneMapped: false }),
    }),
    [],
  );

  useEffect(() => () => {
    Object.values(mats).forEach((m) => m.dispose());
  }, [mats]);

  useFrame((state, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    const s = story;
    const t = state.clock.elapsedTime;

    /* ---------- world transform ---------- */
    const airborne = s.jumpT < 1;
    const arc = airborne ? s.jumpH * 4 * s.jumpT * (1 - s.jumpT) : 0;
    const hop = s.pose === "cheer" && !airborne ? Math.abs(Math.sin(t * 7)) * 0.07 : 0;
    root.current.position.set(s.px, s.py + arc + hop, s.pz);

    const headingTarget = shortestAngle(heading.current, s.heading);
    heading.current += (headingTarget - heading.current) * Math.min(1, dt * 8);
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

    /* ---------- pose crossfade ---------- */
    if (s.pose !== curPose.current) {
      // snapshot the *current blended* channels as the new "from"
      CH_KEYS.forEach((k) => {
        blend.current.prev[k] = THREE.MathUtils.lerp(
          blend.current.prev[k],
          blend.current.target[k],
          smooth01(blend.current.t),
        );
      });
      blend.current.target = { ...ZERO, ...POSES[s.pose] };
      blend.current.t = 0;
      curPose.current = s.pose;
      lastPoseTime.current = t;
    }
    blend.current.t = Math.min(1, blend.current.t + dt / BLEND_TIME);
    const e = smooth01(blend.current.t);

    /* ---------- additive procedural layers ---------- */
    const stride = THREE.MathUtils.clamp(s.speed, 0, 1);
    if (stride > 0.02) stridePhase.current += (4 + s.speed * 8) * dt;
    const ph = stridePhase.current;

    const ch: Channels = { ...ZERO };
    CH_KEYS.forEach((k) => {
      ch[k] = THREE.MathUtils.lerp(blend.current.prev[k], blend.current.target[k], e);
    });

    // run/walk cycle: knee flexion, arm swing, pelvis bob & roll, counter-twist
    if (stride > 0.02) {
      ch.hipL += Math.sin(ph) * 0.55 * stride;
      ch.hipR += -Math.sin(ph) * 0.55 * stride;
      ch.kneeL += (0.2 + Math.max(0, Math.sin(ph + 0.7)) * 0.85) * stride;
      ch.kneeR += (0.2 + Math.max(0, Math.sin(ph + Math.PI + 0.7)) * 0.85) * stride;
      ch.shoL += -Math.sin(ph) * 0.45 * stride;
      ch.shoR += Math.sin(ph) * 0.45 * stride;
      ch.elbL += 0.55 * stride;
      ch.elbR += 0.55 * stride;
      ch.spineY += Math.sin(ph) * 0.09 * stride;
      ch.spineX += 0.08 * stride;
    }

    // jump tuck envelope (rises then falls inside the parabola)
    if (airborne) {
      const tuck = Math.sin(Math.PI * THREE.MathUtils.clamp(s.jumpT * 1.25, 0, 1));
      ch.kneeL += tuck * 1.15;
      ch.kneeR += tuck * 1.15;
      ch.hipL += tuck * 0.5;
      ch.hipR += tuck * 0.5;
      if (s.flip) {
        ch.shoL += tuck * -1.2;
        ch.shoR += tuck * -1.2;
        ch.elbL += tuck * 1.2;
        ch.elbR += tuck * 1.2;
      } else if (s.pose === "jump") {
        ch.shoL += tuck * -1.9;
        ch.shoR += tuck * -1.9;
      }
      ch.spineX += tuck * 0.1;
    }

    // idle breathing + pet animation
    ch.spineX += Math.sin(t * 2) * 0.012;
    if (s.pose === "pet") ch.shoR += Math.sin(t * 6) * 0.25;

    /* ---------- apply channels to the rig ---------- */
    hipL.current.rotation.x = ch.hipL;
    hipR.current.rotation.x = ch.hipR;
    kneeL.current.rotation.x = ch.kneeL;
    kneeR.current.rotation.x = ch.kneeR;
    shoL.current.rotation.x = ch.shoL;
    shoR.current.rotation.x = ch.shoR;
    shoL.current.rotation.z = ch.shoLZ;
    shoR.current.rotation.z = ch.shoRZ;
    elbL.current.rotation.x = ch.elbL;
    elbR.current.rotation.x = ch.elbR;
    spine.current.rotation.x = ch.spineX;
    spine.current.rotation.y = ch.spineY;
    hips.current.rotation.z = Math.sin(ph) * 0.05 * stride;
    hips.current.position.y =
      0.3 - ch.kneeL * 0.03 + Math.abs(Math.cos(ph)) * 0.03 * stride + Math.sin(t * 2) * 0.006;

    head.current.rotation.x = ch.headX;

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
      gradCap.current.position.y = 0.14 + Math.sin(tossT.current * Math.PI) * 0.75;
      gradCap.current.rotation.x = tossT.current * Math.PI * 2;
    } else {
      gradCap.current.position.y = 0.14;
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
          <group ref={hips}>
            {/* legs: hip → knee → shin/shoe */}
            <group ref={hipL} position={[-0.055, 0.02, 0]}>
              <mesh position={[0, -0.08, 0]} material={mats.pants} castShadow>
                <capsuleGeometry args={[0.045, 0.09, 4, 8]} />
              </mesh>
              <group ref={kneeL} position={[0, -0.17, 0]}>
                <mesh position={[0, -0.065, 0]} material={mats.skin} castShadow>
                  <capsuleGeometry args={[0.036, 0.09, 4, 8]} />
                </mesh>
                <mesh position={[0, -0.135, 0.03]} material={mats.shoe} castShadow>
                  <boxGeometry args={[0.07, 0.04, 0.115]} />
                </mesh>
              </group>
            </group>
            <group ref={hipR} position={[0.055, 0.02, 0]}>
              <mesh position={[0, -0.08, 0]} material={mats.pants} castShadow>
                <capsuleGeometry args={[0.045, 0.09, 4, 8]} />
              </mesh>
              <group ref={kneeR} position={[0, -0.17, 0]}>
                <mesh position={[0, -0.065, 0]} material={mats.skin} castShadow>
                  <capsuleGeometry args={[0.036, 0.09, 4, 8]} />
                </mesh>
                <mesh position={[0, -0.135, 0.03]} material={mats.shoe} castShadow>
                  <boxGeometry args={[0.07, 0.04, 0.115]} />
                </mesh>
              </group>
            </group>

            {/* spine → torso */}
            <group ref={spine} position={[0, 0.12, 0]}>
              <mesh position={[0, 0.26, 0]} material={mats.shirt} castShadow>
                <capsuleGeometry args={[0.105, 0.17, 4, 10]} />
              </mesh>
              <group ref={hoodie} scale={0.001}>
                <mesh position={[0, 0.26, 0]} material={mats.hoodieM} castShadow>
                  <capsuleGeometry args={[0.115, 0.17, 4, 10]} />
                </mesh>
              </group>

              {/* badge + lanyard */}
              <group ref={badge} scale={0.001}>
                <mesh position={[0.03, 0.34, 0.1]} rotation={[0.15, 0, 0]} material={mats.white}>
                  <boxGeometry args={[0.055, 0.07, 0.008]} />
                </mesh>
                <mesh position={[0.03, 0.42, 0.08]} material={mats.dark}>
                  <boxGeometry args={[0.008, 0.09, 0.004]} />
                </mesh>
              </group>

              {/* neck */}
              <mesh position={[0, 0.42, 0]} material={mats.skin} castShadow>
                <cylinderGeometry args={[0.035, 0.045, 0.05, 8]} />
              </mesh>

              {/* arms: shoulder → elbow → hand */}
              <group ref={shoL} position={[-0.155, 0.38, 0]}>
                <mesh position={[0, -0.085, 0]} material={mats.shirt} castShadow>
                  <capsuleGeometry args={[0.036, 0.1, 4, 8]} />
                </mesh>
                <group ref={elbL} position={[0, -0.155, 0]}>
                  <mesh position={[0, -0.07, 0]} material={mats.skin} castShadow>
                    <capsuleGeometry args={[0.031, 0.09, 4, 8]} />
                  </mesh>
                  <mesh position={[0, -0.145, 0]} material={mats.skin} castShadow>
                    <sphereGeometry args={[0.038, 10, 8]} />
                  </mesh>
                </group>
              </group>
              <group ref={shoR} position={[0.155, 0.38, 0]}>
                <mesh position={[0, -0.085, 0]} material={mats.shirt} castShadow>
                  <capsuleGeometry args={[0.036, 0.1, 4, 8]} />
                </mesh>
                <group ref={elbR} position={[0, -0.155, 0]}>
                  <mesh position={[0, -0.07, 0]} material={mats.skin} castShadow>
                    <capsuleGeometry args={[0.031, 0.09, 4, 8]} />
                  </mesh>
                  <mesh position={[0, -0.145, 0]} material={mats.skin} castShadow>
                    <sphereGeometry args={[0.038, 10, 8]} />
                  </mesh>
                </group>
              </group>

              {/* head (on the neck) */}
              <group ref={head} position={[0, 0.53, 0]}>
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
                <mesh position={[0, 0.28, -0.15]} material={mats.red} castShadow>
                  <boxGeometry args={[0.17, 0.22, 0.09]} />
                </mesh>
                <mesh position={[0, 0.36, -0.16]} material={mats.red}>
                  <boxGeometry args={[0.12, 0.06, 0.07]} />
                </mesh>
              </group>

              {/* book (study) */}
              <group ref={book} position={[0, 0.3, 0.2]} rotation={[-0.5, 0, 0]} scale={0.001}>
                <mesh material={mats.white} castShadow>
                  <boxGeometry args={[0.16, 0.025, 0.12]} />
                </mesh>
                <mesh position={[0, 0.016, 0]} material={mats.cyan}>
                  <boxGeometry args={[0.14, 0.004, 0.1]} />
                </mesh>
              </group>

              {/* laptop (career) */}
              <group ref={laptop} position={[0, 0.32, 0.2]} rotation={[-0.35, 0, 0]} scale={0.001}>
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
      </group>

      {/* level-up ring */}
      <mesh ref={ring} position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.55, 0.035, 8, 40]} />
        <meshBasicMaterial color="#67e8f9" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}

function smooth01(t: number) {
  return t * t * (3 - 2 * t);
}
