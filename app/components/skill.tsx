"use client";
import React, { useEffect, useState, memo, useLayoutEffect } from "react";

// --- Type Definitions ---
type IconType = "html" | "css" | "javascript" | "typescript" | "react" | "java" | "tailwind";

type GlowColor = "cyan" | "purple";

interface SkillIconProps {
  type: IconType;
}

interface SkillConfig {
  id: string;
  orbitRadius: number;
  size: number;
  speed: number;
  iconType: IconType;
  phaseShift: number;
  glowColor: GlowColor;
  label: string;
}

interface OrbitingSkillProps {
  config: SkillConfig;
  angle: number;
}

interface GlowingOrbitPathProps {
  radius: number;
  glowColor?: GlowColor;
  animationDelay?: number;
}

// --- Improved SVG Icon Components ---
const iconComponents: Record<IconType, { component: () => React.JSX.Element; color: string }> = {
  html: {
    component: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path
          d="M1.5 0h21l-1.91 21.563L11.977 24l-8.564-2.438L1.5 0zm7.031 9.75l-.232-2.718 10.059.003.23-2.622L5.412 4.41l.698 8.01h9.126l-.326 3.426-2.91.804-2.955-.81-.188-2.11H6.248l.33 4.171L12 19.351l5.379-1.443.744-8.157H8.531z"
          fill="#E34F26"
        />
      </svg>
    ),
    color: "#E34F26",
  },
  css: {
    component: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path
          d="M1.5 0h21l-1.91 21.563L11.977 24l-8.565-2.438L1.5 0zm17.09 4.413L5.41 4.41l.213 2.622 10.125.002-.255 2.716h-6.64l.24 2.573h6.182l-.366 3.523-2.91.804-2.956-.81-.188-2.11h-2.61l.29 3.751L12 19.351l5.379-1.443.744-8.157z"
          fill="#1572B6"
        />
      </svg>
    ),
    color: "#1572B6",
  },
  javascript: {
    component: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <rect width="24" height="24" fill="#F7DF1E" />
        <path
          d="M22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z"
          fill="#323330"
        />
      </svg>
    ),
    color: "#F7DF1E",
  },
  typescript: {
    component: () => (
      <svg
        viewBox="0 0 122.88 122.88"
        xmlns="http://www.w3.org/2000/svg"
        fillRule="evenodd"
        clipRule="evenodd"
      >
        <path
          fill="#007ACC"
          d="M0,61.44V0h122.88v122.88H0V61.44L0,61.44z M0,61.44L0,61.44L0,61.44L0,61.44z"
        />
        <path
          fill="#FFFFFF"
          d="M26.94,61.65v5.01h15.97v45.47h11.34V66.66h15.97v-4.92c0-2.76,0-5.01-0.12-5.07
          c0-0.09-9.74-0.12-21.57-0.12l-21.5,0.09v5.04L26.94,61.65z
          M98.73,56.52c3.13,0.74,5.53,2.15,7.68,4.39c1.14,1.23,2.83,3.38,2.95,3.93
          c0,0.18-5.31,3.78-8.54,5.78c-0.12,0.09-0.61-0.43-1.11-1.23
          c-1.6-2.27-3.23-3.26-5.78-3.44c-3.69-0.25-6.14,1.69-6.14,4.91
          c0,0.98,0.18,1.54,0.55,2.33c0.83,1.69,2.37,2.7,7.13,4.79
          c8.79,3.78,12.6,6.27,14.9,9.83c2.61,3.99,3.19,10.26,1.44,14.96
          c-1.97,5.13-6.76,8.6-13.61,9.74c-2.15,0.37-7.07,0.31-9.37-0.09
          c-4.91-0.92-9.62-3.38-12.5-6.54c-1.14-1.23-3.32-4.52-3.19-4.73l1.17-0.74
          l4.61-2.67l3.47-2.03l0.8,1.08c1.01,1.6,3.29,3.75,4.61,4.49
          c3.99,2.06,9.34,1.78,11.98-0.61c1.14-1.04,1.63-2.15,1.63-3.69
          c0-1.41-0.22-2.06-0.92-3.13c-0.98-1.35-2.95-2.46-8.48-4.91
          c-6.36-2.7-9.06-4.42-11.58-7.07c-1.44-1.6-2.76-4.09-3.38-6.14
          c-0.46-1.78-0.61-6.14-0.18-7.9c1.32-6.14,5.96-10.44,12.6-11.67
          c2.15-0.43,7.22-0.25,9.34,0.31L98.73,56.52z"
        />
      </svg>
    ),
    color: "#007ACC",
  },
  react: {
    component: () => (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <g stroke="#61DAFB" strokeWidth="1" fill="none">
          <circle cx="12" cy="12" r="2.05" fill="#61DAFB" />
          <ellipse cx="12" cy="12" rx="11" ry="4.2" />
          <ellipse cx="12" cy="12" rx="11" ry="4.2" transform="rotate(60 12 12)" />
          <ellipse cx="12" cy="12" rx="11" ry="4.2" transform="rotate(120 12 12)" />
        </g>
      </svg>
    ),
    color: "#61DAFB",
  },
  java: {
    component: () => (
      <svg
        viewBox="0 0 512 512"
        xmlns="http://www.w3.org/2000/svg"
        fillRule="evenodd"
        clipRule="evenodd"
        strokeLinejoin="round"
        strokeMiterlimit={2}
      >
        <path
          d="M465.42 30.092c-7.322 17.802-16.791 33.584-27.27 47.725C391.94 30.723 327.295.8 255.96.8 115.815.8 1.3 114.684 1.3 255.334c0 73.482 31.438 139.64 81.31 186.355l9.469 8.46c44.063 37.245 101.384 59.845 163.755 59.845 133.833 0 244.055-104.414 253.524-236.226 7.576-64.013-11.868-145.953-43.937-243.676zM119.478 443.836c-7.323 9.47-20.96 10.48-30.428 3.156-9.47-7.323-10.48-20.958-3.157-30.428 7.323-9.469 20.959-10.48 30.428-3.156 8.964 7.323 10.48 20.959 3.157 30.428zm344.429-76.133c-62.498 83.456-196.835 55.174-282.437 59.34 0 0-15.277 1.01-30.428 3.157 0 0 5.808-2.651 13.13-5.303 60.351-20.958 88.76-25.251 125.5-44.063 68.81-35.226 137.494-112.37 151.256-192.164-26.262 76.638-106.056 142.797-178.528 169.564-49.871 18.433-139.64 36.235-139.64 36.235l-3.661-2.146c-60.856-29.923-63.002-162.24 48.356-204.789 48.862-18.938 95.072-8.46 148.1-20.959 56.184-13.13 121.333-55.174 147.468-110.222 29.165 88.759 64.896 226.253.884 311.35z"
          fill="#6cb52d"
          fillRule="nonzero"
        />
        <path
          d="M119.477 443.836c-7.323 9.47-20.96 10.48-30.428 3.156-9.47-7.323-10.48-20.958-3.157-30.428 7.323-9.469 20.959-10.48 30.428-3.156 8.964 7.323 10.48 20.959 3.157 30.428zM463.906 367.703c-62.498 83.456-196.835 55.174-282.437 59.34 0 0-15.277 1.01-30.428 3.157 0 0 5.808-2.651 13.13-5.303 60.351-20.958 88.76-25.251 125.5-44.063 68.81-35.226 137.494-112.37 151.256-192.164-26.262 76.638-106.056 142.797-178.528 169.564-49.871 18.433-139.64 36.235-139.64 36.235l-3.661-2.146c-60.856-29.923-63.002-162.24 48.356-204.789 48.862-18.938 95.072-8.46 148.1-20.959 56.184-13.13 121.333-55.174 147.468-110.222 29.165 88.759 64.896 226.253.884 311.35z"
          fill="#fff"
          fillRule="nonzero"
        />
      </svg>
    ),
    color: "#339933",
  },
  tailwind: {
    component: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path
          d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z"
          fill="#06B6D4"
        />
      </svg>
    ),
    color: "#06B6D4",
  },
};

