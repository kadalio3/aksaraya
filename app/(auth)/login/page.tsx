import { getSettings } from "@/lib/settings";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage() {
    const settings = await getSettings();

    return <LoginForm siteName={settings.site_name} />;
}
