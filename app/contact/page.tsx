import { StaticPage } from "@/components/static-page";

export default function ContactPage() {
    return (
        <StaticPage
            settingKey="page_contact"
            title="Contact Us"
            fallback="Hubungi kami jika Anda memiliki pertanyaan, saran, atau masukan. Tim kami siap membantu Anda."
        />
    );
}
