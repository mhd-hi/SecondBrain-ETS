import type { Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';
import { Geist, Inter } from 'next/font/google';
import CommandPalette from '@/components/CommandPalette/CommandPalette';
import { GlobalConfirmDialogProvider } from '@/components/shared/dialogs/ConfirmDialogProvider';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { cn } from '@/lib/utils';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'SecondBrain ETS',
  description: 'SecondBrain ETS: Your AI-powered course management assistant for ETS university students. Helps manage academic workload by parsing course plans and creating tasks.',
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
    <html lang="en" suppressHydrationWarning className={`${geist.variable}`} data-scroll-behavior="smooth">
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
              <CommandPalette />
              <Toaster />
            </ThemeProvider>
          </GlobalConfirmDialogProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
