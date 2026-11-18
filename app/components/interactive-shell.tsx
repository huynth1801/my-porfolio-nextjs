"use client";

import dynamic from "next/dynamic";

const PanelOverlay = dynamic(() => import("./panels/panel-overlay").then((m) => m.PanelOverlay), {
  ssr: false,
});
const StoryPlayer = dynamic(
  () => import("./three/island/story-player").then((m) => m.StoryPlayer),
  { ssr: false },
);
const AchievementToasts = dynamic(
  () => import("./achievements/achievement-toasts").then((m) => m.AchievementToasts),
  { ssr: false },
);
const TourHud = dynamic(() => import("./journey/tour-hud").then((m) => m.TourHud), { ssr: false });
const ProximityPrompt = dynamic(
  () => import("./journey/proximity-prompt").then((m) => m.ProximityPrompt),
  { ssr: false },
);
const ArcadeCabinetOverlay = dynamic(
  () => import("./three/island/arcade-cabinet-overlay").then((m) => m.ArcadeCabinetOverlay),
  { ssr: false },
);
const TerminalOverlay = dynamic(
  () => import("./terminal/terminal-overlay").then((m) => m.TerminalOverlay),
  { ssr: false },
);

export function InteractiveShell() {
  return (
    <>
      <PanelOverlay />
      <StoryPlayer />
      <AchievementToasts />
      <TourHud />
      <ProximityPrompt />
      <ArcadeCabinetOverlay />
      <TerminalOverlay />
    </>
  );
}
