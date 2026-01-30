import { motion } from 'framer-motion';

interface FloatingOrbProps {
    size?: number;
    color?: string;
    delay?: number;
    duration?: number;
}

export default function FloatingOrb({
    size = 200,
    color = 'rgba(99, 102, 241, 0.3)',
    delay = 0,
    duration = 20
}: FloatingOrbProps) {
    return (
        <motion.div
            className="absolute rounded-full blur-3xl"
            style={{
                width: size,
                height: size,
                background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
            }}
            animate={{
                x: [0, 100, -50, 0],
                y: [0, -100, 50, 0],
                scale: [1, 1.2, 0.8, 1],
                opacity: [0.3, 0.6, 0.4, 0.3],
            }}
            transition={{
                duration,
                delay,
                repeat: Infinity,
                ease: "easeInOut",
            }}
        />
    );
}
