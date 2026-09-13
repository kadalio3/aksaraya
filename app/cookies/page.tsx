import { StaticPage } from "@/components/static-page";

export default function CookiesPage() {
    return (
        <StaticPage
            settingKey="page_cookies"
            title="Cookie Policy"
            fallback="Kebijakan cookie kami menjelaskan bagaimana kami menggunakan cookie untuk meningkatkan pengalaman Anda di platform ini."
        />
    );
}
