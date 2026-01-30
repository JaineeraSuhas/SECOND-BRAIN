import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

interface LogoProps {
    size?: 'sm' | 'md' | 'lg';
    animated?: boolean;
}

export default function Logo({ size = 'md', animated = false }: LogoProps) {
    const sizeMap = {
        sm: 24,
        md: 32,
        lg: 48
    };

    const iconSize = sizeMap[size];

    if (animated) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative"
            >
                <motion.div
                    animate={{
                        rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <Brain size={iconSize} className="text-black" strokeWidth={1.5} />
                </motion.div>
                <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full blur-xl"
                    animate={{
                        opacity: [0.3, 0.6, 0.3],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            </motion.div>
        );
    }

    return <Brain size={iconSize} className="text-black" strokeWidth={1.5} />;
}
