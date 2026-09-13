export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Space_Grotesk, DM_Sans } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { getSettings } from "@/lib/settings";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: {
      default: `${settings.site_name} - ${settings.site_description}`,
      template: `%s | ${settings.site_name}`,
    },
    description: settings.site_description,
    keywords: settings.meta_keywords,
    ...(settings.site_url && {
      metadataBase: new URL(settings.site_url),
    }),
    openGraph: {
      title: settings.site_name,
      description: settings.site_description,
      siteName: settings.site_name,
      ...(settings.og_image && { images: [settings.og_image] }),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: settings.site_name,
      description: settings.site_description,
      ...(settings.og_image && { images: [settings.og_image] }),
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(t!=='light'&&d)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className={`${spaceGrotesk.variable} ${dmSans.variable} antialiased`} suppressHydrationWarning>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
