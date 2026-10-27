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
  title: 'IELTS Vocab Mastery | Voltagent Engineering Design',
  description:
    'Nền tảng học từ vựng IELTS phong cách Voltagent: Dark canvas #101010, Electric Green #00d992, Hairline #3d3a39, tối ưu di động',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'VoltVocab',
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
    <html lang="vi" className={`dark ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-canvas text-ink antialiased selection:bg-primary/20 selection:text-primary min-h-screen flex flex-col justify-between">
        {children}
      </body>
    </html>
  );
}
