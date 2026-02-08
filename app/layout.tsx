import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "./context/AppContext";
import { ToastProvider } from "./context/ToastContext";
import { DashboardShell } from "@/components/DashboardShell";
import { RoleGuard } from "@/components/RoleGuard";
import { ScrollToTop } from "@/components/ScrollToTop";

export const metadata: Metadata = {
  title: "Lead Management Dashboard",
  description: "Production-ready lead management MVP (India)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-100 text-slate-900 antialiased">
        <AppProvider>
          <ToastProvider>
            <ScrollToTop />
            <DashboardShell>
              <RoleGuard>
                <div className="px-4 py-6 sm:px-6 lg:px-8">
                  {children}
                </div>
              </RoleGuard>
            </DashboardShell>
          </ToastProvider>
        </AppProvider>
      </body>
    </html>
  );
}
