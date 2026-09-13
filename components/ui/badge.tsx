import React from "react";

interface BadgeProps {
    children: React.ReactNode;
    variant?: "default" | "primary" | "success" | "warning" | "danger" | "info";
    size?: "sm" | "md" | "lg";
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = "default",
    size = "md",
    className = ""
}) => {
    const variantStyles = {
        default: "bg-muted/15 text-fg",
        primary: "bg-accent/15 text-accent",
        success: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        warning: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
        danger: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        info: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
    };

    const sizeStyles = {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-1 text-sm",
        lg: "px-3 py-1.5 text-base",
    };

    return (
        <span
            className={`inline-flex items-center font-medium rounded-full ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        >
            {children}
        </span>
    );
};
