"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

export function useTheme() {
    const [theme, setTheme] = useState<Theme>("system");
    const [resolved, setResolved] = useState<"light" | "dark">("light");

    useEffect(() => {
        const stored = localStorage.getItem("theme") as Theme | null;
        if (stored) {
            setTheme(stored);
        }
    }, []);

    useEffect(() => {
        const root = document.documentElement;
        const mq = window.matchMedia("(prefers-color-scheme: dark)");

        const apply = (t: Theme) => {
            const isDark = t === "dark" || (t === "system" && mq.matches);
            root.classList.toggle("dark", isDark);
            setResolved(isDark ? "dark" : "light");
        };

        apply(theme);
        if (theme !== "system") {
            localStorage.setItem("theme", theme);
        } else {
            localStorage.removeItem("theme");
        }

        const listener = () => { if (theme === "system") apply("system"); };
        mq.addEventListener("change", listener);
        return () => mq.removeEventListener("change", listener);
    }, [theme]);

    return { theme, setTheme, resolved };
}
