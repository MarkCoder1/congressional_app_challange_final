import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DemoDataInitializer } from "@/components/DemoDataInitializer";
import { DemoModeIndicator } from "@/components/DemoModeIndicator";
import { ToastProvider } from "@/components/Toast";
import { SidebarProvider } from "@/hooks/useSidebar";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "StudyFlow AI", template: "%s | StudyFlow AI" },
  description: "Intelligent learning operating system for students",
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
      <body className="bg-background text-foreground antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent focus:text-white focus:rounded-lg focus:text-sm focus:font-medium"
        >
          Skip to main content
        </a>
        <DemoDataInitializer />
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
