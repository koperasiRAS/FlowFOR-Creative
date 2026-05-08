import type { Metadata } from "next";
import "./globals.css";
import AppShell from "./components/AppShell";
import { SettingsProvider } from "./components/SettingsContext";

export const metadata: Metadata = {
  title: "FlowFOR Creative | Smart Launch Command Center",
  description:
    "FlowFOR Creative adalah platform AI berbasis Google Gemini untuk content creator dan UMKM Indonesia. Generate sales copy, social caption, storyboard, shoot script, dan content calendar dalam satu klik.",
  keywords: [
    "FlowFOR Creative",
    "AI content creator",
    "Gemini AI",
    "sales page generator",
    "content marketing Indonesia",
    "social media caption",
    "storyboard generator",
    "UMKM digital marketing",
    "JuaraVibeCoding",
  ],
  authors: [{ name: "FlowFOR Creative Team" }],
  openGraph: {
    title: "FlowFOR Creative | Smart Launch Command Center",
    description:
      "Generate full launch kit — sales copy, caption, storyboard, shoot script & content calendar — powered by Google Gemini AI.",
    url: "https://flow-for-creative.vercel.app",
    siteName: "FlowFOR Creative",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FlowFOR Creative | Smart Launch Command Center",
    description:
      "Platform AI untuk content creator & UMKM. Generate launch kit lengkap dengan Gemini AI. #JuaraVibeCoding",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  metadataBase: new URL("https://flow-for-creative.vercel.app"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-jakarta relative">
        <div className="bg-blob-1"></div>
        <div className="bg-blob-2"></div>
        <div className="bg-blob-3"></div>
        
        <div className="relative z-10">
          <SettingsProvider>
            <AppShell />
          </SettingsProvider>
        </div>
      </body>
    </html>
  );
}