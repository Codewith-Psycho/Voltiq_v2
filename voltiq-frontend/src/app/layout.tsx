import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/lib/providers";
import { Sidebar } from "@/components/ui/Sidebar";
import { TopHeader } from "@/components/ui/TopHeader";
import BottomNav from "@/components/navigation/BottomNav";
import RouteGuard from "@/components/navigation/RouteGuard";

export const metadata: Metadata = {
  title: "VoltIQ — India's Smart Energy Super App",
  description:
    "Smart energy optimization for Indian homes. Save up to 23% on electricity bills with AI-powered tariff optimization, real-time monitoring, and intelligent scheduling.",
  keywords: ["VoltIQ", "smart energy", "India", "electricity savings", "smart meter", "tariff optimization"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="font-inter antialiased">
        <Providers>
          <RouteGuard>
            <Sidebar />
            <TopHeader />
            <main className="pb-20 lg:pb-0">{children}</main>
            <BottomNav />
          </RouteGuard>
        </Providers>
      </body>
    </html>
  );
}
