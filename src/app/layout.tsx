import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { SessionProvider } from 'next-auth/react';
import { Geist, Inter } from 'next/font/google';
import { GlobalConfirmDialogProvider } from '@/components/providers/ConfirmDialogProvider';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { cn } from '@/lib/utils';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Second Brain',
  description: 'SecondBrain: Your AI-powered course management assistant. Helps students manage workload by parsing course plans and creating tasks.',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geist.variable}`}>
      <body className={cn(inter.className, 'min-h-screen bg-background')}>
        <SessionProvider>
          <GlobalConfirmDialogProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster />
              <Analytics />
            </ThemeProvider>
          </GlobalConfirmDialogProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
