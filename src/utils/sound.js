// Procedural Web Audio API Chess Sound Synthesizer
// Produces authentic wooden chess clicks, capture impacts, check chimes, and castle sounds.

class SoundManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  getContext() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  play(type) {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const t = ctx.currentTime;

      switch (type) {
        case "move": {
          // Clean crisp wooden click (bandpass noise + brief pitch drop)
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(400, t);
          osc.frequency.exponentialRampToValueAtTime(140, t + 0.06);

          gain.gain.setValueAtTime(0.2, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.08);
          break;
        }

        case "capture": {
          // Heavier resonant double-tap impact ("eating piece")
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();

          osc1.type = "triangle";
          osc1.frequency.setValueAtTime(260, t);
          osc1.frequency.exponentialRampToValueAtTime(80, t + 0.12);

          osc2.type = "sine";
          osc2.frequency.setValueAtTime(520, t + 0.02);
          osc2.frequency.exponentialRampToValueAtTime(120, t + 0.14);

          gain.gain.setValueAtTime(0.35, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);

          osc1.start(t);
          osc2.start(t + 0.02);
          osc1.stop(t + 0.15);
          osc2.stop(t + 0.15);
          break;
        }

        case "check": {
          // Sharp alert chime
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(740, t);
          osc.frequency.exponentialRampToValueAtTime(520, t + 0.18);

          gain.gain.setValueAtTime(0.25, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.23);
          break;
        }

        case "castle": {
          // Double wood slide-tap
          for (let i = 0; i < 2; i++) {
            const delay = i * 0.07;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(320 - i * 40, t + delay);
            osc.frequency.exponentialRampToValueAtTime(120, t + delay + 0.05);

            gain.gain.setValueAtTime(0.18, t + delay);
            gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.06);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(t + delay);
            osc.stop(t + delay + 0.07);
          }
          break;
        }

        case "promote": {
          // Triumphant ascending arpeggio chord
          const freqs = [330, 440, 554, 659];
          freqs.forEach((f, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(f, t + idx * 0.05);

            gain.gain.setValueAtTime(0.12, t + idx * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.05 + 0.25);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(t + idx * 0.05);
            osc.stop(t + idx * 0.05 + 0.26);
          });
          break;
        }

        case "gameEnd": {
          // Dramatic victory or defeat bell
          const notes = [293.66, 369.99, 440, 587.33];
          notes.forEach((freq) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "triangle";
            osc.frequency.setValueAtTime(freq, t);

            gain.gain.setValueAtTime(0.18, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(t);
            osc.stop(t + 0.7);
          });
          break;
        }

        default:
          break;
      }
    } catch {
      // AudioContext unavailable or error
    }
  }
}

export const sounds = new SoundManager();

