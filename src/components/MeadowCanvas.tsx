import { useEffect, useRef } from 'react';

// --- Configuration & Constants ---
const PALETTES = [
    ['#2c6469', '#b20155', '#df6536', '#3469a1', '#ebb137'], // Original
    ['#e9f5db', '#cfe1b9', '#b5c99a', '#97a97c', '#87986a'], // Greens
    ['#ff99c8', '#fcf6bd', '#d0f4de', '#a9def9', '#e4c1f9'], // Pastels
    ['#2d3142', '#bfc0c0', '#ffffff', '#ef8354', '#4f5d75'], // Moody
    ['#f94144', '#f3722c', '#f8961e', '#f9c74f', '#90be6d']  // Vibrant
];

// Exact frequencies and chords from digitalmeadow.studio
const CHORDS = [
    [130.81, 261.63, 392.00, 440.00, 659.26],
    [130.81, 261.63, 392.00, 493.88, 659.26],
    [110.00, 261.63, 392.00, 440.00, 659.26],
    [98.00, 493.88, 392.00, 987.77, 783.99]
];

const PLANT_COLOR = '#3e3832';
const MOUSE_RADIUS = 120;
const MAX_PLANTS = 150;
const RAIN_RATE = 0.05;

// --- Physics Helper: Spring ---
class Spring {
    value: number;
    target: number;
    velocity: number;
    stiffness: number;
    damping: number;

    constructor(initialValue: number, stiffness = 0.1, damping = 0.8) {
        this.value = initialValue;
        this.target = initialValue;
        this.velocity = 0;
        this.stiffness = stiffness;
        this.damping = damping;
    }

    update() {
        const force = (this.target - this.value) * this.stiffness;
        this.velocity += force;
        this.velocity *= this.damping;
        this.value += this.velocity;
        return this.value;
    }
}

// --- Audio Helper: SoundEngine (Mirrors audio.1DViC-_Q.js) ---
class FlowerSound {
    oscillator: OscillatorNode;
    gain: GainNode;
    ctx: AudioContext;

    constructor(ctx: AudioContext, frequency: number, master: GainNode) {
        this.ctx = ctx;
        this.oscillator = ctx.createOscillator();
        this.oscillator.type = 'sine';
        this.oscillator.frequency.value = frequency;

        this.gain = ctx.createGain();
        this.gain.gain.value = 0;

        this.oscillator.connect(this.gain);
        this.gain.connect(master);
        this.oscillator.start();
    }

    updateFrequency(f: number) {
        this.oscillator.frequency.setTargetAtTime(f, this.ctx.currentTime, 0.1);
    }

    playOnce(volume = 0.015) {
        const now = this.ctx.currentTime;
        this.gain.gain.cancelScheduledValues(now);
        this.gain.gain.setValueAtTime(this.gain.gain.value, now);
        // Exact envelope: 0.05s linear attack, 1s linear decay
        this.gain.gain.linearRampToValueAtTime(volume, now + 0.05);
        this.gain.gain.linearRampToValueAtTime(0, now + 1.0);
    }

    destroy() {
        this.oscillator.stop();
        this.oscillator.disconnect();
        this.gain.disconnect();
    }
}

class SoundEngine {
    ctx: AudioContext | null = null;
    masterGain: GainNode | null = null;
    currentChordIndex = 0;
    sounds: Set<FlowerSound> = new Set();

    async init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.5; // Exact master gain from source
            this.masterGain.connect(this.ctx.destination);
        }
        if (this.ctx.state === 'suspended') {
            await this.ctx.resume();
        }
    }

    nextChord() {
        this.currentChordIndex = (this.currentChordIndex + 1) % CHORDS.length;
        const chord = CHORDS[this.currentChordIndex];
        let i = 0;
        this.sounds.forEach(sound => {
            sound.updateFrequency(chord[i % chord.length]);
            i++;
        });
    }

    newFlowerSound() {
        if (!this.ctx || !this.masterGain) return null;
        const chord = CHORDS[this.currentChordIndex];
        const freq = chord[Math.floor(Math.random() * chord.length)];
        const sound = new FlowerSound(this.ctx, freq, this.masterGain);
        this.sounds.add(sound);
        return sound;
    }

    removeSound(sound: FlowerSound) {
        sound.destroy();
        this.sounds.delete(sound);
    }
}

