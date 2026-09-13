"use client";

import { ReactNode } from "react";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: "danger" | "warning" | "info";
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "danger",
}: ConfirmModalProps) {
    if (!isOpen) return null;

    const getTypeStyles = () => {
        switch (type) {
            case "danger":
                return {
                    icon: "🗑️",
                    confirmBg: "bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600",
                    iconBg: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
                };
            case "warning":
                return {
                    icon: "⚠️",
                    confirmBg: "bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600",
                    iconBg: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
                };
            case "info":
                return {
                    icon: "ℹ️",
                    confirmBg: "bg-accent hover:opacity-90",
                    iconBg: "bg-accent/15 text-accent",
                };
        }
    };

    const styles = getTypeStyles();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative bg-surface rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-scale-in">
                <div className="p-6">
                    <div className={`w-12 h-12 rounded-full ${styles.iconBg} flex items-center justify-center text-2xl mb-4`}>
                        {styles.icon}
                    </div>
                    <h3 className="text-xl font-bold text-fg mb-2">{title}</h3>
                    <p className="text-muted mb-6">{message}</p>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 bg-muted/15 hover:bg-muted/25 text-fg font-medium rounded-lg transition-[background-color] duration-300"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`flex-1 px-4 py-2.5 ${styles.confirmBg} text-white font-medium rounded-lg transition-[background-color,opacity] duration-300`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
