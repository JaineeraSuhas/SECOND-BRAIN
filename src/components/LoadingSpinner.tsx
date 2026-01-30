import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    variant?: 'primary' | 'secondary' | 'white';
}

export default function LoadingSpinner({ size = 'md', variant = 'primary' }: LoadingSpinnerProps) {
    const sizeMap = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    };

    const colorMap = {
        primary: 'border-black/20 border-t-black',
        secondary: 'border-gray-300 border-t-gray-600',
        white: 'border-white/20 border-t-white'
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center"
        >
            <div className={`${sizeMap[size]} ${colorMap[variant]} border-2 rounded-full animate-spin`} />
        </motion.div>
    );
}
