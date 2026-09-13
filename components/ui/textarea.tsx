import React from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, helperText, className = "", ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-fg mb-1.5">
                        {label}
                    </label>
                )}
                <textarea
                    ref={ref}
                    className={`w-full px-4 py-2 border rounded-lg transition-[border-color,box-shadow] duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 resize-y bg-surface text-fg ${error
                        ? "border-red-500 focus-visible:ring-red-500"
                        : "border-border focus-visible:ring-accent focus-visible:border-accent"
                        } disabled:bg-muted/10 disabled:cursor-not-allowed ${className}`}
                    {...props}
                />
                {error && (
                    <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{error}</p>
                )}
                {helperText && !error && (
                    <p className="mt-1.5 text-sm text-muted">{helperText}</p>
                )}
            </div>
        );
    }
);

Textarea.displayName = "Textarea";
