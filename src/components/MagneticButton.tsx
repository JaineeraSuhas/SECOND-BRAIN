import { useRef, useState, MouseEvent } from 'react';
import { motion } from 'framer-motion';

interface MagneticButtonProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export default function MagneticButton({ children, className = '', onClick }: MagneticButtonProps) {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
        if (!buttonRef.current) return;

        const rect = buttonRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const distanceX = e.clientX - centerX;
        const distanceY = e.clientY - centerY;

        // Magnetic effect - pull towards cursor
        setPosition({
            x: distanceX * 0.3,
            y: distanceY * 0.3,
        });
    };

    const handleMouseLeave = () => {
        setPosition({ x: 0, y: 0 });
    };

    return (
        <motion.button
            ref={buttonRef}
            className={`relative overflow-hidden ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            animate={{
                x: position.x,
                y: position.y,
            }}
            transition={{
                type: 'spring',
                stiffness: 150,
                damping: 15,
                mass: 0.1,
            }}
        >
            <motion.span
                className="relative z-10"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                {children}
            </motion.span>

            {/* Ripple effect on hover */}
            <motion.div
                className="absolute inset-0 bg-white/10 rounded-xl"
                initial={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
            />
        </motion.button>
    );
}
