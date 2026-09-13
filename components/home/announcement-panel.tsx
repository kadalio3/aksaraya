import Link from "next/link";
import { Megaphone } from "lucide-react";

interface Announcement {
    id: string;
    title: string;
    date: string;
}

interface AnnouncementPanelProps {
    announcements?: Announcement[];
}

export function AnnouncementPanel({ announcements = [] }: AnnouncementPanelProps) {
    return (
        <div className="bg-surface border border-border rounded-2xl h-full flex flex-col">
            <div className="px-5 py-4 border-b border-border">
                <h3 className="font-bold font-display text-fg">Pengumuman</h3>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-border">
                {announcements.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-8 text-center px-5">
                        <Megaphone size={24} className="text-muted mb-2 opacity-50" />
                        <p className="text-sm text-muted">Belum ada pengumuman</p>
                    </div>
                ) : (
                    announcements.map((item) => (
                        <Link
                            key={item.id}
                            href={`/announcement/${item.id}`}
                            className="flex items-start gap-3 px-5 py-4 hover:bg-bg transition-[background-color] duration-300"
                        >
                            <div className="w-8 h-8 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center shrink-0 mt-0.5">
                                <Megaphone size={14} className="text-pink-500 dark:text-pink-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-fg leading-snug">{item.title}</p>
                                <p className="text-xs text-muted mt-0.5">{item.date}</p>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
