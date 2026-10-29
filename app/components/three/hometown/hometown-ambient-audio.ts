/**
 * Procedural audio ambiance for the Mang Thit Hometown experience.
 * Synthesizes river water waves, evening crickets, and kiln fire crackles
 * using Web Audio API without requiring any external audio assets.
 */

class HometownAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private masterGain: GainNode | null = null;
  private waterNoiseNode: AudioNode | null = null;
  private cricketTimer: number | null = null;
  private fireTimer: number | null = null;

  public async start(): Promise<boolean> {
    if (this.isPlaying) return true;

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return false;

      this.ctx = new AudioCtx();
      if (this.ctx.state === "suspended") {
        await this.ctx.resume();
      }

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      this.masterGain.gain.exponentialRampToValueAtTime(0.35, this.ctx.currentTime + 1.5);
      this.masterGain.connect(this.ctx.destination);

      this.startRiverWater();
      this.startCrickets();
      this.startFireCrackle();

      this.isPlaying = true;
      return true;
    } catch (e) {
      console.warn("Audio autoplay prevented or unsupported:", e);
      return false;
    }
  }

  public stop(): void {
    if (!this.isPlaying || !this.ctx) return;

    if (this.masterGain) {
      try {
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
        this.masterGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);
      } catch {}
    }

    setTimeout(() => {
      if (this.cricketTimer) {
        clearInterval(this.cricketTimer);
        this.cricketTimer = null;
      }
      if (this.fireTimer) {
        clearInterval(this.fireTimer);
        this.fireTimer = null;
      }
      try {
        this.ctx?.close();
      } catch {}
      this.ctx = null;
      this.isPlaying = false;
    }, 850);
  }

  public toggle(): Promise<boolean> {
    if (this.isPlaying) {
      this.stop();
      return Promise.resolve(false);
    }
    return this.start();
  }

  public get active(): boolean {
    return this.isPlaying;
  }

  private startRiverWater(): void {
    if (!this.ctx || !this.masterGain) return;

    // Buffer for pink-ish river noise
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0,
      b1 = 0,
      b2 = 0,
      b3 = 0,
      b4 = 0,
      b5 = 0,
      b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter simulating water movement
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);
    filter.Q.setValueAtTime(2.5, this.ctx.currentTime);

    // LFO for wave swelling
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.18, this.ctx.currentTime); // 1 cycle every ~5.5s
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(140, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const waterGain = this.ctx.createGain();
    waterGain.gain.setValueAtTime(0.45, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(waterGain);
    waterGain.connect(this.masterGain);

    whiteNoise.start();
    lfo.start();
    this.waterNoiseNode = whiteNoise;
  }

  private startCrickets(): void {
    if (!this.ctx || !this.masterGain) return;

    const playCricketChirp = () => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = "sine";
      osc.frequency.setValueAtTime(4600 + Math.random() * 500, now);

      gain.gain.setValueAtTime(0.001, now);
      for (let i = 0; i < 3; i++) {
        const t = now + i * 0.07;
        gain.gain.setValueAtTime(0.02, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      }

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.28);
    };

    this.cricketTimer = window.setInterval(() => {
      if (Math.random() > 0.35) {
        playCricketChirp();
      }
    }, 1400);
  }

  private startFireCrackle(): void {
    if (!this.ctx || !this.masterGain) return;

    const playPop = () => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = "triangle";
      osc.frequency.setValueAtTime(180 + Math.random() * 320, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.06);

      gain.gain.setValueAtTime(0.035, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.07);
    };

    this.fireTimer = window.setInterval(() => {
      if (Math.random() > 0.4) {
        playPop();
      }
    }, 600);
  }
}

export const hometownAudio = new HometownAudioEngine();
