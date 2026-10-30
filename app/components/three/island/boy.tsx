"use client";

/* eslint-disable react-hooks/immutability --
   Three.js animation mixer, actions, and scene objects mutate continuously in useFrame. */

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import { story, type StoryPose } from "./story-store";
import { proximityStore, PROXIMITY_TARGETS, type ProximityTarget } from "@/lib/proximity-store";
import { flappy } from "./flappy";
import { getTerminalSnapshot } from "@/lib/terminal-store";
import { tourState } from "@/lib/journey-store";

useGLTF.preload("/models/player.glb");

function shortestAngle(from: number, to: number) {
  const diff = (to - from) % (Math.PI * 2);
  return from + (((diff + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
}

type AnimName =
  | "Idle"
  | "Walk"
  | "Run"
  | "CheerGo"
  | "Greeting"
  | "Dance_Wave"
  | "Sleep"
  | "Sit"
  | "Lookaround";

function getStoryAnim(pose: StoryPose, speed: number, airborne: boolean): AnimName {
  if (airborne || speed > 0.45) return "Run";
  if (speed > 0.05) return "Walk";
  switch (pose) {
    case "sleep":
      return "Sleep";
    case "pet":
      return "Dance_Wave";
    case "cheer":
      return "CheerGo";
    case "peace":
      return "Greeting";
    case "study":
    case "type":
      return "Sit";
    case "walk":
      return "Walk";
    case "jump":
      return "Run";
    case "idle":
    default:
      return "Idle";
  }
}

/**
 * 3D Protagonist powered by rigged skeletal mesh & animations (WoraWork / Animal Crossing style).
 * Replaces the procedural stick puppet with fluid, natural keyframed motion:
 * - Real skeletal walk & run cycles with foot plants and natural weight transfer
 * - Expressive gestures: Sleep, Sit, Dance/Wave, CheerGo, Greeting, Lookaround
 * - Smooth 0.25s animation crossfading via Three.js AnimationMixer
 * - Mascot accessories: Red Cap, Graduation Cap, Backpack, Cyber Book
 * - Interactive WASD / Arrow key locomotion when exploring freely
 */
export function BoyCharacter() {
  const root = useRef<THREE.Group>(null!);
  const modelRef = useRef<THREE.Group>(null!);
  const contactShadow = useRef<THREE.Mesh>(null!);
  const ring = useRef<THREE.Mesh>(null!);

  const { scene, animations } = useGLTF("/models/player.glb");
  const { actions } = useAnimations(animations, modelRef);

  const heading = useRef(2.4);
  const curAnim = useRef<AnimName>("Idle");
  const idleTimer = useRef(0);
  const sparkleSeen = useRef(story.fx.sparkle);
  const tossT = useRef(1);
  const headTarget = useMemo(() => new THREE.Vector3(), []);

  // Keyboard navigation for free exploration (WASD / Arrow keys)
  const keys = useRef({ forward: false, backward: false, left: false, right: false, shift: false });

  // Props & Accessories (attached to bones)
  const capGroup = useMemo(() => {
    const g = new THREE.Group();
    g.name = "mascot_cap";

    // Cap crown dome
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(1.15, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: "#d84f4f", roughness: 0.8 }),
    );
    dome.position.set(0, 1.48, -0.05);
    dome.scale.set(1.04, 0.62, 1.04);
    dome.castShadow = true;
    g.add(dome);

    // Visor / Brim angled nicely upward
    const visor = new THREE.Mesh(
      new THREE.BoxGeometry(1.05, 0.12, 0.65),
      new THREE.MeshStandardMaterial({ color: "#d84f4f", roughness: 0.8 }),
    );
    visor.position.set(0, 1.42, 1.05);
    visor.rotation.set(-0.16, 0, 0);
    visor.castShadow = true;
    g.add(visor);

    // Top button
    const btn = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 10, 8),
      new THREE.MeshStandardMaterial({ color: "#d84f4f", roughness: 0.8 }),
    );
    btn.position.set(0, 2.18, -0.05);
    g.add(btn);

    return g;
  }, []);

  const gradCapGroup = useMemo(() => {
    const g = new THREE.Group();
    g.name = "grad_cap";
    g.scale.setScalar(0.001);

    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.75, 0.95, 0.4, 8),
      new THREE.MeshStandardMaterial({ color: "#1c1c22", roughness: 0.5 }),
    );
    base.position.set(0, 1.7, 0.05);
    g.add(base);

    const mortar = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.14, 2.4),
      new THREE.MeshStandardMaterial({ color: "#1c1c22", roughness: 0.5 }),
    );
    mortar.position.set(0, 2.0, 0.05);
    mortar.rotation.set(0, Math.PI / 4, 0);
    mortar.castShadow = true;
    g.add(mortar);

    const tassel = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.7, 0.1),
      new THREE.MeshBasicMaterial({ color: "#ffd24a" }),
    );
    tassel.position.set(0.9, 1.6, 0.9);
    g.add(tassel);

    return g;
  }, []);

  const backpackGroup = useMemo(() => {
    const g = new THREE.Group();
    g.name = "mascot_backpack";
    g.scale.setScalar(0.001);

    const pack = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 1.5, 0.75),
      new THREE.MeshStandardMaterial({ color: "#e2574c", roughness: 0.8 }),
    );
    pack.position.set(0, 0.1, -0.65);
    pack.castShadow = true;
    g.add(pack);

    const pocket = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 0.5, 0.45),
      new THREE.MeshStandardMaterial({ color: "#e2574c", roughness: 0.8 }),
    );
    pocket.position.set(0, 0.55, -0.72);
    g.add(pocket);

    return g;
  }, []);

  const bookGroup = useMemo(() => {
    const g = new THREE.Group();
    g.name = "cyber_book";
    g.scale.setScalar(0.001);

    const cover = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 0.16, 0.8),
      new THREE.MeshStandardMaterial({ color: "#f2f0ea", roughness: 0.7 }),
    );
    cover.castShadow = true;
    g.add(cover);

    const screen = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, 0.04, 0.65),
      new THREE.MeshBasicMaterial({ color: "#67e8f9", toneMapped: false }),
    );
    screen.position.set(0, 0.1, 0);
    g.add(screen);

    return g;
  }, []);

  const camera = useThree((s) => s.camera);

  // Attach shadows & props to character bones
  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    const head = scene.getObjectByName("mixamorigHead");
    const spine = scene.getObjectByName("mixamorigSpine2");
    const hand = scene.getObjectByName("mixamorigRightHand");

    if (head) {
      head.add(capGroup);
      head.add(gradCapGroup);
    }
    if (spine) {
      spine.add(backpackGroup);
    }
    if (hand) {
      hand.add(bookGroup);
    }

    return () => {
      if (head) {
        head.remove(capGroup);
        head.remove(gradCapGroup);
      }
      if (spine) {
        spine.remove(backpackGroup);
      }
      if (hand) {
        hand.remove(bookGroup);
      }
    };
  }, [scene, capGroup, gradCapGroup, backpackGroup, bookGroup]);

  // Keyboard navigation listeners (WASD / Arrows)
  useEffect(() => {
    const isInputActive = () => {
      const el = document.activeElement;
      return (
        el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.getAttribute("contenteditable") === "true")
      );
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (isInputActive()) return;
      if (flappy.isOpen) return;
      if (getTerminalSnapshot().isOpen) return;
      if (e.code === "KeyE") {
        proximityStore.triggerActive();
      }
      if (e.code === "KeyW" || e.code === "ArrowUp") keys.current.forward = true;
      if (e.code === "KeyS" || e.code === "ArrowDown") keys.current.backward = true;
      if (e.code === "KeyA" || e.code === "ArrowLeft") keys.current.left = true;
      if (e.code === "KeyD" || e.code === "ArrowRight") keys.current.right = true;
      if (e.shiftKey) keys.current.shift = true;
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "KeyW" || e.code === "ArrowUp") keys.current.forward = false;
      if (e.code === "KeyS" || e.code === "ArrowDown") keys.current.backward = false;
      if (e.code === "KeyA" || e.code === "ArrowLeft") keys.current.left = false;
      if (e.code === "KeyD" || e.code === "ArrowRight") keys.current.right = false;
      if (!e.shiftKey) keys.current.shift = false;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  // Set action playback rates for snappy feel
  useEffect(() => {
    if (actions.Walk) actions.Walk.timeScale = 1.45;
    if (actions.Run) actions.Run.timeScale = 1.25;
    if (actions.CheerGo) actions.CheerGo.timeScale = 1.15;
    if (actions.Dance_Wave) actions.Dance_Wave.timeScale = 1.05;

    // Start with Idle
    const initial = actions.Idle;
    if (initial) {
      initial.play();
      curAnim.current = "Idle";
    }
  }, [actions]);

  useFrame((state, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    const s = story;

    /* ---------- Keyboard locomotion during free exploration ---------- */
    if (!s.playing && !flappy.isOpen && !getTerminalSnapshot().isOpen) {
      const k = keys.current;
      let dx = 0;
      let dz = 0;
      if (k.forward) dz -= 1;
      if (k.backward) dz += 1;
      if (k.left) dx -= 1;
      if (k.right) dx += 1;

      const isMoving = dx !== 0 || dz !== 0;
      if (isMoving) {
        const len = Math.hypot(dx, dz);
        dx /= len;
        dz /= len;

        const moveSpeed = k.shift ? 3.2 : 1.7;
        s.speed = k.shift ? 0.8 : 0.35;

        // Turn towards movement
        const targetHeading = Math.atan2(dx, dz);
        s.heading = targetHeading;

        if (s.py > 3.0) {
          // Constrain movement on the rooftop observatory
          s.px = Math.max(2.55, Math.min(3.15, s.px + dx * moveSpeed * dt));
          s.pz = Math.max(-1.15, Math.min(-0.45, s.pz + dz * moveSpeed * dt));
        } else {
          const nextX = s.px + dx * moveSpeed * dt;
          const nextZ = s.pz + dz * moveSpeed * dt;
          // Keep within island bounds
          if (Math.hypot(nextX, nextZ) < 5.6) {
            s.px = nextX;
            s.pz = nextZ;
          }
        }
      } else {
        s.speed = Math.max(0, s.speed - dt * 5);
      }

      // Detect closest interactive proximity target (only active during home/hero section)
      let closest: ProximityTarget | null = null;
      let minDistance = Infinity;
      if (tourState.activeWaypointId === "home") {
        for (const target of PROXIMITY_TARGETS) {
          if (target.check && !target.check(s.py)) continue;
          const dist = Math.hypot(s.px - target.pos[0], s.pz - target.pos[2]);
          if (dist <= target.radius && dist < minDistance) {
            minDistance = dist;
            closest = target;
          }
        }
      }
      proximityStore.setActive(closest);
    } else if (flappy.isOpen) {
      s.speed = 0;
      proximityStore.setActive(null);
    } else {
      proximityStore.setActive(null);
    }

    /* ---------- World Transform ---------- */
    const airborne = s.jumpT < 1;
    const arc = airborne ? s.jumpH * 4 * s.jumpT * (1 - s.jumpT) : 0;
    root.current.position.set(s.px, s.py + arc, s.pz);

    const headingTarget = shortestAngle(heading.current, s.heading);
    heading.current += (headingTarget - heading.current) * Math.min(1, dt * 10);
    root.current.rotation.y = heading.current;

    // Scale character: base ~0.24 fits the diorama island perfectly
    const baseScale = 0.24;
    const squash = s.squash;
    const stretch = airborne ? 0.06 : 0;
    root.current.scale.set(
      baseScale * s.scale * (1 + squash * 0.18 - stretch * 0.4),
      baseScale * s.scale * (1 - squash * 0.25 + stretch),
      baseScale * s.scale * (1 + squash * 0.18 - stretch * 0.4),
    );

    /* ---------- Animation Selection & Crossfade (WoraWork style) ---------- */
    let targetAnim: AnimName = getStoryAnim(s.pose, s.speed, airborne);

    // After 4.5s of standing idle, play natural Lookaround glance
    if (!s.playing && s.speed < 0.05 && s.pose === "idle") {
      idleTimer.current += dt;
      if (idleTimer.current > 4.5) {
        targetAnim = "Lookaround";
        if (idleTimer.current > 4.5 + 6.38) {
          idleTimer.current = 0;
        }
      }
    } else {
      idleTimer.current = 0;
    }

    if (targetAnim !== curAnim.current) {
      const prevAction = actions[curAnim.current];
      const nextAction = actions[targetAnim];
      if (prevAction) {
        prevAction.fadeOut(0.25);
      }
      if (nextAction) {
        nextAction.reset().fadeIn(0.25).play();
      }
      curAnim.current = targetAnim;
    }

    /* ---------- Props Scaling & Animation ---------- */
    const pop = (g: THREE.Group, v: number) => {
      g.scale.setScalar(0.001 + v * (1 + Math.sin(v * Math.PI) * 0.15));
    };
    pop(backpackGroup, s.props.backpack);
    pop(bookGroup, s.props.book);
    pop(gradCapGroup, s.props.gradCap);

    // Graduation cap toss on sparkle beat
    if (story.fx.sparkle !== sparkleSeen.current) {
      if (sparkleSeen.current < story.fx.sparkle && s.props.gradCap > 0.5 && tossT.current >= 1) {
        tossT.current = 0;
      }
      sparkleSeen.current = story.fx.sparkle;
    }
    if (tossT.current < 1) {
      tossT.current = Math.min(1, tossT.current + dt * 0.9);
      gradCapGroup.position.y = Math.sin(tossT.current * Math.PI) * 2.6;
      gradCapGroup.rotation.x = tossT.current * Math.PI * 2;
    } else {
      gradCapGroup.position.y = 0;
      gradCapGroup.rotation.x = 0;
    }

    /* ---------- Soft Contact Shadow & Level-Up Ring ---------- */
    if (contactShadow.current) {
      const targetOpacity = airborne ? 0.1 : 0.35;
      const targetScale = airborne ? 0.6 : 1.0;
      contactShadow.current.scale.setScalar(targetScale);
      (contactShadow.current.material as THREE.MeshBasicMaterial).opacity = targetOpacity;
    }

    ring.current.scale.setScalar(0.6 + s.fx.levelUp * 1.8);
    ring.current.rotation.z += dt * 2.5;
    (ring.current.material as THREE.MeshBasicMaterial).opacity = s.fx.levelUp * 0.9;

    /* ---------- Finale: Look at the camera ---------- */
    if (s.pose === "peace") {
      camera.getWorldPosition(headTarget);
      const head = scene.getObjectByName("mixamorigHead");
      if (head) {
        head.parent!.worldToLocal(headTarget);
        head.lookAt(headTarget);
      }
    }

    /* ---------- Typing pose: Seated upright at laptop with hands tapping keys ---------- */
    if (s.pose === "type") {
      const t = state.clock.elapsedTime;
      const leftArm = (scene.getObjectByName("mixamorigLeftArm") ||
        scene.getObjectByName("mixamorig:LeftArm")) as THREE.Bone | null;
      const rightArm = (scene.getObjectByName("mixamorigRightArm") ||
        scene.getObjectByName("mixamorig:RightArm")) as THREE.Bone | null;
      const leftForeArm = (scene.getObjectByName("mixamorigLeftForeArm") ||
        scene.getObjectByName("mixamorig:LeftForeArm")) as THREE.Bone | null;
      const rightForeArm = (scene.getObjectByName("mixamorigRightForeArm") ||
        scene.getObjectByName("mixamorig:RightForeArm")) as THREE.Bone | null;
      const leftHand = (scene.getObjectByName("mixamorigLeftHand") ||
        scene.getObjectByName("mixamorig:LeftHand")) as THREE.Bone | null;
      const rightHand = (scene.getObjectByName("mixamorigRightHand") ||
        scene.getObjectByName("mixamorig:RightHand")) as THREE.Bone | null;
      const head = (scene.getObjectByName("mixamorigHead") ||
        scene.getObjectByName("mixamorig:Head")) as THREE.Bone | null;

      // Lock head straight forward with zero sideways yaw/roll, gazing comfortably down at 3D screen
      if (head) {
        head.rotation.y = 0;
        head.rotation.z = 0;
        head.rotation.x = -0.22;
      }

      // Upper arms reach forward and inward toward laptop keyboard on the table
      if (leftArm) {
        leftArm.rotation.z += 0.44;
        leftArm.rotation.x += 0.12;
      }
      if (rightArm) {
        rightArm.rotation.z -= 0.44;
        rightArm.rotation.x += 0.12;
      }

      // Forearms rest horizontally directly on the tabletop at keyboard height
      if (leftForeArm) {
        leftForeArm.rotation.z += 0.15;
      }
      if (rightForeArm) {
        rightForeArm.rotation.z -= 0.15;
      }

      // Alternating rhythmic tap of hands and fingers directly onto the keyboard keys
      const tapL = Math.sin(t * 18);
      const tapR = Math.sin(t * 18 + Math.PI);
      if (leftHand) {
        leftHand.rotation.x = -0.2 + tapL * 0.14;
      }
      if (rightHand) {
        rightHand.rotation.x = -0.2 + tapR * 0.14;
      }
    }
  });

  return (
    <>
      <group ref={root} position={[story.px, story.py, story.pz]}>
        <group ref={modelRef}>
          <primitive object={scene} />
        </group>
      </group>

      {/* Soft contact shadow on the ground */}
      <mesh
        ref={contactShadow}
        position={[story.px, 0.315, story.pz]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[0.34, 24]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.35} depthWrite={false} />
      </mesh>

      {/* Level-up golden/cyan ring */}
      <mesh ref={ring} position={[story.px, 0.33, story.pz]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.55, 0.035, 8, 40]} />
        <meshBasicMaterial
          color="#67e8f9"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </>
  );
}
