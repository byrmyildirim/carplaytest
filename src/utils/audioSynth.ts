/**
 * Procedural Web Audio API sound generator & Speech Synthesis for GTA CarPlay
 */

class SoundSystem {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private radioOscillators: { stop: () => void } | null = null;
  private isRadioPlaying: boolean = false;
  private currentStationBpm: number = 110;

  private getContext(): AudioContext | null {
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
    if (muted && this.isRadioPlaying) {
      this.stopRadioMusic();
    }
  }

  public playClick() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  }

  public playTurnCue() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.setValueAtTime(780, now + 0.08);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(now + 0.2);
  }

  public playCheckpoint() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    // Iconic GTA-style reward chord (A4 -> C#5 -> E5)
    [440, 554.37, 659.25].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);
      gain.gain.setValueAtTime(0.18, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.4);
    });
  }

  public playSpeedCameraWarning() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    // Radar detector dual beep
    [0, 0.12].forEach((offset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(1400, now + offset);
      gain.gain.setValueAtTime(0.12, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.07);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.08);
    });
  }

  public playWantedStarSound(stars: number) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    // Police radio squelch + alarm tone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320 + stars * 80, now);
    osc.frequency.linearRampToValueAtTime(680 + stars * 90, now + 0.15);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  public playRadioStatic() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, ctx.currentTime);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    whiteNoise.start();
  }

  public playNitroSound() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.4);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.45);
  }

  public playCrashSound() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.3);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  /**
   * Procedural GTA Radio Beat Generator
   */
  public startRadioMusic(bpm: number = 110, genre: string = '80s Synthwave') {
    if (this.isMuted) return;
    this.stopRadioMusic();
    const ctx = this.getContext();
    if (!ctx) return;

    this.isRadioPlaying = true;
    this.currentStationBpm = bpm;
    const beatInterval = 60 / bpm;

    let step = 0;
    const timerId = setInterval(() => {
      if (!this.isRadioPlaying || !this.ctx || this.isMuted) return;
      const now = this.ctx.currentTime;

      // Bass notes scale depending on genre
      const notes = genre.includes('Rock') 
        ? [110, 110, 130.8, 146.8] 
        : genre.includes('Los Santos') 
        ? [73.4, 73.4, 87.3, 98] 
        : [130.8, 164.8, 196.0, 246.9];

      const freq = notes[step % notes.length];

      // Bass synth
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bassOsc.type = genre.includes('Rock') ? 'sawtooth' : 'sine';
      bassOsc.frequency.setValueAtTime(freq, now);
      bassGain.gain.setValueAtTime(0.08, now);
      bassGain.gain.exponentialRampToValueAtTime(0.005, now + beatInterval * 0.7);
      bassOsc.connect(bassGain);
      bassGain.connect(this.ctx.destination);
      bassOsc.start(now);
      bassOsc.stop(now + beatInterval * 0.8);

      // Snare / Hi-hat rhythm
      if (step % 2 === 1) {
        // Snare
        const snareOsc = this.ctx.createOscillator();
        const snareGain = this.ctx.createGain();
        snareOsc.type = 'triangle';
        snareOsc.frequency.setValueAtTime(260, now);
        snareGain.gain.setValueAtTime(0.04, now);
        snareGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        snareOsc.connect(snareGain);
        snareGain.connect(this.ctx.destination);
        snareOsc.start(now);
        snareOsc.stop(now + 0.09);
      }

      // Arpeggio top melody every 4 steps
      if (step % 4 === 2) {
        const leadOsc = this.ctx.createOscillator();
        const leadGain = this.ctx.createGain();
        leadOsc.type = 'square';
        leadOsc.frequency.setValueAtTime(freq * 3, now);
        leadGain.gain.setValueAtTime(0.03, now);
        leadGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        leadOsc.connect(leadGain);
        leadGain.connect(this.ctx.destination);
        leadOsc.start(now);
        leadOsc.stop(now + 0.16);
      }

      step++;
    }, beatInterval * 1000);

    this.radioOscillators = {
      stop: () => clearInterval(timerId)
    };
  }

  public stopRadioMusic() {
    this.isRadioPlaying = false;
    if (this.radioOscillators) {
      this.radioOscillators.stop();
      this.radioOscillators = null;
    }
  }

  public speakDirection(text: string, lang: 'tr' | 'en' = 'tr', voiceStyle: string = 'vice_dj') {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'tr' ? 'tr-TR' : 'en-US';

      // Customize pitch and rate for GTA DJ or Cop style
      if (voiceStyle === 'vice_dj') {
        utterance.rate = 1.05;
        utterance.pitch = 1.15;
      } else if (voiceStyle === 'tactical_cop') {
        utterance.rate = 1.1;
        utterance.pitch = 0.85;
      } else if (voiceStyle === 'cj_san_andreas') {
        utterance.rate = 0.95;
        utterance.pitch = 0.95;
      } else {
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
      }

      utterance.volume = this.isMuted ? 0 : 0.9;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Speech synthesis fallback
    }
  }
}

export const soundSys = new SoundSystem();
