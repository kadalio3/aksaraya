"use client";

import { useState } from "react";
import type { SiteSettings } from "@/lib/settings";
import { Save } from "lucide-react";

interface SettingsFormProps {
    initialSettings: SiteSettings;
    studioToken: string;
}

export function SettingsForm({ initialSettings, studioToken }: SettingsFormProps) {
    const [settings, setSettings] = useState(initialSettings);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    const update = (key: keyof SiteSettings, value: string) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    };

    const toggleBool = (key: keyof SiteSettings) => {
        update(key, settings[key] === "true" ? "false" : "true");
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage("");
        try {
            const res = await fetch(`/api/settings?verify=${studioToken}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            });
            if (res.ok) {
                setMessage("Settings saved successfully");
            } else {
                setMessage("Failed to save settings");
            }
        } catch {
            setMessage("Error saving settings");
        }
        setSaving(false);
        setTimeout(() => setMessage(""), 3000);
    };

    return (
        <div className="space-y-6">
            {/* General */}
            <section className="bg-surface border border-border rounded-xl p-5">
                <h2 className="text-sm font-semibold text-fg mb-4">General</h2>
                <div className="space-y-4">
                    <Field label="Platform Name">
                        <input
                            value={settings.site_name}
                            onChange={(e) => update("site_name", e.target.value)}
                            className="input-field"
                        />
                    </Field>
                    <Field label="Platform Description">
                        <input
                            value={settings.site_description}
                            onChange={(e) => update("site_description", e.target.value)}
                            className="input-field"
                        />
                    </Field>
                    <Field label="Contact Email">
                        <input
                            type="email"
                            value={settings.contact_email}
                            onChange={(e) => update("contact_email", e.target.value)}
                            className="input-field"
                        />
                    </Field>
                </div>
            </section>

            {/* SEO */}
            <section className="bg-surface border border-border rounded-xl p-5">
                <h2 className="text-sm font-semibold text-fg mb-4">SEO</h2>
                <div className="space-y-4">
                    <Field label="Site URL" hint="e.g. https://novelhub.com">
                        <input
                            value={settings.site_url}
                            onChange={(e) => update("site_url", e.target.value)}
                            placeholder="https://"
                            className="input-field"
                        />
                    </Field>
                    <Field label="Meta Keywords" hint="Comma-separated keywords for SEO">
                        <input
                            value={settings.meta_keywords}
                            onChange={(e) => update("meta_keywords", e.target.value)}
                            className="input-field"
                        />
                    </Field>
                    <Field label="OG Image URL" hint="Default image for social media sharing">
                        <input
                            value={settings.og_image}
                            onChange={(e) => update("og_image", e.target.value)}
                            placeholder="https://"
                            className="input-field"
                        />
                    </Field>
                    <Field label="Google Analytics ID" hint="e.g. G-XXXXXXXXXX">
                        <input
                            value={settings.google_analytics_id}
                            onChange={(e) => update("google_analytics_id", e.target.value)}
                            placeholder="G-"
                            className="input-field"
                        />
                    </Field>
                </div>
            </section>

            {/* Security */}
            <section className="bg-surface border border-border rounded-xl p-5">
                <h2 className="text-sm font-semibold text-fg mb-4">Security</h2>
                <div className="space-y-3">
                    <Toggle
                        label="Allow New Registrations"
                        description="Enable new user sign-ups"
                        checked={settings.allow_registration === "true"}
                        onChange={() => toggleBool("allow_registration")}
                    />
                    <Toggle
                        label="Require Email Verification"
                        description="Users must verify email before posting"
                        checked={settings.require_email_verification === "true"}
                        onChange={() => toggleBool("require_email_verification")}
                    />
                    <Toggle
                        label="Content Moderation"
                        description="Review content before publishing"
                        checked={settings.enable_content_moderation === "true"}
                        onChange={() => toggleBool("enable_content_moderation")}
                    />
                    <Toggle
                        label="Maintenance Mode"
                        description="Show maintenance page to all visitors"
                        checked={settings.maintenance_mode === "true"}
                        onChange={() => toggleBool("maintenance_mode")}
                    />

                    <Field label="Default User Role">
                        <select
                            value={settings.default_user_role}
                            onChange={(e) => update("default_user_role", e.target.value)}
                            className="input-field"
                        >
                            <option value="USER">USER</option>
                            <option value="AUTHOR">AUTHOR</option>
                        </select>
                    </Field>
                </div>
            </section>

            {/* Save */}
            <div className="flex items-center gap-4">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-accent-fg rounded-lg text-sm font-medium hover:opacity-90 transition-[opacity] duration-300 disabled:opacity-50"
                >
                    <Save size={14} />
                    {saving ? "Saving..." : "Save Settings"}
                </button>
                {message && (
                    <span className={`text-sm ${message.includes("success") ? "text-green-600" : "text-red-500"}`}>
                        {message}
                    </span>
                )}
            </div>

            <style jsx>{`
                .input-field {
                    width: 100%;
                    padding: 0.5rem 0.75rem;
                    border: 1px solid var(--color-border);
                    border-radius: 0.5rem;
                    background: var(--color-bg);
                    color: var(--color-fg);
                    font-size: 0.875rem;
                    outline: none;
                    transition: border-color 0.3s;
                }
                .input-field:focus {
                    border-color: var(--color-accent);
                }
            `}</style>
        </div>
    );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-sm font-medium text-fg mb-1">{label}</label>
            {hint && <p className="text-xs text-muted mb-1.5">{hint}</p>}
            {children}
        </div>
    );
}

function Toggle({ label, description, checked, onChange }: {
    label: string;
    description: string;
    checked: boolean;
    onChange: () => void;
}) {
    return (
        <div className="flex items-center justify-between py-2">
            <div>
                <p className="text-sm font-medium text-fg">{label}</p>
                <p className="text-xs text-muted">{description}</p>
            </div>
            <button
                onClick={onChange}
                className={`relative w-10 h-5 rounded-full transition-[background-color] duration-300 ${checked ? "bg-accent" : "bg-border"}`}
            >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-surface rounded-full transition-[transform] duration-300 ${checked ? "translate-x-5" : ""}`} />
            </button>
        </div>
    );
}
