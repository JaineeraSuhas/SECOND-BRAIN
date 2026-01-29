import { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: ReactNode;
    fullWidth?: boolean;
}

export default function Input({
    label,
    error,
    icon,
    fullWidth = false,
    className = '',
    ...props
}: InputProps) {
    return (
        <div className={`${fullWidth ? 'w-full' : ''}`}>
            {label && (
                <label className="block text-sm font-medium text-text-secondary mb-2">
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary">
                        {icon}
                    </div>
                )}
                <input
                    className={`
                        liquid-glass rounded-xl px-4 py-3 w-full
                        text-text-primary placeholder-text-tertiary
                        border border-white/10
                        focus:outline-none focus:ring-2 focus:ring-accent-blue/50
                        transition-all duration-200
                        ${icon ? 'pl-12' : ''}
                        ${error ? 'border-red-500 focus:ring-red-500/50' : ''}
                        ${className}
                    `}
                    {...props}
                />
            </div>
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>
    );
}