// --- Memoized Icon Component ---
const SkillIcon = memo(({ type }: SkillIconProps) => {
  const IconComponent = iconComponents[type]?.component;
  return IconComponent ? <IconComponent /> : null;
});
SkillIcon.displayName = "SkillIcon";

// --- Configuration for the Orbiting Skills ---
const skillsConfig: SkillConfig[] = [
  // Inner Orbit
  {
    id: "html",
    orbitRadius: 100,
    size: 40,
    speed: 1,
    iconType: "html",
    phaseShift: 0,
    glowColor: "cyan",
    label: "HTML5",
  },
  {
    id: "css",
    orbitRadius: 100,
    size: 45,
    speed: 1,
    iconType: "css",
    phaseShift: Math.PI / 2,
    glowColor: "cyan",
    label: "CSS3",
  },
  {
    id: "javascript",
    orbitRadius: 100,
    size: 40,
    speed: 1,
    iconType: "javascript",
    phaseShift: Math.PI,
    glowColor: "cyan",
    label: "JavaScript",
  },
  {
    id: "typescript",
    orbitRadius: 100,
    size: 40,
    speed: 1,
    iconType: "typescript",
    phaseShift: (3 * Math.PI) / 2,
    glowColor: "cyan",
    label: "Typescript",
  },
  // Outer Orbit
  {
    id: "react",
    orbitRadius: 180,
    size: 50,
    speed: -0.6,
    iconType: "react",
    phaseShift: 0,
    glowColor: "purple",
    label: "React",
  },
  {
    id: "java",
    orbitRadius: 180,
    size: 45,
    speed: -0.6,
    iconType: "java",
    phaseShift: (2 * Math.PI) / 3,
    glowColor: "purple",
    label: "Java",
  },
  {
    id: "tailwind",
    orbitRadius: 180,
    size: 40,
    speed: -0.6,
    iconType: "tailwind",
    phaseShift: (4 * Math.PI) / 3,
    glowColor: "purple",
    label: "Tailwind CSS",
  },
];

