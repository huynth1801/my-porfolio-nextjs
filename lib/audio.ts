"use client";

/**
 * Zero-asset audio: a tiny generative lo-fi engine (procedural chords, bass,
 * sparse melody, soft drums and vinyl crackle — all synthesized with
 * WebAudio) plus UI sound effects. No files to license or download; the
 * AudioContext is only created on a user gesture (the toggle button).
 */

type Phase = "idle" | "running";

const MIDI = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

// Am7 — Dm7 — G — Cmaj7, the eternal lo-fi loop
const CHORDS = [
  [57, 60, 64, 67],
  [62, 65, 69, 72],
  [55, 59, 62, 67],
  [60, 64, 67, 71],
];
const PENTA = [69, 72, 74, 76, 79, 81];

class LofiEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private nextBarTime = 0;
  private bar = 0;
  phase: Phase = "idle";
  enabled = false;

  private ensure() {
    if (this.ctx) return this.ctx;
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctor();
    this.ctx = ctx;

    this.master = ctx.createGain();
    this.master.gain.value = 0;
    // gentle master lowpass = the "tape" filter
    const tape = ctx.createBiquadFilter();
    tape.type = "lowpass";
    tape.frequency.value = 3200;
    this.master.connect(tape).connect(ctx.destination);

    this.sfxBus = ctx.createGain();
    this.sfxBus.gain.value = 0.5;
    this.sfxBus.connect(ctx.destination);

    return ctx;
  }

  /* ---------------- generative lo-fi loop ---------------- */

  private scheduleBar(when: number) {
    const ctx = this.ctx!;
    const barLen = 60 / 72 * 4; // 4 beats @ 72bpm
    const chord = CHORDS[this.bar % CHORDS.length];

    // pad: soft detuned triangles through a lowpass
    chord.forEach((note, i) => {
      const o = ctx.createOscillator();
      o.type = "triangle";
      o.frequency.value = MIDI(note);
      o.detune.value = (i - 1.5) * 5;
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 900;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, when);
      g.gain.linearRampToValueAtTime(0.05, when + 1.2);
      g.gain.setTargetAtTime(0.0, when + barLen - 0.4, 0.5);
      o.connect(lp).connect(g).connect(this.master!);
      o.start(when);
      o.stop(when + barLen + 2.5);
    });

    // bass: root, one octave down
    const bass = ctx.createOscillator();
    bass.type = "sine";
    bass.frequency.value = MIDI(chord[0] - 12);
    const bg = ctx.createGain();
    bg.gain.setValueAtTime(0, when);
    bg.gain.linearRampToValueAtTime(0.12, when + 0.08);
    bg.gain.exponentialRampToValueAtTime(0.001, when + barLen * 0.9);
    bass.connect(bg).connect(this.master!);
    bass.start(when);
    bass.stop(when + barLen);

    // drums: lazy kick + swung hats
    this.kick(when);
    this.kick(when + barLen * 0.5 + 0.09);
    for (let i = 0; i < 8; i++) {
      if (i % 2 === 0) continue; // off-beats only, laid back
      this.hat(when + i * (barLen / 8) + (i % 4 ? 0.05 : 0));
    }

    // sparse melody: one or two plucks per bar, sometimes silence
    if (Math.random() < 0.65) {
      const note = PENTA[Math.floor(Math.random() * PENTA.length)];
      const at = when + (Math.random() < 0.5 ? barLen * 0.25 : barLen * 0.625);
      this.pluck(note, at);
      if (Math.random() < 0.4) this.pluck(PENTA[Math.floor(Math.random() * PENTA.length)], at + barLen / 8);
    }

    // vinyl crackle pops
    const pops = 3 + Math.floor(Math.random() * 4);
    for (let i = 0; i < pops; i++) this.crackle(when + Math.random() * barLen);

    this.bar++;
  }

  private kick(at: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(110, at);
    o.frequency.exponentialRampToValueAtTime(45, at + 0.12);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.22, at);
    g.gain.exponentialRampToValueAtTime(0.001, at + 0.16);
    o.connect(g).connect(this.master!);
    o.start(at);
    o.stop(at + 0.2);
  }

  private hat(at: number) {
    const ctx = this.ctx!;
    const len = 0.04;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 7500;
    const g = ctx.createGain();
    g.gain.value = 0.045;
    src.connect(hp).connect(g).connect(this.master!);
    src.start(at);
  }

  private pluck(note: number, at: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = "triangle";
    o.frequency.value = MIDI(note);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(0.09, at + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, at + 0.9);
    // dreamy feedback delay
    const delay = ctx.createDelay();
    delay.delayTime.value = 60 / 72 / 2;
    const fb = ctx.createGain();
    fb.gain.value = 0.32;
    const wet = ctx.createGain();
    wet.gain.value = 0.4;
    o.connect(g).connect(this.master!);
    g.connect(delay);
    delay.connect(fb).connect(delay);
    delay.connect(wet).connect(this.master!);
    o.start(at);
    o.stop(at + 1);
  }

  private crackle(at: number) {
    const ctx = this.ctx!;
    const len = 0.012;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 2800;
    const g = ctx.createGain();
    g.gain.value = 0.06;
    src.connect(bp).connect(g).connect(this.master!);
    src.start(at);
  }

  /* ---------------- transport ---------------- */

  async toggle(): Promise<boolean> {
    const ctx = this.ensure();
    if (ctx.state === "suspended") await ctx.resume();
    this.enabled = !this.enabled;
    try {
      localStorage.setItem("huy:lofi", this.enabled ? "1" : "0");
    } catch {}
    if (this.enabled) {
      if (this.phase === "idle") {
        this.phase = "running";
        this.nextBarTime = ctx.currentTime + 0.1;
        this.timer = setInterval(() => {
          const ahead = this.ctx!.currentTime + 0.25;
          while (this.nextBarTime < ahead) {
            this.scheduleBar(this.nextBarTime);
            this.nextBarTime += (60 / 72) * 4;
          }
        }, 60);
      }
      this.master!.gain.cancelScheduledValues(ctx.currentTime);
      this.master!.gain.setTargetAtTime(0.55, ctx.currentTime, 0.8);
    } else {
      this.master!.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
    }
    return this.enabled;
  }

  /** Restore the last on/off choice (only call from a user gesture). */
  async resumeFromStorage(): Promise<void> {
    try {
      if (localStorage.getItem("huy:lofi") === "1") await this.toggle();
    } catch {}
  }
}

