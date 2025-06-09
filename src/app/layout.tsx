import "@/styles/globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { cn } from "@/lib/utils";
import { Inter } from "next/font/google";
import { type Metadata } from "next";
import { Geist } from "next/font/google";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";
import { SidebarWrapper } from "@/components/sidebar-wrapper";
import { SessionProvider } from "next-auth/react";
import { CoursesProvider } from "@/contexts/courses-context";
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: "Second Brain",
  description: "SecondBrain: Your AI-powered course management assistant. Helps students manage workload by parsing course plans and creating tasks.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geist.variable}`}>
      <body className={cn(inter.className, "min-h-screen bg-background")}>
        <SessionProvider>
          <CoursesProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <div className="flex flex-1">
                  <SidebarWrapper />
                  <main className="flex-1 container py-6">
                    {children}
                    <Analytics />
                  </main>
                </div>
              </div>
              <Toaster />
            </ThemeProvider>
          </CoursesProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
