"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Chapter {
    id: string;
    order: number;
    title?: string;
}

interface ChapterReaderNavProps {
    novelId: string;
    novelTitle: string;
    currentChapter: {
        id: string;
        order: number;
        title: string;
    };
    allChapters: Chapter[];
    prevChapter: Chapter | null;
    nextChapter: Chapter | null;
    readingTime: number;
    userId?: string;
    novelId2?: string;
    chapterId?: string;
}

const BG_OPTIONS = [
    { label: "Putih", value: "bg-white", cls: "bg-white border-gray-300" },
    { label: "Sepia", value: "bg-sepia", cls: "bg-amber-50 border-amber-200" },
    { label: "Gelap", value: "bg-dark", cls: "bg-gray-900 border-gray-700" },
];

const FONT_OPTIONS = [
    { label: "Sans", value: "font-sans" },
    { label: "Serif", value: "font-serif" },
    { label: "Mono", value: "font-mono" },
];

export function ChapterReaderNav({
    novelId,
    novelTitle,
    currentChapter,
    allChapters,
    prevChapter,
    nextChapter,
    readingTime,
    userId,
    novelId2,
    chapterId,
}: ChapterReaderNavProps) {
    const router = useRouter();
    const [fontSize, setFontSize] = useState(18);
    const [bgMode, setBgMode] = useState("bg-white");
    const [fontFamily, setFontFamily] = useState("font-sans");
    const [showChapterDropdown, setShowChapterDropdown] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const settingsRef = useRef<HTMLDivElement>(null);

    // Load saved preferences
    useEffect(() => {
        const savedSize = localStorage.getItem("reader-font-size");
        const savedBg = localStorage.getItem("reader-bg");
        const savedFont = localStorage.getItem("reader-font");
        if (savedSize) setFontSize(parseInt(savedSize));
        if (savedBg) setBgMode(savedBg);
        if (savedFont) setFontFamily(savedFont);
    }, []);

    // Apply font size
    useEffect(() => {
        localStorage.setItem("reader-font-size", fontSize.toString());
        document.documentElement.style.setProperty("--reader-font-size", `${fontSize}px`);
    }, [fontSize]);

    // Apply background
    useEffect(() => {
        localStorage.setItem("reader-bg", bgMode);
        const content = document.querySelector(".reading-content-wrapper") as HTMLElement;
        if (content) {
            content.classList.remove("bg-white", "bg-amber-50", "bg-gray-900");
            if (bgMode === "bg-sepia") content.style.background = "#fdf6e3";
            else if (bgMode === "bg-dark") {
                content.style.background = "#1a1a2e";
                content.style.color = "#e2e8f0";
            } else {
                content.style.background = "";
                content.style.color = "";
            }
        }
    }, [bgMode]);

    // Apply font family
    useEffect(() => {
        localStorage.setItem("reader-font", fontFamily);
        const content = document.querySelector(".reading-content") as HTMLElement;
        if (content) {
            content.classList.remove("font-sans", "font-serif", "font-mono");
            content.classList.add(fontFamily);
        }
    }, [fontFamily]);

    // Track scroll progress & save to DB (debounced)
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
            const clampedProgress = Math.min(100, Math.max(0, progress));
            setScrollProgress(clampedProgress);

            // Debounce save to DB — only if user is logged in
            if (userId && novelId2 && chapterId) {
                if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
                saveTimerRef.current = setTimeout(() => {
                    fetch("/api/progress/update", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ novelId: novelId2, chapterId, progress: clampedProgress }),
                    }).catch(() => {});
                }, 2000); // save after 2s of no scrolling
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", handleScroll);
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        };
    }, [userId, novelId2, chapterId]);

    // Keyboard navigation
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        if (e.key === "ArrowLeft" && prevChapter) {
            router.push(`/novel/${novelId}/chapter/${prevChapter.id}`);
        } else if (e.key === "ArrowRight" && nextChapter) {
            router.push(`/novel/${novelId}/chapter/${nextChapter.id}`);
        }
    }, [novelId, prevChapter, nextChapter, router]);

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest(".chapter-dropdown")) setShowChapterDropdown(false);
            if (settingsRef.current && !settingsRef.current.contains(target)) setShowSettings(false);
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    return (
        <>
            {/* Sticky Navigation Bar */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-surface/95 backdrop-blur-sm border-b border-border shadow-sm">
                {/* Progress Bar */}
                <div className="h-1 bg-bg">
                    <div
                        className="h-full bg-accent transition-all duration-150"
                        style={{ width: `${scrollProgress}%` }}
                    />
                </div>

                <div className="max-w-4xl mx-auto px-4">
                    <div className="flex items-center justify-between h-14">
                        {/* Left: Back + Novel Title */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                            <Link
                                href={`/novel/${novelId}`}
                                className="flex-shrink-0 p-2 -ml-2 hover:bg-bg rounded-lg transition-colors"
                                title="Kembali ke Novel"
                            >
                                <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </Link>
                            <span className="text-sm font-medium text-fg truncate hidden sm:block">{novelTitle}</span>
                        </div>

                        {/* Center: Chapter Selector */}
                        <div className="relative chapter-dropdown">
                            <button
                                onClick={() => setShowChapterDropdown(!showChapterDropdown)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-bg hover:bg-border rounded-lg transition-colors text-sm font-medium"
                            >
                                <span>Ch. {currentChapter.order}</span>
                                <svg className={`w-4 h-4 transition-transform ${showChapterDropdown ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {showChapterDropdown && (
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 max-h-80 overflow-y-auto bg-surface rounded-xl shadow-lg border border-border z-50">
                                    <div className="p-2 border-b border-border sticky top-0 bg-surface">
                                        <p className="text-xs text-muted text-center">Pilih Chapter</p>
                                    </div>
                                    <div className="p-2 space-y-1">
                                        {allChapters.map((chapter) => (
                                            <Link
                                                key={chapter.id}
                                                href={`/novel/${novelId}/chapter/${chapter.id}`}
                                                onClick={() => setShowChapterDropdown(false)}
                                                className={`block px-3 py-2 rounded-lg text-sm transition-colors ${chapter.id === currentChapter.id
                                                    ? "bg-accent/10 text-accent font-semibold"
                                                    : "hover:bg-bg text-fg"
                                                    }`}
                                            >
                                                <span className="font-medium">Ch. {chapter.order}</span>
                                                {chapter.title && (
                                                    <span className="ml-2 text-muted truncate">{chapter.title}</span>
                                                )}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right: Controls */}
                        <div className="flex items-center gap-1.5 flex-1 justify-end">
                            {/* Reading time */}
                            <span className="text-xs text-muted hidden md:block mr-1">{readingTime} mnt</span>

                            {/* Font Size */}
                            <div className="flex items-center gap-0.5 bg-bg rounded-lg p-1">
                                <button
                                    onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                                    className="p-1.5 hover:bg-border rounded transition-colors"
                                    disabled={fontSize <= 14}
                                >
                                    <span className="text-xs font-bold text-muted">A-</span>
                                </button>
                                <span className="text-xs text-muted w-7 text-center">{fontSize}</span>
                                <button
                                    onClick={() => setFontSize(Math.min(28, fontSize + 2))}
                                    className="p-1.5 hover:bg-border rounded transition-colors"
                                    disabled={fontSize >= 28}
                                >
                                    <span className="text-sm font-bold text-muted">A+</span>
                                </button>
                            </div>

                            {/* Settings (Bg + Font) */}
                            <div className="relative" ref={settingsRef}>
                                <button
                                    onClick={() => setShowSettings(!showSettings)}
                                    className="p-2 hover:bg-bg rounded-lg transition-colors"
                                    title="Pengaturan tampilan"
                                >
                                    <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                    </svg>
                                </button>

                                {showSettings && (
                                    <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-border rounded-xl shadow-lg z-50 p-4">
                                        <p className="text-xs font-semibold text-fg mb-3">Tampilan</p>

                                        {/* Background */}
                                        <div className="mb-4">
                                            <p className="text-xs text-muted mb-2">Background</p>
                                            <div className="flex gap-2">
                                                {BG_OPTIONS.map((bg) => (
                                                    <button
                                                        key={bg.value}
                                                        onClick={() => setBgMode(bg.value)}
                                                        className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-all ${bg.cls} ${bgMode === bg.value ? "ring-2 ring-accent" : ""}`}
                                                    >
                                                        {bg.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Font Family */}
                                        <div>
                                            <p className="text-xs text-muted mb-2">Font</p>
                                            <div className="flex gap-2">
                                                {FONT_OPTIONS.map((f) => (
                                                    <button
                                                        key={f.value}
                                                        onClick={() => setFontFamily(f.value)}
                                                        className={`flex-1 py-2 rounded-lg border border-border text-xs font-medium transition-all hover:bg-bg ${fontFamily === f.value ? "bg-accent text-accent-fg border-accent" : "bg-surface text-fg"} ${f.value}`}
                                                    >
                                                        {f.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Prev/Next Chapter */}
                            <div className="flex items-center gap-0.5">
                                {prevChapter ? (
                                    <Link href={`/novel/${novelId}/chapter/${prevChapter.id}`} className="p-2 hover:bg-bg rounded-lg transition-colors" title="Chapter sebelumnya (←)">
                                        <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </Link>
                                ) : <div className="p-2 w-9" />}
                                {nextChapter ? (
                                    <Link href={`/novel/${novelId}/chapter/${nextChapter.id}`} className="p-2 hover:bg-bg rounded-lg transition-colors" title="Chapter berikutnya (→)">
                                        <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                ) : <div className="p-2 w-9" />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Spacer for fixed header */}
            <div className="h-[60px]" />

            {/* Keyboard shortcut hint */}
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-4 py-2 rounded-full opacity-0 animate-fade-hint pointer-events-none hidden md:block">
                Gunakan tombol ← → untuk navigasi chapter
            </div>

            <style jsx global>{`
                .reading-content {
                    font-size: var(--reader-font-size, 18px);
                    line-height: 1.85;
                }
                @keyframes fadeHint {
                    0% { opacity: 0; transform: translateX(-50%) translateY(10px); }
                    10% { opacity: 1; transform: translateX(-50%) translateY(0); }
                    80% { opacity: 1; transform: translateX(-50%) translateY(0); }
                    100% { opacity: 0; transform: translateX(-50%) translateY(10px); }
                }
                .animate-fade-hint {
                    animation: fadeHint 4s ease-in-out forwards;
                }
            `}</style>
        </>
    );
}
