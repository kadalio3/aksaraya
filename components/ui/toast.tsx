"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { X } from "lucide-react";

type ToastType = "success" | "error" | "delete" | "info";

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within ToastProvider");
    }
    return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, 4000);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const getToastStyles = (type: ToastType) => {
        switch (type) {
            case "success":
                return "bg-green-500 text-white";
            case "error":
                return "bg-orange-500 text-white";
            case "delete":
                return "bg-red-500 text-white";
            case "info":
                return "bg-accent text-accent-fg";
            default:
                return "bg-fg text-bg";
        }
    };

    const getIcon = (type: ToastType) => {
        switch (type) {
            case "success":
                return "✓";
            case "error":
                return "⚠️";
            case "delete":
                return "🗑️";
            case "info":
                return "ℹ️";
            default:
                return "•";
        }
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            <div className="fixed top-4 right-4 z-50 space-y-2">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`${getToastStyles(toast.type)} px-6 py-4 rounded-lg shadow-sm flex items-center gap-3 min-w-[300px] animate-slide-in-right`}
                    >
                        <span className="text-2xl">{getIcon(toast.type)}</span>
                        <p className="flex-1 font-medium">{toast.message}</p>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="hover:opacity-75 transition-[opacity] duration-300"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
