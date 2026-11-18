"use client";

import { memo } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { Gamepad2, Gauge, Rocket, ShieldCheck, Sparkles, Terminal } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/social-icon";
import { profile, strengths } from "@/lib/content";

const STRENGTH_ICONS = {
  gamepad: Gamepad2,
  gauge: Gauge,
  rocket: Rocket,
} as const;

const STRENGTH_ACCENTS = {
  gamepad: "text-rose-400 border-rose-500/20 bg-rose-500/10",
  gauge: "text-amber-400 border-amber-500/20 bg-amber-500/10",
  rocket: "text-cyan-400 border-cyan-500/20 bg-cyan-500/10",
} as const;

function StrengthCard({ strength }: { strength: (typeof strengths)[number] }) {
  const Icon = STRENGTH_ICONS[strength.icon];
  const accent = STRENGTH_ACCENTS[strength.icon];

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="group relative rounded-xl border border-white/10 bg-[#0e111a]/80 p-4 text-left transition-all duration-300 hover:border-cyan-400/40 hover:shadow-[0_8px_24px_-8px_rgba(34,211,238,0.25)]"
    >
      <div className="flex items-center justify-between">
        <div className={`flex size-8 items-center justify-center rounded-lg border ${accent}`}>
          <Icon className="size-4" />
        </div>
        <span className="font-mono text-[9px] uppercase tracking-wider text-gray-400 group-hover:text-cyan-300">
          PASSIVE TRAIT
        </span>
      </div>
      <h3 className="mt-3 text-sm font-bold text-white group-hover:text-cyan-200 transition-colors">
        {strength.title}
      </h3>
      <p className="mt-1 text-xs leading-relaxed text-gray-300">{strength.desc}</p>
    </motion.div>
  );
}

const AboutSection = memo(function AboutSection() {
  return (
    <section
      id="about"
      data-zone="about"
      className="pointer-events-auto relative px-5 py-24 sm:px-8 md:px-12 md:py-28"
    >
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:gap-14 lg:grid-cols-2">
        {/* LEFT: Cyber Character Dossier / Photo Grid */}
        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          {/* Tactical Frame Backdrop Glow */}
          <div className="pointer-events-none absolute -inset-3 rounded-3xl bg-linear-to-tr from-cyan-500/10 via-purple-500/5 to-transparent blur-2xl" />

          <div className="relative grid grid-cols-2 gap-3.5">
            {/* Primary Portrait Card */}
            <div className="group relative col-span-2 aspect-4/3 sm:aspect-16/10 overflow-hidden rounded-2xl border border-cyan-400/25 bg-[#0e111a] shadow-[0_0_40px_-10px_rgba(34,211,238,0.3)]">
              <Image
                src="/huy.jpg"
                alt={`${profile.name} portrait`}
                fill
                sizes="(max-width: 768px) 100vw, 520px"
                className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07080b]/90 via-transparent to-transparent" />

              {/* Operator HUD Overlay */}
              <div className="absolute inset-x-3 bottom-3 flex items-center justify-between rounded-xl border border-white/15 bg-black/60 px-3.5 py-2 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                  <div>
                    <p className="font-mono text-[11px] font-bold text-white tracking-wider">
                      HUY NGUYEN
                    </p>
                    <p className="font-mono text-[9px] text-gray-400">CLASS: FRONTEND ARCHITECT</p>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-cyan-300 font-bold px-2 py-0.5 rounded border border-cyan-400/30 bg-cyan-950/40">
                  LVL.4
                </span>
              </div>
            </div>

            {/* Sub-Card 1: Engineering Focus */}
            <div className="group relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-[#0e111a] transition-all duration-300 hover:border-cyan-400/40">
              <Image
                src="/working.jpg"
                alt="Huy Nguyen working on frontend engineering code"
                fill
                sizes="(max-width: 768px) 50vw, 260px"
                className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[10px] font-mono text-gray-300">
                <span className="flex items-center gap-1 font-semibold text-white">
                  <Terminal className="size-3 text-cyan-400" />
                  DEV_LAB
                </span>
                <span className="text-[9px] text-gray-400">60 FPS Focus</span>
              </div>
            </div>

            {/* Sub-Card 2: Lifestyle / Energy */}
            <div className="group relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-[#0e111a] transition-all duration-300 hover:border-cyan-400/40">
              <Image
                src="/play-sport.jpg"
                alt="Huy Nguyen active in sports and outdoor activities"
                fill
                sizes="(max-width: 768px) 50vw, 260px"
                className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[10px] font-mono text-gray-300">
                <span className="flex items-center gap-1 font-semibold text-white">
                  <ShieldCheck className="size-3 text-emerald-400" />
                  STAMINA
                </span>
                <span className="text-[9px] text-gray-400">Team Play</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: High-Tech Dossier Panel */}
        <div className="glass relative z-10 rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl border border-white/12">
          {/* Top Telemetry Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] font-semibold tracking-wider text-cyan-300 uppercase px-2.5 py-0.5 rounded-full bg-cyan-400/10 border border-cyan-400/25">
                WAYPOINT 02 // DOSSIER & HEADQUARTERS
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-mono text-gray-400">
                <Sparkles className="size-3 text-cyan-400" />
                Character Stats
              </span>
            </div>
            <span className="font-mono text-[10px] text-emerald-400 flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" />
              AVAILABLE FOR HIRE
            </span>
          </div>

          <h2 className="mt-5 text-2xl sm:text-3xl md:text-4xl leading-tight font-black text-white">
            From Game Engines <span className="text-cyan-300">to Scalable Web Apps</span>
          </h2>

          <p className="mt-4 text-[14px] sm:text-[15px] leading-relaxed text-gray-300">
            Tôi bước vào thế giới web từ xuất phát điểm lập trình game, luôn đặt trải nghiệm tương
            tác{" "}
            <span className="text-white font-semibold underline decoration-cyan-400 decoration-2 underline-offset-4">
              mượt mà & xúc giác (game-feel)
            </span>{" "}
            lên hàng đầu. Hiện tại, tôi tập trung kiến tạo các sản phẩm web quy mô lớn với React 19,
            Next.js và TypeScript, đồng thời vận dụng WebGL / Three.js khi dự án cần tạo ấn tượng
            thị giác khác biệt.
          </p>

          <p className="mt-3 text-[14px] sm:text-[15px] leading-relaxed text-gray-300">
            Triết lý cốt lõi: chuyển động có chủ đích, tối ưu render 60 FPS khắt khe, và tinh thần
            đồng hành end-to-end cùng designer và backend team.
          </p>

          {/* RPG Strengths / Trait Grid */}
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {strengths.map((strength) => (
              <StrengthCard key={strength.title} strength={strength} />
            ))}
          </div>

          {/* Actions & Social Links */}
          <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
            <div className="flex items-center gap-2.5">
              <a
                href={profile.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="flex size-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-300 transition-all hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                <GithubIcon />
              </a>
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="flex size-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-300 transition-all hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                <LinkedinIcon />
              </a>
            </div>

            <a
              href="#experience"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-950/40 px-4 py-2 text-xs font-mono font-bold text-cyan-300 transition-colors hover:bg-cyan-900/60 hover:border-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              <span>Xem Quest Log [↓]</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
});

AboutSection.displayName = "AboutSection";

export default AboutSection;
