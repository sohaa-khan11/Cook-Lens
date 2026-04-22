import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "CookLens | Snap Your Ingredients",
  description: "Snap your ingredients. Cook something amazing.",
};

import { ProjectProvider } from "@/context/ProjectContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${manrope.variable} ${inter.variable} h-full antialiased`}
    >
      {/* Material Icons imported to match original design tokens */}
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-[100dvh] flex flex-col bg-surface text-on-surface font-body selection:bg-primary/30 cinematic-gradient overflow-x-hidden">
        <ProjectProvider>
          {children}
        </ProjectProvider>
      </body>
    </html>
  );
}
