export default function Loading() {
    return (
        <div className="min-h-screen bg-bg flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-3 border-border border-t-accent rounded-full animate-spin" />
                <p className="text-sm text-muted">Memuat...</p>
            </div>
        </div>
    );
}
