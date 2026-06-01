import type { Metadata } from "next";
import { Space_Grotesk, Instrument_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import ParticleGrid from "@/components/ParticleGrid";
import ThemeToggle from "@/components/ThemeToggle";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CodeDNA — Continuous-Verification Developer Identity & Talent Ecosystem",
  description: "Get hired for what you build, not where you study. Verify your coding skills, track achievements from GitHub, LeetCode, and Vercel, and match with global tech employers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased ${spaceGrotesk.variable} ${instrumentSans.variable} ${ibmPlexMono.variable}`}>
      <body className="min-h-full bg-obsidian text-text font-sans flex flex-col relative overflow-x-hidden">
        <ParticleGrid />
        <ThemeToggle />
        {children}
      </body>
    </html>
  );
}
