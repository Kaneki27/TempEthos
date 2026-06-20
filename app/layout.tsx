import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppInitializer from "@/components/shared/AppInitializer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SehatSetu | AI-Powered Hospital Management System",
  description: "Futuristic digital hospital platform for clinical scribing, nurse alert triage, patient visit summaries, and real-time administrator bed capacity planning.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <AppInitializer>
          {children}
        </AppInitializer>
      </body>
    </html>
  );
}
