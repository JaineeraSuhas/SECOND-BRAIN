/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                // macOS System Colors
                accent: {
                    blue: '#007AFF',
                    purple: '#AF52DE',
                    pink: '#FF2D55',
                    orange: '#FF9500',
                    yellow: '#FFCC00',
                    green: '#34C759',
                    teal: '#5AC8FA',
                    indigo: '#5856D6',
                },
                bg: {
                    primary: 'rgba(28, 28, 30, 0.95)',
                    secondary: 'rgba(44, 44, 46, 0.9)',
                    tertiary: 'rgba(58, 58, 60, 0.85)',
                },
                glass: {
                    primary: 'rgba(255, 255, 255, 0.08)',
                    secondary: 'rgba(255, 255, 255, 0.05)',
                    border: 'rgba(255, 255, 255, 0.12)',
                },
            },
            fontFamily: {
                display: [
                    'SF Pro Display',
                    '-apple-system',
                    'BlinkMacSystemFont',
                    'Inter',
                    'system-ui',
                    'sans-serif',
                ],
                text: [
                    'SF Pro Text',
                    '-apple-system',
                    'BlinkMacSystemFont',
                    'Inter',
                    'system-ui',
                    'sans-serif',
                ],
                mono: ['SF Mono', 'Monaco', 'Consolas', 'monospace'],
            },
            boxShadow: {
                'glass-sm': '0 2px 8px rgba(0, 0, 0, 0.12)',
                'glass-md': '0 4px 16px rgba(0, 0, 0, 0.16)',
                'glass-lg': '0 8px 32px rgba(0, 0, 0, 0.24)',
                'glass-xl': '0 16px 64px rgba(0, 0, 0, 0.32)',
            },
            backdropBlur: {
                glass: '40px',
            },
            animation: {
                'genie-in': 'genieIn 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                'genie-out': 'genieOut 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                'fade-in': 'fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                'slide-up': 'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                'scale-in': 'scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            },
            keyframes: {
                genieIn: {
                    '0%': {
                        transform: 'scale(0.1) translateY(400px)',
                        opacity: '0',
                        filter: 'blur(20px)',
                    },
                    '100%': {
                        transform: 'scale(1) translateY(0)',
                        opacity: '1',
                        filter: 'blur(0)',
                    },
                },
                genieOut: {
                    '0%': {
                        transform: 'scale(1) translateY(0)',
                        opacity: '1',
                        filter: 'blur(0)',
                    },
                    '100%': {
                        transform: 'scale(0.1) translateY(400px)',
                        opacity: '0',
                        filter: 'blur(20px)',
                    },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': {
                        transform: 'translateY(20px)',
                        opacity: '0',
                    },
                    '100%': {
                        transform: 'translateY(0)',
                        opacity: '1',
                    },
                },
                scaleIn: {
                    '0%': {
                        transform: 'scale(0.95)',
                        opacity: '0',
                    },
                    '100%': {
                        transform: 'scale(1)',
                        opacity: '1',
                    },
                },
            },
        },
    },
    plugins: [],
};
