// Procedural Bio-Synth Sound Engine using Web Audio API
class AudioSynth {
  constructor() {
    this.audioCtx = null;
    this.muted = false;
  }

  init() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  play(type) {
    if (this.muted) return;
    try {
      this.init();
      if (!this.audioCtx) return;
      
      // Resume if context is suspended (browser security policies)
      if (this.audioCtx.state === "suspended") {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;

      if (type === "click") {
        // Ultra-subtle haptic click
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.04);
        
        gain.gain.setValueAtTime(0.015, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        
        osc.start(now);
        osc.stop(now + 0.05);
      } 
      
      else if (type === "hoverTick") {
        // Ultra-low volume, short frequency click
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        
        osc.frequency.setValueAtTime(1600, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.008);
        
        gain.gain.setValueAtTime(0.003, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.008);
        
        osc.start(now);
        osc.stop(now + 0.01);
      }
      
      else if (type === "scanHum") {
        // Diagnostics saw-hum ramping up in pitch and volume
        const osc = this.audioCtx.createOscillator();
        const filter = this.audioCtx.createBiquadFilter();
        const gain = this.audioCtx.createGain();
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.audioCtx.destination);
        
        osc.type = "triangle";
        osc.frequency.setValueAtTime(70, now);
        osc.frequency.linearRampToValueAtTime(190, now + 5.2);
        
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(150, now);
        filter.frequency.linearRampToValueAtTime(500, now + 5.2);
        
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.02, now + 1.5);
        gain.gain.linearRampToValueAtTime(0.02, now + 4.8);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 5.2);
        
        osc.start(now);
        osc.stop(now + 5.3);
      } 
      
      else if (type === "chime") {
        // Success biological sync tone (arpeggiating C5 -> E5 -> G5 -> C6)
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        const gain = this.audioCtx.createGain();
        gain.connect(this.audioCtx.destination);
        gain.gain.setValueAtTime(0.025, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

        notes.forEach((freq, idx) => {
          const osc = this.audioCtx.createOscillator();
          osc.connect(gain);
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + idx * 0.1);
          
          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 0.4);
        });
      }

      else if (type === "commit") {
        // Dynamic protocol activation click + double beep
        const gain = this.audioCtx.createGain();
        gain.connect(this.audioCtx.destination);
        gain.gain.setValueAtTime(0.02, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        const osc1 = this.audioCtx.createOscillator();
        osc1.connect(gain);
        osc1.frequency.setValueAtTime(440, now);
        osc1.frequency.linearRampToValueAtTime(880, now + 0.15);
        osc1.start(now);
        osc1.stop(now + 0.15);

        const osc2 = this.audioCtx.createOscillator();
        osc2.connect(gain);
        osc2.frequency.setValueAtTime(880, now + 0.1);
        osc2.frequency.linearRampToValueAtTime(1760, now + 0.3);
        osc2.start(now + 0.1);
        osc2.stop(now + 0.3);
      }
    } catch (e) {
      console.warn("Audio synthesis context blocked or unsupported:", e);
    }
  }
}

export const synth = new AudioSynth();
