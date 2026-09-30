import { AuthProvider } from '@/contexts/auth-context';
import type { Metadata } from 'next';
import { Geist, Manrope } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
});

const manrope = Manrope({ variable: '--font-manrope', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Dhaka Tesla Pool',
  description: 'Share a seat. Split the fare. Survive Dhaka traffic.',
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${manrope.variable}`}>
      <body><AuthProvider>{children}<Toaster richColors position="top-right" /></AuthProvider></body>
    </html>
  );
}
