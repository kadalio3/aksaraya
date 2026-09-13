import React from "react";

export const LoadingSpinner: React.FC<{ size?: "sm" | "md" | "lg" }> = ({ size = "md" }) => {
    const sizeStyles = {
        sm: "h-4 w-4",
        md: "h-8 w-8",
        lg: "h-12 w-12",
    };

    return (
        <div className="flex items-center justify-center">
            <div
                className={`${sizeStyles[size]} animate-spin rounded-full border-4 border-border border-t-accent`}
            ></div>
        </div>
    );
};

export const LoadingPage: React.FC<{ message?: string }> = ({ message = "Loading..." }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-muted">{message}</p>
        </div>
    );
};

export const LoadingCard: React.FC = () => {
    return (
        <div className="bg-surface rounded-lg border border-border p-6 animate-pulse">
            <div className="h-48 bg-muted/20 rounded-md mb-4"></div>
            <div className="h-6 bg-muted/20 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-muted/20 rounded w-full mb-2"></div>
            <div className="h-4 bg-muted/20 rounded w-5/6"></div>
        </div>
    );
};
