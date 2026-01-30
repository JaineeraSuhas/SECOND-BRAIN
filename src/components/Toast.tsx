import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { Toast as ToastType } from '../types';

let toastId = 0;
const listeners = new Set<(toasts: ToastType[]) => void>();
let toasts: ToastType[] = [];

function notify(listeners: Set<(toasts: ToastType[]) => void>, toasts: ToastType[]) {
    listeners.forEach((listener) => listener(toasts));
}

export const toast = {
    success: (message: string, duration = 3000) => {
        const id = String(toastId++);
        toasts = [...toasts, { id, type: 'success', message, duration }];
        notify(listeners, toasts);
    },
    error: (message: string, duration = 5000) => {
        const id = String(toastId++);
        toasts = [...toasts, { id, type: 'error', message, duration }];
        notify(listeners, toasts);
    },
    info: (message: string, duration = 3000) => {
        const id = String(toastId++);
        toasts = [...toasts, { id, type: 'info', message, duration }];
        notify(listeners, toasts);
    },
    warning: (message: string, duration = 4000) => {
        const id = String(toastId++);
        toasts = [...toasts, { id, type: 'warning', message, duration }];
        notify(listeners, toasts);
    },
};

export default function ToastContainer() {
    const [currentToasts, setCurrentToasts] = useState<ToastType[]>([]);

    useEffect(() => {
        listeners.add(setCurrentToasts);
        return () => {
            listeners.delete(setCurrentToasts);
        };
    }, []);

    const removeToast = (id: string) => {
        toasts = toasts.filter((t) => t.id !== id);
        notify(listeners, toasts);
    };

    const icons = {
        success: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>,
        error: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>,
        info: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>,
        warning: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>,
    };

    const styles = {
        success: 'bg-green-500/20 border-green-500/50 text-green-400',
        error: 'bg-red-500/20 border-red-500/50 text-red-400',
        info: 'bg-blue-500/20 border-blue-500/50 text-blue-400',
        warning: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400',
    };

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            <AnimatePresence>
                {currentToasts.map((toast) => (
                    <ToastItem
                        key={toast.id}
                        toast={toast}
                        onRemove={removeToast}
                        icon={icons[toast.type]}
                        style={styles[toast.type]}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
}

function ToastItem({
    toast,
    onRemove,
    icon,
    style,
}: {
    toast: ToastType;
    onRemove: (id: string) => void;
    icon: React.ReactNode;
    style: string;
}) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onRemove(toast.id);
        }, toast.duration || 3000);
        return () => clearTimeout(timer);
    }, [toast, onRemove]);

    return (
        <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            className={`
                liquid-glass rounded-xl p-4 pr-12 min-w-[300px] max-w-md
                border ${style}
                flex items-center gap-3 relative
            `}
        >
            {icon}
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            <button
                onClick={() => onRemove(toast.id)}
                className="absolute top-3 right-3 text-current opacity-60 hover:opacity-100 transition-opacity"
            >
                <FiX size={16} />
            </button>
        </motion.div>
    );
}
