import { StaticPage } from "@/components/static-page";

export default function PrivacyPage() {
    return (
        <StaticPage
            settingKey="page_privacy"
            title="Privacy Policy"
            fallback="Kebijakan privasi kami menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda."
        />
    );
}