/* ---------------- SFX (independent of the music toggle) ---------------- */

class Sfx {
  private ctx: AudioContext | null = null;

  private ensure(): AudioContext | null {
    if (this.ctx) return this.ctx;
    try {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctor();
    } catch {
      return null;
    }
    return this.ctx;
  }

  /** short UI tick for clicks */
  click() {
    const ctx = this.ensure();
    if (!ctx) return;
    if (ctx.state === "suspended") void ctx.resume();
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = "triangle";
    o.frequency.setValueAtTime(880, t);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.07, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + 0.08);
  }

  /** cartoon cat meow: chirp up, then down, with a bit of vibrato */
  meow() {
    const ctx = this.ensure();
    if (!ctx) return;
    if (ctx.state === "suspended") void ctx.resume();
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = "sawtooth";
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 22;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 30;
    lfo.connect(lfoGain).connect(o.frequency);
    o.frequency.setValueAtTime(480, t);
    o.frequency.exponentialRampToValueAtTime(860, t + 0.16);
    o.frequency.exponentialRampToValueAtTime(340, t + 0.5);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 1400;
    lp.Q.value = 4;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.16, t + 0.06);
    g.gain.setTargetAtTime(0, t + 0.36, 0.09);
    o.connect(lp).connect(g).connect(ctx.destination);
    o.start(t);
    lfo.start(t);
    o.stop(t + 0.6);
    lfo.stop(t + 0.6);
  }
}

export const lofi = new LofiEngine();
export const sfx = new Sfx();