// --- Memoized Orbiting Skill Component ---
const OrbitingSkill = memo(({ config, angle }: OrbitingSkillProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { orbitRadius, size, iconType, label } = config;

  const x = Math.cos(angle) * orbitRadius;
  const y = Math.sin(angle) * orbitRadius;

  return (
    <div
      className="absolute top-1/2 left-1/2 transition-all duration-300 ease-out"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        transform: `translate(calc(${x}px - 50%), calc(${y}px - 50%))`,
        zIndex: isHovered ? 20 : 10,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`
          relative w-full h-full p-2 bg-gray-800/90 backdrop-blur-sm
          rounded-full flex items-center justify-center
          transition-all duration-300 cursor-pointer
          ${isHovered ? "scale-125 shadow-2xl" : "shadow-lg hover:shadow-xl"}
        `}
        style={{
          boxShadow: isHovered
            ? `0 0 30px ${iconComponents[iconType]?.color}40, 0 0 60px ${iconComponents[iconType]?.color}20`
            : undefined,
        }}
      >
        <SkillIcon type={iconType} />
        {isHovered && (
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900/95 backdrop-blur-sm rounded text-xs text-white whitespace-nowrap pointer-events-none">
            {label}
          </div>
        )}
      </div>
    </div>
  );
});
OrbitingSkill.displayName = "OrbitingSkill";

// --- Optimized Orbit Path Component ---
const GlowingOrbitPath = memo(
  ({ radius, glowColor = "cyan", animationDelay = 0 }: GlowingOrbitPathProps) => {
    const glowColors = {
      cyan: {
        primary: "rgba(6, 182, 212, 0.4)",
        secondary: "rgba(6, 182, 212, 0.2)",
        border: "rgba(6, 182, 212, 0.3)",
      },
      purple: {
        primary: "rgba(147, 51, 234, 0.4)",
        secondary: "rgba(147, 51, 234, 0.2)",
        border: "rgba(147, 51, 234, 0.3)",
      },
    };

    const colors = glowColors[glowColor] || glowColors.cyan;

    return (
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
        style={{
          width: `${radius * 2}px`,
          height: `${radius * 2}px`,
          animationDelay: `${animationDelay}s`,
        }}
      >
        {/* Glowing background */}
        <div
          className="absolute inset-0 rounded-full animate-pulse"
          style={{
            background: `radial-gradient(circle, transparent 30%, ${colors.secondary} 70%, ${colors.primary} 100%)`,
            boxShadow: `0 0 60px ${colors.primary}, inset 0 0 60px ${colors.secondary}`,
            animation: "pulse 4s ease-in-out infinite",
            animationDelay: `${animationDelay}s`,
          }}
        />

        {/* Static ring for depth */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            border: `1px solid ${colors.border}`,
            boxShadow: `inset 0 0 20px ${colors.secondary}`,
          }}
        />
      </div>
    );
  },
);
GlowingOrbitPath.displayName = "GlowingOrbitPath";

// --- Main App Component ---
export default function OrbitingSkills() {
  const [time, setTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useLayoutEffect(() => {
    const id = requestAnimationFrame(() => {
      setIsClient(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!isClient || isPaused) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      setTime((prevTime) => prevTime + deltaTime);
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, isClient]);

  const orbitConfigs: Array<{ radius: number; glowColor: GlowColor; delay: number }> = [
    { radius: 100, glowColor: "cyan", delay: 0 },
    { radius: 180, glowColor: "purple", delay: 1.5 },
  ];

  return (
    <main className="w-full flex items-center justify-center overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #374151 0%, transparent 50%),
                             radial-gradient(circle at 75% 75%, #4B5563 0%, transparent 50%)`,
          }}
        />
      </div>

      <div
        className="relative w-[calc(100vw-40px)] h-[calc(100vw-40px)] md:w-[450px] md:h-[450px] flex items-center justify-center"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Central "Code" Icon with enhanced glow */}
        <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center z-10 relative shadow-2xl">
          <div className="absolute inset-0 rounded-full bg-cyan-500/30 blur-xl animate-pulse"></div>
          <div
            className="absolute inset-0 rounded-full bg-purple-500/20 blur-2xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div className="relative z-10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06B6D4" />
                  <stop offset="100%" stopColor="#9333EA" />
                </linearGradient>
              </defs>
              <polyline points="16 18 22 12 16 6"></polyline>
              <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
          </div>
        </div>

        {/* Render glowing orbit paths */}
        {orbitConfigs.map((config) => (
          <GlowingOrbitPath
            key={`path-${config.radius}`}
            radius={config.radius}
            glowColor={config.glowColor}
            animationDelay={config.delay}
          />
        ))}

        {/* Render orbiting skill icons */}
        {isClient &&
          skillsConfig.map((config) => {
            const angle = time * config.speed + (config.phaseShift || 0);
            return <OrbitingSkill key={config.id} config={config} angle={angle} />;
          })}
      </div>
    </main>
  );
}
