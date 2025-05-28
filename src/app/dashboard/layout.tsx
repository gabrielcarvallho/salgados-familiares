import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { PermissionsProvider } from "@/contexts/PermissionContext";

const fontGeits = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const fontGeitsMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

fontGeits, fontGeitsMono;
export const metadata: Metadata = {
  title: "Salgados Gestão",
  description: "Sistema de gestão",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PermissionsProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 md:gap-6">
                <div>{children}</div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </PermissionsProvider>
  );
}
