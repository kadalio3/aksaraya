"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export function ThemeToggle() {
    const { resolved, setTheme } = useTheme();
    const isDark = resolved === "dark";

    return (
        <button
            id="theme-toggle"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            aria-pressed={isDark}
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-fg transition-[transform,background-color,border-color] duration-300 ease-out hover:scale-[1.05] hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
            <Sun
                size={16}
                aria-hidden="true"
                className="absolute transition-[opacity,transform] duration-300 ease-out dark:opacity-0 dark:rotate-90 dark:scale-75"
            />
            <Moon
                size={16}
                aria-hidden="true"
                className="absolute opacity-0 -rotate-90 scale-75 transition-[opacity,transform] duration-300 ease-out dark:opacity-100 dark:rotate-0 dark:scale-100"
            />
        </button>
    );
}
