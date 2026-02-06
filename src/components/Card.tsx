import { HTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    hover?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

export default function Card({
    children,
    hover = false,
    padding = 'md',
    className = '',
    ...props
}: CardProps) {
    const paddingStyles = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };

    return (
        <motion.div
            whileHover={hover ? { scale: 1.02 } : {}}
            className={`
                liquid-glass rounded-2xl
                ${paddingStyles[padding]}
                ${className}
            `}
            {...(props as any)}
        >
            {children}
        </motion.div>
    );
}
