import { StaticPage } from "@/components/static-page";

export default function AboutPage() {
    return (
        <StaticPage
            settingKey="page_about"
            title="About Us"
            fallback="Selamat datang di platform kami. Kami adalah komunitas pecinta novel yang berdedikasi untuk menyediakan pengalaman membaca dan menulis terbaik."
        />
    );
}
