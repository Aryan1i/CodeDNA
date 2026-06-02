import type { Metadata } from "next";
import "./globals.css";
import ParticleGrid from "@/components/ParticleGrid";
import ThemeToggle from "@/components/ThemeToggle";

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
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-obsidian text-text font-sans flex flex-col relative overflow-x-hidden">
        <ParticleGrid />
        <ThemeToggle />
        {children}
      </body>
    </html>
  );
}
