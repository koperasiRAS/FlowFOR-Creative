import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlowFOR Creative | Smart Launch Command Center",
  description: "AI-powered Smart Launch Command Center for digital creators",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-jakarta">{children}</body>
    </html>
  );
}