import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { DashboardLayout } from "@/components/DashboardLayout";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StudyFlow AI - Modern Learning Platform",
  description: "A clean, modern SaaS dashboard for learning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="bg-background text-foreground antialiased">
        <DashboardLayout>{children}</DashboardLayout>
      </body>
    </html>
  );
}
