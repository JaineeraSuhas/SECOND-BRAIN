/**
 * Neural Chimes - High-fidelity Sine-wave Synthesis
 * Ported from the Digital Meadow interactive landing page.
 */

class NeuralChimes {
    private audioCtx: AudioContext | null = null;

    private getContext() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        return this.audioCtx;
    }

    /**
     * Play a high-purity single tone (Sine)
     */
    playTone(freq: number, dur: number = 0.5, volume: number = 0.1) {
        const ctx = this.getContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + dur);
    }

    /**
     * Triggered on successful knowledge ingestion
     */
    chimeSuccess() {
        this.playTone(523.25, 0.8, 0.08); // C5
        setTimeout(() => this.playTone(659.25, 1.2, 0.05), 150); // E5
    }

    /**
     * Triggered on node connection
     */
    chimeConnection() {
        this.playTone(783.99, 0.5, 0.05); // G5
    }

    /**
     * Ambient sync pulse
     */
    chimePulse() {
        this.playTone(261.63, 2, 0.02); // C4
    }

    /**
     * Initialize audio context on first user interaction
     */
    async init() {
        const ctx = this.getContext();
        if (ctx.state === 'suspended') {
            await ctx.resume();
        }
    }
}

export const neuralChimes = new NeuralChimes();
