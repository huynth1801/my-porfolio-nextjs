"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useProximity } from "@/lib/proximity-store";

interface HeartParticle {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  rot: number;
  rotSpeed: number;
  scale: number;
  life: number;
  maxLife: number;
}

/**
 * Floating pixel hearts popping above the cat when petted.
 */
export function FloatingHearts() {
  const { heartsCount } = useProximity();
  const group = useRef<THREE.Group>(null!);
  const particles = useRef<HeartParticle[]>([]);

  // Simple heart shape geometry
  const heartGeo = useMemo(() => {
    const shape = new THREE.Shape();
    const x = 0,
      y = 0;
    shape.moveTo(x + 0.1, y + 0.1);
    shape.bezierCurveTo(x + 0.1, y + 0.18, x + 0.05, y + 0.28, x, y + 0.28);
    shape.bezierCurveTo(x - 0.08, y + 0.28, x - 0.14, y + 0.2, x - 0.14, y + 0.1);
    shape.bezierCurveTo(x - 0.14, y + 0.02, x - 0.04, y - 0.08, x, y - 0.18);
    shape.bezierCurveTo(x + 0.04, y - 0.08, x + 0.14, y + 0.02, x + 0.14, y + 0.1);
    shape.bezierCurveTo(x + 0.14, y + 0.2, x + 0.08, y + 0.28, x, y + 0.28);
    return new THREE.ShapeGeometry(shape);
  }, []);

  const heartMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#ff3b69",
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9,
        toneMapped: false,
      }),
    [],
  );

  // When petted, spawn particles in effect
  useEffect(() => {
    if (heartsCount <= 0) return;
    // Cat position on porch: x: -3.17, y: 0.55, z: 3.37
    for (let i = 0; i < 6; i++) {
      particles.current.push({
        pos: new THREE.Vector3(
          -3.17 + (Math.random() - 0.5) * 0.25,
          0.55 + Math.random() * 0.1,
          3.37 + (Math.random() - 0.5) * 0.25,
        ),
        vel: new THREE.Vector3(
          (Math.random() - 0.5) * 0.2,
          0.45 + Math.random() * 0.4,
          (Math.random() - 0.5) * 0.2,
        ),
        rot: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 3,
        scale: 0.4 + Math.random() * 0.4,
        life: 0,
        maxLife: 1.4 + Math.random() * 0.6,
      });
    }
  }, [heartsCount]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const camera = state.camera;

    // Update active particles
    for (let i = particles.current.length - 1; i >= 0; i--) {
      const p = particles.current[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        particles.current.splice(i, 1);
        continue;
      }
      p.pos.addScaledVector(p.vel, dt);
      p.pos.x += Math.sin(p.life * 6) * 0.005; // gentle wobble
      p.rot += p.rotSpeed * dt;
    }

    // Synchronize meshes in group
    while (group.current.children.length < particles.current.length) {
      const mesh = new THREE.Mesh(heartGeo, heartMat.clone());
      group.current.add(mesh);
    }
    while (group.current.children.length > particles.current.length) {
      group.current.remove(group.current.children[group.current.children.length - 1]);
    }

    particles.current.forEach((p, idx) => {
      const mesh = group.current.children[idx] as THREE.Mesh;
      if (!mesh) return;
      mesh.position.copy(p.pos);
      mesh.quaternion.copy(camera.quaternion); // billboard to camera
      mesh.rotation.z += p.rot;

      const progress = p.life / p.maxLife;
      const scale = p.scale * (1 - Math.pow(progress, 3));
      mesh.scale.setScalar(scale);
      (mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - progress);
    });
  });

  return <group ref={group} />;
}
