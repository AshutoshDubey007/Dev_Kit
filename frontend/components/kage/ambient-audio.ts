/**
 * Procedural ambient night wind & temple resonance synthesizer using Web Audio API.
 * Requires 0 external audio files or downloads.
 */
export class AmbientSoundscape {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private noiseNode: AudioNode | null = null;
  private gainNode: GainNode | null = null;

  start() {
    if (this.isPlaying) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master Gain
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(0.08, this.ctx.currentTime);
      this.gainNode.connect(this.ctx.destination);

      // Pink Noise / Wind generator
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11;
        b6 = white * 0.115926;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Bandpass filter to sculpt into deep mountain wind
      const bandpass = this.ctx.createBiquadFilter();
      bandpass.type = 'lowpass';
      bandpass.frequency.setValueAtTime(320, this.ctx.currentTime);

      whiteNoise.connect(bandpass);
      bandpass.connect(this.gainNode);
      whiteNoise.start(0);

      this.noiseNode = whiteNoise;
      this.isPlaying = true;
    } catch (e) {
      console.warn('Web Audio not allowed without user interaction:', e);
    }
  }

  stop() {
    if (!this.isPlaying || !this.ctx) return;
    try {
      this.gainNode?.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1);
      setTimeout(() => {
        this.ctx?.close();
        this.ctx = null;
        this.isPlaying = false;
      }, 1000);
    } catch {
      this.isPlaying = false;
    }
  }

  toggle() {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }
}
