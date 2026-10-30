"use client";

import { useSyncExternalStore } from "react";
import { phaseStore, type DayPhase } from "@/app/components/three/island/lighting";

/**
 * 🎧 Zero-asset procedural WebAudio atmospheric soundscape engine.
 * Synthesizes cozy weather audio in real-time:
 * - Rain: Soothing rooftop rainfall & gentle distant thunder rumble
 * - Night: Ambient summer crickets & soft campfire crackle
 * - Day/Golden: Warm sunbeam breeze & occasional gentle bird chirps
 *
 * Uses 0 external audio files, 0KB network payload, zero loading latency.
 */

class SoundscapeEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private rainGain: GainNode | null = null;
  private nightGain: GainNode | null = null;
  private dayGain: GainNode | null = null;

  private rainNoiseNode: AudioBufferSourceNode | null = null;
  private cricketTimer: ReturnType<typeof setInterval> | null = null;
  private thunderTimer: ReturnType<typeof setInterval> | null = null;
  private windNode: AudioBufferSourceNode | null = null;

  enabled = false;
  private currentPhase: DayPhase = "day";
  private unsubscribePhase: (() => void) | null = null;

  private ensure(): AudioContext | null {
    if (this.ctx) return this.ctx;
    try {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctor();
      this.ctx = ctx;

      // Master output gain
      this.masterGain = ctx.createGain();
      this.masterGain.gain.setValueAtTime(0, ctx.currentTime);
      this.masterGain.connect(ctx.destination);

      // Separate atmosphere channels
      this.rainGain = ctx.createGain();
      this.rainGain.gain.setValueAtTime(0, ctx.currentTime);
      this.rainGain.connect(this.masterGain);

      this.nightGain = ctx.createGain();
      this.nightGain.gain.setValueAtTime(0, ctx.currentTime);
      this.nightGain.connect(this.masterGain);

      this.dayGain = ctx.createGain();
      this.dayGain.gain.setValueAtTime(0, ctx.currentTime);
      this.dayGain.connect(this.masterGain);

      this.setupRainSynth();
      this.setupNightSynth();
      this.setupDaySynth();

      // Listen to phase changes to crossfade soundscapes
      this.unsubscribePhase = phaseStore.subscribe(() => {
        const next = phaseStore.get();
        if (next !== this.currentPhase) {
          this.currentPhase = next;
          this.applyAtmosphereGains();
        }
      });

      return ctx;
    } catch {
      return null;
    }
  }

  /* ---------------- RAIN SYNTHESIS ---------------- */

  private setupRainSynth() {
    const ctx = this.ctx;
    if (!ctx || !this.rainGain) return;

    // 5 seconds looping pink/white noise buffer
    const bufferSize = ctx.sampleRate * 5;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0,
      b1 = 0,
      b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      output[i] = (b0 + b1 + b2) * 0.18;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    // Dual filtering: Bandpass for steady rainfall + highpass for crisp droplet texture
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.setValueAtTime(1150, ctx.currentTime);
    bandpass.Q.setValueAtTime(1.1, ctx.currentTime);

    const highpass = ctx.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.setValueAtTime(2200, ctx.currentTime);

    const patterGain = ctx.createGain();
    patterGain.gain.setValueAtTime(0.35, ctx.currentTime);

    noise.connect(bandpass).connect(this.rainGain);
    noise.connect(highpass).connect(patterGain).connect(this.rainGain);

    noise.start();
    this.rainNoiseNode = noise;

    // Distant subtle thunder rumble every ~12-18s during rain
    this.thunderTimer = setInterval(() => {
      if (!this.enabled || this.currentPhase !== "rain" || Math.random() > 0.6) return;
      this.playDistantThunder();
    }, 12000);
  }

  private playDistantThunder() {
    const ctx = this.ctx;
    if (!ctx || !this.rainGain) return;
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(52, t);
    osc.frequency.exponentialRampToValueAtTime(32, t + 2.8);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(80, t);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.22, t + 0.6);
    g.gain.exponentialRampToValueAtTime(0.001, t + 3.2);

    osc.connect(filter).connect(g).connect(this.rainGain);
    osc.start(t);
    osc.stop(t + 3.3);
  }

  /* ---------------- NIGHT & CRICKETS SYNTHESIS ---------------- */

  private setupNightSynth() {
    const ctx = this.ctx;
    if (!ctx || !this.nightGain) return;

    // Periodic rhythmic crickets chirping
    this.cricketTimer = setInterval(() => {
      if (!this.enabled || this.currentPhase !== "night") return;
      this.playCricketChirp();
    }, 2400);
  }

  private playCricketChirp() {
    const ctx = this.ctx;
    if (!ctx || !this.nightGain) return;
    const t = ctx.currentTime;

    // Triple pulse chirp pattern
    [0, 0.08, 0.16].forEach((offset) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(4500, t + offset);
      osc.frequency.linearRampToValueAtTime(4750, t + offset + 0.04);

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(4600, t + offset);
      filter.Q.setValueAtTime(8.0, t + offset);

      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t + offset);
      g.gain.linearRampToValueAtTime(0.045, t + offset + 0.015);
      g.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.05);

      osc.connect(filter).connect(g).connect(this.nightGain!);
      osc.start(t + offset);
      osc.stop(t + offset + 0.06);
    });
  }

  /* ---------------- DAY / SUNNY BREEZE SYNTHESIS ---------------- */

  private setupDaySynth() {
    const ctx = this.ctx;
    if (!ctx || !this.dayGain) return;

    // Gentle wind noise
    const bufferSize = ctx.sampleRate * 4;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.12;
    }

    const wind = ctx.createBufferSource();
    wind.buffer = noiseBuffer;
    wind.loop = true;

    // Modulated lowpass filter for gentle wind swells
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(320, ctx.currentTime);

    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(0.2, ctx.currentTime);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(140, ctx.currentTime);
    lfo.connect(lfoGain).connect(filter.frequency);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.25, ctx.currentTime);

    wind.connect(filter).connect(g).connect(this.dayGain);
    wind.start();
    lfo.start();
    this.windNode = wind;
  }

  /* ---------------- CROSSFADER ---------------- */

  private applyAtmosphereGains() {
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const p = this.currentPhase;

    // Smoothly fade out inactive channels, fade in active channel
    this.rainGain?.gain.setTargetAtTime(p === "rain" ? 0.65 : 0, t, 0.6);
    this.nightGain?.gain.setTargetAtTime(p === "night" ? 0.75 : 0, t, 0.6);
    this.dayGain?.gain.setTargetAtTime(p === "day" || p === "golden" ? 0.45 : 0, t, 0.6);
  }

  /* ---------------- PUBLIC API ---------------- */

  async toggle(): Promise<boolean> {
    const ctx = this.ensure();
    if (!ctx) return false;

    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    this.enabled = !this.enabled;
    this.currentPhase = phaseStore.get();

    const t = ctx.currentTime;
    if (this.enabled) {
      this.masterGain?.gain.cancelScheduledValues(t);
      this.masterGain?.gain.setTargetAtTime(0.65, t, 0.5);
      this.applyAtmosphereGains();
    } else {
      this.masterGain?.gain.cancelScheduledValues(t);
      this.masterGain?.gain.setTargetAtTime(0, t, 0.4);
    }

    emitSoundscape();
    try {
      localStorage.setItem("huy:soundscape", this.enabled ? "1" : "0");
    } catch {}

    return this.enabled;
  }
}

export const soundscape = new SoundscapeEngine();

/* ---------------- REACT SYNC STORE ---------------- */

const soundscapeListeners = new Set<() => void>();
let isSoundscapeActive = false;

function emitSoundscape() {
  isSoundscapeActive = soundscape.enabled;
  soundscapeListeners.forEach((fn) => fn());
}

export const soundscapeStore = {
  get: () => isSoundscapeActive,
  subscribe: (fn: () => void) => {
    soundscapeListeners.add(fn);
    return () => soundscapeListeners.delete(fn);
  },
};

export function useSoundscape(): boolean {
  return useSyncExternalStore(soundscapeStore.subscribe, soundscapeStore.get, () => false);
}
