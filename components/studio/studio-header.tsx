"use client";

interface StudioHeaderProps {
    user: {
        name: string | null;
        email: string;
        role: string;
    };
}

export function StudioHeader({ user }: StudioHeaderProps) {
    return (
        <header className="bg-surface border-b border-border sticky top-0 z-10">
            <div className="flex items-center justify-between px-6 py-3">
                <h2 className="text-sm font-semibold text-fg">Creator Studio</h2>

                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent text-sm font-bold shrink-0">
                        {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 hidden sm:block">
                        <p className="text-sm font-medium text-fg truncate">
                            {user.name || user.email}
                        </p>
                        <p className="text-xs text-muted">{user.role}</p>
                    </div>
                </div>
            </div>
        </header>
    );
}
