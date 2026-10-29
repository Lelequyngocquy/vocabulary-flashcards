import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'VocaLNQ | IELTS Vocabulary Mastery',
  description:
    'A simple, mobile-first full-stack Next.js web app for learning English vocabulary with flashcards.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'VocaLNQ',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#101010',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`dark ${inter.variable} ${jetbrainsMono.variable}`}>
      <body suppressHydrationWarning className="bg-canvas text-ink antialiased selection:bg-primary/20 selection:text-primary w-full h-full overflow-hidden">
        {children}
      </body>
    </html>
  );
}
