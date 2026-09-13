import { getSettings, isEnabled } from "@/lib/settings";
import RegisterForm from "@/components/auth/register-form";
import Link from "next/link";

export default async function RegisterPage() {
    const settings = await getSettings();

    if (!isEnabled(settings.allow_registration)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bg px-4">
                <div className="text-center max-w-md">
                    <h1 className="text-2xl font-bold text-fg mb-2">Pendaftaran Ditutup</h1>
                    <p className="text-muted mb-6">
                        Pendaftaran sementara tidak tersedia. Silakan coba lagi nanti.
                    </p>
                    <Link href="/login" className="text-accent font-medium hover:underline">
                        Login ke akun yang sudah ada
                    </Link>
                </div>
            </div>
        );
    }

    return <RegisterForm siteName={settings.site_name} />;
}
