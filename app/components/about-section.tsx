"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Zap, Headphones } from "lucide-react";

export default function AboutSection() {
  return (
    <section
      id="about"
      className="relative overflow-hidden bg-[#0d0d0f] text-gray-300 py-24 px-6 md:px-12 lg:px-20"
    >
      {/* Gradient background accent */}
      <div className="absolute inset-0  from-cyan-500/10 via-purple-500/10 to-pink-500/10 blur-3xl opacity-40 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        {/* LEFT: Image collage */}
        <motion.div
          className="relative grid grid-cols-2 gap-4 max-w-md mx-auto md:mx-0"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          {/* Glow behind images */}
          <div className="absolute -inset-8 from-cyan-500/20 via-purple-500/10 to-pink-500/20 blur-3xl rounded-full" />

          {/* Main portrait */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="col-span-2 relative aspect-square overflow-hidden rounded-2xl shadow-[0_0_40px_-10px_rgba(0,255,255,0.3)]"
          >
            <Image
              src="/huy.jpg"
              alt="Main portrait"
              fill
              quality={100}
              sizes="(max-width: 768px) 100vw, 320px"
              className="object-cover object-center rounded-2xl"
              priority
            />
          </motion.div>

          {/* Working image */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative aspect-square overflow-hidden rounded-2xl shadow-[0_0_30px_-10px_rgba(255,255,255,0.15)]"
          >
            <Image
              src="/working.jpg"
              alt="Working"
              fill
              quality={90}
              sizes="(max-width: 768px) 50vw, 300px"
              className="object-cover object-center rounded-2xl"
            />
          </motion.div>

          {/* Play sport image */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative aspect-square overflow-hidden rounded-2xl shadow-[0_0_30px_-10px_rgba(255,255,255,0.15)]"
          >
            <Image
              src="/play-sport.jpg"
              alt="Playing sport"
              fill
              quality={90}
              sizes="(max-width: 768px) 50vw, 300px"
              className="object-cover object-top rounded-2xl"
            />
          </motion.div>
        </motion.div>

        {/* RIGHT: About text + feature cards */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full from-cyan-500 to-pink-500 text-white text-xs font-semibold uppercase tracking-widest shadow-md">
            <Sparkles className="w-4 h-4" />
            About Me
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-white mt-5 mb-6 leading-tight">
            Huy Nguyen
          </h2>

          <p className="text-gray-400 mb-5 leading-relaxed text-[15px]">
            I’m a frontend engineer passionate about crafting smooth, engaging web experiences. I
            focus on building scalable, high-performance, and elegant interfaces using cutting-edge
            technologies like React, Next.js, and TailwindCSS.
          </p>

          <p className="text-gray-400 mb-10 leading-relaxed text-[15px]">
            I love solving UI challenges, optimizing performance, and turning creative ideas into
            stunning, interactive designs.
          </p>

          {/* Feature Cards */}
          {/* Feature Cards */}
          <motion.div
            className="grid sm:grid-cols-3 gap-5"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <CreativeFeatureCard
              icon={<Sparkles className="w-7 h-7 text-pink-400" />}
              title="Creative Design"
              desc="Turning ideas into beautiful and functional designs."
              gradient="from-pink-500/40 via-purple-500/40 to-cyan-500/40"
            />
            <CreativeFeatureCard
              icon={<Zap className="w-7 h-7 text-yellow-400" />}
              title="High Speed"
              desc="Optimized for fast performance and smooth experience."
              gradient="from-yellow-500/40 via-orange-500/40 to-red-500/40"
              delay={0.2}
            />
            <CreativeFeatureCard
              icon={<Headphones className="w-7 h-7 text-cyan-400" />}
              title="24/7 Support"
              desc="Always ready to assist and support your project."
              gradient="from-cyan-500/40 via-sky-500/40 to-purple-500/40"
              delay={0.4}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function CreativeFeatureCard({
  icon,
  title,
  desc,
  gradient,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  gradient: string;
  delay?: number;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, rotateX: 3, rotateY: -3 }}
      transition={{ type: "spring", stiffness: 200, damping: 12 }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <div className="relative group rounded-xl bg-[#141418]/70 backdrop-blur-sm border border-[#1f1f23] hover:border-transparent transition-all duration-300 overflow-hidden shadow-[0_0_25px_-8px_rgba(0,255,255,0.15)]">
        {/* Gradient Border Animation */}
        <div
          className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${gradient} blur-xl`}
        />
        <Card className="relative bg-transparent border-none text-center rounded-xl">
          <CardContent className="p-6 flex flex-col items-center justify-center space-y-4 z-10 relative">
            <motion.div
              whileHover={{ scale: 1.2, rotate: 10 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="p-3 bg-[#1b1b1f] rounded-full shadow-inner group-hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-shadow"
            >
              {icon}
            </motion.div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="text-gray-400 text-sm leading-snug max-w-[180px]">{desc}</p>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
