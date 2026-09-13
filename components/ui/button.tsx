import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
    children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant = "primary", size = "md", className = "", children, ...props }, ref) => {
        const baseStyles =
            "inline-flex items-center justify-center font-medium rounded-lg transition-[transform,opacity,color,background-color,border-color] duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2";

        const variantStyles = {
            primary: "bg-accent text-accent-fg hover:opacity-90 shadow-sm",
            secondary: "bg-muted/20 text-fg hover:bg-muted/30 shadow-sm",
            outline: "border-2 border-accent text-accent hover:bg-accent/10",
            ghost: "text-fg hover:bg-bg",
            danger: "bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 shadow-sm",
        };

        const sizeStyles = {
            sm: "px-3 py-1.5 text-sm",
            md: "px-4 py-2 text-base",
            lg: "px-6 py-3 text-lg",
        };

        return (
            <button
                ref={ref}
                className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
                {...props}
            >
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";
