import { useEffect, useState, useMemo } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

export default function ParticleBackground() {
    const [init, setInit] = useState(false);
    // Generate unique ID for each instance to prevent duplicates
    const particlesId = useMemo(() => `tsparticles-${crypto.randomUUID()}`, []);

    useEffect(() => {
        // Only initialize once globally
        let mounted = true;

        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
        }).then(() => {
            if (mounted) {
                setInit(true);
            }
        });

        return () => {
            mounted = false;
        };
    }, []);

    if (!init) {
        return null;
    }

    return (
        <Particles
            id={particlesId}
            options={{
                background: {
                    color: {
                        value: 'transparent',
                    },
                },
                fpsLimit: 60,
                interactivity: {
                    events: {
                        onHover: {
                            enable: true,
                            mode: 'grab',
                        },
                        resize: {
                            enable: true,
                        },
                    },
                    modes: {
                        grab: {
                            distance: 140,
                            links: {
                                opacity: 0.3,
                            },
                        },
                    },
                },
                particles: {
                    color: {
                        value: '#3e3832',
                    },
                    links: {
                        color: '#3e3832',
                        distance: 150,
                        enable: true,
                        opacity: 0.15,
                        width: 1,
                    },
                    move: {
                        direction: 'none',
                        enable: true,
                        outModes: {
                            default: 'bounce',
                        },
                        random: false,
                        speed: 0.5,
                        straight: false,
                    },
                    number: {
                        density: {
                            enable: true,
                        },
                        value: 40,
                    },
                    opacity: {
                        value: 0.3,
                    },
                    shape: {
                        type: 'circle',
                    },
                    size: {
                        value: { min: 1, max: 3 },
                    },
                },
                detectRetina: true,
            }}
            className="absolute inset-0 pointer-events-none"
        />
    );
}
