"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { HometownLighting } from "./hometown-lighting";
import { MangThitKilnCluster } from "./pottery-kiln";
import { RiverLandscape } from "./river-landscape";
import { HometownHotspots, type HometownHotspotData, type HotspotId } from "./hometown-hotspots";
import { HometownCameraRig } from "./hometown-camera-rig";

type HometownSceneProps = {
  desiredPos: [number, number, number];
  desiredTarget: [number, number, number];
  isTransitioning: boolean;
  activeHotspotId: HotspotId | null;
  onSelectHotspot: (spot: HometownHotspotData) => void;
  onTransitionEnd?: () => void;
};

function SceneFallback() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1c0e09] text-amber-100">
      <div className="size-10 rounded-full border-2 border-amber-500/30 border-t-amber-400 animate-spin mb-3" />
      <p className="text-sm font-medium tracking-wide text-amber-200">Đang khởi tạo Lò Gốm 3D...</p>
      <p className="text-xs text-amber-300/60 mt-1">Vương quốc Đỏ Mang Thít, Vĩnh Long</p>
    </div>
  );
}

export function HometownScene({
  desiredPos,
  desiredTarget,
  isTransitioning,
  activeHotspotId,
  onSelectHotspot,
  onTransitionEnd,
}: HometownSceneProps) {
  return (
    <div className="relative size-full overflow-hidden select-none">
      <Suspense fallback={<SceneFallback />}>
        <Canvas
          shadows
          dpr={[1, 1.75]}
          camera={{ fov: 42, near: 0.2, far: 140, position: desiredPos }}
          gl={{ antialias: true, powerPreference: "high-performance" }}
          style={{ touchAction: "none" }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.15;
          }}
        >
          {/* Sunset Lighting & Sky Fog */}
          <HometownLighting />

          {/* Mang Thit Pottery Kilns Cluster & Brick Shed */}
          <MangThitKilnCluster />

          {/* River Canal, Wooden Sampan Boats & Coconut Palms */}
          <RiverLandscape />

          {/* Interactive 3D Heritage Markers */}
          <HometownHotspots activeId={activeHotspotId} onSelect={onSelectHotspot} />

          {/* Smooth Camera Rig & Orbit Controls */}
          <HometownCameraRig
            desiredPos={desiredPos}
            desiredTarget={desiredTarget}
            isTransitioning={isTransitioning}
            onTransitionEnd={onTransitionEnd}
          />

          {/* Cinematic Bloom & Sunset Warm Vignette */}
          <EffectComposer>
            <Bloom mipmapBlur intensity={0.7} luminanceThreshold={0.5} luminanceSmoothing={0.3} />
            <Vignette eskil={false} offset={0.16} darkness={0.4} />
          </EffectComposer>
        </Canvas>
      </Suspense>
    </div>
  );
}
