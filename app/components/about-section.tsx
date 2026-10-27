"use client";

import { memo } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { Gamepad2, Gauge, Rocket, Sparkles } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/social-icon";
import { profile, strengths } from "@/lib/content";

const STRENGTH_ICONS = {
  gamepad: Gamepad2,
  gauge: Gauge,
  rocket: Rocket,
} as const;

const STRENGTH_ACCENTS = {
  gamepad: "text-pink-400",
  gauge: "text-yellow-400",
  rocket: "text-cyan-400",
} as const;

function StrengthCard({ strength }: { strength: (typeof strengths)[number] }) {
  const Icon = STRENGTH_ICONS[strength.icon];
  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      className="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-left transition-colors hover:border-cyan-400/30"
    >
      <Icon className={`size-5 ${STRENGTH_ACCENTS[strength.icon]}`} />
      <h3 className="mt-2.5 text-sm font-semibold text-white">{strength.title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-gray-300">{strength.desc}</p>
    </motion.div>
  );
}

const AboutSection = memo(function AboutSection() {
  return (
    <section
      id="about"
      data-zone="about"
      className="pointer-events-auto relative px-6 py-28 md:px-12"
    >
      <div className="relative mx-auto grid max-w-6xl items-center gap-16 md:grid-cols-2">
        {/* LEFT: photo collage */}
        <motion.div
          className="relative mx-auto grid max-w-md grid-cols-2 gap-4 md:mx-0"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="relative col-span-2 aspect-square overflow-hidden rounded-2xl border border-white/10 shadow-[0_0_40px_-10px_rgba(34,211,238,0.3)]"
          >
            <Image
              src="/huy.jpg"
              alt={`${profile.name} portrait`}
              fill
              quality={100}
              sizes="(max-width: 768px) 100vw, 320px"
              className="object-cover object-center"
              priority
            />
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative aspect-square overflow-hidden rounded-2xl border border-white/10"
          >
            <Image
              src="/working.jpg"
              alt="Working"
              fill
              quality={90}
              sizes="(max-width: 768px) 50vw, 300px"
              className="object-cover object-center"
            />
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative aspect-square overflow-hidden rounded-2xl border border-white/10"
          >
            <Image
              src="/play-sport.jpg"
              alt="Playing sport"
              fill
              quality={90}
              sizes="(max-width: 768px) 50vw, 300px"
              className="object-cover object-top"
            />
          </motion.div>
        </motion.div>

        {/* RIGHT: story + concrete strengths */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="glass relative z-10 rounded-3xl p-7 md:p-9 shadow-2xl border border-white/12"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] font-semibold tracking-wider text-cyan-300 uppercase px-2.5 py-0.5 rounded-full bg-cyan-400/10 border border-cyan-400/25">
              WAYPOINT 02 // HUY&apos;S HOUSE
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400">
              <Sparkles className="size-3 text-cyan-400" />
              Player profile
            </span>
          </div>

          <h2 className="mt-5 mb-5 text-3xl leading-tight font-bold text-white md:text-4xl">
            From game engines
            <br />
            to web apps
          </h2>

          <p className="mb-4 text-[15px] leading-relaxed text-gray-300">
            I came to the web from game development — I care as much about how an interface{" "}
            <span className="text-white font-medium">feels</span> as how it looks. These days I build
            scalable, high-performance products with React, Next.js and TypeScript, and I reach for
            WebGL when a page deserves to be memorable.
          </p>

          <p className="mb-6 text-[15px] leading-relaxed text-gray-300">
            What you get either way: motion with intent, render discipline, and features shipped
            end-to-end with design and backend teams.
          </p>

          <div className="grid gap-3.5 sm:grid-cols-3">
            {strengths.map((strength) => (
              <StrengthCard key={strength.title} strength={strength} />
            ))}
          </div>

          <div className="mt-7 flex gap-3">
            <a
              href={profile.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-400 transition-colors hover:border-white/30 hover:text-white"
            >
              <GithubIcon />
            </a>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-400 transition-colors hover:border-white/30 hover:text-white"
            >
              <LinkedinIcon />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
});

AboutSection.displayName = "AboutSection";

export default AboutSection;