// --- Exported Component ---
export default function MeadowCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const soundEngine = useRef(new SoundEngine());
    const paletteIndex = useRef(0);
    const mousePos = useRef({ x: -1000, y: -1000 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        let pixelRatio = window.devicePixelRatio || 1;

        let plants: Plant[] = [];
        let raindrops: Raindrop[] = [];

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            pixelRatio = window.devicePixelRatio || 1;
            canvas.width = width * pixelRatio;
            canvas.height = height * pixelRatio;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(pixelRatio, pixelRatio);
        };

        window.addEventListener('resize', resize);
        resize();

        const handleMouseMove = (e: MouseEvent) => {
            mousePos.current = { x: e.clientX, y: e.clientY };
            soundEngine.current.init();
        };

        const handleClick = (e: MouseEvent) => {
            paletteIndex.current = (paletteIndex.current + 1) % PALETTES.length;
            plants.forEach(p => p.updatePalette());

            soundEngine.current.init().then(() => {
                soundEngine.current.nextChord(); // Cycle chords on click
            });

            if (plants.length < MAX_PLANTS) {
                raindrops.push(new Raindrop(e.clientX, e.clientY));
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('click', handleClick);

        // --- Class Definitions ---

        class Flower {
            radius: number;
            color: string = '';
            colorIdx: number = 0;
            bloomProgress: number = 0;
            petalCount: number;
            sound: FlowerSound | null = null;

            constructor() {
                this.radius = 3 + Math.random() * 2;
                this.petalCount = 5 + Math.floor(Math.random() * 3);
                this.colorIdx = Math.floor(Math.random() * 5);
                this.updateColor();
                this.sound = soundEngine.current.newFlowerSound();
            }

            updateColor() {
                const palette = PALETTES[paletteIndex.current];
                this.color = palette[this.colorIdx];
            }

            update() {
                if (this.bloomProgress < 1) this.bloomProgress += 0.01;
            }

            draw(x: number, y: number) {
                const size = this.radius * this.bloomProgress;
                ctx!.fillStyle = this.color;

                for (let i = 0; i < this.petalCount; i++) {
                    const angle = (i / this.petalCount) * Math.PI * 2;
                    const px = x + Math.cos(angle) * size;
                    const py = y + Math.sin(angle) * size;
                    ctx!.beginPath();
                    ctx!.ellipse(px, py, size, size * 0.6, angle, 0, Math.PI * 2);
                    ctx!.fill();
                }

                ctx!.beginPath();
                ctx!.arc(x, y, size * 0.3, 0, Math.PI * 2);
                ctx!.fillStyle = '#ebb137';
                ctx!.fill();
            }

            destroy() {
                if (this.sound) {
                    soundEngine.current.removeSound(this.sound);
                }
            }
        }

        class Plant {
            x: number;
            y: number;
            height: number;
            maxHeight: number;
            growthRate: number;
            spring: Spring;
            flower: Flower | null = null;
            lastSway: number = 0;

            constructor(x: number, y: number) {
                this.x = x;
                this.y = y;
                this.height = 0;
                this.maxHeight = 40 + Math.random() * 120;
                this.growthRate = 0.5 + Math.random() * 1.5;
                this.spring = new Spring(-Math.PI / 2, 0.05, 0.85);

                if (Math.random() > 0.1) {
                    this.flower = new Flower();
                }
            }

            updatePalette() {
                if (this.flower) this.flower.updateColor();
            }

            update() {
                if (this.height < this.maxHeight) {
                    this.height += this.growthRate;
                } else if (this.flower) {
                    this.flower.update();
                }

                const dx = mousePos.current.x - this.x;
                const dy = mousePos.current.y - (this.y - this.height);
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < MOUSE_RADIUS) {
                    const influence = 1 - dist / MOUSE_RADIUS;
                    this.spring.target = -Math.PI / 2 + (dx / MOUSE_RADIUS) * influence * 1.5;

                    // Exact trigger threshold from source: velocity > 0.4 (mapped to my units)
                    if (this.flower && this.flower.sound && Math.abs(this.spring.velocity) > 0.02 && Date.now() - this.lastSway > 350) {
                        const vol = 0.015 * influence;
                        this.flower.sound.playOnce(vol);
                        this.lastSway = Date.now();
                    }
                } else {
                    this.spring.target = -Math.PI / 2;
                }

                this.spring.update();
            }

            draw() {
                const angle = this.spring.value;
                const endX = this.x + Math.cos(angle) * this.height;
                const endY = this.y + Math.sin(angle) * this.height;

                const cpX = this.x + Math.cos(angle) * (this.height * 0.5) + Math.sin(angle) * 10;
                const cpY = this.y + Math.sin(angle) * (this.height * 0.5) + Math.cos(angle) * 10;

                ctx!.beginPath();
                ctx!.moveTo(this.x, this.y);
                ctx!.quadraticCurveTo(cpX, cpY, endX, endY);
                ctx!.strokeStyle = PLANT_COLOR;
                ctx!.lineWidth = 1;
                ctx!.stroke();

                if (this.flower && this.height >= this.maxHeight * 0.8) {
                    this.flower.draw(endX, endY);
                }
            }

            destroy() {
                if (this.flower) this.flower.destroy();
            }
        }

        class Raindrop {
            x: number;
            y: number;
            speed: number;
            length: number;
            dead: boolean = false;

            constructor(x?: number, y?: number) {
                this.x = x ?? Math.random() * width;
                this.y = y ?? -50;
                this.speed = 4 + Math.random() * 8;
                this.length = 4 + Math.random() * 8;
            }

            update() {
                this.y += this.speed;
                if (this.y > height) {
                    this.dead = true;
                    if (plants.length < MAX_PLANTS) {
                        plants.push(new Plant(this.x, height));
                    }
                }
            }

            draw() {
                ctx!.beginPath();
                ctx!.moveTo(this.x, this.y);
                ctx!.lineTo(this.x, this.y + this.length);
                ctx!.strokeStyle = PLANT_COLOR;
                ctx!.lineWidth = 1;
                ctx!.stroke();
            }
        }

        const loop = () => {
            ctx.clearRect(0, 0, width, height);

            if (raindrops.length < 30 && Math.random() < RAIN_RATE) {
                raindrops.push(new Raindrop());
            }

            raindrops = raindrops.filter(r => !r.dead);
            raindrops.forEach(r => { r.update(); r.draw(); });

            plants.forEach(p => { p.update(); p.draw(); });

            requestAnimationFrame(loop);
        };

        const animId = requestAnimationFrame(loop);

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('click', handleClick);
            cancelAnimationFrame(animId);
            plants.forEach(p => p.destroy());
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-0 cursor-crosshair"
            style={{ width: '100%', height: '100%', touchAction: 'none' }}
        />
    );
}
