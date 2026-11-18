import { ArrowRight, FileDown, Github, Linkedin, Mail, Radio, Sparkles } from "lucide-react";
import { profile } from "@/lib/content";

/**
 * Cyber Game Dev / High-Tech RPG Broadcast Station.
 * Final scroll waypoint with interactive communication channels.
 */
export function ContactCta() {
  return (
    <section
      id="contact"
      data-zone="contact"
      className="pointer-events-auto relative flex min-h-[92vh] flex-col items-center justify-center px-5 py-24 sm:px-8 md:px-12 md:py-28 text-center"
    >
      <div className="glass relative max-w-2xl rounded-3xl p-7 sm:p-10 md:p-12 shadow-2xl border border-white/12 flex flex-col items-center">
        {/* Ambient Glow */}
        <div className="pointer-events-none absolute -inset-2 rounded-3xl bg-linear-to-r from-cyan-500/10 via-purple-500/10 to-transparent blur-2xl" />

        {/* Top Frequency Telemetry */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
          <span className="font-mono text-[10px] font-semibold tracking-wider text-cyan-300 uppercase px-2.5 py-0.5 rounded-full bg-cyan-400/10 border border-cyan-400/25 flex items-center gap-1.5">
            <Radio className="size-3 text-cyan-400 animate-pulse" />
            WAYPOINT 07 // BROADCAST STATION
          </span>
          <span className="font-mono text-[11px] text-emerald-400 flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" />
            FREQUENCY: ACTIVE & LISTENING
          </span>
        </div>

        <h2 className="mt-3 max-w-xl text-balance text-2xl sm:text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
          Let&apos;s Build the <span className="text-cyan-300">Next Level</span> Together.
        </h2>

        <p className="mt-4 max-w-lg text-pretty text-xs sm:text-sm leading-relaxed text-gray-300">
          Sẵn sàng đồng hành cùng các sản phẩm web quy mô lớn, kỹ thuật sáng tạo 3D WebGL và tối ưu
          trải nghiệm tương tác. Hộp thư và kênh liên lạc luôn ở chế độ sẵn sàng tiếp nhận.
        </p>

        {/* Tactical Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
          <a
            href={`mailto:${profile.email}`}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 text-xs sm:text-sm font-bold text-neutral-950 shadow-[0_0_24px_rgba(34,211,238,0.4)] transition-all duration-200 hover:bg-cyan-300 hover:scale-[1.02] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
          >
            <Mail className="size-4" />
            <span>{profile.email}</span>
          </a>

          <a
            href="/contact"
            className="group inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-xs sm:text-sm font-semibold text-gray-200 backdrop-blur-sm transition-all duration-200 hover:border-cyan-400/40 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            <span>Gửi tin nhắn trực tiếp</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        {/* Social Capsules */}
        <div className="mt-8 flex items-center gap-3">
          <a
            href={profile.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub Profile"
            title="GitHub"
            className="flex size-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-300 transition-all hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            <Github className="size-4.5" />
          </a>
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn Profile"
            title="LinkedIn"
            className="flex size-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-300 transition-all hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            <Linkedin className="size-4.5" />
          </a>
          <a
            href={profile.resume}
            download
            aria-label="Download Curriculum Vitae"
            title="Download CV"
            className="flex size-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-300 transition-all hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            <FileDown className="size-4.5" />
          </a>
        </div>

        {/* Telemetry Footer Info */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 border-t border-white/10 pt-5 text-[11px] font-mono text-gray-400">
          <span className="flex items-center gap-1.5">
            <Sparkles className="size-3 text-cyan-400" />
            Response Time: &lt; 24h
          </span>
          <span className="text-white/20">|</span>
          <span>Timezone: GMT+7 (Ho Chi Minh City)</span>
        </div>
      </div>
    </section>
  );
}
