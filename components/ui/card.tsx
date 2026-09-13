import React from "react";

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    padding?: "none" | "sm" | "md" | "lg";
}

export const Card: React.FC<CardProps> = ({
    children,
    className = "",
    hover = false,
    padding = "md"
}) => {
    const paddingStyles = {
        none: "",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
    };

    return (
        <div
            className={`bg-surface rounded-lg border border-border shadow-sm ${hover ? "transition-[box-shadow,transform] duration-300 hover:shadow-sm hover:-translate-y-0.5" : ""
                } ${paddingStyles[padding]} ${className}`}
        >
            {children}
        </div>
    );
};

interface CardHeaderProps {
    children: React.ReactNode;
    className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
    children,
    className = ""
}) => {
    return <div className={`mb-4 ${className}`}>{children}</div>;
};

interface CardTitleProps {
    children: React.ReactNode;
    className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({
    children,
    className = ""
}) => {
    return <h3 className={`text-lg font-semibold text-fg ${className}`}>{children}</h3>;
};

interface CardContentProps {
    children: React.ReactNode;
    className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({
    children,
    className = ""
}) => {
    return <div className={className}>{children}</div>;
};

interface CardFooterProps {
    children: React.ReactNode;
    className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({
    children,
    className = ""
}) => {
    return <div className={`mt-4 pt-4 border-t border-border ${className}`}>{children}</div>;
};
