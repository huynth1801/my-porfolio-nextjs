"use client";

import { useBoot } from "./boot";
import { CameraRig } from "./camera-rig";
import { IslandLighting } from "./lighting";
import { IslandEnvironment } from "./environment";
import { IslandTerrain } from "./terrain";
import { DistrictHouse } from "./district-house";
import { DistrictSchool } from "./district-school";
import { DistrictTowers } from "./district-towers";
import { DistrictArcade } from "./district-arcade";
import { DistrictRadio } from "./district-radio";
import { BoyCharacter } from "./boy";
import { StoryFx } from "./story-fx";
import { StoryCamera } from "./story-camera";
import { AchievementCelebration } from "./celebration";

/**
 * 🏝️ Đảo nổi — "Thành phố sự nghiệp" (Floating Career Island)
 * A low-poly diorama floating in the sky featuring 5 distinct districts:
 * - Nhà (Huy's House) → About me & Mascot Cat & CV Mailbox
 * - Trường học (Tech Academy) → Education & Clock Tower
 * - Dãy tháp văn phòng (Career Towers) → Experience (TGM, CAS, Likelion, Onechain)
 * - Khu Arcade (Pixel Arcade) → Projects & Skills
 * - Đài phát thanh (Broadcast Station) → Contact & Pulsing Beacon
 */
export function Island() {
  useBoot();

  return (
    <>
      <CameraRig />
      <IslandLighting />
      <IslandEnvironment />

      {/* Floating Island Base Terrain & Nature */}
      <IslandTerrain />

      {/* 5 Career City Districts */}
      <DistrictHouse />
      <DistrictSchool />
      <DistrictTowers />
      <DistrictArcade />
      <DistrictRadio />

      {/* Story mode — "The Developer's Odyssey" */}
      <BoyCharacter />
      <StoryFx />
      <StoryCamera />
      <AchievementCelebration />
    </>
  );
}
