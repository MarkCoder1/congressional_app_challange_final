import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DemoDataInitializer } from "@/components/DemoDataInitializer";
import { DemoModeIndicator } from "@/components/DemoModeIndicator";
import { ToastProvider } from "@/components/Toast";
import { SidebarProvider } from "@/hooks/useSidebar";
import { OnboardingShortcutListener } from "@/components/OnboardingShortcutListener";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "StudyFlow", template: "%s | StudyFlow" },
  description: "AI-powered academic learning platform",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} scroll-smooth`}
    >
      <head>
        <Analytics />
      </head>
      <body className="bg-background text-foreground antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent focus:text-white focus:rounded-lg focus:text-sm focus:font-medium"
        >
          Skip to main content
        </a>
        <DemoDataInitializer />
        <OnboardingShortcutListener />
        <SidebarProvider>
          <ToastProvider>
            <DashboardLayout>{children}</DashboardLayout>
            <DemoModeIndicator />
          </ToastProvider>
        </SidebarProvider>
      </body>
    </html>
  );
}
