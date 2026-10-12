/**
 * Sound Effects Synthesizer Engine using Web Audio API
 * High-performance, zero-latency, realistic synthesized audio for UI interactions.
 * Works seamlessly in all modern browsers without external asset dependencies.
 */

class SoundEffectsEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    try {
      const saved = localStorage.getItem('stellar_sound_muted');
      if (saved !== null) {
        this.isMuted = saved === 'true';
      }
    } catch {
      this.isMuted = false;
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    try {
      localStorage.setItem('stellar_sound_muted', String(muted));
    } catch {}
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * 消息提示音 (Message / Notification Chime)
   * Crisp, musical dual-tone bell chime (C6 - G6 harmonic sequence)
   */
  public playMessageSound() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [1046.5, 1318.51, 1567.98]; // C6, E6, G6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.08 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.36);
    });
  }

  /**
   * 相机快门声 (Camera Shutter Click / Snapshot)
   * Realistic mechanical shutter click + mirror bounce + aperture snap
   */
  public playShutterSound() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // 1. First Click: mechanical contact
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(1400, now);
    osc1.frequency.exponentialRampToValueAtTime(300, now + 0.03);
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.035);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.04);

    // 2. White noise burst for the shutter curtain movement
    const bufferSize = ctx.sampleRate * 0.08;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3200, now + 0.02);
    filter.Q.setValueAtTime(3, now + 0.02);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.25, now + 0.02);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    whiteNoise.start(now + 0.02);
    whiteNoise.stop(now + 0.1);

    // 3. Second Click: shutter release finish
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(800, now + 0.06);
    osc2.frequency.exponentialRampToValueAtTime(200, now + 0.1);
    gain2.gain.setValueAtTime(0.2, now + 0.06);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.06);
    osc2.stop(now + 0.11);
  }

  /**
   * 发送「嗖」声 (Whoosh / Swoosh Sound)
   * Rapid frequency sweep with bandpass filtered noise simulating air displacement
   */
  public playWhooshSound() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const duration = 0.28;

    // Filtered noise swoosh
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(300, now);
    filter.frequency.exponentialRampToValueAtTime(3200, now + duration * 0.4);
    filter.frequency.exponentialRampToValueAtTime(450, now + duration);
    filter.Q.setValueAtTime(3.5, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.35, now + duration * 0.35);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + duration);

    // Subtle sub-bass whoosh body
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(180, now);
    subOsc.frequency.exponentialRampToValueAtTime(60, now + duration);

    subGain.gain.setValueAtTime(0.18, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + duration);
  }

  /**
   * 点击 / 切换音效 (Pop / Tap Sound)
   */
  public playTapSound() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(680, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.05);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  /**
   * 气泡弹出音效 (Bubble Pop Sound)
   */
  public playBubblePopSound() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  /**
   * 点赞爆破音效 (Like Pop Tone)
   * Crisp, joyful dual-tone pop chime with sparkling finish
   */
  public playLikePopTone() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(520, now);
    osc1.frequency.exponentialRampToValueAtTime(1080, now + 0.08);
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.13);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1300, now + 0.04);
    osc2.frequency.exponentialRampToValueAtTime(1600, now + 0.1);
    gain2.gain.setValueAtTime(0.12, now + 0.04);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.04);
    osc2.stop(now + 0.16);
  }

  /**
   * 动态收藏提示音 (Bookmark / Favorite Star Chime)
   * High-sparkle ascending triad chime with warm bell decay
   */
  public playBookmarkSound() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // F#5 (739.99), A#5 (932.33), C#6 (1108.73), F#6 (1479.98)
    const notes = [739.99, 932.33, 1108.73, 1479.98];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.045);
      gain.gain.setValueAtTime(0.18, now + idx * 0.045);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.045 + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.045);
      osc.stop(now + idx * 0.045 + 0.3);
    });
  }

  /**
   * 全局统一步调分享提示音 (Share Sound - Emerald Spring Chime)
   * Airy high-resonance ping with cheerful harmonic lift (G5 -> B5 -> E6)
   */
  public playShareSound() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Energetic dual swoop & bright harmonic ding: G5 (783.99) -> B5 (987.77) -> E6 (1318.5)
    const tones = [
      { freq: 783.99, start: 0, dur: 0.16 },
      { freq: 987.77, start: 0.04, dur: 0.20 },
      { freq: 1318.51, start: 0.08, dur: 0.32 },
    ];
    tones.forEach((t) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(t.freq, now + t.start);
      osc.frequency.exponentialRampToValueAtTime(t.freq * 1.04, now + t.start + t.dur);
      gain.gain.setValueAtTime(0.18, now + t.start);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t.start + t.dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + t.start);
      osc.stop(now + t.start + t.dur + 0.02);
    });
  }

  /**
   * 成功提示音 (Success Chord)
   */
  public playSuccessSound() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const chord = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    chord.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);

      gain.gain.setValueAtTime(0.12, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.32);
    });
  }

  /**
   * 活动到达聚合音效 (Activity Arrival & Fusion Convergence Fanfare)
   */
  public playConvergenceSound() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Ascending celebratory fanfare: C5 -> E5 -> G5 -> C6 -> E6
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.16, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.38);
    });
  }

  /**
   * 警告提示音 (Warning Alert)
   */
  public playWarningSound() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    [320, 260].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);

      gain.gain.setValueAtTime(0.15, now + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.15);
    });
  }

  public playAlertSound() {
    this.playWarningSound();
  }

  /**
   * 真实木质敲门声 (Realistic Wooden Door Knock / Knock-Knock)
   * 支持轻叩 (gentle), 急促敲门 (urgent), 连环狂敲 (frenzy) 阶梯升级体系
   */
  public playWoodKnockSound(intensity: 'gentle' | 'urgent' | 'frenzy' = 'gentle', combo: number = 1) {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const knocksCount = intensity === 'gentle' ? 2 : intensity === 'urgent' ? 3 : Math.min(8, 4 + Math.floor(combo / 2));
    const interval = intensity === 'gentle' ? 0.14 : intensity === 'urgent' ? 0.09 : 0.065;
    const baseFreq = intensity === 'gentle' ? 140 : intensity === 'urgent' ? 175 : 210;
    const baseVolume = intensity === 'gentle' ? 0.25 : intensity === 'urgent' ? 0.38 : 0.5;

    for (let i = 0; i < knocksCount; i++) {
      const knockTime = now + i * interval;

      // 1. Wood Cavity Resonance (低频木质箱体共鸣)
      const oscLow = ctx.createOscillator();
      const gainLow = ctx.createGain();
      oscLow.type = 'triangle';
      const pitchVar = (Math.random() - 0.5) * 20;
      oscLow.frequency.setValueAtTime(baseFreq + pitchVar, knockTime);
      oscLow.frequency.exponentialRampToValueAtTime(60, knockTime + 0.06);

      gainLow.gain.setValueAtTime(0, knockTime);
      gainLow.gain.linearRampToValueAtTime(baseVolume, knockTime + 0.003);
      gainLow.gain.exponentialRampToValueAtTime(0.001, knockTime + 0.075);

      oscLow.connect(gainLow);
      gainLow.connect(ctx.destination);
      oscLow.start(knockTime);
      oscLow.stop(knockTime + 0.08);

      // 2. Knuckle Impact Snap (指关节/拳头撞击木门瞬态硬核咔哒声)
      const oscSnap = ctx.createOscillator();
      const gainSnap = ctx.createGain();
      oscSnap.type = 'sine';
      oscSnap.frequency.setValueAtTime(800 + i * 40, knockTime);
      oscSnap.frequency.exponentialRampToValueAtTime(180, knockTime + 0.025);

      gainSnap.gain.setValueAtTime(0, knockTime);
      gainSnap.gain.linearRampToValueAtTime(baseVolume * 0.7, knockTime + 0.002);
      gainSnap.gain.exponentialRampToValueAtTime(0.001, knockTime + 0.03);

      oscSnap.connect(gainSnap);
      gainSnap.connect(ctx.destination);
      oscSnap.start(knockTime);
      oscSnap.stop(knockTime + 0.035);

      // 3. High Frenzy Spark / Overdrive on intense knocks
      if (intensity === 'frenzy') {
        const oscThump = ctx.createOscillator();
        const gainThump = ctx.createGain();
        oscThump.type = 'square';
        oscThump.frequency.setValueAtTime(120, knockTime);
        oscThump.frequency.exponentialRampToValueAtTime(45, knockTime + 0.05);

        gainThump.gain.setValueAtTime(0.18, knockTime);
        gainThump.gain.exponentialRampToValueAtTime(0.001, knockTime + 0.055);

        oscThump.connect(gainThump);
        gainThump.connect(ctx.destination);
        oscThump.start(knockTime);
        oscThump.stop(knockTime + 0.06);
      }
    }
  }

  /**
   * 碰一碰撞击音效 (Zenly Bump Impact / Footprint Resonance)
   */
  public playBumpImpactSound() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(650, now + 0.12);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.38);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.42);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.42);
  }

  /**
   * 爱心点赞音效 (Heart Pop / Reaction Tone)
   */
  public playHeartPopTone() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.08); // C6

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  public playCoinEarnSound() {
    this.playSuccessSound();
  }

  public playSnapShutter() {
    this.playShutterSound();
  }

  public playErrorBeep() {
    this.playWarningSound();
  }

  public playSendTone() {
    this.playMessageSound();
  }

  /**
   * 实时对讲开始音效 (Walkie-Talkie PTT Transmission Start Tone)
   */
  public playWalkieTalkieStart() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Chirp dual-tone beep (680Hz -> 880Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(680, now);
    osc1.frequency.setValueAtTime(880, now + 0.04);

    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.2, now + 0.01);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.13);
  }

  /**
   * 实时对讲松开结束音效 (Walkie-Talkie Roger Beep / Transmission End Tone)
   */
  public playWalkieTalkieEnd() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Classic 1000Hz Roger beep followed by subtle static squelch
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1180, now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }
}

export const soundEffects = new SoundEffectsEngine();
