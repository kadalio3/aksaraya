import { StaticPage } from "@/components/static-page";

export default function TermsPage() {
    return (
        <StaticPage
            settingKey="page_terms"
            title="Terms of Service"
            fallback="Syarat dan ketentuan penggunaan platform ini. Silakan hubungi administrator untuk informasi lebih lanjut."
        />
    );
}
