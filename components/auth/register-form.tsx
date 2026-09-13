"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface RegisterFormProps {
    siteName: string;
}

export default function RegisterForm({ siteName }: RegisterFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        // SECURITY: Role removed - always USER on registration
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError("Password tidak cocok");
            return;
        }

        if (formData.password.length < 8) {
            setError("Password minimal 8 karakter");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    // SECURITY: Role not sent - server sets to USER
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Registrasi gagal");
                return;
            }

            // Redirect to login after successful registration
            router.push("/login?registered=true");
        } catch (err) {
            setError("Terjadi kesalahan. Silakan coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg px-4 py-12">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center text-2xl">
                        Daftar ke <span className="font-bold text-fg">{siteName}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <Input
                            type="text"
                            label="Nama Lengkap"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />

                        <Input
                            type="email"
                            label="Email"
                            placeholder="your@email.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />

                        <Input
                            type="password"
                            label="Password"
                            placeholder="Minimal 8 karakter"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />

                        <Input
                            type="password"
                            label="Konfirmasi Password"
                            placeholder="Ulangi password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            required
                        />


                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? "Mendaftar..." : "Daftar"}
                        </Button>

                        <p className="text-center text-sm text-muted">
                            Sudah punya akun?{" "}
                            <Link href="/login" className="text-accent font-medium hover:underline">
                                Login di sini
                            </Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
