import React from "react";
import { Button } from "./button";

interface ErrorMessageProps {
    title?: string;
    message: string;
    retry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
    title = "Error",
    message,
    retry
}) => {
    return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <div className="text-red-600 dark:text-red-400 text-4xl mb-3">⚠️</div>
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-300 mb-2">{title}</h3>
            <p className="text-red-700 dark:text-red-400 mb-4">{message}</p>
            {retry && (
                <Button variant="danger" onClick={retry} size="sm">
                    Try Again
                </Button>
            )}
        </div>
    );
};

export const ErrorPage: React.FC<ErrorMessageProps> = (props) => {
    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <div className="max-w-md w-full">
                <ErrorMessage {...props} />
            </div>
        </div>
    );
};

export const NotFound: React.FC<{ message?: string }> = ({
    message = "The page you're looking for doesn't exist."
}) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <h1 className="text-9xl font-bold text-muted/30">404</h1>
            <h2 className="text-2xl font-semibold text-fg mt-4 mb-2">Page Not Found</h2>
            <p className="text-muted mb-6">{message}</p>
            <a href="/">
                <Button>Back to Home</Button>
            </a>
        </div>
    );
};
