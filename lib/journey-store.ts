import type Lenis from "lenis";

export type JourneyTier = "high" | "low";

export type TourWaypoint = {
  id: string;
  index: string;
  name: string;
  district: string;
  pivot: [number, number, number];
  radius: number;
  yaw: number;
  pitch: number;
};

export const TOUR_WAYPOINTS: TourWaypoint[] = [
  {
    id: "home",
    index: "01",
    name: "Overview",
    district: "Thành phố sự nghiệp",
    pivot: [0, 1.4, 0],
    radius: 16.5,
    yaw: 0.6,
    pitch: 0.5,
  },
  {
    id: "about",
    index: "02",
    name: "About me",
    district: "Huy's House",
    pivot: [-3.4, 0.9, 2.3],
    radius: 8.2,
    yaw: 0.35,
    pitch: 0.38,
  },
  {
    id: "experience",
    index: "03",
    name: "Experience",
    district: "Career Towers",
    pivot: [3.6, 1.7, -1.1],
    radius: 9.5,
    yaw: 1.85,
    pitch: 0.36,
  },
  {
    id: "projects",
    index: "04",
    name: "Projects",
    district: "Pixel Arcade",
    pivot: [-3.2, 1.2, -2.2],
    radius: 8.5,
    yaw: -2.05,
    pitch: 0.38,
  },
  {
    id: "skills",
    index: "05",
    name: "Skills",
    district: "Skills Terminal",
    pivot: [-2.6, 1.0, -1.8],
    radius: 7.8,
    yaw: -1.95,
    pitch: 0.36,
  },
  {
    id: "education",
    index: "06",
    name: "Education",
    district: "Tech Academy",
    pivot: [3.2, 1.1, 2.8],
    radius: 8.6,
    yaw: 0.95,
    pitch: 0.38,
  },
  {
    id: "contact",
    index: "07",
    name: "Contact",
    district: "Broadcast Station",
    pivot: [0.2, 2.2, -4.3],
    radius: 9.2,
    yaw: -3.14,
    pitch: 0.32,
  },
];

/**
 * Mutable state computed from GSAP ScrollTrigger and read by Three.js CameraRig
 * every animation frame with 0 React re-renders.
 */
export const tourState = {
  activeWaypointIndex: 0,
  activeWaypointId: "home",
  targetPivot: [0, 1.4, 0] as [number, number, number],
  targetRadius: 16.5,
  targetYaw: 0.6,
  targetPitch: 0.5,
};

export const journey = {
  progress: 0,
  pointer: { x: 0, y: 0 },
  reduced: false,
  tier: "high" as JourneyTier,
  lenis: null as Lenis | null,
};

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const smoothstep = (t: number) => t * t * (3 - 2 * t);
